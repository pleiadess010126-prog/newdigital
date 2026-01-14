// =============================================================================
// TWILIO SMS SERVICE - Send SMS and WhatsApp messages
// =============================================================================

import { prisma } from '@/lib/db/prisma';

// Twilio configuration
interface TwilioConfig {
    accountSid: string;
    authToken: string;
    fromNumber: string;
    whatsappNumber?: string;
}

interface SMSMessage {
    to: string;
    body: string;
    mediaUrl?: string;
}

interface SMSResult {
    success: boolean;
    messageId?: string;
    error?: string;
    status?: string;
}

interface SMSCampaign {
    id: string;
    organizationId: string;
    name: string;
    message: string;
    channel: 'sms' | 'whatsapp';
    status: 'draft' | 'scheduled' | 'sending' | 'sent' | 'failed';
    scheduledFor?: Date;
    sentAt?: Date;
    recipientCount: number;
    deliveredCount: number;
    failedCount: number;
    createdAt: Date;
}

/**
 * Twilio SMS/WhatsApp Service
 */
export class TwilioService {
    private config: TwilioConfig;
    private baseUrl: string;

    constructor(config?: Partial<TwilioConfig>) {
        this.config = {
            accountSid: config?.accountSid || process.env.TWILIO_ACCOUNT_SID || '',
            authToken: config?.authToken || process.env.TWILIO_AUTH_TOKEN || '',
            fromNumber: config?.fromNumber || process.env.TWILIO_PHONE_NUMBER || '',
            whatsappNumber: config?.whatsappNumber || process.env.TWILIO_WHATSAPP_NUMBER
        };
        this.baseUrl = `https://api.twilio.com/2010-04-01/Accounts/${this.config.accountSid}`;
    }

