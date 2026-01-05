// Affiliate Program Types

// Global Payment Method Options
export type PaymentMethodType =
    | 'paypal'           // Global
    | 'stripe'           // Global
    | 'bank_transfer'    // Global - Wire/SWIFT
    | 'wise'             // Global - TransferWise
    | 'skrill'           // Global
    | 'payoneer'         // Global
    | 'crypto'           // Global - Cryptocurrency
    // India
    | 'gpay'             // Google Pay (India)
    | 'phonepe'          // PhonePe (India)
    | 'paytm'            // Paytm (India)
    | 'upi'              // UPI (India)
    | 'razorpay'         // Razorpay (India)
    // Southeast Asia
    | 'grabpay'          // GrabPay (SE Asia)
    | 'gcash'            // GCash (Philippines)
    | 'maya'             // Maya (Philippines)
    | 'dana'             // Dana (Indonesia)
    | 'ovo'              // OVO (Indonesia)
    | 'gopay'            // GoPay (Indonesia)
    // China
    | 'alipay'           // Alipay (China)
    | 'wechat_pay'       // WeChat Pay (China)
    // Europe
    | 'sepa'             // SEPA Bank Transfer (EU)
    | 'revolut'          // Revolut (EU)
    // Africa
    | 'mpesa'            // M-Pesa (Kenya/Africa)
    | 'flutterwave'      // Flutterwave (Africa)
    // Latin America
    | 'pix'              // PIX (Brazil)
    | 'mercadopago';     // MercadoPago (Latin America)

// Payment Details Structure
export interface PaymentDetails {
    // Bank Transfer / SEPA / Wire
    bankName?: string;
    accountNumber?: string;
    accountHolderName?: string;
    routingNumber?: string;
    swiftCode?: string;
    iban?: string;
    ifscCode?: string;          // India
    branchCode?: string;

    // Cryptocurrency
    cryptoWallet?: string;
    cryptoNetwork?: 'bitcoin' | 'ethereum' | 'usdt_trc20' | 'usdt_erc20' | 'usdc' | 'solana' | 'polygon';

    // UPI / Mobile Wallets (India)
    upiId?: string;             // example@upi
    phoneNumber?: string;       // For GPay, PhonePe, Paytm

    // International Wallets
    wiseEmail?: string;
    skrillEmail?: string;
    payoneerEmail?: string;

    // Regional Details
    pixKey?: string;            // Brazil PIX
    mercadopagoEmail?: string;  // MercadoPago
    mpesaPhone?: string;        // M-Pesa
    alipayId?: string;          // Alipay
    wechatId?: string;          // WeChat Pay
    grabpayPhone?: string;      // GrabPay
    gcashPhone?: string;        // GCash
    mayaPhone?: string;         // Maya
    danaPhone?: string;         // Dana
    ovoPhone?: string;          // OVO
    gopayPhone?: string;        // GoPay
}

// Payment Method Display Info
export interface PaymentMethodInfo {
    id: PaymentMethodType;
    name: string;
    icon: string;
    region: 'global' | 'india' | 'southeast_asia' | 'china' | 'europe' | 'africa' | 'latin_america';
    description: string;
    requiredFields: (keyof PaymentDetails | 'paymentEmail')[];
}

