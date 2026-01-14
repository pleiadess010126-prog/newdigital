/**
 * Social Engagement CRM Types
 * Track likes, followers, comments and convert to leads
 */

export type Platform = 'instagram' | 'facebook' | 'youtube' | 'linkedin' | 'tiktok' | 'twitter';

export type EngagementType = 'like' | 'comment' | 'follow' | 'share' | 'save' | 'view' | 'dm' | 'mention';

export type LeadStatus = 'cold' | 'warm' | 'hot' | 'customer' | 'churned';

export type LeadSource = 'organic' | 'paid_ad' | 'influencer' | 'referral' | 'unknown';

export interface SocialProfile {
    id: string;
    platform: Platform;
    username: string;
    displayName: string;
    profilePictureUrl?: string;
    bio?: string;
    followersCount?: number;
    followingCount?: number;
    postsCount?: number;
    isVerified?: boolean;
    isBusinessAccount?: boolean;
    website?: string;
    email?: string;
    externalUrl?: string;
}

export interface Engagement {
    id: string;
    leadId: string;
    type: EngagementType;
    platform: Platform;
    contentId?: string;          // Which post they engaged with
    contentTitle?: string;       // Title/caption of the content
    message?: string;            // Comment text or DM content
    sentiment?: 'positive' | 'neutral' | 'negative';
    timestamp: Date;
    metadata?: Record<string, unknown>;
}

export interface Lead {
    id: string;

    // Identity
    socialProfiles: SocialProfile[];
    primaryPlatform: Platform;

    // Contact Info (if available)
    email?: string;
    phone?: string;
    name?: string;

    // Lead Scoring
    status: LeadStatus;
    score: number;              // 0-100
    source: LeadSource;

    // Engagement Stats
    totalEngagements: number;
    engagementsByType: Record<EngagementType, number>;
    engagementsByPlatform: Record<Platform, number>;

    // Key Metrics
    firstEngagementAt: Date;
    lastEngagementAt: Date;
    isFollower: boolean;
    hasCommented: boolean;
    hasDMed: boolean;
    likesCount: number;
    commentsCount: number;
    sharesCount: number;

    // Interests (detected from engagement patterns)
    interests: string[];
    topEngagedContent: string[];

    // Outreach
    dmSent: boolean;
    dmSentAt?: Date;
    dmResponse?: boolean;
    dmResponseAt?: Date;
    lastOutreachAt?: Date;
    outreachCount: number;

    // Conversion
    convertedAt?: Date;
    customerValue?: number;

    // Tags & Notes
    tags: string[];
    notes: string[];

    // Timestamps
    createdAt: Date;
    updatedAt: Date;
}

export interface LeadActivity {
    id: string;
    leadId: string;
    type: 'engagement' | 'outreach_sent' | 'dm_received' | 'status_changed' | 'note_added' | 'converted';
    description: string;
    metadata?: Record<string, unknown>;
    timestamp: Date;
}

export interface OutreachTemplate {
    id: string;
    name: string;
    platform: Platform;
    type: 'welcome_follower' | 'engaged_user' | 'hot_lead' | 'follow_up' | 'custom';
    subject?: string;           // For email
    message: string;            // Supports {{name}}, {{username}}, {{content_title}} variables
    delay?: number;             // Delay in hours before sending
    isActive: boolean;
    sentCount: number;
    responseRate: number;
}

export interface AutomationRule {
    id: string;
    name: string;
    isActive: boolean;

    // Trigger Conditions
    trigger: {
        type: 'new_follower' | 'like_threshold' | 'comment_received' | 'engagement_score' | 'dm_received';
        platform?: Platform;
        threshold?: number;
        sentiment?: 'positive' | 'neutral' | 'negative';
    };

    // Actions
    actions: {
        type: 'send_dm' | 'add_tag' | 'change_status' | 'notify_team' | 'add_to_sequence';
        templateId?: string;
        value?: string;
    }[];

    // Stats
    triggeredCount: number;
    lastTriggeredAt?: Date;
}

export interface EngagementSequence {
    id: string;
    name: string;
    description: string;
    isActive: boolean;

    steps: {
        order: number;
        delayDays: number;
        templateId: string;
        condition?: {
            type: 'no_response' | 'responded' | 'engaged_again';
        };
    }[];

    // Stats
    leadsInSequence: number;
    completionRate: number;
    responseRate: number;
}

export interface SocialCRMStats {
    // Overview
    totalLeads: number;
    newLeadsToday: number;
    newLeadsThisWeek: number;

    // By Status
    leadsByStatus: Record<LeadStatus, number>;

    // By Platform
    leadsByPlatform: Record<Platform, number>;

    // Engagement
    totalEngagements: number;
    engagementsToday: number;
    avgEngagementsPerLead: number;

    // Conversion
    conversionRate: number;
    avgTimeToConversion: number; // in days
    totalCustomerValue: number;

    // Outreach
    dmsSentToday: number;
    dmResponseRate: number;
    avgResponseTime: number; // in hours

    // Top Performing
    topEngagedLeads: Lead[];
    hottestLeads: Lead[];
    recentConverted: Lead[];
}

export interface LeadFilter {
    status?: LeadStatus[];
    platforms?: Platform[];
    minScore?: number;
    maxScore?: number;
    isFollower?: boolean;
    hasDMed?: boolean;
    tags?: string[];
    dateRange?: {
        start: Date;
        end: Date;
    };
    searchQuery?: string;
}

export interface BulkAction {
    type: 'send_dm' | 'add_tag' | 'remove_tag' | 'change_status' | 'add_to_sequence' | 'export';
    leadIds: string[];
    value?: string;
    templateId?: string;
    sequenceId?: string;
}
