// =============================================================================
// JOURNEY EXECUTION ENGINE - Process contacts through journeys
// =============================================================================

import { prisma } from '@/lib/db/prisma';
import { sendEmail } from '@/lib/email';
import type {
    Journey,
    JourneyNode,
    JourneyEdge,
    NodeType,
    ActionNodeData,
    ConditionNodeData,
    DelayNodeData,
    SplitNodeData,
    ContactJourneyState,
    JourneyHistoryEntry
} from './types';

/**
 * Journey Execution Engine
 * Handles processing contacts through automation journeys
 */
export class JourneyEngine {
    private journey: Journey;
    private nodesMap: Map<string, JourneyNode>;
    private edgesMap: Map<string, JourneyEdge[]>;

    constructor(journey: Journey) {
        this.journey = journey;
        this.nodesMap = new Map(journey.nodes.map(n => [n.id, n]));
        this.edgesMap = new Map();

        // Group edges by source node
        for (const edge of journey.edges) {
            const existing = this.edgesMap.get(edge.source) || [];
            existing.push(edge);
            this.edgesMap.set(edge.source, existing);
        }
    }

    /**
     * Enter a contact into the journey
     */
    async enterContact(contactId: string): Promise<{ success: boolean; stateId?: string; error?: string }> {
        try {
            // Check if journey is active
            if (this.journey.status !== 'active') {
                return { success: false, error: 'Journey is not active' };
            }

            // Check re-entry rules
            if (!this.journey.settings.reentryAllowed) {
                const existing = await this.getContactState(contactId);
                if (existing) {
                    return { success: false, error: 'Contact already in journey and re-entry not allowed' };
                }
            }

            // Find trigger node
            const triggerNode = this.journey.nodes.find(n => n.type === 'trigger');
            if (!triggerNode) {
                return { success: false, error: 'No trigger node found' };
            }

            // Create contact journey state
            const state: ContactJourneyState = {
                id: `cjs_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                journeyId: this.journey.id,
                contactId,
                currentNodeId: triggerNode.id,
                status: 'active',
                enteredAt: new Date(),
                history: [{
                    nodeId: triggerNode.id,
                    nodeType: 'trigger',
                    action: 'entered_journey',
                    timestamp: new Date(),
                    result: 'success'
                }]
            };

            // Save state (in production, this would be stored in database)
            await this.saveContactState(state);

            // Process the trigger node and move to next
            await this.processNextNodes(state, triggerNode.id);

            return { success: true, stateId: state.id };
        } catch (error) {
            console.error('Error entering contact into journey:', error);
            return { success: false, error: (error as Error).message };
        }
    }

    /**
     * Process the next nodes after current node
     */
    async processNextNodes(state: ContactJourneyState, currentNodeId: string): Promise<void> {
        const edges = this.edgesMap.get(currentNodeId) || [];

        if (edges.length === 0) {
            // No more nodes, journey complete
            state.status = 'completed';
            state.completedAt = new Date();
            await this.saveContactState(state);
            return;
        }

        // For now, process first edge (simple linear flow)
        // In full implementation, handle splits and conditions
        const nextEdge = edges[0];
        const nextNode = this.nodesMap.get(nextEdge.target);

        if (!nextNode) {
            return;
        }

        await this.processNode(state, nextNode);
    }

    /**
     * Process a single journey node
     */
    async processNode(state: ContactJourneyState, node: JourneyNode): Promise<void> {
        state.currentNodeId = node.id;

        const historyEntry: JourneyHistoryEntry = {
            nodeId: node.id,
            nodeType: node.type,
            action: `processing_${node.type}`,
            timestamp: new Date()
        };

        try {
            switch (node.type) {
                case 'action':
                    await this.executeAction(state, node.data as ActionNodeData);
                    historyEntry.result = 'success';
                    break;

                case 'condition':
                    const result = await this.evaluateCondition(state, node.data as ConditionNodeData);
                    historyEntry.result = 'success';
                    historyEntry.metadata = { conditionResult: result };
                    // Route based on condition result
                    await this.routeCondition(state, node.id, result);
                    return; // Don't process next nodes here, routing handles it

                case 'delay':
                    await this.scheduleDelay(state, node.data as DelayNodeData);
                    historyEntry.result = 'success';
                    state.status = 'waiting';
                    await this.saveContactState(state);
                    return; // Stop processing, will resume after delay

                case 'split':
                    await this.processSplit(state, node);
                    historyEntry.result = 'success';
                    return; // Split handles its own routing

                case 'end':
                    state.status = 'completed';
                    state.completedAt = new Date();
                    historyEntry.result = 'success';
                    break;

                default:
                    historyEntry.result = 'skipped';
            }
        } catch (error) {
            historyEntry.result = 'failed';
            historyEntry.metadata = { error: (error as Error).message };
        }

        state.history.push(historyEntry);
        await this.saveContactState(state);

        // Continue to next nodes if not waiting or completed
        if (state.status === 'active') {
            await this.processNextNodes(state, node.id);
        }
    }

    /**
     * Execute an action node
     */
    async executeAction(state: ContactJourneyState, actionData: ActionNodeData): Promise<void> {
        const contact = await prisma.contact.findUnique({
            where: { id: state.contactId }
        });

        if (!contact) {
            throw new Error('Contact not found');
        }

        switch (actionData.actionType) {
            case 'send_email':
                const emailConfig = actionData.config as { emailId?: string; subject?: string; content?: string };
                if (emailConfig.subject && emailConfig.content) {
                    await sendEmail({
                        to: contact.email,
                        subject: emailConfig.subject,
                        html: emailConfig.content as string
                    });
                }
                break;

            case 'add_tag':
                const tagToAdd = (actionData.config as { tag: string }).tag;
                const currentTags = (contact.tags as string[]) || [];
                if (!currentTags.includes(tagToAdd)) {
                    await prisma.contact.update({
                        where: { id: contact.id },
                        data: { tags: [...currentTags, tagToAdd] }
                    });
                }
                break;

            case 'remove_tag':
                const tagToRemove = (actionData.config as { tag: string }).tag;
                const existingTags = (contact.tags as string[]) || [];
                await prisma.contact.update({
                    where: { id: contact.id },
                    data: { tags: existingTags.filter(t => t !== tagToRemove) }
                });
                break;

            case 'update_field':
                const { field, value } = actionData.config as { field: string; value: string };
                await prisma.contact.update({
                    where: { id: contact.id },
                    data: { [field]: value }
                });
                break;

            case 'change_score':
                const { change } = actionData.config as { change: number };
                await prisma.contact.update({
                    where: { id: contact.id },
                    data: { leadScore: contact.leadScore + change }
                });
                break;

            case 'notify_team':
                const { message, channel } = actionData.config as { message: string; channel?: string };
                // In production, send notification via Slack, email, etc.
                console.log(`[NOTIFY] ${channel || 'default'}: ${message} for contact ${contact.email}`);
                break;

            case 'webhook':
                const { url, method } = actionData.config as { url: string; method?: string };
                await fetch(url, {
                    method: method || 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ contact, journey: this.journey.id, timestamp: new Date() })
                });
                break;

            default:
                console.log(`Action type ${actionData.actionType} not implemented`);
        }

        // Log activity
        await prisma.contactActivity.create({
            data: {
                contactId: contact.id,
                type: `journey_${actionData.actionType}`,
                description: `Journey action: ${actionData.name}`,
                metadata: { journeyId: this.journey.id, nodeId: state.currentNodeId }
            }
        });
    }

    /**
     * Evaluate a condition node
     */
    async evaluateCondition(state: ContactJourneyState, conditionData: ConditionNodeData): Promise<boolean> {
        const contact = await prisma.contact.findUnique({
            where: { id: state.contactId }
        });

        if (!contact) {
            return false;
        }

        const fieldValue = (contact as Record<string, unknown>)[conditionData.field];
        const targetValue = conditionData.value;

        switch (conditionData.operator) {
            case 'equals':
                return fieldValue === targetValue;
            case 'not_equals':
                return fieldValue !== targetValue;
            case 'contains':
                return String(fieldValue || '').toLowerCase().includes(String(targetValue).toLowerCase());
            case 'not_contains':
                return !String(fieldValue || '').toLowerCase().includes(String(targetValue).toLowerCase());
            case 'greater_than':
                return Number(fieldValue) > Number(targetValue);
            case 'less_than':
                return Number(fieldValue) < Number(targetValue);
            case 'is_empty':
                return fieldValue === null || fieldValue === undefined || fieldValue === '';
            case 'is_not_empty':
                return fieldValue !== null && fieldValue !== undefined && fieldValue !== '';
            default:
                return false;
        }
    }

    /**
     * Route based on condition result
     */
    async routeCondition(state: ContactJourneyState, nodeId: string, result: boolean): Promise<void> {
        const edges = this.edgesMap.get(nodeId) || [];
        const targetEdge = edges.find(e =>
            (result && e.sourceHandle === 'yes') ||
            (!result && e.sourceHandle === 'no')
        ) || edges[0]; // Default to first edge if no match

        if (targetEdge) {
            const nextNode = this.nodesMap.get(targetEdge.target);
            if (nextNode) {
                await this.processNode(state, nextNode);
            }
        }
    }

    /**
     * Schedule a delay
     */
    async scheduleDelay(state: ContactJourneyState, delayData: DelayNodeData): Promise<void> {
        let delayMs = 0;

        if (delayData.delayType === 'fixed' && delayData.duration && delayData.unit) {
            const multipliers: Record<string, number> = {
                minutes: 60 * 1000,
                hours: 60 * 60 * 1000,
                days: 24 * 60 * 60 * 1000,
                weeks: 7 * 24 * 60 * 60 * 1000
            };
            delayMs = delayData.duration * (multipliers[delayData.unit] || 60000);
        } else if (delayData.delayType === 'until' && delayData.untilDate) {
            delayMs = new Date(delayData.untilDate).getTime() - Date.now();
        }

        // In production, this would be stored in a job queue (e.g., BullMQ, SQS)
        // For now, we'll just log it
        console.log(`[DELAY] Contact ${state.contactId} scheduled to continue in ${delayMs}ms`);

        // Store delay info in state metadata
        state.history.push({
            nodeId: state.currentNodeId,
            nodeType: 'delay',
            action: 'delay_scheduled',
            timestamp: new Date(),
            result: 'success',
            metadata: { resumeAt: new Date(Date.now() + delayMs).toISOString() }
        });
    }

    /**
     * Process a split node
     */
    async processSplit(state: ContactJourneyState, node: JourneyNode): Promise<void> {
        const splitData = node.data as SplitNodeData;
        const edges = this.edgesMap.get(node.id) || [];

        if (edges.length === 0) return;

        let selectedEdge: JourneyEdge;

        if (splitData.splitType === 'random' && splitData.distribution) {
            // Random split based on distribution
            const random = Math.random() * 100;
            let cumulative = 0;
            let edgeIndex = 0;

            for (let i = 0; i < splitData.distribution.length; i++) {
                cumulative += splitData.distribution[i];
                if (random <= cumulative) {
                    edgeIndex = i;
                    break;
                }
            }

            selectedEdge = edges[edgeIndex] || edges[0];
        } else {
            // Conditional split - evaluate conditions
            selectedEdge = edges[0]; // Default

            if (splitData.conditions) {
                for (let i = 0; i < splitData.conditions.length; i++) {
                    const condition = splitData.conditions[i];
                    const result = await this.evaluateCondition(state, {
                        nodeType: 'condition',
                        name: 'split_condition',
                        field: condition.field,
                        operator: condition.operator,
                        value: condition.value
                    });

                    if (result && edges[i]) {
                        selectedEdge = edges[i];
                        break;
                    }
                }
            }
        }

        const nextNode = this.nodesMap.get(selectedEdge.target);
        if (nextNode) {
            await this.processNode(state, nextNode);
        }
    }

    /**
     * Get contact's current state in this journey
     */
    async getContactState(contactId: string): Promise<ContactJourneyState | null> {
        // In production, fetch from database
        // For now, return null (no existing state)
        return null;
    }

    /**
     * Save contact journey state
     */
    async saveContactState(state: ContactJourneyState): Promise<void> {
        // In production, save to database
        // For now, just log
        console.log(`[STATE] Journey ${state.journeyId} - Contact ${state.contactId} - Status: ${state.status} - Node: ${state.currentNodeId}`);
    }

    /**
     * Resume a contact after delay
     */
    async resumeContact(stateId: string): Promise<void> {
        // Fetch state, update status to active, continue processing
        // In production implementation
    }
}

/**
 * Process journey triggers (called by event handlers)
 */
export async function processTrigger(
    organizationId: string,
    triggerType: string,
    contactId: string,
    metadata?: Record<string, unknown>
): Promise<void> {
    // Find all active journeys with matching trigger
    // In production, fetch from database
    console.log(`[TRIGGER] ${triggerType} for contact ${contactId} in org ${organizationId}`);

    // For each matching journey, enter the contact
    // const journeys = await prisma.journey.findMany({ where: { organizationId, status: 'active' } });
    // for (const journey of journeys) {
    //   const engine = new JourneyEngine(journey);
    //   await engine.enterContact(contactId);
    // }
}
