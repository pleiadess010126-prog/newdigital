-- =============================================================================
-- DIGITALMENG DATABASE MIGRATION - PART 5: ACTIVITY, AFFILIATE & SESSION TABLES
-- Execute this in Neon SQL Editor after Part 4
-- =============================================================================

-- Activity Logs table
CREATE TABLE "activity_logs" (
    "id" TEXT PRIMARY KEY,
    "organizationId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "metadata" JSONB,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT "activity_logs_organizationId_fkey" FOREIGN KEY ("organizationId") 
        REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "activity_logs_userId_fkey" FOREIGN KEY ("userId") 
        REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- API Keys table
CREATE TABLE "api_keys" (
    "id" TEXT PRIMARY KEY,
    "organizationId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "keyHash" TEXT UNIQUE NOT NULL,
    "keyPrefix" TEXT NOT NULL,
    "permissions" TEXT[],
    "lastUsedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT "api_keys_organizationId_fkey" FOREIGN KEY ("organizationId") 
        REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "api_keys_createdBy_fkey" FOREIGN KEY ("createdBy") 
        REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- Affiliates table
CREATE TABLE "affiliates" (
    "id" TEXT PRIMARY KEY,
    "organizationId" TEXT NOT NULL,
    "userId" TEXT,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "referralCode" TEXT UNIQUE NOT NULL,
    "status" "AffiliateStatus" DEFAULT 'pending' NOT NULL,
    "tier" TEXT DEFAULT 'bronze' NOT NULL,
    "commissionRate" DOUBLE PRECISION DEFAULT 0.20 NOT NULL,
    "totalReferrals" INTEGER DEFAULT 0 NOT NULL,
    "activeReferrals" INTEGER DEFAULT 0 NOT NULL,
    "totalEarnings" DOUBLE PRECISION DEFAULT 0 NOT NULL,
    "pendingEarnings" DOUBLE PRECISION DEFAULT 0 NOT NULL,
    "paidEarnings" DOUBLE PRECISION DEFAULT 0 NOT NULL,
    "paypalEmail" TEXT,
    "bankDetails" JSONB,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "affiliates_organizationId_fkey" FOREIGN KEY ("organizationId") 
        REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Affiliate Transactions table
CREATE TABLE "affiliate_transactions" (
    "id" TEXT PRIMARY KEY,
    "affiliateId" TEXT NOT NULL,
    "referralId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "plan" "Plan" NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT "affiliate_transactions_affiliateId_fkey" FOREIGN KEY ("affiliateId") 
        REFERENCES "affiliates"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Affiliate Payouts table
CREATE TABLE "affiliate_payouts" (
    "id" TEXT PRIMARY KEY,
    "affiliateId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "status" "PayoutStatus" DEFAULT 'pending' NOT NULL,
    "method" TEXT NOT NULL,
    "transactionId" TEXT,
    "processedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT "affiliate_payouts_affiliateId_fkey" FOREIGN KEY ("affiliateId") 
        REFERENCES "affiliates"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Sessions table
CREATE TABLE "sessions" (
    "id" TEXT PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "token" TEXT UNIQUE NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "isValid" BOOLEAN DEFAULT true NOT NULL,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Confirmation message
SELECT 'Activity, Affiliate & Session tables created successfully!' AS status;
