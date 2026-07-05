import { Injectable } from "@nestjs/common";
import { randomUUID } from "node:crypto";
import type { VideoClassSession } from "@kpopschool/shared-types";
import type { VideoClassProvider } from "./video-class-provider.interface";

/**
 * SC-005: visitors reach a "classroom" screen without a real Zoom account or
 * a real meeting ever being created. joinUrl deliberately points at the
 * frontend's own mock classroom route, not zoom.us.
 */
@Injectable()
export class MockVideoClassProvider implements VideoClassProvider {
  async createSession(curriculumId: string, _uid: string): Promise<VideoClassSession> {
    void _uid;
    const meetingNumber = randomUUID().replace(/-/g, "").slice(0, 10);
    return {
      joinUrl: `/mock-classroom/${curriculumId}/${meetingNumber}`,
      meetingNumber,
      signature: "mock-signature",
      isMock: true,
    };
  }
}
