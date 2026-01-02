import { NextRequest, NextResponse } from 'next/server';
import { MetaClient, MetaConfig } from '@/lib/platforms/meta';

/**
 * POST /api/test-reel
 * 
 * Test endpoint to post a sample Instagram Reel
 * 
 * Required body:
 * - accessToken: Meta access token with instagram_content_publish permission
 * - instagramAccountId: Instagram Business/Creator account ID
 * - videoUrl: Publicly accessible URL to the video (must be .mp4, min 3 seconds, max 15 minutes)
 * 
 * Optional body:
 * - caption: Caption for the reel
 * - appId: Meta App ID
 * - appSecret: Meta App Secret
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        const {
            accessToken,
            instagramAccountId,
            videoUrl,
            caption = '🎬 Test Reel from DigitalMEng! #test #automation #digitalmarketing',
            appId = process.env.META_APP_ID || '',
            appSecret = process.env.META_APP_SECRET || '',
        } = body;

        // Validate required fields
        if (!accessToken) {
            return NextResponse.json({
                success: false,
                error: 'Missing required field: accessToken',
                help: 'Get a Page Access Token from Meta Graph API Explorer with instagram_content_publish permission'
            }, { status: 400 });
        }

        if (!instagramAccountId) {
            return NextResponse.json({
                success: false,
                error: 'Missing required field: instagramAccountId',
                help: 'Get your Instagram Business Account ID from: GET /{page-id}?fields=instagram_business_account'
            }, { status: 400 });
        }

        if (!videoUrl) {
            return NextResponse.json({
                success: false,
                error: 'Missing required field: videoUrl',
                help: 'Video must be publicly accessible MP4, 3s-15min duration, aspect ratio 9:16 for Reels'
            }, { status: 400 });
        }

        // Create Meta client
        const config: MetaConfig = {
            appId,
            appSecret,
            accessToken,
            instagramAccountId,
        };

        const metaClient = new MetaClient(config);

        // Test connection first
        console.log('Testing Meta connection...');
        const connectionTest = await metaClient.testConnection();

        if (!connectionTest.success) {
            return NextResponse.json({
                success: false,
                error: 'Connection test failed: ' + connectionTest.message,
                step: 'connection_test'
            }, { status: 401 });
        }

        console.log('Connection successful:', connectionTest.message);

        // Post the reel
        console.log('Posting Instagram Reel...');
        console.log('Video URL:', videoUrl);
        console.log('Caption:', caption);

        const result = await metaClient.postInstagramReel({
            caption,
            videoUrl,
            shareToFeed: true,
        });

        if (result.success) {
            return NextResponse.json({
                success: true,
                message: 'Reel posted successfully!',
                postId: result.postId,
                postUrl: result.postUrl,
                connectionInfo: connectionTest.message
            });
        } else {
            return NextResponse.json({
                success: false,
                error: result.error,
                step: 'reel_posting',
                connectionInfo: connectionTest.message
            }, { status: 400 });
        }

    } catch (error: any) {
        console.error('Test reel error:', error);
        return NextResponse.json({
            success: false,
            error: error.message || 'Failed to post test reel',
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        }, { status: 500 });
    }
}

/**
 * GET /api/test-reel
 * 
 * Returns instructions on how to use this endpoint
 */
export async function GET() {
    return NextResponse.json({
        endpoint: 'POST /api/test-reel',
        description: 'Test endpoint to post a sample Instagram Reel',
        requirements: {
            accessToken: {
                required: true,
                description: 'Meta Page Access Token with instagram_content_publish permission',
                howToGet: [
                    '1. Go to https://developers.facebook.com/tools/explorer/',
                    '2. Select your app',
                    '3. Select "Get Page Access Token"',
                    '4. Select the Facebook Page linked to your Instagram account',
                    '5. Add permissions: instagram_basic, instagram_content_publish, pages_read_engagement',
                    '6. Generate access token'
                ]
            },
            instagramAccountId: {
                required: true,
                description: 'Instagram Business/Creator Account ID',
                howToGet: [
                    '1. In Graph API Explorer, make this request:',
                    '   GET /{your-page-id}?fields=instagram_business_account',
                    '2. The instagram_business_account.id is what you need'
                ]
            },
            videoUrl: {
                required: true,
                description: 'Publicly accessible URL to the video file',
                requirements: [
                    'Format: MP4 (H.264 codec)',
                    'Duration: 3 seconds to 15 minutes',
                    'Aspect ratio: 9:16 (vertical) recommended for Reels',
                    'Max file size: 1GB',
                    'Must be HTTPS and publicly accessible'
                ],
                sampleUrls: [
                    'https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4',
                    'You can upload a video to S3 or any public hosting'
                ]
            },
            caption: {
                required: false,
                default: '🎬 Test Reel from DigitalMEng! #test #automation #digitalmarketing',
                description: 'Caption for the reel (max 2200 characters)'
            }
        },
        exampleRequest: {
            method: 'POST',
            url: '/api/test-reel',
            body: {
                accessToken: 'EAAxxxxxxxxxxxxx...',
                instagramAccountId: '17841400000000000',
                videoUrl: 'https://your-domain.com/sample-reel.mp4',
                caption: 'My first automated reel! 🚀 #automation'
            }
        },
        troubleshooting: {
            'Token expired': 'Generate a new access token from Graph API Explorer',
            'Permission denied': 'Ensure your app has instagram_content_publish permission and the token includes it',
            'Invalid video URL': 'The video must be publicly accessible (not behind authentication)',
            'Unsupported format': 'Use MP4 with H.264 codec, AAC audio',
            'Account not found': 'Ensure Instagram account is Business or Creator type and linked to a Facebook Page'
        }
    });
}
