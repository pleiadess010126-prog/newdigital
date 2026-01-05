// Database Client - Abstraction layer for database operations
// Supports both DynamoDB and localStorage (for development/demo)

import type {
    Organization,
    User,
    Campaign,
    ContentItem,
    TopicPillar,
    PlatformConnection,
    Subscription,
    UsageRecord,
    AIAgent,
    RiskAlert,
    ActivityLog,
    PaginatedResult,
    QueryOptions,
} from './schema';

// ==========================================
// DATABASE INTERFACE
// ==========================================

export interface DatabaseClient {
    // Organizations
    createOrganization(org: Omit<Organization, 'id' | 'createdAt' | 'updatedAt'>): Promise<Organization>;
    getOrganization(id: string): Promise<Organization | null>;
    updateOrganization(id: string, updates: Partial<Organization>): Promise<Organization>;
    deleteOrganization(id: string): Promise<void>;

    // Users
    createUser(user: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User>;
    getUser(id: string): Promise<User | null>;
    getUserByEmail(email: string): Promise<User | null>;
    updateUser(id: string, updates: Partial<User>): Promise<User>;
    deleteUser(id: string): Promise<void>;
    getUsersByOrganization(orgId: string): Promise<User[]>;

    // Campaigns
    createCampaign(campaign: Omit<Campaign, 'id' | 'createdAt' | 'updatedAt'>): Promise<Campaign>;
    getCampaign(id: string): Promise<Campaign | null>;
    getCampaignsByOrganization(orgId: string, options?: QueryOptions): Promise<PaginatedResult<Campaign>>;
    updateCampaign(id: string, updates: Partial<Campaign>): Promise<Campaign>;
    deleteCampaign(id: string): Promise<void>;

    // Content
    createContent(content: Omit<ContentItem, 'id' | 'createdAt' | 'updatedAt'>): Promise<ContentItem>;
    getContent(id: string): Promise<ContentItem | null>;
    getContentByCampaign(campaignId: string, options?: QueryOptions): Promise<PaginatedResult<ContentItem>>;
    getContentByOrganization(orgId: string, options?: QueryOptions): Promise<PaginatedResult<ContentItem>>;
    updateContent(id: string, updates: Partial<ContentItem>): Promise<ContentItem>;
    deleteContent(id: string): Promise<void>;

    // Usage
    getUsage(orgId: string, month: string): Promise<UsageRecord | null>;
    incrementUsage(orgId: string, field: keyof Pick<UsageRecord, 'contentGenerated' | 'apiCalls'>): Promise<void>;

    // Activity Logs
    logActivity(log: Omit<ActivityLog, 'id' | 'createdAt'>): Promise<ActivityLog>;
    getActivityLogs(orgId: string, options?: QueryOptions): Promise<PaginatedResult<ActivityLog>>;
}

// ==========================================
// LOCAL STORAGE DATABASE (FOR DEMO)
// ==========================================

const STORAGE_PREFIX = 'digitalMEng_db_';

function generateId(): string {
    return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

function getStorage<T>(key: string): T[] {
    if (typeof window === 'undefined') return [];
    try {
        const data = localStorage.getItem(STORAGE_PREFIX + key);
        return data ? JSON.parse(data) : [];
    } catch {
        return [];
    }
}

function setStorage<T>(key: string, data: T[]): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(data));
}

export class LocalStorageDatabase implements DatabaseClient {
    // Organizations
    async createOrganization(org: Omit<Organization, 'id' | 'createdAt' | 'updatedAt'>): Promise<Organization> {
        const organizations = getStorage<Organization>('organizations');
        const newOrg: Organization = {
            ...org,
            id: generateId(),
            createdAt: new Date(),
            updatedAt: new Date(),
        };
        organizations.push(newOrg);
        setStorage('organizations', organizations);
        return newOrg;
    }

    async getOrganization(id: string): Promise<Organization | null> {
        const organizations = getStorage<Organization>('organizations');
        return organizations.find(o => o.id === id) || null;
    }

    async updateOrganization(id: string, updates: Partial<Organization>): Promise<Organization> {
        const organizations = getStorage<Organization>('organizations');
        const index = organizations.findIndex(o => o.id === id);
        if (index === -1) throw new Error('Organization not found');
        organizations[index] = { ...organizations[index], ...updates, updatedAt: new Date() };
        setStorage('organizations', organizations);
        return organizations[index];
    }

    async deleteOrganization(id: string): Promise<void> {
        const organizations = getStorage<Organization>('organizations');
        setStorage('organizations', organizations.filter(o => o.id !== id));
    }

