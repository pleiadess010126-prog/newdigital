-- =============================================================================
-- DIGITALMENG DATABASE MIGRATION - PART 2: CORE TABLES
-- Execute this in Neon SQL Editor after Part 1
-- =============================================================================

-- Organizations table
CREATE TABLE "organizations" (
    "id" TEXT PRIMARY KEY,
    "name" TEXT NOT NULL,
    "slug" TEXT UNIQUE NOT NULL,
    "ownerId" TEXT NOT NULL,
    "plan" "Plan" DEFAULT 'free' NOT NULL,
    "stripeCustomerId" TEXT UNIQUE,
    "stripeSubscriptionId" TEXT UNIQUE,
    "brandName" TEXT,
    "websiteUrl" TEXT,
    "logoUrl" TEXT,
    "primaryColor" TEXT DEFAULT '#8B5CF6',
    "timezone" TEXT DEFAULT 'UTC' NOT NULL,
    "defaultLanguage" TEXT DEFAULT 'en' NOT NULL,
    "emailNotifications" BOOLEAN DEFAULT true NOT NULL,
    "weeklyReports" BOOLEAN DEFAULT true NOT NULL,
    "trialStartDate" TIMESTAMP(3),
    "trialEndDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL
);

-- Users table
CREATE TABLE "users" (
    "id" TEXT PRIMARY KEY,
    "email" TEXT UNIQUE NOT NULL,
    "name" TEXT NOT NULL,
    "passwordHash" TEXT,
    "authProvider" "AuthProvider" DEFAULT 'email' NOT NULL,
    "authProviderId" TEXT,
    "avatar" TEXT,
    "role" "UserRole" DEFAULT 'viewer' NOT NULL,
    "organizationId" TEXT,
    "lastLoginAt" TIMESTAMP(3),
    "emailVerified" BOOLEAN DEFAULT false NOT NULL,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "users_organizationId_fkey" FOREIGN KEY ("organizationId") 
        REFERENCES "organizations"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- Organization Members table
CREATE TABLE "organization_members" (
    "id" TEXT PRIMARY KEY,
    "organizationId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" "UserRole" DEFAULT 'viewer' NOT NULL,
    "invitedBy" TEXT NOT NULL,
    "invitedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "acceptedAt" TIMESTAMP(3),
    "status" "MemberStatus" DEFAULT 'pending' NOT NULL,
    CONSTRAINT "organization_members_organizationId_fkey" FOREIGN KEY ("organizationId") 
        REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "organization_members_userId_fkey" FOREIGN KEY ("userId") 
        REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    UNIQUE ("organizationId", "userId")
);

-- Add foreign key from organizations to users (owner)
ALTER TABLE "organizations" 
    ADD CONSTRAINT "organizations_ownerId_fkey" 
    FOREIGN KEY ("ownerId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Confirmation message
SELECT 'Core tables created successfully!' AS status;
