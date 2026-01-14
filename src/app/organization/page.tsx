'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Organization Page - Redirects to Dashboard Settings
 * 
 * All organization settings are now consolidated in the Dashboard Settings tab
 * for a unified user experience.
 */
export default function OrganizationSettingsPage() {
    const router = useRouter();

    useEffect(() => {
        // Redirect to Dashboard with Settings tab active
        router.replace('/dashboard?tab=settings');
    }, [router]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
            <div className="text-center">
                <div className="w-10 h-10 border-2 border-violet-500/30 border-t-violet-500 rounded-full animate-spin mx-auto mb-4" />
                <p className="text-white/60">Redirecting to Settings...</p>
            </div>
        </div>
    );
}
