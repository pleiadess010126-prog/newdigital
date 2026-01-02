'use client';

import { useState } from 'react';
import {
    Shield, Globe, Youtube, Instagram, Facebook, Key,
    Eye, EyeOff, CheckCircle2, AlertCircle, Loader2,
    ExternalLink, RefreshCw, Sparkles, Wand2
} from 'lucide-react';
import MetaSetupWizard from './MetaSetupWizard';
import YouTubeSetupWizard from './YouTubeSetupWizard';

interface PlatformCredential {
    wordpress?: {
        url: string;
        username: string;
        appPassword: string;
    };
    meta?: {
        appId: string;
        appSecret: string;
        accessToken: string;
        instagramAccountId: string;
        facebookPageId: string;
    };
    youtube?: {
        apiKey: string;
        clientId?: string;
        clientSecret?: string;
        accessToken: string;
        refreshToken?: string;
        channelId: string;
        channelName?: string;
    };
    googleSearchConsole?: {
        siteUrl: string;
        serviceAccountKey: string;
    };
}

interface ConnectionStatus {
    platform: string;
    status: 'connected' | 'disconnected' | 'checking' | 'error';
    message?: string;
    lastChecked?: Date;
}

export default function CredentialsSettings() {
    const [credentials, setCredentials] = useState<PlatformCredential>({
        wordpress: { url: '', username: '', appPassword: '' },
        meta: { appId: '', appSecret: '', accessToken: '', instagramAccountId: '', facebookPageId: '' },
        youtube: { apiKey: '', accessToken: '', channelId: '', channelName: '' },
        googleSearchConsole: { siteUrl: '', serviceAccountKey: '' },
    });

    const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({});
    const [saving, setSaving] = useState(false);
    const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [connectionStatuses, setConnectionStatuses] = useState<ConnectionStatus[]>([
        { platform: 'wordpress', status: 'disconnected' },
        { platform: 'meta', status: 'disconnected' },
        { platform: 'youtube', status: 'disconnected' },
        { platform: 'googleSearchConsole', status: 'disconnected' },
    ]);
    const [showMetaWizard, setShowMetaWizard] = useState(false);
    const [showYouTubeWizard, setShowYouTubeWizard] = useState(false);

    const toggleShowSecret = (field: string) => {
        setShowSecrets(prev => ({ ...prev, [field]: !prev[field] }));
    };

    const updateCredential = (platform: keyof PlatformCredential, field: string, value: string) => {
        setCredentials(prev => ({
            ...prev,
            [platform]: {
                ...(prev[platform] || {}),
                [field]: value,
            },
        }));
    };

    const testConnection = async (platform: string) => {
        // Update status to checking
        setConnectionStatuses(prev =>
            prev.map(s => s.platform === platform ? { ...s, status: 'checking' as const } : s)
        );

        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));

        // Check if credentials are provided
        const cred = credentials[platform as keyof PlatformCredential];
        const hasCredentials = cred && Object.values(cred).some(v => v && v.length > 0);

        setConnectionStatuses(prev =>
            prev.map(s => s.platform === platform ? {
                ...s,
                status: hasCredentials ? 'connected' : 'disconnected',
                message: hasCredentials ? 'Connection successful' : 'No credentials provided',
                lastChecked: new Date(),
            } : s)
        );
    };

    const handleMetaWizardComplete = (metaCredentials: any) => {
        setCredentials(prev => ({
            ...prev,
            meta: {
                appId: metaCredentials.appId,
                appSecret: metaCredentials.appSecret,
                accessToken: metaCredentials.accessToken,
                instagramAccountId: metaCredentials.instagramAccountId,
                facebookPageId: metaCredentials.facebookPageId,
            },
        }));
        setConnectionStatuses(prev =>
            prev.map(s => s.platform === 'meta' ? {
                ...s,
                status: 'connected',
                message: `Connected to ${metaCredentials.instagramUsername ? '@' + metaCredentials.instagramUsername : metaCredentials.facebookPageName || 'Meta'}`,
                lastChecked: new Date(),
            } : s)
        );
        setShowMetaWizard(false);
    };

    const handleYouTubeWizardComplete = (youtubeCredentials: any) => {
        setCredentials(prev => ({
            ...prev,
            youtube: {
                apiKey: youtubeCredentials.apiKey,
                clientId: youtubeCredentials.clientId,
                clientSecret: youtubeCredentials.clientSecret,
                accessToken: youtubeCredentials.accessToken,
                refreshToken: youtubeCredentials.refreshToken,
                channelId: youtubeCredentials.channelId,
                channelName: youtubeCredentials.channelName,
            },
        }));
        setConnectionStatuses(prev =>
            prev.map(s => s.platform === 'youtube' ? {
                ...s,
                status: 'connected',
                message: `Connected to ${youtubeCredentials.channelName || 'YouTube'}`,
                lastChecked: new Date(),
            } : s)
        );
        setShowYouTubeWizard(false);
    };

    const handleSave = async () => {
        setSaving(true);
        setSaveStatus('idle');

        try {
            // Simulate API save call
            await new Promise(resolve => setTimeout(resolve, 1000));

            // In production, this would save to the database
            console.log('Saving credentials:', credentials);

            setSaveStatus('success');
            setTimeout(() => setSaveStatus('idle'), 3000);
        } catch (error) {
            setSaveStatus('error');
        } finally {
            setSaving(false);
        }
    };

    const getStatusIcon = (status: ConnectionStatus['status']) => {
        switch (status) {
            case 'connected':
                return <CheckCircle2 className="w-5 h-5 text-emerald-500" />;
            case 'checking':
                return <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />;
            case 'error':
                return <AlertCircle className="w-5 h-5 text-red-500" />;
            default:
                return <div className="w-5 h-5 rounded-full bg-slate-300" />;
        }
    };

    const getStatusBadge = (status: ConnectionStatus['status']) => {
        const styles = {
            connected: 'bg-emerald-100 text-emerald-700 border-emerald-200',
            checking: 'bg-blue-100 text-blue-700 border-blue-200',
            error: 'bg-red-100 text-red-700 border-red-200',
            disconnected: 'bg-slate-100 text-slate-600 border-slate-200',
        };
        return styles[status];
    };

    return (
        <>
            <div className="space-y-6">
                {/* Header */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-slate-200 bg-gradient-to-r from-violet-50 to-fuchsia-50">
                        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                            <Key className="w-5 h-5 text-violet-600" />
                            API Credentials & Integrations
                        </h2>
                        <p className="text-sm text-slate-500 mt-1">
                            Securely connect your platforms to enable publishing and analytics
                        </p>
                    </div>

                    {/* Security Notice */}
                    <div className="p-4 bg-amber-50 border-b border-amber-100 flex items-start gap-3">
                        <Shield className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                        <div>
                            <p className="text-sm text-amber-800 font-medium">Your credentials are encrypted</p>
                            <p className="text-xs text-amber-600 mt-0.5">
                                All API keys and secrets are encrypted at rest and in transit. Never share your credentials.
                            </p>
                        </div>
                    </div>
                </div>

                {/* WordPress Integration */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-slate-200">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-3 rounded-xl bg-blue-500">
                                    <Globe className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-800">WordPress</h3>
                                    <p className="text-sm text-slate-500">Publish blog posts to your WordPress site</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                {getStatusIcon(connectionStatuses.find(s => s.platform === 'wordpress')?.status || 'disconnected')}
                                <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusBadge(connectionStatuses.find(s => s.platform === 'wordpress')?.status || 'disconnected')}`}>
                                    {connectionStatuses.find(s => s.platform === 'wordpress')?.status}
                                </span>
                            </div>
                        </div>
                    </div>
                    <div className="p-6 space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">WordPress Site URL</label>
                            <input
                                type="url"
                                placeholder="https://your-site.com"
                                value={credentials.wordpress?.url || ''}
                                onChange={(e) => updateCredential('wordpress', 'url', e.target.value)}
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Username</label>
                                <input
                                    type="text"
                                    placeholder="admin"
                                    value={credentials.wordpress?.username || ''}
                                    onChange={(e) => updateCredential('wordpress', 'username', e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">App Password</label>
                                <div className="relative">
                                    <input
                                        type={showSecrets['wp-password'] ? 'text' : 'password'}
                                        placeholder="xxxx xxxx xxxx xxxx"
                                        value={credentials.wordpress?.appPassword || ''}
                                        onChange={(e) => updateCredential('wordpress', 'appPassword', e.target.value)}
                                        className="w-full px-4 py-3 pr-12 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                                    />
                                    <button
                                        onClick={() => toggleShowSecret('wp-password')}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                    >
                                        {showSecrets['wp-password'] ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                            <a
                                href="https://wordpress.org/documentation/article/application-passwords/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm text-violet-600 hover:text-violet-700 flex items-center gap-1"
                            >
                                <ExternalLink className="w-4 h-4" />
                                How to create an App Password
                            </a>
                            <button
                                onClick={() => testConnection('wordpress')}
                                className="px-4 py-2 rounded-lg bg-slate-100 text-slate-700 font-medium hover:bg-slate-200 flex items-center gap-2"
                            >
                                <RefreshCw className="w-4 h-4" />
                                Test Connection
                            </button>
                        </div>
                    </div>
                </div>

                {/* Meta (Facebook/Instagram) Integration */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-slate-200">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500">
                                    <Instagram className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-800">Meta (Facebook & Instagram)</h3>
                                    <p className="text-sm text-slate-500">Publish to Facebook and Instagram via Graph API</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                {getStatusIcon(connectionStatuses.find(s => s.platform === 'meta')?.status || 'disconnected')}
                                <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusBadge(connectionStatuses.find(s => s.platform === 'meta')?.status || 'disconnected')}`}>
                                    {connectionStatuses.find(s => s.platform === 'meta')?.status}
                                </span>
                            </div>
                        </div>
                    </div>
                    <div className="p-6 space-y-4">
                        {/* Quick Setup with Wizard */}
                        <div className="bg-gradient-to-r from-violet-50 via-fuchsia-50 to-pink-50 rounded-xl p-4 border border-violet-200">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-500">
                                        <Wand2 className="w-5 h-5 text-white" />
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-slate-800">Easy Setup Wizard</h4>
                                        <p className="text-xs text-slate-600">Step-by-step guide to connect your Meta accounts</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setShowMetaWizard(true)}
                                    className="px-4 py-2 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-medium rounded-lg hover:from-violet-500 hover:to-fuchsia-500 transition-all shadow-md shadow-violet-500/25 flex items-center gap-2 text-sm"
                                >
                                    <Sparkles className="w-4 h-4" />
                                    Start Setup
                                </button>
                            </div>
                        </div>

                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-slate-200" />
                            </div>
                            <div className="relative flex justify-center text-xs">
                                <span className="px-3 bg-white text-slate-400 font-medium">or enter credentials manually</span>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">App ID</label>
                            <input
                                type="text"
                                placeholder="123456789012345"
                                value={credentials.meta?.appId || ''}
                                onChange={(e) => updateCredential('meta', 'appId', e.target.value)}
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">App Secret</label>
                            <div className="relative">
                                <input
                                    type={showSecrets['meta-secret'] ? 'text' : 'password'}
                                    placeholder="xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                                    value={credentials.meta?.appSecret || ''}
                                    onChange={(e) => updateCredential('meta', 'appSecret', e.target.value)}
                                    className="w-full px-4 py-3 pr-12 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                                />
                                <button
                                    onClick={() => toggleShowSecret('meta-secret')}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                >
                                    {showSecrets['meta-secret'] ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Access Token</label>
                            <div className="relative">
                                <input
                                    type={showSecrets['meta-token'] ? 'text' : 'password'}
                                    placeholder="EAAxxxxxxxx..."
                                    value={credentials.meta?.accessToken || ''}
                                    onChange={(e) => updateCredential('meta', 'accessToken', e.target.value)}
                                    className="w-full px-4 py-3 pr-12 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                                />
                                <button
                                    onClick={() => toggleShowSecret('meta-token')}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                >
                                    {showSecrets['meta-token'] ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    Instagram Account ID
                                    <span className="text-xs text-slate-400 ml-1">(Required for Reels)</span>
                                </label>
                                <input
                                    type="text"
                                    placeholder="17841400XXXXXXXX"
                                    value={credentials.meta?.instagramAccountId || ''}
                                    onChange={(e) => updateCredential('meta', 'instagramAccountId', e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                                />
                                <p className="text-xs text-slate-500 mt-1">
                                    Get this via Graph API: /me/accounts → /{'{page-id}'}?fields=instagram_business_account
                                </p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    Facebook Page ID
                                    <span className="text-xs text-slate-400 ml-1">(Optional)</span>
                                </label>
                                <input
                                    type="text"
                                    placeholder="123456789012345"
                                    value={credentials.meta?.facebookPageId || ''}
                                    onChange={(e) => updateCredential('meta', 'facebookPageId', e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                                />
                                <p className="text-xs text-slate-500 mt-1">
                                    Required if you want to post to Facebook Pages
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                            <a
                                href="https://developers.facebook.com/apps/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm text-violet-600 hover:text-violet-700 flex items-center gap-1"
                            >
                                <ExternalLink className="w-4 h-4" />
                                Meta Developer Portal
                            </a>
                            <button
                                onClick={() => testConnection('meta')}
                                className="px-4 py-2 rounded-lg bg-slate-100 text-slate-700 font-medium hover:bg-slate-200 flex items-center gap-2"
                            >
                                <RefreshCw className="w-4 h-4" />
                                Test Connection
                            </button>
                        </div>
                    </div>
                </div>

                {/* YouTube Integration */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-slate-200">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-3 rounded-xl bg-red-500">
                                    <Youtube className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-800">YouTube Data API</h3>
                                    <p className="text-sm text-slate-500">Upload and manage YouTube videos</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                {getStatusIcon(connectionStatuses.find(s => s.platform === 'youtube')?.status || 'disconnected')}
                                <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusBadge(connectionStatuses.find(s => s.platform === 'youtube')?.status || 'disconnected')}`}>
                                    {connectionStatuses.find(s => s.platform === 'youtube')?.status}
                                </span>
                            </div>
                        </div>
                    </div>
                    <div className="p-6 space-y-4">
                        {/* Quick Setup with Wizard */}
                        <div className="bg-gradient-to-r from-red-50 via-orange-50 to-yellow-50 rounded-xl p-4 border border-red-200">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-lg bg-gradient-to-br from-red-500 to-red-700">
                                        <Wand2 className="w-5 h-5 text-white" />
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-slate-800">Easy Setup Wizard</h4>
                                        <p className="text-xs text-slate-600">Step-by-step guide to connect your YouTube channel</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setShowYouTubeWizard(true)}
                                    className="px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 text-white font-medium rounded-lg hover:from-red-500 hover:to-red-600 transition-all shadow-md shadow-red-500/25 flex items-center gap-2 text-sm"
                                >
                                    <Sparkles className="w-4 h-4" />
                                    Start Setup
                                </button>
                            </div>
                        </div>

                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-slate-200" />
                            </div>
                            <div className="relative flex justify-center text-xs">
                                <span className="px-3 bg-white text-slate-400 font-medium">or enter credentials manually</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">API Key</label>
                                <div className="relative">
                                    <input
                                        type={showSecrets['youtube-key'] ? 'text' : 'password'}
                                        placeholder="AIzaXXXXXXXXXXXX..."
                                        value={credentials.youtube?.apiKey || ''}
                                        onChange={(e) => updateCredential('youtube', 'apiKey', e.target.value)}
                                        className="w-full px-4 py-3 pr-12 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                    />
                                    <button
                                        onClick={() => toggleShowSecret('youtube-key')}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                    >
                                        {showSecrets['youtube-key'] ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Channel ID</label>
                                <input
                                    type="text"
                                    placeholder="UCxxxxxxxxxxxx"
                                    value={credentials.youtube?.channelId || ''}
                                    onChange={(e) => updateCredential('youtube', 'channelId', e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Access Token</label>
                            <div className="relative">
                                <input
                                    type={showSecrets['youtube-token'] ? 'text' : 'password'}
                                    placeholder="ya29.XXXXXXXX..."
                                    value={credentials.youtube?.accessToken || ''}
                                    onChange={(e) => updateCredential('youtube', 'accessToken', e.target.value)}
                                    className="w-full px-4 py-3 pr-12 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                />
                                <button
                                    onClick={() => toggleShowSecret('youtube-token')}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                >
                                    {showSecrets['youtube-token'] ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                            <p className="text-xs text-slate-500 mt-1">
                                OAuth 2.0 access token for uploading videos
                            </p>
                        </div>
                        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                            <a
                                href="https://console.cloud.google.com/apis/credentials"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm text-violet-600 hover:text-violet-700 flex items-center gap-1"
                            >
                                <ExternalLink className="w-4 h-4" />
                                Google Cloud Console
                            </a>
                            <button
                                onClick={() => testConnection('youtube')}
                                className="px-4 py-2 rounded-lg bg-slate-100 text-slate-700 font-medium hover:bg-slate-200 flex items-center gap-2"
                            >
                                <RefreshCw className="w-4 h-4" />
                                Test Connection
                            </button>
                        </div>
                    </div>
                </div>

                {/* Google Search Console Integration */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-slate-200">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-3 rounded-xl bg-green-500">
                                    <Globe className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-800">Google Search Console</h3>
                                    <p className="text-sm text-slate-500">Track indexation and search performance</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                {getStatusIcon(connectionStatuses.find(s => s.platform === 'googleSearchConsole')?.status || 'disconnected')}
                                <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusBadge(connectionStatuses.find(s => s.platform === 'googleSearchConsole')?.status || 'disconnected')}`}>
                                    {connectionStatuses.find(s => s.platform === 'googleSearchConsole')?.status}
                                </span>
                            </div>
                        </div>
                    </div>
                    <div className="p-6 space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Property URL</label>
                            <input
                                type="url"
                                placeholder="https://your-site.com"
                                value={credentials.googleSearchConsole?.siteUrl || ''}
                                onChange={(e) => updateCredential('googleSearchConsole', 'siteUrl', e.target.value)}
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Service Account Key (JSON)</label>
                            <div className="relative">
                                <textarea
                                    placeholder='{"type": "service_account", ...}'
                                    value={credentials.googleSearchConsole?.serviceAccountKey || ''}
                                    onChange={(e) => updateCredential('googleSearchConsole', 'serviceAccountKey', e.target.value)}
                                    rows={4}
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent font-mono text-sm"
                                />
                            </div>
                            <p className="text-xs text-slate-500 mt-2">
                                Paste the entire JSON content from your service account key file
                            </p>
                        </div>
                        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                            <a
                                href="https://search.google.com/search-console"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm text-violet-600 hover:text-violet-700 flex items-center gap-1"
                            >
                                <ExternalLink className="w-4 h-4" />
                                Search Console
                            </a>
                            <button
                                onClick={() => testConnection('googleSearchConsole')}
                                className="px-4 py-2 rounded-lg bg-slate-100 text-slate-700 font-medium hover:bg-slate-200 flex items-center gap-2"
                            >
                                <RefreshCw className="w-4 h-4" />
                                Test Connection
                            </button>
                        </div>
                    </div>
                </div>

                {/* Save Button */}
                <div className="flex items-center justify-between bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                    <div>
                        {saveStatus === 'success' && (
                            <div className="flex items-center gap-2 text-emerald-600">
                                <CheckCircle2 className="w-5 h-5" />
                                <span className="font-medium">Credentials saved successfully!</span>
                            </div>
                        )}
                        {saveStatus === 'error' && (
                            <div className="flex items-center gap-2 text-red-600">
                                <AlertCircle className="w-5 h-5" />
                                <span className="font-medium">Failed to save. Please try again.</span>
                            </div>
                        )}
                    </div>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="px-8 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-semibold hover:from-violet-500 hover:to-fuchsia-500 transition-all shadow-lg shadow-violet-500/25 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {saving ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                Saving...
                            </>
                        ) : (
                            <>
                                <Shield className="w-5 h-5" />
                                Save Credentials
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* Meta Setup Wizard Modal */}
            {
                showMetaWizard && (
                    <MetaSetupWizard
                        onComplete={handleMetaWizardComplete}
                        onCancel={() => setShowMetaWizard(false)}
                        existingCredentials={{
                            appId: credentials.meta?.appId,
                            appSecret: credentials.meta?.appSecret,
                            accessToken: credentials.meta?.accessToken,
                            instagramAccountId: credentials.meta?.instagramAccountId,
                            facebookPageId: credentials.meta?.facebookPageId,
                        }}
                    />
                )
            }

            {/* YouTube Setup Wizard Modal */}
            {
                showYouTubeWizard && (
                    <YouTubeSetupWizard
                        onComplete={handleYouTubeWizardComplete}
                        onCancel={() => setShowYouTubeWizard(false)}
                        existingCredentials={{
                            apiKey: credentials.youtube?.apiKey,
                            clientId: credentials.youtube?.clientId,
                            clientSecret: credentials.youtube?.clientSecret,
                            accessToken: credentials.youtube?.accessToken,
                            refreshToken: credentials.youtube?.refreshToken,
                            channelId: credentials.youtube?.channelId,
                            channelName: credentials.youtube?.channelName,
                        }}
                    />
                )
            }
        </>
    );
}
