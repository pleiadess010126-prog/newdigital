// =============================================================================
// PREDICTIVE AI ENGINE - Smart send times, engagement scoring, recommendations
// =============================================================================

import { prisma } from '@/lib/db/prisma';

// Time zone handling
const HOURS_IN_DAY = 24;
const DAYS_IN_WEEK = 7;

interface EngagementData {
    dayOfWeek: number; // 0-6 (Sunday-Saturday)
    hourOfDay: number; // 0-23
    openRate: number;
    clickRate: number;
    responseRate: number;
    count: number;
}

interface OptimalSendTime {
    dayOfWeek: number;
    hour: number;
    score: number;
    confidence: 'high' | 'medium' | 'low';
}

interface EngagementPrediction {
    predictedOpenRate: number;
    predictedClickRate: number;
    predictedResponseRate: number;
    confidence: number;
    factors: Array<{ factor: string; impact: 'positive' | 'negative' | 'neutral'; weight: number }>;
}

interface ContactInsight {
    contactId: string;
    preferredChannel: 'email' | 'sms' | 'whatsapp';
    bestSendTimes: OptimalSendTime[];
    engagementTrend: 'increasing' | 'stable' | 'decreasing';
    churnRisk: 'low' | 'medium' | 'high';
    nextBestAction: string;
    recommendedContent: string[];
}

interface CampaignRecommendation {
    type: 'subject_line' | 'send_time' | 'audience' | 'content';
    suggestion: string;
    expectedImpact: string;
    confidence: number;
}

/**
 * Predictive AI Engine for Marketing Optimization
 */
export class PredictiveEngine {
    private organizationId: string;

    constructor(organizationId: string) {
        this.organizationId = organizationId;
    }

    /**
     * Calculate optimal send time for a contact or segment
     */
    async getOptimalSendTime(
        contactId?: string,
        timezone: string = 'UTC'
    ): Promise<OptimalSendTime[]> {
        // Get historical engagement data
        const engagementData = await this.getEngagementHeatmap(contactId);

        if (engagementData.length === 0) {
            // Return default optimal times based on industry averages
            return this.getDefaultOptimalTimes();
        }

        // Score each time slot
        const scoredSlots: OptimalSendTime[] = [];

        for (const data of engagementData) {
            const score = this.calculateTimeScore(data);
            const confidence = this.getConfidence(data.count);

            scoredSlots.push({
                dayOfWeek: data.dayOfWeek,
                hour: data.hourOfDay,
                score,
                confidence
            });
        }

        // Sort by score and return top slots
        return scoredSlots
            .sort((a, b) => b.score - a.score)
            .slice(0, 5);
    }

    /**
     * Get engagement heatmap data
     */
    private async getEngagementHeatmap(contactId?: string): Promise<EngagementData[]> {
        // In production, aggregate from email opens, clicks, responses
        // For now, return simulated data based on typical patterns

        const heatmap: EngagementData[] = [];

        // Simulated engagement patterns
        const peakHours = [9, 10, 11, 14, 15, 16, 20, 21]; // Business hours + evening
        const peakDays = [1, 2, 3, 4]; // Monday-Thursday

        for (let day = 0; day < DAYS_IN_WEEK; day++) {
            for (let hour = 0; hour < HOURS_IN_DAY; hour++) {
                const isPeakHour = peakHours.includes(hour);
                const isPeakDay = peakDays.includes(day);

                const baseOpenRate = isPeakHour && isPeakDay ? 0.35 :
                    isPeakHour || isPeakDay ? 0.22 : 0.12;
                const baseClickRate = baseOpenRate * 0.25;

                // Add some variance
                const variance = (Math.random() - 0.5) * 0.1;

                heatmap.push({
                    dayOfWeek: day,
                    hourOfDay: hour,
                    openRate: Math.max(0, baseOpenRate + variance),
                    clickRate: Math.max(0, baseClickRate + variance * 0.5),
                    responseRate: Math.max(0, baseOpenRate * 0.05 + variance * 0.02),
                    count: Math.floor(Math.random() * 100) + 10
                });
            }
        }

        return heatmap;
    }

    /**
     * Calculate time slot score
     */
    private calculateTimeScore(data: EngagementData): number {
        // Weight: Open rate (40%), Click rate (40%), Response rate (20%)
        return (data.openRate * 0.4) + (data.clickRate * 0.4) + (data.responseRate * 0.2);
    }

    /**
     * Get confidence level based on sample size
     */
    private getConfidence(count: number): 'high' | 'medium' | 'low' {
        if (count >= 100) return 'high';
        if (count >= 30) return 'medium';
        return 'low';
    }

    /**
     * Default optimal times (industry averages)
     */
    private getDefaultOptimalTimes(): OptimalSendTime[] {
        return [
            { dayOfWeek: 2, hour: 10, score: 0.85, confidence: 'low' }, // Tuesday 10am
            { dayOfWeek: 3, hour: 14, score: 0.82, confidence: 'low' }, // Wednesday 2pm
            { dayOfWeek: 4, hour: 10, score: 0.80, confidence: 'low' }, // Thursday 10am
            { dayOfWeek: 1, hour: 11, score: 0.78, confidence: 'low' }, // Monday 11am
            { dayOfWeek: 2, hour: 15, score: 0.75, confidence: 'low' }, // Tuesday 3pm
        ];
    }

