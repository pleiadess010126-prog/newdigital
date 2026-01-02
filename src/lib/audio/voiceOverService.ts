// AI Voice Over Generation Service
// Integrates with ElevenLabs, Google Cloud TTS, and AWS Polly

export interface VoiceConfig {
    provider: 'elevenlabs' | 'google-tts' | 'aws-polly' | 'mock';
    apiKey?: string;
    region?: string; // For AWS Polly
}

export interface Voice {
    id: string;
    name: string;
    gender: 'male' | 'female' | 'neutral';
    accent: string;
    language: string;
    preview?: string;
    provider: string;
}

export interface VoiceOverParams {
    text: string;
    voiceId?: string;
    speed?: number;      // 0.5 to 2.0
    pitch?: number;      // -20 to 20
    volume?: number;     // 0 to 100
    format?: 'mp3' | 'wav' | 'ogg';
}

export interface VoiceOverResult {
    audioUrl: string;
    duration: number;    // seconds
    format: string;
    wordCount: number;
}

// ElevenLabs voice library
const ELEVENLABS_VOICES: Voice[] = [
    { id: 'EXAVITQu4vr4xnSDxMaL', name: 'Bella', gender: 'female', accent: 'American', language: 'en', provider: 'elevenlabs' },
    { id: '21m00TCm4tlvDq8ikWAM', name: 'Rachel', gender: 'female', accent: 'American', language: 'en', provider: 'elevenlabs' },
    { id: 'AZnZlhzTzTkHNW5qW40v', name: 'Domi', gender: 'female', accent: 'American', language: 'en', provider: 'elevenlabs' },
    { id: 'MF3a5zrxMFknFQ0QnG2x', name: 'Elli', gender: 'female', accent: 'American', language: 'en', provider: 'elevenlabs' },
    { id: 'TxGEqnHWrfWFTfGW9XjX', name: 'Josh', gender: 'male', accent: 'American', language: 'en', provider: 'elevenlabs' },
    { id: 'VR6AewLdkVjGTxWYRBNl', name: 'Arnold', gender: 'male', accent: 'American', language: 'en', provider: 'elevenlabs' },
    { id: 'pNInz6obpgDQGcFmaJgB', name: 'Adam', gender: 'male', accent: 'American', language: 'en', provider: 'elevenlabs' },
    { id: 'yoZ06aMxZJJ28mfd3POQ', name: 'Sam', gender: 'male', accent: 'American', language: 'en', provider: 'elevenlabs' },
    { id: 'jBpfuIE2acCO8z3wKNLl', name: 'Emily', gender: 'female', accent: 'British', language: 'en', provider: 'elevenlabs' },
    { id: 'XB0fDUnXU5powFPn9Qz1', name: 'Charlotte', gender: 'female', accent: 'British', language: 'en', provider: 'elevenlabs' },
];

// Google Cloud TTS voices
const GOOGLE_VOICES: Voice[] = [
    { id: 'en-US-Neural2-A', name: 'US Female A', gender: 'female', accent: 'American', language: 'en-US', provider: 'google-tts' },
    { id: 'en-US-Neural2-C', name: 'US Female C', gender: 'female', accent: 'American', language: 'en-US', provider: 'google-tts' },
    { id: 'en-US-Neural2-D', name: 'US Male D', gender: 'male', accent: 'American', language: 'en-US', provider: 'google-tts' },
    { id: 'en-US-Neural2-J', name: 'US Male J', gender: 'male', accent: 'American', language: 'en-US', provider: 'google-tts' },
    { id: 'en-GB-Neural2-A', name: 'UK Female A', gender: 'female', accent: 'British', language: 'en-GB', provider: 'google-tts' },
    { id: 'en-GB-Neural2-B', name: 'UK Male B', gender: 'male', accent: 'British', language: 'en-GB', provider: 'google-tts' },
    { id: 'en-AU-Neural2-A', name: 'AU Female A', gender: 'female', accent: 'Australian', language: 'en-AU', provider: 'google-tts' },
    { id: 'en-AU-Neural2-B', name: 'AU Male B', gender: 'male', accent: 'Australian', language: 'en-AU', provider: 'google-tts' },
];

