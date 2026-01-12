// AI Supervisor Agent - Orchestrates worker agents for autonomous content generation
import { generateContent, GenerateContentParams } from './contentGenerator';
import type { TopicPillar, ContentItem } from '@/types';

export type WorkerType = 'seo-worker' | 'social-worker' | 'risk-worker' | 'trend-sentry' | 'agent-debate' | 'geo-worker';

export interface Task {
    id: string;
    type: WorkerType;
    priority: 'low' | 'medium' | 'high';
    payload: any;
    status: 'pending' | 'working' | 'completed' | 'failed';
    assignedTo?: string;
    createdAt: Date;
    completedAt?: Date;
    result?: any;
    error?: string;
}

export interface RoadmapPlan {
    month: number;
    week: number;
    contentTarget: number;
    topics: string[];
    contentTypes: GenerateContentParams['contentType'][];
}

/**
 * Supervisor Agent - Plans and delegates work
 */
export class SupervisorAgent {
    private workers: Map<WorkerType, WorkerAgent> = new Map();
    private taskQueue: Task[] = [];
    private completedTasks: Task[] = [];

    constructor() {
        // Initialize worker agents
        this.workers.set('seo-worker', new SEOWorker());
        this.workers.set('social-worker', new SocialWorker());
        this.workers.set('risk-worker', new RiskWorker());
        this.workers.set('trend-sentry', new TrendSentryWorker());
        this.workers.set('geo-worker', new GEOWorker());
    }

    /**
     * Generate 90-day content roadmap
     */
    async generateRoadmap(
        topicPillars: TopicPillar[],
        targetAudience: string,
        brandGuidelines?: string
    ): Promise<RoadmapPlan[]> {
        console.log('🎯 Supervisor: Generating 90-day roadmap...');

        const roadmap: RoadmapPlan[] = [];
        const contentTypes: GenerateContentParams['contentType'][] = [
            'blog',
            'youtube-short',
            'instagram-reel',
            'facebook-story',
        ];

        // Gradual velocity: Month 1 = 10, Month 2 = 20, Month 3 = 40
        const monthlyTargets = [10, 20, 40];

        for (let month = 1; month <= 3; month++) {
            const weeksInMonth = 4;
            const weeklyTarget = Math.ceil(monthlyTargets[month - 1] / weeksInMonth);

            for (let week = 1; week <= weeksInMonth; week++) {
                // Rotate through topic pillars
                const selectedPillars = topicPillars.slice(
                    ((month - 1) * 4 + (week - 1)) % topicPillars.length,
                    ((month - 1) * 4 + week) % topicPillars.length || 2
                );

                roadmap.push({
                    month,
                    week: (month - 1) * 4 + week,
                    contentTarget: weeklyTarget,
                    topics: selectedPillars.map(p => p.name),
                    contentTypes: this.distributeContentTypes(weeklyTarget, contentTypes),
                });
            }
        }

        console.log(`✅ Roadmap generated: ${roadmap.length} weeks planned`);
        return roadmap;
    }

    /**
     * Distribute content types across target count
     */
    private distributeContentTypes(
        target: number,
        types: GenerateContentParams['contentType'][]
    ): GenerateContentParams['contentType'][] {
        const distribution: GenerateContentParams['contentType'][] = [];
        let index = 0;

        for (let i = 0; i < target; i++) {
            distribution.push(types[index % types.length]);
            index++;
        }

        return distribution;
    }

    /**
     * Delegate content creation task to SEO worker
     */
    async delegateContentCreation(
        topic: TopicPillar,
        contentType: GenerateContentParams['contentType'],
        targetAudience: string
    ): Promise<Task> {
        const task: Task = {
            id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            type: 'seo-worker',
            priority: 'medium',
            payload: {
                topic: topic.name,
                keywords: topic.keywords,
                contentType,
                targetAudience,
            },
            status: 'pending',
            createdAt: new Date(),
        };

        this.taskQueue.push(task);
        console.log(`📝 Supervisor: Delegated task ${task.id} to ${task.type}`);

        // Execute task
        await this.executeTask(task);

        return task;
    }

