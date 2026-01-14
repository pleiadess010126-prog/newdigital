// =============================================================================
// CRM INTEGRATIONS API - Connect to Salesforce/HubSpot
// =============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { getSession } from '@/lib/auth/session.server';
import { SalesforceConnector, getSalesforceAuthUrl, exchangeSalesforceCode } from '@/lib/crm/salesforce';
import { HubSpotConnector, getHubSpotAuthUrl, exchangeHubSpotCode } from '@/lib/crm/hubspot';

// GET /api/crm/integrations - Get integration status
export async function GET(request: NextRequest) {
    try {
        const session = await getSession();
        if (!session?.user?.organizationId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Get stored CRM credentials from organization settings
        // In production, these would be stored encrypted in the database
        const org = await prisma.organization.findUnique({
            where: { id: session.user.organizationId }
        });

        // Check if integrations are configured (simplified - would check actual tokens)
        const integrations = {
            salesforce: {
                connected: false,
                lastSync: null as string | null,
                contactsCount: 0
            },
            hubspot: {
                connected: false,
                lastSync: null as string | null,
                contactsCount: 0
            }
        };

        // Count contacts by source
        const sourceCounts = await prisma.contact.groupBy({
            by: ['source'],
            where: { organizationId: session.user.organizationId },
            _count: true
        });

        for (const item of sourceCounts) {
            if (item.source === 'Salesforce') {
                integrations.salesforce.contactsCount = item._count;
            }
            if (item.source === 'HubSpot') {
                integrations.hubspot.contactsCount = item._count;
            }
        }

        return NextResponse.json(integrations);
    } catch (error) {
        console.error('CRM integrations error:', error);
        return NextResponse.json({ error: 'Failed to get integrations' }, { status: 500 });
    }
}

// POST /api/crm/integrations - Manage integrations
export async function POST(request: NextRequest) {
    try {
        const session = await getSession();
        if (!session?.user?.organizationId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { action, platform, credentials } = body;

        switch (action) {
            case 'get-auth-url': {
                const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/crm/callback/${platform}`;
                const state = session.user.organizationId;

                if (platform === 'salesforce') {
                    const clientId = process.env.SALESFORCE_CLIENT_ID;
                    if (!clientId) {
                        return NextResponse.json({ error: 'Salesforce not configured' }, { status: 400 });
                    }
                    const authUrl = await getSalesforceAuthUrl(clientId, redirectUri, state);
                    return NextResponse.json({ authUrl });
                }

                if (platform === 'hubspot') {
                    const clientId = process.env.HUBSPOT_CLIENT_ID;
                    if (!clientId) {
                        return NextResponse.json({ error: 'HubSpot not configured' }, { status: 400 });
                    }
                    const authUrl = getHubSpotAuthUrl(clientId, redirectUri);
                    return NextResponse.json({ authUrl });
                }

                return NextResponse.json({ error: 'Invalid platform' }, { status: 400 });
            }

            case 'connect': {
                // Manual connection with API key/token
                if (platform === 'salesforce' && credentials?.accessToken && credentials?.instanceUrl) {
                    const connector = new SalesforceConnector(
                        { accessToken: credentials.accessToken, instanceUrl: credentials.instanceUrl },
                        session.user.organizationId
                    );
                    const testResult = await connector.testConnection();
                    return NextResponse.json(testResult);
                }

                if (platform === 'hubspot' && credentials?.accessToken) {
                    const connector = new HubSpotConnector(
                        { accessToken: credentials.accessToken },
                        session.user.organizationId
                    );
                    const testResult = await connector.testConnection();
                    return NextResponse.json(testResult);
                }

                return NextResponse.json({ error: 'Invalid credentials' }, { status: 400 });
            }

            case 'sync-to': {
                // Sync contacts TO the CRM
                if (platform === 'salesforce' && credentials?.accessToken && credentials?.instanceUrl) {
                    const connector = new SalesforceConnector(
                        { accessToken: credentials.accessToken, instanceUrl: credentials.instanceUrl },
                        session.user.organizationId
                    );
                    const result = await connector.syncToSalesforce();
                    return NextResponse.json(result);
                }

                if (platform === 'hubspot' && credentials?.accessToken) {
                    const connector = new HubSpotConnector(
                        { accessToken: credentials.accessToken },
                        session.user.organizationId
                    );
                    const result = await connector.syncToHubSpot();
                    return NextResponse.json(result);
                }

                return NextResponse.json({ error: 'Invalid platform or credentials' }, { status: 400 });
            }

            case 'import-from': {
                // Import contacts FROM the CRM
                if (platform === 'salesforce' && credentials?.accessToken && credentials?.instanceUrl) {
                    const connector = new SalesforceConnector(
                        { accessToken: credentials.accessToken, instanceUrl: credentials.instanceUrl },
                        session.user.organizationId
                    );
                    const result = await connector.importFromSalesforce();
                    return NextResponse.json(result);
                }

                if (platform === 'hubspot' && credentials?.accessToken) {
                    const connector = new HubSpotConnector(
                        { accessToken: credentials.accessToken },
                        session.user.organizationId
                    );
                    const result = await connector.importFromHubSpot();
                    return NextResponse.json(result);
                }

                return NextResponse.json({ error: 'Invalid platform or credentials' }, { status: 400 });
            }

            case 'disconnect': {
                // In production, delete stored tokens
                return NextResponse.json({ success: true, message: `Disconnected from ${platform}` });
            }

            default:
                return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
        }
    } catch (error) {
        console.error('CRM integration error:', error);
        return NextResponse.json({ error: 'Integration operation failed' }, { status: 500 });
    }
}
