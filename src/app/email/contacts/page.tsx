'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    Users, Plus, Search, Filter, Upload, Download, Trash2,
    Mail, Building2, Phone, Tag, MoreVertical, ChevronRight,
    CheckCircle2, XCircle, Clock, TrendingUp, ArrowLeft
} from 'lucide-react';

interface Contact {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
    company?: string;
    phone?: string;
    status: 'lead' | 'mql' | 'sql' | 'opportunity' | 'customer' | 'churned';
    leadScore: number;
    tags?: string[];
    source?: string;
    createdAt: string;
    lastActivityAt?: string;
}

const statusConfig = {
    lead: { label: 'Lead', color: 'bg-slate-100 text-slate-700' },
    mql: { label: 'MQL', color: 'bg-blue-100 text-blue-700' },
    sql: { label: 'SQL', color: 'bg-violet-100 text-violet-700' },
    opportunity: { label: 'Opportunity', color: 'bg-amber-100 text-amber-700' },
    customer: { label: 'Customer', color: 'bg-emerald-100 text-emerald-700' },
    churned: { label: 'Churned', color: 'bg-red-100 text-red-700' },
};

export default function ContactsPage() {
    const router = useRouter();
    const [contacts, setContacts] = useState<Contact[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('');
    const [showAddModal, setShowAddModal] = useState(false);
    const [selectedContacts, setSelectedContacts] = useState<string[]>([]);
    const [pagination, setPagination] = useState({ page: 1, total: 0, totalPages: 0 });

    useEffect(() => {
        fetchContacts();
    }, [statusFilter, pagination.page]);

    const fetchContacts = async () => {
        try {
            const params = new URLSearchParams({
                page: pagination.page.toString(),
                limit: '25',
            });
            if (statusFilter) params.set('status', statusFilter);
            if (searchQuery) params.set('search', searchQuery);

            const response = await fetch(`/api/email/contacts?${params}`);
            const data = await response.json();
            setContacts(data.contacts || []);
            setPagination(prev => ({
                ...prev,
                total: data.pagination?.total || 0,
                totalPages: data.pagination?.totalPages || 0,
            }));
        } catch (error) {
            console.error('Error fetching contacts:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = () => {
        setPagination(prev => ({ ...prev, page: 1 }));
        fetchContacts();
    };

    const toggleSelectContact = (id: string) => {
        setSelectedContacts(prev =>
            prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
        );
    };

    const toggleSelectAll = () => {
        if (selectedContacts.length === contacts.length) {
            setSelectedContacts([]);
        } else {
            setSelectedContacts(contacts.map(c => c.id));
        }
    };

    const getLeadScoreColor = (score: number) => {
        if (score >= 80) return 'text-emerald-600 bg-emerald-50';
        if (score >= 50) return 'text-amber-600 bg-amber-50';
        return 'text-slate-600 bg-slate-50';
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-violet-50">
            {/* Header */}
            <div className="bg-white border-b border-slate-200">
                <div className="max-w-7xl mx-auto px-6 py-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Link
                                href="/email"
                                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                            >
                                <ArrowLeft className="w-5 h-5" />
                            </Link>
                            <div>
                                <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
                                    <div className="p-2 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl">
                                        <Users className="w-6 h-6 text-white" />
                                    </div>
                                    Contacts
                                </h1>
                                <p className="text-slate-500 mt-1">Manage your email contacts and segments</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <button className="px-4 py-2 text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors flex items-center gap-2">
                                <Upload className="w-4 h-4" />
                                Import
                            </button>
                            <button className="px-4 py-2 text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors flex items-center gap-2">
                                <Download className="w-4 h-4" />
                                Export
                            </button>
                            <button
                                onClick={() => setShowAddModal(true)}
                                className="px-4 py-2 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white rounded-lg font-medium hover:from-violet-500 hover:to-fuchsia-500 transition-all flex items-center gap-2 shadow-lg shadow-violet-500/25"
                            >
                                <Plus className="w-4 h-4" />
                                Add Contact
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-8">
                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                    <div className="bg-white rounded-2xl border border-slate-200 p-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-blue-100 rounded-xl">
                                <Users className="w-6 h-6 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-slate-800">{pagination.total.toLocaleString()}</p>
                                <p className="text-sm text-slate-500">Total Contacts</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-2xl border border-slate-200 p-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-emerald-100 rounded-xl">
                                <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-slate-800">
                                    {contacts.filter(c => c.status === 'customer').length}
                                </p>
                                <p className="text-sm text-slate-500">Customers</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-2xl border border-slate-200 p-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-violet-100 rounded-xl">
                                <TrendingUp className="w-6 h-6 text-violet-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-slate-800">
                                    {contacts.filter(c => c.leadScore >= 50).length}
                                </p>
                                <p className="text-sm text-slate-500">Hot Leads</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-2xl border border-slate-200 p-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-amber-100 rounded-xl">
                                <Clock className="w-6 h-6 text-amber-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-slate-800">
                                    {contacts.filter(c => {
                                        if (!c.lastActivityAt) return false;
                                        const days = (Date.now() - new Date(c.lastActivityAt).getTime()) / (1000 * 60 * 60 * 24);
                                        return days <= 7;
                                    }).length}
                                </p>
                                <p className="text-sm text-slate-500">Active (7 days)</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-2xl border border-slate-200 p-4 mb-6">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search by email, name, or company..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                            />
                        </div>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 bg-white"
                        >
                            <option value="">All Status</option>
                            <option value="lead">Lead</option>
                            <option value="mql">MQL</option>
                            <option value="sql">SQL</option>
                            <option value="opportunity">Opportunity</option>
                            <option value="customer">Customer</option>
                            <option value="churned">Churned</option>
                        </select>
                        <button
                            onClick={handleSearch}
                            className="px-4 py-2.5 bg-violet-600 text-white rounded-xl font-medium hover:bg-violet-500 transition-colors"
                        >
                            Search
                        </button>
                    </div>
                </div>

                {/* Contacts Table */}
                <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                    {loading ? (
                        <div className="p-12 text-center">
                            <div className="w-8 h-8 border-2 border-violet-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                            <p className="text-slate-500">Loading contacts...</p>
                        </div>
                    ) : contacts.length === 0 ? (
                        <div className="p-12 text-center">
                            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Users className="w-8 h-8 text-slate-400" />
                            </div>
                            <h3 className="text-lg font-semibold text-slate-800 mb-2">No contacts yet</h3>
                            <p className="text-slate-500 mb-6">Add your first contact or import from a CSV file</p>
                            <button
                                onClick={() => setShowAddModal(true)}
                                className="px-6 py-3 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white rounded-xl font-medium hover:from-violet-500 hover:to-fuchsia-500 transition-all inline-flex items-center gap-2"
                            >
                                <Plus className="w-5 h-5" />
                                Add Contact
                            </button>
                        </div>
                    ) : (
                        <>
                            <table className="w-full">
                                <thead className="bg-slate-50 border-b border-slate-200">
                                    <tr>
                                        <th className="px-6 py-4 text-left">
                                            <input
                                                type="checkbox"
                                                checked={selectedContacts.length === contacts.length}
                                                onChange={toggleSelectAll}
                                                className="w-4 h-4 rounded border-slate-300 text-violet-600 focus:ring-violet-500"
                                            />
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                            Contact
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                            Company
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                            Lead Score
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                            Source
                                        </th>
                                        <th className="px-6 py-4"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {contacts.map((contact) => (
                                        <tr key={contact.id} className="hover:bg-slate-50 transition-colors">
                                            <td className="px-6 py-4">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedContacts.includes(contact.id)}
                                                    onChange={() => toggleSelectContact(contact.id)}
                                                    className="w-4 h-4 rounded border-slate-300 text-violet-600 focus:ring-violet-500"
                                                />
                                            </td>
                                            <td className="px-6 py-4">
                                                <div>
                                                    <p className="font-medium text-slate-800">
                                                        {contact.firstName || contact.lastName
                                                            ? `${contact.firstName || ''} ${contact.lastName || ''}`.trim()
                                                            : contact.email}
                                                    </p>
                                                    <p className="text-sm text-slate-500">{contact.email}</p>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-slate-600">
                                                {contact.company || '-'}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusConfig[contact.status].color}`}>
                                                    {statusConfig[contact.status].label}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${getLeadScoreColor(contact.leadScore)}`}>
                                                    {contact.leadScore}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-slate-500">
                                                {contact.source || '-'}
                                            </td>
                                            <td className="px-6 py-4">
                                                <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg">
                                                    <MoreVertical className="w-4 h-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            {/* Pagination */}
                            <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-between">
                                <p className="text-sm text-slate-500">
                                    Showing {contacts.length} of {pagination.total} contacts
                                </p>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => setPagination(p => ({ ...p, page: p.page - 1 }))}
                                        disabled={pagination.page === 1}
                                        className="px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Previous
                                    </button>
                                    <span className="px-3 py-1.5 text-sm text-slate-600">
                                        Page {pagination.page} of {pagination.totalPages}
                                    </span>
                                    <button
                                        onClick={() => setPagination(p => ({ ...p, page: p.page + 1 }))}
                                        disabled={pagination.page >= pagination.totalPages}
                                        className="px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Next
                                    </button>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Add Contact Modal */}
            {showAddModal && (
                <AddContactModal
                    onClose={() => setShowAddModal(false)}
                    onSuccess={() => {
                        setShowAddModal(false);
                        fetchContacts();
                    }}
                />
            )}
        </div>
    );
}

function AddContactModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({
        email: '',
        firstName: '',
        lastName: '',
        company: '',
        phone: '',
        jobTitle: '',
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.email) return;

        setLoading(true);
        try {
            const response = await fetch('/api/email/contacts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Failed to add contact');
            }

            onSuccess();
        } catch (error) {
            alert((error as Error).message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl w-full max-w-lg m-4 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-200">
                    <h3 className="text-lg font-semibold text-slate-800">Add New Contact</h3>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Email *</label>
                        <input
                            type="email"
                            required
                            value={form.email}
                            onChange={(e) => setForm({ ...form, email: e.target.value })}
                            className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">First Name</label>
                            <input
                                type="text"
                                value={form.firstName}
                                onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Last Name</label>
                            <input
                                type="text"
                                value={form.lastName}
                                onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Company</label>
                        <input
                            type="text"
                            value={form.company}
                            onChange={(e) => setForm({ ...form, company: e.target.value })}
                            className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Phone</label>
                            <input
                                type="tel"
                                value={form.phone}
                                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Job Title</label>
                            <input
                                type="text"
                                value={form.jobTitle}
                                onChange={(e) => setForm({ ...form, jobTitle: e.target.value })}
                                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500"
                            />
                        </div>
                    </div>
                    <div className="flex justify-end gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2.5 text-slate-600 hover:bg-slate-100 rounded-xl font-medium"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-4 py-2.5 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white rounded-xl font-medium hover:from-violet-500 hover:to-fuchsia-500 disabled:opacity-50"
                        >
                            {loading ? 'Adding...' : 'Add Contact'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
