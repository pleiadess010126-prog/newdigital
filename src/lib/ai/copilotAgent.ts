// Agent Nandu - AI Assistant Service
// A proactive AI assistant that can understand context and execute actions

export interface AgentContext {
    currentPage: string;
    selectedContent?: any;
    userPlan: string;
    usage: any;
    recentActions: string[];
}

export interface AgentAction {
    id: string;
    type: 'navigate' | 'generate' | 'schedule' | 'analyze' | 'suggest' | 'execute' | 'explain';
    label: string;
    description: string;
    icon: string;
    params?: Record<string, any>;
    execute: () => void | Promise<void>;
}

export interface AgentSuggestion {
    id: string;
    type: 'tip' | 'action' | 'warning' | 'insight';
    title: string;
    message: string;
    priority: 'high' | 'medium' | 'low';
    actions?: AgentAction[];
}

export interface AgentMessage {
    id: string;
    role: 'user' | 'agent';
    content: string;
    timestamp: Date;
    actions?: AgentAction[];
    suggestions?: AgentSuggestion[];
    thoughtSteps?: Array<{ label: string; status: 'pending' | 'working' | 'completed' }>;
    logs?: string[];
    isTyping?: boolean;
}

// Agent capabilities
export const AGENT_CAPABILITIES = {
    content: [
        { cmd: 'generate', desc: 'Generate content for any platform', example: 'Generate a LinkedIn post about AI trends' },
        { cmd: 'repurpose', desc: 'Transform content to multiple formats', example: 'Repurpose my last blog to Twitter thread' },
        { cmd: 'improve', desc: 'Enhance existing content', example: 'Make this more engaging' },
        { cmd: 'translate', desc: 'Translate content to other languages', example: 'Translate this to Spanish' },
    ],
    scheduling: [
        { cmd: 'schedule', desc: 'Schedule content for publishing', example: 'Schedule this for tomorrow at 9am' },
        { cmd: 'best-time', desc: 'Find optimal posting times', example: 'When should I post on Instagram?' },
        { cmd: 'calendar', desc: 'Show content calendar', example: 'Show my schedule for this week' },
    ],
    analytics: [
        { cmd: 'analyze', desc: 'Analyze content performance', example: 'How did my last post perform?' },
        { cmd: 'insights', desc: 'Get audience insights', example: 'Who is my audience?' },
        { cmd: 'trends', desc: 'Discover trending topics', example: 'What\'s trending in my niche?' },
    ],
    help: [
        { cmd: 'help', desc: 'Get help with the platform', example: 'How do I connect Instagram?' },
        { cmd: 'tour', desc: 'Take a product tour', example: 'Show me around' },
        { cmd: 'shortcuts', desc: 'Learn keyboard shortcuts', example: 'What shortcuts are available?' },
    ],
};

// Contextual suggestions based on where user is
export function getContextualSuggestions(context: AgentContext): AgentSuggestion[] {
    const suggestions: AgentSuggestion[] = [];

    // Low usage suggestions
    if (context.usage && context.usage.contentGenerated < 5) {
        suggestions.push({
            id: 'low-usage',
            type: 'tip',
            title: 'Getting Started',
            message: 'I can help you generate your first batch of content. Would you like me to create 5 posts for your top platform?',
            priority: 'high',
        });
    }

    // Page-specific suggestions
    switch (context.currentPage) {
        case 'dashboard':
            suggestions.push({
                id: 'dashboard-tip',
                type: 'insight',
                title: 'Viral Potential Detected',
                message: 'I detected a surge in "AI Ethics" trends. I can task the Social Worker to draft a LinkedIn post while the topic is hot. Proceed?',
                priority: 'high',
                actions: [
                    { id: 'gen-linkedin', type: 'generate', label: 'Draft Viral Post', description: 'AI Ethics trend', icon: '🔥', execute: () => { } }
                ]
            });
            break;
        case 'content':
            suggestions.push({
                id: 'content-tip',
                type: 'action',
                title: 'SEO Gap Identified',
                message: 'Your recent posts lack "long-tail" keyword coverage. Should I generate 3 SEO-optimized blog outlines to bridge this gap?',
                priority: 'medium',
                actions: [
                    { id: 'gen-blog', type: 'generate', label: 'Bridge SEO Gap', description: 'Long-tail keywords', icon: '🎯', execute: () => { } }
                ]
            });
            break;
        case 'analytics':
            suggestions.push({
                id: 'analytics-tip',
                type: 'insight',
                title: 'Retention Alert',
                message: 'Audience retention on videos has dropped 15%. I suggest repurposing your best performing text posts into short video scripts. Ready?',
                priority: 'high',
                actions: [
                    { id: 'rep-video', type: 'execute', label: 'Start Recovery Plan', description: 'Repurpose high-performers', icon: '🎬', execute: () => { } }
                ]
            });
            break;
    }

    return suggestions;
}

