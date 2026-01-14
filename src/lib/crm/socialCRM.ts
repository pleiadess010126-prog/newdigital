/**
 * Social Engagement CRM Service
 * Tracks likes, followers, comments and manages lead nurturing
 */

import type {
    Lead,
    Engagement,
    SocialProfile,
    Platform,
    EngagementType,
    LeadStatus,
    LeadFilter,
    OutreachTemplate,
    AutomationRule,
    EngagementSequence,
    SocialCRMStats,
    BulkAction,
    LeadActivity
} from '@/types/socialCRM';

// ============================================================================
// MOCK DATA - Replace with real API calls in production
// ============================================================================

const MOCK_LEADS: Lead[] = [
    {
        id: 'lead-1',
        socialProfiles: [{
            id: 'ig-12345',
            platform: 'instagram',
            username: 'sarah_marketing',
            displayName: 'Sarah Chen',
            profilePictureUrl: 'https://i.pravatar.cc/150?u=sarah',
            bio: 'Digital Marketing Manager @GrowthScale | SaaS Enthusiast',
            followersCount: 12500,
            isVerified: false,
            isBusinessAccount: true
        }],
        primaryPlatform: 'instagram',
        email: 'sarah@growthscale.io',
        name: 'Sarah Chen',
        status: 'hot',
        score: 87,
        source: 'organic',
        totalEngagements: 15,
        engagementsByType: { like: 8, comment: 4, follow: 1, share: 2, save: 0, view: 0, dm: 0, mention: 0 },
        engagementsByPlatform: { instagram: 12, facebook: 3, youtube: 0, linkedin: 0, tiktok: 0, twitter: 0 },
        firstEngagementAt: new Date('2025-12-01'),
        lastEngagementAt: new Date('2026-01-13'),
        isFollower: true,
        hasCommented: true,
        hasDMed: false,
        likesCount: 8,
        commentsCount: 4,
        sharesCount: 2,
        interests: ['AI Marketing', 'SEO', 'Content Strategy'],
        topEngagedContent: ['Zero-Click SEO Guide', 'AI Content Tips', 'Marketing Automation 101'],
        dmSent: true,
        dmSentAt: new Date('2026-01-10'),
        dmResponse: true,
        dmResponseAt: new Date('2026-01-11'),
        lastOutreachAt: new Date('2026-01-10'),
        outreachCount: 2,
        tags: ['high-value', 'decision-maker', 'saas'],
        notes: ['Interested in Enterprise plan', 'Schedule demo next week'],
        createdAt: new Date('2025-12-01'),
        updatedAt: new Date('2026-01-13')
    },
    {
        id: 'lead-2',
        socialProfiles: [{
            id: 'ig-67890',
            platform: 'instagram',
            username: 'mike_founder',
            displayName: 'Mike Rodriguez',
            profilePictureUrl: 'https://i.pravatar.cc/150?u=mike',
            bio: 'Founder @TechStartup | Building the future',
            followersCount: 8900,
            isVerified: false,
            isBusinessAccount: true
        }],
        primaryPlatform: 'instagram',
        name: 'Mike Rodriguez',
        status: 'warm',
        score: 62,
        source: 'organic',
        totalEngagements: 7,
        engagementsByType: { like: 5, comment: 1, follow: 1, share: 0, save: 0, view: 0, dm: 0, mention: 0 },
        engagementsByPlatform: { instagram: 7, facebook: 0, youtube: 0, linkedin: 0, tiktok: 0, twitter: 0 },
        firstEngagementAt: new Date('2026-01-05'),
        lastEngagementAt: new Date('2026-01-12'),
        isFollower: true,
        hasCommented: true,
        hasDMed: false,
        likesCount: 5,
        commentsCount: 1,
        sharesCount: 0,
        interests: ['Startup Growth', 'Marketing'],
        topEngagedContent: ['AI Content Tips', 'Startup Marketing Guide'],
        dmSent: false,
        outreachCount: 0,
        tags: ['founder', 'startup'],
        notes: [],
        createdAt: new Date('2026-01-05'),
        updatedAt: new Date('2026-01-12')
    },
    {
        id: 'lead-3',
        socialProfiles: [{
            id: 'fb-11111',
            platform: 'facebook',
            username: 'jessica.williams',
            displayName: 'Jessica Williams',
            profilePictureUrl: 'https://i.pravatar.cc/150?u=jessica',
            followersCount: 2300
        }],
        primaryPlatform: 'facebook',
        name: 'Jessica Williams',
        status: 'cold',
        score: 28,
        source: 'organic',
        totalEngagements: 2,
        engagementsByType: { like: 2, comment: 0, follow: 0, share: 0, save: 0, view: 0, dm: 0, mention: 0 },
        engagementsByPlatform: { instagram: 0, facebook: 2, youtube: 0, linkedin: 0, tiktok: 0, twitter: 0 },
        firstEngagementAt: new Date('2026-01-10'),
        lastEngagementAt: new Date('2026-01-11'),
        isFollower: false,
        hasCommented: false,
        hasDMed: false,
        likesCount: 2,
        commentsCount: 0,
        sharesCount: 0,
        interests: ['Marketing'],
        topEngagedContent: ['AI Content Tips'],
        dmSent: false,
        outreachCount: 0,
        tags: [],
        notes: [],
        createdAt: new Date('2026-01-10'),
        updatedAt: new Date('2026-01-11')
    },
    {
        id: 'lead-4',
        socialProfiles: [{
            id: 'li-22222',
            platform: 'linkedin',
            username: 'david-thompson',
            displayName: 'David Thompson',
            profilePictureUrl: 'https://i.pravatar.cc/150?u=david',
            bio: 'CMO at Fortune 500 | Marketing Leader',
            followersCount: 45000,
            isVerified: true,
            isBusinessAccount: false
        }],
        primaryPlatform: 'linkedin',
        email: 'david.thompson@enterprise.com',
        name: 'David Thompson',
        status: 'hot',
        score: 95,
        source: 'organic',
        totalEngagements: 22,
        engagementsByType: { like: 10, comment: 8, follow: 1, share: 3, save: 0, view: 0, dm: 0, mention: 0 },
        engagementsByPlatform: { instagram: 0, facebook: 0, youtube: 0, linkedin: 22, tiktok: 0, twitter: 0 },
        firstEngagementAt: new Date('2025-11-15'),
        lastEngagementAt: new Date('2026-01-13'),
        isFollower: true,
        hasCommented: true,
        hasDMed: true,
        likesCount: 10,
        commentsCount: 8,
        sharesCount: 3,
        interests: ['Enterprise Marketing', 'AI', 'Marketing Automation', 'Digital Transformation'],
        topEngagedContent: ['Enterprise AI Guide', 'CMO Playbook', 'Marketing ROI Framework'],
        dmSent: true,
        dmSentAt: new Date('2026-01-05'),
        dmResponse: true,
        dmResponseAt: new Date('2026-01-05'),
        lastOutreachAt: new Date('2026-01-12'),
        outreachCount: 4,
        convertedAt: undefined,
        customerValue: undefined,
        tags: ['enterprise', 'decision-maker', 'cmo', 'priority'],
        notes: ['Very interested in Enterprise plan', 'Wants custom demo', 'Budget approved Q1'],
        createdAt: new Date('2025-11-15'),
        updatedAt: new Date('2026-01-13')
    },
    {
        id: 'lead-5',
        socialProfiles: [{
            id: 'ig-33333',
            platform: 'instagram',
            username: 'emily_creator',
            displayName: 'Emily Parker',
            profilePictureUrl: 'https://i.pravatar.cc/150?u=emily',
            bio: 'Content Creator | 500K+ followers across platforms',
            followersCount: 125000,
            isVerified: true,
            isBusinessAccount: true
        }],
        primaryPlatform: 'instagram',
        name: 'Emily Parker',
        status: 'customer',
        score: 100,
        source: 'influencer',
        totalEngagements: 35,
        engagementsByType: { like: 15, comment: 12, follow: 1, share: 5, save: 2, view: 0, dm: 0, mention: 0 },
        engagementsByPlatform: { instagram: 30, facebook: 3, youtube: 2, linkedin: 0, tiktok: 0, twitter: 0 },
        firstEngagementAt: new Date('2025-10-01'),
        lastEngagementAt: new Date('2026-01-13'),
        isFollower: true,
        hasCommented: true,
        hasDMed: true,
        likesCount: 15,
        commentsCount: 12,
        sharesCount: 5,
        interests: ['Content Creation', 'Influencer Marketing', 'AI Tools'],
        topEngagedContent: ['AI Video Generator', 'Content Repurposing', 'Influencer Toolkit'],
        dmSent: true,
        dmSentAt: new Date('2025-10-15'),
        dmResponse: true,
        dmResponseAt: new Date('2025-10-15'),
        lastOutreachAt: new Date('2026-01-01'),
        outreachCount: 8,
        convertedAt: new Date('2025-11-01'),
        customerValue: 2868,
        tags: ['influencer', 'pro-plan', 'ambassador'],
        notes: ['Pro plan customer', 'Brand ambassador candidate', 'Refers 3-5 customers monthly'],
        createdAt: new Date('2025-10-01'),
        updatedAt: new Date('2026-01-13')
    }
];

