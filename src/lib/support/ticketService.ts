// =============================================================================
// HELPDESK & SUPPORT TICKET SERVICE
// =============================================================================

import type {
    SupportTicket,
    TicketMessage,
    CreateTicketRequest,
    UpdateTicketRequest,
    TicketFilters,
    TicketStats,
    TicketStatus,
    TicketPriority,
    TicketCategory
} from '@/types/support';

// Mock data for support tickets (in production, this would be database calls)
let mockTickets: SupportTicket[] = [
    {
        id: 'tkt_001',
        ticketNumber: 'TKT-2026-0001',
        userId: 'user_001',
        userName: 'John Smith',
        userEmail: 'john@example.com',
        subject: 'Unable to connect Instagram account',
        description: 'I have been trying to connect my Instagram business account but keep getting an error message saying "Authentication failed". I have verified my credentials are correct.',
        category: 'integration',
        priority: 'high',
        status: 'in_progress',
        assignedToId: 'support_001',
        assignedToName: 'Sarah Support',
        source: 'user',
        slaBreached: false,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
        updatedAt: new Date(Date.now() - 1000 * 60 * 30),
        firstResponseAt: new Date(Date.now() - 1000 * 60 * 60),
        messageCount: 3,
    },
    {
        id: 'tkt_002',
        ticketNumber: 'TKT-2026-0002',
        userId: 'user_002',
        userName: 'Maria Garcia',
        userEmail: 'maria@example.com',
        subject: 'Request for bulk content export feature',
        description: 'It would be great to have a feature that allows exporting all generated content in bulk as a ZIP file. This would help with backup and offline access.',
        category: 'feature_request',
        priority: 'medium',
        status: 'open',
        source: 'user',
        slaBreached: false,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
        updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24),
        messageCount: 1,
    },
    {
        id: 'tkt_003',
        ticketNumber: 'TKT-2026-0003',
        userId: 'user_003',
        userName: 'Alex Chen',
        userEmail: 'alex@example.com',
        subject: 'Billing question about annual plan',
        description: 'I upgraded from Starter to Pro plan mid-month. Can you confirm how the billing proration works?',
        category: 'billing',
        priority: 'medium',
        status: 'resolved',
        assignedToId: 'support_002',
        assignedToName: 'Mike Support',
        source: 'nandu',
        nanduContext: { conversationId: 'conv_123', lastMessage: 'User had billing question that I could not fully answer' },
        resolution: 'Explained proration policy and confirmed billing adjustment was applied correctly.',
        resolvedAt: new Date(Date.now() - 1000 * 60 * 60 * 4),
        resolvedById: 'support_002',
        slaBreached: false,
        rating: 5,
        feedback: 'Quick and helpful response!',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 8),
        updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 4),
        firstResponseAt: new Date(Date.now() - 1000 * 60 * 60 * 7),
        messageCount: 5,
    },
    {
        id: 'tkt_004',
        ticketNumber: 'TKT-2026-0004',
        userId: 'user_004',
        userName: 'Emma Wilson',
        userEmail: 'emma@example.com',
        subject: 'AI content quality issue',
        description: 'The AI-generated blog posts seem to be repeating similar phrases. Can you help improve the variety?',
        category: 'content',
        priority: 'high',
        status: 'waiting_on_customer',
        assignedToId: 'support_001',
        assignedToName: 'Sarah Support',
        source: 'user',
        slaBreached: false,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5),
        updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 1),
        firstResponseAt: new Date(Date.now() - 1000 * 60 * 60 * 4),
        messageCount: 4,
    },
];

let mockMessages: TicketMessage[] = [
    {
        id: 'msg_001',
        ticketId: 'tkt_001',
        senderId: 'user_001',
        senderType: 'user',
        senderName: 'John Smith',
        message: 'I have been trying to connect my Instagram business account but keep getting an error message saying "Authentication failed". I have verified my credentials are correct.',
        isInternal: false,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2),
    },
    {
        id: 'msg_002',
        ticketId: 'tkt_001',
        senderId: 'support_001',
        senderType: 'support',
        senderName: 'Sarah Support',
        message: 'Hi John, thank you for reaching out! I can help you with the Instagram connection. Could you please confirm if your Instagram account is a Business or Creator account? Personal accounts cannot be connected.',
        isInternal: false,
        createdAt: new Date(Date.now() - 1000 * 60 * 60),
    },
    {
        id: 'msg_003',
        ticketId: 'tkt_001',
        senderId: 'support_001',
        senderType: 'support',
        senderName: 'Sarah Support',
        message: 'Internal note: Checking if this is related to the Meta API issue reported yesterday.',
        isInternal: true,
        createdAt: new Date(Date.now() - 1000 * 60 * 55),
    },
    {
        id: 'msg_004',
        ticketId: 'tkt_001',
        senderId: 'user_001',
        senderType: 'user',
        senderName: 'John Smith',
        message: 'Yes, it is a Business account. Connected to a Facebook Page as well.',
        isInternal: false,
        createdAt: new Date(Date.now() - 1000 * 60 * 30),
    },
];

