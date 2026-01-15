'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import {
    Bot, ArrowLeft, Power, Settings, Mail, FileText,
    Clock, Sparkles, PlayCircle, PauseCircle, Calendar,
    MessageSquare, Zap, Shield
} from 'lucide-react';

export default function AutopilotPage() {
    const router = useRouter();
    const [isEnabled, setIsEnabled] = useState(true);
    const [mode, setMode] = useState<'approval' | 'auto'>('approval');

    // Simple stats
    const stats = {
        contentCreated: 45,
        emailsSent: 156,
        timeSaved: '12 hours',
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-violet-50">
            {/* Header */}
            <header className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white px-8 py-4">
                <div className="flex items-center justify-between max-w-7xl mx-auto">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => router.push('/dashboard')}
                            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                        <Image
                            src="/logo.jpg"
                            alt="DigitalMEng Logo"
                            width={40}
                            height={40}
                            className="rounded-lg"
                        />
                        <div>
                            <h1 className="text-xl font-bold">Marketing Autopilot</h1>
                            <p className="text-sm text-white/60">Automated marketing that works while you sleep</p>
                        </div>
                    </div>
                    <button
                        onClick={() => setIsEnabled(!isEnabled)}
                        className={`px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all ${isEnabled
                            ? 'bg-emerald-500 hover:bg-emerald-600 text-white'
                            : 'bg-white text-slate-900 hover:bg-slate-100'
                            }`}
                    >
                        <Power className="w-5 h-5" />
                        {isEnabled ? 'Autopilot ON' : 'Autopilot OFF'}
                    </button>
                </div>
            </header>

            <div className="max-w-5xl mx-auto px-8 py-8 space-y-8">
                {/* Status Banner */}
                <div className={`p-6 rounded-2xl ${isEnabled
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white'
                    : 'bg-slate-200 text-slate-700'
                    }`}>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            {isEnabled ? (
                                <PlayCircle className="w-10 h-10" />
                            ) : (
                                <PauseCircle className="w-10 h-10" />
                            )}
                            <div>
                                <h2 className="text-2xl font-bold">
                                    {isEnabled ? '🚀 Autopilot is Running' : '⏸️ Autopilot is Paused'}
                                </h2>
                                <p className={isEnabled ? 'text-white/80' : 'text-slate-500'}>
                                    {isEnabled
                                        ? 'AI is actively creating content and sending campaigns'
                                        : 'Turn on autopilot to start automated marketing'}
                                </p>
                            </div>
                        </div>
                        {isEnabled && (
                            <div className="flex gap-6 text-center">
                                <div>
                                    <p className="text-3xl font-bold">{stats.contentCreated}</p>
                                    <p className="text-xs text-white/70">Content Created</p>
                                </div>
                                <div>
                                    <p className="text-3xl font-bold">{stats.emailsSent}</p>
                                    <p className="text-xs text-white/70">Emails Sent</p>
                                </div>
                                <div>
                                    <p className="text-3xl font-bold">{stats.timeSaved}</p>
                                    <p className="text-xs text-white/70">Time Saved</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Mode Selection */}
                <div className="bg-white rounded-2xl border border-slate-200 p-6">
                    <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                        <Shield className="w-5 h-5 text-violet-600" />
                        Automation Mode
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                        <button
                            onClick={() => setMode('approval')}
                            className={`p-6 rounded-xl border-2 text-left transition-all ${mode === 'approval'
                                ? 'border-blue-500 bg-blue-50'
                                : 'border-slate-200 hover:border-slate-300'
                                }`}
                        >
                            <div className="flex items-center gap-3 mb-3">
                                <div className={`p-2 rounded-lg ${mode === 'approval' ? 'bg-blue-100' : 'bg-slate-100'}`}>
                                    <Shield className={`w-5 h-5 ${mode === 'approval' ? 'text-blue-600' : 'text-slate-500'}`} />
                                </div>
                                <span className="font-bold text-slate-800">Approval Mode</span>
                                {mode === 'approval' && (
                                    <span className="ml-auto px-2 py-0.5 bg-blue-500 text-white text-xs rounded-full">Active</span>
                                )}
                            </div>
                            <p className="text-sm text-slate-500">
                                AI creates content → You review and approve → Then it publishes
                            </p>
                            <p className="text-xs text-slate-400 mt-2">Recommended for most users</p>
                        </button>
                        <button
                            onClick={() => setMode('auto')}
                            className={`p-6 rounded-xl border-2 text-left transition-all ${mode === 'auto'
                                ? 'border-rose-500 bg-rose-50'
                                : 'border-slate-200 hover:border-slate-300'
                                }`}
                        >
                            <div className="flex items-center gap-3 mb-3">
                                <div className={`p-2 rounded-lg ${mode === 'auto' ? 'bg-rose-100' : 'bg-slate-100'}`}>
                                    <Zap className={`w-5 h-5 ${mode === 'auto' ? 'text-rose-600' : 'text-slate-500'}`} />
                                </div>
                                <span className="font-bold text-slate-800">Full Auto Mode</span>
                                {mode === 'auto' && (
                                    <span className="ml-auto px-2 py-0.5 bg-rose-500 text-white text-xs rounded-full">Active</span>
                                )}
                            </div>
                            <p className="text-sm text-slate-500">
                                AI creates content → Automatically publishes without review
                            </p>
                            <p className="text-xs text-amber-600 mt-2">⚠️ Use with caution</p>
                        </button>
                    </div>
                </div>

                {/* What Autopilot Does */}
                <div className="grid grid-cols-2 gap-6">
                    {/* Content Automation */}
                    <div className="bg-white rounded-2xl border border-slate-200 p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-3 bg-blue-100 rounded-xl">
                                <FileText className="w-6 h-6 text-blue-600" />
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-800">Content Generation</h3>
                                <p className="text-sm text-slate-500">Blogs, videos, social posts</p>
                            </div>
                        </div>
                        <ul className="space-y-2 text-sm text-slate-600">
                            <li className="flex items-center gap-2">
                                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                                AI writes blog posts in your brand voice
                            </li>
                            <li className="flex items-center gap-2">
                                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                                Creates YouTube scripts & video content
                            </li>
                            <li className="flex items-center gap-2">
                                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                                Generates Instagram & Facebook posts
                            </li>
                            <li className="flex items-center gap-2">
                                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                                Schedules at optimal times
                            </li>
                        </ul>
                    </div>

                    {/* Campaign Automation */}
                    <div className="bg-white rounded-2xl border border-slate-200 p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-3 bg-emerald-100 rounded-xl">
                                <Mail className="w-6 h-6 text-emerald-600" />
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-800">Email & SMS Campaigns</h3>
                                <p className="text-sm text-slate-500">Automated outreach</p>
                            </div>
                        </div>
                        <ul className="space-y-2 text-sm text-slate-600">
                            <li className="flex items-center gap-2">
                                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                                Welcome emails for new subscribers
                            </li>
                            <li className="flex items-center gap-2">
                                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                                Re-engagement for inactive users
                            </li>
                            <li className="flex items-center gap-2">
                                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                                Birthday and anniversary emails
                            </li>
                            <li className="flex items-center gap-2">
                                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                                Smart send time optimization
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="flex gap-4">
                    <button
                        onClick={() => router.push('/dashboard')}
                        className="flex-1 py-4 bg-violet-600 text-white rounded-xl font-bold hover:bg-violet-700 transition-all flex items-center justify-center gap-2"
                    >
                        <Bot className="w-5 h-5" />
                        Go to Dashboard
                    </button>
                    <button
                        onClick={() => router.push('/email')}
                        className="flex-1 py-4 bg-white border border-slate-200 text-slate-700 rounded-xl font-bold hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
                    >
                        <Mail className="w-5 h-5" />
                        Email Marketing
                    </button>
                    <button
                        onClick={() => router.push('/journeys')}
                        className="flex-1 py-4 bg-white border border-slate-200 text-slate-700 rounded-xl font-bold hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
                    >
                        <Sparkles className="w-5 h-5" />
                        Journey Builder
                    </button>
                </div>
            </div>
        </div>
    );
}
