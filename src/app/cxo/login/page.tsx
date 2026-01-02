'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
    Crown,
    Shield,
    Eye,
    EyeOff,
    Fingerprint,
    Lock,
    ArrowRight,
    Sparkles,
    Building2,
    ChevronDown,
    AlertCircle,
    CheckCircle2,
    Loader2,
} from 'lucide-react';

// CXO Roles
const CXO_ROLES = [
    { id: 'ceo', title: 'Chief Executive Officer', shortTitle: 'CEO', icon: Crown, color: 'from-amber-500 to-yellow-600' },
    { id: 'chairman', title: 'Chairman of the Board', shortTitle: 'Chairman', icon: Shield, color: 'from-violet-500 to-purple-600' },
    { id: 'md', title: 'Managing Director', shortTitle: 'MD', icon: Building2, color: 'from-emerald-500 to-teal-600' },
    { id: 'cfo', title: 'Chief Financial Officer', shortTitle: 'CFO', icon: Shield, color: 'from-blue-500 to-cyan-600' },
    { id: 'coo', title: 'Chief Operating Officer', shortTitle: 'COO', icon: Shield, color: 'from-rose-500 to-pink-600' },
    { id: 'cto', title: 'Chief Technology Officer', shortTitle: 'CTO', icon: Shield, color: 'from-indigo-500 to-blue-600' },
];

// Demo credentials for testing
const DEMO_CREDENTIALS: Record<string, { email: string; password: string; name: string }> = {
    ceo: { email: 'ceo@digitalmeng.com', password: 'ceo2024', name: 'Alexander Sterling' },
    chairman: { email: 'chairman@digitalmeng.com', password: 'chairman2024', name: 'Victoria Hartwell' },
    md: { email: 'md@digitalmeng.com', password: 'md2024', name: 'James Richardson' },
    cfo: { email: 'cfo@digitalmeng.com', password: 'cfo2024', name: 'Sarah Chen' },
    coo: { email: 'coo@digitalmeng.com', password: 'coo2024', name: 'Michael Torres' },
    cto: { email: 'cto@digitalmeng.com', password: 'cto2024', name: 'David Kumar' },
};

