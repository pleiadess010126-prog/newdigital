// =============================================================================
// PRISMA DATABASE CLIENT
// =============================================================================
// Production-ready database client using Prisma ORM with PostgreSQL
// Implements the same interface as LocalStorageDatabase for seamless migration
// =============================================================================

import { prisma } from './prisma'; // Re-importing
import type {
    Organization,
    User,
    Campaign,
    ContentItem,
    ActivityLog,
    UsageRecord,
    PaginatedResult,
    QueryOptions,
    OrganizationSettings,
    CampaignSettings,
    CampaignMetrics,
    ContentMetadata,
    ContentPerformance,
    PublishedPlatform,
} from './schema';
import type { DatabaseClient } from './client';

// =============================================================================
// TYPE CONVERTERS
// =============================================================================
// Convert between Prisma models and our schema types

function convertPrismaOrganization(org: any): Organization {
    return {
        id: org.id,
        name: org.name,
        slug: org.slug,
        ownerId: org.ownerId,
        plan: org.plan,
        stripeCustomerId: org.stripeCustomerId || undefined,
        stripeSubscriptionId: org.stripeSubscriptionId || undefined,
        settings: {
            ...(typeof org.settings === 'object' && org.settings !== null ? org.settings : {}),
            brandName: org.brandName || org.name,
            websiteUrl: org.websiteUrl || undefined,
            logoUrl: org.logoUrl || undefined,
            primaryColor: org.primaryColor || undefined,
            timezone: org.timezone,
            defaultLanguage: org.defaultLanguage,
            emailNotifications: org.emailNotifications,
            weeklyReports: org.weeklyReports,
            location: org.location || undefined,
            industry: org.industry || undefined,
            fromEmail: org.fromEmail || undefined,
            fromPhone: org.fromPhone || undefined,
        },
        createdAt: org.createdAt,
        updatedAt: org.updatedAt,
    };
}

function convertPrismaUser(user: any): User {
    return {
        id: user.id,
        email: user.email,
        name: user.name,
        passwordHash: user.passwordHash || undefined,
        authProvider: user.authProvider,
        authProviderId: user.authProviderId || undefined,
        avatar: user.avatar || undefined,
        role: user.role,
        organizationId: user.organizationId || '',
        lastLoginAt: user.lastLoginAt || undefined,
        emailVerified: user.emailVerified,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
    };
}

function convertPrismaCampaign(campaign: any): Campaign {
    return {
        id: campaign.id,
        organizationId: campaign.organizationId,
        name: campaign.name,
        description: campaign.description || undefined,
        status: campaign.status,
        settings: {
            websiteUrl: campaign.websiteUrl || '',
            targetAudience: campaign.targetAudience || '',
            industry: campaign.industry || '',
            keywords: campaign.keywords || [],
            velocity: {
                month1: campaign.velocityMonth1,
                month2: campaign.velocityMonth2,
                month3: campaign.velocityMonth3,
            },
            contentTypes: {
                blog: campaign.blogEnabled,
                youtube: campaign.youtubeEnabled,
                instagram: campaign.instagramEnabled,
                facebook: campaign.facebookEnabled,
            },
            autoPublish: campaign.autoPublish,
            requireApproval: campaign.requireApproval,
            schedulingPreferences: {
                preferredDays: campaign.preferredDays || [],
                preferredTimes: campaign.preferredTimes || [],
                timezone: campaign.scheduleTimezone,
            },
        },
        metrics: {
            totalContent: campaign.totalContent,
            publishedContent: campaign.publishedContent,
            pendingContent: campaign.pendingContent,
            totalViews: campaign.totalViews,
            totalEngagement: campaign.totalEngagement,
            riskScore: campaign.riskScore,
        },
        createdBy: campaign.createdBy,
        createdAt: campaign.createdAt,
        updatedAt: campaign.updatedAt,
    };
}

