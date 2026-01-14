// =============================================================================
// JOURNEY BUILDER - Visual Automation Workflow Engine
// =============================================================================

import { prisma } from '@/lib/db/prisma';

// Journey Types
export type JourneyStatus = 'draft' | 'active' | 'paused' | 'completed' | 'archived';
export type NodeType = 'trigger' | 'action' | 'condition' | 'delay' | 'split' | 'end';
export type TriggerType = 'contact_created' | 'form_submitted' | 'email_opened' | 'email_clicked' | 'tag_added' | 'score_changed' | 'date_based' | 'manual';
export type ActionType = 'send_email' | 'add_tag' | 'remove_tag' | 'update_field' | 'change_score' | 'move_to_list' | 'send_sms' | 'webhook' | 'notify_team';
export type ConditionOperator = 'equals' | 'not_equals' | 'contains' | 'not_contains' | 'greater_than' | 'less_than' | 'is_empty' | 'is_not_empty';

// Journey Node Definitions
export interface JourneyNode {
    id: string;
    type: NodeType;
    position: { x: number; y: number };
    data: TriggerNodeData | ActionNodeData | ConditionNodeData | DelayNodeData | SplitNodeData | EndNodeData;
}

export interface TriggerNodeData {
    nodeType: 'trigger';
    triggerType: TriggerType;
    name: string;
    config: Record<string, unknown>;
}

export interface ActionNodeData {
    nodeType: 'action';
    actionType: ActionType;
    name: string;
    config: Record<string, unknown>;
}

export interface ConditionNodeData {
    nodeType: 'condition';
    name: string;
    field: string;
    operator: ConditionOperator;
    value: string | number | boolean;
}

export interface DelayNodeData {
    nodeType: 'delay';
    name: string;
    delayType: 'fixed' | 'until' | 'optimal';
    duration?: number; // in minutes
    unit?: 'minutes' | 'hours' | 'days' | 'weeks';
    untilDate?: string;
}

export interface SplitNodeData {
    nodeType: 'split';
    name: string;
    splitType: 'random' | 'conditional';
    distribution?: number[]; // percentages for random split
    conditions?: Array<{
        id: string;
        field: string;
        operator: ConditionOperator;
        value: string | number | boolean;
    }>;
}

export interface EndNodeData {
    nodeType: 'end';
    name: string;
    exitType: 'complete' | 'goal_reached' | 'unsubscribed' | 'error';
}

export interface JourneyEdge {
    id: string;
    source: string;
    target: string;
    sourceHandle?: string; // For condition/split nodes: 'yes', 'no', 'default', etc.
    label?: string;
}

export interface Journey {
    id: string;
    organizationId: string;
    name: string;
    description?: string;
    status: JourneyStatus;
    nodes: JourneyNode[];
    edges: JourneyEdge[];
    settings: JourneySettings;
    stats: JourneyStats;
    createdAt: Date;
    updatedAt: Date;
}

export interface JourneySettings {
    entryLimit?: number; // Max contacts that can enter
    reentryAllowed: boolean;
    reentryDelay?: number; // Days before re-entry allowed
    exitOnGoal: boolean;
    goalCondition?: {
        field: string;
        operator: ConditionOperator;
        value: string | number | boolean;
    };
    timezone: string;
    sendingWindow?: {
        enabled: boolean;
        startHour: number;
        endHour: number;
        daysOfWeek: number[];
    };
}

export interface JourneyStats {
    totalEntered: number;
    currentlyActive: number;
    completed: number;
    exitedEarly: number;
    conversionRate: number;
}

// Contact Journey State
export interface ContactJourneyState {
    id: string;
    journeyId: string;
    contactId: string;
    currentNodeId: string;
    status: 'active' | 'waiting' | 'completed' | 'exited';
    enteredAt: Date;
    completedAt?: Date;
    history: JourneyHistoryEntry[];
}

export interface JourneyHistoryEntry {
    nodeId: string;
    nodeType: NodeType;
    action: string;
    timestamp: Date;
    result?: 'success' | 'failed' | 'skipped';
    metadata?: Record<string, unknown>;
}

