// =================================================================
// AFFILIATE CONTEXT
// Manages affiliate state and connects user accounts with affiliate data
// =================================================================

'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useAuth } from '@/lib/auth/AuthContext';

// Types
interface AffiliateStats {
    totalClicks: number;
    uniqueClicks: number;
    totalSignups: number;
    paidConversions: number;
    conversionRate: number;
    totalEarnings: number;
    pendingEarnings: number;
    paidEarnings: number;
    lifetimeValue: number;
    averageOrderValue: number;
    last30DaysClicks: number;
    last30DaysSignups: number;
    last30DaysEarnings: number;
}

interface Affiliate {
    id: string;
    userId: string;
    referralCode: string;
    referralLink: string;
    status: 'active' | 'pending' | 'suspended' | 'inactive';
    tier: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';
    createdAt: Date;
    approvedAt?: Date;
    commissionRate: number;
    cookieDuration: number;
    paymentMethod: 'paypal' | 'bank_transfer' | 'crypto' | 'stripe';
    paymentEmail?: string;
    stats: AffiliateStats;
}

interface Referral {
    id: string;
    affiliateId: string;
    referredUserId: string;
    referredUserEmail: string;
    referredUserName?: string;
    status: 'pending' | 'active' | 'churned' | 'refunded';
    signupDate: Date;
    firstPurchaseDate?: Date;
    plan?: string;
    totalSpent: number;
    commissionEarned: number;
    isRecurring: boolean;
}

interface Transaction {
    id: string;
    affiliateId: string;
    referralId?: string;
    type: 'click' | 'signup' | 'commission' | 'payout' | 'adjustment' | 'bonus';
    amount: number;
    status: 'pending' | 'approved' | 'paid' | 'rejected' | 'cancelled';
    description: string;
    createdAt: Date;
}

interface Payout {
    id: string;
    affiliateId: string;
    amount: number;
    status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
    paymentMethod: string;
    paymentReference?: string;
    requestedAt: Date;
    processedAt?: Date;
}

interface AffiliateContextType {
    // State
    affiliate: Affiliate | null;
    referrals: Referral[];
    transactions: Transaction[];
    payouts: Payout[];
    isLoading: boolean;
    error: string | null;
    isAffiliate: boolean;

    // Actions
    fetchAffiliateData: () => Promise<void>;
    createAffiliateAccount: (data: CreateAffiliateData) => Promise<boolean>;
    updateAffiliateSettings: (data: UpdateAffiliateData) => Promise<boolean>;
    requestPayout: (amount: number) => Promise<boolean>;
    copyReferralLink: () => Promise<boolean>;
    copyReferralCode: () => Promise<boolean>;
}

interface CreateAffiliateData {
    paymentMethod: string;
    paymentEmail?: string;
    paymentDetails?: Record<string, string>;
}

interface UpdateAffiliateData {
    paymentMethod?: string;
    paymentEmail?: string;
    paymentDetails?: Record<string, string>;
}

const AffiliateContext = createContext<AffiliateContextType | undefined>(undefined);

interface AffiliateProviderProps {
    children: ReactNode;
}

