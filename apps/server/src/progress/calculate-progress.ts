/** FR-004: percent complete for a curriculum, guarding against a zero-lesson denominator. */
export function calculateProgressPercent(totalLessons: number, completedCount: number): number {
  if (totalLessons <= 0) {
    return 0;
  }
  return Math.round((completedCount / totalLessons) * 100);
}