    /**
     * Predict engagement for a campaign
     */
    async predictEngagement(
        campaignDetails: {
            subject?: string;
            content?: string;
            sendTime?: Date;
            audienceSize?: number;
        }
    ): Promise<EngagementPrediction> {
        const factors: EngagementPrediction['factors'] = [];
        let baseOpenRate = 0.25;
        let baseClickRate = 0.03;

        // Analyze subject line
        if (campaignDetails.subject) {
            const subjectScore = this.analyzeSubjectLine(campaignDetails.subject);
            baseOpenRate *= subjectScore.multiplier;
            factors.push({
                factor: 'Subject Line',
                impact: subjectScore.impact,
                weight: subjectScore.multiplier
            });
        }

        // Analyze send time
        if (campaignDetails.sendTime) {
            const timeScore = this.analyzeSendTime(campaignDetails.sendTime);
            baseOpenRate *= timeScore.multiplier;
            factors.push({
                factor: 'Send Time',
                impact: timeScore.impact,
                weight: timeScore.multiplier
            });
        }

        // Confidence based on data available
        const confidence = factors.length > 0 ? 0.7 : 0.4;

        return {
            predictedOpenRate: Math.round(baseOpenRate * 100) / 100,
            predictedClickRate: Math.round(baseClickRate * 100) / 100,
            predictedResponseRate: Math.round(baseOpenRate * 0.02 * 100) / 100,
            confidence,
            factors
        };
    }

    /**
     * Analyze subject line for engagement potential
     */
    private analyzeSubjectLine(subject: string): { multiplier: number; impact: 'positive' | 'negative' | 'neutral' } {
        const length = subject.length;
        let multiplier = 1;
        let impact: 'positive' | 'negative' | 'neutral' = 'neutral';

        // Optimal length: 30-50 characters
        if (length >= 30 && length <= 50) {
            multiplier *= 1.1;
            impact = 'positive';
        } else if (length > 70) {
            multiplier *= 0.85;
            impact = 'negative';
        }

        // Personalization indicator
        if (subject.includes('{{') || subject.toLowerCase().includes('you')) {
            multiplier *= 1.15;
            impact = 'positive';
        }

        // Urgency words
        const urgencyWords = ['limited', 'exclusive', 'today', 'now', 'urgent', 'last chance'];
        if (urgencyWords.some(word => subject.toLowerCase().includes(word))) {
            multiplier *= 1.1;
            impact = 'positive';
        }

        // Spam trigger words
        const spamWords = ['free', 'win', 'prize', 'click here', 'act now', '$$$'];
        if (spamWords.some(word => subject.toLowerCase().includes(word))) {
            multiplier *= 0.7;
            impact = 'negative';
        }

        return { multiplier, impact };
    }

    /**
     * Analyze send time for engagement potential
     */
    private analyzeSendTime(sendTime: Date): { multiplier: number; impact: 'positive' | 'negative' | 'neutral' } {
        const hour = sendTime.getHours();
        const day = sendTime.getDay();

        let multiplier = 1;
        let impact: 'positive' | 'negative' | 'neutral' = 'neutral';

        // Peak hours: 9-11am, 2-4pm
        const isPeakHour = (hour >= 9 && hour <= 11) || (hour >= 14 && hour <= 16);
        // Peak days: Tuesday-Thursday
        const isPeakDay = day >= 2 && day <= 4;

        if (isPeakHour && isPeakDay) {
            multiplier = 1.25;
            impact = 'positive';
        } else if (isPeakHour || isPeakDay) {
            multiplier = 1.1;
            impact = 'positive';
        } else if (hour < 7 || hour > 21) {
            multiplier = 0.7;
            impact = 'negative';
        } else if (day === 0 || day === 6) {
            multiplier = 0.85;
            impact = 'negative';
        }

        return { multiplier, impact };
    }

