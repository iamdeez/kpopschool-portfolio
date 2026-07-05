import { BadRequestException, Inject, Injectable } from "@nestjs/common";
import type { AppConfig } from "../common/config";
import { APP_CONFIG } from "../common/config.module";

interface PendingCode {
  code: string;
  expiresAt: number;
}

/**
 * Signup email verification. In "demo" mode no real email is ever sent
 * (NFR-003) — the code is returned directly in the API response instead,
 * clearly marked so the frontend can display it inline for the visitor.
 * In "real" mode this would hand off to nodemailer with an app-specific
 * password sourced from env (never hardcoded, unlike the original
 * userController.js — research.md VULN-003).
 */
@Injectable()
export class EmailVerificationService {
  private readonly pending = new Map<string, PendingCode>();

  constructor(@Inject(APP_CONFIG) private readonly config: AppConfig) {}

  async sendCode(email: string): Promise<{ demoCode?: string }> {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    this.pending.set(email, { code, expiresAt: Date.now() + 10 * 60 * 1000 });

    if (this.config.integrationMode === "demo") {
      return { demoCode: code };
    }

    // Real mode: send via an actual mail provider using env-sourced credentials.
    // Left as an integration point — wiring a live SMTP provider is outside
    // this portfolio's demo scope (spec.md Out of Scope).
    return {};
  }

  checkCode(email: string, code: string): boolean {
    const entry = this.pending.get(email);
    if (!entry || entry.expiresAt < Date.now()) {
      throw new BadRequestException("Verification code expired or not found");
    }
    const valid = entry.code === code;
    if (valid) {
      this.pending.delete(email);
    }
    return valid;
  }
}
