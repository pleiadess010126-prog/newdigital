'use client';

import { useState, useCallback, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    ArrowLeft, Save, Play, Pause, Trash2, Settings, Undo, Redo,
    Zap, Mail, Clock, GitBranch, Target, Tag, UserPlus, Webhook,
    MessageSquare, Bell, Plus, GripVertical, X, CheckCircle2
} from 'lucide-react';

// Node Types Configuration
const NODE_TYPES = {
    trigger: {
        label: 'Triggers',
        color: 'from-emerald-500 to-teal-600',
        bgColor: 'bg-emerald-50 border-emerald-200',
        items: [
            { type: 'contact_created', label: 'Contact Created', icon: UserPlus },
            { type: 'form_submitted', label: 'Form Submitted', icon: Target },
            { type: 'email_opened', label: 'Email Opened', icon: Mail },
            { type: 'email_clicked', label: 'Email Clicked', icon: Zap },
            { type: 'tag_added', label: 'Tag Added', icon: Tag },
            { type: 'score_changed', label: 'Score Changed', icon: Target },
        ]
    },
    action: {
        label: 'Actions',
        color: 'from-blue-500 to-indigo-600',
        bgColor: 'bg-blue-50 border-blue-200',
        items: [
            { type: 'send_email', label: 'Send Email', icon: Mail },
            { type: 'add_tag', label: 'Add Tag', icon: Tag },
            { type: 'remove_tag', label: 'Remove Tag', icon: X },
            { type: 'update_field', label: 'Update Field', icon: Settings },
            { type: 'change_score', label: 'Change Score', icon: Target },
            { type: 'notify_team', label: 'Notify Team', icon: Bell },
            { type: 'webhook', label: 'Webhook', icon: Webhook },
        ]
    },
    condition: {
        label: 'Conditions',
        color: 'from-amber-500 to-orange-600',
        bgColor: 'bg-amber-50 border-amber-200',
        items: [
            { type: 'condition', label: 'If/Else', icon: GitBranch },
        ]
    },
    delay: {
        label: 'Timing',
        color: 'from-purple-500 to-pink-600',
        bgColor: 'bg-purple-50 border-purple-200',
        items: [
            { type: 'fixed_delay', label: 'Wait', icon: Clock },
            { type: 'optimal_time', label: 'Optimal Time', icon: Zap },
        ]
    },
    end: {
        label: 'End',
        color: 'from-slate-500 to-slate-700',
        bgColor: 'bg-slate-50 border-slate-200',
        items: [
            { type: 'end', label: 'End Journey', icon: CheckCircle2 },
        ]
    }
};

interface CanvasNode {
    id: string;
    type: string;
    nodeType: 'trigger' | 'action' | 'condition' | 'delay' | 'end';
    label: string;
    x: number;
    y: number;
    config: Record<string, unknown>;
}

interface CanvasEdge {
    id: string;
    source: string;
    target: string;
    label?: string;
}

interface PageProps {
    params: Promise<{ id: string }>;
}

