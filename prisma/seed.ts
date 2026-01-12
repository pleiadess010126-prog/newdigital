
import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

async function main() {
    try {
        const sqlPath = path.join(process.cwd(), 'prisma', 'seed.sql');
        console.log(`Reading seed file from: ${sqlPath}`);

        if (!fs.existsSync(sqlPath)) {
            throw new Error(`Seed file not found at ${sqlPath}`);
        }

        const sql = fs.readFileSync(sqlPath, 'utf-8');

        console.log('Seeding database from SQL file...');

        // Attempt to extract the DO block
        const doBlockMatch = sql.match(/DO \$\$[\s\S]*?END \$\$;/);

        if (doBlockMatch) {
            console.log('Found DO block, executing...');
            await prisma.$executeRawUnsafe(doBlockMatch[0]);
            console.log('Seed data applied successfully.');
        } else {
            console.warn('No DO $$ block found. Attempting to execute entire file (this might fail if there are multiple statements)...');
            await prisma.$executeRawUnsafe(sql);
        }

        console.log('Seeding completed.');
    } catch (error) {
        console.error('Error during seeding:', error);
        process.exit(1);
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
