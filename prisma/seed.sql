-- =============================================================================
-- DIGITALMENG DATABASE - COMPREHENSIVE SEED DATA
-- Execute this in Neon SQL Editor to create realistic demo data
-- =============================================================================

DO $$
DECLARE
    -- User IDs
    admin_id TEXT := 'user_admin_' || floor(extract(epoch from now()) * 1000)::TEXT;
    owner_id TEXT := 'user_owner_' || floor(extract(epoch from now()) * 1000)::TEXT;
    editor1_id TEXT := 'user_editor1_' || floor(extract(epoch from now()) * 1000)::TEXT;
    editor2_id TEXT := 'user_editor2_' || floor(extract(epoch from now()) * 1000)::TEXT;
    viewer_id TEXT := 'user_viewer_' || floor(extract(epoch from now()) * 1000)::TEXT;
    
    -- Organization IDs
    org1_id TEXT := 'org_main_' || floor(extract(epoch from now()) * 1000)::TEXT;
    org2_id TEXT := 'org_agency_' || floor(extract(epoch from now()) * 1000)::TEXT;
    
    -- Campaign IDs
    campaign1_id TEXT := 'camp_ai_marketing_' || floor(extract(epoch from now()) * 1000)::TEXT;
    campaign2_id TEXT := 'camp_social_media_' || floor(extract(epoch from now()) * 1000)::TEXT;
    campaign3_id TEXT := 'camp_seo_boost_' || floor(extract(epoch from now()) * 1000)::TEXT;
    
    -- Topic Pillar IDs
    pillar1_id TEXT := 'pillar_ai_strategies_' || floor(extract(epoch from now()) * 1000)::TEXT;
    pillar2_id TEXT := 'pillar_content_marketing_' || floor(extract(epoch from now()) * 1000)::TEXT;
    pillar3_id TEXT := 'pillar_social_trends_' || floor(extract(epoch from now()) * 1000)::TEXT;
    
    -- Content IDs
    content_counter INTEGER := 0;
