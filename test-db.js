const { Pool } = require('@neondatabase/serverless');
require('dotenv').config({ path: '.env.local' });

const connectionString = process.env.DATABASE_URL;
console.log('Connection string starts with:', connectionString?.substring(0, 20));

const pool = new Pool({ connectionString });

pool.query('SELECT NOW()', (err, res) => {
    if (err) {
        console.error('Connection failed:', err.message);
    } else {
        console.log('Connection successful:', res.rows[0]);
    }
    pool.end();
});
