'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
    Gift,
    DollarSign,
    Users,
    TrendingUp,
    Check,
    ArrowRight,
    ArrowLeft,
    Award,
    Wallet,
    ChevronRight,
    Loader2,
    Sparkles,
    Globe
} from 'lucide-react';
import { useAuth } from '@/lib/auth/AuthContext';
import { useAffiliate } from '@/lib/affiliate/AffiliateContext';
import { affiliateTiers } from '@/lib/affiliateData';
import { PAYMENT_METHODS, PaymentMethodType, PaymentDetails } from '@/types/affiliate';

export default function AffiliateOnboardingPage() {
    const router = useRouter();
    const { user, isAuthenticated } = useAuth();
    const { createAffiliateAccount, isLoading, error, affiliate } = useAffiliate();

    const [step, setStep] = useState(1);
    const [selectedRegion, setSelectedRegion] = useState<string>('global');
    const [formData, setFormData] = useState<{
        paymentMethod: PaymentMethodType;
        paymentEmail: string;
        paymentDetails: PaymentDetails;
        acceptedTerms: boolean;
        acceptedPolicies: boolean;
    }>({
        paymentMethod: 'paypal',
        paymentEmail: user?.email || '',
        paymentDetails: {},
        acceptedTerms: false,
        acceptedPolicies: false
    });

    // If already an affiliate, redirect to dashboard
    if (affiliate) {
        router.push('/affiliate');
        return null;
    }

    const handleSubmit = async () => {
        if (!formData.acceptedTerms || !formData.acceptedPolicies) {
            alert('Please accept the terms and conditions');
            return;
        }

        const success = await createAffiliateAccount({
            paymentMethod: formData.paymentMethod,
            paymentEmail: formData.paymentEmail,
            paymentDetails: Object.keys(formData.paymentDetails).length > 0 ? formData.paymentDetails : undefined
        });

        if (success) {
            setStep(4); // Success step
        }
    };

    const benefits = [
        { icon: DollarSign, title: 'Up to 20% Commission', description: 'Earn recurring commissions on every referral' },
        { icon: Users, title: '90-Day Cookies', description: 'Long attribution window for maximum earnings' },
        { icon: TrendingUp, title: '5 Tier System', description: 'Unlock higher rates as you grow' },
        { icon: Wallet, title: 'Fast Payouts', description: 'Weekly payouts for top affiliates' }
    ];

    const regions = [
        { id: 'global', label: '🌍 Global', description: 'PayPal, Stripe, Wise' },
        { id: 'india', label: '🇮🇳 India', description: 'GPay, PhonePe, UPI' },
        { id: 'southeast_asia', label: '🌏 SE Asia', description: 'GrabPay, GCash' },
        { id: 'china', label: '🇨🇳 China', description: 'Alipay, WeChat' },
        { id: 'europe', label: '🇪🇺 Europe', description: 'SEPA, Revolut' },
        { id: 'africa', label: '🌍 Africa', description: 'M-Pesa' },
        { id: 'latin_america', label: '🌎 LatAm', description: 'PIX, MercadoPago' },
    ];

    const filteredPaymentMethods = PAYMENT_METHODS.filter(
        pm => pm.region === selectedRegion || pm.region === 'global'
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-violet-50/30">
            {/* Header */}
            <div className="bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white">
                <div className="max-w-5xl mx-auto px-6 py-12">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-3 bg-white/20 rounded-xl">
                            <Gift className="w-8 h-8" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold">Affiliate Program</h1>
                            <p className="text-white/80">Join thousands of partners earning with DigitalMEng</p>
                        </div>
                    </div>

                    {/* Progress Steps */}
                    <div className="flex items-center gap-2 mt-8">
                        {[1, 2, 3].map((s) => (
                            <div key={s} className="flex items-center">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold ${step >= s ? 'bg-white text-violet-600' : 'bg-white/20 text-white/60'
                                    }`}>
                                    {step > s ? <Check className="w-4 h-4" /> : s}
                                </div>
                                {s < 3 && (
                                    <div className={`w-20 h-1 mx-2 rounded ${step > s ? 'bg-white' : 'bg-white/20'}`} />
                                )}
                            </div>
                        ))}
                    </div>
                    <div className="flex gap-2 mt-2 text-sm">
                        <span className={`w-8 text-center ${step >= 1 ? 'text-white' : 'text-white/60'}`}>Info</span>
                        <span className="w-20" />
                        <span className={`w-8 text-center ${step >= 2 ? 'text-white' : 'text-white/60'}`}>Payment</span>
                        <span className="w-20" />
                        <span className={`w-8 text-center ${step >= 3 ? 'text-white' : 'text-white/60'}`}>Terms</span>
                    </div>
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-6 py-8">
                {/* Step 1: Benefits & Info */}
                {step === 1 && (
                    <div className="space-y-8">
                        {/* Benefits Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {benefits.map((benefit, idx) => (
                                <div key={idx} className="bg-white rounded-xl border border-slate-200 p-5">
                                    <div className="w-12 h-12 bg-violet-100 rounded-xl flex items-center justify-center mb-4">
                                        <benefit.icon className="w-6 h-6 text-violet-600" />
                                    </div>
                                    <h3 className="font-semibold text-slate-800 mb-1">{benefit.title}</h3>
                                    <p className="text-sm text-slate-500">{benefit.description}</p>
                                </div>
                            ))}
                        </div>

                        {/* Tier Overview */}
                        <div className="bg-white rounded-2xl border border-slate-200 p-6">
                            <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                                <Award className="w-6 h-6 text-violet-600" />
                                Commission Tiers
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                                {affiliateTiers.map((tier) => (
                                    <div
                                        key={tier.name}
                                        className="p-4 rounded-xl border-2 text-center transition-all hover:shadow-lg"
                                        style={{
                                            borderColor: `${tier.color}40`,
                                            backgroundColor: `${tier.color}08`
                                        }}
                                    >
                                        <div className="text-3xl mb-2">{tier.icon}</div>
                                        <h4 className="font-semibold text-slate-800">{tier.displayName}</h4>
                                        <div className="text-2xl font-bold mt-2" style={{ color: tier.color }}>
                                            {tier.commissionRate}%
                                        </div>
                                        <p className="text-xs text-slate-500 mt-1">
                                            {tier.minReferrals}+ referrals
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* How It Works */}
                        <div className="bg-white rounded-2xl border border-slate-200 p-6">
                            <h2 className="text-xl font-bold text-slate-800 mb-6">How It Works</h2>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {[
                                    { step: '1', title: 'Share Your Link', description: 'Get your unique referral link and share it with your audience' },
                                    { step: '2', title: 'Earn Commissions', description: 'Earn up to 20% on every sale from your referrals' },
                                    { step: '3', title: 'Get Paid', description: 'Receive payouts weekly, bi-weekly, or monthly' }
                                ].map((item, idx) => (
                                    <div key={idx} className="flex items-start gap-4">
                                        <div className="w-10 h-10 bg-violet-600 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                                            {item.step}
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-slate-800">{item.title}</h4>
                                            <p className="text-sm text-slate-500 mt-1">{item.description}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* CTA */}
                        <div className="flex justify-end">
                            <button
                                onClick={() => isAuthenticated ? setStep(2) : router.push('/auth/login?redirect=/affiliate/join')}
                                className="px-8 py-4 bg-violet-600 text-white rounded-xl font-semibold hover:bg-violet-500 transition-colors flex items-center gap-2"
                            >
                                {isAuthenticated ? 'Continue to Payment Setup' : 'Login to Join'}
                                <ArrowRight className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                )}

                {/* Step 2: Payment Setup */}
                {step === 2 && (
                    <div className="max-w-3xl mx-auto space-y-6">
                        <div className="bg-white rounded-2xl border border-slate-200 p-6">
                            <h2 className="text-xl font-bold text-slate-800 mb-6">Payment Setup</h2>

                            {/* Region Selector */}
                            <div className="mb-6">
                                <label className="block text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                                    <Globe className="w-4 h-4" />
                                    Select Your Region
                                </label>
                                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
                                    {regions.map(region => (
                                        <button
                                            key={region.id}
                                            type="button"
                                            onClick={() => {
                                                setSelectedRegion(region.id);
                                                // Reset payment method when region changes
                                                setFormData({
                                                    ...formData,
                                                    paymentMethod: 'paypal',
                                                    paymentEmail: user?.email || '',
                                                    paymentDetails: {}
                                                });
                                            }}
                                            className={`p-2.5 rounded-xl border-2 text-center transition-all ${selectedRegion === region.id
                                                    ? 'border-violet-500 bg-violet-50'
                                                    : 'border-slate-200 hover:border-violet-300'
                                                }`}
                                        >
                                            <div className="font-medium text-sm">{region.label}</div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Payment Method Selection */}
                            <div className="mb-6">
                                <label className="block text-sm font-semibold text-slate-700 mb-3">
                                    Select Payment Method
                                </label>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {filteredPaymentMethods.map((method) => (
                                        <button
                                            key={method.id}
                                            onClick={() => setFormData({
                                                ...formData,
                                                paymentMethod: method.id,
                                                paymentEmail: ['paypal', 'stripe', 'flutterwave', 'razorpay'].includes(method.id) ? (user?.email || '') : '',
                                                paymentDetails: {}
                                            })}
                                            className={`p-4 rounded-xl border-2 text-left transition-all ${formData.paymentMethod === method.id
                                                ? 'border-violet-500 bg-violet-50'
                                                : 'border-slate-200 hover:border-slate-300'
                                                }`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${formData.paymentMethod === method.id
                                                    ? 'bg-violet-500 text-white'
                                                    : 'bg-slate-100'
                                                    }`}>
                                                    {method.icon}
                                                </div>
                                                <div>
                                                    <div className="font-semibold text-slate-800">{method.name}</div>
                                                    <div className="text-xs text-slate-500">{method.description}</div>
                                                </div>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Dynamic Payment Details Form */}
                            <div className="space-y-4">
                                {/* Email-based methods */}
                                {['paypal', 'stripe', 'flutterwave', 'razorpay'].includes(formData.paymentMethod) && (
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Payment Email</label>
                                        <input
                                            type="email"
                                            value={formData.paymentEmail}
                                            onChange={(e) => setFormData({ ...formData, paymentEmail: e.target.value })}
                                            placeholder="your@email.com"
                                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500"
                                        />
                                    </div>
                                )}

                                {/* Bank Transfer */}
                                {formData.paymentMethod === 'bank_transfer' && (
                                    <>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-1">Bank Name</label>
                                            <input
                                                type="text"
                                                value={formData.paymentDetails.bankName || ''}
                                                onChange={(e) => setFormData({ ...formData, paymentDetails: { ...formData.paymentDetails, bankName: e.target.value } })}
                                                placeholder="Bank of America"
                                                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500"
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-slate-700 mb-1">Account Number</label>
                                                <input
                                                    type="text"
                                                    value={formData.paymentDetails.accountNumber || ''}
                                                    onChange={(e) => setFormData({ ...formData, paymentDetails: { ...formData.paymentDetails, accountNumber: e.target.value } })}
                                                    placeholder="XXXXXXXX"
                                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-slate-700 mb-1">Routing Number</label>
                                                <input
                                                    type="text"
                                                    value={formData.paymentDetails.routingNumber || ''}
                                                    onChange={(e) => setFormData({ ...formData, paymentDetails: { ...formData.paymentDetails, routingNumber: e.target.value } })}
                                                    placeholder="XXXXXXXXX"
                                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500"
                                                />
                                            </div>
                                        </div>
                                    </>
                                )}

                                {/* Cryptocurrency */}
                                {formData.paymentMethod === 'crypto' && (
                                    <>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-1">Network</label>
                                            <select
                                                value={formData.paymentDetails.cryptoNetwork || 'ethereum'}
                                                onChange={(e) => setFormData({ ...formData, paymentDetails: { ...formData.paymentDetails, cryptoNetwork: e.target.value as PaymentDetails['cryptoNetwork'] } })}
                                                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500"
                                            >
                                                <option value="ethereum">Ethereum (ETH/USDT)</option>
                                                <option value="bitcoin">Bitcoin (BTC)</option>
                                                <option value="usdt_trc20">USDT (TRC20)</option>
                                                <option value="usdt_erc20">USDT (ERC20)</option>
                                                <option value="usdc">USDC</option>
                                                <option value="polygon">Polygon (MATIC)</option>
                                                <option value="solana">Solana (SOL)</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-1">Wallet Address</label>
                                            <input
                                                type="text"
                                                value={formData.paymentDetails.cryptoWallet || ''}
                                                onChange={(e) => setFormData({ ...formData, paymentDetails: { ...formData.paymentDetails, cryptoWallet: e.target.value } })}
                                                placeholder="0x..."
                                                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500 font-mono"
                                            />
                                        </div>
                                    </>
                                )}

                                {/* India - UPI/GPay/PhonePe/Paytm */}
                                {['gpay', 'phonepe', 'paytm', 'upi'].includes(formData.paymentMethod) && (
                                    <>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-1">UPI ID</label>
                                            <input
                                                type="text"
                                                value={formData.paymentDetails.upiId || ''}
                                                onChange={(e) => setFormData({ ...formData, paymentDetails: { ...formData.paymentDetails, upiId: e.target.value } })}
                                                placeholder="name@upi"
                                                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500"
                                            />
                                        </div>
                                        {['gpay', 'phonepe', 'paytm'].includes(formData.paymentMethod) && (
                                            <div>
                                                <label className="block text-sm font-medium text-slate-700 mb-1">Phone Number</label>
                                                <input
                                                    type="tel"
                                                    value={formData.paymentDetails.phoneNumber || ''}
                                                    onChange={(e) => setFormData({ ...formData, paymentDetails: { ...formData.paymentDetails, phoneNumber: e.target.value } })}
                                                    placeholder="+91 XXXXX XXXXX"
                                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500"
                                                />
                                            </div>
                                        )}
                                    </>
                                )}

                                {/* Wise */}
                                {formData.paymentMethod === 'wise' && (
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Wise Email</label>
                                        <input
                                            type="email"
                                            value={formData.paymentDetails.wiseEmail || ''}
                                            onChange={(e) => setFormData({ ...formData, paymentDetails: { ...formData.paymentDetails, wiseEmail: e.target.value } })}
                                            placeholder="your@email.com"
                                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500"
                                        />
                                    </div>
                                )}

                                {/* Skrill */}
                                {formData.paymentMethod === 'skrill' && (
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Skrill Email</label>
                                        <input
                                            type="email"
                                            value={formData.paymentDetails.skrillEmail || ''}
                                            onChange={(e) => setFormData({ ...formData, paymentDetails: { ...formData.paymentDetails, skrillEmail: e.target.value } })}
                                            placeholder="your@email.com"
                                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500"
                                        />
                                    </div>
                                )}

                                {/* Payoneer */}
                                {formData.paymentMethod === 'payoneer' && (
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Payoneer Email</label>
                                        <input
                                            type="email"
                                            value={formData.paymentDetails.payoneerEmail || ''}
                                            onChange={(e) => setFormData({ ...formData, paymentDetails: { ...formData.paymentDetails, payoneerEmail: e.target.value } })}
                                            placeholder="your@email.com"
                                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500"
                                        />
                                    </div>
                                )}

                                {/* SEPA */}
                                {formData.paymentMethod === 'sepa' && (
                                    <>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-1">Account Holder Name</label>
                                            <input
                                                type="text"
                                                value={formData.paymentDetails.accountHolderName || ''}
                                                onChange={(e) => setFormData({ ...formData, paymentDetails: { ...formData.paymentDetails, accountHolderName: e.target.value } })}
                                                placeholder="John Doe"
                                                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-1">IBAN</label>
                                            <input
                                                type="text"
                                                value={formData.paymentDetails.iban || ''}
                                                onChange={(e) => setFormData({ ...formData, paymentDetails: { ...formData.paymentDetails, iban: e.target.value } })}
                                                placeholder="DE89 3704 0044 0532 0130 00"
                                                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500 font-mono"
                                            />
                                        </div>
                                    </>
                                )}

                                {/* Revolut */}
                                {formData.paymentMethod === 'revolut' && (
                                    <>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-1">Revolut Email</label>
                                            <input
                                                type="email"
                                                value={formData.paymentEmail}
                                                onChange={(e) => setFormData({ ...formData, paymentEmail: e.target.value })}
                                                placeholder="your@email.com"
                                                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-1">Phone Number</label>
                                            <input
                                                type="tel"
                                                value={formData.paymentDetails.phoneNumber || ''}
                                                onChange={(e) => setFormData({ ...formData, paymentDetails: { ...formData.paymentDetails, phoneNumber: e.target.value } })}
                                                placeholder="+44 XXXX XXXXXX"
                                                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500"
                                            />
                                        </div>
                                    </>
                                )}

                                {/* SE Asia Mobile Wallets */}
                                {formData.paymentMethod === 'grabpay' && (
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">GrabPay Phone Number</label>
                                        <input type="tel" value={formData.paymentDetails.grabpayPhone || ''} onChange={(e) => setFormData({ ...formData, paymentDetails: { ...formData.paymentDetails, grabpayPhone: e.target.value } })} placeholder="+65 XXXX XXXX" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500" />
                                    </div>
                                )}
                                {formData.paymentMethod === 'gcash' && (
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">GCash Phone Number</label>
                                        <input type="tel" value={formData.paymentDetails.gcashPhone || ''} onChange={(e) => setFormData({ ...formData, paymentDetails: { ...formData.paymentDetails, gcashPhone: e.target.value } })} placeholder="+63 XXX XXX XXXX" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500" />
                                    </div>
                                )}
                                {formData.paymentMethod === 'maya' && (
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Maya Phone Number</label>
                                        <input type="tel" value={formData.paymentDetails.mayaPhone || ''} onChange={(e) => setFormData({ ...formData, paymentDetails: { ...formData.paymentDetails, mayaPhone: e.target.value } })} placeholder="+63 XXX XXX XXXX" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500" />
                                    </div>
                                )}
                                {formData.paymentMethod === 'dana' && (
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Dana Phone Number</label>
                                        <input type="tel" value={formData.paymentDetails.danaPhone || ''} onChange={(e) => setFormData({ ...formData, paymentDetails: { ...formData.paymentDetails, danaPhone: e.target.value } })} placeholder="+62 XXX XXXX XXXX" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500" />
                                    </div>
                                )}
                                {formData.paymentMethod === 'ovo' && (
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">OVO Phone Number</label>
                                        <input type="tel" value={formData.paymentDetails.ovoPhone || ''} onChange={(e) => setFormData({ ...formData, paymentDetails: { ...formData.paymentDetails, ovoPhone: e.target.value } })} placeholder="+62 XXX XXXX XXXX" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500" />
                                    </div>
                                )}
                                {formData.paymentMethod === 'gopay' && (
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">GoPay Phone Number</label>
                                        <input type="tel" value={formData.paymentDetails.gopayPhone || ''} onChange={(e) => setFormData({ ...formData, paymentDetails: { ...formData.paymentDetails, gopayPhone: e.target.value } })} placeholder="+62 XXX XXXX XXXX" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500" />
                                    </div>
                                )}

                                {/* China */}
                                {formData.paymentMethod === 'alipay' && (
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Alipay ID / Phone</label>
                                        <input type="text" value={formData.paymentDetails.alipayId || ''} onChange={(e) => setFormData({ ...formData, paymentDetails: { ...formData.paymentDetails, alipayId: e.target.value } })} placeholder="Alipay account" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500" />
                                    </div>
                                )}
                                {formData.paymentMethod === 'wechat_pay' && (
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">WeChat ID</label>
                                        <input type="text" value={formData.paymentDetails.wechatId || ''} onChange={(e) => setFormData({ ...formData, paymentDetails: { ...formData.paymentDetails, wechatId: e.target.value } })} placeholder="WeChat ID" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500" />
                                    </div>
                                )}

                                {/* Africa */}
                                {formData.paymentMethod === 'mpesa' && (
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">M-Pesa Phone Number</label>
                                        <input type="tel" value={formData.paymentDetails.mpesaPhone || ''} onChange={(e) => setFormData({ ...formData, paymentDetails: { ...formData.paymentDetails, mpesaPhone: e.target.value } })} placeholder="+254 XXX XXX XXX" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500" />
                                    </div>
                                )}

                                {/* Latin America */}
                                {formData.paymentMethod === 'pix' && (
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">PIX Key</label>
                                        <input type="text" value={formData.paymentDetails.pixKey || ''} onChange={(e) => setFormData({ ...formData, paymentDetails: { ...formData.paymentDetails, pixKey: e.target.value } })} placeholder="CPF, Email, Phone, or Random Key" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500" />
                                    </div>
                                )}
                                {formData.paymentMethod === 'mercadopago' && (
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">MercadoPago Email</label>
                                        <input type="email" value={formData.paymentDetails.mercadopagoEmail || ''} onChange={(e) => setFormData({ ...formData, paymentDetails: { ...formData.paymentDetails, mercadopagoEmail: e.target.value } })} placeholder="your@email.com" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500" />
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="flex justify-between">
                            <button
                                onClick={() => setStep(1)}
                                className="px-6 py-3 border border-slate-200 rounded-xl font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                            >
                                <ArrowLeft className="w-4 h-4" />
                                Back
                            </button>
                            <button
                                onClick={() => setStep(3)}
                                className="px-8 py-3 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white rounded-xl font-semibold hover:from-violet-500 hover:to-fuchsia-500 flex items-center gap-2 shadow-lg shadow-violet-500/25"
                            >
                                Continue <ArrowRight className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                )}

                {/* Step 3: Terms */}
                {step === 3 && (
                    <div className="max-w-2xl mx-auto space-y-6">
                        <div className="bg-white rounded-2xl border border-slate-200 p-6">
                            <h2 className="text-xl font-bold text-slate-800 mb-6">Terms & Conditions</h2>

                            <div className="space-y-4">
                                {/* Terms Summary */}
                                <div className="bg-slate-50 rounded-xl p-4 max-h-64 overflow-y-auto text-sm text-slate-600">
                                    <h4 className="font-semibold text-slate-800 mb-2">Affiliate Agreement Summary</h4>
                                    <ul className="space-y-2">
                                        <li>• You will earn commissions based on your tier level (10-20%)</li>
                                        <li>• Commissions are paid on successful purchases by referred users</li>
                                        <li>• Minimum payout threshold is $50 USD</li>
                                        <li>• Cookie duration is 90 days from first click</li>
                                        <li>• Self-referrals are not allowed</li>
                                        <li>• Spam and misleading marketing is prohibited</li>
                                        <li>• DigitalMEng reserves the right to modify commission rates</li>
                                        <li>• Accounts with fraudulent activity will be suspended</li>
                                    </ul>
                                </div>

                                {/* Checkboxes */}
                                <label className="flex items-start gap-3 cursor-pointer p-4 rounded-xl border border-slate-200 hover:bg-slate-50">
                                    <input
                                        type="checkbox"
                                        checked={formData.acceptedTerms}
                                        onChange={(e) => setFormData({ ...formData, acceptedTerms: e.target.checked })}
                                        className="mt-1 w-5 h-5 rounded border-slate-300 text-violet-600 focus:ring-violet-500"
                                    />
                                    <div>
                                        <span className="font-medium text-slate-800">I accept the Affiliate Terms & Conditions</span>
                                        <p className="text-sm text-slate-500 mt-1">
                                            I have read and agree to the affiliate program terms, including commission structure and payout policies.
                                        </p>
                                    </div>
                                </label>

                                <label className="flex items-start gap-3 cursor-pointer p-4 rounded-xl border border-slate-200 hover:bg-slate-50">
                                    <input
                                        type="checkbox"
                                        checked={formData.acceptedPolicies}
                                        onChange={(e) => setFormData({ ...formData, acceptedPolicies: e.target.checked })}
                                        className="mt-1 w-5 h-5 rounded border-slate-300 text-violet-600 focus:ring-violet-500"
                                    />
                                    <div>
                                        <span className="font-medium text-slate-800">I accept the Privacy Policy & Marketing Guidelines</span>
                                        <p className="text-sm text-slate-500 mt-1">
                                            I agree to follow the marketing guidelines and understand how my data will be used.
                                        </p>
                                    </div>
                                </label>
                            </div>

                            {error && (
                                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
                                    {error}
                                </div>
                            )}
                        </div>

                        <div className="flex justify-between">
                            <button
                                onClick={() => setStep(2)}
                                className="px-6 py-3 border border-slate-200 rounded-xl font-medium text-slate-700 hover:bg-slate-50"
                            >
                                Back
                            </button>
                            <button
                                onClick={handleSubmit}
                                disabled={!formData.acceptedTerms || !formData.acceptedPolicies || isLoading}
                                className="px-8 py-3 bg-violet-600 text-white rounded-xl font-semibold hover:bg-violet-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        Creating Account...
                                    </>
                                ) : (
                                    <>
                                        <Sparkles className="w-5 h-5" />
                                        Join Affiliate Program
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                )}

                {/* Step 4: Success */}
                {step === 4 && (
                    <div className="max-w-2xl mx-auto">
                        <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center">
                            <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Check className="w-10 h-10 text-emerald-600" />
                            </div>
                            <h2 className="text-2xl font-bold text-slate-800 mb-2">Welcome to the Affiliate Program!</h2>
                            <p className="text-slate-600 mb-6">
                                Your affiliate account has been created successfully. You can now start sharing your referral link and earning commissions.
                            </p>

                            <div className="bg-violet-50 rounded-xl p-4 mb-6">
                                <p className="text-sm text-violet-700 mb-2">Your account is pending approval</p>
                                <p className="text-xs text-violet-600">
                                    Our team will review your application within 24-48 hours. You'll receive an email once approved.
                                </p>
                            </div>

                            <button
                                onClick={() => router.push('/affiliate')}
                                className="px-8 py-3 bg-violet-600 text-white rounded-xl font-semibold hover:bg-violet-500 flex items-center gap-2 mx-auto"
                            >
                                Go to Affiliate Dashboard
                                <ChevronRight className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
