
'use client';

import { useState, useEffect } from 'react';
import {
    Zap, TrendingUp, ArrowRight, Share2,
    MessageSquare, AlertCircle, Globe,
    Twitter, Instagram, RefreshCw, Sparkles,
    Youtube, Facebook, Layers, Lightbulb
} from 'lucide-react';
import { fetchCurrentTrends, generateTrendBridge, type TrendTopic, type TrendBridge } from '@/lib/ai/trends';
import { getSupervisorAgent } from '@/lib/ai/supervisor';
import type { TopicPillar } from '@/types';

export default function TrendHijacker() {
    const [trends, setTrends] = useState<TrendTopic[]>([]);
    const [bridges, setBridges] = useState<TrendBridge[]>([]);
    const [loading, setLoading] = useState(true);
    const [isHijacking, setIsHijacking] = useState<string | null>(null);
    const [scanTime, setScanTime] = useState<string>('');

    // Mock pillars for demonstration
    const pillars: TopicPillar[] = [
        { id: '1', name: 'SEO Strategy', description: '', keywords: [], contentCount: 0, priority: 1 },
        { id: '2', name: 'AI Marketing', description: '', keywords: [], contentCount: 0, priority: 1 },
    ];

    const runScan = async () => {
        setLoading(true);
        try {
            const supervisor = getSupervisorAgent();
            const result = await supervisor.delegateContentCreation(
                { id: 'trend-scan', name: 'Trend Scan', keywords: [], description: '', contentCount: 0, priority: 1 },
                'blog',
                'Marketing Professionals'
            );

            // Note: In real app, the worker would return this. For demo, we use the service directly.
            const currentTrends = await fetchCurrentTrends();
            setTrends(currentTrends);

            const newBridges: TrendBridge[] = [];
            for (const trend of currentTrends.slice(0, 3)) {
                const bridge = await generateTrendBridge(trend, pillars[Math.floor(Math.random() * pillars.length)].name);
                newBridges.push(bridge);
            }
            setBridges(newBridges);
            setScanTime(new Date().toLocaleTimeString());
        } catch (err) {
            console.error('Trend scan failed:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        runScan();
    }, []);

    const handleHijack = async (bridge: TrendBridge) => {
        setIsHijacking(bridge.trendTopic);
        // Simulate content generation for the hijacked trend
        await new Promise(resolve => setTimeout(resolve, 2000));
        setIsHijacking(null);
        alert(`Viral Content Generated: "${bridge.angle}" has been scheduled for publishing!`);
    };

    const getPlatformIcon = (platform: string) => {
        switch (platform) {
            case 'twitter': return <Twitter className="w-4 h-4 text-sky-500" />;
            case 'tiktok': return <div className="w-4 h-4 bg-black rounded-full flex items-center justify-center"><Zap className="w-3 h-3 text-white" /></div>;
            case 'google': return <Globe className="w-4 h-4 text-emerald-500" />;
            case 'linkedin': return <div className="w-4 h-4 bg-blue-700 rounded-sm flex items-center justify-center text-[10px] text-white font-bold">in</div>;
            default: return <TrendingUp className="w-4 h-4 text-slate-400" />;
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                        <Zap className="w-6 h-6 text-amber-500 fill-amber-500" />
                        AI Trend Hijacker
                    </h2>
                    <p className="text-slate-500 mt-1">Real-time viral opportunity detection & strategic bridging</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="text-right hidden md:block">
                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Last Global Scan</p>
                        <p className="text-sm font-bold text-slate-700">{scanTime || 'Scanning...'}</p>
                    </div>
                    <button
                        onClick={runScan}
                        disabled={loading}
                        className="p-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-all active:scale-95"
                    >
                        <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                    <button className="px-5 py-3 bg-slate-900 text-white rounded-2xl font-semibold hover:bg-slate-800 transition-all flex items-center gap-2">
                        <Share2 className="w-4 h-4" />
                        Configure Sentry
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Live Trend Monitoring */}
                <div className="lg:col-span-1 space-y-4">
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest px-2">Live Trends Monitor</h3>
                    <div className="space-y-3">
                        {loading ? (
                            Array(4).fill(0).map((_, i) => (
                                <div key={i} className="h-24 bg-slate-100 rounded-2xl animate-pulse" />
                            ))
                        ) : (
                            trends.map(trend => (
                                <div key={trend.id} className="group p-4 bg-white rounded-2xl border border-slate-200 hover:border-amber-200 hover:shadow-md transition-all cursor-default">
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center gap-2">
                                            {getPlatformIcon(trend.platform)}
                                            <span className="text-xs font-bold text-slate-400 uppercase">{trend.platform}</span>
                                        </div>
                                        <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                                            {trend.change}
                                        </span>
                                    </div>
                                    <h4 className="font-bold text-slate-800 mt-2">{trend.name}</h4>
                                    <div className="flex items-center gap-3 mt-2">
                                        <span className="text-xs text-slate-500 flex items-center gap-1">
                                            <MessageSquare className="w-3 h-3" />
                                            {trend.volume} Mentions
                                        </span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100">
                        <div className="flex items-start gap-3">
                            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0" />
                            <p className="text-xs text-amber-800 leading-relaxed">
                                <strong>Active Alert:</strong> High velocity trend detected in "Short-Form Video Psychology". Suggested action: Generate a "Teardown" style reel.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Right Column: Strategic AI Bridges */}
                <div className="lg:col-span-2 space-y-4">
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest px-2">AI Strategic "Hijack" Proposals</h3>
                    <div className="space-y-6">
                        {loading ? (
                            Array(2).fill(0).map((_, i) => (
                                <div key={i} className="h-64 bg-slate-100 rounded-3xl animate-pulse" />
                            ))
                        ) : (
                            bridges.map((bridge, i) => (
                                <div key={i} className="relative overflow-hidden bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl hover:shadow-violet-500/5 transition-all">
                                    {/* Bridge Header */}
                                    <div className="flex flex-col md:flex-row md:items-center justify-between p-6 bg-slate-50 border-b border-slate-100 gap-4">
                                        <div className="flex items-center gap-3">
                                            <div className="flex -space-x-2">
                                                <div className="w-10 h-10 rounded-full bg-slate-900 border-2 border-white flex items-center justify-center text-white font-bold text-xs">
                                                    {bridge.trendTopic[0]}
                                                </div>
                                                <div className="w-10 h-10 rounded-full bg-violet-600 border-2 border-white flex items-center justify-center text-white font-bold text-xs ring-4 ring-violet-500/10">
                                                    {bridge.pillarName[0]}
                                                </div>
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs font-bold text-slate-400">TREND BRIDGE</span>
                                                    <div className="w-1 h-1 rounded-full bg-slate-300" />
                                                    <span className="text-xs font-bold text-violet-600 uppercase">{bridge.potentialROI}</span>
                                                </div>
                                                <h4 className="font-bold text-slate-800">
                                                    {bridge.trendTopic} <ArrowRight className="inline w-3 h-3 mx-1 text-slate-400" /> {bridge.pillarName}
                                                </h4>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs font-medium text-slate-500">Format:</span>
                                            <span className="px-3 py-1 bg-white border border-slate-200 rounded-full text-xs font-bold text-slate-700 capitalize">
                                                {bridge.suggestedFormat}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Bridge Strategy */}
                                    <div className="p-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            <div className="space-y-4">
                                                <div>
                                                    <p className="text-xs font-bold text-slate-400 uppercase mb-2 flex items-center gap-1">
                                                        <Lightbulb className="w-3 h-3" />
                                                        The Strategic Angle
                                                    </p>
                                                    <p className="text-sm text-slate-700 leading-relaxed">
                                                        {bridge.angle}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-xs font-bold text-slate-400 uppercase mb-2 flex items-center gap-1">
                                                        <Sparkles className="w-3 h-3" />
                                                        The Hook
                                                    </p>
                                                    <div className="p-3 bg-violet-50 rounded-xl border border-violet-100">
                                                        <p className="text-sm font-medium text-violet-800 italic">
                                                            "{bridge.suggestedHook}"
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="bg-slate-50 rounded-2xl p-4 flex flex-col justify-center items-center text-center space-y-4 border border-dashed border-slate-200">
                                                <div className="w-16 h-16 rounded-3xl bg-white shadow-sm flex items-center justify-center">
                                                    <Layers className="w-8 h-8 text-violet-600" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-slate-800">Ready to Ship</p>
                                                    <p className="text-xs text-slate-500 mt-1">AI has already prepared the rough cut for this bridge.</p>
                                                </div>
                                                <button
                                                    onClick={() => handleHijack(bridge)}
                                                    disabled={!!isHijacking}
                                                    className="w-full py-3 bg-violet-600 text-white rounded-xl font-bold hover:bg-violet-700 transition-all shadow-lg shadow-violet-500/20 active:scale-95 flex items-center justify-center gap-2"
                                                >
                                                    {isHijacking === bridge.trendTopic ? (
                                                        <>
                                                            <RefreshCw className="w-4 h-4 animate-spin" />
                                                            Hijacking Trend...
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Zap className="w-4 h-4" />
                                                            Hijack This Trend
                                                        </>
                                                    )}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