export default function CXOLoginPage() {
    const router = useRouter();
    const [selectedRole, setSelectedRole] = useState<string>('ceo');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [showRoleDropdown, setShowRoleDropdown] = useState(false);
    const [rememberDevice, setRememberDevice] = useState(false);
    const [currentTime, setCurrentTime] = useState(new Date());

    // URL query parameter support
    useEffect(() => {
        const searchParams = new URLSearchParams(window.location.search);
        const roleParam = searchParams.get('role');
        if (roleParam && CXO_ROLES.some(r => r.id === roleParam)) {
            setSelectedRole(roleParam);
            // Optionally auto-fill demo if in dev mode
            const credentials = DEMO_CREDENTIALS[roleParam];
            if (credentials) {
                setEmail(credentials.email);
                setPassword(credentials.password);
            }
        }
    }, []);

    // Update time every second
    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    // Handle login
    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        // Simulate authentication delay
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Check credentials
        const credentials = DEMO_CREDENTIALS[selectedRole];
        if (email === credentials.email && password === credentials.password) {
            // Store CXO session
            localStorage.setItem('cxo_session', JSON.stringify({
                role: selectedRole,
                name: credentials.name,
                email: credentials.email,
                loginTime: new Date().toISOString(),
            }));
            router.push('/cxo/dashboard');
        } else {
            setError('Invalid credentials. Please check your email and password.');
            setIsLoading(false);
        }
    };

    // Auto-fill demo credentials
    const fillDemoCredentials = () => {
        const credentials = DEMO_CREDENTIALS[selectedRole];
        setEmail(credentials.email);
        setPassword(credentials.password);
    };

    const selectedRoleData = CXO_ROLES.find(r => r.id === selectedRole);

    return (
        <div className="min-h-screen bg-slate-950 flex overflow-hidden">
            {/* Left Panel - Branding & Visual */}
            <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
                {/* Animated gradient background */}
                <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-violet-950 to-slate-900">
                    {/* Animated orbs */}
                    <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-violet-500/20 rounded-full blur-3xl animate-pulse" />
                    <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
                    <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
                </div>

                {/* Grid pattern overlay */}
                <div className="absolute inset-0 opacity-10" style={{
                    backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                                     linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
                    backgroundSize: '50px 50px'
                }} />

                {/* Content */}
                <div className="relative z-10 flex flex-col justify-center items-center p-12 w-full">
                    <div className="mb-8">
                        <div className="w-24 h-24 bg-gradient-to-br from-amber-400 via-amber-500 to-yellow-600 rounded-3xl flex items-center justify-center shadow-2xl shadow-amber-500/30 transform -rotate-6 hover:rotate-0 transition-transform duration-300">
                            <Crown className="w-14 h-14 text-white" />
                        </div>
                    </div>

                    <h1 className="text-5xl font-bold text-white mb-4 text-center">
                        Executive Suite
                    </h1>
                    <p className="text-xl text-slate-400 text-center max-w-md mb-12">
                        Strategic command center for C-level leadership. Real-time insights,
                        actionable intelligence, and enterprise-wide visibility.
                    </p>

                    {/* Stats preview */}
                    <div className="grid grid-cols-3 gap-6 w-full max-w-lg">
                        {[
                            { label: 'Total Revenue', value: '$2.8M', change: '+23.5%' },
                            { label: 'Active Users', value: '12.8K', change: '+156' },
                            { label: 'System Health', value: '99.7%', change: 'Optimal' },
                        ].map((stat, i) => (
                            <div key={i} className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 text-center">
                                <p className="text-2xl font-bold text-white">{stat.value}</p>
                                <p className="text-xs text-slate-400">{stat.label}</p>
                                <p className="text-xs text-emerald-400 mt-1">{stat.change}</p>
                            </div>
                        ))}
                    </div>

                    {/* Current time display */}
                    <div className="absolute bottom-8 left-12 text-slate-500">
                        <p className="text-sm font-mono">
                            {currentTime.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                        </p>
                        <p className="text-3xl font-mono font-light text-white/80">
                            {currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                        </p>
                    </div>
                </div>
            </div>

            {/* Right Panel - Login Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
                <div className="w-full max-w-md">
                    {/* Mobile logo */}
                    <div className="lg:hidden flex justify-center mb-8">
                        <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-yellow-600 rounded-2xl flex items-center justify-center shadow-lg">
                            <Crown className="w-10 h-10 text-white" />
                        </div>
                    </div>

                    <div className="text-center mb-8">
                        <h2 className="text-3xl font-bold text-white mb-2">Welcome Back</h2>
                        <p className="text-slate-400">Sign in to access your executive dashboard</p>
                    </div>

                    {/* Role Selector */}
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-slate-400 mb-2">Executive Role</label>
                        <div className="relative">
                            <button
                                type="button"
                                onClick={() => setShowRoleDropdown(!showRoleDropdown)}
                                className="w-full flex items-center justify-between px-4 py-4 bg-slate-800/50 border border-slate-700 rounded-xl text-white hover:border-violet-500/50 transition-colors"
                            >
                                <div className="flex items-center gap-3">
                                    {selectedRoleData && (
                                        <>
                                            <div className={`w-10 h-10 bg-gradient-to-br ${selectedRoleData.color} rounded-lg flex items-center justify-center`}>
                                                <selectedRoleData.icon className="w-5 h-5 text-white" />
                                            </div>
                                            <div className="text-left">
                                                <p className="font-semibold">{selectedRoleData.shortTitle}</p>
                                                <p className="text-xs text-slate-400">{selectedRoleData.title}</p>
                                            </div>
                                        </>
                                    )}
                                </div>
                                <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${showRoleDropdown ? 'rotate-180' : ''}`} />
                            </button>

                            {showRoleDropdown && (
                                <div className="absolute z-50 w-full mt-2 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl overflow-hidden">
                                    {CXO_ROLES.map((role) => (
                                        <button
                                            key={role.id}
                                            type="button"
                                            onClick={() => {
                                                setSelectedRole(role.id);
                                                setShowRoleDropdown(false);
                                                setEmail('');
                                                setPassword('');
                                            }}
                                            className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-700/50 transition-colors ${selectedRole === role.id ? 'bg-violet-500/20' : ''}`}
                                        >
                                            <div className={`w-10 h-10 bg-gradient-to-br ${role.color} rounded-lg flex items-center justify-center`}>
                                                <role.icon className="w-5 h-5 text-white" />
                                            </div>
                                            <div className="text-left">
                                                <p className="text-white font-medium">{role.shortTitle}</p>
                                                <p className="text-xs text-slate-400">{role.title}</p>
                                            </div>
                                            {selectedRole === role.id && (
                                                <CheckCircle2 className="w-5 h-5 text-violet-400 ml-auto" />
                                            )}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-5">
                        {/* Email field */}
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-2">Corporate Email</label>
                            <div className="relative">
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="executive@company.com"
                                    className="w-full px-4 py-4 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all"
                                    required
                                />
                                <Fingerprint className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                            </div>
                        </div>

                        {/* Password field */}
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <label className="text-sm font-medium text-slate-400">Secure Password</label>
                                <button type="button" className="text-sm text-violet-400 hover:text-violet-300 transition-colors">
                                    Forgot Password?
                                </button>
                            </div>
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••••••"
                                    className="w-full px-4 py-4 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all pr-12"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        {/* Remember device checkbox */}
                        <div className="flex items-center gap-3">
                            <button
                                type="button"
                                onClick={() => setRememberDevice(!rememberDevice)}
                                className={`w-5 h-5 rounded border ${rememberDevice ? 'bg-violet-500 border-violet-500' : 'border-slate-600'} flex items-center justify-center transition-colors`}
                            >
                                {rememberDevice && <CheckCircle2 className="w-3 h-3 text-white" />}
                            </button>
                            <label className="text-sm text-slate-400">Remember this device for 30 days</label>
                        </div>

                        {/* Error message */}
                        {error && (
                            <div className="flex items-center gap-2 px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
                                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                                {error}
                            </div>
                        )}

                        {/* Submit button */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-4 bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white font-semibold rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-violet-500/25 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Authenticating...
                                </>
                            ) : (
                                <>
                                    <Lock className="w-5 h-5" />
                                    Secure Sign In
                                    <ArrowRight className="w-5 h-5" />
                                </>
                            )}
                        </button>
                    </form>

                    {/* Demo credentials helper */}
                    <div className="mt-6 p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl">
                        <div className="flex items-start gap-3">
                            <Sparkles className="w-5 h-5 text-amber-400 mt-0.5" />
                            <div>
                                <p className="text-sm font-medium text-amber-400">Demo Mode Available</p>
                                <p className="text-xs text-slate-400 mt-1">
                                    Click below to auto-fill demo credentials for the selected role.
                                </p>
                                <button
                                    type="button"
                                    onClick={fillDemoCredentials}
                                    className="mt-2 text-sm text-amber-400 hover:text-amber-300 underline transition-colors"
                                >
                                    Fill Demo Credentials for {selectedRoleData?.shortTitle}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Security badges */}
                    <div className="mt-8 flex items-center justify-center gap-6 text-slate-500">
                        <div className="flex items-center gap-1 text-xs">
                            <Shield className="w-4 h-4" />
                            <span>256-bit SSL</span>
                        </div>
                        <div className="flex items-center gap-1 text-xs">
                            <Lock className="w-4 h-4" />
                            <span>2FA Protected</span>
                        </div>
                        <div className="flex items-center gap-1 text-xs">
                            <Fingerprint className="w-4 h-4" />
                            <span>Biometric Ready</span>
                        </div>
                    </div>

                    {/* Back to main site */}
                    <div className="mt-8 text-center">
                        <button
                            type="button"
                            onClick={() => router.push('/')}
                            className="text-sm text-slate-500 hover:text-white transition-colors"
                        >
                            ← Return to Main Site
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
