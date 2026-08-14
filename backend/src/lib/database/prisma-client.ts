import { PrismaClient } from "../../generated/prisma/client.js";
import { PrismaPg } from "@prisma/adapter-pg";

// Load .env if available (skipped in Docker where env vars come from compose)
try { process.loadEnvFile(); } catch {}

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL as string,
});

export const prismaClient = new PrismaClient({ adapter });
