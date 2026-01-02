// API Route to test various AI service connections
import { NextRequest, NextResponse } from 'next/server';

type ServiceType = 'openai' | 'anthropic' | 'did' | 'synthesia' | 'pictory' | 'elevenlabs' | 'stabilityai';

interface TestResult {
    success: boolean;
    message: string;
    details?: Record<string, unknown>;
}

// Test OpenAI API connection
async function testOpenAI(apiKey: string): Promise<TestResult> {
    try {
        const response = await fetch('https://api.openai.com/v1/models', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
            },
        });

        if (response.ok) {
            const data = await response.json();
            return {
                success: true,
                message: 'OpenAI API connection successful!',
                details: { modelsAvailable: data.data?.length || 0 },
            };
        } else {
            const error = await response.json().catch(() => ({}));
            return {
                success: false,
                message: error.error?.message || `OpenAI API error: ${response.status}`,
            };
        }
    } catch (error) {
        return {
            success: false,
            message: `Failed to connect to OpenAI: ${error instanceof Error ? error.message : 'Unknown error'}`,
        };
    }
}

// Test Anthropic API connection
async function testAnthropic(apiKey: string): Promise<TestResult> {
    try {
        // Anthropic doesn't have a dedicated "test" endpoint, so we make a minimal message request
        const response = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'x-api-key': apiKey,
                'Content-Type': 'application/json',
                'anthropic-version': '2023-06-01',
            },
            body: JSON.stringify({
                model: 'claude-3-haiku-20240307',
                max_tokens: 1,
                messages: [{ role: 'user', content: 'test' }],
            }),
        });

        if (response.ok) {
            return {
                success: true,
                message: 'Anthropic API connection successful!',
            };
        } else {
            const error = await response.json().catch(() => ({}));
            // Check for authentication error specifically
            if (response.status === 401) {
                return {
                    success: false,
                    message: 'Invalid Anthropic API key',
                };
            }
            return {
                success: false,
                message: error.error?.message || `Anthropic API error: ${response.status}`,
            };
        }
    } catch (error) {
        return {
            success: false,
            message: `Failed to connect to Anthropic: ${error instanceof Error ? error.message : 'Unknown error'}`,
        };
    }
}

// Test D-ID API connection
async function testDID(apiKey: string): Promise<TestResult> {
    try {
        // D-ID uses Basic auth with the API key
        const response = await fetch('https://api.d-id.com/credits', {
            method: 'GET',
            headers: {
                'Authorization': `Basic ${Buffer.from(apiKey + ':').toString('base64')}`,
                'Content-Type': 'application/json',
            },
        });

        if (response.ok) {
            const data = await response.json();
            return {
                success: true,
                message: 'D-ID API connection successful!',
                details: { remainingCredits: data.remaining || 'N/A' },
            };
        } else {
            const error = await response.json().catch(() => ({}));
            return {
                success: false,
                message: error.message || `D-ID API error: ${response.status}`,
            };
        }
    } catch (error) {
        return {
            success: false,
            message: `Failed to connect to D-ID: ${error instanceof Error ? error.message : 'Unknown error'}`,
        };
    }
}

// Test Synthesia API connection
async function testSynthesia(apiKey: string): Promise<TestResult> {
    try {
        const response = await fetch('https://api.synthesia.io/v2/videos', {
            method: 'GET',
            headers: {
                'Authorization': apiKey,
                'Content-Type': 'application/json',
            },
        });

        if (response.ok) {
            return {
                success: true,
                message: 'Synthesia API connection successful!',
            };
        } else {
            const error = await response.json().catch(() => ({}));
            if (response.status === 401 || response.status === 403) {
                return {
                    success: false,
                    message: 'Invalid Synthesia API key',
                };
            }
            return {
                success: false,
                message: error.message || `Synthesia API error: ${response.status}`,
            };
        }
    } catch (error) {
        return {
            success: false,
            message: `Failed to connect to Synthesia: ${error instanceof Error ? error.message : 'Unknown error'}`,
        };
    }
}

