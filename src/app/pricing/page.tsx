'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/AuthContext';
import Link from 'next/link';
import Image from 'next/image';
import {
    Sparkles, Check, X, Zap, Crown, Building2, ArrowRight,
    FileText, Youtube, Instagram, Facebook, Globe, Bot,
    BarChart3, Shield, Headphones, Clock, Users, Infinity, MapPin, TrendingUp
} from 'lucide-react';
import { detectCurrency, formatCurrency, CURRENCIES, type CurrencyConfig } from '@/lib/billing/currency';
import { createCheckoutSession, STRIPE_PRICES } from '@/lib/billing/stripe';

const plans = [
    {
        id: 'free',
        name: '15-Day Trial',
        description: 'Try everything free for 15 days',
        price: 0,
        priceYearly: 0,
        popular: false,
        icon: Sparkles,
        color: 'from-emerald-500 to-teal-500',
        trialDays: 15,
        features: [
            { text: '15 days full access', included: true },
            { text: '2 platforms (WordPress + Instagram)', included: true },
            { text: '20 AI content pieces', included: true },
            { text: '1 min AI Video to try', included: true },
            { text: '1K voice over characters', included: true },
            { text: 'Email support', included: true },
            { text: 'No credit card required', included: true },
        ],
        limits: {
            content: 20,
            platforms: 2,
            videoMinutes: 1,
            voiceOverChars: 1000,
        },
        cta: 'Start 15-Day Trial',
    },
    {
        id: 'lite',
        name: 'Lite',
        description: 'For individuals & hobbyists',
        price: 29,
        priceYearly: 23,
        popular: false,
        icon: FileText,
        color: 'from-blue-500 to-indigo-500',
        features: [
            { text: '40 AI content pieces/month', included: true },
            { text: '2 platforms (WordPress + Instagram)', included: true },
            { text: '2K voice over characters', included: true },
            { text: '2 music tracks/month', included: true },
            { text: 'Multi-language (2 languages)', included: true },
            { text: 'Email support', included: true },
            { text: 'AI Video Generation', included: false },
        ],
        limits: {
            content: 40,
            platforms: 2,
            videoMinutes: 0,
            voiceOverChars: 2000,
        },
        cta: 'Get Lite',
    },
    {
        id: 'starter',
        name: 'Starter',
        description: 'For growing businesses',
        price: 79,
        priceYearly: 63,
        popular: false,
        icon: Zap,
        color: 'from-blue-500 to-cyan-500',
        hasOverages: true,
        features: [
            { text: '100 AI content pieces/month', included: true },
            { text: '3 platforms', included: true },
            { text: 'Multi-platform publishing', included: true },
            { text: '5 min AI Video/month', included: true },
            { text: '10K voice over characters', included: true },
            { text: '10 music tracks/month', included: true },
            { text: 'Multi-language (5 languages)', included: true },
            { text: 'Overage billing available', included: true },
        ],
        limits: {
            content: 100,
            platforms: 3,
            videoMinutes: 5,
            voiceOverChars: 10000,
        },
        cta: 'Get Started',
    },
    {
        id: 'growth',
        name: 'Growth',
        description: 'For scaling teams',
        price: 149,
        priceYearly: 119,
        popular: false,
        icon: TrendingUp,
        color: 'from-teal-500 to-emerald-500',
        hasOverages: true,
        features: [
            { text: '200 AI content pieces/month', included: true },
            { text: '4 platforms', included: true },
            { text: '12 min AI Video/month', included: true },
            { text: '25K voice over characters', included: true },
            { text: '25 music tracks/month', included: true },
            { text: 'Multi-language (10 languages)', included: true },
            { text: 'Standard analytics', included: true },
            { text: 'Overage billing available', included: true },
        ],
        limits: {
            content: 200,
            platforms: 4,
            videoMinutes: 12,
            voiceOverChars: 25000,
        },
        cta: 'Get Growth',
    },
    {
        id: 'pro',
        name: 'Pro',
        description: 'For serious marketers',
        price: 299,
        priceYearly: 239,
        popular: true,
        icon: Crown,
        color: 'from-violet-500 to-fuchsia-500',
        hasOverages: true,
        features: [
            { text: '400 AI content pieces/month', included: true },
            { text: '5 platforms + TikTok', included: true },
            { text: '20 min AI Video/month', included: true },
            { text: '40K voice over characters', included: true },
            { text: 'Unlimited music library', included: true },
            { text: 'All languages (20+)', included: true },
            { text: 'Advanced analytics & A/B testing', included: true },
            { text: 'Priority support + Overage billing', included: true },
        ],
        limits: {
            content: 400,
            platforms: 5,
            videoMinutes: 20,
            voiceOverChars: 40000,
        },
        cta: 'Upgrade to Pro',
    },
    {
        id: 'enterprise',
        name: 'Enterprise',
        description: 'For large organizations',
        price: 999,
        priceYearly: 799,
        popular: false,
        icon: Building2,
        color: 'from-orange-500 to-amber-500',
        hasOverages: true,
        features: [
            { text: '2000 content pieces/month (fair-use)', included: true },
            { text: 'All platforms', included: true },
            { text: '60 min AI Video/month (fair-use)', included: true },
            { text: '150K voice over characters', included: true },
            { text: 'AI-generated custom music', included: true },
            { text: 'Custom AI models', included: true },
            { text: 'White-label & custom branding', included: true },
            { text: 'Dedicated account manager + Overages', included: true },
        ],
        limits: {
            content: 2000,
            platforms: -1,
            videoMinutes: 60,
            voiceOverChars: 150000,
        },
        cta: 'Contact Sales',
    },
];


