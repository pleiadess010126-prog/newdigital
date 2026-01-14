'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    ArrowLeft, Plus, Play, Pause, Save, Trash2, Settings, Copy,
    Zap, Mail, Clock, GitBranch, Target, Tag, UserPlus, Webhook,
    Users, BarChart3, CheckCircle2, XCircle, AlertCircle,
    ChevronRight, MoreVertical, Eye, Edit
} from 'lucide-react';

interface JourneyStats {
    totalEntered: number;
    currentlyActive: number;
    completed: number;
    exitedEarly: number;
    conversionRate: number;
}

interface Journey {
    id: string;
    name: string;
    description?: string;
    status: 'draft' | 'active' | 'paused' | 'completed' | 'archived';
    nodes: any[];
    edges: any[];
    stats: JourneyStats;
    createdAt: string;
    updatedAt: string;
}

interface JourneyTemplate {
    id: string;
    name: string;
    description: string;
    nodes: any[];
    edges: any[];
}

const statusConfig = {
    draft: { label: 'Draft', color: 'bg-slate-100 text-slate-700', icon: Edit },
    active: { label: 'Active', color: 'bg-emerald-100 text-emerald-700', icon: Play },
    paused: { label: 'Paused', color: 'bg-amber-100 text-amber-700', icon: Pause },
    completed: { label: 'Completed', color: 'bg-blue-100 text-blue-700', icon: CheckCircle2 },
    archived: { label: 'Archived', color: 'bg-slate-100 text-slate-500', icon: XCircle },
};