// AWS Polly voices
const POLLY_VOICES: Voice[] = [
    { id: 'Joanna', name: 'Joanna', gender: 'female', accent: 'American', language: 'en-US', provider: 'aws-polly' },
    { id: 'Matthew', name: 'Matthew', gender: 'male', accent: 'American', language: 'en-US', provider: 'aws-polly' },
    { id: 'Salli', name: 'Salli', gender: 'female', accent: 'American', language: 'en-US', provider: 'aws-polly' },
    { id: 'Joey', name: 'Joey', gender: 'male', accent: 'American', language: 'en-US', provider: 'aws-polly' },
    { id: 'Amy', name: 'Amy', gender: 'female', accent: 'British', language: 'en-GB', provider: 'aws-polly' },
    { id: 'Brian', name: 'Brian', gender: 'male', accent: 'British', language: 'en-GB', provider: 'aws-polly' },
    { id: 'Olivia', name: 'Olivia', gender: 'female', accent: 'Australian', language: 'en-AU', provider: 'aws-polly' },
];

/**
 * Voice Over Generation Service
 */
export class VoiceOverService {
    private config: VoiceConfig;

    constructor(config: VoiceConfig) {
        this.config = config;
    }

    /**
     * Generate voice over from text
     */
    async generateVoiceOver(params: VoiceOverParams): Promise<VoiceOverResult> {
        switch (this.config.provider) {
            case 'elevenlabs':
                return this.generateWithElevenLabs(params);
            case 'google-tts':
                return this.generateWithGoogleTTS(params);
            case 'aws-polly':
                return this.generateWithPolly(params);
            case 'mock':
            default:
                return this.generateMock(params);
        }
    }

