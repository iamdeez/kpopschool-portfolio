/**
 * FR-011/SC-011: single source of truth for "which collections must have at
 * least one seed document". scripts/seed.ts writes to exactly these, and
 * seed-manifest.spec.ts asserts none of them were dropped by accident.
 * (Running scripts/seed.ts itself against a real Firestore is an
 * integration-level check outside this repo's CI — see tasks.md T031 note.)
 */
export const SEEDED_COLLECTIONS = [
  "TEACHERS",
  "CURRICULUMS",
  "EVENTS",
  "FAQ",
  "REVIEW",
  "HOME",
  "products",
] as const;
