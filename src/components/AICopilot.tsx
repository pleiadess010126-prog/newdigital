'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
    Sparkles,
    X,
    Send,
    Maximize2,
    Minimize2,
    MessageSquare,
    Zap,
    RefreshCw,
    ChevronUp,
    ChevronDown,
    Wand2,
    BarChart3,
    Calendar,
    TrendingUp,
    HelpCircle,
    Repeat2,
    Mic,
    MicOff,
    Volume2,
    Bot,
    CheckCircle2,
} from 'lucide-react';
import {
    processAgentCommand,
    QUICK_ACTIONS,
    getProactiveInsights,
    AgentMessage,
    AgentAction
} from '@/lib/ai/copilotAgent';

interface AICopilotProps {
    currentPage?: string;
    userPlan?: string;
    onAction?: (action: string, data?: any) => void;
}

export default function AICopilot({ currentPage = 'dashboard', userPlan = 'free', onAction }: AICopilotProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState<AgentMessage[]>([]);
    const [isTyping, setIsTyping] = useState(false);
    const [showQuickActions, setShowQuickActions] = useState(true);
    const [proactiveMessage, setProactiveMessage] = useState<string | null>(null);
    const [pulseEffect, setPulseEffect] = useState(false);
    const [showTrace, setShowTrace] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const traceRef = useRef<HTMLDivElement>(null);

    // Initialize with welcome message
    useEffect(() => {
        if (messages.length === 0) {
            const welcomeMessage: AgentMessage = {
                id: 'welcome',
                role: 'agent',
                content: "Hey! 👋 I'm Nandu, your AI assistant. I can help you generate content, analyze performance, schedule posts, and much more. Just ask me anything!",
                timestamp: new Date(),
            };
            setMessages([welcomeMessage]);
        }
    }, [messages.length]);

    // Proactive insights
    useEffect(() => {
        const insight = getProactiveInsights({
            currentPage,
            userPlan,
            usage: null,
            recentActions: []
        });
        if (insight && !isOpen) {
            setProactiveMessage(insight);
            setPulseEffect(true);
            setTimeout(() => setPulseEffect(false), 3000);
        }
    }, [currentPage, isOpen, userPlan]);

    // Scroll to bottom on new messages
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Focus input when opened
    useEffect(() => {
        if (isOpen) {
            console.log('--- Nandu Agent Handshake Initiated ---');
            console.log('Kernel Version: 2.4.0-agentic');
            console.log('Sub-protocol: navigation-sync active');
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    }, [isOpen]);

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMessage: AgentMessage = {
            id: `user_${Date.now()}`,
            role: 'user',
            content: input,
            timestamp: new Date(),
        };

        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsTyping(true);
        setShowQuickActions(false);

        let response: AgentMessage;

        try {
            // Try the AI-powered Nandu API first
            const apiMessages = messages.filter(m => m.role === 'user' || m.role === 'agent').map(m => ({
                role: m.role === 'user' ? 'user' as const : 'assistant' as const,
                content: m.content,
            }));
            apiMessages.push({ role: 'user' as const, content: input });

            const apiResponse = await fetch('/api/nandu', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: apiMessages,
                    context: { currentPage, userPlan }
                }),
            });

            if (apiResponse.ok) {
                const data = await apiResponse.json();
                response = {
                    id: `msg_${Date.now()}`,
                    role: 'agent',
                    content: data.message,
                    timestamp: new Date(),
                };
                // Show response directly without thought steps for API responses
                setIsTyping(false);
                setMessages(prev => [...prev, response]);
                return;
            }
        } catch (error) {
            console.log('Nandu API unavailable, using local processing:', error);
        }

        // Fallback to local keyword-based processing
        response = await processAgentCommand(input, {
            currentPage,
            userPlan,
            usage: null,
            recentActions: [],
        });

        // If the agent has thought steps, simulate them one by one
        if (response.thoughtSteps && response.thoughtSteps.length > 0) {
            const agentThoughtMessage: AgentMessage = {
                id: `thought_${Date.now()}`,
                role: 'agent',
                content: '',
                timestamp: new Date(),
                thoughtSteps: response.thoughtSteps.map(s => ({ ...s, status: 'pending' })),
            };

            setMessages(prev => [...prev, agentThoughtMessage]);
            setIsTyping(false);

            // Iterate through steps
            for (let i = 0; i < response.thoughtSteps.length; i++) {
                // Set current step to working
                setMessages(prev => prev.map(msg =>
                    msg.id === agentThoughtMessage.id
                        ? {
                            ...msg,
                            thoughtSteps: msg.thoughtSteps?.map((s, idx) =>
                                idx === i ? { ...s, status: 'working' } : s
                            )
                        }
                        : msg
                ));

                // Wait for "work" to happen
                await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 400));

                // Mark current step as completed AND add a log if available
                setMessages(prev => prev.map(msg =>
                    msg.id === agentThoughtMessage.id
                        ? {
                            ...msg,
                            thoughtSteps: msg.thoughtSteps?.map((s, idx) =>
                                idx === i ? { ...s, status: 'completed' } : s
                            ),
                            logs: response.logs && response.logs[i]
                                ? [...(msg.logs || []), response.logs[i]]
                                : msg.logs
                        }
                        : msg
                ));

                // If there's a log, auto-expand trace briefly or just ensure it's visible?
                // Let's just keep it simple/manual for now but the data is there.
            }

            // Finally, show the result in the same message bubble
            await new Promise(resolve => setTimeout(resolve, 300));
            setMessages(prev => prev.map(msg =>
                msg.id === agentThoughtMessage.id
                    ? { ...msg, content: response.content, actions: response.actions }
                    : msg
            ));
        } else {
            // Standard simple response
            await new Promise(resolve => setTimeout(resolve, 1000));
            setIsTyping(false);
            setMessages(prev => [...prev, response]);
        }
    };

    const handleQuickAction = async (command: string) => {
        setInput(command);
        setTimeout(() => handleSend(), 100);
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const handleActionClick = async (action: AgentAction) => {
        // 1. Immediate acknowledgement
        const startMessage: AgentMessage = {
            id: `start_${Date.now()}`,
            role: 'agent',
            content: `🤖 **Action Protocol Initiated:** ${action.label}\nConnecting to worker agents...`,
            timestamp: new Date(),
        };
        setMessages(prev => [...prev, startMessage]);

        // 2. Simulate short agent background work
        await new Promise(resolve => setTimeout(resolve, 600));

        // Execute the internal function if it exists
        if (action.execute) {
            try {
                await action.execute();
            } catch (error) {
                console.error('Error executing agent action:', error);
            }
        }

        if (onAction) {
            onAction(action.type, {
                actionId: action.id,
                ...action.params
            });
        }

        // 3. Final feedback message with "Agentic" tone
        const successMessage: AgentMessage = {
            id: `success_${Date.now()}`,
            role: 'agent',
            content: `✅ **Protocol Success:** "${action.label}" has been synchronized with the system. I have dispatched instructions to the relevant workers.`,
            timestamp: new Date(),
        };
        setMessages(prev => [...prev, successMessage]);
    };

    const clearChat = () => {
        setMessages([{
            id: 'welcome',
            role: 'agent',
            content: "Chat cleared! How can I help you next?",
            timestamp: new Date(),
        }]);
        setShowQuickActions(true);
    };

    // Floating button when closed
    if (!isOpen) {
        return (
            <div className="fixed bottom-6 right-6 z-50">
                {/* Proactive message bubble */}
                {proactiveMessage && (
                    <div className="absolute bottom-16 right-0 w-72 p-4 bg-white rounded-2xl shadow-2xl border border-slate-200 animate-slideIn">
                        <button
                            onClick={() => setProactiveMessage(null)}
                            className="absolute top-2 right-2 p-1 hover:bg-slate-100 rounded-full"
                        >
                            <X className="w-3 h-3 text-slate-400" />
                        </button>
                        <div className="flex gap-3">
                            <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                                <Sparkles className="w-4 h-4 text-white" />
                            </div>
                            <p className="text-sm text-slate-700 pr-4">{proactiveMessage}</p>
                        </div>
                        <button
                            onClick={() => {
                                setIsOpen(true);
                                setProactiveMessage(null);
                            }}
                            className="mt-3 text-sm text-violet-600 font-medium hover:text-violet-700"
                        >
                            Chat with Nandu →
                        </button>
                    </div>
                )}

                {/* Main floating button with comet effect */}
                <button
                    onClick={() => setIsOpen(true)}
                    className={`group relative w-16 h-16 bg-gradient-to-br from-violet-500 via-purple-500 to-fuchsia-500 rounded-full shadow-2xl hover:shadow-violet-500/40 transition-all duration-300 hover:scale-110 ${pulseEffect ? 'animate-pulse' : ''
                        }`}
                >
                    {/* Comet trail effect */}
                    <div className="absolute inset-0 rounded-full bg-gradient-to-br from-violet-400 to-fuchsia-400 blur-xl opacity-50 group-hover:opacity-80 transition-opacity" />
                    <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 opacity-0 group-hover:opacity-30 blur-md transition-opacity animate-spin-slow" />

                    {/* Icon */}
                    <div className="relative flex items-center justify-center w-full h-full">
                        <Sparkles className="w-7 h-7 text-white group-hover:rotate-12 transition-transform" />
                    </div>

                    {/* Notification dot */}
                    {proactiveMessage && (
                        <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 border-2 border-white rounded-full animate-bounce" />
                    )}
                </button>
            </div>
        );
    }

    return (
        <div
            className={`fixed z-50 transition-all duration-300 ${isExpanded
                ? 'inset-4 md:inset-8'
                : isMinimized
                    ? 'bottom-6 right-6 w-80'
                    : 'bottom-6 right-6 w-96 h-[600px]'
                }`}
        >
            <div className="relative w-full h-full bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl shadow-2xl border border-white/10 flex flex-col overflow-hidden">
                {/* Animated background gradient */}
                <div className="absolute inset-0 opacity-30">
                    <div className="absolute inset-0 bg-gradient-to-br from-violet-600/20 via-purple-600/10 to-fuchsia-600/20 animate-gradient" />
                </div>

                {/* Header */}
                <div className="relative flex items-center justify-between p-4 border-b border-white/10 overflow-hidden">
                    {/* Pulsing scanline effect */}
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-violet-500/5 to-transparent h-20 w-full animate-scanline pointer-events-none" />

                    <div className="flex items-center gap-3">
                        <div className="relative group cursor-help">
                            <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-xl flex items-center justify-center shadow-lg shadow-violet-500/20 transition-all group-hover:scale-110 group-active:scale-95 animate-glitch-hover">
                                <Sparkles className="w-5 h-5 text-white animate-pulse" />
                            </div>
                            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-slate-900 rounded-full" />
                        </div>
                        <div>
                            <h3 className="font-bold text-white text-sm flex items-center gap-2">
                                Agent Nandu
                                <span className="px-1.5 py-0.5 bg-emerald-500/20 text-[10px] text-emerald-400 rounded uppercase tracking-tighter border border-emerald-500/30">
                                    Online
                                </span>
                            </h3>
                            <p className="text-[10px] text-white/40 uppercase tracking-widest flex items-center gap-1">
                                <span className="w-1 h-1 bg-violet-400 rounded-full animate-ping" />
                                Worker Agents Active: 12
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-1">
                        <button
                            onClick={clearChat}
                            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                            title="Clear chat"
                        >
                            <RefreshCw className="w-4 h-4 text-white/60" />
                        </button>
                        <button
                            onClick={() => setIsMinimized(!isMinimized)}
                            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                            title={isMinimized ? 'Expand' : 'Minimize'}
                        >
                            {isMinimized ? (
                                <ChevronUp className="w-4 h-4 text-white/60" />
                            ) : (
                                <ChevronDown className="w-4 h-4 text-white/60" />
                            )}
                        </button>
                        <button
                            onClick={() => setIsExpanded(!isExpanded)}
                            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                            title={isExpanded ? 'Collapse' : 'Expand'}
                        >
                            {isExpanded ? (
                                <Minimize2 className="w-4 h-4 text-white/60" />
                            ) : (
                                <Maximize2 className="w-4 h-4 text-white/60" />
                            )}
                        </button>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                            title="Close"
                        >
                            <X className="w-4 h-4 text-white/60" />
                        </button>
                    </div>
                </div>

                {/* Chat Messages */}
                {!isMinimized && (
                    <div className="relative flex-1 overflow-y-auto p-4 space-y-4">
                        {messages.map((message) => (
                            <div
                                key={message.id}
                                className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}
                            >
                                {message.role === 'agent' && (
                                    <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-full flex items-center justify-center flex-shrink-0">
                                        <Bot className="w-4 h-4 text-white" />
                                    </div>
                                )}
                                <div className={`max-w-[80%] ${message.role === 'user' ? '' : ''}`}>
                                    <div
                                        className={`px-4 py-3 rounded-2xl ${message.role === 'user'
                                            ? 'bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white rounded-br-md'
                                            : 'bg-white/10 text-white rounded-bl-md'
                                            }`}
                                    >
                                        {/* Thought Steps UI */}
                                        {message.thoughtSteps && message.thoughtSteps.length > 0 ? (
                                            <div className="mb-3 space-y-2">
                                                <div className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-2 flex items-center gap-2">
                                                    <Zap className="w-3 h-3 text-violet-400" />
                                                    Agent Process
                                                </div>
                                                {message.thoughtSteps.map((step, idx) => (
                                                    <div key={idx} className="flex items-center gap-3 text-xs">
                                                        <div className={`w-4 h-4 rounded-full flex items-center justify-center border ${step.status === 'completed' ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400' :
                                                            step.status === 'working' ? 'bg-violet-500/20 border-violet-500/50 text-violet-400 animate-pulse' :
                                                                'bg-white/5 border-white/10 text-white/30'
                                                            }`}>
                                                            {step.status === 'completed' ? (
                                                                <CheckCircle2 className="w-3 h-3" />
                                                            ) : step.status === 'working' ? (
                                                                <RefreshCw className="w-3 h-3 animate-spin" />
                                                            ) : (
                                                                <div className="w-1 h-1 bg-current rounded-full" />
                                                            )}
                                                        </div>
                                                        <span className={
                                                            step.status === 'completed' ? 'text-white/80' :
                                                                step.status === 'working' ? 'text-violet-300 font-medium' :
                                                                    'text-white/30'
                                                        }>
                                                            {step.label}
                                                        </span>
                                                    </div>
                                                ))}

                                                {!message.content && (
                                                    <div className="pt-2 flex items-center gap-2">
                                                        <div className="w-1.5 h-1.5 bg-violet-500 rounded-full animate-ping" />
                                                        <span className="text-[10px] text-violet-400 font-bold animate-pulse uppercase">Synthesizing Final Response...</span>
                                                    </div>
                                                )}

                                                {/* System Trace Logs */}
                                                {message.logs && message.logs.length > 0 && (
                                                    <div className="mt-4 border-t border-white/5 pt-3">
                                                        <div className="flex items-center justify-between mb-2">
                                                            <div className="text-[10px] font-bold text-white/30 uppercase tracking-widest flex items-center gap-2">
                                                                <Maximize2 className="w-3 h-3" />
                                                                System Trace
                                                            </div>
                                                            <button
                                                                onClick={() => setShowTrace(!showTrace)}
                                                                className="text-[10px] text-violet-400 hover:text-violet-300 font-bold uppercase transition-colors"
                                                            >
                                                                {showTrace ? 'Hide Trace' : 'View Trace'}
                                                            </button>
                                                        </div>
                                                        {showTrace && (
                                                            <div className="trace-panel-holographic rounded-lg p-3 font-mono text-[10px] text-emerald-400/80 space-y-1 max-h-32 overflow-y-auto custom-scrollbar">
                                                                {message.logs.map((log, lIdx) => (
                                                                    <div key={lIdx} className="flex gap-2">
                                                                        <span className="text-white/20">[{new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}]</span>
                                                                        <span className="animate-pulse-slow">{log}</span>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        ) : null}
                                        {message.content && <p className="text-sm whitespace-pre-wrap">{message.content}</p>}
                                    </div>

                                    {/* Action buttons */}
                                    {message.actions && message.actions.length > 0 && (
                                        <div className="flex flex-wrap gap-2 mt-2">
                                            {message.actions.map((action) => (
                                                <button
                                                    key={action.id}
                                                    onClick={() => handleActionClick(action)}
                                                    className="flex items-center gap-2 px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm text-white transition-colors"
                                                >
                                                    <span>{action.icon}</span>
                                                    <span>{action.label}</span>
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}

                        {/* Typing indicator */}
                        {isTyping && (
                            <div className="flex gap-3">
                                <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-full flex items-center justify-center flex-shrink-0">
                                    <Bot className="w-4 h-4 text-white" />
                                </div>
                                <div className="px-4 py-3 bg-white/10 rounded-2xl rounded-bl-md">
                                    <div className="flex gap-1">
                                        <span className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                        <span className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                        <span className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                    </div>
                                </div>
                            </div>
                        )}

                        <div ref={messagesEndRef} />
                    </div>
                )}

                {/* Quick Actions */}
                {!isMinimized && showQuickActions && messages.length <= 1 && (
                    <div className="relative px-4 pb-2">
                        <p className="text-xs text-white/40 mb-2">Quick actions:</p>
                        <div className="flex flex-wrap gap-2">
                            {QUICK_ACTIONS.map((action) => (
                                <button
                                    key={action.id}
                                    onClick={() => handleQuickAction(action.command)}
                                    className="flex items-center gap-2 px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm text-white transition-all hover:scale-105"
                                >
                                    <span>{action.icon}</span>
                                    <span>{action.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Input Area */}
                {!isMinimized && (
                    <div className="relative p-4 border-t border-white/10">
                        <div className="flex items-center gap-2">
                            <div className="flex-1 relative">
                                <input
                                    ref={inputRef}
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyPress={handleKeyPress}
                                    placeholder="Ask Nandu anything..."
                                    className="w-full px-4 py-3 bg-white/10 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20 transition-all"
                                />
                            </div>
                            <button
                                onClick={handleSend}
                                disabled={!input.trim()}
                                className="p-3 bg-gradient-to-r from-violet-500 to-fuchsia-500 hover:from-violet-600 hover:to-fuchsia-600 rounded-xl text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Send className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Suggestions */}
                        <div className="flex items-center gap-2 mt-2 text-xs text-white/40">
                            <span>Try:</span>
                            <button
                                onClick={() => setInput('Generate a LinkedIn post about AI')}
                                className="hover:text-white/70 transition-colors"
                            >
                                "Generate a LinkedIn post"
                            </button>
                            <span>•</span>
                            <button
                                onClick={() => setInput('Show my analytics')}
                                className="hover:text-white/70 transition-colors"
                            >
                                "Show analytics"
                            </button>
                        </div>
                    </div>
                )}

                {/* Minimized state */}
                {isMinimized && (
                    <div className="p-3 flex items-center justify-between">
                        <span className="text-white/60 text-sm">Agent Nandu ready to help</span>
                        <button
                            onClick={() => setIsMinimized(false)}
                            className="px-3 py-1 bg-violet-500 hover:bg-violet-600 text-white text-sm rounded-lg transition-colors"
                        >
                            Open
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
