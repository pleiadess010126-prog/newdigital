-- =============================================================================
-- DIGITALMENG DATABASE MIGRATION - PART 4: BILLING, PLATFORMS & AI TABLES
-- Execute this in Neon SQL Editor after Part 3
-- =============================================================================

-- Platform Connections table
CREATE TABLE "platform_connections" (
    "id" TEXT PRIMARY KEY,
    "organizationId" TEXT NOT NULL,
    "platform" "PlatformType" NOT NULL,
    "name" TEXT NOT NULL,
    "status" "PlatformConnectionStatus" DEFAULT 'disconnected' NOT NULL,
    "accessToken" TEXT,
    "refreshToken" TEXT,
    "apiKey" TEXT,
    "apiSecret" TEXT,
    "tokenExpiry" TIMESTAMP(3),
    "accountId" TEXT,
    "accountName" TEXT,
    "accountUrl" TEXT,
    "followersCount" INTEGER,
    "postsCount" INTEGER,
    "lastSyncAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "platform_connections_organizationId_fkey" FOREIGN KEY ("organizationId") 
        REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    UNIQUE ("organizationId", "platform")
);

-- Subscriptions table
CREATE TABLE "subscriptions" (
    "id" TEXT PRIMARY KEY,
    "organizationId" TEXT NOT NULL,
    "stripeSubscriptionId" TEXT UNIQUE NOT NULL,
    "stripeCustomerId" TEXT NOT NULL,
    "plan" "Plan" NOT NULL,
    "status" "SubscriptionStatus" DEFAULT 'trialing' NOT NULL,
    "currentPeriodStart" TIMESTAMP(3) NOT NULL,
    "currentPeriodEnd" TIMESTAMP(3) NOT NULL,
    "cancelAtPeriodEnd" BOOLEAN DEFAULT false NOT NULL,
    "trialEnd" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "subscriptions_organizationId_fkey" FOREIGN KEY ("organizationId") 
        REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Usage Records table
CREATE TABLE "usage_records" (
    "id" TEXT PRIMARY KEY,
    "organizationId" TEXT NOT NULL,
    "month" TEXT NOT NULL,
    "contentGenerated" INTEGER DEFAULT 0 NOT NULL,
    "wordpressPosts" INTEGER DEFAULT 0 NOT NULL,
    "youtubePosts" INTEGER DEFAULT 0 NOT NULL,
    "instagramPosts" INTEGER DEFAULT 0 NOT NULL,
    "facebookPosts" INTEGER DEFAULT 0 NOT NULL,
    "tiktokPosts" INTEGER DEFAULT 0 NOT NULL,
    "linkedinPosts" INTEGER DEFAULT 0 NOT NULL,
    "twitterPosts" INTEGER DEFAULT 0 NOT NULL,
    "apiCalls" INTEGER DEFAULT 0 NOT NULL,
    "storageUsedMB" INTEGER DEFAULT 0 NOT NULL,
    "videoMinutesUsed" INTEGER DEFAULT 0 NOT NULL,
    "voiceOverCharactersUsed" INTEGER DEFAULT 0 NOT NULL,
    "musicTracksUsed" INTEGER DEFAULT 0 NOT NULL,
    "aiImagesGenerated" INTEGER DEFAULT 0 NOT NULL,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "usage_records_organizationId_fkey" FOREIGN KEY ("organizationId") 
        REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    UNIQUE ("organizationId", "month")
);

-- Invoices table
CREATE TABLE "invoices" (
    "id" TEXT PRIMARY KEY,
    "organizationId" TEXT NOT NULL,
    "stripeInvoiceId" TEXT UNIQUE NOT NULL,
    "amount" INTEGER NOT NULL,
    "currency" TEXT DEFAULT 'usd' NOT NULL,
    "status" "InvoiceStatus" DEFAULT 'draft' NOT NULL,
    "pdfUrl" TEXT,
    "periodStart" TIMESTAMP(3) NOT NULL,
    "periodEnd" TIMESTAMP(3) NOT NULL,
    "paidAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT "invoices_organizationId_fkey" FOREIGN KEY ("organizationId") 
        REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- AI Agents table
CREATE TABLE "ai_agents" (
    "id" TEXT PRIMARY KEY,
    "organizationId" TEXT NOT NULL,
    "type" "AIAgentType" NOT NULL,
    "name" TEXT NOT NULL,
    "status" "AIAgentStatus" DEFAULT 'idle' NOT NULL,
    "lastActiveAt" TIMESTAMP(3),
    "tasksCompleted" INTEGER DEFAULT 0 NOT NULL,
    "currentTask" TEXT,
    "enabled" BOOLEAN DEFAULT true NOT NULL,
    "schedule" TEXT,
    "maxConcurrentTasks" INTEGER DEFAULT 1 NOT NULL,
    "priority" TEXT DEFAULT 'medium' NOT NULL,
    "modelPreference" TEXT,
    "customInstructions" TEXT,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "ai_agents_organizationId_fkey" FOREIGN KEY ("organizationId") 
        REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    UNIQUE ("organizationId", "type")
);

-- Risk Alerts table
CREATE TABLE "risk_alerts" (
    "id" TEXT PRIMARY KEY,
    "organizationId" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "type" "RiskAlertType" NOT NULL,
    "severity" "RiskSeverity" NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "recommendation" TEXT NOT NULL,
    "status" "RiskAlertStatus" DEFAULT 'active' NOT NULL,
    "resolvedAt" TIMESTAMP(3),
    "resolvedBy" TEXT,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT "risk_alerts_organizationId_fkey" FOREIGN KEY ("organizationId") 
        REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "risk_alerts_campaignId_fkey" FOREIGN KEY ("campaignId") 
        REFERENCES "campaigns"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "risk_alerts_resolvedBy_fkey" FOREIGN KEY ("resolvedBy") 
        REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- Confirmation message
SELECT 'Billing, Platforms & AI tables created successfully!' AS status;
