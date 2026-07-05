export interface Review {
  id: string;
  createdAt: string;
  teacherId: string;
  userId: string;
  curriculumId: string;
  rating: number;
  comment: string;
}

export type CreateReviewInput = Omit<Review, "id" | "createdAt">;
export type UpdateReviewInput = Partial<Pick<Review, "rating" | "comment">>;
