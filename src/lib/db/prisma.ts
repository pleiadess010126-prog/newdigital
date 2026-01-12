import { PrismaClient } from '@prisma/client';
import { Pool } from '@neondatabase/serverless';
import { PrismaNeon } from '@prisma/adapter-neon';
import fs from 'fs';

function logDebug(msg: string) {
    console.log(msg);
    try {
        fs.appendFileSync('prisma-debug.log', new Date().toISOString() + ' ' + msg + '\n');
    } catch { }
}

const connectionString = process.env.DATABASE_URL;
logDebug('--- PRISMA CLIENT INIT ---');
logDebug('[Prisma] DB URL Found: ' + !!connectionString);

declare global {
    // eslint-disable-next-line no-var
    var prisma: PrismaClient | undefined;
}

let prisma: PrismaClient;

if (!connectionString) {
    const errorMsg = 'DATABASE_URL environment variable is not set. Cannot initialize Prisma Client.';
    logDebug('[Prisma] CRITICAL: ' + errorMsg);
    throw new Error(errorMsg);
} else {
    try {
        logDebug('[Prisma] Creating PrismaClient with Neon adapter...');

        // Create Neon connection pool
        const pool = new Pool({ connectionString });
        const adapter = new PrismaNeon(pool);

        prisma = global.prisma || new PrismaClient({
            adapter,
            log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
        });

        logDebug('[Prisma] Client created successfully');

        // Test connection in development
        if (process.env.NODE_ENV === 'development') {
            prisma.$connect().then(async () => {
                logDebug('[Prisma] $connect() SUCCESS');
                try {
                    // @ts-ignore
                    const res = await prisma.$queryRaw`SELECT 1 as test`;
                    logDebug('[Prisma] Query Success: ' + JSON.stringify(res));
                } catch (e) {
                    logDebug('[Prisma] Query Failed: ' + e);
                }
            }).catch(e => logDebug('[Prisma] $connect() FAILED: ' + e.message));
        }

    } catch (error) {
        logDebug('[Prisma] FATAL ERROR during init: ' + (error instanceof Error ? error.message : String(error)));
        throw error; // Re-throw the error instead of creating invalid client
    }
}

if (process.env.NODE_ENV !== 'production') {
    global.prisma = prisma;
}

export { prisma };
export default prisma;