const MOCK_ENGAGEMENTS: Engagement[] = [
    {
        id: 'eng-1',
        leadId: 'lead-1',
        type: 'like',
        platform: 'instagram',
        contentId: 'post-123',
        contentTitle: 'Zero-Click SEO: The Ultimate Guide',
        timestamp: new Date('2026-01-13T10:30:00')
    },
    {
        id: 'eng-2',
        leadId: 'lead-1',
        type: 'comment',
        platform: 'instagram',
        contentId: 'post-123',
        contentTitle: 'Zero-Click SEO: The Ultimate Guide',
        message: 'This is exactly what I needed! Great insights 🔥',
        sentiment: 'positive',
        timestamp: new Date('2026-01-13T10:32:00')
    },
    {
        id: 'eng-3',
        leadId: 'lead-4',
        type: 'share',
        platform: 'linkedin',
        contentId: 'post-456',
        contentTitle: 'Enterprise AI Marketing Framework',
        timestamp: new Date('2026-01-13T09:15:00')
    },
    {
        id: 'eng-4',
        leadId: 'lead-2',
        type: 'follow',
        platform: 'instagram',
        timestamp: new Date('2026-01-12T14:20:00')
    }
];

const MOCK_TEMPLATES: OutreachTemplate[] = [
    {
        id: 'tmpl-1',
        name: 'Welcome New Follower',
        platform: 'instagram',
        type: 'welcome_follower',
        message: `Hey {{name}}! 👋 Thanks for following! I noticed you're into {{interest}}. 

I've got a free resource that might help you - want me to send it over?`,
        isActive: true,
        sentCount: 245,
        responseRate: 34.5
    },
    {
        id: 'tmpl-2',
        name: 'Engaged User DM',
        platform: 'instagram',
        type: 'engaged_user',
        message: `Hey {{name}}! I've noticed you've been engaging with my content about {{interest}} lately. 

Really appreciate the support! Have you tried any of these strategies yet?`,
        delay: 24,
        isActive: true,
        sentCount: 156,
        responseRate: 42.3
    },
    {
        id: 'tmpl-3',
        name: 'Hot Lead Follow-up',
        platform: 'instagram',
        type: 'hot_lead',
        message: `Hey {{name}}! Just wanted to check in - I saw your comment on "{{content_title}}" and thought you might be interested in our full solution.

Would you like to see a quick demo?`,
        isActive: true,
        sentCount: 89,
        responseRate: 58.4
    }
];

