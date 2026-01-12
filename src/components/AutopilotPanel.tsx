'use client';

import { useState, useEffect } from 'react';
import {
    Zap, Shield, Clock, Brain, Settings,
    Play, Pause, RefreshCw, CheckCircle2,
    AlertCircle, Target, Rocket
} from 'lucide-react';
import { getAutopilotManager, AutopilotConfig, AutomationMode } from '@/lib/ai/autopilot';
import { useAuth } from '@/lib/auth/AuthContext';
import { canUseFeature } from '@/lib/billing/permissions';

export default function AutopilotPanel() {
    const { user } = useAuth();
    const [config, setConfig] = useState<AutopilotConfig | null>(null);
    const [isSyncing, setIsSyncing] = useState(false);
    const [lastSync, setLastSync] = useState<string | null>(null);

    useEffect(() => {
        const manager = getAutopilotManager();
        setConfig(manager.getConfig());
    }, []);

    const toggleAutopilot = () => {
        if (!config) return;
        const newConfig = { ...config, enabled: !config.enabled };
        const manager = getAutopilotManager();
        manager.updateConfig({ enabled: !config.enabled });
        setConfig(newConfig);

        if (newConfig.enabled) {
            manager.start();
        } else {
            manager.stop();
        }
    };

    const handleSync = async () => {
        setIsSyncing(true);
        const manager = getAutopilotManager();
        await manager.sync();
        setLastSync(new Date().toLocaleTimeString());
        setIsSyncing(false);
    };

    const updateFrequency = (freq: 'low' | 'medium' | 'high') => {
        if (!config) return;
        const newConfig = { ...config, frequency: freq };
        getAutopilotManager().updateConfig({ frequency: freq });
        setConfig(newConfig);
    };

    if (!config) return null;

    return (
        <div className="space-y-6">
            {/* Main Status Card */}
            <div className={`relative overflow-hidden rounded-3xl p-8 transition-all duration-500 border-2 ${config.enabled
                ? 'bg-gradient-to-br from-violet-600 via-indigo-600 to-blue-600 border-violet-400 shadow-2xl shadow-violet-500/20'
                : 'bg-white border-slate-200'
                }`}>
                {/* Decorative background patterns */}
                <div className={`absolute top-0 right-0 w-64 h-64 -mr-20 -mt-20 rounded-full blur-3xl transition-opacity duration-1000 ${config.enabled ? 'bg-white/20 opacity-100' : 'bg-slate-200 opacity-0'
                    }`} />

                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="flex items-center gap-6">
                        <div className={`p-5 rounded-2xl transition-all duration-500 ${config.enabled ? 'bg-white/20' : 'bg-slate-100'
                            }`}>
                            {config.enabled ? (
                                <Rocket className="w-10 h-10 text-white animate-bounce" />
                            ) : (
                                <Pause className="w-10 h-10 text-slate-400" />
                            )}
                        </div>
                        <div>
                            <h2 className={`text-2xl font-black mb-1 ${config.enabled ? 'text-white' : 'text-slate-800'}`}>
                                Autopilot Mode: {config.enabled ? 'Active' : 'Paused'}
                            </h2>
                            <p className={config.enabled ? 'text-white/80' : 'text-slate-500'}>
                                {config.enabled
                                    ? 'AI is autonomously managing your content strategy, generation, and posting.'
                                    : 'Enable Autopilot to let AI handle your entire marketing workflow hands-off.'}
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={toggleAutopilot}
                        className={`group px-8 py-4 rounded-2xl font-bold text-lg transition-all flex items-center gap-3 active:scale-95 ${config.enabled
                            ? 'bg-white text-violet-600 hover:shadow-xl hover:shadow-white/20'
                            : 'bg-violet-600 text-white hover:bg-violet-700 shadow-lg shadow-violet-500/30'
                            }`}
                    >
                        {config.enabled ? <><Pause className="w-5 h-5" /> Pause Autopilot</> : <><Play className="w-5 h-5" /> Enable Autopilot</>}
                    </button>
                </div>
            </div>

            {/* Automation Mode Selector - NEW! */}
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl border-2 border-indigo-200 p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg">
                        <Brain className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="font-bold text-slate-800">Automation Mode</h3>
                        <p className="text-xs text-slate-500">Choose how much control you want</p>
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-3 mb-4">
                    {[
                        {
                            id: 'full-auto',
                            label: '🚀 Full Auto',
                            desc: 'AI does everything',
                            details: 'Generate → Schedule → Publish automatically'
                        },
                        {
                            id: 'approval',
                            label: '👤 Approval',
                            desc: 'Review before publish',
                            details: 'AI generates, you approve with 1-click'
                        },
                        {
                            id: 'manual',
                            label: '✋ Manual',
                            desc: 'Full control',
                            details: 'You trigger every action manually'
                        }
                    ].map((mode) => (
                        <button
                            key={mode.id}
                            onClick={() => {
                                const manager = getAutopilotManager();
                                const newMode = mode.id as AutomationMode;
                                manager.updateConfig({
                                    automationMode: newMode,
                                    autoPublish: newMode === 'full-auto',
                                    contentReviewRequired: newMode !== 'full-auto',
                                    videoReviewRequired: newMode !== 'full-auto',
                                    autoGenerateContent: newMode !== 'manual',
                                    autoGenerateVideos: newMode !== 'manual',
                                    autoSchedule: newMode !== 'manual',
                                    approvalRequired: newMode === 'approval'
                                });
                                setConfig(manager.getConfig());
                            }}
                            className={`p-4 rounded-xl border-2 transition-all text-left ${config.automationMode === mode.id
                                ? 'border-indigo-500 bg-indigo-100 ring-4 ring-indigo-500/20'
                                : 'border-slate-200 bg-white hover:border-indigo-300'
                                }`}
                        >
                            <div className="text-lg font-bold mb-1">{mode.label}</div>
                            <div className={`text-sm font-medium ${config.automationMode === mode.id ? 'text-indigo-700' : 'text-slate-600'}`}>
                                {mode.desc}
                            </div>
                            <div className="text-xs text-slate-500 mt-2">{mode.details}</div>
                        </button>
                    ))}
                </div>

                {/* Mode-specific info */}
                <div className={`p-4 rounded-xl border ${config.automationMode === 'full-auto'
                    ? 'bg-amber-50 border-amber-200'
                    : config.automationMode === 'approval'
                        ? 'bg-blue-50 border-blue-200'
                        : 'bg-slate-50 border-slate-200'
                    }`}>
                    {config.automationMode === 'full-auto' && (
                        <div className="flex items-start gap-3">
                            <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
                            <div>
                                <p className="text-sm font-semibold text-amber-800">⚡ Fully Autonomous Mode Active</p>
                                <p className="text-xs text-amber-700 mt-1">
                                    AI will automatically generate content, create videos, schedule, and publish without human review.
                                    Recommended only after you've reviewed AI quality.
                                </p>
                            </div>
                        </div>
                    )}
                    {config.automationMode === 'approval' && (
                        <div className="flex items-start gap-3">
                            <CheckCircle2 className="w-5 h-5 text-blue-600 mt-0.5" />
                            <div>
                                <p className="text-sm font-semibold text-blue-800">👤 Human-in-the-Loop Mode (Recommended)</p>
                                <p className="text-xs text-blue-700 mt-1">
                                    AI generates content and schedules it, but waits for your 1-click approval before publishing.
                                    Best balance of automation and control.
                                </p>
                            </div>
                        </div>
                    )}
                    {config.automationMode === 'manual' && (
                        <div className="flex items-start gap-3">
                            <Settings className="w-5 h-5 text-slate-600 mt-0.5" />
                            <div>
                                <p className="text-sm font-semibold text-slate-800">✋ Full Manual Control</p>
                                <p className="text-xs text-slate-600 mt-1">
                                    You trigger content generation, video creation, and publishing manually.
                                    AI assists but doesn't act autonomously.
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Automation Settings Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Velocity Control */}
                <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                            <Zap className="w-5 h-5" />
                        </div>
                        <h3 className="font-bold text-slate-800">Publishing Velocity</h3>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                        {[
                            { id: 'low', label: 'Conservative', count: '3/wk' },
                            { id: 'medium', label: 'Balanced', count: '7/wk' },
                            { id: 'high', label: 'Accelerated', count: '14/wk' }
                        ].map((freq) => (
                            <button
                                key={freq.id}
                                onClick={() => updateFrequency(freq.id as any)}
                                className={`p-4 rounded-xl border-2 transition-all text-center ${config.frequency === freq.id
                                    ? 'border-blue-500 bg-blue-50 text-blue-700 ring-4 ring-blue-500/10'
                                    : 'border-slate-100 hover:border-slate-200 text-slate-500'
                                    }`}
                            >
                                <div className="text-xs font-bold uppercase mb-1 tracking-wider">{freq.label}</div>
                                <div className="text-xl font-black">{freq.count}</div>
                            </button>
                        ))}
                    </div>
                    <p className="mt-4 text-xs text-slate-500 flex items-center gap-2">
                        <AlertCircle className="w-3 h-3 text-amber-500" />
                        Higher velocity requires higher plan limits and established domain authority.
                    </p>
                </div>

                {/* AI Safety Guards */}
                <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                            <Shield className="w-5 h-5" />
                        </div>
                        <h3 className="font-bold text-slate-800">Autonomous Governance</h3>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                            <div>
                                <div className="text-sm font-semibold text-slate-700">Approval Required</div>
                                <div className="text-xs text-slate-500">Hold posts in queue for review</div>
                            </div>
                            <input
                                type="checkbox"
                                checked={config.approvalRequired}
                                onChange={() => getAutopilotManager().updateConfig({ approvalRequired: !config.approvalRequired })}
                                className="w-10 h-6 bg-slate-200 rounded-full appearance-none relative checked:bg-violet-600 transition-all cursor-pointer before:content-[''] before:absolute before:w-4 before:h-4 before:bg-white before:rounded-full before:top-1 before:left-1 checked:before:translate-x-4 before:transition-all"
                            />
                        </div>

                        <div className={`flex items-center justify-between p-3 rounded-xl border relative transition-all ${canUseFeature(user?.plan, 'self-healing')
                            ? 'bg-slate-50 border-slate-100'
                            : 'bg-slate-100 border-slate-200 opacity-60'
                            }`}>
                            <div>
                                <div className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
                                    Auto-Heal Strategy
                                    {!canUseFeature(user?.plan, 'self-healing') && <Zap className="w-3 h-3 text-amber-500 fill-amber-300" />}
                                </div>
                                <div className="text-xs text-slate-500">
                                    {canUseFeature(user?.plan, 'self-healing')
                                        ? 'AI self-corrects based on reach'
                                        : 'Requires Starter Plan'}
                                </div>
                            </div>
                            <input
                                type="checkbox"
                                disabled={!canUseFeature(user?.plan, 'self-healing')}
                                defaultChecked={canUseFeature(user?.plan, 'self-healing')}
                                className="w-10 h-6 bg-slate-200 rounded-full appearance-none relative checked:bg-violet-600 transition-all cursor-pointer before:content-[''] before:absolute before:w-4 before:h-4 before:bg-white before:rounded-full before:top-1 before:left-1 checked:before:translate-x-4 before:transition-all disabled:opacity-50"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Activity & Maintenance */}
            <div className="bg-slate-900 rounded-3xl p-8 text-white">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-xl bg-violet-600/20 text-violet-400 ${isSyncing ? 'animate-spin' : ''}`}>
                            <RefreshCw className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="font-bold">Manual Sync / Health Check</h3>
                            <p className="text-sm text-slate-400">
                                {isSyncing ? 'Synchronizing with AI engine...' : lastSync ? `Last synced at ${lastSync}` : 'Never synced'}
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={handleSync}
                        disabled={isSyncing}
                        className="px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 transition-all font-bold disabled:opacity-50"
                    >
                        Sync AI Queue Now
                    </button>
                </div>

                {config.enabled && (
                    <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
                        {[
                            { label: 'Next Generation', value: 'Today, 2:00 PM', icon: Brain },
                            { label: 'Next Publishing Slot', value: 'Tomorrow, 9:00 AM', icon: Clock },
                            { label: 'Content Strategy', value: 'Topic-Centric', icon: Target }
                        ].map((item, idx) => (
                            <div key={idx} className="p-4 rounded-2xl bg-white/5 border border-white/10">
                                <item.icon className="w-4 h-4 text-violet-400 mb-2" />
                                <div className="text-xs text-slate-500 font-medium">{item.label}</div>
                                <div className="text-sm font-bold">{item.value}</div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
