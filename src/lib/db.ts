import { PrismaClient } from "@prisma/client";

// Neon's free tier pauses the database after a few idle minutes; the first
// query after that has to wake it and can fail with "Can't reach database
// server" even though the very next one works. So: allow a longer connect
// time, tell Prisma when it's talking to Neon's pooler, and retry that one
// class of error a few times instead of surfacing it as a crashed page.
function datasourceUrl(): string | undefined {
  const raw = process.env.DATABASE_URL;
  if (!raw) return undefined;
  try {
    const url = new URL(raw);
    if (!url.searchParams.has("connect_timeout")) url.searchParams.set("connect_timeout", "15");
    if (url.hostname.includes("-pooler") && !url.searchParams.has("pgbouncer")) {
      url.searchParams.set("pgbouncer", "true");
    }
    return url.toString();
  } catch {
    return raw;
  }
}

// P1001: can't reach server · P1002: timed out · P1017: server closed the connection.
// Connection failures at startup surface as PrismaClientInitializationError,
// which carries no code — so match it by name and message too.
const WAKE_UP_CODES = new Set(["P1001", "P1002", "P1017"]);
const WAKE_UP_MESSAGE = /Can't reach database server|Server has closed the connection|timed out/i;

function isWakeUpError(err: unknown): boolean {
  const e = err as { name?: string; code?: string; errorCode?: string; message?: string };
  return (
    e.name === "PrismaClientInitializationError" ||
    WAKE_UP_CODES.has(e.code ?? e.errorCode ?? "") ||
    WAKE_UP_MESSAGE.test(e.message ?? "")
  );
}

function createClient() {
  return new PrismaClient({ datasourceUrl: datasourceUrl() }).$extends({
    query: {
      async $allOperations({ args, query }) {
        for (let attempt = 0; ; attempt++) {
          try {
            return await query(args);
          } catch (err) {
            if (attempt >= 3 || !isWakeUpError(err)) throw err;
            await new Promise((resolve) => setTimeout(resolve, 1000 * (attempt + 1)));
          }
        }
      },
    },
  });
}

const globalForPrisma = globalThis as unknown as { prisma?: ReturnType<typeof createClient> };

export const prisma = globalForPrisma.prisma ?? createClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
