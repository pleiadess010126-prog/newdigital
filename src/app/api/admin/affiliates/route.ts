// =================================================================
// ADMIN AFFILIATE API ROUTE
// Admin operations for managing affiliates
// =================================================================

import { NextRequest, NextResponse } from 'next/server';

// In-memory stores (these would be database in production)
const affiliateStore = new Map<string, AffiliateData>();
const payoutStore = new Map<string, PayoutData>();

interface AffiliateData {
    id: string;
    userId: string;
    userName?: string;
    userEmail?: string;
    referralCode: string;
    referralLink: string;
    status: 'active' | 'pending' | 'suspended' | 'inactive';
    tier: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';
    createdAt: Date;
    approvedAt?: Date;
    commissionRate: number;
    cookieDuration: number;
    paymentMethod: string;
    paymentEmail?: string;
    stats: {
        totalClicks: number;
        totalSignups: number;
        paidConversions: number;
        totalEarnings: number;
        pendingEarnings: number;
        paidEarnings: number;
    };
}

interface PayoutData {
    id: string;
    affiliateId: string;
    affiliateName?: string;
    amount: number;
    status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
    paymentMethod: string;
    paymentReference?: string;
    requestedAt: Date;
    processedAt?: Date;
    adminNotes?: string;
}

// =================================================================
// TIER CONFIGURATION - Automatic Tier Upgrade Rules
// =================================================================
type TierName = 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';

interface TierConfig {
    name: TierName;
    displayName: string;
    minReferrals: number;
    minEarnings: number;
    commissionRate: number;
    bonusOnUpgrade: number;
    cookieDuration: number;
}

const TIER_CONFIG: TierConfig[] = [
    { name: 'bronze', displayName: 'Bronze Partner', minReferrals: 0, minEarnings: 0, commissionRate: 10, bonusOnUpgrade: 0, cookieDuration: 30 },
    { name: 'silver', displayName: 'Silver Partner', minReferrals: 10, minEarnings: 500, commissionRate: 12, bonusOnUpgrade: 25, cookieDuration: 45 },
    { name: 'gold', displayName: 'Gold Partner', minReferrals: 25, minEarnings: 2000, commissionRate: 15, bonusOnUpgrade: 50, cookieDuration: 60 },
    { name: 'platinum', displayName: 'Platinum Partner', minReferrals: 50, minEarnings: 5000, commissionRate: 18, bonusOnUpgrade: 100, cookieDuration: 90 },
    { name: 'diamond', displayName: 'Diamond Partner', minReferrals: 100, minEarnings: 15000, commissionRate: 20, bonusOnUpgrade: 250, cookieDuration: 120 },
];

// =================================================================
// AUTOMATIC PAYOUT CONFIGURATION
// =================================================================
interface PayoutSettings {
    minimumPayout: number;              // Minimum amount to request payout
    autoPayoutEnabled: boolean;         // Enable automatic payouts
    autoPayoutThreshold: number;        // Auto-request payout when earnings reach this
    scheduledPayoutDays: number[];      // Days of month to process (1-31)
    instantPayoutTiers: TierName[];     // Tiers that get instant processing
    autoApprovalTiers: TierName[];      // Tiers that don't need admin approval
    processedWithinHours: number;       // Time to process after approval
    paymentMethods: string[];           // Supported payment methods
}

const PAYOUT_SETTINGS: PayoutSettings = {
    minimumPayout: 50,
    autoPayoutEnabled: true,
    autoPayoutThreshold: 100,           // Auto-request payout at $100
    scheduledPayoutDays: [1, 15],       // Process on 1st and 15th
    instantPayoutTiers: ['diamond', 'platinum'],
    autoApprovalTiers: ['gold', 'platinum', 'diamond'],
    processedWithinHours: 48,
    paymentMethods: ['paypal', 'stripe', 'bank_transfer', 'wise']
};

// Store for auto-payout logs
const autoPayoutLogs: Array<{
    affiliateId: string;
    affiliateName: string;
    amount: number;
    type: 'threshold' | 'scheduled' | 'instant';
    status: 'created' | 'auto-approved' | 'processed';
    timestamp: Date;
}> = [];

