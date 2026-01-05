'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import {
    Gift,
    DollarSign,
    Users,
    TrendingUp,
    ArrowRight,
    Wallet,
    CheckCircle2,
    Clock,
    Globe,
    Share2,
    Mail,
    CreditCard,
    Building2,
    Bitcoin,
    ChevronRight,
    Play,
    Sparkles
} from 'lucide-react';
import { affiliateTiers } from '@/lib/affiliateData';
import LanguageDropdown from '@/components/LanguageDropdown';
import { getTranslation, SUPPORTED_UI_LANGUAGES } from '@/lib/i18n/translations';

export default function AffiliateProgramPage() {
    const router = useRouter();
    const [mounted, setMounted] = useState(false);
    const [currentLanguage, setCurrentLanguage] = useState('en');
    const [openFaq, setOpenFaq] = useState<number | null>(null);

    const t = (key: string) => getTranslation(currentLanguage, key);

    useEffect(() => {
        setMounted(true);
        const savedLang = localStorage.getItem('preferredLanguage');
        if (savedLang && SUPPORTED_UI_LANGUAGES.some(l => l.code === savedLang)) {
            setCurrentLanguage(savedLang);
        }
    }, []);

    const handleLanguageChange = (langCode: string) => {
        setCurrentLanguage(langCode);
        localStorage.setItem('preferredLanguage', langCode);
    };

    if (!mounted) return null;

    const isRTL = ['ar', 'he', 'fa', 'ur'].includes(currentLanguage);

    const benefits = [
        {
            icon: DollarSign,
            title: 'Up to 20% Recurring Commission',
            description: 'Earn generous recurring commissions on every subscription your referrals purchase. As they stay subscribed, you keep earning!',
            highlight: '20%'
        },
        {
            icon: Clock,
            title: '90-Day Cookie Duration',
            description: 'Our industry-leading 90-day cookie window ensures you get credit for referrals even if they don\'t purchase immediately.',
            highlight: '90 Days'
        },
        {
            icon: TrendingUp,
            title: '5-Tier Commission System',
            description: 'Advance through Bronze, Silver, Gold, Platinum, and Diamond tiers to unlock higher commission rates and exclusive perks.',
            highlight: '5 Tiers'
        },
        {
            icon: Wallet,
            title: 'Fast & Flexible Payouts',
            description: 'Choose your preferred payment method - PayPal, Bank Transfer, Stripe, or Crypto. Weekly payouts for top affiliates!',
            highlight: 'Weekly'
        },
        {
            icon: Globe,
            title: 'Global Reach',
            description: 'DigitalMEng supports multiple languages and currencies. Refer customers from anywhere in the world.',
            highlight: 'Worldwide'
        },
        {
            icon: Share2,
            title: 'Marketing Resources',
            description: 'Access a library of banners, email templates, social posts, and landing pages to maximize your conversions.',
            highlight: '100+ Assets'
        }
    ];

    const howItWorks = [
        {
            step: 1,
            title: 'Sign Up & Get Your Link',
            description: 'Create your free affiliate account in minutes. You\'ll receive a unique referral link that tracks all your leads.',
            icon: Users
        },
        {
            step: 2,
            title: 'Share & Promote',
            description: 'Share your link on your website, social media, YouTube, newsletters, or anywhere your audience engages with you.',
            icon: Share2
        },
        {
            step: 3,
            title: 'Earn Commissions',
            description: 'When someone clicks your link and subscribes to DigitalMEng, you earn up to 20% of their subscription - recurring!',
            icon: DollarSign
        },
        {
            step: 4,
            title: 'Get Paid',
            description: 'Track your earnings in real-time and receive payments via your preferred method. No minimum wait time for payouts.',
            icon: Wallet
        }
    ];

    const faqs = [
        {
            question: 'How much can I earn as an affiliate?',
            answer: 'Your earnings depend on your tier level and the number of referrals. Starting at the Bronze tier, you earn 10% commission. As you grow, you can reach Diamond tier with 20% commission. Top affiliates earn $5,000+ per month!'
        },
        {
            question: 'How do I get paid?',
            answer: 'We offer multiple payment options: PayPal, direct bank transfer, Stripe, and cryptocurrency (ETH, BTC, USDT). You can request a payout once you reach the $50 minimum threshold. Top-tier affiliates get weekly payouts!'
        },
        {
            question: 'What is the cookie duration?',
            answer: 'Our cookie duration is 90 days - one of the longest in the industry. This means if someone clicks your link and purchases within 90 days, you get the commission even if they don\'t buy immediately.'
        },
        {
            question: 'Are there any costs to join?',
            answer: 'Absolutely not! Joining our affiliate program is 100% free. There are no hidden fees, no monthly costs, and no minimum performance requirements to stay active.'
        },
        {
            question: 'What marketing materials do you provide?',
            answer: 'We provide a comprehensive library of marketing assets including banner ads, email templates, social media posts, product images, landing pages, and video content. All assets are regularly updated.'
        },
        {
            question: 'Can I promote to international audiences?',
            answer: 'Yes! DigitalMEng supports 16+ languages and accepts customers worldwide. You can refer anyone from any country, and we handle all the localization and currency conversions.'
        },
        {
            question: 'What if my referral asks for a refund?',
            answer: 'If a referral receives a refund within the refund period, the corresponding commission will be adjusted. This ensures fair play and protects against fraudulent activity.'
        },
        {
            question: 'How do I track my referrals and earnings?',
            answer: 'Your affiliate dashboard provides real-time analytics including clicks, signups, conversions, earnings, and payout history. You can also set up custom tracking parameters for different campaigns.'
        }
    ];

    const testimonials = [
        {
            name: 'Sarah Mitchell',
            role: 'Marketing Blogger',
            avatar: '👩‍💼',
            quote: 'I\'ve been promoting DigitalMEng for 6 months and consistently earn $2,000+ per month. The 90-day cookie is a game changer!',
            earnings: '$15,000+'
        },
        {
            name: 'David Chen',
            role: 'YouTube Creator',
            avatar: '👨‍💻',
            quote: 'The affiliate dashboard is incredibly detailed. I can see exactly which videos are driving conversions. Love the weekly payouts!',
            earnings: '$8,500+'
        },
        {
            name: 'Emma Rodriguez',
            role: 'Digital Marketer',
            avatar: '👩‍🎨',
            quote: 'Best affiliate program I\'ve joined. The marketing materials are professional and the support team is super responsive.',
            earnings: '$12,000+'
        }
    ];

    const paymentMethods = [
        { icon: Mail, name: 'PayPal', description: 'Instant transfers' },
        { icon: CreditCard, name: 'Stripe', description: 'Direct bank deposit' },
        { icon: Building2, name: 'Bank Transfer', description: 'Wire transfer' },
        { icon: Bitcoin, name: 'Crypto', description: 'ETH, BTC, USDT' }
    ];

    return (
        <div className={`min-h-screen bg-[#0a0a0f] text-white ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
            {/* Animated Background */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-emerald-600/20 rounded-full blur-[120px] animate-pulse" />
                <div className="absolute top-[30%] right-[-10%] w-[500px] h-[500px] bg-violet-600/25 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '1s' }} />
                <div className="absolute bottom-[-10%] left-[30%] w-[700px] h-[700px] bg-fuchsia-600/15 rounded-full blur-[150px] animate-pulse" style={{ animationDelay: '2s' }} />
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:100px_100px]" />
            </div>

            {/* Navigation */}
            <nav className="relative z-50 border-b border-white/10 bg-black/20 backdrop-blur-xl">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-3">
                        <Image
                            src="/logo.jpg"
                            alt="DigitalMEng Logo"
                            width={48}
                            height={48}
                            className="object-contain"
                            priority
                        />
                        <div className="flex flex-col">
                            <span className="text-xl font-bold tracking-tight">
                                Digital<span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-fuchsia-400">MEng</span>
                            </span>
                            <span className="text-xs text-white/50">Affiliate Program</span>
                        </div>
                    </Link>
                    <div className="flex items-center gap-4">
                        <LanguageDropdown
                            currentLanguage={currentLanguage}
                            onLanguageChange={handleLanguageChange}
                            variant="light"
                        />
                        <button
                            onClick={() => router.push('/login')}
                            className="px-4 py-2 text-sm font-medium text-white/70 hover:text-white transition-colors"
                        >
                            Login
                        </button>
                        <button
                            onClick={() => router.push('/affiliate/join')}
                            className="px-5 py-2.5 text-sm font-semibold rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 transition-all shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40"
                        >
                            Become an Affiliate
                        </button>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative z-10 max-w-7xl mx-auto px-6 pt-20 pb-24">
                <div className="text-center">
                    {/* Badge */}
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 backdrop-blur-sm mb-8">
                        <Gift className="w-4 h-4 text-emerald-400" />
                        <span className="text-sm text-emerald-400 font-medium">Partner With Us & Earn</span>
                    </div>

                    {/* Headline */}
                    <h1 className="text-5xl md:text-7xl font-black tracking-tight leading-[0.95] mb-8">
                        <span className="block text-white">Earn Up To</span>
                        <span className="block text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 animate-gradient">
                            20% Recurring
                        </span>
                        <span className="block text-white">Commission</span>
                    </h1>

                    <p className="text-lg md:text-xl text-white/60 max-w-2xl mx-auto mb-12 leading-relaxed">
                        Join the DigitalMEng Affiliate Program and earn recurring commissions by promoting the
                        <span className="text-white font-medium"> #1 AI-Powered Digital Marketing Engine</span>.
                        No experience required!
                    </p>

                    {/* CTA Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
                        <button
                            onClick={() => router.push('/affiliate/join')}
                            className="group px-8 py-4 text-lg font-semibold rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 transition-all shadow-2xl shadow-emerald-500/30 hover:shadow-emerald-500/50 flex items-center justify-center gap-3"
                        >
                            <Sparkles className="w-5 h-5" />
                            Start Earning Today
                            <ArrowRight className={`w-5 h-5 ${isRTL ? 'rotate-180 group-hover:-translate-x-1' : 'group-hover:translate-x-1'} transition-transform`} />
                        </button>
                        <button
                            onClick={() => router.push('/login')}
                            className="px-8 py-4 text-lg font-semibold rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 backdrop-blur-sm transition-all flex items-center justify-center gap-3"
                        >
                            <Play className="w-5 h-5" />
                            Affiliate Login
                        </button>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
                        {[
                            { value: '1,500+', label: 'Active Affiliates', color: 'text-emerald-400' },
                            { value: '$2.5M+', label: 'Commissions Paid', color: 'text-teal-400' },
                            { value: '90 Days', label: 'Cookie Duration', color: 'text-cyan-400' },
                            { value: '20%', label: 'Max Commission', color: 'text-violet-400' },
                        ].map((stat, index) => (
                            <div
                                key={index}
                                className="text-center p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-all"
                            >
                                <div className={`text-3xl md:text-4xl font-black mb-2 ${stat.color}`}>
                                    {stat.value}
                                </div>
                                <div className="text-sm text-white/50 font-medium">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Benefits Section */}
            <section className="relative z-10 py-24 border-t border-white/10">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-5xl font-bold mb-4">
                            Why <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400">Partners Love</span> Us
                        </h2>
                        <p className="text-white/50 text-lg max-w-2xl mx-auto">
                            Industry-leading commissions, powerful tools, and dedicated support to maximize your earnings
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {benefits.map((benefit, index) => (
                            <div
                                key={index}
                                className="group p-8 rounded-3xl bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 hover:border-emerald-500/30 transition-all hover:-translate-y-2"
                            >
                                <div className="flex items-start gap-4">
                                    <div className="inline-flex p-4 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 flex-shrink-0">
                                        <benefit.icon className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <div className="text-xs font-bold text-emerald-400 mb-1">{benefit.highlight}</div>
                                        <h3 className="text-lg font-bold mb-2">{benefit.title}</h3>
                                        <p className="text-white/50 text-sm leading-relaxed">{benefit.description}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Commission Tiers Section */}
            <section className="relative z-10 py-24 border-t border-white/10">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-5xl font-bold mb-4">
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-fuchsia-400">5-Tier</span> Commission System
                        </h2>
                        <p className="text-white/50 text-lg max-w-2xl mx-auto">
                            Unlock higher commission rates and exclusive perks as you grow. Every tier brings new rewards!
                        </p>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                        {affiliateTiers.map((tier, index) => (
                            <div
                                key={tier.name}
                                className="relative p-6 rounded-2xl border-2 text-center transition-all hover:scale-105 hover:shadow-2xl"
                                style={{
                                    borderColor: `${tier.color}50`,
                                    backgroundColor: `${tier.color}10`,
                                    boxShadow: `0 0 40px ${tier.color}10`
                                }}
                            >
                                {index === 4 && (
                                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 text-xs font-bold rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white">
                                        BEST
                                    </div>
                                )}
                                <div className="text-4xl mb-3">{tier.icon}</div>
                                <h4 className="font-bold text-white mb-1">{tier.displayName}</h4>
                                <div className="text-3xl font-black mb-2" style={{ color: tier.color }}>
                                    {tier.commissionRate}%
                                </div>
                                <p className="text-xs text-white/50 mb-4">
                                    {tier.minReferrals}+ referrals
                                </p>
                                <ul className="text-xs text-white/60 space-y-1 text-left">
                                    {tier.benefits.slice(0, 3).map((benefit, idx) => (
                                        <li key={idx} className="flex items-center gap-1">
                                            <CheckCircle2 className="w-3 h-3 text-emerald-400 flex-shrink-0" />
                                            <span className="truncate">{benefit}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* How It Works */}
            <section className="relative z-10 py-24 border-t border-white/10">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-5xl font-bold mb-4">
                            How It <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400">Works</span>
                        </h2>
                        <p className="text-white/50 text-lg max-w-2xl mx-auto">
                            Get started in minutes and start earning today. It's that simple!
                        </p>
                    </div>

                    <div className="grid md:grid-cols-4 gap-8">
                        {howItWorks.map((step, index) => (
                            <div key={index} className="relative text-center">
                                <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-600 mb-6 shadow-lg shadow-emerald-500/30">
                                    <step.icon className="w-8 h-8 text-white" />
                                </div>
                                <div className="absolute top-10 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-white text-emerald-600 rounded-full flex items-center justify-center font-bold text-sm shadow-lg">
                                    {step.step}
                                </div>
                                <h3 className="text-xl font-bold mb-3">{step.title}</h3>
                                <p className="text-white/50 text-sm leading-relaxed">{step.description}</p>
                                {index < 3 && !isRTL && (
                                    <div className="hidden md:block absolute top-10 left-[60%] w-[80%] h-[2px] bg-gradient-to-r from-emerald-500/50 to-transparent" />
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Payment Methods */}
            <section className="relative z-10 py-16 border-t border-white/10">
                <div className="max-w-4xl mx-auto px-6">
                    <div className="text-center mb-12">
                        <h2 className="text-2xl md:text-3xl font-bold mb-2">
                            Get Paid <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400">Your Way</span>
                        </h2>
                        <p className="text-white/50">Multiple payment options for your convenience</p>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {paymentMethods.map((method, index) => (
                            <div
                                key={index}
                                className="p-6 rounded-2xl bg-white/5 border border-white/10 text-center hover:bg-white/10 transition-all"
                            >
                                <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center mx-auto mb-3">
                                    <method.icon className="w-6 h-6 text-emerald-400" />
                                </div>
                                <h4 className="font-semibold text-white">{method.name}</h4>
                                <p className="text-xs text-white/50">{method.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Testimonials */}
            <section className="relative z-10 py-24 border-t border-white/10">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-5xl font-bold mb-4">
                            What Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400">Affiliates Say</span>
                        </h2>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6">
                        {testimonials.map((testimonial, index) => (
                            <div
                                key={index}
                                className="p-8 rounded-3xl bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10"
                            >
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-2xl">
                                        {testimonial.avatar}
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-white">{testimonial.name}</h4>
                                        <p className="text-sm text-white/50">{testimonial.role}</p>
                                    </div>
                                </div>
                                <p className="text-white/70 mb-4 italic">&ldquo;{testimonial.quote}&rdquo;</p>
                                <div className="flex items-center gap-2">
                                    <DollarSign className="w-4 h-4 text-emerald-400" />
                                    <span className="text-sm font-semibold text-emerald-400">Total Earned: {testimonial.earnings}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section className="relative z-10 py-24 border-t border-white/10">
                <div className="max-w-3xl mx-auto px-6">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-5xl font-bold mb-4">
                            Frequently Asked <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-fuchsia-400">Questions</span>
                        </h2>
                    </div>

                    <div className="space-y-4">
                        {faqs.map((faq, index) => (
                            <div
                                key={index}
                                className="rounded-2xl border border-white/10 overflow-hidden"
                            >
                                <button
                                    onClick={() => setOpenFaq(openFaq === index ? null : index)}
                                    className="w-full p-6 text-left flex items-center justify-between bg-white/5 hover:bg-white/10 transition-all"
                                >
                                    <span className="font-semibold text-white pr-4">{faq.question}</span>
                                    <ChevronRight
                                        className={`w-5 h-5 text-white/50 flex-shrink-0 transition-transform ${openFaq === index ? 'rotate-90' : ''}`}
                                    />
                                </button>
                                {openFaq === index && (
                                    <div className="p-6 pt-0 text-white/60 text-sm leading-relaxed bg-white/5">
                                        {faq.answer}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Final CTA */}
            <section className="relative z-10 py-24 border-t border-white/10">
                <div className="max-w-4xl mx-auto px-6 text-center">
                    <div className="p-12 rounded-3xl bg-gradient-to-br from-emerald-600/20 to-teal-600/20 border border-emerald-500/20 backdrop-blur-xl">
                        <div className="inline-flex p-4 rounded-full bg-emerald-500/20 mb-6">
                            <Gift className="w-10 h-10 text-emerald-400" />
                        </div>
                        <h2 className="text-3xl md:text-4xl font-bold mb-4">
                            Ready to Start Earning?
                        </h2>
                        <p className="text-white/60 mb-8 text-lg max-w-xl mx-auto">
                            Join thousands of affiliates who are already earning recurring commissions with DigitalMEng. It takes less than 2 minutes to get started!
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <button
                                onClick={() => router.push('/affiliate/join')}
                                className="px-10 py-5 text-lg font-semibold rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 transition-all shadow-2xl shadow-emerald-500/30 hover:shadow-emerald-500/50 flex items-center justify-center gap-3"
                            >
                                <Sparkles className="w-5 h-5" />
                                Join for Free
                                <ArrowRight className="w-5 h-5" />
                            </button>
                            <button
                                onClick={() => router.push('/login')}
                                className="px-10 py-5 text-lg font-semibold rounded-2xl bg-white/5 border border-white/20 hover:bg-white/10 transition-all flex items-center justify-center gap-3"
                            >
                                Already a Partner? Login
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="relative z-10 py-8 border-t border-white/10">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                        <div className="text-white/30 text-sm">
                            © 2026 DigitalMEng. All rights reserved.
                        </div>
                        <div className="flex items-center gap-6 text-sm">
                            <Link href="/" className="text-white/50 hover:text-white transition-colors">Home</Link>
                            <Link href="/pricing" className="text-white/50 hover:text-white transition-colors">Pricing</Link>
                            <Link href="/login" className="text-white/50 hover:text-white transition-colors">Login</Link>
                            <Link href="/affiliate/join" className="text-emerald-400 hover:text-emerald-300 transition-colors font-medium">Become an Affiliate</Link>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
