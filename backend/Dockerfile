# =============================================================
# Backend Dockerfile — NestJS 11 + Prisma 7
# Multi-stage: deps → build → production
# =============================================================

# ── Stage 1: dependency install ────────────────────────────────
FROM node:22-alpine AS deps

# Install pnpm — exact version matching what generated the lockfile
RUN corepack enable && corepack prepare pnpm@10.28.2 --activate

WORKDIR /app

# Copy lockfile + manifest first (better layer cache)
COPY package.json pnpm-lock.yaml* ./
COPY prisma ./prisma

# Install ALL deps (we need devDeps to build)
RUN pnpm install --frozen-lockfile

# ── Stage 2: build ─────────────────────────────────────────────
FROM deps AS builder

WORKDIR /app

COPY . .

# Generate Prisma client
RUN pnpm db:generate

# Compile TypeScript → dist/
RUN pnpm build

# ── Stage 3: production image ───────────────────────────────────
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

# Copy only what's needed to run
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/prisma.config.ts ./prisma.config.ts

# Expose the backend port (matches PORT env var default)
EXPOSE 3333

# Run pending migrations then start the server
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/main"]
