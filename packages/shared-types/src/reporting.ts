export interface CurriculumReportStat {
  curriculumId: string;
  curriculumTitle: string;
  purchaseCount: number;
  averageProgressPercent: number;
}

export interface ReportSummary {
  totalRevenue: number;
  totalStudents: number;
  totalTeachers: number;
  totalCurriculums: number;
  curriculumStats: CurriculumReportStat[];
}
