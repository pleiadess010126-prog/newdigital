'use client';

import { useState, useEffect } from 'react';
import {
    Users,
    DollarSign,
    MousePointerClick,
    TrendingUp,
    Copy,
    Check,
    ChevronRight,
    Gift,
    CreditCard,
    FileText,
    Download,
    ArrowUpRight,
    Clock,
    CheckCircle,
    Search,
    Wallet,
    Target,
    Award,
    Share2,
    Link2,
    Image as ImageIcon,
    Mail,
    Video,
    LayoutTemplate,
    RefreshCw,
    Loader2,
    AlertTriangle,
    X,
    UserPlus,
    Settings
} from 'lucide-react';
import { useAffiliate } from '@/lib/affiliate/AffiliateContext';
import { useAuth } from '@/lib/auth/AuthContext';
import {
    mockAffiliatePromotions,
    mockAffiliateAssets,
    affiliateTiers,
    getTierInfo,
    getNextTierProgress
} from '@/lib/affiliateData';
import { PAYMENT_METHODS, PaymentMethodType, PaymentDetails } from '@/types/affiliate';

type TabType = 'overview' | 'referrals' | 'earnings' | 'payouts' | 'assets' | 'logs' | 'settings';

export default function AffiliateDashboard() {
    const { user } = useAuth();
    const {
        affiliate,
        referrals,
        transactions,
        payouts,
        isLoading,
        error,
        isAffiliate,
        fetchAffiliateData,
        createAffiliateAccount,
        requestPayout,
        copyReferralLink,
        copyReferralCode
    } = useAffiliate();

    const [activeTab, setActiveTab] = useState<TabType>('overview');
    const [copied, setCopied] = useState(false);
    const [copiedCode, setCopiedCode] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [logFilter, setLogFilter] = useState<string>('all');
    const [showPayoutModal, setShowPayoutModal] = useState(false);
    const [payoutAmount, setPayoutAmount] = useState('');
    const [payoutLoading, setPayoutLoading] = useState(false);
    const [payoutSuccess, setPayoutSuccess] = useState(false);
    const [showOnboardingModal, setShowOnboardingModal] = useState(false);
    const [onboardingStep, setOnboardingStep] = useState(1);
    const [selectedRegion, setSelectedRegion] = useState<string>('global');
    const [onboardingData, setOnboardingData] = useState<{
        paymentMethod: PaymentMethodType;
        paymentEmail: string;
        paymentDetails: PaymentDetails;
        acceptedTerms: boolean;
    }>({
        paymentMethod: 'paypal',
        paymentEmail: '',
        paymentDetails: {},
        acceptedTerms: false
    });

    // Use context affiliate or mock data for demo
    const currentAffiliate = affiliate || {
        id: 'demo_aff',
        userId: user?.id || 'demo',
        referralCode: 'DEMO2025',
        referralLink: 'https://digitalmeng.com/?ref=DEMO2025',
        status: 'active' as const,
        tier: 'gold' as const,
        createdAt: new Date(),
        commissionRate: 15,
        cookieDuration: 90,
        paymentMethod: 'paypal' as const,
        paymentEmail: 'demo@example.com',
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

    const tierInfo = getTierInfo(currentAffiliate.tier);
    const { nextTier, referralProgress, earningsProgress } = getNextTierProgress(
        currentAffiliate.tier,
        currentAffiliate.stats
    );

    const handleCopyLink = async () => {
        const success = await copyReferralLink();
        if (success) {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } else {
            // Fallback for demo
            navigator.clipboard.writeText(currentAffiliate.referralLink);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const handleCopyCode = async () => {
        const success = await copyReferralCode();
        if (success) {
            setCopiedCode(true);
            setTimeout(() => setCopiedCode(false), 2000);
        } else {
            // Fallback for demo
            navigator.clipboard.writeText(currentAffiliate.referralCode);
            setCopiedCode(true);
            setTimeout(() => setCopiedCode(false), 2000);
        }
    };

    const handleRequestPayout = async () => {
        const amount = parseFloat(payoutAmount);
        if (isNaN(amount) || amount < 50) {
            alert('Minimum payout amount is $50');
            return;
        }

        if (amount > currentAffiliate.stats.pendingEarnings) {
            alert('Insufficient pending balance');
            return;
        }

        setPayoutLoading(true);
        const success = await requestPayout(amount);
        setPayoutLoading(false);

        if (success) {
            setPayoutSuccess(true);
            setTimeout(() => {
                setShowPayoutModal(false);
                setPayoutSuccess(false);
                setPayoutAmount('');
            }, 2000);
        }
    };

    const handleCreateAffiliate = async () => {
        if (!onboardingData.acceptedTerms) {
            alert('Please accept the terms and conditions');
            return;
        }

        if (!onboardingData.paymentEmail) {
            alert('Please enter your payment email');
            return;
        }

        const success = await createAffiliateAccount({
            paymentMethod: onboardingData.paymentMethod,
            paymentEmail: onboardingData.paymentEmail
        });

        if (success) {
            setShowOnboardingModal(false);
            fetchAffiliateData();
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    };

    const formatDate = (date: Date) => {
        return new Intl.DateTimeFormat('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        }).format(new Date(date));
    };

    const formatDateTime = (date: Date) => {
        return new Intl.DateTimeFormat('en-US', {
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit'
        }).format(new Date(date));
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active':
            case 'approved':
            case 'completed':
            case 'paid':
                return 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20';
            case 'pending':
            case 'processing':
                return 'bg-amber-500/10 text-amber-600 border-amber-500/20';
            case 'churned':
            case 'cancelled':
            case 'rejected':
            case 'failed':
                return 'bg-red-500/10 text-red-600 border-red-500/20';
            default:
                return 'bg-slate-500/10 text-slate-600 border-slate-500/20';
        }
    };

    const getTransactionIcon = (type: string) => {
        switch (type) {
            case 'commission':
                return <DollarSign className="w-4 h-4" />;
            case 'payout':
                return <CreditCard className="w-4 h-4" />;
            case 'bonus':
                return <Gift className="w-4 h-4" />;
            case 'click':
                return <MousePointerClick className="w-4 h-4" />;
            case 'signup':
                return <Users className="w-4 h-4" />;
            default:
                return <FileText className="w-4 h-4" />;
        }
    };

    const getLogIcon = (action: string) => {
        switch (action) {
            case 'click':
                return <MousePointerClick className="w-4 h-4" />;
            case 'signup':
                return <Users className="w-4 h-4" />;
            case 'conversion':
                return <Target className="w-4 h-4" />;
            case 'commission_earned':
                return <DollarSign className="w-4 h-4" />;
            case 'payout_requested':
            case 'payout_completed':
                return <Wallet className="w-4 h-4" />;
            case 'tier_upgrade':
            case 'tier_downgrade':
                return <Award className="w-4 h-4" />;
            case 'link_copied':
                return <Link2 className="w-4 h-4" />;
            case 'asset_downloaded':
                return <Download className="w-4 h-4" />;
            case 'promotion_qualified':
                return <Gift className="w-4 h-4" />;
            default:
                return <Clock className="w-4 h-4" />;
        }
    };

    const getAssetIcon = (type: string) => {
        switch (type) {
            case 'banner':
                return <ImageIcon className="w-5 h-5" />;
            case 'email_template':
                return <Mail className="w-5 h-5" />;
            case 'social_post':
                return <Share2 className="w-5 h-5" />;
            case 'video':
                return <Video className="w-5 h-5" />;
            case 'landing_page':
                return <LayoutTemplate className="w-5 h-5" />;
            default:
                return <FileText className="w-5 h-5" />;
        }
    };

    // Mock logs for demo
    const mockLogs = [
        { id: '1', action: 'click', details: '15 new clicks from referral link', createdAt: new Date() },
        { id: '2', action: 'signup', details: 'New user signed up: john@example.com', createdAt: new Date(Date.now() - 86400000) },
        { id: '3', action: 'commission_earned', details: 'Commission earned: $24.00', createdAt: new Date(Date.now() - 172800000) },
    ];

    const filteredLogs = mockLogs.filter(log => {
        if (logFilter === 'all') return true;
        return log.action === logFilter;
    });

    // Use context referrals or mock data
    const displayReferrals = referrals.length > 0 ? referrals : [
        { id: 'ref_1', referredUserEmail: 'john@example.com', referredUserName: 'John D.', status: 'active', plan: 'pro', signupDate: new Date(), totalSpent: 79.99, commissionEarned: 24.00, isRecurring: true },
        { id: 'ref_2', referredUserEmail: 'sarah@example.com', referredUserName: 'Sarah M.', status: 'active', plan: 'enterprise', signupDate: new Date(Date.now() - 86400000), totalSpent: 299.99, commissionEarned: 90.00, isRecurring: true },
    ];

    // Use context transactions or mock data
    const displayTransactions = transactions.length > 0 ? transactions : [
        { id: 'txn_1', type: 'commission', amount: 90.00, status: 'approved', description: 'Commission for Enterprise plan', createdAt: new Date() },
        { id: 'txn_2', type: 'commission', amount: 24.00, status: 'approved', description: 'Commission for Pro plan', createdAt: new Date(Date.now() - 86400000) },
        { id: 'txn_3', type: 'bonus', amount: 100.00, status: 'approved', description: 'Holiday Promotion Bonus', createdAt: new Date(Date.now() - 172800000) },
    ];

    // Use context payouts or mock data
    const displayPayouts = payouts.length > 0 ? payouts : [
        { id: 'pay_1', amount: 500.00, status: 'completed', paymentMethod: 'paypal', paymentReference: 'PP-12345678', requestedAt: new Date(Date.now() - 604800000), processedAt: new Date(Date.now() - 518400000) },
        { id: 'pay_2', amount: 750.00, status: 'completed', paymentMethod: 'paypal', paymentReference: 'PP-87654321', requestedAt: new Date(Date.now() - 2592000000), processedAt: new Date(Date.now() - 2505600000) },
    ];

    const tabs = [
        { id: 'overview', label: 'Overview', icon: TrendingUp },
        { id: 'referrals', label: 'Referrals', icon: Users },
        { id: 'earnings', label: 'Earnings', icon: DollarSign },
        { id: 'payouts', label: 'Payouts', icon: Wallet },
        { id: 'assets', label: 'Marketing Assets', icon: ImageIcon },
        { id: 'logs', label: 'Activity Log', icon: FileText },
        { id: 'settings', label: 'Payment Settings', icon: Settings }
    ];

    // Loading state
    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-violet-50/30 flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-12 h-12 text-violet-600 animate-spin" />
                    <p className="text-slate-500">Loading affiliate dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-violet-50/30 p-6">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Error Banner */}
                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
                        <AlertTriangle className="w-5 h-5 text-red-600" />
                        <p className="text-red-700">{error}</p>
                    </div>
                )}

                {/* Header */}
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-800">Affiliate Program</h1>
                        <p className="text-slate-500 mt-1">Earn commissions by referring new users to DigitalMEng</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className={`px-4 py-2 rounded-xl flex items-center gap-2 border`} style={{
                            backgroundColor: `${tierInfo?.color}15`,
                            borderColor: `${tierInfo?.color}40`,
                            color: tierInfo?.color
                        }}>
                            <span className="text-lg">{tierInfo?.icon}</span>
                            <span className="font-semibold">{tierInfo?.displayName}</span>
                        </div>
                        <button
                            onClick={() => setShowPayoutModal(true)}
                            disabled={currentAffiliate.stats.pendingEarnings < 50}
                            className="px-4 py-2 bg-violet-600 text-white rounded-xl font-semibold hover:bg-violet-500 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Gift className="w-4 h-4" />
                            Request Payout
                        </button>
                    </div>
                </div>

                {/* Referral Link Card */}
                <div className="bg-gradient-to-r from-violet-600 to-fuchsia-600 rounded-2xl p-6 text-white">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                        <div>
                            <h2 className="text-lg font-semibold opacity-90">Your Referral Link</h2>
                            <p className="text-white/70 text-sm mt-1">Share this link to earn {currentAffiliate.commissionRate}% commission on every sale</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="bg-white/10 backdrop-blur-sm rounded-xl px-4 py-3 flex items-center gap-3 border border-white/20">
                                <Link2 className="w-5 h-5 text-white/70" />
                                <span className="font-mono text-sm">{currentAffiliate.referralLink}</span>
                            </div>
                            <button
                                onClick={handleCopyLink}
                                className="px-4 py-3 bg-white text-violet-600 rounded-xl font-semibold hover:bg-white/90 transition-colors flex items-center gap-2"
                            >
                                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                {copied ? 'Copied!' : 'Copy'}
                            </button>
                        </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-white/20 flex flex-wrap items-center gap-6">
                        <div className="flex items-center gap-2">
                            <span className="text-white/70 text-sm">Referral Code:</span>
                            <code className="bg-white/10 px-3 py-1 rounded-lg font-mono text-sm">{currentAffiliate.referralCode}</code>
                            <button onClick={handleCopyCode} className="text-white/70 hover:text-white">
                                {copiedCode ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                            </button>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-white/70 text-sm">Cookie Duration:</span>
                            <span className="font-semibold">{currentAffiliate.cookieDuration} days</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-white/70 text-sm">Commission Rate:</span>
                            <span className="font-semibold">{currentAffiliate.commissionRate}%</span>
                        </div>
                    </div>
                </div>

                {/* Tab Navigation */}
                <div className="bg-white rounded-2xl border border-slate-200 p-2">
                    <div className="flex flex-wrap gap-1">
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as TabType)}
                                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all ${activeTab === tab.id
                                    ? 'bg-violet-600 text-white'
                                    : 'text-slate-600 hover:bg-slate-100'
                                    }`}
                            >
                                <tab.icon className="w-4 h-4" />
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Tab Content */}
                {activeTab === 'overview' && (
                    <div className="space-y-6">
                        {/* Stats Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="bg-white rounded-2xl border border-slate-200 p-5">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="w-10 h-10 bg-violet-100 rounded-xl flex items-center justify-center">
                                        <MousePointerClick className="w-5 h-5 text-violet-600" />
                                    </div>
                                    <span className="text-emerald-600 text-sm font-medium flex items-center gap-1">
                                        <ArrowUpRight className="w-3 h-3" />
                                        +12.5%
                                    </span>
                                </div>
                                <div className="text-2xl font-bold text-slate-800">{currentAffiliate.stats.totalClicks.toLocaleString()}</div>
                                <div className="text-slate-500 text-sm">Total Clicks</div>
                            </div>

                            <div className="bg-white rounded-2xl border border-slate-200 p-5">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                                        <Users className="w-5 h-5 text-blue-600" />
                                    </div>
                                    <span className="text-emerald-600 text-sm font-medium flex items-center gap-1">
                                        <ArrowUpRight className="w-3 h-3" />
                                        +8.3%
                                    </span>
                                </div>
                                <div className="text-2xl font-bold text-slate-800">{currentAffiliate.stats.totalSignups}</div>
                                <div className="text-slate-500 text-sm">Total Signups</div>
                            </div>

                            <div className="bg-white rounded-2xl border border-slate-200 p-5">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                                        <DollarSign className="w-5 h-5 text-emerald-600" />
                                    </div>
                                    <span className="text-emerald-600 text-sm font-medium flex items-center gap-1">
                                        <ArrowUpRight className="w-3 h-3" />
                                        +23.1%
                                    </span>
                                </div>
                                <div className="text-2xl font-bold text-slate-800">{formatCurrency(currentAffiliate.stats.totalEarnings)}</div>
                                <div className="text-slate-500 text-sm">Total Earnings</div>
                            </div>

                            <div className="bg-white rounded-2xl border border-slate-200 p-5">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                                        <Target className="w-5 h-5 text-amber-600" />
                                    </div>
                                </div>
                                <div className="text-2xl font-bold text-slate-800">{currentAffiliate.stats.conversionRate}%</div>
                                <div className="text-slate-500 text-sm">Conversion Rate</div>
                            </div>
                        </div>

                        {/* Two Column Layout */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Tier Progress */}
                            <div className="bg-white rounded-2xl border border-slate-200 p-6">
                                <h3 className="text-lg font-semibold text-slate-800 mb-4">Tier Progress</h3>
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl" style={{ backgroundColor: `${tierInfo?.color}20` }}>
                                        {tierInfo?.icon}
                                    </div>
                                    <div>
                                        <div className="text-xl font-bold text-slate-800">{tierInfo?.displayName}</div>
                                        <div className="text-slate-500 text-sm">{currentAffiliate.commissionRate}% commission rate</div>
                                    </div>
                                </div>

                                {nextTier && (
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-slate-600">Progress to {nextTier.displayName}</span>
                                            <span className="text-violet-600 font-medium">{Math.round(Math.min(referralProgress, earningsProgress))}%</span>
                                        </div>
                                        <div>
                                            <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                                                <span>Referrals: {currentAffiliate.stats.paidConversions}/{nextTier.minReferrals}</span>
                                                <span>{Math.round(referralProgress)}%</span>
                                            </div>
                                            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                                <div className="h-full bg-violet-500 rounded-full transition-all" style={{ width: `${referralProgress}%` }} />
                                            </div>
                                        </div>
                                        <div>
                                            <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                                                <span>Earnings: {formatCurrency(currentAffiliate.stats.totalEarnings)}/{formatCurrency(nextTier.minEarnings)}</span>
                                                <span>{Math.round(earningsProgress)}%</span>
                                            </div>
                                            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                                <div className="h-full bg-fuchsia-500 rounded-full transition-all" style={{ width: `${earningsProgress}%` }} />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div className="mt-6 pt-4 border-t border-slate-100">
                                    <h4 className="text-sm font-semibold text-slate-700 mb-2">Your Benefits</h4>
                                    <ul className="space-y-2">
                                        {tierInfo?.benefits.map((benefit, i) => (
                                            <li key={i} className="flex items-center gap-2 text-sm text-slate-600">
                                                <CheckCircle className="w-4 h-4 text-emerald-500" />
                                                {benefit}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>

                            {/* Active Promotions */}
                            <div className="bg-white rounded-2xl border border-slate-200 p-6">
                                <h3 className="text-lg font-semibold text-slate-800 mb-4">Active Promotions</h3>
                                <div className="space-y-4">
                                    {mockAffiliatePromotions.filter(p => p.isActive).map(promo => (
                                        <div key={promo.id} className="p-4 rounded-xl bg-gradient-to-r from-violet-50 to-fuchsia-50 border border-violet-100">
                                            <div className="flex items-start justify-between mb-2">
                                                <div className="flex items-center gap-2">
                                                    <Gift className="w-5 h-5 text-violet-600" />
                                                    <h4 className="font-semibold text-slate-800">{promo.name}</h4>
                                                </div>
                                                <span className="text-xs px-2 py-1 bg-violet-100 text-violet-700 rounded-full font-medium">
                                                    {promo.type.replace('_', ' ')}
                                                </span>
                                            </div>
                                            <p className="text-sm text-slate-600 mb-3">{promo.description}</p>
                                            <div className="flex items-center justify-between text-xs text-slate-500">
                                                <span>Ends: {formatDate(promo.endDate)}</span>
                                                <span className="text-violet-600 font-medium">{promo.reward.description}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Recent Activity */}
                        <div className="bg-white rounded-2xl border border-slate-200 p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold text-slate-800">Recent Activity</h3>
                                <button
                                    onClick={() => setActiveTab('logs')}
                                    className="text-violet-600 text-sm font-medium flex items-center gap-1 hover:text-violet-700"
                                >
                                    View All <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                            <div className="space-y-3">
                                {filteredLogs.slice(0, 5).map(log => (
                                    <div key={log.id} className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-50 transition-colors">
                                        <div className="w-9 h-9 bg-slate-100 rounded-lg flex items-center justify-center text-slate-600">
                                            {getLogIcon(log.action)}
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-sm text-slate-700">{log.details}</p>
                                            <span className="text-xs text-slate-400">{formatDateTime(log.createdAt)}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'referrals' && (
                    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                        <div className="p-6 border-b border-slate-200">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-semibold text-slate-800">Your Referrals</h3>
                                <div className="flex items-center gap-3">
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                        <input
                                            type="text"
                                            placeholder="Search referrals..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="pl-10 pr-4 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="bg-slate-50 text-left">
                                        <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">User</th>
                                        <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Plan</th>
                                        <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Signup Date</th>
                                        <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Spent</th>
                                        <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Commission</th>
                                        <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Recurring</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {displayReferrals.map(referral => (
                                        <tr key={referral.id} className="hover:bg-slate-50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div>
                                                    <div className="font-medium text-slate-800">{referral.referredUserName}</div>
                                                    <div className="text-sm text-slate-500">{referral.referredUserEmail}</div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2.5 py-1 rounded-full text-xs font-medium border capitalize ${getStatusColor(referral.status)}`}>
                                                    {referral.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="capitalize text-slate-700">{referral.plan || 'Free'}</span>
                                            </td>
                                            <td className="px-6 py-4 text-slate-600 text-sm">
                                                {formatDate(referral.signupDate)}
                                            </td>
                                            <td className="px-6 py-4 font-medium text-slate-800">
                                                {formatCurrency(referral.totalSpent)}
                                            </td>
                                            <td className="px-6 py-4 font-semibold text-emerald-600">
                                                {formatCurrency(referral.commissionEarned)}
                                            </td>
                                            <td className="px-6 py-4">
                                                {referral.isRecurring ? (
                                                    <span className="flex items-center gap-1 text-emerald-600">
                                                        <RefreshCw className="w-4 h-4" /> Yes
                                                    </span>
                                                ) : (
                                                    <span className="text-slate-400">No</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {activeTab === 'earnings' && (
                    <div className="space-y-6">
                        {/* Earnings Summary */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="bg-white rounded-2xl border border-slate-200 p-5">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                                        <DollarSign className="w-5 h-5 text-emerald-600" />
                                    </div>
                                    <span className="text-slate-600 text-sm">Total Earnings</span>
                                </div>
                                <div className="text-3xl font-bold text-slate-800">{formatCurrency(currentAffiliate.stats.totalEarnings)}</div>
                            </div>
                            <div className="bg-white rounded-2xl border border-slate-200 p-5">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                                        <Clock className="w-5 h-5 text-amber-600" />
                                    </div>
                                    <span className="text-slate-600 text-sm">Pending</span>
                                </div>
                                <div className="text-3xl font-bold text-amber-600">{formatCurrency(currentAffiliate.stats.pendingEarnings)}</div>
                            </div>
                            <div className="bg-white rounded-2xl border border-slate-200 p-5">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                                        <CheckCircle className="w-5 h-5 text-blue-600" />
                                    </div>
                                    <span className="text-slate-600 text-sm">Paid Out</span>
                                </div>
                                <div className="text-3xl font-bold text-blue-600">{formatCurrency(currentAffiliate.stats.paidEarnings)}</div>
                            </div>
                        </div>

                        {/* Transactions Table */}
                        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                            <div className="p-6 border-b border-slate-200">
                                <h3 className="text-lg font-semibold text-slate-800">Transaction History</h3>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="bg-slate-50 text-left">
                                            <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Type</th>
                                            <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Description</th>
                                            <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Amount</th>
                                            <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                                            <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Date</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {displayTransactions.map(txn => (
                                            <tr key={txn.id} className="hover:bg-slate-50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center text-slate-600">
                                                            {getTransactionIcon(txn.type)}
                                                        </div>
                                                        <span className="capitalize text-slate-700">{txn.type}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-slate-600 text-sm max-w-xs truncate">
                                                    {txn.description}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`font-semibold ${txn.amount >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                                                        {txn.amount >= 0 ? '+' : ''}{formatCurrency(txn.amount)}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium border capitalize ${getStatusColor(txn.status)}`}>
                                                        {txn.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-slate-500 text-sm">
                                                    {formatDateTime(txn.createdAt)}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'payouts' && (
                    <div className="space-y-6">
                        {/* Payout Summary */}
                        <div className="bg-gradient-to-r from-violet-600 to-fuchsia-600 rounded-2xl p-6 text-white">
                            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                                <div>
                                    <h3 className="text-lg font-semibold opacity-90">Available for Payout</h3>
                                    <div className="text-4xl font-bold mt-2">{formatCurrency(currentAffiliate.stats.pendingEarnings)}</div>
                                    <p className="text-white/70 text-sm mt-1">Minimum payout: $50.00</p>
                                </div>
                                <div className="flex flex-col gap-2">
                                    <button
                                        onClick={() => setShowPayoutModal(true)}
                                        disabled={currentAffiliate.stats.pendingEarnings < 50}
                                        className="px-6 py-3 bg-white text-violet-600 rounded-xl font-semibold hover:bg-white/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Request Payout
                                    </button>
                                    <span className="text-xs text-white/70 text-center">
                                        Payment method: {currentAffiliate.paymentMethod?.replace('_', ' ')}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Payout History */}
                        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                            <div className="p-6 border-b border-slate-200">
                                <h3 className="text-lg font-semibold text-slate-800">Payout History</h3>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="bg-slate-50 text-left">
                                            <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">ID</th>
                                            <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Amount</th>
                                            <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Method</th>
                                            <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                                            <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Requested</th>
                                            <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Processed</th>
                                            <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Reference</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {displayPayouts.map(payout => (
                                            <tr key={payout.id} className="hover:bg-slate-50 transition-colors">
                                                <td className="px-6 py-4 font-mono text-sm text-slate-600">{payout.id}</td>
                                                <td className="px-6 py-4 font-semibold text-slate-800">{formatCurrency(payout.amount)}</td>
                                                <td className="px-6 py-4 text-slate-600 capitalize">{payout.paymentMethod?.replace('_', ' ')}</td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium border capitalize ${getStatusColor(payout.status)}`}>
                                                        {payout.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-slate-500 text-sm">{formatDate(payout.requestedAt)}</td>
                                                <td className="px-6 py-4 text-slate-500 text-sm">
                                                    {payout.processedAt ? formatDate(payout.processedAt) : '-'}
                                                </td>
                                                <td className="px-6 py-4 font-mono text-sm text-violet-600">
                                                    {payout.paymentReference || '-'}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'assets' && (
                    <div className="space-y-6">
                        <div className="bg-white rounded-2xl border border-slate-200 p-6">
                            <h3 className="text-lg font-semibold text-slate-800 mb-4">Marketing Assets</h3>
                            <p className="text-slate-600 mb-6">Download ready-to-use marketing materials to promote DigitalMEng. All assets include your referral link.</p>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {mockAffiliateAssets.map(asset => (
                                    <div key={asset.id} className="border border-slate-200 rounded-xl overflow-hidden hover:border-violet-300 transition-colors group">
                                        <div className="h-32 bg-gradient-to-br from-slate-100 to-slate-50 flex items-center justify-center">
                                            <div className="w-16 h-16 bg-white rounded-xl shadow-sm flex items-center justify-center text-slate-400 group-hover:text-violet-500 transition-colors">
                                                {getAssetIcon(asset.type)}
                                            </div>
                                        </div>
                                        <div className="p-4">
                                            <h4 className="font-semibold text-slate-800">{asset.name}</h4>
                                            <div className="flex items-center justify-between mt-2">
                                                <span className="text-xs text-slate-500">{asset.category}</span>
                                                {asset.dimensions && (
                                                    <span className="text-xs text-slate-400">{asset.dimensions.width}x{asset.dimensions.height}</span>
                                                )}
                                            </div>
                                            <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100">
                                                <span className="text-xs text-slate-400">{asset.downloads} downloads</span>
                                                <button className="flex items-center gap-1 text-violet-600 text-sm font-medium hover:text-violet-700">
                                                    <Download className="w-4 h-4" />
                                                    Download
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'logs' && (
                    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                        <div className="p-6 border-b border-slate-200">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-semibold text-slate-800">Activity Log</h3>
                                <select
                                    value={logFilter}
                                    onChange={(e) => setLogFilter(e.target.value)}
                                    className="px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                                >
                                    <option value="all">All Activities</option>
                                    <option value="click">Clicks</option>
                                    <option value="signup">Signups</option>
                                    <option value="conversion">Conversions</option>
                                    <option value="commission_earned">Commissions</option>
                                    <option value="payout_completed">Payouts</option>
                                </select>
                            </div>
                        </div>
                        <div className="divide-y divide-slate-100">
                            {filteredLogs.map(log => (
                                <div key={log.id} className="flex items-start gap-4 p-4 hover:bg-slate-50 transition-colors">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${log.action.includes('commission') || log.action.includes('payout')
                                        ? 'bg-emerald-100 text-emerald-600'
                                        : log.action.includes('tier')
                                            ? 'bg-violet-100 text-violet-600'
                                            : 'bg-slate-100 text-slate-600'
                                        }`}>
                                        {getLogIcon(log.action)}
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-slate-800">{log.details}</p>
                                        <div className="flex items-center gap-3 mt-1">
                                            <span className="text-xs text-slate-400">{formatDateTime(log.createdAt)}</span>
                                            <span className="text-xs px-2 py-0.5 bg-slate-100 text-slate-500 rounded capitalize">
                                                {log.action.replace(/_/g, ' ')}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'settings' && (
                    <div className="space-y-6">
                        {/* Current Payment Method */}
                        <div className="bg-white rounded-2xl border border-slate-200 p-6">
                            <h3 className="text-lg font-semibold text-slate-800 mb-4">Current Payment Method</h3>
                            <div className="p-4 bg-gradient-to-r from-violet-50 to-fuchsia-50 rounded-xl border border-violet-100">
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 bg-white rounded-xl flex items-center justify-center shadow-sm">
                                        <span className="text-3xl">
                                            {PAYMENT_METHODS.find(pm => pm.id === currentAffiliate.paymentMethod)?.icon || '💳'}
                                        </span>
                                    </div>
                                    <div>
                                        <div className="font-semibold text-slate-800 text-lg">
                                            {PAYMENT_METHODS.find(pm => pm.id === currentAffiliate.paymentMethod)?.name || currentAffiliate.paymentMethod?.replace('_', ' ')}
                                        </div>
                                        {currentAffiliate.paymentEmail && (
                                            <div className="text-slate-600">{currentAffiliate.paymentEmail}</div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Update Payment Method */}
                        <div className="bg-white rounded-2xl border border-slate-200 p-6">
                            <h3 className="text-lg font-semibold text-slate-800 mb-4">Update Payment Method</h3>

                            {/* Region Selector */}
                            <div className="mb-4">
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Select Region</label>
                                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
                                    {[
                                        { id: 'global', label: '🌍 Global' },
                                        { id: 'india', label: '🇮🇳 India' },
                                        { id: 'southeast_asia', label: '🌏 SE Asia' },
                                        { id: 'china', label: '🇨🇳 China' },
                                        { id: 'europe', label: '🇪🇺 Europe' },
                                        { id: 'africa', label: '🌍 Africa' },
                                        { id: 'latin_america', label: '🌎 LatAm' },
                                    ].map(region => (
                                        <button
                                            key={region.id}
                                            type="button"
                                            onClick={() => setSelectedRegion(region.id)}
                                            className={`p-2 rounded-lg border-2 text-center text-sm transition-all ${selectedRegion === region.id
                                                    ? 'border-violet-500 bg-violet-50 font-medium'
                                                    : 'border-slate-200 hover:border-violet-300'
                                                }`}
                                        >
                                            {region.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Payment Methods Grid */}
                            <div className="mb-4">
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Available Payment Methods</label>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-64 overflow-y-auto p-1">
                                    {PAYMENT_METHODS
                                        .filter(pm => pm.region === selectedRegion || pm.region === 'global')
                                        .map(method => (
                                            <button
                                                key={method.id}
                                                type="button"
                                                onClick={() => setOnboardingData({
                                                    ...onboardingData,
                                                    paymentMethod: method.id,
                                                    paymentEmail: '',
                                                    paymentDetails: {}
                                                })}
                                                className={`p-4 rounded-xl border-2 text-left transition-all flex items-center gap-3 ${onboardingData.paymentMethod === method.id
                                                        ? 'border-violet-500 bg-violet-50 shadow-md'
                                                        : 'border-slate-200 hover:border-violet-300 hover:bg-slate-50'
                                                    }`}
                                            >
                                                <span className="text-2xl">{method.icon}</span>
                                                <div>
                                                    <div className="font-medium text-slate-800">{method.name}</div>
                                                    <div className="text-xs text-slate-500">{method.description}</div>
                                                </div>
                                            </button>
                                        ))}
                                </div>
                            </div>

                            {/* Selected Payment Method Info */}
                            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 mb-4">
                                <div className="flex items-center gap-3 mb-3">
                                    <span className="text-2xl">
                                        {PAYMENT_METHODS.find(pm => pm.id === onboardingData.paymentMethod)?.icon}
                                    </span>
                                    <div>
                                        <div className="font-semibold text-slate-800">
                                            {PAYMENT_METHODS.find(pm => pm.id === onboardingData.paymentMethod)?.name}
                                        </div>
                                        <div className="text-xs text-slate-500">
                                            {PAYMENT_METHODS.find(pm => pm.id === onboardingData.paymentMethod)?.description}
                                        </div>
                                    </div>
                                </div>

                                {/* Dynamic Form Fields */}
                                <div className="space-y-3">
                                    {/* Email-based methods */}
                                    {['paypal', 'stripe', 'flutterwave', 'razorpay'].includes(onboardingData.paymentMethod) && (
                                        <input
                                            type="email"
                                            value={onboardingData.paymentEmail}
                                            onChange={(e) => setOnboardingData({ ...onboardingData, paymentEmail: e.target.value })}
                                            placeholder="Payment Email"
                                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500 bg-white"
                                        />
                                    )}

                                    {/* India - UPI */}
                                    {['gpay', 'phonepe', 'paytm', 'upi'].includes(onboardingData.paymentMethod) && (
                                        <>
                                            <input
                                                type="text"
                                                value={onboardingData.paymentDetails.upiId || ''}
                                                onChange={(e) => setOnboardingData({
                                                    ...onboardingData,
                                                    paymentDetails: { ...onboardingData.paymentDetails, upiId: e.target.value }
                                                })}
                                                placeholder="UPI ID (e.g., name@upi)"
                                                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500 bg-white"
                                            />
                                            {['gpay', 'phonepe', 'paytm'].includes(onboardingData.paymentMethod) && (
                                                <input
                                                    type="tel"
                                                    value={onboardingData.paymentDetails.phoneNumber || ''}
                                                    onChange={(e) => setOnboardingData({
                                                        ...onboardingData,
                                                        paymentDetails: { ...onboardingData.paymentDetails, phoneNumber: e.target.value }
                                                    })}
                                                    placeholder="Phone Number"
                                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500 bg-white"
                                                />
                                            )}
                                        </>
                                    )}

                                    {/* Bank Transfer */}
                                    {onboardingData.paymentMethod === 'bank_transfer' && (
                                        <div className="grid grid-cols-2 gap-3">
                                            <input
                                                type="text"
                                                value={onboardingData.paymentDetails.accountHolderName || ''}
                                                onChange={(e) => setOnboardingData({
                                                    ...onboardingData,
                                                    paymentDetails: { ...onboardingData.paymentDetails, accountHolderName: e.target.value }
                                                })}
                                                placeholder="Account Holder Name"
                                                className="col-span-2 px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500 bg-white"
                                            />
                                            <input
                                                type="text"
                                                value={onboardingData.paymentDetails.bankName || ''}
                                                onChange={(e) => setOnboardingData({
                                                    ...onboardingData,
                                                    paymentDetails: { ...onboardingData.paymentDetails, bankName: e.target.value }
                                                })}
                                                placeholder="Bank Name"
                                                className="px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500 bg-white"
                                            />
                                            <input
                                                type="text"
                                                value={onboardingData.paymentDetails.accountNumber || ''}
                                                onChange={(e) => setOnboardingData({
                                                    ...onboardingData,
                                                    paymentDetails: { ...onboardingData.paymentDetails, accountNumber: e.target.value }
                                                })}
                                                placeholder="Account Number"
                                                className="px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500 bg-white"
                                            />
                                            <input
                                                type="text"
                                                value={onboardingData.paymentDetails.swiftCode || ''}
                                                onChange={(e) => setOnboardingData({
                                                    ...onboardingData,
                                                    paymentDetails: { ...onboardingData.paymentDetails, swiftCode: e.target.value }
                                                })}
                                                placeholder="SWIFT Code"
                                                className="col-span-2 px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500 bg-white"
                                            />
                                        </div>
                                    )}

                                    {/* Crypto */}
                                    {onboardingData.paymentMethod === 'crypto' && (
                                        <>
                                            <select
                                                value={onboardingData.paymentDetails.cryptoNetwork || ''}
                                                onChange={(e) => setOnboardingData({
                                                    ...onboardingData,
                                                    paymentDetails: {
                                                        ...onboardingData.paymentDetails,
                                                        cryptoNetwork: e.target.value as PaymentDetails['cryptoNetwork']
                                                    }
                                                })}
                                                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500 bg-white"
                                            >
                                                <option value="">Select Network</option>
                                                <option value="bitcoin">Bitcoin (BTC)</option>
                                                <option value="ethereum">Ethereum (ETH)</option>
                                                <option value="usdt_trc20">USDT (TRC20)</option>
                                                <option value="usdt_erc20">USDT (ERC20)</option>
                                                <option value="usdc">USDC</option>
                                                <option value="solana">Solana</option>
                                                <option value="polygon">Polygon</option>
                                            </select>
                                            <input
                                                type="text"
                                                value={onboardingData.paymentDetails.cryptoWallet || ''}
                                                onChange={(e) => setOnboardingData({
                                                    ...onboardingData,
                                                    paymentDetails: { ...onboardingData.paymentDetails, cryptoWallet: e.target.value }
                                                })}
                                                placeholder="Wallet Address"
                                                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500 bg-white font-mono text-sm"
                                            />
                                        </>
                                    )}

                                    {/* Wise, Skrill, Payoneer */}
                                    {onboardingData.paymentMethod === 'wise' && (
                                        <input
                                            type="email"
                                            value={onboardingData.paymentDetails.wiseEmail || ''}
                                            onChange={(e) => setOnboardingData({
                                                ...onboardingData,
                                                paymentDetails: { ...onboardingData.paymentDetails, wiseEmail: e.target.value }
                                            })}
                                            placeholder="Wise Email"
                                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500 bg-white"
                                        />
                                    )}
                                    {onboardingData.paymentMethod === 'skrill' && (
                                        <input
                                            type="email"
                                            value={onboardingData.paymentDetails.skrillEmail || ''}
                                            onChange={(e) => setOnboardingData({
                                                ...onboardingData,
                                                paymentDetails: { ...onboardingData.paymentDetails, skrillEmail: e.target.value }
                                            })}
                                            placeholder="Skrill Email"
                                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500 bg-white"
                                        />
                                    )}
                                    {onboardingData.paymentMethod === 'payoneer' && (
                                        <input
                                            type="email"
                                            value={onboardingData.paymentDetails.payoneerEmail || ''}
                                            onChange={(e) => setOnboardingData({
                                                ...onboardingData,
                                                paymentDetails: { ...onboardingData.paymentDetails, payoneerEmail: e.target.value }
                                            })}
                                            placeholder="Payoneer Email"
                                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500 bg-white"
                                        />
                                    )}

                                    {/* SEPA */}
                                    {onboardingData.paymentMethod === 'sepa' && (
                                        <div className="grid grid-cols-2 gap-3">
                                            <input
                                                type="text"
                                                value={onboardingData.paymentDetails.accountHolderName || ''}
                                                onChange={(e) => setOnboardingData({
                                                    ...onboardingData,
                                                    paymentDetails: { ...onboardingData.paymentDetails, accountHolderName: e.target.value }
                                                })}
                                                placeholder="Account Holder Name"
                                                className="col-span-2 px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500 bg-white"
                                            />
                                            <input
                                                type="text"
                                                value={onboardingData.paymentDetails.iban || ''}
                                                onChange={(e) => setOnboardingData({
                                                    ...onboardingData,
                                                    paymentDetails: { ...onboardingData.paymentDetails, iban: e.target.value }
                                                })}
                                                placeholder="IBAN"
                                                className="col-span-2 px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500 bg-white"
                                            />
                                        </div>
                                    )}

                                    {/* PIX (Brazil) */}
                                    {onboardingData.paymentMethod === 'pix' && (
                                        <input
                                            type="text"
                                            value={onboardingData.paymentDetails.pixKey || ''}
                                            onChange={(e) => setOnboardingData({
                                                ...onboardingData,
                                                paymentDetails: { ...onboardingData.paymentDetails, pixKey: e.target.value }
                                            })}
                                            placeholder="PIX Key (CPF, Email, Phone, or Random Key)"
                                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500 bg-white"
                                        />
                                    )}

                                    {/* M-Pesa */}
                                    {onboardingData.paymentMethod === 'mpesa' && (
                                        <input
                                            type="tel"
                                            value={onboardingData.paymentDetails.mpesaPhone || ''}
                                            onChange={(e) => setOnboardingData({
                                                ...onboardingData,
                                                paymentDetails: { ...onboardingData.paymentDetails, mpesaPhone: e.target.value }
                                            })}
                                            placeholder="M-Pesa Phone Number"
                                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500 bg-white"
                                        />
                                    )}

                                    {/* SE Asia Wallets */}
                                    {onboardingData.paymentMethod === 'grabpay' && (
                                        <input type="tel" value={onboardingData.paymentDetails.grabpayPhone || ''} onChange={(e) => setOnboardingData({ ...onboardingData, paymentDetails: { ...onboardingData.paymentDetails, grabpayPhone: e.target.value } })} placeholder="GrabPay Phone Number" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500 bg-white" />
                                    )}
                                    {onboardingData.paymentMethod === 'gcash' && (
                                        <input type="tel" value={onboardingData.paymentDetails.gcashPhone || ''} onChange={(e) => setOnboardingData({ ...onboardingData, paymentDetails: { ...onboardingData.paymentDetails, gcashPhone: e.target.value } })} placeholder="GCash Phone Number" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500 bg-white" />
                                    )}
                                    {onboardingData.paymentMethod === 'maya' && (
                                        <input type="tel" value={onboardingData.paymentDetails.mayaPhone || ''} onChange={(e) => setOnboardingData({ ...onboardingData, paymentDetails: { ...onboardingData.paymentDetails, mayaPhone: e.target.value } })} placeholder="Maya Phone Number" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500 bg-white" />
                                    )}
                                    {onboardingData.paymentMethod === 'dana' && (
                                        <input type="tel" value={onboardingData.paymentDetails.danaPhone || ''} onChange={(e) => setOnboardingData({ ...onboardingData, paymentDetails: { ...onboardingData.paymentDetails, danaPhone: e.target.value } })} placeholder="Dana Phone Number" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500 bg-white" />
                                    )}
                                    {onboardingData.paymentMethod === 'ovo' && (
                                        <input type="tel" value={onboardingData.paymentDetails.ovoPhone || ''} onChange={(e) => setOnboardingData({ ...onboardingData, paymentDetails: { ...onboardingData.paymentDetails, ovoPhone: e.target.value } })} placeholder="OVO Phone Number" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500 bg-white" />
                                    )}
                                    {onboardingData.paymentMethod === 'gopay' && (
                                        <input type="tel" value={onboardingData.paymentDetails.gopayPhone || ''} onChange={(e) => setOnboardingData({ ...onboardingData, paymentDetails: { ...onboardingData.paymentDetails, gopayPhone: e.target.value } })} placeholder="GoPay Phone Number" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500 bg-white" />
                                    )}

                                    {/* China */}
                                    {onboardingData.paymentMethod === 'alipay' && (
                                        <input type="text" value={onboardingData.paymentDetails.alipayId || ''} onChange={(e) => setOnboardingData({ ...onboardingData, paymentDetails: { ...onboardingData.paymentDetails, alipayId: e.target.value } })} placeholder="Alipay ID / Phone" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500 bg-white" />
                                    )}
                                    {onboardingData.paymentMethod === 'wechat_pay' && (
                                        <input type="text" value={onboardingData.paymentDetails.wechatId || ''} onChange={(e) => setOnboardingData({ ...onboardingData, paymentDetails: { ...onboardingData.paymentDetails, wechatId: e.target.value } })} placeholder="WeChat ID" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500 bg-white" />
                                    )}

                                    {/* MercadoPago */}
                                    {onboardingData.paymentMethod === 'mercadopago' && (
                                        <input type="email" value={onboardingData.paymentDetails.mercadopagoEmail || ''} onChange={(e) => setOnboardingData({ ...onboardingData, paymentDetails: { ...onboardingData.paymentDetails, mercadopagoEmail: e.target.value } })} placeholder="MercadoPago Email" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500 bg-white" />
                                    )}

                                    {/* Revolut */}
                                    {onboardingData.paymentMethod === 'revolut' && (
                                        <>
                                            <input type="email" value={onboardingData.paymentEmail} onChange={(e) => setOnboardingData({ ...onboardingData, paymentEmail: e.target.value })} placeholder="Revolut Email" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500 bg-white" />
                                            <input type="tel" value={onboardingData.paymentDetails.phoneNumber || ''} onChange={(e) => setOnboardingData({ ...onboardingData, paymentDetails: { ...onboardingData.paymentDetails, phoneNumber: e.target.value } })} placeholder="Revolut Phone" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500 bg-white" />
                                        </>
                                    )}
                                </div>
                            </div>

                            <button
                                onClick={() => {
                                    // In a real app, this would save to the backend
                                    alert('Payment settings updated! (Demo mode)');
                                }}
                                className="w-full px-6 py-4 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white rounded-xl font-semibold hover:from-violet-500 hover:to-fuchsia-500 transition-all shadow-lg shadow-violet-500/25 flex items-center justify-center gap-2"
                            >
                                <CheckCircle className="w-5 h-5" />
                                Save Payment Settings
                            </button>
                        </div>

                        {/* Payment Method Info Cards */}
                        <div className="bg-white rounded-2xl border border-slate-200 p-6">
                            <h3 className="text-lg font-semibold text-slate-800 mb-4">Supported Payment Methods</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {[
                                    { region: 'global', title: '🌍 Global', methods: 'PayPal, Stripe, Bank Transfer, Wise, Skrill, Payoneer, Crypto' },
                                    { region: 'india', title: '🇮🇳 India', methods: 'Google Pay, PhonePe, Paytm, UPI, Razorpay' },
                                    { region: 'southeast_asia', title: '🌏 Southeast Asia', methods: 'GrabPay, GCash, Maya, Dana, OVO, GoPay' },
                                    { region: 'china', title: '🇨🇳 China', methods: 'Alipay, WeChat Pay' },
                                    { region: 'europe', title: '🇪🇺 Europe', methods: 'SEPA Transfer, Revolut' },
                                    { region: 'africa', title: '🌍 Africa', methods: 'M-Pesa, Flutterwave' },
                                    { region: 'latin_america', title: '🌎 Latin America', methods: 'PIX (Brazil), MercadoPago' },
                                ].map(info => (
                                    <div key={info.region} className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                                        <h4 className="font-semibold text-slate-800 mb-1">{info.title}</h4>
                                        <p className="text-sm text-slate-600">{info.methods}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Payout Request Modal */}
            {showPayoutModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl w-full max-w-md p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-bold text-slate-800">Request Payout</h3>
                            <button onClick={() => setShowPayoutModal(false)} className="text-slate-400 hover:text-slate-600">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {payoutSuccess ? (
                            <div className="text-center py-8">
                                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <CheckCircle className="w-8 h-8 text-emerald-600" />
                                </div>
                                <h4 className="text-lg font-semibold text-slate-800 mb-2">Payout Requested!</h4>
                                <p className="text-slate-600">Your payout request has been submitted. Processing typically takes 3-5 business days.</p>
                            </div>
                        ) : (
                            <>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Available Balance</label>
                                        <div className="text-2xl font-bold text-emerald-600">{formatCurrency(currentAffiliate.stats.pendingEarnings)}</div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Payout Amount</label>
                                        <div className="relative">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">$</span>
                                            <input
                                                type="number"
                                                value={payoutAmount}
                                                onChange={(e) => setPayoutAmount(e.target.value)}
                                                placeholder="50.00"
                                                min="50"
                                                max={currentAffiliate.stats.pendingEarnings}
                                                className="w-full pl-8 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500"
                                            />
                                        </div>
                                        <p className="text-xs text-slate-500 mt-1">Minimum: $50.00</p>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Payment Method</label>
                                        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                                            <span className="capitalize">{currentAffiliate.paymentMethod?.replace('_', ' ')}</span>
                                            {currentAffiliate.paymentEmail && (
                                                <span className="text-slate-500 ml-2">({currentAffiliate.paymentEmail})</span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-3 mt-6">
                                    <button
                                        onClick={() => setShowPayoutModal(false)}
                                        className="flex-1 px-4 py-3 border border-slate-200 rounded-xl font-medium text-slate-700 hover:bg-slate-50"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleRequestPayout}
                                        disabled={payoutLoading || !payoutAmount || parseFloat(payoutAmount) < 50}
                                        className="flex-1 px-4 py-3 bg-violet-600 text-white rounded-xl font-semibold hover:bg-violet-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                    >
                                        {payoutLoading ? (
                                            <>
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                Processing...
                                            </>
                                        ) : (
                                            'Request Payout'
                                        )}
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}

            {/* Affiliate Onboarding Modal */}
            {showOnboardingModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
                    <div className="bg-white rounded-2xl w-full max-w-2xl p-6 my-8">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-bold text-slate-800">Join Affiliate Program</h3>
                            <button onClick={() => setShowOnboardingModal(false)} className="text-slate-400 hover:text-slate-600">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {onboardingStep === 1 && (
                            <div className="space-y-5">
                                <div className="p-4 bg-gradient-to-r from-violet-50 to-fuchsia-50 rounded-xl border border-violet-100">
                                    <h4 className="font-semibold text-violet-800 mb-2">🎉 Earn up to 20% commission!</h4>
                                    <p className="text-sm text-violet-700">Refer new users to DigitalMEng and earn recurring commissions on every sale. Get paid in your preferred method!</p>
                                </div>

                                {/* Region Selector */}
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">Select Your Region</label>
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                        {[
                                            { id: 'global', label: '🌍 Global', desc: 'PayPal, Stripe, Wise' },
                                            { id: 'india', label: '🇮🇳 India', desc: 'GPay, PhonePe, UPI' },
                                            { id: 'southeast_asia', label: '🌏 SE Asia', desc: 'GrabPay, GCash, OVO' },
                                            { id: 'china', label: '🇨🇳 China', desc: 'Alipay, WeChat' },
                                            { id: 'europe', label: '🇪🇺 Europe', desc: 'SEPA, Revolut' },
                                            { id: 'africa', label: '🌍 Africa', desc: 'M-Pesa, Flutterwave' },
                                            { id: 'latin_america', label: '🌎 LatAm', desc: 'PIX, MercadoPago' },
                                        ].map(region => (
                                            <button
                                                key={region.id}
                                                type="button"
                                                onClick={() => setSelectedRegion(region.id)}
                                                className={`p-3 rounded-xl border-2 text-left transition-all ${selectedRegion === region.id
                                                    ? 'border-violet-500 bg-violet-50'
                                                    : 'border-slate-200 hover:border-violet-300'
                                                    }`}
                                            >
                                                <div className="font-medium text-sm">{region.label}</div>
                                                <div className="text-xs text-slate-500 mt-0.5">{region.desc}</div>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Payment Method Selection */}
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">Payment Method</label>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto p-1">
                                        {PAYMENT_METHODS
                                            .filter(pm => pm.region === selectedRegion || pm.region === 'global')
                                            .map(method => (
                                                <button
                                                    key={method.id}
                                                    type="button"
                                                    onClick={() => setOnboardingData({
                                                        ...onboardingData,
                                                        paymentMethod: method.id,
                                                        paymentEmail: '',
                                                        paymentDetails: {}
                                                    })}
                                                    className={`p-3 rounded-xl border-2 text-left transition-all flex items-center gap-3 ${onboardingData.paymentMethod === method.id
                                                        ? 'border-violet-500 bg-violet-50'
                                                        : 'border-slate-200 hover:border-violet-300'
                                                        }`}
                                                >
                                                    <span className="text-2xl">{method.icon}</span>
                                                    <div>
                                                        <div className="font-medium text-sm text-slate-800">{method.name}</div>
                                                        <div className="text-xs text-slate-500">{method.description}</div>
                                                    </div>
                                                </button>
                                            ))}
                                    </div>
                                </div>

                                {/* Dynamic Payment Details Form */}
                                <div className="space-y-3">
                                    <label className="block text-sm font-semibold text-slate-700">Payment Details</label>

                                    {/* Email-based payment methods */}
                                    {['paypal', 'stripe', 'flutterwave', 'razorpay'].includes(onboardingData.paymentMethod) && (
                                        <input
                                            type="email"
                                            value={onboardingData.paymentEmail}
                                            onChange={(e) => setOnboardingData({ ...onboardingData, paymentEmail: e.target.value })}
                                            placeholder="Payment Email"
                                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500"
                                        />
                                    )}

                                    {/* Wise */}
                                    {onboardingData.paymentMethod === 'wise' && (
                                        <input
                                            type="email"
                                            value={onboardingData.paymentDetails.wiseEmail || ''}
                                            onChange={(e) => setOnboardingData({
                                                ...onboardingData,
                                                paymentDetails: { ...onboardingData.paymentDetails, wiseEmail: e.target.value }
                                            })}
                                            placeholder="Wise Email"
                                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500"
                                        />
                                    )}

                                    {/* Skrill */}
                                    {onboardingData.paymentMethod === 'skrill' && (
                                        <input
                                            type="email"
                                            value={onboardingData.paymentDetails.skrillEmail || ''}
                                            onChange={(e) => setOnboardingData({
                                                ...onboardingData,
                                                paymentDetails: { ...onboardingData.paymentDetails, skrillEmail: e.target.value }
                                            })}
                                            placeholder="Skrill Email"
                                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500"
                                        />
                                    )}

                                    {/* Payoneer */}
                                    {onboardingData.paymentMethod === 'payoneer' && (
                                        <input
                                            type="email"
                                            value={onboardingData.paymentDetails.payoneerEmail || ''}
                                            onChange={(e) => setOnboardingData({
                                                ...onboardingData,
                                                paymentDetails: { ...onboardingData.paymentDetails, payoneerEmail: e.target.value }
                                            })}
                                            placeholder="Payoneer Email"
                                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500"
                                        />
                                    )}

                                    {/* Bank Transfer */}
                                    {onboardingData.paymentMethod === 'bank_transfer' && (
                                        <div className="grid grid-cols-2 gap-3">
                                            <input
                                                type="text"
                                                value={onboardingData.paymentDetails.accountHolderName || ''}
                                                onChange={(e) => setOnboardingData({
                                                    ...onboardingData,
                                                    paymentDetails: { ...onboardingData.paymentDetails, accountHolderName: e.target.value }
                                                })}
                                                placeholder="Account Holder Name"
                                                className="col-span-2 px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500"
                                            />
                                            <input
                                                type="text"
                                                value={onboardingData.paymentDetails.bankName || ''}
                                                onChange={(e) => setOnboardingData({
                                                    ...onboardingData,
                                                    paymentDetails: { ...onboardingData.paymentDetails, bankName: e.target.value }
                                                })}
                                                placeholder="Bank Name"
                                                className="px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500"
                                            />
                                            <input
                                                type="text"
                                                value={onboardingData.paymentDetails.accountNumber || ''}
                                                onChange={(e) => setOnboardingData({
                                                    ...onboardingData,
                                                    paymentDetails: { ...onboardingData.paymentDetails, accountNumber: e.target.value }
                                                })}
                                                placeholder="Account Number"
                                                className="px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500"
                                            />
                                            <input
                                                type="text"
                                                value={onboardingData.paymentDetails.swiftCode || ''}
                                                onChange={(e) => setOnboardingData({
                                                    ...onboardingData,
                                                    paymentDetails: { ...onboardingData.paymentDetails, swiftCode: e.target.value }
                                                })}
                                                placeholder="SWIFT/BIC Code"
                                                className="px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500"
                                            />
                                            <input
                                                type="text"
                                                value={onboardingData.paymentDetails.routingNumber || ''}
                                                onChange={(e) => setOnboardingData({
                                                    ...onboardingData,
                                                    paymentDetails: { ...onboardingData.paymentDetails, routingNumber: e.target.value }
                                                })}
                                                placeholder="Routing Number (optional)"
                                                className="px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500"
                                            />
                                        </div>
                                    )}

                                    {/* SEPA */}
                                    {onboardingData.paymentMethod === 'sepa' && (
                                        <div className="grid grid-cols-2 gap-3">
                                            <input
                                                type="text"
                                                value={onboardingData.paymentDetails.accountHolderName || ''}
                                                onChange={(e) => setOnboardingData({
                                                    ...onboardingData,
                                                    paymentDetails: { ...onboardingData.paymentDetails, accountHolderName: e.target.value }
                                                })}
                                                placeholder="Account Holder Name"
                                                className="col-span-2 px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500"
                                            />
                                            <input
                                                type="text"
                                                value={onboardingData.paymentDetails.iban || ''}
                                                onChange={(e) => setOnboardingData({
                                                    ...onboardingData,
                                                    paymentDetails: { ...onboardingData.paymentDetails, iban: e.target.value }
                                                })}
                                                placeholder="IBAN"
                                                className="col-span-2 px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500"
                                            />
                                            <input
                                                type="text"
                                                value={onboardingData.paymentDetails.bankName || ''}
                                                onChange={(e) => setOnboardingData({
                                                    ...onboardingData,
                                                    paymentDetails: { ...onboardingData.paymentDetails, bankName: e.target.value }
                                                })}
                                                placeholder="Bank Name"
                                                className="col-span-2 px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500"
                                            />
                                        </div>
                                    )}

                                    {/* Crypto */}
                                    {onboardingData.paymentMethod === 'crypto' && (
                                        <div className="space-y-3">
                                            <select
                                                value={onboardingData.paymentDetails.cryptoNetwork || ''}
                                                onChange={(e) => setOnboardingData({
                                                    ...onboardingData,
                                                    paymentDetails: {
                                                        ...onboardingData.paymentDetails,
                                                        cryptoNetwork: e.target.value as PaymentDetails['cryptoNetwork']
                                                    }
                                                })}
                                                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500"
                                            >
                                                <option value="">Select Network</option>
                                                <option value="bitcoin">Bitcoin (BTC)</option>
                                                <option value="ethereum">Ethereum (ETH)</option>
                                                <option value="usdt_trc20">USDT (TRC20)</option>
                                                <option value="usdt_erc20">USDT (ERC20)</option>
                                                <option value="usdc">USDC</option>
                                                <option value="solana">Solana (SOL)</option>
                                                <option value="polygon">Polygon (MATIC)</option>
                                            </select>
                                            <input
                                                type="text"
                                                value={onboardingData.paymentDetails.cryptoWallet || ''}
                                                onChange={(e) => setOnboardingData({
                                                    ...onboardingData,
                                                    paymentDetails: { ...onboardingData.paymentDetails, cryptoWallet: e.target.value }
                                                })}
                                                placeholder="Wallet Address"
                                                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500 font-mono text-sm"
                                            />
                                        </div>
                                    )}

                                    {/* India - UPI based methods */}
                                    {['gpay', 'phonepe', 'paytm', 'upi'].includes(onboardingData.paymentMethod) && (
                                        <div className="space-y-3">
                                            <input
                                                type="text"
                                                value={onboardingData.paymentDetails.upiId || ''}
                                                onChange={(e) => setOnboardingData({
                                                    ...onboardingData,
                                                    paymentDetails: { ...onboardingData.paymentDetails, upiId: e.target.value }
                                                })}
                                                placeholder="UPI ID (e.g., name@upi)"
                                                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500"
                                            />
                                            {['gpay', 'phonepe', 'paytm'].includes(onboardingData.paymentMethod) && (
                                                <input
                                                    type="tel"
                                                    value={onboardingData.paymentDetails.phoneNumber || ''}
                                                    onChange={(e) => setOnboardingData({
                                                        ...onboardingData,
                                                        paymentDetails: { ...onboardingData.paymentDetails, phoneNumber: e.target.value }
                                                    })}
                                                    placeholder="Phone Number (with country code)"
                                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500"
                                                />
                                            )}
                                        </div>
                                    )}

                                    {/* Southeast Asia phone-based wallets */}
                                    {onboardingData.paymentMethod === 'grabpay' && (
                                        <input
                                            type="tel"
                                            value={onboardingData.paymentDetails.grabpayPhone || ''}
                                            onChange={(e) => setOnboardingData({
                                                ...onboardingData,
                                                paymentDetails: { ...onboardingData.paymentDetails, grabpayPhone: e.target.value }
                                            })}
                                            placeholder="GrabPay Phone Number"
                                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500"
                                        />
                                    )}

                                    {onboardingData.paymentMethod === 'gcash' && (
                                        <input
                                            type="tel"
                                            value={onboardingData.paymentDetails.gcashPhone || ''}
                                            onChange={(e) => setOnboardingData({
                                                ...onboardingData,
                                                paymentDetails: { ...onboardingData.paymentDetails, gcashPhone: e.target.value }
                                            })}
                                            placeholder="GCash Phone Number"
                                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500"
                                        />
                                    )}

                                    {onboardingData.paymentMethod === 'maya' && (
                                        <input
                                            type="tel"
                                            value={onboardingData.paymentDetails.mayaPhone || ''}
                                            onChange={(e) => setOnboardingData({
                                                ...onboardingData,
                                                paymentDetails: { ...onboardingData.paymentDetails, mayaPhone: e.target.value }
                                            })}
                                            placeholder="Maya Phone Number"
                                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500"
                                        />
                                    )}

                                    {onboardingData.paymentMethod === 'dana' && (
                                        <input
                                            type="tel"
                                            value={onboardingData.paymentDetails.danaPhone || ''}
                                            onChange={(e) => setOnboardingData({
                                                ...onboardingData,
                                                paymentDetails: { ...onboardingData.paymentDetails, danaPhone: e.target.value }
                                            })}
                                            placeholder="Dana Phone Number"
                                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500"
                                        />
                                    )}

                                    {onboardingData.paymentMethod === 'ovo' && (
                                        <input
                                            type="tel"
                                            value={onboardingData.paymentDetails.ovoPhone || ''}
                                            onChange={(e) => setOnboardingData({
                                                ...onboardingData,
                                                paymentDetails: { ...onboardingData.paymentDetails, ovoPhone: e.target.value }
                                            })}
                                            placeholder="OVO Phone Number"
                                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500"
                                        />
                                    )}

                                    {onboardingData.paymentMethod === 'gopay' && (
                                        <input
                                            type="tel"
                                            value={onboardingData.paymentDetails.gopayPhone || ''}
                                            onChange={(e) => setOnboardingData({
                                                ...onboardingData,
                                                paymentDetails: { ...onboardingData.paymentDetails, gopayPhone: e.target.value }
                                            })}
                                            placeholder="GoPay Phone Number"
                                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500"
                                        />
                                    )}

                                    {/* China */}
                                    {onboardingData.paymentMethod === 'alipay' && (
                                        <input
                                            type="text"
                                            value={onboardingData.paymentDetails.alipayId || ''}
                                            onChange={(e) => setOnboardingData({
                                                ...onboardingData,
                                                paymentDetails: { ...onboardingData.paymentDetails, alipayId: e.target.value }
                                            })}
                                            placeholder="Alipay ID / Phone"
                                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500"
                                        />
                                    )}

                                    {onboardingData.paymentMethod === 'wechat_pay' && (
                                        <input
                                            type="text"
                                            value={onboardingData.paymentDetails.wechatId || ''}
                                            onChange={(e) => setOnboardingData({
                                                ...onboardingData,
                                                paymentDetails: { ...onboardingData.paymentDetails, wechatId: e.target.value }
                                            })}
                                            placeholder="WeChat ID"
                                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500"
                                        />
                                    )}

                                    {/* Revolut */}
                                    {onboardingData.paymentMethod === 'revolut' && (
                                        <div className="space-y-3">
                                            <input
                                                type="email"
                                                value={onboardingData.paymentEmail}
                                                onChange={(e) => setOnboardingData({ ...onboardingData, paymentEmail: e.target.value })}
                                                placeholder="Revolut Email"
                                                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500"
                                            />
                                            <input
                                                type="tel"
                                                value={onboardingData.paymentDetails.phoneNumber || ''}
                                                onChange={(e) => setOnboardingData({
                                                    ...onboardingData,
                                                    paymentDetails: { ...onboardingData.paymentDetails, phoneNumber: e.target.value }
                                                })}
                                                placeholder="Revolut Phone Number"
                                                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500"
                                            />
                                        </div>
                                    )}

                                    {/* Africa */}
                                    {onboardingData.paymentMethod === 'mpesa' && (
                                        <input
                                            type="tel"
                                            value={onboardingData.paymentDetails.mpesaPhone || ''}
                                            onChange={(e) => setOnboardingData({
                                                ...onboardingData,
                                                paymentDetails: { ...onboardingData.paymentDetails, mpesaPhone: e.target.value }
                                            })}
                                            placeholder="M-Pesa Phone Number"
                                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500"
                                        />
                                    )}

                                    {/* Latin America */}
                                    {onboardingData.paymentMethod === 'pix' && (
                                        <input
                                            type="text"
                                            value={onboardingData.paymentDetails.pixKey || ''}
                                            onChange={(e) => setOnboardingData({
                                                ...onboardingData,
                                                paymentDetails: { ...onboardingData.paymentDetails, pixKey: e.target.value }
                                            })}
                                            placeholder="PIX Key (CPF, Email, Phone, or Random Key)"
                                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500"
                                        />
                                    )}

                                    {onboardingData.paymentMethod === 'mercadopago' && (
                                        <input
                                            type="email"
                                            value={onboardingData.paymentDetails.mercadopagoEmail || ''}
                                            onChange={(e) => setOnboardingData({
                                                ...onboardingData,
                                                paymentDetails: { ...onboardingData.paymentDetails, mercadopagoEmail: e.target.value }
                                            })}
                                            placeholder="MercadoPago Email"
                                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500"
                                        />
                                    )}
                                </div>

                                <label className="flex items-start gap-3 cursor-pointer p-3 rounded-xl bg-slate-50 border border-slate-200">
                                    <input
                                        type="checkbox"
                                        checked={onboardingData.acceptedTerms}
                                        onChange={(e) => setOnboardingData({ ...onboardingData, acceptedTerms: e.target.checked })}
                                        className="mt-0.5 w-5 h-5 rounded border-slate-300 text-violet-600 focus:ring-violet-500"
                                    />
                                    <span className="text-sm text-slate-600">
                                        I agree to the <a href="#" className="text-violet-600 hover:underline font-medium">Affiliate Terms & Conditions</a> and <a href="#" className="text-violet-600 hover:underline font-medium">Privacy Policy</a>
                                    </span>
                                </label>

                                <button
                                    onClick={handleCreateAffiliate}
                                    disabled={!onboardingData.acceptedTerms || isLoading}
                                    className="w-full px-4 py-4 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white rounded-xl font-semibold hover:from-violet-500 hover:to-fuchsia-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-violet-500/25 transition-all"
                                >
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                            Creating Account...
                                        </>
                                    ) : (
                                        <>
                                            <UserPlus className="w-5 h-5" />
                                            Join Affiliate Program
                                        </>
                                    )}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
