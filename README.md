# King Taxi - Premium Taxi Service Website

A modern, responsive web application for King Taxi, a UK-based premium taxi service company. Built with Next.js 15, TypeScript, Tailwind CSS, and PostgreSQL.

## Features

### 🚗 Core Features
- **Fast Loading**: Optimized for speed with mobile-first design
- **Animated Navigation**: Red car animation with spinning wheels
- **Responsive Design**: Works seamlessly on mobile, tablet, and desktop
- **Modern UI**: Clean, professional design with smooth animations

### 📱 Pages & Functionality
- **Home Page**: Hero section, services, taxi fare calculator, car gallery preview, customer reviews
- **About Us**: Company story, values, driver information, and team benefits
- **Picture Gallery**: Interactive vehicle gallery with filtering and modal views
- **Booking System**: Multi-step booking process with fare estimation
- **Authentication**: User registration and sign-in system
- **Driver Application**: Comprehensive application form for potential drivers

### 🎨 Design Features
- **Framer Motion Animations**: Smooth scroll animations and interactive elements
- **Custom Car Animation**: Animated red taxi in navigation bar
- **Responsive Layout**: Mobile-first design approach
- **Consistent Theme**: Persistent styling across page refreshes
- **Accessibility**: Focus states and keyboard navigation support

### 🛠 Technical Stack
- **Frontend**: Next.js 15, TypeScript, Tailwind CSS
- **Animations**: Framer Motion
- **Backend**: FastAPI REST API (https://kingtaxi-webapp-backend.onrender.com)
- **Icons**: Lucide React
- **Deployment**: Docker support included

## Getting Started

### Prerequisites
- Node.js 18+ 
- Docker and Docker Compose
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd kingtaxi-webapp
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   Update the `.env` file with your database credentials.

4. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```
   Update the `.env` file with the FastAPI backend URL:
   ```
   NEXT_PUBLIC_API_URL=https://kingtaxi-webapp-backend.onrender.com
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Frontend Tests

From the project root, run one of the following commands:

Unit tests (Vitest):
```bash
npm run test
```

Run unit tests once:
```bash
npm run test:run
```

Unit test UI:
```bash
npm run test:ui
```

Unit test coverage:
```bash
npm run test:coverage
```

E2E tests (Playwright):
```bash
npm run test:e2e
```

E2E test UI:
```bash
npm run test:e2e:ui
```

E2E test report:
```bash
npm run test:e2e:report
```

### Database Setup

The application uses PostgreSQL 17 running in a Docker container. The database schema includes:

- **Users**: Customer registration and account management
- **Driver Applications**: Driver recruitment system  
- **Car Images**: Vehicle gallery management
- **Reviews**: Customer testimonials
- **Offers**: Promotional campaigns and discounts

### Project Structure

```
kingtaxi-webapp/
├── src/
│   ├── app/                 # Next.js app router pages
│   │   ├── about/          # About us page
│   │   ├── book/           # Booking system
│   │   ├── driver-application/ # Driver application form
│   │   ├── gallery/        # Vehicle gallery
│   │   ├── signin/         # User authentication
│   │   ├── signup/         # User registration
│   │   └── globals.css     # Global styles
│   ├── components/         # Reusable React components
│   │   ├── AnimatedCar.tsx # Navigation car animation
│   │   ├── CarGallery.tsx  # Vehicle showcase
│   │   ├── Footer.tsx      # Site footer
│   │   ├── Hero.tsx        # Homepage hero section
│   │   ├── Navbar.tsx      # Navigation component
│   │   ├── Reviews.tsx     # Customer testimonials
│   │   ├── Services.tsx    # Service information
│   │   └── TaxiFare.tsx    # Fare calculator
│   └── api.ts              # FastAPI client integration
├── .env.example            # Environment variables template
└── README.md              # This file
```

## Key Features Implementation

### 🚗 Animated Navigation
- Custom SVG car with spinning wheels
- Smooth animation across the navigation bar
- Pauses at logo position before continuing

### 📱 Mobile-First Design  
- Responsive breakpoints for all screen sizes
- Touch-friendly interactions
- Optimized for mobile performance

### 🎨 Interactive Elements
- Hover effects and transitions
- Scroll-triggered animations
- Interactive forms with validation
- Modal galleries with navigation

### 💼 Business Features
- Multi-step booking process
- Fare estimation calculator
- Driver recruitment system
- Admin dashboard ready architecture
- Customer review system

## Deployment

### Docker Deployment
```bash
# Build and start all services
docker-compose up --build

# Run in production mode
docker-compose -f docker-compose.prod.yml up
```

### Environment Variables
```env
DATABASE_URL="postgresql://kingtaxi:kingtaxi123@localhost:5432/kingtaxi_db"
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"
NODE_ENV="development"
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Performance Optimizations

- **Image Optimization**: Next.js automatic image optimization
- **Code Splitting**: Automatic route-based code splitting
- **Lazy Loading**: Components and images loaded on demand
- **Caching**: Efficient caching strategies
- **Minification**: CSS and JavaScript minification

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions:
- Email: support@kingtaxi.co.uk
- Phone: +44 123 456 7890

---

Built with ❤️ by the King Taxi development team

## Backend Integration

This application is designed to work with a FastAPI backend deployed at:
- **Production**: https://kingtaxi-webapp-backend.onrender.com
- **API Documentation**: https://kingtaxi-webapp-backend.onrender.com/docs

### API Endpoints Expected:
- `GET /fares/` - Get all taxi fares
- `GET /offers/` - Get promotional offers
- `GET /vehicles/` - Get vehicle fleet
- `GET /users/` - Get registered users
- `GET /drivers/` - Get driver applications
- `GET /stats/` - Get dashboard statistics

### Fallback Data
If the backend is unavailable, the application will use fallback data for development purposes. Check the browser console for API connection status.

### Testing Backend Connection
Open browser console and run:
```javascript
testBackend()
```

This will test all API endpoints and show their status.

## Troubleshooting

### Common Issues

1. **"Unexpected token '<', "<!DOCTYPE "... is not valid JSON"**
   - This means the API endpoint is returning HTML instead of JSON
   - Check if the backend is running and accessible
   - Verify the API endpoint URLs are correct

2. **"Failed to fetch" errors**
   - Check network connectivity
   - Verify CORS settings on the backend
   - Ensure the backend URL is correct in environment variables

3. **Build errors with Next.js 16**
   - Make sure you're using Turbopack configuration instead of webpack
   - Update all dependencies to latest versions

### Development Mode
The application includes fallback data for development when the backend is unavailable. This allows frontend development to continue even if the backend is down.
