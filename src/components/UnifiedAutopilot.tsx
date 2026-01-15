'use client';

import { useState, useEffect } from 'react';
import {
    Bot, Play, Pause, Settings, Zap, Power,
    Mail, MessageSquare, Clock, CheckCircle2,
    Sparkles, Calendar, Target, Shield,
    FileText, Video, Image as ImageIcon,
    Globe, TrendingUp, AlertCircle
} from 'lucide-react';

// Unified Autopilot Configuration
interface UnifiedAutopilotConfig {
    enabled: boolean;
    mode: 'approval' | 'auto'; // approval = human review, auto = fully automatic

    // Content Generation Settings
    content: {
        enabled: boolean;
        postsPerWeek: number;
        platforms: string[];
        languages: string[];
        topics: string[];
        brandVoice: 'professional' | 'casual' | 'friendly' | 'formal';
    };

    // Campaign Settings (Email/SMS)
    campaigns: {
        enabled: boolean;
        welcomeEmail: boolean;
        reEngagement: boolean;
        birthdayEmail: boolean;
        maxEmailsPerContact: number;
        maxSmsPerContact: number;
    };

    // Scheduling
    scheduling: {
        useAITiming: boolean;
        timezone: string;
        blackoutHours: { start: number; end: number };
    };
}

const defaultConfig: UnifiedAutopilotConfig = {
    enabled: false,
    mode: 'approval',
    content: {
        enabled: true,
        postsPerWeek: 7,
        platforms: ['linkedin', 'twitter', 'instagram'],
        languages: ['en'],
        topics: [],
        brandVoice: 'professional',
    },
    campaigns: {
        enabled: true,
        welcomeEmail: true,
        reEngagement: true,
        birthdayEmail: true,
        maxEmailsPerContact: 2,
        maxSmsPerContact: 1,
    },
    scheduling: {
        useAITiming: true,
        timezone: 'UTC',
        blackoutHours: { start: 22, end: 7 },
    },
};

interface UnifiedAutopilotProps {
    onConfigChange?: (config: UnifiedAutopilotConfig) => void;
}

