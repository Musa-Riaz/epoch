# Email Invitation System

Complete implementation of secure email-based project member invitations for the Epoch project management platform.

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Architecture](#architecture)
- [Setup](#setup)
- [Usage](#usage)
- [API Endpoints](#api-endpoints)
- [Frontend Components](#frontend-components)
- [Security](#security)
- [Testing](#testing)
- [Troubleshooting](#troubleshooting)

## 🎯 Overview

The email invitation system allows project managers to invite team members via email. The system intelligently handles both existing and new users:

- **Existing users**: Automatically added to the project and receive a welcome email
- **New users**: Receive an invitation email with a secure token to join after registration

## ✨ Features

- ✅ **Secure Token-Based Invitations**: Cryptographically secure tokens (not just project IDs)
- ✅ **Smart User Detection**: Automatically detects if invited email is an existing user
- ✅ **Email Verification**: Validates that the accepting user's email matches the invitation
- ✅ **Token Expiration**: Invitations expire after 7 days
- ✅ **One-Time Use**: Tokens are marked as used after acceptance
- ✅ **Bulk Invitations**: Send multiple invitations at once
- ✅ **Professional Email Templates**: Beautiful HTML emails with responsive design
- ✅ **Multiple Email Providers**: Support for Gmail, SendGrid, AWS SES, Ethereal
- ✅ **Invitation Management**: View, cancel, and track pending invitations
- ✅ **Detailed Status Tracking**: Track invitation status (pending, accepted, expired, rejected)

## 🏗 Architecture

### Backend Components

```
server/src/
├── infrastructure/database/models/
│   └── invitation.model.ts          # Mongoose schema for invitations
├── app/
│   ├── controllers/
│   │   └── invitation.controller.ts # Business logic for invitations
│   ├── routes/
│   │   └── invitation.routes.ts     # REST API endpoints
│   └── utils/
│       └── email.util.ts            # Email sending service
└── server.ts                        # Express app with routes integrated
```

### Frontend Components

```
client/src/
├── app/
│   ├── accept-invitation/
│   │   ├── page.tsx                 # Accept invitation page
│   │   └── loading.tsx              # Loading state
│   └── (auth)/login/
│       └── page.tsx                 # Updated with invitation redirect
└── components/cards/
    └── ProjectInvitations.tsx       # Reusable invitation management component
```

## 🚀 Setup

### 1. Backend Environment Variables

Add the following to your `server/.env` file:

```env
# Email Service Configuration
SMTP_HOST=smtp.gmail.com              # Or smtp.sendgrid.net, email-smtp.us-east-1.amazonaws.com
SMTP_PORT=587                         # 587 for TLS, 465 for SSL
SMTP_USER=your-email@gmail.com        # Your email address
SMTP_PASS=your-app-password           # App password (not regular password)
SMTP_FROM=Epoch Team <noreply@epoch.com>  # From address shown in emails

# Frontend URL (for invitation links)
FRONTEND_URL=http://localhost:3000    # Your frontend URL
```

### 2. Email Provider Setup

Choose one of the following providers:

#### Option A: Gmail (Development)

1. Enable 2-Factor Authentication on your Google account
2. Generate an App Password:
   - Go to Google Account Settings → Security → 2-Step Verification
   - Scroll to "App passwords"
   - Generate password for "Mail"
3. Use the generated password as `SMTP_PASS`

**Configuration:**
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-16-char-app-password
```

#### Option B: SendGrid (Production Recommended)

1. Sign up at [sendgrid.com](https://sendgrid.com)
2. Create an API key with "Mail Send" permission
3. Verify your sender identity

**Configuration:**
```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=your-sendgrid-api-key
```

#### Option C: AWS SES (Enterprise)

1. Set up AWS SES in your AWS account
2. Verify email address or domain
3. Create SMTP credentials

**Configuration:**
```env
SMTP_HOST=email-smtp.us-east-1.amazonaws.com
SMTP_PORT=587
SMTP_USER=your-smtp-username
SMTP_PASS=your-smtp-password
```

#### Option D: Ethereal (Testing Only)

For testing without sending real emails:

1. Visit [ethereal.email](https://ethereal.email)
2. Create a test account
3. Use provided credentials

**Configuration:**
```env
SMTP_HOST=smtp.ethereal.email
SMTP_PORT=587
SMTP_USER=provided-username
SMTP_PASS=provided-password
```

### 3. Frontend Environment Variables

Add to your `client/.env.local` file:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

### 4. Verify Installation

Test the email connection:

```typescript
import { verifyEmailConnection } from './app/utils/email.util';

verifyEmailConnection()
  .then(() => console.log('✅ Email service ready'))
  .catch(err => console.error('❌ Email service error:', err));
```

## 📖 Usage

### For Managers: Sending Invitations

#### In Manager Dashboard

1. Navigate to the project you want to add members to
2. Use the "Invite Team Members" section
3. Enter email addresses one by one
4. Click "Send Invitations"
5. Review the results showing which emails were invited vs. added directly

#### Using the Component Directly

```tsx
import ProjectInvitations from '@/components/cards/ProjectInvitations';

function ProjectSettings({ projectId, projectName }) {
  return (
    <div>
      <ProjectInvitations 
        projectId={projectId}
        projectName={projectName}
      />
    </div>
  );
}
```

### For Members: Accepting Invitations

1. **Receive Email**: Check your inbox for the invitation email
2. **Click Link**: Click "Accept Invitation" button in the email
3. **Login/Signup**: 
   - If you have an account: Log in with the invited email
   - If you're new: Create an account with the invited email
4. **Accept**: Click "Accept Invitation" on the confirmation page
5. **Done**: You're now part of the project!

### For Existing Users

If you already have an account and get invited:
- You're automatically added to the project
- You receive a welcome email
- No invitation link needed

## 🔌 API Endpoints

### POST /api/invitations/send

Send invitations to multiple email addresses.

**Headers:**
```json
{
  "Authorization": "Bearer <token>"
}
```

**Body:**
```json
{
  "projectId": "507f1f77bcf86cd799439011",
  "emails": ["user1@example.com", "user2@example.com"]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "results": [
      {
        "email": "user1@example.com",
        "success": true,
        "message": "User added to project directly",
        "added": true
      },
      {
        "email": "user2@example.com",
        "success": true,
        "message": "Invitation sent successfully",
        "invited": true
      }
    ]
  }
}
```

### GET /api/invitations/token/:token

Get invitation details by token (public endpoint).

**Response:**
```json
{
  "success": true,
  "data": {
    "email": "user@example.com",
    "project": {
      "_id": "507f1f77bcf86cd799439011",
      "name": "Project Alpha",
      "description": "Project description"
    },
    "invitedBy": {
      "firstName": "John",
      "lastName": "Doe",
      "email": "manager@example.com"
    },
    "expiresAt": "2024-01-15T12:00:00.000Z"
  }
}
```

### POST /api/invitations/accept

Accept an invitation.

**Headers:**
```json
{
  "Authorization": "Bearer <token>"
}
```

**Body:**
```json
{
  "token": "abc123xyz789..."
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "message": "Successfully joined the project"
  }
}
```

### GET /api/invitations/project/:projectId

Get all pending invitations for a project.

**Headers:**
```json
{
  "Authorization": "Bearer <token>"
}
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "email": "user@example.com",
      "status": "pending",
      "createdAt": "2024-01-08T12:00:00.000Z",
      "expiresAt": "2024-01-15T12:00:00.000Z"
    }
  ]
}
```

### DELETE /api/invitations/:invitationId

Cancel a pending invitation.

**Headers:**
```json
{
  "Authorization": "Bearer <token>"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "message": "Invitation cancelled successfully"
  }
}
```

## 🎨 Frontend Components

### AcceptInvitationPage

Located at `/accept-invitation?token=xyz`

**Features:**
- Fetches invitation details by token
- Displays project information
- Shows who sent the invitation
- Handles login redirect for unauthenticated users
- Validates email matches before acceptance
- Shows success state after joining

**States:**
- Loading: Fetching invitation details
- Error: Invalid/expired token
- Ready: Shows invitation with accept button
- Success: Confirmation after acceptance

### ProjectInvitations Component

Reusable component for managing project invitations.

**Props:**
```typescript
interface ProjectInvitationsProps {
  projectId: string;    // The project to invite members to
  projectName: string;  // Display name for the project
}
```

**Features:**
- Email input with validation
- Bulk email management (add/remove)
- Send multiple invitations at once
- View pending invitations
- Cancel pending invitations
- Real-time status updates
- Detailed result dialog

**Usage:**
```tsx
<ProjectInvitations 
  projectId="507f1f77bcf86cd799439011"
  projectName="Project Alpha"
/>
```

## 🔒 Security

### Token Security

- **Cryptographic Generation**: Uses Node.js `crypto.randomBytes(32)` for secure tokens
- **One-Time Use**: Tokens marked as used after acceptance
- **Expiration**: 7-day expiration period
- **Email Verification**: Must match invited email to accept

### Email Verification

- **Email Matching**: Accepting user's email must match invitation email
- **Case Insensitive**: Email comparison is case-insensitive
- **Duplicate Prevention**: Can't send invitation to same email twice for same project

### Database Indexes

```typescript
// Compound index for quick lookups
{ email: 1, projectId: 1 }

// Token index for invitation retrieval
{ token: 1 }

// Cleanup index for expired invitations
{ expiresAt: 1 }
```

### Rate Limiting (Recommended)

Add rate limiting middleware for production:

```typescript
import rateLimit from 'express-rate-limit';

const invitationLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 invitation sends per window
  message: 'Too many invitation requests, please try again later'
});

