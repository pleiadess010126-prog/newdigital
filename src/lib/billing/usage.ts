// Usage Tracking System for DigitalMEng SaaS
// Tracks content generation, platform posts, video, voice over, music, images, and enforces plan limits
// Free tier = 15-day trial only, must upgrade after trial expires

// Trial configuration
export const TRIAL_CONFIG = {
    durationDays: 15,           // 15-day free trial
    planId: 'free',             // Trial uses 'free' plan limits
    upgradeReminders: [3, 1, 0], // Days before expiry to remind
};
export interface UsageLimits {
    contentPerMonth: number;     // -1 for unlimited
    platforms: number;           // -1 for unlimited
    apiCalls: number;            // -1 for unlimited
    // Video & Audio Limits
    videoMinutes: number;        // AI video generation minutes per month
    voiceOverCharacters: number; // ElevenLabs/TTS characters per month
    musicTracks: number;         // Background music track uses per month (-1 unlimited for royalty-free)
    // AI Image Generation
    aiImages: number;            // AI image generation per month (DALL-E, Stable Diffusion)
}

export interface UsageRecord {
    userId: string;
    organizationId: string;
    month: string; // Format: YYYY-MM
    contentGenerated: number;
    platformPosts: {
        wordpress: number;
        youtube: number;
        instagram: number;
        facebook: number;
        tiktok: number;
    };
    apiCalls: number;
    // Video & Audio Usage
    videoMinutesUsed: number;
    voiceOverCharactersUsed: number;
    musicTracksUsed: number;
    // AI Image Usage
    aiImagesGenerated: number;
    lastUpdated: Date;
}

// Plan limits configuration - Updated January 2026 for 70%+ profit margin
// Free tier includes Instagram to build user confidence before upgrading
export const PLAN_LIMITS: Record<string, UsageLimits> = {
    free: {
        contentPerMonth: 20,       // Increased from 10 for better trial experience
        platforms: 2,              // WordPress + Instagram (3 posts each)
        apiCalls: 150,
        videoMinutes: 1,           // 1 min AI video to try the feature
        voiceOverCharacters: 1000, // ~1 min voice to try
        musicTracks: 1,            // 1 music track to try
        aiImages: 10,              // 10 free AI images to try
    },
    lite: {
        contentPerMonth: 40,
        platforms: 2,              // WordPress + Instagram
        apiCalls: 500,
        videoMinutes: 0,           // No video on Lite
        voiceOverCharacters: 2000, // Basic voice for testing
        musicTracks: 2,
        aiImages: 15,
    },
    starter: {
        contentPerMonth: 100,
        platforms: 3,              // WordPress + Instagram + YouTube
        apiCalls: 1000,
        videoMinutes: 5,           // 5 minutes of AI video/month
        voiceOverCharacters: 10000, // ~10k chars (~7 min audio)
        musicTracks: 10,           // 10 music track uses
        aiImages: 50,              // 50 AI images/month
    },
    growth: {
        contentPerMonth: 200,      // NEW: Growth tier between Starter and Pro
        platforms: 4,              // WordPress + Instagram + YouTube + Facebook
        apiCalls: 4000,
        videoMinutes: 12,          // 12 minutes of AI video/month
        voiceOverCharacters: 25000, // ~25k chars (~18 min audio)
        musicTracks: 25,           // 25 music track uses
        aiImages: 100,             // 100 AI images/month
    },
    pro: {
        contentPerMonth: 400,      // Reduced from 500 for margin
        platforms: 5,              // All major platforms
        apiCalls: 8000,            // Reduced from 10000
        videoMinutes: 20,          // Reduced from 30 for 70% margin
        voiceOverCharacters: 40000, // Reduced from 50k for margin
        musicTracks: -1,           // Unlimited royalty-free music
        aiImages: 150,             // Reduced from 200 for margin
    },
    enterprise: {
        // Fair-use limits to ensure 70% margin
        contentPerMonth: 2000,     // Fair-use limit (was unlimited)
        platforms: -1,             // All platforms
        apiCalls: 50000,           // High but capped
        videoMinutes: 60,          // 60 min/month fair-use (was unlimited)
        voiceOverCharacters: 150000, // 150K chars fair-use (was unlimited)
        musicTracks: -1,           // Unlimited + AI-generated music
        aiImages: 500,             // Fair-use limit
    },
};

