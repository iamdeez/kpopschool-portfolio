import { Global, Inject, Module } from "@nestjs/common";
import * as admin from "firebase-admin";
import { APP_CONFIG } from "./config.module";
import type { AppConfig } from "./config";
import { initFirebaseAdminApp } from "./init-firebase-admin";

export const FIREBASE_ADMIN = "FIREBASE_ADMIN";
export const FIRESTORE = "FIRESTORE";

@Global()
@Module({
  providers: [
    {
      provide: FIREBASE_ADMIN,
      inject: [APP_CONFIG],
      useFactory: (config: AppConfig) => initFirebaseAdminApp(config),
    },
    {
      provide: FIRESTORE,
      inject: [FIREBASE_ADMIN],
      useFactory: (app: admin.app.App) => {
        const firestore = app.firestore();
        // TS's useDefineForClassFields (default under target ES2022+) makes
        // every declared-but-omitted optional DTO field (e.g. `firstName?:
        // string`) materialize as an own property valued `undefined` — the
        // real Firestore SDK rejects that outright. Every controller passes
        // DTOs straight through to Firestore writes, so this is set globally
        // rather than stripped ad hoc at each call site.
        firestore.settings({ ignoreUndefinedProperties: true });
        return firestore;
      },
    },
  ],
  exports: [FIREBASE_ADMIN, FIRESTORE],
})
export class FirebaseAdminModule {}
