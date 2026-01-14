# 🚀 DigitalMEng Feature Expansion Roadmap
## Closing the Gap with Salesforce Marketing Cloud

**Version**: 1.0  
**Created**: January 14, 2026  
**Target Completion**: Q3 2026

---

## 📋 Executive Summary

This roadmap outlines the implementation plan to add key Salesforce Marketing Cloud features to DigitalMEng while maintaining our unique differentiators (AI Video, Voice, WordPress publishing, 90-Day Autopilot).

### Priority Matrix

| Phase | Timeline | Features | Est. Effort |
|-------|----------|----------|-------------|
| **Phase 1** | Weeks 1-4 | Email Marketing, Landing Pages, Forms | 160 hours |
| **Phase 2** | Weeks 5-8 | CRM Integration, Lead Management | 120 hours |
| **Phase 3** | Weeks 9-12 | Journey Builder, Advanced Segmentation | 160 hours |
| **Phase 4** | Weeks 13-16 | SMS/WhatsApp, Predictive Analytics | 140 hours |

---

## 🎯 Phase 1: Email Marketing & Lead Capture (Weeks 1-4)

### 1.1 Email Campaign Builder

**Goal**: Enable users to create, send, and track email campaigns

#### Database Schema (Prisma)

```prisma
// Add to prisma/schema.prisma

model EmailCampaign {
  id              String   @id @default(cuid())
  organizationId  String
  name            String
  subject         String
  preheader       String?
  content         String   @db.Text
  htmlContent     String   @db.Text
  status          EmailCampaignStatus @default(DRAFT)
  scheduledAt     DateTime?
  sentAt          DateTime?
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  organization    Organization @relation(fields: [organizationId], references: [id])
  metrics         EmailMetric[]
  recipients      EmailRecipient[]
  abTests         EmailABTest[]
}

model EmailTemplate {
  id              String   @id @default(cuid())
  organizationId  String
  name            String
  category        String
  thumbnail       String?
  htmlContent     String   @db.Text
  jsonContent     String   @db.Text  // For drag-drop editor
  isGlobal        Boolean  @default(false)
  createdAt       DateTime @default(now())
  
  organization    Organization @relation(fields: [organizationId], references: [id])
}

model EmailRecipient {
  id              String   @id @default(cuid())
  campaignId      String
  contactId       String
  email           String
  status          EmailDeliveryStatus @default(PENDING)
  openedAt        DateTime?
  clickedAt       DateTime?
  bouncedAt       DateTime?
  unsubscribedAt  DateTime?
  
  campaign        EmailCampaign @relation(fields: [campaignId], references: [id])
  contact         Contact @relation(fields: [contactId], references: [id])
}

model EmailMetric {
  id              String   @id @default(cuid())
  campaignId      String
  sent            Int      @default(0)
  delivered       Int      @default(0)
  opened          Int      @default(0)
  clicked         Int      @default(0)
  bounced         Int      @default(0)
  unsubscribed    Int      @default(0)
  spamReports     Int      @default(0)
  updatedAt       DateTime @updatedAt
  
  campaign        EmailCampaign @relation(fields: [campaignId], references: [id])
}

enum EmailCampaignStatus {
  DRAFT
  SCHEDULED
  SENDING
  SENT
  PAUSED
  CANCELLED
}

enum EmailDeliveryStatus {
  PENDING
  SENT
  DELIVERED
  OPENED
  CLICKED
  BOUNCED
  UNSUBSCRIBED
  SPAM
}
```

#### API Routes

