// =================================================================
// AFFILIATE API ROUTE
// Main affiliate operations: Get affiliate info, Create affiliate
// =================================================================

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

// In-memory store for demo (replace with database in production)
const affiliateStore = new Map<string, AffiliateData>();
const referralStore = new Map<string, ReferralData>();
const transactionStore = new Map<string, TransactionData>();
const payoutStore = new Map<string, PayoutData>();

interface AffiliateData {
    id: string;
    userId: string;
    referralCode: string;
    referralLink: string;
    status: 'active' | 'pending' | 'suspended' | 'inactive';
    tier: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';
    createdAt: Date;
    approvedAt?: Date;
    commissionRate: number;
    cookieDuration: number;
    paymentMethod: 'paypal' | 'bank_transfer' | 'crypto' | 'stripe';
    paymentEmail?: string;
    paymentDetails?: {
        bankName?: string;
        accountNumber?: string;
        routingNumber?: string;
        swiftCode?: string;
        cryptoWallet?: string;
        cryptoNetwork?: string;
    };
    stats: {
        totalClicks: number;
        uniqueClicks: number;
        totalSignups: number;
        paidConversions: number;
        conversionRate: number;
        totalEarnings: number;
        pendingEarnings: number;
        paidEarnings: number;
        lifetimeValue: number;
        averageOrderValue: number;
        last30DaysClicks: number;
        last30DaysSignups: number;
        last30DaysEarnings: number;
    };
}

interface ReferralData {
    id: string;
    affiliateId: string;
    referredUserId: string;
    referredUserEmail: string;
    referredUserName?: string;
    status: 'pending' | 'active' | 'churned' | 'refunded';
    signupDate: Date;
    firstPurchaseDate?: Date;
    plan?: string;
    totalSpent: number;
    commissionEarned: number;
    isRecurring: boolean;
}

interface TransactionData {
    id: string;
    affiliateId: string;
    referralId?: string;
    type: 'click' | 'signup' | 'commission' | 'payout' | 'adjustment' | 'bonus';
    amount: number;
    status: 'pending' | 'approved' | 'paid' | 'rejected' | 'cancelled';
    description: string;
    metadata?: Record<string, unknown>;
    createdAt: Date;
    processedAt?: Date;
}

interface PayoutData {
    id: string;
    affiliateId: string;
    amount: number;
    status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
    paymentMethod: string;
    paymentReference?: string;
    transactionIds: string[];
    requestedAt: Date;
    processedAt?: Date;
    notes?: string;
}

// Helper to generate unique IDs
function generateId(prefix: string): string {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Helper to generate referral code
function generateReferralCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = 'DM';
    for (let i = 0; i < 8; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
}

// Commission rates by tier
const tierCommissionRates: Record<string, number> = {
    bronze: 10,
    silver: 12,
    gold: 15,
    platinum: 18,
    diamond: 20
};

// GET - Get affiliate info for current user
export async function GET(request: NextRequest) {
    try {
        const cookieStore = await cookies();
        const sessionCookie = cookieStore.get('session');

        // Parse session to get user ID
        let userId = 'demo_user';
        if (sessionCookie?.value) {
            try {
                const session = JSON.parse(sessionCookie.value);
                userId = session.userId || session.user?.id || 'demo_user';
            } catch {
                // Use default
            }
        }

        // Check URL params for specific affiliate lookup
        const { searchParams } = new URL(request.url);
        const affiliateId = searchParams.get('affiliateId');
        const action = searchParams.get('action');

        // Get referrals for an affiliate
        if (action === 'referrals' && affiliateId) {
            const referrals = Array.from(referralStore.values())
                .filter(r => r.affiliateId === affiliateId)
                .sort((a, b) => new Date(b.signupDate).getTime() - new Date(a.signupDate).getTime());

            return NextResponse.json({
                success: true,
                data: referrals
            });
        }

        // Get transactions for an affiliate
        if (action === 'transactions' && affiliateId) {
            const transactions = Array.from(transactionStore.values())
                .filter(t => t.affiliateId === affiliateId)
                .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

            return NextResponse.json({
                success: true,
                data: transactions
            });
        }

        // Get payouts for an affiliate
        if (action === 'payouts' && affiliateId) {
            const payouts = Array.from(payoutStore.values())
                .filter(p => p.affiliateId === affiliateId)
                .sort((a, b) => new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime());

            return NextResponse.json({
                success: true,
                data: payouts
            });
        }

        // Find affiliate for current user
        let affiliate = Array.from(affiliateStore.values()).find(a => a.userId === userId);

        if (!affiliate) {
            return NextResponse.json({
                success: true,
                data: null,
                message: 'No affiliate account found'
            });
        }

        // Get related data
        const referrals = Array.from(referralStore.values())
            .filter(r => r.affiliateId === affiliate!.id);
        const transactions = Array.from(transactionStore.values())
            .filter(t => t.affiliateId === affiliate!.id)
            .slice(0, 20);
        const payouts = Array.from(payoutStore.values())
            .filter(p => p.affiliateId === affiliate!.id);

        return NextResponse.json({
            success: true,
            data: {
                affiliate,
                referrals,
                transactions,
                payouts
            }
        });

    } catch (error) {
        console.error('Affiliate GET error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to get affiliate data' },
            { status: 500 }
        );
    }
}

