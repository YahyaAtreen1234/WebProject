# Project Architecture

Complete guide to the project structure, design patterns, and data flow.

## Directory Structure

```
mineral-gallery/
├── src/
│   ├── app/                    # Next.js App Router (pages & API)
│   │   ├── api/               # API routes (REST endpoints)
│   │   ├── admin/             # Admin dashboard pages
│   │   ├── user/              # User account pages
│   │   ├── shop/              # Shopping pages
│   │   ├── layout.tsx         # Root layout
│   │   ├── page.tsx           # Home page
│   │   └── globals.css        # Global styles
│   │
│   ├── components/            # Reusable React components
│   │   ├── ProductCard.tsx
│   │   ├── ProductReviewForm.tsx
│   │   ├── ProductReviewList.tsx
│   │   ├── StarRating.tsx
│   │   ├── ImageUploader.tsx
│   │   ├── ProductImageGallery.tsx
│   │   ├── Navigation.tsx
│   │   ├── Footer.tsx
│   │   └── ...
│   │
│   ├── lib/                   # Utility functions and helpers
│   │   ├── auth.ts           # JWT, password hashing
│   │   ├── db.ts             # Prisma client singleton
│   │   ├── stripe.ts         # Stripe integration
│   │   ├── email.ts          # Email service
│   │   ├── upload.ts         # File upload utilities
│   │   ├── schemas.ts        # Zod validation schemas
│   │   ├── api-utils.ts      # API helper functions
│   │   ├── permissions.ts    # Permission definitions
│   │   ├── rbac.ts           # Role-based access control
│   │   ├── middlewares.ts    # API middleware functions
│   │   └── ...
│   │
│   └── context/              # React Context providers
│       └── CartContext.tsx    # Shopping cart state
│
├── prisma/                   # Database ORM
│   ├── schema.prisma         # Database schema
│   ├── migrations/           # Database migrations
│   └── seed.ts               # Seed script
│
├── public/                   # Static assets
│   ├── images/
│   └── ...
│
├── docs/                     # Documentation
├── .github/                  # GitHub configuration
│   └── workflows/           # CI/CD pipelines
├── vercel.json              # Vercel deployment config
├── next.config.js           # Next.js configuration
├── tsconfig.json            # TypeScript configuration
├── tailwind.config.js       # Tailwind CSS configuration
└── package.json             # Dependencies
```

## Architecture Layers

### 1. Presentation Layer (Frontend)

**Components:** React components in `/src/components`
- Reusable UI components
- Page components
- Client-side state management

**Key Components:**
- ProductCard - Product display
- ProductReviewForm/List - Review management
- Navigation/Footer - Layout
- ImageUploader/Gallery - Image management

**State Management:**
- React Context (Cart)
- Local storage (preferences)
- React hooks (component state)

### 2. Application Layer (Pages & Routing)

**Next.js App Router:** `/src/app`
- Page routing
- Dynamic routes
- Layout composition

**Key Pages:**
- `/` - Home page
- `/shop` - Products listing
- `/admin` - Admin dashboard
- `/user` - User account
- `/checkout` - Checkout flow

### 3. API Layer (Backend)

**REST API Routes:** `/src/app/api`
- REST endpoints
- Request validation
- Authentication & authorization
- Business logic
- Data persistence

**API Patterns:**
```typescript
// Route handler pattern
export async function GET(request, { params }) {
  // 1. Check authentication
  // 2. Validate input
  // 3. Execute business logic
  // 4. Return response
}
```

**Authentication Flow:**
```
Login Request
    ↓
Verify Credentials (bcryptjs)
    ↓
Generate JWT Token
    ↓
Return Token
    ↓
Client stores token (localStorage)
    ↓
Future requests: Include Bearer token in header
```

### 4. Data Layer

**Prisma ORM:** Database abstraction
- Type-safe queries
- Migrations
- Relations

**Models:**
- User - User accounts with roles
- Product - Product catalog
- ProductReview - User reviews
- Order - Customer orders
- OrderItem - Order line items
- Delivery - Shipping information
- TrackingEvent - Delivery tracking
- PaymentMethod - Saved payment methods
- PaymentRecord - Payment history
- Return - Return requests
- Refund - Refund records
- Discount - Promotional codes
- CustomOrder - Special requests
- SupportTicket - Customer support
- NewsletterSubscriber - Email list
- EmailCampaign - Email marketing
- ... and more

**Database Schema:**
- SQLite for development
- PostgreSQL for production
- Automatic migrations with Prisma

## Authentication & Authorization

### JWT Flow

```
1. User Login
   POST /auth/login
   { email, password }
   
2. Server Response
   - Verify password (bcryptjs)
   - Generate JWT (jsonwebtoken)
   - Return token
   
3. Client Storage
   localStorage.setItem('token', token)
   
4. Subsequent Requests
   Header: Authorization: Bearer <token>
   
5. Server Verification
   - Extract token from header
   - Verify JWT signature
   - Check expiration (24h)
   - Get user ID from payload
```

### RBAC (Role-Based Access Control)

