// =============================================================================
// SALESFORCE CONNECTOR - Sync contacts bidirectionally with Salesforce CRM
// =============================================================================

import { prisma } from '@/lib/db/prisma';

// Salesforce API Types
interface SalesforceConfig {
    instanceUrl: string;
    accessToken: string;
    refreshToken?: string;
    clientId?: string;
    clientSecret?: string;
}

interface SalesforceContact {
    Id?: string;
    Email: string;
    FirstName?: string;
    LastName?: string;
    Company?: string;
    Phone?: string;
    Title?: string;
    LeadSource?: string;
    Status?: string;
    Description?: string;
}

interface SalesforceLead {
    Id?: string;
    Email: string;
    FirstName?: string;
    LastName?: string;
    Company: string;
    Phone?: string;
    Title?: string;
    LeadSource: string;
    Status: string;
    Description?: string;
    Rating?: string;
}

interface SyncResult {
    success: boolean;
    created: number;
    updated: number;
    failed: number;
    errors: Array<{ email: string; error: string }>;
}

/**
 * Salesforce CRM Connector
 */
export class SalesforceConnector {
    private config: SalesforceConfig;
    private organizationId: string;

    constructor(config: SalesforceConfig, organizationId: string) {
        this.config = config;
        this.organizationId = organizationId;
    }

    /**
     * Test the connection to Salesforce
     */
    async testConnection(): Promise<{ success: boolean; message: string }> {
        try {
            const response = await this.apiRequest('/services/data/v59.0/');

            if (response.ok) {
                return { success: true, message: 'Successfully connected to Salesforce' };
            }

            return { success: false, message: 'Failed to connect to Salesforce' };
        } catch (error) {
            return { success: false, message: (error as Error).message };
        }
    }

    /**
     * Get leads from Salesforce
     */
    async getLeads(query?: string): Promise<SalesforceLead[]> {
        const soql = query ||
            "SELECT Id, Email, FirstName, LastName, Company, Phone, Title, LeadSource, Status, Description, Rating " +
            "FROM Lead " +
            "WHERE Email != null " +
            "ORDER BY CreatedDate DESC " +
            "LIMIT 1000";

        const response = await this.query(soql);
        return response.records || [];
    }

    /**
     * Get contacts from Salesforce
     */
    async getContacts(query?: string): Promise<SalesforceContact[]> {
        const soql = query ||
            "SELECT Id, Email, FirstName, LastName, Phone, Title, Description " +
            "FROM Contact " +
            "WHERE Email != null " +
            "ORDER BY CreatedDate DESC " +
            "LIMIT 1000";

        const response = await this.query(soql);
        return response.records || [];
    }

    /**
     * Create or update a lead in Salesforce
     */
    async upsertLead(contact: any): Promise<{ success: boolean; id?: string; error?: string }> {
        try {
            const leadData: SalesforceLead = {
                Email: contact.email,
                FirstName: contact.firstName || '',
                LastName: contact.lastName || contact.email.split('@')[0],
                Company: contact.company || 'Unknown',
                Phone: contact.phone || '',
                Title: contact.jobTitle || '',
                LeadSource: 'DigitalMEng',
                Status: this.mapStatus(contact.status),
                Description: `Lead Score: ${contact.leadScore}\nSource: ${contact.source || 'DigitalMEng'}`,
                Rating: this.mapLeadScoreToRating(contact.leadScore)
            };

            // Check if lead exists
            const existingLead = await this.findLeadByEmail(contact.email);

            if (existingLead) {
                // Update existing lead
                const response = await this.apiRequest(
                    `/services/data/v59.0/sobjects/Lead/${existingLead.Id}`,
                    'PATCH',
                    leadData
                );

                if (response.ok) {
                    return { success: true, id: existingLead.Id };
                }

                const error = await response.json();
                return { success: false, error: error[0]?.message || 'Update failed' };
            } else {
                // Create new lead
                const response = await this.apiRequest(
                    '/services/data/v59.0/sobjects/Lead',
                    'POST',
                    leadData
                );

                if (response.ok) {
                    const result = await response.json();
                    return { success: true, id: result.id };
                }

                const error = await response.json();
                return { success: false, error: error[0]?.message || 'Create failed' };
            }
        } catch (error) {
            return { success: false, error: (error as Error).message };
        }
    }

    /**
     * Find a lead by email
     */
    async findLeadByEmail(email: string): Promise<SalesforceLead | null> {
        const soql = `SELECT Id, Email, FirstName, LastName, Company, Phone, Title, Status FROM Lead WHERE Email = '${email}' LIMIT 1`;
        const response = await this.query(soql);
        return response.records?.[0] || null;
    }

