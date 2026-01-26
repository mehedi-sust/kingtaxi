#!/bin/bash
echo "🚀 Starting Vercel build process..."
echo "🧹 Cleaning build artifacts..."
rm -rf .next
rm -rf node_modules/.cache
echo "🏗️ Building Next.js application..."
npm run build:next
echo "🎉 Vercel build completed successfully!"
