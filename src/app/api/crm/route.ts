import { NextResponse } from 'next/server';
import { socialCRM } from '@/lib/crm/socialCRM';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const action = searchParams.get('action') || 'leads';
        const status = searchParams.get('status');
        const platform = searchParams.get('platform');
        const search = searchParams.get('search');
        const leadId = searchParams.get('leadId');

        switch (action) {
            case 'leads':
                const filter: Record<string, unknown> = {};
                if (status) filter.status = [status];
                if (platform) filter.platforms = [platform];
                if (search) filter.searchQuery = search;

                const leads = await socialCRM.getLeads(filter as never);
                return NextResponse.json({ success: true, data: leads });

            case 'lead':
                if (!leadId) {
                    return NextResponse.json({ success: false, error: 'Lead ID required' }, { status: 400 });
                }
                const lead = await socialCRM.getLead(leadId);
                return NextResponse.json({ success: true, data: lead });

            case 'engagements':
                if (leadId) {
                    const leadEngagements = await socialCRM.getLeadEngagements(leadId);
                    return NextResponse.json({ success: true, data: leadEngagements });
                }
                const recentEngagements = await socialCRM.getRecentEngagements(20);
                return NextResponse.json({ success: true, data: recentEngagements });

            case 'stats':
                const stats = await socialCRM.getStats();
                return NextResponse.json({ success: true, data: stats });

            case 'templates':
                const templates = await socialCRM.getTemplates();
                return NextResponse.json({ success: true, data: templates });

            case 'automation-rules':
                const rules = await socialCRM.getAutomationRules();
                return NextResponse.json({ success: true, data: rules });

            default:
                return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
        }
    } catch (error) {
        console.error('CRM API Error:', error);
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { action, ...data } = body;

        switch (action) {
            case 'track-engagement':
                const { platform, type, profile, contentId, contentTitle, message } = data;
                const result = await socialCRM.trackEngagement(
                    platform,
                    type,
                    profile,
                    contentId,
                    contentTitle,
                    message
                );
                return NextResponse.json({ success: true, data: result });

            case 'send-dm':
                const { leadId, templateId } = data;
                const dmResult = await socialCRM.sendDM(leadId, templateId);
                return NextResponse.json({ success: true, data: dmResult });

            case 'add-tag':
                const { leadId: tagLeadId, tag } = data;
                await socialCRM.addTag(tagLeadId, tag);
                return NextResponse.json({ success: true });

            case 'add-note':
                const { leadId: noteLeadId, note } = data;
                await socialCRM.addNote(noteLeadId, note);
                return NextResponse.json({ success: true });

            case 'update-lead':
                const { leadId: updateLeadId, updates } = data;
                const updatedLead = await socialCRM.updateLead(updateLeadId, updates);
                return NextResponse.json({ success: true, data: updatedLead });

            case 'bulk-action':
                const bulkResult = await socialCRM.executeBulkAction(data);
                return NextResponse.json({ success: true, data: bulkResult });

            default:
                return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
        }
    } catch (error) {
        console.error('CRM API Error:', error);
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}
