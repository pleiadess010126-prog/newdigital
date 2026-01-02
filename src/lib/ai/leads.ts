
/**
 * B2B Lead Intelligence & Social Selling Logic
 */

export interface LeadProspect {
    id: string;
    name: string;
    title: string;
    company: string;
    industry: string;
    platform: 'linkedin' | 'twitter' | 'instagram';
    engagementDepth: 'high' | 'medium' | 'low';
    intentScore: number;
    lastInteraction: string;
    suggestedMessage: string;
    avatarUrl?: string;
}

export const MOCK_PROSPECTS: LeadProspect[] = [
    {
        id: 'lead-1',
        name: 'Sarah Chen',
        title: 'VP of Marketing',
        company: 'GrowthScale AI',
        industry: 'SaaS',
        platform: 'linkedin',
        engagementDepth: 'high',
        intentScore: 92,
        lastInteraction: 'Liked and Commented on "Zero-Click SEO"',
        suggestedMessage: "Hi Sarah, saw your comment on my SEO post! Since GrowthScale is scaling, I thought you might find our internal AEO checklist useful. Would you like a copy?",
        avatarUrl: 'https://i.pravatar.cc/150?u=sarah'
    },
    {
        id: 'lead-2',
        name: 'Marcus Thorne',
        title: 'Founder & CEO',
        company: 'EcoStream',
        industry: 'Greentech',
        platform: 'twitter',
        engagementDepth: 'medium',
        intentScore: 78,
        lastInteraction: 'Retweeted "Sustainable Marketing Trends"',
        suggestedMessage: "Hey Marcus, love what EcoStream is doing for the planet. Noticed you shared our content on sustainable marketing—are you guys currently looking to automate your output?",
        avatarUrl: 'https://i.pravatar.cc/150?u=marcus'
    },
    {
        id: 'lead-3',
        name: 'Elena Rodriguez',
        title: 'Head of Content',
        company: 'FinTech Hub',
        industry: 'Financial Services',
        platform: 'linkedin',
        engagementDepth: 'high',
        intentScore: 85,
        lastInteraction: 'Shared "Short-Form Video Psychology" to her team',
        suggestedMessage: "Elena, great to connect. Noticed you shared the short-form video guide. I've been looking at FinTech Hub's LinkedIn—you guys are doing great work!",
        avatarUrl: 'https://i.pravatar.cc/150?u=elena'
    }
];

export async function fetchProspects() {
    // In production, this would use LinkedIn API + Scraping
    await new Promise(resolve => setTimeout(resolve, 1000));
    return MOCK_PROSPECTS;
}

export async function generatePersonalizedDM(prospectId: string) {
    const prospect = MOCK_PROSPECTS.find(p => p.id === prospectId);
    if (!prospect) return null;

    // Simulate LLM personalization
    return `Hey ${prospect.name}, really enjoyed seeing your recent engagement with our ${prospect.industry} content...`;
}
