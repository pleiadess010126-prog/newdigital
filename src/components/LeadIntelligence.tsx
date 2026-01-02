
'use client';

import { useState, useEffect } from 'react';
import {
    Users, Target, MessageSquare, Linkedin,
    Twitter, ExternalLink, ChevronRight,
    Zap, Filter, Search, MoreHorizontal,
    Mail, Briefcase, GraduationCap, MapPin, Sparkles
} from 'lucide-react';
import { MOCK_PROSPECTS, type LeadProspect } from '@/lib/ai/leads';

export default function LeadIntelligence() {
    const [prospects, setProspects] = useState<LeadProspect[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedLead, setSelectedLead] = useState<LeadProspect | null>(null);

    useEffect(() => {
        const load = async () => {
            await new Promise(resolve => setTimeout(resolve, 800));
            setProspects(MOCK_PROSPECTS);
            setLoading(false);
        };
        load();
    }, []);

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
            {/* Header / Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-violet-100 flex items-center justify-center">
                        <Target className="w-6 h-6 text-violet-600" />
                    </div>
                    <div>
                        <p className="text-sm font-bold text-slate-400 uppercase">Hot Prospects</p>
                        <p className="text-2xl font-black text-slate-900">12</p>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-100 flex items-center justify-center">
                        <Zap className="w-6 h-6 text-emerald-600" />
                    </div>
                    <div>
                        <p className="text-sm font-bold text-slate-400 uppercase">Avg Intent</p>
                        <p className="text-2xl font-black text-slate-900">84%</p>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-blue-100 flex items-center justify-center">
                        <MessageSquare className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                        <p className="text-sm font-bold text-slate-400 uppercase">Replies Gen</p>
                        <p className="text-2xl font-black text-slate-900">34</p>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-rose-100 flex items-center justify-center">
                        <Linkedin className="w-6 h-6 text-rose-600" />
                    </div>
                    <div>
                        <p className="text-sm font-bold text-slate-400 uppercase">Social reach</p>
                        <p className="text-2xl font-black text-slate-900">1.2M</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Leads List */}
                <div className="lg:col-span-8 bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                    <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                        <div className="flex items-center gap-3">
                            <h3 className="font-bold text-slate-900 text-lg">Potential Leads</h3>
                            <span className="px-2 py-1 bg-violet-100 text-violet-600 rounded-lg text-xs font-bold font-mono">LIVE</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="relative">
                                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="Search leads..."
                                    className="pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-violet-500 outline-none w-48 transition-all"
                                />
                            </div>
                            <button className="p-2 border border-slate-200 rounded-xl hover:bg-slate-50">
                                <Filter className="w-4 h-4 text-slate-600" />
                            </button>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto min-h-[500px]">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="text-xs font-bold text-slate-400 uppercase bg-slate-50/50">
                                    <th className="px-6 py-4">Prospect</th>
                                    <th className="px-6 py-4">Role & Company</th>
                                    <th className="px-6 py-4">Engagement</th>
                                    <th className="px-6 py-4">Intent</th>
                                    <th className="px-6 py-4"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {loading ? (
                                    Array(5).fill(0).map((_, i) => (
                                        <tr key={i} className="animate-pulse">
                                            <td colSpan={5} className="px-6 py-8 bg-slate-50/30"></td>
                                        </tr>
                                    ))
                                ) : (
                                    prospects.map(lead => (
                                        <tr
                                            key={lead.id}
                                            onClick={() => setSelectedLead(lead)}
                                            className={`group cursor-pointer hover:bg-violet-50/30 transition-colors ${selectedLead?.id === lead.id ? 'bg-violet-50' : ''}`}
                                        >
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden border-2 border-white shadow-sm transition-transform group-hover:scale-110">
                                                        <img src={lead.avatarUrl} alt={lead.name} className="w-full h-full object-cover" />
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-slate-800">{lead.name}</p>
                                                        <div className="flex items-center gap-1 text-[10px] text-slate-400">
                                                            {lead.platform === 'linkedin' ? <Linkedin className="w-2.5 h-2.5" /> : <Twitter className="w-2.5 h-2.5" />}
                                                            {lead.platform.toUpperCase()}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <p className="text-sm font-semibold text-slate-700">{lead.title}</p>
                                                <p className="text-xs text-slate-500">{lead.company}</p>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col gap-1">
                                                    <span className={`w-fit px-2 py-0.5 rounded-full text-[10px] font-bold ${lead.engagementDepth === 'high' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'
                                                        }`}>
                                                        {lead.engagementDepth.toUpperCase()} DEPTH
                                                    </span>
                                                    <p className="text-[10px] text-slate-400 truncate max-w-[150px]">{lead.lastInteraction}</p>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <div className="flex-1 h-1.5 w-16 bg-slate-100 rounded-full overflow-hidden">
                                                        <div
                                                            className={`h-full rounded-full ${lead.intentScore > 85 ? 'bg-emerald-500' : 'bg-amber-500'}`}
                                                            style={{ width: `${lead.intentScore}%` }}
                                                        />
                                                    </div>
                                                    <span className="text-sm font-bold text-slate-700">{lead.intentScore}%</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <ChevronRight className={`w-5 h-5 text-slate-300 transition-transform ${selectedLead?.id === lead.id ? 'translate-x-1 text-violet-500' : ''}`} />
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Lead Detail / AI suggestions */}
                <div className="lg:col-span-4 space-y-6">
                    {selectedLead ? (
                        <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm p-6 space-y-6 animate-in slide-in-from-bottom-4 duration-300">
                            <div className="flex items-center justify-between">
                                <h4 className="font-bold text-slate-900">Prospect Intelligence</h4>
                                <button className="p-2 hover:bg-slate-100 rounded-xl">
                                    <MoreHorizontal className="w-5 h-5 text-slate-400" />
                                </button>
                            </div>

                            {/* Profile Info Card */}
                            <div className="p-4 bg-slate-50 rounded-[1.5rem] border border-slate-100 space-y-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-16 h-16 rounded-2xl overflow-hidden border-4 border-white shadow-xl">
                                        <img src={selectedLead.avatarUrl} alt={selectedLead.name} className="w-full h-full object-cover" />
                                    </div>
                                    <div>
                                        <h5 className="font-bold text-slate-900 text-lg leading-tight">{selectedLead.name}</h5>
                                        <p className="text-sm text-slate-500">{selectedLead.title} @ <span className="text-violet-600 font-bold">{selectedLead.company}</span></p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-2 mt-4">
                                    <div className="p-2 rounded-xl bg-white border border-slate-100 flex items-center gap-2">
                                        <MapPin className="w-3 h-3 text-slate-400" />
                                        <span className="text-[10px] text-slate-500 font-medium">New York, US</span>
                                    </div>
                                    <div className="p-2 rounded-xl bg-white border border-slate-100 flex items-center gap-2">
                                        <Briefcase className="w-3 h-3 text-slate-400" />
                                        <span className="text-[10px] text-slate-500 font-medium">{selectedLead.industry}</span>
                                    </div>
                                </div>
                            </div>

                            {/* AI Messaging Assistance */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 rounded-lg bg-violet-600 flex items-center justify-center">
                                        <Sparkles className="w-3.5 h-3.5 text-white" />
                                    </div>
                                    <h5 className="font-bold text-slate-800 text-sm italic">AI Suggested Message</h5>
                                </div>

                                <div className="p-4 bg-violet-50 rounded-2xl border border-violet-100 relative shadow-inner">
                                    <p className="text-sm text-violet-900 leading-relaxed italic">
                                        "{selectedLead.suggestedMessage}"
                                    </p>
                                    <div className="mt-4 flex gap-2">
                                        <button className="flex-1 py-2 bg-violet-600 text-white rounded-xl text-xs font-bold hover:bg-violet-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-violet-500/20">
                                            <Mail className="w-3.5 h-3.5" />
                                            Send DM
                                        </button>
                                        <button className="px-4 py-2 border border-violet-200 text-violet-600 rounded-xl text-xs font-bold hover:bg-violet-100 transition-all">
                                            Edit
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* External Links */}
                            <div className="flex flex-col gap-2">
                                <button className="w-full py-3 border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-all flex items-center justify-center gap-2">
                                    <Linkedin className="w-4 h-4" />
                                    View LinkedIn Profile
                                    <ExternalLink className="w-3 h-3" />
                                </button>
                                <button className="w-full py-3 border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-all flex items-center justify-center gap-2">
                                    <Target className="w-4 h-4" />
                                    Add to CRM (HubSpot)
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-white rounded-[2rem] border-2 border-dashed border-slate-200 p-12 flex flex-col items-center justify-center text-center space-y-4">
                            <div className="w-20 h-20 rounded-full bg-slate-50 flex items-center justify-center">
                                <Users className="w-10 h-10 text-slate-300" />
                            </div>
                            <div>
                                <p className="font-bold text-slate-800 text-lg">Select a Lead</p>
                                <p className="text-sm text-slate-500">Pick a prospect from the list to view their intelligence and suggested DMs.</p>
                            </div>
                        </div>
                    )}

                    <div className="bg-gradient-to-br from-amber-400 to-orange-500 rounded-[2rem] p-6 text-white shadow-xl shadow-orange-500/20">
                        <h5 className="font-bold text-lg mb-2 flex items-center gap-2">
                            <Zap className="w-5 h-5 fill-white" />
                            AI Sales Insight
                        </h5>
                        <p className="text-xs text-white/90 leading-relaxed italic">
                            "Engagement is up by 45% in the FinTech segment this week. Recommended priority: Focus on outreach to VP-level marketers at startups."
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
