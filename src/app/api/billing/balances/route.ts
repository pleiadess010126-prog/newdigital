import { NextRequest, NextResponse } from 'next/server';

// API Balance interface
interface ApiBalance {
    service: string;
    status: 'active' | 'inactive' | 'low' | 'error';
    balance?: number;
    used?: number;
    limit?: number;
    unit: string;
    percentage: number;
    message?: string;
}

// Fetch OpenAI balance
async function getOpenAIBalance(apiKey: string): Promise<ApiBalance> {
    try {
        // OpenAI doesn't have a direct balance API, but we can check usage
        // For billing, we need to use the billing API
        const response = await fetch('https://api.openai.com/v1/dashboard/billing/credit_grants', {
            headers: {
                'Authorization': `Bearer ${apiKey}`,
            },
        });

        if (!response.ok) {
            // Try subscription endpoint
            const subResponse = await fetch('https://api.openai.com/v1/dashboard/billing/subscription', {
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                },
            });

            if (subResponse.ok) {
                const subData = await subResponse.json();
                return {
                    service: 'OpenAI',
                    status: 'active',
                    balance: subData.hard_limit_usd || 0,
                    unit: 'USD',
                    percentage: 50, // Estimate
                    message: 'Connected',
                };
            }

            throw new Error('Could not fetch billing info');
        }

        const data = await response.json();
        const totalGranted = data.total_granted || 0;
        const totalUsed = data.total_used || 0;
        const balance = totalGranted - totalUsed;
        const percentage = totalGranted > 0 ? ((balance / totalGranted) * 100) : 0;

        return {
            service: 'OpenAI',
            status: percentage < 20 ? 'low' : 'active',
            balance: balance,
            used: totalUsed,
            limit: totalGranted,
            unit: 'USD',
            percentage: Math.round(percentage),
            message: `$${balance.toFixed(2)} remaining`,
        };
    } catch (error) {
        return {
            service: 'OpenAI',
            status: 'error',
            unit: 'USD',
            percentage: 0,
            message: 'Could not fetch balance - API key may be invalid or billing API not accessible',
        };
    }
}

// Fetch Anthropic balance (Anthropic doesn't expose balance API publicly)
async function getAnthropicBalance(apiKey: string): Promise<ApiBalance> {
    try {
        // Test connection by making a minimal request
        const response = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'x-api-key': apiKey,
                'anthropic-version': '2023-06-01',
                'content-type': 'application/json',
            },
            body: JSON.stringify({
                model: 'claude-3-haiku-20240307',
                max_tokens: 1,
                messages: [{ role: 'user', content: 'Hi' }],
            }),
        });

        if (response.ok || response.status === 400) {
            // API key is valid
            return {
                service: 'Anthropic',
                status: 'active',
                unit: 'USD',
                percentage: 50, // Anthropic doesn't expose balance
                message: 'Connected - Balance not exposed via API',
            };
        }

        throw new Error('Invalid API key');
    } catch (error) {
        return {
            service: 'Anthropic',
            status: 'error',
            unit: 'USD',
            percentage: 0,
            message: 'Could not verify connection',
        };
    }
}