const MOCK_AUTOMATION_RULES: AutomationRule[] = [
    {
        id: 'rule-1',
        name: 'Auto-welcome new followers',
        isActive: true,
        trigger: {
            type: 'new_follower',
            platform: 'instagram'
        },
        actions: [
            { type: 'send_dm', templateId: 'tmpl-1' },
            { type: 'add_tag', value: 'new-follower' }
        ],
        triggeredCount: 342,
        lastTriggeredAt: new Date('2026-01-13T10:45:00')
    },
    {
        id: 'rule-2',
        name: 'Upgrade to warm after 3 likes',
        isActive: true,
        trigger: {
            type: 'like_threshold',
            threshold: 3
        },
        actions: [
            { type: 'change_status', value: 'warm' },
            { type: 'notify_team' }
        ],
        triggeredCount: 186,
        lastTriggeredAt: new Date('2026-01-13T08:20:00')
    },
    {
        id: 'rule-3',
        name: 'Hot lead on positive comment',
        isActive: true,
        trigger: {
            type: 'comment_received',
            sentiment: 'positive'
        },
        actions: [
            { type: 'change_status', value: 'hot' },
            { type: 'send_dm', templateId: 'tmpl-3' },
            { type: 'notify_team' }
        ],
        triggeredCount: 78,
        lastTriggeredAt: new Date('2026-01-13T10:32:00')
    }
];

