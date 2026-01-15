// Agent Nandu API - AI-powered chat assistant
// Uses available AI providers (OpenAI, Anthropic, Bedrock)

import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';

interface ChatMessage {
    role: 'user' | 'assistant' | 'system';
    content: string;
}

interface NanduRequest {
    messages: ChatMessage[];
    context?: {
        currentPage?: string;
        userPlan?: string;
    };
}

// System prompt for Nandu
const NANDU_SYSTEM_PROMPT = `You are Nandu, an extremely helpful and friendly AI assistant for DigitalMEng - an Autonomous Organic Marketing Engine platform.

Your personality:
- Warm, enthusiastic, and encouraging
- Use emojis appropriately (but not excessively)
- Be concise but thorough
- Always offer actionable suggestions

Your capabilities:
1. **Content Generation** - Help users create blog posts, social media content, video scripts
2. **Marketing Strategy** - Provide growth tips, content calendars, posting schedules
3. **Analytics Insights** - Explain performance metrics and suggest improvements
4. **Platform Navigation** - Guide users to features they're looking for
5. **Automation Setup** - Help configure autopilot and scheduling
6. **Support** - Assist with technical issues or escalate to human support

When users ask about features, be specific about what DigitalMEng offers:
- Multi-platform content publishing (LinkedIn, Instagram, TikTok, YouTube, Facebook, Twitter)
- AI-powered content generation in 20+ languages
- SEO and GEO optimization
- Autopilot mode for hands-off marketing
- Brand Vault for brand consistency
- AI War Room for multi-agent collaboration

If you can't help with something or it requires human intervention (billing, account issues), offer to create a support ticket.

Always respond in a helpful, conversational manner. If the user seems frustrated, be empathetic and solution-focused.`;

// Initialize AI clients
let openaiClient: OpenAI | null = null;
let anthropicClient: Anthropic | null = null;

function initializeClients() {
    if (process.env.OPENAI_API_KEY && !openaiClient) {
        openaiClient = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY,
        });
    }

    if (process.env.ANTHROPIC_API_KEY && !anthropicClient) {
        anthropicClient = new Anthropic({
            apiKey: process.env.ANTHROPIC_API_KEY,
        });
    }
}

async function chatWithOpenAI(messages: ChatMessage[]): Promise<string> {
    if (!openaiClient) throw new Error('OpenAI client not initialized');

    const response = await openaiClient.chat.completions.create({
        model: 'gpt-4o-mini', // Cost-effective for chat
        messages: [
            { role: 'system', content: NANDU_SYSTEM_PROMPT },
            ...messages,
        ],
        max_tokens: 1000,
        temperature: 0.7,
    });

    return response.choices[0].message.content || 'I apologize, I had trouble generating a response. Please try again.';
}

async function chatWithAnthropic(messages: ChatMessage[]): Promise<string> {
    if (!anthropicClient) throw new Error('Anthropic client not initialized');

    // Convert messages to Anthropic format
    const anthropicMessages = messages.map(m => ({
        role: m.role === 'user' ? 'user' as const : 'assistant' as const,
        content: m.content,
    }));

    const response = await anthropicClient.messages.create({
        model: 'claude-3-haiku-20240307', // Cost-effective for chat
        max_tokens: 1000,
        system: NANDU_SYSTEM_PROMPT,
        messages: anthropicMessages,
    });

    return response.content[0].type === 'text'
        ? response.content[0].text
        : 'I apologize, I had trouble generating a response. Please try again.';
}

