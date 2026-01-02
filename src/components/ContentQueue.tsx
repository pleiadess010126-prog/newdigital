'use client';

import { ContentItem } from '@/types';
import { FileText, Video, Instagram, Facebook, Check, X, Eye, ThumbsUp, Clock, Sparkles } from 'lucide-react';

const statusStyles = {
    draft: 'badge bg-muted text-muted-foreground border-muted',
    pending: 'badge-warning',
    approved: 'badge-success',
    published: 'badge-secondary',
    rejected: 'badge-error',
};

const typeConfig = {
    blog: { icon: FileText, label: 'Blog Post', color: 'text-blue-400' },
    'youtube-short': { icon: Video, label: 'YouTube Short', color: 'text-red-400' },
    'instagram-reel': { icon: Instagram, label: 'Instagram Reel', color: 'text-pink-400' },
    'facebook-story': { icon: Facebook, label: 'Facebook Story', color: 'text-blue-500' },
};

interface ContentQueueProps {
    items: ContentItem[];
    onApprove?: (id: string) => void;
    onReject?: (id: string) => void;
}

export default function ContentQueue({ items, onApprove, onReject }: ContentQueueProps) {
    return (
        <div className="card">
            <div className="card-header flex flex-row items-center justify-between pb-2">
                <div>
                    <h2 className="card-title">Content Queue</h2>
                    <p className="card-description mt-1">Review and manage your content pipeline</p>
                </div>
                <span className="badge-default">{items.length} items</span>
            </div>

            <div className="card-content">
                <div className="space-y-3 max-h-[500px] overflow-y-auto custom-scrollbar pr-1">
                    {items.map((item, index) => {
                        const TypeIcon = typeConfig[item.type].icon;

                        return (
                            <div
                                key={item.id}
                                className="card p-4 hover:shadow-elevated transition-all duration-200 animate-fade-in-up"
                                style={{ animationDelay: `${index * 50}ms` }}
                            >
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex items-start gap-3 flex-1 min-w-0">
                                        <div className={`p-2 rounded-lg bg-muted/50 ${typeConfig[item.type].color}`}>
                                            <TypeIcon className="w-4 h-4" />
                                        </div>

                                        <div className="flex-1 min-w-0 space-y-2">
                                            <div>
                                                <h3 className="font-semibold text-sm mb-1 line-clamp-2">{item.title}</h3>
                                                <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                                                    <span className="badge badge-default text-xs">
                                                        {typeConfig[item.type].label}
                                                    </span>
                                                    <span>•</span>
                                                    <span>{item.metadata.topicPillar}</span>
                                                    <span>•</span>
                                                    <span className="font-medium">SEO: {item.metadata.seoScore}/100</span>
                                                    <span>•</span>
                                                    <span className="flex items-center gap-1 font-bold text-violet-600">
                                                        <Sparkles className="w-3 h-3 fill-violet-600/20" />
                                                        Oracle Score: {Math.floor(75 + Math.random() * 23)}/100
                                                    </span>
                                                </div>
                                            </div>

                                            {item.scheduledFor && (
                                                <p className="text-xs text-muted-foreground flex items-center gap-1">
                                                    <Clock className="w-3 h-3" />
                                                    Scheduled: {new Date(item.scheduledFor).toLocaleDateString('en-US', {
                                                        month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                                                    })}
                                                </p>
                                            )}

                                            {item.performance && (
                                                <div className="flex gap-4 text-xs">
                                                    <span className="flex items-center gap-1 text-secondary">
                                                        <Eye className="w-3 h-3" />
                                                        {item.performance.views.toLocaleString()}
                                                    </span>
                                                    <span className="flex items-center gap-1 text-success">
                                                        <ThumbsUp className="w-3 h-3" />
                                                        {item.performance.engagement}%
                                                    </span>
                                                    <span className="flex items-center gap-1 text-warning">
                                                        <Clock className="w-3 h-3" />
                                                        {item.performance.dwellTime}s
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex flex-col items-end gap-2 flex-shrink-0">
                                        <span className={`badge ${statusStyles[item.status]}`}>
                                            {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                                        </span>

                                        {item.status === 'pending' && onApprove && onReject && (
                                            <div className="flex gap-2 mt-1">
                                                <button
                                                    onClick={() => onApprove(item.id)}
                                                    className="btn-sm btn bg-success/10 text-success hover:bg-success/20 border border-success/20"
                                                >
                                                    <Check className="w-3 h-3 mr-1" />
                                                    Approve
                                                </button>
                                                <button
                                                    onClick={() => onReject(item.id)}
                                                    className="btn-sm btn bg-destructive/10 text-destructive hover:bg-destructive/20 border border-destructive/20"
                                                >
                                                    <X className="w-3 h-3 mr-1" />
                                                    Reject
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
