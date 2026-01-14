// =============================================================================
// LEAD SCORING ENGINE - AI-Powered Lead Qualification
// =============================================================================

import { prisma } from '@/lib/db/prisma';

// Scoring Rule Types
export interface ScoringRule {
    id: string;
    name: string;
    category: 'engagement' | 'demographic' | 'behavioral' | 'firmographic';
    condition: ScoringCondition;
    points: number;
    enabled: boolean;
}

export interface ScoringCondition {
    type: string;
    field?: string;
    operator: 'equals' | 'contains' | 'greater_than' | 'less_than' | 'exists' | 'not_exists';
    value?: string | number | boolean;
}

export interface LeadScoreBreakdown {
    total: number;
    engagement: number;
    demographic: number;
    behavioral: number;
    firmographic: number;
    grade: 'A' | 'B' | 'C' | 'D' | 'F';
    details: Array<{ rule: string; points: number }>;
}

// Default scoring rules (can be customized per organization)
export const DEFAULT_SCORING_RULES: ScoringRule[] = [
    // Engagement Scoring
    {
        id: 'email_opened',
        name: 'Email Opened',
        category: 'engagement',
        condition: { type: 'email_opened', operator: 'exists' },
        points: 5,
        enabled: true
    },
    {
        id: 'email_clicked',
        name: 'Email Link Clicked',
        category: 'engagement',
        condition: { type: 'email_clicked', operator: 'exists' },
        points: 10,
        enabled: true
    },
    {
        id: 'multiple_emails_opened',
        name: 'Opened 3+ Emails',
        category: 'engagement',
        condition: { type: 'email_open_count', operator: 'greater_than', value: 3 },
        points: 15,
        enabled: true
    },
    {
        id: 'form_submitted',
        name: 'Form Submitted',
        category: 'engagement',
        condition: { type: 'form_submitted', operator: 'exists' },
        points: 20,
        enabled: true
    },

    // Behavioral Scoring
    {
        id: 'pricing_page',
        name: 'Visited Pricing Page',
        category: 'behavioral',
        condition: { type: 'page_visited', field: 'url', operator: 'contains', value: '/pricing' },
        points: 25,
        enabled: true
    },
    {
        id: 'demo_page',
        name: 'Visited Demo Page',
        category: 'behavioral',
        condition: { type: 'page_visited', field: 'url', operator: 'contains', value: '/demo' },
        points: 30,
        enabled: true
    },
    {
        id: 'contact_page',
        name: 'Visited Contact Page',
        category: 'behavioral',
        condition: { type: 'page_visited', field: 'url', operator: 'contains', value: '/contact' },
        points: 15,
        enabled: true
    },
    {
        id: 'multiple_visits',
        name: 'Multiple Website Visits',
        category: 'behavioral',
        condition: { type: 'visit_count', operator: 'greater_than', value: 5 },
        points: 20,
        enabled: true
    },

    // Demographic Scoring
    {
        id: 'has_company',
        name: 'Company Provided',
        category: 'demographic',
        condition: { type: 'field', field: 'company', operator: 'exists' },
        points: 10,
        enabled: true
    },
    {
        id: 'has_phone',
        name: 'Phone Number Provided',
        category: 'demographic',
        condition: { type: 'field', field: 'phone', operator: 'exists' },
        points: 10,
        enabled: true
    },
    {
        id: 'has_job_title',
        name: 'Job Title Provided',
        category: 'demographic',
        condition: { type: 'field', field: 'jobTitle', operator: 'exists' },
        points: 10,
        enabled: true
    },
    {
        id: 'decision_maker',
        name: 'Decision Maker Title',
        category: 'demographic',
        condition: { type: 'field', field: 'jobTitle', operator: 'contains', value: 'CEO|CTO|VP|Director|Manager|Head' },
        points: 25,
        enabled: true
    },

    // Firmographic Scoring
    {
        id: 'enterprise_domain',
        name: 'Enterprise Email Domain',
        category: 'firmographic',
        condition: { type: 'email_domain', operator: 'not_exists', value: 'gmail.com|yahoo.com|hotmail.com|outlook.com' },
        points: 15,
        enabled: true
    },

    // Recency Scoring (applied dynamically)
    {
        id: 'recent_activity_7days',
        name: 'Active in Last 7 Days',
        category: 'engagement',
        condition: { type: 'last_activity', operator: 'less_than', value: 7 },
        points: 15,
        enabled: true
    },
    {
        id: 'recent_activity_30days',
        name: 'Active in Last 30 Days',
        category: 'engagement',
        condition: { type: 'last_activity', operator: 'less_than', value: 30 },
        points: 5,
        enabled: true
    },
];

/**
 * Calculate lead score for a contact
 */
export async function calculateLeadScore(contactId: string): Promise<LeadScoreBreakdown> {
    const contact = await prisma.contact.findUnique({
        where: { id: contactId },
        include: {
            activities: {
                orderBy: { createdAt: 'desc' },
                take: 100
            },
            emailRecipients: true,
            formSubmissions: true
        }
    });

    if (!contact) {
        return {
            total: 0,
            engagement: 0,
            demographic: 0,
            behavioral: 0,
            firmographic: 0,
            grade: 'F',
            details: []
        };
    }

    const breakdown: LeadScoreBreakdown = {
        total: 0,
        engagement: 0,
        demographic: 0,
        behavioral: 0,
        firmographic: 0,
        grade: 'F',
        details: []
    };

    // Process each scoring rule
    for (const rule of DEFAULT_SCORING_RULES) {
        if (!rule.enabled) continue;

        const matched = evaluateRule(rule, contact);
        if (matched) {
            breakdown[rule.category] += rule.points;
            breakdown.total += rule.points;
            breakdown.details.push({ rule: rule.name, points: rule.points });
        }
    }

    // Calculate grade
    breakdown.grade = calculateGrade(breakdown.total);

    return breakdown;
}

