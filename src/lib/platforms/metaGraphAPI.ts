// Meta Graph API Client v24.0
// Full integration for Facebook and Instagram via Meta Graph API
// Documentation: https://developers.facebook.com/docs/graph-api/

const GRAPH_API_VERSION = 'v24.0';
const GRAPH_API_BASE = `https://graph.facebook.com/${GRAPH_API_VERSION}`;

export interface MetaAppConfig {
    appId: string;
    appSecret: string;
}

export interface MetaUserToken {
    accessToken: string;
    tokenType: 'short-lived' | 'long-lived';
    expiresIn?: number;
    expiresAt?: Date;
}

export interface MetaPageInfo {
    id: string;
    name: string;
    accessToken: string;
    category: string;
    instagramBusinessAccount?: {
        id: string;
        username: string;
        profilePictureUrl?: string;
    };
}

export interface MetaUserInfo {
    id: string;
    name: string;
    email?: string;
}

export interface InstagramAccountInfo {
    id: string;
    username: string;
    name?: string;
    profilePictureUrl?: string;
    followersCount?: number;
    mediaCount?: number;
}

export interface MediaContainerStatus {
    id: string;
    status: 'IN_PROGRESS' | 'FINISHED' | 'ERROR';
    statusCode?: string;
}

export interface PostResult {
    success: boolean;
    postId?: string;
    postUrl?: string;
    error?: string;
    errorCode?: number;
}

export interface MediaInsights {
    impressions?: number;
    reach?: number;
    likes?: number;
    comments?: number;
    saves?: number;
    shares?: number;
    plays?: number;
    totalInteractions?: number;
}

/**
 * Meta Graph API Client
 * Comprehensive client for Facebook and Instagram publishing
 */
export class MetaGraphAPIClient {
    private appConfig: MetaAppConfig;
    private accessToken: string;
    private pageAccessToken?: string;
    private instagramAccountId?: string;
    private facebookPageId?: string;

    constructor(config: {
        appId: string;
        appSecret: string;
        accessToken: string;
        pageAccessToken?: string;
        instagramAccountId?: string;
        facebookPageId?: string;
    }) {
        this.appConfig = {
            appId: config.appId,
            appSecret: config.appSecret,
        };
        this.accessToken = config.accessToken;
        this.pageAccessToken = config.pageAccessToken;
        this.instagramAccountId = config.instagramAccountId;
        this.facebookPageId = config.facebookPageId;
    }

    // =============================================
    // TOKEN MANAGEMENT
    // =============================================

    /**
     * Exchange short-lived token for long-lived token (60 days)
     */
    async exchangeForLongLivedToken(shortLivedToken: string): Promise<MetaUserToken> {
        const response = await fetch(
            `${GRAPH_API_BASE}/oauth/access_token?` +
            `grant_type=fb_exchange_token&` +
            `client_id=${this.appConfig.appId}&` +
            `client_secret=${this.appConfig.appSecret}&` +
            `fb_exchange_token=${shortLivedToken}`
        );

        const data = await response.json();

        if (data.error) {
            throw new Error(data.error.message || 'Failed to exchange token');
        }

        return {
            accessToken: data.access_token,
            tokenType: 'long-lived',
            expiresIn: data.expires_in,
            expiresAt: new Date(Date.now() + data.expires_in * 1000),
        };
    }

    /**
     * Debug and validate an access token
     */
    async debugToken(token: string): Promise<{
        isValid: boolean;
        appId: string;
        userId: string;
        expiresAt: Date;
        scopes: string[];
    }> {
        const response = await fetch(
            `${GRAPH_API_BASE}/debug_token?input_token=${token}&access_token=${this.accessToken}`
        );

        const data = await response.json();

        if (data.error) {
            throw new Error(data.error.message || 'Failed to debug token');
        }

        return {
            isValid: data.data.is_valid,
            appId: data.data.app_id,
            userId: data.data.user_id,
            expiresAt: new Date(data.data.data_access_expires_at * 1000),
            scopes: data.data.scopes || [],
        };
    }

    // =============================================
    // USER & ACCOUNT INFO
    // =============================================

    /**
     * Get current user info
     */
    async getUserInfo(): Promise<MetaUserInfo> {
        const response = await fetch(
            `${GRAPH_API_BASE}/me?fields=id,name,email&access_token=${this.accessToken}`
        );

        const data = await response.json();

        if (data.error) {
            throw new Error(data.error.message || 'Failed to get user info');
        }

        return {
            id: data.id,
            name: data.name,
            email: data.email,
        };
    }