```typescript
// src/app/api/email/campaigns/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { getServerSession } from '@/lib/auth/session';

export async function GET(request: NextRequest) {
  const session = await getServerSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const campaigns = await prisma.emailCampaign.findMany({
    where: { organizationId: session.organizationId },
    include: { metrics: true },
    orderBy: { createdAt: 'desc' }
  });

  return NextResponse.json(campaigns);
}

export async function POST(request: NextRequest) {
  const session = await getServerSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json();
  
  const campaign = await prisma.emailCampaign.create({
    data: {
      organizationId: session.organizationId,
      name: body.name,
      subject: body.subject,
      preheader: body.preheader,
      content: body.content,
      htmlContent: body.htmlContent,
      status: 'DRAFT'
    }
  });

  return NextResponse.json(campaign);
}
```

#### Email Service Integration

```typescript
// src/lib/email/sendgrid.ts

import sgMail from '@sendgrid/mail';

sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

export interface EmailOptions {
  to: string | string[];
  from: string;
  subject: string;
  html: string;
  text?: string;
  trackingSettings?: {
    clickTracking: boolean;
    openTracking: boolean;
  };
}

export async function sendEmail(options: EmailOptions) {
  try {
    const msg = {
      to: options.to,
      from: options.from,
      subject: options.subject,
      html: options.html,
      text: options.text || stripHtml(options.html),
      trackingSettings: {
        clickTracking: { enable: options.trackingSettings?.clickTracking ?? true },
        openTracking: { enable: options.trackingSettings?.openTracking ?? true }
      }
    };

    const response = await sgMail.send(msg);
    return { success: true, messageId: response[0].headers['x-message-id'] };
  } catch (error) {
    console.error('Email send error:', error);
    throw error;
  }
}

export async function sendBulkEmails(messages: EmailOptions[]) {
  try {
    const response = await sgMail.send(messages);
    return { success: true, count: messages.length };
  } catch (error) {
    console.error('Bulk email error:', error);
    throw error;
  }
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '');
}
```

### 1.2 Landing Page Builder

**Goal**: Drag-and-drop landing page creation

#### Database Schema

```prisma
model LandingPage {
  id              String   @id @default(cuid())
  organizationId  String
  name            String
  slug            String
  status          PageStatus @default(DRAFT)
  jsonContent     String   @db.Text  // GrapesJS/Editor.js format
  htmlContent     String   @db.Text
  cssContent      String?  @db.Text
  metaTitle       String?
  metaDescription String?
  publishedAt     DateTime?
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  organization    Organization @relation(fields: [organizationId], references: [id])
  forms           Form[]
  pageViews       PageView[]
  
  @@unique([organizationId, slug])
}

model PageView {
  id              String   @id @default(cuid())
  pageId          String
  visitorId       String
  source          String?
  medium          String?
  campaign        String?
  createdAt       DateTime @default(now())
  
  page            LandingPage @relation(fields: [pageId], references: [id])
}

enum PageStatus {
  DRAFT
  PUBLISHED
  ARCHIVED
}
```

### 1.3 Form Builder

**Goal**: Create lead capture forms with field validation

#### Database Schema

```prisma
model Form {
  id              String   @id @default(cuid())
  organizationId  String
  landingPageId   String?
  name            String
  fields          Json     // Array of form field definitions
  submitAction    FormAction @default(THANK_YOU)
  redirectUrl     String?
  thankYouMessage String?
  notifyEmails    String[] // Array of notification emails
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  organization    Organization @relation(fields: [organizationId], references: [id])
  landingPage     LandingPage? @relation(fields: [landingPageId], references: [id])
  submissions     FormSubmission[]
}

model FormSubmission {
  id              String   @id @default(cuid())
  formId          String
  contactId       String?
  data            Json
  source          String?
  ipAddress       String?
  userAgent       String?
  createdAt       DateTime @default(now())
  
  form            Form @relation(fields: [formId], references: [id])
  contact         Contact? @relation(fields: [contactId], references: [id])
}

enum FormAction {
  THANK_YOU
  REDIRECT
  WEBHOOK
}
```

---

## 🔗 Phase 2: CRM Integration & Lead Management (Weeks 5-8)

### 2.1 Contact Management

#### Database Schema

