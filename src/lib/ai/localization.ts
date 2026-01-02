
/**
 * Global Cultural Localization (Transcreation) Logic
 */

export interface CulturalAdaptation {
    market: string;
    language: string;
    originalMetaphor: string;
    adaptedMetaphor: string;
    culturalContext: string;
    status: 'ready' | 'needs_review';
}

export const MOCK_ADAPTATIONS: CulturalAdaptation[] = [
    {
        market: 'India',
        language: 'Hindi / English',
        originalMetaphor: 'Hitting a home run with your marketing',
        adaptedMetaphor: 'Hitting a century at Lord’s in your marketing',
        culturalContext: 'Cricket is the primary sporting cultural touchstone in India. "Home run" is understood but lacks emotional resonance.',
        status: 'ready'
    },
    {
        market: 'Middle East',
        language: 'Arabic',
        originalMetaphor: 'Fast as a rocket ship',
        adaptedMetaphor: 'Fast as a falcon in flight',
        culturalContext: 'Falconry is a deep cultural heritage in the Gulf. Falcons represent speed, precision, and nobility.',
        status: 'ready'
    },
    {
        market: 'Japan',
        language: 'Japanese',
        originalMetaphor: 'Disrupting the industry',
        adaptedMetaphor: 'Harmonizing and evolving the industry',
        culturalContext: '"Disruption" can have a negative, chaotic connotation in Japanese business culture (Wa). Evolution and harmony are preferred.',
        status: 'needs_review'
    }
];

export async function transcreateContent(text: string, targetMarket: string) {
    console.log(`🌍 Transcreating content for ${targetMarket}: "${text.substring(0, 30)}..."`);
    await new Promise(resolve => setTimeout(resolve, 1200));
    return {
        transcreatedText: "Adapted text with cultural nuances...",
        culturalNotes: "Note: used local idiom for 'success'...",
    };
}
