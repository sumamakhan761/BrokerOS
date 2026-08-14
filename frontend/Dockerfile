# =============================================================
# Frontend Dockerfile — Next.js 16 (App Router)
# Multi-stage: deps → build → standalone production runner
# =============================================================

# ── Stage 1: dependency install ────────────────────────────────
FROM node:22-alpine AS deps

RUN apk add --no-cache libc6-compat

# Install pnpm — exact version matching what generated the lockfile
RUN corepack enable && corepack prepare pnpm@10.28.2 --activate

WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# Frontend uses pnpm — install with frozen lockfile
RUN pnpm install --frozen-lockfile

# ── Stage 2: build ─────────────────────────────────────────────
FROM deps AS builder

WORKDIR /app

COPY . .

# Next.js standalone output — produces a self-contained server bundle
ENV NEXT_TELEMETRY_DISABLED=1

# Build args for public env vars (injected at build time)
ARG NEXT_PUBLIC_API_URL=/api/proxy
ARG NEXT_PUBLIC_APP_URL=http://localhost:3000
ARG NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=""
ARG BACKEND_URL="http://backend:3333"

ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_APP_URL=$NEXT_PUBLIC_APP_URL
ENV NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=$NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
ENV BACKEND_URL=$BACKEND_URL

RUN pnpm build

# ── Stage 3: production image ───────────────────────────────────
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy the standalone Next.js output
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