// Default templates
export const JOURNEY_TEMPLATES = {
    welcome_series: {
        name: 'Welcome Series',
        description: 'Onboard new contacts with a series of welcome emails',
        nodes: [
            {
                id: 'trigger-1',
                type: 'trigger' as NodeType,
                position: { x: 250, y: 50 },
                data: { nodeType: 'trigger', triggerType: 'contact_created', name: 'New Contact', config: {} }
            },
            {
                id: 'action-1',
                type: 'action' as NodeType,
                position: { x: 250, y: 150 },
                data: { nodeType: 'action', actionType: 'send_email', name: 'Welcome Email', config: { emailId: '', subject: 'Welcome!' } }
            },
            {
                id: 'delay-1',
                type: 'delay' as NodeType,
                position: { x: 250, y: 250 },
                data: { nodeType: 'delay', name: 'Wait 2 Days', delayType: 'fixed', duration: 2, unit: 'days' }
            },
            {
                id: 'action-2',
                type: 'action' as NodeType,
                position: { x: 250, y: 350 },
                data: { nodeType: 'action', actionType: 'send_email', name: 'Getting Started', config: { emailId: '', subject: 'Getting Started Guide' } }
            },
            {
                id: 'end-1',
                type: 'end' as NodeType,
                position: { x: 250, y: 450 },
                data: { nodeType: 'end', name: 'Journey Complete', exitType: 'complete' }
            }
        ],
        edges: [
            { id: 'e1-2', source: 'trigger-1', target: 'action-1' },
            { id: 'e2-3', source: 'action-1', target: 'delay-1' },
            { id: 'e3-4', source: 'delay-1', target: 'action-2' },
            { id: 'e4-5', source: 'action-2', target: 'end-1' }
        ]
    },

    lead_nurturing: {
        name: 'Lead Nurturing',
        description: 'Nurture leads based on their engagement level',
        nodes: [
            {
                id: 'trigger-1',
                type: 'trigger' as NodeType,
                position: { x: 250, y: 50 },
                data: { nodeType: 'trigger', triggerType: 'score_changed', name: 'Score > 30', config: { minScore: 30 } }
            },
            {
                id: 'condition-1',
                type: 'condition' as NodeType,
                position: { x: 250, y: 150 },
                data: { nodeType: 'condition', name: 'Has Company?', field: 'company', operator: 'is_not_empty', value: '' }
            },
            {
                id: 'action-1',
                type: 'action' as NodeType,
                position: { x: 100, y: 280 },
                data: { nodeType: 'action', actionType: 'send_email', name: 'B2B Content', config: {} }
            },
            {
                id: 'action-2',
                type: 'action' as NodeType,
                position: { x: 400, y: 280 },
                data: { nodeType: 'action', actionType: 'send_email', name: 'B2C Content', config: {} }
            },
            {
                id: 'end-1',
                type: 'end' as NodeType,
                position: { x: 250, y: 400 },
                data: { nodeType: 'end', name: 'Journey Complete', exitType: 'complete' }
            }
        ],
        edges: [
            { id: 'e1-2', source: 'trigger-1', target: 'condition-1' },
            { id: 'e2-3', source: 'condition-1', target: 'action-1', sourceHandle: 'yes', label: 'Yes' },
            { id: 'e2-4', source: 'condition-1', target: 'action-2', sourceHandle: 'no', label: 'No' },
            { id: 'e3-5', source: 'action-1', target: 'end-1' },
            { id: 'e4-5', source: 'action-2', target: 'end-1' }
        ]
    },

    reengagement: {
        name: 'Re-engagement Campaign',
        description: 'Win back inactive contacts',
        nodes: [
            {
                id: 'trigger-1',
                type: 'trigger' as NodeType,
                position: { x: 250, y: 50 },
                data: { nodeType: 'trigger', triggerType: 'date_based', name: '30 Days Inactive', config: { inactiveDays: 30 } }
            },
            {
                id: 'action-1',
                type: 'action' as NodeType,
                position: { x: 250, y: 150 },
                data: { nodeType: 'action', actionType: 'send_email', name: 'We Miss You', config: {} }
            },
            {
                id: 'delay-1',
                type: 'delay' as NodeType,
                position: { x: 250, y: 250 },
                data: { nodeType: 'delay', name: 'Wait 7 Days', delayType: 'fixed', duration: 7, unit: 'days' }
            },
            {
                id: 'condition-1',
                type: 'condition' as NodeType,
                position: { x: 250, y: 350 },
                data: { nodeType: 'condition', name: 'Opened Email?', field: 'email_opened', operator: 'equals', value: true }
            },
            {
                id: 'action-2',
                type: 'action' as NodeType,
                position: { x: 100, y: 480 },
                data: { nodeType: 'action', actionType: 'add_tag', name: 'Mark Re-engaged', config: { tag: 're-engaged' } }
            },
            {
                id: 'action-3',
                type: 'action' as NodeType,
                position: { x: 400, y: 480 },
                data: { nodeType: 'action', actionType: 'add_tag', name: 'Mark Churned', config: { tag: 'churned' } }
            },
            {
                id: 'end-1',
                type: 'end' as NodeType,
                position: { x: 250, y: 600 },
                data: { nodeType: 'end', name: 'Journey Complete', exitType: 'complete' }
            }
        ],
        edges: [
            { id: 'e1-2', source: 'trigger-1', target: 'action-1' },
            { id: 'e2-3', source: 'action-1', target: 'delay-1' },
            { id: 'e3-4', source: 'delay-1', target: 'condition-1' },
            { id: 'e4-5', source: 'condition-1', target: 'action-2', sourceHandle: 'yes', label: 'Yes' },
            { id: 'e4-6', source: 'condition-1', target: 'action-3', sourceHandle: 'no', label: 'No' },
            { id: 'e5-7', source: 'action-2', target: 'end-1' },
            { id: 'e6-7', source: 'action-3', target: 'end-1' }
        ]
    }
};
