# Hiring Platform MVP

A production-ready swipe-based hiring platform for full-time careers, built with Next.js, PostgreSQL, and Stripe.

## Features

### Candidate Features
- Email signup & verification
- Complete profile with education, internships, projects, skills
- Browse companies and job listings
- Swipe on opportunities (like Tinder)
- Message recruiters with 2-way consent model
- Profile visibility & privacy controls
- Premium subscription ($4.99/mo)

### Recruiter Features
- Company registration & verification
- Post unlimited job listings
- Auto-generated candidate pools
- Swipe through candidate profiles
- Save & review candidates
- Message candidates (2-way consent)
- Admin dashboard
- Pro subscription ($99/mo)

## Tech Stack

- **Frontend**: Next.js 14, React 18, Tailwind CSS, TypeScript
- **Backend**: Next.js API Routes, Node.js
- **Database**: PostgreSQL 15
- **Auth**: JWT + bcryptjs
- **Payments**: Stripe
- **Email**: SendGrid
- **ORM**: Prisma
- **Deployment**: Render.com, Docker

## Quick Start

### Prerequisites
- Node.js 20+
- PostgreSQL 15+
- npm or yarn

### Local Development

```bash
# Clone repository
git clone https://github.com/lucianbrn/hiring-platform-mvp.git
cd hiring-platform-mvp

# Install dependencies
npm install

# Create .env.local
cp .env.example .env.local

# Start PostgreSQL (if using Docker)
docker run -d --name postgres -e POSTGRES_PASSWORD=postgres -p 5432:5432 postgres:15

# Setup database
npx prisma migrate dev
npx prisma db seed

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Deploy to Render.com (Free)

1. Push this repo to GitHub
2. Go to [render.com](https://render.com)
3. Click "New +" → "Blueprint"
4. Connect your GitHub repo
5. Select this repository
6. Click "Deploy"

**That's it!** Your app will be live in 2-3 minutes.

## API Routes

### Authentication
- `POST /api/auth/register` - Create account
- `POST /api/auth/login` - Sign in
- `GET /api/auth/me` - Get current user

### Candidates
- `GET /api/candidates/profile` - Get candidate profile
- `PUT /api/candidates/profile` - Update profile

### Companies
- `GET /api/companies` - Get company info
- `POST /api/companies` - Create company
- `GET /api/jobs` - List jobs
- `POST /api/jobs` - Post job listing

### Discovery & Swiping
- `GET /api/swipe/discover` - Get discover cards
- `POST /api/swipe/action` - Swipe (like/pass)

### Messaging
- `GET /api/messaging/conversations` - List conversations
- `POST /api/messaging/send` - Send message

### Admin
- `GET /api/admin/users` - List users

## Database Schema

- `users` - User accounts (candidates & recruiters)
- `candidates` - Candidate profiles with education/skills
- `companies` - Company information
- `jobListings` - Job postings
- `candidatePools` - Auto-matched candidates per job
- `interactions` - Swipes (like/pass)
- `conversationThreads` - Message threads
- `messages` - Individual messages
- `verificationRecords` - Email/degree verification
- `blockMute` - User blocks/mutes
- `auditLogs` - Security audit trail

## Configuration

### Environment Variables

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/hiring_platform"

# Auth
JWT_SECRET="your-secret-key"
NEXTAUTH_SECRET="another-secret-key"
NEXTAUTH_URL="https://your-domain.com"

# Stripe (Optional)
NEXT_PUBLIC_STRIPE_PUBLIC_KEY="pk_test_..."
STRIPE_SECRET_KEY="sk_test_..."

# SendGrid (Optional)
SENDGRID_API_KEY="SG...."
```

## Key Flows

### Candidate Onboarding
1. Sign up with email
2. Verify email
3. Complete profile (education, internships, projects, skills)
4. Start discovering companies

### Recruiter Onboarding
1. Sign up with email
2. Create company profile
3. Post job listing
4. Auto-generated candidate pool
5. Start swiping candidates

### Messaging (2-Way Consent)
- Recruiter sends message → candidate gets notification
- Candidate replies → thread becomes 2-way active
- Either party can block/mute

## Matching Algorithm

Match score (0-1) based on:
- **Degree Match** (40%): Required degree vs candidate's degree
- **GPA** (20%): Minimum GPA requirement
- **Skills** (20%): Top skills from profile
- **Location** (20%): Preferred locations, willing to relocate, or remote

## Testing

```bash
# Run unit tests
npm run test

# Run E2E tests
npm run test:e2e

# Watch mode
npm run test:watch
```

## Deployment

### Docker
```bash
docker build -t hiring-platform .
docker run -p 3000:3000 -e DATABASE_URL="..." hiring-platform
```

### GitHub Actions (CI/CD)
Automatic deployment on push to main branch.

## Contributing

1. Fork repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## Roadmap

- [x] MVP (authentication, profiles, swiping, messaging)
- [ ] AI-generated summaries (Gemini/Claude API)
- [ ] WebSocket live messaging
- [ ] Advanced analytics dashboard
- [ ] Video interviews (Twilio)
- [ ] Skills assessments
- [ ] Mobile app (React Native)
- [ ] International expansion

## License

MIT

## Support

For questions or issues, open a GitHub issue or contact support@hiringplatform.com

## Authors

Built with ❤️ for making hiring less noisy and more intentional.