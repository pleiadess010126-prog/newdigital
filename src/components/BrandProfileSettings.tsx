'use client';

import React, { useState, useRef } from 'react';
import {
    Building2, Palette, Upload, Sparkles, Target, Users, MessageSquare,
    Globe, Edit3, Save, X, Image, Check, Plus, Trash2, RefreshCw, Mic, FileText
} from 'lucide-react';
import { getTranslation } from '@/lib/i18n/translations';

// Brand Voice Options - Extended
const VOICE_OPTIONS = [
    { id: 'professional', label: 'Professional', description: 'Formal, authoritative, trust-building', icon: '💼' },
    { id: 'casual', label: 'Casual', description: 'Friendly, approachable, conversational', icon: '😊' },
    { id: 'educational', label: 'Educational', description: 'Informative, clear, helpful', icon: '📚' },
    { id: 'entertaining', label: 'Entertaining', description: 'Fun, engaging, creative', icon: '🎭' },
    { id: 'inspirational', label: 'Inspirational', description: 'Motivating, uplifting, empowering', icon: '✨' },
    { id: 'technical', label: 'Technical', description: 'Detailed, precise, expert-level', icon: '⚙️' },
    { id: 'thoughtLeader', label: 'Thought Leader', description: 'Visionary, innovative, industry-shaping', icon: '🧠' },
    { id: 'storyteller', label: 'Storyteller', description: 'Narrative-driven, emotional, memorable', icon: '📖' },
    { id: 'boldEdgy', label: 'Bold & Edgy', description: 'Provocative, unconventional, disruptive', icon: '🔥' },
    { id: 'minimalist', label: 'Minimalist', description: 'Clean, concise, no-fluff', icon: '🎯' },
    { id: 'empathetic', label: 'Empathetic', description: 'Understanding, supportive, caring', icon: '💜' },
    { id: 'authoritative', label: 'Authoritative', description: 'Expert, commanding, decisive', icon: '👑' },
];

// Audience Persona Templates
const PERSONA_TEMPLATES = [
    { id: 'saas_buyer', name: 'SaaS Decision Maker', demographics: { ageRange: '35-44', income: 'high', education: 'bachelors' }, interests: ['Technology', 'Productivity', 'Business Growth'] },
    { id: 'ecommerce_shopper', name: 'E-commerce Shopper', demographics: { ageRange: '25-34', income: 'medium', education: 'some_college' }, interests: ['Shopping', 'Deals', 'Fashion'] },
    { id: 'startup_founder', name: 'Startup Founder', demographics: { ageRange: '25-34', income: 'varies', education: 'bachelors' }, interests: ['Entrepreneurship', 'Innovation', 'Funding'] },
    { id: 'marketing_pro', name: 'Marketing Professional', demographics: { ageRange: '25-44', income: 'medium-high', education: 'bachelors' }, interests: ['Marketing Trends', 'Analytics', 'Content'] },
    { id: 'small_business', name: 'Small Business Owner', demographics: { ageRange: '35-54', income: 'medium', education: 'varies' }, interests: ['Business Growth', 'Local Marketing', 'Efficiency'] },
    { id: 'gen_z_consumer', name: 'Gen Z Consumer', demographics: { ageRange: '18-24', income: 'entry', education: 'student' }, interests: ['Social Media', 'Trends', 'Authenticity'] },
];

// Income Level Options
const INCOME_OPTIONS = [
    { id: 'entry', label: 'Entry Level ($0-30K)' },
    { id: 'low', label: 'Low ($30K-50K)' },
    { id: 'medium', label: 'Medium ($50K-100K)' },
    { id: 'high', label: 'High ($100K-200K)' },
    { id: 'executive', label: 'Executive ($200K+)' },
    { id: 'varies', label: 'Varies' },
];

// Education Options
const EDUCATION_OPTIONS = [
    { id: 'high_school', label: 'High School' },
    { id: 'some_college', label: 'Some College' },
    { id: 'bachelors', label: "Bachelor's Degree" },
    { id: 'masters', label: "Master's Degree" },
    { id: 'doctorate', label: 'Doctorate/PhD' },
    { id: 'varies', label: 'Varies' },
];

// Industry Options
const INDUSTRY_OPTIONS = [
    'Technology / SaaS',
    'E-commerce / Retail',
    'Healthcare / Medical',
    'Finance / Banking',
    'Education / EdTech',
    'Real Estate',
    'Marketing / Agency',
    'Travel / Hospitality',
    'Food & Beverage',
    'Entertainment / Media',
    'Manufacturing',
    'Professional Services',
    'Non-profit',
    'Other',
];

// Predefined Color Palettes
const COLOR_PALETTES = [
    { name: 'Ocean Blue', primary: '#0EA5E9', secondary: '#06B6D4', accent: '#8B5CF6' },
    { name: 'Forest Green', primary: '#10B981', secondary: '#059669', accent: '#F59E0B' },
    { name: 'Royal Purple', primary: '#8B5CF6', secondary: '#A855F7', accent: '#EC4899' },
    { name: 'Sunset Orange', primary: '#F97316', secondary: '#EF4444', accent: '#FBBF24' },
    { name: 'Modern Dark', primary: '#6366F1', secondary: '#8B5CF6', accent: '#22D3EE' },
    { name: 'Nature', primary: '#84CC16', secondary: '#22C55E', accent: '#0EA5E9' },
];

interface BrandProfile {
    // Basic Info
    brandName: string;
    tagline: string;
    industry: string;
    websiteUrl: string;

    // Sender Info (for Email/SMS campaigns)
    fromEmail: string;
    fromPhone: string;
    businessLocation: string;

    // Target Audience - Enhanced
    targetAudience: string;
    audienceAge: string;
    audienceLocation: string;
    audienceInterests: string[];
    audienceIncome: string;
    audienceEducation: string;
    audienceJobTitles: string[];
    audiencePainPoints: string[];
    audienceGoals: string[];
    audienceBuyingTriggers: string[];
    audiencePreferredPlatforms: string[];
    secondaryAudience: string;

    // Brand Identity
    uniqueValueProposition: string;
    missionStatement: string;
    brandValues: string[];

