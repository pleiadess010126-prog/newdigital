# Database Migration Instructions

## Overview
This directory contains SQL migration files to set up the DigitalMEng database in your Neon PostgreSQL instance.

**Why manual migrations?** Due to Prisma CLI compatibility issues with Windows environment variables, we're using direct SQL migrations that can be executed in Neon's SQL Editor.

---

## Migration Files (Execute in Order)

1. **001_create_enums.sql** - Creates all ENUM types
2. **002_create_core_tables.sql** - Organizations, Users, Members
3. **003_create_campaign_content_tables.sql** - Campaigns, Content, Topic Pillars
4. **004_create_billing_platform_ai_tables.sql** - Subscriptions, Platforms, AI Agents
5. **005_create_activity_affiliate_session_tables.sql** - Activity Logs, Affiliates, Sessions
6. **006_create_indexes.sql** - All database indexes for performance

---

## How to Execute Migrations

### Method 1: Neon SQL Editor (Recommended)

1. **Open Neon Console**
   - Go to https://console.neon.tech
   - Select your project: `DigitalMEng`
   - Navigate to **SQL Editor** in the left menu

2. **Execute Migration Files in Order**
   - Copy the entire content of `001_create_enums.sql`
   - Paste into the SQL Editor
   - Click **Run** button
   - Verify you see: "✓ Enums created successfully!"

3. **Repeat for Each File**
   - Execute files 002 through 006 in numerical order
   - Wait for each to complete before running the next
   - Each file has a confirmation message at the end

4. **Verify Completion**
   - After running all 6 files, check the **Tables** tab
   - You should see 18 tables created
   - Check the **Enums** section to see all enum types

### Method 2: Command Line (Alternative)

If you have `psql` installed:

```bash
# Set your database URL
$env:DATABASE_URL="postgresql://neondb_owner:npg_ang9FJ5RPGAf@ep-dark-sea-a13uoorw-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require"

# Run migrations in order
psql $env:DATABASE_URL -f prisma/migrations/001_create_enums.sql
psql $env:DATABASE_URL -f prisma/migrations/002_create_core_tables.sql
psql $env:DATABASE_URL -f prisma/migrations/003_create_campaign_content_tables.sql
psql $env:DATABASE_URL -f prisma/migrations/004_create_billing_platform_ai_tables.sql
psql $env:DATABASE_URL -f prisma/migrations/005_create_activity_affiliate_session_tables.sql
psql $env:DATABASE_URL -f prisma/migrations/006_create_indexes.sql
```

---

## Database Schema Summary

### Tables Created (18 total)

**Core**
- `organizations` - Multi-tenant root entities
- `users` - User accounts and authentication
- `organization_members` - Team membership

**Content & Campaigns**
- `campaigns` - Marketing campaigns
- `content_items` - Generated content (blog, video, social)
- `topic_pillars` - Content topic clusters
- `published_platforms` - Cross-platform publishing tracking

**Integrations**
- `platform_connections` - Social media & CMS connections

**Billing**
- `subscriptions` - Stripe subscriptions
- `usage_records` - Monthly usage tracking
- `invoices` - Billing history

**AI & Automation**
- `ai_agents` - Autonomous AI workers
- `risk_alerts` - SEO/content risk monitoring

**Activity & Security**
- `activity_logs` - Audit trail
- `api_keys` - External API access
- `sessions` - User sessions

**Affiliate Program**
- `affiliates` - Affiliate partners
- `affiliate_transactions` - Commission tracking
- `affiliate_payouts` - Payment processing

---

## Verification Steps

After running all migrations:

1. **Check Table Count**
   ```sql
   SELECT COUNT(*) as table_count 
   FROM information_schema.tables 
   WHERE table_schema = 'public' AND table_type = 'BASE TABLE';
   ```
   Expected: 18 tables

2. **Check Enum Count**
   ```sql
   SELECT COUNT(*) as enum_count 
   FROM pg_type 
   WHERE typtype = 'e';
   ```
   Expected: 19 enums

3. **Sample Query**
   ```sql
   SELECT table_name 
   FROM information_schema.tables 
   WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
   ORDER BY table_name;
   ```

---

## Next Steps

After successful migration:

1. ✅ **Reinstall Node Modules** (if cleared)
   ```bash
   npm install
   ```

2. ✅ **Update .env File**
   Make sure your `.env` file contains:
   ```
   DATABASE_URL="postgresql://neondb_owner:npg_ang9FJ5RPGAf@ep-dark-sea-a13uoorw-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require"
   ```

3. ✅ **Test Database Connection**
   - Start the dev server: `npm run dev`
   - Navigate to `/api/health`
   - Should see database connection status

4. ✅ **Seed Initial Data** (Optional)
   - Create admin user
   - Add demo organization
   - Initialize AI agents

---

## Troubleshooting

### Error: "relation already exists"
- Some tables may have been created in previous attempts
- Option A: Drop existing tables first
- Option B: Skip that specific migration file

### Error: "type already exists"  
- Enums were created in a previous run
- Safe to ignore or skip 001_create_enums.sql

### Error: Foreign key constraint
- Migrations must be run in numerical order
- Check that previous migrations completed successfully

---

## Rollback (If Needed)

To completely reset the database:

```sql
-- Drop all tables (will cascade delete all data)
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
GRANT ALL ON SCHEMA public TO neondb_owner;
GRANT ALL ON SCHEMA public TO public;
```

Then re-run all migration files from 001 to 006.

---

## Production Deployment

For production deployments using Vercel/similar:

1. Set `DATABASE_URL` in environment variables
2. Push code with `schema.prisma` restored (use env("DATABASE_URL"))
3. Run `npx prisma generate` in deploy environment (works on Linux)
4. Prisma Client will be available for Next.js API routes

---

## Questions?

If you encounter any issues during migration:
1. Check the Neon console for error messages
2. Verify your database connection string is correct
3. Ensure you have proper permissions on the database
4. Review the SQL file content for any syntax issues
