# Database Setup Guide

## 🗄️ Online Database Configuration

### 1. Create .env File
Create a `.env` file in the root directory with your online database URL:

```env
# Database Configuration
DATABASE_URL="postgresql://username:password@host:port/database_name"

# Next.js Configuration
NEXTAUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"
```

### 2. Popular Online Database Providers

#### Supabase (Recommended)
```env
DATABASE_URL="postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres"
```

#### Railway
```env
DATABASE_URL="postgresql://postgres:[password]@[host]:[port]/[database]"
```

#### Neon
```env
DATABASE_URL="postgresql://[user]:[password]@[host]/[database]?sslmode=require"
```

#### PlanetScale (MySQL)
```env
DATABASE_URL="mysql://[user]:[password]@[host]/[database]?sslaccept=strict"
```

### 3. Database Setup Commands

#### Generate Prisma Client
```bash
npm run db:generate
```

#### Push Schema to Database
```bash
npm run db:push
```

#### Run Migrations (Alternative to push)
```bash
npm run db:migrate
```

#### Seed Database with Sample Data
```bash
npm run db:seed
```

#### Reset Database (if needed)
```bash
npm run db:reset
```

#### Open Prisma Studio (Database GUI)
```bash
npm run db:studio
```

### 4. Default Admin User

After running the seed command, you'll have:
- **Email**: admin@kingtaxi.co.uk
- **Password**: Admin123
- **Role**: Admin (full access to admin dashboard)

### 5. Database Tables Created

- **users**: User accounts and registrations
- **driver_applications**: Driver job applications
- **offers**: Promotional offers and discounts
- **car_images**: Fleet vehicle images
- **reviews**: Customer reviews and testimonials

### 6. Sample Data Included

- 1 Admin user
- 3 Sample offers
- 5 Car images
- 5 Customer reviews

### 7. Development Server

Start the development server:
```bash
npm run dev
```

The application will run on http://localhost:3000

## 🔧 Troubleshooting

### Database Connection Issues
1. Verify your DATABASE_URL is correct
2. Check if your database provider allows connections from your IP
3. Ensure SSL is properly configured if required

### Migration Issues
1. Run `npm run db:reset` to start fresh
2. Use `npm run db:push` for development (faster)
3. Use `npm run db:migrate` for production (safer)

### Admin Login Issues
1. Ensure the seed script ran successfully
2. Check if the admin user exists in the database
3. Verify the email format: admin@kingtaxi.co.uk
