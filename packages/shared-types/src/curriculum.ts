export interface Lesson {
  id: string;
  title: string;
  order: number;
  videoUrl: string;
  durationMinutes: number;
}

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
  lessons: Lesson[];
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