// Test Pictory API connection
async function testPictory(apiKey: string): Promise<TestResult> {
    try {
        // Pictory uses a different auth mechanism - they use user ID + API key
        // For testing, we'll try to get projects list
        const response = await fetch('https://api.pictory.ai/pictoryapis/v1/projects', {
            method: 'GET',
            headers: {
                'X-Pictory-User-Id': apiKey.split(':')[0] || apiKey,
                'Authorization': apiKey.includes(':') ? apiKey.split(':')[1] : apiKey,
                'Content-Type': 'application/json',
            },
        });

        if (response.ok) {
            return {
                success: true,
                message: 'Pictory API connection successful!',
            };
        } else {
            const error = await response.json().catch(() => ({}));
            if (response.status === 401 || response.status === 403) {
                return {
                    success: false,
                    message: 'Invalid Pictory API credentials. Format should be "userId:apiKey"',
                };
            }
            return {
                success: false,
                message: error.message || `Pictory API error: ${response.status}`,
            };
        }
    } catch (error) {
        return {
            success: false,
            message: `Failed to connect to Pictory: ${error instanceof Error ? error.message : 'Unknown error'}`,
        };
    }
}

// Test ElevenLabs API connection
async function testElevenLabs(apiKey: string): Promise<TestResult> {
    try {
        // Use /v1/voices endpoint as it's more universally accessible than /v1/user
        // The /v1/user endpoint requires specific permissions that not all API keys have
        const response = await fetch('https://api.elevenlabs.io/v1/voices', {
            method: 'GET',
            headers: {
                'xi-api-key': apiKey,
                'Content-Type': 'application/json',
            },
        });

        if (response.ok) {
            const data = await response.json();
            const voiceCount = data.voices?.length || 0;
            return {
                success: true,
                message: 'ElevenLabs API connection successful!',
                details: {
                    voicesAvailable: voiceCount,
                },
            };
        } else {
            const error = await response.json().catch(() => ({}));
            if (response.status === 401) {
                return {
                    success: false,
                    message: 'Invalid ElevenLabs API key',
                };
            }
            // Handle permission errors separately
            if (error.detail?.status === 'missing_permissions') {
                return {
                    success: false,
                    message: 'ElevenLabs API key lacks required permissions',
                };
            }
            return {
                success: false,
                message: error.detail?.message || error.detail?.status || error.message || `ElevenLabs API error: ${response.status}`,
            };
        }
    } catch (error) {
        return {
            success: false,
            message: `Failed to connect to ElevenLabs: ${error instanceof Error ? error.message : 'Unknown error'}`,
        };
    }
}

// Test Stability AI API connection
async function testStabilityAI(apiKey: string): Promise<TestResult> {
    try {
        const response = await fetch('https://api.stability.ai/v1/user/account', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
            },
        });

        if (response.ok) {
            const data = await response.json();
            return {
                success: true,
                message: 'Stability AI API connection successful!',
                details: {
                    credits: data.credits || 0,
                    email: data.email || 'N/A',
                },
            };
        } else {
            const error = await response.json().catch(() => ({}));
            if (response.status === 401) {
                return {
                    success: false,
                    message: 'Invalid Stability AI API key',
                };
            }
            return {
                success: false,
                message: error.message || `Stability AI API error: ${response.status}`,
            };
        }
    } catch (error) {
        return {
            success: false,
            message: `Failed to connect to Stability AI: ${error instanceof Error ? error.message : 'Unknown error'}`,
        };
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { service, apiKey } = body as { service: ServiceType; apiKey: string };

        if (!service || !apiKey) {
            return NextResponse.json(
                { success: false, message: 'Missing service or apiKey' },
                { status: 400 }
            );
        }

        // Validate API key is not empty
        if (!apiKey.trim()) {
            return NextResponse.json(
                { success: false, message: 'API key cannot be empty' },
                { status: 400 }
            );
        }

        let result: TestResult;

        switch (service) {
            case 'openai':
                result = await testOpenAI(apiKey);
                break;
            case 'anthropic':
                result = await testAnthropic(apiKey);
                break;
            case 'did':
                result = await testDID(apiKey);
                break;
            case 'synthesia':
                result = await testSynthesia(apiKey);
                break;
            case 'pictory':
                result = await testPictory(apiKey);
                break;
            case 'elevenlabs':
                result = await testElevenLabs(apiKey);
                break;
            case 'stabilityai':
                result = await testStabilityAI(apiKey);
                break;
            default:
                result = { success: false, message: `Unknown service: ${service}` };
        }

        return NextResponse.json(result);
    } catch (error) {
        console.error('API test error:', error);
        return NextResponse.json(
            { success: false, message: 'Internal server error' },
            { status: 500 }
        );
    }
}