    /**
     * Get all Facebook Pages the user manages
     */
    async getUserPages(): Promise<MetaPageInfo[]> {
        const response = await fetch(
            `${GRAPH_API_BASE}/me/accounts?fields=id,name,access_token,category,instagram_business_account{id,username,profile_picture_url}&access_token=${this.accessToken}`
        );

        const data = await response.json();

        if (data.error) {
            throw new Error(data.error.message || 'Failed to get pages');
        }

        return (data.data || []).map((page: any) => ({
            id: page.id,
            name: page.name,
            accessToken: page.access_token,
            category: page.category,
            instagramBusinessAccount: page.instagram_business_account ? {
                id: page.instagram_business_account.id,
                username: page.instagram_business_account.username,
                profilePictureUrl: page.instagram_business_account.profile_picture_url,
            } : undefined,
        }));
    }

    /**
     * Get Instagram Business Account details
     */
    async getInstagramAccountInfo(instagramAccountId: string): Promise<InstagramAccountInfo> {
        const response = await fetch(
            `${GRAPH_API_BASE}/${instagramAccountId}?fields=id,username,name,profile_picture_url,followers_count,media_count&access_token=${this.pageAccessToken || this.accessToken}`
        );

        const data = await response.json();

        if (data.error) {
            throw new Error(data.error.message || 'Failed to get Instagram account info');
        }

        return {
            id: data.id,
            username: data.username,
            name: data.name,
            profilePictureUrl: data.profile_picture_url,
            followersCount: data.followers_count,
            mediaCount: data.media_count,
        };
    }

    // =============================================
    // INSTAGRAM PUBLISHING
    // =============================================

