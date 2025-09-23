#!/bin/bash

echo "🚀 Starting Vercel build process..."

# Clean any existing Prisma Client
echo "🧹 Cleaning existing Prisma Client..."
rm -rf node_modules/.prisma/client

# Generate Prisma Client
echo "📦 Generating Prisma Client..."
npx prisma generate --no-engine

# Verify Prisma Client was generated
if [ ! -d "node_modules/.prisma/client" ]; then
  echo "❌ Prisma Client generation failed"
  exit 1
fi

echo "✅ Prisma Client generated successfully"

# Build Next.js application
echo "🏗️ Building Next.js application..."
npm run build:next

echo "🎉 Vercel build completed successfully!"
