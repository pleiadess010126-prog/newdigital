# DigitalMEng Helpdesk & Support System

## Overview

A complete helpdesk and support ticket system has been implemented for DigitalMEng, featuring:

- **User-facing Support Center** - Create and track tickets
- **Support Team Dashboard** - Manage and resolve tickets
- **Agent Nandu Integration** - AI-powered escalation
- **Role-based Access** - Support team role added

## Pages & Routes

### User Pages
- `/support` - User support center (create tickets, view history)

### Support Team Pages
- `/support/dashboard` - Support team dashboard (manage all tickets)

## How It Works

### 1. User Creates a Ticket
Users can create tickets from:
- **Support Center** (`/support`) - Direct ticket creation
- **Agent Nandu** - When Nandu can't solve an issue, it offers to create a ticket

### 2. Ticket Creation
When a ticket is created:
- Unique ticket number generated (e.g., `TKT-2026-0001`)
- Category assigned (Technical, Billing, Feature Request, etc.)
- Priority set (Low, Medium, High, Critical)
- Status set to "Open"

### 3. Support Team Receives Ticket
Support staff can:
- View all tickets in the dashboard
- Filter by status, priority, category
- Search by ticket number or content
- Assign tickets to team members

### 4. Ticket Resolution
Support team can:
- Reply to customers (public messages)
- Add internal notes (private)
- Change ticket status
- Update priority
- Mark as resolved with resolution summary

### 5. Customer Satisfaction
When tickets are resolved:
- Customers can rate their experience (1-5 stars)
- Feedback is stored for quality improvement

## Ticket Categories

| Category | Description |
|----------|-------------|
| Technical | Bugs, errors, technical problems |
| Billing | Subscription, invoices, refunds |
| Feature Request | New feature suggestions |
| Bug Report | Specific bug reports |
| Account | Login, permissions, settings |
| Integration | Platform connections, APIs |
| Content | AI generation issues |
| General | Other questions |

## Ticket Status Flow

```
[Open] → [In Progress] → [Waiting on Customer] ↔ [Waiting on Support] → [Resolved] → [Closed]
```

## User Roles

| Role | Access |
|------|--------|
| `viewer/editor/owner` | Can create/view own tickets only |
| `support` | Can view/manage ALL tickets in Support Dashboard |
| `admin/superadmin` | Full access + Support team management |

---

## 🎫 Creating Support Team Users

### Method 1: NPM Script (Recommended)

Run the support user creation script:

```bash
npm run support:create
```

**Default Credentials:**
- **Email**: `support@digitalmeng.com`
- **Password**: `support123`
- **Role**: `support`

⚠️ **IMPORTANT**: Change the password after first login!

### Method 2: Custom Credentials

Use environment variables:

```bash
# Windows (PowerShell)
$env:SUPPORT_EMAIL="john.support@yourcompany.com"
$env:SUPPORT_NAME="John Support"
$env:SUPPORT_PASSWORD="your-secure-password"
npm run support:create

# Linux/Mac
SUPPORT_EMAIL="john.support@yourcompany.com" \
SUPPORT_NAME="John Support" \
SUPPORT_PASSWORD="your-secure-password" \
npm run support:create
```

### Method 3: Prisma Studio (Manual)

1. Open Prisma Studio:
   ```bash
   npm run db:studio
   ```

2. Navigate to the `users` table

3. Click "Add Record" and fill in:
   - `email`: support team email
   - `name`: support team member name
   - `role`: **support** (important!)
   - `passwordHash`: Generate with bcrypt
   - `authProvider`: email
   - `emailVerified`: true

4. To generate password hash:
   ```bash
   node -e "const bcrypt = require('bcryptjs'); console.log(bcrypt.hashSync('your-password', 10));"
   ```

### Method 4: SQL Query

```sql
-- Generate password hash first, then:
INSERT INTO users (id, email, name, "passwordHash", role, "authProvider", "emailVerified", "createdAt", "updatedAt")
VALUES (
  'user_support_001',
  'support@digitalmeng.com',
  'Support Team',
  '$2a$10$YOUR_HASHED_PASSWORD_HERE',
  'support',
  'email',
  true,
  NOW(),
  NOW()
);
```

---

## 📍 Logging In as Support

1. Go to: **http://localhost:3000/login**
2. Enter support team email and password
3. After login, access: **http://localhost:3000/support/dashboard**

### Support Dashboard Access
- Support team members (role = `support`) can access `/support/dashboard`
- They can view ALL tickets from ALL users
- They can assign, respond, and resolve tickets

## Integration with Agent Nandu

When users ask Nandu about issues/problems, Nandu will:
1. Attempt to solve the issue from knowledge base
2. Offer to create a support ticket if unable to resolve
3. Include conversation context when escalating

### Trigger Phrases
- "I have a problem"
- "Something is not working"
- "I need support"
- "There's an error"
- "I need help"

### Billing Escalation
For billing-related queries, Nandu automatically:
- Detects billing keywords (refund, charge, payment failed)
- Creates HIGH priority ticket
- Routes to billing category

## Database Schema

### SupportTicket
```prisma
model SupportTicket {
  id             String
  ticketNumber   String         @unique
  userId         String
  subject        String
  description    String
  category       TicketCategory
  priority       TicketPriority
  status         TicketStatus
  assignedToId   String?
  source         String         // user, nandu, email, api
  nanduContext   Json?          // AI context for escalations
  resolution     String?
  rating         Int?           // 1-5 stars
  feedback       String?
  createdAt      DateTime
  updatedAt      DateTime
}
```

### TicketMessage
```prisma
model TicketMessage {
  id        String
  ticketId  String
  senderId  String
  senderType String    // user, support, system, nandu
  message   String
  isInternal Boolean   // Internal notes not visible to customer
  createdAt DateTime
}
```

## Access Points

### User Menu (Dashboard)
- Support Center link added to user dropdown menu

### Agent Nandu Quick Actions
- "Support" quick action added

### Direct Links
- `/support` - Support center
- `/support/dashboard` - Support team dashboard

## Next Steps (Future Enhancements)

1. **Email Notifications** - Send email when ticket status changes
2. **Slack Integration** - Notify support team in Slack
3. **SLA Monitoring** - Alert on SLA breaches
4. **Knowledge Base Search** - Auto-suggest KB articles to users
5. **Canned Responses** - Pre-written replies for common issues
6. **Ticket Tags** - Custom tagging for organization
7. **Analytics Dashboard** - Support metrics and trends

---

Created: January 15, 2026
