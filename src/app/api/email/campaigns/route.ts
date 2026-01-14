// =============================================================================
// EMAIL CAMPAIGNS API - CRUD Operations
// =============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { getSession as getServerSession } from '@/lib/auth/session.server';

export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession();
        if (!session?.user?.organizationId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const status = searchParams.get('status');
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '10');
        const skip = (page - 1) * limit;

        const where = {
            organizationId: session.user.organizationId,
            ...(status && { status: status as 'draft' | 'scheduled' | 'sending' | 'sent' | 'paused' | 'cancelled' }),
        };

        const [campaigns, total] = await Promise.all([
            prisma.emailCampaign.findMany({
                where,
                include: {
                    metrics: true,
                    _count: {
                        select: { recipients: true },
                    },
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
            }),
            prisma.emailCampaign.count({ where }),
        ]);

        return NextResponse.json({
            campaigns,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        console.error('Error fetching campaigns:', error);
        return NextResponse.json({ error: 'Failed to fetch campaigns' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession();
        if (!session?.user?.organizationId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { name, subject, preheader, content, htmlContent, fromName, fromEmail, replyTo } = body;

        if (!name || !subject) {
            return NextResponse.json({ error: 'Name and subject are required' }, { status: 400 });
        }

        const campaign = await prisma.emailCampaign.create({
            data: {
                organizationId: session.user.organizationId,
                name,
                subject,
                preheader: preheader || '',
                content: content || '',
                htmlContent: htmlContent || getDefaultEmailTemplate(subject),
                fromName,
                fromEmail,
                replyTo,
                status: 'draft',
            },
        });

        // Create initial metrics record
        await prisma.emailMetric.create({
            data: { campaignId: campaign.id },
        });

        return NextResponse.json(campaign, { status: 201 });
    } catch (error) {
        console.error('Error creating campaign:', error);
        return NextResponse.json({ error: 'Failed to create campaign' }, { status: 500 });
    }
}

function getDefaultEmailTemplate(subject: string): string {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { text-align: center; padding: 20px 0; }
    .content { padding: 20px 0; }
    .footer { text-align: center; padding: 20px 0; font-size: 12px; color: #666; border-top: 1px solid #eee; }
    .button { display: inline-block; padding: 12px 24px; background: #8B5CF6; color: white; text-decoration: none; border-radius: 6px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>${subject}</h1>
    </div>
    <div class="content">
      <p>Hello {{firstName}},</p>
      <p>Your email content goes here...</p>
    </div>
    <div class="footer">
      <p>© ${new Date().getFullYear()} DigitalMEng. All rights reserved.</p>
      <p><a href="{{unsubscribe_url}}">Unsubscribe</a></p>
    </div>
  </div>
</body>
</html>`;
}