// POST - Create new affiliate account
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { userId, paymentMethod, paymentEmail, paymentDetails } = body;

        if (!userId) {
            return NextResponse.json(
                { success: false, error: 'User ID is required' },
                { status: 400 }
            );
        }

        // Check if user already has an affiliate account
        const existingAffiliate = Array.from(affiliateStore.values())
            .find(a => a.userId === userId);

        if (existingAffiliate) {
            return NextResponse.json(
                { success: false, error: 'User already has an affiliate account' },
                { status: 400 }
            );
        }

        // Generate unique referral code
        let referralCode = generateReferralCode();
        while (Array.from(affiliateStore.values()).some(a => a.referralCode === referralCode)) {
            referralCode = generateReferralCode();
        }

        // Create new affiliate
        const affiliateId = generateId('aff');
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://digitalmeng.com';

        const newAffiliate: AffiliateData = {
            id: affiliateId,
            userId,
            referralCode,
            referralLink: `${baseUrl}/?ref=${referralCode}`,
            status: 'pending', // Needs admin approval
            tier: 'bronze',
            createdAt: new Date(),
            commissionRate: tierCommissionRates.bronze,
            cookieDuration: 30, // 30 days default
            paymentMethod: paymentMethod || 'paypal',
            paymentEmail: paymentEmail,
            paymentDetails: paymentDetails,
            stats: {
                totalClicks: 0,
                uniqueClicks: 0,
                totalSignups: 0,
                paidConversions: 0,
                conversionRate: 0,
                totalEarnings: 0,
                pendingEarnings: 0,
                paidEarnings: 0,
                lifetimeValue: 0,
                averageOrderValue: 0,
                last30DaysClicks: 0,
                last30DaysSignups: 0,
                last30DaysEarnings: 0
            }
        };

        affiliateStore.set(affiliateId, newAffiliate);

        return NextResponse.json({
            success: true,
            data: newAffiliate,
            message: 'Affiliate account created successfully. Pending admin approval.'
        }, { status: 201 });

    } catch (error) {
        console.error('Affiliate POST error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to create affiliate account' },
            { status: 500 }
        );
    }
}

// PUT - Update affiliate settings
export async function PUT(request: NextRequest) {
    try {
        const body = await request.json();
        const { affiliateId, paymentMethod, paymentEmail, paymentDetails, status, tier, commissionRate } = body;

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

        // Update fields
        if (paymentMethod) affiliate.paymentMethod = paymentMethod;
        if (paymentEmail) affiliate.paymentEmail = paymentEmail;
        if (paymentDetails) affiliate.paymentDetails = paymentDetails;

        // Admin-only fields
        if (status) {
            affiliate.status = status;
            if (status === 'active' && !affiliate.approvedAt) {
                affiliate.approvedAt = new Date();
            }
        }
        if (tier) {
            affiliate.tier = tier;
            affiliate.commissionRate = tierCommissionRates[tier] || affiliate.commissionRate;
        }
        if (commissionRate !== undefined) {
            affiliate.commissionRate = commissionRate;
        }

        affiliateStore.set(affiliateId, affiliate);

        return NextResponse.json({
            success: true,
            data: affiliate,
            message: 'Affiliate updated successfully'
        });

    } catch (error) {
        console.error('Affiliate PUT error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to update affiliate' },
            { status: 500 }
        );
    }
}

// Export stores for use in other routes
export { affiliateStore, referralStore, transactionStore, payoutStore, generateId, tierCommissionRates };
