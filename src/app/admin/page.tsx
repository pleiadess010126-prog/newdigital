'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/AuthContext';
import {
    Users,
    CreditCard,
    BarChart3,
    Settings,
    Shield,
    AlertTriangle,
    CheckCircle2,
    XCircle,
    TrendingUp,
    TrendingDown,
    DollarSign,
    Activity,
    Server,
    Database,
    Cpu,
    HardDrive,
    Globe,
    Mail,
    Bell,
    Search,
    Filter,
    MoreVertical,
    Eye,
    Edit,
    Trash2,
    UserPlus,
    Download,
    Upload,
    RefreshCw,
    Clock,
    Zap,
    Video,
    Image as ImageIcon,
    Mic,
    ChevronDown,
    ArrowUpRight,
    ArrowDownRight,
    LogOut,
    Home,
    Loader2,
    Gift,
    Brain
} from 'lucide-react';
import AdminAffiliatePanel from '@/components/AdminAffiliatePanel';
import ASINeuralCore from '@/components/ASINeuralCore';

// API Test Status types
type TestStatus = 'idle' | 'testing' | 'success' | 'error';

interface ApiTestResult {
    status: TestStatus;
    message?: string;
}

// Mock admin data
const mockStats = {
    totalUsers: 12847,
    activeUsers: 8932,
    newUsersToday: 156,
    totalRevenue: 284750,
    revenueThisMonth: 47820,
    revenueGrowth: 23.5,
    contentGenerated: 1247890,
    apiCallsToday: 892456,
    systemHealth: 99.7,
    activeSubscriptions: 4823,
};

const mockUsers = [
    { id: 1, name: 'Sarah Johnson', email: 'sarah@startup.io', plan: 'pro', status: 'active', joined: '2024-11-15', revenue: 597, contentCount: 234 },
    { id: 2, name: 'Mike Chen', email: 'mike@agency.com', plan: 'enterprise', status: 'active', joined: '2024-10-22', revenue: 1797, contentCount: 1892 },
    { id: 3, name: 'Emily Davis', email: 'emily@brand.co', plan: 'starter', status: 'active', joined: '2024-12-01', revenue: 237, contentCount: 67 },
    { id: 4, name: 'Alex Kumar', email: 'alex@solo.dev', plan: 'free', status: 'active', joined: '2024-12-15', revenue: 0, contentCount: 8 },
    { id: 5, name: 'Jessica Park', email: 'jessica@media.io', plan: 'pro', status: 'suspended', joined: '2024-09-10', revenue: 398, contentCount: 156 },
    { id: 6, name: 'David Wilson', email: 'david@corp.com', plan: 'enterprise', status: 'active', joined: '2024-08-05', revenue: 3594, contentCount: 4521 },
    { id: 7, name: 'Lisa Thompson', email: 'lisa@creative.co', plan: 'starter', status: 'active', joined: '2024-12-20', revenue: 79, contentCount: 23 },
    { id: 8, name: 'Ryan Martinez', email: 'ryan@tech.io', plan: 'pro', status: 'active', joined: '2024-11-28', revenue: 199, contentCount: 89 },
];

const mockAlerts = [
    { id: 1, type: 'warning', message: 'API rate limit approaching for 3 enterprise users', time: '5 min ago' },
    { id: 2, type: 'error', message: 'Payment failed for user mike@agency.com', time: '23 min ago' },
    { id: 3, type: 'info', message: 'System backup completed successfully', time: '1 hour ago' },
    { id: 4, type: 'success', message: 'New enterprise signup: corp.com', time: '2 hours ago' },
];

const mockApiUsage = [
    { provider: 'OpenAI', calls: 156789, cost: 4892.50, status: 'healthy' },
    { provider: 'ElevenLabs', calls: 45672, cost: 1245.30, status: 'healthy' },
    { provider: 'D-ID', calls: 12890, cost: 3560.00, status: 'warning' },
    { provider: 'Stability AI', calls: 28934, cost: 890.45, status: 'healthy' },
];

// Mock Staff Data (Internal DigitalMEng Team)
const mockStaff = [
    { id: 101, name: 'Priya Admin', email: 'admin@digitalmeng.com', role: 'superadmin', department: 'Management', status: 'active', joined: '2024-01-15', lastActive: '2026-01-15' },
    { id: 102, name: 'Support Team Lead', email: 'support@digitalmeng.com', role: 'support', department: 'Support', status: 'active', joined: '2024-03-01', lastActive: '2026-01-15' },
    { id: 103, name: 'John Developer', email: 'john.dev@digitalmeng.com', role: 'admin', department: 'Engineering', status: 'active', joined: '2024-02-10', lastActive: '2026-01-14' },
    { id: 104, name: 'Sarah Support', email: 'sarah.support@digitalmeng.com', role: 'support', department: 'Support', status: 'active', joined: '2024-06-20', lastActive: '2026-01-15' },
    { id: 105, name: 'Mike Moderator', email: 'mike.mod@digitalmeng.com', role: 'editor', department: 'Content', status: 'active', joined: '2024-08-15', lastActive: '2026-01-13' },
    { id: 106, name: 'Lisa Analytics', email: 'lisa@digitalmeng.com', role: 'viewer', department: 'Analytics', status: 'inactive', joined: '2024-05-01', lastActive: '2025-12-20' },
];

type AdminTab = 'overview' | 'customers' | 'staff' | 'billing' | 'analytics' | 'affiliates' | 'system' | 'settings' | 'asi';