export function AffiliateProvider({ children }: AffiliateProviderProps) {
    const { user, isAuthenticated } = useAuth();
    const [affiliate, setAffiliate] = useState<Affiliate | null>(null);
    const [referrals, setReferrals] = useState<Referral[]>([]);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [payouts, setPayouts] = useState<Payout[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const isAffiliate = !!affiliate && affiliate.status === 'active';

    // Fetch affiliate data
    const fetchAffiliateData = useCallback(async () => {
        if (!isAuthenticated || !user?.id) {
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch('/api/affiliate');
            const result = await response.json();

            if (result.success && result.data) {
                if (result.data.affiliate) {
                    setAffiliate(result.data.affiliate);
                    setReferrals(result.data.referrals || []);
                    setTransactions(result.data.transactions || []);
                    setPayouts(result.data.payouts || []);
                }
            }
        } catch (err) {
            console.error('Failed to fetch affiliate data:', err);
            setError('Failed to load affiliate data');
        } finally {
            setIsLoading(false);
        }
    }, [isAuthenticated, user?.id]);

    // Create affiliate account
    const createAffiliateAccount = useCallback(async (data: CreateAffiliateData): Promise<boolean> => {
        if (!user?.id) {
            setError('You must be logged in to create an affiliate account');
            return false;
        }

        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch('/api/affiliate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: user.id,
                    ...data
                })
            });

            const result = await response.json();

            if (result.success) {
                setAffiliate(result.data);
                return true;
            } else {
                setError(result.error || 'Failed to create affiliate account');
                return false;
            }
        } catch (err) {
            console.error('Failed to create affiliate:', err);
            setError('Failed to create affiliate account');
            return false;
        } finally {
            setIsLoading(false);
        }
    }, [user?.id]);

    // Update affiliate settings
    const updateAffiliateSettings = useCallback(async (data: UpdateAffiliateData): Promise<boolean> => {
        if (!affiliate?.id) {
            setError('No affiliate account found');
            return false;
        }

        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch('/api/affiliate', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    affiliateId: affiliate.id,
                    ...data
                })
            });

            const result = await response.json();

            if (result.success) {
                setAffiliate(result.data);
                return true;
            } else {
                setError(result.error || 'Failed to update settings');
                return false;
            }
        } catch (err) {
            console.error('Failed to update affiliate:', err);
            setError('Failed to update settings');
            return false;
        } finally {
            setIsLoading(false);
        }
    }, [affiliate?.id]);

    // Request payout
    const requestPayout = useCallback(async (amount: number): Promise<boolean> => {
        if (!affiliate?.id) {
            setError('No affiliate account found');
            return false;
        }

        if (amount < 50) {
            setError('Minimum payout amount is $50');
            return false;
        }

        if (amount > (affiliate.stats?.pendingEarnings || 0)) {
            setError('Insufficient pending balance');
            return false;
        }

        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch('/api/affiliate/payout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    affiliateId: affiliate.id,
                    amount,
                    paymentMethod: affiliate.paymentMethod,
                    paymentEmail: affiliate.paymentEmail
                })
            });

            const result = await response.json();

            if (result.success) {
                // Refresh data to get updated payouts
                await fetchAffiliateData();
                return true;
            } else {
                setError(result.error || 'Failed to request payout');
                return false;
            }
        } catch (err) {
            console.error('Failed to request payout:', err);
            setError('Failed to request payout');
            return false;
        } finally {
            setIsLoading(false);
        }
    }, [affiliate, fetchAffiliateData]);

    // Copy referral link
    const copyReferralLink = useCallback(async (): Promise<boolean> => {
        if (!affiliate?.referralLink) {
            return false;
        }

        try {
            await navigator.clipboard.writeText(affiliate.referralLink);
            return true;
        } catch {
            return false;
        }
    }, [affiliate?.referralLink]);

    // Copy referral code
    const copyReferralCode = useCallback(async (): Promise<boolean> => {
        if (!affiliate?.referralCode) {
            return false;
        }

        try {
            await navigator.clipboard.writeText(affiliate.referralCode);
            return true;
        } catch {
            return false;
        }
    }, [affiliate?.referralCode]);

    // Fetch data when user logs in
    useEffect(() => {
        if (isAuthenticated && user?.id) {
            fetchAffiliateData();
        } else {
            // Clear data on logout
            setAffiliate(null);
            setReferrals([]);
            setTransactions([]);
            setPayouts([]);
        }
    }, [isAuthenticated, user?.id, fetchAffiliateData]);

    const value: AffiliateContextType = {
        affiliate,
        referrals,
        transactions,
        payouts,
        isLoading,
        error,
        isAffiliate,
        fetchAffiliateData,
        createAffiliateAccount,
        updateAffiliateSettings,
        requestPayout,
        copyReferralLink,
        copyReferralCode
    };

    return (
        <AffiliateContext.Provider value={value}>
            {children}
        </AffiliateContext.Provider>
    );
}

// Custom hook to use affiliate context
export function useAffiliate() {
    const context = useContext(AffiliateContext);
    if (context === undefined) {
        throw new Error('useAffiliate must be used within an AffiliateProvider');
    }
    return context;
}

// Hook for checking referral on page load
export function useReferralTracking() {
    useEffect(() => {
        // Check for referral code in URL
        if (typeof window !== 'undefined') {
            const urlParams = new URLSearchParams(window.location.search);
            const refCode = urlParams.get('ref');

            if (refCode) {
                // Track the click
                fetch('/api/affiliate/track', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        referralCode: refCode,
                        landingPage: window.location.pathname
                    })
                }).catch(console.error);

                // Store in localStorage as backup
                localStorage.setItem('affiliate_ref', refCode);
                localStorage.setItem('affiliate_ref_time', Date.now().toString());
            }
        }
    }, []);
}
