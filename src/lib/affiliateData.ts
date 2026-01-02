// Affiliate Program Mock Data
import type {
    Affiliate,
    Referral,
    AffiliateTransaction,
    AffiliatePayout,
    AffiliatePromotion,
    AffiliateAsset,
    AffiliateTier,
    AffiliateLog
} from '@/types/affiliate';

export const affiliateTiers: AffiliateTier[] = [
    {
        name: 'bronze',
        displayName: 'Bronze Partner',
        minReferrals: 0,
        minEarnings: 0,
        commissionRate: 10,
        benefits: ['10% commission on all referrals', 'Basic marketing materials', 'Monthly payouts'],
        color: '#CD7F32',
        icon: '🥉'
    },
    {
        name: 'silver',
        displayName: 'Silver Partner',
        minReferrals: 10,
        minEarnings: 500,
        commissionRate: 12,
        benefits: ['12% commission on all referrals', 'Premium marketing materials', 'Bi-weekly payouts', 'Dedicated support'],
        color: '#C0C0C0',
        icon: '🥈'
    },
    {
        name: 'gold',
        displayName: 'Gold Partner',
        minReferrals: 25,
        minEarnings: 2000,
        commissionRate: 15,
        benefits: ['15% commission on all referrals', 'Exclusive marketing materials', 'Weekly payouts', 'Priority support', 'Early access to features'],
        color: '#FFD700',
        icon: '🥇'
    },
    {
        name: 'platinum',
        displayName: 'Platinum Partner',
        minReferrals: 50,
        minEarnings: 5000,
        commissionRate: 18,
        benefits: ['18% commission on all referrals', 'Custom landing pages', 'On-demand payouts', 'VIP support', 'Co-marketing opportunities'],
        color: '#E5E4E2',
        icon: '💎'
    },
    {
        name: 'diamond',
        displayName: 'Diamond Partner',
        minReferrals: 100,
        minEarnings: 15000,
        commissionRate: 20,
        benefits: ['20% commission on all referrals', 'White-label solutions', 'Instant payouts', 'Dedicated account manager', 'Revenue share options', 'Annual bonus'],
        color: '#B9F2FF',
        icon: '👑'
    }
];

export const mockCurrentAffiliate: Affiliate = {
    id: 'aff_001',
    userId: 'user_001',
    referralCode: 'DIGITALMENG2025',
    referralLink: 'https://digitalmeng.com/?ref=DIGITALMENG2025',
    status: 'active',
    tier: 'gold',
    createdAt: new Date('2024-06-15'),
    approvedAt: new Date('2024-06-16'),
    commissionRate: 15,
    cookieDuration: 90,
    paymentMethod: 'paypal',
    paymentEmail: 'affiliate@example.com',
    stats: {
        totalClicks: 4892,
        uniqueClicks: 3241,
        totalSignups: 127,
        paidConversions: 48,
        conversionRate: 3.9,
        totalEarnings: 7840.50,
        pendingEarnings: 1240.00,
        paidEarnings: 6600.50,
        lifetimeValue: 163.34,
        averageOrderValue: 79.99,
        last30DaysClicks: 892,
        last30DaysSignups: 24,
        last30DaysEarnings: 1680.00
    }
};

export const mockReferrals: Referral[] = [
    {
        id: 'ref_001',
        affiliateId: 'aff_001',
        referredUserId: 'user_r001',
        referredUserEmail: 'john.d***@gmail.com',
        referredUserName: 'John D.',
        status: 'active',
        signupDate: new Date('2024-12-28'),
        firstPurchaseDate: new Date('2024-12-28'),
        plan: 'pro',
        totalSpent: 79.99,
        commissionEarned: 24.00,
        isRecurring: true
    },
    {
        id: 'ref_002',
        affiliateId: 'aff_001',
        referredUserId: 'user_r002',
        referredUserEmail: 'sarah.m***@outlook.com',
        referredUserName: 'Sarah M.',
        status: 'active',
        signupDate: new Date('2024-12-26'),
        firstPurchaseDate: new Date('2024-12-27'),
        plan: 'enterprise',
        totalSpent: 299.99,
        commissionEarned: 90.00,
        isRecurring: true
    },
    {
        id: 'ref_003',
        affiliateId: 'aff_001',
        referredUserId: 'user_r003',
        referredUserEmail: 'mike.j***@company.io',
        referredUserName: 'Mike J.',
        status: 'pending',
        signupDate: new Date('2024-12-30'),
        plan: 'free',
        totalSpent: 0,
        commissionEarned: 0,
        isRecurring: false
    },
    {
        id: 'ref_004',
        affiliateId: 'aff_001',
        referredUserId: 'user_r004',
        referredUserEmail: 'emily.c***@startup.co',
        referredUserName: 'Emily C.',
        status: 'active',
        signupDate: new Date('2024-12-22'),
        firstPurchaseDate: new Date('2024-12-23'),
        plan: 'starter',
        totalSpent: 29.99,
        commissionEarned: 9.00,
        isRecurring: true
    },
    {
        id: 'ref_005',
        affiliateId: 'aff_001',
        referredUserId: 'user_r005',
        referredUserEmail: 'alex.w***@agency.com',
        referredUserName: 'Alex W.',
        status: 'churned',
        signupDate: new Date('2024-11-15'),
        firstPurchaseDate: new Date('2024-11-16'),
        plan: 'pro',
        totalSpent: 159.98,
        commissionEarned: 48.00,
        isRecurring: false
    }
];

