# Quick Start: Email Invitation System

Get the email invitation system up and running in 5 minutes!

## ⚡ Quick Setup (Development)

### 1. Install Dependencies (if not already installed)

```bash
# Server dependencies
cd server
npm install nodemailer

# Client dependencies (already included)
cd ../client
npm install
```

### 2. Set Up Gmail for Testing

#### Step 1: Enable 2-Factor Authentication
1. Go to [Google Account Security](https://myaccount.google.com/security)
2. Enable "2-Step Verification"

#### Step 2: Generate App Password
1. Still in Security settings, find "App passwords"
2. Select "Mail" and your device
3. Copy the 16-character password

#### Step 3: Configure Environment Variables

Create or update `server/.env`:

```env
# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=xxxx-xxxx-xxxx-xxxx    # Your 16-char app password
SMTP_FROM=Epoch Team <noreply@yourapp.com>

# Frontend URL
FRONTEND_URL=http://localhost:3000
```

Update `client/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

### 3. Test the Connection

Add this to `server/src/index.ts` temporarily:

```typescript
import { verifyEmailConnection } from './app/utils/email.util';

// After Express app is created
verifyEmailConnection()
  .then(() => console.log('✅ Email service ready!'))
  .catch((err) => console.error('❌ Email error:', err));
```

### 4. Start Your Servers

```bash
# Terminal 1 - Start backend
cd server
npm run dev

# Terminal 2 - Start frontend
cd client
npm run dev
```

Look for: `✅ Email service ready!` in your backend terminal.

## 🎯 Quick Test

### Test Invitation Flow

1. **Login as Manager**
   - Go to http://localhost:3000/login
   - Login with manager credentials

2. **Create Project with Invitations**
   - Go to Manager Dashboard
   - Click "New Project"
   - Fill in project details
   - Add email addresses in "Invite Team Members"
   - Click "Create Project"

3. **Check Results**
   - You'll see toast notifications showing:
     - "Project created successfully!"
     - "Sent X invitation(s)!"
   - Check the email inbox of invited addresses

4. **Accept Invitation** (if new user)
   - Click link in email
   - View project details
   - Login or signup
   - Click "Accept Invitation"
   - You're now part of the project!

5. **Verify** (if existing user)
   - Check welcome email
   - Login to member dashboard
   - See project in your list

## 🐛 Troubleshooting

### "Email service error"

**Problem**: Can't connect to SMTP server

**Quick Fixes**:
1. ✅ Check 2FA is enabled on Gmail
2. ✅ Generate fresh App Password
3. ✅ Copy password exactly (no spaces)
4. ✅ Restart server after changing `.env`

### "Failed to send invitations"

**Problem**: API call failing

**Quick Fixes**:
1. ✅ Check `NEXT_PUBLIC_API_URL` in client `.env.local`
2. ✅ Verify backend is running on port 5000
3. ✅ Check browser console for errors
4. ✅ Verify you're logged in as manager

### "This invitation was sent to a different email"

**Problem**: Email mismatch

**Quick Fix**:
- ✅ Login with the exact email that received the invitation

## 📧 Email Providers Comparison

| Provider | Best For | Setup Time | Free Tier |
|----------|----------|------------|-----------|
| **Gmail** | Development | 2 min | 500/day |
| **Ethereal** | Testing (fake emails) | 1 min | Unlimited |
| **SendGrid** | Production | 5 min | 100/day |
| **AWS SES** | Enterprise | 10 min | 200/day |

### Switch to Ethereal (Testing)

Don't want to use real email? Use Ethereal:

1. Go to https://ethereal.email
2. Click "Create Ethereal Account"
3. Copy credentials to `.env`:

```env
SMTP_HOST=smtp.ethereal.email
SMTP_PORT=587
SMTP_USER=your-ethereal-user@ethereal.email
SMTP_PASS=your-ethereal-password
```

4. Check emails at: https://ethereal.email/messages

**Note**: Emails won't actually be delivered, but you can view them on Ethereal's website!

## 🚀 Quick Production Setup

### Switch to SendGrid (5 minutes)

1. **Sign Up**
   - Go to https://sendgrid.com/pricing
   - Choose Free plan (100 emails/day)
   - Verify your email

2. **Create API Key**
   - Dashboard → Settings → API Keys
   - Click "Create API Key"
   - Name: "Epoch Email Service"
   - Permission: "Restricted Access" → "Mail Send" → "Full Access"
   - Copy the API key

3. **Verify Sender**
   - Settings → Sender Authentication
   - Verify a Single Sender
   - Use your business email
   - Confirm verification email

4. **Update Environment**

```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=SG.xxxxxxxxxxxxxxxxxxxxxxxxxxxxx    # Your API key
SMTP_FROM=Your Name <verified@yourdomain.com>  # Must be verified
```

5. **Deploy & Test**
   - Deploy to production
   - Send test invitation
   - Check delivery

## 📝 Features Checklist

After setup, you should have:

- ✅ Email service configured and tested
- ✅ Managers can invite members by email
- ✅ Existing users auto-added to projects
- ✅ New users receive invitation links
- ✅ Invitations expire after 7 days
- ✅ Email verification on acceptance
- ✅ Beautiful HTML email templates
- ✅ Invitation management UI
- ✅ Cancel pending invitations
- ✅ View invitation status

## 🔗 Next Steps

1. **Customize Email Templates**
   - Edit `server/src/app/utils/email.util.ts`
   - Update HTML in `sendInvitationEmail()` and `sendWelcomeEmail()`
   - Add your logo and branding

2. **Add to More Pages**
   - Use `<ProjectInvitations />` component anywhere
   - Props: `projectId` and `projectName`

3. **Monitor Usage**
   - Check email delivery rates
   - Track invitation acceptance
   - Set up analytics

4. **Production Hardening**
   - Add rate limiting
   - Set up email bounce handling
   - Configure retry logic
   - Add monitoring/alerts

## 📚 Documentation

- **Full Documentation**: See [INVITATION_SYSTEM.md](./INVITATION_SYSTEM.md)
- **Email Setup Details**: See [server/EMAIL_SETUP.md](./server/EMAIL_SETUP.md)
- **API Reference**: Check INVITATION_SYSTEM.md → API Endpoints section
- **Security**: Review INVITATION_SYSTEM.md → Security section

## 💡 Tips

### Development
- Use Ethereal for testing (no real emails sent)
- Gmail has 500/day limit (plenty for dev)
- Check spam folder if emails not arriving

### Production
- Use SendGrid or AWS SES
- Verify your domain for better deliverability
- Monitor bounce rates and spam reports
- Set up proper SPF/DKIM records

### Best Practices
- Always test email templates on mobile
- Keep invitation emails short and clear
- Add unsubscribe option for compliance
- Track delivery and open rates
- A/B test subject lines

## 🆘 Need Help?

Common issues and solutions:

| Issue | Solution |
|-------|----------|
| Emails not sending | Check `verifyEmailConnection()` output |
| Wrong email template | Edit `email.util.ts` |
| Invitation link broken | Verify `FRONTEND_URL` in `.env` |
| Can't accept invitation | Check email matches exactly |
| Token expired | Resend invitation (7-day limit) |

Still stuck? Check the full [INVITATION_SYSTEM.md](./INVITATION_SYSTEM.md) documentation!

---

**Ready to go!** 🎉 Start inviting team members to your projects!
