'use client';

import React, { useState, useEffect } from 'react';
import {
    Link2, Check, X, ExternalLink, AlertTriangle, RefreshCw,
    Settings, Key, ChevronRight, Unlink, TestTube, Instagram, Facebook
} from 'lucide-react';
import MetaSetupWizard from './MetaSetupWizard';

interface PlatformConnection {
    id: string;
    name: string;
    icon: string;
    status: 'connected' | 'disconnected' | 'error' | 'pending';
    lastSync?: string;
    account?: string;
    features: string[];
    setupUrl: string;
}

const PLATFORMS: PlatformConnection[] = [
    {
        id: 'wordpress',
        name: 'WordPress',
        icon: '📝',
        status: 'connected',
        lastSync: '2 hours ago',
        account: 'myblog.com',
        features: ['Auto-publish posts', 'Draft management', 'Media upload'],
        setupUrl: 'https://wordpress.org/documentation/article/application-passwords/',
    },
    {
        id: 'youtube',
        name: 'YouTube',
        icon: '🎬',
        status: 'connected',
        lastSync: '1 day ago',
        account: '@mychannel',
        features: ['Video upload', 'Shorts', 'Analytics'],
        setupUrl: 'https://console.cloud.google.com/',
    },
    {
        id: 'instagram',
        name: 'Instagram',
        icon: '📸',
        status: 'connected',
        lastSync: '5 hours ago',
        account: '@myaccount',
        features: ['Reels', 'Stories', 'Feed posts', 'Analytics'],
        setupUrl: 'https://developers.facebook.com/',
    },
    {
        id: 'facebook',
        name: 'Facebook',
        icon: '📘',
        status: 'connected',
        lastSync: 'Just now',
        account: 'My Page',
        features: ['Page posts', 'Stories', 'Analytics'],
        setupUrl: 'https://developers.facebook.com/',
    },
    {
        id: 'twitter',
        name: 'Twitter/X',
        icon: '𝕏',
        status: 'disconnected',
        features: ['Tweets', 'Threads', 'Analytics'],
        setupUrl: 'https://developer.twitter.com/',
    },
    {
        id: 'linkedin',
        name: 'LinkedIn',
        icon: '💼',
        status: 'pending',
        features: ['Personal posts', 'Company posts', 'Articles'],
        setupUrl: 'https://www.linkedin.com/developers/',
    },
    {
        id: 'tiktok',
        name: 'TikTok',
        icon: '🎵',
        status: 'disconnected',
        features: ['Video upload', 'Analytics'],
        setupUrl: 'https://developers.tiktok.com/',
    },
    {
        id: 'ftp',
        name: 'FTP/SFTP',
        icon: '🌐',
        status: 'error',
        account: 'ftp.mysite.com',
        features: ['Static HTML upload', 'Blog publishing'],
        setupUrl: '#',
    },
];

interface PlatformSettingsProps {
    onSave?: (platforms: PlatformConnection[]) => void;
}