// Fetch ElevenLabs balance
async function getElevenLabsBalance(apiKey: string): Promise<ApiBalance> {
    try {
        console.log('ElevenLabs: Calling API with key length:', apiKey.length);

        // First, try /v1/user endpoint which includes subscription info
        let response = await fetch('https://api.elevenlabs.io/v1/user', {
            method: 'GET',
            headers: {
                'xi-api-key': apiKey,
                'Accept': 'application/json',
            },
        });

        console.log('ElevenLabs /v1/user response status:', response.status);

        // If /v1/user works, extract subscription data
        if (response.ok) {
            const data = await response.json();
            console.log('ElevenLabs user data:', JSON.stringify(data, null, 2));

            const subscription = data.subscription;
            if (subscription) {
                const used = subscription.character_count ?? 0;
                const limit = subscription.character_limit ?? 10000;
                const remaining = Math.max(0, limit - used);
                const percentage = limit > 0 ? ((remaining / limit) * 100) : 0;

                return {
                    service: 'ElevenLabs',
                    status: percentage < 20 ? 'low' : 'active',
                    balance: remaining,
                    used: used,
                    limit: limit,
                    unit: 'characters',
                    percentage: Math.round(percentage),
                    message: `${remaining.toLocaleString()} / ${limit.toLocaleString()} characters`,
                };
            }
        }

        // If /v1/user fails or doesn't have subscription, try /v1/voices as fallback
        // This endpoint works with most API keys
        response = await fetch('https://api.elevenlabs.io/v1/voices', {
            method: 'GET',
            headers: {
                'xi-api-key': apiKey,
                'Accept': 'application/json',
            },
        });

        console.log('ElevenLabs /v1/voices response status:', response.status);

        if (response.ok) {
            const data = await response.json();
            const voiceCount = data.voices?.length || 0;

            // Key is valid but we couldn't get subscription info
            return {
                service: 'ElevenLabs',
                status: 'active',
                unit: 'characters',
                percentage: 50, // Unknown, so show middle
                message: `Connected (${voiceCount} voices available)`,
            };
        }

        // If even /v1/voices fails
        if (response.status === 401) {
            return {
                service: 'ElevenLabs',
                status: 'error',
                unit: 'characters',
                percentage: 0,
                message: 'Invalid API key',
            };
        }

        throw new Error(`API error: ${response.status}`);
    } catch (error) {
        console.error('ElevenLabs balance error:', error);
        return {
            service: 'ElevenLabs',
            status: 'error',
            unit: 'characters',
            percentage: 0,
            message: error instanceof Error ? error.message : 'Could not fetch balance',
        };
    }
}

// Fetch D-ID balance
async function getDIDBalance(apiKey: string): Promise<ApiBalance> {
    try {
        const response = await fetch('https://api.d-id.com/credits', {
            headers: {
                'Authorization': `Basic ${apiKey}`,
            },
        });

        if (!response.ok) {
            throw new Error('Failed to fetch credits');
        }

        const data = await response.json();
        const remaining = data.remaining || 0;
        const total = data.total || 100;
        const percentage = ((remaining / total) * 100);

        return {
            service: 'D-ID',
            status: percentage < 25 ? 'low' : 'active',
            balance: remaining,
            used: total - remaining,
            limit: total,
            unit: 'credits',
            percentage: Math.round(percentage),
            message: `${remaining} / ${total} credits`,
        };
    } catch (error) {
        return {
            service: 'D-ID',
            status: 'error',
            unit: 'credits',
            percentage: 0,
            message: 'Could not fetch balance',
        };
    }
}

// Fetch Stability AI balance
async function getStabilityBalance(apiKey: string): Promise<ApiBalance> {
    try {
        const response = await fetch('https://api.stability.ai/v1/user/balance', {
            headers: {
                'Authorization': `Bearer ${apiKey}`,
            },
        });

        if (!response.ok) {
            throw new Error('Failed to fetch balance');
        }

        const data = await response.json();
        const credits = data.credits || 0;
        const percentage = Math.min((credits / 10000) * 100, 100); // Assume 10000 as max

        return {
            service: 'Stability AI',
            status: credits < 1000 ? 'low' : 'active',
            balance: credits,
            unit: 'credits',
            percentage: Math.round(percentage),
            message: `${credits.toLocaleString()} credits`,
        };
    } catch (error) {
        return {
            service: 'Stability AI',
            status: 'error',
            unit: 'credits',
            percentage: 0,
            message: 'Could not fetch balance',
        };
    }
}