export const mockAffiliateTransactions: AffiliateTransaction[] = [
    {
        id: 'txn_001',
        affiliateId: 'aff_001',
        referralId: 'ref_002',
        type: 'commission',
        amount: 90.00,
        status: 'approved',
        description: 'Commission for Enterprise plan signup - Sarah M.',
        metadata: { referredEmail: 'sarah.m***@outlook.com', plan: 'enterprise' },
        createdAt: new Date('2024-12-27T14:30:00'),
        processedAt: new Date('2024-12-27T14:35:00')
    },
    {
        id: 'txn_002',
        affiliateId: 'aff_001',
        referralId: 'ref_001',
        type: 'commission',
        amount: 24.00,
        status: 'approved',
        description: 'Commission for Pro plan signup - John D.',
        metadata: { referredEmail: 'john.d***@gmail.com', plan: 'pro' },
        createdAt: new Date('2024-12-28T10:15:00'),
        processedAt: new Date('2024-12-28T10:20:00')
    },
    {
        id: 'txn_003',
        affiliateId: 'aff_001',
        type: 'payout',
        amount: -500.00,
        status: 'paid',
        description: 'Payout via PayPal',
        metadata: { payoutMethod: 'paypal', payoutReference: 'PP-12345678' },
        createdAt: new Date('2024-12-20T09:00:00'),
        processedAt: new Date('2024-12-20T15:30:00')
    },
    {
        id: 'txn_004',
        affiliateId: 'aff_001',
        type: 'bonus',
        amount: 100.00,
        status: 'approved',
        description: 'Holiday Promotion Bonus - 5+ signups in December',
        createdAt: new Date('2024-12-25T00:00:00'),
        processedAt: new Date('2024-12-25T00:00:00')
    },
    {
        id: 'txn_005',
        affiliateId: 'aff_001',
        referralId: 'ref_004',
        type: 'commission',
        amount: 9.00,
        status: 'pending',
        description: 'Commission for Starter plan signup - Emily C.',
        metadata: { referredEmail: 'emily.c***@startup.co', plan: 'starter' },
        createdAt: new Date('2024-12-23T16:45:00')
    },
    {
        id: 'txn_006',
        affiliateId: 'aff_001',
        type: 'click',
        amount: 0,
        status: 'approved',
        description: '45 clicks recorded from referral link',
        createdAt: new Date('2024-12-30T11:00:00'),
        processedAt: new Date('2024-12-30T11:00:00')
    },
    {
        id: 'txn_007',
        affiliateId: 'aff_001',
        type: 'signup',
        amount: 0,
        status: 'approved',
        description: 'New signup from referral - Mike J.',
        metadata: { referredEmail: 'mike.j***@company.io' },
        createdAt: new Date('2024-12-30T14:22:00'),
        processedAt: new Date('2024-12-30T14:22:00')
    }
];

