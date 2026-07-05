import { Inject, Injectable } from "@nestjs/common";
import axios from "axios";
import jwt from "jsonwebtoken";
import type { VideoClassSession } from "@kpopschool/shared-types";
import { APP_CONFIG } from "../common/config.module";
import type { AppConfig } from "../common/config";
import type { VideoClassProvider } from "./video-class-provider.interface";

const MEETING_ROLE_HOST = 1;

/**
 * Real Zoom integration: Server-to-Server OAuth for meeting creation, then a
 * Meeting SDK JWT signature so the frontend @zoom/meetingsdk client can join.
 * Mirrors zoomController.js's getZoomAccessToken + zoom-routes.js's
 * create-meeting/generate-signature, but with credentials sourced from env
 * instead of process.env read ad-hoc with no validation.
 */
@Injectable()
export class ZoomVideoClassProvider implements VideoClassProvider {
  constructor(@Inject(APP_CONFIG) private readonly config: AppConfig) {}

  private async getAccessToken(): Promise<string> {
    const response = await axios.post("https://zoom.us/oauth/token", null, {
      params: {
        grant_type: "account_credentials",
        account_id: this.config.zoom.accountId,
      },
      auth: {
        username: this.config.zoom.clientId,
        password: this.config.zoom.clientSecret,
      },
    });
    return response.data.access_token as string;
  }

  async createSession(curriculumId: string, uid: string): Promise<VideoClassSession> {
    const accessToken = await this.getAccessToken();

    const meeting = await axios.post(
      "https://api.zoom.us/v2/users/me/meetings",
      {
        topic: `kpopschool-${curriculumId}`,
        type: 1, // instant meeting
        settings: { join_before_host: true },
      },
      { headers: { Authorization: `Bearer ${accessToken}` } },
    );

    const meetingNumber = String(meeting.data.id);
    const signature = this.generateSignature(meetingNumber, MEETING_ROLE_HOST);

    return {
      joinUrl: meeting.data.join_url,
      meetingNumber,
      signature,
      isMock: false,
    };
  }

  private generateSignature(meetingNumber: string, role: number): string {
    const iat = Math.round(Date.now() / 1000) - 30;
    const exp = iat + 60 * 60 * 2;

    return jwt.sign(
      {
        appKey: this.config.zoom.sdkKey,
        sdkKey: this.config.zoom.sdkKey,
        mn: meetingNumber,
        role,
        iat,
        exp,
        tokenExp: exp,
      },
      this.config.zoom.sdkSecret,
      { algorithm: "HS256" },
    );
  }
}
