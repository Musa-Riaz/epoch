# Email Service Configuration for Invitations

This document explains how to set up email sending for project invitations.

## Environment Variables

Add these to your `.env` file:

```env
# Email Service Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-specific-password
SMTP_FROM=noreply@epoch.com

# Frontend URL (for invitation links)
FRONTEND_URL=http://localhost:3000
```

## Email Service Options

### 1. Gmail (Recommended for Development)

**Setup:**
1. Create a Gmail account or use existing
2. Enable 2-Factor Authentication
3. Generate an App Password:
   - Go to Google Account → Security
   - Click on "2-Step Verification"
   - Scroll to "App passwords"
   - Generate password for "Mail"
4. Use the generated password in `SMTP_PASS`

**Configuration:**
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-16-digit-app-password
```

### 2. SendGrid (Recommended for Production)

**Setup:**
1. Sign up at https://sendgrid.com (Free: 100 emails/day)
2. Create an API key
3. Verify sender identity

**Configuration:**
```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=your-sendgrid-api-key
```

### 3. AWS SES (Best for Scale)

**Setup:**
1. Sign up for AWS
2. Create IAM user with SES permissions
3. Verify email/domain in SES

**Configuration:**
```env
SMTP_HOST=email-smtp.us-east-1.amazonaws.com
SMTP_PORT=587
SMTP_USER=your-aws-access-key-id
SMTP_PASS=your-aws-secret-access-key
```

### 4. Ethereal (Development Only)

For testing without real emails:

1. Go to https://ethereal.email/
2. Click "Create Ethereal Account"
3. Copy credentials

**Configuration:**
```env
SMTP_HOST=smtp.ethereal.email
SMTP_PORT=587
SMTP_USER=generated-username
SMTP_PASS=generated-password
```

Emails won't be delivered but you can view them at the preview URL in console.

## API Endpoints

### Send Invitations
```
POST /api/invitations/send
Authorization: Bearer <token>
Body: {
  "projectId": "project-id",
  "emails": ["user1@example.com", "user2@example.com"]
}
```

### Get Invitation Details
```
GET /api/invitations/token/:token
```

### Accept Invitation
```
POST /api/invitations/accept
Authorization: Bearer <token>
Body: {
  "token": "invitation-token"
}
```

### Get Project Invitations
```
GET /api/invitations/project/:projectId
Authorization: Bearer <token>
```

### Cancel Invitation
```
DELETE /api/invitations/:invitationId
Authorization: Bearer <token>
```

## How It Works

### 1. Manager Sends Invitations
- Manager enters email addresses when creating/editing project
- System checks if users exist:
  - **Existing users**: Added directly to project + welcome email
  - **New users**: Invitation created + invitation email sent

### 2. Email Contains Secure Token
- Unique token generated for each invitation
- Token expires in 7 days
- One-time use only

### 3. User Accepts Invitation
- Clicks link in email → redirected to frontend
- If logged in: Automatically joins project
- If not logged in: Prompted to login/signup, then joins

### 4. Security Features
- Tokens expire after 7 days
- Email verification ensures right person accepts
- Can't accept invitation for different email
- Project owners can revoke invitations

## Testing

### Development Testing (Ethereal)
```javascript
// Emails are logged to console with preview URL
// Check terminal output after sending invitation
```

### Production Testing
1. Use your own email first
2. Check spam folder
3. Verify invitation link works
4. Test expiry by setting short expiration

## Troubleshooting

### Emails Not Sending
- Check SMTP credentials
- Verify 2FA is enabled (Gmail)
- Check firewall/port blocking
- Review console logs for errors

### Emails in Spam
- Set up SPF/DKIM records
- Use verified domain
- Avoid spam trigger words
- Use reputable SMTP service

### Invalid Token Errors
- Check token hasn't expired
- Verify token wasn't already used
- Ensure correct token in URL

## Email Templates

The email templates include:
- **Invitation Email**: Sent to new users
- **Welcome Email**: Sent when user joins project
- Both are responsive HTML emails with fallback text

## Rate Limits

Be aware of rate limits:
- **Gmail**: 500 emails/day
- **SendGrid Free**: 100 emails/day
- **AWS SES**: 62,000 emails/month free tier

## Production Checklist

- [ ] Use production SMTP service (SendGrid/AWS SES)
- [ ] Set up custom domain for emails
- [ ] Configure SPF/DKIM/DMARC records
- [ ] Set correct FRONTEND_URL
- [ ] Test email delivery
- [ ] Monitor email bounce rates
- [ ] Set up email templates with branding
- [ ] Add unsubscribe links (if needed)
- [ ] Comply with email regulations (CAN-SPAM, GDPR)

## Cost Estimates

- **Gmail**: Free (limited)
- **SendGrid**: $0 (100/day), $15/month (40k)
- **AWS SES**: $0.10 per 1,000 emails
- **Mailgun**: Similar to SendGrid

## Support

For issues:
1. Check console logs
2. Verify environment variables
3. Test SMTP connection
4. Review error messages
5. Check email service status
