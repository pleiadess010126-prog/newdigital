import { NextRequest, NextResponse } from 'next/server';

const GRAPH_API_VERSION = 'v24.0';
const GRAPH_API_BASE = `https://graph.facebook.com/${GRAPH_API_VERSION}`;

/**
 * Meta/Facebook OAuth and API utilities
 * 
 * Endpoints:
 * - POST: Test connection, exchange token, get pages
 */

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { action, ...params } = body;

        switch (action) {
            case 'test-connection':
                return await testConnection(params);
            case 'exchange-token':
                return await exchangeToken(params);
            case 'get-pages':
                return await getPages(params);
            case 'get-instagram-account':
                return await getInstagramAccount(params);
            case 'debug-token':
                return await debugToken(params);
            default:
                return NextResponse.json(
                    { error: 'Invalid action' },
                    { status: 400 }
                );
        }
    } catch (error: any) {
        console.error('Meta API Error:', error);
        return NextResponse.json(
            { error: error.message || 'Internal server error' },
            { status: 500 }
        );
    }
}

/**
 * Test connection with access token
 */
async function testConnection(params: { accessToken: string }) {
    const { accessToken } = params;

    if (!accessToken) {
        return NextResponse.json(
            { error: 'Access token is required' },
            { status: 400 }
        );
    }

    try {
        const response = await fetch(
            `${GRAPH_API_BASE}/me?fields=id,name,email&access_token=${accessToken}`
        );

        const data = await response.json();

        if (data.error) {
            return NextResponse.json({
                success: false,
                error: data.error.message,
                errorCode: data.error.code,
            });
        }

        return NextResponse.json({
            success: true,
            user: {
                id: data.id,
                name: data.name,
                email: data.email,
            },
        });
    } catch (error: any) {
        return NextResponse.json({
            success: false,
            error: error.message || 'Connection test failed',
        });
    }
}

/**
 * Exchange short-lived token for long-lived token
 */
async function exchangeToken(params: {
    accessToken: string;
    appId: string;
    appSecret: string;
}) {
    const { accessToken, appId, appSecret } = params;

    if (!accessToken || !appId || !appSecret) {
        return NextResponse.json(
            { error: 'Access token, App ID, and App Secret are required' },
            { status: 400 }
        );
    }

    try {
        const response = await fetch(
            `${GRAPH_API_BASE}/oauth/access_token?` +
            `grant_type=fb_exchange_token&` +
            `client_id=${appId}&` +
            `client_secret=${appSecret}&` +
            `fb_exchange_token=${accessToken}`
        );

        const data = await response.json();

        if (data.error) {
            return NextResponse.json({
                success: false,
                error: data.error.message,
            });
        }

        return NextResponse.json({
            success: true,
            accessToken: data.access_token,
            tokenType: 'long-lived',
            expiresIn: data.expires_in,
        });
    } catch (error: any) {
        return NextResponse.json({
            success: false,
            error: error.message || 'Token exchange failed',
        });
    }
}

/**
 * Get Facebook Pages the user manages
 */
async function getPages(params: { accessToken: string }) {
    const { accessToken } = params;

    if (!accessToken) {
        return NextResponse.json(
            { error: 'Access token is required' },
            { status: 400 }
        );
    }

    try {
        const response = await fetch(
            `${GRAPH_API_BASE}/me/accounts?fields=id,name,access_token,category,instagram_business_account{id,username,name,profile_picture_url,followers_count}&access_token=${accessToken}`
        );

        const data = await response.json();

        if (data.error) {
            return NextResponse.json({
                success: false,
                error: data.error.message,
            });
        }

        const pages = (data.data || []).map((page: any) => ({
            id: page.id,
            name: page.name,
            accessToken: page.access_token,
            category: page.category,
            instagramBusinessAccount: page.instagram_business_account
                ? {
                    id: page.instagram_business_account.id,
                    username: page.instagram_business_account.username,
                    name: page.instagram_business_account.name,
                    profilePictureUrl: page.instagram_business_account.profile_picture_url,
                    followersCount: page.instagram_business_account.followers_count,
                }
                : undefined,
        }));

        return NextResponse.json({
            success: true,
            pages,
        });
    } catch (error: any) {
        return NextResponse.json({
            success: false,
            error: error.message || 'Failed to fetch pages',
        });
    }
}

/**
 * Get Instagram Business Account info
 */
async function getInstagramAccount(params: {
    accessToken: string;
    instagramAccountId: string;
}) {
    const { accessToken, instagramAccountId } = params;

    if (!accessToken || !instagramAccountId) {
        return NextResponse.json(
            { error: 'Access token and Instagram Account ID are required' },
            { status: 400 }
        );
    }

    try {
        const response = await fetch(
            `${GRAPH_API_BASE}/${instagramAccountId}?fields=id,username,name,profile_picture_url,followers_count,media_count,biography&access_token=${accessToken}`
        );

        const data = await response.json();

        if (data.error) {
            return NextResponse.json({
                success: false,
                error: data.error.message,
            });
        }

        return NextResponse.json({
            success: true,
            account: {
                id: data.id,
                username: data.username,
                name: data.name,
                profilePictureUrl: data.profile_picture_url,
                followersCount: data.followers_count,
                mediaCount: data.media_count,
                biography: data.biography,
            },
        });
    } catch (error: any) {
        return NextResponse.json({
            success: false,
            error: error.message || 'Failed to fetch Instagram account',
        });
    }
}

/**
 * Debug and validate access token
 */
async function debugToken(params: {
    inputToken: string;
    accessToken: string;
}) {
    const { inputToken, accessToken } = params;

    if (!inputToken || !accessToken) {
        return NextResponse.json(
            { error: 'Input token and access token are required' },
            { status: 400 }
        );
    }

    try {
        const response = await fetch(
            `${GRAPH_API_BASE}/debug_token?input_token=${inputToken}&access_token=${accessToken}`
        );

        const data = await response.json();

        if (data.error) {
            return NextResponse.json({
                success: false,
                error: data.error.message,
            });
        }

        const tokenData = data.data;

        return NextResponse.json({
            success: true,
            tokenInfo: {
                isValid: tokenData.is_valid,
                appId: tokenData.app_id,
                userId: tokenData.user_id,
                expiresAt: tokenData.data_access_expires_at
                    ? new Date(tokenData.data_access_expires_at * 1000).toISOString()
                    : null,
                scopes: tokenData.scopes || [],
                type: tokenData.type,
            },
        });
    } catch (error: any) {
        return NextResponse.json({
            success: false,
            error: error.message || 'Failed to debug token',
        });
    }
}