export const mockAffiliatePayouts: AffiliatePayout[] = [
    {
        id: 'pay_001',
        affiliateId: 'aff_001',
        amount: 500.00,
        status: 'completed',
        paymentMethod: 'paypal',
        paymentReference: 'PP-12345678',
        transactionIds: ['txn_old_001', 'txn_old_002', 'txn_old_003'],
        requestedAt: new Date('2024-12-19T10:00:00'),
        processedAt: new Date('2024-12-20T15:30:00')
    },
    {
        id: 'pay_002',
        affiliateId: 'aff_001',
        amount: 750.00,
        status: 'completed',
        paymentMethod: 'paypal',
        paymentReference: 'PP-87654321',
        transactionIds: ['txn_old_004', 'txn_old_005'],
        requestedAt: new Date('2024-11-25T09:00:00'),
        processedAt: new Date('2024-11-26T14:00:00')
    },
    {
        id: 'pay_003',
        affiliateId: 'aff_001',
        amount: 1240.00,
        status: 'pending',
        paymentMethod: 'paypal',
        transactionIds: ['txn_001', 'txn_002', 'txn_004', 'txn_005'],
        requestedAt: new Date('2025-01-02T08:00:00')
    }
];

export const mockAffiliatePromotions: AffiliatePromotion[] = [
    {
        id: 'promo_001',
        name: 'New Year Rush',
        description: 'Earn 50% extra commission on all Enterprise signups in January!',
        type: 'increased_commission',
        startDate: new Date('2025-01-01'),
        endDate: new Date('2025-01-31'),
        isActive: true,
        requirements: { specificPlans: ['enterprise'] },
        reward: { type: 'percentage_boost', value: 50, description: '50% bonus commission' }
    },
    {
        id: 'promo_002',
        name: 'Milestone Bonus',
        description: 'Reach 50 paid referrals and earn a $500 bonus!',
        type: 'milestone',
        startDate: new Date('2024-01-01'),
        endDate: new Date('2025-12-31'),
        isActive: true,
        requirements: { minReferrals: 50 },
        reward: { type: 'fixed_bonus', value: 500, description: '$500 milestone bonus' }
    },
    {
        id: 'promo_003',
        name: 'Top Affiliate Contest',
        description: 'Top 3 affiliates this quarter win exclusive prizes!',
        type: 'contest',
        startDate: new Date('2025-01-01'),
        endDate: new Date('2025-03-31'),
        isActive: true,
        reward: { type: 'prize', value: 0, description: '1st: $2000, 2nd: $1000, 3rd: $500' }
    }
];

export const mockAffiliateAssets: AffiliateAsset[] = [
    {
        id: 'asset_001',
        name: 'Hero Banner - Dark',
        type: 'banner',
        category: 'Web Banners',
        thumbnailUrl: '/assets/affiliate/banner-dark-thumb.jpg',
        assetUrl: '/assets/affiliate/banner-dark-1200x628.png',
        dimensions: { width: 1200, height: 628 },
        downloads: 234,
        createdAt: new Date('2024-10-01')
    },
    {
        id: 'asset_002',
        name: 'Hero Banner - Light',
        type: 'banner',
        category: 'Web Banners',
        thumbnailUrl: '/assets/affiliate/banner-light-thumb.jpg',
        assetUrl: '/assets/affiliate/banner-light-1200x628.png',
        dimensions: { width: 1200, height: 628 },
        downloads: 189,
        createdAt: new Date('2024-10-01')
    },
    {
        id: 'asset_003',
        name: 'Email Template - Welcome',
        type: 'email_template',
        category: 'Email Templates',
        thumbnailUrl: '/assets/affiliate/email-welcome-thumb.jpg',
        assetUrl: '/assets/affiliate/email-welcome.html',
        downloads: 156,
        createdAt: new Date('2024-10-15')
    },
    {
        id: 'asset_004',
        name: 'Instagram Story Template',
        type: 'social_post',
        category: 'Social Media',
        thumbnailUrl: '/assets/affiliate/ig-story-thumb.jpg',
        assetUrl: '/assets/affiliate/ig-story-1080x1920.png',
        dimensions: { width: 1080, height: 1920 },
        downloads: 312,
        createdAt: new Date('2024-11-01')
    },
    {
        id: 'asset_005',
        name: 'Product Demo Video',
        type: 'video',
        category: 'Videos',
        thumbnailUrl: '/assets/affiliate/demo-video-thumb.jpg',
        assetUrl: '/assets/affiliate/demo-video.mp4',
        downloads: 89,
        createdAt: new Date('2024-11-15')
    }
];

