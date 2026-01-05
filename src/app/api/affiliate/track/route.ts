// =================================================================
// AFFILIATE TRACKING API ROUTE
// Track clicks, record referrals, attribute conversions
// =================================================================

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

// Import stores from main affiliate route
// Note: In production, these would be database calls
const affiliateClickStore = new Map<string, ClickData>();

interface ClickData {
    id: string;
    affiliateId: string;
    referralCode: string;
    ipAddress: string;
    userAgent: string;
    referer?: string;
    landingPage: string;
    timestamp: Date;
    converted: boolean;
    conversionType?: string;
}

// Helper to generate unique IDs
function generateId(prefix: string): string {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// POST - Track a click/referral
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { referralCode, landingPage } = body;

        if (!referralCode) {
            return NextResponse.json(
                { success: false, error: 'Referral code is required' },
                { status: 400 }
            );
        }

        // Get client info
        const ipAddress = request.headers.get('x-forwarded-for') ||
            request.headers.get('x-real-ip') ||
            'unknown';
        const userAgent = request.headers.get('user-agent') || 'unknown';
        const referer = request.headers.get('referer') || undefined;

        // Create click record
        const clickId = generateId('click');
        const click: ClickData = {
            id: clickId,
            affiliateId: '', // Will be resolved when we integrate with affiliate store
            referralCode,
            ipAddress,
            userAgent,
            referer,
            landingPage: landingPage || '/',
            timestamp: new Date(),
            converted: false
        };

        affiliateClickStore.set(clickId, click);

        // Set referral cookie (valid for cookie duration days)
        const cookieStore = await cookies();
        const cookieDuration = 30; // Default 30 days

        cookieStore.set('affiliate_ref', referralCode, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: cookieDuration * 24 * 60 * 60, // days to seconds
            path: '/'
        });

        cookieStore.set('affiliate_click_id', clickId, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: cookieDuration * 24 * 60 * 60,
            path: '/'
        });

        return NextResponse.json({
            success: true,
            data: {
                tracked: true,
                clickId,
                referralCode
            },
            message: 'Click tracked successfully'
        });

    } catch (error) {
        console.error('Affiliate tracking error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to track click' },
            { status: 500 }
        );
    }
}

// GET - Check if there's an active referral cookie
export async function GET(request: NextRequest) {
    try {
        const cookieStore = await cookies();
        const referralCode = cookieStore.get('affiliate_ref')?.value;
        const clickId = cookieStore.get('affiliate_click_id')?.value;

        if (!referralCode) {
            return NextResponse.json({
                success: true,
                data: {
                    hasReferral: false
                }
            });
        }

        return NextResponse.json({
            success: true,
            data: {
                hasReferral: true,
                referralCode,
                clickId
            }
        });

    } catch (error) {
        console.error('Affiliate tracking GET error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to check referral' },
            { status: 500 }
        );
    }
}

// Export click store for use in other routes
export { affiliateClickStore };
