/**
 * Global Currency & IP Detection System
 * Handles multi-currency pricing based on user location
 */

export interface CurrencyConfig {
    code: string;
    symbol: string;
    rate: number; // Rate relative to USD
    format: string; // e.g., 'symbol' or 'code'
    decimalPlaces: number;
}

export const CURRENCIES: Record<string, CurrencyConfig> = {
    // North America
    USD: { code: 'USD', symbol: '$', rate: 1, format: 'symbol', decimalPlaces: 0 },
    CAD: { code: 'CAD', symbol: 'C$', rate: 1.36, format: 'symbol', decimalPlaces: 0 },
    MXN: { code: 'MXN', symbol: 'MX$', rate: 17.15, format: 'symbol', decimalPlaces: 0 },

    // Europe
    EUR: { code: 'EUR', symbol: '€', rate: 0.92, format: 'symbol', decimalPlaces: 0 },
    GBP: { code: 'GBP', symbol: '£', rate: 0.79, format: 'symbol', decimalPlaces: 0 },
    CHF: { code: 'CHF', symbol: 'CHF', rate: 0.88, format: 'code', decimalPlaces: 0 },
    PLN: { code: 'PLN', symbol: 'zł', rate: 3.98, format: 'symbol', decimalPlaces: 0 },
    TRY: { code: 'TRY', symbol: '₺', rate: 30.25, format: 'symbol', decimalPlaces: 0 },

    // Asia Pacific
    INR: { code: 'INR', symbol: '₹', rate: 83.3, format: 'symbol', decimalPlaces: 0 },
    JPY: { code: 'JPY', symbol: '¥', rate: 151.4, format: 'symbol', decimalPlaces: 0 },
    CNY: { code: 'CNY', symbol: '¥', rate: 7.24, format: 'symbol', decimalPlaces: 0 },
    KRW: { code: 'KRW', symbol: '₩', rate: 1320, format: 'symbol', decimalPlaces: 0 },
    SGD: { code: 'SGD', symbol: 'S$', rate: 1.34, format: 'symbol', decimalPlaces: 0 },
    AUD: { code: 'AUD', symbol: 'A$', rate: 1.52, format: 'symbol', decimalPlaces: 0 },

    // Latin America
    BRL: { code: 'BRL', symbol: 'R$', rate: 4.97, format: 'symbol', decimalPlaces: 0 },

    // Middle East
    AED: { code: 'AED', symbol: 'د.إ', rate: 3.67, format: 'symbol', decimalPlaces: 0 },

    // Africa
    ZAR: { code: 'ZAR', symbol: 'R', rate: 18.65, format: 'symbol', decimalPlaces: 0 },
};

// Map of countries to their currencies (expanded for global coverage)
const COUNTRY_TO_CURRENCY: Record<string, string> = {
    // North America
    US: 'USD',
    CA: 'CAD',
    MX: 'MXN',

    // Europe
    GB: 'GBP',
    DE: 'EUR',
    FR: 'EUR',
    IT: 'EUR',
    ES: 'EUR',
    NL: 'EUR',
    BE: 'EUR',
    AT: 'EUR',
    PT: 'EUR',
    IE: 'EUR',
    FI: 'EUR',
    GR: 'EUR',
    CH: 'CHF',
    PL: 'PLN',
    TR: 'TRY',

    // Asia Pacific
    IN: 'INR',
    JP: 'JPY',
    CN: 'CNY',
    KR: 'KRW',
    SG: 'SGD',
    AU: 'AUD',
    NZ: 'AUD',
    HK: 'USD', // HKD pegged to USD
    TW: 'USD', // Often priced in USD
    MY: 'SGD', // Close to SGD
    TH: 'USD', // Often priced in USD
    VN: 'USD', // Often priced in USD
    ID: 'USD', // Often priced in USD
    PH: 'USD', // Often priced in USD

    // Latin America
    BR: 'BRL',
    AR: 'USD', // Dollarized pricing common
    CL: 'USD', // Often priced in USD
    CO: 'USD', // Often priced in USD
    PE: 'USD', // Often priced in USD

    // Middle East
    AE: 'AED',
    SA: 'AED', // Close rate to AED
    QA: 'AED', // Gulf region
    KW: 'AED', // Gulf region
    BH: 'AED', // Gulf region
    OM: 'AED', // Gulf region

    // Africa
    ZA: 'ZAR',
    NG: 'USD', // Often priced in USD
    EG: 'USD', // Often priced in USD
    KE: 'USD', // Often priced in USD
};

/**
 * Detects user currency based on IP address
 * Uses ipapi.co (Free tier works without key for development)
 */
export async function detectCurrency(): Promise<CurrencyConfig> {
    try {
        const response = await fetch('https://ipapi.co/json/');
        const data = await response.json();
        const countryCode = data.country_code;
        const currencyCode = COUNTRY_TO_CURRENCY[countryCode] || 'USD';
        return CURRENCIES[currencyCode] || CURRENCIES.USD;
    } catch (error) {
        console.error('Failed to detect currency:', error);
        return CURRENCIES.USD;
    }
}

/**
 * Formats a price in the target currency
 */
export function formatCurrency(amount: number, currency: CurrencyConfig): string {
    const converted = amount * currency.rate;

    // Clean rounding for pretty pricing (e.g., 833.45 -> 835 or 839)
    let finalAmount = Math.ceil(converted);

    // Psychology pricing: round to 9s or 5s for non-zero prices
    if (finalAmount > 10) {
        if (finalAmount % 10 === 0) finalAmount -= 1; // 100 -> 99
        else if (finalAmount % 10 < 5) finalAmount = Math.floor(finalAmount / 10) * 10 + 5; // 82 -> 85
    }

    const formatter = new Intl.NumberFormat(undefined, {
        style: 'currency',
        currency: currency.code,
        maximumFractionDigits: currency.decimalPlaces,
    });

    return formatter.format(finalAmount);
}