```
User Model
├── Role: 'admin' | 'manager' | 'staff' | 'viewer' | 'customer'
└── Status: 'active' | 'inactive' | 'pending'

Roles
├── Admin (100%)
│   └── All permissions
├── Manager (80%)
│   └── Orders, deliveries, reports, view users
├── Staff (50%)
│   └── Orders, deliveries
├── Viewer (20%)
│   └── Read-only
└── Customer (0%)
    └── Shopping only

Permissions
├── orders:manage
├── orders:read
├── deliveries:manage
├── deliveries:read
├── tracking:update
├── reports:generate
├── reports:read
├── users:manage
├── users:read
├── products:manage
├── products:read
└── ...
```

### Middleware Pattern

```typescript
// All three middleware types
withAdminAuth()          // Admin only
withUserAuth()           // Authenticated users
withPermission(perm)     // Specific permission
withAnyPermission(perms) // One of multiple

// Usage
export async function POST(request: NextRequest) {
  const auth = await withAdminAuth(request);
  if (!auth.success) return auth.response;
  
  // Execute handler
}
```

## Data Flow Examples

### Creating a Product

```
Admin → POST /admin/products (with token)
    ↓
API Route (middlewares.ts)
    ├─ Middleware: withAdminAuth() ✓
    └─ Validate input (schemas.ts) ✓
    ↓
Database (prisma/schema.prisma)
    └─ Insert product record
    ↓
Response → JSON { product }
```

### Creating a Review

```
User → POST /products/{id}/reviews (with token)
    ↓
API Route
    ├─ Middleware: withUserAuth() ✓
    ├─ Validate input (schemas.ts) ✓
    ├─ Check if user already reviewed ✓
    └─ Check if user purchased product ✓
    ↓
Database
    ├─ Insert review record
    └─ Mark as verified if purchased
    ↓
Response → JSON { review }
```

### Uploading an Image

```
User → POST /api/upload (with file + token)
    ↓
API Route
    ├─ Middleware: withUserAuth() ✓
    ├─ Validate file (upload.ts)
    │  ├─ Check file size ✓
    │  └─ Check file type ✓
    └─ Generate unique filename
    ↓
Vercel Blob Storage
    └─ Upload file
    ↓
Response → JSON { url, filename }
```

## Design Patterns

### 1. Middleware Pattern

Auth, validation, error handling in consistent layers.

### 2. Factory Pattern

- `validateInput()` - Create validators
- `apiSuccess/apiError()` - Create responses

### 3. Repository Pattern

Prisma handles data access abstraction.

### 4. Observer Pattern

React Context for state changes.

## API Response Format

### Success
```json
{
  "data": { /* actual data */ },
  "meta": { /* pagination, timestamps */ }
}
```

### Validation Error
```json
{
  "success": false,
  "error": "Validation failed",
  "details": {
    "email": "Invalid email",
    "password": "Too short"
  }
}
```

### Server Error
```json
{
  "success": false,
  "error": "Internal server error"
}
```

## External Integrations

### Stripe
```
Client → POST /api/checkout
    ↓
Stripe API → Create checkout session
    ↓
Client → Stripe checkout page
    ↓
POST /api/webhooks/stripe → Payment event
    ↓
Update order status in DB
```

### Email Service
```
Event → (Order confirmed, shipping updated, etc.)
    ↓
Trigger email send (nodemailer)
    ↓
SMTP → Email provider (Gmail, SendGrid)
    ↓
Recipient receives email
```

### Vercel Blob
```
User uploads image
    ↓
POST /api/upload
    ↓
put() → Vercel Blob storage
    ↓
Return public URL
```

## Environment-Specific Behavior

### Development
- SQLite database
- No Vercel Blob (local files)
- Test Stripe keys
- Debug logging enabled

### Production
- PostgreSQL database
- Vercel Blob storage
- Live Stripe keys
- Error tracking (Sentry)

## Performance Considerations

### Database
- Indexed fields in schema
- Pagination for list endpoints
- Parallel queries (Promise.all)
- Connection pooling (Railway/Supabase)

### API
- Response caching headers
- Lazy loading of related data
- Pagination default limits

### Frontend
- Next.js Image optimization
- Code splitting
- Client-side caching

## Security Considerations

### Authentication
- JWT with expiration
- Secure password hashing
- Token stored in localStorage (XSS risk)

### Authorization
- Server-side permission checks
- RBAC on sensitive operations
- Admin-only endpoints protected

### Data Protection
- Sanitized responses (no passwords)
- Input validation (Zod schemas)
- SQL injection prevention (Prisma)
- HTTPS only (Vercel)

## Testing Strategy

### Unit Tests
- Auth utilities
- RBAC functions
- Validation schemas
- Helper functions

### Integration Tests
- API routes
- Database operations
- Payment flows

### End-to-End Tests
- User flows
- Admin flows
- Checkout process

## Deployment Pipeline

```
Git push to main
    ↓
GitHub Actions
    ├─ npm lint
    ├─ tsc --noEmit
    ├─ npm run build
    └─ npm test
    ↓
Tests passing? Yes ↓
    ↓
Vercel deploy
    ├─ Build project
    ├─ Run migrations
    ├─ Deploy to CDN
    └─ Set environment variables
    ↓
Production live
```

## Monitoring & Maintenance

- Error tracking (Sentry)
- Performance monitoring (Vercel Analytics)
- Database backups (automated)
- Security updates (npm audit)
- Log aggregation (stdout to service)