// Fetch Razorpay balance
async function getRazorpayBalance(keyId: string, keySecret: string): Promise<ApiBalance> {
    try {
        const authHeader = 'Basic ' + Buffer.from(`${keyId}:${keySecret}`).toString('base64');

        const response = await fetch('https://api.razorpay.com/v1/balance', {
            headers: {
                'Authorization': authHeader,
            },
        });

        if (!response.ok) {
            throw new Error('Failed to fetch balance');
        }

        const data = await response.json();
        const balance = (data.balance || 0) / 100; // Convert paise to rupees

        return {
            service: 'Razorpay',
            status: 'active',
            balance: balance,
            unit: 'INR',
            percentage: 100,
            message: `₹${balance.toLocaleString('en-IN')} available`,
        };
    } catch (error) {
        return {
            service: 'Razorpay',
            status: 'error',
            unit: 'INR',
            percentage: 0,
            message: 'Could not fetch balance',
        };
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        // Get keys from request body, with fallback to server environment variables
        const openaiKey = body.openaiKey || process.env.OPENAI_API_KEY || '';
        const anthropicKey = body.anthropicKey || process.env.ANTHROPIC_API_KEY || '';
        const elevenlabsKey = body.elevenlabsKey || process.env.ELEVENLABS_API_KEY || '';
        const didKey = body.didKey || process.env.DID_API_KEY || '';
        const stabilityKey = body.stabilityKey || process.env.STABILITY_API_KEY || '';
        const razorpayKeyId = body.razorpayKeyId || process.env.RAZORPAY_KEY_ID || '';
        const razorpayKeySecret = body.razorpayKeySecret || process.env.RAZORPAY_KEY_SECRET || '';

        console.log('Billing API: Received keys - OpenAI:', !!openaiKey, 'ElevenLabs:', !!elevenlabsKey, 'key length:', elevenlabsKey?.length);

        const balances: ApiBalance[] = [];

        // Fetch all balances in parallel
        const promises: Promise<ApiBalance>[] = [];

        // Helper function to check if a key is valid (non-empty string)
        const isValidKey = (key: unknown): key is string => {
            return typeof key === 'string' && key.trim().length > 0;
        };

        if (isValidKey(openaiKey)) {
            promises.push(getOpenAIBalance(openaiKey));
        } else {
            balances.push({
                service: 'OpenAI',
                status: 'inactive',
                unit: 'USD',
                percentage: 0,
                message: 'Not configured',
            });
        }

        if (isValidKey(anthropicKey)) {
            promises.push(getAnthropicBalance(anthropicKey));
        } else {
            balances.push({
                service: 'Anthropic',
                status: 'inactive',
                unit: 'USD',
                percentage: 0,
                message: 'Not configured',
            });
        }

        if (isValidKey(elevenlabsKey)) {
            promises.push(getElevenLabsBalance(elevenlabsKey));
        } else {
            balances.push({
                service: 'ElevenLabs',
                status: 'inactive',
                unit: 'characters',
                percentage: 0,
                message: 'Not configured',
            });
        }

        if (isValidKey(didKey)) {
            promises.push(getDIDBalance(didKey));
        } else {
            balances.push({
                service: 'D-ID',
                status: 'inactive',
                unit: 'credits',
                percentage: 0,
                message: 'Not configured',
            });
        }

        if (isValidKey(stabilityKey)) {
            promises.push(getStabilityBalance(stabilityKey));
        } else {
            balances.push({
                service: 'Stability AI',
                status: 'inactive',
                unit: 'credits',
                percentage: 0,
                message: 'Not configured',
            });
        }

        if (isValidKey(razorpayKeyId) && isValidKey(razorpayKeySecret)) {
            promises.push(getRazorpayBalance(razorpayKeyId, razorpayKeySecret));
        } else {
            balances.push({
                service: 'Razorpay',
                status: 'inactive',
                unit: 'INR',
                percentage: 0,
                message: 'Not configured',
            });
        }

        // Wait for all API calls
        const results = await Promise.all(promises);
        balances.push(...results);

        return NextResponse.json({
            success: true,
            balances,
            fetchedAt: new Date().toISOString(),
        });
    } catch (error) {
        console.error('Error fetching API balances:', error);
        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to fetch balances'
            },
            { status: 500 }
        );
    }
}
