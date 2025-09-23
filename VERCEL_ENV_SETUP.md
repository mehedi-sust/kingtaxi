# 🔧 Vercel Environment Variables Setup Guide

## The Issue
Vercel deployment failed with:
```
Environment Variable "DATABASE_URL" references Secret "database_url", which does not exist.
```

## The Fix
I've removed the invalid environment variable reference from `vercel.json`. Now you need to set up environment variables directly in your Vercel dashboard.

## Step-by-Step Setup

### 1. Go to Your Vercel Project Dashboard
1. Log into [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project
3. Go to **Settings** tab
4. Click on **Environment Variables** in the left sidebar

### 2. Add Required Environment Variables

Add these environment variables:

#### **DATABASE_URL** (Required)
- **Name**: `DATABASE_URL`
- **Value**: Your PostgreSQL connection string
- **Example**: `postgresql://username:password@host:port/database_name`
- **Environments**: Check all boxes (Production, Preview, Development)

#### **NEXTAUTH_SECRET** (Optional but Recommended)
- **Name**: `NEXTAUTH_SECRET`
- **Value**: A random secret key (generate with: `openssl rand -base64 32`)
- **Environments**: Check all boxes

#### **NEXTAUTH_URL** (Optional)
- **Name**: `NEXTAUTH_URL`
- **Value**: Your Vercel deployment URL (e.g., `https://your-app-name.vercel.app`)
- **Environments**: Check Production only

### 3. Database Options

#### Option A: Supabase (Recommended)
1. Go to [Supabase](https://supabase.com)
2. Create a new project
3. Go to **Settings** → **Database**
4. Copy the connection string
5. Use it as your `DATABASE_URL`

#### Option B: Neon
1. Go to [Neon](https://neon.tech)
2. Create a new database
3. Copy the connection string
4. Use it as your `DATABASE_URL`

#### Option C: Railway
1. Go to [Railway](https://railway.app)
2. Create a new PostgreSQL database
3. Copy the connection string
4. Use it as your `DATABASE_URL`

### 4. Deploy Your Database Schema

After setting up the database, you need to run the Prisma migrations:

#### Option A: Using Vercel CLI
```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Link your project
vercel link

# Push database schema
vercel env pull .env.local
npx prisma db push
npx prisma db seed
```

#### Option B: Using Supabase Dashboard
1. Go to your Supabase project
2. Click on **SQL Editor**
3. Run the migration SQL from `prisma/migrations/`

### 5. Redeploy

After setting up environment variables:
1. Go to **Deployments** tab in Vercel
2. Click **Redeploy** on your latest deployment
3. Or push a new commit to trigger automatic deployment

## Environment Variables Summary

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `DATABASE_URL` | ✅ Yes | PostgreSQL connection string | `postgresql://user:pass@host:5432/db` |
| `NEXTAUTH_SECRET` | ⚠️ Optional | Secret key for NextAuth | `random-base64-string` |
| `NEXTAUTH_URL` | ⚠️ Optional | Your app URL | `https://your-app.vercel.app` |

## Troubleshooting

### If deployment still fails:
1. Check that `DATABASE_URL` is correctly formatted
2. Ensure your database is accessible from the internet
3. Verify that the database exists and is running
4. Check Vercel build logs for specific errors

### If database connection fails:
1. Make sure your database allows connections from Vercel's IP ranges
2. Check if your database requires SSL (add `?sslmode=require` to connection string)
3. Verify username, password, host, and port are correct

## Next Steps

1. **Set up environment variables** in Vercel dashboard
2. **Create and configure your database**
3. **Redeploy your application**
4. **Test the deployment** by visiting your Vercel URL

The deployment should now work correctly! 🎉
