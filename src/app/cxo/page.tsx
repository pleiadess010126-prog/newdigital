'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function CXOPage() {
    const router = useRouter();

    useEffect(() => {
        // Check if already logged in
        const session = localStorage.getItem('cxo_session');
        if (session) {
            router.push('/cxo/dashboard');
        } else {
            router.push('/cxo/login');
        }
    }, [router]);

    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center">
            <div className="text-center">
                <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-white">Redirecting to Executive Suite...</p>
            </div>
        </div>
    );
}
