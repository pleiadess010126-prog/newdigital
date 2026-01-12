const { Pool } = require('pg');

// Connection string from environment or hardcoded for quick test
const connectionString = process.env.DATABASE_URL ||
    'postgresql://neondb_owner:npg_ang9FJ5RPGAf@ep-dark-sea-a13uoorw-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require';

const pool = new Pool({ connectionString });

async function showTables() {
    try {
        console.log('\n📊 Connecting to Neon Database...\n');

        // Query to get all tables
        const tablesResult = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name;
    `);

        console.log('✅ Tables in database:\n');
        tablesResult.rows.forEach((table, index) => {
            console.log(`${index + 1}. ${table.table_name}`);
        });

        console.log(`\n📊 Total tables: ${tablesResult.rows.length}\n`);

        // Get row counts for each table
        console.log('📈 Row counts:\n');
        for (const table of tablesResult.rows) {
            const countResult = await pool.query(`SELECT COUNT(*) as count FROM "${table.table_name}"`);
            console.log(`   ${table.table_name}: ${countResult.rows[0].count} rows`);
        }

        console.log('\n✅ Database query completed successfully!\n');

    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    } finally {
        await pool.end();
    }
}

showTables();
