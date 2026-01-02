'use client';

import { useState } from 'react';
import {
    Users,
    DollarSign,
    MousePointerClick,
    TrendingUp,
    Copy,
    Check,
    ExternalLink,
    ChevronRight,
    Gift,
    CreditCard,
    FileText,
    Download,
    ArrowUpRight,
    ArrowDownRight,
    Clock,
    CheckCircle,
    XCircle,
    AlertCircle,
    Search,
    Filter,
    Calendar,
    Wallet,
    Target,
    Award,
    Share2,
    Link2,
    Image as ImageIcon,
    Mail,
    Video,
    LayoutTemplate,
    RefreshCw
} from 'lucide-react';
import {
    mockCurrentAffiliate,
    mockReferrals,
    mockAffiliateTransactions,
    mockAffiliatePayouts,
    mockAffiliatePromotions,
    mockAffiliateAssets,
    mockAffiliateLogs,
    affiliateTiers,
    getTierInfo,
    getNextTierProgress
} from '@/lib/affiliateData';

type TabType = 'overview' | 'referrals' | 'earnings' | 'payouts' | 'assets' | 'logs';

export default function AffiliateDashboard() {
    const [activeTab, setActiveTab] = useState<TabType>('overview');
    const [copied, setCopied] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [logFilter, setLogFilter] = useState<string>('all');

    const affiliate = mockCurrentAffiliate;
    const tierInfo = getTierInfo(affiliate.tier);
    const { nextTier, referralProgress, earningsProgress } = getNextTierProgress(affiliate.tier, affiliate.stats);

    const handleCopyLink = () => {
        navigator.clipboard.writeText(affiliate.referralLink);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleCopyCode = () => {
        navigator.clipboard.writeText(affiliate.referralCode);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
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

    const filteredLogs = mockAffiliateLogs.filter(log => {
        if (logFilter === 'all') return true;
        return log.action === logFilter;
    });

    const tabs = [
        { id: 'overview', label: 'Overview', icon: TrendingUp },
        { id: 'referrals', label: 'Referrals', icon: Users },
        { id: 'earnings', label: 'Earnings', icon: DollarSign },
        { id: 'payouts', label: 'Payouts', icon: Wallet },
        { id: 'assets', label: 'Marketing Assets', icon: ImageIcon },
        { id: 'logs', label: 'Activity Log', icon: FileText }
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-violet-50/30 p-6">
            <div className="max-w-7xl mx-auto space-y-6">
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
                        <button className="px-4 py-2 bg-violet-600 text-white rounded-xl font-semibold hover:bg-violet-500 transition-colors flex items-center gap-2">
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
                            <p className="text-white/70 text-sm mt-1">Share this link to earn {affiliate.commissionRate}% commission on every sale</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="bg-white/10 backdrop-blur-sm rounded-xl px-4 py-3 flex items-center gap-3 border border-white/20">
                                <Link2 className="w-5 h-5 text-white/70" />
                                <span className="font-mono text-sm">{affiliate.referralLink}</span>
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
                            <code className="bg-white/10 px-3 py-1 rounded-lg font-mono text-sm">{affiliate.referralCode}</code>
                            <button onClick={handleCopyCode} className="text-white/70 hover:text-white">
                                <Copy className="w-4 h-4" />
                            </button>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-white/70 text-sm">Cookie Duration:</span>
                            <span className="font-semibold">{affiliate.cookieDuration} days</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-white/70 text-sm">Commission Rate:</span>
                            <span className="font-semibold">{affiliate.commissionRate}%</span>
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
                                <div className="text-2xl font-bold text-slate-800">{affiliate.stats.totalClicks.toLocaleString()}</div>
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
                                <div className="text-2xl font-bold text-slate-800">{affiliate.stats.totalSignups}</div>
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
                                <div className="text-2xl font-bold text-slate-800">{formatCurrency(affiliate.stats.totalEarnings)}</div>
                                <div className="text-slate-500 text-sm">Total Earnings</div>
                            </div>

                            <div className="bg-white rounded-2xl border border-slate-200 p-5">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                                        <Target className="w-5 h-5 text-amber-600" />
                                    </div>
                                </div>
                                <div className="text-2xl font-bold text-slate-800">{affiliate.stats.conversionRate}%</div>
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
                                        <div className="text-slate-500 text-sm">{affiliate.commissionRate}% commission rate</div>
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
                                                <span>Referrals: {affiliate.stats.paidConversions}/{nextTier.minReferrals}</span>
                                                <span>{Math.round(referralProgress)}%</span>
                                            </div>
                                            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                                <div className="h-full bg-violet-500 rounded-full transition-all" style={{ width: `${referralProgress}%` }} />
                                            </div>
                                        </div>
                                        <div>
                                            <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                                                <span>Earnings: {formatCurrency(affiliate.stats.totalEarnings)}/{formatCurrency(nextTier.minEarnings)}</span>
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
                                {mockAffiliateLogs.slice(0, 5).map(log => (
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
                                    {mockReferrals.map(referral => (
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
                                <div className="text-3xl font-bold text-slate-800">{formatCurrency(affiliate.stats.totalEarnings)}</div>
                            </div>
                            <div className="bg-white rounded-2xl border border-slate-200 p-5">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                                        <Clock className="w-5 h-5 text-amber-600" />
                                    </div>
                                    <span className="text-slate-600 text-sm">Pending</span>
                                </div>
                                <div className="text-3xl font-bold text-amber-600">{formatCurrency(affiliate.stats.pendingEarnings)}</div>
                            </div>
                            <div className="bg-white rounded-2xl border border-slate-200 p-5">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                                        <CheckCircle className="w-5 h-5 text-blue-600" />
                                    </div>
                                    <span className="text-slate-600 text-sm">Paid Out</span>
                                </div>
                                <div className="text-3xl font-bold text-blue-600">{formatCurrency(affiliate.stats.paidEarnings)}</div>
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
                                        {mockAffiliateTransactions.map(txn => (
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
                                    <div className="text-4xl font-bold mt-2">{formatCurrency(affiliate.stats.pendingEarnings)}</div>
                                    <p className="text-white/70 text-sm mt-1">Minimum payout: $50.00</p>
                                </div>
                                <div className="flex flex-col gap-2">
                                    <button
                                        disabled={affiliate.stats.pendingEarnings < 50}
                                        className="px-6 py-3 bg-white text-violet-600 rounded-xl font-semibold hover:bg-white/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Request Payout
                                    </button>
                                    <span className="text-xs text-white/70 text-center">
                                        Payment method: {affiliate.paymentMethod.replace('_', ' ')}
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
                                        {mockAffiliatePayouts.map(payout => (
                                            <tr key={payout.id} className="hover:bg-slate-50 transition-colors">
                                                <td className="px-6 py-4 font-mono text-sm text-slate-600">{payout.id}</td>
                                                <td className="px-6 py-4 font-semibold text-slate-800">{formatCurrency(payout.amount)}</td>
                                                <td className="px-6 py-4 text-slate-600 capitalize">{payout.paymentMethod.replace('_', ' ')}</td>
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
            </div>
        </div>
    );
}