// Fallback response when no AI provider is available
function getFallbackResponse(userMessage: string): string {
    const lowerMessage = userMessage.toLowerCase();

    // Greetings
    if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
        return "Hey there! 👋 I'm Nandu, your AI marketing assistant! I'm currently running in simulation mode (no AI API configured yet), but I can still help guide you around DigitalMEng.\n\nWhat would you like to do?\n• Generate content\n• View analytics\n• Set up autopilot\n• Learn about features";
    }

    // Language/Country/Region support question
    if (lowerMessage.includes('language') || lowerMessage.includes('translate') || lowerMessage.includes('multilingual') ||
        lowerMessage.includes('country') || lowerMessage.includes('countries') || lowerMessage.includes('region') || lowerMessage.includes('global')) {
        return "🌍 **DigitalMEng supports 20+ languages across all regions!**\n\nWe serve users **globally** and can generate content in:\n\n**European:** English, Spanish, French, German, Italian, Portuguese, Dutch, Russian, Polish, Swedish, Czech, Romanian, Ukrainian\n\n**Asian:** Chinese, Japanese, Korean, Hindi, Thai, Vietnamese, Indonesian, Malay, Filipino, Bengali, Tamil, Telugu, Marathi, Gujarati\n\n**Middle Eastern:** Arabic, Hebrew, Turkish\n\n🌐 **Global Reach:**\n• Available in 190+ countries\n• Content localization for any market\n• Cultural adaptation for regional audiences\n• Multi-currency billing support\n\n✨ You can:\n• Generate content directly in any language\n• Auto-translate existing content\n• Localize for regional audiences\n\nGo to **Content → Generate** and select your target language!";
    }

    // Features question
    if (lowerMessage.includes('feature') || lowerMessage.includes('what can') || lowerMessage.includes('capabilities')) {
        return "🚀 **DigitalMEng Features:**\n\n**📝 Content Engine**\n• AI-powered blog & social media generation\n• YouTube Shorts, Reels, TikTok scripts\n• SEO & GEO optimization\n• 20+ language support\n\n**🤖 Automation (Autopilot)**\n• Hands-off content creation\n• Smart scheduling at peak times\n• Auto-publishing to all platforms\n\n**📊 Analytics**\n• Real-time performance tracking\n• Audience insights\n• Content recommendations\n\n**🏛️ Brand Vault**\n• Store brand guidelines\n• Ensure consistency across content\n• RAG-powered knowledge retrieval\n\n**🎖️ AI War Room**\n• Multi-agent collaboration\n• Strategy debates & execution\n\nWhich feature interests you most?";
    }

    // Platform support
    if (lowerMessage.includes('platform') || lowerMessage.includes('social') || lowerMessage.includes('publish')) {
        return "📱 **Supported Platforms:**\n\n• **LinkedIn** - Professional posts & articles\n• **Instagram** - Reels, Stories, Feed posts\n• **TikTok** - Short-form videos\n• **YouTube** - Shorts & video scripts\n• **Facebook** - Posts & Stories\n• **Twitter/X** - Threads & tweets\n• **WordPress** - Blog posts\n\nConnect your accounts in **Settings → Integrations** to enable auto-publishing!";
    }

    // Pricing
    if (lowerMessage.includes('price') || lowerMessage.includes('cost') || lowerMessage.includes('plan') || lowerMessage.includes('subscription')) {
        return "💰 **DigitalMEng Pricing:**\n\n**Free** - Get started with basic features\n**Lite ($29/mo)** - 50 content pieces, 3 platforms\n**Starter ($79/mo)** - 150 content, all platforms, Brand Vault\n**Pro ($199/mo)** - Unlimited content, Autopilot, Priority support\n**Enterprise** - Custom solutions, dedicated support\n\nVisit the **Pricing** page for full details, or ask me about any specific plan!";
    }

    // Help
    if (lowerMessage.includes('help')) {
        return "I'm here to help! 🤝 Here's what I can assist with:\n\n**Content Creation**\n• Blog posts, social media, video scripts\n• Multi-language support (20+ languages)\n\n**Marketing Automation**\n• Autopilot mode\n• Scheduling & publishing\n\n**Analytics**\n• Performance insights\n• Audience analytics\n\nWhat would you like to explore?";
    }

    // Content generation
    if (lowerMessage.includes('content') || lowerMessage.includes('generate') || lowerMessage.includes('write') || lowerMessage.includes('create')) {
        return "✨ **Let's create content!**\n\nTo generate AI-powered content:\n1. Go to the **Content** tab\n2. Click **+ Generate**\n3. Choose your platform and language\n4. Enter your topic or let AI suggest one\n5. Review and publish!\n\n**Pro tip:** Use the **Brand Vault** to upload your brand guidelines for consistent messaging!\n\nWould you like me to take you to the Content Generator?";
    }

    // Autopilot
    if (lowerMessage.includes('autopilot') || lowerMessage.includes('automate') || lowerMessage.includes('automatic')) {
        return "🚀 **Autopilot Mode** is your hands-off marketing solution!\n\nTo set it up:\n1. Go to the **Automation** tab\n2. Configure your content preferences\n3. Set posting schedules per platform\n4. Enable Autopilot and let DigitalMEng work for you!\n\nThe AI agents will:\n• Research trending topics\n• Generate optimized content\n• Schedule at peak engagement times\n• Monitor performance & adjust\n\nShall I take you there?";
    }

    // War Room
    if (lowerMessage.includes('war room') || lowerMessage.includes('agents') || lowerMessage.includes('collaboration')) {
        return "🎖️ **AI War Room (ASI Core)**\n\nThe War Room is where multiple AI agents collaborate:\n\n**Strategist** - Plans content strategy\n**SEO Worker** - Optimizes for search\n**Copywriter** - Creates engaging copy\n**Risk Worker** - Checks compliance\n**Critic** - Reviews and improves\n\nTo use it:\n1. Go to **Automation → War Room (ASI)**\n2. Enter your campaign goal\n3. Click **Start Job**\n4. Watch the agents debate and execute!\n\nIt's like having a whole marketing team working for you! 🎯";
    }

    // Analytics
    if (lowerMessage.includes('analytics') || lowerMessage.includes('performance') || lowerMessage.includes('metrics') || lowerMessage.includes('stats')) {
        return "📊 **Analytics Dashboard**\n\nTrack your marketing performance:\n\n• **Engagement Rate** - Likes, comments, shares\n• **Reach** - How many people see your content\n• **Growth** - Follower & audience growth\n• **Best Times** - Optimal posting schedules\n• **Top Content** - Your best performers\n\nGo to the **Analytics** tab to see your real-time data!\n\nWant me to explain any specific metric?";
    }

    // Default - provide context-aware help
    return `Great question! 💬\n\nI understood you're asking about: "${userMessage}"\n\n**I can help you with:**\n• 🌍 Language support (20+ languages)\n• 📝 Content generation\n• 🚀 Autopilot automation\n• 📊 Analytics insights\n• 💰 Pricing & plans\n• 🔧 Platform setup\n\n**To enable full AI chat capabilities:**\nAdd an API key to your environment:\n• \`OPENAI_API_KEY=your-key\`\n• Or \`ANTHROPIC_API_KEY=your-key\`\n\nAsk me anything specific about DigitalMEng features!`;
}

