// =============================================================================
// SMS CAMPAIGNS API - Send SMS and WhatsApp campaigns
// =============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { getSession as getServerSession } from '@/lib/auth/session.server';
import { prisma } from '@/lib/db/prisma';
import { getTwilioService, TwilioService } from '@/lib/sms/twilio';

// In-memory store for demo
const smsCampaigns: Map<string, any> = new Map();

// GET /api/sms/campaigns - List SMS campaigns
export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession();
        if (!session?.user?.organizationId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Get campaigns for organization
        let campaigns = Array.from(smsCampaigns.values()).filter(
            c => c.organizationId === session.user.organizationId
        );

        // Add demo campaigns if none exist
        if (campaigns.length === 0) {
            campaigns = [
                {
                    id: 'demo-sms-1',
                    organizationId: session.user.organizationId,
                    name: 'Flash Sale Alert',
                    message: '🔥 FLASH SALE! 50% off everything for the next 24 hours. Shop now: https://bit.ly/sale',
                    channel: 'sms',
                    status: 'sent',
                    scheduledFor: null,
                    sentAt: new Date('2026-01-12T10:00:00'),
                    recipientCount: 1250,
                    deliveredCount: 1198,
                    failedCount: 52,
                    clickCount: 312,
                    createdAt: new Date('2026-01-12')
                },
                {
                    id: 'demo-sms-2',
                    organizationId: session.user.organizationId,
                    name: 'Order Confirmation',
                    message: 'Thanks for your order! Track your package: {{tracking_url}}',
                    channel: 'sms',
                    status: 'active',
                    scheduledFor: null,
                    sentAt: null,
                    recipientCount: 523,
                    deliveredCount: 523,
                    failedCount: 0,
                    clickCount: 89,
                    createdAt: new Date('2026-01-10')
                },
                {
                    id: 'demo-wa-1',
                    organizationId: session.user.organizationId,
                    name: 'Product Launch',
                    message: '🚀 Exciting news! Our new product is here. Be the first to check it out!',
                    channel: 'whatsapp',
                    status: 'draft',
                    scheduledFor: new Date('2026-01-15T09:00:00'),
                    sentAt: null,
                    recipientCount: 0,
                    deliveredCount: 0,
                    failedCount: 0,
                    clickCount: 0,
                    createdAt: new Date('2026-01-13')
                }
            ];
        }

        // Calculate stats
        const stats = {
            totalCampaigns: campaigns.length,
            totalSent: campaigns.reduce((sum, c) => sum + c.deliveredCount, 0),
            totalClicks: campaigns.reduce((sum, c) => sum + (c.clickCount || 0), 0),
            averageDeliveryRate: campaigns.length > 0
                ? Math.round(campaigns.reduce((sum, c) => {
                    const total = c.recipientCount || 1;
                    return sum + (c.deliveredCount / total);
                }, 0) / campaigns.length * 100)
                : 0
        };

        return NextResponse.json({ campaigns, stats });
    } catch (error) {
        console.error('SMS campaigns error:', error);
        return NextResponse.json({ error: 'Failed to fetch campaigns' }, { status: 500 });
    }
}

// POST /api/sms/campaigns - Create or send SMS campaign
export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession();
        if (!session?.user?.organizationId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { action, name, message, channel, contactIds, scheduleFor } = body;

        if (action === 'send' || action === 'send-now') {
            // Send immediately
            if (!message) {
                return NextResponse.json({ error: 'Message is required' }, { status: 400 });
            }

            // Get recipients
            let recipients: Array<{ phone: string; contactId: string }> = [];

            if (contactIds && contactIds.length > 0) {
                const contacts = await prisma.contact.findMany({
                    where: {
                        id: { in: contactIds },
                        organizationId: session.user.organizationId,
                        phone: { not: null }
                    },
                    select: { id: true, phone: true }
                });
                recipients = contacts
                    .filter((c: { id: string; phone: string | null }) => c.phone && TwilioService.isValidPhone(c.phone))
                    .map((c: { id: string; phone: string | null }) => ({ phone: c.phone!, contactId: c.id }));
            } else {
                // Get all contacts with phone numbers
                const contacts = await prisma.contact.findMany({
                    where: {
                        organizationId: session.user.organizationId,
                        phone: { not: null },
                        unsubscribedAt: null
                    },
                    select: { id: true, phone: true },
                    take: 1000
                });
                recipients = contacts
                    .filter((c: { id: string; phone: string | null }) => c.phone && TwilioService.isValidPhone(c.phone))
                    .map((c: { id: string; phone: string | null }) => ({ phone: c.phone!, contactId: c.id }));
            }

            if (recipients.length === 0) {
                return NextResponse.json({ error: 'No valid recipients found' }, { status: 400 });
            }

            // Send messages
            const twilio = getTwilioService();
            const result = await twilio.sendBulkSMS(
                recipients,
                message,
                channel === 'whatsapp' ? 'whatsapp' : 'sms'
            );

            // Create campaign record
            const campaign = {
                id: `sms_${Date.now()}`,
                organizationId: session.user.organizationId,
                name: name || `${channel === 'whatsapp' ? 'WhatsApp' : 'SMS'} Campaign ${new Date().toLocaleDateString()}`,
                message,
                channel: channel || 'sms',
                status: 'sent',
                sentAt: new Date(),
                recipientCount: recipients.length,
                deliveredCount: result.sent,
                failedCount: result.failed,
                createdAt: new Date()
            };

            smsCampaigns.set(campaign.id, campaign);

            return NextResponse.json({
                success: true,
                campaign,
                result: {
                    sent: result.sent,
                    failed: result.failed
                }
            });
        }

        // Create draft campaign
        if (!name || !message) {
            return NextResponse.json({ error: 'Name and message are required' }, { status: 400 });
        }

        const campaign = {
            id: `sms_${Date.now()}`,
            organizationId: session.user.organizationId,
            name,
            message,
            channel: channel || 'sms',
            status: scheduleFor ? 'scheduled' : 'draft',
            scheduledFor: scheduleFor ? new Date(scheduleFor) : null,
            recipientCount: 0,
            deliveredCount: 0,
            failedCount: 0,
            createdAt: new Date()
        };

        smsCampaigns.set(campaign.id, campaign);

        return NextResponse.json(campaign, { status: 201 });
    } catch (error) {
        console.error('SMS campaign error:', error);
        return NextResponse.json({ error: 'Failed to create campaign' }, { status: 500 });
    }
}
