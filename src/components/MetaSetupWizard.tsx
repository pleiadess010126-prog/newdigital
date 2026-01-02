'use client';

import { useState, useEffect } from 'react';
import {
    Instagram, Facebook, ChevronRight, ChevronLeft, Check, X,
    ExternalLink, Copy, Eye, EyeOff, Loader2, AlertCircle,
    CheckCircle2, HelpCircle, Sparkles, Shield, Zap, RefreshCw,
    ArrowRight, Key, Link2, Users, BarChart3
} from 'lucide-react';

interface MetaSetupWizardProps {
    onComplete?: (credentials: MetaCredentials) => void;
    onCancel?: () => void;
    existingCredentials?: Partial<MetaCredentials>;
}

interface MetaCredentials {
    appId: string;
    appSecret: string;
    accessToken: string;
    pageAccessToken: string;
    instagramAccountId: string;
    facebookPageId: string;
    instagramUsername?: string;
    facebookPageName?: string;
}

interface PageInfo {
    id: string;
    name: string;
    accessToken: string;
    category: string;
    instagramBusinessAccount?: {
        id: string;
        username: string;
    };
}

const STEPS = [
    { id: 'intro', title: 'Get Started', icon: Sparkles },
    { id: 'app', title: 'Meta App', icon: Key },
    { id: 'token', title: 'Access Token', icon: Shield },
    { id: 'accounts', title: 'Select Accounts', icon: Users },
    { id: 'verify', title: 'Verify & Save', icon: CheckCircle2 },
];

