#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Starting aggressive Vercel build process...');

try {
  // Step 1: Clean everything
  console.log('🧹 Cleaning build artifacts...');
  const pathsToClean = [
    '.next',
    'node_modules/.prisma',
    'node_modules/.cache'
  ];
  
  pathsToClean.forEach(cleanPath => {
    if (fs.existsSync(cleanPath)) {
      fs.rmSync(cleanPath, { recursive: true, force: true });
      console.log(`✅ Cleaned ${cleanPath}`);
    }
  });

  // Step 2: Force Prisma Client generation multiple times
  console.log('📦 Force generating Prisma Client...');
  
  // First generation
  execSync('npx prisma generate --no-engine', { 
    stdio: 'inherit',
    env: { ...process.env, PRISMA_GENERATE_DATAPROXY: 'true' }
  });
  console.log('✅ First Prisma Client generation completed');

  // Second generation to ensure it's fresh
  execSync('npx prisma generate', { stdio: 'inherit' });
  console.log('✅ Second Prisma Client generation completed');

  // Step 3: Verify Prisma Client exists
  const prismaClientPath = path.join(__dirname, 'node_modules', '.prisma', 'client');
  if (!fs.existsSync(prismaClientPath)) {
    throw new Error('Prisma Client was not generated properly');
  }
  console.log('✅ Prisma Client verification passed');

  // Step 4: Build Next.js application (without Turbopack)
  console.log('🏗️ Building Next.js application...');
  execSync('next build', { stdio: 'inherit' });
  console.log('✅ Next.js build completed successfully');

  console.log('🎉 Aggressive Vercel build process completed successfully!');
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}