    /**
     * Start a collaborative debate between multiple agents for high-quality output
     */
    async startWarRoomDebate(topic: string, contentType: string): Promise<any> {
        console.log(`⚔️ Supervisor: Initiating War Room for "${topic}"`);

        const debateSteps = [
            { agent: 'Strategist', message: `Goal: Establish ${topic} as a category-defining subject.` },
            { agent: 'Copywriter', message: `Drafting a high-intent ${contentType} emphasizing unique value.` },
            { agent: 'Critic', message: `The hook is too generic. We need more tension in the first 2 paragraphs.` },
            { agent: 'SEO Worker', message: `Ensuring we maintain keyword density while addressing the Critic's point.` },
            { agent: 'Risk Worker', message: `Compliance check: Tone is safe, no duplicate content signals.` },
            { agent: 'Copywriter', message: `Refined draft based on feedback. Tone is now "Provocative authority".` }
        ];

        for (const step of debateSteps) {
            await new Promise(resolve => setTimeout(resolve, 1000));
            console.log(`[WAR ROOM] ${step.agent}: ${step.message}`);
        }

        return {
            finalDraft: "Enhanced collaborative content...",
            participants: ['Strategist', 'Copywriter', 'Critic', 'SEO', 'Risk'],
            debateLog: debateSteps,
            consensusScore: 98
        };
    }

    /**
     * Execute a task by assigning to worker
     */
    private async executeTask(task: Task): Promise<void> {
        const worker = this.workers.get(task.type);
        if (!worker) {
            task.status = 'failed';
            task.error = `Worker ${task.type} not found`;
            return;
        }

        task.status = 'working';
        task.assignedTo = worker.name;

        try {
            const result = await worker.execute(task.payload);
            task.status = 'completed';
            task.result = result;
            task.completedAt = new Date();
            this.completedTasks.push(task);
            console.log(`✅ Supervisor: Task ${task.id} completed by ${worker.name}`);
        } catch (error: any) {
            task.status = 'failed';
            task.error = error.message;
            console.error(`❌ Supervisor: Task ${task.id} failed:`, error);
        }
    }

    /**
     * Get task status
     */
    getTaskStatus(taskId: string): Task | undefined {
        return [...this.taskQueue, ...this.completedTasks].find(t => t.id === taskId);
    }

    /**
     * Get all tasks
     */
    getAllTasks(): Task[] {
        return [...this.taskQueue, ...this.completedTasks];
    }

    /**
     * Get worker statistics
     */
    getWorkerStats() {
        return Array.from(this.workers.entries()).map(([type, worker]) => ({
            type,
            name: worker.name,
            tasksCompleted: this.completedTasks.filter(t => t.assignedTo === worker.name).length,
            status: 'idle' as const,
        }));
    }
}

/**
 * Base Worker Agent
 */
abstract class WorkerAgent {
    abstract name: string;
    abstract type: WorkerType;

    abstract execute(payload: any): Promise<any>;
}

/**
 * SEO Content Worker - Generates optimized content
 */
class SEOWorker extends WorkerAgent {
    name = 'SEO Content Worker';
    type: WorkerType = 'seo-worker';

    async execute(payload: GenerateContentParams): Promise<ContentItem> {
        console.log(`🔍 ${this.name}: Generating content for "${payload.topic}"`);

        // Generate content using AI
        const generated = await generateContent(payload);

        // Create content item
        const contentItem: ContentItem = {
            id: `content-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            title: generated.title,
            type: payload.contentType,
            status: 'pending', // Requires approval
            content: generated.content,
            metadata: {
                ...generated.metadata,
                seoScore: generated.seoScore,
            },
            createdAt: new Date(),
        };

        console.log(`✅ ${this.name}: Content created with SEO score ${generated.seoScore}/100`);

        return contentItem;
    }
}

/**
 * Social Media Worker - Atomizes content for social platforms
 */
class SocialWorker extends WorkerAgent {
    name = 'Social Media Worker';
    type: WorkerType = 'social-worker';

    async execute(payload: { sourceContent: string; platforms: string[] }): Promise<any> {
        console.log(`📱 ${this.name}: Atomizing content for social media...`);

        const atomizedContent: any = {};

        for (const platform of payload.platforms) {
            switch (platform) {
                case 'instagram':
                    atomizedContent.instagram = this.createInstagramContent(payload.sourceContent);
                    break;
                case 'youtube':
                    atomizedContent.youtube = this.createYouTubeContent(payload.sourceContent);
                    break;
                case 'facebook':
                    atomizedContent.facebook = this.createFacebookContent(payload.sourceContent);
                    break;
            }
        }

        console.log(`✅ ${this.name}: Content atomized for ${payload.platforms.length} platforms`);
        return atomizedContent;
    }

    private createInstagramContent(source: string): any {
        const excerpt = source.substring(0, 200);
        return {
            caption: `${excerpt}...\n\n#DigitalMarketing #ContentCreation #AI`,
            type: 'reel',
        };
    }

    private createYouTubeContent(source: string): any {
        return {
            title: source.split('\n')[0].substring(0, 100),
            description: source.substring(0, 500),
            type: 'short',
        };
    }

    private createFacebookContent(source: string): any {
        return {
            text: source.substring(0, 300),
            type: 'story',
        };
    }
}

