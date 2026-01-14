// =============================================================================
// JOURNEYS API - CRUD Operations for automation journeys
// =============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { getSession as getServerSession } from '@/lib/auth/session.server';
import { JOURNEY_TEMPLATES, type Journey, type JourneyStatus } from '@/lib/journey/types';

// In-memory store for demo (production would use Prisma)
const journeys: Map<string, Journey> = new Map();

// GET /api/journeys - List all journeys
export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession();
        if (!session?.user?.organizationId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const status = searchParams.get('status') as JourneyStatus | null;

        // Filter journeys by organization
        let orgJourneys = Array.from(journeys.values()).filter(
            j => j.organizationId === session.user.organizationId
        );

        if (status) {
            orgJourneys = orgJourneys.filter(j => j.status === status);
        }

        // Add demo journeys if none exist
        if (orgJourneys.length === 0) {
            const demoJourneys = [
                {
                    id: 'demo-1',
                    organizationId: session.user.organizationId!,
                    name: 'Welcome Series',
                    description: 'Onboard new subscribers with a series of welcome emails',
                    status: 'active' as JourneyStatus,
                    nodes: JOURNEY_TEMPLATES.welcome_series.nodes,
                    edges: JOURNEY_TEMPLATES.welcome_series.edges,
                    settings: {
                        reentryAllowed: false,
                        exitOnGoal: true,
                        timezone: 'UTC'
                    },
                    stats: {
                        totalEntered: 1247,
                        currentlyActive: 89,
                        completed: 1102,
                        exitedEarly: 56,
                        conversionRate: 42.5
                    },
                    createdAt: new Date('2026-01-01'),
                    updatedAt: new Date('2026-01-10')
                },
                {
                    id: 'demo-2',
                    organizationId: session.user.organizationId!,
                    name: 'Lead Nurturing',
                    description: 'Nurture qualified leads with targeted content',
                    status: 'active' as JourneyStatus,
                    nodes: JOURNEY_TEMPLATES.lead_nurturing.nodes,
                    edges: JOURNEY_TEMPLATES.lead_nurturing.edges,
                    settings: {
                        reentryAllowed: true,
                        reentryDelay: 30,
                        exitOnGoal: true,
                        timezone: 'UTC'
                    },
                    stats: {
                        totalEntered: 523,
                        currentlyActive: 145,
                        completed: 312,
                        exitedEarly: 66,
                        conversionRate: 28.3
                    },
                    createdAt: new Date('2026-01-05'),
                    updatedAt: new Date('2026-01-12')
                },
                {
                    id: 'demo-3',
                    organizationId: session.user.organizationId!,
                    name: 'Re-engagement',
                    description: 'Win back inactive subscribers',
                    status: 'draft' as JourneyStatus,
                    nodes: JOURNEY_TEMPLATES.reengagement.nodes,
                    edges: JOURNEY_TEMPLATES.reengagement.edges,
                    settings: {
                        reentryAllowed: false,
                        exitOnGoal: false,
                        timezone: 'UTC'
                    },
                    stats: {
                        totalEntered: 0,
                        currentlyActive: 0,
                        completed: 0,
                        exitedEarly: 0,
                        conversionRate: 0
                    },
                    createdAt: new Date('2026-01-12'),
                    updatedAt: new Date('2026-01-12')
                }
            ];

            orgJourneys = demoJourneys;
        }

        return NextResponse.json({
            journeys: orgJourneys,
            templates: Object.keys(JOURNEY_TEMPLATES).map(key => ({
                id: key,
                ...JOURNEY_TEMPLATES[key as keyof typeof JOURNEY_TEMPLATES]
            }))
        });
    } catch (error) {
        console.error('Error fetching journeys:', error);
        return NextResponse.json({ error: 'Failed to fetch journeys' }, { status: 500 });
    }
}

// POST /api/journeys - Create a new journey
export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession();
        if (!session?.user?.organizationId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { name, description, templateId, nodes, edges, settings } = body;

        if (!name) {
            return NextResponse.json({ error: 'Name is required' }, { status: 400 });
        }

        // Create new journey
        const journey: Journey = {
            id: `journey_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            organizationId: session.user.organizationId!,
            name,
            description,
            status: 'draft',
            nodes: nodes || (templateId && JOURNEY_TEMPLATES[templateId as keyof typeof JOURNEY_TEMPLATES]?.nodes) || [],
            edges: edges || (templateId && JOURNEY_TEMPLATES[templateId as keyof typeof JOURNEY_TEMPLATES]?.edges) || [],
            settings: settings || {
                reentryAllowed: false,
                exitOnGoal: true,
                timezone: 'UTC'
            },
            stats: {
                totalEntered: 0,
                currentlyActive: 0,
                completed: 0,
                exitedEarly: 0,
                conversionRate: 0
            },
            createdAt: new Date(),
            updatedAt: new Date()
        };

        journeys.set(journey.id, journey);

        return NextResponse.json(journey, { status: 201 });
    } catch (error) {
        console.error('Error creating journey:', error);
        return NextResponse.json({ error: 'Failed to create journey' }, { status: 500 });
    }
}