// All available payment methods with display info
export const PAYMENT_METHODS: PaymentMethodInfo[] = [
    // Global Methods
    { id: 'paypal', name: 'PayPal', icon: '💳', region: 'global', description: 'Send money worldwide', requiredFields: ['paymentEmail'] },
    { id: 'stripe', name: 'Stripe', icon: '💳', region: 'global', description: 'Card payments globally', requiredFields: ['paymentEmail'] },
    { id: 'bank_transfer', name: 'Bank Transfer (Wire)', icon: '🏦', region: 'global', description: 'Direct bank wire transfer', requiredFields: ['bankName', 'accountNumber', 'accountHolderName', 'swiftCode'] },
    { id: 'wise', name: 'Wise (TransferWise)', icon: '💸', region: 'global', description: 'Low-fee international transfers', requiredFields: ['wiseEmail'] },
    { id: 'skrill', name: 'Skrill', icon: '💰', region: 'global', description: 'Digital wallet', requiredFields: ['skrillEmail'] },
    { id: 'payoneer', name: 'Payoneer', icon: '💵', region: 'global', description: 'Cross-border payments', requiredFields: ['payoneerEmail'] },
    { id: 'crypto', name: 'Cryptocurrency', icon: '₿', region: 'global', description: 'Bitcoin, Ethereum, USDT', requiredFields: ['cryptoWallet', 'cryptoNetwork'] },

    // India
    { id: 'gpay', name: 'Google Pay', icon: '📱', region: 'india', description: 'UPI payments via GPay', requiredFields: ['phoneNumber', 'upiId'] },
    { id: 'phonepe', name: 'PhonePe', icon: '📱', region: 'india', description: 'UPI payments via PhonePe', requiredFields: ['phoneNumber'] },
    { id: 'paytm', name: 'Paytm', icon: '📱', region: 'india', description: 'Paytm wallet & UPI', requiredFields: ['phoneNumber'] },
    { id: 'upi', name: 'UPI Direct', icon: '🇮🇳', region: 'india', description: 'Direct UPI transfer', requiredFields: ['upiId'] },
    { id: 'razorpay', name: 'Razorpay', icon: '⚡', region: 'india', description: 'Razorpay payout', requiredFields: ['paymentEmail', 'upiId'] },

    // Southeast Asia
    { id: 'grabpay', name: 'GrabPay', icon: '🚗', region: 'southeast_asia', description: 'Grab wallet', requiredFields: ['grabpayPhone'] },
    { id: 'gcash', name: 'GCash', icon: '🇵🇭', region: 'southeast_asia', description: 'Philippines e-wallet', requiredFields: ['gcashPhone'] },
    { id: 'maya', name: 'Maya', icon: '🇵🇭', region: 'southeast_asia', description: 'Philippines digital bank', requiredFields: ['mayaPhone'] },
    { id: 'dana', name: 'Dana', icon: '🇮🇩', region: 'southeast_asia', description: 'Indonesia e-wallet', requiredFields: ['danaPhone'] },
    { id: 'ovo', name: 'OVO', icon: '🇮🇩', region: 'southeast_asia', description: 'Indonesia payment', requiredFields: ['ovoPhone'] },
    { id: 'gopay', name: 'GoPay', icon: '🇮🇩', region: 'southeast_asia', description: 'Gojek wallet', requiredFields: ['gopayPhone'] },

    // China
    { id: 'alipay', name: 'Alipay', icon: '🇨🇳', region: 'china', description: 'Alipay payments', requiredFields: ['alipayId'] },
    { id: 'wechat_pay', name: 'WeChat Pay', icon: '🇨🇳', region: 'china', description: 'WeChat payments', requiredFields: ['wechatId'] },

    // Europe
    { id: 'sepa', name: 'SEPA Transfer', icon: '🇪🇺', region: 'europe', description: 'EU bank transfer', requiredFields: ['iban', 'bankName', 'accountHolderName'] },
    { id: 'revolut', name: 'Revolut', icon: '🏦', region: 'europe', description: 'Digital banking', requiredFields: ['paymentEmail', 'phoneNumber'] },

    // Africa
    { id: 'mpesa', name: 'M-Pesa', icon: '🇰🇪', region: 'africa', description: 'Mobile money', requiredFields: ['mpesaPhone'] },
    { id: 'flutterwave', name: 'Flutterwave', icon: '🌍', region: 'africa', description: 'African payments', requiredFields: ['paymentEmail'] },

    // Latin America
    { id: 'pix', name: 'PIX', icon: '🇧🇷', region: 'latin_america', description: 'Brazil instant payment', requiredFields: ['pixKey'] },
    { id: 'mercadopago', name: 'MercadoPago', icon: '💛', region: 'latin_america', description: 'Latin America payments', requiredFields: ['mercadopagoEmail'] },
];



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
    paymentMethod: PaymentMethodType;
    paymentEmail?: string;
    paymentDetails?: PaymentDetails;

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
    paymentMethod: PaymentMethodType;
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