    /**
     * Calculate churn risk for a contact
     */
    async calculateChurnRisk(contactId: string): Promise<{
        risk: 'low' | 'medium' | 'high';
        score: number;
        factors: string[];
    }> {
        const contact = await prisma.contact.findUnique({
            where: { id: contactId },
            include: {
                activities: {
                    orderBy: { createdAt: 'desc' },
                    take: 30
                },
                emailRecipients: {
                    orderBy: { createdAt: 'desc' },
                    take: 10
                }
            }
        });

        if (!contact) {
            return { risk: 'high', score: 0.9, factors: ['Contact not found'] };
        }

        const factors: string[] = [];
        let riskScore = 0;

        // Factor 1: Days since last activity
        const daysSinceActivity = contact.lastActivityAt
            ? Math.floor((Date.now() - new Date(contact.lastActivityAt).getTime()) / (1000 * 60 * 60 * 24))
            : 999;

        if (daysSinceActivity > 90) {
            riskScore += 0.4;
            factors.push('No activity in 90+ days');
        } else if (daysSinceActivity > 30) {
            riskScore += 0.2;
            factors.push('Activity declining (30+ days)');
        }

        // Factor 2: Email engagement
        const recentEmails = contact.emailRecipients || [];
        const openedEmails = recentEmails.filter(e => e.openedAt).length;
        const emailOpenRate = recentEmails.length > 0 ? openedEmails / recentEmails.length : 0;

        if (emailOpenRate < 0.1) {
            riskScore += 0.3;
            factors.push('Low email engagement (<10% open rate)');
        } else if (emailOpenRate < 0.2) {
            riskScore += 0.15;
            factors.push('Below average email engagement');
        }

        // Factor 3: Decreasing engagement trend
        const recentActivityCount = (contact.activities || []).filter(a => {
            const daysAgo = (Date.now() - new Date(a.createdAt).getTime()) / (1000 * 60 * 60 * 24);
            return daysAgo <= 30;
        }).length;

        if (recentActivityCount === 0 && contact.activities && contact.activities.length > 0) {
            riskScore += 0.2;
            factors.push('Engagement has stopped');
        }

        // Determine risk level
        let risk: 'low' | 'medium' | 'high';
        if (riskScore >= 0.6) {
            risk = 'high';
        } else if (riskScore >= 0.3) {
            risk = 'medium';
        } else {
            risk = 'low';
        }

        return { risk, score: Math.min(riskScore, 1), factors };
    }

    /**
     * Get AI-powered campaign recommendations
     */
    async getCampaignRecommendations(
        campaignType: 'email' | 'sms' | 'journey'
    ): Promise<CampaignRecommendation[]> {
        const recommendations: CampaignRecommendation[] = [];

        // Get optimal send time
        const optimalTimes = await this.getOptimalSendTime();
        if (optimalTimes.length > 0) {
            const best = optimalTimes[0];
            const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
            recommendations.push({
                type: 'send_time',
                suggestion: `Schedule for ${dayNames[best.dayOfWeek]} at ${best.hour}:00`,
                expectedImpact: '+15-25% higher open rate',
                confidence: best.confidence === 'high' ? 0.85 : best.confidence === 'medium' ? 0.65 : 0.45
            });
        }

        // Subject line recommendations for email
        if (campaignType === 'email') {
            recommendations.push({
                type: 'subject_line',
                suggestion: 'Keep subject lines between 30-50 characters',
                expectedImpact: '+10% open rate improvement',
                confidence: 0.75
            });
            recommendations.push({
                type: 'subject_line',
                suggestion: 'Include personalization (first name) in subject',
                expectedImpact: '+12% open rate improvement',
                confidence: 0.8
            });
        }

        // Audience recommendations
        recommendations.push({
            type: 'audience',
            suggestion: 'Exclude contacts with high churn risk from promotional campaigns',
            expectedImpact: 'Better deliverability and engagement metrics',
            confidence: 0.7
        });

        // Content recommendations for SMS
        if (campaignType === 'sms') {
            recommendations.push({
                type: 'content',
                suggestion: 'Keep SMS under 160 characters for single-part delivery',
                expectedImpact: 'Lower costs, faster delivery',
                confidence: 0.9
            });
            recommendations.push({
                type: 'content',
                suggestion: 'Include a clear CTA with shortened URL',
                expectedImpact: '+20% click-through rate',
                confidence: 0.75
            });
        }

        return recommendations;
    }

    /**
     * Get next best action for a contact
     */
    async getNextBestAction(contactId: string): Promise<{
        action: string;
        channel: string;
        urgency: 'high' | 'medium' | 'low';
        reason: string;
    }> {
        const churnData = await this.calculateChurnRisk(contactId);

        if (churnData.risk === 'high') {
            return {
                action: 'Send re-engagement campaign',
                channel: 'email',
                urgency: 'high',
                reason: 'Contact at high risk of churn'
            };
        }

        const contact = await prisma.contact.findUnique({
            where: { id: contactId },
            select: { leadScore: true, status: true }
        });

        if (contact && contact.leadScore >= 70 && contact.status === 'mql') {
            return {
                action: 'Schedule sales follow-up call',
                channel: 'phone',
                urgency: 'high',
                reason: 'High lead score, ready for sales engagement'
            };
        }

        if (contact && contact.leadScore >= 40) {
            return {
                action: 'Send product demo invitation',
                channel: 'email',
                urgency: 'medium',
                reason: 'Warm lead, nurture with demo content'
            };
        }

        return {
            action: 'Add to nurture sequence',
            channel: 'email',
            urgency: 'low',
            reason: 'Continue general nurturing'
        };
    }
}

// Factory function
export function getPredictiveEngine(organizationId: string): PredictiveEngine {
    return new PredictiveEngine(organizationId);
}
