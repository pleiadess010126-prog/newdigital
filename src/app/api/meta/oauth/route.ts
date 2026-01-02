import { NextRequest, NextResponse } from 'next/server';

const GRAPH_API_VERSION = 'v24.0';
const GRAPH_API_BASE = `https://graph.facebook.com/${GRAPH_API_VERSION}`;

/**
 * Meta/Facebook OAuth Flow Handler
 * 
 * This route handles OAuth-related operations for Meta (Facebook/Instagram) integration.
 * All credentials are provided by the USER through the UI, not from environment variables.
 * 
 * POST endpoints:
 * - exchange-code: Exchange authorization code for access token
 * - get-long-lived-token: Convert short-lived token to 60-day token
 * - refresh-token: Get/refresh page access token
 * - get-auth-url: Generate authorization URL with user's app credentials
 */

// Required permissions for Instagram Reels and Facebook publishing
const REQUIRED_SCOPES = [
    'pages_show_list',
    'pages_read_engagement',
    'pages_manage_posts',
    'pages_manage_metadata',
    'instagram_basic',
    'instagram_content_publish',
    'instagram_manage_insights',
    'publish_video',
    'business_management',
].join(',');

/**
 * GET /api/meta/oauth
 * Returns OAuth configuration info (scopes, etc.)
 */
export async function GET() {
    return NextResponse.json({
        message: 'Meta OAuth API',
        scopes: REQUIRED_SCOPES.split(','),
        instructions: [
            '1. Create a Meta App at https://developers.facebook.com',
            '2. Add Facebook Login and Instagram Graph API products',
            '3. Use the Meta Setup Wizard in Settings to configure your credentials',
            '4. Generate an access token with the required permissions',
        ],
    });
}

/**
 * POST /api/meta/oauth
 * Handles OAuth operations with USER-PROVIDED credentials
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { action, ...params } = body;

        switch (action) {
            case 'exchange-code':
                return await exchangeCodeForToken(params);
            case 'get-long-lived-token':
                return await getLongLivedToken(params);
            case 'refresh-token':
                return await refreshPageToken(params);
            case 'get-auth-url':
                return getAuthorizationUrl(params);
            case 'validate-credentials':
                return await validateCredentials(params);
            default:
                return NextResponse.json(
                    { error: 'Invalid action. Valid actions: exchange-code, get-long-lived-token, refresh-token, get-auth-url, validate-credentials' },
                    { status: 400 }
                );
        }
    } catch (error: any) {
        console.error('Meta OAuth Error:', error);
        return NextResponse.json(
            { error: error.message || 'Internal server error' },
            { status: 500 }
        );
    }
}

/**
 * Exchange authorization code for access token
 * User provides: code, appId, appSecret, redirectUri
 */
