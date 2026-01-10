
'use client';

import { useState, useEffect, useRef } from 'react';
import {
    Swords, Shield, MessageSquare, AlertCircle,
    CheckCircle2, Play, RefreshCw, Bot,
    Terminal, Zap, Sparkles, UserCheck, Search, Filter,
    BarChart3, Palette, Brain, Cpu, Network, Activity
} from 'lucide-react';
import { getSupervisorAgent } from '@/lib/ai/supervisor';

interface DebateLine {
    agent: string;
    message: string;
    type: 'strategy' | 'creative' | 'critic' | 'system' | 'analytics' | 'trend' | 'spy' | 'psychology';
}

interface AIAgentWarRoomProps {
    topicPillars?: { name: string; description: string }[];
}

export default function AIAgentWarRoom({ topicPillars = [] }: AIAgentWarRoomProps) {
    const [isDebating, setIsDebating] = useState(false);
    const [isNeuralProcessing, setIsNeuralProcessing] = useState(false);
    const [debateLog, setDebateLog] = useState<DebateLine[]>([]);
    const [activeAgent, setActiveAgent] = useState<string | null>(null);
    const [finalDecision, setFinalDecision] = useState<string | null>(null);
    const [confidenceScore, setConfidenceScore] = useState(0);
    const [simulationProgress, setSimulationProgress] = useState(0);
    const [selectedTopicPillar, setSelectedTopicPillar] = useState<string>(topicPillars[0]?.name || 'AI Ethics');
    const [isPublishing, setIsPublishing] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    const agents = [
        { name: 'System Architect', icon: Cpu, color: 'text-emerald-400', bg: 'bg-emerald-950' },
        { name: 'Strategist', icon: Bot, color: 'text-blue-500', bg: 'bg-blue-50' },
        { name: 'Trend Hunter', icon: Zap, color: 'text-orange-500', bg: 'bg-orange-50' },
        { name: 'Competitor Spy', icon: UserCheck, color: 'text-orange-600', bg: 'bg-orange-100' },
        { name: 'Data Analyst', icon: BarChart3, color: 'text-cyan-500', bg: 'bg-cyan-50' },
        { name: 'Behavioral Psychologist', icon: Brain, color: 'text-indigo-500', bg: 'bg-indigo-50' },
        { name: 'Copywriter', icon: MessageSquare, color: 'text-purple-500', bg: 'bg-purple-50' },
        { name: 'Creative Director', icon: Palette, color: 'text-pink-500', bg: 'bg-pink-50' },
        { name: 'Critic', icon: Swords, color: 'text-rose-500', bg: 'bg-rose-50' },
        { name: 'SEO Worker', icon: Search, color: 'text-emerald-500', bg: 'bg-emerald-50' },
        { name: 'Risk Worker', icon: Shield, color: 'text-amber-500', bg: 'bg-amber-50' }
    ];

    const runDebate = async () => {
        setIsDebating(true);
        setDebateLog([]);
        setFinalDecision(null);
        const supervisor = getSupervisorAgent();

        const selectedTopic = selectedTopicPillar;

        const steps: DebateLine[] = [
            { agent: 'System Architect', message: `Initializing ASI-Level Neural Synthesis for project: "${selectedTopic}"...`, type: 'system' },
            { agent: 'Strategist', message: `ASI Objective: Global market dominance in the "${selectedTopic}" sector through predictive intelligence.`, type: 'strategy' },
            { agent: 'Trend Hunter', message: 'Neural Pulse: Detected early festive signals (Region: Asia/Global). Integrating cultural DNA into the core strategy.', type: 'trend' },
            { agent: 'Competitor Spy', message: 'Cross-Domain Analysis: Rivals are using deterministic SEO. We will counter with "Intent-Based" differentiation.', type: 'spy' },
            { agent: 'Data Analyst', message: `Synesthesia Sync: Views up 45%. Behavioral patterns suggest users are craving "Ethical Transparency".`, type: 'analytics' },
            { agent: 'Behavioral Psychologist', message: 'Trigger injection: Adding "Subconscious Scarcity" and "Identity-Anchor" social proof.', type: 'psychology' },
            { agent: 'Creative Director', message: 'Aesthetic Blueprint: Generating "Luxury Kinetic" visual frames with Deep Navy #0F172A and Solstice Gold.', type: 'creative' },
            { agent: 'Copywriter', message: 'Synthesizing Narrative: Merging festive warmth with provocative competitive edge.', type: 'creative' },
            { agent: 'System Architect', message: 'Running 10,000 simulations of current strategy... Success rate: 99.8%.', type: 'system' },
            { agent: 'Critic', message: 'Challenge: The "Identity-Anchor" is 2% too aggressive for the festive tone. Soften the edge.', type: 'critic' },
            { agent: 'Strategist', message: 'Adjusting... Narrative recalibrated. Optimal performance target: Reached.', type: 'strategy' }
        ];

        for (let i = 0; i < steps.length; i++) {
            const step = steps[i];
            setActiveAgent(step.agent);

            // Dynamic confidence boost
            setConfidenceScore(prev => Math.min(99.8, prev + Math.floor(Math.random() * 10) + 5));

            if (step.agent === 'System Architect' && step.message.includes('Simulations')) {
                setIsNeuralProcessing(true);
                // Simulation progress bar logic
                for (let p = 0; p <= 100; p += 5) {
                    setSimulationProgress(p);
                    await new Promise(resolve => setTimeout(resolve, 100));
                }
                setIsNeuralProcessing(false);
            }

            await new Promise(resolve => setTimeout(resolve, 1200));
            setDebateLog(prev => [...prev, step]);
            if (scrollRef.current) {
                scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
            }
        }

        setIsDebating(false);
        setActiveAgent(null);
        setSimulationProgress(0);
        setFinalDecision(`ASI-SYNTHESIS COMPLETE: The "DigitalMEng" Super-Intelligence has finalized the "${selectedTopic}" masterplan. Strategy is predictive, culturally optimized, and psychologically anchored for maximum conversion. Publishing units: READY.`);
    };

    const handleProceed = async () => {
        setIsPublishing(true);
        // Simulate publishing delay
        await new Promise(resolve => setTimeout(resolve, 2000));
        setIsPublishing(false);
        setShowSuccess(true);
        // Reset after 3 seconds
        setTimeout(() => setShowSuccess(false), 3000);
    };

    const handleEdit = () => {
        setFinalDecision(null);
        setDebateLog([]);
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
                <div className="flex items-center gap-4">
                    <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Select Strategy Goal</label>
                        <select
                            value={selectedTopicPillar}
                            onChange={(e) => setSelectedTopicPillar(e.target.value)}
                            disabled={isDebating}
                            className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-violet-500 disabled:opacity-50"
                        >
                            {topicPillars.map((pillar, idx) => (
                                <option key={idx} value={pillar.name}>{pillar.name}</option>
                            ))}
                            {topicPillars.length === 0 && <option value="AI Ethics">AI Ethics</option>}
                        </select>
                    </div>
                    <button
                        onClick={runDebate}
                        disabled={isDebating}
                        className="px-6 py-3 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-all flex items-center gap-2 shadow-lg active:scale-95 disabled:opacity-50 mt-5"
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
                        <h4 className="font-bold mb-2 flex items-center justify-between">
                            <span className="flex items-center gap-2">
                                <Zap className="w-4 h-4 text-amber-400 fill-amber-400" />
                                ASI Nexus Engine
                            </span>
                            {isNeuralProcessing && <Activity className="w-4 h-4 text-emerald-400 animate-pulse" />}
                        </h4>
                        <div className="space-y-4">
                            <div>
                                <div className="flex justify-between text-xs mb-1 font-mono">
                                    <span className="text-slate-400 text-uppercase tracking-tighter">CONFIDENCE_LEVEL</span>
                                    <span className="text-emerald-400">{confidenceScore}%</span>
                                </div>
                                <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-emerald-500 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.5)] transition-all duration-1000"
                                        style={{ width: `${confidenceScore}%` }}
                                    />
                                </div>
                            </div>

                            {isNeuralProcessing && (
                                <div className="animate-in fade-in slide-in-from-top-2 duration-500">
                                    <div className="flex justify-between text-[10px] mb-1 font-mono text-emerald-400/70">
                                        <span>SIMULATING_TIMELINES...</span>
                                        <span>{simulationProgress}%</span>
                                    </div>
                                    <div className="h-1 bg-emerald-500/20 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-emerald-400 rounded-full transition-all duration-100"
                                            style={{ width: `${simulationProgress}%` }}
                                        />
                                    </div>
                                </div>
                            )}

                            <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono">
                                <Activity className={`w-3 h-3 ${isDebating ? 'text-emerald-400 animate-pulse' : ''}`} />
                                <span>{isDebating ? 'Neural pathways active' : 'Zero-Risk publishing standby'}</span>
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
                                                    log.type === 'analytics' ? 'bg-cyan-100 border-cyan-200 text-cyan-700' :
                                                        log.type === 'trend' ? 'bg-orange-100 border-orange-200 text-orange-700' :
                                                            log.type === 'spy' ? 'bg-orange-200 border-orange-300 text-orange-800' :
                                                                log.type === 'psychology' ? 'bg-indigo-100 border-indigo-200 text-indigo-700' :
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
                                        {log.agent === 'Data Analyst' && (
                                            <BarChart3 className="absolute -top-3 -right-3 w-8 h-8 text-cyan-100 -rotate-6" />
                                        )}
                                        {log.agent === 'Trend Hunter' && (
                                            <Zap className="absolute -top-3 -right-3 w-8 h-8 text-orange-100 rotate-12" />
                                        )}
                                        {log.agent === 'Competitor Spy' && (
                                            <UserCheck className="absolute -top-3 -right-3 w-8 h-8 text-orange-200 -rotate-12" />
                                        )}
                                        {log.agent === 'Behavioral Psychologist' && (
                                            <Brain className="absolute -top-3 -right-3 w-8 h-8 text-indigo-100 rotate-6" />
                                        )}
                                        {log.agent === 'Creative Director' && (
                                            <Palette className="absolute -top-3 -right-3 w-8 h-8 text-pink-100 -rotate-12" />
                                        )}
                                        {log.agent === 'System Architect' && (
                                            <Cpu className="absolute -top-3 -right-3 w-8 h-8 text-emerald-100 rotate-45" />
                                        )}
                                    </p>
                                </div>
                            ))
                        )}

                        {finalDecision && (
                            <div className="animate-in zoom-in slide-in-from-top-4 duration-700 delay-300">
                                <div className="bg-gradient-to-br from-slate-900 to-indigo-950 rounded-3xl p-8 border border-white/10 shadow-2xl relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                        <CheckCircle2 className="w-24 h-24 text-emerald-400" />
                                    </div>
                                    <div className="relative">
                                        <div className="flex items-center gap-2 mb-4">
                                            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                                            <h3 className="text-emerald-400 font-black uppercase tracking-widest text-xs font-mono">
                                                Final War Room Decision
                                            </h3>
                                        </div>
                                        <p className="text-white font-mono text-sm leading-relaxed border-l-2 border-emerald-500/30 pl-4">
                                            {finalDecision}
                                        </p>
                                        <div className="mt-6 flex items-center gap-4">
                                            <button
                                                onClick={handleProceed}
                                                disabled={isPublishing || showSuccess}
                                                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${showSuccess ? 'bg-emerald-600 text-white' : 'bg-emerald-500 text-slate-900 hover:bg-emerald-400'
                                                    }`}
                                            >
                                                {isNeuralProcessing ? (
                                                    <Network className="w-3 h-3 animate-pulse text-emerald-400" />
                                                ) : isPublishing ? (
                                                    <RefreshCw className="w-3 h-3 animate-spin" />
                                                ) : showSuccess ? (
                                                    <CheckCircle2 className="w-3 h-3" />
                                                ) : (
                                                    <Zap className="w-3 h-3" />
                                                )}
                                                {isNeuralProcessing ? 'Synthesizing Neural Flow...' : isPublishing ? 'Publishing...' : showSuccess ? 'Published!' : 'Execute ASI Protocol'}
                                            </button>
                                            <button
                                                onClick={handleEdit}
                                                className="px-4 py-2 bg-white/10 text-white rounded-xl text-xs font-bold hover:bg-white/20 transition-all"
                                            >
                                                Edit Strategy
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
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
