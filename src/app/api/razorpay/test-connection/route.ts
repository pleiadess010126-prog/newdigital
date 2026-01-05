import { NextRequest, NextResponse } from 'next/server';

// Test Razorpay API connection
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { keyId, keySecret } = body;

        if (!keyId || !keySecret) {
            return NextResponse.json(
                { success: false, message: 'Key ID and Key Secret are required' },
                { status: 400 }
            );
        }

        // Test the connection by fetching orders with limit 1
        const authHeader = 'Basic ' + Buffer.from(`${keyId}:${keySecret}`).toString('base64');

        const response = await fetch('https://api.razorpay.com/v1/orders?count=1', {
            method: 'GET',
            headers: {
                'Authorization': authHeader,
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({ error: { description: 'Unknown error' } }));
            return NextResponse.json({
                success: false,
                message: error.error?.description || 'Invalid Razorpay credentials',
            });
        }

        const data = await response.json();

        return NextResponse.json({
            success: true,
            message: 'Razorpay connection successful',
            details: {
                totalOrders: data.count || 0,
                status: 'Connected',
            },
        });
    } catch (error) {
        console.error('Error testing Razorpay connection:', error);
        return NextResponse.json({
            success: false,
            message: error instanceof Error ? error.message : 'Failed to test connection',
        });
    }
}