// ============================================================================
// LEAD SCORING ENGINE
// ============================================================================

export function calculateLeadScore(lead: Lead): number {
    let score = 0;

    // Follow = +15 points
    if (lead.isFollower) score += 15;

    // Likes = +3 points each (max 30)
    score += Math.min(lead.likesCount * 3, 30);

    // Comments = +8 points each (max 40)
    score += Math.min(lead.commentsCount * 8, 40);

    // Shares = +10 points each (max 30)
    score += Math.min(lead.sharesCount * 10, 30);

    // DM sent/received = +15 points
    if (lead.hasDMed) score += 15;
    if (lead.dmResponse) score += 10;

    // Recency bonus (engaged in last 24h = +10, last 7d = +5)
    const hoursSinceLastEngagement = (Date.now() - lead.lastEngagementAt.getTime()) / (1000 * 60 * 60);
    if (hoursSinceLastEngagement < 24) score += 10;
    else if (hoursSinceLastEngagement < 168) score += 5;

    // Cap at 100
    return Math.min(score, 100);
}

export function determineLeadStatus(lead: Lead): LeadStatus {
    const score = lead.score;

    if (lead.convertedAt) return 'customer';
    if (score >= 80) return 'hot';
    if (score >= 50) return 'warm';
    return 'cold';
}

// ============================================================================
// CRM SERVICE CLASS
// ============================================================================

export class SocialCRMService {
    private leads: Lead[] = MOCK_LEADS;
    private engagements: Engagement[] = MOCK_ENGAGEMENTS;
    private templates: OutreachTemplate[] = MOCK_TEMPLATES;
    private automationRules: AutomationRule[] = MOCK_AUTOMATION_RULES;

    // ========== LEADS ==========

    async getLeads(filter?: LeadFilter): Promise<Lead[]> {
        await this.simulateDelay();

        let filtered = [...this.leads];

        if (filter) {
            if (filter.status?.length) {
                filtered = filtered.filter(l => filter.status!.includes(l.status));
            }
            if (filter.platforms?.length) {
                filtered = filtered.filter(l => filter.platforms!.includes(l.primaryPlatform));
            }
            if (filter.minScore !== undefined) {
                filtered = filtered.filter(l => l.score >= filter.minScore!);
            }
            if (filter.maxScore !== undefined) {
                filtered = filtered.filter(l => l.score <= filter.maxScore!);
            }
            if (filter.isFollower !== undefined) {
                filtered = filtered.filter(l => l.isFollower === filter.isFollower);
            }
            if (filter.tags?.length) {
                filtered = filtered.filter(l => filter.tags!.some(t => l.tags.includes(t)));
            }
            if (filter.searchQuery) {
                const q = filter.searchQuery.toLowerCase();
                filtered = filtered.filter(l =>
                    l.name?.toLowerCase().includes(q) ||
                    l.socialProfiles.some(p => p.username.toLowerCase().includes(q))
                );
            }
        }

        return filtered.sort((a, b) => b.score - a.score);
    }

