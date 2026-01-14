'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
    ArrowLeft, Bot, Play, Pause, RefreshCw, Settings, Zap,
    Mail, MessageSquare, Clock, Users, CheckCircle2, XCircle,
    Plus, Trash2, ChevronRight, Sparkles, Calendar, Target,
    AlertTriangle, Shield, Edit2, Power
} from 'lucide-react';
import AutopilotSettingsModal from '@/components/AutopilotSettingsModal';

interface AutopilotConfig {
    enabled: boolean;
    contentGeneration: {
        enabled: boolean;
        brandVoice: string;
        autoApprove: boolean;
        maxPerWeek: number;
    };
    triggers: {
        welcomeEmail: boolean;
        reEngagement: boolean;
        churnPrevention: boolean;
        birthdayEmail: boolean;
        purchaseFollowup: boolean;
        dailyReel: boolean;
        weeklyShort: boolean;
    };
    recurringCampaigns: RecurringTemplate[];
    scheduling: {
        useAITiming: boolean;
        timezone: string;
        blackoutStart: number;
        blackoutEnd: number;
        blackoutDays: number[];
    };
    limits: {
        maxEmailsPerContact: number;
        maxSmsPerContact: number;
        requireApprovalAbove: number;
    };
}

interface RecurringTemplate {
    id: string;
    name: string;
    type: 'email' | 'sms';
    frequency: 'daily' | 'weekly' | 'monthly';
    dayOfWeek?: number;
    dayOfMonth?: number;
    hour: number;
    subject?: string;
    contentPrompt: string;
    audience: string;
    enabled: boolean;
}

interface PendingCampaign {
    id: string;
    name: string;
    type: 'email' | 'sms';
    subject?: string;
    content: string;
    audience: string;
    audienceSize: number;
    scheduledFor: string;
    status: string;
    trigger: string;
    aiConfidence: number;
}

const defaultConfig: AutopilotConfig = {
    enabled: false,
    contentGeneration: {
        enabled: false, brandVoice: '', autoApprove: false, maxPerWeek: 3
    },
    triggers: {
        welcomeEmail: false, reEngagement: false, churnPrevention: false, birthdayEmail: false, purchaseFollowup: false,
        dailyReel: false, weeklyShort: false
    },
    recurringCampaigns: [],
    scheduling: {
        useAITiming: true, timezone: 'UTC', blackoutStart: 0, blackoutEnd: 8, blackoutDays: []
    },
    limits: {
        maxEmailsPerContact: 2, maxSmsPerContact: 1, requireApprovalAbove: 50
    }
};

