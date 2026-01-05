// =============================================================================
// DATABASE HEALTH CHECK API
// =============================================================================
// Tests the database connection and returns status

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
    try {
        // Check if DATABASE_URL is set
        const dbUrl = process.env.DATABASE_URL;
        console.log('[API] DATABASE_URL present:', !!dbUrl);
        if (dbUrl) {
            console.log('[API] DATABASE_URL length:', dbUrl.length);
            console.log('[API] DATABASE_URL preview:', dbUrl.substring(0, 15) + '...');
        }

        if (!dbUrl) {
            return NextResponse.json({
                success: false,
                status: 'not_configured',
                error: 'DATABASE_URL environment variable is not set',
                timestamp: new Date().toISOString(),
            }, { status: 500 });
        }

        // Try to query the database
        const result = await prisma.$queryRaw`SELECT 1 as test`;

        // Get some basic stats
        const [orgCount, userCount, campaignCount, contentCount] = await Promise.all([
            prisma.organization.count(),
            prisma.user.count(),
            prisma.campaign.count(),
            prisma.contentItem.count(),
        ]);

        return NextResponse.json({
            success: true,
            status: 'connected',
            database: 'PostgreSQL (Neon)',
            timestamp: new Date().toISOString(),
            stats: {
                organizations: orgCount,
                users: userCount,
                campaigns: campaignCount,
                contentItems: contentCount,
            },
        });
    } catch (error) {
        console.error('Database health check error:', error);

        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        const errorStack = error instanceof Error ? error.stack : undefined;

        return NextResponse.json({
            success: false,
            status: 'error',
            error: errorMessage,
            stack: process.env.NODE_ENV === 'development' ? errorStack : undefined,
            databaseUrl: process.env.DATABASE_URL ? 'Set (hidden)' : 'Not set',
            timestamp: new Date().toISOString(),
        }, { status: 500 });
    }
}
