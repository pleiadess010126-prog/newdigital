
/**
 * Real-time Trend Monitoring Service
 * Mocks trends for demonstration, can be connected to Google Trends or Twitter API
 */

export interface TrendTopic {
    id: string;
    name: string;
    volume: string;
    change: string;
    platform: 'google' | 'twitter' | 'tiktok' | 'linkedin';
    description: string;
    relatedKeywords: string[];
}

export interface TrendBridge {
    trendTopic: string;
    pillarName: string;
    angle: string;
    suggestedHook: string;
    suggestedFormat: 'reel' | 'short' | 'post';
    potentialROI: string;
}

const MOCK_TRENDS: TrendTopic[] = [
    {
        id: 'trend-1',
        name: 'AI Agent Swarms',
        volume: '450K',
        change: '+125%',
        platform: 'twitter',
        description: 'New research papers on multi-agent collaboration systems are going viral.',
        relatedKeywords: ['Autonomous Agents', 'AutoGen', 'CrewAI', 'AI Swarms'],
    },
    {
        id: 'trend-2',
        name: 'Sustainable Marketing',
        volume: '1.2M',
        change: '+45%',
        platform: 'linkedin',
        description: 'B2B companies are increasingly focusing on transparent, eco-friendly marketing strategies.',
        relatedKeywords: ['ESG', 'Greentech', 'Impact Marketing'],
    },
    {
        id: 'trend-3',
        name: 'Zero-Click SEO',
        volume: '280K',
        change: '+89%',
        platform: 'google',
        description: 'Google Answer Boxes and AI Overviews are changing search patterns.',
        relatedKeywords: ['AEO', 'Answer Engine Optimization', 'Direct Answers'],
    },
    {
        id: 'trend-4',
        name: 'Short-Form Video Psychology',
        volume: '3.5M',
        change: '+210%',
        platform: 'tiktok',
        description: 'Analysis of dopamine loops in vertical video content creation.',
        relatedKeywords: ['Hook rate', 'Retention edit', 'Vertical storytelling'],
    }
];

export async function fetchCurrentTrends(): Promise<TrendTopic[]> {
    // In production, this would call real scraper/API
    await new Promise(resolve => setTimeout(resolve, 800));
    return MOCK_TRENDS;
}

/**
 * AI Logic to bridge a trend to a content pillar
 */
export async function generateTrendBridge(trend: TrendTopic, pillar: string): Promise<TrendBridge> {
    // This would normally call LLM
    return {
        trendTopic: trend.name,
        pillarName: pillar,
        angle: `How "${trend.name}" is directly impacting the future of ${pillar}.`,
        suggestedHook: `Wait, have you seen what's happening with ${trend.name}? If you're into ${pillar}, you need to hear this...`,
        suggestedFormat: trend.platform === 'tiktok' ? 'reel' : 'post',
        potentialROI: 'High (Viral Opportunity)'
    };
}