export default function AutopilotPage() {
    const [config, setConfig] = useState<AutopilotConfig>(defaultConfig);
    const [pendingCampaigns, setPendingCampaigns] = useState<PendingCampaign[]>([]);
    const [loading, setLoading] = useState(true);
    const [running, setRunning] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [showAddRecurring, setShowAddRecurring] = useState(false);

    useEffect(() => {
        fetchConfig();
    }, []);

    const fetchConfig = async () => {
        try {
            const response = await fetch('/api/marketing/autopilot');
            const data = await response.json();
            if (data.config) {
                setConfig(data.config);
            }
            setPendingCampaigns(data.pendingCampaigns || []);
        } catch (error) {
            console.error('Error fetching autopilot config:', error);
        } finally {
            setLoading(false);
        }
    };

    const toggleAutopilot = async () => {
        try {
            const response = await fetch('/api/marketing/autopilot', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'toggle' }),
            });
            const data = await response.json();
            if (data.success && config) {
                setConfig({ ...config, enabled: data.enabled });
            }
        } catch (error) {
            console.error('Error toggling autopilot:', error);
        }
    };

    const runAutopilot = async () => {
        setRunning(true);
        try {
            const response = await fetch('/api/marketing/autopilot', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'run' }),
            });
            const data = await response.json();
            if (data.success) {
                alert(`Autopilot ran successfully!\n${data.result.actions.join('\n')}`);
                fetchConfig();
            } else {
                alert('Failed to run autopilot. Please try again.');
            }
        } catch (error) {
            console.error('Error running autopilot:', error);
        } finally {
            setRunning(false);
        }
    };

    const approveCampaign = async (campaignId: string) => {
        try {
            const response = await fetch('/api/marketing/autopilot', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'approve', campaignId }),
            });
            const data = await response.json();
            if (data.success) {
                setPendingCampaigns(prev =>
                    prev.map(c => c.id === campaignId ? { ...c, status: 'approved' } : c)
                );
            }
        } catch (error) {
            console.error('Error approving campaign:', error);
        }
    };

    const updateConfig = async (updates: Partial<AutopilotConfig>) => {
        try {
            const response = await fetch('/api/marketing/autopilot', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'updateConfig', config: updates }),
            });
            const data = await response.json();
            if (data.success) {
                setConfig(data.config);
            }
        } catch (error) {
            console.error('Error updating config:', error);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-violet-50 flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-violet-600 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-violet-50">
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
                                    <div className={`p-2 rounded-xl ${config?.enabled ? 'bg-gradient-to-br from-emerald-500 to-green-600' : 'bg-gradient-to-br from-slate-400 to-slate-500'}`}>
                                        <Bot className="w-6 h-6 text-white" />
                                    </div>
                                    Marketing Autopilot
                                </h1>
                                <p className="text-slate-500 mt-1">AI-powered automatic campaign creation & sending</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => setShowSettings(true)}
                                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg font-medium hover:bg-slate-200 transition-all flex items-center gap-2"
                            >
                                <Settings className="w-4 h-4" />
                                Settings
                            </button>
                            <button
                                onClick={runAutopilot}
                                disabled={running}
                                className="px-4 py-2 bg-violet-100 text-violet-700 rounded-lg font-medium hover:bg-violet-200 disabled:opacity-50 transition-all flex items-center gap-2"
                            >
                                {running ? (
                                    <RefreshCw className="w-4 h-4 animate-spin" />
                                ) : (
                                    <Play className="w-4 h-4" />
                                )}
                                Run Now
                            </button>
                            <button
                                onClick={toggleAutopilot}
                                className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${config?.enabled
                                    ? 'bg-gradient-to-r from-emerald-600 to-green-600 text-white'
                                    : 'bg-slate-200 text-slate-600'
                                    }`}
                            >
                                <Power className="w-4 h-4" />
                                {config?.enabled ? 'Active' : 'Inactive'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-8">
                {/* Mode Indicator */}
                {config?.enabled && (
                    <div className={`rounded-2xl p-4 mb-4 flex items-center justify-between ${config.contentGeneration.autoApprove
                        ? 'bg-gradient-to-r from-rose-500 to-orange-500 text-white'
                        : 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white'
                        }`}>
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-white/20 rounded-lg">
                                {config.contentGeneration.autoApprove ? (
                                    <Zap className="w-5 h-5" />
                                ) : (
                                    <Shield className="w-5 h-5" />
                                )}
                            </div>
                            <div>
                                <p className="font-bold">
                                    {config.contentGeneration.autoApprove
                                        ? '🚀 FULL AUTO MODE - Zero Human Touch'
                                        : '🛡️ APPROVAL MODE - Human Review Required'}
                                </p>
                                <p className="text-sm text-white/80">
                                    {config.contentGeneration.autoApprove
                                        ? 'AI creates content → Creates campaigns → Sends automatically'
                                        : 'AI creates content → Awaits your approval → Then sends'}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={() => {
                                if (config) {
                                    updateConfig({
                                        contentGeneration: {
                                            ...config.contentGeneration,
                                            autoApprove: !config.contentGeneration.autoApprove,
                                        },
                                    });
                                }
                            }}
                            className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium transition-all"
                        >
                            Switch to {config.contentGeneration.autoApprove ? 'Approval Mode' : 'Full Auto'}
                        </button>
                    </div>
                )}

                {/* Status Banner */}
                <div className={`rounded-2xl p-6 mb-8 ${config?.enabled
                    ? 'bg-gradient-to-r from-emerald-600 to-green-600 text-white'
                    : 'bg-slate-100 text-slate-600'
                    }`}>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className={`p-3 rounded-xl ${config?.enabled ? 'bg-white/20' : 'bg-slate-200'}`}>
                                <Bot className="w-8 h-8" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold">
                                    {config?.enabled ? '🚀 Autopilot is Active' : '⏸️ Autopilot is Paused'}
                                </h2>
                                <p className={config?.enabled ? 'text-white/80' : 'text-slate-500'}>
                                    {config?.enabled
                                        ? (config.contentGeneration.autoApprove
                                            ? 'AI is automatically creating AND SENDING campaigns - no human intervention needed'
                                            : 'AI is creating campaigns that await your approval before sending')
                                        : 'Enable autopilot to start automatic campaign creation'}
                                </p>
                            </div>
                        </div>
                        {config?.enabled && (
                            <div className="flex items-center gap-6 text-sm">
                                <div>
                                    <p className="text-white/70">Created Today</p>
                                    <p className="text-2xl font-bold">{pendingCampaigns.length}</p>
                                </div>
                                {!config.contentGeneration.autoApprove && (
                                    <div>
                                        <p className="text-white/70">Pending Approval</p>
                                        <p className="text-2xl font-bold">{pendingCampaigns.filter(c => c.status === 'pending').length}</p>
                                    </div>
                                )}
                                {config.contentGeneration.autoApprove && (
                                    <div>
                                        <p className="text-white/70">Auto-Sent</p>
                                        <p className="text-2xl font-bold">{pendingCampaigns.filter(c => c.status === 'sent').length}</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column - Triggers & Features */}
                    <div className="lg:col-span-1 space-y-6">
                        {/* Automated Triggers */}
                        <div className="bg-white rounded-2xl border border-slate-200 p-6">
                            <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                                <Zap className="w-5 h-5 text-amber-500" />
                                Automated Triggers
                            </h3>
                            <div className="space-y-3">
                                {[
                                    { key: 'welcomeEmail', label: 'Welcome Email', icon: Mail, desc: 'Send to new contacts' },
                                    { key: 'reEngagement', label: 'Re-engagement', icon: RefreshCw, desc: 'Win back inactive contacts' },
                                    { key: 'churnPrevention', label: 'Churn Prevention', icon: Shield, desc: 'Save at-risk contacts' },
                                    { key: 'birthdayEmail', label: 'Birthday Email', icon: Calendar, desc: 'Celebrate with contacts' },
                                ].map(trigger => (
                                    <div key={trigger.key} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                                        <div className="flex items-center gap-3">
                                            <trigger.icon className="w-4 h-4 text-slate-500" />
                                            <div>
                                                <p className="font-medium text-slate-700">{trigger.label}</p>
                                                <p className="text-xs text-slate-500">{trigger.desc}</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => {
                                                if (config) {
                                                    updateConfig({
                                                        triggers: {
                                                            ...config.triggers,
                                                            [trigger.key]: !config.triggers[trigger.key as keyof typeof config.triggers],
                                                        },
                                                    });
                                                }
                                            }}
                                            className={`w-10 h-6 rounded-full transition-colors ${config?.triggers[trigger.key as keyof typeof config.triggers]
                                                ? 'bg-emerald-500'
                                                : 'bg-slate-300'
                                                }`}
                                        >
                                            <div className={`w-4 h-4 rounded-full bg-white shadow transition-transform ${config?.triggers[trigger.key as keyof typeof config.triggers]
                                                ? 'translate-x-5'
                                                : 'translate-x-1'
                                                }`} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* AI Settings */}
                        <div className="bg-white rounded-2xl border border-slate-200 p-6">
                            <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                                <Sparkles className="w-5 h-5 text-violet-500" />
                                AI Settings
                            </h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="text-sm font-medium text-slate-600">Brand Voice</label>
                                    <select
                                        value={config?.contentGeneration.brandVoice || 'professional'}
                                        onChange={(e) => {
                                            if (config) {
                                                updateConfig({
                                                    contentGeneration: { ...config.contentGeneration, brandVoice: e.target.value },
                                                });
                                            }
                                        }}
                                        className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
                                    >
                                        <option value="professional">Professional</option>
                                        <option value="casual">Casual</option>
                                        <option value="friendly">Friendly</option>
                                        <option value="formal">Formal</option>
                                        <option value="playful">Playful</option>
                                    </select>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="font-medium text-slate-700">Auto-Approve</p>
                                        <p className="text-xs text-slate-500">Skip manual review</p>
                                    </div>
                                    <button
                                        onClick={() => {
                                            if (config) {
                                                updateConfig({
                                                    contentGeneration: {
                                                        ...config.contentGeneration,
                                                        autoApprove: !config.contentGeneration.autoApprove,
                                                    },
                                                });
                                            }
                                        }}
                                        className={`w-10 h-6 rounded-full transition-colors ${config?.contentGeneration.autoApprove ? 'bg-emerald-500' : 'bg-slate-300'
                                            }`}
                                    >
                                        <div className={`w-4 h-4 rounded-full bg-white shadow transition-transform ${config?.contentGeneration.autoApprove ? 'translate-x-5' : 'translate-x-1'
                                            }`} />
                                    </button>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="font-medium text-slate-700">Use AI Timing</p>
                                        <p className="text-xs text-slate-500">Optimal send times</p>
                                    </div>
                                    <button
                                        onClick={() => {
                                            if (config) {
                                                updateConfig({
                                                    scheduling: {
                                                        ...config.scheduling,
                                                        useAITiming: !config.scheduling.useAITiming,
                                                    },
                                                });
                                            }
                                        }}
                                        className={`w-10 h-6 rounded-full transition-colors ${config?.scheduling.useAITiming ? 'bg-emerald-500' : 'bg-slate-300'
                                            }`}
                                    >
                                        <div className={`w-4 h-4 rounded-full bg-white shadow transition-transform ${config?.scheduling.useAITiming ? 'translate-x-5' : 'translate-x-1'
                                            }`} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Pending Campaigns & Recurring */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Pending Campaigns */}
                        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
                                <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                                    <AlertTriangle className="w-5 h-5 text-amber-500" />
                                    Pending Approval ({pendingCampaigns.filter(c => c.status === 'pending').length})
                                </h3>
                            </div>
                            {pendingCampaigns.length === 0 ? (
                                <div className="p-12 text-center">
                                    <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-4" />
                                    <p className="text-slate-600">No pending campaigns</p>
                                    <p className="text-sm text-slate-400">AI-generated campaigns will appear here for review</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-slate-100">
                                    {pendingCampaigns.map(campaign => (
                                        <div key={campaign.id} className="p-4 hover:bg-slate-50 transition-colors">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className={`p-2 rounded-lg ${campaign.type === 'email' ? 'bg-blue-100' : 'bg-emerald-100'
                                                        }`}>
                                                        {campaign.type === 'email' ? (
                                                            <Mail className="w-4 h-4 text-blue-600" />
                                                        ) : (
                                                            <MessageSquare className="w-4 h-4 text-emerald-600" />
                                                        )}
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center gap-2">
                                                            <p className="font-semibold text-slate-800">{campaign.name}</p>
                                                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${campaign.status === 'approved' ? 'bg-emerald-100 text-emerald-700' :
                                                                campaign.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                                                                    'bg-slate-100 text-slate-600'
                                                                }`}>
                                                                {campaign.status}
                                                            </span>
                                                        </div>
                                                        <p className="text-sm text-slate-500">
                                                            {campaign.audience} • {campaign.audienceSize} contacts •
                                                            <span className="text-violet-600"> AI: {Math.round(campaign.aiConfidence * 100)}%</span>
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    {campaign.status === 'pending' && (
                                                        <>
                                                            <button
                                                                onClick={() => approveCampaign(campaign.id)}
                                                                className="px-3 py-1.5 bg-emerald-100 text-emerald-700 rounded-lg text-sm font-medium hover:bg-emerald-200"
                                                            >
                                                                Approve
                                                            </button>
                                                            <button className="px-3 py-1.5 bg-slate-100 text-slate-600 rounded-lg text-sm font-medium hover:bg-slate-200">
                                                                Edit
                                                            </button>
                                                        </>
                                                    )}
                                                    <ChevronRight className="w-5 h-5 text-slate-300" />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Recurring Campaigns */}
                        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
                                <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                                    <Calendar className="w-5 h-5 text-violet-500" />
                                    Recurring Campaigns
                                </h3>
                                <button
                                    onClick={() => setShowAddRecurring(true)}
                                    className="px-3 py-1.5 bg-violet-100 text-violet-700 rounded-lg text-sm font-medium hover:bg-violet-200 flex items-center gap-1"
                                >
                                    <Plus className="w-4 h-4" />
                                    Add
                                </button>
                            </div>
                            {(!config?.recurringCampaigns || config.recurringCampaigns.length === 0) ? (
                                <div className="p-12 text-center">
                                    <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                                    <p className="text-slate-600">No recurring campaigns</p>
                                    <p className="text-sm text-slate-400">Set up weekly newsletters or monthly updates</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-slate-100">
                                    {config.recurringCampaigns.map(template => (
                                        <div key={template.id} className="p-4 flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className={`p-2 rounded-lg ${template.type === 'email' ? 'bg-blue-100' : 'bg-emerald-100'
                                                    }`}>
                                                    {template.type === 'email' ? (
                                                        <Mail className="w-4 h-4 text-blue-600" />
                                                    ) : (
                                                        <MessageSquare className="w-4 h-4 text-emerald-600" />
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-slate-800">{template.name}</p>
                                                    <p className="text-sm text-slate-500">
                                                        {template.frequency} • {template.audience}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${template.enabled ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'
                                                    }`}>
                                                    {template.enabled ? 'Active' : 'Paused'}
                                                </span>
                                                <button className="p-1.5 text-slate-400 hover:text-slate-600">
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                                <button className="p-1.5 text-slate-400 hover:text-red-500">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* How It Works */}
                <div className="mt-8 bg-gradient-to-r from-violet-600 to-purple-600 rounded-2xl p-8 text-white">
                    <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                        <Bot className="w-6 h-6" />
                        How Marketing Autopilot Works
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <div className="bg-white/10 rounded-xl p-4">
                            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center mb-3 font-bold text-lg">1</div>
                            <h3 className="font-semibold mb-2">Detect Triggers</h3>
                            <p className="text-sm text-white/80">AI monitors for new contacts, inactive users, and at-risk customers</p>
                        </div>
                        <div className="bg-white/10 rounded-xl p-4">
                            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center mb-3 font-bold text-lg">2</div>
                            <h3 className="font-semibold mb-2">Generate Content</h3>
                            <p className="text-sm text-white/80">AI creates personalized email/SMS content in your brand voice</p>
                        </div>
                        <div className="bg-white/10 rounded-xl p-4">
                            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center mb-3 font-bold text-lg">3</div>
                            <h3 className="font-semibold mb-2">Schedule Optimally</h3>
                            <p className="text-sm text-white/80">Predictive AI picks the best time to maximize engagement</p>
                        </div>
                        <div className="bg-white/10 rounded-xl p-4">
                            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center mb-3 font-bold text-lg">4</div>
                            <h3 className="font-semibold mb-2">Send & Track</h3>
                            <p className="text-sm text-white/80">Campaigns are sent automatically and metrics are tracked</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Settings Modal */}
            {
                config && (
                    <AutopilotSettingsModal
                        isOpen={showSettings}
                        onClose={() => setShowSettings(false)}
                        config={config as any}
                        onSave={updateConfig}
                    />
                )
            }
        </div >
    );
}
