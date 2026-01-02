// API Route to test ElevenLabs integration
import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
    const apiKey = process.env.ELEVENLABS_API_KEY;

    if (!apiKey) {
        return NextResponse.json(
            { success: false, error: 'ELEVENLABS_API_KEY not configured' },
            { status: 500 }
        );
    }

    try {
        // Test voices endpoint - works with all API key types
        const voicesResponse = await fetch('https://api.elevenlabs.io/v1/voices', {
            headers: {
                'xi-api-key': apiKey,
            },
        });

        if (!voicesResponse.ok) {
            const errorData = await voicesResponse.json();
            return NextResponse.json(
                {
                    success: false,
                    error: 'Invalid API key or API error',
                    details: errorData
                },
                { status: voicesResponse.status }
            );
        }

        const voicesData = await voicesResponse.json();

        return NextResponse.json({
            success: true,
            message: '✅ ElevenLabs API key is valid and working!',
            apiKeyPrefix: apiKey.substring(0, 10) + '...',
            voices: voicesData.voices?.slice(0, 5).map((v: any) => ({
                id: v.voice_id,
                name: v.name,
                category: v.category,
            })) || [],
            totalVoices: voicesData.voices?.length || 0,
            recommendedModel: 'eleven_turbo_v2_5',
        });
    } catch (error: any) {
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    const apiKey = process.env.ELEVENLABS_API_KEY;

    if (!apiKey) {
        return NextResponse.json(
            { success: false, error: 'ELEVENLABS_API_KEY not configured' },
            { status: 500 }
        );
    }

    try {
        const body = await request.json();
        const text = body.text || 'Hello! This is a test of the ElevenLabs voice generation.';
        const voiceId = body.voiceId || 'EXAVITQu4vr4xnSDxMaL'; // Bella default

        // Generate speech
        const response = await fetch(
            `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'xi-api-key': apiKey,
                },
                body: JSON.stringify({
                    text: text,
                    model_id: 'eleven_turbo_v2_5', // Updated from deprecated model
                    voice_settings: {
                        stability: 0.5,
                        similarity_boost: 0.75,
                    },
                }),
            }
        );

        if (!response.ok) {
            const errorData = await response.json();
            return NextResponse.json(
                {
                    success: false,
                    error: 'TTS generation failed',
                    details: errorData
                },
                { status: response.status }
            );
        }

        // Return audio as base64
        const audioBuffer = await response.arrayBuffer();
        const base64Audio = Buffer.from(audioBuffer).toString('base64');

        return NextResponse.json({
            success: true,
            message: '✅ Audio generated successfully!',
            audio: `data:audio/mpeg;base64,${base64Audio}`,
            textLength: text.length,
            voiceId: voiceId,
        });
    } catch (error: any) {
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}
