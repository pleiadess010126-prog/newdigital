// =============================================================================
// LEAD SCORING API - Calculate and retrieve lead scores
// =============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { getSession } from '@/lib/auth/session.server';
import {
    calculateLeadScore,
    recalculateOrgLeadScores,
    getHotLeads,
    getScoreDistribution
} from '@/lib/crm/leadScoring';

// GET /api/crm/lead-scoring - Get lead score stats
export async function GET(request: NextRequest) {
    try {
        const session = await getSession();
        if (!session?.user?.organizationId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const action = searchParams.get('action');

        switch (action) {
            case 'hot-leads': {
                const minScore = parseInt(searchParams.get('minScore') || '50');
                const limit = parseInt(searchParams.get('limit') || '20');
                const hotLeads = await getHotLeads(session.user.organizationId, minScore, limit);
                return NextResponse.json({ hotLeads });
            }

            case 'distribution': {
                const distribution = await getScoreDistribution(session.user.organizationId);
                return NextResponse.json(distribution);
            }

            default: {
                // Get all contacts with their scores
                const contacts = await prisma.contact.findMany({
                    where: { organizationId: session.user.organizationId },
                    select: {
                        id: true,
                        email: true,
                        firstName: true,
                        lastName: true,
                        company: true,
                        status: true,
                        leadScore: true,
                        lastActivityAt: true
                    },
                    orderBy: { leadScore: 'desc' },
                    take: 100
                });

                const distribution = await getScoreDistribution(session.user.organizationId);

                return NextResponse.json({
                    contacts,
                    distribution
                });
            }
        }
    } catch (error) {
        console.error('Lead scoring error:', error);
        return NextResponse.json({ error: 'Failed to get lead scores' }, { status: 500 });
    }
}

// POST /api/crm/lead-scoring - Calculate/recalculate scores
export async function POST(request: NextRequest) {
    try {
        const session = await getSession();
        if (!session?.user?.organizationId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { action, contactId } = body;

        switch (action) {
            case 'calculate': {
                if (!contactId) {
                    return NextResponse.json({ error: 'Contact ID required' }, { status: 400 });
                }

                const breakdown = await calculateLeadScore(contactId);

                // Update contact with new score
                await prisma.contact.update({
                    where: { id: contactId },
                    data: { leadScore: breakdown.total }
                });

                return NextResponse.json(breakdown);
            }

            case 'recalculate-all': {
                const result = await recalculateOrgLeadScores(session.user.organizationId);
                return NextResponse.json(result);
            }

            default:
                return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
        }
    } catch (error) {
        console.error('Lead scoring error:', error);
        return NextResponse.json({ error: 'Failed to calculate scores' }, { status: 500 });
    }
}