    // Users
    async createUser(user: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> {
        const users = getStorage<User>('users');
        const newUser: User = {
            ...user,
            id: generateId(),
            createdAt: new Date(),
            updatedAt: new Date(),
        };
        users.push(newUser);
        setStorage('users', users);
        return newUser;
    }

    async getUser(id: string): Promise<User | null> {
        const users = getStorage<User>('users');
        return users.find(u => u.id === id) || null;
    }

    async getUserByEmail(email: string): Promise<User | null> {
        const users = getStorage<User>('users');
        return users.find(u => u.email.toLowerCase() === email.toLowerCase()) || null;
    }

    async updateUser(id: string, updates: Partial<User>): Promise<User> {
        const users = getStorage<User>('users');
        const index = users.findIndex(u => u.id === id);
        if (index === -1) throw new Error('User not found');
        users[index] = { ...users[index], ...updates, updatedAt: new Date() };
        setStorage('users', users);
        return users[index];
    }

    async deleteUser(id: string): Promise<void> {
        const users = getStorage<User>('users');
        setStorage('users', users.filter(u => u.id !== id));
    }

    async getUsersByOrganization(orgId: string): Promise<User[]> {
        const users = getStorage<User>('users');
        return users.filter(u => u.organizationId === orgId);
    }

    // Campaigns
    async createCampaign(campaign: Omit<Campaign, 'id' | 'createdAt' | 'updatedAt'>): Promise<Campaign> {
        const campaigns = getStorage<Campaign>('campaigns');
        const newCampaign: Campaign = {
            ...campaign,
            id: generateId(),
            createdAt: new Date(),
            updatedAt: new Date(),
        };
        campaigns.push(newCampaign);
        setStorage('campaigns', campaigns);
        return newCampaign;
    }

    async getCampaign(id: string): Promise<Campaign | null> {
        const campaigns = getStorage<Campaign>('campaigns');
        return campaigns.find(c => c.id === id) || null;
    }

    async getCampaignsByOrganization(orgId: string, options?: QueryOptions): Promise<PaginatedResult<Campaign>> {
        const campaigns = getStorage<Campaign>('campaigns');
        const filtered = campaigns.filter(c => c.organizationId === orgId);
        const page = options?.page || 1;
        const pageSize = options?.pageSize || 10;
        const start = (page - 1) * pageSize;
        const items = filtered.slice(start, start + pageSize);
        return {
            items,
            total: filtered.length,
            page,
            pageSize,
            hasMore: start + pageSize < filtered.length,
        };
    }

    async updateCampaign(id: string, updates: Partial<Campaign>): Promise<Campaign> {
        const campaigns = getStorage<Campaign>('campaigns');
        const index = campaigns.findIndex(c => c.id === id);
        if (index === -1) throw new Error('Campaign not found');
        campaigns[index] = { ...campaigns[index], ...updates, updatedAt: new Date() };
        setStorage('campaigns', campaigns);
        return campaigns[index];
    }

    async deleteCampaign(id: string): Promise<void> {
        const campaigns = getStorage<Campaign>('campaigns');
        setStorage('campaigns', campaigns.filter(c => c.id !== id));
    }

    // Content
    async createContent(content: Omit<ContentItem, 'id' | 'createdAt' | 'updatedAt'>): Promise<ContentItem> {
        const contents = getStorage<ContentItem>('content_items');
        const newContent: ContentItem = {
            ...content,
            id: generateId(),
            createdAt: new Date(),
            updatedAt: new Date(),
        };
        contents.push(newContent);
        setStorage('content_items', contents);
        return newContent;
    }

    async getContent(id: string): Promise<ContentItem | null> {
        const contents = getStorage<ContentItem>('content_items');
        return contents.find(c => c.id === id) || null;
    }

    async getContentByCampaign(campaignId: string, options?: QueryOptions): Promise<PaginatedResult<ContentItem>> {
        const contents = getStorage<ContentItem>('content_items');
        const filtered = contents.filter(c => c.campaignId === campaignId);
        const page = options?.page || 1;
        const pageSize = options?.pageSize || 10;
        const start = (page - 1) * pageSize;
        const items = filtered.slice(start, start + pageSize);
        return {
            items,
            total: filtered.length,
            page,
            pageSize,
            hasMore: start + pageSize < filtered.length,
        };
    }

    async getContentByOrganization(orgId: string, options?: QueryOptions): Promise<PaginatedResult<ContentItem>> {
        const contents = getStorage<ContentItem>('content_items');
        const filtered = contents.filter(c => c.organizationId === orgId);
        const page = options?.page || 1;
        const pageSize = options?.pageSize || 10;
        const start = (page - 1) * pageSize;
        const items = filtered.slice(start, start + pageSize);
        return {
            items,
            total: filtered.length,
            page,
            pageSize,
            hasMore: start + pageSize < filtered.length,
        };
    }

    async updateContent(id: string, updates: Partial<ContentItem>): Promise<ContentItem> {
        const contents = getStorage<ContentItem>('content_items');
        const index = contents.findIndex(c => c.id === id);
        if (index === -1) throw new Error('Content not found');
        contents[index] = { ...contents[index], ...updates, updatedAt: new Date() };
        setStorage('content_items', contents);
        return contents[index];
    }

    async deleteContent(id: string): Promise<void> {
        const contents = getStorage<ContentItem>('content_items');
        setStorage('content_items', contents.filter(c => c.id !== id));
    }

    // Usage
    async getUsage(orgId: string, month: string): Promise<UsageRecord | null> {
        const usages = getStorage<UsageRecord>('usage_records');
        return usages.find(u => u.organizationId === orgId && u.month === month) || null;
    }

    async incrementUsage(orgId: string, field: keyof Pick<UsageRecord, 'contentGenerated' | 'apiCalls'>): Promise<void> {
        const usages = getStorage<UsageRecord>('usage_records');
        const month = new Date().toISOString().slice(0, 7);
        let usage = usages.find(u => u.organizationId === orgId && u.month === month);

        if (!usage) {
            usage = {
                id: generateId(),
                organizationId: orgId,
                month,
                contentGenerated: 0,
                platformPosts: { wordpress: 0, youtube: 0, instagram: 0, facebook: 0 },
                apiCalls: 0,
                storageUsedMB: 0,
                createdAt: new Date(),
                updatedAt: new Date(),
            };
            usages.push(usage);
        }

        const index = usages.findIndex(u => u.id === usage!.id);
        usages[index][field]++;
        usages[index].updatedAt = new Date();
        setStorage('usage_records', usages);
    }

    // Activity Logs
    async logActivity(log: Omit<ActivityLog, 'id' | 'createdAt'>): Promise<ActivityLog> {
        const logs = getStorage<ActivityLog>('activity_logs');
        const newLog: ActivityLog = {
            ...log,
            id: generateId(),
            createdAt: new Date(),
        };
        logs.push(newLog);
        // Keep only last 1000 logs
        if (logs.length > 1000) {
            logs.splice(0, logs.length - 1000);
        }
        setStorage('activity_logs', logs);
        return newLog;
    }

    async getActivityLogs(orgId: string, options?: QueryOptions): Promise<PaginatedResult<ActivityLog>> {
        const logs = getStorage<ActivityLog>('activity_logs');
        const filtered = logs.filter(l => l.organizationId === orgId).reverse();
        const page = options?.page || 1;
        const pageSize = options?.pageSize || 20;
        const start = (page - 1) * pageSize;
        const items = filtered.slice(start, start + pageSize);
        return {
            items,
            total: filtered.length,
            page,
            pageSize,
            hasMore: start + pageSize < filtered.length,
        };
    }
}

// ==========================================
// SMART DATABASE SELECTOR
// ==========================================
// Automatically selects the appropriate database implementation:
// - Server-side with DATABASE_URL: Uses Prisma (PostgreSQL)
// - Browser/Demo mode: Uses localStorage

// Note: PrismaDatabase import is done dynamically to avoid issues on client-side

// Environment checks
const isServer = typeof window === 'undefined';
const hasDatabaseUrl = process.env.DATABASE_URL && !process.env.DATABASE_URL.includes('localhost:5432/digitalmeng?schema=public');
const isDemoMode = process.env.DEMO_MODE === 'true' || process.env.NEXT_PUBLIC_DEMO_MODE === 'true';

/**
 * Get the appropriate database client based on environment
 * - Production (server + DATABASE_URL): Prisma
 * - Demo mode or browser: LocalStorage
 */
function getDatabaseClient(): DatabaseClient {
    // In demo mode, always use localStorage for simplicity
    if (isDemoMode && !isServer) {
        return new LocalStorageDatabase();
    }

    // On server with real database URL, use Prisma
    if (isServer && hasDatabaseUrl) {
        // Dynamic import to avoid Prisma issues on client-side
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const { prismaDb } = require('./prismaClient');
        return prismaDb;
    }

    // Default to localStorage for development/browser
    return new LocalStorageDatabase();
}

// Export the smart database instance
export const db = getDatabaseClient();

