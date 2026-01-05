import { NextRequest, NextResponse } from 'next/server';
import { createSubscription } from '@/lib/billing/razorpay-server';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { planId, customerId, totalCount, quantity, customerNotify, notes } = body;

        if (!planId) {
            return NextResponse.json(
                { error: 'Plan ID is required' },
                { status: 400 }
            );
        }

        const subscription = await createSubscription({
            plan_id: planId,
            customer_id: customerId,
            total_count: totalCount,
            quantity: quantity || 1,
            customer_notify: customerNotify ? 1 : 0,
            notes: notes || {},
        });

        return NextResponse.json(subscription);
    } catch (error) {
        console.error('Error creating subscription:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Failed to create subscription' },
            { status: 500 }
        );
    }
}
