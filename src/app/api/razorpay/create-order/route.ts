import { NextRequest, NextResponse } from 'next/server';
import { createOrder } from '@/lib/billing/razorpay-server';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { amount, currency, receipt, notes } = body;

        if (!amount || amount <= 0) {
            return NextResponse.json(
                { error: 'Invalid amount' },
                { status: 400 }
            );
        }

        const order = await createOrder({
            amount,
            currency: currency || 'INR',
            receipt: receipt || `order_${Date.now()}`,
            notes: notes || {},
        });

        return NextResponse.json(order);
    } catch (error) {
        console.error('Error creating Razorpay order:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Failed to create order' },
            { status: 500 }
        );
    }
}
