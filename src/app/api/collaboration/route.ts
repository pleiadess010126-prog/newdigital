// =============================================================================
// COLLABORATION API - Team Workflow & Approval Endpoints
// =============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session.server';
import { getCollaborationEngine } from '@/lib/collaboration/engine';

// GET - Get collaboration data
export async function GET(request: NextRequest) {
    try {
        const session = await getSession();
        if (!session?.user?.organizationId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const orgId = session.user.organizationId;
        const engine = getCollaborationEngine(orgId);
        const { searchParams } = new URL(request.url);
        const action = searchParams.get('action') || 'queue';

        switch (action) {
            case 'queue': {
                const status = searchParams.get('status')?.split(',') as any;
                const assignedTo = searchParams.get('assignedTo') || undefined;
                const type = searchParams.get('type') || undefined;

                const queue = engine.getApprovalQueue({ status, assignedTo, type });
                return NextResponse.json({ queue });
            }

            case 'team': {
                const teamMembers = engine.getTeamMembers();
                return NextResponse.json({ teamMembers });
            }

            case 'notifications': {
                const userId = session.user.id;
                const unreadOnly = searchParams.get('unreadOnly') === 'true';
                const notifications = engine.getNotifications(userId, unreadOnly);
                return NextResponse.json({ notifications });
            }

            case 'workflows': {
                const workflows = engine.getWorkflows();
                return NextResponse.json({ workflows });
            }

            case 'stats': {
                const stats = engine.getCollaborationStats();
                return NextResponse.json({ stats });
            }

            case 'item': {
                const itemId = searchParams.get('itemId');
                if (!itemId) {
                    return NextResponse.json({ error: 'Item ID required' }, { status: 400 });
                }
                const item = engine.getApprovalItem(itemId);
                if (!item) {
                    return NextResponse.json({ error: 'Item not found' }, { status: 404 });
                }
                return NextResponse.json({ item });
            }

            default:
                return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
        }
    } catch (error) {
        console.error('Collaboration GET error:', error);
        return NextResponse.json({ error: 'Failed to get collaboration data' }, { status: 500 });
    }
}

// POST - Take actions on collaboration items
export async function POST(request: NextRequest) {
    try {
        const session = await getSession();
        if (!session?.user?.organizationId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const orgId = session.user.organizationId;
        const userId = session.user.id;
        const engine = getCollaborationEngine(orgId);
        const body = await request.json();
        const { action } = body;

        switch (action) {
            case 'submit': {
                const { type, title, description, content, metadata, source, aiConfidence, priority, deadline, workflowId } = body;
                const item = engine.submitForApproval({
                    type,
                    title,
                    description,
                    content,
                    metadata,
                    source: source || 'manual',
                    aiConfidence,
                    createdBy: userId,
                    priority,
                    deadline: deadline ? new Date(deadline) : undefined,
                    workflowId,
                });
                return NextResponse.json({ success: true, item });
            }

            case 'approve':
            case 'reject':
            case 'request_changes':
            case 'skip': {
                const { itemId } = body;
                const result = engine.takeAction(itemId, userId, action);
                return NextResponse.json(result);
            }

            case 'comment': {
                const { itemId, content } = body;
                const comment = engine.addComment(itemId, userId, content);
                if (!comment) {
                    return NextResponse.json({ success: false, message: 'Failed to add comment' }, { status: 400 });
                }
                return NextResponse.json({ success: true, comment });
            }

            case 'markRead': {
                const { notificationId } = body;
                const success = engine.markNotificationRead(notificationId);
                return NextResponse.json({ success });
            }

            case 'addTeamMember': {
                const { name, email, role, permissions } = body;
                const member = engine.addTeamMember({ name, email, role, permissions });
                return NextResponse.json({ success: true, member });
            }

            case 'updateTeamMember': {
                const { memberId, updates } = body;
                const member = engine.updateTeamMember(memberId, updates);
                if (!member) {
                    return NextResponse.json({ success: false, message: 'Member not found' }, { status: 404 });
                }
                return NextResponse.json({ success: true, member });
            }

            default:
                return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
        }
    } catch (error) {
        console.error('Collaboration POST error:', error);
        return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
    }
}