// Get current month key
export function getCurrentMonthKey(): string {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

// Check if user has reached content limit
export function hasReachedContentLimit(
    currentUsage: number,
    plan: string
): boolean {
    const limits = PLAN_LIMITS[plan] || PLAN_LIMITS.free;
    if (limits.contentPerMonth === -1) return false;
    return currentUsage >= limits.contentPerMonth;
}

// Check if user can use a specific platform
export function canUsePlatform(
    plan: string,
    platformIndex: number
): boolean {
    const limits = PLAN_LIMITS[plan] || PLAN_LIMITS.free;
    if (limits.platforms === -1) return true;
    return platformIndex < limits.platforms;
}

// Get remaining content credits
export function getRemainingContent(
    currentUsage: number,
    plan: string
): number | 'unlimited' {
    const limits = PLAN_LIMITS[plan] || PLAN_LIMITS.free;
    if (limits.contentPerMonth === -1) return 'unlimited';
    return Math.max(0, limits.contentPerMonth - currentUsage);
}

// Get usage percentage
export function getUsagePercentage(
    currentUsage: number,
    plan: string
): number {
    const limits = PLAN_LIMITS[plan] || PLAN_LIMITS.free;
    if (limits.contentPerMonth === -1) return 0;
    return Math.min(100, (currentUsage / limits.contentPerMonth) * 100);
}

// Usage tracking context for client-side
export interface UsageContextType {
    usage: UsageRecord | null;
    limits: UsageLimits;
    isLoading: boolean;
    refreshUsage: () => Promise<void>;
    incrementContent: () => Promise<boolean>;
    incrementPlatformPost: (platform: keyof UsageRecord['platformPosts']) => Promise<boolean>;
}

// Demo usage data
export function getMockUsage(plan: string = 'free'): UsageRecord {
    return {
        userId: 'demo_user',
        organizationId: 'demo_org',
        month: getCurrentMonthKey(),
        contentGenerated: plan === 'free' ? 7 : plan === 'starter' ? 45 : 123,
        platformPosts: {
            wordpress: 12,
            youtube: 8,
            instagram: 15,
            facebook: 10,
            tiktok: 5,
        },
        apiCalls: 256,
        // Video & Audio usage
        videoMinutesUsed: plan === 'free' ? 0 : plan === 'starter' ? 2 : 12,
        voiceOverCharactersUsed: plan === 'free' ? 0 : plan === 'starter' ? 3500 : 18000,
        musicTracksUsed: plan === 'free' ? 0 : plan === 'starter' ? 4 : 15,
        // AI Image usage
        aiImagesGenerated: plan === 'free' ? 3 : plan === 'starter' ? 22 : 85,
        lastUpdated: new Date(),
    };
}

// Format usage for display
export function formatUsageDisplay(
    current: number,
    limit: number
): string {
    if (limit === -1) {
        return `${current} (Unlimited)`;
    }
    return `${current} / ${limit}`;
}

// Check if user should see upgrade prompt
export function shouldShowUpgradePrompt(
    currentUsage: number,
    plan: string,
    threshold: number = 0.8 // 80%
): boolean {
    const limits = PLAN_LIMITS[plan] || PLAN_LIMITS.free;
    if (limits.contentPerMonth === -1) return false;
    const percentage = currentUsage / limits.contentPerMonth;
    return percentage >= threshold;
}

// Get recommended plan based on usage
export function getRecommendedPlan(
    monthlyContent: number,
    platformsNeeded: number
): string {
    if (monthlyContent <= 40 && platformsNeeded <= 2) return 'lite';
    if (monthlyContent <= 100 && platformsNeeded <= 3) return 'starter';
    if (monthlyContent <= 400 && platformsNeeded <= 5) return 'pro';
    return 'enterprise';
}

// ==========================================
// TRIAL MANAGEMENT FUNCTIONS
// ==========================================

/**
 * Check if user's trial has expired
 */
export function isTrialExpired(trialStartDate: Date): boolean {
    const now = new Date();
    const trialEnd = new Date(trialStartDate);
    trialEnd.setDate(trialEnd.getDate() + TRIAL_CONFIG.durationDays);
    return now > trialEnd;
}

/**
 * Get remaining trial days
 */
export function getTrialDaysRemaining(trialStartDate: Date): number {
    const now = new Date();
    const trialEnd = new Date(trialStartDate);
    trialEnd.setDate(trialEnd.getDate() + TRIAL_CONFIG.durationDays);

    const diffMs = trialEnd.getTime() - now.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    return Math.max(0, diffDays);
}

/**
 * Get trial expiry date
 */
export function getTrialExpiryDate(trialStartDate: Date): Date {
    const trialEnd = new Date(trialStartDate);
    trialEnd.setDate(trialEnd.getDate() + TRIAL_CONFIG.durationDays);
    return trialEnd;
}

/**
 * Check if should show trial reminder
 */
export function shouldShowTrialReminder(trialStartDate: Date): boolean {
    const daysRemaining = getTrialDaysRemaining(trialStartDate);
    return TRIAL_CONFIG.upgradeReminders.includes(daysRemaining);
}

/**
 * Format trial status message
 */
export function getTrialStatusMessage(trialStartDate: Date): {
    message: string;
    urgency: 'info' | 'warning' | 'critical' | 'expired';
} {
    const daysRemaining = getTrialDaysRemaining(trialStartDate);

    if (daysRemaining <= 0) {
        return {
            message: 'Your 15-day trial has expired. Upgrade now to continue.',
            urgency: 'expired'
        };
    }

    if (daysRemaining === 1) {
        return {
            message: 'Last day of your trial! Upgrade now to keep your progress.',
            urgency: 'critical'
        };
    }

    if (daysRemaining <= 3) {
        return {
            message: `Only ${daysRemaining} days left in your trial. Upgrade to continue.`,
            urgency: 'warning'
        };
    }

    return {
        message: `${daysRemaining} days remaining in your trial.`,
        urgency: 'info'
    };
}

// ==========================================
// OVERAGE BILLING SYSTEM
// ==========================================

/**
 * Overage pricing per resource type (in USD cents)
 * These rates maintain 70%+ margin even on overages
 */
export const OVERAGE_RATES = {
    content: 50,              // $0.50 per extra content piece
    videoMinute: 150,         // $1.50 per extra video minute
    voiceOverChars: 5,        // $0.05 per 1K extra characters (divide by 1000)
    aiImage: 25,              // $0.25 per extra AI image
    apiCall: 1,               // $0.01 per extra API call
};

/**
 * Check if overages are enabled for a plan
 * Free/Lite plans get hard blocked, Starter+ get overage billing
 */
export function isOverageEnabled(plan: string): boolean {
    const overageEnabledPlans = ['starter', 'growth', 'pro', 'enterprise'];
    return overageEnabledPlans.includes(plan);
}

/**
 * Calculate overage charges for a specific resource
 */
export function calculateOverageCharge(
    resourceType: keyof typeof OVERAGE_RATES,
    overageAmount: number
): number {
    const rate = OVERAGE_RATES[resourceType];

    // Voice over is charged per 1K chars
    if (resourceType === 'voiceOverChars') {
        return Math.ceil(overageAmount / 1000) * rate;
    }

    return overageAmount * rate;
}

/**
 * Get total overage charges for a usage record
 */
export function calculateTotalOverages(
    usage: UsageRecord,
    plan: string
): { total: number; breakdown: Record<string, number> } {
    const limits = PLAN_LIMITS[plan] || PLAN_LIMITS.free;
    const breakdown: Record<string, number> = {};
    let total = 0;

    // Content overage
    if (limits.contentPerMonth !== -1 && usage.contentGenerated > limits.contentPerMonth) {
        const overage = usage.contentGenerated - limits.contentPerMonth;
        const charge = calculateOverageCharge('content', overage);
        breakdown.content = charge;
        total += charge;
    }

    // Video overage
    if (limits.videoMinutes !== -1 && usage.videoMinutesUsed > limits.videoMinutes) {
        const overage = usage.videoMinutesUsed - limits.videoMinutes;
        const charge = calculateOverageCharge('videoMinute', overage);
        breakdown.video = charge;
        total += charge;
    }

    // Voice over overage
    if (limits.voiceOverCharacters !== -1 && usage.voiceOverCharactersUsed > limits.voiceOverCharacters) {
        const overage = usage.voiceOverCharactersUsed - limits.voiceOverCharacters;
        const charge = calculateOverageCharge('voiceOverChars', overage);
        breakdown.voiceOver = charge;
        total += charge;
    }

    // AI Images overage
    if (limits.aiImages !== -1 && usage.aiImagesGenerated > limits.aiImages) {
        const overage = usage.aiImagesGenerated - limits.aiImages;
        const charge = calculateOverageCharge('aiImage', overage);
        breakdown.aiImages = charge;
        total += charge;
    }

    // API calls overage (Enterprise only typically)
    if (limits.apiCalls !== -1 && usage.apiCalls > limits.apiCalls) {
        const overage = usage.apiCalls - limits.apiCalls;
        const charge = calculateOverageCharge('apiCall', overage);
        breakdown.apiCalls = charge;
        total += charge;
    }

    return { total, breakdown };
}

/**
 * Check if a resource action should be blocked or allowed with overage
 */
export function checkResourceLimit(
    resourceType: 'content' | 'video' | 'voiceOver' | 'aiImage' | 'api',
    currentUsage: number,
    plan: string
): { allowed: boolean; reason: string; overageRate?: number } {
    const limits = PLAN_LIMITS[plan] || PLAN_LIMITS.free;

    const limitMap: Record<string, number> = {
        content: limits.contentPerMonth,
        video: limits.videoMinutes,
        voiceOver: limits.voiceOverCharacters,
        aiImage: limits.aiImages,
        api: limits.apiCalls,
    };

    const rateMap: Record<string, keyof typeof OVERAGE_RATES> = {
        content: 'content',
        video: 'videoMinute',
        voiceOver: 'voiceOverChars',
        aiImage: 'aiImage',
        api: 'apiCall',
    };

    const limit = limitMap[resourceType];

    // Unlimited
    if (limit === -1) {
        return { allowed: true, reason: 'Unlimited usage on your plan' };
    }

    // Within limits
    if (currentUsage < limit) {
        return { allowed: true, reason: `${limit - currentUsage} remaining` };
    }

    // At or over limit - check if overages allowed
    if (isOverageEnabled(plan)) {
        const rate = OVERAGE_RATES[rateMap[resourceType]];
        return {
            allowed: true,
            reason: 'Overage charges will apply',
            overageRate: rate
        };
    }

    // Hard blocked for free/lite plans
    return {
        allowed: false,
        reason: `You've reached your ${resourceType} limit. Upgrade to continue.`
    };
}

/**
 * Format overage amount for display
 */
export function formatOverageAmount(cents: number): string {
    return `$${(cents / 100).toFixed(2)}`;
}

/**
 * Get overage alert message
 */
export function getOverageAlertMessage(
    usage: UsageRecord,
    plan: string
): { hasOverages: boolean; message: string; totalCharge: string } | null {
    if (!isOverageEnabled(plan)) return null;

    const { total, breakdown } = calculateTotalOverages(usage, plan);

    if (total === 0) return null;

    const items = Object.entries(breakdown)
        .filter(([, v]) => v > 0)
        .map(([k, v]) => `${k}: ${formatOverageAmount(v)}`);

    return {
        hasOverages: true,
        message: `You have overage charges this month: ${items.join(', ')}`,
        totalCharge: formatOverageAmount(total)
    };
}

