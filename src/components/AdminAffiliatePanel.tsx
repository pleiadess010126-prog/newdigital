'use client';

import { useState, useEffect } from 'react';
import {
    Users,
    DollarSign,
    TrendingUp,
    Check,
    X,
    AlertTriangle,
    Search,
    Filter,
    ChevronDown,
    Clock,
    CheckCircle,
    XCircle,
    Pause,
    Play,
    Eye,
    Edit2,
    Trash2,
    CreditCard,
    RefreshCw,
    Loader2,
    Award,
    MousePointerClick,
    Target,
    Settings
} from 'lucide-react';

interface Affiliate {
    id: string;
    userId: string;
    userName?: string;
    userEmail?: string;
    referralCode: string;
    status: 'active' | 'pending' | 'suspended' | 'inactive';
    tier: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';
    createdAt: Date;
    approvedAt?: Date;
    commissionRate: number;
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

interface Payout {
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

interface Stats {
    totalAffiliates: number;
    activeAffiliates: number;
    pendingApprovals: number;
    suspendedAffiliates: number;
    totalEarnings: number;
    totalPendingPayouts: number;
    totalClicks: number;
    totalConversions: number;
}

export default function AdminAffiliatePanel() {
    const [activeTab, setActiveTab] = useState<'affiliates' | 'payouts'>('affiliates');
    const [affiliates, setAffiliates] = useState<Affiliate[]>([]);
    const [payouts, setPayouts] = useState<Payout[]>([]);
    const [stats, setStats] = useState<Stats | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [showEditModal, setShowEditModal] = useState(false);
    const [showPayoutModal, setShowPayoutModal] = useState(false);
    const [selectedAffiliate, setSelectedAffiliate] = useState<Affiliate | null>(null);
    const [selectedPayout, setSelectedPayout] = useState<Payout | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);

    // Fetch data
    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [affiliatesRes, payoutsRes, statsRes] = await Promise.all([
                fetch('/api/admin/affiliates'),
                fetch('/api/admin/affiliates?action=payouts'),
                fetch('/api/admin/affiliates?action=stats')
            ]);

            const [affiliatesData, payoutsData, statsData] = await Promise.all([
                affiliatesRes.json(),
                payoutsRes.json(),
                statsRes.json()
            ]);

            if (affiliatesData.success) setAffiliates(affiliatesData.data);
            if (payoutsData.success) setPayouts(payoutsData.data);
            if (statsData.success) setStats(statsData.data);
        } catch (error) {
            console.error('Failed to fetch affiliate data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleUpdateAffiliate = async (id: string, updates: Partial<Affiliate>) => {
        setIsProcessing(true);
        try {
            const response = await fetch('/api/admin/affiliates', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: 'affiliate',
                    id,
                    ...updates
                })
            });