// Store for tier upgrade notifications
const tierUpgradeNotifications: Array<{
    affiliateId: string;
    affiliateName: string;
    fromTier: TierName;
    toTier: TierName;
    bonus: number;
    timestamp: Date;
}> = [];

// =================================================================
// AUTOMATIC TIER CALCULATION LOGIC
// =================================================================

/**
 * Calculate the tier an affiliate qualifies for based on their performance
 * Must meet BOTH referral AND earnings requirements
 */
function calculateTierFromPerformance(paidConversions: number, totalEarnings: number): TierName {
    let qualifiedTier: TierName = 'bronze';

    for (const tier of TIER_CONFIG) {
        if (paidConversions >= tier.minReferrals && totalEarnings >= tier.minEarnings) {
            qualifiedTier = tier.name;
        }
    }

    return qualifiedTier;
}

/**
 * Get tier configuration by name
 */
function getTierConfig(tierName: TierName): TierConfig {
    return TIER_CONFIG.find(t => t.name === tierName) || TIER_CONFIG[0];
}

/**
 * Check and apply automatic tier upgrade for an affiliate
 * Returns the upgrade details if an upgrade occurred
 */
function checkAndApplyTierUpgrade(affiliate: AffiliateData): { upgraded: boolean; fromTier?: TierName; toTier?: TierName; bonus?: number } {
    // Only active affiliates can be upgraded
    if (affiliate.status !== 'active') {
        return { upgraded: false };
    }

    const currentTier = affiliate.tier;
    const qualifiedTier = calculateTierFromPerformance(
        affiliate.stats.paidConversions,
        affiliate.stats.totalEarnings
    );

    const currentTierIndex = TIER_CONFIG.findIndex(t => t.name === currentTier);
    const qualifiedTierIndex = TIER_CONFIG.findIndex(t => t.name === qualifiedTier);

    // Only upgrade, never downgrade automatically
    if (qualifiedTierIndex > currentTierIndex) {
        const newTierConfig = getTierConfig(qualifiedTier);

        // Apply upgrade
        affiliate.tier = qualifiedTier;
        affiliate.commissionRate = newTierConfig.commissionRate;
        affiliate.cookieDuration = newTierConfig.cookieDuration;

        // Apply bonus to pending earnings
        if (newTierConfig.bonusOnUpgrade > 0) {
            affiliate.stats.pendingEarnings += newTierConfig.bonusOnUpgrade;
            affiliate.stats.totalEarnings += newTierConfig.bonusOnUpgrade;
        }

        // Record notification
        tierUpgradeNotifications.push({
            affiliateId: affiliate.id,
            affiliateName: affiliate.userName || 'Unknown',
            fromTier: currentTier,
            toTier: qualifiedTier,
            bonus: newTierConfig.bonusOnUpgrade,
            timestamp: new Date()
        });

        return {
            upgraded: true,
            fromTier: currentTier,
            toTier: qualifiedTier,
            bonus: newTierConfig.bonusOnUpgrade
        };
    }

    return { upgraded: false };
}

/**
 * Calculate progress towards next tier
 */
function calculateNextTierProgress(affiliate: AffiliateData): {
    nextTier: TierName | null;
    referralsNeeded: number;
    earningsNeeded: number;
    referralProgress: number;
    earningsProgress: number;
} | null {
    const currentTierIndex = TIER_CONFIG.findIndex(t => t.name === affiliate.tier);

    if (currentTierIndex >= TIER_CONFIG.length - 1) {
        return null; // Already at max tier
    }

    const nextTier = TIER_CONFIG[currentTierIndex + 1];
    const referralsNeeded = Math.max(0, nextTier.minReferrals - affiliate.stats.paidConversions);
    const earningsNeeded = Math.max(0, nextTier.minEarnings - affiliate.stats.totalEarnings);

    const referralProgress = nextTier.minReferrals > 0
        ? Math.min(100, (affiliate.stats.paidConversions / nextTier.minReferrals) * 100)
        : 100;
    const earningsProgress = nextTier.minEarnings > 0
        ? Math.min(100, (affiliate.stats.totalEarnings / nextTier.minEarnings) * 100)
        : 100;

    return {
        nextTier: nextTier.name,
        referralsNeeded,
        earningsNeeded,
        referralProgress,
        earningsProgress
    };
}

