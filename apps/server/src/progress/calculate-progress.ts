/** FR-004: percent complete for a curriculum, guarding against a zero-lesson denominator. */
export function calculateProgressPercent(totalLessons: number, completedCount: number): number {
  if (totalLessons <= 0) {
    return 0;
  }
  return Math.round((completedCount / totalLessons) * 100);
}

/** v1.2.0 FR-003: a quiz only "passes" on a perfect score — ASM-002. */
export function calculateQuizScore(totalQuestions: number, correctCount: number): { score: number; passed: boolean } {
  const score = calculateProgressPercent(totalQuestions, correctCount);
  return { score, passed: totalQuestions > 0 && score === 100 };
}
