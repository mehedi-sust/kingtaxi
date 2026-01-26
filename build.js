#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Starting King Taxi build process...');

try {
  // Step 1: Clean build artifacts
  console.log('🧹 Cleaning build artifacts...');
  const pathsToClean = [
    '.next',
    'node_modules/.cache'
  ];
  
  pathsToClean.forEach(cleanPath => {
    if (fs.existsSync(cleanPath)) {
      fs.rmSync(cleanPath, { recursive: true, force: true, maxRetries: 10, retryDelay: 100 });
      console.log(`✅ Cleaned ${cleanPath}`);
    }
  });

  // Step 2: Build Next.js application
  console.log('🏗️ Building Next.js application...');
  execSync('node --no-deprecation ./node_modules/next/dist/bin/next build', { stdio: 'inherit' });
  console.log('✅ Next.js build completed successfully');

  console.log('🎉 Build process completed successfully!');
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}
