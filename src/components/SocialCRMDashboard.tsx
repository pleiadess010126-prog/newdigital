'use client';

import { useState, useEffect } from 'react';
import {
    Users, Heart, MessageSquare, UserPlus, Share2, Send,
    TrendingUp, Filter, Search, MoreVertical, ChevronRight,
    Instagram, Facebook, Youtube, Linkedin, Twitter, Globe,
    Sparkles, Zap, Target, Star, Mail, Clock, CheckCircle2,
    XCircle, Bell, Tag, ArrowUpRight, BarChart3, Activity,
    Eye, UserCheck, MessageCircle, Loader2, RefreshCw, Link2
} from 'lucide-react';
import { socialCRM, type Lead, type Platform, type LeadStatus, type SocialCRMStats, type Engagement } from '@/lib/crm/socialCRM';
import ExternalIntegrationView from './ExternalIntegrationView';

const platformIcons: Record<Platform, React.ReactNode> = {
    instagram: <Instagram className="w-4 h-4 text-pink-500" />,
    facebook: <Facebook className="w-4 h-4 text-blue-600" />,
    youtube: <Youtube className="w-4 h-4 text-red-500" />,
    linkedin: <Linkedin className="w-4 h-4 text-blue-700" />,
    tiktok: <Globe className="w-4 h-4 text-slate-800" />,
    twitter: <Twitter className="w-4 h-4 text-sky-500" />
};

const statusColors: Record<LeadStatus, { bg: string; text: string; dot: string }> = {
    cold: { bg: 'bg-slate-100', text: 'text-slate-600', dot: 'bg-slate-400' },
    warm: { bg: 'bg-amber-100', text: 'text-amber-700', dot: 'bg-amber-400' },
    hot: { bg: 'bg-rose-100', text: 'text-rose-700', dot: 'bg-rose-500' },
    customer: { bg: 'bg-emerald-100', text: 'text-emerald-700', dot: 'bg-emerald-500' },
    churned: { bg: 'bg-gray-100', text: 'text-gray-500', dot: 'bg-gray-400' }
};