// =================================================================
// AUTOMATIC PAYOUT FUNCTIONS
// =================================================================

/**
 * Check if affiliate qualifies for automatic payout and create one
 */
function checkAndCreateAutoPayout(affiliate: AffiliateData): {
    created: boolean;
    payout?: PayoutData;
    type?: 'threshold' | 'instant';
} {
    if (!PAYOUT_SETTINGS.autoPayoutEnabled) {
        return { created: false };
    }

    if (affiliate.status !== 'active') {
        return { created: false };
    }

    if (affiliate.stats.pendingEarnings < PAYOUT_SETTINGS.minimumPayout) {
        return { created: false };
    }

    // Check threshold-based auto-payout
    if (affiliate.stats.pendingEarnings >= PAYOUT_SETTINGS.autoPayoutThreshold) {
        const isInstantTier = PAYOUT_SETTINGS.instantPayoutTiers.includes(affiliate.tier);
        const isAutoApprovalTier = PAYOUT_SETTINGS.autoApprovalTiers.includes(affiliate.tier);

        const payoutId = `pay_auto_${Date.now()}_${affiliate.id.slice(-4)}`;

        // Determine initial status based on tier
        let initialStatus: PayoutData['status'] = 'pending';
        if (isInstantTier) {
            initialStatus = 'completed'; // Instant for Diamond/Platinum
        } else if (isAutoApprovalTier) {
            initialStatus = 'processing'; // Auto-approved for Gold+
        }

        const newPayout: PayoutData = {
            id: payoutId,
            affiliateId: affiliate.id,
            affiliateName: affiliate.userName,
            amount: affiliate.stats.pendingEarnings,
            status: initialStatus,
            paymentMethod: affiliate.paymentMethod,
            requestedAt: new Date(),
            processedAt: isInstantTier ? new Date() : undefined,
            adminNotes: isInstantTier
                ? 'Auto-processed (Instant Payout - Premium Tier)'
                : isAutoApprovalTier
                    ? 'Auto-approved (Gold+ Tier)'
                    : 'Auto-created (Threshold reached)'
        };

        // Store the payout
        payoutStore.set(payoutId, newPayout);

        // Deduct from pending earnings
        const payoutAmount = affiliate.stats.pendingEarnings;
        affiliate.stats.pendingEarnings = 0;
        if (isInstantTier) {
            affiliate.stats.paidEarnings += payoutAmount;
        }
        affiliateStore.set(affiliate.id, affiliate);

        // Log the auto-payout
        autoPayoutLogs.push({
            affiliateId: affiliate.id,
            affiliateName: affiliate.userName || 'Unknown',
            amount: payoutAmount,
            type: isInstantTier ? 'instant' : 'threshold',
            status: isInstantTier ? 'processed' : isAutoApprovalTier ? 'auto-approved' : 'created',
            timestamp: new Date()
        });

        return {
            created: true,
            payout: newPayout,
            type: isInstantTier ? 'instant' : 'threshold'
        };
    }

    return { created: false };
}

/**
 * Process scheduled payouts for all eligible affiliates
 * Should be called by a cron job on scheduled days
 */
