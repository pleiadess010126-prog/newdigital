// =============================================================================
// CONTACTS API - CRM Contact Management
// =============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { getSession as getServerSession } from '@/lib/auth/session.server';
import { isValidEmail } from '@/lib/email';

export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession();
        if (!session?.user?.organizationId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const search = searchParams.get('search');
        const status = searchParams.get('status');
        const tag = searchParams.get('tag');
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '25');
        const skip = (page - 1) * limit;

        const where: Record<string, unknown> = {
            organizationId: session.user.organizationId,
        };

        if (search) {
            where.OR = [
                { email: { contains: search } },
                { firstName: { contains: search } },
                { lastName: { contains: search } },
                { company: { contains: search } },
            ];
        }

        if (status) {
            where.status = status;
        }

        const [contacts, total] = await Promise.all([
            prisma.contact.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
            }),
            prisma.contact.count({ where }),
        ]);

        return NextResponse.json({
            contacts,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        console.error('Error fetching contacts:', error);
        return NextResponse.json({ error: 'Failed to fetch contacts' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession();
        if (!session?.user?.organizationId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { email, firstName, lastName, phone, company, jobTitle, source, tags } = body;

        if (!email || !isValidEmail(email)) {
            return NextResponse.json({ error: 'Valid email is required' }, { status: 400 });
        }

        // Check if contact already exists
        const existing = await prisma.contact.findUnique({
            where: {
                organizationId_email: {
                    organizationId: session.user.organizationId,
                    email: email.toLowerCase(),
                },
            },
        });

        if (existing) {
            return NextResponse.json({ error: 'Contact with this email already exists' }, { status: 409 });
        }

        const contact = await prisma.contact.create({
            data: {
                organizationId: session.user.organizationId,
                email: email.toLowerCase(),
                firstName,
                lastName,
                phone,
                company,
                jobTitle,
                source: source || 'manual',
                tags: tags || [],
            },
        });

        return NextResponse.json(contact, { status: 201 });
    } catch (error) {
        console.error('Error creating contact:', error);
        return NextResponse.json({ error: 'Failed to create contact' }, { status: 500 });
    }
}

// Bulk import contacts
export async function PUT(request: NextRequest) {
    try {
        const session = await getServerSession();
        if (!session?.user?.organizationId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { contacts } = body;

        if (!Array.isArray(contacts) || contacts.length === 0) {
            return NextResponse.json({ error: 'Contacts array is required' }, { status: 400 });
        }

        const results = {
            created: 0,
            updated: 0,
            failed: 0,
            errors: [] as Array<{ email: string; error: string }>,
        };

        for (const contactData of contacts) {
            try {
                if (!contactData.email || !isValidEmail(contactData.email)) {
                    results.failed++;
                    results.errors.push({ email: contactData.email || 'unknown', error: 'Invalid email' });
                    continue;
                }

                await prisma.contact.upsert({
                    where: {
                        organizationId_email: {
                            organizationId: session.user.organizationId,
                            email: contactData.email.toLowerCase(),
                        },
                    },
                    create: {
                        organizationId: session.user.organizationId,
                        email: contactData.email.toLowerCase(),
                        firstName: contactData.firstName,
                        lastName: contactData.lastName,
                        phone: contactData.phone,
                        company: contactData.company,
                        jobTitle: contactData.jobTitle,
                        source: contactData.source || 'import',
                        tags: contactData.tags || [],
                    },
                    update: {
                        firstName: contactData.firstName,
                        lastName: contactData.lastName,
                        phone: contactData.phone,
                        company: contactData.company,
                        jobTitle: contactData.jobTitle,
                    },
                });

                results.created++;
            } catch (error) {
                results.failed++;
                results.errors.push({ email: contactData.email, error: (error as Error).message });
            }
        }

        return NextResponse.json(results);
    } catch (error) {
        console.error('Error importing contacts:', error);
        return NextResponse.json({ error: 'Failed to import contacts' }, { status: 500 });
    }
}
