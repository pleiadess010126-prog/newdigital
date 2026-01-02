// Core Types for the Autonomous Marketing Engine

export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: Date;
  plan?: 'free' | 'starter' | 'pro' | 'enterprise';
  stripeCustomerId?: string;
  organization?: string;
}

export interface OnboardingData {
  websiteUrl: string;
  brandName: string;
  industry: string;
  targetAudience: string;
  uniqueValueProposition: string;

  // Social Media Handles
  socialMedia: {
    youtube?: string;
    instagram?: string;
    facebook?: string;
    twitter?: string;
    linkedin?: string;
  };

  // API Credentials (encrypted in production)
  credentials: {
    wordpress?: {
      url: string;
      username: string;
      appPassword: string;
    };
    meta?: {
      appId: string;
      appSecret: string;
      accessToken: string;
      pageAccessToken?: string;
      instagramAccountId?: string;
      facebookPageId?: string;
      instagramUsername?: string;
      facebookPageName?: string;
    };
    youtube?: {
      apiKey: string;
      channelId: string;
    };
    googleSearchConsole?: {
      siteUrl: string;
      serviceAccountKey: string;
    };
  };
}

export interface Campaign {
  id: string;
  name: string;
  status: 'active' | 'paused' | 'completed';
  createdAt: Date;
  stats: CampaignStats;
  settings: CampaignSettings;
}

export interface CampaignStats {
  totalContent: number;
  publishedThisMonth: number;
  organicTraffic: number;
  trafficGrowth: number;
  avgDwellTime: number;
  indexationRate: number;
  riskScore: number;
}

export interface CampaignSettings {
  velocity: {
    month1: number;
    month2: number;
    month3: number;
  };
  contentTypes: {
    blog: boolean;
    youtube: boolean;
    instagram: boolean;
    facebook: boolean;
  };
  autoPublish: boolean;
  requireApproval: boolean;
}

export interface ContentItem {
  id: string;
  title: string;
  type: 'blog' | 'youtube-short' | 'instagram-reel' | 'facebook-story';
  status: 'draft' | 'pending' | 'approved' | 'published' | 'rejected';
  createdAt: Date;
  scheduledFor?: Date;
  publishedAt?: Date;
  content: string;
  metadata: {
    keywords: string[];
    topicPillar: string;
    targetKeyword?: string;
    seoScore: number;
    wordCount?: number;
    hashtags?: string[];
    estimatedReadTime?: number;
  };
  performance?: {
    views: number;
    engagement: number;
    dwellTime: number;
  };
}

export interface TopicPillar {
  id: string;
  name: string;
  description: string;
  keywords: string[];
  contentCount: number;
  priority: number;
}

export interface RiskAlert {
  id: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  type: 'indexation' | 'bounce-rate' | 'traffic-cliff' | 'spam-signal' | 'velocity';
  message: string;
  detectedAt: Date;
  resolved: boolean;
  recommendation: string;
}

export interface AIAgent {
  id: string;
  name: string;
  type: 'supervisor' | 'seo-worker' | 'social-worker' | 'risk-worker' | 'video-worker' | 'analytics-worker';
  status: 'idle' | 'working' | 'error';
  lastActive: Date;
  tasksCompleted: number;
}

export interface RoadmapItem {
  week: number;
  month: number;
  contentTarget: number;
  topics: string[];
  status: 'upcoming' | 'in-progress' | 'completed';
}
