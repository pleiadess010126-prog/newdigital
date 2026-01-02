
/**
 * Auto-Community Management Logic
 */

export interface CommunityComment {
    id: string;
    author: string;
    platform: 'instagram' | 'youtube' | 'facebook' | 'linkedin';
    content: string;
    status: 'pending' | 'replied' | 'flagged';
    aiDraft?: string;
    timeAgo: string;
    authorAvatar?: string;
}

export const MOCK_COMMENTS: CommunityComment[] = [
    {
        id: 'c-1',
        author: 'AI_enthusiast_99',
        platform: 'instagram',
        content: 'This is amazing! But how does it handle non-English content?',
        status: 'pending',
        aiDraft: "Thanks for asking! We support 20+ languages including German, Portuguese, and Arabic. The AI actually 'transcreates' the context, not just translates it!",
        timeAgo: '12m ago',
        authorAvatar: 'https://i.pravatar.cc/150?u=aie'
    },
    {
        id: 'c-2',
        author: 'TechLead_Bob',
        platform: 'youtube',
        content: 'I noticed some lag in the video sync around 0:45. Is this a known bug?',
        status: 'pending',
        aiDraft: "Hi Bob! Good catch. That minor sync oscillation is actually a result of our high-quality rendering queue. We're rolling out a fix in V2 next week!",
        timeAgo: '45m ago',
        authorAvatar: 'https://i.pravatar.cc/150?u=bob'
    },
    {
        id: 'c-3',
        author: 'MarketingQueen',
        platform: 'linkedin',
        content: 'Does this integrate with Salesforce CRM?',
        status: 'pending',
        aiDraft: "Hey! We currently integrate with HubSpot and Pipedrive, with Salesforce support coming in Q1 2026. Stay tuned!",
        timeAgo: '2h ago',
        authorAvatar: 'https://i.pravatar.cc/150?u=queen'
    }
];

export async function fetchComments() {
    await new Promise(resolve => setTimeout(resolve, 800));
    return MOCK_COMMENTS;
}

export async function postReply(commentId: string, reply: string) {
    console.log(`💬 Posting reply to ${commentId}: "${reply}"`);
    await new Promise(resolve => setTimeout(resolve, 1000));
    return true;
}
