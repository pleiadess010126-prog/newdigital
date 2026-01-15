'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/AuthContext';
import AICopilot from '@/components/AICopilot';
import { getAutopilotManager } from '@/lib/ai/autopilot';

interface ClientLayoutProps {
    children: React.ReactNode;
}

export default function ClientLayout({ children }: ClientLayoutProps) {
    const pathname = usePathname();
    const router = useRouter();
    const { isAuthenticated, user } = useAuth();

    // Determine current page for context
    const getCurrentPage = () => {
        if (pathname.includes('dashboard')) return 'dashboard';
        if (pathname.includes('content')) return 'content';
        if (pathname.includes('analytics')) return 'analytics';
        if (pathname.includes('settings')) return 'settings';
        if (pathname.includes('admin')) return 'admin';
        return 'home';
    };

    // Show Nandu copilot on ALL pages (except login/signup to avoid interference)
    const showCopilot = !pathname.includes('login') && !pathname.includes('signup');

    const handleAgentAction = (type: string, data?: any) => {
        console.log('Agent Action Executing:', type, data);

        // Handle common actions
        switch (data?.actionId) {
            case 'enable-autopilot':
                const manager = getAutopilotManager();
                manager.updateConfig({ enabled: true });
                manager.start();
                // If not on dashboard/automation, we might want to navigate
                if (!pathname.includes('dashboard')) {
                    router.push('/dashboard?tab=automation');
                }
                break;

            case 'view-autopilot':
            case 'configure-autopilot':
                router.push('/dashboard?tab=automation');
                break;

            case 'gen-linkedin':
            case 'gen-twitter':
            case 'gen-instagram':
            case 'gen-blog':
            case 'gen-content':
                router.push('/dashboard?tab=content');
                break;

            case 'more-analytics':
            case 'view-analytics':
            case 'get-insights':
                router.push('/dashboard?tab=analytics');
                break;

            case 'view-calendar':
                router.push('/dashboard?tab=schedule');
                break;

            case 'view-settings':
            case 'view-profile':
            case 'view-billing':
            case 'get-help':
                router.push('/dashboard?tab=settings');
                break;

            case 'get-started':
                router.push('/dashboard?tab=overview');
                break;

            default:
                // Handle by type if ID specific logic doesn't exist
                if (type === 'navigate' && data?.path) {
                    router.push(data.path);
                }
                break;
        }
    };

    return (
        <>
            {children}
            {showCopilot && (
                <AICopilot
                    currentPage={getCurrentPage()}
                    userPlan={user?.plan || 'free'}
                    onAction={handleAgentAction}
                />
            )}
        </>
    );
}
