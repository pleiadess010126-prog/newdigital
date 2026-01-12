-- =============================================================================
-- DIGITALMENG DATABASE MIGRATION - PART 1: ENUMS
-- Execute this in Neon SQL Editor first
-- =============================================================================

-- Create all ENUM types
CREATE TYPE "Plan" AS ENUM ('free', 'lite', 'starter', 'pro', 'enterprise');
CREATE TYPE "UserRole" AS ENUM ('owner', 'admin', 'editor', 'viewer', 'superadmin');
CREATE TYPE "AuthProvider" AS ENUM ('email', 'google', 'github', 'cognito');
CREATE TYPE "MemberStatus" AS ENUM ('pending', 'active', 'suspended');
CREATE TYPE "CampaignStatus" AS ENUM ('draft', 'active', 'paused', 'completed');
CREATE TYPE "ContentType" AS ENUM ('blog', 'youtube_short', 'instagram_reel', 'facebook_story', 'tiktok', 'linkedin_post', 'twitter_post');
CREATE TYPE "ContentStatus" AS ENUM ('draft', 'pending', 'approved', 'scheduled', 'published', 'rejected');
CREATE TYPE "PlatformType" AS ENUM ('wordpress', 'youtube', 'instagram', 'facebook', 'twitter', 'linkedin', 'tiktok');
CREATE TYPE "PlatformConnectionStatus" AS ENUM ('connected', 'disconnected', 'error', 'expired');
CREATE TYPE "PublishStatus" AS ENUM ('pending', 'success', 'failed');
CREATE TYPE "SubscriptionStatus" AS ENUM ('active', 'past_due', 'canceled', 'trialing', 'incomplete', 'paused');
CREATE TYPE "InvoiceStatus" AS ENUM ('draft', 'open', 'paid', 'void', 'uncollectible');
CREATE TYPE "AIAgentType" AS ENUM ('supervisor', 'seo_worker', 'social_worker', 'risk_worker', 'video_worker', 'analytics_worker', 'geo_worker');
CREATE TYPE "AIAgentStatus" AS ENUM ('idle', 'working', 'error', 'disabled');
CREATE TYPE "RiskAlertType" AS ENUM ('indexation', 'velocity', 'quality', 'spam', 'duplicate', 'bounce_rate', 'traffic_cliff');
CREATE TYPE "RiskSeverity" AS ENUM ('low', 'medium', 'high', 'critical');
CREATE TYPE "RiskAlertStatus" AS ENUM ('active', 'acknowledged', 'resolved', 'dismissed');
CREATE TYPE "AffiliateStatus" AS ENUM ('pending', 'active', 'suspended', 'rejected');
CREATE TYPE "PayoutStatus" AS ENUM ('pending', 'processing', 'completed', 'failed');

-- Confirmation message
SELECT 'Enums created successfully!' AS status;
