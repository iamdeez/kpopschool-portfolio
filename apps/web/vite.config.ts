import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        // The main entry chunk was 656kB — over Rollup's 500kB warning
        // threshold — because every vendor dependency (React, Chakra,
        // Firebase Auth, react-query) landed in one file alongside app code.
        // Splitting vendor code into its own cacheable chunks doesn't
        // shrink the total bytes shipped on a cold load (Firebase Auth is
        // still needed synchronously — AuthContext wraps the whole app), but
        // it means a deploy that only touches app code doesn't invalidate
        // the vendor chunks' browser cache, and it lets the browser fetch
        // the chunks in parallel over HTTP/2 instead of one blocking file.
        manualChunks: {
          "vendor-react": ["react", "react-dom", "react-router-dom"],
          "vendor-chakra": ["@chakra-ui/react", "@chakra-ui/icons", "@emotion/react", "@emotion/styled", "framer-motion"],
          "vendor-firebase": ["firebase/app", "firebase/auth"],
          "vendor-query": ["@tanstack/react-query"],
        },
      },
    },
  },
  server: {
    port: 5173,
    // Without an explicit host, Vite's dev server binds to the "localhost"
    // hostname, which Node resolves IPv6-first (::1) on Node 17+ — a plain
    // `curl http://127.0.0.1:5173` (IPv4) then can't reach it even though the
    // server logs "ready" and the port is genuinely listening. Confirmed via
    // an actual CI run (the e2e job's "Wait for frontend" step timed out for
    // exactly this reason). `true` binds all interfaces (0.0.0.0), matching
    // how the NestJS backend already listens.
    host: true,
    proxy: {
      "/api": {
        target: "http://localhost:8090",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
    },
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/setupTests.ts"],
    // e2e/ holds Playwright specs, which use their own `test`/`expect` and
    // must not be collected by Vitest (they'd fail immediately outside a
    // Playwright runner).
    exclude: ["**/node_modules/**", "e2e/**"],
  },
});
