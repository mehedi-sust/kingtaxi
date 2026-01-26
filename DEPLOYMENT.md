# Deployment Guide

## Architecture Update

**IMPORTANT**: This application has been migrated from Prisma/PostgreSQL to a FastAPI backend.

- **Backend API**: https://kingtaxi-webapp-backend.onrender.com
- **API Documentation**: https://kingtaxi-webapp-backend.onrender.com/docs
- **No database setup required** - all data is handled by the FastAPI backend

## Environment Variables

Set the following environment variable for deployment:

```bash
NEXT_PUBLIC_API_URL=https://kingtaxi-webapp-backend.onrender.com
```

## Vercel Deployment

1. **Connect your repository** to Vercel
2. **Set environment variables** in Vercel dashboard
3. **Deploy** - the build process is now simplified without Prisma dependencies

The build should work correctly as all Prisma dependencies have been removed.

## Local Development

1. Clone the repository
2. Install dependencies: `npm install`
3. Set environment variables in `.env`
4. Start development server: `npm run dev`

## Build Process

The build process has been simplified:
- No database migrations required
- No Prisma client generation needed
- Standard Next.js build process

All data operations are handled through the FastAPI backend via REST API calls.