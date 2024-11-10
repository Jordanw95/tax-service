import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ['query'],
  });

// Prevents multiple instances of Prisma Client in development due to hot reloading
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