function processScheduledPayouts(): {
    processed: number;
    payouts: Array<{
        affiliateId: string;
        affiliateName: string;
        amount: number;
        status: string;
    }>;
} {
    const today = new Date().getDate();

    // Check if today is a scheduled payout day
    if (!PAYOUT_SETTINGS.scheduledPayoutDays.includes(today)) {
        return { processed: 0, payouts: [] };
    }

    const processedPayouts: Array<{
        affiliateId: string;
        affiliateName: string;
        amount: number;
        status: string;
    }> = [];

    for (const affiliate of affiliateStore.values()) {
        if (affiliate.status !== 'active') continue;
        if (affiliate.stats.pendingEarnings < PAYOUT_SETTINGS.minimumPayout) continue;

        const isAutoApprovalTier = PAYOUT_SETTINGS.autoApprovalTiers.includes(affiliate.tier);
        const isInstantTier = PAYOUT_SETTINGS.instantPayoutTiers.includes(affiliate.tier);

        const payoutId = `pay_sched_${Date.now()}_${affiliate.id.slice(-4)}`;

        let status: PayoutData['status'] = 'pending';
        if (isInstantTier) {
            status = 'completed';
        } else if (isAutoApprovalTier) {
            status = 'processing';
        }

        const newPayout: PayoutData = {
            id: payoutId,
            affiliateId: affiliate.id,
            affiliateName: affiliate.userName,
            amount: affiliate.stats.pendingEarnings,
            status,
            paymentMethod: affiliate.paymentMethod,
            requestedAt: new Date(),
            processedAt: isInstantTier ? new Date() : undefined,
            adminNotes: `Scheduled payout (Day ${today})`
        };

        payoutStore.set(payoutId, newPayout);

        const payoutAmount = affiliate.stats.pendingEarnings;
        affiliate.stats.pendingEarnings = 0;
        if (isInstantTier) {
            affiliate.stats.paidEarnings += payoutAmount;
        }
        affiliateStore.set(affiliate.id, affiliate);

        autoPayoutLogs.push({
            affiliateId: affiliate.id,
            affiliateName: affiliate.userName || 'Unknown',
            amount: payoutAmount,
            type: 'scheduled',
            status: isInstantTier ? 'processed' : isAutoApprovalTier ? 'auto-approved' : 'created',
            timestamp: new Date()
        });

        processedPayouts.push({
            affiliateId: affiliate.id,
            affiliateName: affiliate.userName || 'Unknown',
            amount: payoutAmount,
            status
        });
    }

    return {
        processed: processedPayouts.length,
        payouts: processedPayouts
    };
}

/**
 * Auto-approve pending payouts for eligible tiers
 */
function autoApprovePendingPayouts(): {
    approved: number;
    payouts: string[];
} {
    const approvedPayouts: string[] = [];

    for (const payout of payoutStore.values()) {
        if (payout.status !== 'pending') continue;

        const affiliate = affiliateStore.get(payout.affiliateId);
        if (!affiliate) continue;

        if (PAYOUT_SETTINGS.autoApprovalTiers.includes(affiliate.tier)) {
            payout.status = 'processing';
            payout.adminNotes = (payout.adminNotes || '') + ' | Auto-approved based on tier';
            payoutStore.set(payout.id, payout);
            approvedPayouts.push(payout.id);
        }
    }

    return {
        approved: approvedPayouts.length,
        payouts: approvedPayouts
    };
}


