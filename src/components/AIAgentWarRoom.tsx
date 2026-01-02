
'use client';

import { useState, useEffect, useRef } from 'react';
import {
    Swords, Shield, MessageSquare, AlertCircle,
    CheckCircle2, Play, RefreshCw, Bot,
    Terminal, Zap, Sparkles, UserCheck, Search, Filter
} from 'lucide-react';
import { getSupervisorAgent } from '@/lib/ai/supervisor';

interface DebateLine {
    agent: string;
    message: string;
    type: 'strategy' | 'creative' | 'critic' | 'system';
}

export default function AIAgentWarRoom() {
    const [isDebating, setIsDebating] = useState(false);
    const [debateLog, setDebateLog] = useState<DebateLine[]>([]);
    const [activeAgent, setActiveAgent] = useState<string | null>(null);
    const scrollRef = useRef<HTMLDivElement>(null);

    const agents = [
        { name: 'Strategist', icon: Bot, color: 'text-blue-500', bg: 'bg-blue-50' },
        { name: 'Copywriter', icon: MessageSquare, color: 'text-purple-500', bg: 'bg-purple-50' },
        { name: 'Critic', icon: Swords, color: 'text-rose-500', bg: 'bg-rose-50' },
        { name: 'SEO Worker', icon: Search, color: 'text-emerald-500', bg: 'bg-emerald-50' },
        { name: 'Risk Worker', icon: Shield, color: 'text-amber-500', bg: 'bg-amber-50' }
    ];

    const runDebate = async () => {
        setIsDebating(true);
        setDebateLog([]);
        const supervisor = getSupervisorAgent();

        const steps = [
            { agent: 'Strategist', message: 'Goal: Establish "AI Ethics" as a category-defining subject.', type: 'strategy' as const },
            { agent: 'Copywriter', message: 'Drafting a high-intent blog post emphasizing transparency.', type: 'creative' as const },
            { agent: 'Critic', message: 'The hook is too generic. We need more tension in the first 2 paragraphs.', type: 'critic' as const },
            { agent: 'SEO Worker', message: 'Optimizing for "AI Governance" and "Ethical AI" keywords.', type: 'system' as const },
            { agent: 'Risk Worker', message: 'Compliance check: Tone is authoritative and non-biased.', type: 'system' as const },
            { agent: 'Copywriter', message: 'Refined draft. Injected "Human-centric" angle into the opening.', type: 'creative' as const },
            { agent: 'Strategist', message: 'Consensus reached. Final output optimized for Pro-Plan standards.', type: 'strategy' as const }
        ];

        for (const step of steps) {
            setActiveAgent(step.agent);
            await new Promise(resolve => setTimeout(resolve, 1200));
            setDebateLog(prev => [...prev, step]);
            if (scrollRef.current) {
                scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
            }
        }

        setIsDebating(false);
        setActiveAgent(null);
    };

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
                <button
                    onClick={runDebate}
                    disabled={isDebating}
                    className="px-6 py-3 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-all flex items-center gap-2 shadow-lg active:scale-95 disabled:opacity-50"
                >
                    {isDebating ? (
                        <>
                            <RefreshCw className="w-5 h-5 animate-spin" />
                            Agents Debating...
                        </>
                    ) : (
                        <>
                            <Play className="w-5 h-5 fill-current" />
                            Start Collaborative Session
                        </>
                    )}
                </button>
            </div>

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
                                        <p className="text-xs text-slate-500">{activeAgent === agent.name ? 'Typing...' : 'Waiting for context'}</p>
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

                    <div className="bg-slate-900 rounded-3xl p-6 text-white overflow-hidden relative group">
                        <Terminal className="absolute top-4 right-4 w-12 h-12 text-white/10 group-hover:text-white/20 transition-all" />
                        <h4 className="font-bold mb-2 flex items-center gap-2">
                            <Zap className="w-4 h-4 text-amber-400 fill-amber-400" />
                            Consensus Engine
                        </h4>
                        <div className="space-y-4">
                            <div>
                                <div className="flex justify-between text-xs mb-1 font-mono">
                                    <span className="text-slate-400 text-uppercase tracking-tighter">QUALITY OUTPUT</span>
                                    <span className="text-emerald-400">98%</span>
                                </div>
                                <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                                    <div className="h-full bg-emerald-500 w-[98%] rounded-full shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                                </div>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
                                <AlertCircle className="w-3.5 h-3.5" />
                                <span>Zero-Risk publishing enabled</span>
                            </div>
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
                            <span className="flex items-center gap-1"><UserCheck className="w-3 h-3 text-emerald-500" /> Human Opt-Out</span>
                        </div>
                    </div>

                    <div ref={scrollRef} className="flex-1 overflow-y-auto p-8 space-y-8 bg-slate-50/50 scroll-smooth">
                        {debateLog.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-30">
                                <Terminal className="w-16 h-16" />
                                <p className="font-mono text-sm">AWAITING_COLLABORATION_INITIALIZATION...</p>
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
                                        {log.agent === 'Critic' && (
                                            <Swords className="absolute -top-3 -right-3 w-8 h-8 text-rose-100 -rotate-12" />
                                        )}
                                        {log.agent === 'SEO Worker' && (
                                            <Search className="absolute -top-3 -right-3 w-8 h-8 text-emerald-100 rotate-12" />
                                        )}
                                    </p>
                                </div>
                            ))
                        )}
                    </div>

                    <div className="p-4 bg-white border-t border-slate-100">
                        <div className="flex items-center gap-3 text-slate-400">
                            <Bot className="w-5 h-5" />
                            <div className="flex-1 bg-slate-50 rounded-xl px-4 py-2 border border-slate-100 pointer-events-none">
                                <p className="text-xs font-mono italic">
                                    {isDebating ? `System processing: ${activeAgent} is submitting update...` : 'Collaboration complete. Final output ready for review.'}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