async function exchangeCodeForToken(params: {
    code: string;
    appId: string;
    appSecret: string;
    redirectUri: string;
}) {
    const { code, appId, appSecret, redirectUri } = params;

    if (!code || !appId || !appSecret || !redirectUri) {
        return NextResponse.json(
            { error: 'Missing required parameters: code, appId, appSecret, redirectUri' },
            { status: 400 }
        );
    }

    try {
        const tokenUrl = new URL(`${GRAPH_API_BASE}/oauth/access_token`);
        tokenUrl.searchParams.set('client_id', appId);
        tokenUrl.searchParams.set('client_secret', appSecret);
        tokenUrl.searchParams.set('redirect_uri', redirectUri);
        tokenUrl.searchParams.set('code', code);

        const response = await fetch(tokenUrl.toString());
        const data = await response.json();

        if (data.error) {
            return NextResponse.json({
                success: false,
                error: data.error.message || 'Failed to exchange code for token',
                errorType: data.error.type,
                errorCode: data.error.code,
            });
        }

        return NextResponse.json({
            success: true,
            accessToken: data.access_token,
            tokenType: data.token_type || 'bearer',
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
 * Exchange short-lived token for long-lived token (60 days)
 * User provides: accessToken, appId, appSecret
 */
async function getLongLivedToken(params: {
    accessToken: string;
    appId: string;
    appSecret: string;
}) {
    const { accessToken, appId, appSecret } = params;

    if (!accessToken || !appId || !appSecret) {
        return NextResponse.json(
            { error: 'Missing required parameters: accessToken, appId, appSecret' },
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
            expiresIn: data.expires_in, // Usually ~60 days in seconds
            expiresAt: new Date(Date.now() + (data.expires_in * 1000)).toISOString(),
        });
    } catch (error: any) {
        return NextResponse.json({
            success: false,
            error: error.message || 'Failed to get long-lived token',
        });
    }
}

/**
 * Refresh/get page access token (never expires if user token is long-lived)
 * User provides: userAccessToken, pageId
 */
async function refreshPageToken(params: {
    userAccessToken: string;
    pageId: string;
}) {
    const { userAccessToken, pageId } = params;

    if (!userAccessToken || !pageId) {
        return NextResponse.json(
            { error: 'Missing required parameters: userAccessToken, pageId' },
            { status: 400 }
        );
    }

    try {
        const response = await fetch(
            `${GRAPH_API_BASE}/${pageId}?fields=access_token,name&access_token=${userAccessToken}`
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
            pageId: pageId,
            pageName: data.name,
            pageAccessToken: data.access_token,
            tokenType: 'page-token',
        });
    } catch (error: any) {
        return NextResponse.json({
            success: false,
            error: error.message || 'Failed to refresh page token',
        });
    }
}

/**
 * Generate authorization URL for OAuth flow
 * User provides: appId, redirectUri
 */
function getAuthorizationUrl(params: {
    appId: string;
    redirectUri: string;
}) {
    const { appId, redirectUri } = params;

    if (!appId || !redirectUri) {
        return NextResponse.json({
            success: false,
            error: 'Missing required parameters: appId, redirectUri',
        });
    }

    const state = crypto.randomUUID();
    const authUrl = `https://www.facebook.com/v24.0/dialog/oauth?` +
        `client_id=${appId}&` +
        `redirect_uri=${encodeURIComponent(redirectUri)}&` +
        `scope=${encodeURIComponent(REQUIRED_SCOPES)}&` +
        `state=${state}&` +
        `response_type=code`;

    return NextResponse.json({
        success: true,
        authUrl,
        state,
        scopes: REQUIRED_SCOPES.split(','),
    });
}

/**
 * Validate user's Meta credentials by testing API access
 * User provides: accessToken
 */
async function validateCredentials(params: {
    accessToken: string;
}) {
    const { accessToken } = params;

    if (!accessToken) {
        return NextResponse.json(
            { error: 'Missing required parameter: accessToken' },
            { status: 400 }
        );
    }

    try {
        // Test the token by fetching user info
        const response = await fetch(
            `${GRAPH_API_BASE}/me?fields=id,name,email&access_token=${accessToken}`
        );

        const data = await response.json();

        if (data.error) {
            return NextResponse.json({
                success: false,
                valid: false,
                error: data.error.message,
            });
        }

        // Also debug the token to get expiry info
        const debugResponse = await fetch(
            `${GRAPH_API_BASE}/debug_token?input_token=${accessToken}&access_token=${accessToken}`
        );
        const debugData = await debugResponse.json();

        return NextResponse.json({
            success: true,
            valid: true,
            user: {
                id: data.id,
                name: data.name,
                email: data.email,
            },
            tokenInfo: debugData.data ? {
                isValid: debugData.data.is_valid,
                expiresAt: debugData.data.expires_at ? new Date(debugData.data.expires_at * 1000).toISOString() : null,
                scopes: debugData.data.scopes || [],
            } : undefined,
        });
    } catch (error: any) {
        return NextResponse.json({
            success: false,
            valid: false,
            error: error.message || 'Validation failed',
        });
    }
}
