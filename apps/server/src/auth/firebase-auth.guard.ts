import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import type { Request } from "express";
import * as admin from "firebase-admin";
import { FIREBASE_ADMIN } from "../common/firebase-admin.module";

export interface AuthenticatedUser {
  uid: string;
  email?: string;
  isAdmin: boolean;
}

declare module "express" {
  interface Request {
    user?: AuthenticatedUser;
  }
}

/**
 * Every mutating (and most reading) endpoint in the original kpop_server had
 * zero authentication (research.md VULN-005). This guard is the single choke
 * point that closes that gap: no valid Firebase ID token, no request proceeds.
 */
@Injectable()
export class FirebaseAuthGuard implements CanActivate {
  constructor(@Inject(FIREBASE_ADMIN) private readonly firebaseApp: admin.app.App) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const header = request.headers.authorization;

    if (!header?.startsWith("Bearer ")) {
      throw new UnauthorizedException("Missing bearer token");
    }

    const token = header.slice("Bearer ".length);

    try {
      const decoded = await this.firebaseApp.auth().verifyIdToken(token);
      request.user = {
        uid: decoded.uid,
        email: decoded.email,
        isAdmin: decoded.admin === true,
      };
      return true;
    } catch {
      throw new UnauthorizedException("Invalid or expired token");
    }
  }
}
