import { defineConfig } from "@playwright/test";

/**
 * T032/SC-001,004,005,006,009,010. Requires BOTH apps running against the
 * Firebase Local Emulator Suite (see apps/server/.env.example and
 * apps/web/.env.example) — no real Firebase project or live credentials
 * needed, since INTEGRATION_MODE=demo + the emulator only require
 * placeholder-shaped config values. Wired into CI as the `e2e` job in
 * .github/workflows/ci.yml. Run locally with `pnpm --filter web run test:e2e`
 * once the emulator (`pnpm run emulators`), `pnpm --filter server run dev`,
 * and `pnpm --filter web run dev` are all up.
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