function seedDemoData() {
    if (affiliateStore.size === 0) {
        // Create some demo affiliates
        const demoAffiliates: AffiliateData[] = [
            {
                id: 'aff_demo_001',
                userId: 'user_001',
                userName: 'John Smith',
                userEmail: 'john@example.com',
                referralCode: 'JOHNSMITH25',
                referralLink: 'https://digitalmeng.com/?ref=JOHNSMITH25',
                status: 'active',
                tier: 'gold',
                createdAt: new Date('2024-06-15'),
                approvedAt: new Date('2024-06-16'),
                commissionRate: 15,
                cookieDuration: 90,
                paymentMethod: 'paypal',
                paymentEmail: 'john@example.com',
                stats: {
                    totalClicks: 4892,
                    totalSignups: 127,
                    paidConversions: 48,
                    totalEarnings: 7840.50,
                    pendingEarnings: 1240.00,
                    paidEarnings: 6600.50
                }
            },
            {
                id: 'aff_demo_002',
                userId: 'user_002',
                userName: 'Sarah Johnson',
                userEmail: 'sarah@marketing.co',
                referralCode: 'SARAHJ2024',
                referralLink: 'https://digitalmeng.com/?ref=SARAHJ2024',
                status: 'active',
                tier: 'platinum',
                createdAt: new Date('2024-03-10'),
                approvedAt: new Date('2024-03-11'),
                commissionRate: 18,
                cookieDuration: 90,
                paymentMethod: 'stripe',
                paymentEmail: 'sarah@marketing.co',
                stats: {
                    totalClicks: 12450,
                    totalSignups: 345,
                    paidConversions: 156,
                    totalEarnings: 24560.00,
                    pendingEarnings: 3200.00,
                    paidEarnings: 21360.00
                }
            },
            {
                id: 'aff_demo_003',
                userId: 'user_003',
                userName: 'Mike Wilson',
                userEmail: 'mike@startup.io',
                referralCode: 'MIKEW123',
                referralLink: 'https://digitalmeng.com/?ref=MIKEW123',
                status: 'pending',
                tier: 'bronze',
                createdAt: new Date('2025-01-02'),
                commissionRate: 10,
                cookieDuration: 30,
                paymentMethod: 'paypal',
                paymentEmail: 'mike@startup.io',
                stats: {
                    totalClicks: 0,
                    totalSignups: 0,
                    paidConversions: 0,
                    totalEarnings: 0,
                    pendingEarnings: 0,
                    paidEarnings: 0
                }
            },
            {
                id: 'aff_demo_004',
                userId: 'user_004',
                userName: 'Emily Chen',
                userEmail: 'emily@agency.com',
                referralCode: 'EMILYCH',
                referralLink: 'https://digitalmeng.com/?ref=EMILYCH',
                status: 'suspended',
                tier: 'silver',
                createdAt: new Date('2024-09-20'),
                approvedAt: new Date('2024-09-21'),
                commissionRate: 12,
                cookieDuration: 60,
                paymentMethod: 'bank_transfer',
                stats: {
                    totalClicks: 890,
                    totalSignups: 23,
                    paidConversions: 8,
                    totalEarnings: 560.00,
                    pendingEarnings: 120.00,
                    paidEarnings: 440.00
                }
            }
        ];

        demoAffiliates.forEach(a => affiliateStore.set(a.id, a));

        // Create some demo payouts
        const demoPayouts: PayoutData[] = [
            {
                id: 'pay_demo_001',
                affiliateId: 'aff_demo_001',
                affiliateName: 'John Smith',
                amount: 500.00,
                status: 'pending',
                paymentMethod: 'paypal',
                requestedAt: new Date('2025-01-02')
            },
            {
                id: 'pay_demo_002',
                affiliateId: 'aff_demo_002',
                affiliateName: 'Sarah Johnson',
                amount: 1500.00,
                status: 'processing',
                paymentMethod: 'stripe',
                requestedAt: new Date('2025-01-01')
            },
            {
                id: 'pay_demo_003',
                affiliateId: 'aff_demo_002',
                affiliateName: 'Sarah Johnson',
                amount: 2000.00,
                status: 'completed',
                paymentMethod: 'stripe',
                paymentReference: 'STR-789456123',
                requestedAt: new Date('2024-12-15'),
                processedAt: new Date('2024-12-18')
            }
        ];

        demoPayouts.forEach(p => payoutStore.set(p.id, p));
    }
}

