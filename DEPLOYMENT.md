# Airbase Platform — Deployment Guide

## Prerequisites

1. **Supabase project** — [supabase.com](https://supabase.com)
2. **Clerk account** — [clerk.com](https://clerk.com)
3. **Vercel account** — [vercel.com](https://vercel.com)
4. **Google Cloud project** with Maps JavaScript API enabled

## Local Development

```bash
cp .env.example .env.local
# Fill in your credentials

npm install
npm run db:push     # Create DB schema in Supabase
npm run dev         # Start dev server
```

## Environment Variables

See `.env.example` for all required variables.

| Variable | Source |
|----------|--------|
| `DATABASE_URL` | Supabase project settings → Database → Connection string |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk dashboard → API Keys |
| `CLERK_SECRET_KEY` | Clerk dashboard → API Keys |
| `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | Google Cloud Console → Maps JavaScript API |
| `STRIPE_SECRET_KEY` | Stripe dashboard → Developers → API keys |

## Vercel Deployment

```bash
npm install -g vercel
vercel --prod
```

Or connect repo to Vercel via dashboard and set env vars there.

## Clerk Setup

1. Create new Clerk application
2. Set **Allowed redirect URLs** to `https://airbase.one`
3. Enable email + Google OAuth
4. Configure roles: `customer`, `operator`, `pilot`, `admin`
   - In Clerk dashboard: Roles → Create role for each

## Supabase Setup

1. Create new Supabase project
2. Copy connection string from Settings → Database
3. Run `npm run db:push` to create all tables
4. Enable Row-Level Security in Supabase dashboard
5. (Optional) Enable Supabase Realtime for flight tracking

## Domain Setup (airbase.one)

1. In Vercel: Project → Settings → Domains → Add `airbase.one`
2. In hosting.ch DNS: Add Vercel CNAME record
3. Vercel handles SSL automatically

## Database Migrations

```bash
npm run db:generate   # Generate migration files
npm run db:migrate    # Apply migrations
npm run db:studio     # Open Drizzle Studio (DB browser)
```
