/**
 * DigitalMEng Global Self-Promotion Engine
 * Multi-language campaign for worldwide reach
 */

// All 20+ supported languages with regional targeting
export const GLOBAL_LANGUAGES = [
    { code: 'en', name: 'English', regions: ['US', 'UK', 'AU', 'CA', 'Global'], priority: 1, population: '1.5B' },
    { code: 'es', name: 'Spanish', regions: ['ES', 'MX', 'AR', 'CO', 'LatAm'], priority: 1, population: '550M' },
    { code: 'zh', name: 'Chinese', regions: ['CN', 'TW', 'HK', 'SG'], priority: 2, population: '1.1B' },
    { code: 'hi', name: 'Hindi', regions: ['IN'], priority: 1, population: '600M' },
    { code: 'ar', name: 'Arabic', regions: ['SA', 'AE', 'EG', 'MENA'], priority: 2, population: '420M' },
    { code: 'pt', name: 'Portuguese', regions: ['BR', 'PT'], priority: 1, population: '260M' },
    { code: 'fr', name: 'French', regions: ['FR', 'CA', 'BE', 'Africa'], priority: 2, population: '300M' },
    { code: 'de', name: 'German', regions: ['DE', 'AT', 'CH'], priority: 2, population: '130M' },
    { code: 'ja', name: 'Japanese', regions: ['JP'], priority: 2, population: '125M' },
    { code: 'ru', name: 'Russian', regions: ['RU', 'CIS'], priority: 3, population: '250M' },
    { code: 'ko', name: 'Korean', regions: ['KR'], priority: 2, population: '80M' },
    { code: 'it', name: 'Italian', regions: ['IT'], priority: 3, population: '65M' },
    { code: 'id', name: 'Indonesian', regions: ['ID'], priority: 2, population: '270M' },
    { code: 'nl', name: 'Dutch', regions: ['NL', 'BE'], priority: 3, population: '30M' },
    { code: 'pl', name: 'Polish', regions: ['PL'], priority: 3, population: '45M' },
    { code: 'tr', name: 'Turkish', regions: ['TR'], priority: 2, population: '85M' },
    { code: 'vi', name: 'Vietnamese', regions: ['VN'], priority: 2, population: '100M' },
    { code: 'th', name: 'Thai', regions: ['TH'], priority: 3, population: '70M' },
    { code: 'sv', name: 'Swedish', regions: ['SE'], priority: 3, population: '10M' },
    { code: 'da', name: 'Danish', regions: ['DK'], priority: 3, population: '6M' },
];

// Localized brand messages for each language
export const LOCALIZED_TAGLINES: Record<string, string> = {
    en: 'Your AI Marketing Team That Never Sleeps',
    es: 'Tu Equipo de Marketing con IA que Nunca Duerme',
    zh: '永不休息的AI营销团队',
    hi: 'आपकी AI मार्केटिंग टीम जो कभी नहीं सोती',
    ar: 'فريق التسويق بالذكاء الاصطناعي الذي لا ينام أبدًا',
    pt: 'Sua Equipe de Marketing com IA que Nunca Dorme',
    fr: 'Votre Équipe Marketing IA qui ne Dort Jamais',
    de: 'Ihr KI-Marketing-Team, das niemals schläft',
    ja: '眠らないAIマーケティングチーム',
    ru: 'Ваша ИИ-команда маркетинга, которая никогда не спит',
    ko: '잠들지 않는 AI 마케팅 팀',
    it: 'Il Tuo Team di Marketing AI che non Dorme Mai',
    id: 'Tim Pemasaran AI Anda yang Tidak Pernah Tidur',
    nl: 'Uw AI-marketingteam dat nooit slaapt',
    pl: 'Twój zespół marketingowy AI, który nigdy nie śpi',
    tr: 'Hiç Uyumayan Yapay Zeka Pazarlama Ekibiniz',
    vi: 'Đội ngũ Marketing AI không bao giờ ngủ',
    th: 'ทีมการตลาด AI ที่ไม่เคยหลับ',
    sv: 'Ditt AI-marknadsföringsteam som aldrig sover',
    da: 'Dit AI-marketingteam der aldrig sover',
};

