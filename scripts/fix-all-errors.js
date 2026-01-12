const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('\n========================================');
console.log('  DigitalMEng - MySQL Setup');
console.log('========================================\n');

// Step 1: Check/Create .env.local with MySQL
console.log('[STEP 1/6] Setting up MySQL environment variables...');

const envLocalPath = path.join(process.cwd(), '.env.local');

if (!fs.existsSync(envLocalPath)) {
    console.log('Creating .env.local with MySQL configuration...');

    const envContent = `# DigitalMEng - MySQL Configuration
# Auto-generated

# MySQL Database Connection
# Format: mysql://USER:PASSWORD@HOST:PORT/DATABASE
# 
# Local MySQL:
DATABASE_URL="mysql://root:password@localhost:3306/digitalmeng"
#
# PlanetScale (Recommended - Free tier):
# DATABASE_URL="mysql://username:password@aws.connect.psdb.cloud/digitalmeng?sslaccept=strict"
#
# Railway MySQL:
# DATABASE_URL="mysql://root:password@containers-us-west-xxx.railway.app:3306/railway"
#
# AWS RDS MySQL:
# DATABASE_URL="mysql://admin:password@database.region.rds.amazonaws.com:3306/digitalmeng"

# Authentication
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=dev-secret-change-in-production-min-32-chars-required-for-security
JWT_SECRET=dev-jwt-secret-change-in-production-minimum-32-characters-required

# Application
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=DigitalMEng
NODE_ENV=development
DEMO_MODE=true

# Session
SESSION_COOKIE_NAME=session_token
SESSION_MAX_AGE=604800

# Optional: Add your API keys here when ready
# OPENAI_API_KEY=sk-...
# ANTHROPIC_API_KEY=sk-ant-...
# STRIPE_SECRET_KEY=sk_test_...
`;

    fs.writeFileSync(envLocalPath, envContent);
    console.log('✅ .env.local created with MySQL configuration');
    console.log('');
    console.log('⚠️  IMPORTANT: Update DATABASE_URL in .env.local with your MySQL connection string');
    console.log('');
    console.log('Options:');
    console.log('  1. Local MySQL: mysql://root:password@localhost:3306/digitalmeng');
    console.log('  2. PlanetScale: https://planetscale.com (Free tier, no setup)');
    console.log('  3. Railway: https://railway.app (Free tier)');
    console.log('  4. AWS RDS MySQL');
    console.log('');
    console.log('After updating DATABASE_URL, run this script again.');
    console.log('');
    process.exit(0);
}

console.log('✅ .env.local exists');

// Check if DATABASE_URL is set
const envContent = fs.readFileSync(envLocalPath, 'utf-8');
const dbUrlMatch = envContent.match(/DATABASE_URL\s*=\s*"([^"]+)"/);

if (!dbUrlMatch || !dbUrlMatch[1] || dbUrlMatch[1].includes('localhost:3306/digitalmeng')) {
    console.log('');
    console.log('⚠️  DATABASE_URL needs to be configured!');
    console.log('');
    console.log('Current value appears to be default/example.');
    console.log('');
    console.log('Quick Setup Options:');
    console.log('');
    console.log('1. PlanetScale (Easiest - No local install):');
    console.log('   - Go to https://planetscale.com');
    console.log('   - Sign up (free)');
    console.log('   - Create database');
    console.log('   - Copy connection string');
    console.log('   - Update DATABASE_URL in .env.local');
    console.log('');
    console.log('2. Local MySQL:');
    console.log('   - Install MySQL: https://dev.mysql.com/downloads/');
    console.log('   - Create database: CREATE DATABASE digitalmeng;');
    console.log('   - Update DATABASE_URL: mysql://root:yourpassword@localhost:3306/digitalmeng');
    console.log('');

    const readline = require('readline').createInterface({
        input: process.stdin,
        output: process.stdout
    });

    readline.question('Have you updated DATABASE_URL? (y/n): ', (answer) => {
        readline.close();
        if (answer.toLowerCase() !== 'y') {
            console.log('Please update DATABASE_URL in .env.local and run again.');
            process.exit(0);
        }
        continueSetup();
    });
} else {
    continueSetup();
}

function continueSetup() {
    // Step 2: Generate Prisma Client
    console.log('\n[STEP 2/6] Generating Prisma Client for MySQL...');
    try {
        execSync('npx prisma generate', { stdio: 'inherit' });
        console.log('✅ Prisma client generated successfully');
    } catch (error) {
        console.error('❌ Failed to generate Prisma client');
        console.error('Error:', error.message);
        process.exit(1);
    }

    // Step 3: Push schema to MySQL database
    console.log('\n[STEP 3/6] Creating MySQL database tables...');
    console.log('This will create all tables in your MySQL database...');
    try {
        execSync('npx prisma db push', { stdio: 'inherit' });
        console.log('✅ MySQL database tables created successfully');
    } catch (error) {
        console.error('❌ Failed to create database tables');
        console.error('');
        console.error('Common issues:');
        console.error('  - MySQL server not running');
        console.error('  - Wrong credentials in DATABASE_URL');
        console.error('  - Database does not exist (create it first)');
        console.error('  - Network/firewall issues');
        console.error('');
        console.error('Error:', error.message);
        process.exit(1);
    }

    // Step 4: Create admin user
    console.log('\n[STEP 4/6] Creating admin user...');
    try {
        execSync('node scripts/create-admin-quick.js', { stdio: 'inherit' });
        console.log('✅ Admin user created');
    } catch (error) {
        console.warn('⚠️  Admin user creation failed');
        console.warn('You can create it later with: npm run admin:quick');
    }

    // Step 5: Clean up logs
    console.log('\n[STEP 5/6] Cleaning up log files...');
    const logFiles = fs.readdirSync(process.cwd()).filter(f =>
        f.startsWith('dev_server_') || f.startsWith('prisma')
    ).filter(f => f.endsWith('.log'));

    logFiles.forEach(f => {
        try {
            fs.unlinkSync(path.join(process.cwd(), f));
        } catch (e) { }
    });
    console.log(`✅ Cleaned up ${logFiles.length} log files`);

    // Step 6: Verify connection
    console.log('\n[STEP 6/6] Verifying MySQL connection...');
    try {
        execSync('npx prisma db execute --stdin < nul', { stdio: 'pipe' });
        console.log('✅ MySQL connection verified');
    } catch (error) {
        console.warn('⚠️  Could not verify connection (but setup may still be successful)');
    }

    // Success message
    console.log('\n========================================');
    console.log('  ✅ MySQL SETUP COMPLETE!');
    console.log('========================================\n');
    console.log('Database: MySQL');
    console.log('Schema: All tables created');
    console.log('');
    console.log('Login at: http://localhost:3000/login');
    console.log('  Email: admin@digitalmeng.com');
    console.log('  Password: admin123');
    console.log('');
    console.log('⚠️  IMPORTANT: Change password after first login!');
    console.log('');
    console.log('Your dev server should already be running.');
    console.log('If not, start it with: npm run dev');
    console.log('');
    console.log('To view your database:');
    console.log('  npm run db:studio');
    console.log('');
}
