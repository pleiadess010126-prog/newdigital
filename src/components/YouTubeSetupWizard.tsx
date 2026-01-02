'use client';

import { useState, useEffect } from 'react';
import {
    Youtube, ChevronRight, ChevronLeft, Check, X,
    ExternalLink, Copy, Eye, EyeOff, Loader2, AlertCircle,
    CheckCircle2, HelpCircle, Sparkles, Shield, Zap, RefreshCw,
    ArrowRight, Key, Link2, Users, BarChart3, Play, Video
} from 'lucide-react';

interface YouTubeSetupWizardProps {
    onComplete?: (credentials: YouTubeCredentials) => void;
    onCancel?: () => void;
    existingCredentials?: Partial<YouTubeCredentials>;
}

interface YouTubeCredentials {
    apiKey: string;
    clientId: string;
    clientSecret: string;
    accessToken: string;
    refreshToken: string;
    channelId: string;
    channelName?: string;
}

interface ChannelInfo {
    id: string;
    title: string;
    description: string;
    thumbnailUrl?: string;
    subscriberCount?: string;
    videoCount?: string;
}

const STEPS = [
    { id: 'intro', title: 'Get Started', icon: Sparkles },
    { id: 'project', title: 'Google Cloud', icon: Key },
    { id: 'oauth', title: 'OAuth Setup', icon: Shield },
    { id: 'channel', title: 'Select Channel', icon: Video },
    { id: 'verify', title: 'Verify & Save', icon: CheckCircle2 },
];

