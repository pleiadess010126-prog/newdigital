'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Brain,
    Zap,
    Activity,
    TrendingUp,
    AlertTriangle,
    Lock,
    Unlock,
    Cpu,
    Database,
    Network,
    ArrowRight,
    Terminal,
    Eye,
    Shield,
    DollarSign,
    Briefcase,
    Server
} from 'lucide-react';

interface Directive {
    id: string;
    type: 'optimization' | 'prediction' | 'security';
    title: string;
    reasoning: string;
    impact: string;
    status: 'pending' | 'active' | 'completed';
    confidence: number;
}

interface NeuralNode {
    id: string;
    name: string;
    role: string;
    icon: any;
    image: string; // New Image Field
    color: string;
    status: 'idle' | 'processing' | 'alert';
    currentTask: string;
    speech?: string;
}

interface ASINeuralCoreProps {
    stats?: {
        revenueThisMonth: number;
        totalUsers: number;
        activeSubscriptions: number;
        systemHealth: number;
    };
}

export default function ASINeuralCore({ stats }: ASINeuralCoreProps) {
    const [mounted, setMounted] = useState(false);
    const [systemIntegrity, setSystemIntegrity] = useState(stats?.systemHealth || 98);
    const [activeDirective, setActiveDirective] = useState<Directive | null>(null);
    const [neuralLog, setNeuralLog] = useState<string[]>([]);
    const [processing, setProcessing] = useState(false);

    // Simulated Nodes (The Pentagon) with Avatars
    const [nodes, setNodes] = useState<NeuralNode[]>([
        {
            id: 'prophet',
            name: 'PROPHET',
            role: 'STRATEGY & PREDICTION', // CMO
            icon: Eye,
            image: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?q=80&w=2550&auto=format&fit=crop', // Futuristic Female
            color: 'text-cyan-400',
            status: 'idle',
            currentTask: 'Analyzing market vectors...'
        },
        {
            id: 'treasurer',
            name: 'TREASURER',
            role: 'FINANCE & RISK', // CFO
            icon: DollarSign,
            image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=2449&auto=format&fit=crop', // Sharp Professional Male
            color: 'text-amber-400',
            status: 'idle',
            currentTask: 'Auditing liabilities...'
        },
        {
            id: 'architect',
            name: 'ARCHITECT',
            role: 'SYSTEM & SECURITY', // CTO
            icon: Shield,
            image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=2488&auto=format&fit=crop', // Tech Female
            color: 'text-indigo-400',
            status: 'idle',
            currentTask: 'Monitoring firewall...'
        },
        {
            id: 'operator',
            name: 'OPERATOR',
            role: 'OPS & EFFICIENCY', // COO
            icon: Server,
            image: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=2487&auto=format&fit=crop', // Serious Male
            color: 'text-emerald-400',
            status: 'idle',
            currentTask: 'Tracking workflow velocity...'
        },
        {
            id: 'nexus',
            name: 'NEXUS',
            role: 'ASI CORE SYNTHESIS', // CEO
            icon: Brain,
            image: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?q=80&w=2565&auto=format&fit=crop', // AI Abstract/Holographic
            color: 'text-violet-400',
            status: 'idle',
            currentTask: 'Awaiting strategic input...'
        }
    ]);

    useEffect(() => {
        setMounted(true);
        // Simulate "Aliveness" with Real Data Context
        const interval = setInterval(() => {
            const revenue = stats?.revenueThisMonth ? `$${stats.revenueThisMonth.toLocaleString()}` : 'calculating...';
            const users = stats?.totalUsers ? stats.totalUsers.toLocaleString() : '...';

            const randomLog = [
                `PROPHET: Re-calculating LTV for user base [${users}]...`,
                `ARCHITECT: Latency stable. System integrity steady at ${stats?.systemHealth || 99}%`,
                `TREASURER: Revenue target [${revenue}] analysis - Variance detected.`,
                `OPERATOR: Processing active subscription queue...`,
                `NEXUS: Synthesizing data vectors from Port 80...`,
                `ARCHITECT: Firewall holding against IP range 192.168.x.x`,
                `PROPHET: Predicting churn impact on ${stats?.activeSubscriptions || 0} active subs.`,
                `TREASURER: Optimizing cloud spend for current load.`
            ];
            const log = randomLog[Math.floor(Math.random() * randomLog.length)];
            addLog(log);

            // Randomly pulse nodes
            setNodes(prev => prev.map(node => ({
                ...node,
                status: Math.random() > 0.8 ? 'processing' : 'idle'
            })));

        }, 2500);

        return () => clearInterval(interval);
    }, [stats]);

    const addLog = (msg: string) => {
        setNeuralLog(prev => [msg, ...prev].slice(0, 10));

        // PARSE SPEAKER to show visual speech bubble
        const parts = msg.split(':');
        if (parts.length > 1) {
            const speakerName = parts[0].trim().toUpperCase(); // e.g. "PROPHET"
            const speechText = parts.slice(1).join(':').trim();

            setNodes(prev => prev.map(node => {
                if (node.name === speakerName) {
                    return { ...node, status: 'processing', speech: speechText };
                }
                return node;
            }));

            // Clear speech after 3 seconds
            setTimeout(() => {
                setNodes(prev => prev.map(node => {
                    if (node.name === speakerName) {
                        return { ...node, status: 'idle', speech: undefined };
                    }
                    return node;
                }));
            }, 3000);
        }
    };

    // State for MOM Archive
    const [momList, setMomList] = useState([
        { date: 'Today, 09:00', title: 'Daily Standup', confidence: 98, status: 'completed', transcript: ['NEXUS: STANDUP COMPLETE.'] },
        { date: 'Yesterday', title: 'Budget Review', confidence: 85, status: 'completed', transcript: ['TREASURER: BUDGET APPROVED.'] },
        { date: 'Jan 12', title: 'Viral Trend Analysis', confidence: 92, status: 'rejected', transcript: ['NEXUS: REJECTED.'] },
    ]);

    const runSimulation = () => {
        setProcessing(true);
        setActiveDirective(null);
        setNeuralLog([]);

        // 1. ADD NEW PENDING ITEM START OF LIST
        const newId = Date.now();
        const pendingItem = {
            date: 'Now',
            title: 'Strategic Analysis...',
            confidence: 0,
            status: 'processing', // Special status
            transcript: []
        };
        setMomList(prev => [pendingItem, ...prev]);

        addLog('NEXUS: INITIATING PENTAGON PROTOCOL SCAN...');

        // 2. Simulation Steps
        setTimeout(() => {
            addLog('ARCHITECT: SYSTEM INTEGRITY 99.8%. NO BREACHES.');
            addLog('OPERATOR: WORKFLOW VELOCITY OPTIMAL.');
        }, 800);

        setTimeout(() => {
            addLog('TREASURER: DETECTING 12% VARIANCE.');
            setTimeout(() => addLog('PROPHET: CORRELATING VIRAL SPIKE.'), 1000);
        }, 2000);

        setTimeout(() => {
            addLog('NEXUS: SYNTHESIZING DIRECTIVE...');
        }, 3000);

        // 3. COMPLETE (Update List & Show Card)
        setTimeout(() => {
            const finalTitle = 'SCALE INFRASTRUCTURE';
            const finalTranscript = [
                'NEXUS: START.',
                'ARCHITECT: SYSTEM INTEGRITY 99.8%.',
                'OPERATOR: VELOCITY OPTIMAL.',
                'TREASURER: VARIANCE DETECTED.',
                'PROPHET: VIRAL SPIKE CONFIRMED.',
                'NEXUS: DECISION - SCALE INFRASTRUCTURE.'
            ]; // In reality capture actual logs

            // Update the top item to completed
            setMomList(prev => {
                const updated = [...prev];
                updated[0] = {
                    ...updated[0],
                    title: finalTitle,
                    status: 'completed',
                    confidence: 96,
                    transcript: finalTranscript
                };
                return updated;
            });

            // Show Center Card
            setActiveDirective({
                id: `dir_${newId}`,
                type: 'prediction',
                title: finalTitle,
                reasoning: 'Viral spike detection confirmed by Prophet. Resources allocated.',
                impact: 'Growth +200%.',
                status: 'pending',
                confidence: 96
            });

            // Set Transcript for view
            setNeuralLog(finalTranscript);
            setProcessing(false);
        }, 4000);
    };

    if (!mounted) return null;

    return (
        <div className="min-h-screen bg-slate-950 text-slate-200 font-mono p-6 relative overflow-hidden">
            {/* Background Grid */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-20 pointer-events-none" />

            {/* Header */}
            <header className="relative z-10 flex items-center justify-between mb-8 border-b border-slate-800 pb-4">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-violet-500/10 rounded-lg flex items-center justify-center border border-violet-500/20 shadow-[0_0_15px_rgba(139,92,246,0.3)]">
                        <CircuitBoardIcon className="w-8 h-8 text-violet-400" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold tracking-widest text-white">ASI NEURAL CORE</h1>
                        <div className="flex items-center gap-2 text-xs text-slate-400">
                            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                            SYSTEM_ONLINE // V.4.0.0 // PENTAGON_CONFIG
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-6">
                    <div className="text-right hidden sm:block">
                        <div className="text-xs text-slate-500 mb-1">SYSTEM INTEGRITY</div>
                        <div className="text-xl font-bold text-emerald-400 flex items-center justify-end gap-2">
                            <Shield className="w-4 h-4" /> {systemIntegrity}%
                        </div>
                    </div>
                    <div className="text-right hidden sm:block">
                        <div className="text-xs text-slate-500 mb-1">ACTIVE NODES</div>
                        <div className="text-xl font-bold text-cyan-400">5/5</div>
                    </div>
                </div>
            </header>

            {/* Main Interface - 3 Column Command Center */}
            <main className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 h-[700px] mt-8">

                {/* LEFT COLUMN: Minutes of Meeting (MOM) Archive */}
                <div className="lg:col-span-3 flex flex-col gap-4">
                    <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 flex-1 backdrop-blur-md flex flex-col overflow-hidden">
                        <div className="flex items-center gap-2 mb-4 text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-800 pb-2">
                            <Database className="w-4 h-4" /> Meeting Archives
                        </div>
                        <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2">
                            {/* Mock Past MOMs */}
                            {momList.map((mom, i) => (
                                <div
                                    key={i}
                                    onClick={() => {
                                        if (mom.status === 'processing') return; // Cannot open pending
                                        setActiveDirective({
                                            id: `mom_${i}`,
                                            type: 'optimization',
                                            title: mom.title,
                                            reasoning: `Historical Record from ${mom.date}. Board Decision Logged.`,
                                            impact: 'Archived decision implemented.',
                                            status: mom.status as any,
                                            confidence: mom.confidence
                                        });
                                        // Load Transcript (Discussion)
                                        setNeuralLog(mom.transcript);
                                    }}
                                    className={`
                                        p-3 rounded-lg border transition-all cursor-pointer group
                                        ${mom.status === 'processing'
                                            ? 'bg-amber-900/10 border-amber-500/50 hover:border-amber-400'
                                            : 'bg-slate-800/30 border-slate-700/30 hover:bg-slate-700/50'
                                        }
                                    `}
                                >
                                    <div className="flex justify-between items-start mb-1">
                                        <div className={`text-[10px] ${mom.status === 'processing' ? 'text-amber-400 font-bold animate-pulse' : 'text-slate-500'}`}>
                                            {mom.date}
                                        </div>
                                        <div className={`w-2 h-2 rounded-full 
                                            ${mom.status === 'completed' ? 'bg-emerald-500'
                                                : mom.status === 'rejected' ? 'bg-red-500'
                                                    : 'bg-amber-500 animate-ping'} 
                                        `} />
                                    </div>
                                    <div className={`text-xs font-bold truncate ${mom.status === 'processing' ? 'text-amber-200' : 'text-slate-300 group-hover:text-white'}`}>
                                        {mom.title}
                                    </div>
                                    {mom.status !== 'processing' && (
                                        <div className="flex items-center gap-1 mt-2 text-[10px] text-slate-500">
                                            <Shield className="w-3 h-3" /> Conf: {mom.confidence}%
                                        </div>
                                    )}
                                    {mom.status === 'processing' && (
                                        <div className="mt-2 text-[9px] text-amber-500/80 font-mono flex items-center gap-1">
                                            <Activity className="w-3 h-3 animate-spin" /> ANALYZING...
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                        <button className="mt-4 w-full py-2 bg-slate-800 hover:bg-slate-700 text-xs text-slate-400 rounded-lg transition-colors border border-slate-700">
                            VIEW ALL HISTORY
                        </button>
                    </div>
                </div>

                {/* CENTER COLUMN: The Board Room Table */}
                <div className="lg:col-span-6 relative flex flex-col items-center justify-center border-x border-slate-800/50 bg-black/20 rounded-2xl">

                    {/* The Table Surface */}
                    <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
                        <div className="absolute w-[400px] h-[400px] rounded-full border border-violet-500/30 bg-violet-950/20 backdrop-blur-sm shadow-[0_0_50px_rgba(139,92,246,0.1)] animate-pulse-slow" />
                        <div className="absolute w-[350px] h-[350px] rounded-full border border-violet-500/10 border-dashed" />

                        {/* Central Content (Hologram) */}
                        <div className="relative z-20 w-[280px] text-center">
                            {!activeDirective ? (
                                <div className="animate-float">
                                    <Brain className="w-12 h-12 text-violet-400 mx-auto mb-4 opacity-50" />
                                    <div className="text-sm text-slate-500 tracking-widest uppercase">Awaiting Consensus</div>
                                    <button
                                        onClick={runSimulation}
                                        disabled={processing}
                                        className="mt-6 px-6 py-2 bg-violet-600/20 hover:bg-violet-600/40 border border-violet-500/50 text-violet-300 rounded-full text-xs font-bold tracking-widest transition-all hover:scale-105"
                                    >
                                        {processing ? 'ANALYZING...' : 'CALL MEETING'}
                                    </button>
                                </div>
                            ) : (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="bg-emerald-950/80 border border-emerald-500 p-6 rounded-2xl shadow-[0_0_50px_rgba(16,185,129,0.2)] backdrop-blur-xl relative overflow-hidden flex flex-col max-h-[400px]"
                                >
                                    <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.05)_50%,transparent_75%)] bg-[length:250%_250%] animate-shine pointer-events-none" />

                                    {/* Header */}
                                    <div className="text-emerald-400 text-[10px] font-bold tracking-widest mb-2 uppercase flex items-center justify-center gap-2 shrink-0">
                                        <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                                        Consensus Reached
                                    </div>
                                    <h3 className="text-white font-bold text-lg leading-tight mb-2 drop-shadow-lg shrink-0 text-center">{activeDirective.title}</h3>

                                    {/* Scrollable Content Area */}
                                    <div className="flex-1 overflow-y-auto custom-scrollbar bg-black/20 rounded-lg p-3 border border-emerald-500/20 mb-3">
                                        <div className="text-[10px] text-emerald-200/90 font-mono mb-2 border-b border-emerald-500/20 pb-2">
                                            <strong>REASONING:</strong> {activeDirective.reasoning}
                                        </div>

                                        {/* INCLUDED TRANSCRIPT */}
                                        <div className="mt-2">
                                            <div className="text-[9px] font-bold text-emerald-500 uppercase mb-1">Session Transcript</div>
                                            <div className="space-y-1">
                                                {(activeDirective.id.startsWith('mom_') ? nodes[0]?.speech ? neuralLog : neuralLog : neuralLog).map((line, idx) => ( // Using neuralLog as source for now
                                                    <div key={idx} className="text-[9px] text-slate-300 font-mono leading-relaxed border-l border-emerald-500/30 pl-2">
                                                        {line}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Footer */}
                                    <div className="flex justify-between items-center text-[10px] text-emerald-200/70 border-t border-emerald-500/30 pt-3 shrink-0">
                                        <span className="font-mono">CONFIDENCE: <span className="text-white font-bold">{activeDirective.confidence}%</span></span>
                                        <button onClick={() => setActiveDirective(null)} className="text-white hover:text-emerald-300 transition-colors uppercase font-bold tracking-wider">
                                            Close Record
                                        </button>
                                    </div>
                                </motion.div>
                            )}
                        </div>

                        {/* Agents (Positioned Relative to Container) */}
                        <div className="absolute inset-0 pointer-events-none">
                            <div className="absolute top-10 left-1/2 -translate-x-1/2 pointer-events-auto scale-90"><CharacterCard node={nodes[4]} position="top" /></div>
                            <div className="absolute top-[120px] right-4 pointer-events-auto scale-90"><CharacterCard node={nodes[1]} position="right" /></div>
                            <div className="absolute bottom-[100px] right-4 pointer-events-auto scale-90"><CharacterCard node={nodes[3]} position="right" /></div>
                            <div className="absolute bottom-[100px] left-4 pointer-events-auto scale-90"><CharacterCard node={nodes[2]} position="left" /></div>
                            <div className="absolute top-[120px] left-4 pointer-events-auto scale-90"><CharacterCard node={nodes[0]} position="left" /></div>
                        </div>
                    </div>
                </div>

                {/* RIGHT COLUMN: Transcript (Live vs Archived) */}
                <div className="lg:col-span-3 flex flex-col gap-4">
                    <div className={`
                        border rounded-xl p-4 flex-1 backdrop-blur-md flex flex-col overflow-hidden transition-colors duration-500
                        ${activeDirective?.id.startsWith('mom_') ? 'bg-amber-950/20 border-amber-500/30' : 'bg-slate-900/50 border-slate-800'}
                     `}>
                        <div className={`flex items-center justify-between mb-4 border-b pb-2 ${activeDirective?.id.startsWith('mom_') ? 'border-amber-500/30' : 'border-slate-800'}`}>
                            <div className={`text-xs font-bold uppercase tracking-widest flex items-center gap-2 ${activeDirective?.id.startsWith('mom_') ? 'text-amber-400' : 'text-slate-400'}`}>
                                {activeDirective?.id.startsWith('mom_') ? (
                                    <><Database className="w-4 h-4" /> Archived Recording</>
                                ) : (
                                    <><Activity className="w-4 h-4" /> Live Transcript</>
                                )}
                            </div>
                            {activeDirective?.id.startsWith('mom_') ? (
                                <div className="text-[9px] text-amber-500 font-mono px-2 py-0.5 bg-amber-500/10 rounded border border-amber-500/20">READ_ONLY</div>
                            ) : (
                                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            )}
                        </div>

                        <div className="flex-1 overflow-y-auto custom-scrollbar space-y-4 pr-2">
                            {neuralLog.length === 0 && (
                                <div className="text-center text-xs text-slate-600 mt-10">
                                    {activeDirective?.id.startsWith('mom_') ? 'No transcript found for this record.' : 'Waiting for meeting to start...'}
                                </div>
                            )}
                            <AnimatePresence initial={false}>
                                {neuralLog.map((log, i) => {
                                    const isSpeaker = log.includes(':');
                                    const speaker = isSpeaker ? log.split(':')[0] : 'SYSTEM';
                                    const text = isSpeaker ? log.split(':')[1] : log;
                                    const color = nodes.find(n => n.name === speaker)?.color || 'text-slate-400';

                                    return (
                                        <motion.div
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            key={i}
                                            className="flex flex-col gap-1"
                                        >
                                            <div className={`text-[10px] font-bold ${color} tracking-wider`}>{speaker}</div>
                                            <div className={`text-xs font-mono p-2 rounded border-l-2 ${activeDirective?.id.startsWith('mom_')
                                                ? 'text-amber-100/70 bg-amber-900/20 border-amber-500/30'
                                                : 'text-slate-300 bg-black/20 border-slate-700'
                                                }`}>
                                                {text}
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>

            </main>
        </div>
    );
}

function CharacterCard({ node, position }: { node: NeuralNode, position: 'left' | 'right' | 'top' }) {
    return (
        <div className={`
            flex flex-col items-center gap-3 group transition-all duration-500
            ${node.status === 'processing' ? 'scale-110' : 'scale-100 opacity-90'}
        `}>
            {/* Avatar Circle */}
            <div className={`
                relative w-20 h-20 rounded-full border-2 p-1 transition-all duration-300
                ${node.status === 'processing' ? `border-${node.color.split('-')[1]}-400 shadow-[0_0_30px_rgba(var(--color-glow))]` : 'border-slate-700 grayscale group-hover:grayscale-0'}
            `}>
                <div className="w-full h-full rounded-full overflow-hidden bg-slate-800 relative">
                    <img src={node.image} alt={node.name} className="w-full h-full object-cover" />
                    {node.status === 'processing' && <div className={`absolute inset-0 bg-${node.color.split('-')[1]}-500/20 mix-blend-overlay animate-pulse`} />}
                </div>

                {/* Speech Bubble / Status */}
                {(node.status === 'processing' || node.speech) && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`
                            absolute min-w-[160px] max-w-[200px] bg-slate-900/95 border border-slate-600 p-3 rounded-xl z-50 text-[11px] font-medium shadow-2xl hidden md:block backdrop-blur-md
                            ${position === 'left' ? '-left-44 top-0' : position === 'right' ? '-right-44 top-0' : '-top-24 left-1/2 -translate-x-1/2'}
                        `}
                    >
                        <span className={`${node.color} drop-shadow-md`}>{node.speech || node.currentTask}</span>
                        {/* Arrow */}
                        <div className={`absolute w-3 h-3 bg-slate-600/50 rotate-45 border-r border-b border-slate-600 
                             ${position === 'left' ? 'right-[-6px] top-4' : position === 'right' ? 'left-[-6px] top-4' : 'bottom-[-6px] left-1/2 -translate-x-1/2'}
                        `} />
                    </motion.div>
                )}
            </div>

            {/* Name Plate */}
            <div className="text-center bg-black/50 backdrop-blur px-3 py-1 rounded-full border border-slate-800">
                <div className={`text-[10px] font-bold ${node.color} tracking-widest`}>{node.name}</div>
                <div className="text-[8px] text-slate-500 uppercase">{node.role}</div>
            </div>
        </div>
    );
}

function CircuitBoardIcon(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <rect width="18" height="18" x="3" y="3" rx="2" />
            <path d="M11 9h4a2 2 0 0 0 2-2V3" />
            <circle cx="9" cy="9" r="2" />
            <path d="M7 21v-4a2 2 0 0 1 2-2h4" />
            <circle cx="15" cy="15" r="2" />
        </svg>
    )
}
