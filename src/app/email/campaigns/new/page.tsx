'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    ArrowLeft, Mail, Users, FileText, Send, Save, Eye,
    Bold, Italic, Link2, Image, List, AlignLeft, Code
} from 'lucide-react';

export default function NewCampaignPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState<'details' | 'content' | 'recipients'>('details');
    const [campaign, setCampaign] = useState({
        name: '',
        subject: '',
        preheader: '',
        fromName: '',
        fromEmail: '',
        replyTo: '',
        htmlContent: '',
    });

    const handleSave = async (sendNow = false) => {
        if (!campaign.name || !campaign.subject) {
            alert('Please fill in campaign name and subject');
            return;
        }

        setLoading(true);
        try {
            const response = await fetch('/api/email/campaigns', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(campaign),
            });

            if (!response.ok) throw new Error('Failed to create campaign');

            const data = await response.json();

            if (sendNow) {
                router.push(`/email/campaigns/${data.id}/recipients`);
            } else {
                router.push('/email');
            }
        } catch (error) {
            console.error('Error creating campaign:', error);
            alert('Failed to create campaign');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-violet-50">
            {/* Header */}
            <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
                <div className="max-w-5xl mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Link
                                href="/email"
                                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                            >
                                <ArrowLeft className="w-5 h-5" />
                            </Link>
                            <div>
                                <h1 className="text-xl font-bold text-slate-800">New Email Campaign</h1>
                                <p className="text-sm text-slate-500">Create and send email campaigns to your contacts</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => handleSave(false)}
                                disabled={loading}
                                className="px-4 py-2 text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors flex items-center gap-2"
                            >
                                <Save className="w-4 h-4" />
                                Save Draft
                            </button>
                            <button
                                onClick={() => handleSave(true)}
                                disabled={loading}
                                className="px-4 py-2 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white rounded-lg font-medium hover:from-violet-500 hover:to-fuchsia-500 transition-all flex items-center gap-2 shadow-lg shadow-violet-500/25"
                            >
                                <Send className="w-4 h-4" />
                                Continue to Recipients
                            </button>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="flex gap-1 mt-4 -mb-px">
                        {[
                            { id: 'details', label: 'Campaign Details', icon: FileText },
                            { id: 'content', label: 'Email Content', icon: Mail },
                            { id: 'recipients', label: 'Recipients', icon: Users },
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                                className={`px-4 py-3 text-sm font-medium rounded-t-lg flex items-center gap-2 transition-colors ${activeTab === tab.id
                                        ? 'bg-white text-violet-600 border border-slate-200 border-b-white -mb-px'
                                        : 'text-slate-500 hover:text-slate-700'
                                    }`}
                            >
                                <tab.icon className="w-4 h-4" />
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-6 py-8">
                {/* Details Tab */}
                {activeTab === 'details' && (
                    <div className="bg-white rounded-2xl border border-slate-200 p-8">
                        <h2 className="text-lg font-semibold text-slate-800 mb-6">Campaign Details</h2>

                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    Campaign Name *
                                </label>
                                <input
                                    type="text"
                                    value={campaign.name}
                                    onChange={(e) => setCampaign({ ...campaign, name: e.target.value })}
                                    placeholder="e.g., January Newsletter"
                                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                                />
                                <p className="text-sm text-slate-400 mt-1">Internal name for your reference</p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    Email Subject *
                                </label>
                                <input
                                    type="text"
                                    value={campaign.subject}
                                    onChange={(e) => setCampaign({ ...campaign, subject: e.target.value })}
                                    placeholder="e.g., Your weekly marketing insights are here!"
                                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    Preview Text
                                </label>
                                <input
                                    type="text"
                                    value={campaign.preheader}
                                    onChange={(e) => setCampaign({ ...campaign, preheader: e.target.value })}
                                    placeholder="Brief preview shown in inbox..."
                                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                                />
                                <p className="text-sm text-slate-400 mt-1">Appears after subject in inbox preview</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        From Name
                                    </label>
                                    <input
                                        type="text"
                                        value={campaign.fromName}
                                        onChange={(e) => setCampaign({ ...campaign, fromName: e.target.value })}
                                        placeholder="Your Company Name"
                                        className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        From Email
                                    </label>
                                    <input
                                        type="email"
                                        value={campaign.fromEmail}
                                        onChange={(e) => setCampaign({ ...campaign, fromEmail: e.target.value })}
                                        placeholder="hello@yourcompany.com"
                                        className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    Reply-To Email
                                </label>
                                <input
                                    type="email"
                                    value={campaign.replyTo}
                                    onChange={(e) => setCampaign({ ...campaign, replyTo: e.target.value })}
                                    placeholder="support@yourcompany.com"
                                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                                />
                            </div>
                        </div>

                        <div className="mt-8 flex justify-end">
                            <button
                                onClick={() => setActiveTab('content')}
                                className="px-6 py-3 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white rounded-xl font-medium hover:from-violet-500 hover:to-fuchsia-500 transition-all"
                            >
                                Continue to Content
                            </button>
                        </div>
                    </div>
                )}

                {/* Content Tab */}
                {activeTab === 'content' && (
                    <div className="bg-white rounded-2xl border border-slate-200 p-8">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-lg font-semibold text-slate-800">Email Content</h2>
                            <div className="flex items-center gap-2">
                                <button className="px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-100 rounded-lg flex items-center gap-1.5">
                                    <Eye className="w-4 h-4" />
                                    Preview
                                </button>
                            </div>
                        </div>

                        {/* Simple Toolbar */}
                        <div className="flex items-center gap-1 p-2 bg-slate-50 rounded-t-xl border border-slate-200 border-b-0">
                            <button className="p-2 text-slate-500 hover:text-slate-700 hover:bg-white rounded-lg">
                                <Bold className="w-4 h-4" />
                            </button>
                            <button className="p-2 text-slate-500 hover:text-slate-700 hover:bg-white rounded-lg">
                                <Italic className="w-4 h-4" />
                            </button>
                            <button className="p-2 text-slate-500 hover:text-slate-700 hover:bg-white rounded-lg">
                                <Link2 className="w-4 h-4" />
                            </button>
                            <button className="p-2 text-slate-500 hover:text-slate-700 hover:bg-white rounded-lg">
                                <Image className="w-4 h-4" />
                            </button>
                            <div className="w-px h-6 bg-slate-200 mx-1" />
                            <button className="p-2 text-slate-500 hover:text-slate-700 hover:bg-white rounded-lg">
                                <List className="w-4 h-4" />
                            </button>
                            <button className="p-2 text-slate-500 hover:text-slate-700 hover:bg-white rounded-lg">
                                <AlignLeft className="w-4 h-4" />
                            </button>
                            <div className="w-px h-6 bg-slate-200 mx-1" />
                            <button className="p-2 text-slate-500 hover:text-slate-700 hover:bg-white rounded-lg">
                                <Code className="w-4 h-4" />
                            </button>
                        </div>

                        <textarea
                            value={campaign.htmlContent}
                            onChange={(e) => setCampaign({ ...campaign, htmlContent: e.target.value })}
                            placeholder="Write your email content here... Use {{firstName}} for personalization."
                            className="w-full h-96 px-4 py-3 border border-slate-200 rounded-b-xl focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent font-mono text-sm"
                        />

                        <div className="mt-4 p-4 bg-violet-50 rounded-xl">
                            <h4 className="text-sm font-medium text-violet-800 mb-2">Available Merge Tags</h4>
                            <div className="flex flex-wrap gap-2">
                                {['{{firstName}}', '{{lastName}}', '{{email}}', '{{company}}', '{{unsubscribe_url}}'].map((tag) => (
                                    <code
                                        key={tag}
                                        className="px-2 py-1 bg-white text-violet-600 text-xs rounded border border-violet-200 cursor-pointer hover:bg-violet-100"
                                        onClick={() => setCampaign({ ...campaign, htmlContent: campaign.htmlContent + tag })}
                                    >
                                        {tag}
                                    </code>
                                ))}
                            </div>
                        </div>

                        <div className="mt-8 flex justify-between">
                            <button
                                onClick={() => setActiveTab('details')}
                                className="px-6 py-3 text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl font-medium transition-colors"
                            >
                                Back
                            </button>
                            <button
                                onClick={() => handleSave(true)}
                                disabled={loading}
                                className="px-6 py-3 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white rounded-xl font-medium hover:from-violet-500 hover:to-fuchsia-500 transition-all flex items-center gap-2"
                            >
                                <Send className="w-4 h-4" />
                                Save & Add Recipients
                            </button>
                        </div>
                    </div>
                )}

                {/* Recipients Tab */}
                {activeTab === 'recipients' && (
                    <div className="bg-white rounded-2xl border border-slate-200 p-8">
                        <h2 className="text-lg font-semibold text-slate-800 mb-6">Select Recipients</h2>
                        <p className="text-slate-500 mb-6">
                            Save this campaign first, then you can add recipients from your contact list.
                        </p>
                        <button
                            onClick={() => handleSave(true)}
                            disabled={loading}
                            className="px-6 py-3 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white rounded-xl font-medium hover:from-violet-500 hover:to-fuchsia-500 transition-all"
                        >
                            Save Campaign & Continue
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
