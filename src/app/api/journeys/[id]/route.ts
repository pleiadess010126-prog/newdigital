// =============================================================================
// SINGLE JOURNEY API - Read, Update, Delete, Activate journeys
// =============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { getSession as getServerSession } from '@/lib/auth/session.server';
import { JourneyEngine } from '@/lib/journey/engine';
import type { Journey, JourneyStatus } from '@/lib/journey/types';

// In-memory store (shared with parent route in production)
const journeys: Map<string, Journey> = new Map();

// GET /api/journeys/[id] - Get single journey
export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession();
        if (!session?.user?.organizationId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const journey = journeys.get(params.id);

        if (!journey || journey.organizationId !== session.user.organizationId) {
            return NextResponse.json({ error: 'Journey not found' }, { status: 404 });
        }

        return NextResponse.json(journey);
    } catch (error) {
        console.error('Error fetching journey:', error);
        return NextResponse.json({ error: 'Failed to fetch journey' }, { status: 500 });
    }
}

// PUT /api/journeys/[id] - Update journey
export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession();
        if (!session?.user?.organizationId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const journey = journeys.get(params.id);

        if (!journey || journey.organizationId !== session.user.organizationId) {
            return NextResponse.json({ error: 'Journey not found' }, { status: 404 });
        }

        if (journey.status === 'active') {
            return NextResponse.json({ error: 'Cannot edit active journey. Pause it first.' }, { status: 400 });
        }

        const body = await request.json();
        const { name, description, nodes, edges, settings } = body;

        // Update journey
        const updated: Journey = {
            ...journey,
            name: name || journey.name,
            description: description ?? journey.description,
            nodes: nodes || journey.nodes,
            edges: edges || journey.edges,
            settings: settings ? { ...journey.settings, ...settings } : journey.settings,
            updatedAt: new Date()
        };

        journeys.set(params.id, updated);

        return NextResponse.json(updated);
    } catch (error) {
        console.error('Error updating journey:', error);
        return NextResponse.json({ error: 'Failed to update journey' }, { status: 500 });
    }
}

// PATCH /api/journeys/[id] - Update journey status
export async function PATCH(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession();
        if (!session?.user?.organizationId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const journey = journeys.get(params.id);

        if (!journey || journey.organizationId !== session.user.organizationId) {
            return NextResponse.json({ error: 'Journey not found' }, { status: 404 });
        }

        const body = await request.json();
        const { status } = body as { status: JourneyStatus };

        // Validate status transitions
        const validTransitions: Record<JourneyStatus, JourneyStatus[]> = {
            draft: ['active', 'archived'],
            active: ['paused', 'completed', 'archived'],
            paused: ['active', 'archived'],
            completed: ['archived'],
            archived: []
        };

        if (!validTransitions[journey.status].includes(status)) {
            return NextResponse.json({
                error: `Cannot transition from ${journey.status} to ${status}`
            }, { status: 400 });
        }

        // Validate journey before activating
        if (status === 'active') {
            const validation = validateJourney(journey);
            if (!validation.valid) {
                return NextResponse.json({
                    error: 'Journey validation failed',
                    details: validation.errors
                }, { status: 400 });
            }
        }

        // Update status
        journey.status = status;
        journey.updatedAt = new Date();
        journeys.set(params.id, journey);

        return NextResponse.json({
            success: true,
            journey,
            message: `Journey ${status === 'active' ? 'activated' : status}`
        });
    } catch (error) {
        console.error('Error updating journey status:', error);
        return NextResponse.json({ error: 'Failed to update journey status' }, { status: 500 });
    }
}

// DELETE /api/journeys/[id] - Delete journey
export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession();
        if (!session?.user?.organizationId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const journey = journeys.get(params.id);

        if (!journey || journey.organizationId !== session.user.organizationId) {
            return NextResponse.json({ error: 'Journey not found' }, { status: 404 });
        }

        if (journey.status === 'active') {
            return NextResponse.json({ error: 'Cannot delete active journey' }, { status: 400 });
        }

        journeys.delete(params.id);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting journey:', error);
        return NextResponse.json({ error: 'Failed to delete journey' }, { status: 500 });
    }
}

/**
 * Validate journey before activation
 */
function validateJourney(journey: Journey): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Must have at least one trigger
    const hasTrigger = journey.nodes.some(n => n.type === 'trigger');
    if (!hasTrigger) {
        errors.push('Journey must have a trigger node');
    }

    // Must have at least one end node
    const hasEnd = journey.nodes.some(n => n.type === 'end');
    if (!hasEnd) {
        errors.push('Journey must have an end node');
    }

    // All nodes must be connected
    const connectedNodes = new Set<string>();
    for (const edge of journey.edges) {
        connectedNodes.add(edge.source);
        connectedNodes.add(edge.target);
    }

    const orphanNodes = journey.nodes.filter(n =>
        n.type !== 'trigger' && !connectedNodes.has(n.id)
    );

    if (orphanNodes.length > 0) {
        errors.push(`Orphan nodes found: ${orphanNodes.map(n => n.data.name || n.id).join(', ')}`);
    }

    // Action nodes must have valid config
    for (const node of journey.nodes) {
        if (node.type === 'action') {
            const data = node.data as { nodeType: string; actionType: string; config: Record<string, unknown> };
            if (!data.actionType) {
                errors.push(`Action node "${data.name || node.id}" has no action type`);
            }
        }
    }

    return {
        valid: errors.length === 0,
        errors
    };
}
