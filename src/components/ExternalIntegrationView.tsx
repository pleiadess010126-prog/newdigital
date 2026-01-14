'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
    ArrowLeft, Settings, Link2, Unlink, RefreshCw, Download, Upload,
    CheckCircle2, XCircle, AlertCircle, TrendingUp, Users, BarChart3,
    Zap, Shield, ExternalLink, ChevronRight, MessageSquare
} from 'lucide-react';

// CRM Platform logos as SVG icons
const SalesforceLogo = () => (
    <svg viewBox="0 0 100 70" className="w-8 h-8">
        <path fill="#00A1E0" d="M42.5 17.5c4.5-4.5 10.5-7 17-7 8.5 0 16 4.5 20.5 11 3.5-1.5 7.5-2.5 11.5-2.5 15 0 27.5 12 27.5 27s-12.5 27-27.5 27c-3 0-6-.5-8.5-1.5-4 6-10.5 10-18 10-6 0-11.5-2.5-15.5-6.5-2.5 1-5 1.5-8 1.5-11.5 0-21-9.5-21-21 0-5 2-10 5-13.5-2-3.5-3-7.5-3-11.5 0-13 10.5-23.5 23.5-23.5 8 0 15 4 19 10z" />
    </svg>
);

const HubSpotLogo = () => (
    <svg viewBox="0 0 100 100" className="w-8 h-8">
        <circle cx="50" cy="50" r="45" fill="#FF7A59" />
        <circle cx="50" cy="35" r="10" fill="white" />
        <rect x="45" y="45" width="10" height="25" fill="white" />
        <circle cx="50" cy="75" r="8" fill="white" />
    </svg>
);

interface IntegrationStatus {
    connected: boolean;
    lastSync: string | null;
    contactsCount: number;
}

interface ScoreDistribution {
    gradeA: number;
    gradeB: number;
    gradeC: number;
    gradeD: number;
    gradeF: number;
    averageScore: number;
}