export const mockAffiliateLogs: AffiliateLog[] = [
    {
        id: 'log_001',
        affiliateId: 'aff_001',
        action: 'click',
        details: '15 new clicks from referral link',
        metadata: { source: 'twitter', country: 'US' },
        createdAt: new Date('2025-01-02T10:30:00')
    },
    {
        id: 'log_002',
        affiliateId: 'aff_001',
        action: 'signup',
        details: 'New user signed up: mike.j***@company.io',
        metadata: { email: 'mike.j***@company.io', source: 'direct' },
        createdAt: new Date('2024-12-30T14:22:00')
    },
    {
        id: 'log_003',
        affiliateId: 'aff_001',
        action: 'conversion',
        details: 'Referral converted to Pro plan: john.d***@gmail.com',
        metadata: { email: 'john.d***@gmail.com', plan: 'pro', amount: 79.99 },
        createdAt: new Date('2024-12-28T10:15:00')
    },
    {
        id: 'log_004',
        affiliateId: 'aff_001',
        action: 'commission_earned',
        details: 'Commission earned: $24.00 for Pro plan signup',
        metadata: { amount: 24.00, referralId: 'ref_001' },
        createdAt: new Date('2024-12-28T10:15:00')
    },
    {
        id: 'log_005',
        affiliateId: 'aff_001',
        action: 'conversion',
        details: 'Referral converted to Enterprise plan: sarah.m***@outlook.com',
        metadata: { email: 'sarah.m***@outlook.com', plan: 'enterprise', amount: 299.99 },
        createdAt: new Date('2024-12-27T14:30:00')
    },
    {
        id: 'log_006',
        affiliateId: 'aff_001',
        action: 'commission_earned',
        details: 'Commission earned: $90.00 for Enterprise plan signup',
        metadata: { amount: 90.00, referralId: 'ref_002' },
        createdAt: new Date('2024-12-27T14:30:00')
    },
    {
        id: 'log_007',
        affiliateId: 'aff_001',
        action: 'promotion_qualified',
        details: 'Qualified for Holiday Promotion Bonus - earned $100',
        metadata: { promotionId: 'promo_holiday', bonus: 100 },
        createdAt: new Date('2024-12-25T00:00:00')
    },
    {
        id: 'log_008',
        affiliateId: 'aff_001',
        action: 'payout_completed',
        details: 'Payout of $500.00 completed via PayPal',
        metadata: { amount: 500, method: 'paypal', reference: 'PP-12345678' },
        createdAt: new Date('2024-12-20T15:30:00')
    },
    {
        id: 'log_009',
        affiliateId: 'aff_001',
        action: 'tier_upgrade',
        details: 'Upgraded to Gold Partner tier',
        metadata: { previousTier: 'silver', newTier: 'gold' },
        createdAt: new Date('2024-10-15T09:00:00')
    },
    {
        id: 'log_010',
        affiliateId: 'aff_001',
        action: 'link_copied',
        details: 'Referral link copied to clipboard',
        createdAt: new Date('2025-01-02T09:45:00')
    },
    {
        id: 'log_011',
        affiliateId: 'aff_001',
        action: 'asset_downloaded',
        details: 'Downloaded: Instagram Story Template',
        metadata: { assetId: 'asset_004', assetName: 'Instagram Story Template' },
        createdAt: new Date('2024-12-29T11:20:00')
    },
    {
        id: 'log_012',
        affiliateId: 'aff_001',
        action: 'payout_requested',
        details: 'Payout request submitted for $1,240.00',
        metadata: { amount: 1240, method: 'paypal' },
        createdAt: new Date('2025-01-02T08:00:00')
    }
];

// Helper function to get tier info
export const getTierInfo = (tierName: string): AffiliateTier | undefined => {
    return affiliateTiers.find(t => t.name === tierName);
};

// Helper function to calculate next tier progress
export const getNextTierProgress = (currentTier: string, stats: Affiliate['stats']): {
    nextTier: AffiliateTier | null;
    referralProgress: number;
    earningsProgress: number;
} => {
    const tierOrder = ['bronze', 'silver', 'gold', 'platinum', 'diamond'];
    const currentIndex = tierOrder.indexOf(currentTier);

    if (currentIndex === tierOrder.length - 1) {
        return { nextTier: null, referralProgress: 100, earningsProgress: 100 };
    }

    const nextTier = affiliateTiers.find(t => t.name === tierOrder[currentIndex + 1])!;
    const currentTierInfo = affiliateTiers.find(t => t.name === currentTier)!;

    const referralProgress = Math.min(100, (stats.paidConversions / nextTier.minReferrals) * 100);
    const earningsProgress = Math.min(100, (stats.totalEarnings / nextTier.minEarnings) * 100);

    return { nextTier, referralProgress, earningsProgress };
};
