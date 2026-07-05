/**
 * plan.md "데모 모드 데이터 격리 및 동시성": admin CRUD in the shared public
 * demo inevitably drifts from the seeded baseline over time. This script
 * wipes the mutable collections and re-seeds — intended to run on a
 * schedule (e.g. Cloud Scheduler hitting a protected endpoint, or a cron
 * invoking this script directly) rather than on every request.
 */
import * as admin from "firebase-admin";
import { loadConfig } from "../src/common/config";
import { initFirebaseAdminApp } from "../src/common/init-firebase-admin";

const RESETTABLE_COLLECTIONS = [
  "TEACHERS",
  "CURRICULUMS",
  "EVENTS",
  "FAQ",
  "INQUIRY",
  "REVIEW",
  "HOME",
  "products",
];

async function deleteCollection(firestore: admin.firestore.Firestore, name: string) {
  const snapshot = await firestore.collection(name).get();
  await Promise.all(snapshot.docs.map((doc) => doc.ref.delete()));
}

async function main() {
  const config = loadConfig();
  const app = initFirebaseAdminApp(config);
  const firestore = app.firestore();

  for (const name of RESETTABLE_COLLECTIONS) {
    await deleteCollection(firestore, name);
  }

  await app.delete();

  // eslint-disable-next-line no-console
  console.log("Demo data cleared. Re-run `pnpm run seed` to restore the baseline.");
}

main().catch((error) => {
  // eslint-disable-next-line no-console
  console.error("Reset failed:", error);
  process.exit(1);
});
