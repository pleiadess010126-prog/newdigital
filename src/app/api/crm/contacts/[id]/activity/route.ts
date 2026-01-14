// =============================================================================
// CONTACT ACTIVITY API - Track and retrieve contact activities
// =============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { getSession } from '@/lib/auth/session.server';

// GET /api/crm/contacts/[id]/activity - Get contact activity timeline
export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getSession();
        if (!session?.user?.organizationId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const limit = parseInt(searchParams.get('limit') || '50');
        const offset = parseInt(searchParams.get('offset') || '0');
        const type = searchParams.get('type');

        // Verify contact belongs to organization
        const contact = await prisma.contact.findFirst({
            where: {
                id: params.id,
                organizationId: session.user.organizationId
            },
            select: { id: true, email: true, firstName: true, lastName: true }
        });

        if (!contact) {
            return NextResponse.json({ error: 'Contact not found' }, { status: 404 });
        }

        // Get activities
        const where: any = { contactId: params.id };
        if (type) {
            where.type = type;
        }

        const [activities, total] = await Promise.all([
            prisma.contactActivity.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                skip: offset,
                take: limit
            }),
            prisma.contactActivity.count({ where })
        ]);

        // Also get email engagement summary
        const emailStats = await prisma.emailRecipient.aggregate({
            where: { contactId: params.id },
            _sum: {
                openCount: true,
                clickCount: true
            },
            _count: true
        });

        // Get form submissions
        const formSubmissions = await prisma.formSubmission.findMany({
            where: { contactId: params.id },
            orderBy: { createdAt: 'desc' },
            take: 5,
            include: {
                form: {
                    select: { name: true }
                }
            }
        });

        return NextResponse.json({
            contact,
            activities,
            total,
            emailStats: {
                totalEmails: emailStats._count,
                totalOpens: emailStats._sum.openCount || 0,
                totalClicks: emailStats._sum.clickCount || 0
            },
            formSubmissions
        });
    } catch (error) {
        console.error('Activity fetch error:', error);
        return NextResponse.json({ error: 'Failed to fetch activities' }, { status: 500 });
    }
}

// POST /api/crm/contacts/[id]/activity - Log a new activity
export async function POST(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getSession();
        if (!session?.user?.organizationId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { type, description, metadata } = body;

        if (!type || !description) {
            return NextResponse.json({ error: 'Type and description required' }, { status: 400 });
        }

        // Verify contact belongs to organization
        const contact = await prisma.contact.findFirst({
            where: {
                id: params.id,
                organizationId: session.user.organizationId
            }
        });

        if (!contact) {
            return NextResponse.json({ error: 'Contact not found' }, { status: 404 });
        }

        // Create activity
        const activity = await prisma.contactActivity.create({
            data: {
                contactId: params.id,
                type,
                description,
                metadata: metadata || {}
            }
        });

        // Update contact's last activity timestamp
        await prisma.contact.update({
            where: { id: params.id },
            data: { lastActivityAt: new Date() }
        });

        return NextResponse.json(activity, { status: 201 });
    } catch (error) {
        console.error('Activity create error:', error);
        return NextResponse.json({ error: 'Failed to create activity' }, { status: 500 });
    }
}
