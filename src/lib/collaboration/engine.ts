// =============================================================================
// COLLABORATION ENGINE - Team Workflow & Approval System
// =============================================================================
// Enables team collaboration on AI-generated content with:
// - Role-based access (Creator, Reviewer, Approver)
// - Approval workflows and queues
// - Comments and feedback
// - Real-time notifications
// =============================================================================

// =============================================================================
// TYPES
// =============================================================================

export type TeamRole = 'creator' | 'reviewer' | 'approver' | 'admin' | 'viewer';
export type ApprovalStatus = 'pending' | 'in_review' | 'changes_requested' | 'approved' | 'rejected' | 'published';
export type ContentSource = 'manual' | 'autopilot' | 'ai_suggestion' | 'recurring';
export type Priority = 'low' | 'medium' | 'high' | 'urgent';

export interface TeamMember {
    id: string;
    name: string;
    email: string;
    avatar?: string;
    role: TeamRole;
    department?: string;
    isActive: boolean;
    lastActiveAt: Date;
    permissions: {
        canCreate: boolean;
        canReview: boolean;
        canApprove: boolean;
        canPublish: boolean;
        canDelete: boolean;
        canManageTeam: boolean;
    };
}

export interface Comment {
    id: string;
    authorId: string;
    authorName: string;
    authorAvatar?: string;
    content: string;
    createdAt: Date;
    updatedAt?: Date;
    isResolved: boolean;
    replies: Comment[];
    mentions: string[]; // User IDs mentioned
}

export interface ApprovalItem {
    id: string;
    type: 'content' | 'email_campaign' | 'sms_campaign' | 'journey' | 'social_post';
    title: string;
    description?: string;
    content: string;
    metadata: Record<string, unknown>;

    // Source
    source: ContentSource;
    aiConfidence?: number;

    // Status
    status: ApprovalStatus;
    priority: Priority;

    // Ownership
    createdBy: string;
    createdByName: string;
    assignedTo?: string;
    assignedToName?: string;

    // Workflow
    reviewers: string[];
    approvers: string[];
    currentStage: number;
    stages: ApprovalStage[];

    // Timeline
    createdAt: Date;
    updatedAt: Date;
    deadline?: Date;
    publishScheduledAt?: Date;
    publishedAt?: Date;

    // Feedback
    comments: Comment[];
    changeRequests: ChangeRequest[];

    // Analytics
    views: number;
    edits: number;
}

export interface ApprovalStage {
    id: string;
    name: string;
    type: 'review' | 'approval' | 'final';
    assignedTo: string[];
    requiredApprovals: number;
    currentApprovals: number;
    status: 'pending' | 'active' | 'completed' | 'skipped';
    completedAt?: Date;
    completedBy?: string;
}

export interface ChangeRequest {
    id: string;
    authorId: string;
    authorName: string;
    type: 'suggestion' | 'required_change' | 'question';
    field?: string;
    originalValue?: string;
    suggestedValue?: string;
    reason: string;
    status: 'pending' | 'accepted' | 'rejected';
    createdAt: Date;
    resolvedAt?: Date;
    resolvedBy?: string;
}

export interface Notification {
    id: string;
    userId: string;
    type: 'assignment' | 'approval_needed' | 'approved' | 'rejected' | 'comment' | 'mention' | 'deadline';
    title: string;
    message: string;
    itemId: string;
    itemType: string;
    isRead: boolean;
    createdAt: Date;
    actionUrl?: string;
}

export interface WorkflowTemplate {
    id: string;
    name: string;
    description: string;
    stages: {
        name: string;
        type: 'review' | 'approval' | 'final';
        roles: TeamRole[];
        requiredApprovals: number;
    }[];
    isDefault: boolean;
    isActive: boolean;
}

// =============================================================================
// DEFAULT WORKFLOW TEMPLATES
// =============================================================================

export const DEFAULT_WORKFLOWS: WorkflowTemplate[] = [
    {
        id: 'simple',
        name: 'Simple Approval',
        description: 'Single approver workflow for quick turnaround',
        stages: [
            { name: 'Review & Approve', type: 'approval', roles: ['approver', 'admin'], requiredApprovals: 1 }
        ],
        isDefault: true,
        isActive: true,
    },
    {
        id: 'standard',
        name: 'Standard Review',
        description: 'Peer review followed by manager approval',
        stages: [
            { name: 'Peer Review', type: 'review', roles: ['reviewer', 'creator'], requiredApprovals: 1 },
            { name: 'Manager Approval', type: 'approval', roles: ['approver', 'admin'], requiredApprovals: 1 }
        ],
        isDefault: false,
        isActive: true,
    },
    {
        id: 'enterprise',
        name: 'Enterprise Workflow',
        description: 'Multi-stage review for regulated industries',
        stages: [
            { name: 'Content Review', type: 'review', roles: ['reviewer'], requiredApprovals: 2 },
            { name: 'Legal/Compliance', type: 'review', roles: ['reviewer', 'admin'], requiredApprovals: 1 },
            { name: 'Final Approval', type: 'final', roles: ['approver', 'admin'], requiredApprovals: 1 }
        ],
        isDefault: false,
        isActive: true,
    },
];

