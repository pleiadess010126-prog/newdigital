import { NextRequest, NextResponse } from 'next/server';
import { verifyPaymentSignature, getPayment } from '@/lib/billing/razorpay-server';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = body;

        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
            return NextResponse.json(
                { error: 'Missing required parameters' },
                { status: 400 }
            );
        }

        // Verify the payment signature
        const isValid = verifyPaymentSignature(
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature
        );

        if (!isValid) {
            return NextResponse.json(
                { verified: false, error: 'Invalid payment signature' },
                { status: 400 }
            );
        }

        // Fetch payment details to confirm it was successful
        const payment = await getPayment(razorpay_payment_id);

        if (payment.status !== 'captured' && payment.status !== 'authorized') {
            return NextResponse.json(
                { verified: false, error: 'Payment not completed' },
                { status: 400 }
            );
        }

        // TODO: Update user's subscription in your database
        // This is where you would:
        // 1. Find the user associated with this order
        // 2. Update their subscription status
        // 3. Grant them access to paid features

        return NextResponse.json({
            verified: true,
            payment: {
                id: payment.id,
                amount: payment.amount,
                currency: payment.currency,
                status: payment.status,
                method: payment.method,
            },
        });
    } catch (error) {
        console.error('Error verifying payment:', error);
        return NextResponse.json(
            { verified: false, error: error instanceof Error ? error.message : 'Failed to verify payment' },
            { status: 500 }
        );
    }
}
