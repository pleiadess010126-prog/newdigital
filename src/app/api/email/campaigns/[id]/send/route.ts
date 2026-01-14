// =============================================================================
// SEND CAMPAIGN API - Trigger email campaign send
// =============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { getSession as getServerSession } from '@/lib/auth/session.server';
import { sendBulkEmails } from '@/lib/email';

export async function POST(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession();
        if (!session?.user?.organizationId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Get campaign with recipients
        const campaign = await prisma.emailCampaign.findFirst({
            where: {
                id: params.id,
                organizationId: session.user.organizationId,
            },
            include: {
                recipients: {
                    where: { status: 'pending' },
                    include: { contact: true },
                },
            },
        });

        if (!campaign) {
            return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
        }

        if (campaign.status === 'sent' || campaign.status === 'sending') {
            return NextResponse.json({ error: 'Campaign already sent or sending' }, { status: 400 });
        }

        if (campaign.recipients.length === 0) {
            return NextResponse.json({ error: 'No recipients in campaign' }, { status: 400 });
        }

        // Update campaign status to sending
        await prisma.emailCampaign.update({
            where: { id: params.id },
            data: { status: 'sending' },
        });

        // Send emails
        const recipients = campaign.recipients.map(r => ({
            email: r.email,
            contactId: r.contactId,
            firstName: r.contact.firstName || undefined,
            lastName: r.contact.lastName || undefined,
        }));

        const result = await sendBulkEmails(campaign.id, recipients, {
            subject: campaign.subject,
            html: campaign.htmlContent,
            fromName: campaign.fromName || undefined,
            fromEmail: campaign.fromEmail || undefined,
            replyTo: campaign.replyTo || undefined,
        });

        // Update campaign status
        await prisma.emailCampaign.update({
            where: { id: params.id },
            data: {
                status: 'sent',
                sentAt: new Date(),
            },
        });

        return NextResponse.json({
            success: true,
            sent: result.sent,
            failed: result.failed,
            errors: result.errors,
        });
    } catch (error) {
        console.error('Error sending campaign:', error);

        // Revert status on error
        await prisma.emailCampaign.update({
            where: { id: params.id },
            data: { status: 'draft' },
        }).catch(() => { });

        return NextResponse.json({ error: 'Failed to send campaign' }, { status: 500 });
    }
}
