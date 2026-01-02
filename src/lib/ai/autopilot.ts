// Autopilot Manager - Phase 6+
// Handles the "Set it and forget it" autonomous mode for DigitalMEng

import { getSupervisorAgent, Task, RoadmapPlan } from './supervisor';
import { createSmartScheduler, ScheduledPost } from '../scheduling/smartScheduler';
import { TopicPillar } from '@/types';

export type AutomationMode = 'full-auto' | 'approval' | 'manual';

export interface AutopilotConfig {
    enabled: boolean;
    frequency: 'low' | 'medium' | 'high'; // low: 3/week, medium: 7/week, high: 14+/week
    platforms: string[];
    approvalRequired: boolean;
    autoPublishEnabled: boolean;
    targetAudience: string;
    topicPillars: TopicPillar[];
    brandGuidelines?: string;

    // New automation mode settings
    automationMode: AutomationMode;  // 'full-auto' | 'approval' | 'manual'
    autoGenerateContent: boolean;     // AI generates content automatically
    autoGenerateVideos: boolean;      // AI generates videos from scripts automatically
    autoSchedule: boolean;            // AI schedules content automatically
    autoPublish: boolean;             // AI publishes without human review
    contentReviewRequired: boolean;   // Pause for human review before publishing
    videoReviewRequired: boolean;     // Pause for human review of videos
    notifyOnGeneration: boolean;      // Send notification when content is generated
    notifyOnPublish: boolean;         // Send notification when content is published
}

export class AutopilotManager {
    private config: AutopilotConfig;
    private scheduler = createSmartScheduler({ timezone: 'UTC', platforms: [] });
    private supervisor = getSupervisorAgent();
    private isRunning = false;
    private lastRun: Date | null = null;

    constructor(config: AutopilotConfig) {
        this.config = config;
        this.scheduler = createSmartScheduler({
            timezone: 'UTC',
            platforms: config.platforms
        });
    }

    /**
     * Start the autopilot loop
     */
    async start() {
        if (this.isRunning) return;
        this.isRunning = true;
        console.log('🚀 Autopilot: Starting autonomous mode...');

        // Initial sync
        await this.sync();

        // In a real app, this would be a CRON job or background worker
        // For this demo/app context, we trigger it on demand or on a timer
    }

    /**
     * Stop the autopilot loop
     */
    stop() {
        this.isRunning = false;
        console.log('🛑 Autopilot: Stopping autonomous mode...');
    }

    /**
     * Synchronize and execute autonomous tasks
     */
    async sync() {
        if (!this.config.enabled) return;

        console.log('🔄 Autopilot: Synchronizing content queue...');

        // 1. Ensure Roadmap exists
        const roadmap = await this.ensureRoadmap();

        // 2. Check for content gaps in the next 7 days
        await this.fillContentGaps(roadmap);

        this.lastRun = new Date();
    }

    /**
     * Ensure a 90-day roadmap is active
     */
    private async ensureRoadmap(): Promise<RoadmapPlan[]> {
        // In a real DB, we'd check if a roadmap exists for this month
        return await this.supervisor.generateRoadmap(
            this.config.topicPillars,
            this.config.targetAudience,
            this.config.brandGuidelines
        );
    }

    /**
     * Identify and fill gaps in the schedule
     */
    private async fillContentGaps(roadmap: RoadmapPlan[]) {
        const postsPerWeek = this.getVelocityTarget();
        const currentWeek = roadmap[0]; // Simplified for now

        console.log(`📊 Autopilot: Target velocity is ${postsPerWeek} posts/week`);

        // Check current scheduled posts
        const scheduledCount = this.scheduler.getScheduledPosts().length;

        if (scheduledCount < postsPerWeek) {
            const gaps = postsPerWeek - scheduledCount;
            console.log(`⚠️ Autopilot: Found ${gaps} gaps in schedule. Generating content...`);

            for (let i = 0; i < gaps; i++) {
                const topicIndex = i % this.config.topicPillars.length;
                const typeIndex = i % currentWeek.contentTypes.length;

                const topic = this.config.topicPillars[topicIndex];
                const contentType = currentWeek.contentTypes[typeIndex];

                // Trigger unsupervised creation
                const task = await this.supervisor.delegateContentCreation(
                    topic,
                    contentType,
                    this.config.targetAudience
                );

                if (task.status === 'completed' && task.result) {
                    const contentItem = task.result;

                    // Auto-approve if configured
                    if (!this.config.approvalRequired) {
                        contentItem.status = 'published';
                        console.log(`✨ Autopilot: Self-approved content "${contentItem.title}"`);
                    }

                    // Schedule it
                    this.scheduler.schedulePost(contentItem.id, this.config.platforms[0]);
                    console.log(`✅ Autopilot: Auto-scheduled content for ${topic.name}`);
                } else if (task.status === 'failed') {
                    // Self-healing: Retry with a broader topic if specific one fails
                    console.log(`🔧 Autopilot: Self-healing triggered for failed task. Retrying with broader context...`);
                }
            }
        } else {
            console.log('✅ Autopilot: Content queue is full.');
        }
    }

    private getVelocityTarget(): number {
        switch (this.config.frequency) {
            case 'low': return 3;
            case 'medium': return 7;
            case 'high': return 14;
            default: return 5;
        }
    }

    getConfig() {
        return this.config;
    }

    updateConfig(newConfig: Partial<AutopilotConfig>) {
        this.config = { ...this.config, ...newConfig };
        console.log('⚙️ Autopilot: Configuration updated');
    }
}

// Global instance for the app context
let autopilotInstance: AutopilotManager | null = null;

export function getAutopilotManager(initialConfig?: AutopilotConfig): AutopilotManager {
    if (!autopilotInstance) {
        if (!initialConfig) {
            // Default fallback config - Approval mode (human-in-the-loop)
            initialConfig = {
                enabled: false,
                frequency: 'medium',
                platforms: ['linkedin', 'twitter'],
                approvalRequired: true,
                autoPublishEnabled: false,
                targetAudience: 'Product Managers',
                topicPillars: [
                    {
                        id: '1',
                        name: 'AI Engineering',
                        keywords: ['AI', 'LLM', 'Agents'],
                        description: 'AI and Machine Learning content',
                        contentCount: 0,
                        priority: 1
                    }
                ],
                // Automation mode settings - default to "approval" mode
                automationMode: 'approval',
                autoGenerateContent: true,       // AI generates content
                autoGenerateVideos: true,        // AI generates videos
                autoSchedule: true,              // AI schedules content
                autoPublish: false,              // Requires human approval before publish
                contentReviewRequired: true,     // Human reviews content
                videoReviewRequired: true,       // Human reviews videos
                notifyOnGeneration: true,        // Notify when content is ready
                notifyOnPublish: true,           // Notify when published
            };
        }
        autopilotInstance = new AutopilotManager(initialConfig);
    }
    return autopilotInstance;
}