// Generate unique ticket number
let ticketCounter = 4;
function generateTicketNumber(): string {
    ticketCounter++;
    const year = new Date().getFullYear();
    return `TKT-${year}-${String(ticketCounter).padStart(4, '0')}`;
}

// =============================================================================
// TICKET SERVICE FUNCTIONS
// =============================================================================

/**
 * Get all tickets with optional filters
 */
export async function getTickets(filters?: TicketFilters): Promise<SupportTicket[]> {
    let filtered = [...mockTickets];

    if (filters) {
        if (filters.status) {
            const statuses = Array.isArray(filters.status) ? filters.status : [filters.status];
            filtered = filtered.filter(t => statuses.includes(t.status));
        }
        if (filters.priority) {
            const priorities = Array.isArray(filters.priority) ? filters.priority : [filters.priority];
            filtered = filtered.filter(t => priorities.includes(t.priority));
        }
        if (filters.category) {
            const categories = Array.isArray(filters.category) ? filters.category : [filters.category];
            filtered = filtered.filter(t => categories.includes(t.category));
        }
        if (filters.assignedToId) {
            filtered = filtered.filter(t => t.assignedToId === filters.assignedToId);
        }
        if (filters.userId) {
            filtered = filtered.filter(t => t.userId === filters.userId);
        }
        if (filters.search) {
            const search = filters.search.toLowerCase();
            filtered = filtered.filter(t =>
                t.subject.toLowerCase().includes(search) ||
                t.description.toLowerCase().includes(search) ||
                t.ticketNumber.toLowerCase().includes(search)
            );
        }
    }

    // Sort by priority (critical first) then by date (newest first)
    const priorityOrder: Record<TicketPriority, number> = { critical: 0, high: 1, medium: 2, low: 3 };
    filtered.sort((a, b) => {
        if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
            return priorityOrder[a.priority] - priorityOrder[b.priority];
        }
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    return filtered;
}

/**
 * Get a single ticket by ID
 */
export async function getTicketById(ticketId: string): Promise<SupportTicket | null> {
    const ticket = mockTickets.find(t => t.id === ticketId);
    if (ticket) {
        ticket.messages = mockMessages.filter(m => m.ticketId === ticketId);
    }
    return ticket || null;
}

/**
 * Get tickets for a specific user
 */
export async function getUserTickets(userId: string): Promise<SupportTicket[]> {
    return getTickets({ userId });
}

/**
 * Create a new support ticket
 */
export async function createTicket(
    userId: string,
    userName: string,
    userEmail: string,
    request: CreateTicketRequest
): Promise<SupportTicket> {
    const now = new Date();
    const ticket: SupportTicket = {
        id: `tkt_${Date.now()}`,
        ticketNumber: generateTicketNumber(),
        userId,
        userName,
        userEmail,
        subject: request.subject,
        description: request.description,
        category: request.category,
        priority: request.priority || 'medium',
        status: 'open',
        source: request.source || 'user',
        nanduContext: request.nanduContext,
        slaBreached: false,
        createdAt: now,
        updatedAt: now,
        messageCount: 1,
    };

    mockTickets.unshift(ticket);

    // Create initial message
    const message: TicketMessage = {
        id: `msg_${Date.now()}`,
        ticketId: ticket.id,
        senderId: userId,
        senderType: request.source === 'nandu' ? 'nandu' : 'user',
        senderName: userName,
        message: request.description,
        isInternal: false,
        createdAt: now,
    };
    mockMessages.push(message);

    console.log(`🎫 Support ticket created: ${ticket.ticketNumber} - ${ticket.subject}`);

    return ticket;
}

/**
 * Update a ticket (for support team)
 */
export async function updateTicket(
    ticketId: string,
    updates: UpdateTicketRequest,
    updatedBy?: string
): Promise<SupportTicket | null> {
    const ticketIndex = mockTickets.findIndex(t => t.id === ticketId);
    if (ticketIndex === -1) return null;

    const ticket = mockTickets[ticketIndex];
    const now = new Date();

    if (updates.status) {
        ticket.status = updates.status;
        if (updates.status === 'resolved') {
            ticket.resolvedAt = now;
            ticket.resolvedById = updatedBy;
        }
        if (updates.status === 'closed') {
            ticket.closedAt = now;
        }
    }

    if (updates.priority) ticket.priority = updates.priority;
    if (updates.assignedToId) ticket.assignedToId = updates.assignedToId;
    if (updates.resolution) ticket.resolution = updates.resolution;

    ticket.updatedAt = now;
    mockTickets[ticketIndex] = ticket;

    return ticket;
}

/**
 * Add a message to a ticket
 */
export async function addTicketMessage(
    ticketId: string,
    senderId: string,
    senderName: string,
    senderType: 'user' | 'support' | 'system' | 'nandu',
    message: string,
    isInternal: boolean = false
): Promise<TicketMessage | null> {
    const ticket = mockTickets.find(t => t.id === ticketId);
    if (!ticket) return null;

    const now = new Date();
    const newMessage: TicketMessage = {
        id: `msg_${Date.now()}`,
        ticketId,
        senderId,
        senderType,
        senderName,
        message,
        isInternal,
        createdAt: now,
    };

    mockMessages.push(newMessage);

    // Update ticket
    ticket.updatedAt = now;
    if (ticket.messageCount) {
        ticket.messageCount++;
    } else {
        ticket.messageCount = 1;
    }

    // Update first response time if support is replying
    if (senderType === 'support' && !ticket.firstResponseAt) {
        ticket.firstResponseAt = now;
    }

    // Update status based on who is replying
    if (senderType === 'support' && ticket.status === 'waiting_on_support') {
        ticket.status = 'waiting_on_customer';
    } else if (senderType === 'user' && ticket.status === 'waiting_on_customer') {
        ticket.status = 'waiting_on_support';
    }

    return newMessage;
}

/**
 * Get ticket messages
 */
export async function getTicketMessages(ticketId: string, includeInternal: boolean = false): Promise<TicketMessage[]> {
    let messages = mockMessages.filter(m => m.ticketId === ticketId);
    if (!includeInternal) {
        messages = messages.filter(m => !m.isInternal);
    }
    return messages.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
}

/**
 * Get ticket statistics for dashboard
 */
export async function getTicketStats(): Promise<TicketStats> {
    const tickets = mockTickets;

    const byStatus = {
        open: tickets.filter(t => t.status === 'open').length,
        inProgress: tickets.filter(t => t.status === 'in_progress').length,
        waitingOnCustomer: tickets.filter(t => t.status === 'waiting_on_customer').length,
        waitingOnSupport: tickets.filter(t => t.status === 'waiting_on_support').length,
        resolved: tickets.filter(t => t.status === 'resolved').length,
        closed: tickets.filter(t => t.status === 'closed').length,
    };

    // Calculate average resolution time
    const resolvedTickets = tickets.filter(t => t.resolvedAt);
    const avgResolutionTime = resolvedTickets.length > 0
        ? resolvedTickets.reduce((sum, t) => {
            const created = new Date(t.createdAt).getTime();
            const resolved = new Date(t.resolvedAt!).getTime();
            return sum + (resolved - created) / (1000 * 60 * 60); // hours
        }, 0) / resolvedTickets.length
        : 0;

    // Calculate SLA breach rate
    const slaBreachRate = tickets.length > 0
        ? (tickets.filter(t => t.slaBreached).length / tickets.length) * 100
        : 0;

    return {
        total: tickets.length,
        ...byStatus,
        avgResolutionTime: Math.round(avgResolutionTime * 10) / 10,
        slaBreachRate: Math.round(slaBreachRate * 10) / 10,
    };
}

/**
 * Assign a ticket to a support team member
 */
export async function assignTicket(ticketId: string, assigneeId: string, assigneeName: string): Promise<SupportTicket | null> {
    const ticket = mockTickets.find(t => t.id === ticketId);
    if (!ticket) return null;

    ticket.assignedToId = assigneeId;
    ticket.assignedToName = assigneeName;
    ticket.status = 'in_progress';
    ticket.updatedAt = new Date();

    // Add system message
    await addTicketMessage(
        ticketId,
        'system',
        'System',
        'system',
        `Ticket assigned to ${assigneeName}`,
        true
    );

    return ticket;
}

/**
 * Create ticket from Nandu escalation
 */
export async function createTicketFromNandu(
    userId: string,
    userName: string,
    userEmail: string,
    subject: string,
    description: string,
    conversationContext: any,
    category: TicketCategory = 'general'
): Promise<SupportTicket> {
    return createTicket(userId, userName, userEmail, {
        subject,
        description,
        category,
        priority: 'medium',
        source: 'nandu',
        nanduContext: conversationContext,
    });
}

/**
 * Get support team members (for assignment)
 */
export async function getSupportTeamMembers(): Promise<{ id: string; name: string; email: string; activeTickets: number }[]> {
    // Mock support team members
    return [
        { id: 'support_001', name: 'Sarah Support', email: 'sarah@digitalmeng.com', activeTickets: 5 },
        { id: 'support_002', name: 'Mike Support', email: 'mike@digitalmeng.com', activeTickets: 3 },
        { id: 'support_003', name: 'Lisa Support', email: 'lisa@digitalmeng.com', activeTickets: 7 },
    ];
}