export default function AdminPage() {
    const router = useRouter();
    const { user, isAuthenticated } = useAuth();
    const [activeTab, setActiveTab] = useState<AdminTab>('overview');
    const [searchQuery, setSearchQuery] = useState('');
    const [userFilter, setUserFilter] = useState('all');
    const [staffFilter, setStaffFilter] = useState('all');
    const [selectedUsers, setSelectedUsers] = useState<number[]>([]);

    // Customer Management Modal States
    const [showAddUserModal, setShowAddUserModal] = useState(false);
    const [showViewUserModal, setShowViewUserModal] = useState(false);
    const [showEditUserModal, setShowEditUserModal] = useState(false);
    const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
    const [selectedUserForAction, setSelectedUserForAction] = useState<typeof mockUsers[0] | null>(null);
    const [usersList, setUsersList] = useState(mockUsers);
    const [userFormData, setUserFormData] = useState({
        name: '',
        email: '',
        plan: 'free',
        status: 'active',
        role: 'viewer',
    });

    // Staff Management Modal States
    const [showAddStaffModal, setShowAddStaffModal] = useState(false);
    const [showViewStaffModal, setShowViewStaffModal] = useState(false);
    const [showEditStaffModal, setShowEditStaffModal] = useState(false);
    const [showDeleteStaffModal, setShowDeleteStaffModal] = useState(false);
    const [selectedStaffForAction, setSelectedStaffForAction] = useState<typeof mockStaff[0] | null>(null);
    const [staffList, setStaffList] = useState(mockStaff);
    const [staffFormData, setStaffFormData] = useState({
        name: '',
        email: '',
        role: 'viewer',
        department: 'Support',
        status: 'active',
    });

    // API Key States
    const [apiKeys, setApiKeys] = useState({
        openai: '',
        anthropic: '',
        did: '',
        synthesia: '',
        pictory: '',
        elevenlabs: '',
        stabilityai: '',
    });

    // Razorpay Keys State
    const [razorpayKeys, setRazorpayKeys] = useState({
        keyId: '',
        keySecret: '',
        webhookSecret: '',
    });

    // Test Status States
    const [testResults, setTestResults] = useState<Record<string, ApiTestResult>>({
        openai: { status: 'idle' },
        anthropic: { status: 'idle' },
        did: { status: 'idle' },
        synthesia: { status: 'idle' },
        pictory: { status: 'idle' },
        elevenlabs: { status: 'idle' },
        stabilityai: { status: 'idle' },
        razorpay: { status: 'idle' },
    });

    // API Balance State
    interface ApiBalance {
        service: string;
        status: 'active' | 'inactive' | 'low' | 'error';
        balance?: number;
        used?: number;
        limit?: number;
        unit: string;
        percentage: number;
        message?: string;
    }

    const [apiBalances, setApiBalances] = useState<ApiBalance[]>([]);
    const [balancesLoading, setBalancesLoading] = useState(false);
    const [lastBalanceUpdate, setLastBalanceUpdate] = useState<string | null>(null);

    // Toast notification state
    const [toast, setToast] = useState<{ show: boolean; message: string; type: 'success' | 'error' | 'info' }>({
        show: false,
        message: '',
        type: 'info',
    });

    // Show toast notification
    const showToast = (message: string, type: 'success' | 'error' | 'info') => {
        setToast({ show: true, message, type });
        setTimeout(() => setToast({ show: false, message: '', type: 'info' }), 4000);
    };

    // Test individual API connection - calls real API endpoint
    const testApiConnection = async (service: string, apiKey: string) => {
        if (!apiKey || apiKey.trim() === '') {
            showToast(`Please enter an API key for ${service} first`, 'error');
            return;
        }

        setTestResults(prev => ({
            ...prev,
            [service]: { status: 'testing' },
        }));

        try {
            // Call the real API test endpoint
            const response = await fetch('/api/test-connection', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ service, apiKey }),
            });

            const result = await response.json();

            setTestResults(prev => ({
                ...prev,
                [service]: {
                    status: result.success ? 'success' : 'error',
                    message: result.message
                },
            }));

            // Show toast with message and any additional details
            let toastMessage = result.message;
            if (result.success && result.details) {
                // Add relevant details to the message
                if (result.details.modelsAvailable) {
                    toastMessage += ` (${result.details.modelsAvailable} models available)`;
                }
                if (result.details.voicesAvailable) {
                    toastMessage += ` (${result.details.voicesAvailable} voices available)`;
                }
                if (result.details.subscription) {
                    toastMessage += ` (Tier: ${result.details.subscription})`;
                }
                if (result.details.credits !== undefined) {
                    toastMessage += ` (Credits: ${result.details.credits})`;
                }
                if (result.details.remainingCredits) {
                    toastMessage += ` (Remaining: ${result.details.remainingCredits})`;
                }
            }

            showToast(toastMessage, result.success ? 'success' : 'error');
        } catch (error) {
            setTestResults(prev => ({
                ...prev,
                [service]: { status: 'error', message: 'Connection failed - Network error' },
            }));
            showToast(`Failed to test ${service} connection - Network error`, 'error');
        }
    };

    // Test all connections
    const testAllConnections = async () => {
        showToast('Testing all API connections...', 'info');

        const services = Object.keys(apiKeys) as (keyof typeof apiKeys)[];
        for (const service of services) {
            if (apiKeys[service]) {
                await testApiConnection(service, apiKeys[service]);
            }
        }

        showToast('All connections tested!', 'success');
    };

    // Test Razorpay connection
    const testRazorpayConnection = async () => {
        if (!razorpayKeys.keyId || !razorpayKeys.keySecret) {
            showToast('Please enter Razorpay Key ID and Key Secret first', 'error');
            return;
        }

        setTestResults(prev => ({
            ...prev,
            razorpay: { status: 'testing' },
        }));

        try {
            const response = await fetch('/api/razorpay/test-connection', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    keyId: razorpayKeys.keyId,
                    keySecret: razorpayKeys.keySecret,
                }),
            });

            const result = await response.json();

            setTestResults(prev => ({
                ...prev,
                razorpay: {
                    status: result.success ? 'success' : 'error',
                    message: result.message
                },
            }));

            let toastMessage = result.message;
            if (result.success && result.details) {
                toastMessage += ` (${result.details.totalOrders} orders found)`;
            }

            showToast(toastMessage, result.success ? 'success' : 'error');
        } catch (error) {
            setTestResults(prev => ({
                ...prev,
                razorpay: { status: 'error', message: 'Connection failed - Network error' },
            }));
            showToast('Failed to test Razorpay connection - Network error', 'error');
        }
    };

    // Handle Razorpay key change
    const handleRazorpayKeyChange = (field: keyof typeof razorpayKeys, value: string) => {
        setRazorpayKeys(prev => ({
            ...prev,
            [field]: value,
        }));
        // Reset test status when key changes
        setTestResults(prev => ({
            ...prev,
            razorpay: { status: 'idle' },
        }));
    };

    // Handle API key change
    const handleApiKeyChange = (service: keyof typeof apiKeys, value: string) => {
        setApiKeys(prev => ({
            ...prev,
            [service]: value,
        }));
        // Reset test status when key changes
        setTestResults(prev => ({
            ...prev,
            [service]: { status: 'idle' },
        }));
    };

    // Get button style based on test status
    const getTestButtonStyle = (status: TestStatus) => {
        switch (status) {
            case 'testing':
                return 'bg-blue-500/20 text-blue-400 cursor-wait';
            case 'success':
                return 'bg-emerald-500/20 text-emerald-400';
            case 'error':
                return 'bg-red-500/20 text-red-400';
            default:
                return 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30';
        }
    };

    // Fetch API balances from all services
    const fetchApiBalances = async () => {
        setBalancesLoading(true);
        try {
            // Only send keys that are actually configured (non-empty strings)
            const openaiKey = apiKeys.openai || process.env.NEXT_PUBLIC_OPENAI_API_KEY || '';
            const anthropicKey = apiKeys.anthropic || process.env.NEXT_PUBLIC_ANTHROPIC_API_KEY || '';
            const elevenlabsKey = apiKeys.elevenlabs || process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY || '';
            const didKey = apiKeys.did || process.env.NEXT_PUBLIC_DID_API_KEY || '';
            const stabilityKey = apiKeys.stabilityai || process.env.NEXT_PUBLIC_STABILITY_API_KEY || '';
            const razorpayKeyId = razorpayKeys.keyId || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || '';
            const razorpayKeySecret = razorpayKeys.keySecret || '';

            const response = await fetch('/api/billing/balances', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    // Only send if the key is non-empty
                    openaiKey: openaiKey.trim() || undefined,
                    anthropicKey: anthropicKey.trim() || undefined,
                    elevenlabsKey: elevenlabsKey.trim() || undefined,
                    didKey: didKey.trim() || undefined,
                    stabilityKey: stabilityKey.trim() || undefined,
                    razorpayKeyId: razorpayKeyId.trim() || undefined,
                    razorpayKeySecret: razorpayKeySecret.trim() || undefined,
                }),
            });

            const result = await response.json();

            if (result.success) {
                setApiBalances(result.balances);
                setLastBalanceUpdate(result.fetchedAt);
                showToast('API balances updated successfully', 'success');
            } else {
                showToast('Failed to fetch some balances', 'error');
            }
        } catch (error) {
            showToast('Failed to fetch API balances', 'error');
        } finally {
            setBalancesLoading(false);
        }
    };

    // Get balance for a specific service
    const getBalance = (serviceName: string): ApiBalance | undefined => {
        return apiBalances.find(b => b.service === serviceName);
    };

    // Get status badge color
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active':
                return 'bg-emerald-500/20 text-emerald-400';
            case 'low':
                return 'bg-amber-500/20 text-amber-400';
            case 'error':
                return 'bg-red-500/20 text-red-400';
            default:
                return 'bg-slate-500/20 text-slate-400';
        }
    };

    // Get progress bar color
    const getProgressColor = (status: string) => {
        switch (status) {
            case 'active':
                return 'bg-emerald-500';
            case 'low':
                return 'bg-amber-500';
            case 'error':
                return 'bg-red-500';
            default:
                return 'bg-slate-500';
        }
    };

    // Check admin access
    useEffect(() => {
        // In production, check if user is admin
        // if (!user?.isAdmin) router.push('/dashboard');
    }, [user, router]);

    const tabs = [
        { id: 'overview' as AdminTab, label: 'Overview', icon: BarChart3 },
        { id: 'asi' as AdminTab, label: 'ASI Core', icon: Brain },
        { id: 'customers' as AdminTab, label: 'Customers', icon: Users },
        { id: 'staff' as AdminTab, label: 'Staff', icon: Shield },
        { id: 'billing' as AdminTab, label: 'Billing', icon: CreditCard },
        { id: 'analytics' as AdminTab, label: 'Analytics', icon: TrendingUp },
        { id: 'affiliates' as AdminTab, label: 'Affiliates', icon: Gift },
        { id: 'system' as AdminTab, label: 'System', icon: Server },
        { id: 'settings' as AdminTab, label: 'Settings', icon: Settings },
    ];

    // User Management Handlers
    const handleViewUser = (u: typeof mockUsers[0]) => {
        setSelectedUserForAction(u);
        setShowViewUserModal(true);
    };

    const handleEditUser = (u: typeof mockUsers[0]) => {
        setSelectedUserForAction(u);
        setUserFormData({
            name: u.name,
            email: u.email,
            plan: u.plan,
            status: u.status,
            role: 'viewer',
        });
        setShowEditUserModal(true);
    };

    const handleDeleteUser = (u: typeof mockUsers[0]) => {
        setSelectedUserForAction(u);
        setShowDeleteConfirmModal(true);
    };

    const handleAddUser = () => {
        setUserFormData({
            name: '',
            email: '',
            plan: 'free',
            status: 'active',
            role: 'viewer',
        });
        setShowAddUserModal(true);
    };

    const handleSaveNewUser = () => {
        if (!userFormData.name || !userFormData.email) {
            showToast('Please fill in all required fields', 'error');
            return;
        }

        const newUser = {
            id: Math.max(...usersList.map(u => u.id)) + 1,
            name: userFormData.name,
            email: userFormData.email,
            plan: userFormData.plan as 'free' | 'starter' | 'pro' | 'enterprise',
            status: userFormData.status as 'active' | 'suspended',
            joined: new Date().toISOString().split('T')[0],
            revenue: 0,
            contentCount: 0,
        };

        setUsersList([newUser, ...usersList]);
        setShowAddUserModal(false);
        showToast(`User "${newUser.name}" created successfully!`, 'success');
    };

    const handleSaveEditUser = () => {
        if (!selectedUserForAction) return;

        setUsersList(usersList.map(u =>
            u.id === selectedUserForAction.id
                ? {
                    ...u,
                    name: userFormData.name,
                    email: userFormData.email,
                    plan: userFormData.plan as typeof u.plan,
                    status: userFormData.status as typeof u.status,
                }
                : u
        ));

        setShowEditUserModal(false);
        showToast(`User "${userFormData.name}" updated successfully!`, 'success');
    };

    const handleConfirmDelete = () => {
        if (!selectedUserForAction) return;

        setUsersList(usersList.filter(u => u.id !== selectedUserForAction.id));
        setShowDeleteConfirmModal(false);
        showToast(`Customer "${selectedUserForAction.name}" removed successfully!`, 'success');
    };

    // Staff Management Handlers
    const handleViewStaff = (s: typeof mockStaff[0]) => {
        setSelectedStaffForAction(s);
        setShowViewStaffModal(true);
    };

    const handleEditStaff = (s: typeof mockStaff[0]) => {
        setSelectedStaffForAction(s);
        setStaffFormData({
            name: s.name,
            email: s.email,
            role: s.role,
            department: s.department,
            status: s.status,
        });
        setShowEditStaffModal(true);
    };

    const handleDeleteStaff = (s: typeof mockStaff[0]) => {
        setSelectedStaffForAction(s);
        setShowDeleteStaffModal(true);
    };

    const handleAddStaff = () => {
        setStaffFormData({
            name: '',
            email: '',
            role: 'support',
            department: 'Support',
            status: 'active',
        });
        setShowAddStaffModal(true);
    };

    const handleSaveNewStaff = () => {
        if (!staffFormData.name || !staffFormData.email) {
            showToast('Please fill in all required fields', 'error');
            return;
        }

        const newStaff = {
            id: Math.max(...staffList.map(s => s.id)) + 1,
            name: staffFormData.name,
            email: staffFormData.email,
            role: staffFormData.role as typeof mockStaff[0]['role'],
            department: staffFormData.department,
            status: staffFormData.status as 'active' | 'inactive',
            joined: new Date().toISOString().split('T')[0],
            lastActive: new Date().toISOString().split('T')[0],
        };

        setStaffList([newStaff, ...staffList]);
        setShowAddStaffModal(false);
        showToast(`Staff member "${newStaff.name}" added successfully!`, 'success');
    };

    const handleSaveEditStaff = () => {
        if (!selectedStaffForAction) return;

        setStaffList(staffList.map(s =>
            s.id === selectedStaffForAction.id
                ? {
                    ...s,
                    name: staffFormData.name,
                    email: staffFormData.email,
                    role: staffFormData.role as typeof s.role,
                    department: staffFormData.department,
                    status: staffFormData.status as typeof s.status,
                }
                : s
        ));

        setShowEditStaffModal(false);
        showToast(`Staff member "${staffFormData.name}" updated successfully!`, 'success');
    };

    const handleConfirmDeleteStaff = () => {
        if (!selectedStaffForAction) return;

        setStaffList(staffList.filter(s => s.id !== selectedStaffForAction.id));
        setShowDeleteStaffModal(false);
        showToast(`Staff member "${selectedStaffForAction.name}" removed successfully!`, 'success');
    };

    const filteredUsers = usersList.filter(u => {
        const matchesSearch = u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            u.email.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesFilter = userFilter === 'all' || u.plan === userFilter || u.status === userFilter;
        return matchesSearch && matchesFilter;
    });

    const filteredStaff = staffList.filter(s => {
        const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            s.email.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesFilter = staffFilter === 'all' || s.role === staffFilter || s.department === staffFilter || s.status === staffFilter;
        return matchesSearch && matchesFilter;
    });

    return (
        <div className="min-h-screen bg-slate-900">
            {/* Toast Notification */}
            {toast.show && (
                <div className={`fixed top-4 right-4 z-50 px-6 py-4 rounded-xl shadow-2xl border transition-all duration-300 animate-pulse ${toast.type === 'success' ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400' :
                    toast.type === 'error' ? 'bg-red-500/20 border-red-500/30 text-red-400' :
                        'bg-blue-500/20 border-blue-500/30 text-blue-400'
                    }`}>
                    <div className="flex items-center gap-3">
                        {toast.type === 'success' && <CheckCircle2 className="w-5 h-5" />}
                        {toast.type === 'error' && <XCircle className="w-5 h-5" />}
                        {toast.type === 'info' && <Loader2 className="w-5 h-5 animate-spin" />}
                        <span className="font-medium">{toast.message}</span>
                    </div>
                </div>
            )}
            {/* Top Navigation */}
            <nav className="bg-slate-800 border-b border-slate-700 px-6 py-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center">
                                <Shield className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-lg font-bold text-white">Admin Console</h1>
                                <p className="text-xs text-slate-400">DigitalMEng Management</p>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <button className="relative p-2 text-slate-400 hover:text-white transition-colors">
                            <Bell className="w-5 h-5" />
                            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                        </button>
                        <button
                            onClick={() => router.push('/dashboard')}
                            className="flex items-center gap-2 px-3 py-2 bg-slate-700 hover:bg-slate-600 text-white text-sm rounded-lg transition-colors"
                        >
                            <Home className="w-4 h-4" />
                            Dashboard
                        </button>
                    </div>
                </div>
            </nav>

            <div className="flex">
                {/* Sidebar */}
                <aside className="w-64 bg-slate-800 min-h-[calc(100vh-73px)] border-r border-slate-700 p-4">
                    <div className="space-y-1">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${activeTab === tab.id
                                    ? 'bg-violet-500/20 text-violet-400 border border-violet-500/30'
                                    : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                                    }`}
                            >
                                <tab.icon className="w-5 h-5" />
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* Quick Stats */}
                    <div className="mt-8 p-4 bg-slate-700/50 rounded-xl">
                        <h3 className="text-xs font-semibold text-slate-400 uppercase mb-3">System Status</h3>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-slate-300">Health</span>
                                <span className="text-sm font-bold text-emerald-400">{mockStats.systemHealth}%</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-slate-300">API Calls</span>
                                <span className="text-sm font-bold text-blue-400">{(mockStats.apiCallsToday / 1000).toFixed(0)}K</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-slate-300">Active Users</span>
                                <span className="text-sm font-bold text-purple-400">{mockStats.activeUsers.toLocaleString()}</span>
                            </div>
                        </div>
                    </div>
                </aside>

                {/* Main Content */}
                <main className="flex-1 p-6 overflow-auto">
                    {/* Overview Tab */}
                    {activeTab === 'overview' && (
                        <div className="space-y-6">
                            {/* Stats Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                <div className="bg-gradient-to-br from-violet-500/20 to-purple-600/20 border border-violet-500/30 rounded-2xl p-5">
                                    <div className="flex items-center justify-between mb-3">
                                        <Users className="w-8 h-8 text-violet-400" />
                                        <span className="text-xs text-emerald-400 flex items-center gap-1">
                                            <ArrowUpRight className="w-3 h-3" />
                                            +{mockStats.newUsersToday} today
                                        </span>
                                    </div>
                                    <p className="text-3xl font-bold text-white">{mockStats.totalUsers.toLocaleString()}</p>
                                    <p className="text-sm text-slate-400">Total Users</p>
                                </div>

                                <div className="bg-gradient-to-br from-emerald-500/20 to-teal-600/20 border border-emerald-500/30 rounded-2xl p-5">
                                    <div className="flex items-center justify-between mb-3">
                                        <DollarSign className="w-8 h-8 text-emerald-400" />
                                        <span className="text-xs text-emerald-400 flex items-center gap-1">
                                            <ArrowUpRight className="w-3 h-3" />
                                            +{mockStats.revenueGrowth}%
                                        </span>
                                    </div>
                                    <p className="text-3xl font-bold text-white">${mockStats.revenueThisMonth.toLocaleString()}</p>
                                    <p className="text-sm text-slate-400">Revenue This Month</p>
                                </div>

                                <div className="bg-gradient-to-br from-blue-500/20 to-cyan-600/20 border border-blue-500/30 rounded-2xl p-5">
                                    <div className="flex items-center justify-between mb-3">
                                        <Zap className="w-8 h-8 text-blue-400" />
                                        <span className="text-xs text-blue-400">Active</span>
                                    </div>
                                    <p className="text-3xl font-bold text-white">{mockStats.activeSubscriptions.toLocaleString()}</p>
                                    <p className="text-sm text-slate-400">Active Subscriptions</p>
                                </div>

                                <div className="bg-gradient-to-br from-amber-500/20 to-orange-600/20 border border-amber-500/30 rounded-2xl p-5">
                                    <div className="flex items-center justify-between mb-3">
                                        <Activity className="w-8 h-8 text-amber-400" />
                                        <span className="text-xs text-emerald-400 flex items-center gap-1">
                                            <CheckCircle2 className="w-3 h-3" />
                                            Healthy
                                        </span>
                                    </div>
                                    <p className="text-3xl font-bold text-white">{(mockStats.apiCallsToday / 1000).toFixed(0)}K</p>
                                    <p className="text-sm text-slate-400">API Calls Today</p>
                                </div>
                            </div>

                            {/* Alerts & Recent Activity */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {/* Alerts */}
                                <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <h2 className="text-lg font-bold text-white flex items-center gap-2">
                                            <AlertTriangle className="w-5 h-5 text-amber-400" />
                                            System Alerts
                                        </h2>
                                        <button className="text-sm text-violet-400 hover:text-violet-300">View All</button>
                                    </div>
                                    <div className="space-y-3">
                                        {mockAlerts.map((alert) => (
                                            <div
                                                key={alert.id}
                                                className={`p-3 rounded-xl border ${alert.type === 'error' ? 'bg-red-500/10 border-red-500/30' :
                                                    alert.type === 'warning' ? 'bg-amber-500/10 border-amber-500/30' :
                                                        alert.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/30' :
                                                            'bg-blue-500/10 border-blue-500/30'
                                                    }`}
                                            >
                                                <div className="flex items-start gap-3">
                                                    {alert.type === 'error' && <XCircle className="w-5 h-5 text-red-400 mt-0.5" />}
                                                    {alert.type === 'warning' && <AlertTriangle className="w-5 h-5 text-amber-400 mt-0.5" />}
                                                    {alert.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-400 mt-0.5" />}
                                                    {alert.type === 'info' && <Activity className="w-5 h-5 text-blue-400 mt-0.5" />}
                                                    <div className="flex-1">
                                                        <p className="text-sm text-white">{alert.message}</p>
                                                        <p className="text-xs text-slate-400 mt-1">{alert.time}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* API Provider Usage */}
                                <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <h2 className="text-lg font-bold text-white flex items-center gap-2">
                                            <Globe className="w-5 h-5 text-blue-400" />
                                            API Provider Status
                                        </h2>
                                        <button className="text-sm text-violet-400 hover:text-violet-300">Manage</button>
                                    </div>
                                    <div className="space-y-3">
                                        {mockApiUsage.map((api) => (
                                            <div key={api.provider} className="p-3 bg-slate-700/50 rounded-xl">
                                                <div className="flex items-center justify-between mb-2">
                                                    <div className="flex items-center gap-2">
                                                        <span className={`w-2 h-2 rounded-full ${api.status === 'healthy' ? 'bg-emerald-500' : 'bg-amber-500'
                                                            }`}></span>
                                                        <span className="text-sm font-medium text-white">{api.provider}</span>
                                                    </div>
                                                    <span className="text-sm text-slate-400">${api.cost.toFixed(2)}</span>
                                                </div>
                                                <div className="flex items-center justify-between text-xs text-slate-400">
                                                    <span>{api.calls.toLocaleString()} calls</span>
                                                    <span className={api.status === 'healthy' ? 'text-emerald-400' : 'text-amber-400'}>
                                                        {api.status}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Revenue Chart Placeholder */}
                            <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-lg font-bold text-white">Revenue Overview</h2>
                                    <select className="bg-slate-700 text-white text-sm rounded-lg px-3 py-2 border border-slate-600">
                                        <option>Last 30 days</option>
                                        <option>Last 90 days</option>
                                        <option>This year</option>
                                    </select>
                                </div>
                                <div className="h-64 flex items-center justify-center text-slate-500">
                                    <div className="text-center">
                                        <BarChart3 className="w-12 h-12 mx-auto mb-2 opacity-50" />
                                        <p>Revenue chart visualization</p>
                                        <p className="text-xs">Connect analytics to view data</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ASI Core Tab */}
                    {activeTab === 'asi' && (
                        <div className="h-full">
                            <ASINeuralCore stats={mockStats} />
                        </div>
                    )}

                    {/* Customers Tab - External Subscribers */}
                    {activeTab === 'customers' && (
                        <div className="space-y-6">
                            {/* Customer Management Header */}
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div>
                                    <h2 className="text-2xl font-bold text-white">Customer Management</h2>
                                    <p className="text-slate-400">Manage all subscribers and their subscription plans</p>
                                </div>
                                <div className="flex gap-3">
                                    <button className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors">
                                        <Download className="w-4 h-4" />
                                        Export
                                    </button>
                                    <button
                                        onClick={handleAddUser}
                                        className="flex items-center gap-2 px-4 py-2 bg-violet-500 hover:bg-violet-600 text-white rounded-lg transition-colors"
                                    >
                                        <UserPlus className="w-4 h-4" />
                                        Add Customer
                                    </button>
                                </div>
                            </div>

                            {/* Search and Filters */}
                            <div className="flex flex-col md:flex-row gap-4">
                                <div className="flex-1 relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                    <input
                                        type="text"
                                        placeholder="Search users..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full pl-10 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-violet-500"
                                    />
                                </div>
                                <select
                                    value={userFilter}
                                    onChange={(e) => setUserFilter(e.target.value)}
                                    className="px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-violet-500"
                                >
                                    <option value="all">All Users</option>
                                    <option value="free">Free Plan</option>
                                    <option value="starter">Starter Plan</option>
                                    <option value="pro">Pro Plan</option>
                                    <option value="enterprise">Enterprise</option>
                                    <option value="active">Active</option>
                                    <option value="suspended">Suspended</option>
                                </select>
                            </div>

                            {/* Users Table */}
                            <div className="bg-slate-800 border border-slate-700 rounded-2xl overflow-hidden">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-slate-700">
                                            <th className="px-6 py-4 text-left">
                                                <input
                                                    type="checkbox"
                                                    className="w-4 h-4 rounded border-slate-600 bg-slate-700"
                                                    onChange={(e) => {
                                                        if (e.target.checked) {
                                                            setSelectedUsers(filteredUsers.map(u => u.id));
                                                        } else {
                                                            setSelectedUsers([]);
                                                        }
                                                    }}
                                                />
                                            </th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase">User</th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase">Plan</th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase">Status</th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase">Revenue</th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase">Content</th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase">Joined</th>
                                            <th className="px-6 py-4 text-right text-xs font-semibold text-slate-400 uppercase">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredUsers.map((user) => (
                                            <tr key={user.id} className="border-b border-slate-700/50 hover:bg-slate-700/30">
                                                <td className="px-6 py-4">
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedUsers.includes(user.id)}
                                                        onChange={(e) => {
                                                            if (e.target.checked) {
                                                                setSelectedUsers([...selectedUsers, user.id]);
                                                            } else {
                                                                setSelectedUsers(selectedUsers.filter(id => id !== user.id));
                                                            }
                                                        }}
                                                        className="w-4 h-4 rounded border-slate-600 bg-slate-700"
                                                    />
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                                                            {user.name.charAt(0)}
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-medium text-white">{user.name}</p>
                                                            <p className="text-xs text-slate-400">{user.email}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${user.plan === 'enterprise' ? 'bg-amber-500/20 text-amber-400' :
                                                        user.plan === 'pro' ? 'bg-purple-500/20 text-purple-400' :
                                                            user.plan === 'starter' ? 'bg-blue-500/20 text-blue-400' :
                                                                'bg-slate-500/20 text-slate-400'
                                                        }`}>
                                                        {user.plan.charAt(0).toUpperCase() + user.plan.slice(1)}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`flex items-center gap-1 text-sm ${user.status === 'active' ? 'text-emerald-400' : 'text-red-400'
                                                        }`}>
                                                        <span className={`w-2 h-2 rounded-full ${user.status === 'active' ? 'bg-emerald-500' : 'bg-red-500'
                                                            }`}></span>
                                                        {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="text-sm text-white font-medium">${user.revenue}</span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="text-sm text-slate-400">{user.contentCount}</span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="text-sm text-slate-400">{user.joined}</span>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <button
                                                            onClick={() => handleViewUser(user)}
                                                            className="p-2 hover:bg-slate-600 rounded-lg transition-colors"
                                                            title="View user"
                                                        >
                                                            <Eye className="w-4 h-4 text-slate-400" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleEditUser(user)}
                                                            className="p-2 hover:bg-slate-600 rounded-lg transition-colors"
                                                            title="Edit user"
                                                        >
                                                            <Edit className="w-4 h-4 text-slate-400" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteUser(user)}
                                                            className="p-2 hover:bg-red-500/20 rounded-lg transition-colors"
                                                            title="Delete user"
                                                        >
                                                            <Trash2 className="w-4 h-4 text-red-400" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination */}
                            <div className="flex items-center justify-between">
                                <p className="text-sm text-slate-400">
                                    Showing {filteredUsers.length} of {usersList.length} customers
                                </p>
                                <div className="flex gap-2">
                                    <button className="px-3 py-2 bg-slate-700 text-white rounded-lg text-sm">Previous</button>
                                    <button className="px-3 py-2 bg-violet-500 text-white rounded-lg text-sm">1</button>
                                    <button className="px-3 py-2 bg-slate-700 text-white rounded-lg text-sm">2</button>
                                    <button className="px-3 py-2 bg-slate-700 text-white rounded-lg text-sm">3</button>
                                    <button className="px-3 py-2 bg-slate-700 text-white rounded-lg text-sm">Next</button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Staff Tab - Internal DigitalMEng Team */}
                    {activeTab === 'staff' && (
                        <div className="space-y-6">
                            {/* Staff Management Header */}
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div>
                                    <h2 className="text-2xl font-bold text-white">Staff Management</h2>
                                    <p className="text-slate-400">Manage internal DigitalMEng team members</p>
                                </div>
                                <div className="flex gap-3">
                                    <button className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors">
                                        <Download className="w-4 h-4" />
                                        Export
                                    </button>
                                    <button
                                        onClick={handleAddStaff}
                                        className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-colors"
                                    >
                                        <UserPlus className="w-4 h-4" />
                                        Add Staff Member
                                    </button>
                                </div>
                            </div>

                            {/* Search and Filters */}
                            <div className="flex flex-col md:flex-row gap-4">
                                <div className="flex-1 relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                    <input
                                        type="text"
                                        placeholder="Search staff..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full pl-10 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500"
                                    />
                                </div>
                                <select
                                    value={staffFilter}
                                    onChange={(e) => setStaffFilter(e.target.value)}
                                    className="px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                                >
                                    <option value="all">All Staff</option>
                                    <option value="superadmin">Superadmin</option>
                                    <option value="admin">Admin</option>
                                    <option value="support">Support</option>
                                    <option value="editor">Editor</option>
                                    <option value="viewer">Viewer</option>
                                    <option value="active">Active</option>
                                    <option value="inactive">Inactive</option>
                                </select>
                            </div>

                            {/* Staff Table */}
                            <div className="bg-slate-800 border border-slate-700 rounded-2xl overflow-hidden">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-slate-700">
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase">Staff Member</th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase">Role</th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase">Department</th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase">Status</th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase">Joined</th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase">Last Active</th>
                                            <th className="px-6 py-4 text-right text-xs font-semibold text-slate-400 uppercase">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredStaff.map((staff) => (
                                            <tr key={staff.id} className="border-b border-slate-700/50 hover:bg-slate-700/30">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center text-white font-bold">
                                                            {staff.name.charAt(0)}
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-medium text-white">{staff.name}</p>
                                                            <p className="text-xs text-slate-400">{staff.email}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${staff.role === 'superadmin' ? 'bg-amber-500/20 text-amber-400' :
                                                        staff.role === 'admin' ? 'bg-purple-500/20 text-purple-400' :
                                                            staff.role === 'support' ? 'bg-emerald-500/20 text-emerald-400' :
                                                                staff.role === 'editor' ? 'bg-blue-500/20 text-blue-400' :
                                                                    'bg-slate-500/20 text-slate-400'
                                                        }`}>
                                                        {staff.role.charAt(0).toUpperCase() + staff.role.slice(1)}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="text-sm text-white">{staff.department}</span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`flex items-center gap-1 text-sm ${staff.status === 'active' ? 'text-emerald-400' : 'text-slate-400'
                                                        }`}>
                                                        <span className={`w-2 h-2 rounded-full ${staff.status === 'active' ? 'bg-emerald-500' : 'bg-slate-500'
                                                            }`}></span>
                                                        {staff.status.charAt(0).toUpperCase() + staff.status.slice(1)}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="text-sm text-slate-400">{staff.joined}</span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="text-sm text-slate-400">{staff.lastActive}</span>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <button
                                                            onClick={() => handleViewStaff(staff)}
                                                            className="p-2 hover:bg-slate-600 rounded-lg transition-colors"
                                                            title="View staff"
                                                        >
                                                            <Eye className="w-4 h-4 text-slate-400" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleEditStaff(staff)}
                                                            className="p-2 hover:bg-slate-600 rounded-lg transition-colors"
                                                            title="Edit staff"
                                                        >
                                                            <Edit className="w-4 h-4 text-slate-400" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteStaff(staff)}
                                                            className="p-2 hover:bg-red-500/20 rounded-lg transition-colors"
                                                            title="Delete staff"
                                                        >
                                                            <Trash2 className="w-4 h-4 text-red-400" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination */}
                            <div className="flex items-center justify-between">
                                <p className="text-sm text-slate-400">
                                    Showing {filteredStaff.length} of {staffList.length} staff members
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Billing Tab */}
                    {activeTab === 'billing' && (
                        <div className="flex gap-6">
                            {/* Main Content */}
                            <div className="flex-1 space-y-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h2 className="text-2xl font-bold text-white">Billing & Revenue</h2>
                                        <p className="text-slate-400">Monitor revenue, subscriptions, and payments</p>
                                    </div>
                                </div>

                                {/* Revenue Stats */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6">
                                        <h3 className="text-sm text-slate-400 mb-2">Total Revenue (All Time)</h3>
                                        <p className="text-3xl font-bold text-white">${mockStats.totalRevenue.toLocaleString()}</p>
                                        <p className="text-sm text-emerald-400 mt-2 flex items-center gap-1">
                                            <ArrowUpRight className="w-4 h-4" />
                                            +23.5% from last year
                                        </p>
                                    </div>
                                    <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6">
                                        <h3 className="text-sm text-slate-400 mb-2">MRR (Monthly Recurring)</h3>
                                        <p className="text-3xl font-bold text-white">${mockStats.revenueThisMonth.toLocaleString()}</p>
                                        <p className="text-sm text-emerald-400 mt-2 flex items-center gap-1">
                                            <ArrowUpRight className="w-4 h-4" />
                                            +8.2% from last month
                                        </p>
                                    </div>
                                    <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6">
                                        <h3 className="text-sm text-slate-400 mb-2">Average Revenue Per User</h3>
                                        <p className="text-3xl font-bold text-white">$87.50</p>
                                        <p className="text-sm text-emerald-400 mt-2 flex items-center gap-1">
                                            <ArrowUpRight className="w-4 h-4" />
                                            +5.1% improvement
                                        </p>
                                    </div>
                                </div>

                                {/* Subscription Breakdown */}
                                <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6">
                                    <h3 className="text-lg font-bold text-white mb-4">Subscription Breakdown</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                        <div className="p-4 bg-slate-700/50 rounded-xl">
                                            <p className="text-slate-400 text-sm">Free</p>
                                            <p className="text-2xl font-bold text-white">5,234</p>
                                            <p className="text-xs text-slate-400">40.7%</p>
                                        </div>
                                        <div className="p-4 bg-blue-500/20 rounded-xl border border-blue-500/30">
                                            <p className="text-blue-400 text-sm">Starter ($79/mo)</p>
                                            <p className="text-2xl font-bold text-white">3,421</p>
                                            <p className="text-xs text-blue-300">26.6% • $270K MRR</p>
                                        </div>
                                        <div className="p-4 bg-purple-500/20 rounded-xl border border-purple-500/30">
                                            <p className="text-purple-400 text-sm">Pro ($199/mo)</p>
                                            <p className="text-2xl font-bold text-white">2,156</p>
                                            <p className="text-xs text-purple-300">16.8% • $429K MRR</p>
                                        </div>
                                        <div className="p-4 bg-amber-500/20 rounded-xl border border-amber-500/30">
                                            <p className="text-amber-400 text-sm">Enterprise ($599/mo)</p>
                                            <p className="text-2xl font-bold text-white">456</p>
                                            <p className="text-xs text-amber-300">3.5% • $273K MRR</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Payment Gateway Stats */}
                                <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6">
                                    <h3 className="text-lg font-bold text-white mb-4">Payment Gateway Performance</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {/* Stripe Stats */}
                                        <div className="p-4 bg-gradient-to-br from-violet-500/10 to-purple-600/10 rounded-xl border border-violet-500/30">
                                            <div className="flex items-center gap-3 mb-3">
                                                <div className="w-10 h-10 bg-violet-500/20 rounded-lg flex items-center justify-center">
                                                    <CreditCard className="w-5 h-5 text-violet-400" />
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-white">Stripe</p>
                                                    <p className="text-xs text-slate-400">Global Payments (USD)</p>
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-2 gap-3 mt-4">
                                                <div>
                                                    <p className="text-xs text-slate-400">This Month</p>
                                                    <p className="text-lg font-bold text-white">$38,420</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-slate-400">Transactions</p>
                                                    <p className="text-lg font-bold text-white">1,247</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-slate-400">Success Rate</p>
                                                    <p className="text-lg font-bold text-emerald-400">98.7%</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-slate-400">Avg. Transaction</p>
                                                    <p className="text-lg font-bold text-white">$30.81</p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Razorpay Stats */}
                                        <div className="p-4 bg-gradient-to-br from-blue-500/10 to-cyan-600/10 rounded-xl border border-blue-500/30">
                                            <div className="flex items-center gap-3 mb-3">
                                                <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                                                    <CreditCard className="w-5 h-5 text-blue-400" />
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-white">Razorpay</p>
                                                    <p className="text-xs text-slate-400">India Payments (INR)</p>
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-2 gap-3 mt-4">
                                                <div>
                                                    <p className="text-xs text-slate-400">This Month</p>
                                                    <p className="text-lg font-bold text-white">₹9,42,580</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-slate-400">Transactions</p>
                                                    <p className="text-lg font-bold text-white">892</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-slate-400">Success Rate</p>
                                                    <p className="text-lg font-bold text-emerald-400">97.4%</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-slate-400">Avg. Transaction</p>
                                                    <p className="text-lg font-bold text-white">₹1,057</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Right Sidebar - API Balance Details */}
                            <div className="w-80 space-y-4">
                                <div className="bg-slate-800 border border-slate-700 rounded-2xl p-5">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-sm font-bold text-white flex items-center gap-2">
                                            <Zap className="w-4 h-4 text-amber-400" />
                                            API Credits & Balance
                                        </h3>
                                        {lastBalanceUpdate && (
                                            <span className="text-xs text-slate-500">
                                                {new Date(lastBalanceUpdate).toLocaleTimeString()}
                                            </span>
                                        )}
                                    </div>

                                    {balancesLoading ? (
                                        <div className="flex items-center justify-center py-8">
                                            <Loader2 className="w-6 h-6 text-violet-400 animate-spin" />
                                            <span className="ml-2 text-sm text-slate-400">Fetching balances...</span>
                                        </div>
                                    ) : apiBalances.length === 0 ? (
                                        <div className="text-center py-6">
                                            <p className="text-slate-400 text-sm mb-3">No balances loaded yet</p>
                                            <button
                                                onClick={fetchApiBalances}
                                                className="px-4 py-2 bg-violet-500/20 text-violet-400 rounded-lg text-sm hover:bg-violet-500/30"
                                            >
                                                Load Balances
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            {/* OpenAI */}
                                            {(() => {
                                                const balance = getBalance('OpenAI');
                                                return (
                                                    <div className="p-3 bg-slate-700/50 rounded-xl">
                                                        <div className="flex items-center justify-between mb-2">
                                                            <div className="flex items-center gap-2">
                                                                <div className="w-8 h-8 bg-emerald-500/20 rounded-lg flex items-center justify-center">
                                                                    <Globe className="w-4 h-4 text-emerald-400" />
                                                                </div>
                                                                <span className="text-sm font-medium text-white">OpenAI</span>
                                                            </div>
                                                            <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(balance?.status || 'inactive')}`}>
                                                                {balance?.status === 'active' ? 'Active' : balance?.status === 'low' ? 'Low' : balance?.status || 'N/A'}
                                                            </span>
                                                        </div>
                                                        <div className="mt-2">
                                                            <div className="flex justify-between text-xs mb-1">
                                                                <span className="text-slate-400">Balance</span>
                                                                <span className="text-white font-medium">
                                                                    {balance?.balance !== undefined ? `$${balance.balance.toFixed(2)}` : balance?.message || 'Not configured'}
                                                                </span>
                                                            </div>
                                                            <div className="h-1.5 bg-slate-600 rounded-full overflow-hidden">
                                                                <div className={`h-full ${getProgressColor(balance?.status || 'inactive')} rounded-full`} style={{ width: `${balance?.percentage || 0}%` }}></div>
                                                            </div>
                                                            {balance?.used !== undefined && (
                                                                <p className="text-xs text-slate-500 mt-1">${balance.used.toFixed(2)} used this month</p>
                                                            )}
                                                        </div>
                                                    </div>
                                                );
                                            })()}

                                            {/* Anthropic */}
                                            {(() => {
                                                const balance = getBalance('Anthropic');
                                                return (
                                                    <div className="p-3 bg-slate-700/50 rounded-xl">
                                                        <div className="flex items-center justify-between mb-2">
                                                            <div className="flex items-center gap-2">
                                                                <div className="w-8 h-8 bg-orange-500/20 rounded-lg flex items-center justify-center">
                                                                    <Zap className="w-4 h-4 text-orange-400" />
                                                                </div>
                                                                <span className="text-sm font-medium text-white">Anthropic</span>
                                                            </div>
                                                            <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(balance?.status || 'inactive')}`}>
                                                                {balance?.status === 'active' ? 'Active' : balance?.status || 'N/A'}
                                                            </span>
                                                        </div>
                                                        <div className="mt-2">
                                                            <div className="flex justify-between text-xs mb-1">
                                                                <span className="text-slate-400">Status</span>
                                                                <span className="text-white font-medium">
                                                                    {balance?.message || 'Not configured'}
                                                                </span>
                                                            </div>
                                                            <div className="h-1.5 bg-slate-600 rounded-full overflow-hidden">
                                                                <div className={`h-full ${getProgressColor(balance?.status || 'inactive')} rounded-full`} style={{ width: `${balance?.percentage || 0}%` }}></div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })()}

                                            {/* ElevenLabs */}
                                            {(() => {
                                                const balance = getBalance('ElevenLabs');
                                                return (
                                                    <div className="p-3 bg-slate-700/50 rounded-xl">
                                                        <div className="flex items-center justify-between mb-2">
                                                            <div className="flex items-center gap-2">
                                                                <div className="w-8 h-8 bg-cyan-500/20 rounded-lg flex items-center justify-center">
                                                                    <Mic className="w-4 h-4 text-cyan-400" />
                                                                </div>
                                                                <span className="text-sm font-medium text-white">ElevenLabs</span>
                                                            </div>
                                                            <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(balance?.status || 'inactive')}`}>
                                                                {balance?.status === 'active' ? 'Active' : balance?.status === 'low' ? 'Low' : balance?.status || 'N/A'}
                                                            </span>
                                                        </div>
                                                        <div className="mt-2">
                                                            <div className="flex justify-between text-xs mb-1">
                                                                <span className="text-slate-400">Characters</span>
                                                                <span className="text-white font-medium">
                                                                    {balance?.message || 'Not configured'}
                                                                </span>
                                                            </div>
                                                            <div className="h-1.5 bg-slate-600 rounded-full overflow-hidden">
                                                                <div className={`h-full ${getProgressColor(balance?.status || 'inactive')} rounded-full`} style={{ width: `${balance?.percentage || 0}%` }}></div>
                                                            </div>
                                                            {balance?.balance !== undefined && (
                                                                <p className="text-xs text-slate-500 mt-1">{balance.balance.toLocaleString()} remaining</p>
                                                            )}
                                                        </div>
                                                    </div>
                                                );
                                            })()}

                                            {/* D-ID */}
                                            {(() => {
                                                const balance = getBalance('D-ID');
                                                return (
                                                    <div className="p-3 bg-slate-700/50 rounded-xl">
                                                        <div className="flex items-center justify-between mb-2">
                                                            <div className="flex items-center gap-2">
                                                                <div className="w-8 h-8 bg-pink-500/20 rounded-lg flex items-center justify-center">
                                                                    <Video className="w-4 h-4 text-pink-400" />
                                                                </div>
                                                                <span className="text-sm font-medium text-white">D-ID</span>
                                                            </div>
                                                            <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(balance?.status || 'inactive')}`}>
                                                                {balance?.status === 'active' ? 'Active' : balance?.status === 'low' ? 'Low' : balance?.status || 'N/A'}
                                                            </span>
                                                        </div>
                                                        <div className="mt-2">
                                                            <div className="flex justify-between text-xs mb-1">
                                                                <span className="text-slate-400">Credits</span>
                                                                <span className="text-white font-medium">
                                                                    {balance?.message || 'Not configured'}
                                                                </span>
                                                            </div>
                                                            <div className="h-1.5 bg-slate-600 rounded-full overflow-hidden">
                                                                <div className={`h-full ${getProgressColor(balance?.status || 'inactive')} rounded-full`} style={{ width: `${balance?.percentage || 0}%` }}></div>
                                                            </div>
                                                            {balance?.status === 'low' && (
                                                                <p className="text-xs text-amber-400 mt-1">⚠️ Low credits - Refill soon</p>
                                                            )}
                                                        </div>
                                                    </div>
                                                );
                                            })()}

                                            {/* Stability AI */}
                                            {(() => {
                                                const balance = getBalance('Stability AI');
                                                return (
                                                    <div className="p-3 bg-slate-700/50 rounded-xl">
                                                        <div className="flex items-center justify-between mb-2">
                                                            <div className="flex items-center gap-2">
                                                                <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center">
                                                                    <ImageIcon className="w-4 h-4 text-purple-400" />
                                                                </div>
                                                                <span className="text-sm font-medium text-white">Stability AI</span>
                                                            </div>
                                                            <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(balance?.status || 'inactive')}`}>
                                                                {balance?.status === 'active' ? 'Active' : balance?.status === 'low' ? 'Low' : balance?.status || 'N/A'}
                                                            </span>
                                                        </div>
                                                        <div className="mt-2">
                                                            <div className="flex justify-between text-xs mb-1">
                                                                <span className="text-slate-400">Credits</span>
                                                                <span className="text-white font-medium">
                                                                    {balance?.message || 'Not configured'}
                                                                </span>
                                                            </div>
                                                            <div className="h-1.5 bg-slate-600 rounded-full overflow-hidden">
                                                                <div className={`h-full ${getProgressColor(balance?.status || 'inactive')} rounded-full`} style={{ width: `${balance?.percentage || 0}%` }}></div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })()}

                                            {/* Razorpay */}
                                            {(() => {
                                                const balance = getBalance('Razorpay');
                                                return (
                                                    <div className="p-3 bg-slate-700/50 rounded-xl">
                                                        <div className="flex items-center justify-between mb-2">
                                                            <div className="flex items-center gap-2">
                                                                <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
                                                                    <CreditCard className="w-4 h-4 text-blue-400" />
                                                                </div>
                                                                <span className="text-sm font-medium text-white">Razorpay</span>
                                                            </div>
                                                            <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(balance?.status || 'inactive')}`}>
                                                                {balance?.status === 'active' ? 'Active' : balance?.status || 'N/A'}
                                                            </span>
                                                        </div>
                                                        <div className="mt-2">
                                                            <div className="flex justify-between text-xs mb-1">
                                                                <span className="text-slate-400">Balance</span>
                                                                <span className="text-white font-medium">
                                                                    {balance?.message || 'Not configured'}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })()}
                                        </div>
                                    )}
                                </div>

                                {/* Quick Actions */}
                                <div className="bg-slate-800 border border-slate-700 rounded-2xl p-5">
                                    <h3 className="text-sm font-bold text-white mb-3">Quick Actions</h3>
                                    <div className="space-y-2">
                                        <button className="w-full flex items-center gap-2 px-3 py-2 bg-violet-500/20 text-violet-400 rounded-lg text-sm hover:bg-violet-500/30 transition-colors">
                                            <CreditCard className="w-4 h-4" />
                                            Add API Credits
                                        </button>
                                        <button
                                            onClick={fetchApiBalances}
                                            disabled={balancesLoading}
                                            className="w-full flex items-center gap-2 px-3 py-2 bg-slate-700/50 text-slate-300 rounded-lg text-sm hover:bg-slate-700 transition-colors disabled:opacity-50"
                                        >
                                            <RefreshCw className={`w-4 h-4 ${balancesLoading ? 'animate-spin' : ''}`} />
                                            {balancesLoading ? 'Refreshing...' : 'Refresh Balances'}
                                        </button>
                                        <button className="w-full flex items-center gap-2 px-3 py-2 bg-slate-700/50 text-slate-300 rounded-lg text-sm hover:bg-slate-700 transition-colors">
                                            <Download className="w-4 h-4" />
                                            Export Usage Report
                                        </button>
                                    </div>
                                </div>

                                {/* Usage Alerts */}
                                <div className="bg-gradient-to-br from-amber-500/10 to-orange-600/10 border border-amber-500/30 rounded-2xl p-5">
                                    <h3 className="text-sm font-bold text-amber-400 mb-3 flex items-center gap-2">
                                        <AlertTriangle className="w-4 h-4" />
                                        Usage Alerts
                                    </h3>
                                    <div className="space-y-2 text-xs">
                                        {apiBalances.filter(b => b.status === 'low').map((balance, idx) => (
                                            <div key={idx} className="flex items-start gap-2">
                                                <span className="text-amber-400 mt-0.5">•</span>
                                                <p className="text-slate-300">{balance.service} credits low - consider refill</p>
                                            </div>
                                        ))}
                                        {apiBalances.filter(b => b.status === 'error').map((balance, idx) => (
                                            <div key={idx} className="flex items-start gap-2">
                                                <span className="text-red-400 mt-0.5">•</span>
                                                <p className="text-slate-300">{balance.service}: {balance.message}</p>
                                            </div>
                                        ))}
                                        {apiBalances.filter(b => b.status === 'active').length === apiBalances.length && apiBalances.length > 0 && (
                                            <div className="flex items-start gap-2">
                                                <span className="text-emerald-400 mt-0.5">•</span>
                                                <p className="text-slate-300">All services running normally</p>
                                            </div>
                                        )}
                                        {apiBalances.length === 0 && (
                                            <div className="flex items-start gap-2">
                                                <span className="text-slate-400 mt-0.5">•</span>
                                                <p className="text-slate-400">Click &quot;Refresh Balances&quot; to check API status</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* System Tab */}
                    {activeTab === 'system' && (
                        <div className="space-y-6">
                            <div>
                                <h2 className="text-2xl font-bold text-white">System Health</h2>
                                <p className="text-slate-400">Monitor server performance and resources</p>
                            </div>

                            {/* System Metrics */}
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6">
                                    <div className="flex items-center gap-3 mb-3">
                                        <Cpu className="w-6 h-6 text-blue-400" />
                                        <span className="text-sm text-slate-400">CPU Usage</span>
                                    </div>
                                    <p className="text-3xl font-bold text-white">42%</p>
                                    <div className="mt-2 h-2 bg-slate-700 rounded-full overflow-hidden">
                                        <div className="h-full w-[42%] bg-blue-500 rounded-full"></div>
                                    </div>
                                </div>
                                <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6">
                                    <div className="flex items-center gap-3 mb-3">
                                        <HardDrive className="w-6 h-6 text-purple-400" />
                                        <span className="text-sm text-slate-400">Memory</span>
                                    </div>
                                    <p className="text-3xl font-bold text-white">67%</p>
                                    <div className="mt-2 h-2 bg-slate-700 rounded-full overflow-hidden">
                                        <div className="h-full w-[67%] bg-purple-500 rounded-full"></div>
                                    </div>
                                </div>
                                <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6">
                                    <div className="flex items-center gap-3 mb-3">
                                        <Database className="w-6 h-6 text-emerald-400" />
                                        <span className="text-sm text-slate-400">Storage</span>
                                    </div>
                                    <p className="text-3xl font-bold text-white">34%</p>
                                    <div className="mt-2 h-2 bg-slate-700 rounded-full overflow-hidden">
                                        <div className="h-full w-[34%] bg-emerald-500 rounded-full"></div>
                                    </div>
                                </div>
                                <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6">
                                    <div className="flex items-center gap-3 mb-3">
                                        <Activity className="w-6 h-6 text-amber-400" />
                                        <span className="text-sm text-slate-400">Uptime</span>
                                    </div>
                                    <p className="text-3xl font-bold text-emerald-400">99.97%</p>
                                    <p className="text-xs text-slate-400 mt-2">Last 30 days</p>
                                </div>
                            </div>

                            {/* API Rate Limits */}
                            <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6">
                                <h3 className="text-lg font-bold text-white mb-4">API Rate Limits & Quotas</h3>
                                <div className="space-y-4">
                                    {mockApiUsage.map((api) => (
                                        <div key={api.provider} className="flex items-center gap-4">
                                            <div className="w-32 text-sm text-white">{api.provider}</div>
                                            <div className="flex-1 h-3 bg-slate-700 rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full rounded-full ${api.status === 'healthy' ? 'bg-emerald-500' : 'bg-amber-500'
                                                        }`}
                                                    style={{ width: `${Math.random() * 60 + 20}%` }}
                                                ></div>
                                            </div>
                                            <div className="w-32 text-right text-sm text-slate-400">
                                                {api.calls.toLocaleString()} / 500K
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Settings Tab */}
                    {activeTab === 'settings' && (
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="text-2xl font-bold text-white">Admin Settings</h2>
                                    <p className="text-slate-400">Configure all system settings, API keys, and environment variables</p>
                                </div>
                                <div className="flex gap-3">
                                    <button
                                        onClick={testAllConnections}
                                        className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
                                    >
                                        <RefreshCw className="w-4 h-4" />
                                        Test All Connections
                                    </button>
                                    <button className="flex items-center gap-2 px-4 py-2 bg-violet-500 hover:bg-violet-600 text-white rounded-lg transition-colors">
                                        <CheckCircle2 className="w-4 h-4" />
                                        Save All Settings
                                    </button>
                                </div>
                            </div>

                            {/* Settings Navigation Tabs */}
                            <div className="flex flex-wrap gap-2 border-b border-slate-700 pb-4">
                                {['All Settings', 'AWS Infrastructure', 'AI Services', 'Payment', 'Translation', 'App Config', 'Analytics'].map((tab) => (
                                    <button
                                        key={tab}
                                        className="px-4 py-2 text-sm rounded-lg bg-slate-700/50 text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
                                    >
                                        {tab}
                                    </button>
                                ))}
                            </div>

                            {/* AWS Infrastructure Section */}
                            <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-10 h-10 bg-amber-500/20 rounded-xl flex items-center justify-center">
                                        <Server className="w-5 h-5 text-amber-400" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-white">AWS Infrastructure</h3>
                                        <p className="text-sm text-slate-400">Cognito, S3, and DynamoDB configuration</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {/* Cognito Settings */}
                                    <div className="space-y-4 p-4 bg-slate-700/30 rounded-xl">
                                        <h4 className="text-sm font-semibold text-amber-400 flex items-center gap-2">
                                            <Shield className="w-4 h-4" />
                                            AWS Cognito (Authentication)
                                        </h4>
                                        <div>
                                            <label className="block text-xs text-slate-400 mb-1">User Pool ID</label>
                                            <input
                                                type="text"
                                                placeholder="us-east-1_xxxxxxxxx"
                                                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:border-violet-500 focus:outline-none"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs text-slate-400 mb-1">Client ID</label>
                                            <input
                                                type="text"
                                                placeholder="Enter Cognito Client ID"
                                                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:border-violet-500 focus:outline-none"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs text-slate-400 mb-1">AWS Region</label>
                                            <select className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:border-violet-500 focus:outline-none">
                                                <option value="us-east-1">us-east-1 (N. Virginia)</option>
                                                <option value="us-west-2">us-west-2 (Oregon)</option>
                                                <option value="eu-west-1">eu-west-1 (Ireland)</option>
                                                <option value="ap-southeast-1">ap-southeast-1 (Singapore)</option>
                                            </select>
                                        </div>
                                    </div>

                                    {/* AWS Credentials */}
                                    <div className="space-y-4 p-4 bg-slate-700/30 rounded-xl">
                                        <h4 className="text-sm font-semibold text-amber-400 flex items-center gap-2">
                                            <Shield className="w-4 h-4" />
                                            AWS Credentials
                                        </h4>
                                        <div>
                                            <label className="block text-xs text-slate-400 mb-1">Access Key ID</label>
                                            <input
                                                type="password"
                                                placeholder="AKIA..."
                                                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:border-violet-500 focus:outline-none"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs text-slate-400 mb-1">Secret Access Key</label>
                                            <input
                                                type="password"
                                                placeholder="Enter secret key"
                                                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:border-violet-500 focus:outline-none"
                                            />
                                        </div>
                                    </div>

                                    {/* S3 & DynamoDB */}
                                    <div className="space-y-4 p-4 bg-slate-700/30 rounded-xl">
                                        <h4 className="text-sm font-semibold text-amber-400 flex items-center gap-2">
                                            <Database className="w-4 h-4" />
                                            S3 & DynamoDB
                                        </h4>
                                        <div>
                                            <label className="block text-xs text-slate-400 mb-1">S3 Bucket Name</label>
                                            <input
                                                type="text"
                                                placeholder="digitalmeng-media"
                                                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:border-violet-500 focus:outline-none"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs text-slate-400 mb-1">DynamoDB Table Prefix</label>
                                            <input
                                                type="text"
                                                placeholder="digitalmeng_"
                                                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:border-violet-500 focus:outline-none"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* AI Content Creation Section */}
                            <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-10 h-10 bg-violet-500/20 rounded-xl flex items-center justify-center">
                                        <Zap className="w-5 h-5 text-violet-400" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-white">AI Content Creation Services</h3>
                                        <p className="text-sm text-slate-400">Text, Video, Voice, and Image generation APIs</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Text Generation */}
                                    <div className="space-y-4 p-4 bg-slate-700/30 rounded-xl">
                                        <h4 className="text-sm font-semibold text-violet-400 flex items-center gap-2">
                                            <Globe className="w-4 h-4" />
                                            AI Text Generation
                                        </h4>
                                        <div>
                                            <label className="block text-xs text-slate-400 mb-1">OpenAI API Key (GPT-4, GPT-3.5)</label>
                                            <div className="flex gap-2">
                                                <input
                                                    type="password"
                                                    placeholder="sk-..."
                                                    value={apiKeys.openai}
                                                    onChange={(e) => handleApiKeyChange('openai', e.target.value)}
                                                    className="flex-1 px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:border-violet-500 focus:outline-none"
                                                />
                                                <button
                                                    onClick={() => testApiConnection('openai', apiKeys.openai)}
                                                    disabled={testResults.openai.status === 'testing'}
                                                    className={`px-3 py-2 rounded-lg text-xs flex items-center gap-1 ${getTestButtonStyle(testResults.openai.status)}`}
                                                >
                                                    {testResults.openai.status === 'testing' ? (
                                                        <><Loader2 className="w-3 h-3 animate-spin" /> Testing...</>
                                                    ) : testResults.openai.status === 'success' ? (
                                                        <><CheckCircle2 className="w-3 h-3" /> Success</>
                                                    ) : testResults.openai.status === 'error' ? (
                                                        <><XCircle className="w-3 h-3" /> Failed</>
                                                    ) : (
                                                        'Test'
                                                    )}
                                                </button>
                                            </div>
                                            <p className="text-xs text-slate-500 mt-1">Get key at: platform.openai.com/api-keys</p>
                                        </div>
                                        <div>
                                            <label className="block text-xs text-slate-400 mb-1">Anthropic API Key (Claude)</label>
                                            <div className="flex gap-2">
                                                <input
                                                    type="password"
                                                    placeholder="sk-ant-..."
                                                    value={apiKeys.anthropic}
                                                    onChange={(e) => handleApiKeyChange('anthropic', e.target.value)}
                                                    className="flex-1 px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:border-violet-500 focus:outline-none"
                                                />
                                                <button
                                                    onClick={() => testApiConnection('anthropic', apiKeys.anthropic)}
                                                    disabled={testResults.anthropic.status === 'testing'}
                                                    className={`px-3 py-2 rounded-lg text-xs flex items-center gap-1 ${getTestButtonStyle(testResults.anthropic.status)}`}
                                                >
                                                    {testResults.anthropic.status === 'testing' ? (
                                                        <><Loader2 className="w-3 h-3 animate-spin" /> Testing...</>
                                                    ) : testResults.anthropic.status === 'success' ? (
                                                        <><CheckCircle2 className="w-3 h-3" /> Success</>
                                                    ) : testResults.anthropic.status === 'error' ? (
                                                        <><XCircle className="w-3 h-3" /> Failed</>
                                                    ) : (
                                                        'Test'
                                                    )}
                                                </button>
                                            </div>
                                            <p className="text-xs text-slate-500 mt-1">Get key at: console.anthropic.com</p>
                                        </div>
                                        <div className="flex items-center gap-2 mt-2 p-2 bg-blue-500/10 rounded-lg border border-blue-500/20">
                                            <CheckCircle2 className="w-4 h-4 text-blue-400" />
                                            <span className="text-xs text-blue-300">AWS Bedrock uses AWS credentials above</span>
                                        </div>
                                    </div>

                                    {/* Video Generation */}
                                    <div className="space-y-4 p-4 bg-slate-700/30 rounded-xl">
                                        <h4 className="text-sm font-semibold text-pink-400 flex items-center gap-2">
                                            <Video className="w-4 h-4" />
                                            AI Video Generation
                                        </h4>
                                        <div>
                                            <label className="block text-xs text-slate-400 mb-1">D-ID API Key (AI Avatar Videos)</label>
                                            <div className="flex gap-2">
                                                <input
                                                    type="password"
                                                    placeholder="Enter D-ID API key"
                                                    value={apiKeys.did}
                                                    onChange={(e) => handleApiKeyChange('did', e.target.value)}
                                                    className="flex-1 px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:border-violet-500 focus:outline-none"
                                                />
                                                <button
                                                    onClick={() => testApiConnection('did', apiKeys.did)}
                                                    disabled={testResults.did.status === 'testing'}
                                                    className={`px-3 py-2 rounded-lg text-xs flex items-center gap-1 ${getTestButtonStyle(testResults.did.status)}`}
                                                >
                                                    {testResults.did.status === 'testing' ? (
                                                        <><Loader2 className="w-3 h-3 animate-spin" /> Testing...</>
                                                    ) : testResults.did.status === 'success' ? (
                                                        <><CheckCircle2 className="w-3 h-3" /> Success</>
                                                    ) : testResults.did.status === 'error' ? (
                                                        <><XCircle className="w-3 h-3" /> Failed</>
                                                    ) : (
                                                        'Test'
                                                    )}
                                                </button>
                                            </div>
                                            <p className="text-xs text-slate-500 mt-1">Get key at: studio.d-id.com</p>
                                        </div>
                                        <div>
                                            <label className="block text-xs text-slate-400 mb-1">Synthesia API Key</label>
                                            <div className="flex gap-2">
                                                <input
                                                    type="password"
                                                    placeholder="Enter Synthesia API key"
                                                    value={apiKeys.synthesia}
                                                    onChange={(e) => handleApiKeyChange('synthesia', e.target.value)}
                                                    className="flex-1 px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:border-violet-500 focus:outline-none"
                                                />
                                                <button
                                                    onClick={() => testApiConnection('synthesia', apiKeys.synthesia)}
                                                    disabled={testResults.synthesia.status === 'testing'}
                                                    className={`px-3 py-2 rounded-lg text-xs flex items-center gap-1 ${getTestButtonStyle(testResults.synthesia.status)}`}
                                                >
                                                    {testResults.synthesia.status === 'testing' ? (
                                                        <><Loader2 className="w-3 h-3 animate-spin" /> Testing...</>
                                                    ) : testResults.synthesia.status === 'success' ? (
                                                        <><CheckCircle2 className="w-3 h-3" /> Success</>
                                                    ) : testResults.synthesia.status === 'error' ? (
                                                        <><XCircle className="w-3 h-3" /> Failed</>
                                                    ) : (
                                                        'Test'
                                                    )}
                                                </button>
                                            </div>
                                            <p className="text-xs text-slate-500 mt-1">Get key at: synthesia.io</p>
                                        </div>
                                        <div>
                                            <label className="block text-xs text-slate-400 mb-1">Pictory API Key (Stock Video + Voiceover)</label>
                                            <div className="flex gap-2">
                                                <input
                                                    type="password"
                                                    placeholder="Enter Pictory API key"
                                                    value={apiKeys.pictory}
                                                    onChange={(e) => handleApiKeyChange('pictory', e.target.value)}
                                                    className="flex-1 px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:border-violet-500 focus:outline-none"
                                                />
                                                <button
                                                    onClick={() => testApiConnection('pictory', apiKeys.pictory)}
                                                    disabled={testResults.pictory.status === 'testing'}
                                                    className={`px-3 py-2 rounded-lg text-xs flex items-center gap-1 ${getTestButtonStyle(testResults.pictory.status)}`}
                                                >
                                                    {testResults.pictory.status === 'testing' ? (
                                                        <><Loader2 className="w-3 h-3 animate-spin" /> Testing...</>
                                                    ) : testResults.pictory.status === 'success' ? (
                                                        <><CheckCircle2 className="w-3 h-3" /> Success</>
                                                    ) : testResults.pictory.status === 'error' ? (
                                                        <><XCircle className="w-3 h-3" /> Failed</>
                                                    ) : (
                                                        'Test'
                                                    )}
                                                </button>
                                            </div>
                                            <p className="text-xs text-slate-500 mt-1">Get key at: pictory.ai</p>
                                        </div>
                                    </div>

                                    {/* Voice Generation */}
                                    <div className="space-y-4 p-4 bg-slate-700/30 rounded-xl">
                                        <h4 className="text-sm font-semibold text-cyan-400 flex items-center gap-2">
                                            <Mic className="w-4 h-4" />
                                            AI Voice Generation
                                        </h4>
                                        <div>
                                            <label className="block text-xs text-slate-400 mb-1">ElevenLabs API Key</label>
                                            <div className="flex gap-2">
                                                <input
                                                    type="password"
                                                    placeholder="sk_..."
                                                    value={apiKeys.elevenlabs}
                                                    onChange={(e) => handleApiKeyChange('elevenlabs', e.target.value)}
                                                    className="flex-1 px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:border-violet-500 focus:outline-none"
                                                />
                                                <button
                                                    onClick={() => testApiConnection('elevenlabs', apiKeys.elevenlabs)}
                                                    disabled={testResults.elevenlabs.status === 'testing'}
                                                    className={`px-3 py-2 rounded-lg text-xs flex items-center gap-1 ${getTestButtonStyle(testResults.elevenlabs.status)}`}
                                                >
                                                    {testResults.elevenlabs.status === 'testing' ? (
                                                        <><Loader2 className="w-3 h-3 animate-spin" /> Testing...</>
                                                    ) : testResults.elevenlabs.status === 'success' ? (
                                                        <><CheckCircle2 className="w-3 h-3" /> Success</>
                                                    ) : testResults.elevenlabs.status === 'error' ? (
                                                        <><XCircle className="w-3 h-3" /> Failed</>
                                                    ) : (
                                                        'Test'
                                                    )}
                                                </button>
                                            </div>
                                            <p className="text-xs text-slate-500 mt-1">Get key at: elevenlabs.io</p>
                                        </div>
                                        <div>
                                            <label className="block text-xs text-slate-400 mb-1">Default Voice ID</label>
                                            <input
                                                type="text"
                                                placeholder="EXAVITQu4vr4xnSDxMaL"
                                                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:border-violet-500 focus:outline-none"
                                            />
                                        </div>
                                    </div>

                                    {/* Image Generation */}
                                    <div className="space-y-4 p-4 bg-slate-700/30 rounded-xl">
                                        <h4 className="text-sm font-semibold text-purple-400 flex items-center gap-2">
                                            <ImageIcon className="w-4 h-4" />
                                            AI Image Generation
                                        </h4>
                                        <div className="flex items-center gap-2 p-2 bg-blue-500/10 rounded-lg border border-blue-500/20">
                                            <CheckCircle2 className="w-4 h-4 text-blue-400" />
                                            <span className="text-xs text-blue-300">DALL-E uses OpenAI API key above</span>
                                        </div>
                                        <div>
                                            <label className="block text-xs text-slate-400 mb-1">Stability AI API Key (Stable Diffusion)</label>
                                            <div className="flex gap-2">
                                                <input
                                                    type="password"
                                                    placeholder="Enter Stability AI key (optional)"
                                                    value={apiKeys.stabilityai}
                                                    onChange={(e) => handleApiKeyChange('stabilityai', e.target.value)}
                                                    className="flex-1 px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:border-violet-500 focus:outline-none"
                                                />
                                                <button
                                                    onClick={() => testApiConnection('stabilityai', apiKeys.stabilityai)}
                                                    disabled={testResults.stabilityai.status === 'testing'}
                                                    className={`px-3 py-2 rounded-lg text-xs flex items-center gap-1 ${getTestButtonStyle(testResults.stabilityai.status)}`}
                                                >
                                                    {testResults.stabilityai.status === 'testing' ? (
                                                        <><Loader2 className="w-3 h-3 animate-spin" /> Testing...</>
                                                    ) : testResults.stabilityai.status === 'success' ? (
                                                        <><CheckCircle2 className="w-3 h-3" /> Success</>
                                                    ) : testResults.stabilityai.status === 'error' ? (
                                                        <><XCircle className="w-3 h-3" /> Failed</>
                                                    ) : (
                                                        'Test'
                                                    )}
                                                </button>
                                            </div>
                                            <p className="text-xs text-slate-500 mt-1">Get key at: stability.ai</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Payment & Billing Section */}
                            <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-10 h-10 bg-emerald-500/20 rounded-xl flex items-center justify-center">
                                        <DollarSign className="w-5 h-5 text-emerald-400" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-white">Payment & Billing (Stripe + Razorpay)</h3>
                                        <p className="text-sm text-slate-400">Configure payment gateway API keys for global and India payments</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Stripe Keys */}
                                    <div className="space-y-4 p-4 bg-slate-700/30 rounded-xl">
                                        <h4 className="text-sm font-semibold text-emerald-400 flex items-center gap-2">
                                            <CreditCard className="w-4 h-4" />
                                            Stripe API Keys
                                        </h4>
                                        <div>
                                            <label className="block text-xs text-slate-400 mb-1">Secret Key</label>
                                            <input
                                                type="password"
                                                placeholder="sk_live_... or sk_test_..."
                                                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:border-violet-500 focus:outline-none"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs text-slate-400 mb-1">Publishable Key</label>
                                            <input
                                                type="text"
                                                placeholder="pk_live_... or pk_test_..."
                                                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:border-violet-500 focus:outline-none"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs text-slate-400 mb-1">Webhook Secret</label>
                                            <input
                                                type="password"
                                                placeholder="whsec_..."
                                                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:border-violet-500 focus:outline-none"
                                            />
                                        </div>
                                    </div>

                                    {/* Stripe Price IDs */}
                                    <div className="space-y-4 p-4 bg-slate-700/30 rounded-xl">
                                        <h4 className="text-sm font-semibold text-emerald-400 flex items-center gap-2">
                                            <DollarSign className="w-4 h-4" />
                                            Subscription Price IDs
                                        </h4>
                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <label className="block text-xs text-slate-400 mb-1">Starter Monthly</label>
                                                <input
                                                    type="text"
                                                    placeholder="price_xxx"
                                                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:border-violet-500 focus:outline-none"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs text-slate-400 mb-1">Starter Yearly</label>
                                                <input
                                                    type="text"
                                                    placeholder="price_xxx"
                                                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:border-violet-500 focus:outline-none"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs text-slate-400 mb-1">Pro Monthly</label>
                                                <input
                                                    type="text"
                                                    placeholder="price_xxx"
                                                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:border-violet-500 focus:outline-none"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs text-slate-400 mb-1">Pro Yearly</label>
                                                <input
                                                    type="text"
                                                    placeholder="price_xxx"
                                                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:border-violet-500 focus:outline-none"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs text-slate-400 mb-1">Enterprise Monthly</label>
                                                <input
                                                    type="text"
                                                    placeholder="price_xxx"
                                                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:border-violet-500 focus:outline-none"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs text-slate-400 mb-1">Enterprise Yearly</label>
                                                <input
                                                    type="text"
                                                    placeholder="price_xxx"
                                                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:border-violet-500 focus:outline-none"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Razorpay Keys */}
                                    <div className="space-y-4 p-4 bg-slate-700/30 rounded-xl border-2 border-blue-500/30">
                                        <div className="flex items-center justify-between">
                                            <h4 className="text-sm font-semibold text-blue-400 flex items-center gap-2">
                                                <CreditCard className="w-4 h-4" />
                                                Razorpay API Keys (India)
                                            </h4>
                                            <span className="text-xs px-2 py-1 bg-blue-500/20 text-blue-300 rounded-full">For INR payments</span>
                                        </div>
                                        <div>
                                            <label className="block text-xs text-slate-400 mb-1">Key ID</label>
                                            <input
                                                type="text"
                                                placeholder="rzp_live_... or rzp_test_..."
                                                value={razorpayKeys.keyId}
                                                onChange={(e) => handleRazorpayKeyChange('keyId', e.target.value)}
                                                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:border-violet-500 focus:outline-none"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs text-slate-400 mb-1">Key Secret</label>
                                            <input
                                                type="password"
                                                placeholder="Enter Razorpay Key Secret"
                                                value={razorpayKeys.keySecret}
                                                onChange={(e) => handleRazorpayKeyChange('keySecret', e.target.value)}
                                                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:border-violet-500 focus:outline-none"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs text-slate-400 mb-1">Webhook Secret</label>
                                            <input
                                                type="password"
                                                placeholder="Enter Razorpay Webhook Secret"
                                                value={razorpayKeys.webhookSecret}
                                                onChange={(e) => handleRazorpayKeyChange('webhookSecret', e.target.value)}
                                                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:border-violet-500 focus:outline-none"
                                            />
                                        </div>
                                        <div className="flex items-center justify-between pt-2">
                                            <p className="text-xs text-slate-500">Get keys at: dashboard.razorpay.com</p>
                                            <button
                                                onClick={testRazorpayConnection}
                                                disabled={testResults.razorpay.status === 'testing'}
                                                className={`px-4 py-2 rounded-lg text-xs flex items-center gap-2 ${getTestButtonStyle(testResults.razorpay.status)}`}
                                            >
                                                {testResults.razorpay.status === 'testing' ? (
                                                    <><Loader2 className="w-3 h-3 animate-spin" /> Testing...</>
                                                ) : testResults.razorpay.status === 'success' ? (
                                                    <><CheckCircle2 className="w-3 h-3" /> Connected</>
                                                ) : testResults.razorpay.status === 'error' ? (
                                                    <><XCircle className="w-3 h-3" /> Failed</>
                                                ) : (
                                                    'Test Connection'
                                                )}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Razorpay Plan IDs */}
                                    <div className="space-y-4 p-4 bg-slate-700/30 rounded-xl">
                                        <h4 className="text-sm font-semibold text-blue-400 flex items-center gap-2">
                                            <DollarSign className="w-4 h-4" />
                                            Razorpay Subscription Plan IDs
                                        </h4>
                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <label className="block text-xs text-slate-400 mb-1">Starter Monthly</label>
                                                <input
                                                    type="text"
                                                    placeholder="plan_xxx"
                                                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:border-violet-500 focus:outline-none"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs text-slate-400 mb-1">Starter Yearly</label>
                                                <input
                                                    type="text"
                                                    placeholder="plan_xxx"
                                                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:border-violet-500 focus:outline-none"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs text-slate-400 mb-1">Pro Monthly</label>
                                                <input
                                                    type="text"
                                                    placeholder="plan_xxx"
                                                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:border-violet-500 focus:outline-none"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs text-slate-400 mb-1">Pro Yearly</label>
                                                <input
                                                    type="text"
                                                    placeholder="plan_xxx"
                                                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:border-violet-500 focus:outline-none"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs text-slate-400 mb-1">Enterprise Monthly</label>
                                                <input
                                                    type="text"
                                                    placeholder="plan_xxx"
                                                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:border-violet-500 focus:outline-none"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs text-slate-400 mb-1">Enterprise Yearly</label>
                                                <input
                                                    type="text"
                                                    placeholder="plan_xxx"
                                                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:border-violet-500 focus:outline-none"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Translation Services Section */}
                            <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center">
                                        <Globe className="w-5 h-5 text-blue-400" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-white">Translation Services</h3>
                                        <p className="text-sm text-slate-400">Configure DeepL and Google Translate APIs</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-4 p-4 bg-slate-700/30 rounded-xl">
                                        <h4 className="text-sm font-semibold text-blue-400 flex items-center gap-2">
                                            <Globe className="w-4 h-4" />
                                            DeepL Translation
                                        </h4>
                                        <div>
                                            <label className="block text-xs text-slate-400 mb-1">DeepL API Key</label>
                                            <div className="flex gap-2">
                                                <input
                                                    type="password"
                                                    placeholder="Enter DeepL API key"
                                                    className="flex-1 px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:border-violet-500 focus:outline-none"
                                                />
                                                <button className="px-3 py-2 bg-emerald-500/20 text-emerald-400 rounded-lg text-xs hover:bg-emerald-500/30">
                                                    Test
                                                </button>
                                            </div>
                                            <p className="text-xs text-slate-500 mt-1">Get key at: deepl.com/pro-api</p>
                                        </div>
                                    </div>

                                    <div className="space-y-4 p-4 bg-slate-700/30 rounded-xl">
                                        <h4 className="text-sm font-semibold text-blue-400 flex items-center gap-2">
                                            <Globe className="w-4 h-4" />
                                            Google Cloud Translation
                                        </h4>
                                        <div>
                                            <label className="block text-xs text-slate-400 mb-1">Project ID</label>
                                            <input
                                                type="text"
                                                placeholder="Enter Google Cloud Project ID"
                                                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:border-violet-500 focus:outline-none"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Application Settings Section */}
                            <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-10 h-10 bg-purple-500/20 rounded-xl flex items-center justify-center">
                                        <Settings className="w-5 h-5 text-purple-400" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-white">Application Settings</h3>
                                        <p className="text-sm text-slate-400">Core application configuration</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    <div className="space-y-4 p-4 bg-slate-700/30 rounded-xl">
                                        <h4 className="text-sm font-semibold text-purple-400">App Configuration</h4>
                                        <div>
                                            <label className="block text-xs text-slate-400 mb-1">Application URL</label>
                                            <input
                                                type="url"
                                                placeholder="https://your-domain.com"
                                                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:border-violet-500 focus:outline-none"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs text-slate-400 mb-1">Application Name</label>
                                            <input
                                                type="text"
                                                placeholder="DigitalMEng"
                                                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:border-violet-500 focus:outline-none"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-4 p-4 bg-slate-700/30 rounded-xl">
                                        <h4 className="text-sm font-semibold text-purple-400">Security</h4>
                                        <div>
                                            <label className="block text-xs text-slate-400 mb-1">JWT Secret</label>
                                            <div className="flex gap-2">
                                                <input
                                                    type="password"
                                                    placeholder="Enter JWT secret"
                                                    className="flex-1 px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:border-violet-500 focus:outline-none"
                                                />
                                                <button className="px-3 py-2 bg-violet-500/20 text-violet-400 rounded-lg text-xs hover:bg-violet-500/30">
                                                    Generate
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-4 p-4 bg-slate-700/30 rounded-xl">
                                        <h4 className="text-sm font-semibold text-purple-400">Environment</h4>
                                        <div>
                                            <label className="block text-xs text-slate-400 mb-1">Node Environment</label>
                                            <select className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:border-violet-500 focus:outline-none">
                                                <option value="development">Development</option>
                                                <option value="staging">Staging</option>
                                                <option value="production">Production</option>
                                            </select>
                                        </div>
                                        <div className="flex items-center justify-between mt-2">
                                            <span className="text-xs text-slate-400">Debug Mode</span>
                                            <button className="w-10 h-5 bg-slate-600 rounded-full relative">
                                                <span className="absolute left-1 top-0.5 w-4 h-4 bg-white rounded-full"></span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Analytics & Monitoring Section */}
                            <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-10 h-10 bg-cyan-500/20 rounded-xl flex items-center justify-center">
                                        <BarChart3 className="w-5 h-5 text-cyan-400" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-white">Analytics & Monitoring</h3>
                                        <p className="text-sm text-slate-400">Google Analytics and error tracking configuration</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-4 p-4 bg-slate-700/30 rounded-xl">
                                        <h4 className="text-sm font-semibold text-cyan-400 flex items-center gap-2">
                                            <BarChart3 className="w-4 h-4" />
                                            Google Analytics
                                        </h4>
                                        <div>
                                            <label className="block text-xs text-slate-400 mb-1">Measurement ID</label>
                                            <input
                                                type="text"
                                                placeholder="G-XXXXXXXXXX"
                                                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:border-violet-500 focus:outline-none"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-4 p-4 bg-slate-700/30 rounded-xl">
                                        <h4 className="text-sm font-semibold text-cyan-400 flex items-center gap-2">
                                            <AlertTriangle className="w-4 h-4" />
                                            Sentry Error Tracking
                                        </h4>
                                        <div>
                                            <label className="block text-xs text-slate-400 mb-1">Sentry DSN</label>
                                            <input
                                                type="text"
                                                placeholder="https://xxx@sentry.io/xxx"
                                                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:border-violet-500 focus:outline-none"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Email & Notifications Section */}
                            <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-10 h-10 bg-rose-500/20 rounded-xl flex items-center justify-center">
                                        <Mail className="w-5 h-5 text-rose-400" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-white">Email & Notifications</h3>
                                        <p className="text-sm text-slate-400">Configure admin notification preferences</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    <div className="flex items-center justify-between p-4 bg-slate-700/30 rounded-xl">
                                        <div>
                                            <p className="text-sm text-white">New signup notifications</p>
                                            <p className="text-xs text-slate-400">Email when new users register</p>
                                        </div>
                                        <button className="w-12 h-6 bg-violet-500 rounded-full relative">
                                            <span className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></span>
                                        </button>
                                    </div>
                                    <div className="flex items-center justify-between p-4 bg-slate-700/30 rounded-xl">
                                        <div>
                                            <p className="text-sm text-white">Payment failure alerts</p>
                                            <p className="text-xs text-slate-400">Alert on failed payments</p>
                                        </div>
                                        <button className="w-12 h-6 bg-violet-500 rounded-full relative">
                                            <span className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></span>
                                        </button>
                                    </div>
                                    <div className="flex items-center justify-between p-4 bg-slate-700/30 rounded-xl">
                                        <div>
                                            <p className="text-sm text-white">System health reports</p>
                                            <p className="text-xs text-slate-400">Daily system health email</p>
                                        </div>
                                        <button className="w-12 h-6 bg-slate-600 rounded-full relative">
                                            <span className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full"></span>
                                        </button>
                                    </div>
                                    <div className="flex items-center justify-between p-4 bg-slate-700/30 rounded-xl">
                                        <div>
                                            <p className="text-sm text-white">API rate limit warnings</p>
                                            <p className="text-xs text-slate-400">Alert when limits approach</p>
                                        </div>
                                        <button className="w-12 h-6 bg-violet-500 rounded-full relative">
                                            <span className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></span>
                                        </button>
                                    </div>
                                    <div className="flex items-center justify-between p-4 bg-slate-700/30 rounded-xl">
                                        <div>
                                            <p className="text-sm text-white">Weekly usage summary</p>
                                            <p className="text-xs text-slate-400">Platform usage statistics</p>
                                        </div>
                                        <button className="w-12 h-6 bg-violet-500 rounded-full relative">
                                            <span className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></span>
                                        </button>
                                    </div>
                                    <div className="flex items-center justify-between p-4 bg-slate-700/30 rounded-xl">
                                        <div>
                                            <p className="text-sm text-white">Security alerts</p>
                                            <p className="text-xs text-slate-400">Suspicious activity warnings</p>
                                        </div>
                                        <button className="w-12 h-6 bg-violet-500 rounded-full relative">
                                            <span className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></span>
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Save Button Footer */}
                            <div className="flex items-center justify-between pt-4 border-t border-slate-700">
                                <p className="text-sm text-slate-400">
                                    <Clock className="w-4 h-4 inline mr-1" />
                                    Last saved: Never
                                </p>
                                <div className="flex gap-3">
                                    <button className="px-6 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors">
                                        Reset to Defaults
                                    </button>
                                    <button className="px-6 py-2 bg-violet-500 hover:bg-violet-600 text-white rounded-lg transition-colors flex items-center gap-2">
                                        <CheckCircle2 className="w-4 h-4" />
                                        Save All Settings
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Analytics Tab */}
                    {activeTab === 'analytics' && (
                        <div className="space-y-6">
                            <div>
                                <h2 className="text-2xl font-bold text-white">Platform Analytics</h2>
                                <p className="text-slate-400">Detailed usage and engagement metrics</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6">
                                    <div className="flex items-center gap-3 mb-3">
                                        <Video className="w-6 h-6 text-pink-400" />
                                        <span className="text-sm text-slate-400">Videos Generated</span>
                                    </div>
                                    <p className="text-3xl font-bold text-white">12,847</p>
                                    <p className="text-sm text-emerald-400 mt-1">+23% this month</p>
                                </div>
                                <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6">
                                    <div className="flex items-center gap-3 mb-3">
                                        <ImageIcon className="w-6 h-6 text-purple-400" />
                                        <span className="text-sm text-slate-400">Images Created</span>
                                    </div>
                                    <p className="text-3xl font-bold text-white">89,234</p>
                                    <p className="text-sm text-emerald-400 mt-1">+45% this month</p>
                                </div>
                                <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6">
                                    <div className="flex items-center gap-3 mb-3">
                                        <Mic className="w-6 h-6 text-cyan-400" />
                                        <span className="text-sm text-slate-400">Voice Overs</span>
                                    </div>
                                    <p className="text-3xl font-bold text-white">34,521</p>
                                    <p className="text-sm text-emerald-400 mt-1">+18% this month</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Affiliates Tab */}
                    {activeTab === 'affiliates' && (
                        <div className="space-y-6">
                            <div>
                                <h2 className="text-2xl font-bold text-white">Affiliate Program Management</h2>
                                <p className="text-slate-400">Manage affiliates, approve applications, and process payouts</p>
                            </div>
                            <AdminAffiliatePanel />
                        </div>
                    )}
                </main>
            </div>

            {/* Add User Modal */}
            {showAddUserModal && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
                    <div className="bg-slate-800 rounded-2xl border border-slate-700 w-full max-w-md">
                        <div className="p-6 border-b border-slate-700">
                            <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                <UserPlus className="w-5 h-5 text-violet-400" />
                                Add New User
                            </h3>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">Full Name *</label>
                                <input
                                    type="text"
                                    value={userFormData.name}
                                    onChange={(e) => setUserFormData({ ...userFormData, name: e.target.value })}
                                    placeholder="Enter full name"
                                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-violet-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">Email Address *</label>
                                <input
                                    type="email"
                                    value={userFormData.email}
                                    onChange={(e) => setUserFormData({ ...userFormData, email: e.target.value })}
                                    placeholder="Enter email address"
                                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-violet-500"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-2">Plan</label>
                                    <select
                                        value={userFormData.plan}
                                        onChange={(e) => setUserFormData({ ...userFormData, plan: e.target.value })}
                                        className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white focus:outline-none focus:border-violet-500"
                                    >
                                        <option value="free">Free</option>
                                        <option value="starter">Starter</option>
                                        <option value="pro">Pro</option>
                                        <option value="enterprise">Enterprise</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-2">Role</label>
                                    <select
                                        value={userFormData.role}
                                        onChange={(e) => setUserFormData({ ...userFormData, role: e.target.value })}
                                        className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white focus:outline-none focus:border-violet-500"
                                    >
                                        <option value="viewer">Viewer</option>
                                        <option value="editor">Editor</option>
                                        <option value="admin">Admin</option>
                                        <option value="support">Support</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div className="p-6 border-t border-slate-700 flex gap-3">
                            <button
                                onClick={() => setShowAddUserModal(false)}
                                className="flex-1 px-4 py-3 bg-slate-700 text-white rounded-xl font-medium hover:bg-slate-600 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSaveNewUser}
                                className="flex-1 px-4 py-3 bg-violet-500 text-white rounded-xl font-medium hover:bg-violet-600 transition-colors"
                            >
                                Create User
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* View User Modal */}
            {showViewUserModal && selectedUserForAction && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
                    <div className="bg-slate-800 rounded-2xl border border-slate-700 w-full max-w-lg">
                        <div className="p-6 border-b border-slate-700 flex items-center justify-between">
                            <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                <Eye className="w-5 h-5 text-blue-400" />
                                User Details
                            </h3>
                            <button
                                onClick={() => setShowViewUserModal(false)}
                                className="p-2 hover:bg-slate-700 rounded-lg"
                            >
                                <XCircle className="w-5 h-5 text-slate-400" />
                            </button>
                        </div>
                        <div className="p-6">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-16 h-16 bg-gradient-to-br from-violet-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                                    {selectedUserForAction.name.charAt(0)}
                                </div>
                                <div>
                                    <h4 className="text-xl font-bold text-white">{selectedUserForAction.name}</h4>
                                    <p className="text-slate-400">{selectedUserForAction.email}</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-slate-700/50 rounded-xl p-4">
                                    <p className="text-xs text-slate-400 mb-1">Plan</p>
                                    <p className="text-white font-medium capitalize">{selectedUserForAction.plan}</p>
                                </div>
                                <div className="bg-slate-700/50 rounded-xl p-4">
                                    <p className="text-xs text-slate-400 mb-1">Status</p>
                                    <p className={`font-medium capitalize ${selectedUserForAction.status === 'active' ? 'text-emerald-400' : 'text-red-400'}`}>
                                        {selectedUserForAction.status}
                                    </p>
                                </div>
                                <div className="bg-slate-700/50 rounded-xl p-4">
                                    <p className="text-xs text-slate-400 mb-1">Revenue</p>
                                    <p className="text-white font-medium">${selectedUserForAction.revenue}</p>
                                </div>
                                <div className="bg-slate-700/50 rounded-xl p-4">
                                    <p className="text-xs text-slate-400 mb-1">Content Created</p>
                                    <p className="text-white font-medium">{selectedUserForAction.contentCount}</p>
                                </div>
                                <div className="bg-slate-700/50 rounded-xl p-4 col-span-2">
                                    <p className="text-xs text-slate-400 mb-1">Joined Date</p>
                                    <p className="text-white font-medium">{selectedUserForAction.joined}</p>
                                </div>
                            </div>
                        </div>
                        <div className="p-6 border-t border-slate-700 flex gap-3">
                            <button
                                onClick={() => setShowViewUserModal(false)}
                                className="flex-1 px-4 py-3 bg-slate-700 text-white rounded-xl font-medium hover:bg-slate-600 transition-colors"
                            >
                                Close
                            </button>
                            <button
                                onClick={() => {
                                    setShowViewUserModal(false);
                                    handleEditUser(selectedUserForAction);
                                }}
                                className="flex-1 px-4 py-3 bg-violet-500 text-white rounded-xl font-medium hover:bg-violet-600 transition-colors"
                            >
                                Edit User
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit User Modal */}
            {showEditUserModal && selectedUserForAction && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
                    <div className="bg-slate-800 rounded-2xl border border-slate-700 w-full max-w-md">
                        <div className="p-6 border-b border-slate-700">
                            <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                <Edit className="w-5 h-5 text-amber-400" />
                                Edit User
                            </h3>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">Full Name</label>
                                <input
                                    type="text"
                                    value={userFormData.name}
                                    onChange={(e) => setUserFormData({ ...userFormData, name: e.target.value })}
                                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white focus:outline-none focus:border-violet-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">Email Address</label>
                                <input
                                    type="email"
                                    value={userFormData.email}
                                    onChange={(e) => setUserFormData({ ...userFormData, email: e.target.value })}
                                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white focus:outline-none focus:border-violet-500"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-2">Plan</label>
                                    <select
                                        value={userFormData.plan}
                                        onChange={(e) => setUserFormData({ ...userFormData, plan: e.target.value })}
                                        className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white focus:outline-none focus:border-violet-500"
                                    >
                                        <option value="free">Free</option>
                                        <option value="starter">Starter</option>
                                        <option value="pro">Pro</option>
                                        <option value="enterprise">Enterprise</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-2">Status</label>
                                    <select
                                        value={userFormData.status}
                                        onChange={(e) => setUserFormData({ ...userFormData, status: e.target.value })}
                                        className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white focus:outline-none focus:border-violet-500"
                                    >
                                        <option value="active">Active</option>
                                        <option value="suspended">Suspended</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div className="p-6 border-t border-slate-700 flex gap-3">
                            <button
                                onClick={() => setShowEditUserModal(false)}
                                className="flex-1 px-4 py-3 bg-slate-700 text-white rounded-xl font-medium hover:bg-slate-600 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSaveEditUser}
                                className="flex-1 px-4 py-3 bg-violet-500 text-white rounded-xl font-medium hover:bg-violet-600 transition-colors"
                            >
                                Save Changes
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteConfirmModal && selectedUserForAction && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
                    <div className="bg-slate-800 rounded-2xl border border-red-500/30 w-full max-w-md">
                        <div className="p-6 border-b border-slate-700">
                            <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                <AlertTriangle className="w-5 h-5 text-red-400" />
                                Confirm Delete
                            </h3>
                        </div>
                        <div className="p-6">
                            <p className="text-slate-300 mb-4">
                                Are you sure you want to delete the customer <strong className="text-white">{selectedUserForAction.name}</strong>?
                            </p>
                            <p className="text-sm text-slate-400">
                                This action cannot be undone. All data associated with this customer will be permanently removed.
                            </p>
                        </div>
                        <div className="p-6 border-t border-slate-700 flex gap-3">
                            <button
                                onClick={() => setShowDeleteConfirmModal(false)}
                                className="flex-1 px-4 py-3 bg-slate-700 text-white rounded-xl font-medium hover:bg-slate-600 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleConfirmDelete}
                                className="flex-1 px-4 py-3 bg-red-500 text-white rounded-xl font-medium hover:bg-red-600 transition-colors"
                            >
                                Delete Customer
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ==================== STAFF MODALS ==================== */}

            {/* Add Staff Modal */}
            {showAddStaffModal && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
                    <div className="bg-slate-800 rounded-2xl border border-emerald-500/30 w-full max-w-md">
                        <div className="p-6 border-b border-slate-700">
                            <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                <UserPlus className="w-5 h-5 text-emerald-400" />
                                Add Staff Member
                            </h3>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">Full Name *</label>
                                <input
                                    type="text"
                                    value={staffFormData.name}
                                    onChange={(e) => setStaffFormData({ ...staffFormData, name: e.target.value })}
                                    placeholder="Enter full name"
                                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">Email Address *</label>
                                <input
                                    type="email"
                                    value={staffFormData.email}
                                    onChange={(e) => setStaffFormData({ ...staffFormData, email: e.target.value })}
                                    placeholder="Enter email address"
                                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-2">Role</label>
                                    <select
                                        value={staffFormData.role}
                                        onChange={(e) => setStaffFormData({ ...staffFormData, role: e.target.value })}
                                        className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                                    >
                                        <option value="viewer">Viewer</option>
                                        <option value="editor">Editor</option>
                                        <option value="support">Support</option>
                                        <option value="admin">Admin</option>
                                        <option value="superadmin">Superadmin</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-2">Department</label>
                                    <select
                                        value={staffFormData.department}
                                        onChange={(e) => setStaffFormData({ ...staffFormData, department: e.target.value })}
                                        className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                                    >
                                        <option value="Support">Support</option>
                                        <option value="Engineering">Engineering</option>
                                        <option value="Management">Management</option>
                                        <option value="Content">Content</option>
                                        <option value="Analytics">Analytics</option>
                                        <option value="Sales">Sales</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div className="p-6 border-t border-slate-700 flex gap-3">
                            <button
                                onClick={() => setShowAddStaffModal(false)}
                                className="flex-1 px-4 py-3 bg-slate-700 text-white rounded-xl font-medium hover:bg-slate-600 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSaveNewStaff}
                                className="flex-1 px-4 py-3 bg-emerald-500 text-white rounded-xl font-medium hover:bg-emerald-600 transition-colors"
                            >
                                Add Staff
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* View Staff Modal */}
            {showViewStaffModal && selectedStaffForAction && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
                    <div className="bg-slate-800 rounded-2xl border border-slate-700 w-full max-w-lg">
                        <div className="p-6 border-b border-slate-700 flex items-center justify-between">
                            <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                <Eye className="w-5 h-5 text-emerald-400" />
                                Staff Details
                            </h3>
                            <button
                                onClick={() => setShowViewStaffModal(false)}
                                className="p-2 hover:bg-slate-700 rounded-lg"
                            >
                                <XCircle className="w-5 h-5 text-slate-400" />
                            </button>
                        </div>
                        <div className="p-6">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                                    {selectedStaffForAction.name.charAt(0)}
                                </div>
                                <div>
                                    <h4 className="text-xl font-bold text-white">{selectedStaffForAction.name}</h4>
                                    <p className="text-slate-400">{selectedStaffForAction.email}</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-slate-700/50 rounded-xl p-4">
                                    <p className="text-xs text-slate-400 mb-1">Role</p>
                                    <p className="text-white font-medium capitalize">{selectedStaffForAction.role}</p>
                                </div>
                                <div className="bg-slate-700/50 rounded-xl p-4">
                                    <p className="text-xs text-slate-400 mb-1">Department</p>
                                    <p className="text-white font-medium">{selectedStaffForAction.department}</p>
                                </div>
                                <div className="bg-slate-700/50 rounded-xl p-4">
                                    <p className="text-xs text-slate-400 mb-1">Status</p>
                                    <p className={`font-medium capitalize ${selectedStaffForAction.status === 'active' ? 'text-emerald-400' : 'text-slate-400'}`}>
                                        {selectedStaffForAction.status}
                                    </p>
                                </div>
                                <div className="bg-slate-700/50 rounded-xl p-4">
                                    <p className="text-xs text-slate-400 mb-1">Last Active</p>
                                    <p className="text-white font-medium">{selectedStaffForAction.lastActive}</p>
                                </div>
                                <div className="bg-slate-700/50 rounded-xl p-4 col-span-2">
                                    <p className="text-xs text-slate-400 mb-1">Joined Date</p>
                                    <p className="text-white font-medium">{selectedStaffForAction.joined}</p>
                                </div>
                            </div>
                        </div>
                        <div className="p-6 border-t border-slate-700 flex gap-3">
                            <button
                                onClick={() => setShowViewStaffModal(false)}
                                className="flex-1 px-4 py-3 bg-slate-700 text-white rounded-xl font-medium hover:bg-slate-600 transition-colors"
                            >
                                Close
                            </button>
                            <button
                                onClick={() => {
                                    setShowViewStaffModal(false);
                                    handleEditStaff(selectedStaffForAction);
                                }}
                                className="flex-1 px-4 py-3 bg-emerald-500 text-white rounded-xl font-medium hover:bg-emerald-600 transition-colors"
                            >
                                Edit Staff
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Staff Modal */}
            {showEditStaffModal && selectedStaffForAction && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
                    <div className="bg-slate-800 rounded-2xl border border-slate-700 w-full max-w-md">
                        <div className="p-6 border-b border-slate-700">
                            <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                <Edit className="w-5 h-5 text-amber-400" />
                                Edit Staff Member
                            </h3>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">Full Name</label>
                                <input
                                    type="text"
                                    value={staffFormData.name}
                                    onChange={(e) => setStaffFormData({ ...staffFormData, name: e.target.value })}
                                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">Email Address</label>
                                <input
                                    type="email"
                                    value={staffFormData.email}
                                    onChange={(e) => setStaffFormData({ ...staffFormData, email: e.target.value })}
                                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-2">Role</label>
                                    <select
                                        value={staffFormData.role}
                                        onChange={(e) => setStaffFormData({ ...staffFormData, role: e.target.value })}
                                        className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                                    >
                                        <option value="viewer">Viewer</option>
                                        <option value="editor">Editor</option>
                                        <option value="support">Support</option>
                                        <option value="admin">Admin</option>
                                        <option value="superadmin">Superadmin</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-2">Department</label>
                                    <select
                                        value={staffFormData.department}
                                        onChange={(e) => setStaffFormData({ ...staffFormData, department: e.target.value })}
                                        className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                                    >
                                        <option value="Support">Support</option>
                                        <option value="Engineering">Engineering</option>
                                        <option value="Management">Management</option>
                                        <option value="Content">Content</option>
                                        <option value="Analytics">Analytics</option>
                                        <option value="Sales">Sales</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">Status</label>
                                <select
                                    value={staffFormData.status}
                                    onChange={(e) => setStaffFormData({ ...staffFormData, status: e.target.value })}
                                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                                >
                                    <option value="active">Active</option>
                                    <option value="inactive">Inactive</option>
                                </select>
                            </div>
                        </div>
                        <div className="p-6 border-t border-slate-700 flex gap-3">
                            <button
                                onClick={() => setShowEditStaffModal(false)}
                                className="flex-1 px-4 py-3 bg-slate-700 text-white rounded-xl font-medium hover:bg-slate-600 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSaveEditStaff}
                                className="flex-1 px-4 py-3 bg-emerald-500 text-white rounded-xl font-medium hover:bg-emerald-600 transition-colors"
                            >
                                Save Changes
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Staff Confirmation Modal */}
            {showDeleteStaffModal && selectedStaffForAction && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
                    <div className="bg-slate-800 rounded-2xl border border-red-500/30 w-full max-w-md">
                        <div className="p-6 border-b border-slate-700">
                            <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                <AlertTriangle className="w-5 h-5 text-red-400" />
                                Confirm Staff Removal
                            </h3>
                        </div>
                        <div className="p-6">
                            <p className="text-slate-300 mb-4">
                                Are you sure you want to remove staff member <strong className="text-white">{selectedStaffForAction.name}</strong>?
                            </p>
                            <p className="text-sm text-slate-400">
                                This will revoke their access to the admin console and all internal systems.
                            </p>
                        </div>
                        <div className="p-6 border-t border-slate-700 flex gap-3">
                            <button
                                onClick={() => setShowDeleteStaffModal(false)}
                                className="flex-1 px-4 py-3 bg-slate-700 text-white rounded-xl font-medium hover:bg-slate-600 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleConfirmDeleteStaff}
                                className="flex-1 px-4 py-3 bg-red-500 text-white rounded-xl font-medium hover:bg-red-600 transition-colors"
                            >
                                Remove Staff
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