// GET - List all affiliates and payouts
export async function GET(request: NextRequest) {
    try {
        seedDemoData();

        const { searchParams } = new URL(request.url);
        const action = searchParams.get('action');

        if (action === 'payouts') {
            // Get all pending payouts
            const payouts = Array.from(payoutStore.values())
                .sort((a, b) => new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime());

            return NextResponse.json({
                success: true,
                data: payouts
            });
        }

        if (action === 'stats') {
            // Get overall affiliate stats
            const affiliates = Array.from(affiliateStore.values());
            const stats = {
                totalAffiliates: affiliates.length,
                activeAffiliates: affiliates.filter(a => a.status === 'active').length,
                pendingApprovals: affiliates.filter(a => a.status === 'pending').length,
                suspendedAffiliates: affiliates.filter(a => a.status === 'suspended').length,
                totalEarnings: affiliates.reduce((sum, a) => sum + a.stats.totalEarnings, 0),
                totalPendingPayouts: Array.from(payoutStore.values())
                    .filter(p => p.status === 'pending' || p.status === 'processing')
                    .reduce((sum, p) => sum + p.amount, 0),
                totalClicks: affiliates.reduce((sum, a) => sum + a.stats.totalClicks, 0),
                totalConversions: affiliates.reduce((sum, a) => sum + a.stats.paidConversions, 0)
            };

            return NextResponse.json({
                success: true,
                data: stats
            });
        }

        // Get tier configuration
        if (action === 'tier-config') {
            return NextResponse.json({
                success: true,
                data: TIER_CONFIG
            });
        }

        // Get tier upgrade notifications
        if (action === 'notifications') {
            return NextResponse.json({
                success: true,
                data: tierUpgradeNotifications.slice(-20) // Last 20 notifications
            });
        }

        // Get payout settings
        if (action === 'payout-settings') {
            return NextResponse.json({
                success: true,
                data: PAYOUT_SETTINGS
            });
        }

        // Get auto-payout logs
        if (action === 'payout-logs') {
            return NextResponse.json({
                success: true,
                data: autoPayoutLogs.slice(-50) // Last 50 logs
            });
        }

        // Trigger scheduled payouts (Manual/Cron)
        if (action === 'process-scheduled') {
            const result = processScheduledPayouts();
            return NextResponse.json({
                success: true,
                data: result,
                message: `Processed scheduled payouts. ${result.processed} payout(s) created.`
            });
        }

        // Trigger auto-approval (Manual/Cron)
        if (action === 'auto-approve') {
            const result = autoApprovePendingPayouts();
            return NextResponse.json({
                success: true,
                data: result,
                message: `Auto-approved ${result.approved} pending payout(s).`
            });
        }

        // Recalculate all affiliate tiers
        if (action === 'recalculate') {
            const upgrades: Array<{
                affiliateId: string;
                affiliateName: string;
                fromTier: TierName;
                toTier: TierName;
                bonus: number;
            }> = [];

            for (const affiliate of affiliateStore.values()) {
                const result = checkAndApplyTierUpgrade(affiliate);
                if (result.upgraded && result.fromTier && result.toTier) {
                    affiliateStore.set(affiliate.id, affiliate);
                    upgrades.push({
                        affiliateId: affiliate.id,
                        affiliateName: affiliate.userName || 'Unknown',
                        fromTier: result.fromTier,
                        toTier: result.toTier,
                        bonus: result.bonus || 0
                    });
                }
            }

            return NextResponse.json({
                success: true,
                data: {
                    totalChecked: affiliateStore.size,
                    totalUpgraded: upgrades.length,
                    upgrades
                },
                message: `Recalculated tiers. ${upgrades.length} affiliate(s) upgraded.`
            });
        }

        // Get single affiliate with progress
        if (action === 'progress') {
            const affiliateId = searchParams.get('id');
            if (!affiliateId) {
                return NextResponse.json(
                    { success: false, error: 'Affiliate ID required' },
                    { status: 400 }
                );
            }

            const affiliate = affiliateStore.get(affiliateId);
            if (!affiliate) {
                return NextResponse.json(
                    { success: false, error: 'Affiliate not found' },
                    { status: 404 }
                );
            }

            const progress = calculateNextTierProgress(affiliate);
            const currentTierConfig = getTierConfig(affiliate.tier);

            return NextResponse.json({
                success: true,
                data: {
                    affiliate,
                    currentTier: currentTierConfig,
                    nextTierProgress: progress
                }
            });
        }

        // Default: Get all affiliates with their progress
        const affiliates = Array.from(affiliateStore.values())
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            .map(affiliate => ({
                ...affiliate,
                nextTierProgress: calculateNextTierProgress(affiliate)
            }));

        return NextResponse.json({
            success: true,
            data: affiliates
        });

    } catch (error) {
        console.error('Admin affiliate GET error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to get affiliate data' },
            { status: 500 }
        );
    }
}