function convertPrismaContent(content: any): ContentItem {
    const contentTypeMap: Record<string, ContentItem['type']> = {
        'blog': 'blog',
        'youtube_short': 'youtube-short',
        'instagram_reel': 'instagram-reel',
        'facebook_story': 'facebook-story',
    };

    const statusMap: Record<string, ContentItem['status']> = {
        'draft': 'draft',
        'pending': 'pending',
        'approved': 'approved',
        'scheduled': 'scheduled',
        'published': 'published',
        'rejected': 'rejected',
    };

    return {
        id: content.id,
        organizationId: content.organizationId,
        campaignId: content.campaignId,
        title: content.title,
        content: content.content,
        type: contentTypeMap[content.type] || 'blog',
        status: statusMap[content.status] || 'draft',
        topicPillarId: content.topicPillarId || undefined,
        metadata: {
            seoScore: content.seoScore,
            wordCount: content.wordCount,
            readingTime: content.readingTime,
            keywords: content.keywords || [],
            targetKeyword: content.targetKeyword || undefined,
            hashtags: content.hashtags || undefined,
            topicPillar: content.topicPillar?.name || '',
            aiModel: content.aiModel || undefined,
            generationPrompt: content.generationPrompt || undefined,
        },
        performance: {
            views: content.views,
            engagement: content.engagement,
            shares: content.shares,
            comments: content.comments,
            dwellTime: content.dwellTime,
            bounceRate: content.bounceRate,
            conversions: content.conversions,
        },
        scheduledFor: content.scheduledFor || undefined,
        publishedAt: content.publishedAt || undefined,
        publishedUrl: content.publishedUrl || undefined,
        platforms: content.publishedPlatforms?.map((p: any) => ({
            platform: p.platform,
            postId: p.postId || '',
            postUrl: p.postUrl || '',
            publishedAt: p.publishedAt,
            status: p.status,
            error: p.error || undefined,
        })) || [],
        createdBy: content.createdBy,
        approvedBy: content.approvedBy || undefined,
        createdAt: content.createdAt,
        updatedAt: content.updatedAt,
    };
}

function convertPrismaActivityLog(log: any): ActivityLog {
    return {
        id: log.id,
        organizationId: log.organizationId,
        userId: log.userId,
        action: log.action,
        entityType: log.entityType,
        entityId: log.entityId,
        metadata: log.metadata || undefined,
        ipAddress: log.ipAddress || undefined,
        userAgent: log.userAgent || undefined,
        createdAt: log.createdAt,
    };
}

function convertPrismaUsageRecord(record: any): UsageRecord {
    return {
        id: record.id,
        organizationId: record.organizationId,
        month: record.month,
        contentGenerated: record.contentGenerated,
        platformPosts: {
            wordpress: record.wordpressPosts,
            youtube: record.youtubePosts,
            instagram: record.instagramPosts,
            facebook: record.facebookPosts,
        },
        apiCalls: record.apiCalls,
        storageUsedMB: record.storageUsedMB,
        createdAt: record.createdAt,
        updatedAt: record.updatedAt,
    };
}

// =============================================================================
// PRISMA DATABASE CLIENT IMPLEMENTATION
// =============================================================================

export class PrismaDatabase implements DatabaseClient {
    // =========================================================================
    // ORGANIZATIONS
    // =========================================================================

    async createOrganization(
        org: Omit<Organization, 'id' | 'createdAt' | 'updatedAt'>
    ): Promise<Organization> {
        const created = await prisma.organization.create({
            data: {
                name: org.name,
                slug: org.slug,
                ownerId: org.ownerId,
                plan: org.plan as any,
                stripeCustomerId: org.stripeCustomerId,
                stripeSubscriptionId: org.stripeSubscriptionId,
                brandName: org.settings.brandName,
                websiteUrl: org.settings.websiteUrl,
                logoUrl: org.settings.logoUrl,
                primaryColor: org.settings.primaryColor,
                timezone: org.settings.timezone,
                defaultLanguage: org.settings.defaultLanguage,
                emailNotifications: org.settings.emailNotifications,
                weeklyReports: org.settings.weeklyReports,
                location: org.settings.location,
                industry: org.settings.industry,
                fromEmail: org.settings.fromEmail,
                fromPhone: org.settings.fromPhone,
            },
        });
        return convertPrismaOrganization(created);
    }

    async getOrganization(id: string): Promise<Organization | null> {
        const org = await prisma.organization.findUnique({
            where: { id },
        });
        return org ? convertPrismaOrganization(org) : null;
    }

