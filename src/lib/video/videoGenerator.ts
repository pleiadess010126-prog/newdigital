// AI Video Generation Service
// Integrates with D-ID, Synthesia, ElevenLabs for video creation
// Now includes Music and Voice Over service integration

import { createMusicService, type MusicTrack } from '@/lib/audio/musicService';
import { createVoiceOverService, type VoiceOverResult } from '@/lib/audio/voiceOverService';

export interface VideoConfig {
    provider: 'did' | 'synthesia' | 'pictory' | 'mock';
    apiKey: string;
    voiceProvider?: 'elevenlabs' | 'aws-polly' | 'google-tts';
    voiceApiKey?: string;
    musicEnabled?: boolean;
}

export interface VideoGenerationParams {
    script: string;
    title: string;
    presenter?: string;         // Avatar ID
    voice?: string;             // Voice ID
    backgroundUrl?: string;     // Background image/video
    format?: 'vertical' | 'horizontal' | 'square'; // 9:16, 16:9, 1:1
    duration?: 'short' | 'medium' | 'long';  // < 60s, 1-3min, 3-10min
    style?: 'professional' | 'casual' | 'energetic';
    music?: {
        trackId?: string;        // Specific track ID
        mood?: 'upbeat' | 'calm' | 'energetic' | 'dramatic' | 'inspirational' | 'corporate';
        volume?: number;         // 0-100
    };
    captions?: boolean;
    outputFormat?: 'mp4' | 'webm';
}

export interface GeneratedVideo {
    videoUrl: string;
    thumbnailUrl?: string;
    duration: number;           // In seconds
    status: 'processing' | 'completed' | 'failed';
    metadata: {
        scriptWordCount: number;
        format: string;
        resolution: string;
        voiceUsed?: string;
        musicTrack?: string;
    };
}

export interface VideoResponse {
    success: boolean;
    jobId?: string;
    videoUrl?: string;
    thumbnailUrl?: string;
    duration?: number;
    error?: string;
}

/**
 * AI Video Generation Service
 */
export class VideoGenerationService {
    private config: VideoConfig;

    constructor(config: VideoConfig) {
        this.config = config;
    }

    /**
     * Generate video from script
     */
    async generateVideo(params: VideoGenerationParams): Promise<VideoResponse> {
        switch (this.config.provider) {
            case 'did':
                return this.generateWithDID(params);
            case 'synthesia':
                return this.generateWithSynthesia(params);
            case 'pictory':
                return this.generateWithPictory(params);
            case 'mock':
            default:
                return this.generateMockVideo(params);
        }
    }

