import { NextRequest, NextResponse } from 'next/server';
import { cancelSubscription as cancelRazorpaySubscription } from '@/lib/billing/razorpay-server';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { subscriptionId, cancelAtCycleEnd } = body;

        if (!subscriptionId) {
            return NextResponse.json(
                { error: 'Subscription ID is required' },
                { status: 400 }
            );
        }

        const subscription = await cancelRazorpaySubscription(
            subscriptionId,
            cancelAtCycleEnd ?? true
        );

        // TODO: Update user's subscription status in your database

        return NextResponse.json({
            success: true,
            subscription: {
                id: subscription.id,
                status: subscription.status,
                ended_at: subscription.ended_at,
            },
        });
    } catch (error) {
        console.error('Error cancelling subscription:', error);
        return NextResponse.json(
            { success: false, error: error instanceof Error ? error.message : 'Failed to cancel subscription' },
            { status: 500 }
        );
    }
}
