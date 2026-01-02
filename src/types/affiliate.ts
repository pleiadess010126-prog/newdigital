// Affiliate Program Types

export interface Affiliate {
    id: string;
    userId: string;
    referralCode: string;
    referralLink: string;
    status: 'active' | 'pending' | 'suspended' | 'inactive';
    tier: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';
    createdAt: Date;
    approvedAt?: Date;

    // Commission Settings
    commissionRate: number; // Percentage (e.g., 20 = 20%)
    customCommissionRate?: number; // Override for special affiliates
    cookieDuration: number; // Days the referral cookie lasts

    // Payment Info
    paymentMethod: 'paypal' | 'bank_transfer' | 'crypto' | 'stripe';
    paymentEmail?: string;
    paymentDetails?: {
        bankName?: string;
        accountNumber?: string;
        routingNumber?: string;
        swiftCode?: string;
        cryptoWallet?: string;
        cryptoNetwork?: string;
    };

    // Stats
    stats: AffiliateStats;
}

export interface AffiliateStats {
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

export interface Referral {
    id: string;
    affiliateId: string;
    referredUserId: string;
    referredUserEmail: string;
    referredUserName?: string;
    status: 'pending' | 'active' | 'churned' | 'refunded';
    signupDate: Date;
    firstPurchaseDate?: Date;
    plan?: 'free' | 'starter' | 'pro' | 'enterprise';
    totalSpent: number;
    commissionEarned: number;
    isRecurring: boolean;
}

export interface AffiliateTransaction {
    id: string;
    affiliateId: string;
    referralId?: string;
    type: 'click' | 'signup' | 'commission' | 'payout' | 'adjustment' | 'bonus';
    amount: number;
    status: 'pending' | 'approved' | 'paid' | 'rejected' | 'cancelled';
    description: string;
    metadata?: {
        referredEmail?: string;
        plan?: string;
        orderId?: string;
        payoutMethod?: string;
        payoutReference?: string;
        adjustmentReason?: string;
    };
    createdAt: Date;
    processedAt?: Date;
}

export interface AffiliatePayout {
    id: string;
    affiliateId: string;
    amount: number;
    status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
    paymentMethod: 'paypal' | 'bank_transfer' | 'crypto' | 'stripe';
    paymentReference?: string;
    transactionIds: string[];
    requestedAt: Date;
    processedAt?: Date;
    notes?: string;
}

export interface AffiliatePromotion {
    id: string;
    name: string;
    description: string;
    type: 'bonus' | 'increased_commission' | 'contest' | 'milestone';
    startDate: Date;
    endDate: Date;
    isActive: boolean;
    requirements?: {
        minReferrals?: number;
        minEarnings?: number;
        specificPlans?: string[];
    };
    reward: {
        type: 'fixed_bonus' | 'percentage_boost' | 'prize';
        value: number;
        description: string;
    };
}

export interface AffiliateAsset {
    id: string;
    name: string;
    type: 'banner' | 'email_template' | 'social_post' | 'landing_page' | 'video';
    category: string;
    thumbnailUrl: string;
    assetUrl: string;
    dimensions?: {
        width: number;
        height: number;
    };
    downloads: number;
    createdAt: Date;
}

export interface AffiliateTier {
    name: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';
    displayName: string;
    minReferrals: number;
    minEarnings: number;
    commissionRate: number;
    benefits: string[];
    color: string;
    icon: string;
}

export interface AffiliateLog {
    id: string;
    affiliateId: string;
    action:
    | 'click'
    | 'signup'
    | 'conversion'
    | 'commission_earned'
    | 'payout_requested'
    | 'payout_completed'
    | 'tier_upgrade'
    | 'tier_downgrade'
    | 'status_change'
    | 'settings_updated'
    | 'asset_downloaded'
    | 'link_copied'
    | 'promotion_qualified';
    details: string;
    metadata?: Record<string, unknown>;
    ipAddress?: string;
    userAgent?: string;
    createdAt: Date;
}