    /**
     * Generate with D-ID (AI Avatar)
     */
    private async generateWithDID(params: VideoGenerationParams): Promise<VideoResponse> {
        try {
            // First, generate voiceover if needed
            let audioUrl: string | undefined;
            if (this.config.voiceProvider === 'elevenlabs' && this.config.voiceApiKey) {
                const audio = await this.generateVoiceover(params.script, params.voice);
                audioUrl = audio.audioUrl;
            }

            // D-ID Talk API
            const response = await fetch('https://api.d-id.com/talks', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Basic ${this.config.apiKey}`,
                },
                body: JSON.stringify({
                    source_url: params.presenter || 'https://d-id-public-bucket.s3.amazonaws.com/or-roman.jpg',
                    script: audioUrl ? {
                        type: 'audio',
                        audio_url: audioUrl,
                    } : {
                        type: 'text',
                        input: params.script,
                        provider: {
                            type: 'microsoft',
                            voice_id: params.voice || 'en-US-JennyNeural',
                        },
                    },
                    config: {
                        stitch: true,
                        result_format: params.outputFormat || 'mp4',
                    },
                }),
            });

            if (!response.ok) {
                const error = await response.json();
                return {
                    success: false,
                    error: error.message || 'D-ID generation failed',
                };
            }

            const data = await response.json();

            return {
                success: true,
                jobId: data.id,
            };
        } catch (error: any) {
            return {
                success: false,
                error: error.message || 'D-ID generation failed',
            };
        }
    }

    /**
     * Check D-ID job status
     */
    async checkDIDStatus(jobId: string): Promise<VideoResponse> {
        try {
            const response = await fetch(`https://api.d-id.com/talks/${jobId}`, {
                headers: {
                    'Authorization': `Basic ${this.config.apiKey}`,
                },
            });

            const data = await response.json();

            if (data.status === 'done') {
                return {
                    success: true,
                    jobId,
                    videoUrl: data.result_url,
                    duration: data.duration,
                };
            }

            if (data.status === 'error') {
                return {
                    success: false,
                    error: data.error?.message || 'Video generation failed',
                };
            }

            return {
                success: false,
                jobId,
                error: `Status: ${data.status}`,
            };
        } catch (error: any) {
            return {
                success: false,
                error: error.message || 'Failed to check status',
            };
        }
    }

    /**
     * Generate with Synthesia
     */
    private async generateWithSynthesia(params: VideoGenerationParams): Promise<VideoResponse> {
        try {
            const response = await fetch('https://api.synthesia.io/v2/videos', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': this.config.apiKey,
                },
                body: JSON.stringify({
                    test: false,
                    title: params.title,
                    input: [{
                        scriptText: params.script,
                        avatar: params.presenter || 'anna_costume1_cameraA',
                        background: params.backgroundUrl || 'green_screen',
                    }],
                    aspectRatio: params.format === 'vertical' ? '9:16' : '16:9',
                }),
            });

            if (!response.ok) {
                const error = await response.json();
                return {
                    success: false,
                    error: error.message || 'Synthesia generation failed',
                };
            }

            const data = await response.json();

            return {
                success: true,
                jobId: data.id,
            };
        } catch (error: any) {
            return {
                success: false,
                error: error.message || 'Synthesia generation failed',
            };
        }
    }

    /**
     * Generate with Pictory (stock footage + voiceover)
     */
    private async generateWithPictory(params: VideoGenerationParams): Promise<VideoResponse> {
        try {
            // Pictory uses a 2-step process: storyboard -> render
            const storyboardResponse = await fetch('https://api.pictory.ai/pictoryapis/v1/video/storyboard', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Pictory-User-Id': this.config.apiKey,
                },
                body: JSON.stringify({
                    videoName: params.title,
                    videoDescription: params.script,
                    language: 'en',
                    brandLogo: null,
                }),
            });

            if (!storyboardResponse.ok) {
                return {
                    success: false,
                    error: 'Pictory storyboard creation failed',
                };
            }

            const storyboardData = await storyboardResponse.json();

            return {
                success: true,
                jobId: storyboardData.jobId,
            };
        } catch (error: any) {
            return {
                success: false,
                error: error.message || 'Pictory generation failed',
            };
        }
    }

    /**
     * Generate mock video (for testing)
     */
    private async generateMockVideo(params: VideoGenerationParams): Promise<VideoResponse> {
        // Simulate processing time
        await new Promise(resolve => setTimeout(resolve, 2000));

        const wordCount = params.script.split(' ').length;
        const estimatedDuration = Math.ceil(wordCount / 2.5); // ~150 words per minute

        return {
            success: true,
            jobId: `mock-${Date.now()}`,
            videoUrl: `https://example.com/videos/mock-${Date.now()}.mp4`,
            thumbnailUrl: `https://example.com/thumbnails/mock-${Date.now()}.jpg`,
            duration: estimatedDuration,
        };
    }

    /**
     * Generate voiceover with ElevenLabs
     */
    async generateVoiceover(text: string, voiceId?: string): Promise<{ audioUrl: string; duration: number }> {
        if (this.config.voiceProvider !== 'elevenlabs' || !this.config.voiceApiKey) {
            throw new Error('ElevenLabs not configured');
        }

        try {
            const response = await fetch(
                `https://api.elevenlabs.io/v1/text-to-speech/${voiceId || 'EXAVITQu4vr4xnSDxMaL'}`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'xi-api-key': this.config.voiceApiKey,
                    },
                    body: JSON.stringify({
                        text,
                        model_id: 'eleven_turbo_v2_5', // Updated from deprecated eleven_monolingual_v1
                        voice_settings: {
                            stability: 0.5,
                            similarity_boost: 0.75,
                        },
                    }),
                }
            );

            if (!response.ok) {
                throw new Error('ElevenLabs TTS failed');
            }

            // The response is the audio file
            const audioBlob = await response.blob();
            const audioUrl = URL.createObjectURL(audioBlob);
            const duration = Math.ceil(text.split(' ').length / 2.5);

            return { audioUrl, duration };
        } catch (error: any) {
            throw new Error(error.message || 'Voiceover generation failed');
        }
    }

    /**
     * Generate thumbnail
     */
    async generateThumbnail(title: string, style?: string): Promise<string> {
        // In production, use DALL-E or similar
        // For now, return placeholder
        const encodedTitle = encodeURIComponent(title.substring(0, 30));
        return `https://via.placeholder.com/1280x720.png?text=${encodedTitle}`;
    }

    /**
     * Convert blog content to video script
     */
    static contentToScript(content: string, maxWords: number = 150): string {
        // Strip HTML
        let text = content.replace(/<[^>]*>/g, '');

        // Remove markdown
        text = text.replace(/[#*_\[\]]/g, '');

        // Split into sentences
        const sentences = text.match(/[^.!?]+[.!?]+/g) || [];

        // Build script within word limit
        let script = '';
        let wordCount = 0;

        for (const sentence of sentences) {
            const words = sentence.trim().split(' ').length;
            if (wordCount + words <= maxWords) {
                script += sentence.trim() + ' ';
                wordCount += words;
            } else {
                break;
            }
        }

        return script.trim();
    }

    /**
     * Get video format dimensions
     */
    static getVideoDimensions(format: VideoGenerationParams['format']): { width: number; height: number } {
        switch (format) {
            case 'vertical':
                return { width: 1080, height: 1920 }; // 9:16 for TikTok/Reels
            case 'square':
                return { width: 1080, height: 1080 }; // 1:1 for Instagram feed
            case 'horizontal':
            default:
                return { width: 1920, height: 1080 }; // 16:9 for YouTube
        }
    }
}

/**
 * Create video generation service instance
 */
export function createVideoService(config: VideoConfig): VideoGenerationService {
    return new VideoGenerationService(config);
}

// Export preset configurations
export const VIDEO_PRESETS = {
    youtubeshort: {
        format: 'vertical' as const,
        duration: 'short' as const,
        maxWords: 100,
    },
    instagramReel: {
        format: 'vertical' as const,
        duration: 'short' as const,
        maxWords: 120,
    },
    tiktok: {
        format: 'vertical' as const,
        duration: 'short' as const,
        maxWords: 80,
    },
    youtubeVideo: {
        format: 'horizontal' as const,
        duration: 'medium' as const,
        maxWords: 500,
    },
};