```prisma
model Contact {
  id              String   @id @default(cuid())
  organizationId  String
  email           String
  firstName       String?
  lastName        String?
  phone           String?
  company         String?
  jobTitle        String?
  source          String?
  status          ContactStatus @default(LEAD)
  leadScore       Int      @default(0)
  tags            String[]
  customFields    Json?
  lastActivityAt  DateTime?
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  organization    Organization @relation(fields: [organizationId], references: [id])
  emailRecipients EmailRecipient[]
  formSubmissions FormSubmission[]
  activities      ContactActivity[]
  segments        ContactSegment[]
  
  @@unique([organizationId, email])
}

model ContactActivity {
  id              String   @id @default(cuid())
  contactId       String
  type            ActivityType
  description     String
  metadata        Json?
  createdAt       DateTime @default(now())
  
  contact         Contact @relation(fields: [contactId], references: [id])
}

enum ContactStatus {
  LEAD
  MQL
  SQL
  OPPORTUNITY
  CUSTOMER
  CHURNED
}

enum ActivityType {
  EMAIL_OPENED
  EMAIL_CLICKED
  FORM_SUBMITTED
  PAGE_VISITED
  CONTENT_DOWNLOADED
  VIDEO_WATCHED
  SOCIAL_ENGAGED
  CUSTOM
}
```

### 2.2 Lead Scoring Engine

```typescript
// src/lib/crm/leadScoring.ts

export interface ScoringRule {
  id: string;
  name: string;
  condition: ScoringCondition;
  points: number;
}

export interface ScoringCondition {
  type: 'email_opened' | 'email_clicked' | 'form_submitted' | 'page_visited' | 'demographic';
  field?: string;
  operator: 'equals' | 'contains' | 'greater_than' | 'less_than';
  value: string | number;
}

export const DEFAULT_SCORING_RULES: ScoringRule[] = [
  { id: '1', name: 'Email Opened', condition: { type: 'email_opened', operator: 'equals', value: true }, points: 5 },
  { id: '2', name: 'Email Clicked', condition: { type: 'email_clicked', operator: 'equals', value: true }, points: 10 },
  { id: '3', name: 'Form Submitted', condition: { type: 'form_submitted', operator: 'equals', value: true }, points: 20 },
  { id: '4', name: 'Pricing Page Visited', condition: { type: 'page_visited', field: 'url', operator: 'contains', value: '/pricing' }, points: 15 },
  { id: '5', name: 'Enterprise Company', condition: { type: 'demographic', field: 'company_size', operator: 'greater_than', value: 500 }, points: 25 },
];

export async function calculateLeadScore(contactId: string): Promise<number> {
  const contact = await prisma.contact.findUnique({
    where: { id: contactId },
    include: { activities: true, emailRecipients: true, formSubmissions: true }
  });

  if (!contact) return 0;

  let score = 0;

  // Email engagement
  const emailsOpened = contact.emailRecipients.filter(r => r.openedAt).length;
  const emailsClicked = contact.emailRecipients.filter(r => r.clickedAt).length;
  score += emailsOpened * 5;
  score += emailsClicked * 10;

  // Form submissions
  score += contact.formSubmissions.length * 20;

  // Page visits (pricing, demo pages = higher score)
  const pageVisits = contact.activities.filter(a => a.type === 'PAGE_VISITED');
  pageVisits.forEach(visit => {
    const url = (visit.metadata as any)?.url || '';
    if (url.includes('/pricing')) score += 15;
    else if (url.includes('/demo')) score += 20;
    else score += 2;
  });

  // Recency bonus
  const daysSinceActivity = contact.lastActivityAt 
    ? Math.floor((Date.now() - contact.lastActivityAt.getTime()) / (1000 * 60 * 60 * 24))
    : 999;
  
  if (daysSinceActivity < 7) score += 10;
  else if (daysSinceActivity < 30) score += 5;

  return score;
}
```