    async getLead(id: string): Promise<Lead | null> {
        await this.simulateDelay();
        return this.leads.find(l => l.id === id) || null;
    }

    async getLeadByUsername(platform: Platform, username: string): Promise<Lead | null> {
        await this.simulateDelay();
        return this.leads.find(l =>
            l.socialProfiles.some(p => p.platform === platform && p.username === username)
        ) || null;
    }

    async createLead(profile: SocialProfile): Promise<Lead> {
        const newLead: Lead = {
            id: `lead-${Date.now()}`,
            socialProfiles: [profile],
            primaryPlatform: profile.platform,
            name: profile.displayName,
            status: 'cold',
            score: 0,
            source: 'organic',
            totalEngagements: 0,
            engagementsByType: { like: 0, comment: 0, follow: 0, share: 0, save: 0, view: 0, dm: 0, mention: 0 },
            engagementsByPlatform: { instagram: 0, facebook: 0, youtube: 0, linkedin: 0, tiktok: 0, twitter: 0 },
            firstEngagementAt: new Date(),
            lastEngagementAt: new Date(),
            isFollower: false,
            hasCommented: false,
            hasDMed: false,
            likesCount: 0,
            commentsCount: 0,
            sharesCount: 0,
            interests: [],
            topEngagedContent: [],
            dmSent: false,
            outreachCount: 0,
            tags: [],
            notes: [],
            createdAt: new Date(),
            updatedAt: new Date()
        };

        this.leads.push(newLead);
        return newLead;
    }

    async updateLead(id: string, updates: Partial<Lead>): Promise<Lead | null> {
        const index = this.leads.findIndex(l => l.id === id);
        if (index === -1) return null;

        this.leads[index] = { ...this.leads[index], ...updates, updatedAt: new Date() };
        return this.leads[index];
    }

    async addTag(leadId: string, tag: string): Promise<void> {
        const lead = this.leads.find(l => l.id === leadId);
        if (lead && !lead.tags.includes(tag)) {
            lead.tags.push(tag);
            lead.updatedAt = new Date();
        }
    }

    async addNote(leadId: string, note: string): Promise<void> {
        const lead = this.leads.find(l => l.id === leadId);
        if (lead) {
            lead.notes.push(note);
            lead.updatedAt = new Date();
        }
    }

    // ========== ENGAGEMENTS ==========

    async trackEngagement(
        platform: Platform,
        type: EngagementType,
        profile: SocialProfile,
        contentId?: string,
        contentTitle?: string,
        message?: string
    ): Promise<{ lead: Lead; engagement: Engagement }> {
        // Find or create lead
        let lead = await this.getLeadByUsername(platform, profile.username);

        if (!lead) {
            lead = await this.createLead(profile);
        }

        // Create engagement
        const engagement: Engagement = {
            id: `eng-${Date.now()}`,
            leadId: lead.id,
            type,
            platform,
            contentId,
            contentTitle,
            message,
            sentiment: message ? this.analyzeSentiment(message) : undefined,
            timestamp: new Date()
        };

        this.engagements.push(engagement);

        // Update lead stats
        lead.totalEngagements++;
        lead.engagementsByType[type]++;
        lead.engagementsByPlatform[platform]++;
        lead.lastEngagementAt = new Date();

        if (type === 'like') lead.likesCount++;
        if (type === 'comment') { lead.commentsCount++; lead.hasCommented = true; }
        if (type === 'share') lead.sharesCount++;
        if (type === 'follow') lead.isFollower = true;
        if (type === 'dm') lead.hasDMed = true;

        // Add content to top engaged
        if (contentTitle && !lead.topEngagedContent.includes(contentTitle)) {
            lead.topEngagedContent.unshift(contentTitle);
            lead.topEngagedContent = lead.topEngagedContent.slice(0, 5);
        }

        // Recalculate score and status
        lead.score = calculateLeadScore(lead);
        lead.status = determineLeadStatus(lead);
        lead.updatedAt = new Date();

        // Check automation rules
        await this.checkAutomationRules(lead, engagement);

        return { lead, engagement };
    }