export default function MetaSetupWizard({
    onComplete,
    onCancel,
    existingCredentials
}: MetaSetupWizardProps) {
    const [currentStep, setCurrentStep] = useState(0);
    const [credentials, setCredentials] = useState<MetaCredentials>({
        appId: existingCredentials?.appId || '',
        appSecret: existingCredentials?.appSecret || '',
        accessToken: existingCredentials?.accessToken || '',
        pageAccessToken: existingCredentials?.pageAccessToken || '',
        instagramAccountId: existingCredentials?.instagramAccountId || '',
        facebookPageId: existingCredentials?.facebookPageId || '',
        instagramUsername: existingCredentials?.instagramUsername || '',
        facebookPageName: existingCredentials?.facebookPageName || '',
    });

    const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [pages, setPages] = useState<PageInfo[]>([]);
    const [selectedPage, setSelectedPage] = useState<PageInfo | null>(null);
    const [connectionTest, setConnectionTest] = useState<{
        testing: boolean;
        success?: boolean;
        message?: string;
        details?: any;
    }>({ testing: false });
    const [copied, setCopied] = useState<string | null>(null);

    const toggleSecret = (field: string) => {
        setShowSecrets(prev => ({ ...prev, [field]: !prev[field] }));
    };

    const copyToClipboard = async (text: string, field: string) => {
        await navigator.clipboard.writeText(text);
        setCopied(field);
        setTimeout(() => setCopied(null), 2000);
    };

    const updateCredential = (field: keyof MetaCredentials, value: string) => {
        setCredentials(prev => ({ ...prev, [field]: value }));
        setError('');
    };

    const fetchPages = async () => {
        if (!credentials.accessToken) {
            setError('Please enter an access token first');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const response = await fetch(
                `https://graph.facebook.com/v24.0/me/accounts?fields=id,name,access_token,category,instagram_business_account{id,username}&access_token=${credentials.accessToken}`
            );

            const data = await response.json();

            if (data.error) {
                setError(data.error.message || 'Failed to fetch pages');
                return;
            }

            if (!data.data || data.data.length === 0) {
                setError('No Facebook Pages found. Make sure you have admin access to at least one Page.');
                return;
            }

            setPages(data.data.map((page: any) => ({
                id: page.id,
                name: page.name,
                accessToken: page.access_token,
                category: page.category,
                instagramBusinessAccount: page.instagram_business_account ? {
                    id: page.instagram_business_account.id,
                    username: page.instagram_business_account.username,
                } : undefined,
            })));
        } catch (err: any) {
            setError(err.message || 'Failed to fetch pages');
        } finally {
            setLoading(false);
        }
    };

    const selectPage = (page: PageInfo) => {
        setSelectedPage(page);
        setCredentials(prev => ({
            ...prev,
            facebookPageId: page.id,
            facebookPageName: page.name,
            pageAccessToken: page.accessToken,
            instagramAccountId: page.instagramBusinessAccount?.id || '',
            instagramUsername: page.instagramBusinessAccount?.username || '',
        }));
    };

    const testConnection = async () => {
        setConnectionTest({ testing: true });

        try {
            // Test the token by fetching user info
            const userResponse = await fetch(
                `https://graph.facebook.com/v24.0/me?access_token=${credentials.accessToken}`
            );
            const userData = await userResponse.json();

            if (userData.error) {
                setConnectionTest({
                    testing: false,
                    success: false,
                    message: userData.error.message || 'Token validation failed',
                });
                return;
            }

            // Test page access if page is selected
            if (credentials.facebookPageId && credentials.pageAccessToken) {
                const pageResponse = await fetch(
                    `https://graph.facebook.com/v24.0/${credentials.facebookPageId}?fields=name,id&access_token=${credentials.pageAccessToken}`
                );
                const pageData = await pageResponse.json();

                if (pageData.error) {
                    setConnectionTest({
                        testing: false,
                        success: false,
                        message: 'Page access token is invalid',
                    });
                    return;
                }
            }

            // Test Instagram access if configured
            if (credentials.instagramAccountId) {
                const igResponse = await fetch(
                    `https://graph.facebook.com/v24.0/${credentials.instagramAccountId}?fields=username,id&access_token=${credentials.pageAccessToken || credentials.accessToken}`
                );
                const igData = await igResponse.json();

                if (igData.error) {
                    setConnectionTest({
                        testing: false,
                        success: true,
                        message: 'Connected! (Instagram access may require additional permissions)',
                        details: { user: userData.name, page: credentials.facebookPageName },
                    });
                    return;
                }
            }

            setConnectionTest({
                testing: false,
                success: true,
                message: 'All connections verified successfully!',
                details: {
                    user: userData.name,
                    page: credentials.facebookPageName,
                    instagram: credentials.instagramUsername,
                },
            });
        } catch (err: any) {
            setConnectionTest({
                testing: false,
                success: false,
                message: err.message || 'Connection test failed',
            });
        }
    };

    const handleComplete = () => {
        if (onComplete) {
            onComplete(credentials);
        }
    };

    const canProceed = () => {
        switch (currentStep) {
            case 0: return true;
            case 1: return credentials.appId.length > 0 && credentials.appSecret.length > 0;
            case 2: return credentials.accessToken.length > 0;
            case 3: return credentials.facebookPageId.length > 0 || credentials.instagramAccountId.length > 0;
            case 4: return connectionTest.success === true;
            default: return true;
        }
    };

    const renderStepContent = () => {
        switch (currentStep) {
            case 0:
                return (
                    <div className="space-y-6">
                        {/* Welcome Message */}
                        <div className="text-center">
                            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 mb-4">
                                <Instagram className="w-10 h-10 text-white" />
                            </div>
                            <h2 className="text-2xl font-bold text-slate-800 mb-2">
                                Connect Meta (Facebook & Instagram)
                            </h2>
                            <p className="text-slate-600 max-w-md mx-auto">
                                Publish Reels, Stories, and Posts automatically to your Facebook and Instagram accounts.
                            </p>
                        </div>

                        {/* Features */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
                            <div className="p-4 rounded-xl bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-100">
                                <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center mb-3">
                                    <Zap className="w-5 h-5 text-purple-600" />
                                </div>
                                <h3 className="font-semibold text-slate-800 mb-1">Auto-Publish</h3>
                                <p className="text-sm text-slate-600">Automatically post Reels, Stories, and feed content</p>
                            </div>
                            <div className="p-4 rounded-xl bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-100">
                                <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center mb-3">
                                    <BarChart3 className="w-5 h-5 text-blue-600" />
                                </div>
                                <h3 className="font-semibold text-slate-800 mb-1">Analytics</h3>
                                <p className="text-sm text-slate-600">Track impressions, reach, and engagement</p>
                            </div>
                            <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100">
                                <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center mb-3">
                                    <Shield className="w-5 h-5 text-emerald-600" />
                                </div>
                                <h3 className="font-semibold text-slate-800 mb-1">Secure</h3>
                                <p className="text-sm text-slate-600">OAuth 2.0 with encrypted token storage</p>
                            </div>
                        </div>

                        {/* Requirements */}
                        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mt-6">
                            <h4 className="font-semibold text-amber-800 flex items-center gap-2 mb-2">
                                <AlertCircle className="w-4 h-4" />
                                Before you begin
                            </h4>
                            <ul className="text-sm text-amber-700 space-y-1 ml-6 list-disc">
                                <li>You need a <strong>Meta Developer Account</strong></li>
                                <li>A <strong>Facebook Page</strong> that you manage</li>
                                <li>An <strong>Instagram Business/Creator Account</strong> linked to your Page (for Instagram publishing)</li>
                            </ul>
                        </div>
                    </div>
                );

            case 1:
                return (
                    <div className="space-y-6">
                        <div className="text-center mb-6">
                            <h2 className="text-xl font-bold text-slate-800 mb-2">Create or Select Meta App</h2>
                            <p className="text-slate-600">
                                Enter your Meta App credentials from the{' '}
                                <a
                                    href="https://developers.facebook.com/apps/"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-violet-600 hover:text-violet-700 underline"
                                >
                                    Meta Developer Portal
                                </a>
                            </p>
                        </div>

                        {/* Step-by-step Guide */}
                        <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                            <h4 className="font-semibold text-slate-700 mb-3 flex items-center gap-2">
                                <HelpCircle className="w-4 h-4" />
                                Quick Setup Guide
                            </h4>
                            <ol className="space-y-2 text-sm text-slate-600 ml-4 list-decimal">
                                <li>
                                    Go to{' '}
                                    <a
                                        href="https://developers.facebook.com/apps/create/"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-violet-600 hover:underline inline-flex items-center gap-1"
                                    >
                                        Create a Meta App <ExternalLink className="w-3 h-3" />
                                    </a>
                                </li>
                                <li>Select <strong>"Business"</strong> as the app type</li>
                                <li>Add <strong>Facebook Login</strong> and <strong>Instagram Graph API</strong> products</li>
                                <li>Copy your App ID and App Secret from Settings → Basic</li>
                            </ol>
                        </div>

                        {/* Credentials Form */}
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    App ID <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    placeholder="123456789012345"
                                    value={credentials.appId}
                                    onChange={(e) => updateCredential('appId', e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    App Secret <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <input
                                        type={showSecrets['appSecret'] ? 'text' : 'password'}
                                        placeholder="xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                                        value={credentials.appSecret}
                                        onChange={(e) => updateCredential('appSecret', e.target.value)}
                                        className="w-full px-4 py-3 pr-20 rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                                    />
                                    <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                                        <button
                                            onClick={() => copyToClipboard(credentials.appSecret, 'appSecret')}
                                            className="p-2 text-slate-400 hover:text-slate-600"
                                            title="Copy"
                                        >
                                            {copied === 'appSecret' ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                                        </button>
                                        <button
                                            onClick={() => toggleSecret('appSecret')}
                                            className="p-2 text-slate-400 hover:text-slate-600"
                                        >
                                            {showSecrets['appSecret'] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-center pt-4">
                            <a
                                href="https://developers.facebook.com/apps/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm text-violet-600 hover:text-violet-700 flex items-center gap-1"
                            >
                                <ExternalLink className="w-4 h-4" />
                                Open Meta Developer Portal
                            </a>
                        </div>
                    </div>
                );

            case 2:
                return (
                    <div className="space-y-6">
                        <div className="text-center mb-6">
                            <h2 className="text-xl font-bold text-slate-800 mb-2">Generate Access Token</h2>
                            <p className="text-slate-600">
                                Get a User Access Token from the Meta Graph API Explorer
                            </p>
                        </div>

                        {/* Token Generation Guide */}
                        <div className="bg-gradient-to-br from-violet-50 to-fuchsia-50 rounded-xl p-5 border border-violet-200">
                            <h4 className="font-semibold text-violet-800 mb-3 flex items-center gap-2">
                                <Key className="w-5 h-5" />
                                How to Generate Your Token
                            </h4>
                            <ol className="space-y-3 text-sm text-violet-700">
                                <li className="flex items-start gap-3">
                                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-violet-200 text-violet-700 flex items-center justify-center text-xs font-bold">1</span>
                                    <span>
                                        Open the{' '}
                                        <a
                                            href={`https://developers.facebook.com/tools/explorer/?app_id=${credentials.appId || 'YOUR_APP_ID'}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-violet-700 font-semibold hover:underline inline-flex items-center gap-1"
                                        >
                                            Graph API Explorer <ExternalLink className="w-3 h-3" />
                                        </a>
                                    </span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-violet-200 text-violet-700 flex items-center justify-center text-xs font-bold">2</span>
                                    <span>Select your Meta App from the dropdown</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-violet-200 text-violet-700 flex items-center justify-center text-xs font-bold">3</span>
                                    <span>Click <strong>"Add a Permission"</strong> and add these permissions:</span>
                                </li>
                            </ol>

                            {/* Required Permissions */}
                            <div className="mt-4 p-3 bg-white/60 rounded-lg border border-violet-200">
                                <p className="text-xs font-semibold text-violet-800 mb-2">Required Permissions:</p>
                                <div className="flex flex-wrap gap-2">
                                    {[
                                        'pages_show_list',
                                        'pages_read_engagement',
                                        'pages_manage_posts',
                                        'instagram_basic',
                                        'instagram_content_publish',
                                        'instagram_manage_insights',
                                    ].map(permission => (
                                        <span
                                            key={permission}
                                            className="px-2 py-1 bg-violet-100 text-violet-700 rounded text-xs font-mono"
                                        >
                                            {permission}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            <div className="mt-3 flex items-start gap-3">
                                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-violet-200 text-violet-700 flex items-center justify-center text-xs font-bold">4</span>
                                <span className="text-sm text-violet-700">Click <strong>"Generate Access Token"</strong> and copy it below</span>
                            </div>
                        </div>

                        {/* Token Input */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                User Access Token <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <textarea
                                    placeholder="EAAxxxxxxxxxxxx..."
                                    value={credentials.accessToken}
                                    onChange={(e) => updateCredential('accessToken', e.target.value)}
                                    rows={3}
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent font-mono text-sm"
                                />
                            </div>
                            <p className="text-xs text-slate-500 mt-2">
                                💡 Tip: For production, generate a Long-Lived Token (valid for 60 days) from the Access Token Tool
                            </p>
                        </div>

                        {error && (
                            <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700 text-sm">
                                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                                {error}
                            </div>
                        )}
                    </div>
                );

            case 3:
                return (
                    <div className="space-y-6">
                        <div className="text-center mb-6">
                            <h2 className="text-xl font-bold text-slate-800 mb-2">Select Your Accounts</h2>
                            <p className="text-slate-600">
                                Choose which Facebook Page and Instagram account to connect
                            </p>
                        </div>

                        {/* Fetch Pages Button */}
                        {pages.length === 0 && (
                            <div className="text-center py-8 bg-slate-50 rounded-xl border border-slate-200">
                                <p className="text-slate-600 mb-4">
                                    Click the button below to fetch your Facebook Pages
                                </p>
                                <button
                                    onClick={fetchPages}
                                    disabled={loading}
                                    className="px-6 py-3 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-semibold rounded-xl hover:from-violet-500 hover:to-fuchsia-500 transition-all shadow-lg shadow-violet-500/25 flex items-center gap-2 mx-auto disabled:opacity-50"
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                            Fetching Pages...
                                        </>
                                    ) : (
                                        <>
                                            <RefreshCw className="w-5 h-5" />
                                            Fetch My Pages
                                        </>
                                    )}
                                </button>
                            </div>
                        )}

                        {/* Pages List */}
                        {pages.length > 0 && (
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <h4 className="font-semibold text-slate-700">Your Pages</h4>
                                    <button
                                        onClick={fetchPages}
                                        className="text-sm text-violet-600 hover:text-violet-700 flex items-center gap-1"
                                    >
                                        <RefreshCw className="w-4 h-4" />
                                        Refresh
                                    </button>
                                </div>
                                {pages.map(page => (
                                    <button
                                        key={page.id}
                                        onClick={() => selectPage(page)}
                                        className={`w-full p-4 rounded-xl border-2 text-left transition-all ${selectedPage?.id === page.id
                                                ? 'border-violet-500 bg-violet-50'
                                                : 'border-slate-200 bg-white hover:border-violet-300'
                                            }`}
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-start gap-3">
                                                <div className="w-12 h-12 rounded-xl bg-blue-500 flex items-center justify-center">
                                                    <Facebook className="w-6 h-6 text-white" />
                                                </div>
                                                <div>
                                                    <h5 className="font-semibold text-slate-800">{page.name}</h5>
                                                    <p className="text-sm text-slate-500">{page.category}</p>
                                                    {page.instagramBusinessAccount && (
                                                        <div className="mt-2 flex items-center gap-2 text-sm">
                                                            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                                                                <Instagram className="w-3 h-3 text-white" />
                                                            </div>
                                                            <span className="text-slate-600">
                                                                @{page.instagramBusinessAccount.username}
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            {selectedPage?.id === page.id && (
                                                <div className="w-6 h-6 rounded-full bg-violet-500 flex items-center justify-center">
                                                    <Check className="w-4 h-4 text-white" />
                                                </div>
                                            )}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* Manual Entry Option */}
                        <div className="border-t border-slate-200 pt-6">
                            <details className="group">
                                <summary className="cursor-pointer text-sm text-slate-600 hover:text-slate-800 flex items-center gap-2">
                                    <ChevronRight className="w-4 h-4 transition-transform group-open:rotate-90" />
                                    Enter IDs manually
                                </summary>
                                <div className="mt-4 space-y-4 pl-6">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">
                                            Facebook Page ID
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="123456789012345"
                                            value={credentials.facebookPageId}
                                            onChange={(e) => updateCredential('facebookPageId', e.target.value)}
                                            className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">
                                            Instagram Business Account ID
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="17841400XXXXXXXX"
                                            value={credentials.instagramAccountId}
                                            onChange={(e) => updateCredential('instagramAccountId', e.target.value)}
                                            className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                                        />
                                    </div>
                                </div>
                            </details>
                        </div>

                        {error && (
                            <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700 text-sm">
                                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                                {error}
                            </div>
                        )}
                    </div>
                );

            case 4:
                return (
                    <div className="space-y-6">
                        <div className="text-center mb-6">
                            <h2 className="text-xl font-bold text-slate-800 mb-2">Verify Connection</h2>
                            <p className="text-slate-600">
                                Test your connection before saving
                            </p>
                        </div>

                        {/* Connection Summary */}
                        <div className="bg-slate-50 rounded-xl p-5 border border-slate-200 space-y-4">
                            <h4 className="font-semibold text-slate-700">Connection Summary</h4>

                            <div className="grid gap-3">
                                <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-slate-200">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                                            <Facebook className="w-5 h-5 text-blue-600" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-slate-800">Facebook Page</p>
                                            <p className="text-xs text-slate-500">
                                                {credentials.facebookPageName || credentials.facebookPageId || 'Not configured'}
                                            </p>
                                        </div>
                                    </div>
                                    {credentials.facebookPageId ? (
                                        <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                                    ) : (
                                        <X className="w-5 h-5 text-slate-300" />
                                    )}
                                </div>

                                <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-slate-200">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center">
                                            <Instagram className="w-5 h-5 text-pink-600" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-slate-800">Instagram Account</p>
                                            <p className="text-xs text-slate-500">
                                                {credentials.instagramUsername ? `@${credentials.instagramUsername}` : credentials.instagramAccountId || 'Not configured'}
                                            </p>
                                        </div>
                                    </div>
                                    {credentials.instagramAccountId ? (
                                        <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                                    ) : (
                                        <X className="w-5 h-5 text-slate-300" />
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Test Connection Button */}
                        <div className="text-center">
                            <button
                                onClick={testConnection}
                                disabled={connectionTest.testing}
                                className="px-8 py-4 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-semibold rounded-xl hover:from-violet-500 hover:to-fuchsia-500 transition-all shadow-lg shadow-violet-500/25 flex items-center gap-2 mx-auto disabled:opacity-50"
                            >
                                {connectionTest.testing ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        Testing Connection...
                                    </>
                                ) : (
                                    <>
                                        <Link2 className="w-5 h-5" />
                                        Test Connection
                                    </>
                                )}
                            </button>
                        </div>

                        {/* Connection Result */}
                        {connectionTest.success !== undefined && (
                            <div className={`p-4 rounded-xl border ${connectionTest.success
                                    ? 'bg-emerald-50 border-emerald-200'
                                    : 'bg-red-50 border-red-200'
                                }`}>
                                <div className="flex items-start gap-3">
                                    {connectionTest.success ? (
                                        <CheckCircle2 className="w-6 h-6 text-emerald-500 flex-shrink-0" />
                                    ) : (
                                        <AlertCircle className="w-6 h-6 text-red-500 flex-shrink-0" />
                                    )}
                                    <div>
                                        <p className={`font-semibold ${connectionTest.success ? 'text-emerald-800' : 'text-red-800'}`}>
                                            {connectionTest.success ? 'Connection Successful!' : 'Connection Failed'}
                                        </p>
                                        <p className={`text-sm mt-1 ${connectionTest.success ? 'text-emerald-700' : 'text-red-700'}`}>
                                            {connectionTest.message}
                                        </p>
                                        {connectionTest.details && (
                                            <div className="mt-3 text-sm text-emerald-700">
                                                <p>✓ User: {connectionTest.details.user}</p>
                                                {connectionTest.details.page && <p>✓ Page: {connectionTest.details.page}</p>}
                                                {connectionTest.details.instagram && <p>✓ Instagram: @{connectionTest.details.instagram}</p>}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-slate-200 bg-gradient-to-r from-violet-50 to-fuchsia-50">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400">
                            <Instagram className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="font-bold text-slate-800">Meta Integration Setup</h1>
                            <p className="text-xs text-slate-500">Facebook & Instagram</p>
                        </div>
                    </div>
                    <button
                        onClick={onCancel}
                        className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5 text-slate-500" />
                    </button>
                </div>

                {/* Progress Steps */}
                <div className="px-6 py-4 bg-slate-50 border-b border-slate-200">
                    <div className="flex items-center justify-between">
                        {STEPS.map((step, index) => {
                            const StepIcon = step.icon;
                            const isActive = index === currentStep;
                            const isCompleted = index < currentStep;

                            return (
                                <div key={step.id} className="flex items-center">
                                    <div className={`flex items-center gap-2 ${isActive ? 'text-violet-600' : isCompleted ? 'text-emerald-600' : 'text-slate-400'
                                        }`}>
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isActive
                                                ? 'bg-violet-100 ring-2 ring-violet-500'
                                                : isCompleted
                                                    ? 'bg-emerald-100'
                                                    : 'bg-slate-100'
                                            }`}>
                                            {isCompleted ? (
                                                <Check className="w-4 h-4" />
                                            ) : (
                                                <StepIcon className="w-4 h-4" />
                                            )}
                                        </div>
                                        <span className={`text-xs font-medium hidden sm:block ${isActive ? 'text-violet-600' : isCompleted ? 'text-emerald-600' : 'text-slate-400'
                                            }`}>
                                            {step.title}
                                        </span>
                                    </div>
                                    {index < STEPS.length - 1 && (
                                        <div className={`w-8 sm:w-12 h-0.5 mx-2 ${isCompleted ? 'bg-emerald-300' : 'bg-slate-200'
                                            }`} />
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    {renderStepContent()}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between p-6 border-t border-slate-200 bg-slate-50">
                    <button
                        onClick={() => setCurrentStep(prev => Math.max(0, prev - 1))}
                        disabled={currentStep === 0}
                        className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        <ChevronLeft className="w-4 h-4" />
                        Back
                    </button>

                    {currentStep < STEPS.length - 1 ? (
                        <button
                            onClick={() => setCurrentStep(prev => prev + 1)}
                            disabled={!canProceed()}
                            className="px-6 py-3 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-semibold rounded-xl hover:from-violet-500 hover:to-fuchsia-500 transition-all shadow-lg shadow-violet-500/25 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Continue
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    ) : (
                        <button
                            onClick={handleComplete}
                            disabled={!connectionTest.success}
                            className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold rounded-xl hover:from-emerald-500 hover:to-teal-500 transition-all shadow-lg shadow-emerald-500/25 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <CheckCircle2 className="w-5 h-5" />
                            Complete Setup
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