// Regional pricing (adjusted for purchasing power)
export const REGIONAL_PRICING: Record<string, { currency: string; multiplier: number }> = {
    US: { currency: 'USD', multiplier: 1.00 },
    UK: { currency: 'GBP', multiplier: 0.80 },
    EU: { currency: 'EUR', multiplier: 0.92 },
    IN: { currency: 'INR', multiplier: 0.40 },
    BR: { currency: 'BRL', multiplier: 0.50 },
    MX: { currency: 'MXN', multiplier: 0.45 },
    JP: { currency: 'JPY', multiplier: 0.95 },
    KR: { currency: 'KRW', multiplier: 0.85 },
    CN: { currency: 'CNY', multiplier: 0.70 },
    ID: { currency: 'IDR', multiplier: 0.35 },
    TH: { currency: 'THB', multiplier: 0.40 },
    VN: { currency: 'VND', multiplier: 0.35 },
    AE: { currency: 'AED', multiplier: 0.90 },
    SA: { currency: 'SAR', multiplier: 0.85 },
    TR: { currency: 'TRY', multiplier: 0.30 },
    RU: { currency: 'RUB', multiplier: 0.35 },
    PL: { currency: 'PLN', multiplier: 0.60 },
};

// Global content calendar - content per language per week
export interface GlobalContentPlan {
    language: string;
    contentPerWeek: number;
    platforms: string[];
    focusTopics: string[];
}

export const GLOBAL_CONTENT_PLANS: GlobalContentPlan[] = [
    {
        language: 'en',
        contentPerWeek: 21,
        platforms: ['blog', 'instagram', 'linkedin', 'youtube', 'twitter', 'tiktok'],
        focusTopics: ['AI Marketing', 'Content Automation', 'Video Generation', 'Multi-platform Publishing'],
    },
    {
        language: 'es',
        contentPerWeek: 14,
        platforms: ['blog', 'instagram', 'linkedin', 'youtube', 'twitter'],
        focusTopics: ['Marketing con IA', 'Automatización de Contenido', 'Negocios en Latinoamérica'],
    },
    {
        language: 'hi',
        contentPerWeek: 10,
        platforms: ['blog', 'instagram', 'youtube', 'twitter'],
        focusTopics: ['AI मार्केटिंग', 'Digital Marketing India', 'Small Business Growth'],
    },
    {
        language: 'pt',
        contentPerWeek: 10,
        platforms: ['blog', 'instagram', 'linkedin', 'youtube'],
        focusTopics: ['Marketing Digital Brasil', 'Automação com IA', 'Crescimento de Negócios'],
    },
    {
        language: 'fr',
        contentPerWeek: 7,
        platforms: ['blog', 'instagram', 'linkedin', 'twitter'],
        focusTopics: ['Marketing IA', 'Automatisation', 'Stratégie Digitale'],
    },
    {
        language: 'de',
        contentPerWeek: 7,
        platforms: ['blog', 'linkedin', 'youtube', 'twitter'],
        focusTopics: ['KI-Marketing', 'Digitale Transformation', 'B2B Marketing'],
    },
    {
        language: 'zh',
        contentPerWeek: 7,
        platforms: ['blog', 'weibo', 'wechat', 'xiaohongshu'],
        focusTopics: ['人工智能营销', '内容自动化', '数字营销策略'],
    },
    {
        language: 'ja',
        contentPerWeek: 7,
        platforms: ['blog', 'twitter', 'youtube', 'line'],
        focusTopics: ['AIマーケティング', 'コンテンツ自動化', 'デジタル戦略'],
    },
    {
        language: 'ar',
        contentPerWeek: 7,
        platforms: ['blog', 'instagram', 'twitter', 'youtube'],
        focusTopics: ['التسويق بالذكاء الاصطناعي', 'الأعمال الرقمية', 'النمو في الشرق الأوسط'],
    },
    {
        language: 'ko',
        contentPerWeek: 5,
        platforms: ['blog', 'instagram', 'youtube', 'naver'],
        focusTopics: ['AI 마케팅', '콘텐츠 자동화', '디지털 마케팅'],
    },
    {
        language: 'id',
        contentPerWeek: 5,
        platforms: ['blog', 'instagram', 'youtube', 'tiktok'],
        focusTopics: ['Pemasaran AI', 'Bisnis Digital Indonesia', 'UMKM Growth'],
    },
    {
        language: 'vi',
        contentPerWeek: 5,
        platforms: ['blog', 'facebook', 'youtube', 'tiktok'],
        focusTopics: ['Marketing AI', 'Kinh doanh số', 'Phát triển doanh nghiệp'],
    },
    {
        language: 'tr',
        contentPerWeek: 5,
        platforms: ['blog', 'instagram', 'twitter', 'youtube'],
        focusTopics: ['Yapay Zeka Pazarlama', 'Dijital Dönüşüm', 'KOBİ Büyümesi'],
    },
    {
        language: 'ru',
        contentPerWeek: 5,
        platforms: ['blog', 'vk', 'telegram', 'youtube'],
        focusTopics: ['ИИ маркетинг', 'Автоматизация контента', 'Цифровой бизнес'],
    },
    {
        language: 'it',
        contentPerWeek: 3,
        platforms: ['blog', 'instagram', 'linkedin'],
        focusTopics: ['Marketing AI', 'Automazione Digitale', 'Crescita PMI'],
    },
    {
        language: 'pl',
        contentPerWeek: 3,
        platforms: ['blog', 'linkedin', 'facebook'],
        focusTopics: ['Marketing AI', 'Automatyzacja', 'Biznes cyfrowy'],
    },
    {
        language: 'nl',
        contentPerWeek: 3,
        platforms: ['blog', 'linkedin', 'instagram'],
        focusTopics: ['AI Marketing', 'Digitale Strategie', 'Bedrijfsgroei'],
    },
    {
        language: 'th',
        contentPerWeek: 3,
        platforms: ['blog', 'facebook', 'line', 'tiktok'],
        focusTopics: ['การตลาด AI', 'ธุรกิจดิจิทัล', 'SME ไทย'],
    },
    {
        language: 'sv',
        contentPerWeek: 2,
        platforms: ['blog', 'linkedin'],
        focusTopics: ['AI-marknadsföring', 'Digital strategi'],
    },
    {
        language: 'da',
        contentPerWeek: 2,
        platforms: ['blog', 'linkedin'],
        focusTopics: ['AI-marketing', 'Digital vækst'],
    },
];