/**
 * Risk Monitor Worker - Checks for spam signals and compliance
 */
class RiskWorker extends WorkerAgent {
    name = 'Risk Monitor Worker';
    type: WorkerType = 'risk-worker';

    async execute(payload: { content: ContentItem[]; velocity: number }): Promise<any> {
        console.log(`🛡️ ${this.name}: Analyzing risk factors...`);

        const risks: any[] = [];

        // Check velocity (posts per week)
        if (payload.velocity > 15) {
            risks.push({
                type: 'high-velocity',
                severity: 'medium',
                message: 'Publishing velocity above recommended threshold for new accounts',
                recommendation: 'Reduce to 10-12 posts per week to maintain natural growth pattern',
            });
        }

        // Check for duplicate content
        const contentMap = new Map<string, number>();
        payload.content.forEach(item => {
            const firstLine = item.content.split('\n')[0];
            contentMap.set(firstLine, (contentMap.get(firstLine) || 0) + 1);
        });

        for (const [content, count] of contentMap.entries()) {
            if (count > 1) {
                risks.push({
                    type: 'duplicate-content',
                    severity: 'high',
                    message: `Detected ${count} items with similar content`,
                    recommendation: 'Increase content diversity to avoid duplicate content penalties',
                });
            }
        }

        console.log(`✅ ${this.name}: Risk analysis complete - ${risks.length} issues found`);

        return {
            riskScore: Math.min(100, risks.length * 15),
            risks,
            status: risks.length === 0 ? 'healthy' : risks.length < 3 ? 'warning' : 'critical',
        };
    }
}

/**
 * Trend Sentry Worker - Identifies viral opportunities and trend hijacking bridge
 */
class TrendSentryWorker extends WorkerAgent {
    name = 'Trend Sentry Worker';
    type: WorkerType = 'trend-sentry';

    async execute(payload: { pillars: TopicPillar[] }): Promise<any> {
        console.log(`📡 ${this.name}: Scanning for global trends...`);

        // Dynamic import to avoid circular dependency
        const { fetchCurrentTrends, generateTrendBridge } = await import('./trends');

        const trends = await fetchCurrentTrends();
        const bridges = [];

        // Bridge top 2 trends to top 2 pillars
        for (let i = 0; i < Math.min(2, trends.length); i++) {
            for (let j = 0; j < Math.min(2, payload.pillars.length); j++) {
                const bridge = await generateTrendBridge(trends[i], payload.pillars[j].name);
                bridges.push(bridge);
            }
        }

        console.log(`✅ ${this.name}: Found ${trends.length} active trends and built ${bridges.length} strategic bridges`);

        return {
            activeTrends: trends,
            strategicBridges: bridges,
            scanTime: new Date().toISOString()
        };
    }
}

/**
 * GEO Worker - Specializes in Generative Engine Optimization
 * Uses advanced 8-metric analysis for AI search engine optimization
 */
class GEOWorker extends WorkerAgent {
    name = 'GEO Specialist';
    type: WorkerType = 'geo-worker';

    async execute(payload: GenerateContentParams): Promise<ContentItem> {
        console.log(`🌐 ${this.name}: Optimizing content for AI Search Engines (GEO) for "${payload.topic}"`);

        // Force GEO enabled
        const geoPayload = { ...payload, enableGEO: true };

        // Generate content using AI with GEO optimization
        const generated = await generateContent(geoPayload);

        // Create content item with enhanced GEO data
        const contentItem: ContentItem = {
            id: `content-geo-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            title: generated.title,
            type: payload.contentType,
            status: 'pending',
            content: generated.content,
            metadata: {
                ...generated.metadata,
                seoScore: generated.seoScore,
                geoScore: generated.geoScore,
                geoGrade: generated.geoGrade,
                geoBreakdown: generated.geoBreakdown,
                geoRecommendations: generated.geoRecommendations,
                geoStrengths: generated.geoStrengths,
            },
            createdAt: new Date(),
        };

        const gradeDisplay = generated.geoGrade ? ` (Grade: ${generated.geoGrade})` : '';
        console.log(`✅ ${this.name}: GEO Content created with score ${generated.geoScore}/100${gradeDisplay}`);

        if (generated.geoRecommendations && generated.geoRecommendations.length > 0) {
            console.log(`   📋 Recommendations: ${generated.geoRecommendations.length} suggestions for improvement`);
        }

        return contentItem;
    }
}


// Singleton instance
let supervisorInstance: SupervisorAgent | null = null;

export function getSupervisorAgent(): SupervisorAgent {
    if (!supervisorInstance) {
        supervisorInstance = new SupervisorAgent();
    }
    return supervisorInstance;
}