### 2.3 CRM Connectors

```typescript
// src/lib/crm/connectors/salesforce.ts

import jsforce from 'jsforce';

export class SalesforceConnector {
  private conn: jsforce.Connection;

  constructor(accessToken: string, instanceUrl: string) {
    this.conn = new jsforce.Connection({
      instanceUrl,
      accessToken
    });
  }

  async syncContact(contact: Contact): Promise<string> {
    const result = await this.conn.sobject('Lead').upsert({
      Email: contact.email,
      FirstName: contact.firstName,
      LastName: contact.lastName,
      Company: contact.company,
      Phone: contact.phone,
      Title: contact.jobTitle,
      LeadSource: 'DigitalMEng',
      Description: `Lead Score: ${contact.leadScore}`
    }, 'Email');

    return result.id;
  }

  async getContacts(query?: string): Promise<any[]> {
    const soql = query || "SELECT Id, Email, FirstName, LastName, Company FROM Lead WHERE LeadSource = 'DigitalMEng'";
    const result = await this.conn.query(soql);
    return result.records;
  }
}
```

```typescript
// src/lib/crm/connectors/hubspot.ts

import { Client } from '@hubspot/api-client';

export class HubSpotConnector {
  private client: Client;

  constructor(accessToken: string) {
    this.client = new Client({ accessToken });
  }

  async syncContact(contact: Contact): Promise<string> {
    try {
      const response = await this.client.crm.contacts.basicApi.create({
        properties: {
          email: contact.email,
          firstname: contact.firstName || '',
          lastname: contact.lastName || '',
          company: contact.company || '',
          phone: contact.phone || '',
          jobtitle: contact.jobTitle || '',
          hs_lead_status: contact.status,
          hubspot_owner_id: undefined
        }
      });
      return response.id;
    } catch (error: any) {
      if (error.code === 409) {
        // Contact exists, update instead
        const existing = await this.client.crm.contacts.basicApi.getById(contact.email, ['email']);
        await this.client.crm.contacts.basicApi.update(existing.id, {
          properties: { hs_lead_status: contact.status }
        });
        return existing.id;
      }
      throw error;
    }
  }
}
```

---

## 🧭 Phase 3: Journey Builder & Segmentation (Weeks 9-12)

### 3.1 Visual Journey Builder

#### Database Schema

```prisma
model Journey {
  id              String   @id @default(cuid())
  organizationId  String
  name            String
  description     String?
  status          JourneyStatus @default(DRAFT)
  triggerType     TriggerType
  triggerConfig   Json
  nodes           Json     // Array of journey nodes
  edges           Json     // Array of connections between nodes
  entryCount      Int      @default(0)
  completedCount  Int      @default(0)
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  publishedAt     DateTime?
  
  organization    Organization @relation(fields: [organizationId], references: [id])
  enrollments     JourneyEnrollment[]
}

model JourneyEnrollment {
  id              String   @id @default(cuid())
  journeyId       String
  contactId       String
  currentNodeId   String?
  status          EnrollmentStatus @default(ACTIVE)
  enteredAt       DateTime @default(now())
  completedAt     DateTime?
  exitedAt        DateTime?
  exitReason      String?
  
  journey         Journey @relation(fields: [journeyId], references: [id])
  contact         Contact @relation(fields: [contactId], references: [id])
  steps           JourneyStep[]
}

model JourneyStep {
  id              String   @id @default(cuid())
  enrollmentId    String
  nodeId          String
  nodeType        NodeType
  status          StepStatus @default(PENDING)
  scheduledAt     DateTime?
  executedAt      DateTime?
  result          Json?
  
  enrollment      JourneyEnrollment @relation(fields: [enrollmentId], references: [id])
}

enum JourneyStatus {
  DRAFT
  ACTIVE
  PAUSED
  COMPLETED
  ARCHIVED
}

enum TriggerType {
  FORM_SUBMISSION
  SEGMENT_ENTRY
  TAG_ADDED
  PAGE_VISIT
  MANUAL
  API
  EMAIL_EVENT
}

enum NodeType {
  TRIGGER
  EMAIL
  SMS
  WAIT
  CONDITION
  SPLIT
  UPDATE_CONTACT
  ADD_TAG
  REMOVE_TAG
  WEBHOOK
  END
}

enum EnrollmentStatus {
  ACTIVE
  COMPLETED
  EXITED
  PAUSED
}

enum StepStatus {
  PENDING
  IN_PROGRESS
  COMPLETED
  FAILED
  SKIPPED
}
```