// =============================================================================
// COLLABORATION ENGINE
// =============================================================================

export class CollaborationEngine {
    private organizationId: string;
    private teamMembers: TeamMember[] = [];
    private approvalQueue: ApprovalItem[] = [];
    private notifications: Notification[] = [];
    private workflows: WorkflowTemplate[] = [...DEFAULT_WORKFLOWS];

    constructor(organizationId: string) {
        this.organizationId = organizationId;
        this.initializeMockData();
    }

    private initializeMockData() {
        // Mock team members
        this.teamMembers = [
            {
                id: 'user-1',
                name: 'Alex Creator',
                email: 'alex@company.com',
                role: 'creator',
                isActive: true,
                lastActiveAt: new Date(),
                permissions: { canCreate: true, canReview: false, canApprove: false, canPublish: false, canDelete: false, canManageTeam: false },
            },
            {
                id: 'user-2',
                name: 'Sam Reviewer',
                email: 'sam@company.com',
                role: 'reviewer',
                isActive: true,
                lastActiveAt: new Date(),
                permissions: { canCreate: true, canReview: true, canApprove: false, canPublish: false, canDelete: false, canManageTeam: false },
            },
            {
                id: 'user-3',
                name: 'Jordan Manager',
                email: 'jordan@company.com',
                role: 'approver',
                isActive: true,
                lastActiveAt: new Date(),
                permissions: { canCreate: true, canReview: true, canApprove: true, canPublish: true, canDelete: false, canManageTeam: false },
            },
            {
                id: 'user-admin',
                name: 'Admin User',
                email: 'admin@company.com',
                role: 'admin',
                isActive: true,
                lastActiveAt: new Date(),
                permissions: { canCreate: true, canReview: true, canApprove: true, canPublish: true, canDelete: true, canManageTeam: true },
            },
        ];
    }

    // ==========================================================================
    // TEAM MANAGEMENT
    // ==========================================================================

    getTeamMembers(): TeamMember[] {
        return this.teamMembers;
    }

    getTeamMember(userId: string): TeamMember | undefined {
        return this.teamMembers.find(m => m.id === userId);
    }

    addTeamMember(member: Omit<TeamMember, 'id' | 'isActive' | 'lastActiveAt'>): TeamMember {
        const newMember: TeamMember = {
            ...member,
            id: `user-${Date.now()}`,
            isActive: true,
            lastActiveAt: new Date(),
        };
        this.teamMembers.push(newMember);
        return newMember;
    }

    updateTeamMember(userId: string, updates: Partial<TeamMember>): TeamMember | null {
        const index = this.teamMembers.findIndex(m => m.id === userId);
        if (index === -1) return null;
        this.teamMembers[index] = { ...this.teamMembers[index], ...updates };
        return this.teamMembers[index];
    }

    // ==========================================================================
    // APPROVAL QUEUE
    // ==========================================================================

    getApprovalQueue(filters?: {
        status?: ApprovalStatus[];
        assignedTo?: string;
        type?: string;
        source?: ContentSource;
    }): ApprovalItem[] {
        let queue = this.approvalQueue;

        if (filters?.status) {
            queue = queue.filter(item => filters.status!.includes(item.status));
        }
        if (filters?.assignedTo) {
            queue = queue.filter(item => item.assignedTo === filters.assignedTo || item.reviewers.includes(filters.assignedTo!) || item.approvers.includes(filters.assignedTo!));
        }
        if (filters?.type) {
            queue = queue.filter(item => item.type === filters.type);
        }
        if (filters?.source) {
            queue = queue.filter(item => item.source === filters.source);
        }

        return queue.sort((a, b) => {
            // Sort by priority first, then by deadline
            const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
            const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
            if (priorityDiff !== 0) return priorityDiff;
            if (a.deadline && b.deadline) return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });
    }

