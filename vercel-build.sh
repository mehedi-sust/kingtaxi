#!/bin/bash

echo "🚀 Starting AGGRESSIVE Vercel build process..."

# Clean everything aggressively
echo "🧹 Aggressively cleaning build artifacts..."
rm -rf .next
rm -rf node_modules/.prisma
rm -rf node_modules/.cache
rm -rf node_modules/@prisma/client

# Force reinstall Prisma
echo "📦 Force reinstalling Prisma..."
npm install @prisma/client@latest prisma@latest --force

# Generate Prisma Client multiple times
echo "📦 Force generating Prisma Client (attempt 1)..."
npx prisma generate --no-engine

echo "📦 Force generating Prisma Client (attempt 2)..."
npx prisma generate

echo "📦 Force generating Prisma Client (attempt 3)..."
npx prisma generate --force

# Verify Prisma Client was generated
if [ ! -d "node_modules/.prisma/client" ]; then
  echo "❌ Prisma Client generation failed after multiple attempts"
  exit 1
fi

echo "✅ Prisma Client generated successfully"

# Build Next.js application
echo "🏗️ Building Next.js application..."
npm run build:next

echo "🎉 AGGRESSIVE Vercel build completed successfully!"