    async getLeadEngagements(leadId: string): Promise<Engagement[]> {
        await this.simulateDelay();
        return this.engagements
            .filter(e => e.leadId === leadId)
            .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    }

    async getRecentEngagements(limit: number = 20): Promise<Engagement[]> {
        await this.simulateDelay();
        return this.engagements
            .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
            .slice(0, limit);
    }

    // ========== OUTREACH ==========

    async sendDM(leadId: string, templateId: string): Promise<{ success: boolean; error?: string }> {
        await this.simulateDelay();

        const lead = this.leads.find(l => l.id === leadId);
        const template = this.templates.find(t => t.id === templateId);

        if (!lead || !template) {
            return { success: false, error: 'Lead or template not found' };
        }

        // Personalize message
        let message = template.message;
        message = message.replace(/\{\{name\}\}/g, lead.name || lead.socialProfiles[0].username);
        message = message.replace(/\{\{username\}\}/g, lead.socialProfiles[0].username);
        message = message.replace(/\{\{interest\}\}/g, lead.interests[0] || 'marketing');
        message = message.replace(/\{\{content_title\}\}/g, lead.topEngagedContent[0] || 'our content');

        console.log(`📩 Sending DM to ${lead.name}: "${message.substring(0, 50)}..."`);

        // Update lead
        lead.dmSent = true;
        lead.dmSentAt = new Date();
        lead.lastOutreachAt = new Date();
        lead.outreachCount++;
        lead.updatedAt = new Date();

        // Update template stats
        template.sentCount++;

        return { success: true };
    }

    async getTemplates(): Promise<OutreachTemplate[]> {
        await this.simulateDelay();
        return this.templates;
    }

    // ========== AUTOMATION ==========

    async getAutomationRules(): Promise<AutomationRule[]> {
        await this.simulateDelay();
        return this.automationRules;
    }

    async checkAutomationRules(lead: Lead, engagement: Engagement): Promise<void> {
        for (const rule of this.automationRules.filter(r => r.isActive)) {
            let shouldTrigger = false;

            switch (rule.trigger.type) {
                case 'new_follower':
                    shouldTrigger = engagement.type === 'follow' &&
                        (!rule.trigger.platform || engagement.platform === rule.trigger.platform);
                    break;
                case 'like_threshold':
                    shouldTrigger = lead.likesCount === rule.trigger.threshold;
                    break;
                case 'comment_received':
                    shouldTrigger = engagement.type === 'comment' &&
                        (!rule.trigger.sentiment || engagement.sentiment === rule.trigger.sentiment);
                    break;
                case 'engagement_score':
                    shouldTrigger = lead.score >= (rule.trigger.threshold || 0);
                    break;
            }

            if (shouldTrigger) {
                console.log(`🤖 Automation triggered: ${rule.name}`);
                rule.triggeredCount++;
                rule.lastTriggeredAt = new Date();

                for (const action of rule.actions) {
                    await this.executeAction(lead, action);
                }
            }
        }
    }

    private async executeAction(lead: Lead, action: AutomationRule['actions'][0]): Promise<void> {
        switch (action.type) {
            case 'send_dm':
                if (action.templateId) {
                    await this.sendDM(lead.id, action.templateId);
                }
                break;
            case 'add_tag':
                if (action.value) {
                    await this.addTag(lead.id, action.value);
                }
                break;
            case 'change_status':
                if (action.value) {
                    lead.status = action.value as LeadStatus;
                }
                break;
            case 'notify_team':
                console.log(`🔔 Team notification: Lead ${lead.name} triggered automation`);
                break;
        }
    }