    async updateOrganization(
        id: string,
        updates: Partial<Organization>
    ): Promise<Organization> {
        const data: any = {};

        if (updates.name) data.name = updates.name;
        if (updates.slug) data.slug = updates.slug;
        if (updates.plan) data.plan = updates.plan;
        if (updates.stripeCustomerId !== undefined) data.stripeCustomerId = updates.stripeCustomerId;
        if (updates.stripeSubscriptionId !== undefined) data.stripeSubscriptionId = updates.stripeSubscriptionId;

        if (updates.settings) {
            if (updates.settings.brandName) data.brandName = updates.settings.brandName;
            if (updates.settings.websiteUrl !== undefined) data.websiteUrl = updates.settings.websiteUrl;
            if (updates.settings.logoUrl !== undefined) data.logoUrl = updates.settings.logoUrl;
            if (updates.settings.primaryColor !== undefined) data.primaryColor = updates.settings.primaryColor;
            if (updates.settings.timezone) data.timezone = updates.settings.timezone;
            if (updates.settings.defaultLanguage) data.defaultLanguage = updates.settings.defaultLanguage;
            if (updates.settings.emailNotifications !== undefined) data.emailNotifications = updates.settings.emailNotifications;
            if (updates.settings.weeklyReports !== undefined) data.weeklyReports = updates.settings.weeklyReports;
            if (updates.settings.location !== undefined) data.location = updates.settings.location;
            if (updates.settings.industry !== undefined) data.industry = updates.settings.industry;
            if (updates.settings.fromEmail !== undefined) data.fromEmail = updates.settings.fromEmail;
            if (updates.settings.fromPhone !== undefined) data.fromPhone = updates.settings.fromPhone;
        }

        const updated = await prisma.organization.update({
            where: { id },
            data: {
                ...data,
                settings: updates.settings !== undefined ? updates.settings : undefined,
            },
        });
        return convertPrismaOrganization(updated);
    }

    async deleteOrganization(id: string): Promise<void> {
        await prisma.organization.delete({
            where: { id },
        });
    }

    // =========================================================================
    // USERS
    // =========================================================================

    async createUser(
        user: Omit<User, 'id' | 'createdAt' | 'updatedAt'>
    ): Promise<User> {
        const created = await prisma.user.create({
            data: {
                email: user.email,
                name: user.name,
                passwordHash: user.passwordHash,
                authProvider: user.authProvider as any,
                authProviderId: user.authProviderId,
                avatar: user.avatar,
                role: user.role as any,
                organizationId: user.organizationId || null,
                emailVerified: user.emailVerified,
            },
        });
        return convertPrismaUser(created);
    }

    async getUser(id: string): Promise<User | null> {
        const user = await prisma.user.findUnique({
            where: { id },
        });
        return user ? convertPrismaUser(user) : null;
    }

    async getUserByEmail(email: string): Promise<User | null> {
        const user = await prisma.user.findUnique({
            where: { email: email.toLowerCase() },
        });
        return user ? convertPrismaUser(user) : null;
    }

    async updateUser(id: string, updates: Partial<User>): Promise<User> {
        const data: any = {};

        if (updates.email) data.email = updates.email;
        if (updates.name) data.name = updates.name;
        if (updates.passwordHash !== undefined) data.passwordHash = updates.passwordHash;
        if (updates.avatar !== undefined) data.avatar = updates.avatar;
        if (updates.role) data.role = updates.role;
        if (updates.organizationId !== undefined) data.organizationId = updates.organizationId || null;
        if (updates.lastLoginAt !== undefined) data.lastLoginAt = updates.lastLoginAt;
        if (updates.emailVerified !== undefined) data.emailVerified = updates.emailVerified;

        const updated = await prisma.user.update({
            where: { id },
            data,
        });
        return convertPrismaUser(updated);
    }

    async deleteUser(id: string): Promise<void> {
        await prisma.user.delete({
            where: { id },
        });
    }

    async getUsersByOrganization(orgId: string): Promise<User[]> {
        const users = await prisma.user.findMany({
            where: { organizationId: orgId },
        });
        return users.map(convertPrismaUser);
    }

    // =========================================================================
    // CAMPAIGNS
    // =========================================================================