export default function YouTubeSetupWizard({
    onComplete,
    onCancel,
    existingCredentials
}: YouTubeSetupWizardProps) {
    const [currentStep, setCurrentStep] = useState(0);
    const [credentials, setCredentials] = useState<YouTubeCredentials>({
        apiKey: existingCredentials?.apiKey || '',
        clientId: existingCredentials?.clientId || '',
        clientSecret: existingCredentials?.clientSecret || '',
        accessToken: existingCredentials?.accessToken || '',
        refreshToken: existingCredentials?.refreshToken || '',
        channelId: existingCredentials?.channelId || '',
        channelName: existingCredentials?.channelName || '',
    });

    const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [channels, setChannels] = useState<ChannelInfo[]>([]);
    const [selectedChannel, setSelectedChannel] = useState<ChannelInfo | null>(null);
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

    const updateCredential = (field: keyof YouTubeCredentials, value: string) => {
        setCredentials(prev => ({ ...prev, [field]: value }));
        setError('');
    };

    const fetchChannels = async () => {
        if (!credentials.accessToken) {
            setError('Please enter an access token first');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const response = await fetch(
                `https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics&mine=true`,
                {
                    headers: {
                        Authorization: `Bearer ${credentials.accessToken}`,
                    },
                }
            );

            const data = await response.json();

            if (data.error) {
                setError(data.error.message || 'Failed to fetch channels');
                return;
            }

            if (!data.items || data.items.length === 0) {
                setError('No YouTube channels found for this account.');
                return;
            }

            setChannels(data.items.map((channel: any) => ({
                id: channel.id,
                title: channel.snippet.title,
                description: channel.snippet.description,
                thumbnailUrl: channel.snippet.thumbnails?.default?.url,
                subscriberCount: channel.statistics?.subscriberCount,
                videoCount: channel.statistics?.videoCount,
            })));
        } catch (err: any) {
            setError(err.message || 'Failed to fetch channels');
        } finally {
            setLoading(false);
        }
    };

    const selectChannel = (channel: ChannelInfo) => {
        setSelectedChannel(channel);
        setCredentials(prev => ({
            ...prev,
            channelId: channel.id,
            channelName: channel.title,
        }));
    };

    const testConnection = async () => {
        setConnectionTest({ testing: true });

        try {
            // Test the API key by checking quota
            const apiKeyResponse = await fetch(
                `https://www.googleapis.com/youtube/v3/channels?part=snippet&id=${credentials.channelId}&key=${credentials.apiKey}`
            );
            const apiKeyData = await apiKeyResponse.json();

            if (apiKeyData.error) {
                setConnectionTest({
                    testing: false,
                    success: false,
                    message: apiKeyData.error.message || 'API Key validation failed',
                });
                return;
            }

            // Test access token by fetching channel info
            const tokenResponse = await fetch(
                `https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics&id=${credentials.channelId}`,
                {
                    headers: {
                        Authorization: `Bearer ${credentials.accessToken}`,
                    },
                }
            );

            const tokenData = await tokenResponse.json();

            if (tokenData.error) {
                setConnectionTest({
                    testing: false,
                    success: false,
                    message: 'Access token is invalid or expired',
                });
                return;
            }

            if (!tokenData.items || tokenData.items.length === 0) {
                setConnectionTest({
                    testing: false,
                    success: false,
                    message: 'Channel not found',
                });
                return;
            }

            const channel = tokenData.items[0];
            setConnectionTest({
                testing: false,
                success: true,
                message: 'All connections verified successfully!',
                details: {
                    channelName: channel.snippet.title,
                    subscribers: formatNumber(channel.statistics.subscriberCount),
                    videos: channel.statistics.videoCount,
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

    const formatNumber = (num: string) => {
        const n = parseInt(num);
        if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
        if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
        return num;
    };

    const handleComplete = () => {
        if (onComplete) {
            onComplete(credentials);
        }
    };

    const canProceed = () => {
        switch (currentStep) {
            case 0: return true;
            case 1: return credentials.apiKey.length > 0;
            case 2: return credentials.accessToken.length > 0;
            case 3: return credentials.channelId.length > 0;
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
                            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-red-500 to-red-700 mb-4">
                                <Youtube className="w-10 h-10 text-white" />
                            </div>
                            <h2 className="text-2xl font-bold text-slate-800 mb-2">
                                Connect YouTube
                            </h2>
                            <p className="text-slate-600 max-w-md mx-auto">
                                Publish YouTube Shorts and Videos automatically to your YouTube channel.
                            </p>
                        </div>

                        {/* Features */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
                            <div className="p-4 rounded-xl bg-gradient-to-br from-red-50 to-orange-50 border border-red-100">
                                <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center mb-3">
                                    <Play className="w-5 h-5 text-red-600" />
                                </div>
                                <h3 className="font-semibold text-slate-800 mb-1">Auto-Publish</h3>
                                <p className="text-sm text-slate-600">Automatically upload Shorts and Videos</p>
                            </div>
                            <div className="p-4 rounded-xl bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-100">
                                <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center mb-3">
                                    <BarChart3 className="w-5 h-5 text-blue-600" />
                                </div>
                                <h3 className="font-semibold text-slate-800 mb-1">Analytics</h3>
                                <p className="text-sm text-slate-600">Track views, subscribers, and engagement</p>
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
                                <li>You need a <strong>Google Cloud Console</strong> account</li>
                                <li>A <strong>YouTube channel</strong> that you own or manage</li>
                                <li>Enable the <strong>YouTube Data API v3</strong> in your Google Cloud project</li>
                            </ul>
                        </div>
                    </div>
                );

            case 1:
                return (
                    <div className="space-y-6">
                        <div className="text-center mb-6">
                            <h2 className="text-xl font-bold text-slate-800 mb-2">Set Up Google Cloud Project</h2>
                            <p className="text-slate-600">
                                Create an API key in the{' '}
                                <a
                                    href="https://console.cloud.google.com/apis/credentials"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-red-600 hover:text-red-700 underline"
                                >
                                    Google Cloud Console
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
                                        href="https://console.cloud.google.com/projectcreate"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-red-600 hover:underline inline-flex items-center gap-1"
                                    >
                                        Create a Google Cloud Project <ExternalLink className="w-3 h-3" />
                                    </a>
                                </li>
                                <li>
                                    Enable the{' '}
                                    <a
                                        href="https://console.cloud.google.com/apis/library/youtube.googleapis.com"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-red-600 hover:underline inline-flex items-center gap-1"
                                    >
                                        YouTube Data API v3 <ExternalLink className="w-3 h-3" />
                                    </a>
                                </li>
                                <li>Go to <strong>APIs & Services → Credentials</strong></li>
                                <li>Click <strong>"Create Credentials" → "API Key"</strong></li>
                                <li>Copy the API key and paste it below</li>
                            </ol>
                        </div>

                        {/* Credentials Form */}
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    API Key <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <input
                                        type={showSecrets['apiKey'] ? 'text' : 'password'}
                                        placeholder="AIzaSy..."
                                        value={credentials.apiKey}
                                        onChange={(e) => updateCredential('apiKey', e.target.value)}
                                        className="w-full px-4 py-3 pr-20 rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                    />
                                    <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                                        <button
                                            onClick={() => copyToClipboard(credentials.apiKey, 'apiKey')}
                                            className="p-2 text-slate-400 hover:text-slate-600"
                                            title="Copy"
                                        >
                                            {copied === 'apiKey' ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                                        </button>
                                        <button
                                            onClick={() => toggleSecret('apiKey')}
                                            className="p-2 text-slate-400 hover:text-slate-600"
                                        >
                                            {showSecrets['apiKey'] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Optional: OAuth Credentials */}
                            <div className="border-t border-slate-200 pt-4">
                                <details className="group">
                                    <summary className="cursor-pointer text-sm text-slate-600 hover:text-slate-800 flex items-center gap-2 font-medium">
                                        <ChevronRight className="w-4 h-4 transition-transform group-open:rotate-90" />
                                        Advanced: OAuth Client Credentials (Optional)
                                    </summary>
                                    <div className="mt-4 space-y-4 pl-6">
                                        <p className="text-xs text-slate-500">
                                            Only needed if you want to use OAuth flow for enhanced permissions
                                        </p>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                                Client ID
                                            </label>
                                            <input
                                                type="text"
                                                placeholder="xxxx.apps.googleusercontent.com"
                                                value={credentials.clientId}
                                                onChange={(e) => updateCredential('clientId', e.target.value)}
                                                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                                Client Secret
                                            </label>
                                            <div className="relative">
                                                <input
                                                    type={showSecrets['clientSecret'] ? 'text' : 'password'}
                                                    placeholder="GOCSPX-..."
                                                    value={credentials.clientSecret}
                                                    onChange={(e) => updateCredential('clientSecret', e.target.value)}
                                                    className="w-full px-4 py-3 pr-12 rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                                />
                                                <button
                                                    onClick={() => toggleSecret('clientSecret')}
                                                    className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-slate-400 hover:text-slate-600"
                                                >
                                                    {showSecrets['clientSecret'] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </details>
                            </div>
                        </div>

                        <div className="flex items-center justify-center pt-4">
                            <a
                                href="https://console.cloud.google.com/apis/credentials"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm text-red-600 hover:text-red-700 flex items-center gap-1"
                            >
                                <ExternalLink className="w-4 h-4" />
                                Open Google Cloud Console
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
                                Get an OAuth 2.0 access token to authenticate with YouTube
                            </p>
                        </div>

                        {/* Token Generation Guide */}
                        <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-xl p-5 border border-red-200">
                            <h4 className="font-semibold text-red-800 mb-3 flex items-center gap-2">
                                <Key className="w-5 h-5" />
                                How to Generate Your Token
                            </h4>
                            <ol className="space-y-3 text-sm text-red-700">
                                <li className="flex items-start gap-3">
                                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-red-200 text-red-700 flex items-center justify-center text-xs font-bold">1</span>
                                    <span>
                                        Open the{' '}
                                        <a
                                            href="https://developers.google.com/oauthplayground/"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-red-700 font-semibold hover:underline inline-flex items-center gap-1"
                                        >
                                            OAuth 2.0 Playground <ExternalLink className="w-3 h-3" />
                                        </a>
                                    </span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-red-200 text-red-700 flex items-center justify-center text-xs font-bold">2</span>
                                    <span>Click the gear icon ⚙️ and check <strong>"Use your own OAuth credentials"</strong></span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-red-200 text-red-700 flex items-center justify-center text-xs font-bold">3</span>
                                    <span>Select the YouTube Data API v3 scopes:</span>
                                </li>
                            </ol>

                            {/* Required Scopes */}
                            <div className="mt-4 p-3 bg-white/60 rounded-lg border border-red-200">
                                <p className="text-xs font-semibold text-red-800 mb-2">Required Scopes:</p>
                                <div className="flex flex-wrap gap-2">
                                    {[
                                        'youtube.upload',
                                        'youtube.readonly',
                                        'youtube.force-ssl',
                                        'youtubepartner',
                                    ].map(scope => (
                                        <span
                                            key={scope}
                                            className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs font-mono"
                                        >
                                            {scope}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            <div className="mt-3 space-y-2">
                                <div className="flex items-start gap-3">
                                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-red-200 text-red-700 flex items-center justify-center text-xs font-bold">4</span>
                                    <span className="text-sm text-red-700">Click <strong>"Authorize APIs"</strong> and sign in with your YouTube account</span>
                                </div>
                                <div className="flex items-start gap-3">
                                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-red-200 text-red-700 flex items-center justify-center text-xs font-bold">5</span>
                                    <span className="text-sm text-red-700">Click <strong>"Exchange authorization code for tokens"</strong></span>
                                </div>
                                <div className="flex items-start gap-3">
                                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-red-200 text-red-700 flex items-center justify-center text-xs font-bold">6</span>
                                    <span className="text-sm text-red-700">Copy the <strong>Access Token</strong> and paste it below</span>
                                </div>
                            </div>
                        </div>

                        {/* Token Input */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Access Token <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <textarea
                                    placeholder="ya29.a0Af..."
                                    value={credentials.accessToken}
                                    onChange={(e) => updateCredential('accessToken', e.target.value)}
                                    rows={3}
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent font-mono text-sm"
                                />
                            </div>
                            <p className="text-xs text-slate-500 mt-2">
                                💡 Tip: Access tokens expire after 1 hour. For long-term use, also save the Refresh Token
                            </p>
                        </div>

                        {/* Refresh Token (Optional) */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Refresh Token <span className="text-slate-400">(Recommended)</span>
                            </label>
                            <div className="relative">
                                <textarea
                                    placeholder="1//0e..."
                                    value={credentials.refreshToken}
                                    onChange={(e) => updateCredential('refreshToken', e.target.value)}
                                    rows={2}
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent font-mono text-sm"
                                />
                            </div>
                            <p className="text-xs text-slate-500 mt-2">
                                The refresh token allows us to automatically get new access tokens
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
                            <h2 className="text-xl font-bold text-slate-800 mb-2">Select Your Channel</h2>
                            <p className="text-slate-600">
                                Choose which YouTube channel to connect
                            </p>
                        </div>

                        {/* Fetch Channels Button */}
                        {channels.length === 0 && (
                            <div className="text-center py-8 bg-slate-50 rounded-xl border border-slate-200">
                                <p className="text-slate-600 mb-4">
                                    Click the button below to fetch your YouTube channels
                                </p>
                                <button
                                    onClick={fetchChannels}
                                    disabled={loading}
                                    className="px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white font-semibold rounded-xl hover:from-red-500 hover:to-red-600 transition-all shadow-lg shadow-red-500/25 flex items-center gap-2 mx-auto disabled:opacity-50"
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                            Fetching Channels...
                                        </>
                                    ) : (
                                        <>
                                            <RefreshCw className="w-5 h-5" />
                                            Fetch My Channels
                                        </>
                                    )}
                                </button>
                            </div>
                        )}

                        {/* Channels List */}
                        {channels.length > 0 && (
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <h4 className="font-semibold text-slate-700">Your Channels</h4>
                                    <button
                                        onClick={fetchChannels}
                                        className="text-sm text-red-600 hover:text-red-700 flex items-center gap-1"
                                    >
                                        <RefreshCw className="w-4 h-4" />
                                        Refresh
                                    </button>
                                </div>
                                {channels.map(channel => (
                                    <button
                                        key={channel.id}
                                        onClick={() => selectChannel(channel)}
                                        className={`w-full p-4 rounded-xl border-2 text-left transition-all ${selectedChannel?.id === channel.id
                                            ? 'border-red-500 bg-red-50'
                                            : 'border-slate-200 bg-white hover:border-red-300'
                                            }`}
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-start gap-3">
                                                {channel.thumbnailUrl ? (
                                                    <img
                                                        src={channel.thumbnailUrl}
                                                        alt={channel.title}
                                                        className="w-12 h-12 rounded-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-12 h-12 rounded-full bg-red-500 flex items-center justify-center">
                                                        <Youtube className="w-6 h-6 text-white" />
                                                    </div>
                                                )}
                                                <div>
                                                    <h5 className="font-semibold text-slate-800">{channel.title}</h5>
                                                    <p className="text-sm text-slate-500 line-clamp-1">{channel.description || 'No description'}</p>
                                                    <div className="mt-2 flex items-center gap-4 text-xs text-slate-500">
                                                        {channel.subscriberCount && (
                                                            <span className="flex items-center gap-1">
                                                                <Users className="w-3 h-3" />
                                                                {formatNumber(channel.subscriberCount)} subscribers
                                                            </span>
                                                        )}
                                                        {channel.videoCount && (
                                                            <span className="flex items-center gap-1">
                                                                <Video className="w-3 h-3" />
                                                                {channel.videoCount} videos
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                            {selectedChannel?.id === channel.id && (
                                                <div className="w-6 h-6 rounded-full bg-red-500 flex items-center justify-center">
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
                                    Enter Channel ID manually
                                </summary>
                                <div className="mt-4 space-y-4 pl-6">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">
                                            Channel ID
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="UCxxxxxxxxxxxxxxxxxxxxxx"
                                            value={credentials.channelId}
                                            onChange={(e) => updateCredential('channelId', e.target.value)}
                                            className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                        />
                                        <p className="text-xs text-slate-500 mt-2">
                                            Find your Channel ID at{' '}
                                            <a
                                                href="https://www.youtube.com/account_advanced"
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-red-600 hover:underline"
                                            >
                                                YouTube Advanced Settings
                                            </a>
                                        </p>
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
                                        <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
                                            <Key className="w-5 h-5 text-red-600" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-slate-800">API Key</p>
                                            <p className="text-xs text-slate-500 font-mono">
                                                {credentials.apiKey ? `${credentials.apiKey.slice(0, 10)}...` : 'Not configured'}
                                            </p>
                                        </div>
                                    </div>
                                    {credentials.apiKey ? (
                                        <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                                    ) : (
                                        <X className="w-5 h-5 text-slate-300" />
                                    )}
                                </div>

                                <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-slate-200">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                                            <Shield className="w-5 h-5 text-amber-600" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-slate-800">Access Token</p>
                                            <p className="text-xs text-slate-500 font-mono">
                                                {credentials.accessToken ? `${credentials.accessToken.slice(0, 15)}...` : 'Not configured'}
                                            </p>
                                        </div>
                                    </div>
                                    {credentials.accessToken ? (
                                        <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                                    ) : (
                                        <X className="w-5 h-5 text-slate-300" />
                                    )}
                                </div>

                                <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-slate-200">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
                                            <Youtube className="w-5 h-5 text-red-600" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-slate-800">YouTube Channel</p>
                                            <p className="text-xs text-slate-500">
                                                {credentials.channelName || credentials.channelId || 'Not configured'}
                                            </p>
                                        </div>
                                    </div>
                                    {credentials.channelId ? (
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
                                className="px-8 py-4 bg-gradient-to-r from-red-600 to-red-700 text-white font-semibold rounded-xl hover:from-red-500 hover:to-red-600 transition-all shadow-lg shadow-red-500/25 flex items-center gap-2 mx-auto disabled:opacity-50"
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
                                                <p>✓ Channel: {connectionTest.details.channelName}</p>
                                                {connectionTest.details.subscribers && <p>✓ Subscribers: {connectionTest.details.subscribers}</p>}
                                                {connectionTest.details.videos && <p>✓ Videos: {connectionTest.details.videos}</p>}
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
                <div className="flex items-center justify-between p-6 border-b border-slate-200 bg-gradient-to-r from-red-50 to-orange-50">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-gradient-to-br from-red-500 to-red-700">
                            <Youtube className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="font-bold text-slate-800">YouTube Integration Setup</h1>
                            <p className="text-xs text-slate-500">Connect your YouTube channel</p>
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
                                    <div className={`flex items-center gap-2 ${isActive ? 'text-red-600' : isCompleted ? 'text-emerald-600' : 'text-slate-400'
                                        }`}>
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isActive
                                            ? 'bg-red-100 ring-2 ring-red-500'
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
                                        <span className={`text-xs font-medium hidden sm:block ${isActive ? 'text-red-600' : isCompleted ? 'text-emerald-600' : 'text-slate-400'
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
                            className="px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white font-semibold rounded-xl hover:from-red-500 hover:to-red-600 transition-all shadow-lg shadow-red-500/25 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
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