// PUT - Update affiliate or payout status
export async function PUT(request: NextRequest) {
    try {
        seedDemoData();

        const body = await request.json();
        const { type, id, status, tier, commissionRate, adminNotes, paymentReference } = body;

        if (type === 'affiliate') {
            const affiliate = affiliateStore.get(id);
            if (!affiliate) {
                return NextResponse.json(
                    { success: false, error: 'Affiliate not found' },
                    { status: 404 }
                );
            }

            // Update fields
            if (status) {
                affiliate.status = status;
                if (status === 'active' && !affiliate.approvedAt) {
                    affiliate.approvedAt = new Date();
                }
            }
            if (tier) {
                affiliate.tier = tier;
                // Update commission rate based on tier
                const tierRates: Record<string, number> = {
                    bronze: 10,
                    silver: 12,
                    gold: 15,
                    platinum: 18,
                    diamond: 20
                };
                affiliate.commissionRate = tierRates[tier] || affiliate.commissionRate;
            }
            if (commissionRate !== undefined) {
                affiliate.commissionRate = commissionRate;
            }

            affiliateStore.set(id, affiliate);

            return NextResponse.json({
                success: true,
                data: affiliate,
                message: 'Affiliate updated successfully'
            });
        }

        if (type === 'payout') {
            const payout = payoutStore.get(id);
            if (!payout) {
                return NextResponse.json(
                    { success: false, error: 'Payout not found' },
                    { status: 404 }
                );
            }

            // Update fields
            if (status) payout.status = status;
            if (adminNotes) payout.adminNotes = adminNotes;
            if (paymentReference) payout.paymentReference = paymentReference;

            if (status === 'completed' || status === 'failed' || status === 'cancelled') {
                payout.processedAt = new Date();
            }

            payoutStore.set(id, payout);

            return NextResponse.json({
                success: true,
                data: payout,
                message: 'Payout updated successfully'
            });
        }

        return NextResponse.json(
            { success: false, error: 'Invalid type. Must be "affiliate" or "payout"' },
            { status: 400 }
        );

    } catch (error) {
        console.error('Admin affiliate PUT error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to update' },
            { status: 500 }
        );
    }
}

// DELETE - Remove affiliate (suspend)
export async function DELETE(request: NextRequest) {
    try {
        seedDemoData();

        const { searchParams } = new URL(request.url);
        const affiliateId = searchParams.get('id');

        if (!affiliateId) {
            return NextResponse.json(
                { success: false, error: 'Affiliate ID is required' },
                { status: 400 }
            );
        }

        const affiliate = affiliateStore.get(affiliateId);
        if (!affiliate) {
            return NextResponse.json(
                { success: false, error: 'Affiliate not found' },
                { status: 404 }
            );
        }

        // Don't actually delete, just suspend
        affiliate.status = 'suspended';
        affiliateStore.set(affiliateId, affiliate);

        return NextResponse.json({
            success: true,
            message: 'Affiliate suspended successfully'
        });

    } catch (error) {
        console.error('Admin affiliate DELETE error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to suspend affiliate' },
            { status: 500 }
        );
    }
}