// Calculate total global content output
export function calculateGlobalOutput(): {
    totalContentPerWeek: number;
    totalContentPerMonth: number;
    totalContentPer90Days: number;
    estimatedCost: number;
    estimatedReach: string;
} {
    const totalPerWeek = GLOBAL_CONTENT_PLANS.reduce((sum, plan) => sum + plan.contentPerWeek, 0);

    return {
        totalContentPerWeek: totalPerWeek,
        totalContentPerMonth: totalPerWeek * 4,
        totalContentPer90Days: totalPerWeek * 13,
        estimatedCost: totalPerWeek * 13 * 0.05, // $0.05 avg per content
        estimatedReach: '4.5 billion potential users',
    };
}

// Generate localized content prompt
export function generateLocalizedPrompt(
    topic: string,
    language: string,
    platform: string
): string {
    const langName = GLOBAL_LANGUAGES.find(l => l.code === language)?.name || 'English';
    const tagline = LOCALIZED_TAGLINES[language] || LOCALIZED_TAGLINES.en;

    return `
You are a marketing expert writing content for DigitalMEng in ${langName}.

Brand: DigitalMEng - ${tagline}
Platform: ${platform}
Language: ${langName} (write ONLY in ${langName})

Important Guidelines:
1. Write naturally in ${langName} - NOT translated English
2. Use local idioms and expressions
3. Reference local business culture
4. Use appropriate formality level for the region
5. Include region-specific examples when possible

Topic: ${topic}

Create engaging, native ${langName} content that resonates with local audiences.
`;
}

// Social media handles for each language
export const GLOBAL_SOCIAL_HANDLES = {
    en: { instagram: '@digitalmeng', twitter: '@digitalmeng_ai', youtube: '@DigitalMEngAI' },
    es: { instagram: '@digitalmeng_es', twitter: '@digitalmeng_es', youtube: '@DigitalMEngES' },
    pt: { instagram: '@digitalmeng_br', twitter: '@digitalmeng_br', youtube: '@DigitalMEngBR' },
    hi: { instagram: '@digitalmeng_in', twitter: '@digitalmeng_in', youtube: '@DigitalMEngIN' },
    fr: { instagram: '@digitalmeng_fr', twitter: '@digitalmeng_fr', youtube: '@DigitalMEngFR' },
    de: { instagram: '@digitalmeng_de', twitter: '@digitalmeng_de', youtube: '@DigitalMEngDE' },
    zh: { weibo: '@DigitalMEng数字营销', wechat: 'DigitalMEng_CN' },
    ja: { twitter: '@digitalmeng_jp', youtube: '@DigitalMEngJP' },
    ar: { instagram: '@digitalmeng_ar', twitter: '@digitalmeng_ar', youtube: '@DigitalMEngAR' },
    ko: { instagram: '@digitalmeng_kr', youtube: '@DigitalMEngKR' },
    id: { instagram: '@digitalmeng_id', tiktok: '@digitalmeng_id', youtube: '@DigitalMEngID' },
    vi: { facebook: 'DigitalMEngVN', tiktok: '@digitalmeng_vn' },
    tr: { instagram: '@digitalmeng_tr', twitter: '@digitalmeng_tr' },
    ru: { vk: 'digitalmeng_ru', telegram: '@digitalmeng_ru' },
    it: { instagram: '@digitalmeng_it', linkedin: 'digitalmeng-it' },
    pl: { linkedin: 'digitalmeng-pl', facebook: 'DigitalMEngPL' },
    nl: { linkedin: 'digitalmeng-nl', instagram: '@digitalmeng_nl' },
    th: { facebook: 'DigitalMEngTH', line: '@digitalmeng_th' },
    sv: { linkedin: 'digitalmeng-se' },
    da: { linkedin: 'digitalmeng-dk' },
};

