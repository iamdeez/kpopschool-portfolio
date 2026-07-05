import * as admin from "firebase-admin";
import type { AppConfig } from "./config";

/**
 * Shared by the NestJS module (firebase-admin.module.ts) and the standalone
 * scripts (seed.ts, reset-demo-data.ts, create-admin.ts) so both respect the
 * Firebase Local Emulator Suite the same way: FIRESTORE_EMULATOR_HOST set ->
 * no real service account needed, just projectId.
 */
export function initFirebaseAdminApp(config: AppConfig): admin.app.App {
  if (admin.apps.length > 0) {
    return admin.app();
  }

  if (process.env.FIRESTORE_EMULATOR_HOST) {
    return admin.initializeApp({ projectId: config.firebase.projectId });
  }

  return admin.initializeApp({
    credential: admin.credential.cert({
      projectId: config.firebase.projectId,
      clientEmail: config.firebase.clientEmail,
      privateKey: config.firebase.privateKey,
    }),
  });
}
