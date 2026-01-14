// Multi-tenant Database Schema Types
// These types define the structure for DynamoDB/PostgreSQL tables

// ==========================================
// CORE ENTITIES
// ==========================================

export interface Organization {
    id: string;
    name: string;
    slug: string;                          // URL-friendly name
    ownerId: string;                       // User ID of the owner
    plan: 'free' | 'starter' | 'pro' | 'enterprise';
    stripeCustomerId?: string;
    stripeSubscriptionId?: string;
    settings: OrganizationSettings;
    createdAt: Date;
    updatedAt: Date;
}

export interface OrganizationSettings {
    brandName: string;
    websiteUrl?: string;
    logoUrl?: string;
    primaryColor?: string;
    timezone: string;
    defaultLanguage: string;
    emailNotifications: boolean;
    weeklyReports: boolean;
    // New fields for autopilot personalization
    location?: string;              // Business location (e.g., "New York, USA")
    industry?: string;              // Industry type (e.g., "E-commerce", "SaaS")
    brandColor?: string;            // Brand color for email templates (hex)
    fromEmail?: string;             // Sender email address
    fromPhone?: string;             // Sender phone/SMS number
}

export interface User {
    id: string;
    email: string;
    name: string;
    passwordHash?: string;                 // For email/password auth
    authProvider: 'email' | 'google' | 'github' | 'cognito';
    authProviderId?: string;
    avatar?: string;
    role: 'owner' | 'admin' | 'editor' | 'viewer';
    organizationId: string;
    lastLoginAt?: Date;
    emailVerified: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export interface OrganizationMember {
    id: string;
    organizationId: string;
    userId: string;
    role: 'owner' | 'admin' | 'editor' | 'viewer';
    invitedBy: string;
    invitedAt: Date;
    acceptedAt?: Date;
    status: 'pending' | 'active' | 'suspended';
}

// ==========================================
// CAMPAIGN & CONTENT
// ==========================================

export interface Campaign {
    id: string;
    organizationId: string;
    name: string;
    description?: string;
    status: 'draft' | 'active' | 'paused' | 'completed';
    settings: CampaignSettings;
    metrics: CampaignMetrics;
    createdBy: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface CampaignSettings {
    websiteUrl: string;
    targetAudience: string;
    industry: string;
    keywords: string[];
    velocity: {
        month1: number;
        month2: number;
        month3: number;
    };
    contentTypes: {
        blog: boolean;
        youtube: boolean;
        instagram: boolean;
        facebook: boolean;
    };
    autoPublish: boolean;
    requireApproval: boolean;
    schedulingPreferences: {
        preferredDays: string[];           // ['monday', 'wednesday', 'friday']
        preferredTimes: string[];          // ['09:00', '14:00']
        timezone: string;
    };
}

export interface CampaignMetrics {
    totalContent: number;
    publishedContent: number;
    pendingContent: number;
    totalViews: number;
    totalEngagement: number;
    riskScore: number;
}

export interface ContentItem {
    id: string;
    organizationId: string;
    campaignId: string;
    title: string;
    content: string;
    type: 'blog' | 'youtube-short' | 'instagram-reel' | 'facebook-story';
    status: 'draft' | 'pending' | 'approved' | 'scheduled' | 'published' | 'rejected';
    topicPillarId?: string;
    metadata: ContentMetadata;
    performance?: ContentPerformance;
    scheduledFor?: Date;
    publishedAt?: Date;
    publishedUrl?: string;
    platforms: PublishedPlatform[];
    createdBy: string;
    approvedBy?: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface ContentMetadata {
    seoScore: number;
    wordCount: number;
    readingTime: number;
    keywords: string[];
    targetKeyword?: string;
    hashtags?: string[];
    topicPillar: string;
    aiModel?: string;
    generationPrompt?: string;
}

export interface ContentPerformance {
    views: number;
    engagement: number;
    shares: number;
    comments: number;
    dwellTime: number;
    bounceRate: number;
    conversions: number;
}

export interface PublishedPlatform {
    platform: 'wordpress' | 'youtube' | 'instagram' | 'facebook';
    postId: string;
    postUrl: string;
    publishedAt: Date;
    status: 'success' | 'failed' | 'pending';
    error?: string;
}

export interface TopicPillar {
    id: string;
    organizationId: string;
    campaignId: string;
    name: string;
    description?: string;
    keywords: string[];
    contentCount: number;
    status: 'active' | 'archived';
    createdAt: Date;
    updatedAt: Date;
}

// ==========================================
// PLATFORM CONNECTIONS
// ==========================================

export interface PlatformConnection {
    id: string;
    organizationId: string;
    platform: 'wordpress' | 'youtube' | 'instagram' | 'facebook' | 'twitter' | 'linkedin';
    name: string;                          // Display name
    status: 'connected' | 'disconnected' | 'error';
    credentials: EncryptedCredentials;
    metadata: PlatformMetadata;
    lastSyncAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}

export interface EncryptedCredentials {
    accessToken?: string;                  // Encrypted
    refreshToken?: string;                 // Encrypted
    apiKey?: string;                       // Encrypted
    apiSecret?: string;                    // Encrypted
    expiresAt?: Date;
    custom?: Record<string, string>;       // Platform-specific encrypted fields
}

export interface PlatformMetadata {
    accountId?: string;
    accountName?: string;
    accountUrl?: string;
    followersCount?: number;
    postsCount?: number;
}

// ==========================================
// BILLING & USAGE
// ==========================================

export interface Subscription {
    id: string;
    organizationId: string;
    stripeSubscriptionId: string;
    stripeCustomerId: string;
    plan: 'free' | 'starter' | 'pro' | 'enterprise';
    status: 'active' | 'past_due' | 'canceled' | 'trialing' | 'incomplete';
    currentPeriodStart: Date;
    currentPeriodEnd: Date;
    cancelAtPeriodEnd: boolean;
    trialEnd?: Date;
    createdAt: Date;
    updatedAt: Date;
}

export interface UsageRecord {
    id: string;
    organizationId: string;
    month: string;                         // Format: YYYY-MM
    contentGenerated: number;
    platformPosts: {
        wordpress: number;
        youtube: number;
        instagram: number;
        facebook: number;
    };
    apiCalls: number;
    storageUsedMB: number;
    createdAt: Date;
    updatedAt: Date;
}

export interface Invoice {
    id: string;
    organizationId: string;
    stripeInvoiceId: string;
    amount: number;
    currency: string;
    status: 'draft' | 'open' | 'paid' | 'void' | 'uncollectible';
    pdfUrl?: string;
    periodStart: Date;
    periodEnd: Date;
    paidAt?: Date;
    createdAt: Date;
}

// ==========================================
// AI AGENTS & AUTOMATION
// ==========================================

export interface AIAgent {
    id: string;
    organizationId: string;
    type: 'supervisor' | 'seo-worker' | 'social-worker' | 'risk-worker' | 'video-worker' | 'analytics-worker';
    name: string;
    status: 'idle' | 'working' | 'error' | 'disabled';
    lastActiveAt?: Date;
    tasksCompleted: number;
    currentTask?: string;
    config: AIAgentConfig;
    createdAt: Date;
    updatedAt: Date;
}

export interface AIAgentConfig {
    enabled: boolean;
    schedule?: string;                     // Cron expression
    maxConcurrentTasks: number;
    priority: 'low' | 'medium' | 'high';
    modelPreference?: string;              // AI model to use
    customInstructions?: string;
}

export interface RiskAlert {
    id: string;
    organizationId: string;
    campaignId: string;
    type: 'indexation' | 'velocity' | 'quality' | 'spam' | 'duplicate';
    severity: 'low' | 'medium' | 'high' | 'critical';
    title: string;
    description: string;
    recommendation: string;
    status: 'active' | 'acknowledged' | 'resolved' | 'dismissed';
    resolvedAt?: Date;
    resolvedBy?: string;
    createdAt: Date;
}

// ==========================================
// ACTIVITY & AUDIT
// ==========================================

export interface ActivityLog {
    id: string;
    organizationId: string;
    userId: string;
    action: string;                        // e.g., 'content.created', 'campaign.updated'
    entityType: string;                    // e.g., 'content', 'campaign', 'user'
    entityId: string;
    metadata?: Record<string, unknown>;
    ipAddress?: string;
    userAgent?: string;
    createdAt: Date;
}

// ==========================================
// API KEY MANAGEMENT
// ==========================================

export interface APIKey {
    id: string;
    organizationId: string;
    name: string;
    keyHash: string;                       // Hashed key (only hash stored)
    keyPrefix: string;                     // First 8 chars for identification
    permissions: string[];                 // e.g., ['content:read', 'content:write']
    lastUsedAt?: Date;
    expiresAt?: Date;
    createdBy: string;
    createdAt: Date;
}

// ==========================================
// DATABASE QUERY TYPES
// ==========================================

export interface PaginatedResult<T> {
    items: T[];
    total: number;
    page: number;
    pageSize: number;
    hasMore: boolean;
}

export interface QueryOptions {
    page?: number;
    pageSize?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    filters?: Record<string, unknown>;
}

// Table names for reference
export const TABLE_NAMES = {
    ORGANIZATIONS: 'organizations',
    USERS: 'users',
    ORGANIZATION_MEMBERS: 'organization_members',
    CAMPAIGNS: 'campaigns',
    CONTENT_ITEMS: 'content_items',
    TOPIC_PILLARS: 'topic_pillars',
    PLATFORM_CONNECTIONS: 'platform_connections',
    SUBSCRIPTIONS: 'subscriptions',
    USAGE_RECORDS: 'usage_records',
    INVOICES: 'invoices',
    AI_AGENTS: 'ai_agents',
    RISK_ALERTS: 'risk_alerts',
    ACTIVITY_LOGS: 'activity_logs',
    API_KEYS: 'api_keys',
} as const;