    // Voice & Tone - Enhanced
    voiceType: string;
    voiceIntensity: number;
    toneKeywords: string[];
    contentStyle: string;
    voiceExamples: string;
    voiceDos: string[];
    voiceDonts: string[];
    brandVocabulary: string[];
    writingGuidelines: string;

    // Visual Identity
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
    logoUrl: string;

    // Content Preferences
    preferredTopics: string[];
    avoidTopics: string[];
    competitorUrls: string[];
}

interface BrandProfileSettingsProps {
    initialProfile?: Partial<BrandProfile>;
    onSave?: (profile: BrandProfile) => void;
    currentLanguage?: string;
    organizationId?: string;
}

export default function BrandProfileSettings({
    initialProfile,
    onSave,
    currentLanguage = 'en',
    organizationId
}: BrandProfileSettingsProps) {
    const t = (key: string) => getTranslation(currentLanguage, key);

    const [profile, setProfile] = useState<BrandProfile>({
        brandName: initialProfile?.brandName || '',
        tagline: initialProfile?.tagline || '',
        industry: initialProfile?.industry || '',
        websiteUrl: initialProfile?.websiteUrl || '',
        // Sender Info
        fromEmail: initialProfile?.fromEmail || '',
        fromPhone: initialProfile?.fromPhone || '',
        businessLocation: initialProfile?.businessLocation || '',
        targetAudience: initialProfile?.targetAudience || '',
        audienceAge: initialProfile?.audienceAge || '25-45',
        audienceLocation: initialProfile?.audienceLocation || 'Global',
        audienceInterests: initialProfile?.audienceInterests || [],
        audienceIncome: initialProfile?.audienceIncome || 'medium',
        audienceEducation: initialProfile?.audienceEducation || 'bachelors',
        audienceJobTitles: initialProfile?.audienceJobTitles || [],
        audiencePainPoints: initialProfile?.audiencePainPoints || [],
        audienceGoals: initialProfile?.audienceGoals || [],
        audienceBuyingTriggers: initialProfile?.audienceBuyingTriggers || [],
        audiencePreferredPlatforms: initialProfile?.audiencePreferredPlatforms || [],
        secondaryAudience: initialProfile?.secondaryAudience || '',
        uniqueValueProposition: initialProfile?.uniqueValueProposition || '',
        missionStatement: initialProfile?.missionStatement || '',
        brandValues: initialProfile?.brandValues || [],
        voiceType: initialProfile?.voiceType || 'professional',
        voiceIntensity: initialProfile?.voiceIntensity || 70,
        toneKeywords: initialProfile?.toneKeywords || [],
        contentStyle: initialProfile?.contentStyle || 'balanced',
        voiceExamples: initialProfile?.voiceExamples || '',
        voiceDos: initialProfile?.voiceDos || [],
        voiceDonts: initialProfile?.voiceDonts || [],
        brandVocabulary: initialProfile?.brandVocabulary || [],
        writingGuidelines: initialProfile?.writingGuidelines || '',
        primaryColor: initialProfile?.primaryColor || '#8B5CF6',
        secondaryColor: initialProfile?.secondaryColor || '#EC4899',
        accentColor: initialProfile?.accentColor || '#22D3EE',
        logoUrl: initialProfile?.logoUrl || '',
        preferredTopics: initialProfile?.preferredTopics || [],
        avoidTopics: initialProfile?.avoidTopics || [],
        competitorUrls: initialProfile?.competitorUrls || [],
    });

    const [activeSection, setActiveSection] = useState<string>('basic');
    const [newValue, setNewValue] = useState('');
    const [newTopic, setNewTopic] = useState('');
    const [newAvoidTopic, setNewAvoidTopic] = useState('');
    const [newCompetitor, setNewCompetitor] = useState('');
    const [newInterest, setNewInterest] = useState('');
    const [newToneKeyword, setNewToneKeyword] = useState('');
    const [newJobTitle, setNewJobTitle] = useState('');
    const [newPainPoint, setNewPainPoint] = useState('');
    const [newGoal, setNewGoal] = useState('');
    const [newTrigger, setNewTrigger] = useState('');
    const [newVocab, setNewVocab] = useState('');
    const [newDo, setNewDo] = useState('');
    const [newDont, setNewDont] = useState('');
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const updateField = (field: keyof BrandProfile, value: any) => {
        setProfile(prev => ({ ...prev, [field]: value }));
        setSaved(false);
    };

    const addToArray = (field: keyof BrandProfile, value: string) => {
        if (value.trim()) {
            const current = profile[field] as string[];
            if (!current.includes(value.trim())) {
                updateField(field, [...current, value.trim()]);
            }
        }
    };

    const removeFromArray = (field: keyof BrandProfile, index: number) => {
        const current = profile[field] as string[];
        updateField(field, current.filter((_, i) => i !== index));
    };

    const handleSave = async () => {
        if (!organizationId) {
            console.error('No organization ID provided');
            return;
        }

        setSaving(true);
        try {
            // Transform BrandProfile to OrganizationSettings structure
            const settingsUpdate = {
                brandName: profile.brandName,
                websiteUrl: profile.websiteUrl,
                logoUrl: profile.logoUrl,
                primaryColor: profile.primaryColor,
                industry: profile.industry,
                // Map new fields
                location: profile.businessLocation,
                fromEmail: profile.fromEmail,
                fromPhone: profile.fromPhone,
                // Complex objects stored as JSON or dedicated fields if schema supports
                // For now, we'll map what matches the schema directly and put the rest in a generic 'brandProfile' field or individual fields if we add them
                // Ideally, we should update the schema to support all these fields or store them in a JSON column.
                // For this implementation, we will assume we can pass them and the backend handles or ignores.
                // But wait, the PATCH route uses `db.updateOrganization`.
                // let's create a settings object with the fields we added to the schema AND all other fields
                settings: {
                    ...profile, // Save all profile fields to JSON
                    brandName: profile.brandName,
                    websiteUrl: profile.websiteUrl,
                    logoUrl: profile.logoUrl,
                    primaryColor: profile.primaryColor,
                    industry: profile.industry,
                    location: profile.businessLocation,
                    fromEmail: profile.fromEmail,
                    fromPhone: profile.fromPhone,
                    brandColor: profile.primaryColor,
                }
            };

            const response = await fetch('/api/organizations', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    id: organizationId,
                    settings: settingsUpdate.settings
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to save settings');
            }

            onSave?.(profile);
            setSaved(true);
        } catch (error) {
            console.error('Error saving settings:', error);
            alert('Failed to save settings. Please try again.');
        } finally {
            setSaving(false);
            setTimeout(() => setSaved(false), 3000);
        }
    };

    const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                updateField('logoUrl', reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const applyColorPalette = (palette: typeof COLOR_PALETTES[0]) => {
        updateField('primaryColor', palette.primary);
        updateField('secondaryColor', palette.secondary);
        updateField('accentColor', palette.accent);
    };

    const sections = [
        { id: 'basic', label: t('basicInfo'), icon: Building2 },
        { id: 'audience', label: t('targetAudience'), icon: Users },
        { id: 'identity', label: t('brandIdentity'), icon: Sparkles },
        { id: 'voice', label: t('brandVoice') || 'Brand Voice', icon: Mic },
        { id: 'writing', label: t('writingStyle'), icon: FileText },
        { id: 'visual', label: t('visualIdentity'), icon: Palette },
        { id: 'content', label: t('contentPreferences'), icon: Edit3 },
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-lg">
                        <Building2 className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-white">{t('brandProfile')}</h2>
                        <p className="text-white/60 text-sm">{t('brandProfileDesc')}</p>
                    </div>
                </div>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className={`px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-all ${saved
                        ? 'bg-green-500 text-white'
                        : 'bg-gradient-to-r from-violet-500 to-fuchsia-500 hover:from-violet-600 hover:to-fuchsia-600 text-white'
                        }`}
                >
                    {saving ? (
                        <>
                            <RefreshCw className="w-4 h-4 animate-spin" />
                            {t('saving')}
                        </>
                    ) : saved ? (
                        <>
                            <Check className="w-4 h-4" />
                            {t('saved')}
                        </>
                    ) : (
                        <>
                            <Save className="w-4 h-4" />
                            {t('saveProfile')}
                        </>
                    )}
                </button>
            </div>

            {/* Section Tabs */}
            <div className="flex flex-wrap gap-2">
                {sections.map(section => (
                    <button
                        key={section.id}
                        onClick={() => setActiveSection(section.id)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-all ${activeSection === section.id
                            ? 'bg-violet-500 text-white'
                            : 'bg-white/5 text-white/70 hover:bg-white/10 hover:text-white'
                            }`}
                    >
                        <section.icon className="w-4 h-4" />
                        {section.label}
                    </button>
                ))}
            </div>

            {/* Basic Info Section */}
            {activeSection === 'basic' && (
                <div className="card p-6 space-y-5">
                    <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                        <Building2 className="w-5 h-5 text-violet-400" />
                        {t('basicInfo')}
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-white/80 mb-2">{t('brandName')} *</label>
                            <input
                                type="text"
                                value={profile.brandName}
                                onChange={(e) => updateField('brandName', e.target.value)}
                                placeholder={t('brandNamePlaceholder')}
                                className="input w-full"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-white/80 mb-2">{t('tagline')}</label>
                            <input
                                type="text"
                                value={profile.tagline}
                                onChange={(e) => updateField('tagline', e.target.value)}
                                placeholder={t('taglinePlaceholder')}
                                className="input w-full"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-white/80 mb-2">{t('industry')} *</label>
                            <select
                                value={profile.industry}
                                onChange={(e) => updateField('industry', e.target.value)}
                                className="input w-full"
                            >
                                <option value="">{t('industrySelect')}</option>
                                {INDUSTRY_OPTIONS.map(industry => (
                                    <option key={industry} value={industry}>{industry}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-white/80 mb-2">{t('websiteUrl')}</label>
                            <input
                                type="url"
                                value={profile.websiteUrl}
                                onChange={(e) => updateField('websiteUrl', e.target.value)}
                                placeholder={t('websiteUrlPlaceholder')}
                                className="input w-full"
                            />
                        </div>
                    </div>

                    {/* Sender Information Section */}
                    <div className="p-5 bg-gradient-to-br from-violet-500/10 to-fuchsia-500/10 rounded-xl border border-violet-500/20">
                        <h4 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                            📧 Sender Information (for Email/SMS Campaigns)
                        </h4>
                        <p className="text-xs text-white/50 mb-4">
                            This information is used when sending automated campaigns through Autopilot
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-xs font-medium text-white/60 mb-1.5">From Email</label>
                                <input
                                    type="email"
                                    value={profile.fromEmail}
                                    onChange={(e) => updateField('fromEmail', e.target.value)}
                                    placeholder="hello@yourbrand.com"
                                    className="input w-full text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-white/60 mb-1.5">From Phone (SMS)</label>
                                <input
                                    type="tel"
                                    value={profile.fromPhone}
                                    onChange={(e) => updateField('fromPhone', e.target.value)}
                                    placeholder="+1 (555) 123-4567"
                                    className="input w-full text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-white/60 mb-1.5">📍 Business Location</label>
                                <input
                                    type="text"
                                    value={profile.businessLocation}
                                    onChange={(e) => updateField('businessLocation', e.target.value)}
                                    placeholder="e.g., New York, USA"
                                    className="input w-full text-sm"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Target Audience Section - Enhanced */}
            {activeSection === 'audience' && (
                <div className="card p-6 space-y-6">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                            <Users className="w-5 h-5 text-blue-400" />
                            {t('targetAudience')}
                        </h3>
                        {/* Persona Templates Quick Apply */}
                        <div className="relative group">
                            <button className="px-3 py-1.5 bg-blue-500/20 text-blue-300 rounded-lg text-sm flex items-center gap-2 hover:bg-blue-500/30 transition-colors">
                                <Sparkles className="w-4 h-4" />
                                Use Persona Template
                            </button>
                            <div className="absolute right-0 top-full mt-2 w-64 bg-gray-800 border border-white/10 rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                                {PERSONA_TEMPLATES.map(persona => (
                                    <button
                                        key={persona.id}
                                        onClick={() => {
                                            updateField('audienceAge', persona.demographics.ageRange);
                                            updateField('audienceIncome', persona.demographics.income);
                                            updateField('audienceEducation', persona.demographics.education);
                                            updateField('audienceInterests', persona.interests);
                                        }}
                                        className="w-full px-4 py-3 text-left hover:bg-white/5 first:rounded-t-xl last:rounded-b-xl"
                                    >
                                        <p className="text-white font-medium text-sm">{persona.name}</p>
                                        <p className="text-white/50 text-xs">{persona.interests.join(', ')}</p>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Primary Audience Description */}
                    <div>
                        <label className="block text-sm font-medium text-white/80 mb-2">
                            {t('audienceDescription')} <span className="text-blue-400">*</span>
                        </label>
                        <textarea
                            value={profile.targetAudience}
                            onChange={(e) => updateField('targetAudience', e.target.value)}
                            placeholder="e.g., Tech-savvy startup founders aged 25-40 who are looking to scale their businesses..."
                            rows={3}
                            className="textarea w-full"
                        />
                    </div>

                    {/* Demographics Grid */}
                    <div className="p-4 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-xl border border-white/10">
                        <h4 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                            <Target className="w-4 h-4 text-blue-400" />
                            Demographics
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div>
                                <label className="block text-xs font-medium text-white/60 mb-1.5">{t('ageRange')}</label>
                                <select value={profile.audienceAge} onChange={(e) => updateField('audienceAge', e.target.value)} className="input w-full text-sm">
                                    <option value="18-24">{t('age18_24')}</option>
                                    <option value="25-34">{t('age25_34')}</option>
                                    <option value="35-44">{t('age35_44')}</option>
                                    <option value="45-54">{t('age45_54')}</option>
                                    <option value="55+">{t('age55Plus')}</option>
                                    <option value="25-45">{t('ageWorkingProf')}</option>
                                    <option value="all">{t('allAges')}</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-white/60 mb-1.5">Income Level</label>
                                <select value={profile.audienceIncome} onChange={(e) => updateField('audienceIncome', e.target.value)} className="input w-full text-sm">
                                    {INCOME_OPTIONS.map(opt => <option key={opt.id} value={opt.id}>{opt.label}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-white/60 mb-1.5">Education</label>
                                <select value={profile.audienceEducation} onChange={(e) => updateField('audienceEducation', e.target.value)} className="input w-full text-sm">
                                    {EDUCATION_OPTIONS.map(opt => <option key={opt.id} value={opt.id}>{opt.label}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-white/60 mb-1.5">{t('primaryLocation')}</label>
                                <input type="text" value={profile.audienceLocation} onChange={(e) => updateField('audienceLocation', e.target.value)} placeholder="e.g., North America, Global" className="input w-full text-sm" />
                            </div>
                        </div>
                    </div>

                    {/* Job Titles */}
                    <div>
                        <label className="block text-sm font-medium text-white/80 mb-2">Job Titles / Roles</label>
                        <p className="text-xs text-white/50 mb-2">What positions does your audience typically hold?</p>
                        <div className="flex gap-2 mb-3">
                            <input type="text" value={newJobTitle} onChange={(e) => setNewJobTitle(e.target.value)} placeholder="e.g., Marketing Manager, CEO, Developer" className="input flex-1" onKeyDown={(e) => { if (e.key === 'Enter') { addToArray('audienceJobTitles', newJobTitle); setNewJobTitle(''); } }} />
                            <button onClick={() => { addToArray('audienceJobTitles', newJobTitle); setNewJobTitle(''); }} className="btn-primary px-4"><Plus className="w-4 h-4" /></button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {profile.audienceJobTitles.map((title, index) => (
                                <span key={index} className="px-3 py-1.5 bg-indigo-500/20 text-indigo-300 rounded-full text-sm flex items-center gap-2">
                                    {title}
                                    <button onClick={() => removeFromArray('audienceJobTitles', index)} className="hover:text-red-400"><X className="w-3 h-3" /></button>
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Psychographics Section */}
                    <div className="p-4 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-xl border border-white/10">
                        <h4 className="text-sm font-semibold text-white mb-4">🧠 Psychographics</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Pain Points */}
                            <div>
                                <label className="block text-sm font-medium text-white/80 mb-2">😰 Pain Points</label>
                                <p className="text-xs text-white/50 mb-2">What problems keep them up at night?</p>
                                <div className="flex gap-2 mb-3">
                                    <input type="text" value={newPainPoint} onChange={(e) => setNewPainPoint(e.target.value)} placeholder="e.g., Lack of organic traffic" className="input flex-1 text-sm" onKeyDown={(e) => { if (e.key === 'Enter') { addToArray('audiencePainPoints', newPainPoint); setNewPainPoint(''); } }} />
                                    <button onClick={() => { addToArray('audiencePainPoints', newPainPoint); setNewPainPoint(''); }} className="btn-primary px-3"><Plus className="w-4 h-4" /></button>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {profile.audiencePainPoints.map((pain, index) => (
                                        <span key={index} className="px-3 py-1.5 bg-red-500/20 text-red-300 rounded-full text-xs flex items-center gap-2">
                                            {pain}
                                            <button onClick={() => removeFromArray('audiencePainPoints', index)} className="hover:text-white"><X className="w-3 h-3" /></button>
                                        </span>
                                    ))}
                                </div>
                            </div>
                            {/* Goals */}
                            <div>
                                <label className="block text-sm font-medium text-white/80 mb-2">🎯 Goals & Aspirations</label>
                                <p className="text-xs text-white/50 mb-2">What do they want to achieve?</p>
                                <div className="flex gap-2 mb-3">
                                    <input type="text" value={newGoal} onChange={(e) => setNewGoal(e.target.value)} placeholder="e.g., Scale to $1M ARR" className="input flex-1 text-sm" onKeyDown={(e) => { if (e.key === 'Enter') { addToArray('audienceGoals', newGoal); setNewGoal(''); } }} />
                                    <button onClick={() => { addToArray('audienceGoals', newGoal); setNewGoal(''); }} className="btn-primary px-3"><Plus className="w-4 h-4" /></button>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {profile.audienceGoals.map((goal, index) => (
                                        <span key={index} className="px-3 py-1.5 bg-green-500/20 text-green-300 rounded-full text-xs flex items-center gap-2">
                                            {goal}
                                            <button onClick={() => removeFromArray('audienceGoals', index)} className="hover:text-white"><X className="w-3 h-3" /></button>
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Behavioral Data */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Buying Triggers */}
                        <div>
                            <label className="block text-sm font-medium text-white/80 mb-2">⚡ Buying Triggers</label>
                            <p className="text-xs text-white/50 mb-2">What makes them take action?</p>
                            <div className="flex gap-2 mb-3">
                                <input type="text" value={newTrigger} onChange={(e) => setNewTrigger(e.target.value)} placeholder="e.g., Limited time offer, Social proof" className="input flex-1 text-sm" onKeyDown={(e) => { if (e.key === 'Enter') { addToArray('audienceBuyingTriggers', newTrigger); setNewTrigger(''); } }} />
                                <button onClick={() => { addToArray('audienceBuyingTriggers', newTrigger); setNewTrigger(''); }} className="btn-primary px-3"><Plus className="w-4 h-4" /></button>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {profile.audienceBuyingTriggers.map((trigger, index) => (
                                    <span key={index} className="px-3 py-1.5 bg-yellow-500/20 text-yellow-300 rounded-full text-xs flex items-center gap-2">
                                        {trigger}
                                        <button onClick={() => removeFromArray('audienceBuyingTriggers', index)} className="hover:text-red-400"><X className="w-3 h-3" /></button>
                                    </span>
                                ))}
                            </div>
                        </div>
                        {/* Preferred Platforms */}
                        <div>
                            <label className="block text-sm font-medium text-white/80 mb-2">📱 Preferred Platforms</label>
                            <p className="text-xs text-white/50 mb-2">Where do they spend their time online?</p>
                            <div className="flex flex-wrap gap-2">
                                {['LinkedIn', 'Twitter/X', 'Instagram', 'YouTube', 'TikTok', 'Facebook', 'Reddit', 'Blogs'].map(platform => (
                                    <button
                                        key={platform}
                                        onClick={() => {
                                            if (profile.audiencePreferredPlatforms.includes(platform)) {
                                                updateField('audiencePreferredPlatforms', profile.audiencePreferredPlatforms.filter(p => p !== platform));
                                            } else {
                                                updateField('audiencePreferredPlatforms', [...profile.audiencePreferredPlatforms, platform]);
                                            }
                                        }}
                                        className={`px-3 py-1.5 rounded-full text-xs transition-all ${profile.audiencePreferredPlatforms.includes(platform) ? 'bg-blue-500 text-white' : 'bg-white/10 text-white/70 hover:bg-white/20'}`}
                                    >
                                        {platform}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Interests */}
                    <div>
                        <label className="block text-sm font-medium text-white/80 mb-2">{t('audienceInterests')}</label>
                        <div className="flex gap-2 mb-3">
                            <input type="text" value={newInterest} onChange={(e) => setNewInterest(e.target.value)} placeholder={t('interestPlaceholder')} className="input flex-1" onKeyDown={(e) => { if (e.key === 'Enter') { addToArray('audienceInterests', newInterest); setNewInterest(''); } }} />
                            <button onClick={() => { addToArray('audienceInterests', newInterest); setNewInterest(''); }} className="btn-primary px-4"><Plus className="w-4 h-4" /></button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {profile.audienceInterests.map((interest, index) => (
                                <span key={index} className="px-3 py-1.5 bg-blue-500/20 text-blue-300 rounded-full text-sm flex items-center gap-2">
                                    {interest}
                                    <button onClick={() => removeFromArray('audienceInterests', index)} className="hover:text-red-400"><X className="w-3 h-3" /></button>
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Secondary Audience */}
                    <div className="p-4 bg-white/5 rounded-xl border border-dashed border-white/20">
                        <label className="block text-sm font-medium text-white/80 mb-2">👥 Secondary Audience (Optional)</label>
                        <p className="text-xs text-white/50 mb-2">Describe a secondary audience segment that may also benefit from your content</p>
                        <textarea value={profile.secondaryAudience} onChange={(e) => updateField('secondaryAudience', e.target.value)} placeholder="e.g., Small business owners looking for marketing automation solutions..." rows={2} className="textarea w-full" />
                    </div>
                </div>
            )}

            {/* Brand Identity Section */}
            {activeSection === 'identity' && (
                <div className="card p-6 space-y-5">
                    <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-yellow-400" />
                        {t('brandIdentity')}
                    </h3>

                    <div>
                        <label className="block text-sm font-medium text-white/80 mb-2">{t('uniqueValueProp')}</label>
                        <textarea
                            value={profile.uniqueValueProposition}
                            onChange={(e) => updateField('uniqueValueProposition', e.target.value)}
                            placeholder={t('uvpPlaceholder')}
                            rows={3}
                            className="textarea w-full"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-white/80 mb-2">{t('missionStatement')}</label>
                        <textarea
                            value={profile.missionStatement}
                            onChange={(e) => updateField('missionStatement', e.target.value)}
                            placeholder={t('missionPlaceholder')}
                            rows={2}
                            className="textarea w-full"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-white/80 mb-2">{t('brandValues')}</label>
                        <div className="flex gap-2 mb-3">
                            <input
                                type="text"
                                value={newValue}
                                onChange={(e) => setNewValue(e.target.value)}
                                placeholder={t('valuePlaceholder')}
                                className="input flex-1"
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        addToArray('brandValues', newValue);
                                        setNewValue('');
                                    }
                                }}
                            />
                            <button
                                onClick={() => {
                                    addToArray('brandValues', newValue);
                                    setNewValue('');
                                }}
                                className="btn-primary px-4"
                            >
                                <Plus className="w-4 h-4" />
                            </button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {profile.brandValues.map((value, index) => (
                                <span key={index} className="px-3 py-1.5 bg-yellow-500/20 text-yellow-300 rounded-full text-sm flex items-center gap-2">
                                    {value}
                                    <button onClick={() => removeFromArray('brandValues', index)} className="hover:text-red-400">
                                        <X className="w-3 h-3" />
                                    </button>
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Brand Voice Section */}
            {activeSection === 'voice' && (
                <div className="card p-6 space-y-6">
                    <div>
                        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                            <Mic className="w-5 h-5 text-violet-400" />
                            {t('brandVoice') || 'Brand Voice'}
                        </h3>
                        <p className="text-sm text-white/60 mt-1">Define your brand's personality and how it should sound</p>
                    </div>

                    {/* Voice Type Selection */}
                    <div>
                        <label className="block text-sm font-medium text-white/80 mb-3">{t('brandVoiceType')}</label>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                            {VOICE_OPTIONS.map(voice => (
                                <button
                                    key={voice.id}
                                    onClick={() => updateField('voiceType', voice.id)}
                                    className={`p-4 rounded-xl border transition-all text-left ${profile.voiceType === voice.id
                                        ? 'bg-violet-500/20 border-violet-500 text-violet-300 shadow-lg shadow-violet-500/20'
                                        : 'bg-white/5 border-white/10 hover:border-white/30 text-white/70'
                                        }`}
                                >
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-lg">{voice.icon}</span>
                                        <p className="font-medium text-sm">{t(voice.id) || voice.label}</p>
                                    </div>
                                    <p className="text-xs opacity-70">{t(`${voice.id}Desc`) || voice.description}</p>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Voice Intensity Slider */}
                    <div className="p-4 bg-gradient-to-br from-violet-500/10 to-purple-500/10 rounded-xl border border-white/10">
                        <div className="flex items-center justify-between mb-3">
                            <label className="text-sm font-medium text-white/80">🎚️ Voice Intensity</label>
                            <span className="text-violet-400 font-bold">{profile.voiceIntensity}%</span>
                        </div>
                        <p className="text-xs text-white/50 mb-4">How strongly should the AI apply this voice personality?</p>
                        <input
                            type="range"
                            min="10"
                            max="100"
                            step="10"
                            value={profile.voiceIntensity}
                            onChange={(e) => updateField('voiceIntensity', parseInt(e.target.value))}
                            className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer accent-violet-500"
                        />
                        <div className="flex justify-between text-xs text-white/40 mt-1">
                            <span>Subtle</span>
                            <span>Moderate</span>
                            <span>Strong</span>
                        </div>
                    </div>

                    {/* Tone Keywords */}
                    <div>
                        <label className="block text-sm font-medium text-white/80 mb-2">{t('toneKeywords')}</label>
                        <p className="text-xs text-white/50 mb-3">{t('toneDesc')}</p>
                        <div className="flex gap-2 mb-3">
                            <input type="text" value={newToneKeyword} onChange={(e) => setNewToneKeyword(e.target.value)} placeholder={t('tonePlaceholder')} className="input flex-1" onKeyDown={(e) => { if (e.key === 'Enter') { addToArray('toneKeywords', newToneKeyword); setNewToneKeyword(''); } }} />
                            <button onClick={() => { addToArray('toneKeywords', newToneKeyword); setNewToneKeyword(''); }} className="btn-primary px-4"><Plus className="w-4 h-4" /></button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {profile.toneKeywords.map((keyword, index) => (
                                <span key={index} className="px-3 py-1.5 bg-violet-500/20 text-violet-300 rounded-full text-sm flex items-center gap-2">
                                    {keyword}
                                    <button onClick={() => removeFromArray('toneKeywords', index)} className="hover:text-red-400"><X className="w-3 h-3" /></button>
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Content Style */}
                    <div>
                        <label className="block text-sm font-medium text-white/80 mb-3">{t('contentStyle')}</label>
                        <div className="flex gap-3">
                            {[
                                { id: 'concise', label: 'Concise', desc: 'Short & punchy' },
                                { id: 'balanced', label: 'Balanced', desc: 'Best of both' },
                                { id: 'detailed', label: 'Detailed', desc: 'In-depth content' }
                            ].map(style => (
                                <button
                                    key={style.id}
                                    onClick={() => updateField('contentStyle', style.id)}
                                    className={`flex-1 p-4 rounded-xl border transition-all ${profile.contentStyle === style.id
                                        ? 'bg-violet-500/20 border-violet-500 text-violet-300'
                                        : 'bg-white/5 border-white/10 hover:border-white/30 text-white/70'
                                        }`}
                                >
                                    <p className="font-medium">{t(style.id) || style.label}</p>
                                    <p className="text-xs opacity-60 mt-0.5">{style.desc}</p>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Writing Style Section */}
            {activeSection === 'writing' && (
                <div className="card p-6 space-y-6">
                    <div>
                        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                            <FileText className="w-5 h-5 text-emerald-400" />
                            {t('writingStyle')}
                        </h3>
                        <p className="text-sm text-white/60 mt-1">{t('writingStyleDesc')}</p>
                    </div>

                    {/* Voice Examples */}
                    <div>
                        <label className="block text-sm font-medium text-white/80 mb-2">📝 Voice Examples</label>
                        <p className="text-xs text-white/50 mb-3">Paste sample content that represents your ideal brand voice. The AI will learn from these examples.</p>
                        <textarea
                            value={profile.voiceExamples}
                            onChange={(e) => updateField('voiceExamples', e.target.value)}
                            placeholder="Paste 2-3 paragraphs of content that exemplifies your brand voice..."
                            rows={4}
                            className="textarea w-full"
                        />
                    </div>

                    {/* Do's and Don'ts */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Do's */}
                        <div className="p-4 bg-green-500/10 rounded-xl border border-green-500/30">
                            <label className="block text-sm font-medium text-green-300 mb-2">✅ Content Do's</label>
                            <p className="text-xs text-white/50 mb-3">What should the AI always include or do?</p>
                            <div className="flex gap-2 mb-3">
                                <input type="text" value={newDo} onChange={(e) => setNewDo(e.target.value)} placeholder="e.g., Use data to back claims" className="input flex-1 text-sm" onKeyDown={(e) => { if (e.key === 'Enter') { addToArray('voiceDos', newDo); setNewDo(''); } }} />
                                <button onClick={() => { addToArray('voiceDos', newDo); setNewDo(''); }} className="px-3 py-2 bg-green-500/20 hover:bg-green-500/30 rounded-lg text-green-300"><Plus className="w-4 h-4" /></button>
                            </div>
                            <div className="space-y-2">
                                {profile.voiceDos.map((item, index) => (
                                    <div key={index} className="flex items-center gap-2 p-2 bg-green-500/10 rounded-lg">
                                        <Check className="w-4 h-4 text-green-400 flex-shrink-0" />
                                        <span className="text-sm text-green-200 flex-1">{item}</span>
                                        <button onClick={() => removeFromArray('voiceDos', index)} className="text-green-400 hover:text-red-400"><X className="w-3 h-3" /></button>
                                    </div>
                                ))}
                            </div>
                        </div>
                        {/* Don'ts */}
                        <div className="p-4 bg-red-500/10 rounded-xl border border-red-500/30">
                            <label className="block text-sm font-medium text-red-300 mb-2">❌ Content Don'ts</label>
                            <p className="text-xs text-white/50 mb-3">What should the AI never include or do?</p>
                            <div className="flex gap-2 mb-3">
                                <input type="text" value={newDont} onChange={(e) => setNewDont(e.target.value)} placeholder="e.g., Never use clickbait titles" className="input flex-1 text-sm" onKeyDown={(e) => { if (e.key === 'Enter') { addToArray('voiceDonts', newDont); setNewDont(''); } }} />
                                <button onClick={() => { addToArray('voiceDonts', newDont); setNewDont(''); }} className="px-3 py-2 bg-red-500/20 hover:bg-red-500/30 rounded-lg text-red-300"><Plus className="w-4 h-4" /></button>
                            </div>
                            <div className="space-y-2">
                                {profile.voiceDonts.map((item, index) => (
                                    <div key={index} className="flex items-center gap-2 p-2 bg-red-500/10 rounded-lg">
                                        <X className="w-4 h-4 text-red-400 flex-shrink-0" />
                                        <span className="text-sm text-red-200 flex-1">{item}</span>
                                        <button onClick={() => removeFromArray('voiceDonts', index)} className="text-red-400 hover:text-white"><X className="w-3 h-3" /></button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Brand Vocabulary */}
                    <div>
                        <label className="block text-sm font-medium text-white/80 mb-2">📚 Brand Vocabulary</label>
                        <p className="text-xs text-white/50 mb-3">Key terms, phrases, or jargon your brand uses frequently</p>
                        <div className="flex gap-2 mb-3">
                            <input type="text" value={newVocab} onChange={(e) => setNewVocab(e.target.value)} placeholder="e.g., Growth hacking, Revenue operations" className="input flex-1" onKeyDown={(e) => { if (e.key === 'Enter') { addToArray('brandVocabulary', newVocab); setNewVocab(''); } }} />
                            <button onClick={() => { addToArray('brandVocabulary', newVocab); setNewVocab(''); }} className="btn-primary px-4"><Plus className="w-4 h-4" /></button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {profile.brandVocabulary.map((word, index) => (
                                <span key={index} className="px-3 py-1.5 bg-purple-500/20 text-purple-300 rounded-full text-sm flex items-center gap-2">
                                    {word}
                                    <button onClick={() => removeFromArray('brandVocabulary', index)} className="hover:text-red-400"><X className="w-3 h-3" /></button>
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Writing Guidelines */}
                    <div>
                        <label className="block text-sm font-medium text-white/80 mb-2">📋 Additional Writing Guidelines</label>
                        <p className="text-xs text-white/50 mb-3">Any other specific instructions for content creation</p>
                        <textarea
                            value={profile.writingGuidelines}
                            onChange={(e) => updateField('writingGuidelines', e.target.value)}
                            placeholder="e.g., Always use active voice. Keep sentences under 20 words. Include a CTA in every piece..."
                            rows={3}
                            className="textarea w-full"
                        />
                    </div>
                </div>
            )}

            {/* Visual Identity Section */}
            {activeSection === 'visual' && (
                <div className="card p-6 space-y-5">
                    <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                        <Palette className="w-5 h-5 text-pink-400" />
                        {t('visualIdentity')}
                    </h3>

                    {/* Logo Upload */}
                    <div>
                        <label className="block text-sm font-medium text-white/80 mb-3">{t('brandLogo')}</label>
                        <div className="flex items-center gap-4">
                            <div className="w-24 h-24 rounded-xl bg-white/5 border-2 border-dashed border-white/20 flex items-center justify-center overflow-hidden">
                                {profile.logoUrl ? (
                                    <img src={profile.logoUrl} alt="Logo" className="w-full h-full object-contain" />
                                ) : (
                                    <Image className="w-8 h-8 text-white/30" />
                                )}
                            </div>
                            <div className="space-y-2">
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    onChange={handleLogoUpload}
                                    className="hidden"
                                />
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white text-sm flex items-center gap-2"
                                >
                                    <Upload className="w-4 h-4" />
                                    {t('uploadLogo')}
                                </button>
                                {profile.logoUrl && (
                                    <button
                                        onClick={() => updateField('logoUrl', '')}
                                        className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 rounded-lg text-red-300 text-sm flex items-center gap-2"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                        {t('remove')}
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Color Palette */}
                    <div>
                        <label className="block text-sm font-medium text-white/80 mb-3">Brand Colors</label>
                        <div className="grid grid-cols-3 gap-4 mb-4">
                            <div>
                                <p className="text-xs text-white/50 mb-2">Primary</p>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="color"
                                        value={profile.primaryColor}
                                        onChange={(e) => updateField('primaryColor', e.target.value)}
                                        className="w-12 h-12 rounded-lg cursor-pointer border-0"
                                    />
                                    <input
                                        type="text"
                                        value={profile.primaryColor}
                                        onChange={(e) => updateField('primaryColor', e.target.value)}
                                        className="input flex-1 text-sm"
                                    />
                                </div>
                            </div>
                            <div>
                                <p className="text-xs text-white/50 mb-2">Secondary</p>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="color"
                                        value={profile.secondaryColor}
                                        onChange={(e) => updateField('secondaryColor', e.target.value)}
                                        className="w-12 h-12 rounded-lg cursor-pointer border-0"
                                    />
                                    <input
                                        type="text"
                                        value={profile.secondaryColor}
                                        onChange={(e) => updateField('secondaryColor', e.target.value)}
                                        className="input flex-1 text-sm"
                                    />
                                </div>
                            </div>
                            <div>
                                <p className="text-xs text-white/50 mb-2">Accent</p>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="color"
                                        value={profile.accentColor}
                                        onChange={(e) => updateField('accentColor', e.target.value)}
                                        className="w-12 h-12 rounded-lg cursor-pointer border-0"
                                    />
                                    <input
                                        type="text"
                                        value={profile.accentColor}
                                        onChange={(e) => updateField('accentColor', e.target.value)}
                                        className="input flex-1 text-sm"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Quick Palettes */}
                        <p className="text-xs text-white/50 mb-2">{t('quickPalettes')}</p>
                        <div className="flex flex-wrap gap-2">
                            {COLOR_PALETTES.map(palette => (
                                <button
                                    key={palette.name}
                                    onClick={() => applyColorPalette(palette)}
                                    className="flex items-center gap-2 px-3 py-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
                                >
                                    <div className="flex -space-x-1">
                                        <div className="w-4 h-4 rounded-full border border-white/20" style={{ backgroundColor: palette.primary }} />
                                        <div className="w-4 h-4 rounded-full border border-white/20" style={{ backgroundColor: palette.secondary }} />
                                        <div className="w-4 h-4 rounded-full border border-white/20" style={{ backgroundColor: palette.accent }} />
                                    </div>
                                    <span className="text-xs text-white/70">{palette.name}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Preview */}
                    <div>
                        <p className="text-xs text-white/50 mb-2">{t('preview')}</p>
                        <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                            <div className="flex items-center gap-3 mb-3">
                                {profile.logoUrl && (
                                    <img src={profile.logoUrl} alt="Logo" className="w-10 h-10 rounded-lg object-contain" />
                                )}
                                <div>
                                    <p className="font-bold" style={{ color: profile.primaryColor }}>{profile.brandName || t('yourBrand')}</p>
                                    <p className="text-xs text-white/50">{profile.tagline || t('yourTagline')}</p>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <button className="px-4 py-2 rounded-lg text-white text-sm" style={{ backgroundColor: profile.primaryColor }}>
                                    {t('primaryButton')}
                                </button>
                                <button className="px-4 py-2 rounded-lg text-white text-sm" style={{ backgroundColor: profile.secondaryColor }}>
                                    {t('secondaryTitle')}
                                </button>
                                <span className="px-3 py-2 rounded-lg text-sm" style={{ backgroundColor: profile.accentColor + '30', color: profile.accentColor }}>
                                    {t('accentTag')}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Content Preferences Section */}
            {activeSection === 'content' && (
                <div className="card p-6 space-y-5">
                    <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                        <Edit3 className="w-5 h-5 text-orange-400" />
                        {t('contentPreferences')}
                    </h3>

                    <div>
                        <label className="block text-sm font-medium text-white/80 mb-2">{t('preferredTopics')}</label>
                        <p className="text-xs text-white/50 mb-3">{t('preferredTopicsDesc')}</p>
                        <div className="flex gap-2 mb-3">
                            <input
                                type="text"
                                value={newTopic}
                                onChange={(e) => setNewTopic(e.target.value)}
                                placeholder={t('topicPlaceholder')}
                                className="input flex-1"
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        addToArray('preferredTopics', newTopic);
                                        setNewTopic('');
                                    }
                                }}
                            />
                            <button
                                onClick={() => {
                                    addToArray('preferredTopics', newTopic);
                                    setNewTopic('');
                                }}
                                className="btn-primary px-4"
                            >
                                <Plus className="w-4 h-4" />
                            </button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {profile.preferredTopics.map((topic, index) => (
                                <span key={index} className="px-3 py-1.5 bg-orange-500/20 text-orange-300 rounded-full text-sm flex items-center gap-2">
                                    {topic}
                                    <button onClick={() => removeFromArray('preferredTopics', index)} className="hover:text-red-400">
                                        <X className="w-3 h-3" />
                                    </button>
                                </span>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-white/80 mb-2">{t('topicsToAvoid')}</label>
                        <p className="text-xs text-white/50 mb-3">{t('topicsToAvoidDesc')}</p>
                        <div className="flex gap-2 mb-3">
                            <input
                                type="text"
                                value={newAvoidTopic}
                                onChange={(e) => setNewAvoidTopic(e.target.value)}
                                placeholder={t('avoidTopicPlaceholder')}
                                className="input flex-1"
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        addToArray('avoidTopics', newAvoidTopic);
                                        setNewAvoidTopic('');
                                    }
                                }}
                            />
                            <button
                                onClick={() => {
                                    addToArray('avoidTopics', newAvoidTopic);
                                    setNewAvoidTopic('');
                                }}
                                className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 rounded-lg text-red-300"
                            >
                                <Plus className="w-4 h-4" />
                            </button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {profile.avoidTopics.map((topic, index) => (
                                <span key={index} className="px-3 py-1.5 bg-red-500/20 text-red-300 rounded-full text-sm flex items-center gap-2">
                                    {topic}
                                    <button onClick={() => removeFromArray('avoidTopics', index)} className="hover:text-white">
                                        <X className="w-3 h-3" />
                                    </button>
                                </span>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-white/80 mb-2">{t('competitorUrls')}</label>
                        <p className="text-xs text-white/50 mb-3">{t('competitorUrlsDesc')}</p>
                        <div className="flex gap-2 mb-3">
                            <input
                                type="url"
                                value={newCompetitor}
                                onChange={(e) => setNewCompetitor(e.target.value)}
                                placeholder={t('competitorPlaceholder')}
                                className="input flex-1"
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        addToArray('competitorUrls', newCompetitor);
                                        setNewCompetitor('');
                                    }
                                }}
                            />
                            <button
                                onClick={() => {
                                    addToArray('competitorUrls', newCompetitor);
                                    setNewCompetitor('');
                                }}
                                className="btn-primary px-4"
                            >
                                <Plus className="w-4 h-4" />
                            </button>
                        </div>
                        <div className="space-y-2">
                            {profile.competitorUrls.map((url, index) => (
                                <div key={index} className="flex items-center gap-2 p-2 bg-white/5 rounded-lg">
                                    <Globe className="w-4 h-4 text-white/40" />
                                    <span className="text-sm text-white/70 flex-1 truncate">{url}</span>
                                    <button onClick={() => removeFromArray('competitorUrls', index)} className="p-1 hover:bg-red-500/20 rounded text-red-400">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