    // ========== STATS ==========

    async getStats(): Promise<SocialCRMStats> {
        await this.simulateDelay();

        const now = new Date();
        const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const weekStart = new Date(todayStart.getTime() - 7 * 24 * 60 * 60 * 1000);

        const leadsByStatus: Record<LeadStatus, number> = {
            cold: 0, warm: 0, hot: 0, customer: 0, churned: 0
        };

        const leadsByPlatform: Record<Platform, number> = {
            instagram: 0, facebook: 0, youtube: 0, linkedin: 0, tiktok: 0, twitter: 0
        };

        let totalEngagements = 0;
        let engagementsToday = 0;
        let customers = 0;
        let totalCustomerValue = 0;

        for (const lead of this.leads) {
            leadsByStatus[lead.status]++;
            leadsByPlatform[lead.primaryPlatform]++;
            totalEngagements += lead.totalEngagements;
            if (lead.status === 'customer') {
                customers++;
                totalCustomerValue += lead.customerValue || 0;
            }
        }

        const newLeadsToday = this.leads.filter(l => l.createdAt >= todayStart).length;
        const newLeadsThisWeek = this.leads.filter(l => l.createdAt >= weekStart).length;

        for (const eng of this.engagements) {
            if (eng.timestamp >= todayStart) engagementsToday++;
        }

        return {
            totalLeads: this.leads.length,
            newLeadsToday,
            newLeadsThisWeek,
            leadsByStatus,
            leadsByPlatform,
            totalEngagements,
            engagementsToday,
            avgEngagementsPerLead: totalEngagements / this.leads.length,
            conversionRate: (customers / this.leads.length) * 100,
            avgTimeToConversion: 14, // Mock
            totalCustomerValue,
            dmsSentToday: 12, // Mock
            dmResponseRate: 38.5, // Mock
            avgResponseTime: 4.2, // Mock
            topEngagedLeads: this.leads.slice(0, 3),
            hottestLeads: this.leads.filter(l => l.status === 'hot').slice(0, 3),
            recentConverted: this.leads.filter(l => l.status === 'customer').slice(0, 3)
        };
    }

    // ========== BULK ACTIONS ==========

    async executeBulkAction(action: BulkAction): Promise<{ success: number; failed: number }> {
        let success = 0;
        let failed = 0;

        for (const leadId of action.leadIds) {
            try {
                switch (action.type) {
                    case 'send_dm':
                        if (action.templateId) {
                            await this.sendDM(leadId, action.templateId);
                        }
                        break;
                    case 'add_tag':
                        if (action.value) {
                            await this.addTag(leadId, action.value);
                        }
                        break;
                    case 'change_status':
                        if (action.value) {
                            await this.updateLead(leadId, { status: action.value as LeadStatus });
                        }
                        break;
                }
                success++;
            } catch {
                failed++;
            }
        }

        return { success, failed };
    }

    // ========== HELPERS ==========

    private analyzeSentiment(text: string): 'positive' | 'neutral' | 'negative' {
        const positiveWords = ['love', 'great', 'amazing', 'awesome', 'thanks', 'helpful', 'excellent', '🔥', '❤️', '👏', '💯'];
        const negativeWords = ['hate', 'bad', 'terrible', 'awful', 'spam', 'scam', 'worst', '😡', '👎'];

        const lower = text.toLowerCase();
        const positiveCount = positiveWords.filter(w => lower.includes(w)).length;
        const negativeCount = negativeWords.filter(w => lower.includes(w)).length;

        if (positiveCount > negativeCount) return 'positive';
        if (negativeCount > positiveCount) return 'negative';
        return 'neutral';
    }

    private async simulateDelay(ms: number = 300): Promise<void> {
        await new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Export singleton instance
export const socialCRM = new SocialCRMService();

// Export types needed by components
export type { Lead, Engagement, SocialProfile, Platform, EngagementType, LeadStatus, LeadFilter, OutreachTemplate, AutomationRule, SocialCRMStats };
