import { Inject, Injectable } from "@nestjs/common";
import * as admin from "firebase-admin";
import type { Firestore } from "firebase-admin/firestore";
import { randomUUID } from "node:crypto";
import { FIREBASE_ADMIN, FIRESTORE } from "../common/firebase-admin.module";
import { APP_CONFIG } from "../common/config.module";
import type { AppConfig } from "../common/config";

const COLLECTION = "USERS";

/**
 * FR-010: visitors reach MyPage without ever typing real personal data.
 * The demo account is created lazily on first use and reused afterwards —
 * its Firebase Auth password is a random value nobody needs to know because
 * sign-in only ever happens via a server-issued custom token (never a
 * password grant), so there is nothing to leak.
 */
@Injectable()
export class DemoService {
  constructor(
    @Inject(FIREBASE_ADMIN) private readonly firebaseApp: admin.app.App,
    @Inject(FIRESTORE) private readonly firestore: Firestore,
    @Inject(APP_CONFIG) private readonly config: AppConfig,
  ) {}

  async issueDemoToken(): Promise<{ token: string; uid: string }> {
    const uid = await this.ensureDemoUser();
    const token = await this.firebaseApp.auth().createCustomToken(uid, { demo: true });
    return { token, uid };
  }

  private async ensureDemoUser(): Promise<string> {
    const { accountEmail } = this.config.demo;

    try {
      const existing = await this.firebaseApp.auth().getUserByEmail(accountEmail);
      return existing.uid;
    } catch {
      const created = await this.firebaseApp.auth().createUser({
        email: accountEmail,
        password: randomUUID(),
        displayName: "Demo Visitor",
      });

      await this.firestore
        .collection(COLLECTION)
        .doc(created.uid)
        .set({
          name: "Demo Visitor",
          firstName: "Demo",
          email: accountEmail,
          isTeacher: false,
          interest: ["K-Pop Dance"],
          experience: "beginner",
          birthday: "",
          gender: "",
          interestClass: [],
          interestTeacher: [],
          timezone: "Asia/Seoul",
          frequency: "",
          classes: [],
          createdAt: new Date().toISOString(),
        });

      return created.uid;
    }
  }
}
