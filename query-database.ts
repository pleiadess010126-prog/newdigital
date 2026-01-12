import { Pool, neonConfig } from '@neondatabase/serverless';
import { PrismaClient } from '@prisma/client';
import { PrismaNeon } from '@prisma/adapter-neon';
import ws from 'ws';

// Configure WebSocket for local development
neonConfig.webSocketConstructor = ws;

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
    throw new Error('DATABASE_URL environment variable is not set');
}

const pool = new Pool({ connectionString });
const adapter = new PrismaNeon(pool);

export const prisma = new PrismaClient({ adapter });

// Query to show all tables
async function showTables() {
    try {
        console.log('\n📊 Querying Neon Database Tables...\n');

        const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name;
    `;

        console.log('✅ Tables in database:\n');
        (tables as any[]).forEach((table, index) => {
            console.log(`${index + 1}. ${table.table_name}`);
        });

        console.log(`\n📊 Total tables: ${(tables as any[]).length}`);

        // Get row counts for each table
        console.log('\n📈 Row counts:\n');
        for (const table of tables as any[]) {
            const countResult = await prisma.$queryRawUnsafe(
                `SELECT COUNT(*) as count FROM "${table.table_name}"`
            );
            console.log(`   ${table.table_name}: ${(countResult as any)[0].count} rows`);
        }

    } catch (error: any) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

// Run if this file is executed directly
if (require.main === module) {
    showTables();
}
