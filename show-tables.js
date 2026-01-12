const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function showTables() {
    try {
        console.log('\n📊 Querying Neon Database Tables...\n');

        // Query to get all tables in the public schema
        const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name;
    `;

        console.log('✅ Tables in database:\n');
        tables.forEach((table, index) => {
            console.log(`${index + 1}. ${table.table_name}`);
        });

        console.log(`\n📊 Total tables: ${tables.length}`);

        // Get row counts for each table
        console.log('\n📈 Row counts:\n');
        for (const table of tables) {
            const countResult = await prisma.$queryRawUnsafe(
                `SELECT COUNT(*) as count FROM "${table.table_name}"`
            );
            console.log(`   ${table.table_name}: ${countResult[0].count} rows`);
        }

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await prisma.$disconnect();
    }
}

showTables();
