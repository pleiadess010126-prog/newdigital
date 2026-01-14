// =============================================================================
// HUBSPOT CONNECTOR - Sync contacts bidirectionally with HubSpot CRM
// =============================================================================

import { prisma } from '@/lib/db/prisma';

// HubSpot API Types
interface HubSpotConfig {
    accessToken: string;
    refreshToken?: string;
    portalId?: string;
}

interface HubSpotContact {
    id?: string;
    properties: {
        email: string;
        firstname?: string;
        lastname?: string;
        phone?: string;
        company?: string;
        jobtitle?: string;
        lifecyclestage?: string;
        hs_lead_status?: string;
        hubspot_owner_id?: string;
    };
}

interface SyncResult {
    success: boolean;
    created: number;
    updated: number;
    failed: number;
    errors: Array<{ email: string; error: string }>;
}

const HUBSPOT_API_BASE = 'https://api.hubapi.com';

/**
 * HubSpot CRM Connector
 */
export class HubSpotConnector {
    private config: HubSpotConfig;
    private organizationId: string;

    constructor(config: HubSpotConfig, organizationId: string) {
        this.config = config;
        this.organizationId = organizationId;
    }

    /**
     * Test the connection to HubSpot
     */
    async testConnection(): Promise<{ success: boolean; message: string; portalId?: string }> {
        try {
            const response = await this.apiRequest('/account-info/v3/details');

            if (response.ok) {
                const data = await response.json();
                return {
                    success: true,
                    message: 'Successfully connected to HubSpot',
                    portalId: data.portalId?.toString()
                };
            }

            return { success: false, message: 'Failed to connect to HubSpot' };
        } catch (error) {
            return { success: false, message: (error as Error).message };
        }
    }

    /**
     * Get contacts from HubSpot
     */
    async getContacts(limit: number = 100, after?: string): Promise<{
        contacts: HubSpotContact[];
        hasMore: boolean;
        after?: string;
    }> {
        const params = new URLSearchParams({
            limit: limit.toString(),
            properties: 'email,firstname,lastname,phone,company,jobtitle,lifecyclestage,hs_lead_status'
        });

        if (after) {
            params.set('after', after);
        }

        const response = await this.apiRequest(`/crm/v3/objects/contacts?${params}`);

        if (!response.ok) {
            throw new Error('Failed to fetch contacts');
        }

        const data = await response.json();
        return {
            contacts: data.results || [],
            hasMore: !!data.paging?.next?.after,
            after: data.paging?.next?.after
        };
    }

    /**
     * Get a contact by email
     */
    async getContactByEmail(email: string): Promise<HubSpotContact | null> {
        try {
            const response = await this.apiRequest(
                '/crm/v3/objects/contacts/search',
                'POST',
                {
                    filterGroups: [{
                        filters: [{
                            propertyName: 'email',
                            operator: 'EQ',
                            value: email
                        }]
                    }],
                    properties: ['email', 'firstname', 'lastname', 'phone', 'company', 'jobtitle', 'lifecyclestage', 'hs_lead_status']
                }
            );

            if (!response.ok) {
                return null;
            }

            const data = await response.json();
            return data.results?.[0] || null;
        } catch (error) {
            return null;
        }
    }

    /**
     * Create a contact in HubSpot
     */
    async createContact(contact: any): Promise<{ success: boolean; id?: string; error?: string }> {
        try {
            const hubspotContact: HubSpotContact = {
                properties: {
                    email: contact.email,
                    firstname: contact.firstName || '',
                    lastname: contact.lastName || '',
                    phone: contact.phone || '',
                    company: contact.company || '',
                    jobtitle: contact.jobTitle || '',
                    lifecyclestage: this.mapLifecycleStage(contact.status),
                    hs_lead_status: this.mapLeadStatus(contact.status)
                }
            };

            const response = await this.apiRequest(
                '/crm/v3/objects/contacts',
                'POST',
                hubspotContact
            );

            if (response.ok) {
                const data = await response.json();
                return { success: true, id: data.id };
            }

            const error = await response.json();
            return {
                success: false,
                error: error.message || error.errors?.[0]?.message || 'Create failed'
            };
        } catch (error) {
            return { success: false, error: (error as Error).message };
        }
    }

