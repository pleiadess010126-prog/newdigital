'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    Mail, Plus, Send, Users, FileText, BarChart3, Clock,
    MoreVertical, Search, Filter, ChevronRight, CheckCircle2,
    XCircle, AlertCircle, Trash2, Edit, Eye, Pause, Play
} from 'lucide-react';

interface EmailCampaign {
    id: string;
    name: string;
    subject: string;
    status: 'draft' | 'scheduled' | 'sending' | 'sent' | 'paused' | 'cancelled';
    scheduledAt?: string;
    sentAt?: string;
    createdAt: string;
    metrics?: {
        sent: number;
        delivered: number;
        opened: number;
        clicked: number;
        openRate: number;
        clickRate: number;
    };
    _count?: {
        recipients: number;
    };
}

const statusConfig = {
    draft: { label: 'Draft', color: 'bg-slate-100 text-slate-700', icon: FileText },
    scheduled: { label: 'Scheduled', color: 'bg-blue-100 text-blue-700', icon: Clock },
    sending: { label: 'Sending', color: 'bg-amber-100 text-amber-700', icon: Send },
    sent: { label: 'Sent', color: 'bg-emerald-100 text-emerald-700', icon: CheckCircle2 },
    paused: { label: 'Paused', color: 'bg-orange-100 text-orange-700', icon: Pause },
    cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-700', icon: XCircle },
};

