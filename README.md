# 🚀 Epoch - Project Management Platform

A modern, full-stack project management platform built with Next.js, Express, MongoDB, and TypeScript.

## 📚 Documentation Hub

### 🎯 Quick Links

| Document | Description | For |
|----------|-------------|-----|
| [QUICK_START_INVITATIONS.md](./QUICK_START_INVITATIONS.md) | 5-minute setup for email invitations | **Start Here** |
| [INVITATION_SYSTEM.md](./INVITATION_SYSTEM.md) | Complete invitation system documentation | Developers |
| [SYSTEM_DIAGRAMS.md](./SYSTEM_DIAGRAMS.md) | Architecture and flow diagrams | Developers |
| [IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md) | What was built and why | Project Managers |
| [CHECKLIST.md](./CHECKLIST.md) | Implementation checklist | DevOps/QA |
| [server/EMAIL_SETUP.md](./server/EMAIL_SETUP.md) | Email provider setup details | DevOps |

## ✨ Features

### Core Functionality
- ✅ **User Management**: Role-based authentication (Admin, Manager, Member)
- ✅ **Project Management**: Create, update, and track projects
- ✅ **Task Management**: Kanban board with drag-and-drop
- ✅ **Team Collaboration**: Comments, mentions, and real-time updates
- ✅ **Email Invitations**: Secure invite system with smart user detection
- ✅ **Dashboard Analytics**: Project insights and team performance
- ✅ **Super Admin Hub**: Platform-wide metrics, destructive user banning, and global monitoring
- ✅ **Manager Aggregation**: Overview of sub-teams and their task completion rates
- ✅ **Advanced Authentication**: Passwordless OTP & Forgot Password utilities

### Recently Added
- 🚀 **High-End UI/UX Overhaul**
  - Seamlessly animated framer-motion page transitions
  - Beautiful, reactive glassmorphic mesh underlays and native dark-mode support
- ⚡ **In-Process Memory Caching**
  - Dramatically improves manager-dashboard request times using `node-cache` layer
  - Dynamic pattern-based cache invalidation
- 🛡️ **Super Admin Dashboard**
  - Complete God-mode platform oversight of users, tasks, projects, and analytics
- 🎉 **Email Invitation System** - Complete implementation
  - Send invitations via email
  - Smart existing user detection
  - Secure token-based acceptance
  - Beautiful HTML email templates
  - Invitation management UI
  - Support for multiple email providers

## 🛠 Tech Stack

### Frontend
- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **UI Library**: shadcn/ui + Radix UI
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Drag & Drop**: dnd-kit
- **Forms**: React Hook Form
- **Notifications**: react-hot-toast

### Backend
- **Runtime**: Node.js
- **Framework**: Express
- **Language**: TypeScript
- **Database**: MongoDB (Mongoose ODM)
- **Authentication**: JWT
- **Email**: Nodemailer
- **Validation**: Zod

### DevOps
- **Version Control**: Git
- **Package Manager**: npm
- **Environment**: dotenv

## 🚀 Getting Started

### Prerequisites

```bash
node >= 18.0.0
npm >= 9.0.0
MongoDB >= 6.0
```

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd epoch
   ```

2. **Install dependencies**
   ```bash
   # Install server dependencies
   cd server
   npm install

   # Install client dependencies
   cd ../client
   npm install
   ```

3. **Set up environment variables**

   **Server** (`server/.env`):
   ```env
   # Database
   MONGODB_URI=mongodb://localhost:27017/epoch
   
   # JWT
   JWT_SECRET=your-secret-key-here
   
   # Email (see EMAIL_SETUP.md for details)
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=your-app-password
   SMTP_FROM=Epoch Team <noreply@epoch.com>
   
   # Frontend
   FRONTEND_URL=http://localhost:3000
   
   # Server
   PORT=5000
   ```

   **Client** (`client/.env.local`):
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:5000
   ```

4. **Seed the database** (optional)
   ```bash
   cd server
   npm run seed
   ```

5. **Start the development servers**

   **Terminal 1 - Backend**:
   ```bash
   cd server
   npm run dev
   ```

   **Terminal 2 - Frontend**:
   ```bash
   cd client
   npm run dev
   ```

6. **Open the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

## 📧 Email Invitation Setup

The email invitation system is fully implemented and ready to use. Follow these steps:

### Quick Setup (5 minutes)

1. **Choose an email provider**:
   - **Gmail** (Development) - Free, 500 emails/day
   - **Ethereal** (Testing) - Fake emails, view on website
   - **SendGrid** (Production) - 100 free emails/day
   - **AWS SES** (Enterprise) - 200 free emails/day

