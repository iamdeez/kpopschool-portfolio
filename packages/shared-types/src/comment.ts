export interface LessonComment {
  id: string;
  curriculumId: string;
  lessonId: string;
  uid: string;
  authorEmail: string;
  body: string;
  createdAt: string;
}

export type CreateLessonCommentInput = Pick<LessonComment, "body">;
