// =================================================================
// ADMIN AFFILIATE API ROUTE
// Admin operations for managing affiliates
// =================================================================

import { NextRequest, NextResponse } from 'next/server';

// In-memory stores (these would be database in production)
const affiliateStore = new Map<string, AffiliateData>();
const payoutStore = new Map<string, PayoutData>();

interface AffiliateData {
    id: string;
    userId: string;
    userName?: string;
    userEmail?: string;
    referralCode: string;
    referralLink: string;
    status: 'active' | 'pending' | 'suspended' | 'inactive';
    tier: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';
    createdAt: Date;
    approvedAt?: Date;
    commissionRate: number;
    cookieDuration: number;
    paymentMethod: string;
    paymentEmail?: string;
    stats: {
        totalClicks: number;
        totalSignups: number;
        paidConversions: number;
        totalEarnings: number;
        pendingEarnings: number;
        paidEarnings: number;
    };
}

interface PayoutData {
    id: string;
    affiliateId: string;
    affiliateName?: string;
    amount: number;
    status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
    paymentMethod: string;
    paymentReference?: string;
    requestedAt: Date;
    processedAt?: Date;
    adminNotes?: string;
}

// Seed demo data
function seedDemoData() {
    if (affiliateStore.size === 0) {
        // Create some demo affiliates
        const demoAffiliates: AffiliateData[] = [
            {
                id: 'aff_demo_001',
                userId: 'user_001',
                userName: 'John Smith',
                userEmail: 'john@example.com',
                referralCode: 'JOHNSMITH25',
                referralLink: 'https://digitalmeng.com/?ref=JOHNSMITH25',
                status: 'active',
                tier: 'gold',
                createdAt: new Date('2024-06-15'),
                approvedAt: new Date('2024-06-16'),
                commissionRate: 15,
                cookieDuration: 90,
                paymentMethod: 'paypal',
                paymentEmail: 'john@example.com',
                stats: {
                    totalClicks: 4892,
                    totalSignups: 127,
                    paidConversions: 48,
                    totalEarnings: 7840.50,
                    pendingEarnings: 1240.00,
                    paidEarnings: 6600.50
                }
            },
            {
                id: 'aff_demo_002',
                userId: 'user_002',
                userName: 'Sarah Johnson',
                userEmail: 'sarah@marketing.co',
                referralCode: 'SARAHJ2024',
                referralLink: 'https://digitalmeng.com/?ref=SARAHJ2024',
                status: 'active',
                tier: 'platinum',
                createdAt: new Date('2024-03-10'),
                approvedAt: new Date('2024-03-11'),
                commissionRate: 18,
                cookieDuration: 90,
                paymentMethod: 'stripe',
                paymentEmail: 'sarah@marketing.co',
                stats: {
                    totalClicks: 12450,
                    totalSignups: 345,
                    paidConversions: 156,
                    totalEarnings: 24560.00,
                    pendingEarnings: 3200.00,
                    paidEarnings: 21360.00
                }
            },
            {
                id: 'aff_demo_003',
                userId: 'user_003',
                userName: 'Mike Wilson',
                userEmail: 'mike@startup.io',
                referralCode: 'MIKEW123',
                referralLink: 'https://digitalmeng.com/?ref=MIKEW123',
                status: 'pending',
                tier: 'bronze',
                createdAt: new Date('2025-01-02'),
                commissionRate: 10,
                cookieDuration: 30,
                paymentMethod: 'paypal',
                paymentEmail: 'mike@startup.io',
                stats: {
                    totalClicks: 0,
                    totalSignups: 0,
                    paidConversions: 0,
                    totalEarnings: 0,
                    pendingEarnings: 0,
                    paidEarnings: 0
                }
            },
            {
                id: 'aff_demo_004',
                userId: 'user_004',
                userName: 'Emily Chen',
                userEmail: 'emily@agency.com',
                referralCode: 'EMILYCH',
                referralLink: 'https://digitalmeng.com/?ref=EMILYCH',
                status: 'suspended',
                tier: 'silver',
                createdAt: new Date('2024-09-20'),
                approvedAt: new Date('2024-09-21'),
                commissionRate: 12,
                cookieDuration: 60,
                paymentMethod: 'bank_transfer',
                stats: {
                    totalClicks: 890,
                    totalSignups: 23,
                    paidConversions: 8,
                    totalEarnings: 560.00,
                    pendingEarnings: 120.00,
                    paidEarnings: 440.00
                }
            }
        ];

        demoAffiliates.forEach(a => affiliateStore.set(a.id, a));

        // Create some demo payouts
        const demoPayouts: PayoutData[] = [
            {
                id: 'pay_demo_001',
                affiliateId: 'aff_demo_001',
                affiliateName: 'John Smith',
                amount: 500.00,
                status: 'pending',
                paymentMethod: 'paypal',
                requestedAt: new Date('2025-01-02')
            },
            {
                id: 'pay_demo_002',
                affiliateId: 'aff_demo_002',
                affiliateName: 'Sarah Johnson',
                amount: 1500.00,
                status: 'processing',
                paymentMethod: 'stripe',
                requestedAt: new Date('2025-01-01')
            },
            {
                id: 'pay_demo_003',
                affiliateId: 'aff_demo_002',
                affiliateName: 'Sarah Johnson',
                amount: 2000.00,
                status: 'completed',
                paymentMethod: 'stripe',
                paymentReference: 'STR-789456123',
                requestedAt: new Date('2024-12-15'),
                processedAt: new Date('2024-12-18')
            }
        ];

        demoPayouts.forEach(p => payoutStore.set(p.id, p));
    }
}

