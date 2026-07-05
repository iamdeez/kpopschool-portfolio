export interface Curriculum {
  id: string;
  title: string;
  image: string;
  createdAt: string;
  teacherId: string;
  category: string;
  format: string;
  month: number;
  totalSessions: number;
  sessions: string[];
  price: number;
  description: string;
  difficulty: string;
  likes: number;
  review: number;
  student: number;
  classes: string[];
}

export type CreateCurriculumInput = Omit<
  Curriculum,
  "id" | "createdAt" | "likes" | "review" | "student"
>;
export type UpdateCurriculumInput = Partial<CreateCurriculumInput>;