    /**
     * Sync all contacts from DigitalMEng to Salesforce
     */
    async syncToSalesforce(contactIds?: string[]): Promise<SyncResult> {
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
            const upsertResult = await this.upsertLead(contact);

            if (upsertResult.success) {
                // Check if it was created or updated
                const existing = await this.findLeadByEmail(contact.email);
                if (existing) {
                    result.updated++;
                } else {
                    result.created++;
                }

                // Log activity
                await prisma.contactActivity.create({
                    data: {
                        contactId: contact.id,
                        type: 'salesforce_sync',
                        description: `Synced to Salesforce (ID: ${upsertResult.id})`,
                        metadata: { salesforceId: upsertResult.id }
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
     * Import leads from Salesforce to DigitalMEng
     */
    async importFromSalesforce(): Promise<SyncResult> {
        const result: SyncResult = {
            success: true,
            created: 0,
            updated: 0,
            failed: 0,
            errors: []
        };

        const leads = await this.getLeads();

        for (const lead of leads) {
            try {
                const contactData = {
                    email: lead.Email.toLowerCase(),
                    firstName: lead.FirstName || null,
                    lastName: lead.LastName || null,
                    company: lead.Company || null,
                    phone: lead.Phone || null,
                    jobTitle: lead.Title || null,
                    source: 'Salesforce',
                    status: this.reverseMapStatus(lead.Status),
                    customFields: { salesforceId: lead.Id }
                };

                await prisma.contact.upsert({
                    where: {
                        organizationId_email: {
                            organizationId: this.organizationId,
                            email: lead.Email.toLowerCase()
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
                result.errors.push({ email: lead.Email, error: (error as Error).message });
            }
        }

        result.success = result.failed === 0;
        return result;
    }

    /**
     * Execute a SOQL query
     */
    private async query(soql: string): Promise<any> {
        const encodedQuery = encodeURIComponent(soql);
        const response = await this.apiRequest(`/services/data/v59.0/query?q=${encodedQuery}`);

        if (!response.ok) {
            throw new Error('Query failed');
        }

        return response.json();
    }

    /**
     * Make an API request to Salesforce
     */
    private async apiRequest(
        endpoint: string,
        method: string = 'GET',
        body?: any
    ): Promise<Response> {
        const url = `${this.config.instanceUrl}${endpoint}`;

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
     * Map DigitalMEng status to Salesforce status
     */
    private mapStatus(status: string): string {
        const statusMap: Record<string, string> = {
            'lead': 'Open - Not Contacted',
            'mql': 'Working - Contacted',
            'sql': 'Closed - Converted',
            'opportunity': 'Closed - Converted',
            'customer': 'Closed - Converted',
            'churned': 'Closed - Not Converted'
        };
        return statusMap[status] || 'Open - Not Contacted';
    }

    /**
     * Reverse map Salesforce status to DigitalMEng status
     */
    private reverseMapStatus(status: string): 'lead' | 'mql' | 'sql' | 'opportunity' | 'customer' | 'churned' {
        const lowerStatus = status.toLowerCase();
        if (lowerStatus.includes('converted')) return 'customer';
        if (lowerStatus.includes('working') || lowerStatus.includes('contacted')) return 'mql';
        if (lowerStatus.includes('not converted') || lowerStatus.includes('lost')) return 'churned';
        return 'lead';
    }

    /**
     * Map lead score to Salesforce rating
     */
    private mapLeadScoreToRating(score: number): string {
        if (score >= 80) return 'Hot';
        if (score >= 50) return 'Warm';
        return 'Cold';
    }
}

/**
 * OAuth helper for Salesforce authentication
 */
export async function getSalesforceAuthUrl(
    clientId: string,
    redirectUri: string,
    state: string
): Promise<string> {
    const params = new URLSearchParams({
        response_type: 'code',
        client_id: clientId,
        redirect_uri: redirectUri,
        state: state,
        scope: 'api refresh_token'
    });

    return `https://login.salesforce.com/services/oauth2/authorize?${params}`;
}

/**
 * Exchange OAuth code for access token
 */
export async function exchangeSalesforceCode(
    code: string,
    clientId: string,
    clientSecret: string,
    redirectUri: string
): Promise<SalesforceConfig | null> {
    try {
        const response = await fetch('https://login.salesforce.com/services/oauth2/token', {
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
            instanceUrl: data.instance_url,
            accessToken: data.access_token,
            refreshToken: data.refresh_token
        };
    } catch (error) {
        console.error('Salesforce OAuth error:', error);
        return null;
    }
}
