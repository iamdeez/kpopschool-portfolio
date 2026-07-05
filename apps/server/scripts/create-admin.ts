/**
 * Grants the Firebase Auth custom claim `admin: true` to an existing user.
 * Deliberately NOT exposed as an API endpoint — letting any authenticated
 * request grant itself admin would defeat FR-012 entirely. Run out-of-band:
 *   pnpm --filter server exec ts-node scripts/create-admin.ts <email>
 */
import { loadConfig } from "../src/common/config";
import { initFirebaseAdminApp } from "../src/common/init-firebase-admin";

async function main() {
  const email = process.argv[2];
  if (!email) {
    // eslint-disable-next-line no-console
    console.error("Usage: ts-node scripts/create-admin.ts <email>");
    process.exit(1);
  }

  const config = loadConfig();
  const app = initFirebaseAdminApp(config);

  const user = await app.auth().getUserByEmail(email);
  await app.auth().setCustomUserClaims(user.uid, { admin: true });

  // eslint-disable-next-line no-console
  console.log(`Granted admin claim to ${email} (${user.uid}).`);
  // eslint-disable-next-line no-console
  console.log("The user must sign out and back in for the new claim to take effect.");

  await app.delete();
}

main().catch((error) => {
  // eslint-disable-next-line no-console
  console.error("Failed to grant admin claim:", error);
  process.exit(1);
});
