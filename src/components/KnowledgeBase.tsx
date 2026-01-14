'use client';

import { useState, useEffect } from 'react';
import {
    Database, Upload, FileText, Search, Trash2,
    Plus, CheckCircle2, AlertCircle, Loader2, BookOpen
} from 'lucide-react';
import { ragEngine, type KnowledgeDocument } from '@/lib/ai/rag';

export default function KnowledgeBase() {
    const [documents, setDocuments] = useState<KnowledgeDocument[]>([]);
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [showUploadModal, setShowUploadModal] = useState(false);

    // Upload Form State
    const [newDocTitle, setNewDocTitle] = useState('');
    const [newDocContent, setNewDocContent] = useState('');
    const [newDocTags, setNewDocTags] = useState('');

    useEffect(() => {
        // Load initial documents (simulated fetch)
        setDocuments(ragEngine.getDocuments());
    }, []);

    const handleUpload = async () => {
        if (!newDocTitle || !newDocContent) return;

        setUploading(true);
        try {
            await ragEngine.addDocument({
                title: newDocTitle,
                content: newDocContent,
                type: 'text',
                tags: newDocTags.split(',').map(t => t.trim()).filter(Boolean)
            });

            // Refresh list
            setDocuments(ragEngine.getDocuments());
            setShowUploadModal(false);
            setNewDocTitle('');
            setNewDocContent('');
            setNewDocTags('');
        } catch (error) {
            console.error('Upload failed', error);
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = (id: string) => {
        ragEngine.removeDocument(id);
        setDocuments(ragEngine.getDocuments());
    };

    const filteredDocs = documents.filter(doc =>
        doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                        <Database className="w-6 h-6 text-indigo-600" />
                        Brand Vault (RAG)
                    </h2>
                    <p className="text-slate-500 text-sm mt-1">
                        Upload your brand documents to ground AI content in facts.
                    </p>
                </div>
                <button
                    onClick={() => setShowUploadModal(true)}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
                >
                    <Upload className="w-4 h-4" />
                    Upload Knowledge
                </button>
            </div>

            {/* Search Bar */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input
                    type="text"
                    placeholder="Search documents..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
            </div>

            {/* Document List */}
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <table className="w-full">
                    <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Document Name</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Type</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Tags</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Added</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Status</th>
                            <th className="px-6 py-3 text-right text-xs font-semibold text-slate-500 uppercase">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {filteredDocs.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                                    <BookOpen className="w-12 h-12 mx-auto text-slate-300 mb-3" />
                                    No documents found. Upload your first knowledge source!
                                </td>
                            </tr>
                        ) : (
                            filteredDocs.map((doc) => (
                                <tr key={doc.id} className="hover:bg-slate-50">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
                                                <FileText className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-slate-800">{doc.title}</p>
                                                <p className="text-xs text-slate-400">ID: {doc.id}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="uppercase text-xs font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded">
                                            {doc.type}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-wrap gap-1">
                                            {doc.tags.map(tag => (
                                                <span key={tag} className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full text-xs">
                                                    #{tag}
                                                </span>
                                            ))}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-slate-500">
                                        {doc.dateAdded.toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${doc.status === 'indexed' ? 'bg-emerald-100 text-emerald-700' :
                                            doc.status === 'processing' ? 'bg-amber-100 text-amber-700' :
                                                'bg-red-100 text-red-700'
                                            }`}>
                                            {doc.status === 'indexed' ? <CheckCircle2 className="w-3.5 h-3.5" /> :
                                                doc.status === 'processing' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> :
                                                    <AlertCircle className="w-3.5 h-3.5" />}
                                            {doc.status.charAt(0).toUpperCase() + doc.status.slice(1)}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button
                                            onClick={() => handleDelete(doc.id)}
                                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Upload Modal */}
            {showUploadModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-2xl w-full max-w-lg m-4 overflow-hidden shadow-2xl">
                        <div className="bg-indigo-600 px-6 py-4 flex items-center justify-between">
                            <h3 className="text-white font-bold flex items-center gap-2">
                                <Upload className="w-5 h-5" />
                                Add Knowledge Source
                            </h3>
                            <button onClick={() => setShowUploadModal(false)} className="text-white/80 hover:text-white">
                                ×
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Document Title</label>
                                <input
                                    type="text"
                                    value={newDocTitle}
                                    onChange={(e) => setNewDocTitle(e.target.value)}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                                    placeholder="e.g. 2024 Product Specs"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Content / Context</label>
                                <textarea
                                    value={newDocContent}
                                    onChange={(e) => setNewDocContent(e.target.value)}
                                    rows={5}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                                    placeholder="Paste comprehensive text here to ground the AI..."
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Tags (comma separated)</label>
                                <input
                                    type="text"
                                    value={newDocTags}
                                    onChange={(e) => setNewDocTags(e.target.value)}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                                    placeholder="e.g. product, sales, faq"
                                />
                            </div>
                        </div>
                        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-3">
                            <button
                                onClick={() => setShowUploadModal(false)}
                                className="px-4 py-2 text-slate-600 hover:bg-slate-200 rounded-lg font-medium"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleUpload}
                                disabled={!newDocTitle || !newDocContent || uploading}
                                className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2"
                            >
                                {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                                Add to Brain
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
