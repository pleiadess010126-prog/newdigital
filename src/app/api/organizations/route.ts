import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/client';

// GET /api/organizations - List organizations for current user
// POST /api/organizations - Create new organization

export async function GET(request: NextRequest) {
    try {
        // In production, get user ID from session/JWT
        const userId = request.headers.get('x-user-id') || 'demo_user';

        // For demo, return the organization stored in localStorage reference
        // In production, query by user's organization memberships
        const orgId = request.nextUrl.searchParams.get('id');

        if (orgId) {
            const organization = await db.getOrganization(orgId);
            if (!organization) {
                return NextResponse.json({ error: 'Organization not found' }, { status: 404 });
            }
            return NextResponse.json(organization);
        }

        // List all organizations (in production, filter by user access)
        return NextResponse.json({
            organizations: [],
            message: 'Use client-side database for demo mode',
        });
    } catch (error) {
        console.error('Error fetching organizations:', error);
        return NextResponse.json(
            { error: 'Failed to fetch organizations' },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { name, settings } = body;

        if (!name) {
            return NextResponse.json(
                { error: 'Organization name is required' },
                { status: 400 }
            );
        }

        // In production, get user ID from session/JWT
        const userId = request.headers.get('x-user-id') || 'demo_user';

        const organization = await db.createOrganization({
            name,
            slug: name.toLowerCase().replace(/\s+/g, '-'),
            ownerId: userId,
            plan: 'free',
            settings: {
                brandName: name,
                timezone: settings?.timezone || 'UTC',
                defaultLanguage: settings?.defaultLanguage || 'en',
                emailNotifications: true,
                weeklyReports: true,
                ...settings,
            },
        });

        // Log activity
        await db.logActivity({
            organizationId: organization.id,
            userId,
            action: 'organization.created',
            entityType: 'organization',
            entityId: organization.id,
        });

        return NextResponse.json(organization, { status: 201 });
    } catch (error) {
        console.error('Error creating organization:', error);
        return NextResponse.json(
            { error: 'Failed to create organization' },
            { status: 500 }
        );
    }
}

export async function PATCH(request: NextRequest) {
    try {
        const body = await request.json();
        const { id, ...updates } = body;

        if (!id) {
            return NextResponse.json(
                { error: 'Organization ID is required' },
                { status: 400 }
            );
        }

        // In production, check permissions

        // We specifically want to allow updating the 'settings' field
        // DB client handles merging partial updates
        const organization = await db.updateOrganization(id, updates);

        return NextResponse.json(organization);
    } catch (error) {
        console.error('Error updating organization:', error);
        return NextResponse.json(
            { error: 'Failed to update organization' },
            { status: 500 }
        );
    }
}
