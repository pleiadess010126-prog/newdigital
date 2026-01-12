-- =============================================================================
-- DIGITALMENG DATABASE MIGRATION - PART 3: CAMPAIGN & CONTENT TABLES
-- Execute this in Neon SQL Editor after Part 2
-- =============================================================================

-- Campaigns table
CREATE TABLE "campaigns" (
    "id" TEXT PRIMARY KEY,
    "organizationId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "status" "CampaignStatus" DEFAULT 'draft' NOT NULL,
    "createdBy" TEXT NOT NULL,
    "websiteUrl" TEXT,
    "targetAudience" TEXT,
    "industry" TEXT,
    "keywords" TEXT[],
    "velocityMonth1" INTEGER DEFAULT 10 NOT NULL,
    "velocityMonth2" INTEGER DEFAULT 20 NOT NULL,
    "velocityMonth3" INTEGER DEFAULT 30 NOT NULL,
    "blogEnabled" BOOLEAN DEFAULT true NOT NULL,
    "youtubeEnabled" BOOLEAN DEFAULT false NOT NULL,
    "instagramEnabled" BOOLEAN DEFAULT false NOT NULL,
    "facebookEnabled" BOOLEAN DEFAULT false NOT NULL,
    "autoPublish" BOOLEAN DEFAULT false NOT NULL,
    "requireApproval" BOOLEAN DEFAULT true NOT NULL,
    "preferredDays" TEXT[],
    "preferredTimes" TEXT[],
    "scheduleTimezone" TEXT DEFAULT 'UTC' NOT NULL,
    "totalContent" INTEGER DEFAULT 0 NOT NULL,
    "publishedContent" INTEGER DEFAULT 0 NOT NULL,
    "pendingContent" INTEGER DEFAULT 0 NOT NULL,
    "totalViews" INTEGER DEFAULT 0 NOT NULL,
    "totalEngagement" INTEGER DEFAULT 0 NOT NULL,
    "riskScore" INTEGER DEFAULT 0 NOT NULL,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "campaigns_organizationId_fkey" FOREIGN KEY ("organizationId") 
        REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "campaigns_createdBy_fkey" FOREIGN KEY ("createdBy") 
        REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- Topic Pillars table
CREATE TABLE "topic_pillars" (
    "id" TEXT PRIMARY KEY,
    "organizationId" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "keywords" TEXT[],
    "contentCount" INTEGER DEFAULT 0 NOT NULL,
    "isActive" BOOLEAN DEFAULT true NOT NULL,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "topic_pillars_organizationId_fkey" FOREIGN KEY ("organizationId") 
        REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "topic_pillars_campaignId_fkey" FOREIGN KEY ("campaignId") 
        REFERENCES "campaigns"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Content Items table
CREATE TABLE "content_items" (
    "id" TEXT PRIMARY KEY,
    "organizationId" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "type" "ContentType" NOT NULL,
    "status" "ContentStatus" DEFAULT 'draft' NOT NULL,
    "topicPillarId" TEXT,
    "seoScore" INTEGER DEFAULT 0 NOT NULL,
    "wordCount" INTEGER DEFAULT 0 NOT NULL,
    "readingTime" INTEGER DEFAULT 0 NOT NULL,
    "keywords" TEXT[],
    "targetKeyword" TEXT,
    "hashtags" TEXT[],
    "geoScore" INTEGER,
    "geoGrade" TEXT,
    "geoDirectness" INTEGER,
    "geoAuthority" INTEGER,
    "geoStructure" INTEGER,
    "geoConversational" INTEGER,
    "geoFreshness" INTEGER,
    "geoSnippetOpt" INTEGER,
    "geoSemanticRichness" INTEGER,
    "geoReadability" INTEGER,
    "geoRecommendations" TEXT[],
    "geoStrengths" TEXT[],
    "aiModel" TEXT,
    "generationPrompt" TEXT,
    "views" INTEGER DEFAULT 0 NOT NULL,
    "engagement" INTEGER DEFAULT 0 NOT NULL,
    "shares" INTEGER DEFAULT 0 NOT NULL,
    "comments" INTEGER DEFAULT 0 NOT NULL,
    "dwellTime" INTEGER DEFAULT 0 NOT NULL,
    "bounceRate" INTEGER DEFAULT 0 NOT NULL,
    "conversions" INTEGER DEFAULT 0 NOT NULL,
    "scheduledFor" TIMESTAMP(3),
    "publishedAt" TIMESTAMP(3),
    "publishedUrl" TEXT,
    "createdBy" TEXT NOT NULL,
    "approvedBy" TEXT,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "content_items_organizationId_fkey" FOREIGN KEY ("organizationId") 
        REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "content_items_campaignId_fkey" FOREIGN KEY ("campaignId") 
        REFERENCES "campaigns"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "content_items_topicPillarId_fkey" FOREIGN KEY ("topicPillarId") 
        REFERENCES "topic_pillars"("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "content_items_createdBy_fkey" FOREIGN KEY ("createdBy") 
        REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "content_items_approvedBy_fkey" FOREIGN KEY ("approvedBy") 
        REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- Published Platforms table
CREATE TABLE "published_platforms" (
    "id" TEXT PRIMARY KEY,
    "contentItemId" TEXT NOT NULL,
    "platform" "PlatformType" NOT NULL,
    "postId" TEXT,
    "postUrl" TEXT,
    "publishedAt" TIMESTAMP(3),
    "status" "PublishStatus" DEFAULT 'pending' NOT NULL,
    "error" TEXT,
    CONSTRAINT "published_platforms_contentItemId_fkey" FOREIGN KEY ("contentItemId") 
        REFERENCES "content_items"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    UNIQUE ("contentItemId", "platform")
);

-- Confirmation message
SELECT 'Campaign & Content tables created successfully!' AS status;