export async function POST(request: NextRequest) {
    try {
        const body: NanduRequest = await request.json();
        const { messages } = body;

        if (!messages || messages.length === 0) {
            return NextResponse.json(
                { error: 'Messages array is required' },
                { status: 400 }
            );
        }

        // Initialize clients
        initializeClients();

        let response: string;
        let provider: string = 'fallback';

        // Try OpenAI first
        if (openaiClient) {
            try {
                response = await chatWithOpenAI(messages);
                provider = 'openai';
            } catch (error) {
                console.error('OpenAI error:', error);
                // Fall through to Anthropic
            }
        }

        // Try Anthropic if OpenAI failed
        if (!response! && anthropicClient) {
            try {
                response = await chatWithAnthropic(messages);
                provider = 'anthropic';
            } catch (error) {
                console.error('Anthropic error:', error);
                // Fall through to fallback
            }
        }

        // Use fallback if no AI available
        if (!response!) {
            const lastMessage = messages[messages.length - 1];
            response = getFallbackResponse(lastMessage.content);
            provider = 'fallback';
        }

        return NextResponse.json({
            message: response,
            provider,
            timestamp: new Date().toISOString(),
        });

    } catch (error) {
        console.error('Nandu API error:', error);
        return NextResponse.json(
            {
                error: 'Failed to process chat request',
                message: "I'm having trouble right now. Please try again in a moment! 🔄"
            },
            { status: 500 }
        );
    }
}

export async function GET() {
    // Health check - return available providers
    initializeClients();

    return NextResponse.json({
        status: 'online',
        agent: 'Nandu',
        version: '2.0',
        providers: {
            openai: !!openaiClient,
            anthropic: !!anthropicClient,
        },
        mode: openaiClient || anthropicClient ? 'ai' : 'simulation',
    });
}