export default function PricingPage() {
    const router = useRouter();
    const { user, isAuthenticated } = useAuth();
    const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly');
    const [loading, setLoading] = useState<string | null>(null);
    const [currency, setCurrency] = useState<CurrencyConfig>(CURRENCIES.USD);
    const [isDetecting, setIsDetecting] = useState(true);

    // Auto-detect currency on mount
    useState(() => {
        const initCurrency = async () => {
            setIsDetecting(true);
            const detected = await detectCurrency();
            setCurrency(detected);
            setIsDetecting(false);
        };
        initCurrency();
    });

    const handleSelectPlan = async (planId: string) => {
        if (!isAuthenticated) {
            router.push('/login?redirect=/pricing');
            return;
        }

        if (planId === 'free') {
            router.push('/dashboard');
            return;
        }

        if (planId === 'enterprise') {
            window.location.href = 'mailto:sales@digitalmeng.com?subject=Enterprise Plan Inquiry';
            return;
        }

        setLoading(planId);

        try {
            const priceId = billingPeriod === 'monthly'
                ? STRIPE_PRICES[planId as keyof typeof STRIPE_PRICES]?.monthly
                : STRIPE_PRICES[planId as keyof typeof STRIPE_PRICES]?.yearly;

            if (!priceId) throw new Error('Invalid plan selected');

            const session = await createCheckoutSession({
                priceId,
                customerId: (user as { stripeCustomerId?: string })?.stripeCustomerId,
                successUrl: `${window.location.origin}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
                cancelUrl: `${window.location.origin}/pricing`,
                metadata: {
                    userId: user?.id || '',
                    planId,
                    billingPeriod,
                }
            });

            if (session.url) {
                window.location.href = session.url;
            }
        } catch (error) {
            console.error('Checkout error:', error);
            alert('Unable to initiate checkout. Operating in demo mode?');
        } finally {
            setLoading(null);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-violet-50">
            {/* Background */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-violet-200/40 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-blue-200/40 rounded-full blur-[100px]" />
            </div>

            {/* Navigation */}
            <nav className="relative z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-3">
                        <Image
                            src="/logo.jpg"
                            alt="DigitalMEng Logo"
                            width={40}
                            height={40}
                            className="object-contain"
                        />
                        <span className="text-xl font-bold text-slate-800">
                            Digital<span className="text-violet-600">MEng</span>
                        </span>
                    </Link>
                    <div className="flex items-center gap-4">
                        {isAuthenticated ? (
                            <Link href="/dashboard" className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800">
                                Dashboard
                            </Link>
                        ) : (
                            <>
                                <Link href="/login" className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800">
                                    Login
                                </Link>
                                <Link href="/signup" className="px-5 py-2.5 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white rounded-full text-sm font-semibold hover:from-violet-500 hover:to-fuchsia-500 transition-all">
                                    Get Started
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </nav>

            {/* Header */}
            <div className="relative z-10 max-w-7xl mx-auto px-6 pt-16 pb-12 text-center">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-100 text-violet-700 text-sm font-medium mb-6">
                    <Zap className="w-4 h-4" />
                    Simple, transparent pricing
                </div>
                <h1 className="text-4xl md:text-5xl font-bold text-slate-800 mb-4">
                    Choose the perfect plan for your business
                </h1>
                <p className="text-lg text-slate-500 max-w-2xl mx-auto mb-8">
                    Scale your organic marketing with AI-powered automation. Start free and upgrade as you grow.
                </p>

                <div className="flex flex-col items-center gap-6 mb-12">
                    {/* Billing Toggle */}
                    <div className="inline-flex items-center gap-4 p-1.5 bg-slate-100 rounded-full">
                        <button
                            onClick={() => setBillingPeriod('monthly')}
                            className={`px-6 py-2.5 rounded-full text-sm font-semibold transition-all ${billingPeriod === 'monthly'
                                ? 'bg-white text-slate-800 shadow-sm'
                                : 'text-slate-500 hover:text-slate-700'
                                }`}
                        >
                            Monthly
                        </button>
                        <button
                            onClick={() => setBillingPeriod('yearly')}
                            className={`px-6 py-2.5 rounded-full text-sm font-semibold transition-all flex items-center gap-2 ${billingPeriod === 'yearly'
                                ? 'bg-white text-slate-800 shadow-sm'
                                : 'text-slate-500 hover:text-slate-700'
                                }`}
                        >
                            Yearly
                            <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-xs rounded-full">
                                Save 20%
                            </span>
                        </button>
                    </div>

                    {/* Currency Indicator */}
                    <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
                        <MapPin className="w-3 h-3 text-violet-400" />
                        {isDetecting ? (
                            <span className="animate-pulse">Detecting your local pricing...</span>
                        ) : (
                            <span>Pricing localized to <span className="text-slate-600 font-bold">{currency.code}</span> based on your location</span>
                        )}
                        <select
                            value={currency.code}
                            onChange={(e) => setCurrency(CURRENCIES[e.target.value])}
                            className="ml-2 bg-transparent border-none text-violet-600 font-bold focus:ring-0 cursor-pointer"
                        >
                            {Object.keys(CURRENCIES).map(code => (
                                <option key={code} value={code}>{code}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Pricing Cards */}
            <div className="relative z-10 max-w-7xl mx-auto px-6 pb-20">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {plans.map((plan) => {
                        const Icon = plan.icon;
                        const price = billingPeriod === 'yearly' ? plan.priceYearly : plan.price;
                        const isCurrentPlan = user?.plan === plan.id;

                        return (
                            <div
                                key={plan.id}
                                className={`relative rounded-3xl overflow-hidden ${plan.popular
                                    ? 'bg-gradient-to-br from-violet-600 to-fuchsia-600 p-[2px]'
                                    : ''
                                    }`}
                            >
                                {plan.popular && (
                                    <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white text-center py-2 text-xs font-bold">
                                        MOST POPULAR
                                    </div>
                                )}
                                <div className={`h-full bg-white rounded-3xl p-6 flex flex-col ${plan.popular ? 'pt-10' : ''}`}>
                                    {/* Header */}
                                    <div className="mb-6">
                                        <div className={`inline-flex p-3 rounded-2xl bg-gradient-to-br ${plan.color} mb-4`}>
                                            <Icon className="w-6 h-6 text-white" />
                                        </div>
                                        <h3 className="text-xl font-bold text-slate-800">{plan.name}</h3>
                                        <p className="text-sm text-slate-500 mt-1">{plan.description}</p>
                                    </div>

                                    {/* Price */}
                                    <div className="mb-6">
                                        <div className="flex items-baseline gap-1">
                                            <span className="text-4xl font-bold text-slate-800">
                                                {price === 0 ? 'Free' : formatCurrency(price, currency)}
                                            </span>
                                            {price > 0 && (
                                                <span className="text-slate-500 text-sm">/month</span>
                                            )}
                                        </div>
                                        {billingPeriod === 'yearly' && price > 0 && (
                                            <p className="text-sm text-emerald-600 mt-1">
                                                Billed {formatCurrency(price * 12, currency)}/year
                                            </p>
                                        )}
                                    </div>

                                    {/* Features */}
                                    <ul className="space-y-3 mb-6 flex-1">
                                        {plan.features.map((feature, idx) => (
                                            <li key={idx} className="flex items-start gap-3">
                                                {feature.included ? (
                                                    <Check className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                                                ) : (
                                                    <X className="w-5 h-5 text-slate-300 flex-shrink-0" />
                                                )}
                                                <span className={`text-sm ${feature.included ? 'text-slate-700' : 'text-slate-400'}`}>
                                                    {feature.text}
                                                </span>
                                            </li>
                                        ))}
                                    </ul>

                                    {/* CTA */}
                                    <button
                                        onClick={() => handleSelectPlan(plan.id)}
                                        disabled={loading === plan.id || isCurrentPlan}
                                        className={`w-full py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${plan.popular
                                            ? 'bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white hover:from-violet-500 hover:to-fuchsia-500 shadow-lg shadow-violet-500/25'
                                            : isCurrentPlan
                                                ? 'bg-slate-100 text-slate-500 cursor-not-allowed'
                                                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                                            }`}
                                    >
                                        {loading === plan.id ? (
                                            <div className="w-5 h-5 border-2 border-current/30 border-t-current rounded-full animate-spin" />
                                        ) : isCurrentPlan ? (
                                            'Current Plan'
                                        ) : (
                                            <>
                                                {plan.cta}
                                                <ArrowRight className="w-4 h-4" />
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Feature Comparison */}
            <div className="relative z-10 max-w-5xl mx-auto px-6 pb-20">
                <h2 className="text-2xl font-bold text-slate-800 text-center mb-8">
                    Compare all features
                </h2>
                <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xl">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-slate-200">
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-800">Features</th>
                                    {plans.map((plan) => (
                                        <th key={plan.id} className="px-4 py-4 text-center text-sm font-semibold text-slate-800">
                                            {plan.name}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {[
                                    { feature: 'Trial/Billing Period', values: ['15 days', 'Monthly', 'Monthly', 'Monthly', 'Monthly', 'Monthly'] },
                                    { feature: 'AI Content Generation', values: ['20 total', '40/mo', '100/mo', '200/mo', '400/mo', '2000/mo'] },
                                    { feature: 'Publishing Platforms', values: ['2 (WP+IG)', '2', '3', '4', '5 + TikTok', 'All'] },
                                    { feature: 'AI Video Generation', values: ['1 min', '—', '5 min/mo', '12 min/mo', '20 min/mo', '60 min/mo'] },
                                    { feature: 'AI Voice Over (ElevenLabs)', values: ['1K chars', '2K chars', '10K chars', '25K chars', '40K chars', '150K chars'] },
                                    { feature: 'Background Music', values: ['1 track', '2 tracks', '10 tracks/mo', '25 tracks/mo', 'Unlimited', 'AI Custom'] },
                                    { feature: 'Multi-language Support', values: ['—', '2 languages', '5 languages', '10 languages', '20+ languages', 'All'] },
                                    { feature: 'WordPress Publishing', values: [true, true, true, true, true, true] },
                                    { feature: 'YouTube Shorts', values: [false, false, true, true, true, true] },
                                    { feature: 'Instagram Reels', values: [true, true, true, true, true, true] },
                                    { feature: 'TikTok', values: [false, false, false, false, true, true] },
                                    { feature: 'Analytics Dashboard', values: ['Basic', 'Basic', 'Standard', 'Standard', 'Advanced', 'Enterprise'] },
                                    { feature: 'Overage Billing', values: [false, false, true, true, true, true] },
                                    { feature: 'A/B Testing', values: [false, false, false, false, true, true] },
                                    { feature: 'API Access', values: [false, false, false, true, true, true] },
                                    { feature: 'White-label Branding', values: [false, false, false, false, false, true] },
                                    { feature: 'Priority Support', values: [false, false, false, false, true, true] },
                                    { feature: 'Dedicated Account Manager', values: [false, false, false, false, false, true] },
                                ].map((row, idx) => (
                                    <tr key={idx} className={idx % 2 === 0 ? 'bg-slate-50' : ''}>
                                        <td className="px-6 py-4 text-sm text-slate-700 font-medium">{row.feature}</td>
                                        {row.values.map((val, i) => (
                                            <td key={i} className="px-4 py-4 text-center">
                                                {typeof val === 'boolean' ? (
                                                    val ? (
                                                        <Check className="w-5 h-5 text-emerald-500 mx-auto" />
                                                    ) : (
                                                        <X className="w-5 h-5 text-slate-300 mx-auto" />
                                                    )
                                                ) : (
                                                    <span className="text-sm text-slate-600">{val}</span>
                                                )}
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* FAQ Section */}
            <div className="relative z-10 max-w-3xl mx-auto px-6 pb-20">
                <h2 className="text-2xl font-bold text-slate-800 text-center mb-8">
                    Frequently Asked Questions
                </h2>
                <div className="space-y-4">
                    {[
                        {
                            q: 'Can I change my plan later?',
                            a: 'Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately and we\'ll prorate the billing.',
                        },
                        {
                            q: 'What payment methods do you accept?',
                            a: 'We accept all major credit cards (Visa, Mastercard, American Express) and PayPal through our secure Stripe payment processing.',
                        },
                        {
                            q: 'Is there a free trial?',
                            a: 'Yes! Our Free plan gives you 10 AI content pieces per month to try out the platform. Upgrade anytime when you\'re ready.',
                        },
                        {
                            q: 'What happens if I exceed my limits?',
                            a: 'You\'ll receive a notification when approaching your limit. You can upgrade your plan or purchase additional credits.',
                        },
                        {
                            q: 'Can I cancel anytime?',
                            a: 'Absolutely! There are no long-term contracts. Cancel anytime and your plan will remain active until the end of your billing period.',
                        },
                    ].map((faq, idx) => (
                        <div key={idx} className="bg-white rounded-2xl border border-slate-200 p-6">
                            <h3 className="font-semibold text-slate-800 mb-2">{faq.q}</h3>
                            <p className="text-slate-500 text-sm">{faq.a}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* CTA Section */}
            <div className="relative z-10 max-w-4xl mx-auto px-6 pb-20">
                <div className="bg-gradient-to-r from-violet-600 to-fuchsia-600 rounded-3xl p-8 md:p-12 text-center text-white">
                    <h2 className="text-3xl font-bold mb-4">Ready to scale your marketing?</h2>
                    <p className="text-white/80 mb-8 max-w-xl mx-auto">
                        Start with our free plan and experience the power of AI-driven organic marketing automation.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link
                            href="/signup"
                            className="px-8 py-4 bg-white text-violet-700 rounded-xl font-semibold hover:bg-violet-50 transition-colors flex items-center justify-center gap-2"
                        >
                            Start Free Trial
                            <ArrowRight className="w-5 h-5" />
                        </Link>
                        <Link
                            href="/login"
                            className="px-8 py-4 bg-white/10 text-white rounded-xl font-semibold hover:bg-white/20 transition-colors border border-white/20"
                        >
                            Sign In
                        </Link>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <footer className="relative z-10 border-t border-slate-200 bg-white/50">
                <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <Image
                            src="/logo.jpg"
                            alt="DigitalMEng Logo"
                            width={32}
                            height={32}
                            className="object-contain"
                        />
                        <span className="font-semibold text-slate-800">DigitalMEng</span>
                    </div>
                    <p className="text-sm text-slate-500">
                        © 2026 DigitalMEng. All rights reserved.
                    </p>
                </div>
            </footer>
        </div >
    );
}
