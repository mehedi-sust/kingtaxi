#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 King Taxi Database Setup');
console.log('============================\n');

// Check if .env file exists
const envPath = path.join(__dirname, '.env');
if (!fs.existsSync(envPath)) {
  console.log('❌ .env file not found!');
  console.log('📝 Please create a .env file with your DATABASE_URL');
  console.log('📖 See DATABASE_SETUP.md for detailed instructions\n');
  
  // Create example .env content
  const exampleEnv = `# Database Configuration
DATABASE_URL="postgresql://username:password@host:port/database_name"

# Next.js Configuration
NEXTAUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"`;
  
  console.log('💡 Example .env content:');
  console.log('------------------------');
  console.log(exampleEnv);
  console.log('\n');
  process.exit(1);
}

console.log('✅ .env file found');

try {
  console.log('\n🔄 Generating Prisma client...');
  execSync('npm run db:generate', { stdio: 'inherit' });
  
  console.log('\n🔄 Pushing schema to database...');
  execSync('npm run db:push', { stdio: 'inherit' });
  
  console.log('\n🔄 Seeding database with sample data...');
  execSync('npm run db:seed', { stdio: 'inherit' });
  
  console.log('\n🎉 Database setup completed successfully!');
  console.log('\n📋 What was created:');
  console.log('   • Admin user: admin@kingtaxi.co.uk');
  console.log('   • Sample offers and reviews');
  console.log('   • Car images and fleet data');
  console.log('\n🚀 Start the development server:');
  console.log('   npm run dev');
  console.log('\n🌐 Access the application at: http://localhost:3000');
  
} catch (error) {
  console.log('\n❌ Database setup failed!');
  console.log('🔍 Error details:', error.message);
  console.log('\n💡 Troubleshooting:');
  console.log('   1. Check your DATABASE_URL in .env file');
  console.log('   2. Ensure your database is accessible');
  console.log('   3. Verify database permissions');
  console.log('   4. See DATABASE_SETUP.md for more help');
}
