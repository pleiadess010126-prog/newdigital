// Stripe Integration for DigitalMEng SaaS
// Note: In production, set STRIPE_SECRET_KEY and STRIPE_PUBLISHABLE_KEY in environment variables

// Price IDs from Stripe Dashboard - Replace with your actual Stripe Price IDs
// Updated January 2026 - Optimized for 70%+ profit margin
export const STRIPE_PRICES = {
    lite: {
        monthly: 'price_lite_monthly_29',      // $29/month - 80%+ margin
        yearly: 'price_lite_yearly_23',        // $23/month billed yearly
    },
    starter: {
        monthly: 'price_starter_monthly_79',   // $79/month - 74% margin (5 min video, 10K voice)
        yearly: 'price_starter_yearly_63',     // $63/month billed yearly
    },
    growth: {
        monthly: 'price_growth_monthly_149',   // $149/month - 73% margin (12 min video, 25K voice)
        yearly: 'price_growth_yearly_119',     // $119/month billed yearly (20% off)
    },
    pro: {
        monthly: 'price_pro_monthly_299',      // $299/month - 72% margin (20 min video, 40K voice)
        yearly: 'price_pro_yearly_239',        // $239/month billed yearly (20% off)
    },
    enterprise: {
        monthly: 'price_enterprise_monthly_999', // $999/month - 70% margin (fair-use limits apply)
        yearly: 'price_enterprise_yearly_799',   // $799/month billed yearly (20% off)
    },
};

export interface CreateCheckoutSessionParams {
    priceId: string;
    customerId?: string;
    successUrl: string;
    cancelUrl: string;
    metadata?: Record<string, string>;
}

export interface CheckoutSession {
    id: string;
    url: string;
}

// Create a Stripe Checkout session
// In production, this should be called from a server-side API route
export async function createCheckoutSession(
    params: CreateCheckoutSessionParams
): Promise<CheckoutSession> {
    // This is a placeholder - In production, this would call your API
    // which then calls Stripe's API server-side

    const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
    });

    if (!response.ok) {
        throw new Error('Failed to create checkout session');
    }

    return response.json();
}

// Get customer portal session for managing subscriptions
export async function createPortalSession(customerId: string): Promise<{ url: string }> {
    const response = await fetch('/api/stripe/create-portal-session', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ customerId }),
    });

    if (!response.ok) {
        throw new Error('Failed to create portal session');
    }

    return response.json();
}

// Webhook event types we care about
export type StripeWebhookEvent =
    | 'checkout.session.completed'
    | 'customer.subscription.created'
    | 'customer.subscription.updated'
    | 'customer.subscription.deleted'
    | 'invoice.payment_succeeded'
    | 'invoice.payment_failed';

// Subscription status types
export type SubscriptionStatus =
    | 'active'
    | 'past_due'
    | 'unpaid'
    | 'canceled'
    | 'incomplete'
    | 'incomplete_expired'
    | 'trialing';

export interface Subscription {
    id: string;
    status: SubscriptionStatus;
    priceId: string;
    planId: 'free' | 'lite' | 'starter' | 'growth' | 'pro' | 'enterprise';
    currentPeriodStart: Date;
    currentPeriodEnd: Date;
    cancelAtPeriodEnd: boolean;
}

// Map Stripe price ID to plan ID
export function getPlanFromPriceId(priceId: string): 'free' | 'lite' | 'starter' | 'growth' | 'pro' | 'enterprise' {
    if (priceId.includes('lite')) return 'lite';
    if (priceId.includes('starter')) return 'starter';
    if (priceId.includes('growth')) return 'growth';
    if (priceId.includes('pro')) return 'pro';
    if (priceId.includes('enterprise')) return 'enterprise';
    return 'free';
}

// Format price for display
export function formatPrice(amount: number, currency: string = 'USD'): string {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency,
        minimumFractionDigits: 0,
    }).format(amount);
}
