# Local Development Setup Guide

This guide will walk you through setting up the Mineral Gallery project for local development.

## Prerequisites

- **Node.js 18+** - [Download](https://nodejs.org/)
- **npm or yarn** - Comes with Node.js
- **Git** - For version control
- **SQLite** - Automatically handled by Prisma (development only)

## Step 1: Clone the Repository

```bash
git clone https://github.com/YahyaAtreen1234/WebProject.git
cd WebProject
```

## Step 2: Install Dependencies

```bash
npm install
```

This installs all required packages listed in `package.json`.

## Step 3: Environment Configuration

### Create `.env.local`

Copy the environment template and fill in your development values:

```bash
cp .env.example .env.local
```

Edit `.env.local` and update these values:

```env
# Database (SQLite for development)
DATABASE_URL="file:./prisma/dev.db"

# JWT Secret (keep as is for development)
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"

# Admin credentials
ADMIN_EMAIL="admin@minerals.local"
ADMIN_PASSWORD="admin123"

# Stripe (test keys from dashboard.stripe.com)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_xxxxx"
STRIPE_SECRET_KEY="sk_test_xxxxx"
STRIPE_WEBHOOK_SECRET="whsec_test_xxxxx"

# Email (Gmail or another SMTP service)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"
SMTP_FROM="noreply@stonesland.com"

# App URL
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

## Step 4: Database Setup

### Generate Prisma Client

```bash
npm run prisma:generate
```

### Create the Database

```bash
npx prisma db push
```

This creates the SQLite database and applies all schema migrations.

### (Optional) Seed Sample Data

```bash
npx prisma db seed
```

This populates the database with sample products, users, and test data.

## Step 5: Start Development Server

```bash
npm run dev
```

The application will start at **http://localhost:3000**

You should see:
```
- ready started server on 0.0.0.0:3000, url: http://localhost:3000
```

## Step 6: Access the Application

### Homepage
- **URL:** http://localhost:3000
- Browse mineral products

### Shop
- **URL:** http://localhost:3000/shop
- View all products with filters

### Cart & Checkout
- **URL:** http://localhost:3000/cart
- Add products and checkout

### User Dashboard
- **URL:** http://localhost:3000/user/dashboard
- View orders and profile (requires login)

### Admin Dashboard
- **URL:** http://localhost:3000/admin
- Manage products, orders, users (admin only)
- **Login:** admin@minerals.local / admin123

## Common Commands

### Development
```bash
npm run dev          # Start development server
npm run lint         # Run ESLint
npm run build        # Build for production
npm run start        # Start production server
```

### Database
```bash
npm run prisma:generate              # Generate Prisma client
npm run prisma:migrate               # Create new migration
npx prisma db push                   # Apply schema changes
npx prisma studio                    # Open database UI
npx prisma seed                      # Seed sample data
```

### Cleanup
```bash
rm -rf .next         # Clear build cache
rm prisma/dev.db     # Delete development database
npm install          # Reinstall dependencies
```

## Troubleshooting

### Port 3000 Already in Use

If port 3000 is already in use:

```bash
# Find process using port 3000
lsof -i :3000

# Kill the process (macOS/Linux)
kill -9 <PID>

# Or use a different port
npm run dev -- -p 3001
```

### Database Issues

Clear and recreate the database:

```bash
rm prisma/dev.db
npx prisma db push
npx prisma seed  # optional
```

### Node Modules Issues

Reinstall dependencies:

```bash
rm -rf node_modules package-lock.json
npm install
```

### Environment Variables Not Loading

Make sure `.env.local` is in the project root and restart the dev server.

## Next Steps

- Read [ENVIRONMENT.md](./ENVIRONMENT.md) for detailed environment variable documentation
- Check [FEATURES.md](./FEATURES.md) for available features
- See [ARCHITECTURE.md](./ARCHITECTURE.md) for project structure
- Review API documentation at http://localhost:3000/api/docs (after Phase 6)

## Getting Help

- Check [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)
- Review error messages in the console
- Check database with: `npx prisma studio`
