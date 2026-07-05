import { defineConfig } from "@playwright/test";

/**
 * T032/SC-001,004,005,006,009,010. Requires BOTH apps running against a
 * real (demo-dedicated) Firebase project — see apps/server/.env.example and
 * apps/web/.env.example. Not run in this repo's default CI job (ci.yml)
 * because that would require committing live-ish demo credentials to
 * GitHub Actions secrets; wire that up before relying on this suite as a
 * merge gate. Run locally with `pnpm --filter web run test:e2e` once both
 * `pnpm --filter server run dev` and `pnpm --filter web run dev` are up.
 */
export default defineConfig({
  testDir: "./e2e",
  timeout: 30_000,
  // Resets + reseeds the Firestore emulator before every run so
  // purchase-flow.spec.ts's duplicate-purchase check stays idempotent
  // across repeated suite runs (see global-setup.ts).
  globalSetup: "./e2e/global-setup.ts",
  use: {
    baseURL: process.env.E2E_BASE_URL ?? "http://localhost:5173",
    trace: "on-first-retry",
  },
});