#### Journey Engine

```typescript
// src/lib/journeys/engine.ts

export class JourneyEngine {
  
  async processEnrollment(enrollmentId: string) {
    const enrollment = await prisma.journeyEnrollment.findUnique({
      where: { id: enrollmentId },
      include: { journey: true, contact: true, steps: true }
    });

    if (!enrollment || enrollment.status !== 'ACTIVE') return;

    const journey = enrollment.journey;
    const nodes = journey.nodes as JourneyNode[];
    const edges = journey.edges as JourneyEdge[];

    const currentNode = nodes.find(n => n.id === enrollment.currentNodeId);
    if (!currentNode) return;

    // Execute current node
    const result = await this.executeNode(currentNode, enrollment);

    // Find next node based on result
    const nextEdge = edges.find(e => {
      if (e.source !== currentNode.id) return false;
      if (currentNode.type === 'CONDITION') {
        return e.label === (result.condition ? 'yes' : 'no');
      }
      return true;
    });

    if (nextEdge) {
      await prisma.journeyEnrollment.update({
        where: { id: enrollmentId },
        data: { currentNodeId: nextEdge.target }
      });
      
      // Schedule next step
      const nextNode = nodes.find(n => n.id === nextEdge.target);
      if (nextNode?.type === 'WAIT') {
        await this.scheduleStep(enrollmentId, nextNode);
      } else if (nextNode?.type === 'END') {
        await this.completeEnrollment(enrollmentId);
      } else {
        await this.processEnrollment(enrollmentId);
      }
    }
  }

  private async executeNode(node: JourneyNode, enrollment: JourneyEnrollment): Promise<NodeResult> {
    switch (node.type) {
      case 'EMAIL':
        return await this.sendEmail(node.config, enrollment.contact);
      case 'SMS':
        return await this.sendSMS(node.config, enrollment.contact);
      case 'CONDITION':
        return await this.evaluateCondition(node.config, enrollment.contact);
      case 'UPDATE_CONTACT':
        return await this.updateContact(node.config, enrollment.contact);
      case 'WEBHOOK':
        return await this.callWebhook(node.config, enrollment.contact);
      default:
        return { success: true };
    }
  }
}
```

### 3.2 Advanced Segmentation

```prisma
model Segment {
  id              String   @id @default(cuid())
  organizationId  String
  name            String
  description     String?
  type            SegmentType @default(STATIC)
  criteria        Json     // Segment rules
  memberCount     Int      @default(0)
  lastRefreshedAt DateTime?
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  organization    Organization @relation(fields: [organizationId], references: [id])
  contacts        ContactSegment[]
}

model ContactSegment {
  contactId       String
  segmentId       String
  addedAt         DateTime @default(now())
  
  contact         Contact @relation(fields: [contactId], references: [id])
  segment         Segment @relation(fields: [segmentId], references: [id])
  
  @@id([contactId, segmentId])
}

enum SegmentType {
  STATIC
  DYNAMIC
}
```

---

## 📱 Phase 4: SMS/WhatsApp & Predictive AI (Weeks 13-16)

### 4.1 SMS Integration (Twilio)