    getApprovalItem(itemId: string): ApprovalItem | undefined {
        return this.approvalQueue.find(item => item.id === itemId);
    }

    /**
     * Submit content for approval (from Autopilot or manual)
     */
    submitForApproval(item: {
        type: ApprovalItem['type'];
        title: string;
        description?: string;
        content: string;
        metadata?: Record<string, unknown>;
        source: ContentSource;
        aiConfidence?: number;
        createdBy: string;
        priority?: Priority;
        deadline?: Date;
        workflowId?: string;
    }): ApprovalItem {
        const creator = this.getTeamMember(item.createdBy);
        const workflow = this.workflows.find(w => w.id === (item.workflowId || 'simple')) || this.workflows[0];

        const stages: ApprovalStage[] = workflow.stages.map((stage, index) => ({
            id: `stage-${Date.now()}-${index}`,
            name: stage.name,
            type: stage.type,
            assignedTo: this.getTeamMembersByRoles(stage.roles).map(m => m.id),
            requiredApprovals: stage.requiredApprovals,
            currentApprovals: 0,
            status: index === 0 ? 'active' : 'pending',
        }));

        const approvalItem: ApprovalItem = {
            id: `approval-${Date.now()}`,
            type: item.type,
            title: item.title,
            description: item.description,
            content: item.content,
            metadata: item.metadata || {},
            source: item.source,
            aiConfidence: item.aiConfidence,
            status: 'pending',
            priority: item.priority || 'medium',
            createdBy: item.createdBy,
            createdByName: creator?.name || 'AI Autopilot',
            assignedTo: stages[0]?.assignedTo[0],
            assignedToName: this.getTeamMember(stages[0]?.assignedTo[0])?.name,
            reviewers: stages.filter(s => s.type === 'review').flatMap(s => s.assignedTo),
            approvers: stages.filter(s => s.type === 'approval' || s.type === 'final').flatMap(s => s.assignedTo),
            currentStage: 0,
            stages,
            createdAt: new Date(),
            updatedAt: new Date(),
            deadline: item.deadline,
            comments: [],
            changeRequests: [],
            views: 0,
            edits: 0,
        };

        this.approvalQueue.push(approvalItem);

        // Notify assigned users
        this.notifyAssignees(approvalItem);

        return approvalItem;
    }

    private getTeamMembersByRoles(roles: TeamRole[]): TeamMember[] {
        return this.teamMembers.filter(m => roles.includes(m.role) && m.isActive);
    }

    private notifyAssignees(item: ApprovalItem) {
        const currentStage = item.stages[item.currentStage];
        if (!currentStage) return;

        for (const userId of currentStage.assignedTo) {
            this.addNotification({
                userId,
                type: 'assignment',
                title: 'New item needs your review',
                message: `"${item.title}" is waiting for your ${currentStage.type}`,
                itemId: item.id,
                itemType: item.type,
            });
        }
    }

    /**
     * Take action on an approval item
     */
    takeAction(
        itemId: string,
        userId: string,
        action: 'approve' | 'reject' | 'request_changes' | 'skip'
    ): { success: boolean; item?: ApprovalItem; message: string } {
        const item = this.getApprovalItem(itemId);
        if (!item) return { success: false, message: 'Item not found' };

        const user = this.getTeamMember(userId);
        if (!user) return { success: false, message: 'User not found' };

        const currentStage = item.stages[item.currentStage];
        if (!currentStage) return { success: false, message: 'No active stage' };

        if (!currentStage.assignedTo.includes(userId)) {
            return { success: false, message: 'You are not assigned to this stage' };
        }

        switch (action) {
            case 'approve':
                currentStage.currentApprovals++;
                if (currentStage.currentApprovals >= currentStage.requiredApprovals) {
                    currentStage.status = 'completed';
                    currentStage.completedAt = new Date();
                    currentStage.completedBy = userId;

                    // Move to next stage or complete
                    if (item.currentStage < item.stages.length - 1) {
                        item.currentStage++;
                        item.stages[item.currentStage].status = 'active';
                        item.status = 'in_review';
                        this.notifyAssignees(item);
                    } else {
                        item.status = 'approved';
                        this.notifyCreator(item, 'approved');
                    }
                }
                break;

            case 'reject':
                item.status = 'rejected';
                currentStage.status = 'completed';
                this.notifyCreator(item, 'rejected');
                break;

            case 'request_changes':
                item.status = 'changes_requested';
                this.notifyCreator(item, 'comment');
                break;

            case 'skip':
                currentStage.status = 'skipped';
                if (item.currentStage < item.stages.length - 1) {
                    item.currentStage++;
                    item.stages[item.currentStage].status = 'active';
                }
                break;
        }

        item.updatedAt = new Date();
        return { success: true, item, message: `Action ${action} completed` };
    }