export default function SocialCRMDashboard() {
    const [activeSubTab, setActiveSubTab] = useState<'engagement' | 'integration'>('engagement');
    const [stats, setStats] = useState<SocialCRMStats | null>(null);
    const [leads, setLeads] = useState<Lead[]>([]);
    const [recentEngagements, setRecentEngagements] = useState<Engagement[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
    const [filter, setFilter] = useState<{ status?: LeadStatus; platform?: Platform; search: string }>({ search: '' });
    const [sendingDM, setSendingDM] = useState<string | null>(null);

    useEffect(() => {
        if (activeSubTab === 'engagement') {
            loadData();
        }
    }, [activeSubTab]);

    const loadData = async () => {
        setLoading(true);
        const [statsData, leadsData, engagementsData] = await Promise.all([
            socialCRM.getStats(),
            socialCRM.getLeads(),
            socialCRM.getRecentEngagements(10)
        ]);
        setStats(statsData);
        setLeads(leadsData);
        setRecentEngagements(engagementsData);
        setLoading(false);
    };

    const handleSendDM = async (leadId: string) => {
        setSendingDM(leadId);
        await socialCRM.sendDM(leadId, 'tmpl-2');
        await loadData();
        setSendingDM(null);
    };

    const filteredLeads = leads.filter(lead => {
        if (filter.status && lead.status !== filter.status) return false;
        if (filter.platform && lead.primaryPlatform !== filter.platform) return false;
        if (filter.search) {
            const q = filter.search.toLowerCase();
            if (!lead.name?.toLowerCase().includes(q) &&
                !lead.socialProfiles.some(p => p.username.toLowerCase().includes(q))) {
                return false;
            }
        }
        return true;
    });

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header with Tabs */}
            <div className="flex flex-col gap-6">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
                            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-violet-600 to-fuchsia-600 flex items-center justify-center shadow-lg shadow-violet-500/30">
                                <Users className="w-5 h-5 text-white" />
                            </div>
                            Unified Leads Dashboard
                        </h1>
                        <p className="text-slate-500 mt-1">Manage Social Engagement and CRM Integrations in one place.</p>
                    </div>
                    <div className="flex bg-slate-100 p-1 rounded-xl">
                        <button
                            onClick={() => setActiveSubTab('engagement')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${activeSubTab === 'engagement'
                                ? 'bg-white text-violet-700 shadow-sm'
                                : 'text-slate-600 hover:text-slate-900'
                                }`}
                        >
                            <MessageSquare className="w-4 h-4" />
                            Social Engagement
                        </button>
                        <button
                            onClick={() => setActiveSubTab('integration')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${activeSubTab === 'integration'
                                ? 'bg-white text-indigo-700 shadow-sm'
                                : 'text-slate-600 hover:text-slate-900'
                                }`}
                        >
                            <Link2 className="w-4 h-4" />
                            External Integrations & Scoring
                        </button>
                    </div>
                </div>
            </div>

            {activeSubTab === 'integration' ? (
                <ExternalIntegrationView />
            ) : (
                loading ? (
                    <div className="flex items-center justify-center min-h-[400px]">
                        <div className="flex flex-col items-center gap-3">
                            <Loader2 className="w-8 h-8 text-violet-600 animate-spin" />
                            <p className="text-slate-500 font-medium">Loading Social CRM...</p>
                        </div>
                    </div>
                ) : (
                    <>
                        {/* Header Actions for Engagement View */}
                        <div className="flex justify-end gap-3 -mt-4">
                            <button
                                onClick={loadData}
                                className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 transition-all"
                            >
                                <RefreshCw className="w-4 h-4" />
                                Refresh
                            </button>
                            <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white rounded-xl text-sm font-semibold shadow-lg shadow-violet-500/30 hover:shadow-xl transition-all">
                                <Zap className="w-4 h-4" />
                                Automation Rules
                            </button>
                        </div>

                        {/* Stats Overview */}
                        {stats && (
                            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                                <StatCard
                                    icon={<Users className="w-5 h-5" />}
                                    label="Total Leads"
                                    value={stats.totalLeads}
                                    change={`+${stats.newLeadsToday} today`}
                                    color="violet"
                                />
                                <StatCard
                                    icon={<Heart className="w-5 h-5" />}
                                    label="Total Engagements"
                                    value={stats.totalEngagements}
                                    change={`+${stats.engagementsToday} today`}
                                    color="rose"
                                />
                                <StatCard
                                    icon={<Target className="w-5 h-5" />}
                                    label="Hot Leads"
                                    value={stats.leadsByStatus.hot}
                                    change="Ready to convert"
                                    color="orange"
                                />
                                <StatCard
                                    icon={<UserCheck className="w-5 h-5" />}
                                    label="Customers"
                                    value={stats.leadsByStatus.customer}
                                    change={`${stats.conversionRate.toFixed(1)}% rate`}
                                    color="emerald"
                                />
                                <StatCard
                                    icon={<Send className="w-5 h-5" />}
                                    label="DMs Sent Today"
                                    value={stats.dmsSentToday}
                                    change={`${stats.dmResponseRate}% response`}
                                    color="blue"
                                />
                                <StatCard
                                    icon={<TrendingUp className="w-5 h-5" />}
                                    label="Customer Value"
                                    value={`$${stats.totalCustomerValue.toLocaleString()}`}
                                    change="Lifetime value"
                                    color="amber"
                                />
                            </div>
                        )}

                        {/* Lead Funnel Visual */}
                        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 rounded-3xl p-6 shadow-xl">
                            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                <BarChart3 className="w-5 h-5 text-violet-400" />
                                Lead Funnel
                            </h3>
                            <div className="flex items-center justify-between gap-2">
                                {stats && (
                                    <>
                                        <FunnelStage
                                            label="Cold"
                                            count={stats.leadsByStatus.cold}
                                            color="slate"
                                            width="100%"
                                        />
                                        <ChevronRight className="w-6 h-6 text-slate-600 flex-shrink-0" />
                                        <FunnelStage
                                            label="Warm"
                                            count={stats.leadsByStatus.warm}
                                            color="amber"
                                            width="75%"
                                        />
                                        <ChevronRight className="w-6 h-6 text-slate-600 flex-shrink-0" />
                                        <FunnelStage
                                            label="Hot"
                                            count={stats.leadsByStatus.hot}
                                            color="orange"
                                            width="50%"
                                        />
                                        <ChevronRight className="w-6 h-6 text-slate-600 flex-shrink-0" />
                                        <FunnelStage
                                            label="Customer"
                                            count={stats.leadsByStatus.customer}
                                            color="emerald"
                                            width="35%"
                                        />
                                    </>
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Leads List */}
                            <div className="lg:col-span-2 space-y-4">
                                {/* Filters */}
                                <div className="flex flex-wrap items-center gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                                    <div className="relative flex-1 min-w-[200px]">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                        <input
                                            type="text"
                                            placeholder="Search leads..."
                                            value={filter.search}
                                            onChange={(e) => setFilter({ ...filter, search: e.target.value })}
                                            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500"
                                        />
                                    </div>
                                    <select
                                        value={filter.status || ''}
                                        onChange={(e) => setFilter({ ...filter, status: e.target.value as LeadStatus || undefined })}
                                        className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20"
                                    >
                                        <option value="">All Status</option>
                                        <option value="cold">Cold</option>
                                        <option value="warm">Warm</option>
                                        <option value="hot">Hot</option>
                                        <option value="customer">Customer</option>
                                    </select>
                                    <select
                                        value={filter.platform || ''}
                                        onChange={(e) => setFilter({ ...filter, platform: e.target.value as Platform || undefined })}
                                        className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20"
                                    >
                                        <option value="">All Platforms</option>
                                        <option value="instagram">Instagram</option>
                                        <option value="facebook">Facebook</option>
                                        <option value="youtube">YouTube</option>
                                        <option value="linkedin">LinkedIn</option>
                                    </select>
                                </div>

                                {/* Leads Table */}
                                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                                    <div className="overflow-x-auto">
                                        <table className="w-full">
                                            <thead>
                                                <tr className="bg-slate-50 border-b border-slate-200">
                                                    <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase">Lead</th>
                                                    <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase">Score</th>
                                                    <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase">Status</th>
                                                    <th className="text-center px-4 py-3 text-xs font-bold text-slate-500 uppercase">Engagements</th>
                                                    <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase">Last Activity</th>
                                                    <th className="text-right px-4 py-3 text-xs font-bold text-slate-500 uppercase">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {filteredLeads.map((lead) => (
                                                    <tr
                                                        key={lead.id}
                                                        className="border-b border-slate-100 hover:bg-slate-50 cursor-pointer transition-colors"
                                                        onClick={() => setSelectedLead(lead)}
                                                    >
                                                        <td className="px-4 py-3">
                                                            <div className="flex items-center gap-3">
                                                                <div className="relative">
                                                                    <img
                                                                        src={lead.socialProfiles[0].profilePictureUrl || `https://i.pravatar.cc/150?u=${lead.id}`}
                                                                        alt={lead.name || ''}
                                                                        className="w-10 h-10 rounded-full object-cover border-2 border-white shadow"
                                                                    />
                                                                    <div className="absolute -bottom-1 -right-1">
                                                                        {platformIcons[lead.primaryPlatform]}
                                                                    </div>
                                                                </div>
                                                                <div>
                                                                    <p className="font-semibold text-slate-900">{lead.name}</p>
                                                                    <p className="text-xs text-slate-500">@{lead.socialProfiles[0].username}</p>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-4 py-3">
                                                            <div className="flex items-center gap-2">
                                                                <div className="w-12 h-2 bg-slate-100 rounded-full overflow-hidden">
                                                                    <div
                                                                        className={`h-full rounded-full ${lead.score >= 80 ? 'bg-gradient-to-r from-rose-500 to-orange-500' :
                                                                            lead.score >= 50 ? 'bg-gradient-to-r from-amber-400 to-amber-500' :
                                                                                'bg-slate-300'
                                                                            }`}
                                                                        style={{ width: `${lead.score}%` }}
                                                                    />
                                                                </div>
                                                                <span className="text-sm font-bold text-slate-700">{lead.score}</span>
                                                            </div>
                                                        </td>
                                                        <td className="px-4 py-3">
                                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${statusColors[lead.status].bg} ${statusColors[lead.status].text}`}>
                                                                <span className={`w-1.5 h-1.5 rounded-full ${statusColors[lead.status].dot}`} />
                                                                {lead.status.charAt(0).toUpperCase() + lead.status.slice(1)}
                                                            </span>
                                                        </td>
                                                        <td className="px-4 py-3">
                                                            <div className="flex items-center justify-center gap-3">
                                                                <div className="flex items-center gap-1" title="Likes">
                                                                    <Heart className="w-3.5 h-3.5 text-rose-400" />
                                                                    <span className="text-xs font-medium text-slate-600">{lead.likesCount}</span>
                                                                </div>
                                                                <div className="flex items-center gap-1" title="Comments">
                                                                    <MessageSquare className="w-3.5 h-3.5 text-blue-400" />
                                                                    <span className="text-xs font-medium text-slate-600">{lead.commentsCount}</span>
                                                                </div>
                                                                {lead.isFollower && (
                                                                    <div className="flex items-center gap-1" title="Follower">
                                                                        <UserPlus className="w-3.5 h-3.5 text-emerald-400" />
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </td>
                                                        <td className="px-4 py-3">
                                                            <p className="text-xs text-slate-500">
                                                                {formatTimeAgo(lead.lastEngagementAt)}
                                                            </p>
                                                        </td>
                                                        <td className="px-4 py-3">
                                                            <div className="flex items-center justify-end gap-2">
                                                                {!lead.dmSent ? (
                                                                    <button
                                                                        onClick={(e) => { e.stopPropagation(); handleSendDM(lead.id); }}
                                                                        disabled={sendingDM === lead.id}
                                                                        className="flex items-center gap-1 px-3 py-1.5 bg-violet-600 text-white rounded-lg text-xs font-semibold hover:bg-violet-700 transition-all disabled:opacity-50"
                                                                    >
                                                                        {sendingDM === lead.id ? (
                                                                            <Loader2 className="w-3 h-3 animate-spin" />
                                                                        ) : (
                                                                            <Send className="w-3 h-3" />
                                                                        )}
                                                                        Send DM
                                                                    </button>
                                                                ) : (
                                                                    <span className="flex items-center gap-1 px-3 py-1.5 bg-emerald-100 text-emerald-700 rounded-lg text-xs font-semibold">
                                                                        <CheckCircle2 className="w-3 h-3" />
                                                                        DM Sent
                                                                    </span>
                                                                )}
                                                                <button className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all">
                                                                    <MoreVertical className="w-4 h-4" />
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>

                            {/* Right Sidebar */}
                            <div className="space-y-4">
                                {/* Recent Engagements */}
                                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
                                    <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                                        <Activity className="w-5 h-5 text-violet-500" />
                                        Live Engagement Feed
                                    </h3>
                                    <div className="space-y-3">
                                        {recentEngagements.map((eng) => {
                                            const lead = leads.find(l => l.id === eng.leadId);
                                            return (
                                                <div key={eng.id} className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl">
                                                    <div className="w-8 h-8 rounded-full bg-slate-200 overflow-hidden flex-shrink-0">
                                                        <img
                                                            src={lead?.socialProfiles[0].profilePictureUrl || `https://i.pravatar.cc/150?u=${eng.leadId}`}
                                                            alt=""
                                                            className="w-full h-full object-cover"
                                                        />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm text-slate-700">
                                                            <span className="font-semibold">{lead?.name || 'Someone'}</span>
                                                            {' '}
                                                            <span className="text-slate-500">
                                                                {eng.type === 'like' && 'liked'}
                                                                {eng.type === 'comment' && 'commented on'}
                                                                {eng.type === 'follow' && 'followed you'}
                                                                {eng.type === 'share' && 'shared'}
                                                            </span>
                                                            {eng.contentTitle && (
                                                                <span className="text-slate-700"> "{eng.contentTitle.substring(0, 25)}..."</span>
                                                            )}
                                                        </p>
                                                        <p className="text-xs text-slate-400 mt-1">
                                                            {formatTimeAgo(eng.timestamp)}
                                                        </p>
                                                    </div>
                                                    {eng.type === 'like' && <Heart className="w-4 h-4 text-rose-500 flex-shrink-0" />}
                                                    {eng.type === 'comment' && <MessageSquare className="w-4 h-4 text-blue-500 flex-shrink-0" />}
                                                    {eng.type === 'follow' && <UserPlus className="w-4 h-4 text-emerald-500 flex-shrink-0" />}
                                                    {eng.type === 'share' && <Share2 className="w-4 h-4 text-violet-500 flex-shrink-0" />}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Platform Breakdown */}
                                {stats && (
                                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
                                        <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                                            <Globe className="w-5 h-5 text-blue-500" />
                                            Leads by Platform
                                        </h3>
                                        <div className="space-y-3">
                                            {Object.entries(stats.leadsByPlatform)
                                                .filter(([, count]) => count > 0)
                                                .sort(([, a], [, b]) => b - a)
                                                .map(([platform, count]) => (
                                                    <div key={platform} className="flex items-center gap-3">
                                                        {platformIcons[platform as Platform]}
                                                        <span className="flex-1 text-sm text-slate-600 capitalize">{platform}</span>
                                                        <span className="text-sm font-bold text-slate-900">{count}</span>
                                                        <div className="w-20 h-2 bg-slate-100 rounded-full overflow-hidden">
                                                            <div
                                                                className="h-full bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-full"
                                                                style={{ width: `${(count / stats.totalLeads) * 100}%` }}
                                                            />
                                                        </div>
                                                    </div>
                                                ))
                                            }
                                        </div>
                                    </div>
                                )}

                                {/* Quick Actions */}
                                <div className="bg-gradient-to-br from-violet-600 to-fuchsia-600 rounded-2xl p-5 shadow-xl text-white">
                                    <h3 className="font-bold mb-3 flex items-center gap-2">
                                        <Sparkles className="w-5 h-5" />
                                        Quick Actions
                                    </h3>
                                    <div className="space-y-2">
                                        <button className="w-full flex items-center gap-3 p-3 bg-white/10 hover:bg-white/20 rounded-xl transition-all text-left">
                                            <Send className="w-5 h-5" />
                                            <span className="text-sm font-medium">DM All Warm Leads</span>
                                        </button>
                                        <button className="w-full flex items-center gap-3 p-3 bg-white/10 hover:bg-white/20 rounded-xl transition-all text-left">
                                            <Tag className="w-5 h-5" />
                                            <span className="text-sm font-medium">Bulk Add Tags</span>
                                        </button>
                                        <button className="w-full flex items-center gap-3 p-3 bg-white/10 hover:bg-white/20 rounded-xl transition-all text-left">
                                            <Mail className="w-5 h-5" />
                                            <span className="text-sm font-medium">Export Leads CSV</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Lead Detail Modal */}
                        {selectedLead && (
                            <LeadDetailModal lead={selectedLead} onClose={() => setSelectedLead(null)} />
                        )}
                    </>
                )
            )}
        </div>
    );
}

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

function StatCard({ icon, label, value, change, color }: {
    icon: React.ReactNode;
    label: string;
    value: string | number;
    change: string;
    color: string;
}) {
    const colorClasses: Record<string, string> = {
        violet: 'from-violet-500 to-fuchsia-500 shadow-violet-500/30',
        rose: 'from-rose-500 to-pink-500 shadow-rose-500/30',
        orange: 'from-orange-500 to-amber-500 shadow-orange-500/30',
        emerald: 'from-emerald-500 to-teal-500 shadow-emerald-500/30',
        blue: 'from-blue-500 to-cyan-500 shadow-blue-500/30',
        amber: 'from-amber-500 to-yellow-500 shadow-amber-500/30'
    };

    return (
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm hover:shadow-md transition-all">
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${colorClasses[color]} flex items-center justify-center text-white shadow-lg mb-3`}>
                {icon}
            </div>
            <p className="text-2xl font-bold text-slate-900">{value}</p>
            <p className="text-xs text-slate-500 font-medium">{label}</p>
            <p className="text-xs text-emerald-600 mt-1 font-medium">{change}</p>
        </div>
    );
}

function FunnelStage({ label, count, color, width }: {
    label: string;
    count: number;
    color: string;
    width: string;
}) {
    const colorClasses: Record<string, string> = {
        slate: 'from-slate-400 to-slate-500',
        amber: 'from-amber-400 to-amber-500',
        orange: 'from-orange-500 to-rose-500',
        emerald: 'from-emerald-400 to-emerald-500'
    };

    return (
        <div className="flex-1 text-center">
            <div
                className={`h-16 bg-gradient-to-br ${colorClasses[color]} rounded-xl flex items-center justify-center mx-auto shadow-lg`}
                style={{ width }}
            >
                <span className="text-2xl font-black text-white">{count}</span>
            </div>
            <p className="text-xs font-bold text-slate-400 mt-2 uppercase tracking-wider">{label}</p>
        </div>
    );
}

function LeadDetailModal({ lead, onClose }: { lead: Lead; onClose: () => void }) {
    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div
                className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="p-6 border-b border-slate-200">
                    <div className="flex items-start justify-between">
                        <div className="flex items-center gap-4">
                            <img
                                src={lead.socialProfiles[0].profilePictureUrl || `https://i.pravatar.cc/150?u=${lead.id}`}
                                alt={lead.name || ''}
                                className="w-16 h-16 rounded-2xl object-cover border-4 border-white shadow-lg"
                            />
                            <div>
                                <h2 className="text-xl font-bold text-slate-900">{lead.name}</h2>
                                <p className="text-sm text-slate-500 flex items-center gap-2">
                                    {platformIcons[lead.primaryPlatform]}
                                    @{lead.socialProfiles[0].username}
                                </p>
                                <div className="flex items-center gap-2 mt-2">
                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${statusColors[lead.status].bg} ${statusColors[lead.status].text}`}>
                                        <span className={`w-1.5 h-1.5 rounded-full ${statusColors[lead.status].dot}`} />
                                        {lead.status.charAt(0).toUpperCase() + lead.status.slice(1)}
                                    </span>
                                    <span className="px-2.5 py-1 bg-violet-100 text-violet-700 rounded-full text-xs font-bold">
                                        Score: {lead.score}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-all"
                        >
                            <XCircle className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                <div className="p-6 space-y-6">
                    {/* Engagement Stats */}
                    <div>
                        <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3">Engagement Summary</h3>
                        <div className="grid grid-cols-4 gap-4">
                            <div className="text-center p-4 bg-slate-50 rounded-xl">
                                <Heart className="w-6 h-6 text-rose-500 mx-auto mb-2" />
                                <p className="text-2xl font-bold text-slate-900">{lead.likesCount}</p>
                                <p className="text-xs text-slate-500">Likes</p>
                            </div>
                            <div className="text-center p-4 bg-slate-50 rounded-xl">
                                <MessageSquare className="w-6 h-6 text-blue-500 mx-auto mb-2" />
                                <p className="text-2xl font-bold text-slate-900">{lead.commentsCount}</p>
                                <p className="text-xs text-slate-500">Comments</p>
                            </div>
                            <div className="text-center p-4 bg-slate-50 rounded-xl">
                                <Share2 className="w-6 h-6 text-violet-500 mx-auto mb-2" />
                                <p className="text-2xl font-bold text-slate-900">{lead.sharesCount}</p>
                                <p className="text-xs text-slate-500">Shares</p>
                            </div>
                            <div className="text-center p-4 bg-slate-50 rounded-xl">
                                <UserPlus className="w-6 h-6 text-emerald-500 mx-auto mb-2" />
                                <p className="text-2xl font-bold text-slate-900">{lead.isFollower ? 'Yes' : 'No'}</p>
                                <p className="text-xs text-slate-500">Follower</p>
                            </div>
                        </div>
                    </div>

                    {/* Interests */}
                    {lead.interests.length > 0 && (
                        <div>
                            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3">Detected Interests</h3>
                            <div className="flex flex-wrap gap-2">
                                {lead.interests.map((interest, i) => (
                                    <span key={i} className="px-3 py-1.5 bg-violet-100 text-violet-700 rounded-full text-sm font-medium">
                                        {interest}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Top Engaged Content */}
                    {lead.topEngagedContent.length > 0 && (
                        <div>
                            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3">Engaged With</h3>
                            <div className="space-y-2">
                                {lead.topEngagedContent.map((content, i) => (
                                    <div key={i} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                                        <Eye className="w-4 h-4 text-slate-400" />
                                        <span className="text-sm text-slate-700">{content}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Notes */}
                    {lead.notes.length > 0 && (
                        <div>
                            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3">Notes</h3>
                            <div className="space-y-2">
                                {lead.notes.map((note, i) => (
                                    <div key={i} className="p-3 bg-amber-50 border border-amber-100 rounded-xl text-sm text-amber-800">
                                        {note}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Tags */}
                    {lead.tags.length > 0 && (
                        <div>
                            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3">Tags</h3>
                            <div className="flex flex-wrap gap-2">
                                {lead.tags.map((tag, i) => (
                                    <span key={i} className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-100 text-slate-700 rounded-full text-sm font-medium">
                                        <Tag className="w-3 h-3" />
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <div className="p-6 border-t border-slate-200 flex gap-3">
                    <button className="flex-1 py-3 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white rounded-xl font-semibold shadow-lg shadow-violet-500/30 hover:shadow-xl transition-all flex items-center justify-center gap-2">
                        <Send className="w-4 h-4" />
                        Send DM
                    </button>
                    <button className="px-6 py-3 border border-slate-200 text-slate-700 rounded-xl font-semibold hover:bg-slate-50 transition-all">
                        Add Note
                    </button>
                    <button className="px-6 py-3 border border-slate-200 text-slate-700 rounded-xl font-semibold hover:bg-slate-50 transition-all">
                        Add Tag
                    </button>
                </div>
            </div>
        </div>
    );
}

// ============================================================================
// HELPERS
// ============================================================================

function formatTimeAgo(date: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
}
