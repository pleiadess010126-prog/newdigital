# Database Seeding Instructions

## What Gets Seeded

The seed script (`prisma/seed.sql`) creates:

1. **Super Admin User**
   - Email: `admin@digitalmeng.com`
   - Password: `Admin@123`
   - Role: `superadmin`

2. **Demo Organization**
   - Name: "Demo Marketing Agency"
   - Plan: Pro (with 15-day trial)
   - Configured settings and preferences

3. **Demo Campaign**
   - Name: "AI Marketing Campaign 2026"
   - Status: Active
   - Full configuration with keywords and velocity settings

4. **Topic Pillar**
   - "AI-Powered Marketing Strategies"
   - Linked to the demo campaign

5. **AI Agents** (7 agents)
   - Supervisor
   - SEO Worker
   - Social Worker
   - Risk Worker
   - Video Worker
   - Analytics Worker
   - GEO Worker

6. **Usage Record**
   - Current month tracking initialized

---

## How to Run Seed Script

### Option 1: Neon SQL Editor (Recommended)

1. Open Neon Console → SQL Editor
2. Copy the entire content of `prisma/seed.sql`
3. Paste into SQL Editor
4. Click **Run**
5. Check the output for success message with credentials

### Option 2: Command Line

If you have `psql` installed:

```powershell
$env:DATABASE_URL="postgresql://neondb_owner:npg_ang9FJ5RPGAf@ep-dark-sea-a13uoorw-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require"
psql $env:DATABASE_URL -f prisma/seed.sql
```

---

## Verification

After running the seed script, verify the data:

```sql
-- Check seeded data
SELECT 
    (SELECT COUNT(*) FROM users) as users,
    (SELECT COUNT(*) FROM organizations) as orgs,
    (SELECT COUNT(*) FROM campaigns) as campaigns,
    (SELECT COUNT(*) FROM ai_agents) as agents;

-- View admin user
SELECT id, email, name, role FROM users WHERE email = 'admin@digitalmeng.com';

-- View demo organization
SELECT id, name, slug, plan FROM organizations LIMIT 1;
```

Expected results:
- 1 user
- 1 organization
- 1 campaign
- 7 AI agents

---

## Login Test

After seeding, test the application:

1. Start dev server: `npm run dev`
2. Navigate to: `http://localhost:3000/auth/signin`
3. Login with:
   - **Email**: `admin@digitalmeng.com`
   - **Password**: `Admin@123`
4. You should see the dashboard with the demo campaign

---

## Notes

- The password hash uses bcrypt with 10 rounds
- The demo organization has a 15-day trial period
- All AI agents are initialized in 'idle' status
- Usage tracking starts at 0 for the current month