export default function EmailMarketingPage() {
    const router = useRouter();
    const [campaigns, setCampaigns] = useState<EmailCampaign[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [stats, setStats] = useState({
        totalCampaigns: 0,
        totalContacts: 0,
        avgOpenRate: 0,
        avgClickRate: 0,
    });

    useEffect(() => {
        fetchCampaigns();
        fetchStats();
    }, [statusFilter]);

    const fetchCampaigns = async () => {
        try {
            const params = new URLSearchParams();
            if (statusFilter) params.set('status', statusFilter);

            const response = await fetch(`/api/email/campaigns?${params}`);
            const data = await response.json();
            setCampaigns(data.campaigns || []);
        } catch (error) {
            console.error('Error fetching campaigns:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            const [campaignsRes, contactsRes] = await Promise.all([
                fetch('/api/email/campaigns?limit=100'),
                fetch('/api/email/contacts?limit=1'),
            ]);

            const campaignsData = await campaignsRes.json();
            const contactsData = await contactsRes.json();

            const sentCampaigns = (campaignsData.campaigns || []).filter(
                (c: EmailCampaign) => c.status === 'sent' && c.metrics
            );

            const avgOpenRate = sentCampaigns.length > 0
                ? sentCampaigns.reduce((acc: number, c: EmailCampaign) => acc + (c.metrics?.openRate || 0), 0) / sentCampaigns.length
                : 0;

            const avgClickRate = sentCampaigns.length > 0
                ? sentCampaigns.reduce((acc: number, c: EmailCampaign) => acc + (c.metrics?.clickRate || 0), 0) / sentCampaigns.length
                : 0;

            setStats({
                totalCampaigns: campaignsData.pagination?.total || 0,
                totalContacts: contactsData.pagination?.total || 0,
                avgOpenRate,
                avgClickRate,
            });
        } catch (error) {
            console.error('Error fetching stats:', error);
        }
    };

    const handleDeleteCampaign = async (id: string) => {
        if (!confirm('Are you sure you want to delete this campaign?')) return;

        try {
            await fetch(`/api/email/campaigns/${id}`, { method: 'DELETE' });
            fetchCampaigns();
        } catch (error) {
            console.error('Error deleting campaign:', error);
        }
    };

    const filteredCampaigns = campaigns.filter(campaign =>
        campaign.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        campaign.subject.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-violet-50">
            {/* Header */}
            <div className="bg-white border-b border-slate-200">
                <div className="max-w-7xl mx-auto px-6 py-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
                                <div className="p-2 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-xl">
                                    <Mail className="w-6 h-6 text-white" />
                                </div>
                                Email Marketing
                            </h1>
                            <p className="text-slate-500 mt-1">Create, send, and track email campaigns</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <Link
                                href="/email/contacts"
                                className="px-4 py-2 text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors flex items-center gap-2"
                            >
                                <Users className="w-4 h-4" />
                                Contacts
                            </Link>
                            <button
                                onClick={() => router.push('/email/campaigns/new')}
                                className="px-4 py-2 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white rounded-lg font-medium hover:from-violet-500 hover:to-fuchsia-500 transition-all flex items-center gap-2 shadow-lg shadow-violet-500/25"
                            >
                                <Plus className="w-4 h-4" />
                                New Campaign
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-8">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                    <div className="bg-white rounded-2xl border border-slate-200 p-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-violet-100 rounded-xl">
                                <Mail className="w-6 h-6 text-violet-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-slate-800">{stats.totalCampaigns}</p>
                                <p className="text-sm text-slate-500">Total Campaigns</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl border border-slate-200 p-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-blue-100 rounded-xl">
                                <Users className="w-6 h-6 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-slate-800">{stats.totalContacts.toLocaleString()}</p>
                                <p className="text-sm text-slate-500">Total Contacts</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl border border-slate-200 p-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-emerald-100 rounded-xl">
                                <Eye className="w-6 h-6 text-emerald-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-slate-800">{stats.avgOpenRate.toFixed(1)}%</p>
                                <p className="text-sm text-slate-500">Avg Open Rate</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl border border-slate-200 p-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-amber-100 rounded-xl">
                                <BarChart3 className="w-6 h-6 text-amber-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-slate-800">{stats.avgClickRate.toFixed(1)}%</p>
                                <p className="text-sm text-slate-500">Avg Click Rate</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-2xl border border-slate-200 p-4 mb-6">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search campaigns..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                            />
                        </div>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 bg-white"
                        >
                            <option value="">All Status</option>
                            <option value="draft">Draft</option>
                            <option value="scheduled">Scheduled</option>
                            <option value="sending">Sending</option>
                            <option value="sent">Sent</option>
                            <option value="paused">Paused</option>
                        </select>
                    </div>
                </div>

                {/* Campaigns List */}
                <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                    {loading ? (
                        <div className="p-12 text-center">
                            <div className="w-8 h-8 border-2 border-violet-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                            <p className="text-slate-500">Loading campaigns...</p>
                        </div>
                    ) : filteredCampaigns.length === 0 ? (
                        <div className="p-12 text-center">
                            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Mail className="w-8 h-8 text-slate-400" />
                            </div>
                            <h3 className="text-lg font-semibold text-slate-800 mb-2">No campaigns yet</h3>
                            <p className="text-slate-500 mb-6">Create your first email campaign to get started</p>
                            <button
                                onClick={() => router.push('/email/campaigns/new')}
                                className="px-6 py-3 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white rounded-xl font-medium hover:from-violet-500 hover:to-fuchsia-500 transition-all inline-flex items-center gap-2"
                            >
                                <Plus className="w-5 h-5" />
                                Create Campaign
                            </button>
                        </div>
                    ) : (
                        <div className="divide-y divide-slate-100">
                            {filteredCampaigns.map((campaign) => {
                                const StatusIcon = statusConfig[campaign.status].icon;
                                return (
                                    <div
                                        key={campaign.id}
                                        className="p-6 hover:bg-slate-50 transition-colors"
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <h3 className="font-semibold text-slate-800">{campaign.name}</h3>
                                                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium flex items-center gap-1.5 ${statusConfig[campaign.status].color}`}>
                                                        <StatusIcon className="w-3.5 h-3.5" />
                                                        {statusConfig[campaign.status].label}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-slate-500 mb-3">{campaign.subject}</p>
                                                <div className="flex items-center gap-6 text-sm">
                                                    <span className="text-slate-500">
                                                        <Users className="w-4 h-4 inline mr-1.5" />
                                                        {campaign._count?.recipients || 0} recipients
                                                    </span>
                                                    {campaign.status === 'sent' && campaign.metrics && (
                                                        <>
                                                            <span className="text-emerald-600">
                                                                <Eye className="w-4 h-4 inline mr-1.5" />
                                                                {campaign.metrics.openRate.toFixed(1)}% opened
                                                            </span>
                                                            <span className="text-blue-600">
                                                                <BarChart3 className="w-4 h-4 inline mr-1.5" />
                                                                {campaign.metrics.clickRate.toFixed(1)}% clicked
                                                            </span>
                                                        </>
                                                    )}
                                                    {campaign.scheduledAt && (
                                                        <span className="text-blue-600">
                                                            <Clock className="w-4 h-4 inline mr-1.5" />
                                                            Scheduled: {new Date(campaign.scheduledAt).toLocaleDateString()}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Link
                                                    href={`/email/campaigns/${campaign.id}`}
                                                    className="p-2 text-slate-400 hover:text-violet-600 hover:bg-violet-50 rounded-lg transition-colors"
                                                >
                                                    <Eye className="w-5 h-5" />
                                                </Link>
                                                {campaign.status === 'draft' && (
                                                    <Link
                                                        href={`/email/campaigns/${campaign.id}/edit`}
                                                        className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                    >
                                                        <Edit className="w-5 h-5" />
                                                    </Link>
                                                )}
                                                <button
                                                    onClick={() => handleDeleteCampaign(campaign.id)}
                                                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                >
                                                    <Trash2 className="w-5 h-5" />
                                                </button>
                                                <ChevronRight className="w-5 h-5 text-slate-300" />
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
