// Database exports
export * from './schema';
export { db, LocalStorageDatabase } from './client';
export type { DatabaseClient } from './client';
export { prisma, connect, disconnect, isHealthy } from './prisma';
export { PrismaDatabase, prismaDb } from './prismaClient';
