// =================================================================
// SESSION MANAGEMENT - SERVER UTILITIES
// Server-side session helpers (for API routes & Server Components only)
// =================================================================

import { cookies } from 'next/headers';
import { SESSION_CONFIG, type SessionUser } from './session';

/**
 * Session data structure
 */
export interface Session {
    user: SessionUser;
    iat: number;
    exp: number;
}

/**
 * Create a simple session token (base64 encoded JSON)
 * In production, use JWT with proper signing
 */
export function createSessionToken(user: SessionUser): string {
    const session: Session = {
        user,
        iat: Date.now(),
        exp: Date.now() + SESSION_CONFIG.maxAge * 1000,
    };

    // Simple base64 encoding (use JWT in production)
    return Buffer.from(JSON.stringify(session)).toString('base64');
}

/**
 * Parse session token
 */
export function parseSessionToken(token: string): Session | null {
    try {
        const decoded = Buffer.from(token, 'base64').toString('utf-8');
        const session = JSON.parse(decoded) as Session;

        // Check expiration
        if (session.exp && session.exp < Date.now()) {
            return null;
        }

        return session;
    } catch {
        return null;
    }
}

/**
 * Set session cookies (server-side)
 */
export async function setSessionCookies(
    user: SessionUser,
    tokens?: {
        accessToken?: string;
        refreshToken?: string;
        idToken?: string;
    }
): Promise<void> {
    const cookieStore = await cookies();

    // Set session token
    const sessionToken = createSessionToken(user);
    cookieStore.set(SESSION_CONFIG.cookieName, sessionToken, {
        httpOnly: SESSION_CONFIG.httpOnly,
        secure: SESSION_CONFIG.secure,
        sameSite: SESSION_CONFIG.sameSite,
        maxAge: SESSION_CONFIG.maxAge,
        path: SESSION_CONFIG.path,
    });

    // Set access token if provided
    if (tokens?.accessToken) {
        cookieStore.set(SESSION_CONFIG.accessTokenCookieName, tokens.accessToken, {
            httpOnly: true,
            secure: SESSION_CONFIG.secure,
            sameSite: SESSION_CONFIG.sameSite,
            maxAge: 60 * 60, // 1 hour for access token
            path: SESSION_CONFIG.path,
        });
    }

    // Set refresh token if provided
    if (tokens?.refreshToken) {
        cookieStore.set(SESSION_CONFIG.refreshTokenCookieName, tokens.refreshToken, {
            httpOnly: true,
            secure: SESSION_CONFIG.secure,
            sameSite: SESSION_CONFIG.sameSite,
            maxAge: 60 * 60 * 24 * 30, // 30 days for refresh token
            path: SESSION_CONFIG.path,
        });
    }
}

/**
 * Get current session from cookies (server-side)
 */
export async function getSession(): Promise<Session | null> {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get(SESSION_CONFIG.cookieName)?.value;

    if (!sessionToken) {
        return null;
    }

    return parseSessionToken(sessionToken);
}

/**
 * Get current user from session
 */
export async function getCurrentUser(): Promise<SessionUser | null> {
    const session = await getSession();
    return session?.user || null;
}

/**
 * Check if user is authenticated
 */
export async function isAuthenticated(): Promise<boolean> {
    const session = await getSession();
    return session !== null;
}

/**
 * Check if user is admin
 */
export async function isAdmin(): Promise<boolean> {
    const user = await getCurrentUser();
    return user?.isAdmin === true || user?.role === 'admin' || user?.role === 'superadmin';
}

/**
 * Clear session cookies (server-side)
 */
export async function clearSessionCookies(): Promise<void> {
    const cookieStore = await cookies();

    cookieStore.delete(SESSION_CONFIG.cookieName);
    cookieStore.delete(SESSION_CONFIG.accessTokenCookieName);
    cookieStore.delete(SESSION_CONFIG.refreshTokenCookieName);
}

/**
 * Require authentication (throws if not authenticated)
 */
export async function requireAuth(): Promise<SessionUser> {
    const user = await getCurrentUser();

    if (!user) {
        throw new Error('Authentication required');
    }

    return user;
}

/**
 * Require admin role (throws if not admin)
 */
export async function requireAdmin(): Promise<SessionUser> {
    const user = await requireAuth();

    if (!user.isAdmin && user.role !== 'admin' && user.role !== 'superadmin') {
        throw new Error('Admin access required');
    }

    return user;
}

/**
 * Alias for getSession - backwards compatibility
 */
export const getServerSession = getSession;
