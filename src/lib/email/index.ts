// =============================================================================
// EMAIL SERVICE - SendGrid Integration for DigitalMEng
// =============================================================================

import { prisma } from '@/lib/db/prisma';

// Types
export interface EmailOptions {
    to: string | string[];
    from?: string;
    fromName?: string;
    subject: string;
    html: string;
    text?: string;
    replyTo?: string;
    trackOpens?: boolean;
    trackClicks?: boolean;
    campaignId?: string;
    contactId?: string;
}

export interface BulkEmailResult {
    success: boolean;
    sent: number;
    failed: number;
    errors: Array<{ email: string; error: string }>;
}

export interface EmailEvent {
    type: 'delivered' | 'opened' | 'clicked' | 'bounced' | 'unsubscribed' | 'spam';
    email: string;
    timestamp: Date;
    campaignId?: string;
    url?: string;
    reason?: string;
}

// Default sender configuration
const DEFAULT_FROM_EMAIL = process.env.EMAIL_FROM || 'noreply@digitalmeng.com';
const DEFAULT_FROM_NAME = process.env.EMAIL_FROM_NAME || 'DigitalMEng';

/**
 * Send a single email using SendGrid
 */
export async function sendEmail(options: EmailOptions): Promise<{ success: boolean; messageId?: string; error?: string }> {
    const sendgridApiKey = process.env.SENDGRID_API_KEY;

    if (!sendgridApiKey) {
        console.warn('SendGrid API key not configured. Email not sent.');
        return { success: false, error: 'Email service not configured' };
    }

    try {
        const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${sendgridApiKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                personalizations: [{
                    to: Array.isArray(options.to)
                        ? options.to.map(email => ({ email }))
                        : [{ email: options.to }],
                }],
                from: {
                    email: options.from || DEFAULT_FROM_EMAIL,
                    name: options.fromName || DEFAULT_FROM_NAME,
                },
                reply_to: options.replyTo ? { email: options.replyTo } : undefined,
                subject: options.subject,
                content: [
                    { type: 'text/plain', value: options.text || stripHtml(options.html) },
                    { type: 'text/html', value: options.html },
                ],
                tracking_settings: {
                    click_tracking: { enable: options.trackClicks !== false },
                    open_tracking: { enable: options.trackOpens !== false },
                },
                custom_args: {
                    campaign_id: options.campaignId,
                    contact_id: options.contactId,
                },
            }),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.errors?.[0]?.message || `SendGrid error: ${response.status}`);
        }

        const messageId = response.headers.get('x-message-id') || undefined;
        return { success: true, messageId };
    } catch (error) {
        console.error('Email send error:', error);
        return { success: false, error: (error as Error).message };
    }
}

/**
 * Send bulk emails for a campaign
 */
export async function sendBulkEmails(
    campaignId: string,
    recipients: Array<{ email: string; contactId: string; firstName?: string; lastName?: string }>,
    emailContent: {
        subject: string;
        html: string;
        fromName?: string;
        fromEmail?: string;
        replyTo?: string;
    }
): Promise<BulkEmailResult> {
    const results: BulkEmailResult = {
        success: true,
        sent: 0,
        failed: 0,
        errors: [],
    };

    // Process in batches of 100 (SendGrid limit)
    const batchSize = 100;
    for (let i = 0; i < recipients.length; i += batchSize) {
        const batch = recipients.slice(i, i + batchSize);

        const promises = batch.map(async (recipient) => {
            // Personalize email content
            const personalizedHtml = personalizeContent(emailContent.html, {
                firstName: recipient.firstName || '',
                lastName: recipient.lastName || '',
                email: recipient.email,
            });

            const result = await sendEmail({
                to: recipient.email,
                subject: emailContent.subject,
                html: personalizedHtml,
                fromName: emailContent.fromName,
                from: emailContent.fromEmail,
                replyTo: emailContent.replyTo,
                campaignId,
                contactId: recipient.contactId,
            });

            return { recipient, result };
        });

        const batchResults = await Promise.all(promises);

        for (const { recipient, result } of batchResults) {
            if (result.success) {
                results.sent++;
                // Update recipient status
                await prisma.emailRecipient.update({
                    where: {
                        campaignId_contactId: {
                            campaignId,
                            contactId: recipient.contactId,
                        },
                    },
                    data: {
                        status: 'sent',
                        sentAt: new Date(),
                    },
                });
            } else {
                results.failed++;
                results.errors.push({ email: recipient.email, error: result.error || 'Unknown error' });
            }
        }

        // Rate limiting: wait 100ms between batches
        if (i + batchSize < recipients.length) {
            await new Promise(resolve => setTimeout(resolve, 100));
        }
    }

    results.success = results.failed === 0;
    return results;
}

/**
 * Process webhook events from SendGrid
 */
