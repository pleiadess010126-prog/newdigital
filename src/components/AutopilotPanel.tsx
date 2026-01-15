'use client';

import { useState, useEffect } from 'react';
import {
    Zap, Shield, Clock, Brain, Settings,
    Play, Pause, RefreshCw, CheckCircle2,
    AlertCircle, Target, Rocket, Sparkles,
    Linkedin, Twitter, FileText, Video,
    ArrowRight, Instagram, MessageCircle,
    Globe, Share2
} from 'lucide-react';
import { getAutopilotManager, AutopilotConfig, AutomationMode } from '@/lib/ai/autopilot';
import { useAuth } from '@/lib/auth/AuthContext';
import { canUseFeature } from '@/lib/billing/permissions';

export default function AutopilotPanel() {
    const { user, updateCredits } = useAuth();
    const [config, setConfig] = useState<AutopilotConfig | null>(null);
    const [isSyncing, setIsSyncing] = useState(false);
    const [lastSync, setLastSync] = useState<string | null>(null);

    // Viral Factory State
    const [trendInput, setTrendInput] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [generatedContent, setGeneratedContent] = useState<any | null>(null);

    const GENERATION_COST = 50;
    const hasCredits = (user?.credits || 0) >= GENERATION_COST;

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

    const handleViralGenerate = () => {
        if (!trendInput || !hasCredits) return;

        setIsGenerating(true);
        updateCredits(-GENERATION_COST); // Deduct Cost

        // Simulate AI Latency
        setTimeout(() => {
            setGeneratedContent({
                topic: trendInput,
                formats: [
                    {
                        platform: 'LinkedIn (Professional)',
                        icon: Linkedin,
                        color: 'text-blue-600',
                        bg: 'bg-blue-50',
                        preview: `🚀 HUGE news for ${trendInput} enthusiasts!\n\nThe landscape is shifting rapidly. Here are 3 key takeaways...\n\n#Innovation #Growth`,
                        stats: ' Reach: 2.4k'
                    },
                    {
                        platform: 'X / Twitter (Viral)',
                        icon: Twitter,
                        color: 'text-black',
                        bg: 'bg-slate-100',
                        preview: `1/5 🧵 Everything you thought you knew about ${trendInput} is wrong.\n\nHere is the breakdown ⬇️`,
                        stats: ' Impr: 12k'
                    },
                    {
                        platform: 'Instagram / TikTok (Visual)',
                        icon: Instagram,
                        color: 'text-pink-600',
                        bg: 'bg-pink-50',
                        preview: `[CAPTION]: POV: You just realized ${trendInput} is changing everything 🤯\n\nLink in bio for the full breakdown! #Future #Tech`,
                        stats: ' Views: 45k'
                    },
                    {
                        platform: 'WhatsApp / Telegram (Direct)',
                        icon: MessageCircle,
                        color: 'text-emerald-600',
                        bg: 'bg-emerald-50',
                        preview: `Hey Team! 👋 Just dropped a deep dive on ${trendInput}. \n\nCheck it out here before the market moves: [Link]`,
                        stats: ' Open Rate: 98%'
                    },
                    {
                        platform: 'Global Blog (SEO)',
                        icon: FileText,
                        color: 'text-orange-600',
                        bg: 'bg-orange-50',
                        preview: `TITLE: The Future of ${trendInput}: A Deep Dive\n\nIn this comprehensive analysis...`,
                        stats: ' SEO: 92/100'
                    },
                    {
                        platform: 'Short Video Script',
                        icon: Video,
                        color: 'text-purple-600',
                        bg: 'bg-purple-50',
                        preview: `[HOOK]: "Stop ignoring ${trendInput}!"\n[SCENE]: Split screen showing stats.\n[BODY]: It's changing how we work forever...`,
                        stats: ' Retention: High'
                    },
                    {
                        platform: '🇨🇳 WeChat / RedBook',
                        icon: Share2,
                        color: 'text-red-600',
                        bg: 'bg-red-50',
                        preview: `(Translated): 🔴 The ${trendInput} phenomenon is exploding! Here is the data map you need to see... [Save to Favorites]`,
                        stats: ' Saves: 1.2k'
                    },
                    {
                        platform: '🇷🇺 VKontakte (VK)',
                        icon: Globe,
                        color: 'text-blue-500',
                        bg: 'bg-blue-50',
                        preview: `(Translated): Comrades, the digital sector regarding ${trendInput} is shifting. Full report attached below...`,
                        stats: ' Reach: 8.5k'
                    }
                ]
            });
            setIsGenerating(false);
        }, 2000);
    };

    const handleInjectToQueue = () => {
        // Logic to push to queue would go here
        setGeneratedContent(null);
        setTrendInput('');
        handleSync(); // Simulate sync
    };

    if (!config) return null;

    return (
        <div className="space-y-8">

            {/* 1. THE SEED: Control Center */}
            <div className={`relative overflow-hidden rounded-3xl p-8 transition-all duration-500 border-2 ${config.enabled
                ? 'bg-gradient-to-br from-violet-600 via-indigo-600 to-blue-600 border-violet-400 shadow-2xl shadow-violet-500/20 text-white'
                : 'bg-white border-slate-200 text-slate-800'
                }`}>

                <div className="relative z-10 grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
                    <div className="lg:col-span-2">
                        <div className="flex items-center gap-4 mb-4">
                            <div className={`p-3 rounded-xl ${config.enabled ? 'bg-white/20' : 'bg-slate-100'}`}>
                                <Rocket className={`w-8 h-8 ${config.enabled ? 'text-white animate-bounce' : 'text-slate-400'}`} />
                            </div>
                            <div>
                                <h2 className="text-3xl font-black">Autopilot Command</h2>
                                <p className={config.enabled ? 'text-white/80' : 'text-slate-500'}>
                                    {config.enabled ? 'System is ACTIVE and monitoring trends.' : 'System is PAUSED.'}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4 mt-6">
                            <button
                                onClick={toggleAutopilot}
                                className={`px-8 py-3 rounded-xl font-bold flex items-center gap-2 transition-all ${config.enabled
                                    ? 'bg-white text-violet-600 hover:bg-slate-100'
                                    : 'bg-violet-600 text-white hover:bg-violet-700'
                                    }`}
                            >
                                {config.enabled ? <><Pause className="w-5 h-5" /> Pause Operations</> : <><Play className="w-5 h-5" /> Activate Autopilot</>}
                            </button>
                            <div className="flex -space-x-2">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="w-8 h-8 rounded-full bg-slate-200 border-2 border-white flex items-center justify-center text-[10px] font-bold text-slate-500">
                                        AI
                                    </div>
                                ))}
                                <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-bold pl-1 border-2 border-white">
                                    +5
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="lg:col-span-1 bg-black/20 rounded-2xl p-6 backdrop-blur-sm border border-white/10">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-bold flex items-center gap-2">
                                <Sparkles className="w-4 h-4 text-emerald-400" />
                                Viral Factory
                            </h3>
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-mono text-white/60">CREDITS:</span>
                                <span className={`text-sm font-bold ${hasCredits ? 'text-emerald-300' : 'text-red-400'}`}>
                                    {user?.credits || 0}
                                </span>
                            </div>
                        </div>

                        {!generatedContent ? (
                            <div className="space-y-3">
                                <label className="text-xs opacity-70">Inject Topic / Url / Trend</label>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={trendInput}
                                        onChange={(e) => setTrendInput(e.target.value)}
                                        placeholder="e.g. 'Gemini 2.0 release'"
                                        className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-white/50 transition-colors placeholder:text-white/30"
                                    />
                                    <button
                                        onClick={handleViralGenerate}
                                        disabled={!trendInput || isGenerating || !hasCredits}
                                        className={`px-3 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-white ${hasCredits ? 'bg-emerald-500 hover:bg-emerald-400' : 'bg-red-500/50'
                                            }`}
                                        title={hasCredits ? `Cost: ${GENERATION_COST} Credits` : 'Insufficient Credits'}
                                    >
                                        {isGenerating ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Zap className="w-5 h-5" />}
                                    </button>
                                </div>
                                {!hasCredits && (
                                    <div className="text-[10px] text-red-300 text-center">
                                        Insufficient credits ({GENERATION_COST} required)
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div>
                                <div className="text-sm font-medium mb-3">Topic: "{generatedContent.topic}"</div>
                                <div className="grid grid-cols-2 gap-2 mb-4">
                                    {generatedContent.formats.map((fmt: any, i: number) => (
                                        <div key={i} className={`p-2 rounded text-xs truncate opacity-80 ${fmt.bg.replace('bg-', 'bg-black/')}`}>
                                            {fmt.platform}
                                        </div>
                                    ))}
                                </div>
                                <button
                                    onClick={handleInjectToQueue}
                                    className="w-full py-2 bg-emerald-500 hover:bg-emerald-400 rounded-lg font-bold text-sm transition-colors"
                                >
                                    Approve & Queue All
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* 2. THE FACTORY FLOOR: Visualizer (Only shows when content is generated) */}
            {generatedContent && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-in fade-in slide-in-from-top-4 duration-500">
                    {generatedContent.formats.map((fmt: any, i: number) => (
                        <div key={i} className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between mb-4">
                                <div className={`p-2 rounded-lg ${fmt.bg} ${fmt.color}`}>
                                    <fmt.icon className="w-5 h-5" />
                                </div>
                                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{fmt.stats}</span>
                            </div>
                            <div className="text-xs font-bold text-slate-700 mb-2">{fmt.platform}</div>
                            <div className="text-xs text-slate-500 whitespace-pre-wrap font-mono bg-slate-50 p-3 rounded-lg border border-slate-100 h-32 overflow-y-auto custom-scrollbar">
                                {fmt.preview}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* 3. THE ENGINE: Configuration (Existing Autopilot Controls) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Mode Selector */}
                <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                            <Brain className="w-5 h-5" />
                        </div>
                        <h3 className="font-bold text-slate-800">Automation Governance</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {[
                            { id: 'full-auto', label: '🚀 Full Auto', desc: 'No human needed' },
                            { id: 'approval', label: '👤 Approval', desc: 'Review first' },
                            { id: 'manual', label: '✋ Manual', desc: 'You trigger' }
                        ].map((mode) => (
                            <button
                                key={mode.id}
                                onClick={() => {
                                    const manager = getAutopilotManager();
                                    manager.updateConfig({ automationMode: mode.id as AutomationMode });
                                    setConfig(manager.getConfig());
                                }}
                                className={`p-4 rounded-xl border-2 transition-all text-left ${config.automationMode === mode.id
                                    ? 'border-indigo-500 bg-indigo-50/50 ring-2 ring-indigo-500/20'
                                    : 'border-slate-100 hover:border-indigo-200'
                                    }`}
                            >
                                <div className="font-bold text-slate-800">{mode.label}</div>
                                <div className="text-xs text-slate-500">{mode.desc}</div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Velocity */}
                <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                            <Zap className="w-5 h-5" />
                        </div>
                        <h3 className="font-bold text-slate-800">Velocity</h3>
                    </div>
                    <div className="space-y-2">
                        {[
                            { id: 'low', label: 'Conservative (3/wk)' },
                            { id: 'medium', label: 'Balanced (7/wk)' },
                            { id: 'high', label: 'Viral (14/wk)' }
                        ].map((freq) => (
                            <button
                                key={freq.id}
                                onClick={() => updateFrequency(freq.id as any)}
                                className={`w-full p-3 rounded-lg border text-sm font-medium transition-colors flex items-center justify-between ${config.frequency === freq.id
                                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                                    : 'border-slate-100 hover:border-slate-200 text-slate-600'
                                    }`}
                            >
                                {freq.label}
                                {config.frequency === freq.id && <CheckCircle2 className="w-4 h-4" />}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* 4. ACTIVITY MONITOR */}
            <div className="bg-slate-900 rounded-3xl p-8 text-white">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-xl bg-violet-600/20 text-violet-400 ${isSyncing ? 'animate-spin' : ''}`}>
                            <RefreshCw className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="font-bold">System Status</h3>
                            <p className="text-sm text-slate-400">
                                {isSyncing ? 'Synchronizing viral queue...' : lastSync ? `Last processed at ${lastSync}` : 'Standing by'}
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={handleSync}
                        disabled={isSyncing}
                        className="px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 transition-all font-bold disabled:opacity-50"
                    >
                        Force Sync Queue
                    </button>
                </div>
            </div>
        </div>
    );
}
