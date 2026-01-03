// =================================================================
// LOGIN API ROUTE
// Production authentication with Cognito + demo fallback
// =================================================================

import { signIn } from '@/lib/aws/cognito';
import { setSessionCookies } from '@/lib/auth/session.server';
import { type SessionUser } from '@/lib/auth/session';
import { string, parseBody, apiResponse } from '@/lib/api/validation';

interface LoginRequest {
    email: string;
    password: string;
}

function validateLoginRequest(data: unknown): LoginRequest {
    const obj = data as Record<string, unknown>;
    return {
        email: string.email(obj.email),
        password: string.minLength(obj.password, 6, 'password'),
    };
}

export async function POST(request: Request) {
    try {
        // Validate request body
        const validation = await parseBody(request, validateLoginRequest);

        if (!validation.success) {
            return apiResponse.validationError(validation.errors!);
        }

        const { email, password } = validation.data!;

        // Check if Cognito is configured
        const cognitoConfigured =
            process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID &&
            process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID;

        if (cognitoConfigured) {
            // Production: Use Cognito authentication
            const result = await signIn({ email, password });

            if (!result.success) {
                return apiResponse.error(result.error || 'Authentication failed', 401, 'AUTH_FAILED');
            }

            // Create session user from Cognito response
            // In production, you'd decode the ID token to get user info
            const user: SessionUser = {
                id: `cognito_${Date.now()}`, // Would come from token
                email,
                name: email.split('@')[0],
                organization: 'Default Organization',
                plan: 'free',
                role: 'user',
                isAdmin: false,
                createdAt: new Date(),
            };

            // Set secure cookies
            await setSessionCookies(user, {
                accessToken: result.tokens?.accessToken,
                refreshToken: result.tokens?.refreshToken,
                idToken: result.tokens?.idToken,
            });

            return apiResponse.success({ user, message: 'Login successful' });
        }

        // Development/Demo mode: Accept demo credentials
        // Accept demo123, admin123, or any password >= 6 chars
        if (password === 'demo123' || password === 'admin123' || password.length >= 6) {
            const isAdminUser = email.includes('admin') || email === 'admin@digitalme.ng';
            const user: SessionUser = {
                id: `demo_${Date.now()}`,
                email,
                name: email.split('@')[0],
                organization: 'Demo Organization',
                plan: isAdminUser ? 'enterprise' : 'free',
                role: isAdminUser ? 'admin' : 'user',
                isAdmin: isAdminUser,
                createdAt: new Date(),
            };

            // Set demo session cookies
            await setSessionCookies(user, {});

            return apiResponse.success({
                user,
                message: 'Login successful (Demo Mode)',
                demoMode: true
            });
        }

        return apiResponse.error('Invalid credentials', 401, 'INVALID_CREDENTIALS');

    } catch (error) {
        console.error('Login route error:', error);
        return apiResponse.serverError('Login failed. Please try again.');
    }
}
