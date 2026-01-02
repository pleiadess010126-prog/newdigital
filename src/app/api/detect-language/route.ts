import { NextRequest, NextResponse } from 'next/server';
import { COUNTRY_TO_LANGUAGE } from '@/lib/i18n/translations';

export async function GET(request: NextRequest) {
    try {
        // Try to get country from various headers
        // Vercel provides these headers automatically
        const country = request.headers.get('x-vercel-ip-country') ||
            request.headers.get('cf-ipcountry') || // Cloudflare
            request.headers.get('x-country-code') ||
            null;

        // Get IP address for logging/debugging
        const ip = request.headers.get('x-forwarded-for')?.split(',')[0] ||
            request.headers.get('x-real-ip') ||
            'unknown';

        // If we have a country code, map it to a language
        if (country) {
            const language = COUNTRY_TO_LANGUAGE[country.toUpperCase()] || 'en';
            return NextResponse.json({
                success: true,
                language,
                country,
                ip: ip.substring(0, 10) + '...', // Partial IP for privacy
                source: 'header'
            });
        }

        // Fallback: Try using a free IP geolocation API
        // Note: In production, you'd want to use a more reliable service
        try {
            const geoResponse = await fetch(`http://ip-api.com/json/${ip}?fields=countryCode`, {
                // Short timeout to avoid blocking
                signal: AbortSignal.timeout(2000)
            });

            if (geoResponse.ok) {
                const geoData = await geoResponse.json();
                if (geoData.countryCode) {
                    const language = COUNTRY_TO_LANGUAGE[geoData.countryCode.toUpperCase()] || 'en';
                    return NextResponse.json({
                        success: true,
                        language,
                        country: geoData.countryCode,
                        source: 'geo-api'
                    });
                }
            }
        } catch (geoError) {
            // Silently fail and use default
            console.log('Geo API fallback failed, using default language');
        }

        // Default to English if we can't detect
        return NextResponse.json({
            success: true,
            language: 'en',
            country: null,
            source: 'default'
        });

    } catch (error) {
        console.error('Language detection error:', error);
        return NextResponse.json({
            success: false,
            language: 'en',
            error: 'Detection failed'
        }, { status: 500 });
    }
}
