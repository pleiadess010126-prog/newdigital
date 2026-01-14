// =============================================================================
// SINGLE EMAIL CAMPAIGN API - Read, Update, Delete, Send
// =============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { getSession as getServerSession } from '@/lib/auth/session.server';
import { sendBulkEmails } from '@/lib/email';

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession();
        if (!session?.user?.organizationId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const campaign = await prisma.emailCampaign.findFirst({
            where: {
                id: params.id,
                organizationId: session.user.organizationId,
            },
            include: {
                metrics: true,
                recipients: {
                    take: 100,
                    orderBy: { createdAt: 'desc' },
                },
                _count: {
                    select: { recipients: true },
                },
            },
        });

        if (!campaign) {
            return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
        }

        return NextResponse.json(campaign);
    } catch (error) {
        console.error('Error fetching campaign:', error);
        return NextResponse.json({ error: 'Failed to fetch campaign' }, { status: 500 });
    }
}

export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession();
        if (!session?.user?.organizationId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { name, subject, preheader, content, htmlContent, fromName, fromEmail, replyTo, scheduledAt } = body;

        // Verify ownership
        const existing = await prisma.emailCampaign.findFirst({
            where: {
                id: params.id,
                organizationId: session.user.organizationId,
            },
        });

        if (!existing) {
            return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
        }

        if (existing.status === 'sent' || existing.status === 'sending') {
            return NextResponse.json({ error: 'Cannot edit a sent or sending campaign' }, { status: 400 });
        }

        const campaign = await prisma.emailCampaign.update({
            where: { id: params.id },
            data: {
                name,
                subject,
                preheader,
                content,
                htmlContent,
                fromName,
                fromEmail,
                replyTo,
                scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
                status: scheduledAt ? 'scheduled' : existing.status,
            },
        });

        return NextResponse.json(campaign);
    } catch (error) {
        console.error('Error updating campaign:', error);
        return NextResponse.json({ error: 'Failed to update campaign' }, { status: 500 });
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession();
        if (!session?.user?.organizationId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const campaign = await prisma.emailCampaign.findFirst({
            where: {
                id: params.id,
                organizationId: session.user.organizationId,
            },
        });

        if (!campaign) {
            return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
        }

        if (campaign.status === 'sending') {
            return NextResponse.json({ error: 'Cannot delete a campaign that is currently sending' }, { status: 400 });
        }

        await prisma.emailCampaign.delete({
            where: { id: params.id },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting campaign:', error);
        return NextResponse.json({ error: 'Failed to delete campaign' }, { status: 500 });
    }
}