    async createCampaign(
        campaign: Omit<Campaign, 'id' | 'createdAt' | 'updatedAt'>
    ): Promise<Campaign> {
        const created = await prisma.campaign.create({
            data: {
                organizationId: campaign.organizationId,
                name: campaign.name,
                description: campaign.description,
                status: campaign.status as any,
                createdBy: campaign.createdBy,
                websiteUrl: campaign.settings.websiteUrl,
                targetAudience: campaign.settings.targetAudience,
                industry: campaign.settings.industry,
                keywords: campaign.settings.keywords,
                velocityMonth1: campaign.settings.velocity.month1,
                velocityMonth2: campaign.settings.velocity.month2,
                velocityMonth3: campaign.settings.velocity.month3,
                blogEnabled: campaign.settings.contentTypes.blog,
                youtubeEnabled: campaign.settings.contentTypes.youtube,
                instagramEnabled: campaign.settings.contentTypes.instagram,
                facebookEnabled: campaign.settings.contentTypes.facebook,
                autoPublish: campaign.settings.autoPublish,
                requireApproval: campaign.settings.requireApproval,
                preferredDays: campaign.settings.schedulingPreferences?.preferredDays || [],
                preferredTimes: campaign.settings.schedulingPreferences?.preferredTimes || [],
                scheduleTimezone: campaign.settings.schedulingPreferences?.timezone || 'UTC',
                totalContent: campaign.metrics.totalContent,
                publishedContent: campaign.metrics.publishedContent,
                pendingContent: campaign.metrics.pendingContent,
                totalViews: campaign.metrics.totalViews,
                totalEngagement: campaign.metrics.totalEngagement,
                riskScore: campaign.metrics.riskScore,
            },
        });
        return convertPrismaCampaign(created);
    }

    async getCampaign(id: string): Promise<Campaign | null> {
        const campaign = await prisma.campaign.findUnique({
            where: { id },
        });
        return campaign ? convertPrismaCampaign(campaign) : null;
    }

    async getCampaignsByOrganization(
        orgId: string,
        options?: QueryOptions
    ): Promise<PaginatedResult<Campaign>> {
        const page = options?.page || 1;
        const pageSize = options?.pageSize || 10;
        const skip = (page - 1) * pageSize;

        const [campaigns, total] = await Promise.all([
            prisma.campaign.findMany({
                where: { organizationId: orgId },
                skip,
                take: pageSize,
                orderBy: { createdAt: 'desc' },
            }),
            prisma.campaign.count({
                where: { organizationId: orgId },
            }),
        ]);

        return {
            items: campaigns.map(convertPrismaCampaign),
            total,
            page,
            pageSize,
            hasMore: skip + pageSize < total,
        };
    }

    async updateCampaign(
        id: string,
        updates: Partial<Campaign>
    ): Promise<Campaign> {
        const data: any = {};

        if (updates.name) data.name = updates.name;
        if (updates.description !== undefined) data.description = updates.description;
        if (updates.status) data.status = updates.status;

        if (updates.settings) {
            const s = updates.settings;
            if (s.websiteUrl !== undefined) data.websiteUrl = s.websiteUrl;
            if (s.targetAudience !== undefined) data.targetAudience = s.targetAudience;
            if (s.industry !== undefined) data.industry = s.industry;
            if (s.keywords) data.keywords = s.keywords;
            if (s.velocity) {
                data.velocityMonth1 = s.velocity.month1;
                data.velocityMonth2 = s.velocity.month2;
                data.velocityMonth3 = s.velocity.month3;
            }
            if (s.contentTypes) {
                data.blogEnabled = s.contentTypes.blog;
                data.youtubeEnabled = s.contentTypes.youtube;
                data.instagramEnabled = s.contentTypes.instagram;
                data.facebookEnabled = s.contentTypes.facebook;
            }
            if (s.autoPublish !== undefined) data.autoPublish = s.autoPublish;
            if (s.requireApproval !== undefined) data.requireApproval = s.requireApproval;
        }

        if (updates.metrics) {
            const m = updates.metrics;
            if (m.totalContent !== undefined) data.totalContent = m.totalContent;
            if (m.publishedContent !== undefined) data.publishedContent = m.publishedContent;
            if (m.pendingContent !== undefined) data.pendingContent = m.pendingContent;
            if (m.totalViews !== undefined) data.totalViews = m.totalViews;
            if (m.totalEngagement !== undefined) data.totalEngagement = m.totalEngagement;
            if (m.riskScore !== undefined) data.riskScore = m.riskScore;
        }

        const updated = await prisma.campaign.update({
            where: { id },
            data,
        });
        return convertPrismaCampaign(updated);
    }

