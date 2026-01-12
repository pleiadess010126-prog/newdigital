-- =============================================================================
-- DIGITALMENG DATABASE MIGRATION - PART 6: INDEXES
-- Execute this in Neon SQL Editor after Part 5
-- =============================================================================

-- Organizations indexes
CREATE INDEX "organizations_slug_idx" ON "organizations"("slug");
CREATE INDEX "organizations_ownerId_idx" ON "organizations"("ownerId");
CREATE INDEX "organizations_stripeCustomerId_idx" ON "organizations"("stripeCustomerId");

-- Users indexes
CREATE INDEX "users_email_idx" ON "users"("email");
CREATE INDEX "users_organizationId_idx" ON "users"("organizationId");
CREATE INDEX "users_authProvider_authProviderId_idx" ON "users"("authProvider", "authProviderId");

-- Organization Members indexes
CREATE INDEX "organization_members_organizationId_idx" ON "organization_members"("organizationId");
CREATE INDEX "organization_members_userId_idx" ON "organization_members"("userId");

-- Campaigns indexes
CREATE INDEX "campaigns_organizationId_idx" ON "campaigns"("organizationId");
CREATE INDEX "campaigns_status_idx" ON "campaigns"("status");
CREATE INDEX "campaigns_createdBy_idx" ON "campaigns"("createdBy");

-- Topic Pillars indexes
CREATE INDEX "topic_pillars_organizationId_idx" ON "topic_pillars"("organizationId");
CREATE INDEX "topic_pillars_campaignId_idx" ON "topic_pillars"("campaignId");

-- Content Items indexes
CREATE INDEX "content_items_organizationId_idx" ON "content_items"("organizationId");
CREATE INDEX "content_items_campaignId_idx" ON "content_items"("campaignId");
CREATE INDEX "content_items_status_idx" ON "content_items"("status");
CREATE INDEX "content_items_type_idx" ON "content_items"("type");
CREATE INDEX "content_items_scheduledFor_idx" ON "content_items"("scheduledFor");
CREATE INDEX "content_items_createdBy_idx" ON "content_items"("createdBy");

-- Published Platforms indexes
CREATE INDEX "published_platforms_contentItemId_idx" ON "published_platforms"("contentItemId");
CREATE INDEX "published_platforms_platform_idx" ON "published_platforms"("platform");

-- Platform Connections indexes
CREATE INDEX "platform_connections_organizationId_idx" ON "platform_connections"("organizationId");
CREATE INDEX "platform_connections_platform_idx" ON "platform_connections"("platform");

-- Subscriptions indexes
CREATE INDEX "subscriptions_organizationId_idx" ON "subscriptions"("organizationId");
CREATE INDEX "subscriptions_stripeSubscriptionId_idx" ON "subscriptions"("stripeSubscriptionId");
CREATE INDEX "subscriptions_status_idx" ON "subscriptions"("status");

-- Usage Records indexes
CREATE INDEX "usage_records_organizationId_idx" ON "usage_records"("organizationId");
CREATE INDEX "usage_records_month_idx" ON "usage_records"("month");

-- Invoices indexes
CREATE INDEX "invoices_organizationId_idx" ON "invoices"("organizationId");
CREATE INDEX "invoices_status_idx" ON "invoices"("status");

-- AI Agents indexes
CREATE INDEX "ai_agents_organizationId_idx" ON "ai_agents"("organizationId");
CREATE INDEX "ai_agents_status_idx" ON "ai_agents"("status");

-- Risk Alerts indexes
CREATE INDEX "risk_alerts_organizationId_idx" ON "risk_alerts"("organizationId");
CREATE INDEX "risk_alerts_campaignId_idx" ON "risk_alerts"("campaignId");
CREATE INDEX "risk_alerts_severity_idx" ON "risk_alerts"("severity");
CREATE INDEX "risk_alerts_status_idx" ON "risk_alerts"("status");

-- Activity Logs indexes
CREATE INDEX "activity_logs_organizationId_idx" ON "activity_logs"("organizationId");
CREATE INDEX "activity_logs_userId_idx" ON "activity_logs"("userId");
CREATE INDEX "activity_logs_action_idx" ON "activity_logs"("action");
CREATE INDEX "activity_logs_entityType_entityId_idx" ON "activity_logs"("entityType", "entityId");
CREATE INDEX "activity_logs_createdAt_idx" ON "activity_logs"("createdAt");

-- API Keys indexes
CREATE INDEX "api_keys_organizationId_idx" ON "api_keys"("organizationId");
CREATE INDEX "api_keys_keyPrefix_idx" ON "api_keys"("keyPrefix");

-- Affiliates indexes
CREATE INDEX "affiliates_organizationId_idx" ON "affiliates"("organizationId");
CREATE INDEX "affiliates_referralCode_idx" ON "affiliates"("referralCode");
CREATE INDEX "affiliates_status_idx" ON "affiliates"("status");

-- Affiliate Transactions indexes
CREATE INDEX "affiliate_transactions_affiliateId_idx" ON "affiliate_transactions"("affiliateId");
CREATE INDEX "affiliate_transactions_createdAt_idx" ON "affiliate_transactions"("createdAt");

-- Affiliate Payouts indexes
CREATE INDEX "affiliate_payouts_affiliateId_idx" ON "affiliate_payouts"("affiliateId");
CREATE INDEX "affiliate_payouts_status_idx" ON "affiliate_payouts"("status");

-- Sessions indexes
CREATE INDEX "sessions_userId_idx" ON "sessions"("userId");
CREATE INDEX "sessions_token_idx" ON "sessions"("token");
CREATE INDEX "sessions_expiresAt_idx" ON "sessions"("expiresAt");

-- Confirmation message
SELECT 'All indexes created successfully!' AS status;
SELECT 'Database migration complete! ✓' AS final_status;