export async function processEmailEvent(event: EmailEvent): Promise<void> {
    if (!event.campaignId) return;

    try {
        // Find the recipient
        const recipient = await prisma.emailRecipient.findFirst({
            where: {
                campaignId: event.campaignId,
                email: event.email,
            },
        });

        if (!recipient) return;

        // Update recipient status based on event type
        const updateData: Record<string, unknown> = {};

        switch (event.type) {
            case 'delivered':
                updateData.status = 'delivered';
                updateData.deliveredAt = event.timestamp;
                break;
            case 'opened':
                updateData.status = 'opened';
                updateData.openedAt = updateData.openedAt || event.timestamp;
                updateData.openCount = { increment: 1 };
                break;
            case 'clicked':
                updateData.status = 'clicked';
                updateData.clickedAt = updateData.clickedAt || event.timestamp;
                updateData.clickCount = { increment: 1 };
                if (event.url) {
                    const currentLinks = (recipient.clickedLinks as string[]) || [];
                    if (!currentLinks.includes(event.url)) {
                        updateData.clickedLinks = [...currentLinks, event.url];
                    }
                }
                break;
            case 'bounced':
                updateData.status = 'bounced';
                updateData.bouncedAt = event.timestamp;
                updateData.bounceReason = event.reason;
                break;
            case 'unsubscribed':
                updateData.status = 'unsubscribed';
                updateData.unsubscribedAt = event.timestamp;
                // Also update the contact
                await prisma.contact.update({
                    where: { id: recipient.contactId },
                    data: { unsubscribedAt: event.timestamp },
                });
                break;
            case 'spam':
                updateData.status = 'spam';
                break;
        }

        await prisma.emailRecipient.update({
            where: { id: recipient.id },
            data: updateData as Record<string, unknown>,
        });

        // Update campaign metrics
        await updateCampaignMetrics(event.campaignId);

        // Log activity
        await prisma.contactActivity.create({
            data: {
                contactId: recipient.contactId,
                type: `email_${event.type}`,
                description: `Email ${event.type}: ${event.email}`,
                metadata: { campaignId: event.campaignId, url: event.url },
            },
        });
    } catch (error) {
        console.error('Error processing email event:', error);
    }
}

/**
 * Update aggregated campaign metrics
 */
export async function updateCampaignMetrics(campaignId: string): Promise<void> {
    const recipients = await prisma.emailRecipient.findMany({
        where: { campaignId },
    });

    const metrics = {
        sent: recipients.filter(r => r.status !== 'pending').length,
        delivered: recipients.filter(r => ['delivered', 'opened', 'clicked'].includes(r.status)).length,
        opened: recipients.filter(r => ['opened', 'clicked'].includes(r.status)).length,
        uniqueOpened: recipients.filter(r => r.openedAt !== null).length,
        clicked: recipients.filter(r => r.status === 'clicked').length,
        uniqueClicked: recipients.filter(r => r.clickedAt !== null).length,
        bounced: recipients.filter(r => r.status === 'bounced').length,
        unsubscribed: recipients.filter(r => r.status === 'unsubscribed').length,
        spamReports: recipients.filter(r => r.status === 'spam').length,
    };

    const total = metrics.sent || 1;
    const delivered = metrics.delivered || 1;

    await prisma.emailMetric.upsert({
        where: { campaignId },
        create: {
            campaignId,
            ...metrics,
            openRate: (metrics.uniqueOpened / delivered) * 100,
            clickRate: (metrics.uniqueClicked / delivered) * 100,
            bounceRate: (metrics.bounced / total) * 100,
            unsubscribeRate: (metrics.unsubscribed / delivered) * 100,
        },
        update: {
            ...metrics,
            openRate: (metrics.uniqueOpened / delivered) * 100,
            clickRate: (metrics.uniqueClicked / delivered) * 100,
            bounceRate: (metrics.bounced / total) * 100,
            unsubscribeRate: (metrics.unsubscribed / delivered) * 100,
        },
    });
}

/**
 * Personalize email content with merge tags
 */
export function personalizeContent(
    content: string,
    data: Record<string, string>
): string {
    let result = content;

    // Replace merge tags like {{firstName}}, {{lastName}}, {{email}}
    for (const [key, value] of Object.entries(data)) {
        const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'gi');
        result = result.replace(regex, value);
    }

    // Add unsubscribe link
    const unsubscribeUrl = `${process.env.NEXT_PUBLIC_APP_URL}/unsubscribe?email=${encodeURIComponent(data.email || '')}`;
    result = result.replace(/{{unsubscribe_url}}/gi, unsubscribeUrl);

    return result;
}

/**
 * Strip HTML tags from content (for plain text version)
 */
function stripHtml(html: string): string {
    return html
        .replace(/<style[^>]*>.*?<\/style>/gis, '')
        .replace(/<script[^>]*>.*?<\/script>/gis, '')
        .replace(/<[^>]+>/g, '')
        .replace(/\s+/g, ' ')
        .trim();
}

/**
 * Validate email address format
 */
export function isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Generate email preview text from HTML
 */
export function generatePreviewText(html: string, maxLength: number = 150): string {
    const text = stripHtml(html);
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength - 3) + '...';
}
