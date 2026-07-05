export interface CurriculumProgress {
  curriculumId: string;
  curriculumTitle: string;
  completedLessonIds: string[];
  totalLessons: number;
  percent: number;
}
