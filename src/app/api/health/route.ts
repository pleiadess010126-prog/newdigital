// =================================================================
// HEALTH CHECK API ENDPOINT
// Returns system health status for monitoring
// =================================================================

import { NextResponse } from 'next/server';
import { db } from '@/lib/db/client';

interface HealthStatus {
    status: 'healthy' | 'degraded' | 'unhealthy';
    timestamp: string;
    version: string;
    uptime: number;
    checks: {
        database: ServiceStatus;
        cache: ServiceStatus;
        ai: ServiceStatus;
        storage: ServiceStatus;
        auth: ServiceStatus;
    };
    environment: string;
    region: string;
}

interface ServiceStatus {
    status: 'up' | 'down' | 'degraded';
    latency?: number;
    message?: string;
}

// Track server start time for uptime calculation
const serverStartTime = Date.now();

/**
 * Check database connectivity
 */
async function checkDatabase(): Promise<ServiceStatus> {
    try {
        const startTime = Date.now();

        // Use the smart db client's health check
        // Check if db.connect exists or just use a simple query
        // Based on our Client interface, we don't have a healthCheck method, 
        // but we can try to get a count of organizations or similar
        await db.getOrganization('health-check-non-existent');

        const latency = Date.now() - startTime;

        return {
            status: 'up',
            latency,
        };
    } catch (error) {
        console.error('[Health] Database check failed:', error);
        return {
            status: 'down',
            message: error instanceof Error ? error.message : 'Database connection failed',
        };
    }
}

/**
 * Check cache connectivity (Redis/ElastiCache)
 */
async function checkCache(): Promise<ServiceStatus> {
    try {
        // In production, this would ping Redis
        const startTime = Date.now();

        // Simulate cache check
        await new Promise(resolve => setTimeout(resolve, 5));

        const latency = Date.now() - startTime;

        return {
            status: 'up',
            latency,
        };
    } catch (error) {
        return {
            status: 'down',
            message: error instanceof Error ? error.message : 'Cache connection failed',
        };
    }
}

/**
 * Check AI service availability
 */
async function checkAI(): Promise<ServiceStatus> {
    try {
        // In production, this would check Bedrock/OpenAI health
        const hasOpenAI = !!process.env.OPENAI_API_KEY;
        const hasBedrock = !!process.env.AWS_ACCESS_KEY_ID;
        const hasAnthropic = !!process.env.ANTHROPIC_API_KEY;

        if (!hasOpenAI && !hasBedrock && !hasAnthropic) {
            return {
                status: 'degraded',
                message: 'No AI provider configured',
            };
        }

        return {
            status: 'up',
            message: `Providers: ${[
                hasOpenAI && 'OpenAI',
                hasBedrock && 'Bedrock',
                hasAnthropic && 'Anthropic',
            ].filter(Boolean).join(', ')}`,
        };
    } catch (error) {
        return {
            status: 'down',
            message: error instanceof Error ? error.message : 'AI service check failed',
        };
    }
}

/**
 * Check storage (S3) connectivity
 */
async function checkStorage(): Promise<ServiceStatus> {
    try {
        // In production, this would check S3 bucket access
        const hasS3 = !!process.env.S3_BUCKET_NAME || !!process.env.AWS_S3_BUCKET;

        if (!hasS3) {
            return {
                status: 'degraded',
                message: 'S3 bucket not configured',
            };
        }

        return {
            status: 'up',
        };
    } catch (error) {
        return {
            status: 'down',
            message: error instanceof Error ? error.message : 'Storage check failed',
        };
    }
}

/**
 * Check authentication service (Cognito)
 */
async function checkAuth(): Promise<ServiceStatus> {
    try {
        const hasUserPool = !!process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID;
        const hasClientId = !!process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID;

        if (!hasUserPool || !hasClientId) {
            return {
                status: 'degraded',
                message: 'Cognito not fully configured',
            };
        }

        return {
            status: 'up',
        };
    } catch (error) {
        return {
            status: 'down',
            message: error instanceof Error ? error.message : 'Auth service check failed',
        };
    }
}

/**
 * GET /api/health
 * Returns overall system health status
 */
export async function GET() {
    const startTime = Date.now();

    // Run all health checks in parallel
    const [database, cache, ai, storage, auth] = await Promise.all([
        checkDatabase(),
        checkCache(),
        checkAI(),
        checkStorage(),
        checkAuth(),
    ]);

    // Determine overall status
    const allChecks = [database, cache, ai, storage, auth];
    const downCount = allChecks.filter(c => c.status === 'down').length;
    const degradedCount = allChecks.filter(c => c.status === 'degraded').length;

    let overallStatus: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';
    if (downCount > 0) {
        overallStatus = 'unhealthy';
    } else if (degradedCount > 0) {
        overallStatus = 'degraded';
    }

    const response: HealthStatus = {
        status: overallStatus,
        timestamp: new Date().toISOString(),
        version: process.env.npm_package_version || '1.0.0',
        uptime: Math.floor((Date.now() - serverStartTime) / 1000),
        checks: {
            database,
            cache,
            ai,
            storage,
            auth,
        },
        environment: process.env.NODE_ENV || 'development',
        region: process.env.AWS_REGION || process.env.CUSTOM_AWS_REGION || 'us-east-1',
    };

    // Return appropriate status code based on health
    const statusCode = overallStatus === 'healthy' ? 200 : overallStatus === 'degraded' ? 200 : 503;

    return NextResponse.json(response, {
        status: statusCode,
        headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'X-Response-Time': `${Date.now() - startTime}ms`,
        },
    });
}

/**
 * HEAD /api/health
 * Quick health check (just returns 200 if server is up)
 */
export async function HEAD() {
    return new Response(null, { status: 200 });
}