```typescript
// src/lib/sms/twilio.ts

import twilio from 'twilio';

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

export async function sendSMS(to: string, message: string): Promise<{ success: boolean; messageId?: string }> {
  try {
    const result = await client.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to
    });
    return { success: true, messageId: result.sid };
  } catch (error) {
    console.error('SMS error:', error);
    return { success: false };
  }
}
```

### 4.2 Predictive Send-Time Optimization

```typescript
// src/lib/ai/sendTimeOptimization.ts

interface EngagementWindow {
  dayOfWeek: number;
  hour: number;
  openRate: number;
  clickRate: number;
}

export async function getOptimalSendTime(contactId: string): Promise<Date> {
  const activities = await prisma.contactActivity.findMany({
    where: { contactId, type: { in: ['EMAIL_OPENED', 'EMAIL_CLICKED'] } },
    orderBy: { createdAt: 'desc' },
    take: 100
  });

  if (activities.length < 10) {
    // Not enough data, use org-level defaults
    return getOrgOptimalTime();
  }

  // Analyze engagement patterns
  const windows: Map<string, EngagementWindow> = new Map();
  
  activities.forEach(activity => {
    const date = new Date(activity.createdAt);
    const key = `${date.getDay()}-${date.getHours()}`;
    
    const existing = windows.get(key) || { 
      dayOfWeek: date.getDay(), 
      hour: date.getHours(), 
      openRate: 0, 
      clickRate: 0 
    };
    
    if (activity.type === 'EMAIL_OPENED') existing.openRate++;
    if (activity.type === 'EMAIL_CLICKED') existing.clickRate++;
    
    windows.set(key, existing);
  });

  // Find best window (weighted: clicks > opens)
  let bestWindow = { dayOfWeek: 2, hour: 10, score: 0 };
  
  windows.forEach(window => {
    const score = window.openRate + (window.clickRate * 2);
    if (score > bestWindow.score) {
      bestWindow = { ...window, score };
    }
  });

  // Calculate next occurrence of best window
  const now = new Date();
  const target = new Date();
  target.setHours(bestWindow.hour, 0, 0, 0);
  
  const daysUntil = (bestWindow.dayOfWeek - now.getDay() + 7) % 7;
  target.setDate(target.getDate() + (daysUntil || 7));

  return target;
}
```

---

## 📦 Required Dependencies

Add to `package.json`:

```json
{
  "dependencies": {
    "@sendgrid/mail": "^8.1.0",
    "@hubspot/api-client": "^10.0.0",
    "jsforce": "^2.0.0-beta.29",
    "twilio": "^4.19.0",
    "grapesjs": "^0.21.0",
    "grapesjs-preset-newsletter": "^1.0.0",
    "@react-email/components": "^0.0.12",
    "react-flow-renderer": "^10.3.17"
  }
}
```

---

## 📅 Implementation Timeline

| Week | Deliverables |
|------|-------------|
| 1 | Email schema, SendGrid integration, basic send |
| 2 | Email template editor, campaign management UI |
| 3 | Landing page builder (GrapesJS), hosting |
| 4 | Form builder, submission handling |
| 5 | Contact model, CRUD operations |
| 6 | Lead scoring engine, activity tracking |
| 7 | Salesforce connector |
| 8 | HubSpot connector, sync UI |
| 9 | Journey schema, node definitions |
| 10 | Visual journey builder (React Flow) |
| 11 | Journey execution engine |
| 12 | Segment builder, dynamic segments |
| 13 | Twilio SMS integration |
| 14 | WhatsApp Business API |
| 15 | Predictive send-time optimization |
| 16 | Testing, documentation, launch |

---

## ✅ Success Metrics

| Feature | Target KPI |
|---------|-----------|
| Email Marketing | 25% open rate, 3% CTR |
| Landing Pages | 10% conversion rate |
| Lead Scoring | 80% accuracy in MQL prediction |
| Journeys | 50% completion rate |
| SMS | 95% delivery rate |

---

**Document End**