export default function UnifiedAutopilot({ onConfigChange }: UnifiedAutopilotProps) {
    const [config, setConfig] = useState<UnifiedAutopilotConfig>(defaultConfig);
    const [activeTab, setActiveTab] = useState<'overview' | 'content' | 'campaigns' | 'settings'>('overview');
    const [isRunning, setIsRunning] = useState(false);

    // Simulated stats
    const stats = {
        contentGenerated: 24,
        campaignsSent: 156,
        engagementRate: 4.8,
        timeSaved: '12h',
    };

    const updateConfig = (updates: Partial<UnifiedAutopilotConfig>) => {
        const newConfig = { ...config, ...updates };
        setConfig(newConfig);
        onConfigChange?.(newConfig);
    };

    const toggleAutopilot = () => {
        updateConfig({ enabled: !config.enabled });
    };

    const runNow = async () => {
        setIsRunning(true);
        // Simulate running
        await new Promise(resolve => setTimeout(resolve, 2000));
        setIsRunning(false);
    };

    const tabs = [
        { id: 'overview', label: 'Overview', icon: Target },
        { id: 'content', label: 'Content', icon: FileText },
        { id: 'campaigns', label: 'Campaigns', icon: Mail },
        { id: 'settings', label: 'Settings', icon: Settings },
    ];

    return (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            {/* Header - Clean and Professional */}
            <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 p-6 text-white">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-xl ${config.enabled
                            ? 'bg-emerald-500/20 border border-emerald-400/30'
                            : 'bg-white/10 border border-white/20'}`}>
                            <Bot className={`w-8 h-8 ${config.enabled ? 'text-emerald-400' : 'text-white/70'}`} />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold flex items-center gap-3">
                                Autopilot
                                <span className={`px-2 py-0.5 rounded text-xs font-bold ${config.enabled
                                    ? 'bg-emerald-500/30 text-emerald-300 border border-emerald-400/30'
                                    : 'bg-white/10 text-white/50 border border-white/20'}`}>
                                    {config.enabled ? 'ACTIVE' : 'OFF'}
                                </span>
                            </h2>
                            <p className="text-white/60 text-sm mt-1">
                                {config.enabled
                                    ? config.mode === 'auto'
                                        ? '🚀 Fully automatic - AI handles everything'
                                        : '🛡️ Approval mode - You review before sending'
                                    : 'Enable to automate your marketing'}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={runNow}
                            disabled={!config.enabled || isRunning}
                            className="px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
                        >
                            {isRunning ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Running...
                                </>
                            ) : (
                                <>
                                    <Play className="w-4 h-4" />
                                    Run Now
                                </>
                            )}
                        </button>
                        <button
                            onClick={toggleAutopilot}
                            className={`px-5 py-2 rounded-lg font-bold text-sm transition-all flex items-center gap-2 ${config.enabled
                                ? 'bg-emerald-500 hover:bg-emerald-600 text-white'
                                : 'bg-white text-slate-900 hover:bg-slate-100'}`}
                        >
                            <Power className="w-4 h-4" />
                            {config.enabled ? 'Turn Off' : 'Turn On'}
                        </button>
                    </div>
                </div>

                {/* Quick Stats */}
                {config.enabled && (
                    <div className="grid grid-cols-4 gap-4 mt-6 pt-6 border-t border-white/10">
                        <div className="text-center">
                            <p className="text-2xl font-bold text-white">{stats.contentGenerated}</p>
                            <p className="text-xs text-white/50 mt-1">Content Generated</p>
                        </div>
                        <div className="text-center">
                            <p className="text-2xl font-bold text-white">{stats.campaignsSent}</p>
                            <p className="text-xs text-white/50 mt-1">Campaigns Sent</p>
                        </div>
                        <div className="text-center">
                            <p className="text-2xl font-bold text-emerald-400">{stats.engagementRate}%</p>
                            <p className="text-xs text-white/50 mt-1">Avg Engagement</p>
                        </div>
                        <div className="text-center">
                            <p className="text-2xl font-bold text-violet-400">{stats.timeSaved}</p>
                            <p className="text-xs text-white/50 mt-1">Time Saved</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Mode Selector */}
            {config.enabled && (
                <div className="p-4 bg-slate-50 border-b border-slate-200">
                    <div className="flex items-center gap-4">
                        <span className="text-sm font-medium text-slate-600">Mode:</span>
                        <div className="flex gap-2">
                            <button
                                onClick={() => updateConfig({ mode: 'approval' })}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${config.mode === 'approval'
                                    ? 'bg-blue-100 text-blue-700 border border-blue-200'
                                    : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300'}`}
                            >
                                <Shield className="w-4 h-4" />
                                Approval Mode
                            </button>
                            <button
                                onClick={() => updateConfig({ mode: 'auto' })}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${config.mode === 'auto'
                                    ? 'bg-rose-100 text-rose-700 border border-rose-200'
                                    : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300'}`}
                            >
                                <Zap className="w-4 h-4" />
                                Full Auto
                            </button>
                        </div>
                        <span className="text-xs text-slate-500 ml-2">
                            {config.mode === 'approval'
                                ? 'AI creates → You review → Then sends'
                                : '⚠️ AI creates and sends automatically'}
                        </span>
                    </div>
                </div>
            )}

            {/* Tabs */}
            <div className="border-b border-slate-200">
                <div className="flex">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`px-6 py-4 text-sm font-medium transition-all flex items-center gap-2 border-b-2 ${activeTab === tab.id
                                ? 'text-violet-600 border-violet-600 bg-violet-50/50'
                                : 'text-slate-500 border-transparent hover:text-slate-700 hover:bg-slate-50'}`}
                        >
                            <tab.icon className="w-4 h-4" />
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Tab Content */}
            <div className="p-6">
                {/* Overview Tab */}
                {activeTab === 'overview' && (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Content Automation Card */}
                            <div className={`p-6 rounded-xl border-2 transition-all ${config.content.enabled
                                ? 'border-blue-200 bg-blue-50/50'
                                : 'border-slate-200 bg-slate-50/50'}`}>
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded-lg ${config.content.enabled ? 'bg-blue-100' : 'bg-slate-200'}`}>
                                            <FileText className={`w-5 h-5 ${config.content.enabled ? 'text-blue-600' : 'text-slate-500'}`} />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-slate-800">Content Generation</h3>
                                            <p className="text-xs text-slate-500">Blogs, social posts, videos</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => updateConfig({
                                            content: { ...config.content, enabled: !config.content.enabled }
                                        })}
                                        className={`w-12 h-6 rounded-full transition-all ${config.content.enabled ? 'bg-blue-500' : 'bg-slate-300'}`}
                                    >
                                        <div className={`w-5 h-5 rounded-full bg-white shadow transition-transform ${config.content.enabled ? 'translate-x-6' : 'translate-x-1'}`} />
                                    </button>
                                </div>
                                <div className="text-sm text-slate-600">
                                    <p>📝 {config.content.postsPerWeek} posts per week</p>
                                    <p>🌍 {config.content.platforms.length} platforms</p>
                                    <p>🗣️ {config.content.brandVoice} tone</p>
                                </div>
                            </div>

                            {/* Campaign Automation Card */}
                            <div className={`p-6 rounded-xl border-2 transition-all ${config.campaigns.enabled
                                ? 'border-emerald-200 bg-emerald-50/50'
                                : 'border-slate-200 bg-slate-50/50'}`}>
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded-lg ${config.campaigns.enabled ? 'bg-emerald-100' : 'bg-slate-200'}`}>
                                            <Mail className={`w-5 h-5 ${config.campaigns.enabled ? 'text-emerald-600' : 'text-slate-500'}`} />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-slate-800">Email & SMS Campaigns</h3>
                                            <p className="text-xs text-slate-500">Automated outreach</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => updateConfig({
                                            campaigns: { ...config.campaigns, enabled: !config.campaigns.enabled }
                                        })}
                                        className={`w-12 h-6 rounded-full transition-all ${config.campaigns.enabled ? 'bg-emerald-500' : 'bg-slate-300'}`}
                                    >
                                        <div className={`w-5 h-5 rounded-full bg-white shadow transition-transform ${config.campaigns.enabled ? 'translate-x-6' : 'translate-x-1'}`} />
                                    </button>
                                </div>
                                <div className="text-sm text-slate-600">
                                    <p>📧 Welcome emails: {config.campaigns.welcomeEmail ? '✅' : '❌'}</p>
                                    <p>🔄 Re-engagement: {config.campaigns.reEngagement ? '✅' : '❌'}</p>
                                    <p>🎂 Birthday emails: {config.campaigns.birthdayEmail ? '✅' : '❌'}</p>
                                </div>
                            </div>
                        </div>

                        {/* How it Works */}
                        <div className="bg-gradient-to-r from-violet-600 to-purple-600 rounded-xl p-6 text-white">
                            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                                <Sparkles className="w-5 h-5" />
                                How Autopilot Works
                            </h3>
                            <div className="grid grid-cols-4 gap-4">
                                {[
                                    { step: '1', title: 'Analyze', desc: 'AI studies your brand & audience' },
                                    { step: '2', title: 'Create', desc: 'Generates content & campaigns' },
                                    { step: '3', title: 'Schedule', desc: 'Picks optimal times' },
                                    { step: '4', title: 'Publish', desc: 'Posts & tracks results' },
                                ].map(item => (
                                    <div key={item.step} className="text-center">
                                        <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-2 font-bold">
                                            {item.step}
                                        </div>
                                        <p className="font-semibold text-sm">{item.title}</p>
                                        <p className="text-xs text-white/70">{item.desc}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Content Tab */}
                {activeTab === 'content' && (
                    <div className="space-y-6">
                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    Posts Per Week
                                </label>
                                <input
                                    type="range"
                                    min="1"
                                    max="21"
                                    value={config.content.postsPerWeek}
                                    onChange={e => updateConfig({
                                        content: { ...config.content, postsPerWeek: parseInt(e.target.value) }
                                    })}
                                    className="w-full"
                                />
                                <p className="text-sm text-slate-500 mt-1">{config.content.postsPerWeek} posts/week</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    Brand Voice
                                </label>
                                <select
                                    value={config.content.brandVoice}
                                    onChange={e => updateConfig({
                                        content: { ...config.content, brandVoice: e.target.value as any }
                                    })}
                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                                >
                                    <option value="professional">Professional</option>
                                    <option value="casual">Casual</option>
                                    <option value="friendly">Friendly</option>
                                    <option value="formal">Formal</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Platforms
                            </label>
                            <div className="flex flex-wrap gap-2">
                                {['linkedin', 'twitter', 'instagram', 'facebook', 'tiktok', 'youtube'].map(platform => (
                                    <button
                                        key={platform}
                                        onClick={() => {
                                            const platforms = config.content.platforms.includes(platform)
                                                ? config.content.platforms.filter(p => p !== platform)
                                                : [...config.content.platforms, platform];
                                            updateConfig({ content: { ...config.content, platforms } });
                                        }}
                                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${config.content.platforms.includes(platform)
                                            ? 'bg-violet-100 text-violet-700 border border-violet-200'
                                            : 'bg-slate-100 text-slate-600 border border-slate-200'}`}
                                    >
                                        {platform.charAt(0).toUpperCase() + platform.slice(1)}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Campaigns Tab */}
                {activeTab === 'campaigns' && (
                    <div className="space-y-4">
                        {[
                            { key: 'welcomeEmail', label: 'Welcome Email', desc: 'Send to new contacts', icon: Mail },
                            { key: 'reEngagement', label: 'Re-engagement', desc: 'Win back inactive users', icon: TrendingUp },
                            { key: 'birthdayEmail', label: 'Birthday Email', desc: 'Celebrate with contacts', icon: Calendar },
                        ].map(item => (
                            <div key={item.key} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-white rounded-lg border border-slate-200">
                                        <item.icon className="w-5 h-5 text-slate-600" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-slate-800">{item.label}</p>
                                        <p className="text-xs text-slate-500">{item.desc}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => updateConfig({
                                        campaigns: {
                                            ...config.campaigns,
                                            [item.key]: !config.campaigns[item.key as keyof typeof config.campaigns]
                                        }
                                    })}
                                    className={`w-12 h-6 rounded-full transition-all ${config.campaigns[item.key as keyof typeof config.campaigns] ? 'bg-emerald-500' : 'bg-slate-300'}`}
                                >
                                    <div className={`w-5 h-5 rounded-full bg-white shadow transition-transform ${config.campaigns[item.key as keyof typeof config.campaigns] ? 'translate-x-6' : 'translate-x-1'}`} />
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                {/* Settings Tab */}
                {activeTab === 'settings' && (
                    <div className="space-y-6">
                        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                            <div>
                                <p className="font-medium text-slate-800">Use AI Timing</p>
                                <p className="text-xs text-slate-500">Let AI pick optimal send times</p>
                            </div>
                            <button
                                onClick={() => updateConfig({
                                    scheduling: { ...config.scheduling, useAITiming: !config.scheduling.useAITiming }
                                })}
                                className={`w-12 h-6 rounded-full transition-all ${config.scheduling.useAITiming ? 'bg-violet-500' : 'bg-slate-300'}`}
                            >
                                <div className={`w-5 h-5 rounded-full bg-white shadow transition-transform ${config.scheduling.useAITiming ? 'translate-x-6' : 'translate-x-1'}`} />
                            </button>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Timezone</label>
                            <select
                                value={config.scheduling.timezone}
                                onChange={e => updateConfig({
                                    scheduling: { ...config.scheduling, timezone: e.target.value }
                                })}
                                className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                            >
                                <option value="UTC">UTC</option>
                                <option value="America/New_York">Eastern (US)</option>
                                <option value="America/Los_Angeles">Pacific (US)</option>
                                <option value="Europe/London">London (UK)</option>
                                <option value="Asia/Kolkata">India (IST)</option>
                            </select>
                        </div>

                        <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
                            <div className="flex items-start gap-3">
                                <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
                                <div>
                                    <p className="font-medium text-amber-800">Safety Limits</p>
                                    <p className="text-sm text-amber-700 mt-1">
                                        Max {config.campaigns.maxEmailsPerContact} emails and {config.campaigns.maxSmsPerContact} SMS per contact per week to prevent spam.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
