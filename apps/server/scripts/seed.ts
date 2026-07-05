/**
 * FR-011/SC-011: run with `pnpm --filter server run seed`.
 * Seeding logic itself lives in src/common/seed-database.ts (also exercised
 * by seed-database.spec.ts against FakeFirestore).
 */
import { loadConfig } from "../src/common/config";
import { initFirebaseAdminApp } from "../src/common/init-firebase-admin";
import { seedDatabase } from "../src/common/seed-database";

async function main() {
  const config = loadConfig();
  const app = initFirebaseAdminApp(config);

  const result = await seedDatabase(app.firestore());

  // eslint-disable-next-line no-console
  console.log("Seed complete:", result);

  await app.delete();
}

main().catch((error) => {
  // eslint-disable-next-line no-console
  console.error("Seed failed:", error);
  process.exit(1);
});
