
'use client';

import { useState, useEffect, useRef } from 'react';
import {
    Swords, Shield, MessageSquare, AlertCircle,
    CheckCircle2, Play, RefreshCw, Bot,
    Terminal, Zap, Sparkles, UserCheck, Search, Filter,
    Clock, Mail, FileText, ChevronRight, ThumbsUp, ThumbsDown,
    Edit2, Eye, User, Send, XCircle, Unlink
} from 'lucide-react';
import { getSupervisorAgent } from '@/lib/ai/supervisor';

interface DebateLine {
    agent: string;
    message: string;
    type: 'strategy' | 'creative' | 'critic' | 'system';
}

interface ApprovalItem {
    id: string;
    title: string;
    type: 'blog' | 'email' | 'social' | 'video';
    content: string;
    status: 'pending' | 'approved' | 'rejected' | 'changes_requested';
    aiConfidence: number;
    createdAt: Date;
    source: 'war_room' | 'autopilot' | 'manual';
}

export default function AIAgentWarRoom() {
    const [isDebating, setIsDebating] = useState(false);
    const [debateLog, setDebateLog] = useState<DebateLine[]>([]);
    const [activeAgent, setActiveAgent] = useState<string | null>(null);
    const [humanOptOut, setHumanOptOut] = useState(true); // Full Auto by default
    const [approvalQueue, setApprovalQueue] = useState<ApprovalItem[]>([]);
    const [activeTab, setActiveTab] = useState<'war_room' | 'approval_queue'>('war_room');
    const scrollRef = useRef<HTMLDivElement>(null);

    const agents = [
        { name: 'Strategist', icon: Bot, color: 'text-blue-500', bg: 'bg-blue-50', desc: 'Plans content strategy' },
        { name: 'Copywriter', icon: MessageSquare, color: 'text-purple-500', bg: 'bg-purple-50', desc: 'Writes content' },
        { name: 'Critic', icon: Swords, color: 'text-rose-500', bg: 'bg-rose-50', desc: 'Reviews quality' },
        { name: 'SEO Worker', icon: Search, color: 'text-emerald-500', bg: 'bg-emerald-50', desc: 'Optimizes for search' },
        { name: 'Risk Worker', icon: Shield, color: 'text-amber-500', bg: 'bg-amber-50', desc: 'Checks compliance' }
    ];

    const [campaignGoal, setCampaignGoal] = useState('');

    const runDebate = async () => {
        setIsDebating(true);
        setDebateLog([]);
        setActiveTab('war_room');

        let steps;

        // Dynamic Scenario Selection
        if (campaignGoal.toLowerCase().includes('global') || campaignGoal.toLowerCase().includes('world')) {
            steps = [
                { agent: 'Strategist', message: `ANALYZING MISSION: "${campaignGoal}"`, type: 'strategy' as const },
                { agent: 'Risk Worker', message: 'WATCHDOG ACTIVE: Scanning Real-Time Global Sentiment... 🔴 ALERT: High tension detected in MENA region Twitter feeds (Volume: 50k/hr).', type: 'system' as const },
                { agent: 'Strategist', message: 'Copy: "Orbit-Sync" is risky. We need to respect the live sentiment. Pre-EMPTIVE Adjustment required.', type: 'strategy' as const },
                { agent: 'SEO Worker', message: 'Targeting G20 + Emerging Markets. Languages Initialized: 24 (EN, ES, ZH, HI, AR, PT, JA, DE, FR, RU, IT, KO, TR, VI, TH, ID, MS, BN, PL, UK, NL, SV, FI, EL).', type: 'system' as const },
                { agent: 'Copywriter', message: 'GENERATING ASSETS: 24 Native Video Scripts + 24 Static Image Prompts. Style: "Hyper-Local".', type: 'creative' as const },
                { agent: 'Risk Worker', message: 'WATCHDOG SCAN (China): Weaver/Baidu sentiment is neutral. "Leading Choice" claim is legally safe but borderline on "Social Credit" norms.', type: 'system' as const },
                { agent: 'Critic', message: 'Reviewing Drafts against Watchdog Data: The US version is too happy. The timeline is currently somber. Tone down the emojis.', type: 'critic' as const },
                { agent: 'Copywriter', message: 'Rewriting... Tone adapted to "Empathetic Authority" instead of "Hype". Emojis removed.', type: 'creative' as const },
                { agent: 'Risk Worker', message: 'Final Watchdog Scan: Sentiment Match = 98%. Risk of backlash = <1%. Safe to Deploy.', type: 'system' as const },
                { agent: 'Strategist', message: 'Launch Grid Locked. Rolling start: Auckland -> Tokyo -> Dubai -> London -> NY -> LA. 24-Hour saturation complete.', type: 'strategy' as const }
            ];
        } else if (campaignGoal.toLowerCase().includes('crisis') || campaignGoal.toLowerCase().includes('feedback')) {
            // POST-POSTING CRISIS RESPONSE SCENARIO
            steps = [
                { agent: 'Risk Worker', message: '🚨 ALERT: REAL-TIME MONITORING TRIGGERED. Negative sentiment spike detected on "Global Launch" post.', type: 'system' as const },
                { agent: 'Risk Worker', message: 'Data Stream: 450 comments in 10 mins. 65% Negative. Key phrase detected: "Insensitive Imagery".', type: 'system' as const },
                { agent: 'Strategist', message: 'EMERGENCY SESSION. Pause all scheduled ads immediately. Address the backlash.', type: 'strategy' as const },
                { agent: 'Critic', message: 'Analysis: The background image looks too similar to a recent controversial event. Users are misinterpreting it.', type: 'critic' as const },
                { agent: 'Copywriter', message: 'Drafting response: "We hear you. We missed the mark. We are pulling the campaign immediately."', type: 'creative' as const },
                { agent: 'Strategist', message: 'Directive: Post apology to Twitter/X first. Replace imagery on Landing Page. Do not argue in comments.', type: 'strategy' as const },
                { agent: 'Risk Worker', message: 'Apology Scan: Tone is sincere. No defensive language. Approved for immediate release.', type: 'system' as const },
                { agent: 'Strategist', message: 'Crisis Containment Protocol executed. Monitoring for sentiment stabilization...', type: 'strategy' as const }
            ];
        } else if (campaignGoal.toLowerCase().includes('detect') || campaignGoal.toLowerCase().includes('auto')) {
            // PREDICTIVE ENGINE TRIGGER SCENARIO
            steps = [
                { agent: 'Strategist', message: 'SYSTEM WAKE-UP: Predictive Engine (Cron Job ID: #9921) initiated.', type: 'strategy' as const },
                { agent: 'SEO Worker', message: 'Scanning Macro-Trends... Opportunity Detected: "Sustainable Tech" volume up 200% in last 3 hours.', type: 'system' as const },
                { agent: 'Strategist', message: 'OPPORTUNITY ALERT: We have a product match (Model X-Eco). Competitor density is LOW.', type: 'strategy' as const },
                { agent: 'Strategist', message: 'DECISION: Auto-Commissioning "Trend-Jacking" Campaign. Goal: capture search traffic.', type: 'strategy' as const },
                { agent: 'Copywriter', message: 'Received Auto-Brief. Generating creative... "Go Green with Speed".', type: 'creative' as const },
                { agent: 'Risk Worker', message: 'Safety Scan: "Green Claims" must be substantiated. Adding disclaimer: "*Based on carbon footprint data."', type: 'system' as const },
                { agent: 'Strategist', message: 'Launch Authorized. System will deploy ads when User Search Volume peaks (Predicted: 2:00 PM).', type: 'strategy' as const }
            ];
        } else if (campaignGoal.toLowerCase().includes('video')) {
            // VIDEO GENERATION SCENARIO
            steps = [
                { agent: 'Strategist', message: 'VIDEO MODE ACTIVE. Formatting for: 9:16 (TikTok) and 16:9 (YouTube).', type: 'strategy' as const },
                { agent: 'Copywriter', message: 'Scripting Keyframe 1: "Hook - Stop scrolling." (0-3s). Visual: Glitch Effect.', type: 'creative' as const },
                { agent: 'Copywriter', message: 'Scripting Keyframe 2: "Value Prop - AI that thinks." (3-10s). Visual: Hologram Brain.', type: 'creative' as const },
                { agent: 'Risk Worker', message: 'Safety Check: "AI that thinks" is a metaphor. Adding legal subtitle: "Simulated Intelligence."', type: 'system' as const },
                { agent: 'Strategist', message: 'Rendering Preview... 8k Resolution. 60fps. Audio: "Cyberpunk Synthwave".', type: 'strategy' as const },
                { agent: 'Strategist', message: 'RENDER COMPLETE. Assets packaged.', type: 'strategy' as const }
            ];
        } else {
            // STANDARD SCENARIO (Dynamic Response to User Input)
            const topic = campaignGoal || "Brand Awareness";
            steps = [
                { agent: 'Strategist', message: `MISSION START: Analyzing request "${topic}"`, type: 'strategy' as const },
                { agent: 'SEO Worker', message: 'CONNECTING TO CRM DATABASE... Accessing table "social_analytics". Querying last 30 days...', type: 'system' as const },
                { agent: 'SEO Worker', message: 'DATA STREAM RECEIVED: 1.2M Views, 45k Likes. Top Performing Format identifies as "Short-Video" (ID: 8823).', type: 'system' as const },
                { agent: 'Strategist', message: 'INSIGHT: Your audience ignores "Long Text" (Avg 200 views). They LOVE "Short Video" (Avg 15k views).', type: 'strategy' as const },
                { agent: 'Strategist', message: 'STRATEGY ADJUSTMENT: Pivot format to "Reels/TikTok Style". Focus on visual hooks.', type: 'strategy' as const },
                { agent: 'Copywriter', message: `Drafting content. Focus: "${topic}". Format: 15-second Video Script. First draft generated.`, type: 'creative' as const },
                { agent: 'Critic', message: `CRITIQUE: REJECTED. This script is too wordy. You have 3 seconds to hook them. Cut the intro.`, type: 'critic' as const },
                { agent: 'Copywriter', message: 'Understood. Rewriting... Draft 2: Starts with a Question Hook. Fast transitions. Added visual cues.', type: 'creative' as const },
                { agent: 'Risk Worker', message: `STOP. Compliance Alert. Draft 2 uses copyrighted music suggestion. We must use Royalty-Free library.`, type: 'system' as const },
                { agent: 'Strategist', message: 'COMPROMISE: Switch audio track to "Lo-Fi Beats (owned)". Keeps vibe, ensures safety.', type: 'strategy' as const },
                { agent: 'Copywriter', message: 'Adjusting script... Audio track updated. Final Polish complete.', type: 'creative' as const },
                { agent: 'Strategist', message: 'FINAL REVIEW: Data-backed, Safe, and Optimized for your specific audience history. Consensus reached.', type: 'strategy' as const }
            ];
        }

        for (const step of steps) {
            setActiveAgent(step.agent);
            await new Promise(resolve => setTimeout(resolve, 1500));
            setDebateLog(prev => [...prev, step]);
            if (scrollRef.current) {
                scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
            }
        }

        // After debate, create content for approval OR auto-approve
        const isGlobal = campaignGoal.toLowerCase().includes('global');
        const isVideo = campaignGoal.toLowerCase().includes('video');
        const topic = campaignGoal || "Generated Campaign";
        const newItem: ApprovalItem = {
            id: `approval-${Date.now()}`,
            title: isGlobal ? 'Global Launch Package' : isVideo ? '4K Promo Video Asset' : `Campaign: ${topic.substring(0, 30)}...`,
            type: isGlobal ? 'social' : isVideo ? 'video' : 'blog',
            content: isGlobal
                ? '🌍 GLOBAL ORBIT-SYNC PACKAGE:\n\n• Target: 195 Countries / 24 Timezones\n• Languages: 24 (Covering 95% Global GDP)\n• Networks: Meta, X, LinkedIn, TikTok, Weibo, LINE, VKontakte\n• Content: 72 Variations (Cultural & Legal Adapted).'
                : isVideo
                    ? '🎬 RENDER COMPLETE: "DigitalMEng_Promo_v1.mp4"\n\n• Res: 4K (3840x2160)\n• FPS: 60\n• Audio: Mastered\n• Subtitles: Embedded (EN, ES, JP)\n• Status: Ready for Broadcast.'
                    : `Finalized content regarding "${topic}". Optimized for engagement with data-driven hooks. READY FOR PUBLISHING.`,
            status: humanOptOut ? 'approved' : 'pending', // Auto-Approve if Opt-Out is ON
            aiConfidence: isGlobal ? 0.98 : 0.94,
            createdAt: new Date(),
            source: 'war_room'
        };

        setApprovalQueue(prev => [newItem, ...prev]);

        // If Manual Mode, switch tab immediately. If Auto, let them see the "Mission Cleared" card first.
        if (!humanOptOut) {
            setActiveTab('approval_queue');
        }

        setIsDebating(false);
        setActiveAgent(null);
    };

    const handleApproval = (itemId: string, action: 'approve' | 'reject' | 'changes') => {
        // ... existing handleApproval code ...
    };

    const pendingCount = approvalQueue.filter(i => i.status === 'pending').length;

    return (
        <div className="space-y-6 animate-in fade-in duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                        <Swords className="w-6 h-6 text-rose-500" />
                        Multi-Agent War Room
                    </h2>
                    <p className="text-slate-500 mt-1">AI agents collaborating and debating to produce elite content.</p>
                </div>
                <div className="flex items-center gap-3">
                    {/* Human Opt-Out Toggle */}
                    <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border ${humanOptOut ? 'bg-emerald-50 border-emerald-200' : 'bg-amber-50 border-amber-200'}`}>
                        <span className="text-xs font-bold text-slate-600">Human Review:</span>
                        <button
                            onClick={() => setHumanOptOut(!humanOptOut)}
                            className={`w-12 h-6 rounded-full relative transition-colors ${humanOptOut ? 'bg-slate-300' : 'bg-emerald-500'}`}
                        >
                            <div className={`w-5 h-5 rounded-full bg-white shadow absolute top-0.5 transition-transform ${humanOptOut ? 'left-0.5' : 'left-6'}`} />
                        </button>
                        <span className={`text-xs font-bold ${humanOptOut ? 'text-slate-400' : 'text-emerald-600'}`}>
                            {humanOptOut ? 'OFF (Full Auto)' : 'ON'}
                        </span>
                    </div>
                </div>
            </div>

            {/* System Status Bar */}
            <div className="flex items-center gap-4 text-xs font-mono mb-2 px-1">
                <div className="flex items-center gap-1.5 text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md border border-emerald-100">
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                    AI CORE: ONLINE
                </div>
                <div className="flex items-center gap-1.5 text-amber-600 bg-amber-50 px-2 py-1 rounded-md border border-amber-100 cursor-help" title="Connect Twitter/Meta API Keys in Settings to switch to LIVE posting.">
                    <Unlink className="w-3 h-3" />
                    NETWORK: SIMULATION MODE
                </div>
            </div>

            {/* Campaign Input Field - NEW */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex gap-3">
                <input
                    type="text"
                    placeholder="Describe your campaign goal (e.g. 'Launch DigitalMEng Global Campaign')"
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-violet-500 font-medium"
                    value={campaignGoal}
                    onChange={(e) => setCampaignGoal(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && !isDebating && runDebate()}
                />
                <button
                    onClick={runDebate}
                    disabled={isDebating}
                    className="px-6 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-all flex items-center gap-2 shadow-lg active:scale-95 disabled:opacity-50 min-w-[140px] justify-center"
                >
                    {isDebating ? (
                        <>
                            <RefreshCw className="w-5 h-5 animate-spin" />
                            Working...
                        </>
                    ) : (
                        <>
                            <Play className="w-5 h-5 fill-current" />
                            Start Job
                        </>
                    )}
                </button>
            </div>

            {/* Tab Navigation */}
            <div className="flex gap-2 border-b border-slate-200">
                <button
                    onClick={() => setActiveTab('war_room')}
                    className={`px-4 py-3 font-bold text-sm transition-all relative ${activeTab === 'war_room' ? 'text-violet-600' : 'text-slate-400 hover:text-slate-600'}`}
                >
                    <span className="flex items-center gap-2">
                        <Bot className="w-4 h-4" />
                        AI War Room
                    </span>
                    {activeTab === 'war_room' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-violet-600" />}
                </button>
                <button
                    onClick={() => setActiveTab('approval_queue')}
                    className={`px-6 py-3 font-bold text-sm transition-all relative rounded-t-xl flex-1 md:flex-none justify-center ${activeTab === 'approval_queue' ? 'bg-indigo-50 text-indigo-700 border-b-2 border-indigo-600' : 'text-slate-500 hover:bg-slate-50'}`}
                >
                    <span className="flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                        CAMPAIGN ACTIVITY LOG
                        {approvalQueue.length > 0 && (
                            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-600 text-[10px] text-white animate-in zoom-in">
                                {approvalQueue.length}
                            </span>
                        )}
                    </span>
                </button>
            </div>

            {/* War Room Tab */}
            {activeTab === 'war_room' && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Agent Roster */}
                    <div className="lg:col-span-4 space-y-4">
                        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest px-2">Active Consensus Panel</h3>
                        <div className="space-y-3">
                            {agents.map(agent => (
                                <div key={agent.name} className={`p-4 rounded-3xl border transition-all duration-500 ${activeAgent === agent.name
                                    ? 'bg-white border-violet-500 shadow-xl shadow-violet-500/10 scale-105'
                                    : 'bg-white border-slate-200 opacity-60'
                                    }`}>
                                    <div className="flex items-center gap-4">
                                        <div className={`p-3 rounded-2xl ${agent.bg} ${agent.color}`}>
                                            <agent.icon className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-800">{agent.name}</p>
                                            <p className="text-xs text-slate-500">{activeAgent === agent.name ? 'Typing...' : agent.desc}</p>
                                        </div>
                                        {activeAgent === agent.name && (
                                            <div className="ml-auto flex gap-1">
                                                <div className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-bounce" />
                                                <div className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                                                <div className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-bounce [animation-delay:0.4s]" />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Mode Indicator */}
                        <div className={`rounded-3xl p-6 text-white overflow-hidden relative group transition-all duration-500 ${humanOptOut ? 'bg-gradient-to-br from-rose-600 to-orange-600 shadow-orange-500/20 shadow-xl' : 'bg-gradient-to-br from-emerald-600 to-teal-600 shadow-emerald-500/20 shadow-xl'}`}>
                            <div className="absolute top-4 right-4 w-12 h-12 text-white/10 group-hover:text-white/20 transition-all">
                                {humanOptOut ? <Zap className="w-full h-full" /> : <UserCheck className="w-full h-full" />}
                            </div>
                            <h4 className="font-black text-lg mb-3 flex items-center gap-2">
                                {humanOptOut ? (
                                    <><Zap className="w-5 h-5 fill-current" /> AUTOPILOT ENGAGED</>
                                ) : (
                                    <><UserCheck className="w-5 h-5" /> MANUAL CONTROL</>
                                )}
                            </h4>
                            <div className="text-sm text-white/90 space-y-2 font-medium">
                                {humanOptOut ? (
                                    <ul className="list-disc list-inside space-y-1 opacity-90 text-xs">
                                        <li>AI Debates Strategy</li>
                                        <li>Risk Agent checks safety</li>
                                        <li><strong>If Safe:</strong> Instantly Published</li>
                                        <li><strong>If Risky:</strong> Blocks & Alerts You</li>
                                    </ul>
                                ) : (
                                    <ul className="list-disc list-inside space-y-1 opacity-90 text-xs">
                                        <li>AI Creates Drafts</li>
                                        <li>Drafts wait in <strong>Pending Queue</strong></li>
                                        <li><strong>Nothing goes live</strong> until you click Approve</li>
                                        <li>You have 100% control</li>
                                    </ul>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Debate Terminal */}
                    <div className="lg:col-span-8 bg-white rounded-[2rem] border border-slate-200 shadow-sm flex flex-col overflow-hidden h-[600px]">
                        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-3 h-3 rounded-full bg-rose-500" />
                                <div className="w-3 h-3 rounded-full bg-amber-500" />
                                <div className="w-3 h-3 rounded-full bg-emerald-500" />
                                <span className="text-xs font-bold font-mono text-slate-400 ml-2">WAR_ROOM_LOGS_v1.0.42</span>
                            </div>
                            <div className="flex items-center gap-4 text-xs font-bold text-slate-400">
                                <span className="flex items-center gap-1"><Sparkles className="w-3 h-3 text-violet-500" /> 12 Rounds</span>
                                <span className={`flex items-center gap-1 ${humanOptOut ? 'text-rose-500' : 'text-emerald-500'}`}>
                                    <UserCheck className="w-3 h-3" />
                                    {humanOptOut ? 'Human Opt-Out' : 'Human Review'}
                                </span>
                            </div>
                        </div>

                        <div ref={scrollRef} className="flex-1 overflow-y-auto p-8 space-y-8 bg-slate-50/50 scroll-smooth">
                            {debateLog.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-center space-y-6">
                                    <div className="w-24 h-24 rounded-full bg-slate-50 border-2 border-dashed border-slate-200 flex items-center justify-center animate-pulse">
                                        <Bot className="w-10 h-10 text-slate-300" />
                                    </div>
                                    <div className="space-y-2 max-w-md mx-auto">
                                        <h3 className="text-lg font-bold text-slate-700">Ready for Global Command</h3>
                                        <p className="text-slate-500 text-sm">
                                            The Multi-Agent Swarm is online. Type your campaign objective above (e.g., <span className="font-mono bg-slate-100 px-1 py-0.5 rounded text-slate-700">"Launch Global Campaign"</span>) and click <strong>Start Job</strong> to watch them execute the strategy live.
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                debateLog.map((log, i) => (
                                    <div key={i} className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                                        <div className="flex items-center gap-3 mb-2">
                                            <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded border ${log.type === 'strategy' ? 'bg-blue-100 border-blue-200 text-blue-700' :
                                                log.type === 'creative' ? 'bg-purple-100 border-purple-200 text-purple-700' :
                                                    log.type === 'critic' ? 'bg-rose-100 border-rose-200 text-rose-700' :
                                                        'bg-slate-100 border-slate-200 text-slate-700'
                                                }`}>
                                                {log.agent}
                                            </span>
                                            <div className="flex-1 h-px bg-slate-100" />
                                            <span className="text-[10px] font-mono text-slate-300">T+{i * 1200}ms</span>
                                        </div>
                                        <p className="font-mono text-sm text-slate-700 leading-relaxed bg-white p-4 rounded-2xl border border-slate-100 shadow-sm relative">
                                            {log.message}
                                        </p>
                                    </div>
                                ))
                            )}

                            {!isDebating && debateLog.length > 0 && (
                                <div className="animate-in fade-in zoom-in duration-500 mt-8 mb-4">
                                    <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 relative overflow-hidden shadow-lg shadow-emerald-500/10">
                                        <div className="absolute top-0 right-0 p-4 opacity-10">
                                            <CheckCircle2 className="w-24 h-24 text-emerald-600" />
                                        </div>
                                        <h3 className="text-xl font-black text-emerald-800 mb-4 flex items-center gap-2">
                                            <Shield className="w-6 h-6" />
                                            MISSION CLEARED
                                        </h3>
                                        <div className="grid grid-cols-2 gap-4 text-emerald-900/80 mb-4">
                                            <div>
                                                <p className="text-xs uppercase font-bold text-emerald-500">Risk Assessment</p>
                                                <p className="font-mono font-bold">PASSED (100% Safe)</p>
                                            </div>
                                            <div>
                                                <p className="text-xs uppercase font-bold text-emerald-500">Strategy Pivot</p>
                                                <p className="font-mono font-bold">APPLIED (Optimization v2)</p>
                                            </div>
                                        </div>
                                        <div className="bg-white/50 rounded-xl p-4 border border-emerald-100 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                                            <div className="flex-1">
                                                <p className="font-bold text-emerald-900 text-sm mb-1">Final Takeaway:</p>
                                                <p className="text-emerald-800 text-sm leading-relaxed">
                                                    The War Room has reached consensus. Content has been rigorously debated, culturally adapted, and legally vetted against G20 compliance protocols.
                                                </p>
                                            </div>
                                            <button
                                                onClick={() => setActiveTab('approval_queue')}
                                                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-lg shadow-emerald-600/20 transition-all active:scale-95 flex items-center gap-2 whitespace-nowrap"
                                            >
                                                View Assets
                                                <ChevronRight className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="p-4 bg-white border-t border-slate-100">
                            <div className="flex items-center gap-3 text-slate-400">
                                <Bot className="w-5 h-5" />
                                <div className="flex-1 bg-slate-50 rounded-xl px-4 py-2 border border-slate-100">
                                    <p className="text-xs font-mono italic">
                                        {isDebating
                                            ? `System processing: ${activeAgent} is submitting update...`
                                            : humanOptOut
                                                ? 'Collaboration complete. Auto-publishing enabled.'
                                                : 'Collaboration complete. Sent to approval queue for review.'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Human Approval Queue Tab */}
            {activeTab === 'approval_queue' && (
                <div className="space-y-6">
                    {/* Queue Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-center">
                            <p className="text-3xl font-black text-amber-600">{approvalQueue.filter(i => i.status === 'pending').length}</p>
                            <p className="text-sm text-amber-700">Pending Review</p>
                        </div>
                        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-center">
                            <p className="text-3xl font-black text-emerald-600">{approvalQueue.filter(i => i.status === 'approved').length}</p>
                            <p className="text-sm text-emerald-700">Approved</p>
                        </div>
                        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 text-center">
                            <p className="text-3xl font-black text-rose-600">{approvalQueue.filter(i => i.status === 'rejected').length}</p>
                            <p className="text-sm text-rose-700">Rejected</p>
                        </div>
                        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 text-center">
                            <p className="text-3xl font-black text-blue-600">{approvalQueue.filter(i => i.status === 'changes_requested').length}</p>
                            <p className="text-sm text-blue-700">Changes Requested</p>
                        </div>
                    </div>

                    {/* Queue Items */}
                    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                        <div className="p-4 border-b border-slate-100 bg-slate-50">
                            <h3 className="font-bold text-slate-800 flex items-center gap-2">
                                <Clock className="w-5 h-5 text-indigo-500" />
                                Campaign Activity Log
                            </h3>
                        </div>

                        {approvalQueue.length === 0 ? (
                            <div className="p-12 text-center">
                                <CheckCircle2 className="w-16 h-16 text-emerald-300 mx-auto mb-4" />
                                <p className="text-lg font-bold text-slate-600">No items pending approval</p>
                                <p className="text-slate-400 mt-2">
                                    {humanOptOut
                                        ? 'Human Review is OFF - content auto-publishes'
                                        : 'Start a collaborative session to generate content'}
                                </p>
                            </div>
                        ) : (
                            <div className="divide-y divide-slate-100">
                                {approvalQueue.map(item => (
                                    <div key={item.id} className="p-4 hover:bg-slate-50 transition-colors">
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex items-start gap-4">
                                                <div className={`p-3 rounded-xl ${item.type === 'blog' ? 'bg-blue-100' :
                                                    item.type === 'email' ? 'bg-rose-100' :
                                                        item.type === 'social' ? 'bg-purple-100' : 'bg-amber-100'
                                                    }`}>
                                                    {item.type === 'blog' && <FileText className="w-5 h-5 text-blue-600" />}
                                                    {item.type === 'email' && <Mail className="w-5 h-5 text-rose-600" />}
                                                    {item.type === 'social' && <MessageSquare className="w-5 h-5 text-purple-600" />}
                                                    {item.type === 'video' && <Play className="w-5 h-5 text-amber-600" />}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-slate-800">{item.title}</p>
                                                    <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                                                        <span className="flex items-center gap-1">
                                                            <Bot className="w-3 h-3" />
                                                            AI Confidence: {Math.round(item.aiConfidence * 100)}%
                                                        </span>
                                                        <span>•</span>
                                                        <span className="capitalize">{item.source.replace('_', ' ')}</span>
                                                        <span>•</span>
                                                        <span>{new Date(item.createdAt).toLocaleTimeString()}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {item.status === 'pending' ? (
                                                    <>
                                                        <button
                                                            onClick={() => handleApproval(item.id, 'approve')}
                                                            className="px-4 py-2 bg-emerald-600 text-white rounded-xl font-bold text-sm hover:bg-emerald-700 flex items-center gap-2"
                                                        >
                                                            <ThumbsUp className="w-4 h-4" />
                                                            Approve
                                                        </button>
                                                        <button
                                                            onClick={() => handleApproval(item.id, 'changes')}
                                                            className="px-4 py-2 bg-amber-100 text-amber-700 rounded-xl font-bold text-sm hover:bg-amber-200 flex items-center gap-2"
                                                        >
                                                            <Edit2 className="w-4 h-4" />
                                                            Request Changes
                                                        </button>
                                                        <button
                                                            onClick={() => handleApproval(item.id, 'reject')}
                                                            className="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl font-bold text-sm hover:bg-rose-100 hover:text-rose-600 flex items-center gap-2"
                                                        >
                                                            <XCircle className="w-4 h-4" />
                                                        </button>
                                                    </>
                                                ) : (
                                                    <span className={`px-4 py-2 rounded-xl font-bold text-sm ${item.status === 'approved' ? 'bg-emerald-100 text-emerald-700' :
                                                        item.status === 'rejected' ? 'bg-rose-100 text-rose-700' :
                                                            'bg-amber-100 text-amber-700'
                                                        }`}>
                                                        {item.status === 'approved' && '🚀 Live on Social Media'}
                                                        {item.status === 'rejected' && '✗ Rejected'}
                                                        {item.status === 'changes_requested' && '↻ Changes Requested'}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Info Box */}
                    <div className={`rounded-2xl p-6 ${humanOptOut ? 'bg-rose-50 border border-rose-200' : 'bg-emerald-50 border border-emerald-200'}`}>
                        <h4 className={`font-bold mb-2 flex items-center gap-2 ${humanOptOut ? 'text-rose-700' : 'text-emerald-700'}`}>
                            {humanOptOut ? (
                                <><AlertCircle className="w-5 h-5" /> Human Review is Currently OFF</>
                            ) : (
                                <><CheckCircle2 className="w-5 h-5" /> Human Review is Enabled</>
                            )}
                        </h4>
                        <p className={`text-sm ${humanOptOut ? 'text-rose-600' : 'text-emerald-600'}`}>
                            {humanOptOut
                                ? 'Content from AI War Room is auto-published. Turn on Human Review to send content here for manual approval.'
                                : 'All AI-generated content will appear here for your review before publishing.'}
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}

