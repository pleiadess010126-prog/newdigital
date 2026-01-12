#!/usr/bin/env node
const { execSync } = require('child_process');
const dotenv = require('dotenv');
const path = require('path');

// Load .env file
const result = dotenv.config({ path: path.join(__dirname, '..', '.env') });

if (result.error) {
    console.error('Failed to load .env file:', result.error);
    process.exit(1);
}

if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL not found in environment after loading .env');
    process.exit(1);
}

console.log('✓ DATABASE_URL loaded successfully');
console.log('Running: prisma generate');

try {
    execSync('npx prisma generate', {
        stdio: 'inherit',
        env: process.env
    });
    console.log('✓ Prisma Client generated successfully');
} catch (error) {
    console.error('Failed to generate Prisma Client');
    process.exit(1);
}
