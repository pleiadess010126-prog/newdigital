# 🔐 Admin User Creation Guide

This guide explains how to create admin users for your DigitalMEng application.

---

## 🚀 Quick Start

### Option 1: Quick Admin Creation (Recommended for Development)

Creates an admin user with default credentials:

```bash
npm run admin:quick
```

**Default Credentials:**
- **Email**: `admin@digitalmeng.com`
- **Password**: `admin123`
- **Role**: `superadmin`
- **Organization**: `DigitalMEng Admin`

⚠️ **IMPORTANT**: Change the password after first login!

---

### Option 2: Interactive Admin Creation (Recommended for Production)

Creates an admin user with custom credentials:

```bash
npm run admin:create
```

You'll be prompted to enter:
- Admin email
- Admin name
- Admin password
- Organization name

---

## 🔧 Custom Admin Creation

You can customize the quick admin creation using environment variables:

```bash
# Windows (PowerShell)
$env:ADMIN_EMAIL="your-email@example.com"
$env:ADMIN_NAME="Your Name"
$env:ADMIN_PASSWORD="your-secure-password"
$env:ORG_NAME="Your Organization"
npm run admin:quick

# Linux/Mac
ADMIN_EMAIL="your-email@example.com" \
ADMIN_NAME="Your Name" \
ADMIN_PASSWORD="your-secure-password" \
ORG_NAME="Your Organization" \
npm run admin:quick
```

---

## 📋 Prerequisites

Before creating an admin user, ensure:

1. ✅ **Database is running** and accessible
2. ✅ **Prisma client is generated**: `npm run db:generate`
3. ✅ **Database schema is pushed**: `npm run db:push`
4. ✅ **Environment variables are set** (especially `DATABASE_URL`)

---

## 🔍 What Gets Created

When you create an admin user, the script will:

1. ✅ Create a new **Organization** (if it doesn't exist)
2. ✅ Create a **Superadmin User** with hashed password
3. ✅ Link the user to the organization as **Owner**
4. ✅ Create an **Organization Member** record
5. ✅ Set the user role to **superadmin**

---

## 👤 User Roles

DigitalMEng supports the following roles:

| Role | Permissions |
|------|-------------|
| **superadmin** | Full system access, can manage all organizations |
| **owner** | Full access to their organization |
| **admin** | Manage users, campaigns, and content |
| **support** | Access Support Dashboard, manage tickets |
| **editor** | Create and edit content |
| **viewer** | Read-only access |

---

## 🔐 Login After Creation

After creating the admin user:

1. Navigate to: **http://localhost:3000/login**
2. Enter your admin email and password
3. You'll be redirected to the dashboard

---

## 🛠️ Troubleshooting

### Error: "User already exists"

If the user already exists, the script will update their role to `superadmin` instead of creating a new user.

### Error: "DATABASE_URL not set"

Make sure your `.env` or `.env.local` file contains:

```env
DATABASE_URL=postgresql://user:password@host:5432/database
```

### Error: "Cannot find module '@prisma/client'"

Run:

```bash
npm run db:generate
```

### Error: "Cannot connect to database"

1. Verify your database is running
2. Check your `DATABASE_URL` is correct
3. Test connection with: `npm run db:studio`

---

## 📝 Manual Admin Creation (SQL)

If you prefer to create an admin user manually via SQL:

```sql
-- 1. Create organization
INSERT INTO organizations (id, name, slug, "ownerId", plan, "createdAt", "updatedAt")
VALUES (
  'org_admin_001',
  'Admin Organization',
  'admin-organization',
  'user_admin_001',
  'enterprise',
  NOW(),
  NOW()
);

-- 2. Create admin user (password: admin123)
INSERT INTO users (id, email, name, "passwordHash", role, "authProvider", "emailVerified", "organizationId", "createdAt", "updatedAt")
VALUES (
  'user_admin_001',
  'admin@digitalmeng.com',
  'System Administrator',
  '$2a$10$YourHashedPasswordHere',
  'superadmin',
  'email',
  true,
  'org_admin_001',
  NOW(),
  NOW()
);

-- 3. Create organization member
INSERT INTO organization_members (id, "organizationId", "userId", role, "invitedBy", status, "acceptedAt", "invitedAt")
VALUES (
  gen_random_uuid(),
  'org_admin_001',
  'user_admin_001',
  'owner',
  'user_admin_001',
  'active',
  NOW(),
  NOW()
);
```

**Note**: Generate password hash using:

```bash
node -e "const bcrypt = require('bcryptjs'); console.log(bcrypt.hashSync('your-password', 10));"
```

---

## 🔄 Updating Admin Password

To update an existing admin's password:

```bash
# Run the quick script again with the same email
ADMIN_EMAIL="admin@digitalmeng.com" \
ADMIN_PASSWORD="new-password" \
npm run admin:quick
```

The script will detect the existing user and update the password.

---

## 🎯 Best Practices

1. ✅ **Use strong passwords** in production
2. ✅ **Change default passwords** immediately
3. ✅ **Use environment variables** for sensitive data
4. ✅ **Enable email verification** for production
5. ✅ **Set up 2FA** (when available)
6. ✅ **Regularly audit** admin users
7. ✅ **Use the interactive script** for production deployments

---

## 📊 Admin User Management

### View All Admin Users

```bash
npm run db:studio
```

Then navigate to the `users` table and filter by `role = 'superadmin'`.

### Delete Admin User

```bash
# Using Prisma Studio
npm run db:studio

# Or via SQL
# DELETE FROM users WHERE email = 'admin@digitalmeng.com';
```

---

## 🔗 Related Commands

```bash
# Generate Prisma client
npm run db:generate

# Push schema to database
npm run db:push

# Open Prisma Studio (database GUI)
npm run db:studio

# Run database migrations
npm run db:migrate

# Seed database with demo data
npm run db:seed
```

---

## 📞 Support

If you encounter issues:

1. Check the [Troubleshooting](#troubleshooting) section
2. Verify your database connection
3. Ensure Prisma client is generated
4. Check the console logs for detailed error messages

---

**Last Updated**: January 2026  
**Status**: ✅ Ready to Use
