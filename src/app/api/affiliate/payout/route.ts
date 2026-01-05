// =================================================================
// AFFILIATE PAYOUT API ROUTE
// Request and manage payouts
// =================================================================

import { NextRequest, NextResponse } from 'next/server';

// In-memory stores (shared with main route in production via database)
const payoutRequests = new Map<string, PayoutRequest>();

interface PayoutRequest {
    id: string;
    affiliateId: string;
    amount: number;
    status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
    paymentMethod: string;
    paymentEmail?: string;
    paymentReference?: string;
    transactionIds: string[];
    requestedAt: Date;
    processedAt?: Date;
    notes?: string;
    adminNotes?: string;
}

// Helper to generate unique IDs
function generateId(prefix: string): string {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Minimum payout threshold
const MINIMUM_PAYOUT = 50;

// POST - Request a payout
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { affiliateId, amount, paymentMethod, paymentEmail } = body;

        if (!affiliateId) {
            return NextResponse.json(
                { success: false, error: 'Affiliate ID is required' },
                { status: 400 }
            );
        }

        if (!amount || amount < MINIMUM_PAYOUT) {
            return NextResponse.json(
                { success: false, error: `Minimum payout amount is $${MINIMUM_PAYOUT}` },
                { status: 400 }
            );
        }

        // Check for pending payouts
        const hasPendingPayout = Array.from(payoutRequests.values())
            .some(p => p.affiliateId === affiliateId &&
                (p.status === 'pending' || p.status === 'processing'));

        if (hasPendingPayout) {
            return NextResponse.json(
                { success: false, error: 'You already have a pending payout request' },
                { status: 400 }
            );
        }

        // Create payout request
        const payoutId = generateId('pay');
        const payout: PayoutRequest = {
            id: payoutId,
            affiliateId,
            amount,
            status: 'pending',
            paymentMethod: paymentMethod || 'paypal',
            paymentEmail,
            transactionIds: [],
            requestedAt: new Date()
        };

        payoutRequests.set(payoutId, payout);

        return NextResponse.json({
            success: true,
            data: payout,
            message: 'Payout request submitted successfully. Processing typically takes 3-5 business days.'
        }, { status: 201 });

    } catch (error) {
        console.error('Payout POST error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to create payout request' },
            { status: 500 }
        );
    }
}

// GET - Get payout history for an affiliate
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const affiliateId = searchParams.get('affiliateId');

        if (!affiliateId) {
            return NextResponse.json(
                { success: false, error: 'Affiliate ID is required' },
                { status: 400 }
            );
        }

        const payouts = Array.from(payoutRequests.values())
            .filter(p => p.affiliateId === affiliateId)
            .sort((a, b) => new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime());

        return NextResponse.json({
            success: true,
            data: payouts
        });

    } catch (error) {
        console.error('Payout GET error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to get payouts' },
            { status: 500 }
        );
    }
}

// PUT - Update payout status (admin only)
export async function PUT(request: NextRequest) {
    try {
        const body = await request.json();
        const { payoutId, status, paymentReference, adminNotes } = body;

        if (!payoutId) {
            return NextResponse.json(
                { success: false, error: 'Payout ID is required' },
                { status: 400 }
            );
        }

        const payout = payoutRequests.get(payoutId);
        if (!payout) {
            return NextResponse.json(
                { success: false, error: 'Payout not found' },
                { status: 404 }
            );
        }

        // Update payout
        if (status) payout.status = status;
        if (paymentReference) payout.paymentReference = paymentReference;
        if (adminNotes) payout.adminNotes = adminNotes;

        if (status === 'completed' || status === 'failed' || status === 'cancelled') {
            payout.processedAt = new Date();
        }

        payoutRequests.set(payoutId, payout);

        return NextResponse.json({
            success: true,
            data: payout,
            message: 'Payout updated successfully'
        });

    } catch (error) {
        console.error('Payout PUT error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to update payout' },
            { status: 500 }
        );
    }
}

// Export store
export { payoutRequests };
