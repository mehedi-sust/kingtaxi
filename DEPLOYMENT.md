# Vercel Deployment Guide

## Prisma Build Issue Fix

The main issue with Vercel deployment is that Prisma Client needs to be generated during the build process. This has been fixed with a comprehensive solution:

### 1. Updated package.json scripts
- `build`: `node build.js` (custom build script)
- `build:next`: `next build --turbopack`
- `postinstall`: `prisma generate`

### 2. Created custom build.js script
A robust build script that:
- Generates Prisma Client explicitly
- Builds Next.js application
- Provides detailed logging
- Handles errors gracefully

### 3. Updated Prisma schema
```prisma
generator client {
  provider = "prisma-client-js"
  output   = "../node_modules/.prisma/client"
  engineType = "library"
}
```

### 4. Created vercel.json configuration
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
      "PRISMA_GENERATE_DATAPROXY": "true",
      "PRISMA_CLI_BINARY_TARGETS": "native,rhel-openssl-1.0.x"
    }
  },
  "env": {
    "DATABASE_URL": "@database_url"
  }
}
```

### 5. Updated next.config.ts
```typescript
const nextConfig: NextConfig = {
  serverExternalPackages: ['@prisma/client'],
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals.push('@prisma/client');
    }
    return config;
  },
};
```

### 3. Environment Variables Setup

**IMPORTANT**: The `vercel.json` no longer references environment variables. You must set them up manually in your Vercel dashboard.

In your Vercel dashboard, add these environment variables:

1. **DATABASE_URL**: Your PostgreSQL connection string
   - Example: `postgresql://username:password@host:port/database_name`
   - **Required**: Check all environments (Production, Preview, Development)

2. **NEXTAUTH_SECRET**: A random secret key for NextAuth
   - Generate with: `openssl rand -base64 32`
   - **Optional**: Check all environments

3. **NEXTAUTH_URL**: Your Vercel deployment URL
   - Example: `https://your-app-name.vercel.app`
   - **Optional**: Check Production only

**Setup Steps:**
1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add each variable with the correct values
3. Make sure to check the appropriate environment boxes
4. Redeploy your application

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
