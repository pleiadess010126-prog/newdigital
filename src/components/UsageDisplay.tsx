'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth/AuthContext';
import {
    PLAN_LIMITS,
    getMockUsage,
    getUsagePercentage,
    getRemainingContent,
    shouldShowUpgradePrompt,
    formatUsageDisplay
} from '@/lib/billing/usage';
import {
    Zap, AlertTriangle, FileText, Globe, Youtube,
    Instagram, Facebook, TrendingUp, ArrowRight, Crown
} from 'lucide-react';
import Link from 'next/link';

export default function UsageDisplay() {
    const { user } = useAuth();
    const [usage, setUsage] = useState(getMockUsage(user?.plan || 'free'));
    const [loadingPortal, setLoadingPortal] = useState(false);

    const plan = user?.plan || 'free';

    const handleManageSubscription = async () => {
        setLoadingPortal(true);
        try {
            // In a real app, this would come from the user's record
            // For demo, we use a placeholder or handle the mock case
            const customerId = (user as { stripeCustomerId?: string })?.stripeCustomerId || 'cus_demo_123';

            const response = await fetch('/api/stripe/create-portal-session', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ customerId }),
            });

            const data = await response.json();
            if (data.url) {
                window.location.href = data.url;
            } else {
                alert('Portal not available in demo mode.');
            }
        } catch (error) {
            console.error('Portal error:', error);
        } finally {
            setLoadingPortal(false);
        }
    };

    const limits = PLAN_LIMITS[plan] || PLAN_LIMITS.free;
    const contentPercentage = getUsagePercentage(usage.contentGenerated, plan);
    const remaining = getRemainingContent(usage.contentGenerated, plan);
    const shouldUpgrade = shouldShowUpgradePrompt(usage.contentGenerated, plan);

    // Update mock usage when plan changes
    useEffect(() => {
        setUsage(getMockUsage(plan));
    }, [plan]);

    const getProgressColor = (percentage: number) => {
        if (percentage >= 90) return 'bg-red-500';
        if (percentage >= 70) return 'bg-amber-500';
        return 'bg-emerald-500';
    };

    const getPlanBadgeColor = (planId: string) => {
        switch (planId) {
            case 'free': return 'bg-emerald-100 text-emerald-700';
            case 'lite': return 'bg-blue-100 text-blue-700';
            case 'starter': return 'bg-cyan-100 text-cyan-700';
            case 'pro': return 'bg-violet-100 text-violet-700';
            case 'enterprise': return 'bg-orange-100 text-orange-700';
            default: return 'bg-slate-100 text-slate-700';
        }
    };

    const getPlanDisplayName = (planId: string) => {
        if (planId === 'free') return '15-Day Trial';
        return planId.charAt(0).toUpperCase() + planId.slice(1) + ' Plan';
    };

    return (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            {/* Header */}
            <div className="p-6 border-b border-slate-200 flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-emerald-600" />
                        Usage & Billing
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${getPlanBadgeColor(plan)}`}>
                            {getPlanDisplayName(plan)}
                        </span>
                        <p className="text-sm text-slate-500">This month's usage</p>
                    </div>
                </div>
                {plan !== 'free' && (
                    <button
                        onClick={handleManageSubscription}
                        disabled={loadingPortal}
                        className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 text-sm font-semibold hover:bg-slate-50 transition-all flex items-center gap-2"
                    >
                        {loadingPortal ? 'Opening...' : 'Manage Subscription'}
                    </button>
                )}
            </div>

            {/* Content Usage */}
            <div className="p-6 space-y-6">
                {/* Main Usage Bar */}
                <div>
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-slate-700">AI Content Generated</span>
                        <span className="text-sm font-bold text-slate-800">
                            {remaining === 'unlimited'
                                ? `${usage.contentGenerated} used (Unlimited)`
                                : `${remaining} remaining`
                            }
                        </span>
                    </div>
                    <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                        <div
                            className={`h-full rounded-full transition-all duration-500 ${getProgressColor(contentPercentage)}`}
                            style={{ width: `${Math.min(100, contentPercentage)}%` }}
                        />
                    </div>
                    <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-slate-400">
                            {usage.contentGenerated} / {limits.contentPerMonth === -1 ? '∞' : limits.contentPerMonth}
                        </span>
                        <span className="text-xs text-slate-400">
                            {contentPercentage.toFixed(0)}% used
                        </span>
                    </div>
                </div>

                {/* Upgrade Warning */}
                {shouldUpgrade && (
                    <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-3">
                        <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                            <p className="text-sm font-medium text-amber-800">
                                You're running low on content credits
                            </p>
                            <p className="text-xs text-amber-600 mt-1">
                                Upgrade now to continue generating content without interruption.
                            </p>
                        </div>
                        <Link
                            href="/pricing"
                            className="px-3 py-1.5 rounded-lg bg-amber-500 text-white text-sm font-medium hover:bg-amber-600 flex items-center gap-1"
                        >
                            Upgrade
                            <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>
                )}

                {/* Platform Usage Grid */}
                <div>
                    <h4 className="text-sm font-semibold text-slate-700 mb-3">Platform Posts</h4>
                    <div className="grid grid-cols-2 gap-3">
                        {[
                            { key: 'wordpress', icon: Globe, label: 'WordPress', color: 'text-blue-600 bg-blue-50' },
                            { key: 'youtube', icon: Youtube, label: 'YouTube', color: 'text-red-600 bg-red-50' },
                            { key: 'instagram', icon: Instagram, label: 'Instagram', color: 'text-pink-600 bg-pink-50' },
                            { key: 'facebook', icon: Facebook, label: 'Facebook', color: 'text-blue-700 bg-blue-50' },
                        ].map((platform) => (
                            <div
                                key={platform.key}
                                className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-3"
                            >
                                <div className={`p-2 rounded-lg ${platform.color}`}>
                                    <platform.icon className="w-4 h-4" />
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-slate-800">
                                        {usage.platformPosts[platform.key as keyof typeof usage.platformPosts]}
                                    </p>
                                    <p className="text-xs text-slate-500">{platform.label}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 gap-3">
                    <div className="p-4 rounded-xl bg-violet-50 border border-violet-100 text-center">
                        <p className="text-2xl font-bold text-violet-700">{usage.apiCalls}</p>
                        <p className="text-xs text-violet-600">API Calls</p>
                    </div>
                    <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-100 text-center">
                        <p className="text-2xl font-bold text-emerald-700">
                            {Object.values(usage.platformPosts).reduce((a, b) => a + b, 0)}
                        </p>
                        <p className="text-xs text-emerald-600">Total Posts</p>
                    </div>
                </div>

                {/* Video & Audio Usage - New Section */}
                {plan !== 'free' && (
                    <div>
                        <h4 className="text-sm font-semibold text-slate-700 mb-3">Video & Audio Usage</h4>
                        <div className="grid grid-cols-3 gap-3">
                            <div className="p-3 rounded-xl bg-pink-50 border border-pink-100 text-center">
                                <p className="text-lg font-bold text-pink-700">{usage.videoMinutesUsed} min</p>
                                <p className="text-xs text-pink-600">AI Video</p>
                                <p className="text-[10px] text-pink-400 mt-1">
                                    / {limits.videoMinutes === -1 ? '∞' : limits.videoMinutes + ' min'}
                                </p>
                            </div>
                            <div className="p-3 rounded-xl bg-cyan-50 border border-cyan-100 text-center">
                                <p className="text-lg font-bold text-cyan-700">{(usage.voiceOverCharactersUsed / 1000).toFixed(1)}K</p>
                                <p className="text-xs text-cyan-600">Voice Over</p>
                                <p className="text-[10px] text-cyan-400 mt-1">
                                    / {limits.voiceOverCharacters === -1 ? '∞' : (limits.voiceOverCharacters / 1000) + 'K'}
                                </p>
                            </div>
                            <div className="p-3 rounded-xl bg-amber-50 border border-amber-100 text-center">
                                <p className="text-lg font-bold text-amber-700">{usage.musicTracksUsed}</p>
                                <p className="text-xs text-amber-600">Music Tracks</p>
                                <p className="text-[10px] text-amber-400 mt-1">
                                    / {limits.musicTracks === -1 ? '∞' : limits.musicTracks}
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Upgrade CTA for Free Users */}
                {plan === 'free' && (
                    <Link
                        href="/pricing"
                        className="block w-full p-4 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white text-center hover:from-violet-500 hover:to-fuchsia-500 transition-all"
                    >
                        <div className="flex items-center justify-center gap-2">
                            <Crown className="w-5 h-5" />
                            <span className="font-semibold">Upgrade to Pro</span>
                        </div>
                        <p className="text-xs text-white/80 mt-1">Get 400 content pieces/month + all platforms</p>
                    </Link>
                )}
            </div>
        </div>
    );
}
