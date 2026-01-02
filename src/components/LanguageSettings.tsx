'use client';

import { useState } from 'react';
import { Globe, Sparkles, ChevronDown, Search, X, Check } from 'lucide-react';
import { getTranslation } from '@/lib/i18n/translations';

export interface ContentLanguage {
    code: string;
    name: string;
    nativeName: string;
    flag: string;
    rtl: boolean;
}

// All supported languages for content generation
export const ALL_CONTENT_LANGUAGES: ContentLanguage[] = [
    // Major World Languages
    { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸', rtl: false },
    { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸', rtl: false },
    { code: 'zh', name: 'Chinese', nativeName: '中文', flag: '🇨🇳', rtl: false },
    { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳', rtl: false },
    { code: 'ar', name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦', rtl: true },
    { code: 'pt', name: 'Portuguese', nativeName: 'Português', flag: '🇧🇷', rtl: false },
    { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', flag: '🇧🇩', rtl: false },
    { code: 'ru', name: 'Russian', nativeName: 'Русский', flag: '🇷🇺', rtl: false },
    { code: 'ja', name: 'Japanese', nativeName: '日本語', flag: '🇯🇵', rtl: false },
    { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷', rtl: false },
    { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪', rtl: false },
    { code: 'ko', name: 'Korean', nativeName: '한국어', flag: '🇰🇷', rtl: false },

    // European Languages
    { code: 'it', name: 'Italian', nativeName: 'Italiano', flag: '🇮🇹', rtl: false },
    { code: 'nl', name: 'Dutch', nativeName: 'Nederlands', flag: '🇳🇱', rtl: false },
    { code: 'pl', name: 'Polish', nativeName: 'Polski', flag: '🇵🇱', rtl: false },
    { code: 'sv', name: 'Swedish', nativeName: 'Svenska', flag: '🇸🇪', rtl: false },
    { code: 'uk', name: 'Ukrainian', nativeName: 'Українська', flag: '🇺🇦', rtl: false },
    { code: 'cs', name: 'Czech', nativeName: 'Čeština', flag: '🇨🇿', rtl: false },
    { code: 'ro', name: 'Romanian', nativeName: 'Română', flag: '🇷🇴', rtl: false },
    { code: 'el', name: 'Greek', nativeName: 'Ελληνικά', flag: '🇬🇷', rtl: false },
    { code: 'hu', name: 'Hungarian', nativeName: 'Magyar', flag: '🇭🇺', rtl: false },
    { code: 'da', name: 'Danish', nativeName: 'Dansk', flag: '🇩🇰', rtl: false },
    { code: 'fi', name: 'Finnish', nativeName: 'Suomi', flag: '🇫🇮', rtl: false },
    { code: 'no', name: 'Norwegian', nativeName: 'Norsk', flag: '🇳🇴', rtl: false },

    // Asian Languages
    { code: 'vi', name: 'Vietnamese', nativeName: 'Tiếng Việt', flag: '🇻🇳', rtl: false },
    { code: 'th', name: 'Thai', nativeName: 'ไทย', flag: '🇹🇭', rtl: false },
    { code: 'id', name: 'Indonesian', nativeName: 'Bahasa Indonesia', flag: '🇮🇩', rtl: false },
    { code: 'ms', name: 'Malay', nativeName: 'Bahasa Melayu', flag: '🇲🇾', rtl: false },
    { code: 'fil', name: 'Filipino', nativeName: 'Filipino', flag: '🇵🇭', rtl: false },
    { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', flag: '🇮🇳', rtl: false },
    { code: 'te', name: 'Telugu', nativeName: 'తెలుగు', flag: '🇮🇳', rtl: false },
    { code: 'mr', name: 'Marathi', nativeName: 'मराठी', flag: '🇮🇳', rtl: false },
    { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી', flag: '🇮🇳', rtl: false },
    { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ', flag: '🇮🇳', rtl: false },
    { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം', flag: '🇮🇳', rtl: false },
    { code: 'pa', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ', flag: '🇮🇳', rtl: false },

    // Middle Eastern Languages
    { code: 'tr', name: 'Turkish', nativeName: 'Türkçe', flag: '🇹🇷', rtl: false },
    { code: 'he', name: 'Hebrew', nativeName: 'עברית', flag: '🇮🇱', rtl: true },
    { code: 'fa', name: 'Persian', nativeName: 'فارسی', flag: '🇮🇷', rtl: true },
    { code: 'ur', name: 'Urdu', nativeName: 'اردو', flag: '🇵🇰', rtl: true },

    // African Languages
    { code: 'sw', name: 'Swahili', nativeName: 'Kiswahili', flag: '🇰🇪', rtl: false },
    { code: 'af', name: 'Afrikaans', nativeName: 'Afrikaans', flag: '🇿🇦', rtl: false },
];

interface LanguageSettingsProps {
    primaryLanguage?: string;
    targetMarkets?: string[];
    onSave?: (settings: { primaryLanguage: string; targetMarkets: string[] }) => void;
    currentLanguage: string;
}

export default function LanguageSettings({
    primaryLanguage = 'en',
    targetMarkets = [],
    onSave,
    currentLanguage
}: LanguageSettingsProps) {
    const t = (key: string) => getTranslation(currentLanguage, key);
    const [selectedPrimary, setSelectedPrimary] = useState(primaryLanguage);
    const [selectedMarkets, setSelectedMarkets] = useState<string[]>(targetMarkets);
    const [searchQuery, setSearchQuery] = useState('');
    const [showLanguageModal, setShowLanguageModal] = useState(false);
    const [autoTranslate, setAutoTranslate] = useState(true);

    const filteredLanguages = ALL_CONTENT_LANGUAGES.filter(lang =>
        lang.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lang.nativeName.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const toggleMarket = (code: string) => {
        if (code === selectedPrimary) return; // Can't select primary as target
        setSelectedMarkets(prev =>
            prev.includes(code)
                ? prev.filter(c => c !== code)
                : [...prev, code]
        );
    };

    const primaryLang = ALL_CONTENT_LANGUAGES.find(l => l.code === selectedPrimary);
    const marketLangs = ALL_CONTENT_LANGUAGES.filter(l => selectedMarkets.includes(l.code));

    const handleSave = () => {
        onSave?.({ primaryLanguage: selectedPrimary, targetMarkets: selectedMarkets });
    };

    // Popular market selections
    const popularSelections = [
        { key: 'marketGlobal', codes: ['en', 'es', 'zh', 'hi', 'ar', 'pt', 'bn', 'ru', 'ja', 'fr'] },
        { key: 'marketEurope', codes: ['en', 'de', 'fr', 'es', 'it', 'nl', 'pl', 'sv', 'pt'] },
        { key: 'marketAsiaPacific', codes: ['zh', 'ja', 'ko', 'hi', 'id', 'vi', 'th', 'ms', 'fil'] },
        { key: 'marketAmericas', codes: ['en', 'es', 'pt'] },
        { key: 'marketMiddleEast', codes: ['ar', 'tr', 'he', 'fa'] },
        { key: 'marketSouthAsia', codes: ['hi', 'bn', 'ta', 'te', 'mr', 'gu', 'pa', 'ur'] },
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg">
                        <Globe className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-white">{t('languageSettingsTitle')}</h2>
                        <p className="text-white/60 text-sm">{t('languageSettingsDesc')}</p>
                    </div>
                </div>
                <span className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-sm font-medium">
                    {ALL_CONTENT_LANGUAGES.length} {t('languagesCount')}
                </span>
            </div>

            {/* Primary Content Language */}
            <div className="card p-5">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-yellow-400" />
                    {t('primaryLanguageLabel')}
                </h3>
                <p className="text-white/60 text-sm mb-4">
                    {t('primaryLanguageDesc')}
                </p>

                <button
                    onClick={() => setShowLanguageModal(true)}
                    className="w-full p-4 rounded-xl bg-white/5 border border-white/10 hover:border-purple-500/50 transition-all flex items-center justify-between group"
                >
                    <div className="flex items-center gap-3">
                        <span className="text-3xl">{primaryLang?.flag}</span>
                        <div className="text-left">
                            <p className="text-white font-medium">{primaryLang?.name}</p>
                            <p className="text-white/60 text-sm">{primaryLang?.nativeName}</p>
                        </div>
                    </div>
                    <ChevronDown className="w-5 h-5 text-white/40 group-hover:text-white transition-colors" />
                </button>
            </div>

            {/* Target Markets */}
            <div className="card p-5">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-white">{t('targetMarketsLabel')}</h3>
                    <span className="text-white/60 text-sm">{selectedMarkets.length} {t('selectedCount')}</span>
                </div>
                <p className="text-white/60 text-sm mb-4">
                    {t('targetMarketsDesc')}
                </p>

                {/* Quick Select */}
                <div className="flex flex-wrap gap-2 mb-4">
                    {popularSelections.map(selection => (
                        <button
                            key={selection.key}
                            onClick={() => setSelectedMarkets(selection.codes.filter(c => c !== selectedPrimary))}
                            className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white text-sm rounded-full transition-colors"
                        >
                            {t(selection.key)}
                        </button>
                    ))}
                </div>

                {/* Selected Markets */}
                {marketLangs.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                        {marketLangs.map(lang => (
                            <span
                                key={lang.code}
                                className="px-3 py-1.5 bg-purple-500/20 text-purple-300 rounded-full text-sm flex items-center gap-2"
                            >
                                <span>{lang.flag}</span>
                                <span>{lang.name}</span>
                                <button
                                    onClick={() => toggleMarket(lang.code)}
                                    className="p-0.5 hover:bg-white/20 rounded-full transition-colors"
                                >
                                    <X className="w-3 h-3" />
                                </button>
                            </span>
                        ))}
                    </div>
                )}

                {/* Search and Language Grid */}
                <div className="relative mb-4">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder={t('searchLanguagesPlaceholder')}
                        className="input w-full pl-10"
                    />
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 max-h-64 overflow-y-auto custom-scrollbar">
                    {filteredLanguages.map(lang => {
                        const isSelected = selectedMarkets.includes(lang.code);
                        const isPrimary = lang.code === selectedPrimary;

                        return (
                            <button
                                key={lang.code}
                                onClick={() => toggleMarket(lang.code)}
                                disabled={isPrimary}
                                className={`p-3 rounded-lg border transition-all flex items-center gap-2 text-left ${isPrimary
                                    ? 'bg-yellow-500/10 border-yellow-500/30 cursor-not-allowed'
                                    : isSelected
                                        ? 'bg-purple-500/20 border-purple-500'
                                        : 'bg-white/5 border-white/10 hover:border-white/30'
                                    }`}
                            >
                                <span className="text-xl">{lang.flag}</span>
                                <div className="flex-1 min-w-0">
                                    <p className={`text-sm font-medium truncate ${isPrimary ? 'text-yellow-400' : 'text-white'}`}>
                                        {lang.name}
                                    </p>
                                    <p className="text-xs text-white/50 truncate">{lang.nativeName}</p>
                                </div>
                                {isSelected && !isPrimary && (
                                    <Check className="w-4 h-4 text-purple-400 flex-shrink-0" />
                                )}
                                {isPrimary && (
                                    <span className="text-xs text-yellow-400 flex-shrink-0">{t('primaryBadge')}</span>
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Auto-Translation Toggle */}
            <div className="card p-5">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-semibold text-white">{t('autoTranslationLabel')}</h3>
                        <p className="text-white/60 text-sm mt-1">
                            {t('autoTranslationDesc')}
                        </p>
                    </div>
                    <button
                        onClick={() => setAutoTranslate(!autoTranslate)}
                        className={`relative w-14 h-8 rounded-full transition-colors ${autoTranslate ? 'bg-green-500' : 'bg-white/20'
                            }`}
                    >
                        <div
                            className={`absolute top-1 left-1 w-6 h-6 rounded-full bg-white shadow transition-transform ${autoTranslate ? 'translate-x-6' : 'translate-x-0'
                                }`}
                        />
                    </button>
                </div>
            </div>

            {/* Coverage Summary */}
            <div className="p-4 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/20 rounded-xl">
                <div className="flex items-center gap-3">
                    <Globe className="w-8 h-8 text-blue-400" />
                    <div>
                        <p className="text-white font-medium">
                            {t('coverageSummary').replace('{percentage}', ((selectedMarkets.length + 1) / ALL_CONTENT_LANGUAGES.length * 100).toFixed(0))}
                        </p>
                        <p className="text-white/60 text-sm">
                            {t('coverageDetailsPrimary')}{primaryLang?.name}{t('coverageDetailsTranslations')}{selectedMarkets.length}{t('coverageDetailsLanguages')}
                        </p>
                    </div>
                </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end">
                <button
                    onClick={handleSave}
                    className="px-6 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white rounded-lg font-medium transition-all flex items-center gap-2"
                >
                    <Globe className="w-4 h-4" />
                    {t('saveLanguageSettings')}
                </button>
            </div>

            {/* Language Selection Modal */}
            {showLanguageModal && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="card w-full max-w-2xl max-h-[80vh] overflow-hidden">
                        <div className="p-4 border-b border-white/10 flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-white">{t('selectPrimaryLanguage')}</h3>
                            <button
                                onClick={() => setShowLanguageModal(false)}
                                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                            >
                                <X className="w-5 h-5 text-white/60" />
                            </button>
                        </div>
                        <div className="p-4">
                            <div className="relative mb-4">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                                <input
                                    type="text"
                                    placeholder={t('searchLanguagesPlaceholder')}
                                    className="input w-full pl-10"
                                />
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-96 overflow-y-auto custom-scrollbar">
                                {ALL_CONTENT_LANGUAGES.map(lang => (
                                    <button
                                        key={lang.code}
                                        onClick={() => {
                                            setSelectedPrimary(lang.code);
                                            setSelectedMarkets(prev => prev.filter(m => m !== lang.code));
                                            setShowLanguageModal(false);
                                        }}
                                        className={`p-4 rounded-lg border transition-all flex items-center gap-3 ${lang.code === selectedPrimary
                                            ? 'bg-purple-500/20 border-purple-500'
                                            : 'bg-white/5 border-white/10 hover:border-white/30'
                                            }`}
                                    >
                                        <span className="text-2xl">{lang.flag}</span>
                                        <div className="text-left">
                                            <p className="text-white font-medium">{lang.name}</p>
                                            <p className="text-white/60 text-sm">{lang.nativeName}</p>
                                        </div>
                                        {lang.code === selectedPrimary && (
                                            <Check className="w-5 h-5 text-purple-400 ml-auto" />
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