    /**
     * Send an SMS message
     */
    async sendSMS(message: SMSMessage): Promise<SMSResult> {
        if (!this.config.accountSid || !this.config.authToken) {
            return { success: false, error: 'Twilio credentials not configured' };
        }

        try {
            const formData = new URLSearchParams();
            formData.append('To', this.formatPhoneNumber(message.to));
            formData.append('From', this.config.fromNumber);
            formData.append('Body', message.body);

            if (message.mediaUrl) {
                formData.append('MediaUrl', message.mediaUrl);
            }

            const response = await fetch(`${this.baseUrl}/Messages.json`, {
                method: 'POST',
                headers: {
                    'Authorization': `Basic ${Buffer.from(`${this.config.accountSid}:${this.config.authToken}`).toString('base64')}`,
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: formData
            });

            const data = await response.json();

            if (response.ok) {
                return {
                    success: true,
                    messageId: data.sid,
                    status: data.status
                };
            }

            return {
                success: false,
                error: data.message || 'Failed to send SMS'
            };
        } catch (error) {
            console.error('Twilio SMS error:', error);
            return { success: false, error: (error as Error).message };
        }
    }

    /**
     * Send a WhatsApp message
     */
    async sendWhatsApp(message: SMSMessage): Promise<SMSResult> {
        if (!this.config.accountSid || !this.config.authToken) {
            return { success: false, error: 'Twilio credentials not configured' };
        }

        try {
            const whatsappFrom = this.config.whatsappNumber || this.config.fromNumber;

            const formData = new URLSearchParams();
            formData.append('To', `whatsapp:${this.formatPhoneNumber(message.to)}`);
            formData.append('From', `whatsapp:${whatsappFrom}`);
            formData.append('Body', message.body);

            if (message.mediaUrl) {
                formData.append('MediaUrl', message.mediaUrl);
            }

            const response = await fetch(`${this.baseUrl}/Messages.json`, {
                method: 'POST',
                headers: {
                    'Authorization': `Basic ${Buffer.from(`${this.config.accountSid}:${this.config.authToken}`).toString('base64')}`,
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: formData
            });

            const data = await response.json();

            if (response.ok) {
                return {
                    success: true,
                    messageId: data.sid,
                    status: data.status
                };
            }

            return {
                success: false,
                error: data.message || 'Failed to send WhatsApp message'
            };
        } catch (error) {
            console.error('Twilio WhatsApp error:', error);
            return { success: false, error: (error as Error).message };
        }
    }

    /**
     * Send bulk SMS messages
     */
    async sendBulkSMS(
        recipients: Array<{ phone: string; contactId?: string }>,
        message: string,
        channel: 'sms' | 'whatsapp' = 'sms'
    ): Promise<{ sent: number; failed: number; results: SMSResult[] }> {
        const results: SMSResult[] = [];
        let sent = 0;
        let failed = 0;

        // Rate limit: 1 message per 100ms to avoid Twilio limits
        for (const recipient of recipients) {
            const result = channel === 'whatsapp'
                ? await this.sendWhatsApp({ to: recipient.phone, body: message })
                : await this.sendSMS({ to: recipient.phone, body: message });

            results.push(result);

            if (result.success) {
                sent++;
                // Log activity if contact ID provided
                if (recipient.contactId) {
                    try {
                        await prisma.contactActivity.create({
                            data: {
                                contactId: recipient.contactId,
                                type: `${channel}_sent`,
                                description: `${channel.toUpperCase()} sent: ${message.substring(0, 50)}...`,
                                metadata: { messageId: result.messageId }
                            }
                        });
                    } catch (e) {
                        // Ignore logging errors
                    }
                }
            } else {
                failed++;
            }

            // Rate limiting delay
            await new Promise(resolve => setTimeout(resolve, 100));
        }

        return { sent, failed, results };
    }

    /**
     * Get message status
     */
    async getMessageStatus(messageId: string): Promise<{ status: string; error?: string }> {
        try {
            const response = await fetch(`${this.baseUrl}/Messages/${messageId}.json`, {
                headers: {
                    'Authorization': `Basic ${Buffer.from(`${this.config.accountSid}:${this.config.authToken}`).toString('base64')}`
                }
            });

            const data = await response.json();
            return { status: data.status };
        } catch (error) {
            return { status: 'unknown', error: (error as Error).message };
        }
    }

    /**
     * Handle incoming webhook (delivery status, replies)
     */
    async handleWebhook(payload: Record<string, string>): Promise<void> {
        const {
            MessageSid,
            MessageStatus,
            To,
            From,
            Body
        } = payload;

        console.log(`[SMS Webhook] ${MessageSid}: ${MessageStatus}`);

        // Handle delivery status updates
        if (MessageStatus) {
            // Update message status in database
            // In production, update the SMS recipient record
        }

        // Handle incoming messages (replies)
        if (Body && From) {
            console.log(`[SMS Reply] From ${From}: ${Body}`);
            // Create activity, trigger automation, etc.
        }
    }

    /**
     * Format phone number to E.164 format
     */
    private formatPhoneNumber(phone: string): string {
        // Remove all non-digit characters
        let cleaned = phone.replace(/\D/g, '');

        // Add country code if missing (default to US +1)
        if (cleaned.length === 10) {
            cleaned = '1' + cleaned;
        }

        return '+' + cleaned;
    }

    /**
     * Validate phone number
     */
    static isValidPhone(phone: string): boolean {
        const cleaned = phone.replace(/\D/g, '');
        return cleaned.length >= 10 && cleaned.length <= 15;
    }
}

// Singleton instance
let twilioInstance: TwilioService | null = null;

export function getTwilioService(): TwilioService {
    if (!twilioInstance) {
        twilioInstance = new TwilioService();
    }
    return twilioInstance;
}

/**
 * Quick send functions
 */
export async function sendSMS(to: string, body: string): Promise<SMSResult> {
    return getTwilioService().sendSMS({ to, body });
}

export async function sendWhatsApp(to: string, body: string): Promise<SMSResult> {
    return getTwilioService().sendWhatsApp({ to, body });
}
