# syntax=docker/dockerfile:1

FROM node:22-slim AS base
# Prisma's engine binary is picked by detected libssl version; node:*-slim
# doesn't ship OpenSSL at all, which left Prisma guessing (and warning)
# during `prisma generate`/build. Installed once here so every stage that
# builds FROM base has it.
RUN apt-get update && apt-get install -y --no-install-recommends openssl \
  && rm -rf /var/lib/apt/lists/*

# ---- Dependencies ----
FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json ./
COPY prisma ./prisma
RUN npm ci

# ---- Build ----
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
# DATABASE_URL isn't needed to generate the client or build the app (Prisma
# only reads the schema file for this, no DB connection required) — a
# placeholder keeps `prisma generate`/`next build` from complaining if
# either ever validates the env var is merely present.
ENV DATABASE_URL="postgresql://user:password@localhost:5432/guardia_db"
ENV DOCKER_BUILD=1
RUN npx prisma generate
RUN npm run build

# ---- Run ----
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# python3 (stdlib only, no pip packages) runs the local "Ask Guardia" brief
# writer at scripts/ask_brief_ai.py — without it, that feature just falls
# back to a plain stats line instead of failing.
RUN apt-get update && apt-get install -y --no-install-recommends python3 \
  && rm -rf /var/lib/apt/lists/*

RUN groupadd --system --gid 1001 nodejs \
  && useradd --system --create-home --home-dir /home/nextjs --uid 1001 --gid nodejs nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/scripts ./scripts
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma

USER nextjs
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
