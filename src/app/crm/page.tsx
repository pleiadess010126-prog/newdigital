'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    ArrowLeft, Settings, Link2, Unlink, RefreshCw, Download, Upload,
    CheckCircle2, XCircle, AlertCircle, TrendingUp, Users, BarChart3,
    Zap, Shield, ExternalLink, ChevronRight, Kanban, MessageSquare,
    MoreHorizontal, Filter, Plus, Gauge, Workflow, GitBranch
} from 'lucide-react';
import { SocialCRMService } from '@/lib/crm/socialCRM';
import type { Lead, AutomationRule } from '@/types/socialCRM';

// CRM Platform logos
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

// --- Kanban Column Component ---
const PipelineColumn = ({ title, leads, status, color }: { title: string, leads: Lead[], status: string, color: string }) => (
    <div className="flex flex-col h-full min-w-[300px] bg-slate-50/50 rounded-xl border border-slate-200">
        <div className={`p-4 border-b border-slate-200 flex justify-between items-center bg-white rounded-t-xl border-t-4 ${color}`}>
            <h3 className="font-semibold text-slate-700">{title}</h3>
            <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full text-xs font-medium">
                {leads.length}
            </span>
        </div>
        <div className="p-3 space-y-3 overflow-y-auto max-h-[calc(100vh-300px)] custom-scrollbar">
            {leads.map(lead => (
                <div key={lead.id} className="bg-white p-3 rounded-lg shadow-sm border border-slate-200 hover:shadow-md transition-shadow cursor-grab active:cursor-grabbing">
                    <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                            {lead.socialProfiles[0]?.profilePictureUrl ? (
                                <img src={lead.socialProfiles[0].profilePictureUrl} alt={lead.name} className="w-6 h-6 rounded-full" />
                            ) : (
                                <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-bold">
                                    {lead.name.charAt(0)}
                                </div>
                            )}
                            <span className="font-medium text-slate-800 text-sm truncate max-w-[120px]">{lead.name}</span>
                        </div>
                        <span className={`text-xs px-1.5 py-0.5 rounded flex items-center gap-1
                            ${lead.primaryPlatform === 'instagram' ? 'bg-pink-50 text-pink-600' :
                                lead.primaryPlatform === 'linkedin' ? 'bg-blue-50 text-blue-600' : 'bg-slate-100 text-slate-600'}`}>
                            {lead.primaryPlatform === 'instagram' && <span className="w-1 h-1 rounded-full bg-pink-500"></span>}
                            {lead.primaryPlatform === 'linkedin' && <span className="w-1 h-1 rounded-full bg-blue-500"></span>}
                            {lead.primaryPlatform.slice(0, 2)}
                        </span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-slate-500 mt-2">
                        <span>Score: <span className={`font-bold ${lead.score > 80 ? 'text-green-600' : 'text-slate-700'}`}>{lead.score}</span></span>
                        <span>{lead.engagementsByType.like + lead.engagementsByType.comment} Engagements</span>
                    </div>
                </div>
            ))}
            {leads.length === 0 && (
                <div className="text-center py-8 text-slate-400 text-sm border-2 border-dashed border-slate-200 rounded-lg">
                    No leads
                </div>
            )}
        </div>
    </div>
);

