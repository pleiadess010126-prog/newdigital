import { PrismaClient } from '@prisma/client';
import { Pool } from '@neondatabase/serverless';
import { PrismaNeon } from '@prisma/adapter-neon';

// Debug logging (console only - no fs to avoid browser issues)
function logDebug(msg: string) {
    if (typeof window === 'undefined') {
        console.log('[Prisma]', msg);
    }
}

const connectionString = process.env.DATABASE_URL;
logDebug('--- PRISMA CLIENT INIT ---');
logDebug('DB URL Found: ' + !!connectionString);

declare global {
    // eslint-disable-next-line no-var
    var prisma: PrismaClient | undefined;
}

let prisma: PrismaClient;

if (!connectionString) {
    const errorMsg = 'DATABASE_URL environment variable is not set. Cannot initialize Prisma Client.';
    logDebug('CRITICAL: ' + errorMsg);
    throw new Error(errorMsg);
} else {
    try {
        logDebug('Creating PrismaClient with Neon adapter...');

        // Create Neon connection pool
        const pool = new Pool({ connectionString });
        const adapter = new PrismaNeon(pool);

        prisma = global.prisma || new PrismaClient({
            adapter,
            log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
        });

        logDebug('Client created successfully');

        // Test connection in development
        if (process.env.NODE_ENV === 'development') {
            prisma.$connect().then(async () => {
                logDebug('$connect() SUCCESS');
                try {
                    // @ts-ignore
                    const res = await prisma.$queryRaw`SELECT 1 as test`;
                    logDebug('Query Success: ' + JSON.stringify(res));
                } catch (e) {
                    logDebug('Query Failed: ' + e);
                }
            }).catch(e => logDebug('$connect() FAILED: ' + e.message));
        }

    } catch (error) {
        logDebug('FATAL ERROR during init: ' + (error instanceof Error ? error.message : String(error)));
        throw error; // Re-throw the error instead of creating invalid client
    }
}

if (process.env.NODE_ENV !== 'production') {
    global.prisma = prisma;
}

export { prisma };
export default prisma;