/**
 * Evaluate a single scoring rule against a contact
 */
function evaluateRule(rule: ScoringRule, contact: any): boolean {
    const { condition } = rule;

    switch (condition.type) {
        case 'email_opened':
            return contact.emailRecipients.some((r: any) => r.openedAt !== null);

        case 'email_clicked':
            return contact.emailRecipients.some((r: any) => r.clickedAt !== null);

        case 'email_open_count':
            const openCount = contact.emailRecipients.filter((r: any) => r.openedAt !== null).length;
            return evaluateOperator(openCount, condition.operator, condition.value as number);

        case 'form_submitted':
            return contact.formSubmissions.length > 0;

        case 'page_visited':
            return contact.activities.some((a: any) => {
                if (a.type !== 'page_visited') return false;
                const url = (a.metadata as any)?.url || '';
                return evaluateStringCondition(url, condition.operator, condition.value as string);
            });

        case 'visit_count':
            const visitCount = contact.activities.filter((a: any) => a.type === 'page_visited').length;
            return evaluateOperator(visitCount, condition.operator, condition.value as number);

        case 'field':
            const fieldValue = contact[condition.field || ''];
            if (condition.operator === 'exists') {
                return fieldValue !== null && fieldValue !== undefined && fieldValue !== '';
            }
            if (condition.operator === 'not_exists') {
                return !fieldValue;
            }
            return evaluateStringCondition(fieldValue || '', condition.operator, condition.value as string);

        case 'email_domain':
            const domain = contact.email.split('@')[1]?.toLowerCase() || '';
            const excludedDomains = (condition.value as string).split('|');
            if (condition.operator === 'not_exists') {
                return !excludedDomains.includes(domain);
            }
            return excludedDomains.includes(domain);

        case 'last_activity':
            if (!contact.lastActivityAt) return false;
            const daysSince = Math.floor(
                (Date.now() - new Date(contact.lastActivityAt).getTime()) / (1000 * 60 * 60 * 24)
            );
            return evaluateOperator(daysSince, condition.operator, condition.value as number);

        default:
            return false;
    }
}

/**
 * Evaluate numeric operator
 */
function evaluateOperator(value: number, operator: string, target: number): boolean {
    switch (operator) {
        case 'equals': return value === target;
        case 'greater_than': return value > target;
        case 'less_than': return value < target;
        default: return false;
    }
}

/**
 * Evaluate string condition
 */
function evaluateStringCondition(value: string, operator: string, target: string): boolean {
    const lowerValue = value.toLowerCase();
    const lowerTarget = target.toLowerCase();

    switch (operator) {
        case 'equals':
            return lowerValue === lowerTarget;
        case 'contains':
            // Support regex patterns with |
            if (target.includes('|')) {
                const patterns = target.split('|').map(p => p.toLowerCase());
                return patterns.some(p => lowerValue.includes(p));
            }
            return lowerValue.includes(lowerTarget);
        default:
            return false;
    }
}

/**
 * Calculate letter grade based on score
 */
function calculateGrade(score: number): 'A' | 'B' | 'C' | 'D' | 'F' {
    if (score >= 80) return 'A';
    if (score >= 60) return 'B';
    if (score >= 40) return 'C';
    if (score >= 20) return 'D';
    return 'F';
}

/**
 * Batch recalculate lead scores for all contacts in an organization
 */
export async function recalculateOrgLeadScores(organizationId: string): Promise<{ updated: number }> {
    const contacts = await prisma.contact.findMany({
        where: { organizationId },
        select: { id: true }
    });

    let updated = 0;

    for (const contact of contacts) {
        const breakdown = await calculateLeadScore(contact.id);
        await prisma.contact.update({
            where: { id: contact.id },
            data: { leadScore: breakdown.total }
        });
        updated++;
    }

    return { updated };
}

/**
 * Get hot leads (high-scoring contacts)
 */
export async function getHotLeads(
    organizationId: string,
    minScore: number = 50,
    limit: number = 20
): Promise<any[]> {
    return prisma.contact.findMany({
        where: {
            organizationId,
            leadScore: { gte: minScore },
            status: { in: ['lead', 'mql'] }
        },
        orderBy: { leadScore: 'desc' },
        take: limit,
        include: {
            activities: {
                orderBy: { createdAt: 'desc' },
                take: 5
            }
        }
    });
}

/**
 * Get lead score distribution for analytics
 */
export async function getScoreDistribution(organizationId: string): Promise<{
    gradeA: number;
    gradeB: number;
    gradeC: number;
    gradeD: number;
    gradeF: number;
    averageScore: number;
}> {
    const contacts = await prisma.contact.findMany({
        where: { organizationId },
        select: { leadScore: true }
    });

    const distribution = {
        gradeA: 0,
        gradeB: 0,
        gradeC: 0,
        gradeD: 0,
        gradeF: 0,
        averageScore: 0
    };

    if (contacts.length === 0) return distribution;

    let totalScore = 0;

    for (const contact of contacts) {
        totalScore += contact.leadScore;
        const grade = calculateGrade(contact.leadScore);
        distribution[`grade${grade}`]++;
    }

    distribution.averageScore = Math.round(totalScore / contacts.length);

    return distribution;
}