app.post('/api/invitations/send', invitationLimiter, ...);
```

## 🧪 Testing

### Testing Email Functionality

#### 1. Use Ethereal for Development

```typescript
// In email.util.ts, temporarily use Ethereal
const transporter = nodemailer.createTransport({
  host: 'smtp.ethereal.email',
  port: 587,
  auth: {
    user: 'your-ethereal-user',
    pass: 'your-ethereal-pass'
  }
});

// After sending, get test URL
const info = await transporter.sendMail(mailOptions);
console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
```

#### 2. Test Complete Flow

1. **Send Invitation (New User)**:
   ```bash
   POST http://localhost:5000/api/invitations/send
   Body: {
     "projectId": "...",
     "emails": ["newuser@test.com"]
   }
   ```

2. **Send Invitation (Existing User)**:
   ```bash
   POST http://localhost:5000/api/invitations/send
   Body: {
     "projectId": "...",
     "emails": ["existing@test.com"]
   }
   ```

3. **View Invitation**:
   ```bash
   GET http://localhost:3000/accept-invitation?token=xyz
   ```

4. **Accept Invitation**:
   - Log in as the invited user
   - Click accept
   - Verify added to project.team array

### Test Cases

```typescript
describe('Invitation System', () => {
  test('Should send invitation to new user', async () => {
    // Test sending invitation
    // Verify invitation created in DB
    // Verify email sent
  });

  test('Should add existing user directly', async () => {
    // Test sending to existing email
    // Verify user added to project.team
    // Verify welcome email sent
  });

  test('Should reject expired token', async () => {
    // Create expired invitation
    // Try to accept
    // Verify rejection
  });

  test('Should reject wrong email', async () => {
    // Create invitation for user A
    // Try to accept as user B
    // Verify rejection
  });

  test('Should prevent duplicate invitations', async () => {
    // Send invitation
    // Try sending again
    // Verify error
  });
});
```

## 🐛 Troubleshooting

### Email Not Sending

**Problem**: No emails being sent

**Solutions**:
1. Verify SMTP credentials in `.env`
2. Check email service is not blocked by firewall
3. Use `verifyEmailConnection()` to test connection
4. Check spam folder
5. Verify sender email is verified (SendGrid, AWS SES)

```typescript
// Test connection
import { verifyEmailConnection } from './app/utils/email.util';
verifyEmailConnection();
```

### Gmail App Password Issues

**Problem**: Gmail rejecting login

**Solutions**:
1. Enable 2-Factor Authentication first
2. Generate new App Password
3. Use 16-character password without spaces
4. Don't use your regular Gmail password

### Token Invalid Error

**Problem**: "Invalid or expired invitation token"

**Possible Causes**:
- Token already used
- Token expired (>7 days old)
- Token doesn't exist in database
- Wrong token format

**Solutions**:
1. Check invitation status in database
2. Resend invitation
3. Verify token is complete in URL

### Email Mismatch Error

**Problem**: "This invitation was sent to a different email"

**Solutions**:
1. Log out and log in with correct email
2. Create account with invited email
3. Check email spelling matches exactly

### Invitation Not Showing

**Problem**: Sent invitation but not appearing in list

**Solutions**:
1. Refresh the page
2. Check network tab for API errors
3. Verify invitation created in database
4. Check invitation status (might be accepted/expired)

### Production Email Limits

**Problem**: Hitting email rate limits

**Solutions**:
1. **Gmail**: 500 emails/day limit
   - Upgrade to Google Workspace for 2000/day
2. **SendGrid**: Check your plan limits
   - Free: 100 emails/day
   - Paid: Higher limits
3. **AWS SES**: 
   - Start in sandbox (200/day)
   - Request production access for unlimited
4. Implement batch processing for large teams
5. Add delay between bulk sends

### Database Issues

**Problem**: Invitation queries slow

**Solutions**:
1. Verify indexes created:
   ```javascript
   db.invitations.getIndexes()
   ```
2. Add compound index if missing:
   ```javascript
   db.invitations.createIndex({ email: 1, projectId: 1 })
   ```
3. Set up TTL index for auto-cleanup:
   ```javascript
   db.invitations.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 })
   ```

## 📊 Monitoring

### Email Delivery Tracking

Add logging to track email delivery:

```typescript
// In email.util.ts
const info = await transporter.sendMail(mailOptions);
console.log('Email sent:', {
  messageId: info.messageId,
  to: email,
  subject: mailOptions.subject,
  timestamp: new Date()
});
```

### Invitation Analytics

Track invitation metrics:

```typescript
// Get invitation statistics
const stats = await Invitation.aggregate([
  { $group: {
    _id: '$status',
    count: { $sum: 1 }
  }}
]);

// Result: 
// [
//   { _id: 'pending', count: 10 },
//   { _id: 'accepted', count: 45 },
//   { _id: 'expired', count: 5 }
// ]
```

## 🚀 Production Checklist

Before deploying to production:

- [ ] Configure production email service (SendGrid/AWS SES)
- [ ] Set up proper `SMTP_FROM` email address
- [ ] Verify sender email/domain
- [ ] Set production `FRONTEND_URL`
- [ ] Add rate limiting to invitation endpoints
- [ ] Set up email delivery monitoring
- [ ] Configure retry logic for failed emails
- [ ] Add invitation analytics dashboard
- [ ] Set up automated cleanup of expired invitations
- [ ] Test email templates on multiple devices
- [ ] Configure proper error handling and logging
- [ ] Set up email bounce handling
- [ ] Add invitation limit per project (if needed)
- [ ] Configure email queue for bulk sending

## 📝 License

Part of the Epoch project management platform.

---

**Need Help?** Check the [EMAIL_SETUP.md](../server/EMAIL_SETUP.md) guide for detailed email provider setup instructions.