    /**
     * Generate with ElevenLabs
     */
    private async generateWithElevenLabs(params: VoiceOverParams): Promise<VoiceOverResult> {
        if (!this.config.apiKey) {
            throw new Error('ElevenLabs API key not configured');
        }

        const voiceId = params.voiceId || ELEVENLABS_VOICES[0].id;

        try {
            const response = await fetch(
                `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'xi-api-key': this.config.apiKey,
                    },
                    body: JSON.stringify({
                        text: params.text,
                        model_id: 'eleven_turbo_v2_5', // Updated from deprecated eleven_monolingual_v1
                        voice_settings: {
                            stability: 0.5,
                            similarity_boost: 0.75,
                        },
                    }),
                }
            );

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.detail?.message || 'ElevenLabs TTS failed');
            }

            const audioBlob = await response.blob();
            const audioUrl = URL.createObjectURL(audioBlob);
            const wordCount = params.text.split(/\s+/).length;
            const duration = Math.ceil(wordCount / 2.5); // ~150 words per minute

            return {
                audioUrl,
                duration,
                format: 'mp3',
                wordCount,
            };
        } catch (error: any) {
            throw new Error(`ElevenLabs error: ${error.message}`);
        }
    }

    /**
     * Generate with Google Cloud TTS
     */
    private async generateWithGoogleTTS(params: VoiceOverParams): Promise<VoiceOverResult> {
        if (!this.config.apiKey) {
            throw new Error('Google Cloud TTS API key not configured');
        }

        const voiceId = params.voiceId || GOOGLE_VOICES[0].id;
        const voice = GOOGLE_VOICES.find(v => v.id === voiceId) || GOOGLE_VOICES[0];

        try {
            const response = await fetch(
                `https://texttospeech.googleapis.com/v1/text:synthesize?key=${this.config.apiKey}`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        input: { text: params.text },
                        voice: {
                            languageCode: voice.language,
                            name: voiceId,
                        },
                        audioConfig: {
                            audioEncoding: 'MP3',
                            speakingRate: params.speed || 1.0,
                            pitch: params.pitch || 0,
                            volumeGainDb: params.volume ? (params.volume - 50) / 5 : 0,
                        },
                    }),
                }
            );

            if (!response.ok) {
                throw new Error('Google TTS request failed');
            }

            const data = await response.json();

            // Convert base64 to blob
            const audioData = atob(data.audioContent);
            const audioArray = new Uint8Array(audioData.length);
            for (let i = 0; i < audioData.length; i++) {
                audioArray[i] = audioData.charCodeAt(i);
            }
            const audioBlob = new Blob([audioArray], { type: 'audio/mp3' });
            const audioUrl = URL.createObjectURL(audioBlob);

            const wordCount = params.text.split(/\s+/).length;
            const duration = Math.ceil(wordCount / 2.5);

            return {
                audioUrl,
                duration,
                format: 'mp3',
                wordCount,
            };
        } catch (error: any) {
            throw new Error(`Google TTS error: ${error.message}`);
        }
    }

    /**
     * Generate with AWS Polly
     */
    private async generateWithPolly(params: VoiceOverParams): Promise<VoiceOverResult> {
        // Note: AWS Polly requires AWS SDK setup
        // This is a simplified implementation - in production use @aws-sdk/client-polly

        if (!this.config.apiKey) {
            throw new Error('AWS credentials not configured');
        }

        const voiceId = params.voiceId || 'Joanna';

        try {
            // In production, use AWS SDK:
            // const polly = new PollyClient({ region: this.config.region || 'us-east-1' });
            // const command = new SynthesizeSpeechCommand({ ... });

            // For now, simulate the response
            console.warn('AWS Polly requires full SDK setup. Using mock response.');
            return this.generateMock(params);
        } catch (error: any) {
            throw new Error(`AWS Polly error: ${error.message}`);
        }
    }

    /**
     * Generate mock voice over for testing
     */
    private async generateMock(params: VoiceOverParams): Promise<VoiceOverResult> {
        await new Promise(resolve => setTimeout(resolve, 1000));

        const wordCount = params.text.split(/\s+/).length;
        const duration = Math.ceil(wordCount / 2.5);

        return {
            audioUrl: `https://example.com/mock-voiceover-${Date.now()}.mp3`,
            duration,
            format: 'mp3',
            wordCount,
        };
    }

    /**
     * Get available voices for current provider
     */
    getAvailableVoices(): Voice[] {
        switch (this.config.provider) {
            case 'elevenlabs':
                return ELEVENLABS_VOICES;
            case 'google-tts':
                return GOOGLE_VOICES;
            case 'aws-polly':
                return POLLY_VOICES;
            default:
                return ELEVENLABS_VOICES; // Default fallback
        }
    }

    /**
     * Get voice by ID
     */
    getVoiceById(id: string): Voice | undefined {
        const allVoices = [...ELEVENLABS_VOICES, ...GOOGLE_VOICES, ...POLLY_VOICES];
        return allVoices.find(v => v.id === id);
    }

    /**
     * Estimate duration from text
     */
    static estimateDuration(text: string, speed: number = 1.0): number {
        const wordCount = text.split(/\s+/).length;
        const wordsPerMinute = 150 * speed;
        return Math.ceil((wordCount / wordsPerMinute) * 60);
    }

    /**
     * Split text into chunks for long content
     */
    static splitTextForTTS(text: string, maxChars: number = 5000): string[] {
        if (text.length <= maxChars) {
            return [text];
        }

        const chunks: string[] = [];
        const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
        let currentChunk = '';

        for (const sentence of sentences) {
            if ((currentChunk + sentence).length <= maxChars) {
                currentChunk += sentence;
            } else {
                if (currentChunk) {
                    chunks.push(currentChunk.trim());
                }
                currentChunk = sentence;
            }
        }

        if (currentChunk) {
            chunks.push(currentChunk.trim());
        }

        return chunks;
    }
}

/**
 * Create voice over service instance
 */
export function createVoiceOverService(config: VoiceConfig): VoiceOverService {
    return new VoiceOverService(config);
}

// Export voice libraries
export { ELEVENLABS_VOICES, GOOGLE_VOICES, POLLY_VOICES };

// Combined voices for UI selection
export const ALL_VOICES = [...ELEVENLABS_VOICES, ...GOOGLE_VOICES, ...POLLY_VOICES];
