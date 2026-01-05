// =================================================================
// SIGNUP API ROUTE
// User registration with Cognito + demo fallback + Affiliate tracking
// =================================================================

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { signUp } from '@/lib/aws/cognito';
import { string, parseBody, apiResponse } from '@/lib/api/validation';

interface SignupRequest {
    name: string;
    email: string;
    password: string;
    organization: string;
    referralCode?: string; // Optional referral code from URL
}

function validateSignupRequest(data: unknown): SignupRequest {
    const obj = data as Record<string, unknown>;
    return {
        name: string.minLength(obj.name, 2, 'name'),
        email: string.email(obj.email),
        password: string.password(obj.password),
        organization: string.minLength(obj.organization, 2, 'organization'),
        referralCode: obj.referralCode as string | undefined,
    };
}

// In-memory referral store (would be database in production)
const referralRecords = new Map<string, ReferralRecord>();

interface ReferralRecord {
    id: string;
    referralCode: string;
    affiliateId?: string;
    referredUserId: string;
    referredUserEmail: string;
    referredUserName: string;
    status: 'pending' | 'active' | 'churned';
    signupDate: Date;
    plan: string;
    totalSpent: number;
    commissionEarned: number;
    isRecurring: boolean;
}

// Helper to generate unique IDs
function generateId(prefix: string): string {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export async function POST(request: Request) {
    try {
        // Validate request body
        const validation = await parseBody(request, validateSignupRequest);

        if (!validation.success) {
            return apiResponse.validationError(validation.errors!);
        }

        const { name, email, password, organization, referralCode: bodyReferralCode } = validation.data!;

        // Check for referral code from cookie or request body
        const cookieStore = await cookies();
        const cookieReferralCode = cookieStore.get('affiliate_ref')?.value;
        const clickId = cookieStore.get('affiliate_click_id')?.value;

        // Priority: body > cookie
        const referralCode = bodyReferralCode || cookieReferralCode;

        // Check if Cognito is configured
        const cognitoConfigured =
            process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID &&
            process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID;

        let userSub: string | undefined;
        let userId: string;

        if (cognitoConfigured) {
            // Production: Use Cognito signup
            const result = await signUp({ email, password, name });

            if (!result.success) {
                // Map Cognito errors to user-friendly messages
                let errorMessage = result.error || 'Signup failed';

                if (errorMessage.includes('UsernameExistsException')) {
                    errorMessage = 'An account with this email already exists';
                } else if (errorMessage.includes('InvalidPasswordException')) {
                    errorMessage = 'Password does not meet requirements';
                } else if (errorMessage.includes('InvalidParameterException')) {
                    errorMessage = 'Invalid email or password format';
                }

                return apiResponse.error(errorMessage, 400, 'SIGNUP_FAILED');
            }

            userSub = result.userSub;
            userId = result.userSub || generateId('user');
        } else {
            // Demo mode: Generate a demo user ID
            userId = generateId('demo_user');
        }

        // Track referral if we have a referral code
        let referralTracked = false;
        if (referralCode) {
            try {
                const referralId = generateId('ref');
                const referral: ReferralRecord = {
                    id: referralId,
                    referralCode,
                    referredUserId: userId,
                    referredUserEmail: email,
                    referredUserName: name,
                    status: 'pending',
                    signupDate: new Date(),
                    plan: 'free',
                    totalSpent: 0,
                    commissionEarned: 0,
                    isRecurring: false
                };

                referralRecords.set(referralId, referral);
                referralTracked = true;

                // Log the referral for tracking
                console.log(`[AFFILIATE] New referral tracked:`, {
                    referralId,
                    referralCode,
                    userId,
                    email,
                    clickId
                });

                // Clear referral cookies after successful attribution
                cookieStore.delete('affiliate_ref');
                cookieStore.delete('affiliate_click_id');
            } catch (refError) {
                console.error('Failed to track referral:', refError);
                // Don't fail signup if referral tracking fails
            }
        }

        if (cognitoConfigured) {
            return apiResponse.success({
                message: 'Please check your email to verify your account',
                userSub,
                userId,
                requiresVerification: true,
                referralTracked,
                referralCode: referralTracked ? referralCode : undefined,
            }, 201);
        }

        // Development/Demo mode: Create demo session
        return NextResponse.json(
            {
                success: true,
                data: {
                    message: 'Demo account created',
                    userId,
                    requiresVerification: false,
                    referralTracked,
                    referralCode: referralTracked ? referralCode : undefined,
                },
            },
            { status: 201 }
        );

    } catch (error) {
        console.error('Signup route error:', error);
        return apiResponse.serverError('Signup failed. Please try again.');
    }
}

// Export referral records for use in other routes
export { referralRecords };