// Regional hashtags
export const REGIONAL_HASHTAGS: Record<string, string[]> = {
    en: ['#AIMarketing', '#ContentAutomation', '#DigitalMarketing', '#MarTech'],
    es: ['#MarketingDigital', '#IAMarketing', '#Emprendedores', '#NegociosOnline'],
    pt: ['#MarketingDigital', '#IAMarketing', '#Empreendedorismo', '#NegociosDigitais'],
    hi: ['#डिजिटलमार्केटिंग', '#AIMarketing', '#व्यापार', '#स्टार्टअप'],
    ar: ['#التسويق_الرقمي', '#الذكاء_الاصطناعي', '#ريادة_الأعمال'],
    fr: ['#MarketingDigital', '#IntelligenceArtificielle', '#Entrepreneuriat'],
    de: ['#DigitalesMarketing', '#KIMarketing', '#Unternehmertum', '#B2BMarketing'],
    ja: ['#デジタルマーケティング', '#AI活用', '#ビジネス成長'],
    ko: ['#디지털마케팅', '#AI마케팅', '#비즈니스성장'],
    zh: ['#数字营销', '#人工智能', '#创业'],
    id: ['#PemasaranDigital', '#AIMarketing', '#BisnisOnline', '#UMKM'],
    vi: ['#MarketingOnline', '#KinhDoanhSo', '#AI'],
    tr: ['#DijitalPazarlama', '#YapayZeka', '#Girişimcilik'],
    ru: ['#ЦифровойМаркетинг', '#ИИMаркетинг', '#Бизнес'],
    it: ['#MarketingDigitale', '#IntelligenzaArtificiale', '#PMI'],
    nl: ['#DigitaleMarketing', '#AIMarketing', '#Ondernemen'],
    pl: ['#MarketingCyfrowy', '#SztucznaInteligencja', '#Biznes'],
    th: ['#การตลาดดิจิทัล', '#ธุรกิจออนไลน์', '#SME'],
};

// Global campaign configuration
export const GLOBAL_CAMPAIGN_CONFIG = {
    name: 'DigitalMEng Global Launch',
    startDate: new Date(),
    durationDays: 90,
    languages: GLOBAL_LANGUAGES.length,

    totals: calculateGlobalOutput(),

    goals: {
        impressions: 10_000_000,
        websiteVisits: 100_000,
        signups: 5_000,
        paidConversions: 500,
        targetRevenue: 50_000,
    },

    budget: {
        aiContentCost: 100, // $100 for 90 days
        totalEstimatedCost: 150, // Including all APIs
        expectedROI: '33,000%', // $50K revenue / $150 cost
    },
};

// Export summary for display
export function getGlobalCampaignSummary(): string {
    const output = calculateGlobalOutput();

    return `
╔══════════════════════════════════════════════════════════════╗
║         DIGITALMENG GLOBAL SELF-PROMOTION CAMPAIGN           ║
╠══════════════════════════════════════════════════════════════╣
║                                                              ║
║  🌍 Languages: 20+                                           ║
║  📝 Content/Week: ${output.totalContentPerWeek} pieces                              ║
║  📅 90-Day Total: ${output.totalContentPer90Days} pieces                            ║
║  💰 Estimated Cost: $${output.estimatedCost.toFixed(2)}                              ║
║  🎯 Potential Reach: ${output.estimatedReach}               ║
║                                                              ║
║  TARGET RESULTS:                                             ║
║  ├── Impressions: 10,000,000                                 ║
║  ├── Website Visits: 100,000                                 ║
║  ├── Free Signups: 5,000                                     ║
║  ├── Paid Customers: 500                                     ║
║  └── Revenue: $50,000+                                       ║
║                                                              ║
║  ROI: 33,000%+ 🚀                                            ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
`;
}

console.log('🌍 DigitalMEng Global Self-Promotion Engine loaded!');
console.log(getGlobalCampaignSummary());
