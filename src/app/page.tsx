'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import {
  Sparkles, Shield, Zap, ArrowRight, BarChart3, Layers,
  CheckCircle2, Rocket, TrendingUp, Globe, Play,
  Youtube, Instagram, Facebook, FileText, Bot, LineChart
} from 'lucide-react';
import LanguageDropdown from '@/components/LanguageDropdown';
import { getTranslation, SUPPORTED_UI_LANGUAGES } from '@/lib/i18n/translations';

export default function HomePage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [activeFeature, setActiveFeature] = useState(0);
  const [currentLanguage, setCurrentLanguage] = useState('en');
  const [languageDetected, setLanguageDetected] = useState(false);

  // Helper function to get translations
  const t = (key: string) => getTranslation(currentLanguage, key);

  // Detect language from IP on mount
  useEffect(() => {
    setMounted(true);

    // Check localStorage first for saved preference
    const savedLang = localStorage.getItem('preferredLanguage');
    if (savedLang && SUPPORTED_UI_LANGUAGES.some(l => l.code === savedLang)) {
      setCurrentLanguage(savedLang);
      setLanguageDetected(true);
      return;
    }

    // Detect language from IP
    const detectLanguage = async () => {
      try {
        const response = await fetch('/api/detect-language');
        const data = await response.json();
        if (data.success && data.language) {
          // Only set if we have translations for this language
          if (SUPPORTED_UI_LANGUAGES.some(l => l.code === data.language)) {
            setCurrentLanguage(data.language);
            localStorage.setItem('preferredLanguage', data.language);
          }
        }
      } catch (error) {
        console.log('Language detection failed, using default');
      } finally {
        setLanguageDetected(true);
      }
    };

    detectLanguage();
  }, []);

  // Handle language change
  const handleLanguageChange = (langCode: string) => {
    setCurrentLanguage(langCode);
    localStorage.setItem('preferredLanguage', langCode);
  };

  useEffect(() => {
    const onboardingData = localStorage.getItem('onboardingData');
    if (onboardingData) {
      router.push('/dashboard');
    }
  }, [router]);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % 4);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  if (!mounted) return null;

  const features = [
    { icon: Bot, label: 'AI Content', color: 'from-violet-500 to-purple-500' },
    { icon: Youtube, label: 'YouTube', color: 'from-red-500 to-rose-500' },
    { icon: Instagram, label: 'Instagram', color: 'from-pink-500 to-orange-500' },
    { icon: Facebook, label: 'Facebook', color: 'from-blue-500 to-cyan-500' },
  ];

  // Check if current language is RTL
  const isRTL = ['ar', 'he', 'fa', 'ur'].includes(currentLanguage);

  return (
    <div className={`min-h-screen bg-[#0a0a0f] text-white overflow-hidden ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {/* Gradient orbs */}
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-purple-600/30 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute top-[20%] right-[-10%] w-[500px] h-[500px] bg-blue-600/25 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute bottom-[-10%] left-[30%] w-[700px] h-[700px] bg-fuchsia-600/20 rounded-full blur-[150px] animate-pulse" style={{ animationDelay: '2s' }} />

        {/* Grid overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:100px_100px]" />
      </div>

      {/* Navigation */}
      <nav className="relative z-50 border-b border-white/10 bg-black/20 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image
              src="/logo.jpg"
              alt="DigitalMEng Logo"
              width={48}
              height={48}
              className="object-contain"
              priority
            />
            <div className="flex flex-col">
              <span className="text-xl font-bold tracking-tight">
                Digital<span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-fuchsia-400">MEng</span>
              </span>
              <span className="text-xs text-white/50">Organic Digital Marketing Engine</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {/* Language Dropdown */}
            <LanguageDropdown
              currentLanguage={currentLanguage}
              onLanguageChange={handleLanguageChange}
              variant="light"
            />
            <button
              onClick={() => router.push('/login')}
              className="px-4 py-2 text-sm font-medium text-white/70 hover:text-white transition-colors"
            >
              {t('login')}
            </button>
            <button
              onClick={() => router.push('/dashboard')}
              className="px-4 py-2 text-sm font-medium text-white/70 hover:text-white transition-colors flex items-center gap-2"
            >
              <Play className="w-4 h-4" />
              {t('demo')}
            </button>
            <button
              onClick={() => router.push('/signup')}
              className="px-5 py-2.5 text-sm font-semibold rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 transition-all shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40"
            >
              {t('getStarted')}
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 pt-20 pb-32">
        <div className="text-center">
          {/* Announcement Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm mb-8">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            <span className="text-sm text-white/80">{t('poweredBy')}</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tight leading-[0.9] mb-8">
            <span className="block text-white">{t('heroTitle1')}</span>
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-fuchsia-400 to-pink-400">
              {t('heroTitle2')}
            </span>
          </h1>

          {/* Subheadline */}
          <p className="text-lg md:text-xl text-white/60 max-w-2xl mx-auto mb-12 leading-relaxed">
            {t('heroSubtitle')}
            <span className="text-white font-medium"> {t('fullyAutomated')}</span>
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-20">
            <button
              onClick={() => router.push('/onboarding')}
              className="group px-8 py-4 text-lg font-semibold rounded-2xl bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 transition-all shadow-2xl shadow-violet-500/30 hover:shadow-violet-500/50 flex items-center justify-center gap-3"
            >
              <Rocket className="w-5 h-5" />
              {t('startFreeTrial')}
              <ArrowRight className={`w-5 h-5 ${isRTL ? 'rotate-180 group-hover:-translate-x-1' : 'group-hover:translate-x-1'} transition-transform`} />
            </button>
            <button
              onClick={() => router.push('/dashboard')}
              className="px-8 py-4 text-lg font-semibold rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 backdrop-blur-sm transition-all flex items-center justify-center gap-3"
            >
              <Play className="w-5 h-5" />
              {t('watchDemo')}
            </button>
          </div>

          {/* Animated Platform Icons */}
          <div className="flex justify-center gap-4 mb-16">
            {features.map((feature, index) => (
              <div
                key={index}
                className={`relative p-4 rounded-2xl transition-all duration-500 ${activeFeature === index
                  ? 'bg-gradient-to-br ' + feature.color + ' scale-110 shadow-2xl'
                  : 'bg-white/5 border border-white/10'
                  }`}
              >
                <feature.icon className={`w-8 h-8 ${activeFeature === index ? 'text-white' : 'text-white/50'}`} />
                {activeFeature === index && (
                  <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-xs font-medium text-white/70 whitespace-nowrap">
                    {feature.label}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Stats Bar */}
        <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { value: '10x', label: t('contentOutput'), color: 'text-violet-400' },
            { value: '90+', label: t('dayAutomation'), color: 'text-fuchsia-400' },
            { value: '4+', label: t('aiAgents'), color: 'text-pink-400' },
            { value: '0%', label: t('manualWork'), color: 'text-cyan-400' },
          ].map((stat, index) => (
            <div
              key={index}
              className="text-center p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-all"
            >
              <div className={`text-4xl md:text-5xl font-black mb-2 ${stat.color}`}>
                {stat.value}
              </div>
              <div className="text-sm text-white/50 font-medium">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="relative z-10 py-24 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">
              {t('fullyAutomatedTitle').split(' ').slice(0, 1).join(' ')} <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-fuchsia-400">{t('fullyAutomatedTitle').split(' ').slice(1).join(' ')}</span>
            </h2>
            <p className="text-white/50 text-lg max-w-2xl mx-auto">
              {t('fullyAutomatedDesc')}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: Sparkles,
                title: t('aiContentGen'),
                description: t('aiContentGenDesc'),
                gradient: 'from-violet-500/20 to-purple-500/20',
                iconBg: 'from-violet-500 to-purple-500',
              },
              {
                icon: Shield,
                title: t('riskFreeGrowth'),
                description: t('riskFreeGrowthDesc'),
                gradient: 'from-emerald-500/20 to-green-500/20',
                iconBg: 'from-emerald-500 to-green-500',
              },
              {
                icon: Zap,
                title: t('multiChannelPublishing'),
                description: t('multiChannelPublishingDesc'),
                gradient: 'from-cyan-500/20 to-blue-500/20',
                iconBg: 'from-cyan-500 to-blue-500',
              },
            ].map((feature, index) => (
              <div
                key={index}
                className={`group p-8 rounded-3xl bg-gradient-to-br ${feature.gradient} border border-white/10 hover:border-white/20 transition-all hover:-translate-y-2`}
              >
                <div className={`inline-flex p-4 rounded-2xl bg-gradient-to-br ${feature.iconBg} mb-6`}>
                  <feature.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-white/60 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="relative z-10 py-24 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">
              {t('howItWorks').split(' ').slice(0, 2).join(' ')} <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-fuchsia-400">{t('howItWorks').split(' ').slice(2).join(' ') || t('howItWorks').split(' ').slice(-1)}</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            {[
              { step: '01', title: t('connect'), desc: t('connectDesc'), icon: Globe },
              { step: '02', title: t('configure'), desc: t('configureDesc'), icon: Layers },
              { step: '03', title: t('generate'), desc: t('generateDesc'), icon: Bot },
              { step: '04', title: t('grow'), desc: t('growDesc'), icon: TrendingUp },
            ].map((item, index) => (
              <div key={index} className="relative text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-violet-600 to-fuchsia-600 mb-6">
                  <item.icon className="w-7 h-7 text-white" />
                </div>
                <div className="text-xs font-bold text-violet-400 mb-2">{item.step}</div>
                <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                <p className="text-white/50 text-sm">{item.desc}</p>
                {index < 3 && !isRTL && (
                  <div className="hidden md:block absolute top-8 left-[60%] w-[80%] h-[2px] bg-gradient-to-r from-violet-500/50 to-transparent" />
                )}
                {index < 3 && isRTL && (
                  <div className="hidden md:block absolute top-8 right-[60%] w-[80%] h-[2px] bg-gradient-to-l from-violet-500/50 to-transparent" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tech Stack */}
      <section className="relative z-10 py-16 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-6">
          <p className="text-center text-sm text-white/40 mb-8 uppercase tracking-wider">Enterprise Technology Stack</p>
          <div className="flex flex-wrap justify-center gap-8 text-white/30">
            {[
              { name: 'Amazon Bedrock', icon: Layers },
              { name: 'AWS Lambda', icon: Zap },
              { name: 'DynamoDB', icon: FileText },
              { name: 'Next.js 16', icon: Globe },
              { name: 'OpenSearch', icon: LineChart },
            ].map((tech, index) => (
              <div key={index} className="flex items-center gap-2 hover:text-white/60 transition-colors">
                <tech.icon className="w-5 h-5" />
                <span className="font-medium">{tech.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative z-10 py-24 border-t border-white/10">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <div className="p-12 rounded-3xl bg-gradient-to-br from-violet-600/20 to-fuchsia-600/20 border border-white/10 backdrop-blur-xl">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              {t('readyToAutomate')}
            </h2>
            <p className="text-white/60 mb-8 text-lg">
              {t('joinBusinesses')}
            </p>
            <button
              onClick={() => router.push('/onboarding')}
              className="px-10 py-5 text-lg font-semibold rounded-2xl bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 transition-all shadow-2xl shadow-violet-500/30 hover:shadow-violet-500/50"
            >
              {t('startFreeTrial')}
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 py-8 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-6 text-center text-white/30 text-sm">
          {t('copyright')}
        </div>
      </footer>
    </div>
  );
}