// --- Automation Rule Card ---
const AutomationRuleCard = ({ rule }: { rule: AutomationRule }) => (
    <div className="bg-white p-4 rounded-xl border border-slate-200 flex items-center justify-between">
        <div className="flex items-center gap-4">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${rule.isActive ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                <Workflow className="w-5 h-5" />
            </div>
            <div>
                <h4 className="font-semibold text-slate-800">{rule.name}</h4>
                <p className="text-sm text-slate-500 flex items-center gap-2">
                    <GitBranch className="w-3 h-3" />
                    Trigger: {rule.trigger.type.replace('_', ' ')}
                </p>
            </div>
        </div>
        <div className="text-right">
            <span className="text-2xl font-bold text-slate-800">{rule.triggeredCount}</span>
            <p className="text-xs text-slate-500">Executions</p>
        </div>
    </div>
);

export default function CRMPage() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<'dashboard' | 'pipeline' | 'automations'>('dashboard');
    const [loading, setLoading] = useState(true);
    const [leads, setLeads] = useState<Lead[]>([]);
    const [automationRules, setAutomationRules] = useState<AutomationRule[]>([]);

    // Mock Data Loading (simulating API)
    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            const crmService = new SocialCRMService(); // In real app, this might be a singleton or API call

            // We'll use the service to get mock data directly for demo purposes
            // In a real implementation, you'd fetch from your API endpoints
            const fetchedLeads = await crmService.getLeads();
            const fetchedRules = await crmService.getAutomationRules();

            setLeads(fetchedLeads);
            setAutomationRules(fetchedRules);
            setLoading(false);
        };
        loadData();
    }, []);

    const leadsByStatus = {
        cold: leads.filter(l => l.status === 'cold'),
        warm: leads.filter(l => l.status === 'warm'),
        hot: leads.filter(l => l.status === 'hot'),
        customer: leads.filter(l => l.status === 'customer'),
    };

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Header */}
            <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-4">
                        <div className="flex items-center gap-4">
                            <Link href="/dashboard" className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
                                <ArrowLeft className="w-5 h-5" />
                            </Link>
                            <div>
                                <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                                    <div className="p-2 bg-indigo-600 rounded-lg">
                                        <Users className="w-5 h-5 text-white" />
                                    </div>
                                    CRM & Leads
                                </h1>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <button className="px-4 py-2 text-slate-600 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg font-medium flex items-center gap-2 transition-colors">
                                <Filter className="w-4 h-4" />
                                Filter
                            </button>
                            <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 flex items-center gap-2 transition-colors shadow-sm">
                                <Plus className="w-4 h-4" />
                                New Contact
                            </button>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="flex gap-8 mt-4">
                        {[
                            { id: 'dashboard', label: 'Dashboard', icon: Gauge },
                            { id: 'pipeline', label: 'Pipeline', icon: Kanban },
                            { id: 'automations', label: 'Automations', icon: Zap },
                        ].map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                className={`pb-4 flex items-center gap-2 font-medium text-sm border-b-2 transition-colors ${activeTab === tab.id
                                    ? 'border-indigo-600 text-indigo-600'
                                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                                    }`}
                            >
                                <tab.icon className="w-4 h-4" />
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {activeTab === 'dashboard' && (
                    <div className="space-y-6">
                        {/* Stats Row */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                                <div className="flex items-center justify-between mb-4">
                                    <span className="text-slate-500 text-sm font-medium">Total Leads</span>
                                    <Users className="w-5 h-5 text-slate-400" />
                                </div>
                                <div className="text-3xl font-bold text-slate-900">{leads.length}</div>
                                <div className="mt-2 text-xs text-green-600 font-medium flex items-center gap-1">
                                    <TrendingUp className="w-3 h-3" /> +12% this week
                                </div>
                            </div>
                            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                                <div className="flex items-center justify-between mb-4">
                                    <span className="text-slate-500 text-sm font-medium">Hot Leads</span>
                                    <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                                </div>
                                <div className="text-3xl font-bold text-slate-900">{leadsByStatus.hot.length}</div>
                                <div className="mt-2 text-xs text-slate-500">Need immediate attention</div>
                            </div>
                            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                                <div className="flex items-center justify-between mb-4">
                                    <span className="text-slate-500 text-sm font-medium">Pipeline Value</span>
                                    <span className="text-green-600 text-xs font-bold">$</span>
                                </div>
                                <div className="text-3xl font-bold text-slate-900">$142.5k</div>
                                <div className="mt-2 text-xs text-green-600 font-medium">+5% vs last month</div>
                            </div>
                            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                                <div className="flex items-center justify-between mb-4">
                                    <span className="text-slate-500 text-sm font-medium">Avg Lead Score</span>
                                    <BarChart3 className="w-5 h-5 text-slate-400" />
                                </div>
                                <div className="text-3xl font-bold text-slate-900">
                                    {Math.round(leads.reduce((acc, l) => acc + l.score, 0) / (leads.length || 1))}
                                </div>
                                <div className="mt-2 text-xs text-slate-500">Based on 15+ signals</div>
                            </div>
                        </div>

                        {/* Integrations Section */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-sky-50 rounded-lg flex items-center justify-center">
                                            <SalesforceLogo />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-slate-900">Salesforce</h3>
                                            <p className="text-xs text-slate-500">CRM Integration</p>
                                        </div>
                                    </div>
                                    <span className="px-2 py-1 bg-green-50 text-green-700 rounded text-xs font-medium border border-green-100">Connected</span>
                                </div>
                                <div className="flex justify-between items-center text-sm text-slate-600 bg-slate-50 p-3 rounded-lg">
                                    <span>Sync Status: <span className="text-green-600 font-medium">Healthy</span></span>
                                    <span>Last sync: 2m ago</span>
                                </div>
                            </div>
                            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-orange-50 rounded-lg flex items-center justify-center">
                                            <HubSpotLogo />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-slate-900">HubSpot</h3>
                                            <p className="text-xs text-slate-500">Marketing Integration</p>
                                        </div>
                                    </div>
                                    <button className="text-xs text-indigo-600 hover:text-indigo-800 font-medium">Connect</button>
                                </div>
                                <div className="flex justify-between items-center text-sm text-slate-600 bg-slate-50 p-3 rounded-lg border border-dashed border-slate-300">
                                    <span>Not connected</span>
                                    <Link2 className="w-4 h-4 text-slate-400" />
                                </div>
                            </div>
                        </div>

                        {/* Recent Activity Table (Simplified) */}
                        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                            <div className="p-6 border-b border-slate-200 flex justify-between items-center">
                                <h3 className="font-bold text-slate-900">Recent High-Value Leads</h3>
                                <button className="text-sm text-indigo-600 hover:text-indigo-700 font-medium">View All</button>
                            </div>
                            <table className="w-full text-left text-sm text-slate-600">
                                <thead className="bg-slate-50 border-b border-slate-200">
                                    <tr>
                                        <th className="px-6 py-3 font-medium text-slate-500">Name</th>
                                        <th className="px-6 py-3 font-medium text-slate-500">Score</th>
                                        <th className="px-6 py-3 font-medium text-slate-500">Stage</th>
                                        <th className="px-6 py-3 font-medium text-slate-500">Last Active</th>
                                        <th className="px-6 py-3 font-medium text-slate-500">Platform</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {leads.slice(0, 5).map(lead => (
                                        <tr key={lead.id} className="hover:bg-slate-50 transition-colors">
                                            <td className="px-6 py-4 font-medium text-slate-900">{lead.name}</td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${lead.score > 80 ? 'bg-green-100 text-green-800' :
                                                    lead.score > 50 ? 'bg-yellow-100 text-yellow-800' : 'bg-slate-100 text-slate-600'
                                                    }`}>
                                                    {lead.score}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 capitalize">{lead.status}</td>
                                            <td className="px-6 py-4">{new Date(lead.lastEngagementAt).toLocaleDateString()}</td>
                                            <td className="px-6 py-4 capitalize">{lead.primaryPlatform}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {activeTab === 'pipeline' && (
                    <div className="h-[calc(100vh-250px)] overflow-x-auto pb-4">
                        <div className="flex gap-6 h-full min-w-max">
                            <PipelineColumn
                                title="Cold Leads"
                                leads={leadsByStatus.cold}
                                status="cold"
                                color="border-t-slate-400"
                            />
                            <PipelineColumn
                                title="Warm Leads"
                                leads={leadsByStatus.warm}
                                status="warm"
                                color="border-t-yellow-400"
                            />
                            <PipelineColumn
                                title="Hot Leads"
                                leads={leadsByStatus.hot}
                                status="hot"
                                color="border-t-red-500"
                            />
                            <PipelineColumn
                                title="Customers"
                                leads={leadsByStatus.customer}
                                status="customer"
                                color="border-t-green-500"
                            />
                            {/* Stats/Summary Col (Optional) */}
                            <div className="w-[300px] flex flex-col gap-4">
                                <div className="bg-indigo-600 text-white p-6 rounded-xl shadow-lg">
                                    <h3 className="text-lg font-bold mb-2">Automated Outreach</h3>
                                    <p className="text-indigo-100 text-sm mb-4">
                                        Your AI agents are currently nurturing {leadsByStatus.warm.length} warm leads.
                                    </p>
                                    <div className="flex items-center justify-between text-sm">
                                        <span>Conversion Rate</span>
                                        <span className="font-bold text-xl">3.2%</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'automations' && (
                    <div className="space-y-6">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-lg font-semibold text-slate-900">Active Workflows</h2>
                            <button className="text-indigo-600 text-sm font-medium hover:underline">Manage All</button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {automationRules.map(rule => (
                                <AutomationRuleCard key={rule.id} rule={rule} />
                            ))}
                            {/* Promo Card for New Rules */}
                            <button className="border-2 border-dashed border-slate-300 rounded-xl p-6 flex flex-col items-center justify-center text-slate-500 hover:border-indigo-400 hover:text-indigo-600 transition-colors group">
                                <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mb-3 group-hover:bg-indigo-50">
                                    <Plus className="w-6 h-6" />
                                </div>
                                <span className="font-medium">Create New Workflow</span>
                            </button>
                        </div>

                        <div className="bg-slate-900 text-white rounded-xl p-6 mt-8 flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-bold flex items-center gap-2">
                                    <Shield className="w-5 h-5 text-green-400" />
                                    AI Safeguards Active
                                </h3>
                                <p className="text-slate-400 text-sm mt-1">Rate limits and tone analysis active for all automated outreach.</p>
                            </div>
                            <div className="text-right">
                                <span className="block text-2xl font-bold">142</span>
                                <span className="text-xs text-slate-500">Risks blocked</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
