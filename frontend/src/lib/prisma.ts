import { PrismaClient } from '@prisma/client';

// PrismaClient is attached to the `global` object in development to prevent
// exhausting your database connection limit.
// Learn more: https://pris.ly/d/help/next-js-best-practices

// This client uses the centralized Prisma schema from the project root
const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    // The schema path is set in the package.json scripts or via the PRISMA_SCHEMA_PATH env var
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
