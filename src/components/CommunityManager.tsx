
'use client';

import { useState, useEffect } from 'react';
import {
    MessageSquare, Send, CheckCircle2,
    XCircle, Clock, Globe, Instagram,
    Youtube, Facebook, Linkedin, Filter,
    Sparkles, Trash2, ArrowRight, Loader2
} from 'lucide-react';
import { MOCK_COMMENTS, fetchComments, postReply, type CommunityComment } from '@/lib/ai/community';

export default function CommunityManager() {
    const [comments, setComments] = useState<CommunityComment[]>([]);
    const [loading, setLoading] = useState(true);
    const [isReplying, setIsReplying] = useState<string | null>(null);

    useEffect(() => {
        const load = async () => {
            const data = await fetchComments();
            setComments(data);
            setLoading(false);
        };
        load();
    }, []);

    const handleSend = async (id: string, reply: string) => {
        setIsReplying(id);
        await postReply(id, reply);
        setComments(prev => prev.map(c => c.id === id ? { ...c, status: 'replied' } : c));
        setIsReplying(null);
    };

    const handleDismiss = (id: string) => {
        setComments(prev => prev.filter(c => c.id !== id));
    };

    const getPlatformIcon = (platform: string) => {
        switch (platform) {
            case 'instagram': return <Instagram className="w-4 h-4 text-pink-500" />;
            case 'youtube': return <Youtube className="w-4 h-4 text-red-500" />;
            case 'facebook': return <Facebook className="w-4 h-4 text-blue-600" />;
            case 'linkedin': return <Linkedin className="w-4 h-4 text-blue-700" />;
            default: return <MessageSquare className="w-4 h-4" />;
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-left-4 duration-500">
            {/* Header / Stats Row */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                        <MessageSquare className="w-6 h-6 text-indigo-500" />
                        AI Community Manager
                    </h2>
                    <p className="text-slate-500 mt-1">Autonomous engagement, FAQ management, and sentiment monitoring.</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="text-right">
                        <p className="text-xs font-bold text-slate-400 uppercase">Total Conversations</p>
                        <p className="text-xl font-black text-slate-900">142</p>
                    </div>
                    <div className="h-8 w-px bg-slate-200" />
                    <div className="text-right">
                        <p className="text-xs font-bold text-slate-400 uppercase">Avg Response Time</p>
                        <p className="text-xl font-black text-emerald-600">4s</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Comments List */}
                <div className="lg:col-span-8 space-y-4">
                    <div className="flex items-center justify-between px-2">
                        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Active Conversations</h3>
                        <div className="flex items-center gap-2">
                            <button className="p-2 border border-slate-200 rounded-xl hover:bg-slate-50 flex items-center gap-2 text-xs font-bold text-slate-600">
                                <Filter className="w-3.5 h-3.5" />
                                Filter Platforms
                            </button>
                        </div>
                    </div>

                    <div className="space-y-4">
                        {loading ? (
                            Array(3).fill(0).map((_, i) => (
                                <div key={i} className="h-48 bg-slate-100 rounded-3xl animate-pulse" />
                            ))
                        ) : comments.length === 0 ? (
                            <div className="p-12 text-center bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
                                <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-4" />
                                <p className="font-bold text-slate-700">Inbox Zero!</p>
                                <p className="text-sm text-slate-500">All comments have been handled by the AI.</p>
                            </div>
                        ) : (
                            comments.map(comment => (
                                <div key={comment.id} className={`bg-white rounded-[2rem] border transition-all ${comment.status === 'replied' ? 'opacity-50 border-emerald-100' : 'border-slate-200 shadow-sm hover:shadow-md'
                                    }`}>
                                    <div className="p-6">
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden border-2 border-white shadow-sm">
                                                    <img src={comment.authorAvatar} alt={comment.author} className="w-full h-full object-cover" />
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <p className="font-bold text-slate-900">{comment.author}</p>
                                                        {getPlatformIcon(comment.platform)}
                                                    </div>
                                                    <p className="text-[10px] text-slate-400 font-bold uppercase flex items-center gap-1">
                                                        <Clock className="w-3 h-3" />
                                                        {comment.timeAgo}
                                                    </p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => handleDismiss(comment.id)}
                                                className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>

                                        <div className="mt-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                            <p className="text-sm text-slate-700 leading-relaxed italic">
                                                "{comment.content}"
                                            </p>
                                        </div>

                                        {comment.status === 'pending' && comment.aiDraft && (
                                            <div className="mt-6 space-y-4 animate-in slide-in-from-top-2 duration-300">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-6 h-6 rounded-lg bg-indigo-600 flex items-center justify-center">
                                                        <Sparkles className="w-3.5 h-3.5 text-white" />
                                                    </div>
                                                    <h4 className="text-xs font-bold text-indigo-700 uppercase tracking-tight">AI Suggested Reply</h4>
                                                </div>
                                                <div className="p-4 bg-indigo-50 rounded-2xl border border-indigo-100 shadow-inner">
                                                    <p className="text-sm text-indigo-900 leading-relaxed font-medium">
                                                        {comment.aiDraft}
                                                    </p>
                                                </div>
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => handleSend(comment.id, comment.aiDraft!)}
                                                        disabled={!!isReplying}
                                                        className="flex-1 py-3 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20 active:scale-95"
                                                    >
                                                        {isReplying === comment.id ? (
                                                            <Loader2 className="w-4 h-4 animate-spin" />
                                                        ) : (
                                                            <>
                                                                <Send className="w-4 h-4" />
                                                                Approve & Post Reply
                                                            </>
                                                        )}
                                                    </button>
                                                    <button className="px-6 py-3 border border-indigo-200 text-indigo-600 rounded-xl text-sm font-bold hover:bg-indigo-100 transition-all">
                                                        Edit
                                                    </button>
                                                </div>
                                            </div>
                                        )}

                                        {comment.status === 'replied' && (
                                            <div className="mt-6 flex items-center gap-2 text-emerald-600 font-bold text-sm bg-emerald-50 w-fit px-4 py-2 rounded-xl">
                                                <CheckCircle2 className="w-4 h-4" />
                                                REPLIED SUCCESSFULLY
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Automation Rules / Settings */}
                <div className="lg:col-span-4 space-y-6">
                    <div className="bg-slate-900 rounded-[2rem] p-8 text-white shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-8">
                            <Clock className="w-24 h-24 text-white/5 -rotate-12" />
                        </div>
                        <h3 className="text-xl font-bold relative z-10 flex items-center gap-2">
                            <Globe className="w-6 h-6 text-indigo-400" />
                            Auto-Reply Rules
                        </h3>
                        <p className="text-slate-400 text-sm mt-2 relative z-10">
                            Configure how the AI handles common scenarios automatically.
                        </p>

                        <div className="mt-8 space-y-4 relative z-10">
                            {[
                                { label: 'FAQ Confidence > 90%', status: 'ENABLED', color: 'text-emerald-400' },
                                { label: 'Sentiment Negative', status: 'HUMAN REVIEW', color: 'text-amber-400' },
                                { label: 'Competitor Mention', status: 'FLAGGED', color: 'text-rose-400' },
                                { label: 'Direct Pricing Inquiry', status: 'AUTO-REPLY', color: 'text-indigo-400' }
                            ].map((rule, idx) => (
                                <div key={idx} className="flex items-center justify-between p-3 rounded-2xl bg-white/5 border border-white/10">
                                    <span className="text-xs font-medium text-slate-300">{rule.label}</span>
                                    <span className={`text-[10px] font-black ${rule.color}`}>{rule.status}</span>
                                </div>
                            ))}
                        </div>

                        <button className="w-full mt-8 py-3 bg-white text-slate-900 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-slate-100 transition-all">
                            Configure FAQ Knowledge Base
                            <ArrowRight className="w-4 h-4" />
                        </button>
                    </div>

                    <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-2xl bg-amber-50 flex items-center justify-center">
                                <XCircle className="w-6 h-6 text-amber-500" />
                            </div>
                            <div>
                                <h4 className="font-bold text-slate-900">Spam Sentinel</h4>
                                <p className="text-[10px] text-slate-400 font-bold uppercase">Active Protection</p>
                            </div>
                        </div>
                        <p className="text-xs text-slate-500 leading-relaxed">
                            AI is currently blocking approx. <span className="text-slate-900 font-bold">12 spam comments per hour</span> from bots.
                        </p>
                        <div className="mt-4 flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                            <span className="flex-shrink-0 px-2 py-1 bg-slate-50 rounded text-[10px] text-slate-400 border border-slate-100">#CryptoSpam</span>
                            <span className="flex-shrink-0 px-2 py-1 bg-slate-50 rounded text-[10px] text-slate-400 border border-slate-100">#NudeBots</span>
                            <span className="flex-shrink-0 px-2 py-1 bg-slate-50 rounded text-[10px] text-slate-400 border border-slate-100">#LinkSpam</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