    async deleteCampaign(id: string): Promise<void> {
        await prisma.campaign.delete({
            where: { id },
        });
    }

    // =========================================================================
    // CONTENT
    // =========================================================================

    async createContent(
        content: Omit<ContentItem, 'id' | 'createdAt' | 'updatedAt'>
    ): Promise<ContentItem> {
        const typeMap: Record<string, string> = {
            'blog': 'blog',
            'youtube-short': 'youtube_short',
            'instagram-reel': 'instagram_reel',
            'facebook-story': 'facebook_story',
        };

        const created = await prisma.contentItem.create({
            data: {
                organizationId: content.organizationId,
                campaignId: content.campaignId,
                title: content.title,
                content: content.content,
                type: typeMap[content.type] as any || 'blog',
                status: content.status as any,
                topicPillarId: content.topicPillarId,
                seoScore: content.metadata.seoScore,
                wordCount: content.metadata.wordCount,
                readingTime: content.metadata.readingTime,
                keywords: content.metadata.keywords,
                targetKeyword: content.metadata.targetKeyword,
                hashtags: content.metadata.hashtags || [],
                aiModel: content.metadata.aiModel,
                generationPrompt: content.metadata.generationPrompt,
                views: content.performance?.views || 0,
                engagement: content.performance?.engagement || 0,
                shares: content.performance?.shares || 0,
                comments: content.performance?.comments || 0,
                dwellTime: content.performance?.dwellTime || 0,
                bounceRate: content.performance?.bounceRate || 0,
                conversions: content.performance?.conversions || 0,
                scheduledFor: content.scheduledFor,
                publishedAt: content.publishedAt,
                publishedUrl: content.publishedUrl,
                createdBy: content.createdBy,
                approvedBy: content.approvedBy,
            },
            include: {
                publishedPlatforms: true,
                topicPillar: true,
            },
        });
        return convertPrismaContent(created);
    }

    async getContent(id: string): Promise<ContentItem | null> {
        const content = await prisma.contentItem.findUnique({
            where: { id },
            include: {
                publishedPlatforms: true,
                topicPillar: true,
            },
        });
        return content ? convertPrismaContent(content) : null;
    }

    async getContentByCampaign(
        campaignId: string,
        options?: QueryOptions
    ): Promise<PaginatedResult<ContentItem>> {
        const page = options?.page || 1;
        const pageSize = options?.pageSize || 10;
        const skip = (page - 1) * pageSize;

        const [contents, total] = await Promise.all([
            prisma.contentItem.findMany({
                where: { campaignId },
                skip,
                take: pageSize,
                orderBy: { createdAt: 'desc' },
                include: {
                    publishedPlatforms: true,
                    topicPillar: true,
                },
            }),
            prisma.contentItem.count({
                where: { campaignId },
            }),
        ]);

        return {
            items: contents.map(convertPrismaContent),
            total,
            page,
            pageSize,
            hasMore: skip + pageSize < total,
        };
    }

    async getContentByOrganization(
        orgId: string,
        options?: QueryOptions
    ): Promise<PaginatedResult<ContentItem>> {
        const page = options?.page || 1;
        const pageSize = options?.pageSize || 10;
        const skip = (page - 1) * pageSize;

        const [contents, total] = await Promise.all([
            prisma.contentItem.findMany({
                where: { organizationId: orgId },
                skip,
                take: pageSize,
                orderBy: { createdAt: 'desc' },
                include: {
                    publishedPlatforms: true,
                    topicPillar: true,
                },
            }),
            prisma.contentItem.count({
                where: { organizationId: orgId },
            }),
        ]);

        return {
            items: contents.map(convertPrismaContent),
            total,
            page,
            pageSize,
            hasMore: skip + pageSize < total,
        };
    }

