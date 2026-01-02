
'use client';

import { useState } from 'react';
import {
    Globe2, RefreshCw, CheckCircle2,
    AlertCircle, Languages, ArrowRight,
    MapPin, Sparkles, BookOpen, Info
} from 'lucide-react';
import { MOCK_ADAPTATIONS, type CulturalAdaptation } from '@/lib/ai/localization';

export default function CulturalLocalization() {
    const [adaptations, setAdaptations] = useState<CulturalAdaptation[]>(MOCK_ADAPTATIONS);
    const [activeMarket, setActiveMarket] = useState<string>(MOCK_ADAPTATIONS[0].market);

    const selected = adaptations.find(a => a.market === activeMarket) || adaptations[0];

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-1000">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
                <div>
                    <h2 className="text-3xl font-black text-slate-900 flex items-center gap-3">
                        <Globe2 className="w-8 h-8 text-emerald-500" />
                        Global Transcreator
                    </h2>
                    <p className="text-slate-500 mt-2 text-lg">Adapting your brand voice for cultural resonance, not just translation.</p>
                </div>
                <div className="flex items-center gap-2">
                    <span className="px-4 py-2 bg-emerald-50 text-emerald-700 rounded-2xl text-sm font-bold border border-emerald-100 italic">
                        "English is a language; Culture is the message."
                    </span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Market Selector */}
                <div className="lg:col-span-3 space-y-4">
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest px-2">Target Markets</h3>
                    <div className="space-y-2">
                        {adaptations.map(a => (
                            <button
                                key={a.market}
                                onClick={() => setActiveMarket(a.market)}
                                className={`w-full p-5 rounded-3xl border transition-all text-left group ${activeMarket === a.market
                                        ? 'bg-slate-900 border-slate-900 text-white shadow-xl shadow-slate-900/20'
                                        : 'bg-white border-slate-200 text-slate-600 hover:border-emerald-300'
                                    }`}
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <MapPin className={`w-4 h-4 ${activeMarket === a.market ? 'text-emerald-400' : 'text-slate-300'}`} />
                                        <span className="font-bold">{a.market}</span>
                                    </div>
                                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${a.status === 'ready' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
                                        }`}>
                                        {a.status.toUpperCase()}
                                    </span>
                                </div>
                                <p className={`text-xs mt-2 ${activeMarket === a.market ? 'text-slate-400' : 'text-slate-500'}`}>
                                    {a.language}
                                </p>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Transcreation Content */}
                <div className="lg:col-span-9 bg-white rounded-[3rem] border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                    <div className="p-8 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 flex items-center justify-center shadow-sm">
                                <Languages className="w-6 h-6 text-emerald-500" />
                            </div>
                            <div>
                                <h4 className="font-black text-slate-900 text-xl">{selected.market} Adaptation Strategy</h4>
                                <p className="text-sm text-slate-500">Transcreated by Cultural_Intelligence_v4</p>
                            </div>
                        </div>
                        <button className="p-3 bg-white border border-slate-200 rounded-2xl hover:bg-slate-50 transition-all">
                            <RefreshCw className="w-5 h-5 text-slate-600" />
                        </button>
                    </div>

                    <div className="p-8 space-y-8">
                        {/* The Bridge */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative">
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 hidden md:block">
                                <div className="w-12 h-12 rounded-full bg-emerald-500 flex items-center justify-center shadow-lg border-4 border-white">
                                    <ArrowRight className="w-6 h-6 text-white" />
                                </div>
                            </div>

                            <div className="space-y-4 p-6 rounded-[2rem] bg-slate-50 border border-slate-100">
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-tighter">Original Concept (English)</p>
                                <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm italic text-slate-500">
                                    "{selected.originalMetaphor}"
                                </div>
                            </div>

                            <div className="space-y-4 p-6 rounded-[2rem] bg-emerald-50 border border-emerald-100">
                                <div className="flex items-center justify-between">
                                    <p className="text-xs font-bold text-emerald-600 uppercase tracking-tighter">Cultural Adaptation</p>
                                    <Sparkles className="w-3.5 h-3.5 text-emerald-500 fill-emerald-500" />
                                </div>
                                <div className="p-4 bg-white rounded-2xl border border-emerald-200 shadow-lg shadow-emerald-500/5 font-bold text-emerald-900">
                                    "{selected.adaptedMetaphor}"
                                </div>
                            </div>
                        </div>

                        {/* Rationale */}
                        <div className="p-8 bg-slate-900 rounded-[2.5rem] text-white overflow-hidden relative group">
                            <BookOpen className="absolute -bottom-8 -right-8 w-48 h-48 text-white/5 -rotate-12 transition-all group-hover:text-white/10" />
                            <div className="relative z-10 space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-xl bg-emerald-500 flex items-center justify-center">
                                        <Info className="w-4 h-4 text-white" />
                                    </div>
                                    <h5 className="font-bold text-lg">AI Cultural Insight</h5>
                                </div>
                                <p className="text-slate-300 leading-relaxed max-w-2xl">
                                    {selected.culturalContext}
                                </p>
                                <div className="pt-4 flex gap-6">
                                    <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
                                        <CheckCircle2 className="w-4 h-4" />
                                        Sentiment: HIGH RESONANCE
                                    </div>
                                    <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
                                        <AlertCircle className="w-4 h-4" />
                                        Risk: ZERO
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-4">
                            <button className="flex-1 py-4 bg-emerald-600 text-white rounded-[1.5rem] font-bold hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-500/20 active:scale-95">
                                Deploy Global Campaign
                            </button>
                            <button className="px-8 py-4 border border-slate-200 rounded-[1.5rem] font-bold text-slate-700 hover:bg-slate-50 transition-all">
                                Request Expert Review
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
