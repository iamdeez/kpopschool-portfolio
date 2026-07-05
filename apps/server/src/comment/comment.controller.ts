import { Body, Controller, Delete, Get, Param, Post, UseGuards } from "@nestjs/common";
import { FirebaseAuthGuard } from "../auth/firebase-auth.guard";
import { CurrentUser } from "../auth/current-user.decorator";
import type { AuthenticatedUser } from "../auth/firebase-auth.guard";
import { CommentService } from "./comment.service";
import { CreateCommentDto } from "./dto/create-comment.dto";

@Controller("comments")
@UseGuards(FirebaseAuthGuard)
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @Get(":curriculumId/:lessonId")
  list(@Param("curriculumId") curriculumId: string, @Param("lessonId") lessonId: string) {
    return this.commentService.list(curriculumId, lessonId);
  }

  @Post(":curriculumId/:lessonId")
  create(
    @Param("curriculumId") curriculumId: string,
    @Param("lessonId") lessonId: string,
    @Body() dto: CreateCommentDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.commentService.create(user.uid, user.email ?? "unknown", curriculumId, lessonId, dto.body);
  }

  @Delete(":curriculumId/:lessonId/:commentId")
  remove(@Param("commentId") commentId: string, @CurrentUser() user: AuthenticatedUser) {
    return this.commentService.remove(user, commentId);
  }
}