    /**
     * Update a contact in HubSpot
     */
    async updateContact(hubspotId: string, contact: any): Promise<{ success: boolean; error?: string }> {
        try {
            const properties: Record<string, string> = {};

            if (contact.firstName) properties.firstname = contact.firstName;
            if (contact.lastName) properties.lastname = contact.lastName;
            if (contact.phone) properties.phone = contact.phone;
            if (contact.company) properties.company = contact.company;
            if (contact.jobTitle) properties.jobtitle = contact.jobTitle;
            if (contact.status) {
                properties.lifecyclestage = this.mapLifecycleStage(contact.status);
                properties.hs_lead_status = this.mapLeadStatus(contact.status);
            }

            const response = await this.apiRequest(
                `/crm/v3/objects/contacts/${hubspotId}`,
                'PATCH',
                { properties }
            );

            if (response.ok) {
                return { success: true };
            }

            const error = await response.json();
            return { success: false, error: error.message || 'Update failed' };
        } catch (error) {
            return { success: false, error: (error as Error).message };
        }
    }

    /**
     * Create or update a contact (upsert)
     */
    async upsertContact(contact: any): Promise<{ success: boolean; id?: string; error?: string }> {
        // Check if contact exists
        const existing = await this.getContactByEmail(contact.email);

        if (existing?.id) {
            const updateResult = await this.updateContact(existing.id, contact);
            return { ...updateResult, id: existing.id };
        }

        return this.createContact(contact);
    }

    /**
     * Sync all contacts from DigitalMEng to HubSpot
     */
    async syncToHubSpot(contactIds?: string[]): Promise<SyncResult> {
        const result: SyncResult = {
            success: true,
            created: 0,
            updated: 0,
            failed: 0,
            errors: []
        };

        const where: any = { organizationId: this.organizationId };
        if (contactIds && contactIds.length > 0) {
            where.id = { in: contactIds };
        }

        const contacts = await prisma.contact.findMany({ where });

        for (const contact of contacts) {
            // Check if already synced
            const existing = await this.getContactByEmail(contact.email);

            const upsertResult = await this.upsertContact(contact);

            if (upsertResult.success) {
                if (existing) {
                    result.updated++;
                } else {
                    result.created++;
                }

                // Log activity
                await prisma.contactActivity.create({
                    data: {
                        contactId: contact.id,
                        type: 'hubspot_sync',
                        description: `Synced to HubSpot (ID: ${upsertResult.id})`,
                        metadata: { hubspotId: upsertResult.id }
                    }
                });
            } else {
                result.failed++;
                result.errors.push({ email: contact.email, error: upsertResult.error || 'Unknown error' });
            }
        }

        result.success = result.failed === 0;
        return result;
    }

    /**
     * Import contacts from HubSpot to DigitalMEng
     */
    async importFromHubSpot(): Promise<SyncResult> {
        const result: SyncResult = {
            success: true,
            created: 0,
            updated: 0,
            failed: 0,
            errors: []
        };

        let hasMore = true;
        let after: string | undefined;

        while (hasMore) {
            const { contacts, hasMore: more, after: nextAfter } = await this.getContacts(100, after);
            hasMore = more;
            after = nextAfter;

            for (const hsContact of contacts) {
                try {
                    if (!hsContact.properties.email) continue;

                    const contactData = {
                        email: hsContact.properties.email.toLowerCase(),
                        firstName: hsContact.properties.firstname || null,
                        lastName: hsContact.properties.lastname || null,
                        company: hsContact.properties.company || null,
                        phone: hsContact.properties.phone || null,
                        jobTitle: hsContact.properties.jobtitle || null,
                        source: 'HubSpot',
                        status: this.reverseMapLifecycleStage(hsContact.properties.lifecyclestage || ''),
                        customFields: { hubspotId: hsContact.id }
                    };

                    await prisma.contact.upsert({
                        where: {
                            organizationId_email: {
                                organizationId: this.organizationId,
                                email: hsContact.properties.email.toLowerCase()
                            }
                        },
                        create: {
                            organizationId: this.organizationId,
                            ...contactData
                        },
                        update: contactData
                    });

                    result.created++;
                } catch (error) {
                    result.failed++;
                    result.errors.push({
                        email: hsContact.properties.email || 'unknown',
                        error: (error as Error).message
                    });
                }
            }
        }

        result.success = result.failed === 0;
        return result;
    }

