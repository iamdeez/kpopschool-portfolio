import { Body, Controller, Get, Param, Post, UseGuards } from "@nestjs/common";
import { FirebaseAuthGuard } from "../auth/firebase-auth.guard";
import { CurrentUser } from "../auth/current-user.decorator";
import type { AuthenticatedUser } from "../auth/firebase-auth.guard";
import { ProgressService } from "./progress.service";

@Controller("progress")
@UseGuards(FirebaseAuthGuard)
export class ProgressController {
  constructor(private readonly progressService: ProgressService) {}

  @Get()
  listMine(@CurrentUser() user: AuthenticatedUser) {
    return this.progressService.listForUser(user.uid);
  }

  @Get(":curriculumId")
  getOne(@Param("curriculumId") curriculumId: string, @CurrentUser() user: AuthenticatedUser) {
    return this.progressService.getProgress(user.uid, curriculumId);
  }

  @Post(":curriculumId/lessons/:lessonId/complete")
  setComplete(
    @Param("curriculumId") curriculumId: string,
    @Param("lessonId") lessonId: string,
    @Body("completed") completed: boolean,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.progressService.setLessonComplete(user.uid, curriculumId, lessonId, completed !== false);
  }

  @Post(":curriculumId/lessons/:lessonId/quiz-submit")
  submitQuiz(
    @Param("curriculumId") curriculumId: string,
    @Param("lessonId") lessonId: string,
    @Body("answers") answers: number[],
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.progressService.submitQuiz(user.uid, curriculumId, lessonId, answers ?? []);
  }
}
