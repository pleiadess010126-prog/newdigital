// =================================================================
// AFFILIATE STATS API ROUTE
// Get affiliate statistics and analytics
// =================================================================

import { NextRequest, NextResponse } from 'next/server';

// GET - Get affiliate statistics
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const affiliateId = searchParams.get('affiliateId');
        const period = searchParams.get('period') || '30d'; // 7d, 30d, 90d, 1y, all

        if (!affiliateId) {
            return NextResponse.json(
                { success: false, error: 'Affiliate ID is required' },
                { status: 400 }
            );
        }

        // Calculate date range
        const now = new Date();
        let startDate: Date;
        switch (period) {
            case '7d':
                startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                break;
            case '30d':
                startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                break;
            case '90d':
                startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
                break;
            case '1y':
                startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
                break;
            default:
                startDate = new Date(0); // All time
        }

        // In production, this would query the database
        // For demo, return simulated stats
        const stats = {
            period,
            startDate: startDate.toISOString(),
            endDate: now.toISOString(),

            // Traffic metrics
            clicks: {
                total: 0,
                unique: 0,
                byDay: generateDailyData(period, 0, 100),
                bySource: {
                    direct: 45,
                    social: 30,
                    email: 15,
                    other: 10
                }
            },

            // Conversion metrics
            conversions: {
                signups: 0,
                trials: 0,
                paid: 0,
                conversionRate: 0,
                byDay: generateDailyData(period, 0, 10),
                byPlan: {
                    starter: 0,
                    pro: 0,
                    enterprise: 0
                }
            },

            // Revenue metrics
            earnings: {
                total: 0,
                pending: 0,
                paid: 0,
                byDay: generateDailyData(period, 0, 50),
                byType: {
                    commission: 0,
                    bonus: 0,
                    recurring: 0
                },
                averageOrderValue: 0,
                lifetimeValue: 0
            },

            // Performance metrics
            performance: {
                clickToSignup: 0,
                signupToTrial: 0,
                trialToPaid: 0,
                churnRate: 0,
                activeReferrals: 0
            },

            // Top referrals
            topReferrals: []
        };

        return NextResponse.json({
            success: true,
            data: stats
        });

    } catch (error) {
        console.error('Affiliate stats error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to get affiliate stats' },
            { status: 500 }
        );
    }
}

// Helper to generate daily data points
function generateDailyData(period: string, min: number, max: number): { date: string; value: number }[] {
    const days = period === '7d' ? 7 : period === '30d' ? 30 : period === '90d' ? 90 : 30;
    const data: { date: string; value: number }[] = [];

    for (let i = days - 1; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        data.push({
            date: date.toISOString().split('T')[0],
            value: Math.floor(Math.random() * (max - min + 1) + min)
        });
    }

    return data;
}

// POST - Record a stat event (click, signup, conversion)
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { affiliateId, eventType, metadata } = body;

        if (!affiliateId || !eventType) {
            return NextResponse.json(
                { success: false, error: 'Affiliate ID and event type are required' },
                { status: 400 }
            );
        }

        // Valid event types
        const validEvents = ['click', 'signup', 'trial_start', 'conversion', 'upgrade', 'churn'];
        if (!validEvents.includes(eventType)) {
            return NextResponse.json(
                { success: false, error: `Invalid event type. Must be one of: ${validEvents.join(', ')}` },
                { status: 400 }
            );
        }

        // In production, this would update the database
        // For demo, just acknowledge the event
        return NextResponse.json({
            success: true,
            message: `Event '${eventType}' recorded for affiliate ${affiliateId}`,
            data: {
                affiliateId,
                eventType,
                metadata,
                recordedAt: new Date().toISOString()
            }
        });

    } catch (error) {
        console.error('Affiliate stats POST error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to record stat event' },
            { status: 500 }
        );
    }
}
