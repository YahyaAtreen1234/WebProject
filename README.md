# Mineral Gallery - Premium E-Commerce Platform

A comprehensive, production-ready e-commerce platform for luxury minerals and crystals. Built with modern technologies, best practices, and enterprise-grade features.

**[Live Demo](#)** | **[Documentation](#documentation)** | **[Contributing](#contributing)**

---

## ✨ Key Features

### Shopping Experience
- 🛍️ **Full E-Commerce** - Browse, search, filter, and purchase products
- 💝 **Wishlist** - Save favorite products for later
- 🛒 **Smart Cart** - Add/remove items, apply discount codes
- ⭐ **Product Reviews** - Read and write detailed reviews with ratings
- 🖼️ **Image Gallery** - High-quality product images with zoom and thumbnails

### Checkout & Payment
- 💳 **Stripe Integration** - Secure credit card processing
- 🛡️ **PCI Compliant** - Secure payment handling
- 💰 **Discount Codes** - Percentage, fixed, and free shipping discounts
- 📮 **Address Management** - Save multiple delivery addresses
- 🧾 **Order History** - View all past orders

### Shipping & Delivery
- 📦 **Multiple Carriers** - FedEx, UPS, DHL integration
- 🚚 **Real-Time Tracking** - Live updates with map view
- 📍 **Estimated Delivery** - Calculated delivery windows
- 🔄 **Returns & Refunds** - Easy return process with tracking

### User Management
- 👤 **User Accounts** - Registration and profile management
- 🔐 **Secure Auth** - JWT tokens with bcryptjs hashing
- 📧 **Email Verification** - Confirm email addresses
- 🔑 **Password Reset** - Secure password recovery

### Admin Features
- 👑 **Admin Dashboard** - Complete site management
- 🛠️ **RBAC** - Role-based access (Admin, Manager, Staff, Viewer)
- 📊 **Analytics** - Revenue, orders, customer metrics
- 👥 **User Management** - Create, edit, manage users
- 📦 **Product Management** - Add, edit, remove products with images
- 📈 **Reports** - Sales trends and performance data
- 💬 **Support Tickets** - Customer service integration

### Advanced Features
- 🌐 **Multi-Currency Support** - Ready for internationalization
- 📧 **Email Campaigns** - Newsletter and promotional emails
- 🎁 **Custom Orders** - Special requests and bulk orders
- 💡 **Product Comparison** - Compare features side-by-side
- 🏆 **Money-Back Guarantee** - Configurable guarantee policies
- 🔍 **SEO Optimized** - Sitemap, meta tags, structured data
- ⚡ **High Performance** - Fast load times, optimized queries

---

## 🚀 Tech Stack

| Category | Technologies |
|----------|---------------|
| **Frontend** | Next.js 14, React 18, TypeScript, Tailwind CSS |
| **Backend** | Next.js API Routes, Node.js |
| **Database** | Prisma ORM, PostgreSQL (prod), SQLite (dev) |
| **Auth** | JWT, bcryptjs |
| **Payments** | Stripe API |
| **Email** | Nodemailer, Gmail/SendGrid SMTP |
| **Storage** | Vercel Blob |
| **Hosting** | Vercel |
| **Validation** | Zod |
| **Monitoring** | Vercel Analytics |

---

## 📋 Documentation

### Getting Started
- **[Local Setup Guide](./docs/SETUP.md)** - Install and run locally
- **[Environment Variables](./docs/ENVIRONMENT.md)** - Configure secrets and keys
- **[Quick Start](./docs/SETUP.md#step-5-start-development-server)** - Running in 5 minutes

### Development
- **[API Documentation](./docs/API.md)** - Complete API endpoint reference
- **[Validation Guide](./docs/VALIDATION_GUIDE.md)** - Input validation and error handling
- **[API Migration Guide](./docs/API_MIGRATION_GUIDE.md)** - Refactoring with RBAC
- **[Architecture](./docs/ARCHITECTURE.md)** - Project structure and design patterns

### Deployment
- **[Deployment Guide](./docs/DEPLOYMENT.md)** - Deploy to production
- **[Vercel Setup](./docs/DEPLOYMENT.md#step-1-prepare-production-environment)** - Production configuration
- **[GitHub Actions](./docs/DEPLOYMENT.md#step-3-configure-github-actions)** - CI/CD pipelines

### User Guides
- **[Features Guide](./docs/FEATURES.md)** - Feature walkthroughs
- **[RBAC System](./docs/RBAC.md)** - Role management
- **[Troubleshooting](./docs/TROUBLESHOOTING.md)** - Common issues and solutions

---

## 🏃 Quick Start

### Prerequisites
- **Node.js** 18+
- **npm** or **yarn**
- **Git**

### Installation

```bash
# 1. Clone repository
git clone https://github.com/YahyaAtreen1234/WebProject.git
cd WebProject

# 2. Install dependencies
npm install

# 3. Configure environment
cp .env.example .env.local
# Edit .env.local with your values (Stripe keys, database URL, etc.)

# 4. Setup database
npm run prisma:generate
npx prisma db push
npm run prisma:seed  # (Optional) Load sample data

# 5. Start dev server
npm run dev
```

Open **[http://localhost:3000](http://localhost:3000)** 🎉

### Default Admin Login
- **Email:** `admin@minerals.local`
- **Password:** `admin123`
- **URL:** [http://localhost:3000/admin](http://localhost:3000/admin)

---

## 📂 Project Structure

```
src/
├── app/                    # Next.js app router
│   ├── api/               # API routes
│   ├── admin/             # Admin pages
│   ├── user/              # User pages
│   └── page.tsx           # Home page
├── components/            # Reusable React components
├── lib/                   # Utility functions and helpers
│   ├── auth.ts           # Authentication utilities
│   ├── db.ts             # Database client
│   ├── schemas.ts        # Zod validation schemas
│   ├── rbac.ts           # Role-based access control
│   └── middlewares.ts    # API middlewares
├── context/              # React Context providers
└── styles/               # Global styles
prisma/                   # Database schema
docs/                     # Documentation
public/                   # Static assets
```

---

## 🔒 Security Features

✅ **Authentication**
- JWT tokens with expiration
- Secure password hashing (bcryptjs)
- Email verification
- Password reset tokens

✅ **Authorization**
- Role-based access control (RBAC)
- Permission checking on API routes
- Admin-only endpoints

✅ **Data Protection**
- Environment variable secrets
- Sensitive data sanitization
- SQL injection prevention (Prisma)
- XSS protection (React escaping)

✅ **Payment Security**
- Stripe integration (PCI compliant)
- No raw card storage
- Webhook verification

---

## 🧪 Testing & Quality

### Code Quality
```bash
npm run lint        # Run ESLint
npx tsc --noEmit  # Type checking
npm run build      # Production build
```

### Testing
```bash
npm test           # Run tests
npm test -- --coverage  # With coverage report
```

### Pre-Commit Checks
- TypeScript type checking
- ESLint validation
- Build verification

---

## 🚀 Deployment

### One-Click Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FYahyaAtreen1234%2FWebProject)

### Manual Deployment

See [Deployment Guide](./docs/DEPLOYMENT.md) for:
- Setting up PostgreSQL
- Configuring environment variables
- Connecting GitHub
- Configuring CI/CD
- Custom domain setup

---

## 📊 API Overview

### Public Endpoints
- `GET /api/products` - List products
- `POST /api/orders` - Create order
- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - User login

### Protected Endpoints (Authentication Required)
- `POST /api/products/:id/reviews` - Create review
- `GET /user/profile` - Get user profile
- `POST /user/addresses` - Add address

### Admin Endpoints
- `POST /api/admin/products` - Create product
- `PUT /api/admin/orders/:id` - Update order
- `GET /api/admin/analytics/dashboard` - Get analytics

See [API Documentation](./docs/API.md) for complete reference.

---

## 🛠️ Environment Setup

Copy `.env.example` to `.env.local` and fill in:

```env
# Database
DATABASE_URL="postgresql://user:pass@host/db"

# Authentication
JWT_SECRET="your-secret-key-32-chars-min"

# Stripe (production keys)
STRIPE_SECRET_KEY="sk_live_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_live_..."

# Email Service
SMTP_HOST="smtp.gmail.com"
SMTP_USER="your-email@gmail.com"
SMTP_PASS="app-password"

# Application
NEXT_PUBLIC_APP_URL="https://yourdomain.com"
BLOB_READ_WRITE_TOKEN="vercel-blob-token"
```

See [Environment Variables Reference](./docs/ENVIRONMENT.md) for details.

---

## 📚 Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Zod Documentation](https://zod.dev)
- [Stripe Documentation](https://stripe.com/docs)

---

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

See [Contributing Guide](#) for more details.

---

## 📝 License

This project is licensed under the MIT License - see [LICENSE](LICENSE) file for details.

---

## 🆘 Support

- 📖 Check [Documentation](./docs)
- 🐛 Report bugs on [GitHub Issues](#)
- 💬 Ask questions on [GitHub Discussions](#)
- 📧 Contact support via email

---

## 🎯 Roadmap

- [ ] Mobile app (React Native)
- [ ] Multi-language support
- [ ] Advanced inventory management
- [ ] Subscription products
- [ ] Recommendation engine
- [ ] Live chat support
- [ ] Augmented Reality preview

---

**Made with ❤️ by [Yahya Atreen](https://github.com/YahyaAtreen1234)**

### Build for Production

```bash
npm run build
npm start
```

## Design System

### Color Palette
- **Cream** (Off-white): `#fafaf8` - `#ede8e0`
- **Charcoal** (Deep black): `#0f0f0d` - `#3a3a38`
- **Accent Gold**: `#b8a882`
- **Accent Silver**: `#a9aca6`

### Typography
- **Headings**: Crimson Text (Serif) - elegant and luxurious
- **Body**: Inter (Sans-serif) - clean and readable

### Components
- **Navigation**: Sticky header with responsive mobile menu
- **Footer**: Minimal 4-column layout with brand, shop, gallery, and connect sections
- **Layout**: Full-height layout with flexible main content area

## Project Structure

```
src/
├── app/
│   ├── layout.tsx          # Root layout with navigation and footer
│   ├── globals.css         # Global styles and Tailwind directives
│   └── page.tsx            # Home page
├── components/
│   ├── Navigation.tsx      # Sticky navigation with mobile menu
│   └── Footer.tsx          # Minimal list footer
└── ...
```

## Customization

Edit `tailwind.config.ts` to modify:
- Colors and palette
- Font families
- Spacing and sizing
- Custom component classes

## License

Private project.
