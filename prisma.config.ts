// Prisma 7 Configuration File
// This file is required for Prisma 7.x and above
import { config } from "dotenv";
import { defineConfig } from "prisma/config";

// Load environment variables
config({ path: '.env.local' });
config({ path: '.env' });

// Get DATABASE_URL from environment
const databaseUrl = process.env["DATABASE_URL"] || "postgresql://localhost:5432/digitalmeng";

export default defineConfig({
    schema: "prisma/schema.prisma",
    migrations: {
        path: "prisma/migrations",
    },
    datasource: {
        url: databaseUrl,
    },
});
