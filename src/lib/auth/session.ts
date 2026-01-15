// =================================================================
// SESSION MANAGEMENT - CLIENT UTILITIES
// Client-side session helpers (safe for 'use client' components)
// =================================================================

/**
 * Session user type
 */
export interface SessionUser {
    id: string;
    email: string;
    name: string;
    organization: string;
    organizationId?: string;  // Optional for backward compatibility
    plan: 'free' | 'starter' | 'pro' | 'enterprise';
    role: 'user' | 'admin' | 'superadmin';
    isAdmin: boolean;
    createdAt: Date;
    credits: number; // Usage-based currency
}

/**
 * Session configuration
 */
export const SESSION_CONFIG = {
    cookieName: 'session_token',
    accessTokenCookieName: 'access_token',
    refreshTokenCookieName: 'refresh_token',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
};

/**
 * Client-side session storage
 * Uses localStorage for client-side state management
 * Actual authentication is handled by HttpOnly cookies on the server
 */
export const clientSession = {
    /**
     * Get user data from localStorage (for UI state only)
     */
    getUser(): SessionUser | null {
        if (typeof window === 'undefined') return null;

        try {
            const stored = localStorage.getItem('digitalMEng_user');
            if (!stored) return null;

            const user = JSON.parse(stored);
            // Convert date string back to Date object
            if (user.createdAt) {
                user.createdAt = new Date(user.createdAt);
            }
            return user;
        } catch {
            return null;
        }
    },

    /**
     * Set user data in localStorage (for UI state only)
     */
    setUser(user: SessionUser): void {
        if (typeof window === 'undefined') return;

        try {
            localStorage.setItem('digitalMEng_user', JSON.stringify(user));
        } catch (error) {
            console.error('Failed to save user to localStorage:', error);
        }
    },

    /**
     * Clear user data from localStorage
     */
    clearUser(): void {
        if (typeof window === 'undefined') return;

        try {
            localStorage.removeItem('digitalMEng_user');
        } catch (error) {
            console.error('Failed to clear user from localStorage:', error);
        }
    },

    /**
     * Check if user is stored (for initial UI state)
     */
    hasUser(): boolean {
        return this.getUser() !== null;
    },
};

export type { SessionUser as User };

// NOTE: For API routes and server components, import server functions directly from:
// import { getSession, getServerSession, getCurrentUser } from '@/lib/auth/session.server';
