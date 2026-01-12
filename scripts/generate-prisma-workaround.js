#!/usr/bin/env node
/**
 * Temporary script to generate Prisma Client by temporarily modifying schema.prisma
 * This is a workaround for Windows environment variable loading issues
 */

const fs = require('fs');
const { execSync } = require('child_process');
const dotenv = require('dotenv');
const path = require('path');

// Load DATABASE_URL from .env
const result = dotenv.config({ path: path.join(__dirname, '..', '.env') });

if (result.error || !process.env.DATABASE_URL) {
    console.error('❌ Failed to load DATABASE_URL from .env file');
    process.exit(1);
}

const DATABASE_URL = process.env.DATABASE_URL;
console.log('✓ DATABASE_URL loaded from .env');

const schemaPath = path.join(__dirname, '..', 'prisma', 'schema.prisma');
const backupPath = path.join(__dirname, '..', 'prisma', 'schema.prisma.backup');

try {
    // Backup original schema
    const originalSchema = fs.readFileSync(schemaPath, 'utf8');
    fs.writeFileSync(backupPath, originalSchema);
    console.log('✓ Created backup of schema.prisma');

    // Replace env("DATABASE_URL") with actual URL
    const modifiedSchema = originalSchema.replace(
        /url\s*=\s*env\("DATABASE_URL"\)/,
        `url      = "${DATABASE_URL}"`
    );

    fs.writeFileSync(schemaPath, modifiedSchema);
    console.log('✓ Temporarily modified schema.prisma with direct URL');

    // Generate Prisma Client
    console.log('Running: prisma generate...');
    execSync('npx prisma generate', {
        stdio: 'inherit',
        cwd: path.join(__dirname, '..')
    });

    console.log('✓ Prisma Client generated successfully');

} catch (error) {
    console.error('❌ Failed to generate Prisma Client:', error.message);
    process.exit(1);
} finally {
    // Restore original schema
    if (fs.existsSync(backupPath)) {
        fs.copyFileSync(backupPath, schemaPath);
        fs.unlinkSync(backupPath);
        console.log('✓ Restored original schema.prisma');
    }
}