// =================================================================
// POST - Record conversion / Add earnings (triggers tier check)
// =================================================================
export async function POST(request: NextRequest) {
    try {
        seedDemoData();

        const body = await request.json();
        const { action, affiliateId, amount, clicks, signups, conversions } = body;

        // Record a new conversion
        if (action === 'record-conversion') {
            const affiliate = affiliateStore.get(affiliateId);
            if (!affiliate) {
                return NextResponse.json(
                    { success: false, error: 'Affiliate not found' },
                    { status: 404 }
                );
            }

            if (affiliate.status !== 'active') {
                return NextResponse.json(
                    { success: false, error: 'Affiliate is not active' },
                    { status: 400 }
                );
            }

            // Calculate commission
            const commission = (amount * affiliate.commissionRate) / 100;

            // Update stats
            affiliate.stats.paidConversions += 1;
            affiliate.stats.pendingEarnings += commission;
            affiliate.stats.totalEarnings += commission;

            // Check for automatic tier upgrade
            const upgradeResult = checkAndApplyTierUpgrade(affiliate);

            // Check for automatic payout (threshold-based)
            const autoPayoutResult = checkAndCreateAutoPayout(affiliate);

            affiliateStore.set(affiliateId, affiliate);

            return NextResponse.json({
                success: true,
                data: {
                    affiliate,
                    commission,
                    tierUpgrade: upgradeResult.upgraded ? {
                        fromTier: upgradeResult.fromTier,
                        toTier: upgradeResult.toTier,
                        bonus: upgradeResult.bonus
                    } : null,
                    autoPayout: autoPayoutResult.created ? {
                        payoutId: autoPayoutResult.payout?.id,
                        amount: autoPayoutResult.payout?.amount,
                        type: autoPayoutResult.type,
                        status: autoPayoutResult.payout?.status
                    } : null
                },
                message: autoPayoutResult.created
                    ? `Conversion recorded! Commission: $${commission.toFixed(2)}. Auto-payout of $${autoPayoutResult.payout?.amount.toFixed(2)} ${autoPayoutResult.type === 'instant' ? 'processed instantly!' : 'created!'}`
                    : upgradeResult.upgraded
                        ? `Conversion recorded! Affiliate upgraded from ${upgradeResult.fromTier} to ${upgradeResult.toTier} with $${upgradeResult.bonus} bonus!`
                        : `Conversion recorded! Commission: $${commission.toFixed(2)}`
            });
        }

        // Add clicks/signups/conversions manually (for testing)
        if (action === 'add-stats') {
            const affiliate = affiliateStore.get(affiliateId);
            if (!affiliate) {
                return NextResponse.json(
                    { success: false, error: 'Affiliate not found' },
                    { status: 404 }
                );
            }

            // Add stats
            if (clicks) affiliate.stats.totalClicks += clicks;
            if (signups) affiliate.stats.totalSignups += signups;
            if (conversions) {
                affiliate.stats.paidConversions += conversions;
                // Add earnings based on conversions (average $50 per conversion)
                const earnings = conversions * 50 * (affiliate.commissionRate / 100);
                affiliate.stats.pendingEarnings += earnings;
                affiliate.stats.totalEarnings += earnings;
            }

            // Check for automatic tier upgrade
            const upgradeResult = checkAndApplyTierUpgrade(affiliate);

            affiliateStore.set(affiliateId, affiliate);

            return NextResponse.json({
                success: true,
                data: {
                    affiliate,
                    tierUpgrade: upgradeResult.upgraded ? {
                        fromTier: upgradeResult.fromTier,
                        toTier: upgradeResult.toTier,
                        bonus: upgradeResult.bonus
                    } : null,
                    nextTierProgress: calculateNextTierProgress(affiliate)
                },
                message: upgradeResult.upgraded
                    ? `Stats updated! Tier upgraded: ${upgradeResult.fromTier} → ${upgradeResult.toTier}`
                    : 'Stats updated successfully'
            });
        }

        // Request payout
        if (action === 'request-payout') {
            const affiliate = affiliateStore.get(affiliateId);
            if (!affiliate) {
                return NextResponse.json(
                    { success: false, error: 'Affiliate not found' },
                    { status: 404 }
                );
            }

            if (affiliate.stats.pendingEarnings < 50) {
                return NextResponse.json(
                    { success: false, error: 'Minimum payout amount is $50' },
                    { status: 400 }
                );
            }

            const payoutAmount = amount || affiliate.stats.pendingEarnings;
            const payoutId = `pay_${Date.now()}`;

            const newPayout: PayoutData = {
                id: payoutId,
                affiliateId: affiliate.id,
                affiliateName: affiliate.userName,
                amount: payoutAmount,
                status: 'pending',
                paymentMethod: affiliate.paymentMethod,
                requestedAt: new Date()
            };

            // Deduct from pending earnings
            affiliate.stats.pendingEarnings -= payoutAmount;

            payoutStore.set(payoutId, newPayout);
            affiliateStore.set(affiliateId, affiliate);

            return NextResponse.json({
                success: true,
                data: newPayout,
                message: `Payout request for $${payoutAmount.toFixed(2)} submitted successfully`
            });
        }

        return NextResponse.json(
            { success: false, error: 'Invalid action' },
            { status: 400 }
        );

    } catch (error) {
        console.error('Admin affiliate POST error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to process request' },
            { status: 500 }
        );
    }
}
