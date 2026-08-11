# syntax=docker/dockerfile:1

FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM node:22-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Build-time placeholders — real values are supplied at runtime via
# docker-compose/.env; Next.js only needs *some* value to complete the build
# since NEXT_PUBLIC_* vars are inlined at build time.
ENV NEXT_PUBLIC_SUPABASE_URL="https://placeholder.supabase.co"
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY="placeholder-anon-key"
ENV NEXT_PUBLIC_MOYASAR_PUBLISHABLE_KEY="pk_test_placeholder"
ENV SUPABASE_SERVICE_ROLE_KEY="placeholder-service-role-key"
ENV MOYASAR_SECRET_KEY="sk_test_placeholder"
ENV MOYASAR_WEBHOOK_SECRET="placeholder-webhook-secret"
ENV CRON_SECRET="placeholder-cron-secret"
RUN npm run build

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000
ENV PORT=3000

# Reuses the existing /api/health endpoint (Phase 0, unchanged) — the same
# check both `docker inspect`'s own container health status and the
# external uptime monitor (specs/010-phase-9-hardening-launch/
# contracts/monitoring.md) rely on, so "the container is healthy" means
# the same thing in both places.
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --quiet --spider --tries=1 http://localhost:3000/api/health || exit 1

CMD ["node", "server.js"]
