// Server-side Razorpay utilities
// This file should only be imported in server-side code (API routes)

import crypto from 'crypto';

// Razorpay API base URL
const RAZORPAY_API_URL = 'https://api.razorpay.com/v1';

// Get Razorpay credentials from environment
export function getRazorpayCredentials() {
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret) {
        throw new Error('Razorpay credentials not configured');
    }

    return { keyId, keySecret };
}

// Create Basic Auth header for Razorpay API
function getAuthHeader(): string {
    const { keyId, keySecret } = getRazorpayCredentials();
    return 'Basic ' + Buffer.from(`${keyId}:${keySecret}`).toString('base64');
}

// Make authenticated request to Razorpay API
async function razorpayRequest<T>(
    endpoint: string,
    method: string = 'GET',
    body?: Record<string, unknown>
): Promise<T> {
    const response = await fetch(`${RAZORPAY_API_URL}${endpoint}`, {
        method,
        headers: {
            'Authorization': getAuthHeader(),
            'Content-Type': 'application/json',
        },
        body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Unknown error' }));
        throw new Error(error.error?.description || error.message || 'Razorpay API error');
    }

    return response.json();
}

// Create an order
export interface CreateOrderParams {
    amount: number; // In paise
    currency?: string;
    receipt?: string;
    notes?: Record<string, string>;
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

export async function createOrder(params: CreateOrderParams): Promise<RazorpayOrder> {
    return razorpayRequest<RazorpayOrder>('/orders', 'POST', {
        amount: params.amount,
        currency: params.currency || 'INR',
        receipt: params.receipt || `receipt_${Date.now()}`,
        notes: params.notes || {},
    });
}

// Verify payment signature
export function verifyPaymentSignature(
    orderId: string,
    paymentId: string,
    signature: string
): boolean {
    const { keySecret } = getRazorpayCredentials();
    const generatedSignature = crypto
        .createHmac('sha256', keySecret)
        .update(`${orderId}|${paymentId}`)
        .digest('hex');

    return generatedSignature === signature;
}

// Verify webhook signature
export function verifyWebhookSignature(
    body: string,
    signature: string,
    webhookSecret: string
): boolean {
    const generatedSignature = crypto
        .createHmac('sha256', webhookSecret)
        .update(body)
        .digest('hex');

    return generatedSignature === signature;
}

// Create a subscription
export interface CreateSubscriptionParams {
    plan_id: string;
    customer_id?: string;
    total_count?: number;
    quantity?: number;
    customer_notify?: 0 | 1;
    notes?: Record<string, string>;
}

export interface RazorpaySubscription {
    id: string;
    entity: string;
    plan_id: string;
    customer_id: string;
    status: string;
    current_start: number;
    current_end: number;
    ended_at: number | null;
    quantity: number;
    notes: Record<string, string>;
    short_url: string;
}

export async function createSubscription(params: CreateSubscriptionParams): Promise<RazorpaySubscription> {
    return razorpayRequest<RazorpaySubscription>('/subscriptions', 'POST', { ...params });
}

// Get subscription details
export async function getSubscription(subscriptionId: string): Promise<RazorpaySubscription> {
    return razorpayRequest<RazorpaySubscription>(`/subscriptions/${subscriptionId}`);
}

// Cancel subscription
export async function cancelSubscription(subscriptionId: string, cancelAtCycleEnd: boolean = false): Promise<RazorpaySubscription> {
    return razorpayRequest<RazorpaySubscription>(
        `/subscriptions/${subscriptionId}/cancel`,
        'POST',
        { cancel_at_cycle_end: cancelAtCycleEnd ? 1 : 0 }
    );
}

// Create a plan (for subscriptions)
export interface CreatePlanParams {
    period: 'daily' | 'weekly' | 'monthly' | 'yearly';
    interval: number;
    item: {
        name: string;
        amount: number; // In paise
        currency: string;
        description?: string;
    };
    notes?: Record<string, string>;
}

export interface RazorpayPlan {
    id: string;
    entity: string;
    interval: number;
    period: string;
    item: {
        id: string;
        active: boolean;
        amount: number;
        unit_amount: number;
        currency: string;
        name: string;
        description: string;
    };
    notes: Record<string, string>;
    created_at: number;
}

export async function createPlan(params: CreatePlanParams): Promise<RazorpayPlan> {
    return razorpayRequest<RazorpayPlan>('/plans', 'POST', { ...params });
}

// Get plan details
export async function getPlan(planId: string): Promise<RazorpayPlan> {
    return razorpayRequest<RazorpayPlan>(`/plans/${planId}`);
}

// Fetch payment details
export interface RazorpayPayment {
    id: string;
    entity: string;
    amount: number;
    currency: string;
    status: 'created' | 'authorized' | 'captured' | 'refunded' | 'failed';
    order_id: string;
    invoice_id: string | null;
    international: boolean;
    method: string;
    amount_refunded: number;
    refund_status: string | null;
    captured: boolean;
    description: string;
    bank: string | null;
    wallet: string | null;
    vpa: string | null;
    email: string;
    contact: string;
    notes: Record<string, string>;
    fee: number;
    tax: number;
    error_code: string | null;
    error_description: string | null;
    created_at: number;
}

export async function getPayment(paymentId: string): Promise<RazorpayPayment> {
    return razorpayRequest<RazorpayPayment>(`/payments/${paymentId}`);
}

// Capture payment (for multi-step payments)
export async function capturePayment(paymentId: string, amount: number, currency: string = 'INR'): Promise<RazorpayPayment> {
    return razorpayRequest<RazorpayPayment>(`/payments/${paymentId}/capture`, 'POST', { amount, currency });
}

// Create refund
export interface CreateRefundParams {
    amount?: number; // Partial refund amount
    speed?: 'normal' | 'optimum';
    notes?: Record<string, string>;
    receipt?: string;
}

export interface RazorpayRefund {
    id: string;
    entity: string;
    amount: number;
    currency: string;
    payment_id: string;
    notes: Record<string, string>;
    receipt: string;
    status: 'pending' | 'processed' | 'failed';
    created_at: number;
}

export async function createRefund(paymentId: string, params?: CreateRefundParams): Promise<RazorpayRefund> {
    return razorpayRequest<RazorpayRefund>(`/payments/${paymentId}/refund`, 'POST', params ? { ...params } : {});
}

// Test connection to Razorpay API
export async function testConnection(): Promise<{ success: boolean; message: string; details?: Record<string, unknown> }> {
    try {
        // Try to fetch orders with limit 1 to test connection
        const response = await razorpayRequest<{ items: unknown[]; count: number }>('/orders?count=1');
        return {
            success: true,
            message: 'Razorpay connection successful',
            details: {
                ordersCount: response.count,
            },
        };
    } catch (error) {
        return {
            success: false,
            message: error instanceof Error ? error.message : 'Failed to connect to Razorpay',
        };
    }
}
