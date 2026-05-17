# ELO Operations Center

Live WhatsApp AI support dashboard for Export Leftovers, powered by Alia bot.

## Setup

### 1. Install dependencies
```bash
npm install
```

### 2. Configure environment variables
Copy `.env.local` is already included — update the values:
```
GOOGLE_API_KEY=your_key_here
SHEET1_ID=your_sheet1_id
SHEET2_ID=your_sheet2_id
DASHBOARD_USER=elo-admin
DASHBOARD_PASS=your_password
NEXTAUTH_SECRET=random_secret_string
NEXTAUTH_URL=https://your-vercel-url.vercel.app
```

### 3. Run locally
```bash
npm run dev
```
Open http://localhost:3000

## Deploy to Vercel

1. Push to GitHub
2. Connect repo to Vercel
3. Add all environment variables in Vercel → Project Settings → Environment Variables
4. Deploy

## Pages
- `/overview` — Live KPIs, charts, activity feed
- `/messages` — All message analytics
- `/escalations` — Active escalation tracker
- `/cod` — COD verification log
- `/order-queue` — Order status queue
- `/refund-queue` — Refund request queue
- `/prequal` — Pre-qualification funnel
- `/dispatch` — Dispatch notifications
- `/security` — Jailbreak attempt log