2. **Configure Gmail** (Recommended for development):
   ```bash
   # 1. Enable 2FA on your Google account
   # 2. Generate App Password (Google Account → Security → App Passwords)
   # 3. Add to server/.env:
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=xxxx-xxxx-xxxx-xxxx  # Your 16-char app password
   ```

3. **Test the connection**:
   ```bash
   cd server
   npm run dev
   # Look for: ✅ Email service ready!
   ```

4. **Start inviting**:
   - Login as a manager
   - Create a project
   - Add email addresses
   - Invitations sent automatically!

📖 **Full Guide**: See [QUICK_START_INVITATIONS.md](./QUICK_START_INVITATIONS.md) for detailed instructions.

## 📁 Project Structure

```
epoch/
├── client/                 # Next.js frontend
│   ├── src/
│   │   ├── app/           # App router pages
│   │   │   ├── (auth)/    # Authentication pages
│   │   │   ├── (member)/  # Member dashboard
│   │   │   ├── (manager)/ # Manager dashboard
│   │   │   ├── (admin)/   # Admin dashboard
│   │   │   └── accept-invitation/  # NEW: Invitation acceptance
│   │   ├── components/    # Reusable components
│   │   │   ├── cards/     # Card components
│   │   │   ├── layout/    # Layout components
│   │   │   └── ui/        # shadcn/ui components
│   │   ├── stores/        # Zustand state management
│   │   ├── lib/           # Utilities and API client
│   │   └── types/         # TypeScript types
│   └── public/            # Static assets
│
├── server/                # Express backend
│   └── src/
│       ├── app/
│       │   ├── controllers/     # Request handlers
│       │   │   └── invitation.controller.ts  # NEW
│       │   ├── routes/          # API routes
│       │   │   └── invitation.routes.ts      # NEW
│       │   ├── middlewares/     # Express middleware
│       │   ├── utils/           # Utility functions
│       │   │   └── email.util.ts             # NEW
│       │   └── validators/      # Input validation
│       ├── infrastructure/
│       │   └── database/
│       │       └── models/      # Mongoose models
│       │           └── invitation.model.ts   # NEW
│       ├── seed/                # Database seeding
│       └── server.ts            # Express app setup
│
├── INVITATION_SYSTEM.md         # NEW: Complete invitation docs
├── QUICK_START_INVITATIONS.md   # NEW: 5-minute setup guide
├── SYSTEM_DIAGRAMS.md           # NEW: Architecture diagrams
├── IMPLEMENTATION_SUMMARY.md    # NEW: What was built
├── CHECKLIST.md                 # NEW: Implementation checklist
└── README.md                    # This file
```

## 🎯 User Roles

### Admin
- Manage all users, projects, and teams
- View system-wide analytics
- Configure system settings

### Manager
- Create and manage projects
- **Invite team members via email** 🆕
- Assign tasks to team members
- View project analytics
- Manage team members

### Member
- View assigned projects
- Manage assigned tasks
- Collaborate with team members
- Update task status
- Add comments

## 🔐 Authentication

The system uses JWT-based authentication:

1. User logs in with email and password
2. Server validates credentials
3. JWT token issued and stored in localStorage
4. Token included in API requests via Authorization header
5. Protected routes verify token with authMiddleware

## 📊 Key Features Deep Dive

### Email Invitation System

Complete, production-ready invitation system with:

- **Smart Detection**: Automatically adds existing users, invites new ones
- **Security**: Cryptographically secure tokens with 7-day expiration
- **Professional Emails**: Beautiful HTML templates
- **Status Tracking**: Monitor pending/accepted/expired invitations
- **Bulk Operations**: Invite multiple users at once
- **Email Providers**: Support for Gmail, SendGrid, AWS SES, Ethereal

📖 **Documentation**: [INVITATION_SYSTEM.md](./INVITATION_SYSTEM.md)

### Project Management

- Create projects with name, description, and deadline
- Assign team members (existing users or via email)
- Track project status (active, completed, archived)
- View project analytics (tasks, completion rate, team size)

### Task Management

- Kanban board with drag-and-drop
- Task statuses: To Do, In Progress, In Review, Done
- Task priorities: Low, Medium, High, Urgent
- Task assignments and due dates
- Comments and collaboration

### Dashboard Analytics

- Project overview statistics
- Task completion rates
- Team performance metrics
- Recent activity feed

## 🧪 Testing

### Backend Testing
```bash
cd server
npm test
```

