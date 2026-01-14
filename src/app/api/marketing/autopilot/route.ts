// =============================================================================
// MARKETING AUTOPILOT API - Automated Campaign Management
// =============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session.server';
import {
    getMarketingAutopilotConfig,
    updateMarketingAutopilotConfig,
    getMarketingAutopilotEngine,
    getPendingCampaigns,
    approveCampaign,
    addPendingCampaign,
    type MarketingAutopilotConfig,
} from '@/lib/ai/marketingAutopilot';

// GET - Get autopilot config and status
export async function GET(request: NextRequest) {
    try {
        const session = await getSession();
        if (!session?.user?.organizationId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const orgId = session.user.organizationId;
        const config = getMarketingAutopilotConfig(orgId);
        const engine = getMarketingAutopilotEngine(orgId);
        const pendingCampaigns = getPendingCampaigns(orgId);

        return NextResponse.json({
            config,
            status: {
                canRun: engine.canRun(),
                pendingCampaigns: pendingCampaigns.length,
            },
            pendingCampaigns,
        });
    } catch (error) {
        console.error('Autopilot GET error:', error);
        return NextResponse.json({ error: 'Failed to get autopilot config' }, { status: 500 });
    }
}

// POST - Update config or trigger actions
export async function POST(request: NextRequest) {
    try {
        const session = await getSession();
        if (!session?.user?.organizationId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const orgId = session.user.organizationId;
        const body = await request.json();
        const { action } = body;

        switch (action) {
            case 'updateConfig': {
                const { config } = body;
                const updated = updateMarketingAutopilotConfig(orgId, config);
                return NextResponse.json({ success: true, config: updated });
            }

            case 'toggle': {
                const current = getMarketingAutopilotConfig(orgId);
                const updated = updateMarketingAutopilotConfig(orgId, { enabled: !current.enabled });
                return NextResponse.json({
                    success: true,
                    enabled: updated.enabled,
                    message: updated.enabled ? 'Autopilot enabled!' : 'Autopilot disabled',
                });
            }

            case 'run': {
                const engine = getMarketingAutopilotEngine(orgId);
                const result = await engine.run();

                // Store pending campaigns
                for (const campaign of result.campaignsCreated) {
                    addPendingCampaign(orgId, campaign);
                }

                return NextResponse.json({
                    success: true,
                    result: {
                        campaignsCreated: result.campaignsCreated.length,
                        actions: result.actions,
                    },
                    campaigns: result.campaignsCreated,
                });
            }

            case 'approve': {
                const { campaignId } = body;
                const approved = approveCampaign(orgId, campaignId);
                return NextResponse.json({ success: approved });
            }

            case 'generateContent': {
                const { type, channel } = body;
                const engine = getMarketingAutopilotEngine(orgId);
                const content = await engine.generateContent(type, channel);
                return NextResponse.json({ success: true, content });
            }

            case 'addRecurring': {
                const { template } = body;
                const current = getMarketingAutopilotConfig(orgId);
                const updated = updateMarketingAutopilotConfig(orgId, {
                    recurringCampaigns: [...current.recurringCampaigns, { ...template, id: `rec_${Date.now()}` }],
                });
                return NextResponse.json({ success: true, config: updated });
            }

            case 'removeRecurring': {
                const { templateId } = body;
                const current = getMarketingAutopilotConfig(orgId);
                const updated = updateMarketingAutopilotConfig(orgId, {
                    recurringCampaigns: current.recurringCampaigns.filter(t => t.id !== templateId),
                });
                return NextResponse.json({ success: true, config: updated });
            }

            default:
                return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
        }
    } catch (error) {
        console.error('Autopilot POST error:', error);
        return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
    }
}