export default function JourneyEditorPage({ params }: PageProps) {
    const router = useRouter();
    const resolvedParams = use(params);
    const journeyId = resolvedParams.id;

    const [journey, setJourney] = useState<{
        id: string;
        name: string;
        description?: string;
        status: string;
    } | null>(null);
    const [nodes, setNodes] = useState<CanvasNode[]>([]);
    const [edges, setEdges] = useState<CanvasEdge[]>([]);
    const [selectedNode, setSelectedNode] = useState<string | null>(null);
    const [connectingFrom, setConnectingFrom] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);
    const [showNodePanel, setShowNodePanel] = useState(true);

    // Load journey data
    useEffect(() => {
        // For demo, use template data
        setJourney({
            id: journeyId,
            name: 'Welcome Series',
            description: 'Onboard new subscribers',
            status: 'draft'
        });

        // Demo nodes
        setNodes([
            { id: 'trigger-1', type: 'contact_created', nodeType: 'trigger', label: 'New Contact', x: 400, y: 80, config: {} },
            { id: 'action-1', type: 'send_email', nodeType: 'action', label: 'Welcome Email', x: 400, y: 200, config: { subject: 'Welcome!' } },
            { id: 'delay-1', type: 'fixed_delay', nodeType: 'delay', label: 'Wait 2 Days', x: 400, y: 320, config: { duration: 2, unit: 'days' } },
            { id: 'action-2', type: 'send_email', nodeType: 'action', label: 'Getting Started', x: 400, y: 440, config: {} },
            { id: 'end-1', type: 'end', nodeType: 'end', label: 'Journey Complete', x: 400, y: 560, config: {} },
        ]);

        setEdges([
            { id: 'e1-2', source: 'trigger-1', target: 'action-1' },
            { id: 'e2-3', source: 'action-1', target: 'delay-1' },
            { id: 'e3-4', source: 'delay-1', target: 'action-2' },
            { id: 'e4-5', source: 'action-2', target: 'end-1' },
        ]);
    }, [journeyId]);

    const addNode = (type: string, nodeType: 'trigger' | 'action' | 'condition' | 'delay' | 'end', label: string) => {
        const newNode: CanvasNode = {
            id: `${nodeType}-${Date.now()}`,
            type,
            nodeType,
            label,
            x: 400 + Math.random() * 100 - 50,
            y: 100 + nodes.length * 120,
            config: {}
        };
        setNodes([...nodes, newNode]);
        setSelectedNode(newNode.id);
    };

    const deleteNode = (nodeId: string) => {
        setNodes(nodes.filter(n => n.id !== nodeId));
        setEdges(edges.filter(e => e.source !== nodeId && e.target !== nodeId));
        setSelectedNode(null);
    };

    const connectNodes = (sourceId: string, targetId: string) => {
        if (sourceId === targetId) return;
        if (edges.some(e => e.source === sourceId && e.target === targetId)) return;

        const newEdge: CanvasEdge = {
            id: `e-${Date.now()}`,
            source: sourceId,
            target: targetId
        };
        setEdges([...edges, newEdge]);
        setConnectingFrom(null);
    };

    const deleteEdge = (edgeId: string) => {
        setEdges(edges.filter(e => e.id !== edgeId));
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            // Convert to API format
            const apiNodes = nodes.map(n => ({
                id: n.id,
                type: n.nodeType,
                position: { x: n.x, y: n.y },
                data: {
                    nodeType: n.nodeType,
                    [n.nodeType === 'trigger' ? 'triggerType' : n.nodeType === 'action' ? 'actionType' : n.type]: n.type,
                    name: n.label,
                    config: n.config
                }
            }));

            await fetch(`/api/journeys/${journeyId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nodes: apiNodes, edges })
            });

            alert('Journey saved!');
        } catch (error) {
            alert('Failed to save');
        } finally {
            setSaving(false);
        }
    };

    const getNodeColor = (nodeType: string) => {
        const config = NODE_TYPES[nodeType as keyof typeof NODE_TYPES];
        return config?.bgColor || 'bg-slate-50 border-slate-200';
    };

    const getNodeIcon = (nodeType: string, type: string) => {
        const config = NODE_TYPES[nodeType as keyof typeof NODE_TYPES];
        const item = config?.items.find(i => i.type === type);
        return item?.icon || Zap;
    };

    return (
        <div className="h-screen flex flex-col bg-slate-100">
            {/* Header */}
            <div className="bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-4">
                    <Link
                        href="/journeys"
                        className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <h1 className="font-semibold text-slate-800">{journey?.name || 'Loading...'}</h1>
                        <p className="text-sm text-slate-500">{journey?.description}</p>
                    </div>
                    {journey?.status && (
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${journey.status === 'active' ? 'bg-emerald-100 text-emerald-700' :
                                journey.status === 'paused' ? 'bg-amber-100 text-amber-700' :
                                    'bg-slate-100 text-slate-700'
                            }`}>
                            {journey.status}
                        </span>
                    )}
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-medium hover:from-purple-500 hover:to-pink-500 transition-all flex items-center gap-2 disabled:opacity-50"
                    >
                        <Save className="w-4 h-4" />
                        {saving ? 'Saving...' : 'Save'}
                    </button>
                </div>
            </div>

            <div className="flex-1 flex overflow-hidden">
                {/* Node Palette */}
                <div className={`bg-white border-r border-slate-200 overflow-y-auto transition-all ${showNodePanel ? 'w-64' : 'w-0'}`}>
                    <div className="p-4">
                        <h3 className="text-sm font-semibold text-slate-800 mb-4">Add Nodes</h3>

                        {Object.entries(NODE_TYPES).map(([key, category]) => (
                            <div key={key} className="mb-4">
                                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">
                                    {category.label}
                                </p>
                                <div className="space-y-1">
                                    {category.items.map((item) => (
                                        <button
                                            key={item.type}
                                            onClick={() => addNode(item.type, key as 'trigger' | 'action' | 'condition' | 'delay' | 'end', item.label)}
                                            className="w-full px-3 py-2 text-left text-sm rounded-lg hover:bg-slate-100 transition-colors flex items-center gap-2 group"
                                        >
                                            <div className={`p-1.5 rounded-md bg-gradient-to-br ${category.color}`}>
                                                <item.icon className="w-3.5 h-3.5 text-white" />
                                            </div>
                                            <span className="text-slate-700">{item.label}</span>
                                            <Plus className="w-4 h-4 text-slate-300 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Canvas */}
                <div className="flex-1 relative overflow-auto bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDEwIEwgNDAgMTAgTSAxMCAwIEwgMTAgNDAgTSAwIDIwIEwgNDAgMjAgTSAyMCAwIEwgMjAgNDAgTSAwIDMwIEwgNDAgMzAgTSAzMCAwIEwgMzAgNDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iI2UyZThmMCIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')]">
                    {/* SVG for edges */}
                    <svg className="absolute inset-0 pointer-events-none" style={{ width: '100%', height: '100%', minWidth: 800, minHeight: 800 }}>
                        {edges.map((edge) => {
                            const sourceNode = nodes.find(n => n.id === edge.source);
                            const targetNode = nodes.find(n => n.id === edge.target);
                            if (!sourceNode || !targetNode) return null;

                            const x1 = sourceNode.x + 100;
                            const y1 = sourceNode.y + 40;
                            const x2 = targetNode.x + 100;
                            const y2 = targetNode.y;

                            const midY = (y1 + y2) / 2;

                            return (
                                <g key={edge.id}>
                                    <path
                                        d={`M ${x1} ${y1} C ${x1} ${midY}, ${x2} ${midY}, ${x2} ${y2}`}
                                        fill="none"
                                        stroke="#94a3b8"
                                        strokeWidth="2"
                                        markerEnd="url(#arrowhead)"
                                    />
                                    <circle
                                        cx={(x1 + x2) / 2}
                                        cy={midY}
                                        r="8"
                                        fill="white"
                                        stroke="#e2e8f0"
                                        strokeWidth="2"
                                        className="cursor-pointer pointer-events-auto hover:stroke-red-400"
                                        onClick={() => deleteEdge(edge.id)}
                                    />
                                    <text
                                        x={(x1 + x2) / 2}
                                        y={midY + 4}
                                        textAnchor="middle"
                                        fontSize="10"
                                        fill="#94a3b8"
                                        className="pointer-events-none"
                                    >
                                        ×
                                    </text>
                                </g>
                            );
                        })}
                        <defs>
                            <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                                <polygon points="0 0, 10 3.5, 0 7" fill="#94a3b8" />
                            </marker>
                        </defs>
                    </svg>

                    {/* Nodes */}
                    {nodes.map((node) => {
                        const NodeIcon = getNodeIcon(node.nodeType, node.type);
                        const isSelected = selectedNode === node.id;

                        return (
                            <div
                                key={node.id}
                                className={`absolute w-[200px] rounded-xl border-2 bg-white shadow-md cursor-move transition-shadow ${getNodeColor(node.nodeType)
                                    } ${isSelected ? 'ring-2 ring-purple-500 shadow-lg' : ''} ${connectingFrom ? 'hover:ring-2 hover:ring-blue-400' : ''
                                    }`}
                                style={{ left: node.x, top: node.y }}
                                onClick={() => {
                                    if (connectingFrom && connectingFrom !== node.id) {
                                        connectNodes(connectingFrom, node.id);
                                    } else {
                                        setSelectedNode(isSelected ? null : node.id);
                                    }
                                }}
                            >
                                <div className="p-3">
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className={`p-1.5 rounded-md bg-gradient-to-br ${NODE_TYPES[node.nodeType]?.color || 'from-slate-500 to-slate-600'}`}>
                                            <NodeIcon className="w-4 h-4 text-white" />
                                        </div>
                                        <span className="font-medium text-slate-800 text-sm truncate">{node.label}</span>
                                        {isSelected && (
                                            <button
                                                onClick={(e) => { e.stopPropagation(); deleteNode(node.id); }}
                                                className="ml-auto p-1 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        )}
                                    </div>
                                    <p className="text-xs text-slate-500 capitalize">{node.type.replace(/_/g, ' ')}</p>
                                </div>

                                {/* Connection handles */}
                                {node.nodeType !== 'end' && (
                                    <div
                                        className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-slate-300 border-2 border-white cursor-pointer hover:bg-blue-500 transition-colors"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setConnectingFrom(connectingFrom === node.id ? null : node.id);
                                        }}
                                    />
                                )}
                                {node.nodeType !== 'trigger' && (
                                    <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-slate-300 border-2 border-white" />
                                )}
                            </div>
                        );
                    })}

                    {/* Connecting indicator */}
                    {connectingFrom && (
                        <div className="absolute top-4 left-1/2 -translate-x-1/2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm shadow-lg">
                            Click a node to connect • Press ESC to cancel
                        </div>
                    )}
                </div>

                {/* Properties Panel */}
                {selectedNode && (
                    <div className="w-72 bg-white border-l border-slate-200 overflow-y-auto">
                        <div className="p-4 border-b border-slate-200">
                            <div className="flex items-center justify-between">
                                <h3 className="font-semibold text-slate-800">Node Properties</h3>
                                <button
                                    onClick={() => setSelectedNode(null)}
                                    className="p-1 text-slate-400 hover:text-slate-600 rounded"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                        <div className="p-4 space-y-4">
                            {(() => {
                                const node = nodes.find(n => n.id === selectedNode);
                                if (!node) return null;

                                return (
                                    <>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-1">Label</label>
                                            <input
                                                type="text"
                                                value={node.label}
                                                onChange={(e) => setNodes(nodes.map(n =>
                                                    n.id === node.id ? { ...n, label: e.target.value } : n
                                                ))}
                                                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                                            />
                                        </div>

                                        {node.type === 'send_email' && (
                                            <>
                                                <div>
                                                    <label className="block text-sm font-medium text-slate-700 mb-1">Subject</label>
                                                    <input
                                                        type="text"
                                                        value={(node.config.subject as string) || ''}
                                                        onChange={(e) => setNodes(nodes.map(n =>
                                                            n.id === node.id ? { ...n, config: { ...n.config, subject: e.target.value } } : n
                                                        ))}
                                                        placeholder="Email subject..."
                                                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-slate-700 mb-1">Email Template</label>
                                                    <select className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm bg-white">
                                                        <option value="">Select template...</option>
                                                        <option value="welcome">Welcome Email</option>
                                                        <option value="newsletter">Newsletter</option>
                                                    </select>
                                                </div>
                                            </>
                                        )}

                                        {node.type === 'fixed_delay' && (
                                            <div className="grid grid-cols-2 gap-2">
                                                <div>
                                                    <label className="block text-sm font-medium text-slate-700 mb-1">Duration</label>
                                                    <input
                                                        type="number"
                                                        value={(node.config.duration as number) || 1}
                                                        onChange={(e) => setNodes(nodes.map(n =>
                                                            n.id === node.id ? { ...n, config: { ...n.config, duration: parseInt(e.target.value) } } : n
                                                        ))}
                                                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-slate-700 mb-1">Unit</label>
                                                    <select
                                                        value={(node.config.unit as string) || 'days'}
                                                        onChange={(e) => setNodes(nodes.map(n =>
                                                            n.id === node.id ? { ...n, config: { ...n.config, unit: e.target.value } } : n
                                                        ))}
                                                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm bg-white"
                                                    >
                                                        <option value="minutes">Minutes</option>
                                                        <option value="hours">Hours</option>
                                                        <option value="days">Days</option>
                                                        <option value="weeks">Weeks</option>
                                                    </select>
                                                </div>
                                            </div>
                                        )}

                                        {(node.type === 'add_tag' || node.type === 'remove_tag') && (
                                            <div>
                                                <label className="block text-sm font-medium text-slate-700 mb-1">Tag</label>
                                                <input
                                                    type="text"
                                                    value={(node.config.tag as string) || ''}
                                                    onChange={(e) => setNodes(nodes.map(n =>
                                                        n.id === node.id ? { ...n, config: { ...n.config, tag: e.target.value } } : n
                                                    ))}
                                                    placeholder="Enter tag name..."
                                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                                                />
                                            </div>
                                        )}

                                        <div className="pt-4 border-t border-slate-200">
                                            <button
                                                onClick={() => deleteNode(node.id)}
                                                className="w-full px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                                Delete Node
                                            </button>
                                        </div>
                                    </>
                                );
                            })()}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
