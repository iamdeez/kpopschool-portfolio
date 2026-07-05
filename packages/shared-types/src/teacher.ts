export interface Teacher {
  id: string;
  createdAt: string;
  category: string;
  name: string;
  career: string;
  rating: number;
  review: number;
  student: number;
  profile: string;
}

export type CreateTeacherInput = Omit<Teacher, "id" | "createdAt" | "rating" | "review" | "student">;
export type UpdateTeacherInput = Partial<CreateTeacherInput>;
