/**
 * Shared Prisma Client Instance
 * Prevents multiple instances in development
 */

import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as {
    prisma_v2: PrismaClient | undefined; // Changed key to invalid cache
};

export const prisma = globalForPrisma.prisma_v2 ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prisma_v2 = prisma;
}

export default prisma;

// Force restart: 2026-02-14 - Trigger Reload for new Schema
