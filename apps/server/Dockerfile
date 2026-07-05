# Multi-stage build for @kpopschool/server, built from the monorepo root:
#   docker build -f apps/server/Dockerfile -t kpopschool-server .
FROM node:20-slim AS base
RUN corepack enable
WORKDIR /repo

FROM base AS build
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml* ./
COPY packages/shared-types/package.json packages/shared-types/package.json
COPY apps/server/package.json apps/server/package.json
RUN pnpm install --frozen-lockfile --filter @kpopschool/server... --filter @kpopschool/shared-types

COPY packages/shared-types packages/shared-types
COPY apps/server apps/server
RUN pnpm --filter @kpopschool/shared-types run build
RUN pnpm --filter @kpopschool/server run build
RUN pnpm deploy --filter @kpopschool/server --prod /repo/out/server

FROM node:20-slim AS runtime
ENV NODE_ENV=production
WORKDIR /app
# INTEGRATION_MODE defaults to "demo" — the same fail-safe default as
# apps/server/src/common/config.ts, so an operator forgetting to set it on
# the hosting platform never accidentally boots against live Stripe/Zoom.
ENV INTEGRATION_MODE=demo
COPY --from=build /repo/out/server/node_modules ./node_modules
COPY --from=build /repo/apps/server/dist ./dist
COPY --from=build /repo/apps/server/package.json ./package.json

EXPOSE 8080
CMD ["node", "dist/main.js"]