export default function PlatformSettings({ onSave }: PlatformSettingsProps) {
    const [platforms, setPlatforms] = useState<PlatformConnection[]>(PLATFORMS);
    const [selectedPlatform, setSelectedPlatform] = useState<PlatformConnection | null>(null);
    const [isConnecting, setIsConnecting] = useState<string | null>(null);
    const [showCredentialsModal, setShowCredentialsModal] = useState(false);
    const [showMetaWizard, setShowMetaWizard] = useState(false);
    const [metaCredentials, setMetaCredentials] = useState<{
        appId?: string;
        accessToken?: string;
        instagramUsername?: string;
        facebookPageName?: string;
        instagramAccountId?: string;
        facebookPageId?: string;
    } | null>(null);

    // Load saved Meta credentials from localStorage on mount
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const savedCredentials = localStorage.getItem('meta_credentials');
            if (savedCredentials) {
                try {
                    const credentials = JSON.parse(savedCredentials);
                    setMetaCredentials(credentials);

                    // Update platform statuses based on saved credentials
                    setPlatforms(prev => prev.map(p => {
                        if (p.id === 'instagram' && credentials.instagramAccountId) {
                            return {
                                ...p,
                                status: 'connected' as const,
                                account: credentials.instagramUsername ? `@${credentials.instagramUsername}` : p.account
                            };
                        }
                        if (p.id === 'facebook' && credentials.facebookPageId) {
                            return {
                                ...p,
                                status: 'connected' as const,
                                account: credentials.facebookPageName || p.account
                            };
                        }
                        return p;
                    }));
                } catch (e) {
                    console.error('Failed to parse saved Meta credentials:', e);
                }
            }
        }
    }, []);

    // Handle Meta credentials save from wizard
    const handleMetaCredentialsSave = (credentials: {
        appId: string;
        appSecret: string;
        accessToken: string;
        pageAccessToken: string;
        instagramAccountId: string;
        facebookPageId: string;
        instagramUsername?: string;
        facebookPageName?: string;
    }) => {
        setMetaCredentials(credentials);
        setShowMetaWizard(false);

        // Update platform statuses
        setPlatforms(prev => prev.map(p => {
            if (p.id === 'instagram' && credentials.instagramAccountId) {
                return {
                    ...p,
                    status: 'connected' as const,
                    lastSync: 'Just now',
                    account: credentials.instagramUsername ? `@${credentials.instagramUsername}` : p.account
                };
            }
            if (p.id === 'facebook' && credentials.facebookPageId) {
                return {
                    ...p,
                    status: 'connected' as const,
                    lastSync: 'Just now',
                    account: credentials.facebookPageName || p.account
                };
            }
            return p;
        }));

        // Save to localStorage for persistence
        if (typeof window !== 'undefined') {
            localStorage.setItem('meta_credentials', JSON.stringify(credentials));
        }
    };


    const getStatusColor = (status: PlatformConnection['status']) => {
        switch (status) {
            case 'connected': return 'bg-green-500';
            case 'disconnected': return 'bg-gray-500';
            case 'error': return 'bg-red-500';
            case 'pending': return 'bg-yellow-500';
        }
    };

    const getStatusBadge = (status: PlatformConnection['status']) => {
        switch (status) {
            case 'connected':
                return <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-full flex items-center gap-1"><Check className="w-3 h-3" /> Connected</span>;
            case 'disconnected':
                return <span className="px-2 py-1 bg-gray-500/20 text-gray-400 text-xs rounded-full">Not Connected</span>;
            case 'error':
                return <span className="px-2 py-1 bg-red-500/20 text-red-400 text-xs rounded-full flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> Error</span>;
            case 'pending':
                return <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 text-xs rounded-full flex items-center gap-1"><RefreshCw className="w-3 h-3 animate-spin" /> Connecting...</span>;
        }
    };

    const handleConnect = async (platformId: string) => {
        // For Instagram and Facebook, use the Meta Setup Wizard
        if (platformId === 'instagram' || platformId === 'facebook') {
            setShowMetaWizard(true);
            return;
        }

        setIsConnecting(platformId);

        // Simulate OAuth/connection flow for other platforms
        await new Promise(resolve => setTimeout(resolve, 2000));

        setPlatforms(prev => prev.map(p =>
            p.id === platformId ? { ...p, status: 'connected' as const, lastSync: 'Just now' } : p
        ));
        setIsConnecting(null);
    };

    const handleDisconnect = (platformId: string) => {
        setPlatforms(prev => prev.map(p =>
            p.id === platformId ? { ...p, status: 'disconnected' as const, lastSync: undefined, account: undefined } : p
        ));
    };

    const handleTestConnection = async (platformId: string) => {
        setIsConnecting(platformId);
        await new Promise(resolve => setTimeout(resolve, 1500));
        setIsConnecting(null);
    };

    const connectedCount = platforms.filter(p => p.status === 'connected').length;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                        <Link2 className="w-7 h-7 text-purple-400" />
                        Platform Connections
                    </h2>
                    <p className="text-white/60 mt-1">Manage your publishing platform integrations</p>
                </div>
                <div className="text-right">
                    <p className="text-2xl font-bold text-white">{connectedCount}/{platforms.length}</p>
                    <p className="text-white/60 text-sm">Platforms Connected</p>
                </div>
            </div>

            {/* Connection Overview */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="card p-4">
                    <div className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full bg-green-500" />
                        <span className="text-white/80">Connected</span>
                    </div>
                    <p className="text-2xl font-bold text-white mt-2">{platforms.filter(p => p.status === 'connected').length}</p>
                </div>
                <div className="card p-4">
                    <div className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full bg-gray-500" />
                        <span className="text-white/80">Not Connected</span>
                    </div>
                    <p className="text-2xl font-bold text-white mt-2">{platforms.filter(p => p.status === 'disconnected').length}</p>
                </div>
                <div className="card p-4">
                    <div className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full bg-yellow-500" />
                        <span className="text-white/80">Pending</span>
                    </div>
                    <p className="text-2xl font-bold text-white mt-2">{platforms.filter(p => p.status === 'pending').length}</p>
                </div>
                <div className="card p-4">
                    <div className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full bg-red-500" />
                        <span className="text-white/80">Issues</span>
                    </div>
                    <p className="text-2xl font-bold text-white mt-2">{platforms.filter(p => p.status === 'error').length}</p>
                </div>
            </div>

            {/* Platform List */}
            <div className="card overflow-hidden">
                <div className="p-4 border-b border-white/10">
                    <h3 className="text-lg font-semibold text-white">All Platforms</h3>
                </div>
                <div className="divide-y divide-white/5">
                    {platforms.map((platform) => (
                        <div key={platform.id} className="p-4 hover:bg-white/5 transition-colors">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${platform.status === 'connected' ? 'bg-green-500/20' : 'bg-white/10'
                                        }`}>
                                        {platform.icon}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-3">
                                            <h4 className="text-white font-medium">{platform.name}</h4>
                                            {getStatusBadge(platform.status)}
                                        </div>
                                        {platform.account && (
                                            <p className="text-white/50 text-sm">{platform.account}</p>
                                        )}
                                        {platform.lastSync && (
                                            <p className="text-white/40 text-xs mt-1">Last synced: {platform.lastSync}</p>
                                        )}
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    {platform.status === 'connected' && (
                                        <>
                                            <button
                                                onClick={() => handleTestConnection(platform.id)}
                                                disabled={isConnecting === platform.id}
                                                className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-white/70 rounded-lg text-sm transition-colors flex items-center gap-1"
                                            >
                                                {isConnecting === platform.id ? (
                                                    <RefreshCw className="w-3 h-3 animate-spin" />
                                                ) : (
                                                    <TestTube className="w-3 h-3" />
                                                )}
                                                Test
                                            </button>
                                            <button
                                                onClick={() => setSelectedPlatform(platform)}
                                                className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-white/70 rounded-lg text-sm transition-colors flex items-center gap-1"
                                            >
                                                <Settings className="w-3 h-3" />
                                                Configure
                                            </button>
                                            <button
                                                onClick={() => handleDisconnect(platform.id)}
                                                className="px-3 py-1.5 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg text-sm transition-colors flex items-center gap-1"
                                            >
                                                <Unlink className="w-3 h-3" />
                                                Disconnect
                                            </button>
                                        </>
                                    )}
                                    {platform.status === 'disconnected' && (
                                        <button
                                            onClick={() => handleConnect(platform.id)}
                                            disabled={isConnecting === platform.id}
                                            className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                                        >
                                            {isConnecting === platform.id ? (
                                                <>
                                                    <RefreshCw className="w-4 h-4 animate-spin" />
                                                    Connecting...
                                                </>
                                            ) : (
                                                <>
                                                    <Link2 className="w-4 h-4" />
                                                    Connect
                                                </>
                                            )}
                                        </button>
                                    )}
                                    {platform.status === 'error' && (
                                        <>
                                            <button
                                                onClick={() => handleConnect(platform.id)}
                                                className="px-3 py-1.5 bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-400 rounded-lg text-sm transition-colors flex items-center gap-1"
                                            >
                                                <RefreshCw className="w-3 h-3" />
                                                Reconnect
                                            </button>
                                            <button
                                                onClick={() => setSelectedPlatform(platform)}
                                                className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-white/70 rounded-lg text-sm transition-colors flex items-center gap-1"
                                            >
                                                <Settings className="w-3 h-3" />
                                                Fix
                                            </button>
                                        </>
                                    )}
                                    {platform.status === 'pending' && (
                                        <span className="px-4 py-2 bg-yellow-500/20 text-yellow-400 rounded-lg text-sm flex items-center gap-2">
                                            <RefreshCw className="w-4 h-4 animate-spin" />
                                            Verifying...
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Features */}
                            <div className="mt-3 flex flex-wrap gap-2">
                                {platform.features.map((feature, i) => (
                                    <span
                                        key={i}
                                        className={`px-2 py-1 rounded text-xs ${platform.status === 'connected'
                                            ? 'bg-purple-500/10 text-purple-300'
                                            : 'bg-white/5 text-white/40'
                                            }`}
                                    >
                                        {feature}
                                    </span>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Configuration Modal */}
            {selectedPlatform && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="card w-full max-w-lg mx-4 p-6 animate-scale-in">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <span className="text-3xl">{selectedPlatform.icon}</span>
                                <div>
                                    <h3 className="text-xl font-semibold text-white">{selectedPlatform.name} Settings</h3>
                                    <p className="text-white/60 text-sm">Configure your connection</p>
                                </div>
                            </div>
                            <button onClick={() => setSelectedPlatform(null)} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                                <X className="w-5 h-5 text-white/60" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            {selectedPlatform.id === 'twitter' || selectedPlatform.id === 'linkedin' || selectedPlatform.id === 'tiktok' ? (
                                <>
                                    <div>
                                        <label className="text-white/80 text-sm mb-2 block">API Key</label>
                                        <input type="password" className="input w-full" placeholder="Enter API Key" />
                                    </div>
                                    <div>
                                        <label className="text-white/80 text-sm mb-2 block">API Secret</label>
                                        <input type="password" className="input w-full" placeholder="Enter API Secret" />
                                    </div>
                                    <div>
                                        <label className="text-white/80 text-sm mb-2 block">Access Token</label>
                                        <input type="password" className="input w-full" placeholder="Enter Access Token" />
                                    </div>
                                </>
                            ) : selectedPlatform.id === 'ftp' ? (
                                <>
                                    <div>
                                        <label className="text-white/80 text-sm mb-2 block">Host</label>
                                        <input type="text" className="input w-full" placeholder="ftp.example.com" />
                                    </div>
                                    <div>
                                        <label className="text-white/80 text-sm mb-2 block">Username</label>
                                        <input type="text" className="input w-full" placeholder="Username" />
                                    </div>
                                    <div>
                                        <label className="text-white/80 text-sm mb-2 block">Password</label>
                                        <input type="password" className="input w-full" placeholder="Password" />
                                    </div>
                                    <div>
                                        <label className="text-white/80 text-sm mb-2 block">Base Path</label>
                                        <input type="text" className="input w-full" placeholder="/public_html/blog" />
                                    </div>
                                </>
                            ) : (
                                <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
                                    <div className="flex items-center gap-2 text-green-400">
                                        <Check className="w-5 h-5" />
                                        <span className="font-medium">Connected and working</span>
                                    </div>
                                    <p className="text-white/60 text-sm mt-2">Account: {selectedPlatform.account}</p>
                                </div>
                            )}

                            <a
                                href={selectedPlatform.setupUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 text-purple-400 hover:text-purple-300 text-sm transition-colors"
                            >
                                <Key className="w-4 h-4" />
                                Get API credentials
                                <ExternalLink className="w-3 h-3" />
                            </a>
                        </div>

                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={() => setSelectedPlatform(null)}
                                className="flex-1 px-4 py-2 border border-white/20 text-white/80 rounded-lg hover:bg-white/5 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => { handleConnect(selectedPlatform.id); setSelectedPlatform(null); }}
                                className="flex-1 px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg font-medium transition-colors"
                            >
                                Save & Connect
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Meta Setup Wizard */}
            {showMetaWizard && (
                <MetaSetupWizard
                    onComplete={handleMetaCredentialsSave}
                    onCancel={() => setShowMetaWizard(false)}
                    existingCredentials={metaCredentials || undefined}
                />
            )}
        </div>
    );
}
