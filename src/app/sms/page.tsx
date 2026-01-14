'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    ArrowLeft, Plus, Send, MessageSquare, Clock, Users,
    CheckCircle2, XCircle, BarChart3, Smartphone,
    ChevronRight, Zap, TrendingUp, MessageCircle, Search
} from 'lucide-react';

interface SMSCampaign {
    id: string;
    name: string;
    message: string;
    channel: 'sms' | 'whatsapp';
    status: 'draft' | 'scheduled' | 'sending' | 'sent' | 'active';
    scheduledFor?: string;
    sentAt?: string;
    recipientCount: number;
    deliveredCount: number;
    failedCount: number;
    clickCount?: number;
    createdAt: string;
}

interface SMSStats {
    totalCampaigns: number;
    totalSent: number;
    totalClicks: number;
    averageDeliveryRate: number;
}

export default function SMSPage() {
    const router = useRouter();
    const [campaigns, setCampaigns] = useState<SMSCampaign[]>([]);
    const [stats, setStats] = useState<SMSStats>({
        totalCampaigns: 0,
        totalSent: 0,
        totalClicks: 0,
        averageDeliveryRate: 0
    });
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [sending, setSending] = useState(false);
    const [newCampaign, setNewCampaign] = useState({
        name: '',
        message: '',
        channel: 'sms' as 'sms' | 'whatsapp'
    });

    useEffect(() => {
        fetchCampaigns();
    }, []);

    const fetchCampaigns = async () => {
        try {
            const response = await fetch('/api/sms/campaigns');
            const data = await response.json();
            setCampaigns(data.campaigns || []);
            setStats(data.stats || {
                totalCampaigns: 0,
                totalSent: 0,
                totalClicks: 0,
                averageDeliveryRate: 0
            });
        } catch (error) {
            console.error('Error fetching SMS campaigns:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSendCampaign = async () => {
        if (!newCampaign.name || !newCampaign.message) return;

        setSending(true);
        try {
            const response = await fetch('/api/sms/campaigns', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'send-now',
                    ...newCampaign
                })
            });

            const result = await response.json();

            if (result.success) {
                alert(`Campaign sent! ${result.result.sent} messages delivered, ${result.result.failed} failed.`);
                setShowCreateModal(false);
                setNewCampaign({ name: '', message: '', channel: 'sms' });
                fetchCampaigns();
            } else {
                alert(result.error || 'Failed to send campaign');
            }
        } catch (error) {
            alert('Failed to send campaign');
        } finally {
            setSending(false);
        }
    };

    const handleSaveDraft = async () => {
        if (!newCampaign.name || !newCampaign.message) return;

        try {
            const response = await fetch('/api/sms/campaigns', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newCampaign)
            });

            if (response.ok) {
                setShowCreateModal(false);
                setNewCampaign({ name: '', message: '', channel: 'sms' });
                fetchCampaigns();
            }
        } catch (error) {
            alert('Failed to save draft');
        }
    };

    const characterCount = newCampaign.message.length;
    const smsSegments = Math.ceil(characterCount / 160) || 1;

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50">
            {/* Header */}
            <div className="bg-white border-b border-slate-200">
                <div className="max-w-7xl mx-auto px-6 py-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Link
                                href="/dashboard"
                                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                            >
                                <ArrowLeft className="w-5 h-5" />
                            </Link>
                            <div>
                                <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
                                    <div className="p-2 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl">
                                        <MessageSquare className="w-6 h-6 text-white" />
                                    </div>
                                    SMS & WhatsApp
                                </h1>
                                <p className="text-slate-500 mt-1">Send SMS and WhatsApp campaigns</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-lg font-medium hover:from-emerald-500 hover:to-teal-500 transition-all flex items-center gap-2 shadow-lg shadow-emerald-500/25"
                        >
                            <Plus className="w-4 h-4" />
                            New Campaign
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-8">
                {/* Stats Overview */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                    <div className="bg-white rounded-2xl border border-slate-200 p-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-emerald-100 rounded-xl">
                                <MessageSquare className="w-6 h-6 text-emerald-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-slate-800">{stats.totalCampaigns}</p>
                                <p className="text-sm text-slate-500">Campaigns</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-2xl border border-slate-200 p-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-blue-100 rounded-xl">
                                <Send className="w-6 h-6 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-slate-800">{stats.totalSent.toLocaleString()}</p>
                                <p className="text-sm text-slate-500">Messages Sent</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-2xl border border-slate-200 p-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-purple-100 rounded-xl">
                                <TrendingUp className="w-6 h-6 text-purple-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-slate-800">{stats.totalClicks.toLocaleString()}</p>
                                <p className="text-sm text-slate-500">Link Clicks</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-2xl border border-slate-200 p-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-amber-100 rounded-xl">
                                <CheckCircle2 className="w-6 h-6 text-amber-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-slate-800">{stats.averageDeliveryRate}%</p>
                                <p className="text-sm text-slate-500">Delivery Rate</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Channel Tabs */}
                <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
                        <h2 className="text-lg font-semibold text-slate-800">Campaigns</h2>
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-slate-500">Powered by</span>
                            <span className="text-sm font-semibold text-red-600">Twilio</span>
                        </div>
                    </div>

                    {loading ? (
                        <div className="p-12 text-center">
                            <div className="w-8 h-8 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                            <p className="text-slate-500">Loading campaigns...</p>
                        </div>
                    ) : campaigns.length === 0 ? (
                        <div className="p-12 text-center">
                            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <MessageSquare className="w-8 h-8 text-slate-400" />
                            </div>
                            <h3 className="text-lg font-semibold text-slate-800 mb-2">No campaigns yet</h3>
                            <p className="text-slate-500 mb-6">Create your first SMS or WhatsApp campaign</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-slate-100">
                            {campaigns.map((campaign) => (
                                <div key={campaign.id} className="p-6 hover:bg-slate-50 transition-colors">
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <div className={`p-1.5 rounded-lg ${campaign.channel === 'whatsapp'
                                                        ? 'bg-green-100'
                                                        : 'bg-blue-100'
                                                    }`}>
                                                    {campaign.channel === 'whatsapp' ? (
                                                        <MessageCircle className={`w-4 h-4 text-green-600`} />
                                                    ) : (
                                                        <Smartphone className={`w-4 h-4 text-blue-600`} />
                                                    )}
                                                </div>
                                                <h3 className="font-semibold text-slate-800">{campaign.name}</h3>
                                                <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${campaign.status === 'sent' ? 'bg-emerald-100 text-emerald-700' :
                                                        campaign.status === 'active' ? 'bg-blue-100 text-blue-700' :
                                                            campaign.status === 'scheduled' ? 'bg-amber-100 text-amber-700' :
                                                                'bg-slate-100 text-slate-600'
                                                    }`}>
                                                    {campaign.status}
                                                </span>
                                            </div>
                                            <p className="text-sm text-slate-500 mb-3 line-clamp-1">{campaign.message}</p>
                                            <div className="flex items-center gap-6 text-sm">
                                                <span className="text-slate-500">
                                                    <Users className="w-4 h-4 inline mr-1.5" />
                                                    {campaign.recipientCount.toLocaleString()} recipients
                                                </span>
                                                <span className="text-emerald-600">
                                                    <CheckCircle2 className="w-4 h-4 inline mr-1.5" />
                                                    {campaign.deliveredCount.toLocaleString()} delivered
                                                </span>
                                                {campaign.failedCount > 0 && (
                                                    <span className="text-red-600">
                                                        <XCircle className="w-4 h-4 inline mr-1.5" />
                                                        {campaign.failedCount} failed
                                                    </span>
                                                )}
                                                {campaign.clickCount !== undefined && campaign.clickCount > 0 && (
                                                    <span className="text-purple-600">
                                                        <Zap className="w-4 h-4 inline mr-1.5" />
                                                        {campaign.clickCount} clicks
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <ChevronRight className="w-5 h-5 text-slate-300" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Quick Tips */}
                <div className="mt-8 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl p-8 text-white">
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                        <Zap className="w-6 h-6" />
                        SMS Marketing Best Practices
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-white/10 rounded-xl p-4">
                            <h3 className="font-semibold mb-2">Keep it Short</h3>
                            <p className="text-sm text-white/80">SMS under 160 characters sends as one message, saving costs</p>
                        </div>
                        <div className="bg-white/10 rounded-xl p-4">
                            <h3 className="font-semibold mb-2">Clear CTA</h3>
                            <p className="text-sm text-white/80">Include a clear call-to-action with a shortened URL</p>
                        </div>
                        <div className="bg-white/10 rounded-xl p-4">
                            <h3 className="font-semibold mb-2">Timing Matters</h3>
                            <p className="text-sm text-white/80">Send during business hours (9am-8pm local time)</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Create Campaign Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-2xl w-full max-w-lg m-4 overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-200">
                            <h3 className="text-lg font-semibold text-slate-800">New SMS/WhatsApp Campaign</h3>
                        </div>
                        <div className="p-6 space-y-4">
                            {/* Channel Selection */}
                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    onClick={() => setNewCampaign({ ...newCampaign, channel: 'sms' })}
                                    className={`p-4 rounded-xl border-2 transition-all ${newCampaign.channel === 'sms'
                                            ? 'border-blue-500 bg-blue-50'
                                            : 'border-slate-200 hover:border-slate-300'
                                        }`}
                                >
                                    <Smartphone className={`w-6 h-6 mx-auto mb-2 ${newCampaign.channel === 'sms' ? 'text-blue-600' : 'text-slate-400'
                                        }`} />
                                    <p className="font-medium text-slate-800">SMS</p>
                                    <p className="text-xs text-slate-500">Standard text message</p>
                                </button>
                                <button
                                    onClick={() => setNewCampaign({ ...newCampaign, channel: 'whatsapp' })}
                                    className={`p-4 rounded-xl border-2 transition-all ${newCampaign.channel === 'whatsapp'
                                            ? 'border-green-500 bg-green-50'
                                            : 'border-slate-200 hover:border-slate-300'
                                        }`}
                                >
                                    <MessageCircle className={`w-6 h-6 mx-auto mb-2 ${newCampaign.channel === 'whatsapp' ? 'text-green-600' : 'text-slate-400'
                                        }`} />
                                    <p className="font-medium text-slate-800">WhatsApp</p>
                                    <p className="text-xs text-slate-500">Rich messaging</p>
                                </button>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Campaign Name *
                                </label>
                                <input
                                    type="text"
                                    value={newCampaign.name}
                                    onChange={(e) => setNewCampaign({ ...newCampaign, name: e.target.value })}
                                    placeholder="e.g., Flash Sale Alert"
                                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Message *
                                </label>
                                <textarea
                                    value={newCampaign.message}
                                    onChange={(e) => setNewCampaign({ ...newCampaign, message: e.target.value })}
                                    placeholder="Type your message here..."
                                    rows={4}
                                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                />
                                <div className="flex justify-between mt-1 text-xs text-slate-500">
                                    <span>{characterCount} characters</span>
                                    <span className={characterCount > 160 ? 'text-amber-600' : ''}>
                                        {smsSegments} SMS segment{smsSegments > 1 ? 's' : ''}
                                    </span>
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 pt-4">
                                <button
                                    onClick={() => {
                                        setShowCreateModal(false);
                                        setNewCampaign({ name: '', message: '', channel: 'sms' });
                                    }}
                                    className="px-4 py-2.5 text-slate-600 hover:bg-slate-100 rounded-xl font-medium"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSaveDraft}
                                    className="px-4 py-2.5 bg-slate-100 text-slate-700 rounded-xl font-medium hover:bg-slate-200"
                                >
                                    Save Draft
                                </button>
                                <button
                                    onClick={handleSendCampaign}
                                    disabled={!newCampaign.name || !newCampaign.message || sending}
                                    className="px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl font-medium hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50 flex items-center gap-2"
                                >
                                    <Send className="w-4 h-4" />
                                    {sending ? 'Sending...' : 'Send Now'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
