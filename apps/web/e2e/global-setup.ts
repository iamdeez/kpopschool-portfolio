import { execSync } from "node:child_process";

/**
 * The demo account is a single fixed Firebase user (DemoService), and
 * purchases are guarded against duplicates (purchase-guard.ts) — so
 * purchase-flow.spec.ts is only idempotent if it runs against freshly
 * reset+reseeded data. Without this, a second suite run 409s on "already
 * purchased" and looks like a bug when it's actually the guard working.
 */
export default function globalSetup() {
  const serverDir = new URL("../../server", import.meta.url).pathname;
  execSync("pnpm run reset-demo-data && pnpm run seed", { cwd: serverDir, stdio: "inherit" });
}
