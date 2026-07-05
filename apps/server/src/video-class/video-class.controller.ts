import { Body, Controller, Inject, Post, UseGuards } from "@nestjs/common";
import { FirebaseAuthGuard } from "../auth/firebase-auth.guard";
import { CurrentUser } from "../auth/current-user.decorator";
import type { AuthenticatedUser } from "../auth/firebase-auth.guard";
import { VIDEO_CLASS_PROVIDER, VideoClassProvider } from "./video-class-provider.interface";

@Controller("video-class")
@UseGuards(FirebaseAuthGuard)
export class VideoClassController {
  constructor(
    @Inject(VIDEO_CLASS_PROVIDER) private readonly videoClassProvider: VideoClassProvider,
  ) {}

  @Post("join")
  join(@Body("curriculumId") curriculumId: string, @CurrentUser() user: AuthenticatedUser) {
    return this.videoClassProvider.createSession(curriculumId, user.uid);
  }
}
