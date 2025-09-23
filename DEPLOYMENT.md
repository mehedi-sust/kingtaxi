# Vercel Deployment Guide

## Prisma Build Issue Fix

The main issue with Vercel deployment is that Prisma Client needs to be generated during the build process. This has been fixed with the following changes:

### 1. Updated package.json scripts
- `build`: `prisma generate && next build --turbopack`
- `postinstall`: `prisma generate`

### 2. Created vercel.json configuration
```json
{
  "buildCommand": "npm run build",
  "installCommand": "npm install",
  "framework": "nextjs",
  "functions": {
    "app/api/**/*.ts": {
      "runtime": "nodejs18.x"
    }
  },
  "build": {
    "env": {
      "PRISMA_GENERATE_DATAPROXY": "true"
    }
  },
  "env": {
    "DATABASE_URL": "@database_url"
  }
}
```

### 3. Environment Variables Setup

In your Vercel dashboard, add these environment variables:

1. **DATABASE_URL**: Your PostgreSQL connection string
   - Example: `postgresql://username:password@host:port/database_name`

2. **NEXTAUTH_SECRET**: A random secret key for NextAuth
   - Generate with: `openssl rand -base64 32`

3. **NEXTAUTH_URL**: Your Vercel deployment URL
   - Example: `https://your-app-name.vercel.app`

### 4. Database Setup

Before deploying, make sure your database is set up:

1. Create a PostgreSQL database (recommended: Supabase, Neon, or Railway)
2. Run the following commands locally to set up the database:
   ```bash
   npm run db:push
   npm run db:seed
   ```

### 5. Deployment Steps

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add the environment variables in Vercel dashboard
4. Deploy

The build should now work correctly with Prisma Client generation.

## Troubleshooting

If you still encounter issues:

1. Check that all environment variables are set correctly
2. Ensure your database is accessible from Vercel
3. Check the build logs for any Prisma-related errors
4. Make sure your database schema is up to date

## Files Modified

- `package.json`: Updated build and postinstall scripts
- `vercel.json`: Added Vercel-specific configuration
- `.vercelignore`: Excluded unnecessary files from deployment
- `build.js`: Alternative build script (optional)
