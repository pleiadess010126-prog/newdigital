'use client';

import { Suspense } from 'react';
import AffiliateDashboard from '@/components/AffiliateDashboard';

function LoadingSpinner() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-violet-50/30 flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-violet-200 border-t-violet-600 rounded-full animate-spin" />
                <p className="text-slate-500">Loading affiliate dashboard...</p>
            </div>
        </div>
    );
}

export default function AffiliatePage() {
    return (
        <Suspense fallback={<LoadingSpinner />}>
            <AffiliateDashboard />
        </Suspense>
    );
}