    /**
     * Make an API request to HubSpot
     */
    private async apiRequest(
        endpoint: string,
        method: string = 'GET',
        body?: any
    ): Promise<Response> {
        const url = `${HUBSPOT_API_BASE}${endpoint}`;

        const headers: Record<string, string> = {
            'Authorization': `Bearer ${this.config.accessToken}`,
            'Content-Type': 'application/json'
        };

        const options: RequestInit = {
            method,
            headers
        };

        if (body) {
            options.body = JSON.stringify(body);
        }

        return fetch(url, options);
    }

    /**
     * Map DigitalMEng status to HubSpot lifecycle stage
     */
    private mapLifecycleStage(status: string): string {
        const stageMap: Record<string, string> = {
            'lead': 'lead',
            'mql': 'marketingqualifiedlead',
            'sql': 'salesqualifiedlead',
            'opportunity': 'opportunity',
            'customer': 'customer',
            'churned': 'other'
        };
        return stageMap[status] || 'lead';
    }

    /**
     * Map DigitalMEng status to HubSpot lead status
     */
    private mapLeadStatus(status: string): string {
        const statusMap: Record<string, string> = {
            'lead': 'NEW',
            'mql': 'OPEN',
            'sql': 'IN_PROGRESS',
            'opportunity': 'OPEN_DEAL',
            'customer': 'CONVERTED',
            'churned': 'UNQUALIFIED'
        };
        return statusMap[status] || 'NEW';
    }

    /**
     * Reverse map HubSpot lifecycle stage to DigitalMEng status
     */
    private reverseMapLifecycleStage(stage: string): 'lead' | 'mql' | 'sql' | 'opportunity' | 'customer' | 'churned' {
        const lowerStage = stage.toLowerCase();
        if (lowerStage === 'customer') return 'customer';
        if (lowerStage === 'opportunity') return 'opportunity';
        if (lowerStage === 'salesqualifiedlead') return 'sql';
        if (lowerStage === 'marketingqualifiedlead') return 'mql';
        if (lowerStage === 'other') return 'churned';
        return 'lead';
    }
}

/**
 * OAuth helper for HubSpot authentication
 */
export function getHubSpotAuthUrl(
    clientId: string,
    redirectUri: string,
    scopes: string[] = ['crm.objects.contacts.read', 'crm.objects.contacts.write']
): string {
    const params = new URLSearchParams({
        client_id: clientId,
        redirect_uri: redirectUri,
        scope: scopes.join(' ')
    });

    return `https://app.hubspot.com/oauth/authorize?${params}`;
}

/**
 * Exchange OAuth code for access token
 */
export async function exchangeHubSpotCode(
    code: string,
    clientId: string,
    clientSecret: string,
    redirectUri: string
): Promise<HubSpotConfig | null> {
    try {
        const response = await fetch('https://api.hubapi.com/oauth/v1/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: new URLSearchParams({
                grant_type: 'authorization_code',
                code,
                client_id: clientId,
                client_secret: clientSecret,
                redirect_uri: redirectUri
            })
        });

        if (!response.ok) {
            return null;
        }

        const data = await response.json();
        return {
            accessToken: data.access_token,
            refreshToken: data.refresh_token
        };
    } catch (error) {
        console.error('HubSpot OAuth error:', error);
        return null;
    }
}

/**
 * Refresh HubSpot access token
 */
export async function refreshHubSpotToken(
    refreshToken: string,
    clientId: string,
    clientSecret: string
): Promise<HubSpotConfig | null> {
    try {
        const response = await fetch('https://api.hubapi.com/oauth/v1/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: new URLSearchParams({
                grant_type: 'refresh_token',
                refresh_token: refreshToken,
                client_id: clientId,
                client_secret: clientSecret
            })
        });

        if (!response.ok) {
            return null;
        }

        const data = await response.json();
        return {
            accessToken: data.access_token,
            refreshToken: data.refresh_token
        };
    } catch (error) {
        console.error('HubSpot token refresh error:', error);
        return null;
    }
}
