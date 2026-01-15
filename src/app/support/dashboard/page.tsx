'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
    Headphones, Search, Filter, RefreshCw, User, Clock,
    MessageSquare, ChevronRight, AlertCircle, CheckCircle2,
    XCircle, Send, Users, TrendingUp, BarChart3, Settings,
    ArrowLeft, Eye, UserPlus, Sparkles, Star, FileText, X
} from 'lucide-react';
import { useAuth } from '@/lib/auth/AuthContext';
import {
    SupportTicket,
    TicketMessage,
    TicketStatus,
    TicketPriority,
    TicketCategory,
    TicketStats,
    TICKET_STATUS_CONFIG,
    TICKET_PRIORITY_CONFIG,
    TICKET_CATEGORY_CONFIG,
} from '@/types/support';
import {
    getTickets,
    getTicketById,
    updateTicket,
    addTicketMessage,
    getTicketMessages,
    getTicketStats,
    assignTicket,
    getSupportTeamMembers,
} from '@/lib/support/ticketService';

type TabType = 'all' | 'open' | 'mine' | 'unassigned' | 'resolved';

export default function SupportDashboardPage() {
    const { user, isAuthenticated } = useAuth();
    const [activeTab, setActiveTab] = useState<TabType>('all');
    const [tickets, setTickets] = useState<SupportTicket[]>([]);
    const [stats, setStats] = useState<TicketStats | null>(null);
    const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
    const [messages, setMessages] = useState<TicketMessage[]>([]);
    const [supportTeam, setSupportTeam] = useState<{ id: string; name: string; email: string; activeTickets: number }[]>([]);
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);

    // Filters
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<TicketStatus | ''>('');
    const [priorityFilter, setPriorityFilter] = useState<TicketPriority | ''>('');

    // Reply
    const [replyText, setReplyText] = useState('');
    const [isInternalNote, setIsInternalNote] = useState(false);

    // Assignment modal
    const [showAssignModal, setShowAssignModal] = useState(false);

    // Check if user is support/admin
    const isSupport = user?.role === 'support' || user?.role === 'admin' || user?.role === 'superadmin';

    useEffect(() => {
        if (isAuthenticated) {
            loadData();
        }
    }, [isAuthenticated, activeTab]);

    const loadData = async () => {
        setLoading(true);
        try {
            // Load tickets based on active tab
            let filters: any = {};
            if (activeTab === 'open') {
                filters.status = ['open', 'in_progress', 'waiting_on_support'];
            } else if (activeTab === 'mine') {
                filters.assignedToId = user?.id;
            } else if (activeTab === 'unassigned') {
                filters.assignedToId = null;
            } else if (activeTab === 'resolved') {
                filters.status = ['resolved', 'closed'];
            }

            const [ticketData, statsData, teamData] = await Promise.all([
                getTickets(filters),
                getTicketStats(),
                getSupportTeamMembers(),
            ]);

            setTickets(ticketData);
            setStats(statsData);
            setSupportTeam(teamData);
        } catch (error) {
            console.error('Failed to load support data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleViewTicket = async (ticket: SupportTicket) => {
        setSelectedTicket(ticket);
        const ticketMessages = await getTicketMessages(ticket.id, true); // Include internal notes for support
        setMessages(ticketMessages);
    };

    const handleCloseDetail = () => {
        setSelectedTicket(null);
        setMessages([]);
        setReplyText('');
        setIsInternalNote(false);
    };

    const handleSendReply = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!replyText.trim() || !selectedTicket) return;

        setSending(true);
        try {
            const message = await addTicketMessage(
                selectedTicket.id,
                user?.id || 'support_user',
                user?.name || 'Support Team',
                'support',
                replyText,
                isInternalNote
            );

            if (message) {
                setMessages([...messages, message]);
                setReplyText('');

                // Refresh ticket
                const updatedTicket = await getTicketById(selectedTicket.id);
                if (updatedTicket) {
                    setSelectedTicket(updatedTicket);
                    // Update in list
                    setTickets(tickets.map(t => t.id === updatedTicket.id ? updatedTicket : t));
                }
            }
        } catch (error) {
            console.error('Failed to send reply:', error);
        } finally {
            setSending(false);
        }
    };

    const handleUpdateStatus = async (newStatus: TicketStatus) => {
        if (!selectedTicket) return;

        const resolution = newStatus === 'resolved'
            ? prompt('Enter resolution summary:')
            : undefined;

        const updated = await updateTicket(selectedTicket.id, {
            status: newStatus,
            resolution: resolution || undefined
        }, user?.id);

        if (updated) {
            setSelectedTicket(updated);
            setTickets(tickets.map(t => t.id === updated.id ? updated : t));
            loadData(); // Refresh stats
        }
    };

    const handleAssign = async (assigneeId: string) => {
        if (!selectedTicket) return;

        const assignee = supportTeam.find(m => m.id === assigneeId);
        if (!assignee) return;

        const updated = await assignTicket(selectedTicket.id, assigneeId, assignee.name);
        if (updated) {
            setSelectedTicket(updated);
            setTickets(tickets.map(t => t.id === updated.id ? updated : t));
            setShowAssignModal(false);
            loadData();
        }
    };

    // Filter tickets
    const filteredTickets = tickets.filter(t => {
        if (searchQuery) {
            const search = searchQuery.toLowerCase();
            if (!t.subject.toLowerCase().includes(search) &&
                !t.ticketNumber.toLowerCase().includes(search) &&
                !t.userName?.toLowerCase().includes(search)) {
                return false;
            }
        }
        if (statusFilter && t.status !== statusFilter) return false;
        if (priorityFilter && t.priority !== priorityFilter) return false;
        return true;
    });

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6">
                <div className="bg-slate-800 rounded-2xl p-8 text-center max-w-md border border-slate-700">
                    <Headphones className="w-16 h-16 text-violet-500 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-white mb-2">Support Dashboard</h2>
                    <p className="text-slate-400 mb-6">Please login with your support team credentials.</p>
                    <Link href="/login?redirect=/support/dashboard" className="px-6 py-3 bg-violet-600 text-white rounded-xl font-semibold hover:bg-violet-700 transition-colors inline-block">
                        Login
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-900">
            {/* Header */}
            <header className="bg-slate-800 border-b border-slate-700 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="p-2 bg-violet-500/20 rounded-xl">
                            <Headphones className="w-6 h-6 text-violet-400" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-white">Support Dashboard</h1>
                            <p className="text-sm text-slate-400">Manage and resolve customer tickets</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <button onClick={loadData} className="p-2 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white transition-colors">
                            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                        </button>
                        <Link href="/dashboard" className="px-4 py-2 text-sm text-slate-400 hover:text-white font-medium">
                            Main Dashboard
                        </Link>
                    </div>
                </div>
            </header>

            <div className="max-w-7xl mx-auto px-6 py-6">
                {/* Stats Cards */}
                {stats && (
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-6">
                        <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
                            <p className="text-3xl font-bold text-white">{stats.total}</p>
                            <p className="text-sm text-slate-400">Total Tickets</p>
                        </div>
                        <div className="bg-slate-800 rounded-xl p-4 border border-blue-500/30">
                            <p className="text-3xl font-bold text-blue-400">{stats.open}</p>
                            <p className="text-sm text-slate-400">Open</p>
                        </div>
                        <div className="bg-slate-800 rounded-xl p-4 border border-amber-500/30">
                            <p className="text-3xl font-bold text-amber-400">{stats.inProgress}</p>
                            <p className="text-sm text-slate-400">In Progress</p>
                        </div>
                        <div className="bg-slate-800 rounded-xl p-4 border border-orange-500/30">
                            <p className="text-3xl font-bold text-orange-400">{stats.waitingOnSupport}</p>
                            <p className="text-sm text-slate-400">Needs Response</p>
                        </div>
                        <div className="bg-slate-800 rounded-xl p-4 border border-emerald-500/30">
                            <p className="text-3xl font-bold text-emerald-400">{stats.resolved}</p>
                            <p className="text-sm text-slate-400">Resolved</p>
                        </div>
                        <div className="bg-slate-800 rounded-xl p-4 border border-slate-600">
                            <p className="text-3xl font-bold text-slate-300">{stats.avgResolutionTime}h</p>
                            <p className="text-sm text-slate-400">Avg Resolution</p>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Ticket List */}
                    <div className={`${selectedTicket ? 'hidden lg:block' : ''} lg:col-span-1`}>
                        {/* Tabs */}
                        <div className="flex gap-1 mb-4 bg-slate-800 rounded-xl p-1">
                            {[
                                { id: 'all', label: 'All' },
                                { id: 'open', label: 'Open' },
                                { id: 'mine', label: 'My Tickets' },
                                { id: 'unassigned', label: 'Unassigned' },
                                { id: 'resolved', label: 'Resolved' },
                            ].map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id as TabType)}
                                    className={`flex-1 px-3 py-2 text-xs font-medium rounded-lg transition-colors ${activeTab === tab.id
                                            ? 'bg-violet-600 text-white'
                                            : 'text-slate-400 hover:text-white hover:bg-slate-700'
                                        }`}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>

                        {/* Search & Filters */}
                        <div className="flex gap-2 mb-4">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                <input
                                    type="text"
                                    placeholder="Search..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-9 pr-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 text-sm"
                                />
                            </div>
                        </div>

                        {/* Ticket List */}
                        <div className="space-y-2 max-h-[calc(100vh-300px)] overflow-y-auto pr-1">
                            {loading ? (
                                <div className="text-center py-8">
                                    <RefreshCw className="w-6 h-6 text-violet-500 animate-spin mx-auto mb-2" />
                                    <p className="text-slate-500 text-sm">Loading tickets...</p>
                                </div>
                            ) : filteredTickets.length === 0 ? (
                                <div className="text-center py-8">
                                    <CheckCircle2 className="w-12 h-12 text-emerald-500/50 mx-auto mb-2" />
                                    <p className="text-slate-400">No tickets in this view</p>
                                </div>
                            ) : (
                                filteredTickets.map((ticket) => {
                                    const statusConfig = TICKET_STATUS_CONFIG[ticket.status];
                                    const priorityConfig = TICKET_PRIORITY_CONFIG[ticket.priority];

                                    return (
                                        <button
                                            key={ticket.id}
                                            onClick={() => handleViewTicket(ticket)}
                                            className={`w-full text-left p-4 rounded-xl border transition-all ${selectedTicket?.id === ticket.id
                                                    ? 'bg-violet-600/20 border-violet-500'
                                                    : 'bg-slate-800 border-slate-700 hover:border-slate-600'
                                                }`}
                                        >
                                            <div className="flex items-start justify-between gap-2 mb-2">
                                                <span className="text-xs font-mono text-slate-500">{ticket.ticketNumber}</span>
                                                <span className={`px-1.5 py-0.5 text-[10px] font-bold rounded ${priorityConfig.bgColor} ${priorityConfig.color}`}>
                                                    {priorityConfig.icon}
                                                </span>
                                            </div>
                                            <h4 className="text-sm font-medium text-white line-clamp-1 mb-1">{ticket.subject}</h4>
                                            <p className="text-xs text-slate-400 line-clamp-1 mb-2">{ticket.userName} • {ticket.userEmail}</p>
                                            <div className="flex items-center justify-between">
                                                <span className={`px-2 py-0.5 text-[10px] font-medium rounded-full ${statusConfig.bgColor} ${statusConfig.color}`}>
                                                    {statusConfig.label}
                                                </span>
                                                <span className="text-[10px] text-slate-500">
                                                    {new Date(ticket.createdAt).toLocaleDateString()}
                                                </span>
                                            </div>
                                        </button>
                                    );
                                })
                            )}
                        </div>
                    </div>

                    {/* Ticket Detail */}
                    {selectedTicket && (
                        <div className="lg:col-span-2">
                            <div className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden">
                                {/* Header */}
                                <div className="p-4 border-b border-slate-700 flex items-start justify-between gap-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-xs font-mono text-slate-500">{selectedTicket.ticketNumber}</span>
                                            {selectedTicket.source === 'nandu' && (
                                                <span className="flex items-center gap-1 px-2 py-0.5 bg-violet-500/20 text-violet-400 text-[10px] font-bold rounded-full">
                                                    <Sparkles className="w-3 h-3" /> Nandu Escalation
                                                </span>
                                            )}
                                        </div>
                                        <h2 className="text-lg font-bold text-white">{selectedTicket.subject}</h2>
                                        <p className="text-sm text-slate-400 mt-1">
                                            From: {selectedTicket.userName} ({selectedTicket.userEmail})
                                        </p>
                                    </div>
                                    <button onClick={handleCloseDetail} className="p-2 hover:bg-slate-700 rounded-lg lg:hidden">
                                        <X className="w-5 h-5 text-slate-400" />
                                    </button>
                                </div>

                                {/* Actions Bar */}
                                <div className="p-3 border-b border-slate-700 flex flex-wrap gap-2">
                                    <select
                                        value={selectedTicket.status}
                                        onChange={(e) => handleUpdateStatus(e.target.value as TicketStatus)}
                                        className="px-3 py-1.5 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:border-violet-500"
                                    >
                                        <option value="open">Open</option>
                                        <option value="in_progress">In Progress</option>
                                        <option value="waiting_on_customer">Waiting on Customer</option>
                                        <option value="waiting_on_support">Waiting on Support</option>
                                        <option value="resolved">Resolved</option>
                                        <option value="closed">Closed</option>
                                    </select>

                                    <button
                                        onClick={() => setShowAssignModal(true)}
                                        className="px-3 py-1.5 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm hover:bg-slate-600 flex items-center gap-2"
                                    >
                                        <UserPlus className="w-4 h-4" />
                                        {selectedTicket.assignedToName || 'Assign'}
                                    </button>

                                    <select
                                        value={selectedTicket.priority}
                                        onChange={(e) => updateTicket(selectedTicket.id, { priority: e.target.value as TicketPriority })}
                                        className="px-3 py-1.5 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:border-violet-500"
                                    >
                                        <option value="low">Low Priority</option>
                                        <option value="medium">Medium Priority</option>
                                        <option value="high">High Priority</option>
                                        <option value="critical">Critical</option>
                                    </select>
                                </div>

                                {/* Messages */}
                                <div className="p-4 space-y-4 max-h-[400px] overflow-y-auto">
                                    {messages.map((msg) => (
                                        <div key={msg.id} className={`flex gap-3 ${msg.senderType === 'support' ? 'flex-row-reverse' : ''}`}>
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold ${msg.senderType === 'user'
                                                    ? 'bg-blue-500/20 text-blue-400'
                                                    : msg.senderType === 'support'
                                                        ? 'bg-emerald-500/20 text-emerald-400'
                                                        : msg.senderType === 'nandu'
                                                            ? 'bg-violet-500/20 text-violet-400'
                                                            : 'bg-slate-700 text-slate-400'
                                                }`}>
                                                {msg.senderType === 'nandu' ? <Sparkles className="w-4 h-4" /> : msg.senderName?.[0] || '?'}
                                            </div>
                                            <div className={`flex-1 max-w-[80%] ${msg.senderType === 'support' ? 'text-right' : ''}`}>
                                                <div className={`flex items-center gap-2 mb-1 ${msg.senderType === 'support' ? 'justify-end' : ''}`}>
                                                    <span className="text-xs font-medium text-slate-300">{msg.senderName}</span>
                                                    {msg.isInternal && (
                                                        <span className="px-1.5 py-0.5 bg-amber-500/20 text-amber-400 text-[10px] font-bold rounded">Internal</span>
                                                    )}
                                                    <span className="text-[10px] text-slate-500">
                                                        {new Date(msg.createdAt).toLocaleString()}
                                                    </span>
                                                </div>
                                                <div className={`inline-block px-4 py-2.5 rounded-xl text-sm ${msg.isInternal
                                                        ? 'bg-amber-500/10 text-amber-200 border border-amber-500/30'
                                                        : msg.senderType === 'support'
                                                            ? 'bg-emerald-600 text-white'
                                                            : 'bg-slate-700 text-slate-200'
                                                    }`}>
                                                    <p className="whitespace-pre-wrap">{msg.message}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Reply Form */}
                                <form onSubmit={handleSendReply} className="p-4 border-t border-slate-700">
                                    <div className="flex items-center gap-2 mb-2">
                                        <label className="flex items-center gap-2 text-sm text-slate-400 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={isInternalNote}
                                                onChange={(e) => setIsInternalNote(e.target.checked)}
                                                className="rounded border-slate-600 bg-slate-700 text-violet-600 focus:ring-violet-500"
                                            />
                                            Internal note (not visible to customer)
                                        </label>
                                    </div>
                                    <div className="flex gap-2">
                                        <textarea
                                            value={replyText}
                                            onChange={(e) => setReplyText(e.target.value)}
                                            placeholder={isInternalNote ? "Add internal note..." : "Type your reply..."}
                                            rows={2}
                                            className="flex-1 px-4 py-2 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 resize-none"
                                        />
                                        <button
                                            type="submit"
                                            disabled={sending || !replyText.trim()}
                                            className={`px-4 py-2 rounded-xl font-medium transition-colors disabled:opacity-50 ${isInternalNote
                                                    ? 'bg-amber-600 text-white hover:bg-amber-700'
                                                    : 'bg-emerald-600 text-white hover:bg-emerald-700'
                                                }`}
                                        >
                                            <Send className="w-5 h-5" />
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}

                    {/* Empty State when no ticket selected on desktop */}
                    {!selectedTicket && (
                        <div className="hidden lg:flex lg:col-span-2 bg-slate-800 rounded-2xl border border-slate-700 items-center justify-center p-12">
                            <div className="text-center">
                                <MessageSquare className="w-16 h-16 text-slate-700 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-slate-400">Select a ticket to view details</h3>
                                <p className="text-sm text-slate-500 mt-1">Click on any ticket from the list to start</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Assignment Modal */}
            {showAssignModal && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
                    <div className="bg-slate-800 rounded-2xl border border-slate-700 w-full max-w-md">
                        <div className="p-4 border-b border-slate-700 flex items-center justify-between">
                            <h3 className="font-bold text-white">Assign Ticket</h3>
                            <button onClick={() => setShowAssignModal(false)} className="p-1 hover:bg-slate-700 rounded">
                                <X className="w-5 h-5 text-slate-400" />
                            </button>
                        </div>
                        <div className="p-4 space-y-2">
                            {supportTeam.map((member) => (
                                <button
                                    key={member.id}
                                    onClick={() => handleAssign(member.id)}
                                    className={`w-full p-3 rounded-xl border text-left transition-all hover:border-violet-500 ${selectedTicket?.assignedToId === member.id
                                            ? 'border-violet-500 bg-violet-500/10'
                                            : 'border-slate-700 hover:bg-slate-700'
                                        }`}
                                >
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="font-medium text-white">{member.name}</p>
                                            <p className="text-sm text-slate-400">{member.email}</p>
                                        </div>
                                        <span className="text-xs px-2 py-1 bg-slate-700 text-slate-300 rounded-full">
                                            {member.activeTickets} active
                                        </span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
