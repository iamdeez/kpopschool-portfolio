import * as dotenv from "dotenv";
import type { IntegrationMode } from "@kpopschool/shared-types";

// Loaded once at module import time — every consumer of loadConfig() (main.ts,
// the standalone scripts) gets .env populated into process.env without each
// having to remember to call this themselves.
dotenv.config();

export interface AppConfig {
  port: number;
  integrationMode: IntegrationMode;
  firebase: {
    projectId: string;
    clientEmail: string;
    privateKey: string;
  };
  stripe: {
    secretKey: string;
  };
  zoom: {
    clientId: string;
    clientSecret: string;
    accountId: string;
    sdkKey: string;
    sdkSecret: string;
  };
  demo: {
    accountEmail: string;
    accountPassword: string;
  };
}

function readEnv(name: string, fallback = ""): string {
  return process.env[name] ?? fallback;
}

/**
 * INTEGRATION_MODE defaults to "demo" — a missing env var must never
 * accidentally boot the server in "real" mode against live Stripe/Zoom.
 */
export function loadConfig(): AppConfig {
  const integrationMode = readEnv("INTEGRATION_MODE", "demo") as IntegrationMode;

  return {
    port: Number(readEnv("PORT", "8080")),
    integrationMode,
    firebase: {
      projectId: readEnv("FIREBASE_PROJECT_ID"),
      clientEmail: readEnv("FIREBASE_CLIENT_EMAIL"),
      privateKey: readEnv("FIREBASE_PRIVATE_KEY").replace(/\\n/g, "\n"),
    },
    stripe: {
      secretKey: readEnv("STRIPE_SECRET_KEY"),
    },
    zoom: {
      clientId: readEnv("ZOOM_CLIENT_ID"),
      clientSecret: readEnv("ZOOM_CLIENT_SECRET"),
      accountId: readEnv("ZOOM_ACCOUNT_ID"),
      sdkKey: readEnv("ZOOM_SDK_KEY"),
      sdkSecret: readEnv("ZOOM_SDK_SECRET"),
    },
    demo: {
      accountEmail: readEnv("DEMO_ACCOUNT_EMAIL", "demo@kpopschool.portfolio"),
      accountPassword: readEnv("DEMO_ACCOUNT_PASSWORD", "demo-password-not-real"),
    },
  };
}
