// =============================================================================
// EMAIL TEMPLATES API
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
        const category = searchParams.get('category');

        const templates = await prisma.emailTemplate.findMany({
            where: {
                OR: [
                    { organizationId: session.user.organizationId },
                    { isGlobal: true },
                ],
                ...(category && { category }),
            },
            orderBy: { createdAt: 'desc' },
        });

        return NextResponse.json(templates);
    } catch (error) {
        console.error('Error fetching templates:', error);
        return NextResponse.json({ error: 'Failed to fetch templates' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession();
        if (!session?.user?.organizationId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { name, category, description, htmlContent, jsonContent } = body;

        if (!name || !htmlContent) {
            return NextResponse.json({ error: 'Name and HTML content are required' }, { status: 400 });
        }

        const template = await prisma.emailTemplate.create({
            data: {
                organizationId: session.user.organizationId,
                name,
                category: category || 'general',
                description,
                htmlContent,
                jsonContent: jsonContent || '{}',
            },
        });

        return NextResponse.json(template, { status: 201 });
    } catch (error) {
        console.error('Error creating template:', error);
        return NextResponse.json({ error: 'Failed to create template' }, { status: 500 });
    }
}