    /**
     * Publish Instagram Reel (Short-form video)
     */
    async publishInstagramReel(params: {
        videoUrl: string;
        caption: string;
        coverUrl?: string;
        shareToFeed?: boolean;
        thumbOffset?: number;
        locationId?: string;
        collaborators?: string[];
    }): Promise<PostResult> {
        if (!this.instagramAccountId) {
            return { success: false, error: 'Instagram account ID not configured' };
        }

        const token = this.pageAccessToken || this.accessToken;

        try {
            // Step 1: Create media container
            const containerParams: any = {
                media_type: 'REELS',
                video_url: params.videoUrl,
                caption: params.caption,
                share_to_feed: params.shareToFeed !== false,
                access_token: token,
            };

            if (params.coverUrl) containerParams.cover_url = params.coverUrl;
            if (params.thumbOffset) containerParams.thumb_offset = params.thumbOffset;
            if (params.locationId) containerParams.location_id = params.locationId;
            if (params.collaborators) containerParams.collaborators = params.collaborators;

            const containerResponse = await fetch(
                `${GRAPH_API_BASE}/${this.instagramAccountId}/media`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(containerParams),
                }
            );

            const containerData = await containerResponse.json();

            if (containerData.error) {
                return {
                    success: false,
                    error: containerData.error.message,
                    errorCode: containerData.error.code,
                };
            }

            const containerId = containerData.id;

            // Step 2: Wait for video processing
            let status = await this.checkMediaContainerStatus(containerId);
            let attempts = 0;
            const maxAttempts = 30; // 5 minutes max wait

            while (status.status === 'IN_PROGRESS' && attempts < maxAttempts) {
                await new Promise(resolve => setTimeout(resolve, 10000)); // Wait 10 seconds
                status = await this.checkMediaContainerStatus(containerId);
                attempts++;
            }

            if (status.status === 'ERROR') {
                return {
                    success: false,
                    error: `Video processing failed: ${status.statusCode}`,
                };
            }

            if (status.status !== 'FINISHED') {
                return {
                    success: false,
                    error: 'Video processing timeout',
                };
            }

            // Step 3: Publish the container
            const publishResponse = await fetch(
                `${GRAPH_API_BASE}/${this.instagramAccountId}/media_publish`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        creation_id: containerId,
                        access_token: token,
                    }),
                }
            );

            const publishData = await publishResponse.json();

            if (publishData.error) {
                return {
                    success: false,
                    error: publishData.error.message,
                    errorCode: publishData.error.code,
                };
            }

            return {
                success: true,
                postId: publishData.id,
                postUrl: `https://www.instagram.com/reel/${publishData.id}`,
            };
        } catch (error: any) {
            return {
                success: false,
                error: error.message || 'Failed to publish reel',
            };
        }
    }

    /**
     * Publish Instagram Image Post
     */
    async publishInstagramImage(params: {
        imageUrl: string;
        caption: string;
        locationId?: string;
        userTags?: { username: string; x: number; y: number }[];
    }): Promise<PostResult> {
        if (!this.instagramAccountId) {
            return { success: false, error: 'Instagram account ID not configured' };
        }

        const token = this.pageAccessToken || this.accessToken;

        try {
            // Step 1: Create media container
            const containerParams: any = {
                image_url: params.imageUrl,
                caption: params.caption,
                access_token: token,
            };

            if (params.locationId) containerParams.location_id = params.locationId;
            if (params.userTags) {
                containerParams.user_tags = params.userTags.map(tag => ({
                    username: tag.username,
                    x: tag.x,
                    y: tag.y,
                }));
            }

            const containerResponse = await fetch(
                `${GRAPH_API_BASE}/${this.instagramAccountId}/media`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(containerParams),
                }
            );

            const containerData = await containerResponse.json();

            if (containerData.error) {
                return {
                    success: false,
                    error: containerData.error.message,
                    errorCode: containerData.error.code,
                };
            }

            // Step 2: Publish the container
            const publishResponse = await fetch(
                `${GRAPH_API_BASE}/${this.instagramAccountId}/media_publish`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        creation_id: containerData.id,
                        access_token: token,
                    }),
                }
            );

            const publishData = await publishResponse.json();

            if (publishData.error) {
                return {
                    success: false,
                    error: publishData.error.message,
                    errorCode: publishData.error.code,
                };
            }

            return {
                success: true,
                postId: publishData.id,
                postUrl: `https://www.instagram.com/p/${publishData.id}`,
            };
        } catch (error: any) {
            return {
                success: false,
                error: error.message || 'Failed to publish image',
            };
        }
    }

    /**
     * Publish Instagram Carousel
     */
    async publishInstagramCarousel(params: {
        mediaUrls: { type: 'IMAGE' | 'VIDEO'; url: string }[];
        caption: string;
        locationId?: string;
    }): Promise<PostResult> {
        if (!this.instagramAccountId) {
            return { success: false, error: 'Instagram account ID not configured' };
        }

        const token = this.pageAccessToken || this.accessToken;

        try {
            // Step 1: Create individual media containers for each item
            const childContainerIds: string[] = [];

            for (const media of params.mediaUrls) {
                const containerParams: any = {
                    is_carousel_item: true,
                    access_token: token,
                };

                if (media.type === 'IMAGE') {
                    containerParams.image_url = media.url;
                } else {
                    containerParams.media_type = 'VIDEO';
                    containerParams.video_url = media.url;
                }

                const response = await fetch(
                    `${GRAPH_API_BASE}/${this.instagramAccountId}/media`,
                    {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(containerParams),
                    }
                );

                const data = await response.json();

                if (data.error) {
                    return {
                        success: false,
                        error: `Failed to create carousel item: ${data.error.message}`,
                    };
                }

                childContainerIds.push(data.id);
            }

            // Step 2: Create carousel container
            const carouselParams: any = {
                media_type: 'CAROUSEL',
                caption: params.caption,
                children: childContainerIds.join(','),
                access_token: token,
            };

            if (params.locationId) carouselParams.location_id = params.locationId;

            const carouselResponse = await fetch(
                `${GRAPH_API_BASE}/${this.instagramAccountId}/media`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(carouselParams),
                }
            );

            const carouselData = await carouselResponse.json();

            if (carouselData.error) {
                return {
                    success: false,
                    error: carouselData.error.message,
                };
            }

            // Step 3: Publish the carousel
            const publishResponse = await fetch(
                `${GRAPH_API_BASE}/${this.instagramAccountId}/media_publish`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        creation_id: carouselData.id,
                        access_token: token,
                    }),
                }
            );

            const publishData = await publishResponse.json();

            if (publishData.error) {
                return {
                    success: false,
                    error: publishData.error.message,
                };
            }

            return {
                success: true,
                postId: publishData.id,
                postUrl: `https://www.instagram.com/p/${publishData.id}`,
            };
        } catch (error: any) {
            return {
                success: false,
                error: error.message || 'Failed to publish carousel',
            };
        }
    }

    /**
     * Publish Instagram Story
     */
    async publishInstagramStory(params: {
        mediaUrl: string;
        mediaType: 'IMAGE' | 'VIDEO';
    }): Promise<PostResult> {
        if (!this.instagramAccountId) {
            return { success: false, error: 'Instagram account ID not configured' };
        }

        const token = this.pageAccessToken || this.accessToken;

        try {
            const containerParams: any = {
                media_type: 'STORIES',
                access_token: token,
            };

            if (params.mediaType === 'IMAGE') {
                containerParams.image_url = params.mediaUrl;
            } else {
                containerParams.video_url = params.mediaUrl;
            }

            const containerResponse = await fetch(
                `${GRAPH_API_BASE}/${this.instagramAccountId}/media`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(containerParams),
                }
            );

            const containerData = await containerResponse.json();

            if (containerData.error) {
                return {
                    success: false,
                    error: containerData.error.message,
                };
            }

            // Wait for processing if video
            if (params.mediaType === 'VIDEO') {
                let status = await this.checkMediaContainerStatus(containerData.id);
                let attempts = 0;

                while (status.status === 'IN_PROGRESS' && attempts < 30) {
                    await new Promise(resolve => setTimeout(resolve, 10000));
                    status = await this.checkMediaContainerStatus(containerData.id);
                    attempts++;
                }
            }

            // Publish
            const publishResponse = await fetch(
                `${GRAPH_API_BASE}/${this.instagramAccountId}/media_publish`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        creation_id: containerData.id,
                        access_token: token,
                    }),
                }
            );

            const publishData = await publishResponse.json();

            if (publishData.error) {
                return {
                    success: false,
                    error: publishData.error.message,
                };
            }

            return {
                success: true,
                postId: publishData.id,
            };
        } catch (error: any) {
            return {
                success: false,
                error: error.message || 'Failed to publish story',
            };
        }
    }

    /**
     * Check media container processing status
     */
    async checkMediaContainerStatus(containerId: string): Promise<MediaContainerStatus> {
        const token = this.pageAccessToken || this.accessToken;

        const response = await fetch(
            `${GRAPH_API_BASE}/${containerId}?fields=status_code&access_token=${token}`
        );

        const data = await response.json();

        if (data.error) {
            return { id: containerId, status: 'ERROR', statusCode: data.error.message };
        }

        const statusCode = data.status_code;
        let status: 'IN_PROGRESS' | 'FINISHED' | 'ERROR' = 'IN_PROGRESS';

        if (statusCode === 'FINISHED') {
            status = 'FINISHED';
        } else if (statusCode === 'ERROR' || statusCode === 'EXPIRED') {
            status = 'ERROR';
        }

        return { id: containerId, status, statusCode };
    }

    // =============================================
    // FACEBOOK PUBLISHING
    // =============================================

    /**
     * Publish to Facebook Page Feed
     */
    async publishFacebookPost(params: {
        message: string;
        link?: string;
        imageUrl?: string;
        videoUrl?: string;
        scheduledPublishTime?: Date;
    }): Promise<PostResult> {
        if (!this.facebookPageId) {
            return { success: false, error: 'Facebook Page ID not configured' };
        }

        const token = this.pageAccessToken || this.accessToken;

        try {
            let endpoint = `${GRAPH_API_BASE}/${this.facebookPageId}/feed`;
            const postParams: any = {
                message: params.message,
                access_token: token,
            };

            if (params.link) {
                postParams.link = params.link;
            }

            if (params.imageUrl) {
                endpoint = `${GRAPH_API_BASE}/${this.facebookPageId}/photos`;
                postParams.url = params.imageUrl;
            }

            if (params.videoUrl) {
                endpoint = `${GRAPH_API_BASE}/${this.facebookPageId}/videos`;
                postParams.file_url = params.videoUrl;
            }

            if (params.scheduledPublishTime) {
                postParams.published = false;
                postParams.scheduled_publish_time = Math.floor(params.scheduledPublishTime.getTime() / 1000);
            }

            const response = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(postParams),
            });

            const data = await response.json();

            if (data.error) {
                return {
                    success: false,
                    error: data.error.message,
                    errorCode: data.error.code,
                };
            }

            return {
                success: true,
                postId: data.id || data.post_id,
                postUrl: `https://www.facebook.com/${data.id || data.post_id}`,
            };
        } catch (error: any) {
            return {
                success: false,
                error: error.message || 'Failed to publish to Facebook',
            };
        }
    }

    /**
     * Publish Facebook Reel
     */
    async publishFacebookReel(params: {
        videoUrl: string;
        description: string;
    }): Promise<PostResult> {
        if (!this.facebookPageId) {
            return { success: false, error: 'Facebook Page ID not configured' };
        }

        const token = this.pageAccessToken || this.accessToken;

        try {
            // Step 1: Initialize upload
            const initResponse = await fetch(
                `${GRAPH_API_BASE}/${this.facebookPageId}/video_reels`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        upload_phase: 'start',
                        access_token: token,
                    }),
                }
            );

            const initData = await initResponse.json();

            if (initData.error) {
                return { success: false, error: initData.error.message };
            }

            const videoId = initData.video_id;

            // Step 2: Upload video (using URL)
            const uploadResponse = await fetch(
                `${GRAPH_API_BASE}/${videoId}`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        upload_phase: 'transfer',
                        file_url: params.videoUrl,
                        access_token: token,
                    }),
                }
            );

            const uploadData = await uploadResponse.json();

            if (uploadData.error) {
                return { success: false, error: uploadData.error.message };
            }

            // Step 3: Finish and publish
            const finishResponse = await fetch(
                `${GRAPH_API_BASE}/${this.facebookPageId}/video_reels`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        upload_phase: 'finish',
                        video_id: videoId,
                        video_state: 'PUBLISHED',
                        description: params.description,
                        access_token: token,
                    }),
                }
            );

            const finishData = await finishResponse.json();

            if (finishData.error) {
                return { success: false, error: finishData.error.message };
            }

            return {
                success: true,
                postId: finishData.video_id || videoId,
                postUrl: `https://www.facebook.com/reel/${finishData.video_id || videoId}`,
            };
        } catch (error: any) {
            return {
                success: false,
                error: error.message || 'Failed to publish Facebook Reel',
            };
        }
    }

    // =============================================
    // ANALYTICS & INSIGHTS
    // =============================================

    /**
     * Get Instagram media insights
     */
    async getInstagramMediaInsights(mediaId: string): Promise<MediaInsights> {
        const token = this.pageAccessToken || this.accessToken;

        try {
            const response = await fetch(
                `${GRAPH_API_BASE}/${mediaId}/insights?metric=impressions,reach,likes,comments,saved,shares,plays,total_interactions&access_token=${token}`
            );

            const data = await response.json();

            if (data.error) {
                console.error('Failed to get insights:', data.error);
                return {};
            }

            const insights: MediaInsights = {};
            for (const metric of data.data || []) {
                switch (metric.name) {
                    case 'impressions':
                        insights.impressions = metric.values[0]?.value;
                        break;
                    case 'reach':
                        insights.reach = metric.values[0]?.value;
                        break;
                    case 'likes':
                        insights.likes = metric.values[0]?.value;
                        break;
                    case 'comments':
                        insights.comments = metric.values[0]?.value;
                        break;
                    case 'saved':
                        insights.saves = metric.values[0]?.value;
                        break;
                    case 'shares':
                        insights.shares = metric.values[0]?.value;
                        break;
                    case 'plays':
                        insights.plays = metric.values[0]?.value;
                        break;
                    case 'total_interactions':
                        insights.totalInteractions = metric.values[0]?.value;
                        break;
                }
            }

            return insights;
        } catch (error) {
            console.error('Failed to fetch insights:', error);
            return {};
        }
    }

    /**
     * Get Facebook Page insights
     */
    async getFacebookPageInsights(period: 'day' | 'week' | 'days_28' = 'day'): Promise<{
        pageImpressions?: number;
        pageEngagedUsers?: number;
        pagePostEngagements?: number;
        pageFans?: number;
    }> {
        if (!this.facebookPageId) return {};

        const token = this.pageAccessToken || this.accessToken;

        try {
            const response = await fetch(
                `${GRAPH_API_BASE}/${this.facebookPageId}/insights?metric=page_impressions,page_engaged_users,page_post_engagements,page_fans&period=${period}&access_token=${token}`
            );

            const data = await response.json();

            if (data.error) {
                console.error('Failed to get page insights:', data.error);
                return {};
            }

            const insights: any = {};
            for (const metric of data.data || []) {
                const value = metric.values?.[metric.values.length - 1]?.value;
                switch (metric.name) {
                    case 'page_impressions':
                        insights.pageImpressions = value;
                        break;
                    case 'page_engaged_users':
                        insights.pageEngagedUsers = value;
                        break;
                    case 'page_post_engagements':
                        insights.pagePostEngagements = value;
                        break;
                    case 'page_fans':
                        insights.pageFans = value;
                        break;
                }
            }

            return insights;
        } catch (error) {
            console.error('Failed to fetch page insights:', error);
            return {};
        }
    }

    // =============================================
    // CONTENT MANAGEMENT
    // =============================================

    /**
     * Delete a post
     */
    async deletePost(postId: string): Promise<{ success: boolean; error?: string }> {
        const token = this.pageAccessToken || this.accessToken;

        try {
            const response = await fetch(
                `${GRAPH_API_BASE}/${postId}?access_token=${token}`,
                { method: 'DELETE' }
            );

            const data = await response.json();

            if (data.error) {
                return { success: false, error: data.error.message };
            }

            return { success: data.success === true };
        } catch (error: any) {
            return { success: false, error: error.message };
        }
    }

    /**
     * Get recent Instagram media
     */
    async getInstagramMedia(limit: number = 10): Promise<any[]> {
        if (!this.instagramAccountId) return [];

        const token = this.pageAccessToken || this.accessToken;

        try {
            const response = await fetch(
                `${GRAPH_API_BASE}/${this.instagramAccountId}/media?fields=id,caption,media_type,media_url,thumbnail_url,permalink,timestamp,like_count,comments_count&limit=${limit}&access_token=${token}`
            );

            const data = await response.json();

            if (data.error) {
                console.error('Failed to get media:', data.error);
                return [];
            }

            return data.data || [];
        } catch (error) {
            console.error('Failed to fetch media:', error);
            return [];
        }
    }

    // =============================================
    // CONNECTION TEST
    // =============================================

    /**
     * Test connection and return detailed status
     */
    async testConnection(): Promise<{
        success: boolean;
        user?: MetaUserInfo;
        pages?: MetaPageInfo[];
        instagramAccount?: InstagramAccountInfo;
        error?: string;
        permissions?: string[];
    }> {
        try {
            // Get user info
            const user = await this.getUserInfo();

            // Get pages
            const pages = await this.getUserPages();

            // Get token permissions
            const tokenInfo = await this.debugToken(this.accessToken);

            // Get Instagram account if configured
            let instagramAccount: InstagramAccountInfo | undefined;
            if (this.instagramAccountId) {
                try {
                    instagramAccount = await this.getInstagramAccountInfo(this.instagramAccountId);
                } catch (e) {
                    // Instagram account might not be accessible
                }
            }

            return {
                success: true,
                user,
                pages,
                instagramAccount,
                permissions: tokenInfo.scopes,
            };
        } catch (error: any) {
            return {
                success: false,
                error: error.message || 'Connection test failed',
            };
        }
    }
}

/**
 * Create a Meta Graph API client instance
 */
export function createMetaGraphAPIClient(config: {
    appId: string;
    appSecret: string;
    accessToken: string;
    pageAccessToken?: string;
    instagramAccountId?: string;
    facebookPageId?: string;
}): MetaGraphAPIClient {
    return new MetaGraphAPIClient(config);
}

/**
 * Generate Facebook Login URL for OAuth
 */
export function generateFacebookLoginUrl(params: {
    appId: string;
    redirectUri: string;
    state?: string;
    scopes?: string[];
}): string {
    const defaultScopes = [
        'pages_show_list',
        'pages_read_engagement',
        'pages_manage_posts',
        'instagram_basic',
        'instagram_content_publish',
        'instagram_manage_insights',
    ];

    const scopes = params.scopes || defaultScopes;

    const url = new URL('https://www.facebook.com/v24.0/dialog/oauth');
    url.searchParams.set('client_id', params.appId);
    url.searchParams.set('redirect_uri', params.redirectUri);
    url.searchParams.set('scope', scopes.join(','));
    url.searchParams.set('response_type', 'code');
    if (params.state) {
        url.searchParams.set('state', params.state);
    }

    return url.toString();
}