export default function JourneysPage() {
    const router = useRouter();
    const [journeys, setJourneys] = useState<Journey[]>([]);
    const [templates, setTemplates] = useState<JourneyTemplate[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [statusFilter, setStatusFilter] = useState<string>('');
    const [newJourney, setNewJourney] = useState({ name: '', description: '', templateId: '' });

    useEffect(() => {
        fetchJourneys();
    }, [statusFilter]);

    const fetchJourneys = async () => {
        try {
            const params = new URLSearchParams();
            if (statusFilter) params.set('status', statusFilter);

            const response = await fetch(`/api/journeys?${params}`);
            const data = await response.json();
            setJourneys(data.journeys || []);
            setTemplates(data.templates || []);
        } catch (error) {
            console.error('Error fetching journeys:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateJourney = async () => {
        if (!newJourney.name) return;

        try {
            const response = await fetch('/api/journeys', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newJourney),
            });

            if (response.ok) {
                const journey = await response.json();
                router.push(`/journeys/${journey.id}/edit`);
            }
        } catch (error) {
            console.error('Error creating journey:', error);
        }
    };

    const handleStatusChange = async (journeyId: string, newStatus: string) => {
        try {
            const response = await fetch(`/api/journeys/${journeyId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus }),
            });

            if (response.ok) {
                fetchJourneys();
            } else {
                const error = await response.json();
                alert(error.error || 'Failed to update status');
            }
        } catch (error) {
            console.error('Error updating journey:', error);
        }
    };

    const handleDeleteJourney = async (journeyId: string) => {
        if (!confirm('Are you sure you want to delete this journey?')) return;

        try {
            const response = await fetch(`/api/journeys/${journeyId}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                fetchJourneys();
            }
        } catch (error) {
            console.error('Error deleting journey:', error);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50">
            {/* Header */}
            <div className="bg-white border-b border-slate-200">
                <div className="max-w-7xl mx-auto px-6 py-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Link
                                href="/dashboard"
                                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                            >
                                <ArrowLeft className="w-5 h-5" />
                            </Link>
                            <div>
                                <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
                                    <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl">
                                        <GitBranch className="w-6 h-6 text-white" />
                                    </div>
                                    Journey Builder
                                </h1>
                                <p className="text-slate-500 mt-1">Create visual automation workflows</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-medium hover:from-purple-500 hover:to-pink-500 transition-all flex items-center gap-2 shadow-lg shadow-purple-500/25"
                        >
                            <Plus className="w-4 h-4" />
                            Create Journey
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-8">
                {/* Stats Overview */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                    <div className="bg-white rounded-2xl border border-slate-200 p-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-purple-100 rounded-xl">
                                <GitBranch className="w-6 h-6 text-purple-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-slate-800">{journeys.length}</p>
                                <p className="text-sm text-slate-500">Total Journeys</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-2xl border border-slate-200 p-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-emerald-100 rounded-xl">
                                <Play className="w-6 h-6 text-emerald-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-slate-800">
                                    {journeys.filter(j => j.status === 'active').length}
                                </p>
                                <p className="text-sm text-slate-500">Active</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-2xl border border-slate-200 p-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-blue-100 rounded-xl">
                                <Users className="w-6 h-6 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-slate-800">
                                    {journeys.reduce((sum, j) => sum + j.stats.currentlyActive, 0).toLocaleString()}
                                </p>
                                <p className="text-sm text-slate-500">Contacts in Journeys</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-2xl border border-slate-200 p-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-amber-100 rounded-xl">
                                <BarChart3 className="w-6 h-6 text-amber-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-slate-800">
                                    {journeys.length > 0
                                        ? (journeys.reduce((sum, j) => sum + j.stats.conversionRate, 0) / journeys.length).toFixed(1)
                                        : 0}%
                                </p>
                                <p className="text-sm text-slate-500">Avg Conversion</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-2xl border border-slate-200 p-4 mb-6">
                    <div className="flex items-center gap-4">
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
                        >
                            <option value="">All Status</option>
                            <option value="draft">Draft</option>
                            <option value="active">Active</option>
                            <option value="paused">Paused</option>
                            <option value="completed">Completed</option>
                        </select>
                    </div>
                </div>

                {/* Journeys List */}
                <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                    {loading ? (
                        <div className="p-12 text-center">
                            <div className="w-8 h-8 border-2 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                            <p className="text-slate-500">Loading journeys...</p>
                        </div>
                    ) : journeys.length === 0 ? (
                        <div className="p-12 text-center">
                            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <GitBranch className="w-8 h-8 text-slate-400" />
                            </div>
                            <h3 className="text-lg font-semibold text-slate-800 mb-2">No journeys yet</h3>
                            <p className="text-slate-500 mb-6">Create your first automation journey to get started</p>
                            <button
                                onClick={() => setShowCreateModal(true)}
                                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-medium hover:from-purple-500 hover:to-pink-500 transition-all inline-flex items-center gap-2"
                            >
                                <Plus className="w-5 h-5" />
                                Create Journey
                            </button>
                        </div>
                    ) : (
                        <div className="divide-y divide-slate-100">
                            {journeys.map((journey) => {
                                const StatusIcon = statusConfig[journey.status].icon;
                                return (
                                    <div
                                        key={journey.id}
                                        className="p-6 hover:bg-slate-50 transition-colors"
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <h3 className="font-semibold text-slate-800">{journey.name}</h3>
                                                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium flex items-center gap-1.5 ${statusConfig[journey.status].color}`}>
                                                        <StatusIcon className="w-3.5 h-3.5" />
                                                        {statusConfig[journey.status].label}
                                                    </span>
                                                </div>
                                                {journey.description && (
                                                    <p className="text-sm text-slate-500 mb-3">{journey.description}</p>
                                                )}
                                                <div className="flex items-center gap-6 text-sm">
                                                    <span className="text-slate-500">
                                                        <Users className="w-4 h-4 inline mr-1.5" />
                                                        {journey.stats.totalEntered.toLocaleString()} entered
                                                    </span>
                                                    <span className="text-emerald-600">
                                                        <CheckCircle2 className="w-4 h-4 inline mr-1.5" />
                                                        {journey.stats.completed.toLocaleString()} completed
                                                    </span>
                                                    <span className="text-blue-600">
                                                        <BarChart3 className="w-4 h-4 inline mr-1.5" />
                                                        {journey.stats.conversionRate}% conversion
                                                    </span>
                                                    <span className="text-slate-400">
                                                        {journey.nodes.length} nodes
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {journey.status === 'draft' && (
                                                    <button
                                                        onClick={() => handleStatusChange(journey.id, 'active')}
                                                        className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                                                        title="Activate"
                                                    >
                                                        <Play className="w-5 h-5" />
                                                    </button>
                                                )}
                                                {journey.status === 'active' && (
                                                    <button
                                                        onClick={() => handleStatusChange(journey.id, 'paused')}
                                                        className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                                                        title="Pause"
                                                    >
                                                        <Pause className="w-5 h-5" />
                                                    </button>
                                                )}
                                                {journey.status === 'paused' && (
                                                    <button
                                                        onClick={() => handleStatusChange(journey.id, 'active')}
                                                        className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                                                        title="Resume"
                                                    >
                                                        <Play className="w-5 h-5" />
                                                    </button>
                                                )}
                                                <Link
                                                    href={`/journeys/${journey.id}/edit`}
                                                    className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                >
                                                    <Edit className="w-5 h-5" />
                                                </Link>
                                                <button
                                                    onClick={() => handleDeleteJourney(journey.id)}
                                                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                    disabled={journey.status === 'active'}
                                                >
                                                    <Trash2 className="w-5 h-5" />
                                                </button>
                                                <ChevronRight className="w-5 h-5 text-slate-300" />
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Templates Section */}
                {templates.length > 0 && (
                    <div className="mt-8">
                        <h2 className="text-lg font-semibold text-slate-800 mb-4">Quick Start Templates</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {templates.map((template) => (
                                <button
                                    key={template.id}
                                    onClick={() => {
                                        setNewJourney({ name: template.name, description: template.description, templateId: template.id });
                                        setShowCreateModal(true);
                                    }}
                                    className="bg-white rounded-2xl border border-slate-200 p-6 text-left hover:border-purple-300 hover:shadow-lg transition-all group"
                                >
                                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center mb-4 group-hover:from-purple-200 group-hover:to-pink-200 transition-colors">
                                        <GitBranch className="w-6 h-6 text-purple-600" />
                                    </div>
                                    <h3 className="font-semibold text-slate-800 mb-1">{template.name}</h3>
                                    <p className="text-sm text-slate-500">{template.description}</p>
                                    <p className="text-xs text-purple-600 mt-3">
                                        {template.nodes.length} steps • Click to use
                                    </p>
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Create Journey Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-2xl w-full max-w-lg m-4 overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-200">
                            <h3 className="text-lg font-semibold text-slate-800">Create New Journey</h3>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Journey Name *
                                </label>
                                <input
                                    type="text"
                                    value={newJourney.name}
                                    onChange={(e) => setNewJourney({ ...newJourney, name: e.target.value })}
                                    placeholder="e.g., Welcome Series"
                                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Description
                                </label>
                                <textarea
                                    value={newJourney.description}
                                    onChange={(e) => setNewJourney({ ...newJourney, description: e.target.value })}
                                    placeholder="Describe what this journey does..."
                                    rows={3}
                                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                                />
                            </div>
                            {newJourney.templateId && (
                                <div className="p-3 bg-purple-50 text-purple-700 rounded-xl text-sm">
                                    <strong>Template:</strong> {templates.find(t => t.id === newJourney.templateId)?.name}
                                </div>
                            )}
                            <div className="flex justify-end gap-3 pt-4">
                                <button
                                    onClick={() => {
                                        setShowCreateModal(false);
                                        setNewJourney({ name: '', description: '', templateId: '' });
                                    }}
                                    className="px-4 py-2.5 text-slate-600 hover:bg-slate-100 rounded-xl font-medium"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleCreateJourney}
                                    disabled={!newJourney.name}
                                    className="px-4 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-medium hover:from-purple-500 hover:to-pink-500 disabled:opacity-50"
                                >
                                    Create Journey
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
