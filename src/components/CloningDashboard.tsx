
'use client';

import { useState } from 'react';
import {
    Mic, Video, Upload, CheckCircle2,
    Play, Settings, User, Sparkles,
    ArrowRight, Loader2, Info, Lock
} from 'lucide-react';
import { MOCK_CLONES, type CloneProfile } from '@/lib/ai/cloning';

export default function CloningDashboard() {
    const [clones, setClones] = useState<CloneProfile[]>(MOCK_CLONES);
    const [isExporting, setIsExporting] = useState<string | null>(null);

    const handleGenerate = async (id: string) => {
        setIsExporting(id);
        await new Promise(resolve => setTimeout(resolve, 3000));
        setIsExporting(null);
        alert('Digital Twin synchronized successfully!');
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Header */}
            <div className="bg-gradient-to-r from-slate-900 to-slate-800 p-8 rounded-[2rem] shadow-2xl relative overflow-hidden text-white">
                <div className="absolute top-0 right-0 p-8">
                    <Sparkles className="w-24 h-24 text-white/5" />
                </div>
                <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="px-3 py-1 bg-rose-500/20 text-rose-300 rounded-full text-xs font-bold">
                            AI Cloning Technology
                        </span>
                    </div>
                    <h2 className="text-3xl font-bold flex items-center gap-3">
                        <User className="w-8 h-8 text-violet-400" />
                        AI Voice & Face Cloning
                    </h2>
                    <p className="text-slate-400 mt-2 max-w-md">
                        Create hyper-realistic voice and face clones for autonomous video content.
                        <span className="block text-xs text-slate-500 mt-1">
                            ⚠️ For AI avatar videos, not related to brand writing style
                        </span>
                    </p>
                    <div className="flex gap-4 mt-8">
                        <button className="px-6 py-3 bg-violet-500 hover:bg-violet-600 rounded-xl font-bold transition-all flex items-center gap-2">
                            <Mic className="w-5 h-5" />
                            Clone Your Voice
                        </button>
                        <button className="px-6 py-3 bg-white/10 hover:bg-white/20 rounded-xl font-bold transition-all border border-white/10 flex items-center gap-2">
                            <Video className="w-5 h-5" />
                            Create Face Avatar
                        </button>
                    </div>
                </div>
            </div>

            {/* Profiles Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {clones.map(clone => (
                    <div key={clone.id} className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 hover:shadow-xl transition-all">
                        <div className="flex items-start justify-between mb-4">
                            <div className={`p-3 rounded-2xl ${clone.type === 'voice' ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'
                                }`}>
                                {clone.type === 'voice' ? <Mic className="w-6 h-6" /> : <Video className="w-6 h-6" />}
                            </div>
                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${clone.status === 'ready' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                                }`}>
                                {clone.status.replace('_', ' ').toUpperCase()}
                            </span>
                        </div>
                        <h4 className="font-bold text-slate-900 text-lg">{clone.name}</h4>
                        <p className="text-sm text-slate-500 mt-2 leading-relaxed">
                            {clone.description}
                        </p>
                        <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                            <span>Last used: {clone.lastUsed}</span>
                            <Settings className="w-4 h-4 cursor-pointer hover:text-slate-600" />
                        </div>
                        <button
                            onClick={() => handleGenerate(clone.id)}
                            disabled={clone.status !== 'ready' || !!isExporting}
                            className="w-full mt-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-900 rounded-xl font-bold transition-all flex items-center justify-center gap-2"
                        >
                            {isExporting === clone.id ? (
                                <Loader2 className="w-4 h-4 animate-spin text-slate-600" />
                            ) : (
                                <>
                                    <Play className="w-4 h-4 fill-current" />
                                    Test Synthesis
                                </>
                            )}
                        </button>
                    </div>
                ))}

                {/* New Profile Placeholder */}
                <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl p-6 flex flex-col items-center justify-center text-center group cursor-pointer hover:border-violet-300 transition-all">
                    <div className="w-12 h-12 rounded-full bg-slate-200 flex items-center justify-center mb-4 group-hover:bg-violet-100 group-hover:text-violet-600 transition-colors">
                        <Upload className="w-6 h-6" />
                    </div>
                    <p className="font-bold text-slate-700">Add New Profile</p>
                    <p className="text-xs text-slate-500 mt-1">Upload training samples</p>
                </div>
            </div>

            {/* Usage Info */}
            <div className="bg-blue-50 border border-blue-100 rounded-3xl p-6 flex gap-4">
                <Info className="w-6 h-6 text-blue-500 flex-shrink-0" />
                <div className="space-y-4">
                    <div>
                        <h5 className="font-bold text-blue-900">How Voice Cloning Works</h5>
                        <p className="text-sm text-blue-800 leading-relaxed mt-1">
                            We use ElevenLabs Professional Voice Cloning. You need to upload at least 5 minutes of high-quality audio for a realistic match. The cloned voice will be used for all Reel, Short, and Podcast generations automatically.
                        </p>
                    </div>
                    <div className="flex gap-4">
                        <div className="flex items-center gap-2 text-xs font-bold text-blue-600">
                            <Lock className="w-4 h-4" />
                            Secure & Encrypted
                        </div>
                        <div className="flex items-center gap-2 text-xs font-bold text-blue-600">
                            <CheckCircle2 className="w-4 h-4" />
                            GDPR Compliant
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