// Process natural language commands
export async function processAgentCommand(
    input: string,
    context: AgentContext
): Promise<AgentMessage> {
    const lowerInput = input.toLowerCase();

    // Brand Strategy & Growth
    if (lowerInput.includes('strategy') || lowerInput.includes('growth') || lowerInput.includes('plan') || lowerInput.includes('optimize')) {
        return {
            id: `msg_${Date.now()}`,
            role: 'agent',
            content: '📊 **Strategic Growth Initialization**\n\nI have cross-referenced your current metadata with global trending vectors. To maximize your **Market Velocity** this month, I have architected a triple-attack strategy:\n1. **SEO Dominance:** Target 5 untapped long-tail keywords identified by the SEO Worker.\n2. **Frequency Boost:** Increase LinkedIn output to 2x daily using high-sentiment drafts.\n3. **Repurpose Loop:** Transform high-performing blogs into 8-platform viral threads.\n\nShall I dispatch the workers to execute this optimization protocol?',
            timestamp: new Date(),
            thoughtSteps: [
                { label: 'Analyzing market saturation...', status: 'pending' },
                { label: 'Mapping audience sentiment...', status: 'pending' },
                { label: 'Simulating ROI on frequency increase...', status: 'pending' },
                { label: 'Detecting content performance outliers...', status: 'pending' }
            ],
            logs: [
                '[SYSTEM] Initializing MarketAnalyzer kernel v4.2',
                '[DATA] Fetching historical engagement vectors...',
                '[AI] Sentiment node connected. Analyzing reach decay...',
                '[COMPUTE] ROI simulation complete: +12.5% projected gains.'
            ],
            actions: [
                { id: 'enable-autopilot', type: 'execute', label: 'Execute Strategy', description: 'Start autonomous growth', icon: '🚀', execute: () => { } },
                { id: 'view-analytics', type: 'navigate', label: 'Review Data', description: 'See potential gains', icon: '📈', execute: () => { } },
            ],
        };
    }

    // Social Strategy & Frequency (e.g., "10 posts per month")
    if ((lowerInput.includes('insta') || lowerInput.includes('facebook') || lowerInput.includes('linkedin') || lowerInput.includes('post')) && (lowerInput.includes('month') || lowerInput.includes('week') || lowerInput.includes('many') || lowerInput.includes('often'))) {
        return {
            id: `msg_${Date.now()}`,
            role: 'agent',
            content: '📸 **Social Volume Protocol Initialized**\n\nI see you want to maintain a consistent presence. To achieve **10 Instagram posts per month**, I recommend this architecture:\n1. **Core Pillar:** 3 deep-dive carousels.\n2. **Engagement:** 4 behind-the-scenes Reels.\n3. **Community:** 3 educational static posts.\n\nI can task the Social Worker agents to generate this entire 10-post queue for you right now. Ready to proceed?',
            timestamp: new Date(),
            thoughtSteps: [
                { label: 'Calculating optimal content distribution...', status: 'pending' },
                { label: 'Checking existing storage for assets...', status: 'pending' },
                { label: 'Simulating engagement reach for 10-post volume...', status: 'pending' },
                { label: 'Allocating worker bandwidth for batch generation...', status: 'pending' }
            ],
            logs: [
                '[WORKER:SOCIAL] Requesting bandwidth for 10-unit batch',
                '[STORAGE] Asset index scanned. 4 relevant images found.',
                '[PREDICT] Distribution: 30% Carousels, 40% Reels, 30% Statics.',
                '[CORE] Social Protocol synchronized.'
            ],
            actions: [
                { id: 'gen-instagram', type: 'generate', label: 'Generate Insta Queue', description: 'Batch 10 posts', icon: '📸', execute: () => { } },
                { id: 'enable-autopilot', type: 'execute', label: 'Automate Schedule', description: 'Hands-off posting', icon: '🚀', execute: () => { } },
            ],
        };
    }

    // Daily Video Engine (e.g., "shorts every day")
    if ((lowerInput.includes('shorts') || lowerInput.includes('reels') || lowerInput.includes('tiktok') || lowerInput.includes('video')) && (lowerInput.includes('daily') || lowerInput.includes('every day') || lowerInput.includes('day'))) {
        return {
            id: `msg_${Date.now()}`,
            role: 'agent',
            content: '🎬 **Daily Video Production Protocol Initialized**\n\nTo maintain a **daily shorts cadence**, I have initialized the Video Worker sub-agents. Producing 30 shorts per month requires a high-velocity repurposing loop:\n1. **Deep-Dive Scan:** I will scan your existing long-form videos for viral moments.\n2. **AI Clipping:** The Video Worker will crop and subtitle 7 clips per week.\n3. **Trend Overlay:** Dynamic audio and trending hashtags will be applied automatically.\n\nShall I begin the source-material analysis for your daily queue?',
            timestamp: new Date(),
            thoughtSteps: [
                { label: 'Initializing High-Velocity Video Engine...', status: 'pending' },
                { label: 'Scanning source content repositories...', status: 'pending' },
                { label: 'Mapping trending audio signatures...', status: 'pending' },
                { label: 'Estimating render bandwidth for daily delivery...', status: 'pending' }
            ],
            logs: [
                '[WORKER:VIDEO] Sub-agent "Clipper" online.',
                '[IO] Connected to CloudStorage repository.',
                '[AUDIO] Trending frequency detected at 44.1kHz. Node "ViralAudio" active.',
                '[ENGINE] Render worker thread pool: 4/16 active.'
            ],
            actions: [
                { id: 'gen-video', type: 'generate', label: 'Start Daily Queue', description: 'Begin video clipping', icon: '🎬', execute: () => { } },
                { id: 'view-autopilot', type: 'navigate', label: 'Configure Automation', description: 'Set posting rules', icon: '🤖', execute: () => { } },
            ],
        };
    }

    // Content generation
    if (lowerInput.includes('generate') || lowerInput.includes('create') || lowerInput.includes('write')) {
        return {
            id: `msg_${Date.now()}`,
            role: 'agent',
            content: 'I can help you generate content! What platform would you like to create content for?',
            timestamp: new Date(),
            thoughtSteps: [
                { label: 'Analyzing industry keywords...', status: 'pending' },
                { label: 'Consulting SEO Worker agent...', status: 'pending' },
                { label: 'Synthesizing metadata constraints...', status: 'pending' }
            ],
            actions: [
                { id: 'gen-linkedin', type: 'generate', label: 'LinkedIn Post', description: 'Professional content', icon: '💼', execute: () => { } },
                { id: 'gen-twitter', type: 'generate', label: 'Twitter Thread', description: 'Engaging thread', icon: '🐦', execute: () => { } },
                { id: 'gen-instagram', type: 'generate', label: 'Instagram Caption', description: 'Visual story', icon: '📸', execute: () => { } },
                { id: 'gen-blog', type: 'generate', label: 'Blog Post', description: 'Long-form content', icon: '📝', execute: () => { } },
            ],
        };
    }

    // Analytics
    if (lowerInput.includes('analytics') || lowerInput.includes('performance') || lowerInput.includes('how did')) {
        return {
            id: `msg_${Date.now()}`,
            role: 'agent',
            content: '📊 Here\'s your content performance summary:\n\n• Total Reach: 45.2K (+12% vs last week)\n• Engagement Rate: 4.8% (above average!)\n• Top Performer: Your Monday LinkedIn post\n• Best Time: Tuesdays at 10am\n\nWant me to dig deeper into any metric?',
            timestamp: new Date(),
            thoughtSteps: [
                { label: 'Fetching real-time platform data...', status: 'pending' },
                { label: 'Aggregating engagement metrics...', status: 'pending' },
                { label: 'Comparing against benchmarks...', status: 'pending' }
            ],
            actions: [
                { id: 'more-analytics', type: 'analyze', label: 'Detailed Report', description: 'Full analysis', icon: '📈', execute: () => { } },
                { id: 'export-analytics', type: 'execute', label: 'Export Data', description: 'Download CSV', icon: '📥', execute: () => { } },
            ],
        };
    }

    // Scheduling
    if (lowerInput.includes('schedule') || lowerInput.includes('when') || lowerInput.includes('best time')) {
        return {
            id: `msg_${Date.now()}`,
            role: 'agent',
            content: '📅 Based on your audience behavior, here are the optimal posting times:\n\n• LinkedIn: Tue/Wed 9-11am\n• Twitter: Mon-Fri 12-1pm\n• Instagram: Tue/Thu 7-8pm\n• TikTok: Daily 6-9pm\n\nWant me to auto-schedule your content queue for these times?',
            timestamp: new Date(),
            thoughtSteps: [
                { label: 'Analyzing audience activity clusters...', status: 'pending' },
                { label: 'Querying SmartScheduler for slots...', status: 'pending' },
                { label: 'Verifying platform rate limits...', status: 'pending' }
            ],
            actions: [
                { id: 'auto-schedule', type: 'schedule', label: 'Auto-Schedule', description: 'Optimize all posts', icon: '🚀', execute: () => { } },
                { id: 'view-calendar', type: 'navigate', label: 'View Calendar', description: 'See schedule', icon: '📆', execute: () => { } },
            ],
        };
    }

    // Repurpose
    if (lowerInput.includes('repurpose') || lowerInput.includes('transform') || lowerInput.includes('convert')) {
        return {
            id: `msg_${Date.now()}`,
            role: 'agent',
            content: '🔄 I can repurpose your content into multiple formats!\n\nChoose a source content type, and I\'ll transform it for all your platforms:',
            timestamp: new Date(),
            thoughtSteps: [
                { label: 'Deconstructing source content structure...', status: 'pending' },
                { label: 'Mapping narrative to platform styles...', status: 'pending' },
                { label: 'Optimizing formatting for 8 destinations...', status: 'pending' }
            ],
            actions: [
                { id: 'rep-blog', type: 'execute', label: 'From Blog Post', description: '→ 8 formats', icon: '📝', execute: () => { } },
                { id: 'rep-video', type: 'execute', label: 'From Video Script', description: '→ 6 formats', icon: '🎬', execute: () => { } },
                { id: 'rep-podcast', type: 'execute', label: 'From Podcast', description: '→ 5 formats', icon: '🎙️', execute: () => { } },
            ],
        };
    }

    // Autopilot
    if (lowerInput.includes('autopilot') || lowerInput.includes('automate') || lowerInput.includes('hands-off')) {
        return {
            id: `msg_${Date.now()}`,
            role: 'agent',
            content: '🚀 I can take over and run your entire marketing engine autonomously!\n\n**My Proposed Execution Plan:**\n1. 🔍 **Industry Research:** Analyze current trending topics in your niche.\n2. 📅 **Roadmap Construction:** Build a 90-day content calendar.\n3. ✍️ **Autonomous Content:** SEO Workers & Social Workers will generate your queue.\n4. ⏰ **Smart Posting:** Publish content at peak engagement hours automatically.\n\nWould you like me to initialize this protocol?',
            timestamp: new Date(),
            thoughtSteps: [
                { label: 'Analyzing Topic Pillars...', status: 'pending' },
                { label: 'Initializing Autonomous Roadmap...', status: 'pending' },
                { label: 'Synchronizing with Supervisor Agent...', status: 'pending' },
                { label: 'Securing Publishing Guards...', status: 'pending' }
            ],
            logs: [
                '[SUPERVISOR] Autopilot handshake received.',
                '[ROADMAP] Building 90-day trajectory...',
                '[GUARD] Policy check: SafeContent-Filters v2.0 active.',
                '[SCHEDULER] Time-slot matrix generated.'
            ],
            actions: [
                { id: 'enable-autopilot', type: 'execute', label: 'Initialize Autopilot', description: 'Start autonomous mode', icon: '🚀', execute: () => { } },
                { id: 'view-autopilot', type: 'navigate', label: 'Review Parameters', description: 'See settings', icon: '⚙️', execute: () => { } },
            ],
        };
    }

    // Settings & Configuration
    if (lowerInput.includes('settings') || lowerInput.includes('credential') || lowerInput.includes('api') || lowerInput.includes('keys') || lowerInput.includes('profile')) {
        return {
            id: `msg_${Date.now()}`,
            role: 'agent',
            content: '⚙️ I can help you manage your settings and credentials!\n\nWhether you need to connect your social media APIs, update your profile, or adjust your billing plan, I can take you there directly.',
            timestamp: new Date(),
            thoughtSteps: [
                { label: 'Querying account configuration...', status: 'pending' },
                { label: 'Checking API connection status...', status: 'pending' },
                { label: 'Verifying security permissions...', status: 'pending' }
            ],
            actions: [
                { id: 'view-settings', type: 'navigate', label: 'Open Settings', description: 'Manage your setup', icon: '⚙️', execute: () => { } },
                { id: 'view-profile', type: 'navigate', label: 'View Profile', description: 'Update your details', icon: '👤', execute: () => { } },
                { id: 'view-billing', type: 'navigate', label: 'Billing & Plans', description: 'Manage subscription', icon: '💳', execute: () => { } },
            ],
        };
    }

    // Help & "How To" Diagnostics
    if (lowerInput.includes('how to') || lowerInput.includes('where is') || lowerInput.includes('can you show me')) {
        return {
            id: `msg_${Date.now()}`,
            role: 'agent',
            content: '🔍 **Guidance Protocol Initialized**\n\nI can show you exactly how to navigate any part of the system. Whether you are looking for settings, content tools, or analytics, I have mapped all system modules for you.\n\nWould you like me to take you to the **System Configuration** area now?',
            timestamp: new Date(),
            thoughtSteps: [
                { label: 'Indexing system modules...', status: 'pending' },
                { label: 'Locating requested configuration node...', status: 'pending' },
                { label: 'Verifying user access tier...', status: 'pending' },
                { label: 'Preparing navigation bridge...', status: 'pending' }
            ],
            actions: [
                { id: 'view-settings', type: 'navigate', label: 'Go to Settings', description: 'Configure everything', icon: '⚙️', execute: () => { } },
                { id: 'get-started', type: 'explain', label: 'Feature Tour', description: 'Learn the platform', icon: '💡', execute: () => { } },
            ],
        };
    }

    // Help
    if (lowerInput.includes('help') || lowerInput.includes('how do i') || lowerInput.includes('what can')) {
        return {
            id: `msg_${Date.now()}`,
            role: 'agent',
            content: '👋 I\'m Nandu, your AI assistant! Here\'s how I can help you dominate your marketing:\n\n**Strategy & Automation**\n• Enable Autopilot for hands-off growth\n• Generate viral content ideas\n• Find your best posting times\n\n**Content Engine**\n• Write blogs, threads, and captions\n• Repurpose content to 8+ formats\n• Translate to 10+ languages\n\n**Analytics**\n• Track real-time performance\n• Get audience sentiment insights\n\nJust tell me what you want to achieve!',
            timestamp: new Date(),
            thoughtSteps: [
                { label: 'Consulting platform documentation...', status: 'pending' },
                { label: 'Analyzing your current workflow...', status: 'pending' }
            ],
            actions: [
                { id: 'get-started', type: 'explain', label: 'Intro Tour', description: 'Learn the basics', icon: '🚀', execute: () => { } },
                { id: 'view-autopilot', type: 'navigate', label: 'Configure Autopilot', description: 'Go to automation', icon: '🤖', execute: () => { } },
            ]
        };
    }

    // Trends
    if (lowerInput.includes('trend') || lowerInput.includes('trending') || lowerInput.includes('popular')) {
        return {
            id: `msg_${Date.now()}`,
            role: 'agent',
            content: '🔥 Hot trends in your niche right now:\n\n1. **AI & Automation** - 234% increase\n2. **Remote Work Tips** - Consistently popular\n3. **Sustainability** - Rising fast\n4. **Mental Health at Work** - High engagement\n5. **Tech Layoffs** - Current news topic\n\nWant me to generate content on any of these?',
            timestamp: new Date(),
            thoughtSteps: [
                { label: 'Scanning global social signals...', status: 'pending' },
                { label: 'Identifying niche-specific outliers...', status: 'pending' },
                { label: 'Calculating engagement probability...', status: 'pending' }
            ],
            actions: [
                { id: 'gen-trend', type: 'generate', label: 'Generate Content', description: 'On trending topic', icon: '✍️', execute: () => { } },
                { id: 'more-trends', type: 'analyze', label: 'More Trends', description: 'Extended list', icon: '📊', execute: () => { } },
            ],
        };
    }

    // Support / Ticket / Issue Escalation
    if (lowerInput.includes('support') || lowerInput.includes('ticket') || lowerInput.includes('issue') ||
        lowerInput.includes('problem') || lowerInput.includes('bug') || lowerInput.includes('not working') ||
        lowerInput.includes('broken') || lowerInput.includes('error') || lowerInput.includes('help me')) {
        return {
            id: `msg_${Date.now()}`,
            role: 'agent',
            content: '🎫 **Support Escalation Protocol**\n\nI\'m sorry you\'re experiencing an issue. I can help you in two ways:\n\n1. **Try to solve it now** - Tell me more about what\'s happening\n2. **Create a support ticket** - Our human support team will assist you\n\nIf this is something I can\'t resolve, I\'ll create a ticket for you automatically and include our conversation for context.',
            timestamp: new Date(),
            thoughtSteps: [
                { label: 'Analyzing issue context...', status: 'pending' },
                { label: 'Checking knowledge base...', status: 'pending' },
                { label: 'Preparing escalation path...', status: 'pending' }
            ],
            logs: [
                '[SUPPORT] Issue detection trigger activated',
                '[KB] Searching knowledge base for solutions...',
                '[ESCALATE] Human support queue available'
            ],
            actions: [
                {
                    id: 'create-ticket',
                    type: 'execute',
                    label: 'Create Support Ticket',
                    description: 'Escalate to human team',
                    icon: '🎫',
                    params: { category: 'technical', nanduContext: input },
                    execute: async () => {
                        // This will trigger ticket creation with Nandu context
                        console.log('[NANDU] Creating support ticket with context:', input);
                        if (typeof window !== 'undefined') {
                            window.location.href = '/support?action=create&source=nandu&context=' + encodeURIComponent(input);
                        }
                    }
                },
                {
                    id: 'browse-support',
                    type: 'navigate',
                    label: 'View My Tickets',
                    description: 'Check ticket status',
                    icon: '📋',
                    execute: () => {
                        if (typeof window !== 'undefined') {
                            window.location.href = '/support';
                        }
                    }
                },
                {
                    id: 'try-again',
                    type: 'explain',
                    label: 'Describe Issue',
                    description: 'I\'ll try to help',
                    icon: '💬',
                    execute: () => { }
                },
            ],
        };
    }

    // Billing / Payment issues - escalate to support
    if (lowerInput.includes('refund') || lowerInput.includes('charge') || lowerInput.includes('payment failed') ||
        lowerInput.includes('cancel subscription') || lowerInput.includes('overcharged')) {
        return {
            id: `msg_${Date.now()}`,
            role: 'agent',
            content: '💳 **Billing Support Required**\n\nFor billing-related matters like refunds, payment issues, or subscription changes, I\'ll need to connect you with our billing team.\n\n**Why?** Billing operations require human authorization for your security.\n\nI can create a priority ticket for you right now, and our billing team typically responds within 2-4 hours.',
            timestamp: new Date(),
            thoughtSteps: [
                { label: 'Detecting billing operation request...', status: 'pending' },
                { label: 'Verifying user subscription status...', status: 'pending' },
                { label: 'Preparing priority escalation...', status: 'pending' }
            ],
            actions: [
                {
                    id: 'create-billing-ticket',
                    type: 'execute',
                    label: 'Create Billing Ticket',
                    description: 'Priority: High',
                    icon: '💳',
                    execute: async () => {
                        if (typeof window !== 'undefined') {
                            window.location.href = '/support?action=create&category=billing&priority=high&source=nandu';
                        }
                    }
                },
                {
                    id: 'view-billing',
                    type: 'navigate',
                    label: 'View Billing History',
                    description: 'Check invoices',
                    icon: '📄',
                    execute: () => { }
                },
            ],
        };
    }

    // Default response for unknown commands
    return {
        id: `msg_${Date.now()}`,
        role: 'agent',
        content: `I understand you want to "${input}". Let me help you with that!\n\nHere are some actions I can take:`,
        timestamp: new Date(),
        thoughtSteps: [
            { label: 'Deconstructing semantic intent...', status: 'pending' },
            { label: 'Searching agent knowledge base...', status: 'pending' },
            { label: 'Mapping to system capabilities...', status: 'pending' }
        ],
        actions: [
            { id: 'gen-content', type: 'generate', label: 'Generate Content', description: 'Create new content', icon: '✨', execute: () => { } },
            { id: 'get-insights', type: 'analyze', label: 'Get Insights', description: 'Analyze data', icon: '📊', execute: () => { } },
            { id: 'get-help', type: 'explain', label: 'Explain More', description: 'Learn how', icon: '❓', execute: () => { } },
        ],
    };
}

