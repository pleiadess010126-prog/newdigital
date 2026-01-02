'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Globe, ChevronDown, Check } from 'lucide-react';
import { SUPPORTED_UI_LANGUAGES } from '@/lib/i18n/translations';

interface LanguageDropdownProps {
    currentLanguage: string;
    onLanguageChange: (languageCode: string) => void;
    variant?: 'light' | 'dark';
    compact?: boolean;
}

export default function LanguageDropdown({
    currentLanguage,
    onLanguageChange,
    variant = 'dark',
    compact = false
}: LanguageDropdownProps) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const currentLang = SUPPORTED_UI_LANGUAGES.find(l => l.code === currentLanguage) || SUPPORTED_UI_LANGUAGES[0];

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const baseStyles = variant === 'light'
        ? {
            button: 'bg-white/10 hover:bg-white/20 text-white border border-white/20',
            dropdown: 'bg-white border border-slate-200 shadow-2xl',
            item: 'text-slate-700 hover:bg-slate-100',
            itemActive: 'bg-violet-50 text-violet-700',
            check: 'text-violet-600'
        }
        : {
            button: 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-700',
            dropdown: 'bg-slate-900 border border-slate-700 shadow-2xl',
            item: 'text-slate-300 hover:bg-slate-800',
            itemActive: 'bg-violet-500/20 text-violet-300',
            check: 'text-violet-400'
        };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${baseStyles.button}`}
            >
                <Globe className="w-4 h-4" />
                {!compact && (
                    <>
                        <span className="text-lg">{currentLang.flag}</span>
                        <span className="text-sm font-medium hidden sm:block">{currentLang.code.toUpperCase()}</span>
                    </>
                )}
                {compact && <span className="text-lg">{currentLang.flag}</span>}
                <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <div className={`absolute right-0 top-full mt-2 w-64 rounded-xl overflow-hidden z-[100] ${baseStyles.dropdown}`}>
                    <div
                        className={`p-2 max-h-80 overflow-y-auto ${variant === 'dark' ? 'scrollbar-dark' : 'scrollbar-light'}`}
                        style={{
                            scrollbarWidth: 'thin',
                            scrollbarColor: variant === 'dark' ? '#6366f1 #1e293b' : '#8b5cf6 #e2e8f0'
                        }}
                    >
                        {SUPPORTED_UI_LANGUAGES.map((lang) => (
                            <button
                                key={lang.code}
                                onClick={() => {
                                    onLanguageChange(lang.code);
                                    setIsOpen(false);
                                }}
                                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-left ${currentLanguage === lang.code ? baseStyles.itemActive : baseStyles.item
                                    }`}
                            >
                                <span className="text-2xl">{lang.flag}</span>
                                <div className="flex-1 min-w-0">
                                    <p className="font-medium text-sm">{lang.name}</p>
                                    <p className="text-xs opacity-60">{lang.nativeName}</p>
                                </div>
                                {currentLanguage === lang.code && (
                                    <Check className={`w-4 h-4 ${baseStyles.check}`} />
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