    async updateContent(
        id: string,
        updates: Partial<ContentItem>
    ): Promise<ContentItem> {
        const data: any = {};

        if (updates.title) data.title = updates.title;
        if (updates.content) data.content = updates.content;
        if (updates.status) data.status = updates.status;
        if (updates.scheduledFor !== undefined) data.scheduledFor = updates.scheduledFor;
        if (updates.publishedAt !== undefined) data.publishedAt = updates.publishedAt;
        if (updates.publishedUrl !== undefined) data.publishedUrl = updates.publishedUrl;
        if (updates.approvedBy !== undefined) data.approvedBy = updates.approvedBy;

        if (updates.metadata) {
            const m = updates.metadata;
            if (m.seoScore !== undefined) data.seoScore = m.seoScore;
            if (m.wordCount !== undefined) data.wordCount = m.wordCount;
            if (m.readingTime !== undefined) data.readingTime = m.readingTime;
            if (m.keywords) data.keywords = m.keywords;
            if (m.targetKeyword !== undefined) data.targetKeyword = m.targetKeyword;
            if (m.hashtags) data.hashtags = m.hashtags;
        }

        if (updates.performance) {
            const p = updates.performance;
            if (p.views !== undefined) data.views = p.views;
            if (p.engagement !== undefined) data.engagement = p.engagement;
            if (p.shares !== undefined) data.shares = p.shares;
            if (p.comments !== undefined) data.comments = p.comments;
            if (p.dwellTime !== undefined) data.dwellTime = p.dwellTime;
            if (p.bounceRate !== undefined) data.bounceRate = p.bounceRate;
            if (p.conversions !== undefined) data.conversions = p.conversions;
        }

        const updated = await prisma.contentItem.update({
            where: { id },
            data,
            include: {
                publishedPlatforms: true,
                topicPillar: true,
            },
        });
        return convertPrismaContent(updated);
    }

    async deleteContent(id: string): Promise<void> {
        await prisma.contentItem.delete({
            where: { id },
        });
    }

    // =========================================================================
    // USAGE
    // =========================================================================

    async getUsage(orgId: string, month: string): Promise<UsageRecord | null> {
        const record = await prisma.usageRecord.findUnique({
            where: {
                organizationId_month: {
                    organizationId: orgId,
                    month,
                },
            },
        });
        return record ? convertPrismaUsageRecord(record) : null;
    }

    async incrementUsage(
        orgId: string,
        field: keyof Pick<UsageRecord, 'contentGenerated' | 'apiCalls'>
    ): Promise<void> {
        const month = new Date().toISOString().slice(0, 7);

        await prisma.usageRecord.upsert({
            where: {
                organizationId_month: {
                    organizationId: orgId,
                    month,
                },
            },
            create: {
                organizationId: orgId,
                month,
                contentGenerated: field === 'contentGenerated' ? 1 : 0,
                apiCalls: field === 'apiCalls' ? 1 : 0,
            },
            update: {
                [field]: {
                    increment: 1,
                },
            },
        });
    }

    // =========================================================================
    // ACTIVITY LOGS
    // =========================================================================

    async logActivity(
        log: Omit<ActivityLog, 'id' | 'createdAt'>
    ): Promise<ActivityLog> {
        const created = await prisma.activityLog.create({
            data: {
                organizationId: log.organizationId,
                userId: log.userId,
                action: log.action,
                entityType: log.entityType,
                entityId: log.entityId,
                metadata: log.metadata as any,
                ipAddress: log.ipAddress,
                userAgent: log.userAgent,
            },
        });
        return convertPrismaActivityLog(created);
    }

    async getActivityLogs(
        orgId: string,
        options?: QueryOptions
    ): Promise<PaginatedResult<ActivityLog>> {
        const page = options?.page || 1;
        const pageSize = options?.pageSize || 20;
        const skip = (page - 1) * pageSize;

        const [logs, total] = await Promise.all([
            prisma.activityLog.findMany({
                where: { organizationId: orgId },
                skip,
                take: pageSize,
                orderBy: { createdAt: 'desc' },
            }),
            prisma.activityLog.count({
                where: { organizationId: orgId },
            }),
        ]);

        return {
            items: logs.map(convertPrismaActivityLog),
            total,
            page,
            pageSize,
            hasMore: skip + pageSize < total,
        };
    }
}

// =============================================================================
// EXPORT SINGLETON INSTANCE
// =============================================================================

export const prismaDb = new PrismaDatabase();
