'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/AuthContext';
import { Mail, Lock, ArrowRight, Eye, EyeOff, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export default function LoginPage() {
    const router = useRouter();
    const { login, isLoading } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!email || !password) {
            setError('Please fill in all fields');
            return;
        }

        const result = await login(email, password);
        if (result.success) {
            router.push('/dashboard');
        } else {
            setError(result.error || 'Invalid email or password');
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-violet-50 flex items-center justify-center p-6">
            {/* Background decorations */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] bg-violet-200/50 rounded-full blur-[100px]" />
                <div className="absolute bottom-[-20%] left-[-10%] w-[600px] h-[600px] bg-blue-200/50 rounded-full blur-[120px]" />
            </div>

            <div className="relative w-full max-w-md">
                {/* Logo */}
                <div className="text-center mb-8">
                    <Link href="/" className="inline-flex items-center gap-3 mb-4">
                        <Image
                            src="/logo.jpg"
                            alt="DigitalMEng Logo"
                            width={56}
                            height={56}
                            className="object-contain"
                            priority
                        />
                        <div className="flex flex-col items-start">
                            <span className="text-2xl font-bold text-slate-800">
                                Digital<span className="text-violet-600">MEng</span>
                            </span>
                            <span className="text-xs text-slate-500">Organic Digital Marketing Engine</span>
                        </div>
                    </Link>
                    <h1 className="text-2xl font-bold text-slate-800 mt-6">Welcome back</h1>
                    <p className="text-slate-500 mt-2">Sign in to your account to continue</p>
                </div>

                {/* Login Form */}
                <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 p-8 border border-slate-200">
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {error && (
                            <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-2">
                                <AlertCircle className="w-4 h-4" />
                                {error}
                            </div>
                        )}

                        {/* Email */}
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Email Address</label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
                                    placeholder="you@example.com"
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-12 pr-12 py-3.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
                                    placeholder="••••••••"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        {/* Forgot Password */}
                        <div className="flex justify-end">
                            <Link href="/forgot-password" className="text-sm text-violet-600 hover:text-violet-700 font-medium">
                                Forgot password?
                            </Link>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-4 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-semibold hover:from-violet-500 hover:to-fuchsia-500 transition-all shadow-lg shadow-violet-500/25 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    Sign In
                                    <ArrowRight className="w-5 h-5" />
                                </>
                            )}
                        </button>
                    </form>

                    {/* Demo Credentials */}
                    <div className="mt-6 p-4 rounded-xl bg-violet-50 border border-violet-100">
                        <p className="text-sm text-violet-700 text-center">
                            <strong>Demo:</strong> Use any email with password <code className="px-2 py-0.5 bg-violet-100 rounded">demo123</code>
                        </p>
                    </div>

                    {/* Divider */}
                    <div className="flex items-center gap-4 my-6">
                        <div className="flex-1 h-px bg-slate-200" />
                        <span className="text-sm text-slate-400">or</span>
                        <div className="flex-1 h-px bg-slate-200" />
                    </div>

                    {/* Sign Up Link */}
                    <p className="text-center text-slate-600">
                        Don't have an account?{' '}
                        <Link href="/signup" className="text-violet-600 hover:text-violet-700 font-semibold">
                            Sign up for free
                        </Link>
                    </p>
                </div>

                {/* Footer */}
                <p className="text-center text-slate-400 text-sm mt-8">
                    By signing in, you agree to our{' '}
                    <Link href="/terms" className="text-slate-600 hover:text-violet-600">Terms of Service</Link>
                    {' '}and{' '}
                    <Link href="/privacy" className="text-slate-600 hover:text-violet-600">Privacy Policy</Link>
                </p>
            </div>
        </div>
    );
}
