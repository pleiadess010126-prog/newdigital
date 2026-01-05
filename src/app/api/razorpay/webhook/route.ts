import { NextRequest, NextResponse } from 'next/server';
import { verifyWebhookSignature, getPayment, getSubscription } from '@/lib/billing/razorpay-server';

// Razorpay Webhook Events Handler
export async function POST(request: NextRequest) {
    try {
        const body = await request.text();
        const signature = request.headers.get('x-razorpay-signature');
        const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

        if (!signature || !webhookSecret) {
            return NextResponse.json(
                { error: 'Missing signature or webhook secret' },
                { status: 400 }
            );
        }

        // Verify webhook signature
        const isValid = verifyWebhookSignature(body, signature, webhookSecret);
        if (!isValid) {
            console.error('Invalid webhook signature');
            return NextResponse.json(
                { error: 'Invalid signature' },
                { status: 400 }
            );
        }

        const event = JSON.parse(body);
        const { event: eventType, payload } = event;

        console.log(`Received Razorpay webhook: ${eventType}`);

        switch (eventType) {
            case 'payment.authorized':
                await handlePaymentAuthorized(payload.payment.entity);
                break;

            case 'payment.captured':
                await handlePaymentCaptured(payload.payment.entity);
                break;

            case 'payment.failed':
                await handlePaymentFailed(payload.payment.entity);
                break;

            case 'subscription.activated':
                await handleSubscriptionActivated(payload.subscription.entity);
                break;

            case 'subscription.charged':
                await handleSubscriptionCharged(payload.subscription.entity, payload.payment?.entity);
                break;

            case 'subscription.completed':
                await handleSubscriptionCompleted(payload.subscription.entity);
                break;

            case 'subscription.cancelled':
                await handleSubscriptionCancelled(payload.subscription.entity);
                break;

            case 'subscription.halted':
                await handleSubscriptionHalted(payload.subscription.entity);
                break;

            case 'subscription.pending':
                await handleSubscriptionPending(payload.subscription.entity);
                break;

            default:
                console.log(`Unhandled webhook event: ${eventType}`);
        }

        return NextResponse.json({ received: true });
    } catch (error) {
        console.error('Webhook error:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Webhook processing failed' },
            { status: 500 }
        );
    }
}

// Payment authorized - ready to capture
async function handlePaymentAuthorized(payment: any) {
    console.log(`Payment authorized: ${payment.id}, Amount: ${payment.amount / 100} ${payment.currency}`);
    // TODO: Auto-capture the payment if needed
    // In most cases, payments are auto-captured with Razorpay
}

// Payment captured successfully
async function handlePaymentCaptured(payment: any) {
    console.log(`Payment captured: ${payment.id}, Amount: ${payment.amount / 100} ${payment.currency}`);
    // TODO: Update order status in database
    // Grant access to purchased features/plans
}

// Payment failed
async function handlePaymentFailed(payment: any) {
    console.log(`Payment failed: ${payment.id}, Reason: ${payment.error_description}`);
    // TODO: Update order status
    // Notify user of payment failure
}

// Subscription activated
async function handleSubscriptionActivated(subscription: any) {
    console.log(`Subscription activated: ${subscription.id}, Plan: ${subscription.plan_id}`);
    // TODO: Update user's subscription status to active
    // Grant access to subscription features
}

// Subscription charged (recurring payment successful)
async function handleSubscriptionCharged(subscription: any, payment: any) {
    console.log(`Subscription charged: ${subscription.id}, Payment: ${payment?.id}`);
    // TODO: Record the payment
    // Extend subscription period
}

// Subscription completed (all billing cycles done)
async function handleSubscriptionCompleted(subscription: any) {
    console.log(`Subscription completed: ${subscription.id}`);
    // TODO: Update subscription status to completed
    // May need to prompt user to renew
}

// Subscription cancelled
async function handleSubscriptionCancelled(subscription: any) {
    console.log(`Subscription cancelled: ${subscription.id}`);
    // TODO: Update subscription status
    // Revoke access at end of billing period
}

// Subscription halted (payment failed multiple times)
async function handleSubscriptionHalted(subscription: any) {
    console.log(`Subscription halted: ${subscription.id}`);
    // TODO: Notify user of payment issues
    // May need to restrict access
}

// Subscription pending (waiting for authorization)
async function handleSubscriptionPending(subscription: any) {
    console.log(`Subscription pending: ${subscription.id}`);
    // TODO: Send reminder to user to authorize payment
}
