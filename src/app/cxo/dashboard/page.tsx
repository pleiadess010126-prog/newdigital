'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
    Crown,
    TrendingUp,
    TrendingDown,
    DollarSign,
    Users,
    Activity,
    BarChart3,
    PieChart,
    LineChart,
    Globe,
    Target,
    AlertTriangle,
    CheckCircle2,
    XCircle,
    Clock,
    Calendar,
    Bell,
    Settings,
    LogOut,
    ChevronDown,
    ChevronRight,
    ArrowUpRight,
    ArrowDownRight,
    Zap,
    Briefcase,
    Building2,
    Shield,
    Eye,
    FileText,
    Download,
    RefreshCw,
    MoreVertical,
    Star,
    Award,
    Rocket,
    Heart,
    MessageSquare,
    Share2,
    Cpu,
    Server,
    Database,
    HardDrive,
    Wifi,
    Bot,
    ArrowRight,
    Map,
} from 'lucide-react';

// CXO Session type
interface CXOSession {
    role: string;
    name: string;
    email: string;
    loginTime: string;
}

// Executive KPIs
const EXECUTIVE_KPIS = {
    revenue: {
        current: 2847500,
        previous: 2156300,
        change: 32.1,
        currency: 'USD',
    },
    mrr: {
        current: 478200,
        previous: 412800,
        change: 15.8,
        currency: 'USD',
    },
    arr: {
        current: 5738400,
        previous: 4953600,
        change: 15.8,
        currency: 'USD',
    },
    customers: {
        current: 12847,
        previous: 9823,
        change: 30.8,
    },
    activeUsers: {
        current: 8932,
        dau: 3245,
        mau: 8932,
    },
    churnRate: {
        current: 2.3,
        previous: 3.1,
        change: -25.8, // Negative is good for churn
    },
    ltv: {
        current: 4850,
        previous: 4200,
        change: 15.5,
    },
    cac: {
        current: 285,
        previous: 342,
        change: -16.7, // Negative is good for CAC
    },
    nps: {
        current: 72,
        previous: 65,
        change: 10.8,
    },
};

// Revenue by segment
const REVENUE_SEGMENTS = [
    { name: 'Enterprise', value: 1423750, percentage: 50, color: 'bg-violet-500' },
    { name: 'Pro', value: 854250, percentage: 30, color: 'bg-blue-500' },
    { name: 'Starter', value: 426375, percentage: 15, color: 'bg-emerald-500' },
    { name: 'Other', value: 143125, percentage: 5, color: 'bg-slate-500' },
];

// Geographic distribution
const GEO_DISTRIBUTION = [
    { region: 'North America', users: 5124, revenue: 1423750, growth: 28.5 },
    { region: 'Europe', users: 3890, revenue: 854250, growth: 35.2 },
    { region: 'Asia Pacific', users: 2456, revenue: 426375, growth: 42.8 },
    { region: 'Latin America', users: 892, revenue: 98500, growth: 18.3 },
    { region: 'Rest of World', users: 485, revenue: 44625, growth: 12.1 },
];

// Recent strategic alerts
const STRATEGIC_ALERTS = [
    { id: 1, type: 'success', title: 'Q4 Revenue Target Achieved', message: 'Exceeded target by 12.3%', time: '2 hours ago', priority: 'high' },
    { id: 2, type: 'warning', title: 'Enterprise Churn Risk', message: '3 enterprise accounts showing reduced engagement', time: '5 hours ago', priority: 'critical' },
    { id: 3, type: 'info', title: 'New Market Opportunity', message: 'APAC region showing 42.8% growth rate', time: '1 day ago', priority: 'medium' },
    { id: 4, type: 'success', title: 'Partnership Signed', message: 'Strategic alliance with TechCorp finalized', time: '2 days ago', priority: 'high' },
];

// Team performance
const TEAM_PERFORMANCE = [
    { department: 'Engineering', headcount: 45, productivity: 94, budget: 2.4, spent: 2.1 },
    { department: 'Sales', headcount: 28, productivity: 108, budget: 1.8, spent: 1.6 },
    { department: 'Marketing', headcount: 18, productivity: 92, budget: 0.9, spent: 0.85 },
    { department: 'Customer Success', headcount: 22, productivity: 97, budget: 1.1, spent: 1.0 },
    { department: 'Product', headcount: 15, productivity: 101, budget: 0.8, spent: 0.75 },
];

