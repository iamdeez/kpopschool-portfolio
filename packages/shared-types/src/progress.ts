export interface CurriculumProgress {
  curriculumId: string;
  curriculumTitle: string;
  completedLessonIds: string[];
  totalLessons: number;
  percent: number;
  completedAt: string | null;
}

export interface QuizSubmission {
  answers: number[];
}

export interface QuizResult {
  score: number;
  passed: boolean;
  progress: CurriculumProgress;
}
