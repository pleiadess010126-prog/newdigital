// Razorpay Integration for DigitalMEng SaaS
// Note: In production, set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in environment variables

// Currency conversion rates (approximate - should be fetched dynamically in production)
const INR_CONVERSION_RATES: Record<string, number> = {
    USD: 83.0,
    EUR: 90.0,
    GBP: 105.0,
    INR: 1.0,
};

// Price configuration for Razorpay in INR (paise - 100 paise = 1 INR)
// Prices in INR based on USD pricing
export const RAZORPAY_PRICES = {
    lite: {
        monthly: 240700,      // ₹2,407/month (~$29)
        yearly: 1909200,      // ₹19,092/year (~$23/month)
    },
    starter: {
        monthly: 655700,      // ₹6,557/month (~$79)
        yearly: 5227200,      // ₹52,272/year (~$63/month)
    },
    pro: {
        monthly: 1651700,     // ₹16,517/month (~$199)
        yearly: 13188000,     // ₹131,880/year (~$159/month)
    },
    enterprise: {
        monthly: 4971700,     // ₹49,717/month (~$599)
        yearly: 39748800,     // ₹397,488/year (~$479/month)
    },
};

// Plan IDs for Razorpay subscriptions (create these in Razorpay Dashboard)
export const RAZORPAY_PLANS = {
    lite: {
        monthly: 'plan_lite_monthly',
        yearly: 'plan_lite_yearly',
    },
    starter: {
        monthly: 'plan_starter_monthly',
        yearly: 'plan_starter_yearly',
    },
    pro: {
        monthly: 'plan_pro_monthly',
        yearly: 'plan_pro_yearly',
    },
    enterprise: {
        monthly: 'plan_enterprise_monthly',
        yearly: 'plan_enterprise_yearly',
    },
};

export interface CreateOrderParams {
    amount: number; // Amount in paise
    currency?: string;
    receipt?: string;
    notes?: Record<string, string>;
    customerId?: string;
}

export interface RazorpayOrder {
    id: string;
    entity: string;
    amount: number;
    amount_paid: number;
    amount_due: number;
    currency: string;
    receipt: string;
    status: 'created' | 'attempted' | 'paid';
    notes: Record<string, string>;
    created_at: number;
}

export interface VerifyPaymentParams {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
}

export interface CreateSubscriptionParams {
    planId: string;
    customerId?: string;
    totalCount?: number; // Number of billing cycles
    quantity?: number;
    customerNotify?: boolean;
    notes?: Record<string, string>;
}

export interface RazorpaySubscription {
    id: string;
    entity: string;
    plan_id: string;
    customer_id: string;
    status: 'created' | 'authenticated' | 'active' | 'pending' | 'halted' | 'cancelled' | 'completed' | 'expired';
    current_start: number;
    current_end: number;
    ended_at: number | null;
    quantity: number;
    notes: Record<string, string>;
    short_url: string;
}

// Create a Razorpay order for one-time payments
export async function createOrder(params: CreateOrderParams): Promise<RazorpayOrder> {
    const response = await fetch('/api/razorpay/create-order', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
    });

    if (!response.ok) {
        throw new Error('Failed to create Razorpay order');
    }

    return response.json();
}

// Verify payment signature
export async function verifyPayment(params: VerifyPaymentParams): Promise<{ verified: boolean }> {
    const response = await fetch('/api/razorpay/verify-payment', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
    });

    if (!response.ok) {
        throw new Error('Failed to verify payment');
    }

    return response.json();
}

// Create a Razorpay subscription for recurring payments
export async function createSubscription(params: CreateSubscriptionParams): Promise<RazorpaySubscription> {
    const response = await fetch('/api/razorpay/create-subscription', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
    });

    if (!response.ok) {
        throw new Error('Failed to create subscription');
    }

    return response.json();
}

// Cancel a subscription
export async function cancelSubscription(subscriptionId: string): Promise<{ success: boolean }> {
    const response = await fetch('/api/razorpay/cancel-subscription', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ subscriptionId }),
    });

    if (!response.ok) {
        throw new Error('Failed to cancel subscription');
    }

    return response.json();
}

// Webhook event types we care about
export type RazorpayWebhookEvent =
    | 'payment.authorized'
    | 'payment.captured'
    | 'payment.failed'
    | 'subscription.activated'
    | 'subscription.charged'
    | 'subscription.completed'
    | 'subscription.updated'
    | 'subscription.pending'
    | 'subscription.halted'
    | 'subscription.cancelled';

// Subscription status types
export type RazorpaySubscriptionStatus =
    | 'created'
    | 'authenticated'
    | 'active'
    | 'pending'
    | 'halted'
    | 'cancelled'
    | 'completed'
    | 'expired';

export interface Subscription {
    id: string;
    status: RazorpaySubscriptionStatus;
    planId: string;
    planType: 'free' | 'lite' | 'starter' | 'pro' | 'enterprise';
    billingCycle: 'monthly' | 'yearly';
    currentPeriodStart: Date;
    currentPeriodEnd: Date;
    cancelAtPeriodEnd: boolean;
}

// Map Razorpay plan ID to plan type
export function getPlanFromPlanId(planId: string): { type: 'free' | 'lite' | 'starter' | 'pro' | 'enterprise'; cycle: 'monthly' | 'yearly' } {
    if (planId.includes('enterprise')) {
        return { type: 'enterprise', cycle: planId.includes('yearly') ? 'yearly' : 'monthly' };
    }
    if (planId.includes('pro')) {
        return { type: 'pro', cycle: planId.includes('yearly') ? 'yearly' : 'monthly' };
    }
    if (planId.includes('starter')) {
        return { type: 'starter', cycle: planId.includes('yearly') ? 'yearly' : 'monthly' };
    }
    if (planId.includes('lite')) {
        return { type: 'lite', cycle: planId.includes('yearly') ? 'yearly' : 'monthly' };
    }
    return { type: 'free', cycle: 'monthly' };
}

// Format price for display in INR
export function formatPriceINR(amountInPaise: number): string {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 0,
    }).format(amountInPaise / 100);
}

// Convert amount from other currencies to INR (paise)
export function convertToINR(amount: number, fromCurrency: string = 'USD'): number {
    const rate = INR_CONVERSION_RATES[fromCurrency] || 1;
    return Math.round(amount * rate * 100); // Convert to paise
}

// Initialize Razorpay checkout (client-side)
export interface RazorpayCheckoutOptions {
    key: string;
    amount: number;
    currency: string;
    name: string;
    description: string;
    order_id: string;
    prefill?: {
        name?: string;
        email?: string;
        contact?: string;
    };
    notes?: Record<string, string>;
    theme?: {
        color?: string;
    };
    handler: (response: {
        razorpay_payment_id: string;
        razorpay_order_id: string;
        razorpay_signature: string;
    }) => void;
}

// Load Razorpay script dynamically
export function loadRazorpayScript(): Promise<boolean> {
    return new Promise((resolve) => {
        if (typeof window !== 'undefined' && (window as any).Razorpay) {
            resolve(true);
            return;
        }

        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
    });
}

// Open Razorpay checkout modal
export async function openCheckout(options: RazorpayCheckoutOptions): Promise<void> {
    const loaded = await loadRazorpayScript();
    if (!loaded) {
        throw new Error('Failed to load Razorpay SDK');
    }

    const razorpay = new (window as any).Razorpay(options);
    razorpay.open();
}