// GET - List all affiliates and payouts
export async function GET(request: NextRequest) {
    try {
        seedDemoData();

        const { searchParams } = new URL(request.url);
        const action = searchParams.get('action');

        if (action === 'payouts') {
            // Get all pending payouts
            const payouts = Array.from(payoutStore.values())
                .sort((a, b) => new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime());

            return NextResponse.json({
                success: true,
                data: payouts
            });
        }

        if (action === 'stats') {
            // Get overall affiliate stats
            const affiliates = Array.from(affiliateStore.values());
            const stats = {
                totalAffiliates: affiliates.length,
                activeAffiliates: affiliates.filter(a => a.status === 'active').length,
                pendingApprovals: affiliates.filter(a => a.status === 'pending').length,
                suspendedAffiliates: affiliates.filter(a => a.status === 'suspended').length,
                totalEarnings: affiliates.reduce((sum, a) => sum + a.stats.totalEarnings, 0),
                totalPendingPayouts: Array.from(payoutStore.values())
                    .filter(p => p.status === 'pending' || p.status === 'processing')
                    .reduce((sum, p) => sum + p.amount, 0),
                totalClicks: affiliates.reduce((sum, a) => sum + a.stats.totalClicks, 0),
                totalConversions: affiliates.reduce((sum, a) => sum + a.stats.paidConversions, 0)
            };

            return NextResponse.json({
                success: true,
                data: stats
            });
        }

        // Default: Get all affiliates
        const affiliates = Array.from(affiliateStore.values())
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

        return NextResponse.json({
            success: true,
            data: affiliates
        });

    } catch (error) {
        console.error('Admin affiliate GET error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to get affiliate data' },
            { status: 500 }
        );
    }
}

// PUT - Update affiliate or payout status
export async function PUT(request: NextRequest) {
    try {
        seedDemoData();

        const body = await request.json();
        const { type, id, status, tier, commissionRate, adminNotes, paymentReference } = body;

        if (type === 'affiliate') {
            const affiliate = affiliateStore.get(id);
            if (!affiliate) {
                return NextResponse.json(
                    { success: false, error: 'Affiliate not found' },
                    { status: 404 }
                );
            }

            // Update fields
            if (status) {
                affiliate.status = status;
                if (status === 'active' && !affiliate.approvedAt) {
                    affiliate.approvedAt = new Date();
                }
            }
            if (tier) {
                affiliate.tier = tier;
                // Update commission rate based on tier
                const tierRates: Record<string, number> = {
                    bronze: 10,
                    silver: 12,
                    gold: 15,
                    platinum: 18,
                    diamond: 20
                };
                affiliate.commissionRate = tierRates[tier] || affiliate.commissionRate;
            }
            if (commissionRate !== undefined) {
                affiliate.commissionRate = commissionRate;
            }

            affiliateStore.set(id, affiliate);

            return NextResponse.json({
                success: true,
                data: affiliate,
                message: 'Affiliate updated successfully'
            });
        }

        if (type === 'payout') {
            const payout = payoutStore.get(id);
            if (!payout) {
                return NextResponse.json(
                    { success: false, error: 'Payout not found' },
                    { status: 404 }
                );
            }

            // Update fields
            if (status) payout.status = status;
            if (adminNotes) payout.adminNotes = adminNotes;
            if (paymentReference) payout.paymentReference = paymentReference;

            if (status === 'completed' || status === 'failed' || status === 'cancelled') {
                payout.processedAt = new Date();
            }

            payoutStore.set(id, payout);

            return NextResponse.json({
                success: true,
                data: payout,
                message: 'Payout updated successfully'
            });
        }

        return NextResponse.json(
            { success: false, error: 'Invalid type. Must be "affiliate" or "payout"' },
            { status: 400 }
        );

    } catch (error) {
        console.error('Admin affiliate PUT error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to update' },
            { status: 500 }
        );
    }
}

// DELETE - Remove affiliate (suspend)
export async function DELETE(request: NextRequest) {
    try {
        seedDemoData();

        const { searchParams } = new URL(request.url);
        const affiliateId = searchParams.get('id');

        if (!affiliateId) {
            return NextResponse.json(
                { success: false, error: 'Affiliate ID is required' },
                { status: 400 }
            );
        }

        const affiliate = affiliateStore.get(affiliateId);
        if (!affiliate) {
            return NextResponse.json(
                { success: false, error: 'Affiliate not found' },
                { status: 404 }
            );
        }

        // Don't actually delete, just suspend
        affiliate.status = 'suspended';
        affiliateStore.set(affiliateId, affiliate);

        return NextResponse.json({
            success: true,
            message: 'Affiliate suspended successfully'
        });

    } catch (error) {
        console.error('Admin affiliate DELETE error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to suspend affiliate' },
            { status: 500 }
        );
    }
}
