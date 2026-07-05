/** FR-002/ASM-003: average of already-computed per-user progress percents, guarding against an empty (no-purchases-yet) list. */
export function averagePercent(percents: number[]): number {
  if (percents.length === 0) {
    return 0;
  }
  return Math.round(percents.reduce((sum, percent) => sum + percent, 0) / percents.length);
}