    private notifyCreator(item: ApprovalItem, type: Notification['type']) {
        this.addNotification({
            userId: item.createdBy,
            type,
            title: type === 'approved' ? 'Content Approved!' : type === 'rejected' ? 'Content Rejected' : 'Changes Requested',
            message: `"${item.title}" has been ${type}`,
            itemId: item.id,
            itemType: item.type,
        });
    }

    /**
     * Add a comment to an item
     */
    addComment(itemId: string, userId: string, content: string): Comment | null {
        const item = this.getApprovalItem(itemId);
        if (!item) return null;

        const user = this.getTeamMember(userId);
        if (!user) return null;

        const comment: Comment = {
            id: `comment-${Date.now()}`,
            authorId: userId,
            authorName: user.name,
            authorAvatar: user.avatar,
            content,
            createdAt: new Date(),
            isResolved: false,
            replies: [],
            mentions: this.extractMentions(content),
        };

        item.comments.push(comment);
        item.updatedAt = new Date();

        // Notify mentioned users
        for (const mentionedId of comment.mentions) {
            this.addNotification({
                userId: mentionedId,
                type: 'mention',
                title: 'You were mentioned',
                message: `${user.name} mentioned you in "${item.title}"`,
                itemId: item.id,
                itemType: item.type,
            });
        }

        return comment;
    }

    private extractMentions(content: string): string[] {
        const mentionRegex = /@(\w+)/g;
        const mentions: string[] = [];
        let match;
        while ((match = mentionRegex.exec(content)) !== null) {
            const member = this.teamMembers.find(m => m.name.toLowerCase().includes(match[1].toLowerCase()));
            if (member) mentions.push(member.id);
        }
        return mentions;
    }

    // ==========================================================================
    // NOTIFICATIONS
    // ==========================================================================

    addNotification(notification: Omit<Notification, 'id' | 'isRead' | 'createdAt'>): Notification {
        const newNotification: Notification = {
            ...notification,
            id: `notif-${Date.now()}`,
            isRead: false,
            createdAt: new Date(),
            actionUrl: `/approvals/${notification.itemId}`,
        };
        this.notifications.push(newNotification);
        return newNotification;
    }

    getNotifications(userId: string, unreadOnly = false): Notification[] {
        return this.notifications
            .filter(n => n.userId === userId && (!unreadOnly || !n.isRead))
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    markNotificationRead(notificationId: string): boolean {
        const notification = this.notifications.find(n => n.id === notificationId);
        if (notification) {
            notification.isRead = true;
            return true;
        }
        return false;
    }

    // ==========================================================================
    // WORKFLOW MANAGEMENT
    // ==========================================================================

    getWorkflows(): WorkflowTemplate[] {
        return this.workflows;
    }

    getDefaultWorkflow(): WorkflowTemplate {
        return this.workflows.find(w => w.isDefault) || this.workflows[0];
    }

    // ==========================================================================
    // ANALYTICS
    // ==========================================================================

    getCollaborationStats(): {
        totalPending: number;
        totalApproved: number;
        totalRejected: number;
        avgApprovalTime: number;
        teamActivity: { userId: string; name: string; approvals: number; rejections: number; comments: number }[];
    } {
        const pending = this.approvalQueue.filter(i => ['pending', 'in_review', 'changes_requested'].includes(i.status)).length;
        const approved = this.approvalQueue.filter(i => i.status === 'approved' || i.status === 'published').length;
        const rejected = this.approvalQueue.filter(i => i.status === 'rejected').length;

        return {
            totalPending: pending,
            totalApproved: approved,
            totalRejected: rejected,
            avgApprovalTime: 4.2, // hours (mock)
            teamActivity: this.teamMembers.map(m => ({
                userId: m.id,
                name: m.name,
                approvals: Math.floor(Math.random() * 20),
                rejections: Math.floor(Math.random() * 5),
                comments: Math.floor(Math.random() * 30),
            })),
        };
    }
}

// =============================================================================
// SINGLETON MANAGEMENT
// =============================================================================

const engines = new Map<string, CollaborationEngine>();

export function getCollaborationEngine(organizationId: string): CollaborationEngine {
    let engine = engines.get(organizationId);
    if (!engine) {
        engine = new CollaborationEngine(organizationId);
        engines.set(organizationId, engine);
    }
    return engine;
}
