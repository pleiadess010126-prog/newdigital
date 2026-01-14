// =============================================================================
// PREDICTIVE AI API - Send-time optimization, predictions, recommendations
// =============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { getSession as getServerSession } from '@/lib/auth/session.server';
import { getPredictiveEngine } from '@/lib/ai/predictive';

// GET /api/ai/predictions - Get predictions and recommendations
export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession();
        if (!session?.user?.organizationId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const action = searchParams.get('action');
        const contactId = searchParams.get('contactId');
        const campaignType = searchParams.get('campaignType') as 'email' | 'sms' | 'journey' | null;

        const engine = getPredictiveEngine(session.user.organizationId!);

        switch (action) {
            case 'optimal-times': {
                const optimalTimes = await engine.getOptimalSendTime(contactId || undefined);
                return NextResponse.json({ optimalTimes });
            }

            case 'churn-risk': {
                if (!contactId) {
                    return NextResponse.json({ error: 'Contact ID required' }, { status: 400 });
                }
                const churnData = await engine.calculateChurnRisk(contactId);
                return NextResponse.json(churnData);
            }

            case 'next-best-action': {
                if (!contactId) {
                    return NextResponse.json({ error: 'Contact ID required' }, { status: 400 });
                }
                const nba = await engine.getNextBestAction(contactId);
                return NextResponse.json(nba);
            }

            case 'recommendations': {
                const recommendations = await engine.getCampaignRecommendations(campaignType || 'email');
                return NextResponse.json({ recommendations });
            }

            default: {
                // Return overview of all predictions
                const [optimalTimes, recommendations] = await Promise.all([
                    engine.getOptimalSendTime(),
                    engine.getCampaignRecommendations('email')
                ]);

                return NextResponse.json({
                    optimalTimes,
                    recommendations
                });
            }
        }
    } catch (error) {
        console.error('Predictions error:', error);
        return NextResponse.json({ error: 'Failed to get predictions' }, { status: 500 });
    }
}

// POST /api/ai/predictions - Predict engagement for campaign
export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession();
        if (!session?.user?.organizationId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { action, subject, content, sendTime, audienceSize } = body;

        const engine = getPredictiveEngine(session.user.organizationId!);

        switch (action) {
            case 'predict-engagement': {
                const prediction = await engine.predictEngagement({
                    subject,
                    content,
                    sendTime: sendTime ? new Date(sendTime) : undefined,
                    audienceSize
                });
                return NextResponse.json(prediction);
            }

            case 'optimize-send-time': {
                const optimalTimes = await engine.getOptimalSendTime();

                // Find the next optimal slot from now
                const now = new Date();
                const currentDay = now.getDay();
                const currentHour = now.getHours();

                let nextSlot = optimalTimes.find(slot => {
                    if (slot.dayOfWeek > currentDay) return true;
                    if (slot.dayOfWeek === currentDay && slot.hour > currentHour) return true;
                    return false;
                }) || optimalTimes[0];

                // Calculate the actual date/time
                let daysUntil = nextSlot.dayOfWeek - currentDay;
                if (daysUntil < 0 || (daysUntil === 0 && nextSlot.hour <= currentHour)) {
                    daysUntil += 7;
                }

                const suggestedDate = new Date(now);
                suggestedDate.setDate(suggestedDate.getDate() + daysUntil);
                suggestedDate.setHours(nextSlot.hour, 0, 0, 0);

                return NextResponse.json({
                    suggestedSendTime: suggestedDate.toISOString(),
                    score: nextSlot.score,
                    confidence: nextSlot.confidence,
                    allSlots: optimalTimes
                });
            }

            default:
                return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
        }
    } catch (error) {
        console.error('Prediction error:', error);
        return NextResponse.json({ error: 'Failed to generate prediction' }, { status: 500 });
    }
}