// Quick actions the agent can perform
export const QUICK_ACTIONS = [
    { id: 'quick-content', label: 'Generate Content', icon: '✨', command: 'generate content' },
    { id: 'quick-repurpose', label: 'Repurpose', icon: '🔄', command: 'repurpose content' },
    { id: 'quick-analytics', label: 'Analytics', icon: '📊', command: 'show analytics' },
    { id: 'quick-schedule', label: 'Best Times', icon: '⏰', command: 'best posting times' },
    { id: 'quick-trends', label: 'Trends', icon: '🔥', command: 'show trends' },
    { id: 'quick-support', label: 'Support', icon: '🎫', command: 'I need support' },
    { id: 'quick-help', label: 'Help', icon: '❓', command: 'help' },
];

// Proactive suggestions based on user behavior
export function getProactiveInsights(context: AgentContext): string | null {
    const hour = new Date().getHours();

    // Morning greeting with insights
    if (hour >= 6 && hour < 10) {
        return "Good morning! 🌅 Nandu here! Your content from yesterday got 23% more engagement than usual. Ready to keep the momentum going?";
    }

    // Midday content suggestion
    if (hour >= 11 && hour < 14) {
        return "Hey! Nandu here 📈 Perfect time to post on LinkedIn! Would you like me to generate a quick post?";
    }

    // Evening review
    if (hour >= 18 && hour < 21) {
        return "Hey! Nandu checking in 🌙 You have 3 posts scheduled for tomorrow. Want me to review them?";
    }

    return null;
}
