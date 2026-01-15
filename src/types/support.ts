// =============================================================================
// HELPDESK & SUPPORT TICKET TYPES
// =============================================================================

export type TicketStatus =
    | 'open'
    | 'in_progress'
    | 'waiting_on_customer'
    | 'waiting_on_support'
    | 'resolved'
    | 'closed';

export type TicketPriority = 'low' | 'medium' | 'high' | 'critical';

export type TicketCategory =
    | 'technical'
    | 'billing'
    | 'feature_request'
    | 'bug_report'
    | 'account'
    | 'integration'
    | 'content'
    | 'general';

export type TicketSource = 'user' | 'nandu' | 'email' | 'api';

export interface SupportTicket {
    id: string;
    ticketNumber: string;
    organizationId?: string;
    userId: string;

    // Ticket Details
    subject: string;
    description: string;
    category: TicketCategory;
    priority: TicketPriority;
    status: TicketStatus;

    // Assignment
    assignedToId?: string;
    assignedToName?: string;

    // Source tracking
    source: TicketSource;
    nanduContext?: any;

    // Resolution
    resolution?: string;
    resolvedAt?: Date;
    resolvedById?: string;

    // Customer info (populated)
    userName?: string;
    userEmail?: string;

    // Customer satisfaction
    rating?: number;
    feedback?: string;

    // SLA tracking
    firstResponseAt?: Date;
    slaBreached: boolean;

    // Timestamps
    createdAt: Date;
    updatedAt: Date;
    closedAt?: Date;

    // Related data
    messages?: TicketMessage[];
    messageCount?: number;
}

export interface TicketMessage {
    id: string;
    ticketId: string;
    senderId: string;
    senderType: 'user' | 'support' | 'system' | 'nandu';
    senderName?: string;
    senderAvatar?: string;

    message: string;
    isInternal: boolean;

    createdAt: Date;
}

export interface TicketAttachment {
    id: string;
    ticketId: string;
    fileName: string;
    fileUrl: string;
    fileSize: number;
    mimeType: string;
    uploadedBy: string;
    createdAt: Date;
}

export interface CreateTicketRequest {
    subject: string;
    description: string;
    category: TicketCategory;
    priority?: TicketPriority;
    source?: TicketSource;
    nanduContext?: any;
}

export interface UpdateTicketRequest {
    status?: TicketStatus;
    priority?: TicketPriority;
    assignedToId?: string;
    resolution?: string;
}

export interface TicketFilters {
    status?: TicketStatus | TicketStatus[];
    priority?: TicketPriority | TicketPriority[];
    category?: TicketCategory | TicketCategory[];
    assignedToId?: string;
    userId?: string;
    search?: string;
}

export interface TicketStats {
    total: number;
    open: number;
    inProgress: number;
    waitingOnCustomer: number;
    waitingOnSupport: number;
    resolved: number;
    closed: number;
    avgResolutionTime: number; // in hours
    slaBreachRate: number; // percentage
}

// Status display config
export const TICKET_STATUS_CONFIG: Record<TicketStatus, { label: string; color: string; bgColor: string }> = {
    open: { label: 'Open', color: 'text-blue-700', bgColor: 'bg-blue-100' },
    in_progress: { label: 'In Progress', color: 'text-amber-700', bgColor: 'bg-amber-100' },
    waiting_on_customer: { label: 'Waiting on Customer', color: 'text-purple-700', bgColor: 'bg-purple-100' },
    waiting_on_support: { label: 'Waiting on Support', color: 'text-orange-700', bgColor: 'bg-orange-100' },
    resolved: { label: 'Resolved', color: 'text-emerald-700', bgColor: 'bg-emerald-100' },
    closed: { label: 'Closed', color: 'text-slate-700', bgColor: 'bg-slate-100' },
};

export const TICKET_PRIORITY_CONFIG: Record<TicketPriority, { label: string; color: string; bgColor: string; icon: string }> = {
    low: { label: 'Low', color: 'text-slate-600', bgColor: 'bg-slate-100', icon: '▽' },
    medium: { label: 'Medium', color: 'text-blue-600', bgColor: 'bg-blue-100', icon: '◇' },
    high: { label: 'High', color: 'text-orange-600', bgColor: 'bg-orange-100', icon: '△' },
    critical: { label: 'Critical', color: 'text-red-600', bgColor: 'bg-red-100', icon: '🔥' },
};

export const TICKET_CATEGORY_CONFIG: Record<TicketCategory, { label: string; icon: string; description: string }> = {
    technical: { label: 'Technical Issue', icon: '🔧', description: 'Bugs, errors, or technical problems' },
    billing: { label: 'Billing & Payments', icon: '💳', description: 'Subscription, invoices, refunds' },
    feature_request: { label: 'Feature Request', icon: '💡', description: 'Suggest new features or improvements' },
    bug_report: { label: 'Bug Report', icon: '🐛', description: 'Report a bug or unexpected behavior' },
    account: { label: 'Account & Access', icon: '🔐', description: 'Login, permissions, settings' },
    integration: { label: 'Integration Help', icon: '🔗', description: 'Platform connections, APIs' },
    content: { label: 'Content & AI', icon: '✨', description: 'AI generation, content quality' },
    general: { label: 'General Inquiry', icon: '❓', description: 'Other questions or feedback' },
};
