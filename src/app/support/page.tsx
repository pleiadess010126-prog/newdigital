'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
    HelpCircle, Plus, MessageSquare, Clock, CheckCircle2,
    AlertCircle, ChevronRight, Send, Paperclip, ArrowLeft,
    Star, Sparkles, Search, Filter, X
} from 'lucide-react';
import { useAuth } from '@/lib/auth/AuthContext';
import {
    SupportTicket,
    TicketMessage,
    CreateTicketRequest,
    TicketCategory,
    TicketPriority,
    TICKET_STATUS_CONFIG,
    TICKET_PRIORITY_CONFIG,
    TICKET_CATEGORY_CONFIG,
} from '@/types/support';
import {
    getUserTickets,
    createTicket,
    getTicketById,
    addTicketMessage,
    getTicketMessages,
} from '@/lib/support/ticketService';

type ViewMode = 'list' | 'create' | 'detail';

export default function SupportPage() {
    const { user, isAuthenticated } = useAuth();
    const [viewMode, setViewMode] = useState<ViewMode>('list');
    const [tickets, setTickets] = useState<SupportTicket[]>([]);
    const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
    const [messages, setMessages] = useState<TicketMessage[]>([]);
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);

    // Form state
    const [newTicket, setNewTicket] = useState<CreateTicketRequest>({
        subject: '',
        description: '',
        category: 'general',
        priority: 'medium',
    });
    const [newMessage, setNewMessage] = useState('');
    const [searchQuery, setSearchQuery] = useState('');

    // Load user tickets
    useEffect(() => {
        if (isAuthenticated && user) {
            loadTickets();
        }
    }, [isAuthenticated, user]);

    const loadTickets = async () => {
        setLoading(true);
        try {
            const userTickets = await getUserTickets(user?.id || 'demo_user');
            setTickets(userTickets);
        } catch (error) {
            console.error('Failed to load tickets:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateTicket = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTicket.subject.trim() || !newTicket.description.trim()) return;

        setSending(true);
        try {
            const ticket = await createTicket(
                user?.id || 'demo_user',
                user?.name || 'Demo User',
                user?.email || 'demo@example.com',
                newTicket
            );

            setTickets([ticket, ...tickets]);
            setNewTicket({ subject: '', description: '', category: 'general', priority: 'medium' });
            setViewMode('list');

            // Show success message
            alert(`Ticket ${ticket.ticketNumber} created successfully! Our support team will respond soon.`);
        } catch (error) {
            console.error('Failed to create ticket:', error);
            alert('Failed to create ticket. Please try again.');
        } finally {
            setSending(false);
        }
    };

    const handleViewTicket = async (ticket: SupportTicket) => {
        setSelectedTicket(ticket);
        setViewMode('detail');

        // Load messages
        const ticketMessages = await getTicketMessages(ticket.id);
        setMessages(ticketMessages);
    };

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !selectedTicket) return;

        setSending(true);
        try {
            const message = await addTicketMessage(
                selectedTicket.id,
                user?.id || 'demo_user',
                user?.name || 'Demo User',
                'user',
                newMessage
            );

            if (message) {
                setMessages([...messages, message]);
                setNewMessage('');

                // Refresh ticket
                const updatedTicket = await getTicketById(selectedTicket.id);
                if (updatedTicket) setSelectedTicket(updatedTicket);
            }
        } catch (error) {
            console.error('Failed to send message:', error);
        } finally {
            setSending(false);
        }
    };

    const filteredTickets = tickets.filter(t =>
        t.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.ticketNumber.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-violet-50 flex items-center justify-center p-6">
                <div className="bg-white rounded-3xl shadow-xl p-8 text-center max-w-md">
                    <HelpCircle className="w-16 h-16 text-violet-500 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-slate-800 mb-2">Support Center</h2>
                    <p className="text-slate-500 mb-6">Please login to access the support center and manage your tickets.</p>
                    <Link href="/login?redirect=/support" className="px-6 py-3 bg-violet-600 text-white rounded-xl font-semibold hover:bg-violet-700 transition-colors">
                        Login to Continue
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-violet-50">
            {/* Header */}
            <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
                <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        {viewMode !== 'list' && (
                            <button
                                onClick={() => { setViewMode('list'); setSelectedTicket(null); }}
                                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                            >
                                <ArrowLeft className="w-5 h-5 text-slate-600" />
                            </button>
                        )}
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-violet-100 rounded-xl">
                                <HelpCircle className="w-6 h-6 text-violet-600" />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold text-slate-800">Support Center</h1>
                                <p className="text-sm text-slate-500">
                                    {viewMode === 'list' && 'Manage your support tickets'}
                                    {viewMode === 'create' && 'Create a new ticket'}
                                    {viewMode === 'detail' && selectedTicket?.ticketNumber}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <Link
                            href="/dashboard"
                            className="px-4 py-2 text-sm text-slate-600 hover:text-slate-800 font-medium"
                        >
                            Back to Dashboard
                        </Link>
                        {viewMode === 'list' && (
                            <button
                                onClick={() => setViewMode('create')}
                                className="px-4 py-2 bg-violet-600 text-white rounded-xl font-semibold hover:bg-violet-700 transition-colors flex items-center gap-2"
                            >
                                <Plus className="w-4 h-4" />
                                New Ticket
                            </button>
                        )}
                    </div>
                </div>
            </header>

            <main className="max-w-6xl mx-auto px-6 py-8">
                {/* List View */}
                {viewMode === 'list' && (
                    <div className="space-y-6">
                        {/* Search & Stats */}
                        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                            <div className="relative flex-1 max-w-md">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="Search tickets..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500"
                                />
                            </div>

                            <div className="flex items-center gap-4 text-sm">
                                <span className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-full font-medium">
                                    {tickets.filter(t => t.status === 'open' || t.status === 'in_progress').length} Active
                                </span>
                                <span className="px-3 py-1.5 bg-emerald-100 text-emerald-700 rounded-full font-medium">
                                    {tickets.filter(t => t.status === 'resolved' || t.status === 'closed').length} Resolved
                                </span>
                            </div>
                        </div>

                        {/* Tickets List */}
                        {loading ? (
                            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
                                <div className="w-8 h-8 border-2 border-violet-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                                <p className="text-slate-500">Loading your tickets...</p>
                            </div>
                        ) : filteredTickets.length === 0 ? (
                            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
                                <MessageSquare className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                                <h3 className="text-lg font-semibold text-slate-700 mb-2">No tickets yet</h3>
                                <p className="text-slate-500 mb-6">Have a question or need help? Create a support ticket and our team will assist you.</p>
                                <button
                                    onClick={() => setViewMode('create')}
                                    className="px-6 py-3 bg-violet-600 text-white rounded-xl font-semibold hover:bg-violet-700 transition-colors"
                                >
                                    Create Your First Ticket
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {filteredTickets.map((ticket) => {
                                    const statusConfig = TICKET_STATUS_CONFIG[ticket.status];
                                    const priorityConfig = TICKET_PRIORITY_CONFIG[ticket.priority];
                                    const categoryConfig = TICKET_CATEGORY_CONFIG[ticket.category];

                                    return (
                                        <button
                                            key={ticket.id}
                                            onClick={() => handleViewTicket(ticket)}
                                            className="w-full bg-white rounded-2xl border border-slate-200 p-5 hover:border-violet-300 hover:shadow-lg hover:shadow-violet-500/10 transition-all text-left group"
                                        >
                                            <div className="flex items-start justify-between gap-4">
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <span className="text-xs font-mono text-slate-400">{ticket.ticketNumber}</span>
                                                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusConfig.bgColor} ${statusConfig.color}`}>
                                                            {statusConfig.label}
                                                        </span>
                                                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${priorityConfig.bgColor} ${priorityConfig.color}`}>
                                                            {priorityConfig.icon} {priorityConfig.label}
                                                        </span>
                                                    </div>
                                                    <h3 className="font-semibold text-slate-800 group-hover:text-violet-600 transition-colors truncate">
                                                        {ticket.subject}
                                                    </h3>
                                                    <p className="text-sm text-slate-500 mt-1 line-clamp-2">{ticket.description}</p>
                                                    <div className="flex items-center gap-4 mt-3 text-xs text-slate-400">
                                                        <span className="flex items-center gap-1">
                                                            <span>{categoryConfig.icon}</span>
                                                            {categoryConfig.label}
                                                        </span>
                                                        <span className="flex items-center gap-1">
                                                            <Clock className="w-3 h-3" />
                                                            {new Date(ticket.createdAt).toLocaleDateString()}
                                                        </span>
                                                        {ticket.messageCount && ticket.messageCount > 1 && (
                                                            <span className="flex items-center gap-1">
                                                                <MessageSquare className="w-3 h-3" />
                                                                {ticket.messageCount} messages
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                                <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-violet-500 transition-colors flex-shrink-0" />
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}

                {/* Create Ticket View */}
                {viewMode === 'create' && (
                    <div className="max-w-2xl mx-auto">
                        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                            <div className="p-6 border-b border-slate-100">
                                <h2 className="text-xl font-bold text-slate-800">Create Support Ticket</h2>
                                <p className="text-slate-500 mt-1">Describe your issue and we'll get back to you as soon as possible.</p>
                            </div>

                            <form onSubmit={handleCreateTicket} className="p-6 space-y-6">
                                {/* Category Selection */}
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-3">What do you need help with?</label>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                        {(Object.entries(TICKET_CATEGORY_CONFIG) as [TicketCategory, typeof TICKET_CATEGORY_CONFIG[TicketCategory]][]).map(([key, config]) => (
                                            <button
                                                key={key}
                                                type="button"
                                                onClick={() => setNewTicket({ ...newTicket, category: key })}
                                                className={`p-3 rounded-xl border text-center transition-all ${newTicket.category === key
                                                        ? 'border-violet-500 bg-violet-50 text-violet-700'
                                                        : 'border-slate-200 hover:border-slate-300'
                                                    }`}
                                            >
                                                <span className="text-2xl mb-1 block">{config.icon}</span>
                                                <span className="text-xs font-medium">{config.label}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Subject */}
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">Subject</label>
                                    <input
                                        type="text"
                                        value={newTicket.subject}
                                        onChange={(e) => setNewTicket({ ...newTicket, subject: e.target.value })}
                                        placeholder="Brief summary of your issue"
                                        className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500"
                                        required
                                    />
                                </div>

                                {/* Description */}
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">Description</label>
                                    <textarea
                                        value={newTicket.description}
                                        onChange={(e) => setNewTicket({ ...newTicket, description: e.target.value })}
                                        placeholder="Please describe your issue in detail. Include any error messages, steps to reproduce, or screenshots if applicable."
                                        rows={6}
                                        className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 resize-none"
                                        required
                                    />
                                </div>

                                {/* Priority */}
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">Priority</label>
                                    <div className="flex gap-3">
                                        {(Object.entries(TICKET_PRIORITY_CONFIG) as [TicketPriority, typeof TICKET_PRIORITY_CONFIG[TicketPriority]][]).map(([key, config]) => (
                                            <button
                                                key={key}
                                                type="button"
                                                onClick={() => setNewTicket({ ...newTicket, priority: key })}
                                                className={`flex-1 px-4 py-2.5 rounded-xl border font-medium transition-all ${newTicket.priority === key
                                                        ? `${config.bgColor} ${config.color} border-current`
                                                        : 'border-slate-200 text-slate-600 hover:border-slate-300'
                                                    }`}
                                            >
                                                {config.icon} {config.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Submit */}
                                <div className="flex gap-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => setViewMode('list')}
                                        className="flex-1 px-6 py-3 border border-slate-200 text-slate-600 rounded-xl font-semibold hover:bg-slate-50 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={sending || !newTicket.subject.trim() || !newTicket.description.trim()}
                                        className="flex-1 px-6 py-3 bg-violet-600 text-white rounded-xl font-semibold hover:bg-violet-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                    >
                                        {sending ? (
                                            <>
                                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                Creating...
                                            </>
                                        ) : (
                                            <>
                                                <Send className="w-4 h-4" />
                                                Create Ticket
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Ticket Detail View */}
                {viewMode === 'detail' && selectedTicket && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Messages */}
                        <div className="lg:col-span-2">
                            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                                <div className="p-4 border-b border-slate-100">
                                    <h2 className="font-bold text-slate-800">{selectedTicket.subject}</h2>
                                </div>

                                {/* Message Thread */}
                                <div className="p-4 space-y-4 max-h-[500px] overflow-y-auto">
                                    {messages.map((msg) => (
                                        <div
                                            key={msg.id}
                                            className={`flex gap-3 ${msg.senderType === 'user' ? 'flex-row-reverse' : ''}`}
                                        >
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${msg.senderType === 'user'
                                                    ? 'bg-violet-100 text-violet-600'
                                                    : msg.senderType === 'support'
                                                        ? 'bg-emerald-100 text-emerald-600'
                                                        : 'bg-slate-100 text-slate-600'
                                                }`}>
                                                {msg.senderType === 'nandu' ? (
                                                    <Sparkles className="w-5 h-5" />
                                                ) : (
                                                    <span className="text-sm font-bold">{msg.senderName?.[0] || '?'}</span>
                                                )}
                                            </div>
                                            <div className={`flex-1 max-w-[80%] ${msg.senderType === 'user' ? 'text-right' : ''}`}>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="text-sm font-medium text-slate-700">{msg.senderName}</span>
                                                    <span className="text-xs text-slate-400">
                                                        {new Date(msg.createdAt).toLocaleString()}
                                                    </span>
                                                </div>
                                                <div className={`inline-block px-4 py-3 rounded-2xl ${msg.senderType === 'user'
                                                        ? 'bg-violet-600 text-white rounded-br-md'
                                                        : 'bg-slate-100 text-slate-800 rounded-bl-md'
                                                    }`}>
                                                    <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Reply Form */}
                                {selectedTicket.status !== 'closed' && (
                                    <form onSubmit={handleSendMessage} className="p-4 border-t border-slate-100">
                                        <div className="flex gap-3">
                                            <input
                                                type="text"
                                                value={newMessage}
                                                onChange={(e) => setNewMessage(e.target.value)}
                                                placeholder="Type your message..."
                                                className="flex-1 px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500"
                                            />
                                            <button
                                                type="submit"
                                                disabled={sending || !newMessage.trim()}
                                                className="px-4 py-3 bg-violet-600 text-white rounded-xl hover:bg-violet-700 transition-colors disabled:opacity-50"
                                            >
                                                <Send className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </form>
                                )}
                            </div>
                        </div>

                        {/* Ticket Info Sidebar */}
                        <div className="space-y-4">
                            <div className="bg-white rounded-2xl border border-slate-200 p-5">
                                <h3 className="font-semibold text-slate-800 mb-4">Ticket Details</h3>
                                <div className="space-y-3 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-slate-500">Ticket #</span>
                                        <span className="font-mono font-medium">{selectedTicket.ticketNumber}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-slate-500">Status</span>
                                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${TICKET_STATUS_CONFIG[selectedTicket.status].bgColor} ${TICKET_STATUS_CONFIG[selectedTicket.status].color}`}>
                                            {TICKET_STATUS_CONFIG[selectedTicket.status].label}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-slate-500">Priority</span>
                                        <span className={`font-medium ${TICKET_PRIORITY_CONFIG[selectedTicket.priority].color}`}>
                                            {TICKET_PRIORITY_CONFIG[selectedTicket.priority].icon} {TICKET_PRIORITY_CONFIG[selectedTicket.priority].label}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-slate-500">Category</span>
                                        <span className="font-medium">
                                            {TICKET_CATEGORY_CONFIG[selectedTicket.category].icon} {TICKET_CATEGORY_CONFIG[selectedTicket.category].label}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-slate-500">Created</span>
                                        <span className="font-medium">{new Date(selectedTicket.createdAt).toLocaleDateString()}</span>
                                    </div>
                                    {selectedTicket.assignedToName && (
                                        <div className="flex justify-between">
                                            <span className="text-slate-500">Assigned To</span>
                                            <span className="font-medium">{selectedTicket.assignedToName}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Satisfaction Rating (if resolved) */}
                            {selectedTicket.status === 'resolved' && !selectedTicket.rating && (
                                <div className="bg-emerald-50 rounded-2xl border border-emerald-200 p-5 text-center">
                                    <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
                                    <h3 className="font-semibold text-emerald-800 mb-2">Ticket Resolved!</h3>
                                    <p className="text-sm text-emerald-700 mb-3">How was your experience?</p>
                                    <div className="flex justify-center gap-2">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <button key={star} className="p-1 hover:scale-110 transition-transform">
                                                <Star className="w-6 h-6 text-amber-400 hover:fill-amber-400" />
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
