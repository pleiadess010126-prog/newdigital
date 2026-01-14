'use client';

import { useState } from 'react';
import { X, Check, Shield, Zap, Mail, MessageSquare, Clock, AlertTriangle, Video, Youtube } from 'lucide-react';

interface AutopilotConfig {
    enabled: boolean;
    contentGeneration: {
        enabled: boolean;
        brandVoice: string;
        autoApprove: boolean;
        maxPerWeek: number;
    };
    triggers: {
        welcomeEmail: boolean;
        reEngagement: boolean;
        churnPrevention: boolean;
        birthdayEmail: boolean;
        purchaseFollowup: boolean;
        dailyReel: boolean;
        weeklyShort: boolean;
    };
    recurringCampaigns: any[]; // Managed elsewhere
    scheduling: {
        useAITiming: boolean;
        timezone: string;
        blackoutStart: number;
        blackoutEnd: number;
        blackoutDays: number[];
    };
    limits: {
        maxEmailsPerContact: number;
        maxSmsPerContact: number;
        requireApprovalAbove: number;
    };
}

interface AutopilotSettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    config: AutopilotConfig;
    onSave: (updates: Partial<AutopilotConfig>) => void;
}

export default function AutopilotSettingsModal({ isOpen, onClose, config, onSave }: AutopilotSettingsModalProps) {
    const [formData, setFormData] = useState<AutopilotConfig>(config);
    const [activeTab, setActiveTab] = useState<'general' | 'triggers' | 'safety'>('general');

    if (!isOpen) return null;

    const handleSave = () => {
        onSave(formData);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
                <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-slate-50 to-white">
                    <div>
                        <h2 className="text-xl font-bold text-slate-800">Autopilot Configuration</h2>
                        <p className="text-sm text-slate-500">Global rules for your AI marketing engine</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                        <X className="w-5 h-5 text-slate-400" />
                    </button>
                </div>

                <div className="flex border-b border-slate-100">
                    <button
                        onClick={() => setActiveTab('general')}
                        className={`flex-1 py-3 text-sm font-semibold transition-colors ${activeTab === 'general' ? 'text-violet-600 border-b-2 border-violet-600' : 'text-slate-500 hover:bg-slate-50'}`}
                    >
                        General & AI
                    </button>
                    <button
                        onClick={() => setActiveTab('triggers')}
                        className={`flex-1 py-3 text-sm font-semibold transition-colors ${activeTab === 'triggers' ? 'text-violet-600 border-b-2 border-violet-600' : 'text-slate-500 hover:bg-slate-50'}`}
                    >
                        Triggers
                    </button>
                    <button
                        onClick={() => setActiveTab('safety')}
                        className={`flex-1 py-3 text-sm font-semibold transition-colors ${activeTab === 'safety' ? 'text-violet-600 border-b-2 border-violet-600' : 'text-slate-500 hover:bg-slate-50'}`}
                    >
                        Safety Limits
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {activeTab === 'general' && (
                        <div className="space-y-6">
                            {/* Auto Approve Toggle */}
                            <div className={`p-4 rounded-xl border-2 transition-colors ${formData.contentGeneration.autoApprove ? 'border-orange-200 bg-orange-50' : 'border-blue-200 bg-blue-50'}`}>
                                <div className="flex items-start gap-4">
                                    <div className={`p-2 rounded-lg ${formData.contentGeneration.autoApprove ? 'bg-orange-100 text-orange-600' : 'bg-blue-100 text-blue-600'}`}>
                                        {formData.contentGeneration.autoApprove ? <Zap className="w-6 h-6" /> : <Shield className="w-6 h-6" />}
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-bold text-slate-800">
                                            {formData.contentGeneration.autoApprove ? 'Fully Autonomous Mode' : 'Human Approval Mode'}
                                        </h3>
                                        <p className="text-sm text-slate-600 mt-1 mb-3">
                                            {formData.contentGeneration.autoApprove
                                                ? 'AI generates and sends campaigns automatically without waiting for you.'
                                                : 'AI generates drafts but waits for your approval before sending.'}
                                        </p>
                                        <button
                                            onClick={() => setFormData({
                                                ...formData,
                                                contentGeneration: { ...formData.contentGeneration, autoApprove: !formData.contentGeneration.autoApprove }
                                            })}
                                            className={`px-4 py-2 rounded-lg font-bold text-xs uppercase tracking-wider transition-all ${formData.contentGeneration.autoApprove
                                                    ? 'bg-orange-500 text-white hover:bg-orange-600'
                                                    : 'bg-blue-500 text-white hover:bg-blue-600'
                                                }`}
                                        >
                                            Switch to {formData.contentGeneration.autoApprove ? 'Approval Mode' : 'Autonomous Mode'}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Brand Voice */}
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Brand Voice Directive</label>
                                <textarea
                                    value={formData.contentGeneration.brandVoice}
                                    onChange={(e) => setFormData({
                                        ...formData,
                                        contentGeneration: { ...formData.contentGeneration, brandVoice: e.target.value }
                                    })}
                                    className="w-full h-24 p-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-violet-500 focus:border-transparent text-sm"
                                    placeholder="E.g. Professional, witty, and authoritative..."
                                />
                            </div>

                            {/* Max Volume */}
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Max Campaigns Per Week</label>
                                <input
                                    type="number"
                                    value={formData.contentGeneration.maxPerWeek}
                                    onChange={(e) => setFormData({
                                        ...formData,
                                        contentGeneration: { ...formData.contentGeneration, maxPerWeek: parseInt(e.target.value) }
                                    })}
                                    className="w-full p-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-violet-500"
                                />
                            </div>
                        </div>
                    )}

                    {activeTab === 'triggers' && (
                        <div className="space-y-4">
                            <p className="text-sm text-slate-500 mb-4">Select which automated workflows the AI is allowed to initiate.</p>
                            {[
                                { key: 'welcomeEmail', label: 'Welcome New Signups', icon: Mail },
                                { key: 'reEngagement', label: 'Re-engage Inactive Users', icon: Clock },
                                { key: 'churnPrevention', label: 'Churn Prevention', icon: Shield },
                                { key: 'birthdayEmail', label: 'Birthday Wishes', icon: Zap },
                                { key: 'purchaseFollowup', label: 'Post-Purchase Follow-up', icon: MessageSquare },
                                { key: 'dailyReel', label: 'Daily Viral Reel (Instagram)', icon: Video },
                                { key: 'weeklyShort', label: 'Weekly YouTube Short', icon: Youtube },
                            ].map((trigger) => (
                                <div key={trigger.key} className="flex items-center justify-between p-4 rounded-xl border border-slate-100 hover:border-violet-100 hover:bg-violet-50/30 transition-all">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 rounded-lg bg-slate-100 text-slate-500">
                                            <trigger.icon className="w-5 h-5" />
                                        </div>
                                        <span className="font-medium text-slate-800">{trigger.label}</span>
                                    </div>
                                    <button
                                        onClick={() => setFormData({
                                            ...formData,
                                            triggers: { ...formData.triggers, [trigger.key]: !(formData.triggers as any)[trigger.key] }
                                        })}
                                        className={`w-12 h-6 rounded-full relative transition-colors ${(formData.triggers as any)[trigger.key] ? 'bg-emerald-500' : 'bg-slate-200'
                                            }`}
                                    >
                                        <div className={`w-5 h-5 rounded-full bg-white shadow absolute top-0.5 transition-transform ${(formData.triggers as any)[trigger.key] ? 'left-6.5 translate-x-1' : 'left-0.5'
                                            }`} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    {activeTab === 'safety' && (
                        <div className="space-y-6">
                            <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 flex gap-3">
                                <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />
                                <p className="text-sm text-amber-800">Safety limits prevent the AI from over-communicating and annoying your customers.</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">Max Emails / Contact</label>
                                    <input
                                        type="number"
                                        value={formData.limits.maxEmailsPerContact}
                                        onChange={(e) => setFormData({
                                            ...formData,
                                            limits: { ...formData.limits, maxEmailsPerContact: parseInt(e.target.value) }
                                        })}
                                        className="w-full p-3 rounded-lg border border-slate-200"
                                    />
                                    <p className="text-xs text-slate-500 mt-1">Per week per person</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">Max SMS / Contact</label>
                                    <input
                                        type="number"
                                        value={formData.limits.maxSmsPerContact}
                                        onChange={(e) => setFormData({
                                            ...formData,
                                            limits: { ...formData.limits, maxSmsPerContact: parseInt(e.target.value) }
                                        })}
                                        className="w-full p-3 rounded-lg border border-slate-200"
                                    />
                                    <p className="text-xs text-slate-500 mt-1">Per week per person</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="p-6 border-t border-slate-100 flex justify-end gap-3 bg-slate-50">
                    <button
                        onClick={onClose}
                        className="px-6 py-2.5 rounded-xl font-bold text-slate-600 hover:bg-slate-200 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        className="px-6 py-2.5 rounded-xl font-bold text-white bg-slate-900 hover:bg-slate-800 shadow-lg shadow-violet-500/10 transition-all flex items-center gap-2"
                    >
                        <Check className="w-5 h-5" />
                        Save Configuration
                    </button>
                </div>
            </div>
        </div>
    );
}