            const result = await response.json();
            if (result.success) {
                fetchData();
                setShowEditModal(false);
            }
        } catch (error) {
            console.error('Failed to update affiliate:', error);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleUpdatePayout = async (id: string, updates: Partial<Payout>) => {
        setIsProcessing(true);
        try {
            const response = await fetch('/api/admin/affiliates', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: 'payout',
                    id,
                    ...updates
                })
            });

            const result = await response.json();
            if (result.success) {
                fetchData();
                setShowPayoutModal(false);
            }
        } catch (error) {
            console.error('Failed to update payout:', error);
        } finally {
            setIsProcessing(false);
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

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active':
            case 'completed':
                return 'bg-emerald-100 text-emerald-700 border-emerald-200';
            case 'pending':
            case 'processing':
                return 'bg-amber-100 text-amber-700 border-amber-200';
            case 'suspended':
            case 'failed':
            case 'cancelled':
                return 'bg-red-100 text-red-700 border-red-200';
            default:
                return 'bg-slate-100 text-slate-700 border-slate-200';
        }
    };

    const getTierColor = (tier: string) => {
        switch (tier) {
            case 'bronze': return { bg: 'bg-amber-100', text: 'text-amber-700', icon: '🥉' };
            case 'silver': return { bg: 'bg-slate-100', text: 'text-slate-700', icon: '🥈' };
            case 'gold': return { bg: 'bg-yellow-100', text: 'text-yellow-700', icon: '🥇' };
            case 'platinum': return { bg: 'bg-purple-100', text: 'text-purple-700', icon: '💎' };
            case 'diamond': return { bg: 'bg-cyan-100', text: 'text-cyan-700', icon: '👑' };
            default: return { bg: 'bg-slate-100', text: 'text-slate-700', icon: '●' };
        }
    };

    const filteredAffiliates = affiliates.filter(a => {
        const matchesSearch =
            (a.userName?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
            (a.userEmail?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
            a.referralCode.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === 'all' || a.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const pendingPayouts = payouts.filter(p => p.status === 'pending' || p.status === 'processing');

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 text-violet-600 animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Stats Overview */}
            {stats && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-white rounded-xl border border-slate-200 p-4">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 bg-violet-100 rounded-lg flex items-center justify-center">
                                <Users className="w-5 h-5 text-violet-600" />
                            </div>
                            <span className="text-sm text-slate-500">Total Affiliates</span>
                        </div>
                        <div className="text-2xl font-bold text-slate-800">{stats.totalAffiliates}</div>
                        <div className="text-xs text-slate-500 mt-1">
                            {stats.activeAffiliates} active, {stats.pendingApprovals} pending
                        </div>
                    </div>

                    <div className="bg-white rounded-xl border border-slate-200 p-4">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                                <DollarSign className="w-5 h-5 text-emerald-600" />
                            </div>
                            <span className="text-sm text-slate-500">Total Earnings</span>
                        </div>
                        <div className="text-2xl font-bold text-slate-800">{formatCurrency(stats.totalEarnings)}</div>
                        <div className="text-xs text-slate-500 mt-1">
                            Paid to affiliates
                        </div>
                    </div>

                    <div className="bg-white rounded-xl border border-slate-200 p-4">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                                <Clock className="w-5 h-5 text-amber-600" />
                            </div>
                            <span className="text-sm text-slate-500">Pending Payouts</span>
                        </div>
                        <div className="text-2xl font-bold text-amber-600">{formatCurrency(stats.totalPendingPayouts)}</div>
                        <div className="text-xs text-slate-500 mt-1">
                            {pendingPayouts.length} requests
                        </div>
                    </div>

                    <div className="bg-white rounded-xl border border-slate-200 p-4">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                <Target className="w-5 h-5 text-blue-600" />
                            </div>
                            <span className="text-sm text-slate-500">Conversions</span>
                        </div>
                        <div className="text-2xl font-bold text-slate-800">{stats.totalConversions}</div>
                        <div className="text-xs text-slate-500 mt-1">
                            From {stats.totalClicks.toLocaleString()} clicks
                        </div>
                    </div>
                </div>
            )}

            {/* Tab Navigation */}
            <div className="bg-white rounded-xl border border-slate-200 p-1 flex gap-1">
                <button
                    onClick={() => setActiveTab('affiliates')}
                    className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${activeTab === 'affiliates'
                        ? 'bg-violet-600 text-white'
                        : 'text-slate-600 hover:bg-slate-100'
                        }`}
                >
                    <Users className="w-4 h-4" />
                    Affiliates
                    {stats && stats.pendingApprovals > 0 && (
                        <span className="px-2 py-0.5 bg-red-500 text-white text-xs rounded-full">
                            {stats.pendingApprovals}
                        </span>
                    )}
                </button>
                <button
                    onClick={() => setActiveTab('payouts')}
                    className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${activeTab === 'payouts'
                        ? 'bg-violet-600 text-white'
                        : 'text-slate-600 hover:bg-slate-100'
                        }`}
                >
                    <CreditCard className="w-4 h-4" />
                    Payouts
                    {pendingPayouts.length > 0 && (
                        <span className="px-2 py-0.5 bg-amber-500 text-white text-xs rounded-full">
                            {pendingPayouts.length}
                        </span>
                    )}
                </button>
            </div>

            {/* Affiliates Tab */}
            {activeTab === 'affiliates' && (
                <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                    {/* Filters */}
                    <div className="p-4 border-b border-slate-200 flex flex-wrap items-center gap-4">
                        <div className="relative flex-1 min-w-[200px]">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search affiliates..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500"
                            />
                        </div>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500"
                        >
                            <option value="all">All Status</option>
                            <option value="active">Active</option>
                            <option value="pending">Pending</option>
                            <option value="suspended">Suspended</option>
                        </select>
                        <button
                            onClick={fetchData}
                            className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50"
                        >
                            <RefreshCw className="w-4 h-4 text-slate-600" />
                        </button>
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-slate-50 text-left">
                                    <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Affiliate</th>
                                    <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Status</th>
                                    <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Tier</th>
                                    <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Commission</th>
                                    <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Conversions</th>
                                    <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Earnings</th>
                                    <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredAffiliates.map((affiliate) => {
                                    const tierStyle = getTierColor(affiliate.tier);
                                    return (
                                        <tr key={affiliate.id} className="hover:bg-slate-50">
                                            <td className="px-4 py-3">
                                                <div>
                                                    <div className="font-medium text-slate-800">{affiliate.userName || 'Unknown'}</div>
                                                    <div className="text-sm text-slate-500">{affiliate.userEmail}</div>
                                                    <div className="text-xs text-violet-600 font-mono">{affiliate.referralCode}</div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(affiliate.status)}`}>
                                                    {affiliate.status}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${tierStyle.bg} ${tierStyle.text}`}>
                                                    {tierStyle.icon} {affiliate.tier}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 font-medium text-slate-800">
                                                {affiliate.commissionRate}%
                                            </td>
                                            <td className="px-4 py-3 text-sm text-slate-600">
                                                {affiliate.stats.paidConversions}
                                            </td>
                                            <td className="px-4 py-3 font-semibold text-emerald-600">
                                                {formatCurrency(affiliate.stats.totalEarnings)}
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-1">
                                                    {affiliate.status === 'pending' && (
                                                        <>
                                                            <button
                                                                onClick={() => handleUpdateAffiliate(affiliate.id, { status: 'active' })}
                                                                className="p-1.5 rounded bg-emerald-100 text-emerald-600 hover:bg-emerald-200"
                                                                title="Approve"
                                                            >
                                                                <Check className="w-4 h-4" />
                                                            </button>
                                                            <button
                                                                onClick={() => handleUpdateAffiliate(affiliate.id, { status: 'suspended' })}
                                                                className="p-1.5 rounded bg-red-100 text-red-600 hover:bg-red-200"
                                                                title="Reject"
                                                            >
                                                                <X className="w-4 h-4" />
                                                            </button>
                                                        </>
                                                    )}
                                                    {affiliate.status === 'active' && (
                                                        <button
                                                            onClick={() => handleUpdateAffiliate(affiliate.id, { status: 'suspended' })}
                                                            className="p-1.5 rounded bg-amber-100 text-amber-600 hover:bg-amber-200"
                                                            title="Suspend"
                                                        >
                                                            <Pause className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                    {affiliate.status === 'suspended' && (
                                                        <button
                                                            onClick={() => handleUpdateAffiliate(affiliate.id, { status: 'active' })}
                                                            className="p-1.5 rounded bg-emerald-100 text-emerald-600 hover:bg-emerald-200"
                                                            title="Reactivate"
                                                        >
                                                            <Play className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() => {
                                                            setSelectedAffiliate(affiliate);
                                                            setShowEditModal(true);
                                                        }}
                                                        className="p-1.5 rounded bg-slate-100 text-slate-600 hover:bg-slate-200"
                                                        title="Edit"
                                                    >
                                                        <Edit2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Payouts Tab */}
            {activeTab === 'payouts' && (
                <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                    <div className="p-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-4">
                        <h3 className="font-semibold text-slate-800">Payout Requests</h3>
                        <div className="flex gap-2">
                            <button
                                onClick={async () => {
                                    setIsProcessing(true);
                                    await fetch('/api/admin/affiliates?action=auto-approve');
                                    fetchData();
                                    setIsProcessing(false);
                                }}
                                disabled={isProcessing}
                                className="px-3 py-1.5 text-xs font-medium text-emerald-700 bg-emerald-100 hover:bg-emerald-200 rounded-lg flex items-center gap-1 transition-colors"
                            >
                                <CheckCircle className="w-3.5 h-3.5" />
                                Auto-Approve Pending
                            </button>
                            <button
                                onClick={async () => {
                                    setIsProcessing(true);
                                    await fetch('/api/admin/affiliates?action=process-scheduled');
                                    fetchData();
                                    setIsProcessing(false);
                                }}
                                disabled={isProcessing}
                                className="px-3 py-1.5 text-xs font-medium text-violet-700 bg-violet-100 hover:bg-violet-200 rounded-lg flex items-center gap-1 transition-colors"
                            >
                                <Clock className="w-3.5 h-3.5" />
                                Process Scheduled
                            </button>
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-slate-50 text-left">
                                    <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase">ID</th>
                                    <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Affiliate</th>
                                    <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Amount</th>
                                    <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Method</th>
                                    <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Status</th>
                                    <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Requested</th>
                                    <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {payouts.map((payout) => (
                                    <tr key={payout.id} className="hover:bg-slate-50">
                                        <td className="px-4 py-3 font-mono text-sm text-slate-600">{payout.id}</td>
                                        <td className="px-4 py-3 font-medium text-slate-800">
                                            {payout.affiliateName || payout.affiliateId}
                                        </td>
                                        <td className="px-4 py-3 font-semibold text-slate-800">
                                            {formatCurrency(payout.amount)}
                                        </td>
                                        <td className="px-4 py-3 text-slate-600 capitalize">
                                            {payout.paymentMethod?.replace('_', ' ')}
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(payout.status)}`}>
                                                {payout.status}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-sm text-slate-600">
                                            {formatDate(payout.requestedAt)}
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-1">
                                                {payout.status === 'pending' && (
                                                    <>
                                                        <button
                                                            onClick={() => handleUpdatePayout(payout.id, { status: 'processing' })}
                                                            className="px-2 py-1 rounded bg-blue-100 text-blue-600 hover:bg-blue-200 text-xs font-medium"
                                                        >
                                                            Process
                                                        </button>
                                                        <button
                                                            onClick={() => handleUpdatePayout(payout.id, { status: 'cancelled' })}
                                                            className="px-2 py-1 rounded bg-red-100 text-red-600 hover:bg-red-200 text-xs font-medium"
                                                        >
                                                            Cancel
                                                        </button>
                                                    </>
                                                )}
                                                {payout.status === 'processing' && (
                                                    <>
                                                        <button
                                                            onClick={() => {
                                                                setSelectedPayout(payout);
                                                                setShowPayoutModal(true);
                                                            }}
                                                            className="px-2 py-1 rounded bg-emerald-100 text-emerald-600 hover:bg-emerald-200 text-xs font-medium"
                                                        >
                                                            Complete
                                                        </button>
                                                        <button
                                                            onClick={() => handleUpdatePayout(payout.id, { status: 'failed' })}
                                                            className="px-2 py-1 rounded bg-red-100 text-red-600 hover:bg-red-200 text-xs font-medium"
                                                        >
                                                            Failed
                                                        </button>
                                                    </>
                                                )}
                                                {(payout.status === 'completed' || payout.status === 'failed' || payout.status === 'cancelled') && (
                                                    <span className="text-xs text-slate-400">
                                                        {payout.paymentReference || 'N/A'}
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Affiliate Details & Edit Modal */}
            {showEditModal && selectedAffiliate && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        {/* Header */}
                        <div className="p-6 border-b border-slate-200 flex items-start justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 bg-violet-100 rounded-full flex items-center justify-center text-xl font-bold text-violet-600">
                                    {selectedAffiliate.userName?.charAt(0) || 'U'}
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-slate-800">{selectedAffiliate.userName}</h3>
                                    <div className="text-slate-500">{selectedAffiliate.userEmail}</div>
                                    <div className="flex items-center gap-2 mt-2">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(selectedAffiliate.status)}`}>
                                            {selectedAffiliate.status}
                                        </span>
                                        <div className="text-xs text-slate-400">
                                            Joined {formatDate(selectedAffiliate.createdAt)}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <button onClick={() => setShowEditModal(false)} className="text-slate-400 hover:text-slate-600">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="p-6 space-y-8">
                            {/* Performance Stats */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                                    <div className="text-xs text-slate-500 mb-1">Clicks</div>
                                    <div className="text-xl font-bold text-slate-800">{selectedAffiliate.stats.totalClicks.toLocaleString()}</div>
                                </div>
                                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                                    <div className="text-xs text-slate-500 mb-1">Signups</div>
                                    <div className="text-xl font-bold text-slate-800">{selectedAffiliate.stats.totalSignups}</div>
                                </div>
                                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                                    <div className="text-xs text-slate-500 mb-1">Conversions</div>
                                    <div className="text-xl font-bold text-slate-800">{selectedAffiliate.stats.paidConversions}</div>
                                </div>
                                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                                    <div className="text-xs text-slate-500 mb-1">Conv. Rate</div>
                                    <div className="text-xl font-bold text-slate-800">
                                        {selectedAffiliate.stats.totalClicks > 0
                                            ? ((selectedAffiliate.stats.paidConversions / selectedAffiliate.stats.totalClicks) * 100).toFixed(1)
                                            : '0.0'}%
                                    </div>
                                </div>
                            </div>

                            {/* Financials & Tier */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Financials */}
                                <div className="space-y-4">
                                    <h4 className="font-semibold text-slate-800 flex items-center gap-2">
                                        <DollarSign className="w-4 h-4" /> Financials
                                    </h4>
                                    <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-100">
                                        <div className="flex justify-between items-end mb-2">
                                            <div className="text-sm text-emerald-800">Total Earnings</div>
                                            <div className="text-2xl font-bold text-emerald-700">{formatCurrency(selectedAffiliate.stats.totalEarnings)}</div>
                                        </div>
                                        <div className="w-full h-2 bg-emerald-200 rounded-full overflow-hidden">
                                            <div className="h-full bg-emerald-500 rounded-full" style={{ width: '100%' }}></div>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="p-3 bg-white border border-slate-200 rounded-lg">
                                            <div className="text-xs text-slate-500">Pending</div>
                                            <div className="font-bold text-amber-600">{formatCurrency(selectedAffiliate.stats.pendingEarnings)}</div>
                                        </div>
                                        <div className="p-3 bg-white border border-slate-200 rounded-lg">
                                            <div className="text-xs text-slate-500">Paid</div>
                                            <div className="font-bold text-slate-700">{formatCurrency(selectedAffiliate.stats.paidEarnings)}</div>
                                        </div>
                                    </div>
                                </div>

                                {/* Current Tier Info */}
                                <div className="space-y-4">
                                    <h4 className="font-semibold text-slate-800 flex items-center gap-2">
                                        <Award className="w-4 h-4" /> Current Tier
                                    </h4>
                                    <div className={`p-4 rounded-xl border ${getTierColor(selectedAffiliate.tier).bg} border-opacity-50`}>
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="flex items-center gap-2">
                                                <span className="text-2xl">{getTierColor(selectedAffiliate.tier).icon}</span>
                                                <div>
                                                    <div className="font-bold capitalize">{selectedAffiliate.tier}</div>
                                                    <div className="text-xs opacity-75">{selectedAffiliate.commissionRate}% Commission</div>
                                                </div>
                                            </div>
                                            <div className="text-xs font-mono bg-white/50 px-2 py-1 rounded">
                                                {selectedAffiliate.referralCode}
                                            </div>
                                        </div>

                                        {/* Tier Progress (Mock - would need real next tier data) */}
                                        <div className="space-y-2">
                                            <div className="flex justify-between text-xs opacity-75">
                                                <span>Progress to next tier</span>
                                                <span>75%</span>
                                            </div>
                                            <div className="w-full h-1.5 bg-black/10 rounded-full overflow-hidden">
                                                <div className="h-full bg-black/30 rounded-full" style={{ width: '75%' }}></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Edit Controls */}
                            <div className="pt-6 border-t border-slate-200">
                                <h4 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
                                    <Settings className="w-4 h-4" /> Settings
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Tier Override</label>
                                        <select
                                            defaultValue={selectedAffiliate.tier}
                                            id="edit-tier"
                                            className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500"
                                        >
                                            <option value="bronze">Bronze (10%)</option>
                                            <option value="silver">Silver (12%)</option>
                                            <option value="gold">Gold (15%)</option>
                                            <option value="platinum">Platinum (18%)</option>
                                            <option value="diamond">Diamond (20%)</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Account Status</label>
                                        <select
                                            defaultValue={selectedAffiliate.status}
                                            id="edit-status"
                                            className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500"
                                        >
                                            <option value="active">Active</option>
                                            <option value="pending">Pending</option>
                                            <option value="suspended">Suspended</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="p-6 border-t border-slate-200 bg-slate-50 rounded-b-xl flex justify-between items-center">
                            <div className="text-xs text-slate-400">
                                ID: {selectedAffiliate.id}
                            </div>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowEditModal(false)}
                                    className="px-4 py-2 border border-slate-200 rounded-lg font-medium text-slate-700 hover:bg-white"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => {
                                        const tier = (document.getElementById('edit-tier') as HTMLSelectElement).value;
                                        const status = (document.getElementById('edit-status') as HTMLSelectElement).value;
                                        handleUpdateAffiliate(selectedAffiliate.id, { tier: tier as any, status: status as any });
                                    }}
                                    disabled={isProcessing}
                                    className="px-6 py-2 bg-violet-600 text-white rounded-lg font-medium hover:bg-violet-500 disabled:opacity-50 flex items-center gap-2"
                                >
                                    {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Changes'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Complete Payout Modal */}
            {showPayoutModal && selectedPayout && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl w-full max-w-md p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-bold text-slate-800">Complete Payout</h3>
                            <button onClick={() => setShowPayoutModal(false)} className="text-slate-400 hover:text-slate-600">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Amount</label>
                                <div className="text-2xl font-bold text-slate-800">{formatCurrency(selectedPayout.amount)}</div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Payment Reference</label>
                                <input
                                    type="text"
                                    id="payment-ref"
                                    placeholder="e.g., PP-123456789"
                                    className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Admin Notes (optional)</label>
                                <textarea
                                    id="admin-notes"
                                    rows={2}
                                    className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500"
                                />
                            </div>
                        </div>

                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={() => setShowPayoutModal(false)}
                                className="flex-1 px-4 py-2 border border-slate-200 rounded-lg font-medium text-slate-700 hover:bg-slate-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => {
                                    const paymentReference = (document.getElementById('payment-ref') as HTMLInputElement).value;
                                    const adminNotes = (document.getElementById('admin-notes') as HTMLTextAreaElement).value;
                                    handleUpdatePayout(selectedPayout.id, {
                                        status: 'completed',
                                        paymentReference,
                                        adminNotes
                                    });
                                }}
                                disabled={isProcessing}
                                className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-500 disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Mark as Completed'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