### Frontend Testing
```bash
cd client
npm test
```

### Email Testing
Use Ethereal for testing without sending real emails:
```env
SMTP_HOST=smtp.ethereal.email
SMTP_PORT=587
SMTP_USER=provided-by-ethereal
SMTP_PASS=provided-by-ethereal
```

Visit https://ethereal.email to view sent emails.

## 🚢 Deployment

### Production Checklist

- [ ] Configure production email service (SendGrid/AWS SES)
- [ ] Set up production database (MongoDB Atlas)
- [ ] Configure environment variables
- [ ] Set up domain and SSL
- [ ] Enable CORS for production domain
- [ ] Configure rate limiting
- [ ] Set up monitoring and logging
- [ ] Test email delivery
- [ ] Run security audit
- [ ] Set up backups

📖 **Full Checklist**: [CHECKLIST.md](./CHECKLIST.md)

### Recommended Platforms

- **Frontend**: Vercel, Netlify
- **Backend**: Railway, Render, Fly.io
- **Database**: MongoDB Atlas
- **Email**: SendGrid (recommended), AWS SES

## 📝 API Documentation

### Base URL
```
http://localhost:5000/api
```

### Endpoints

#### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login user
- `GET /auth/me` - Get current user
- `POST /auth/forgot-password` - Trigger password reset OTP
- `POST /auth/reset-password` - Reset password confirming OTP
- `POST /auth/otp-login/send` - Request magic login code
- `POST /auth/otp-login/verify` - Verify magic code & login
- `GET /auth/manager/:managerId/analytics` - Get manager analytics

#### Admin 🆕
- `GET /admin/metrics` - Get system-wide platform statistics
- `GET /admin/projects` - Get all global projects
- `GET /admin/tasks` - Get all global tasks
- `DELETE /admin/users/:id` - Terminate a user account

#### Projects
- `GET /projects` - Get all projects
- `GET /projects/:id` - Get project by ID
- `POST /projects` - Create project
- `PUT /projects/:id` - Update project
- `DELETE /projects/:id` - Delete project
- `GET /projects/manager/:managerId` - Get manager's projects
- `GET /projects/member/:userId` - Get member's projects

#### Tasks
- `GET /tasks` - Get all tasks
- `GET /tasks/:id` - Get task by ID
- `POST /tasks` - Create task
- `PUT /tasks/:id` - Update task
- `DELETE /tasks/:id` - Delete task
- `GET /tasks/project/:projectId` - Get project tasks

#### Invitations 🆕
- `POST /invitations/send` - Send invitations
- `GET /invitations/token/:token` - Get invitation by token
- `POST /invitations/accept` - Accept invitation
- `GET /invitations/project/:projectId` - Get project invitations
- `DELETE /invitations/:invitationId` - Cancel invitation

📖 **Full API Docs**: [INVITATION_SYSTEM.md](./INVITATION_SYSTEM.md#-api-endpoints)

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

### Common Issues

**Email not sending?**
- Check SMTP credentials in `.env`
- Verify email service connection
- Check spam folder
- See [EMAIL_SETUP.md](./server/EMAIL_SETUP.md)

**Can't accept invitation?**
- Verify email matches invitation
- Check token hasn't expired
- Ensure logged in with correct account

**Database connection failed?**
- Check MongoDB is running
- Verify connection string in `.env`
- Check network access (MongoDB Atlas)

### Documentation

- **Quick Start**: [QUICK_START_INVITATIONS.md](./QUICK_START_INVITATIONS.md)
- **Full Docs**: [INVITATION_SYSTEM.md](./INVITATION_SYSTEM.md)
- **Troubleshooting**: See each doc's troubleshooting section

### Contact

For issues and questions:
1. Check the documentation
2. Search existing issues
3. Create a new issue with details


## 📈 Roadmap

### Current (v1.0)
- [x] User authentication
- [x] Project management
- [x] Task management (Kanban)
- [x] Team collaboration
- [x] Email invitations
- [x] Dashboard analytics

### Upcoming (v1.1)
- [ ] Real-time notifications (Socket.io)
- [ ] File attachments
- [ ] Advanced filtering
- [ ] Custom project templates
- [ ] Time tracking

### Future (v2.0)
- [ ] Mobile app
- [ ] Calendar integration
- [ ] Gantt charts
- [ ] Resource management
- [ ] Advanced reporting

---

**Built with ❤️ using Next.js, Express, and MongoDB**

**Status**: ✅ Production Ready | 🔥 Email Invitations Live | 📚 Fully Documented