BEGIN
    RAISE NOTICE 'Creating comprehensive seed data...';
    
    -- =============================================
    -- 1. CREATE USERS (5 users with different roles)
    -- =============================================
    RAISE NOTICE 'Creating users...';
    
    -- Super Admin
    INSERT INTO "users" VALUES (
        admin_id, 'admin@digitalmeng.com', 'Super Admin',
        '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
        'email', NULL, 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin',
        'superadmin', NULL, NOW(), true, NOW(), NOW()
    );
    
    -- Organization Owner
    INSERT INTO "users" VALUES (
        owner_id, 'owner@demoagency.com', 'John Smith',
        '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
        'email', NULL, 'https://api.dicebear.com/7.x/avataaars/svg?seed=john',
        'owner', NULL, NOW() - INTERVAL '2 days', true, NOW() - INTERVAL '30 days', NOW()
    );
    
    -- Content Editors
    INSERT INTO "users" VALUES (
        editor1_id, 'sarah@demoagency.com', 'Sarah Johnson',
        '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
        'google', 'google_12345', 'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah',
        'editor', NULL, NOW() - INTERVAL '1 day', true, NOW() - INTERVAL '25 days', NOW()
    );
    
    INSERT INTO "users" VALUES (
        editor2_id, 'mike@demoagency.com', 'Mike Chen',
        '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
        'email', NULL, 'https://api.dicebear.com/7.x/avataaars/svg?seed=mike',
        'editor', NULL, NOW() - INTERVAL '3 hours', true, NOW() - INTERVAL '20 days', NOW()
    );
    
    -- Viewer
    INSERT INTO "users" VALUES (
        viewer_id, 'viewer@demoagency.com', 'Emma Davis',
        '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
        'email', NULL, 'https://api.dicebear.com/7.x/avataaars/svg?seed=emma',
        'viewer', NULL, NOW() - INTERVAL '5 hours', true, NOW() - INTERVAL '15 days', NOW()
    );
    
    -- =============================================
    -- 2. CREATE ORGANIZATIONS (2 organizations)
    -- =============================================
    RAISE NOTICE 'Creating organizations...';
    
    -- Main Organization (Pro Plan with Trial)
    INSERT INTO "organizations" VALUES (
        org1_id, 'Digital Marketing Agency', 'digital-marketing-agency', owner_id, 'pro',
        'stripe_cus_main123', 'stripe_sub_main123',
        'Digital Marketing Pro', 'https://digitalmarketingpro.com',
        'https://digitalmarketingpro.com/logo.png', '#8B5CF6', 'America/New_York', 'en',
        true, true, NOW() - INTERVAL '5 days', NOW() + INTERVAL '10 days',
        NOW() - INTERVAL '30 days', NOW()
    );
    
    -- Secondary Organization (Starter Plan)
    INSERT INTO "organizations" VALUES (
        org2_id, 'Creative Content Studio', 'creative-content-studio', admin_id, 'starter',
        NULL, NULL, 'Creative Studio', 'https://creativestudio.com', NULL,
        '#3B82F6', 'UTC', 'en', true, false, NULL, NULL,
        NOW() - INTERVAL '60 days', NOW()
    );
    
    -- Update users to belong to organizations
    UPDATE "users" SET "organizationId" = org1_id WHERE "id" IN (owner_id, editor1_id, editor2_id, viewer_id);
    UPDATE "users" SET "organizationId" = org1_id WHERE "id" = admin_id;
    
    -- =============================================
    -- 3. CREATE ORGANIZATION MEMBERS
    -- =============================================
    RAISE NOTICE 'Creating organization members...';
    
    INSERT INTO "organization_members" VALUES
    ('member_1', org1_id, owner_id, 'owner', owner_id, NOW() - INTERVAL '30 days', NOW() - INTERVAL '30 days', 'active'),
    ('member_2', org1_id, editor1_id, 'editor', owner_id, NOW() - INTERVAL '25 days', NOW() - INTERVAL '25 days', 'active'),
    ('member_3', org1_id, editor2_id, 'editor', owner_id, NOW() - INTERVAL '20 days', NOW() - INTERVAL '20 days', 'active'),
    ('member_4', org1_id, viewer_id, 'viewer', owner_id, NOW() - INTERVAL '15 days', NOW() - INTERVAL '15 days', 'active');
    
    -- =============================================
    -- 4. CREATE CAMPAIGNS (3 campaigns)
    -- =============================================
    RAISE NOTICE 'Creating campaigns...';
    
    -- Active AI Marketing Campaign
    INSERT INTO "campaigns" VALUES (
        campaign1_id, org1_id, 'AI Marketing Revolution 2026', 
        'Comprehensive campaign leveraging AI for content creation and optimization',
        'active', owner_id,
        'https://digitalmarketingpro.com', 'B2B SaaS companies, Digital marketers',
        'Marketing Technology',
        ARRAY['AI marketing', 'content automation', 'SEO', 'social media', 'lead generation'],
        15, 25, 40, true, true, true, true, false, true,
        ARRAY['Monday', 'Wednesday', 'Friday'], ARRAY['09:00', '14:00', '17:00'], 'America/New_York',
        45, 32, 8, 12500, 3400, 15,
        NOW() - INTERVAL '25 days', NOW()
    );
    
    -- Active Social Media Campaign
    INSERT INTO "campaigns" VALUES (
        campaign2_id, org1_id, 'Social Media Domination',
        'Cross-platform social media presence with viral content strategies',
        'active', editor1_id,
        'https://digitalmarketingpro.com', 'Gen Z, Millennials, Social media managers',
        'Social Media Marketing',
        ARRAY['viral content', 'Instagram', 'TikTok', 'engagement', 'influencer'],
        20, 30, 45, false, true, true, true, true, false,
        ARRAY['Tuesday', 'Thursday', 'Saturday'], ARRAY['11:00', '15:00', '19:00'], 'America/New_York',
        28, 24, 4, 8900, 5200, 8,
        NOW() - INTERVAL '15 days', NOW()
    );
    
    -- Draft SEO Campaign
    INSERT INTO "campaigns" VALUES (
        campaign3_id, org1_id, 'SEO Boost Initiative',
        'Long-tail keyword targeting and technical SEO improvements',
        'draft', editor2_id,
        'https://digitalmarketingpro.com', 'E-commerce stores, Local businesses',
        'SEO & Content Marketing',
        ARRAY['long-tail keywords', 'technical SEO', 'backlinks', 'SERP ranking'],
        10, 15, 25, true, false, false, false, false, true,
        ARRAY['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'], ARRAY['10:00'], 'America/New_York',
        0, 0, 0, 0, 0, 0,
        NOW() - INTERVAL '3 days', NOW()
    );
    
    -- =============================================
    -- 5. CREATE TOPIC PILLARS
    -- =============================================
    RAISE NOTICE 'Creating topic pillars...';
    
    INSERT INTO "topic_pillars" VALUES
    (pillar1_id, org1_id, campaign1_id, 'AI Marketing Strategies',
     'Content about implementing AI in marketing workflows',
     ARRAY['AI tools', 'automation', 'machine learning', 'personalization'], 15, true, NOW() - INTERVAL '20 days', NOW()),
    
    (pillar2_id, org1_id, campaign1_id, 'Content Marketing Best Practices',
     'Proven strategies for creating engaging content',
     ARRAY['storytelling', 'content calendar', 'audience research', 'ROI'], 18, true, NOW() - INTERVAL '18 days', NOW()),
    
    (pillar3_id, org1_id, campaign2_id, 'Social Media Trends 2026',
     'Latest trends and emerging platforms in social media',
     ARRAY['TikTok', 'Instagram Reels', 'short-form video', 'viral hooks'], 12, true, NOW() - INTERVAL '12 days', NOW());
    
    -- =============================================
    -- 6. CREATE CONTENT ITEMS (15 items)
    -- =============================================
    RAISE NOTICE 'Creating content items...';
    
    -- Published Blog Posts
    FOR i IN 1..5 LOOP
        content_counter := content_counter + 1;
        INSERT INTO "content_items" (
            "id", "organizationId", "campaignId", "title", "content", "type", "status",
            "topicPillarId", "seoScore", "wordCount", "readingTime", "keywords", "targetKeyword",
            "hashtags", "aiModel", "views", "engagement", "shares", "comments",
            "scheduledFor", "publishedAt", "publishedUrl", "createdBy", "approvedBy",
            "createdAt", "updatedAt"
        ) VALUES (
            'content_blog_' || content_counter,
            org1_id, campaign1_id,
            'AI Marketing Strategy Guide #' || i,
            E'# Complete Guide to AI Marketing\n\nArtificial Intelligence is revolutionizing digital marketing...\n\n## Key Benefits\n- Automation\n- Personalization\n- Data-driven insights\n\n[Full content would be here - 1500+ words]',
            'blog', 'published', pillar1_id,
            85 + (i * 2), 1500 + (i * 100), 7 + i,
            ARRAY['AI marketing', 'automation', 'digital strategy'],
            'AI marketing tools',
            ARRAY['#AIMarketing', '#DigitalTransformation', '#MarketingTech'],
            'gpt-4', 450 + (i * 150), 45 + (i * 10), 12 + (i * 3), 8 + i,
            NOW() - INTERVAL (10 + i) || ' days',
            NOW() - INTERVAL (10 + i) || ' days',
            'https://digitalmarketingpro.com/blog/ai-marketing-' || i,
            editor1_id, owner_id,
            NOW() - INTERVAL (12 + i) || ' days', NOW() - INTERVAL (10 + i) || ' days'
        );
    END LOOP;
    
    -- Published Instagram Reels
    FOR i IN 1..4 LOOP
        content_counter := content_counter + 1;
        INSERT INTO "content_items" (
            "id", "organizationId", "campaignId", "title", "content", "type", "status",
            "topicPillarId", "seoScore", "wordCount", "readingTime", "keywords",
            "hashtags", "aiModel", "views", "engagement", "shares", "comments",
            "publishedAt", "publishedUrl", "createdBy", "approvedBy",
            "createdAt", "updatedAt"
        ) VALUES (
            'content_reel_' || content_counter,
            org1_id, campaign2_id,
            '5 Social Media Hacks - Reel #' || i,
            E'[Video Script]\n\nHook: Stop scrolling! Here are 5 social media hacks...\n\nPoint 1: Use trending audio\nPoint 2: Post at optimal times\n...',
            'instagram_reel', 'published', pillar3_id,
            0, 150, 1,
            ARRAY['social media', 'marketing hacks', 'viral content'],
            ARRAY['#SocialMediaTips', '#MarketingHacks', '#ViralContent', '#InstagramGrowth'],
            'gpt-4', 15000 + (i * 5000), 1200 + (i * 400), 850 + (i * 200), 120 + (i * 30),
            NOW() - INTERVAL (5 + i) || ' days',
            'https://instagram.com/p/reel' || i,
            editor2_id, editor1_id,
            NOW() - INTERVAL (6 + i) || ' days', NOW() - INTERVAL (5 + i) || ' days'
        );
    END LOOP;
    
    -- Scheduled Content
    FOR i IN 1..3 LOOP
        content_counter := content_counter + 1;
        INSERT INTO "content_items" (
            "id", "organizationId", "campaignId", "title", "content", "type", "status",
            "topicPillarId", "seoScore", "wordCount", "keywords",
            "scheduledFor", "createdBy", "approvedBy", "createdAt", "updatedAt"
        ) VALUES (
            'content_scheduled_' || content_counter,
            org1_id, campaign1_id,
            'Upcoming: Content Marketing Trends ' || (2026 + i),
            'Comprehensive analysis of upcoming trends in content marketing...',
            'blog', 'scheduled', pillar2_id,
            88, 1800, ARRAY['content marketing', 'trends', 'future'],
            NOW() + INTERVAL i || ' days',
            editor1_id, owner_id,
            NOW() - INTERVAL '2 days', NOW()
        );
    END LOOP;
    
    -- Pending Approval Content
    FOR i IN 1..3 LOOP
        content_counter := content_counter + 1;
        INSERT INTO "content_items" (
            "id", "organizationId", "campaignId", "title", "content", "type", "status",
            "topicPillarId", "seoScore", "wordCount", "keywords",
            "createdBy", "createdAt", "updatedAt"
        ) VALUES (
            'content_pending_' || content_counter,
            org1_id, campaign2_id,
            'Draft: Social Platform Update #' || i,
            'Latest updates and features on major social platforms...',
            'linkedin_post', 'pending', pillar3_id,
            78, 500, ARRAY['social media', 'platform updates', 'features'],
            editor2_id,
            NOW() - INTERVAL i || ' hours', NOW()
        );
    END LOOP;
    
    -- =============================================
    -- 7. CREATE PLATFORM CONNECTIONS
    -- =============================================
    RAISE NOTICE 'Creating platform connections...';
    
    INSERT INTO "platform_connections" VALUES
    ('platform_wordpress', org1_id, 'wordpress', 'Company Blog', 'connected',
     'encrypted_token_wp', NULL, NULL, NULL, NOW() + INTERVAL '30 days',
     'wp_123', 'Digital Marketing Pro Blog', 'https://digitalmarketingpro.com/blog',
     NULL, 45, NOW() - INTERVAL '1 hour', NOW() - INTERVAL '25 days', NOW()),
     
    ('platform_instagram', org1_id, 'instagram', '@digitalmarketingpro', 'connected',
     'encrypted_token_ig', 'encrypted_refresh_ig', NULL, NULL, NOW() + INTERVAL '60 days',
     'ig_567890', 'Digital Marketing Pro', 'https://instagram.com/digitalmarketingpro',
     12500, 234, NOW() - INTERVAL '30 minutes', NOW() - INTERVAL '20 days', NOW()),
     
    ('platform_youtube', org1_id, 'youtube', 'Marketing Pro Channel', 'connected',
     'encrypted_token_yt', NULL, NULL, NULL, NOW() + INTERVAL '90 days',
     'yt_channel_123', 'Marketing Pro', 'https://youtube.com/@marketingpro',
     8900, 67, NOW() - INTERVAL '2 hours', NOW() - INTERVAL '18 days', NOW()),
     
    ('platform_linkedin', org1_id, 'linkedin', 'Company Page', 'expired',
     NULL, NULL, NULL, NULL, NOW() - INTERVAL '5 days',
     'li_company_456', 'Digital Marketing Agency', NULL, 3400, 89,
     NOW() - INTERVAL '10 days', NOW() - INTERVAL '15 days', NOW());
    
    -- =============================================
    -- 8. CREATE AI AGENTS
    -- =============================================
    RAISE NOTICE 'Creating AI agents...';
    
    INSERT INTO "ai_agents" VALUES
    ('agent_supervisor_' || org1_id, org1_id, 'supervisor', 'Content Supervisor', 'working',
     NOW() - INTERVAL '15 minutes', 125, 'Analyzing campaign performance',
     true, '0 */6 * * *', 5, 'high', 'gpt-4', NULL, NOW() - INTERVAL '25 days', NOW()),
     
    ('agent_seo_' || org1_id, org1_id, 'seo_worker', 'SEO Specialist', 'idle',
     NOW() - INTERVAL '2 hours', 98, NULL,
     true, '0 8 * * *', 3, 'medium', 'gpt-4', 'Focus on long-tail keywords and semantic search',
     NOW() - INTERVAL '25 days', NOW()),
     
    ('agent_social_' || org1_id, org1_id, 'social_worker', 'Social Media Worker', 'idle',
     NOW() - INTERVAL '45 minutes', 156, NULL,
     true, '0 */4 * * *', 3, 'medium', 'gpt-4', 'Optimize for engagement and virality',
     NOW() - INTERVAL '25 days', NOW()),
     
    ('agent_risk_' || org1_id, org1_id, 'risk_worker', 'Risk Analyzer', 'working',
     NOW() - INTERVAL '5 minutes', 34, 'Scanning for content quality issues',
     true, '0 */12 * * *', 2, 'medium', 'gpt-4', NULL, NOW() - INTERVAL '25 days', NOW()),
     
    ('agent_video_' || org1_id, org1_id, 'video_worker', 'Video Content Creator', 'idle',
     NOW() - INTERVAL '6 hours', 23, NULL,
     true, '0 10 * * 1,3,5', 1, 'low', 'gpt-4', NULL, NOW() - INTERVAL '25 days', NOW()),
     
    ('agent_analytics_' || org1_id, org1_id, 'analytics_worker', 'Analytics Worker', 'idle',
     NOW() - INTERVAL '1 hour', 67, NULL,
     true, '0 */6 * * *', 2, 'medium', 'gpt-4', NULL, NOW() - INTERVAL '25 days', NOW()),
     
    ('agent_geo_' || org1_id, org1_id, 'geo_worker', 'GEO Optimizer', 'idle',
     NOW() - INTERVAL '3 hours', 45, NULL,
     true, '0 9 * * *', 2, 'medium', 'gpt-4', 'Optimize for generative AI search engines',
     NOW() - INTERVAL '25 days', NOW());
    
    -- =============================================
    -- 9. CREATE RISK ALERTS
    -- =============================================
    RAISE NOTICE 'Creating risk alerts...';
    
    INSERT INTO "risk_alerts" VALUES
    ('alert_1', org1_id, campaign1_id, 'velocity', 'medium',
     'Content Velocity Below Target',
     'Current publishing rate is 20% below the planned velocity for Month 1',
     'Increase content production or adjust velocity targets to maintain campaign momentum',
     'active', NULL, NULL, NOW() - INTERVAL '2 days'),
     
    ('alert_2', org1_id, campaign2_id, 'quality', 'low',
     'Minor SEO Score Variance',
     'Recent content items showing slight decrease in average SEO scores (82 vs target 85)',
     'Review keyword targeting and optimize on-page SEO elements',
     'acknowledged', NULL, NULL, NOW() - INTERVAL '5 days'),
     
    ('alert_3', org1_id, campaign1_id, 'indexation', 'high',
     'Indexation Delay Detected',
     '3 blog posts published 7+ days ago not yet indexed by Google',
     'Submit sitemap, check robots.txt, and consider using Google Search Console URL inspection',
     'active', NULL, NULL, NOW() - INTERVAL '1 day');
    
    -- =============================================
    -- 10. CREATE SUBSCRIPTIONS
    -- =============================================
    RAISE NOTICE 'Creating subscriptions...';
    
    INSERT INTO "subscriptions" VALUES
    ('sub_1', org1_id, 'stripe_sub_main123', 'stripe_cus_main123',
     'pro', 'trialing',
     NOW() - INTERVAL '5 days', NOW() + INTERVAL '25 days',
     false, NOW() + INTERVAL '10 days',
     NOW() - INTERVAL '5 days', NOW());
    
    -- =============================================
    -- 11. CREATE USAGE RECORDS
    -- =============================================
    RAISE NOTICE 'Creating usage records...';
    
    INSERT INTO "usage_records" VALUES
    ('usage_current_' || org1_id, org1_id, TO_CHAR(NOW(), 'YYYY-MM'),
     45, 32, 4, 24, 0, 0, 0,
     523, 2400, 12, 25000, 850, 15,
     NOW() - INTERVAL '5 days', NOW()),
     
    ('usage_last_' || org1_id, org1_id, TO_CHAR(NOW() - INTERVAL '1 month', 'YYYY-MM'),
     38, 28, 3, 18, 0, 0, 0,
     412, 1850, 8, 18000, 620, 10,
     NOW() - INTERVAL '35 days', NOW() - INTERVAL '5 days');
    
    -- =============================================
    -- 12. CREATE ACTIVITY LOGS (Sample)
    -- =============================================
    RAISE NOTICE 'Creating activity logs...';
    
    INSERT INTO "activity_logs" VALUES
    ('log_1', org1_id, owner_id, 'campaign.created', 'campaign', campaign1_id,
     '{"campaign_name": "AI Marketing Revolution 2026"}', '192.168.1.100', 'Mozilla/5.0...',
     NOW() - INTERVAL '25 days'),
     
    ('log_2', org1_id, editor1_id, 'content.published', 'content', 'content_blog_1',
     '{"title": "AI Marketing Strategy Guide #1", "type": "blog"}', '192.168.1.101', 'Mozilla/5.0...',
     NOW() - INTERVAL '12 days'),
     
    ('log_3', org1_id, editor2_id, 'content.created', 'content', 'content_reel_1',
     '{"title": "5 Social Media Hacks - Reel #1", "type": "instagram_reel"}', '192.168.1.102', 'Mozilla/5.0...',
     NOW() - INTERVAL '6 days'),
     
    ('log_4', org1_id, owner_id, 'platform.connected', 'platform', 'platform_wordpress',
     '{"platform": "wordpress", "name": "Company Blog"}', '192.168.1.100', 'Mozilla/5.0...',
     NOW() - INTERVAL '25 days');
    
    -- =============================================
    -- SUMMARY
    -- =============================================
    RAISE NOTICE '';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'COMPREHENSIVE SEED DATA CREATED!';
    RAISE NOTICE '========================================';
    RAISE NOTICE '';
    RAISE NOTICE 'USERS (5):';
    RAISE NOTICE '  Super Admin: admin@digitalmeng.com / Admin@123';
    RAISE NOTICE '  Owner: owner@demoagency.com / Admin@123';
    RAISE NOTICE '  Editor 1: sarah@demoagency.com / Admin@123';
    RAISE NOTICE '  Editor 2: mike@demoagency.com / Admin@123';
    RAISE NOTICE '  Viewer: viewer@demoagency.com / Admin@123';
    RAISE NOTICE '';
    RAISE NOTICE 'ORGANIZATIONS (2):';
    RAISE NOTICE '  - Digital Marketing Agency (Pro, Trial)';
    RAISE NOTICE '  - Creative Content Studio (Starter)';
    RAISE NOTICE '';
    RAISE NOTICE 'CAMPAIGNS (3):';
    RAISE NOTICE '  - AI Marketing Revolution (Active, 45 content items)';
    RAISE NOTICE '  - Social Media Domination (Active, 28 content items)';
    RAISE NOTICE '  - SEO Boost Initiative (Draft, 0 content items)';
    RAISE NOTICE '';
    RAISE NOTICE 'CONTENT ITEMS (15):';
    RAISE NOTICE '  - 5 Published Blog Posts';
    RAISE NOTICE '  - 4 Published Instagram Reels';
    RAISE NOTICE '  - 3 Scheduled Posts';
    RAISE NOTICE '  - 3 Pending Approval';
    RAISE NOTICE '';
    RAISE NOTICE 'PLATFORM CONNECTIONS (4):';
    RAISE NOTICE '  - WordPress (Connected)';
    RAISE NOTICE '  - Instagram (Connected)';
    RAISE NOTICE '  - YouTube (Connected)';
    RAISE NOTICE '  - LinkedIn (Expired)';
    RAISE NOTICE '';
    RAISE NOTICE 'AI AGENTS: 7 agents initialized';
    RAISE NOTICE 'RISK ALERTS: 3 active/acknowledged alerts';
    RAISE NOTICE 'TOPIC PILLARS: 3 pillar themes';
    RAISE NOTICE '';
    RAISE NOTICE '========================================';
END $$;

-- Final verification query
SELECT 
    (SELECT COUNT(*) FROM "users") as users,
    (SELECT COUNT(*) FROM "organizations") as organizations,
    (SELECT COUNT(*) FROM "campaigns") as campaigns,
    (SELECT COUNT(*) FROM "content_items") as content_items,
    (SELECT COUNT(*) FROM "topic_pillars") as topic_pillars,
    (SELECT COUNT(*) FROM "platform_connections") as platforms,
    (SELECT COUNT(*) FROM "ai_agents") as ai_agents,
    (SELECT COUNT(*) FROM "risk_alerts") as risk_alerts,
    (SELECT COUNT(*) FROM "activity_logs") as activity_logs;