// Monthly revenue trend
const REVENUE_TREND = [
    { month: 'Jul', revenue: 312000, target: 300000 },
    { month: 'Aug', revenue: 358000, target: 340000 },
    { month: 'Sep', revenue: 401000, target: 380000 },
    { month: 'Oct', revenue: 423000, target: 420000 },
    { month: 'Nov', revenue: 456000, target: 460000 },
    { month: 'Dec', revenue: 478200, target: 480000 },
];

type DashboardTab = 'overview' | 'financial' | 'operations' | 'strategic' | 'reports';

export default function CXODashboardPage() {
    const router = useRouter();
    const [session, setSession] = useState<CXOSession | null>(null);
    const [activeTab, setActiveTab] = useState<DashboardTab>('overview');
    const [isLoading, setIsLoading] = useState(true);
    const [currentTime, setCurrentTime] = useState(new Date());
    const [showNotifications, setShowNotifications] = useState(false);

    // Check session and load data
    useEffect(() => {
        const storedSession = localStorage.getItem('cxo_session');
        if (!storedSession) {
            router.push('/cxo/login');
            return;
        }
        setSession(JSON.parse(storedSession));
        setIsLoading(false);
    }, [router]);

    // Update time
    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    // Handle logout
    const handleLogout = () => {
        localStorage.removeItem('cxo_session');
        router.push('/cxo/login');
    };

    // Format currency
    const formatCurrency = (value: number) => {
        if (value >= 1000000) return `$${(value / 1000000).toFixed(2)}M`;
        if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
        return `$${value.toFixed(0)}`;
    };

    // Get role info
    const getRoleInfo = (role: string) => {
        const roles: Record<string, { title: string; color: string; icon: typeof Crown }> = {
            ceo: { title: 'Chief Executive Officer', color: 'from-amber-500 to-yellow-600', icon: Crown },
            chairman: { title: 'Chairman of the Board', color: 'from-violet-500 to-purple-600', icon: Shield },
            md: { title: 'Managing Director', color: 'from-emerald-500 to-teal-600', icon: Building2 },
            cfo: { title: 'Chief Financial Officer', color: 'from-blue-500 to-cyan-600', icon: Shield },
            coo: { title: 'Chief Operating Officer', color: 'from-rose-500 to-pink-600', icon: Shield },
            cto: { title: 'Chief Technology Officer', color: 'from-indigo-500 to-blue-600', icon: Shield },
        };
        return roles[role] || roles.ceo;
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center">
                <div className="text-center">
                    <Crown className="w-16 h-16 text-amber-500 mx-auto mb-4 animate-pulse" />
                    <p className="text-white text-lg">Loading Executive Dashboard...</p>
                </div>
            </div>
        );
    }

    const roleInfo = session ? getRoleInfo(session.role) : getRoleInfo('ceo');
    const RoleIcon = roleInfo.icon;

    const tabs = [
        { id: 'overview' as DashboardTab, label: 'Executive Overview', icon: BarChart3 },
        { id: 'financial' as DashboardTab, label: 'Financial Metrics', icon: DollarSign },
        { id: 'operations' as DashboardTab, label: 'Operations', icon: Activity },
        { id: 'strategic' as DashboardTab, label: 'Strategic Insights', icon: Target },
        { id: 'reports' as DashboardTab, label: 'Reports', icon: FileText },
    ];

    return (
        <div className="min-h-screen bg-slate-950">
            {/* Top Navigation Bar */}
            <header className="bg-slate-900/80 backdrop-blur-xl border-b border-slate-800 sticky top-0 z-50">
                <div className="px-6 py-4">
                    <div className="flex items-center justify-between">
                        {/* Left - Logo & Title */}
                        <div className="flex items-center gap-4">
                            <div className={`w-12 h-12 bg-gradient-to-br ${roleInfo.color} rounded-xl flex items-center justify-center shadow-lg`}>
                                <RoleIcon className="w-7 h-7 text-white" />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold text-white">Executive Command Center</h1>
                                <p className="text-sm text-slate-400">DigitalMEng Enterprise Suite</p>
                            </div>
                        </div>

                        {/* Center - Time & Date */}
                        <div className="hidden md:flex flex-col items-center">
                            <p className="text-2xl font-mono text-white font-light">
                                {currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                            </p>
                            <p className="text-xs text-slate-500">
                                {currentTime.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })}
                            </p>
                        </div>

                        {/* Right - Actions & Profile */}
                        <div className="flex items-center gap-4">
                            {/* Refresh button */}
                            <button className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors">
                                <RefreshCw className="w-5 h-5" />
                            </button>

                            {/* Notifications */}
                            <div className="relative">
                                <button
                                    onClick={() => setShowNotifications(!showNotifications)}
                                    className="relative p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                                >
                                    <Bell className="w-5 h-5" />
                                    <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
                                </button>

                                {showNotifications && (
                                    <div className="absolute right-0 mt-2 w-80 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl overflow-hidden">
                                        <div className="p-4 border-b border-slate-700">
                                            <h3 className="font-semibold text-white">Strategic Alerts</h3>
                                        </div>
                                        <div className="max-h-80 overflow-y-auto">
                                            {STRATEGIC_ALERTS.map((alert) => (
                                                <div key={alert.id} className="p-4 border-b border-slate-700/50 hover:bg-slate-700/50 transition-colors">
                                                    <div className="flex items-start gap-3">
                                                        {alert.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-400 mt-0.5" />}
                                                        {alert.type === 'warning' && <AlertTriangle className="w-5 h-5 text-amber-400 mt-0.5" />}
                                                        {alert.type === 'info' && <Activity className="w-5 h-5 text-blue-400 mt-0.5" />}
                                                        <div className="flex-1">
                                                            <p className="text-sm font-medium text-white">{alert.title}</p>
                                                            <p className="text-xs text-slate-400 mt-1">{alert.message}</p>
                                                            <p className="text-xs text-slate-500 mt-1">{alert.time}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Profile dropdown */}
                            <div className="flex items-center gap-3 pl-4 border-l border-slate-700">
                                <div className="text-right">
                                    <p className="text-sm font-medium text-white">{session?.name}</p>
                                    <p className="text-xs text-slate-400">{roleInfo.title}</p>
                                </div>
                                <div className={`w-10 h-10 bg-gradient-to-br ${roleInfo.color} rounded-full flex items-center justify-center text-white font-bold`}>
                                    {session?.name?.charAt(0) || 'E'}
                                </div>
                                <button
                                    onClick={handleLogout}
                                    className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                                    title="Logout"
                                >
                                    <LogOut className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tab Navigation */}
                <div className="px-6 border-t border-slate-800/50">
                    <div className="flex gap-1">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors border-b-2 ${activeTab === tab.id
                                    ? 'text-white border-amber-500 bg-amber-500/10'
                                    : 'text-slate-400 border-transparent hover:text-white hover:bg-slate-800/50'
                                    }`}
                            >
                                <tab.icon className="w-4 h-4" />
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="p-6">
                {activeTab === 'overview' && (
                    <div className="space-y-6">
                        {/* Key Metrics Row */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {/* Total Revenue */}
                            <div className="bg-gradient-to-br from-amber-500/20 to-yellow-600/20 border border-amber-500/30 rounded-2xl p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="w-12 h-12 bg-amber-500/20 rounded-xl flex items-center justify-center">
                                        <DollarSign className="w-6 h-6 text-amber-400" />
                                    </div>
                                    <span className="text-xs text-emerald-400 flex items-center gap-1 bg-emerald-500/10 px-2 py-1 rounded-full">
                                        <ArrowUpRight className="w-3 h-3" />
                                        +{EXECUTIVE_KPIS.revenue.change}%
                                    </span>
                                </div>
                                <p className="text-4xl font-bold text-white">{formatCurrency(EXECUTIVE_KPIS.revenue.current)}</p>
                                <p className="text-sm text-slate-400 mt-1">Total Revenue (YTD)</p>
                                <div className="mt-3 h-1 bg-slate-700 rounded-full overflow-hidden">
                                    <div className="h-full w-[85%] bg-gradient-to-r from-amber-500 to-yellow-500 rounded-full" />
                                </div>
                                <p className="text-xs text-slate-500 mt-1">85% of annual target</p>
                            </div>

                            {/* MRR */}
                            <div className="bg-gradient-to-br from-violet-500/20 to-purple-600/20 border border-violet-500/30 rounded-2xl p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="w-12 h-12 bg-violet-500/20 rounded-xl flex items-center justify-center">
                                        <TrendingUp className="w-6 h-6 text-violet-400" />
                                    </div>
                                    <span className="text-xs text-emerald-400 flex items-center gap-1 bg-emerald-500/10 px-2 py-1 rounded-full">
                                        <ArrowUpRight className="w-3 h-3" />
                                        +{EXECUTIVE_KPIS.mrr.change}%
                                    </span>
                                </div>
                                <p className="text-4xl font-bold text-white">{formatCurrency(EXECUTIVE_KPIS.mrr.current)}</p>
                                <p className="text-sm text-slate-400 mt-1">Monthly Recurring Revenue</p>
                                <p className="text-xs text-violet-400 mt-2">ARR: {formatCurrency(EXECUTIVE_KPIS.arr.current)}</p>
                            </div>

                            {/* Active Customers */}
                            <div className="bg-gradient-to-br from-emerald-500/20 to-teal-600/20 border border-emerald-500/30 rounded-2xl p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center">
                                        <Users className="w-6 h-6 text-emerald-400" />
                                    </div>
                                    <span className="text-xs text-emerald-400 flex items-center gap-1 bg-emerald-500/10 px-2 py-1 rounded-full">
                                        <ArrowUpRight className="w-3 h-3" />
                                        +{EXECUTIVE_KPIS.customers.change}%
                                    </span>
                                </div>
                                <p className="text-4xl font-bold text-white">{EXECUTIVE_KPIS.customers.current.toLocaleString()}</p>
                                <p className="text-sm text-slate-400 mt-1">Total Customers</p>
                                <div className="flex gap-4 mt-2">
                                    <p className="text-xs text-slate-400">DAU: <span className="text-emerald-400">{EXECUTIVE_KPIS.activeUsers.dau.toLocaleString()}</span></p>
                                    <p className="text-xs text-slate-400">MAU: <span className="text-emerald-400">{EXECUTIVE_KPIS.activeUsers.mau.toLocaleString()}</span></p>
                                </div>
                            </div>

                            {/* Churn Rate */}
                            <div className="bg-gradient-to-br from-blue-500/20 to-cyan-600/20 border border-blue-500/30 rounded-2xl p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                                        <Activity className="w-6 h-6 text-blue-400" />
                                    </div>
                                    <span className="text-xs text-emerald-400 flex items-center gap-1 bg-emerald-500/10 px-2 py-1 rounded-full">
                                        <ArrowDownRight className="w-3 h-3" />
                                        {EXECUTIVE_KPIS.churnRate.change}%
                                    </span>
                                </div>
                                <p className="text-4xl font-bold text-white">{EXECUTIVE_KPIS.churnRate.current}%</p>
                                <p className="text-sm text-slate-400 mt-1">Monthly Churn Rate</p>
                                <div className="flex gap-4 mt-2">
                                    <p className="text-xs text-slate-400">LTV: <span className="text-blue-400">${EXECUTIVE_KPIS.ltv.current}</span></p>
                                    <p className="text-xs text-slate-400">CAC: <span className="text-blue-400">${EXECUTIVE_KPIS.cac.current}</span></p>
                                </div>
                            </div>
                        </div>

                        {/* Charts Row */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Revenue Trend Chart */}
                            <div className="lg:col-span-2 bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
                                <div className="flex items-center justify-between mb-6">
                                    <div>
                                        <h3 className="text-lg font-bold text-white">Revenue Trend</h3>
                                        <p className="text-sm text-slate-400">Last 6 months performance vs target</p>
                                    </div>
                                    <div className="flex gap-4 text-xs">
                                        <span className="flex items-center gap-2">
                                            <span className="w-3 h-3 bg-amber-500 rounded-full" />
                                            Actual
                                        </span>
                                        <span className="flex items-center gap-2 text-slate-400">
                                            <span className="w-3 h-3 bg-slate-600 rounded-full" />
                                            Target
                                        </span>
                                    </div>
                                </div>

                                {/* Simple bar chart visualization */}
                                <div className="flex items-end justify-between h-48 gap-4">
                                    {REVENUE_TREND.map((item, index) => {
                                        const maxValue = Math.max(...REVENUE_TREND.map(r => Math.max(r.revenue, r.target)));
                                        const revenueHeight = (item.revenue / maxValue) * 100;
                                        const targetHeight = (item.target / maxValue) * 100;
                                        const achievedTarget = item.revenue >= item.target;

                                        return (
                                            <div key={item.month} className="flex-1 flex flex-col items-center gap-2">
                                                <div className="w-full flex items-end justify-center gap-1 h-40">
                                                    <div
                                                        className={`w-8 rounded-t-lg transition-all ${achievedTarget ? 'bg-gradient-to-t from-amber-600 to-amber-400' : 'bg-gradient-to-t from-amber-600/60 to-amber-400/60'}`}
                                                        style={{ height: `${revenueHeight}%` }}
                                                    />
                                                    <div
                                                        className="w-2 bg-slate-600 rounded-t-lg"
                                                        style={{ height: `${targetHeight}%` }}
                                                    />
                                                </div>
                                                <p className="text-xs text-slate-400">{item.month}</p>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Revenue by Segment */}
                            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
                                <h3 className="text-lg font-bold text-white mb-2">Revenue by Segment</h3>
                                <p className="text-sm text-slate-400 mb-6">Distribution across pricing tiers</p>

                                <div className="space-y-4">
                                    {REVENUE_SEGMENTS.map((segment) => (
                                        <div key={segment.name}>
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-sm text-white">{segment.name}</span>
                                                <span className="text-sm font-bold text-white">{formatCurrency(segment.value)}</span>
                                            </div>
                                            <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full ${segment.color} rounded-full transition-all`}
                                                    style={{ width: `${segment.percentage}%` }}
                                                />
                                            </div>
                                            <p className="text-xs text-slate-500 mt-1">{segment.percentage}% of total</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Bottom Row - Geographic & Team Performance */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Geographic Distribution */}
                            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
                                <div className="flex items-center justify-between mb-6">
                                    <div>
                                        <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                            <Globe className="w-5 h-5 text-blue-400" />
                                            Geographic Distribution
                                        </h3>
                                        <p className="text-sm text-slate-400">Revenue and growth by region</p>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    {GEO_DISTRIBUTION.map((region) => (
                                        <div key={region.region} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-xl hover:bg-slate-800 transition-colors">
                                            <div className="flex items-center gap-3">
                                                <Map className="w-5 h-5 text-slate-400" />
                                                <div>
                                                    <p className="text-sm font-medium text-white">{region.region}</p>
                                                    <p className="text-xs text-slate-400">{region.users.toLocaleString()} users</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm font-bold text-white">{formatCurrency(region.revenue)}</p>
                                                <p className="text-xs text-emerald-400">+{region.growth}%</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Team Performance */}
                            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
                                <div className="flex items-center justify-between mb-6">
                                    <div>
                                        <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                            <Briefcase className="w-5 h-5 text-violet-400" />
                                            Department Performance
                                        </h3>
                                        <p className="text-sm text-slate-400">Productivity and budget utilization</p>
                                    </div>
                                </div>

                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="text-left border-b border-slate-700">
                                                <th className="pb-3 text-xs font-semibold text-slate-400">Department</th>
                                                <th className="pb-3 text-xs font-semibold text-slate-400 text-center">HC</th>
                                                <th className="pb-3 text-xs font-semibold text-slate-400 text-center">Productivity</th>
                                                <th className="pb-3 text-xs font-semibold text-slate-400 text-right">Budget</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-800">
                                            {TEAM_PERFORMANCE.map((dept) => (
                                                <tr key={dept.department} className="hover:bg-slate-800/30">
                                                    <td className="py-3 text-sm text-white">{dept.department}</td>
                                                    <td className="py-3 text-sm text-slate-400 text-center">{dept.headcount}</td>
                                                    <td className="py-3 text-center">
                                                        <span className={`text-sm font-medium ${dept.productivity >= 100 ? 'text-emerald-400' : 'text-amber-400'}`}>
                                                            {dept.productivity}%
                                                        </span>
                                                    </td>
                                                    <td className="py-3 text-right">
                                                        <span className="text-sm text-white">${dept.spent}M</span>
                                                        <span className="text-xs text-slate-500"> / ${dept.budget}M</span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>

                        {/* Strategic Alerts */}
                        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                        <AlertTriangle className="w-5 h-5 text-amber-400" />
                                        Strategic Alerts & Insights
                                    </h3>
                                    <p className="text-sm text-slate-400">Critical items requiring executive attention</p>
                                </div>
                                <button className="text-sm text-violet-400 hover:text-violet-300 transition-colors">
                                    View All Alerts
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                {STRATEGIC_ALERTS.map((alert) => (
                                    <div
                                        key={alert.id}
                                        className={`p-4 rounded-xl border ${alert.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/30' :
                                            alert.type === 'warning' ? 'bg-amber-500/10 border-amber-500/30' :
                                                'bg-blue-500/10 border-blue-500/30'
                                            }`}
                                    >
                                        <div className="flex items-start gap-3">
                                            {alert.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-400 mt-0.5" />}
                                            {alert.type === 'warning' && <AlertTriangle className="w-5 h-5 text-amber-400 mt-0.5" />}
                                            {alert.type === 'info' && <Activity className="w-5 h-5 text-blue-400 mt-0.5" />}
                                            <div>
                                                <p className="text-sm font-medium text-white">{alert.title}</p>
                                                <p className="text-xs text-slate-400 mt-1">{alert.message}</p>
                                                <div className="flex items-center gap-2 mt-2">
                                                    <span className="text-xs text-slate-500">{alert.time}</span>
                                                    <span className={`text-xs px-2 py-0.5 rounded-full ${alert.priority === 'critical' ? 'bg-red-500/20 text-red-400' :
                                                        alert.priority === 'high' ? 'bg-amber-500/20 text-amber-400' :
                                                            'bg-blue-500/20 text-blue-400'
                                                        }`}>
                                                        {alert.priority}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* NPS Score Card */}
                        <div className="bg-gradient-to-r from-violet-500/20 via-purple-500/20 to-pink-500/20 border border-violet-500/30 rounded-2xl p-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-6">
                                    <div className="w-20 h-20 bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl flex items-center justify-center">
                                        <Heart className="w-10 h-10 text-white" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-slate-400">Net Promoter Score</p>
                                        <div className="flex items-baseline gap-3">
                                            <p className="text-5xl font-bold text-white">{EXECUTIVE_KPIS.nps.current}</p>
                                            <span className="text-lg text-emerald-400 flex items-center gap-1">
                                                <ArrowUpRight className="w-5 h-5" />
                                                +{EXECUTIVE_KPIS.nps.change}%
                                            </span>
                                        </div>
                                        <p className="text-sm text-slate-400 mt-1">Excellent customer satisfaction level</p>
                                    </div>
                                </div>
                                <div className="hidden lg:flex items-center gap-8">
                                    <div className="text-center">
                                        <p className="text-3xl font-bold text-emerald-400">68%</p>
                                        <p className="text-xs text-slate-400">Promoters</p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-3xl font-bold text-amber-400">28%</p>
                                        <p className="text-xs text-slate-400">Passives</p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-3xl font-bold text-red-400">4%</p>
                                        <p className="text-xs text-slate-400">Detractors</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'financial' && (
                    <div className="space-y-6">
                        {/* CFO Top Metrics */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
                                <p className="text-sm text-slate-400 mb-1">Cash on Hand</p>
                                <p className="text-3xl font-bold text-white">$4.2M</p>
                                <p className="text-xs text-emerald-400 mt-2 flex items-center gap-1">
                                    <ArrowUpRight className="w-3 h-3" />
                                    +$1.2M from seed round
                                </p>
                            </div>
                            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
                                <p className="text-sm text-slate-400 mb-1">Burn Rate (Monthly)</p>
                                <p className="text-3xl font-bold text-white">$185K</p>
                                <p className="text-xs text-amber-400 mt-2 flex items-center gap-1">
                                    <Activity className="w-3 h-3" />
                                    Optimizing cloud costs
                                </p>
                            </div>
                            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
                                <p className="text-sm text-slate-400 mb-1">Runway</p>
                                <p className="text-3xl font-bold text-white">22.7 Months</p>
                                <p className="text-xs text-blue-400 mt-2 flex items-center gap-1">
                                    <Shield className="w-3 h-3" />
                                    Highly sustainable
                                </p>
                            </div>
                        </div>

                        {/* Revenue Breakdown */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
                                <h3 className="text-lg font-bold text-white mb-4">LTV : CAC Analysis</h3>
                                <div className="space-y-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-slate-400">Customer Lifetime Value</p>
                                            <p className="text-2xl font-bold text-white">$4,850</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm text-slate-400">Acquisition Cost</p>
                                            <p className="text-2xl font-bold text-white">$285</p>
                                        </div>
                                    </div>
                                    <div className="h-4 bg-slate-800 rounded-full overflow-hidden flex">
                                        <div className="h-full bg-emerald-500 w-[95%]" />
                                        <div className="h-full bg-amber-500 w-[5%]" />
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <p className="text-sm font-semibold text-emerald-400">Ratio: 17:1</p>
                                        <p className="text-xs text-slate-500">Industry Benchmark: 3:1</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
                                <h3 className="text-lg font-bold text-white mb-4">Subscription Growth</h3>
                                <div className="space-y-4">
                                    {[
                                        { plan: 'Enterprise Suite', mrr: '$245,600', growth: '+12.5%', color: 'bg-violet-500' },
                                        { plan: 'Professional', mrr: '$156,200', growth: '+18.2%', color: 'bg-blue-500' },
                                        { plan: 'Startup', mrr: '$76,400', growth: '+32.4%', color: 'bg-emerald-500' },
                                    ].map((plan) => (
                                        <div key={plan.plan} className="flex items-center justify-between p-3 bg-slate-800/30 rounded-xl">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-2 h-8 rounded-full ${plan.color}`} />
                                                <p className="text-sm font-medium text-white">{plan.plan}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm font-bold text-white">{plan.mrr}</p>
                                                <p className="text-xs text-emerald-400">{plan.growth}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'operations' && (
                    <div className="space-y-6">
                        {/* Infrastructure Health */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            {[
                                { label: 'API Latency', value: '42ms', status: 'optimal', icon: Zap },
                                { label: 'Sync Success', value: '99.98%', status: 'optimal', icon: RefreshCw },
                                { label: 'Database Load', value: '24%', status: 'low', icon: Database },
                                { label: 'Active Agents', value: '450+', status: 'scaling', icon: Bot },
                            ].map((stat) => (
                                <div key={stat.label} className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
                                    <div className="flex items-center gap-2 text-slate-400 mb-2">
                                        <stat.icon className="w-4 h-4" />
                                        <span className="text-xs font-medium uppercase tracking-wider">{stat.label}</span>
                                    </div>
                                    <div className="flex items-baseline justify-between">
                                        <p className="text-2xl font-bold text-white">{stat.value}</p>
                                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                            {stat.status}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Pipeline Status */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <div className="lg:col-span-2 bg-slate-900 border border-slate-800 p-6 rounded-2xl">
                                <h3 className="text-lg font-bold text-white mb-6">Operations Pipeline Efficiency</h3>
                                <div className="space-y-8">
                                    {[
                                        { stage: 'Data Ingestion', efficiency: 98, load: 45, lag: '0.2s' },
                                        { stage: 'AI Processing', efficiency: 85, load: 78, lag: '4.5s' },
                                        { stage: 'Content Distribution', efficiency: 99, load: 12, lag: '0.1s' },
                                        { stage: 'Analytics Indexing', efficiency: 94, load: 62, lag: '1.2s' },
                                    ].map((stage) => (
                                        <div key={stage.stage} className="relative">
                                            <div className="flex justify-between items-center mb-2">
                                                <p className="text-sm font-medium text-white">{stage.stage}</p>
                                                <p className="text-xs text-slate-400">Lag: <span className="text-emerald-400">{stage.lag}</span></p>
                                            </div>
                                            <div className="h-2 bg-slate-800 rounded-full">
                                                <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${stage.efficiency}%` }} />
                                            </div>
                                            <div className="flex justify-between mt-1 text-[10px] text-slate-500 uppercase tracking-tighter">
                                                <span>Efficiency: {stage.efficiency}%</span>
                                                <span>System Load: {stage.load}%</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
                                <h3 className="text-lg font-bold text-white mb-4">Resource Allocation</h3>
                                <div className="space-y-6">
                                    <div className="flex flex-col items-center justify-center py-8">
                                        <div className="w-32 h-32 rounded-full border-8 border-slate-800 border-t-indigo-500 border-r-emerald-500 flex items-center justify-center relative">
                                            <p className="text-xl font-bold text-white">82%</p>
                                            <p className="absolute -bottom-6 text-[10px] text-slate-400 uppercase">Utilized</p>
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between text-xs">
                                            <span className="flex items-center gap-2"><span className="w-2 h-2 bg-indigo-500 rounded-full" /> AI Compute</span>
                                            <span className="text-white font-bold">45%</span>
                                        </div>
                                        <div className="flex items-center justify-between text-xs">
                                            <span className="flex items-center gap-2"><span className="w-2 h-2 bg-emerald-500 rounded-full" /> Data Storage</span>
                                            <span className="text-white font-bold">25%</span>
                                        </div>
                                        <div className="flex items-center justify-between text-xs">
                                            <span className="flex items-center gap-2"><span className="w-2 h-2 bg-amber-500 rounded-full" /> API Services</span>
                                            <span className="text-white font-bold">12%</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'strategic' && (
                    <div className="space-y-6">
                        {/* Data Scientist Insights */}
                        <div className="bg-gradient-to-br from-indigo-500/10 to-violet-500/10 border border-indigo-500/20 p-8 rounded-3xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-8 opacity-10">
                                <Cpu className="w-48 h-48" />
                            </div>
                            <div className="relative z-10">
                                <h2 className="text-2xl font-bold text-white mb-2">Predictive Growth Intelligence</h2>
                                <p className="text-slate-400 max-w-2xl mb-8">AI-driven analysis of market trends and internal performance metrics forecasting the next 6 months.</p>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-2 text-indigo-400">
                                            <Target className="w-5 h-5" />
                                            <h4 className="font-bold">Conversion Forecast</h4>
                                        </div>
                                        <p className="text-3xl font-bold text-white">+18.4%</p>
                                        <p className="text-sm text-slate-500">Predicted increase in lead-to-customer conversion by Q2 2026 based on current engagement velocity.</p>
                                    </div>
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-2 text-emerald-400">
                                            <TrendingUp className="w-5 h-5" />
                                            <h4 className="font-bold">Expansion Opportunity</h4>
                                        </div>
                                        <p className="text-3xl font-bold text-white">$450K</p>
                                        <p className="text-sm text-slate-500">Uncapped revenue potential identified in the mid-market segment via AI-driven upsell triggers.</p>
                                    </div>
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-2 text-amber-400">
                                            <Shield className="w-5 h-5" />
                                            <h4 className="font-bold">Risk Probability</h4>
                                        </div>
                                        <p className="text-3xl font-bold text-white">4.2%</p>
                                        <p className="text-sm text-slate-500">Predicted churn probability for top-tier accounts, down 2.1% from previous quarter's model.</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Intelligence Feed */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
                                <h3 className="text-lg font-bold text-white mb-4">Model Performance</h3>
                                <div className="space-y-4">
                                    {[
                                        { name: 'Sentiment Analysis', accuracy: 94.2, status: 'stable' },
                                        { name: 'Predictive Churn', accuracy: 89.5, status: 'improving' },
                                        { name: 'Lead Scoring', accuracy: 91.8, status: 'stable' },
                                        { name: 'Content Relevance', accuracy: 96.4, status: 'optimal' },
                                    ].map((m) => (
                                        <div key={m.name} className="flex flex-col gap-1">
                                            <div className="flex justify-between text-xs">
                                                <span className="text-slate-400">{m.name}</span>
                                                <span className="text-white font-mono">{m.accuracy}%</span>
                                            </div>
                                            <div className="h-1.5 bg-slate-800 rounded-full">
                                                <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${m.accuracy}%` }} />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl lg:col-span-2">
                                <h3 className="text-lg font-bold text-white mb-4">Strategic Recommendations</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="p-4 bg-indigo-500/5 border border-indigo-500/20 rounded-xl">
                                        <Star className="w-5 h-5 text-indigo-400 mb-2" />
                                        <p className="text-sm font-bold text-white mb-1">Scale Vertical: FinTech</p>
                                        <p className="text-xs text-slate-400">Data patterns show 3x higher ROI for FinTech campaigns. Recommend allocating 20% more compute resources.</p>
                                    </div>
                                    <div className="p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-xl">
                                        <ArrowRight className="w-5 h-5 text-emerald-400 mb-2" />
                                        <p className="text-sm font-bold text-white mb-1">Feature Priority: Video AI</p>
                                        <p className="text-xs text-slate-400">Video content engagement is up 45%. Redirect engineering focus to enhancing the video generation pipeline.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'reports' && (
                    <div className="flex items-center justify-center h-96">
                        <div className="text-center">
                            <FileText className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                            <h3 className="text-xl font-bold text-white mb-2">Executive Reports</h3>
                            <p className="text-slate-400">Board-ready reports and investor decks</p>
                            <p className="text-sm text-violet-400 mt-4">Coming in next release</p>
                        </div>
                    </div>
                )}
            </main>

            {/* Footer */}
            <footer className="border-t border-slate-800 px-6 py-4 bg-slate-900/50">
                <div className="flex items-center justify-between text-xs text-slate-500">
                    <p>© 2026 DigitalMEng Enterprise. Executive Suite v2.0</p>
                    <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1">
                            <Wifi className="w-4 h-4 text-emerald-500" />
                            Real-time data sync
                        </span>
                        <span className="flex items-center gap-1">
                            <Shield className="w-4 h-4 text-blue-500" />
                            Enterprise Security
                        </span>
                        <span>Session: {session?.loginTime ? new Date(session.loginTime).toLocaleTimeString() : 'N/A'}</span>
                    </div>
                </div>
            </footer>
        </div>
    );
}