export default function ExternalIntegrationView() {
    const [loading, setLoading] = useState(true);
    const [syncing, setSyncing] = useState<string | null>(null);
    const [integrations, setIntegrations] = useState<{
        salesforce: IntegrationStatus;
        hubspot: IntegrationStatus;
    }>({
        salesforce: { connected: false, lastSync: null, contactsCount: 0 },
        hubspot: { connected: false, lastSync: null, contactsCount: 0 }
    });
    const [scoreDistribution, setScoreDistribution] = useState<ScoreDistribution>({
        gradeA: 0, gradeB: 0, gradeC: 0, gradeD: 0, gradeF: 0, averageScore: 0
    });
    const [hotLeads, setHotLeads] = useState<any[]>([]);
    const [showConnectModal, setShowConnectModal] = useState<'salesforce' | 'hubspot' | null>(null);
    const [credentials, setCredentials] = useState({ accessToken: '', instanceUrl: '' });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            // Mock data for immediate display if API fails or is not ready
            // mimicking the structure of the API response
            const mockIntegrations = {
                salesforce: { connected: false, lastSync: null, contactsCount: 0 },
                hubspot: { connected: false, lastSync: null, contactsCount: 0 }
            };
            const mockScoring = {
                gradeA: 5, gradeB: 12, gradeC: 25, gradeD: 8, gradeF: 2, averageScore: 62
            };
            const mockHotLeads = [
                { id: '1', firstName: 'John', lastName: 'Doe', email: 'john@techcorp.com', leadScore: 92, company: 'TechCorp' },
                { id: '2', firstName: 'Sarah', lastName: 'Smith', email: 'sarah@innovate.io', leadScore: 88, company: 'Innovate IO' },
            ];

            // Try real fetch, fallback to mock
            // In a real scenario you might not want this fallback, but for demo purposes it ensures UI shows up
            try {
                const [integrationsRes, scoringRes, hotLeadsRes] = await Promise.all([
                    fetch('/api/crm/integrations'),
                    fetch('/api/crm/lead-scoring?action=distribution'),
                    fetch('/api/crm/lead-scoring?action=hot-leads&limit=10')
                ]);

                if (integrationsRes.ok) setIntegrations(await integrationsRes.json());
                else setIntegrations(mockIntegrations);

                if (scoringRes.ok) setScoreDistribution(await scoringRes.json());
                else setScoreDistribution(mockScoring);

                if (hotLeadsRes.ok) {
                    const data = await hotLeadsRes.json();
                    setHotLeads(data.hotLeads || []);
                } else {
                    setHotLeads(mockHotLeads);
                }
            } catch (e) {
                // specific fetch error, use mocks
                setIntegrations(mockIntegrations);
                setScoreDistribution(mockScoring);
                setHotLeads(mockHotLeads);
            }

        } catch (error) {
            console.error('Error fetching CRM data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleConnect = async (platform: 'salesforce' | 'hubspot') => {
        try {
            const response = await fetch('/api/crm/integrations', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'connect',
                    platform,
                    credentials: platform === 'salesforce'
                        ? { accessToken: credentials.accessToken, instanceUrl: credentials.instanceUrl }
                        : { accessToken: credentials.accessToken }
                })
            });

            const result = await response.json();

            if (result.success) {
                alert(`Successfully connected to ${platform}!`);
                setShowConnectModal(null);
                setCredentials({ accessToken: '', instanceUrl: '' });
                fetchData();
            } else {
                alert(result.message || 'Connection failed');
            }
        } catch (error) {
            alert('Connection failed');
        }
    };

    const handleSync = async (platform: 'salesforce' | 'hubspot', direction: 'to' | 'from') => {
        setSyncing(`${platform}-${direction}`);
        try {
            const response = await fetch('/api/crm/integrations', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: direction === 'to' ? 'sync-to' : 'import-from',
                    platform,
                    credentials: { accessToken: 'demo_token', instanceUrl: 'https://demo.salesforce.com' }
                })
            });

            const result = await response.json();
            alert(`Sync complete: ${result.created} created, ${result.updated} updated, ${result.failed} failed`);
            fetchData();
        } catch (error) {
            alert('Sync failed');
        } finally {
            setSyncing(null);
        }
    };

    const handleRecalculateScores = async () => {
        try {
            const response = await fetch('/api/crm/lead-scoring', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'recalculate-all' })
            });

            const result = await response.json();
            alert(`Updated ${result.updated} contact scores`);
            fetchData();
        } catch (error) {
            alert('Recalculation failed');
        }
    };

    const getGradeColor = (grade: string) => {
        const colors: Record<string, string> = {
            A: 'bg-emerald-500',
            B: 'bg-blue-500',
            C: 'bg-amber-500',
            D: 'bg-orange-500',
            F: 'bg-red-500'
        };
        return colors[grade] || 'bg-slate-500';
    };

    return (
        <div className="animate-in fade-in duration-500">
            {/* Header Actions */}
            <div className="flex justify-end mb-6 gap-3">
                <button
                    onClick={handleRecalculateScores}
                    className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-medium hover:from-indigo-500 hover:to-purple-500 transition-all flex items-center gap-2 shadow-lg shadow-indigo-500/25"
                >
                    <RefreshCw className="w-4 h-4" />
                    Recalculate Scores
                </button>
            </div>

            {/* Lead Score Overview */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                {/* Score Distribution */}
                <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                            <TrendingUp className="w-5 h-5 text-indigo-600" />
                            Lead Score Distribution
                        </h2>
                        <div className="text-right">
                            <p className="text-3xl font-bold text-slate-800">{scoreDistribution?.averageScore || 0}</p>
                            <p className="text-sm text-slate-500">Average Score</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        {[
                            { grade: 'A', label: 'Hot Leads (80+)', count: scoreDistribution?.gradeA || 0 },
                            { grade: 'B', label: 'Warm Leads (60-79)', count: scoreDistribution?.gradeB || 0 },
                            { grade: 'C', label: 'Neutral (40-59)', count: scoreDistribution?.gradeC || 0 },
                            { grade: 'D', label: 'Cold Leads (20-39)', count: scoreDistribution?.gradeD || 0 },
                            { grade: 'F', label: 'Very Cold (<20)', count: scoreDistribution?.gradeF || 0 },
                        ].map((item) => {
                            const total = (scoreDistribution?.gradeA || 0) + (scoreDistribution?.gradeB || 0) +
                                (scoreDistribution?.gradeC || 0) + (scoreDistribution?.gradeD || 0) + (scoreDistribution?.gradeF || 0);
                            const percentage = total > 0 ? (item.count / total) * 100 : 0;

                            return (
                                <div key={item.grade} className="flex items-center gap-4">
                                    <div className={`w-10 h-10 rounded-lg ${getGradeColor(item.grade)} flex items-center justify-center text-white font-bold`}>
                                        {item.grade}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex justify-between text-sm mb-1">
                                            <span className="text-slate-600">{item.label}</span>
                                            <span className="font-semibold text-slate-800">{item.count}</span>
                                        </div>
                                        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full ${getGradeColor(item.grade)} rounded-full transition-all`}
                                                style={{ width: `${percentage}%` }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                    <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2 mb-4">
                        <Zap className="w-5 h-5 text-amber-500" />
                        Hot Leads
                    </h2>

                    {hotLeads.length === 0 ? (
                        <p className="text-slate-500 text-center py-8">No hot leads yet</p>
                    ) : (
                        <div className="space-y-3">
                            {hotLeads.slice(0, 5).map((lead) => (
                                <Link
                                    key={lead.id}
                                    href={`/email/contacts/${lead.id}`}
                                    className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors"
                                >
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white font-bold">
                                        {lead.leadScore}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium text-slate-800 truncate">
                                            {lead.firstName || lead.lastName
                                                ? `${lead.firstName || ''} ${lead.lastName || ''}`.trim()
                                                : lead.email}
                                        </p>
                                        <p className="text-sm text-slate-500 truncate">{lead.company || lead.email}</p>
                                    </div>
                                    <ChevronRight className="w-4 h-4 text-slate-400" />
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* CRM Integrations */}
            <h2 className="text-lg font-semibold text-slate-800 mb-4">CRM Platforms</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Salesforce */}
                <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-xl bg-sky-50 flex items-center justify-center">
                                <SalesforceLogo />
                            </div>
                            <div>
                                <h3 className="font-semibold text-slate-800">Salesforce</h3>
                                <p className="text-sm text-slate-500">Sales Cloud CRM</p>
                            </div>
                        </div>
                        {integrations.salesforce.connected ? (
                            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-100 text-emerald-700 text-sm font-medium">
                                <CheckCircle2 className="w-4 h-4" />
                                Connected
                            </span>
                        ) : (
                            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 text-slate-600 text-sm font-medium">
                                <XCircle className="w-4 h-4" />
                                Not Connected
                            </span>
                        )}
                    </div>

                    {integrations.salesforce.connected ? (
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4 text-center">
                                <div className="p-3 bg-slate-50 rounded-xl">
                                    <p className="text-2xl font-bold text-slate-800">{integrations.salesforce.contactsCount}</p>
                                    <p className="text-sm text-slate-500">Synced Contacts</p>
                                </div>
                                <div className="p-3 bg-slate-50 rounded-xl">
                                    <p className="text-sm font-medium text-slate-800">
                                        {integrations.salesforce.lastSync
                                            ? new Date(integrations.salesforce.lastSync).toLocaleDateString()
                                            : 'Never'}
                                    </p>
                                    <p className="text-sm text-slate-500">Last Sync</p>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => handleSync('salesforce', 'to')}
                                    disabled={syncing === 'salesforce-to'}
                                    className="flex-1 px-4 py-2 bg-sky-600 text-white rounded-lg font-medium hover:bg-sky-500 disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    <Upload className="w-4 h-4" />
                                    {syncing === 'salesforce-to' ? 'Syncing...' : 'Push to SF'}
                                </button>
                                <button
                                    onClick={() => handleSync('salesforce', 'from')}
                                    disabled={syncing === 'salesforce-from'}
                                    className="flex-1 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg font-medium hover:bg-slate-200 disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    <Download className="w-4 h-4" />
                                    {syncing === 'salesforce-from' ? 'Importing...' : 'Import from SF'}
                                </button>
                            </div>
                        </div>
                    ) : (
                        <button
                            onClick={() => setShowConnectModal('salesforce')}
                            className="w-full px-4 py-3 bg-sky-600 text-white rounded-xl font-medium hover:bg-sky-500 transition-colors flex items-center justify-center gap-2"
                        >
                            <Link2 className="w-5 h-5" />
                            Connect Salesforce
                        </button>
                    )}
                </div>

                {/* HubSpot */}
                <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-xl bg-orange-50 flex items-center justify-center">
                                <HubSpotLogo />
                            </div>
                            <div>
                                <h3 className="font-semibold text-slate-800">HubSpot</h3>
                                <p className="text-sm text-slate-500">Marketing & Sales CRM</p>
                            </div>
                        </div>
                        {integrations.hubspot.connected ? (
                            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-100 text-emerald-700 text-sm font-medium">
                                <CheckCircle2 className="w-4 h-4" />
                                Connected
                            </span>
                        ) : (
                            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 text-slate-600 text-sm font-medium">
                                <XCircle className="w-4 h-4" />
                                Not Connected
                            </span>
                        )}
                    </div>

                    {integrations.hubspot.connected ? (
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4 text-center">
                                <div className="p-3 bg-slate-50 rounded-xl">
                                    <p className="text-2xl font-bold text-slate-800">{integrations.hubspot.contactsCount}</p>
                                    <p className="text-sm text-slate-500">Synced Contacts</p>
                                </div>
                                <div className="p-3 bg-slate-50 rounded-xl">
                                    <p className="text-sm font-medium text-slate-800">
                                        {integrations.hubspot.lastSync
                                            ? new Date(integrations.hubspot.lastSync).toLocaleDateString()
                                            : 'Never'}
                                    </p>
                                    <p className="text-sm text-slate-500">Last Sync</p>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => handleSync('hubspot', 'to')}
                                    disabled={syncing === 'hubspot-to'}
                                    className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg font-medium hover:bg-orange-500 disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    <Upload className="w-4 h-4" />
                                    {syncing === 'hubspot-to' ? 'Syncing...' : 'Push to HS'}
                                </button>
                                <button
                                    onClick={() => handleSync('hubspot', 'from')}
                                    disabled={syncing === 'hubspot-from'}
                                    className="flex-1 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg font-medium hover:bg-slate-200 disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    <Download className="w-4 h-4" />
                                    {syncing === 'hubspot-from' ? 'Importing...' : 'Import from HS'}
                                </button>
                            </div>
                        </div>
                    ) : (
                        <button
                            onClick={() => setShowConnectModal('hubspot')}
                            className="w-full px-4 py-3 bg-orange-600 text-white rounded-xl font-medium hover:bg-orange-500 transition-colors flex items-center justify-center gap-2"
                        >
                            <Link2 className="w-5 h-5" />
                            Connect HubSpot
                        </button>
                    )}
                </div>
            </div>

            {/* Lead Scoring Rules Info */}
            <div className="mt-8 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-8 text-white shadow-lg">
                <div className="flex items-start justify-between">
                    <div>
                        <h2 className="text-xl font-bold mb-2 flex items-center gap-2">
                            <Zap className="w-6 h-6" />
                            AI-Powered Lead Scoring
                        </h2>
                        <p className="text-white/80 mb-4 max-w-2xl">
                            Our intelligent lead scoring engine automatically evaluates contacts based on engagement,
                            demographics, behavior, and firmographic data—just like Salesforce Einstein.
                        </p>
                        <div className="flex flex-wrap gap-2">
                            {['Email Opens', 'Link Clicks', 'Form Submissions', 'Page Visits', 'Job Title', 'Company Size', 'Recency'].map((factor) => (
                                <span key={factor} className="px-3 py-1 bg-white/20 rounded-full text-sm">
                                    {factor}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Connect Modal */}
            {showConnectModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-2xl w-full max-w-md m-4 overflow-hidden shadow-2xl">
                        <div className="px-6 py-4 border-b border-slate-200">
                            <h3 className="text-lg font-semibold text-slate-800">
                                Connect {showConnectModal === 'salesforce' ? 'Salesforce' : 'HubSpot'}
                            </h3>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="p-4 bg-amber-50 text-amber-800 rounded-xl text-sm flex items-start gap-3">
                                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                                <p>
                                    For production use, configure OAuth in your environment variables.
                                    For testing, you can enter an API token directly.
                                </p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Access Token
                                </label>
                                <input
                                    type="password"
                                    value={credentials.accessToken}
                                    onChange={(e) => setCredentials({ ...credentials, accessToken: e.target.value })}
                                    placeholder="Enter your access token..."
                                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>

                            {showConnectModal === 'salesforce' && (
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">
                                        Instance URL
                                    </label>
                                    <input
                                        type="text"
                                        value={credentials.instanceUrl}
                                        onChange={(e) => setCredentials({ ...credentials, instanceUrl: e.target.value })}
                                        placeholder="https://yourorg.salesforce.com"
                                        className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>
                            )}

                            <div className="flex justify-end gap-3 pt-4">
                                <button
                                    onClick={() => {
                                        setShowConnectModal(null);
                                        setCredentials({ accessToken: '', instanceUrl: '' });
                                    }}
                                    className="px-4 py-2.5 text-slate-600 hover:bg-slate-100 rounded-xl font-medium"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => handleConnect(showConnectModal)}
                                    className="px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-medium hover:from-indigo-500 hover:to-purple-500"
                                >
                                    Connect
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
