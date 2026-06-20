# Quick Start Guide

Get your Mineral Gallery backend up and running in 5 minutes.

## Step 1: Install Dependencies
```bash
npm install
```

## Step 2: Initialize Database
```bash
npx prisma migrate dev --name init
```

This will:
- Create SQLite database at `prisma/dev.db`
- Apply all database migrations
- Generate Prisma client

## Step 3: Seed Sample Data
```bash
npx ts-node --project tsconfig.json src/lib/seed.ts
```

This creates:
- Admin user: `admin@minerals.local` / `admin123`
- 8 sample mineral products
- Ready-to-use database

## Step 4: Start Dev Server
```bash
npm run dev
```

Server runs at `http://localhost:3000`

## Step 5: Test the API

### 1. Login as Admin
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@minerals.local",
    "password": "admin123"
  }'
```

Copy the `token` from the response.

### 2. Get All Products
```bash
curl http://localhost:3000/api/products
```

### 3. Create a New Order
```bash
curl -X POST http://localhost:3000/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "customerName": "Jane Smith",
    "customerEmail": "jane@example.com",
    "customerPhone": "+1234567890",
    "address": "456 Oak Ave",
    "city": "Los Angeles",
    "postalCode": "90001",
    "country": "USA",
    "items": [
      {
        "productId": "REPLACE_WITH_ACTUAL_ID",
        "quantity": 1,
        "price": 129.99,
        "title": "Amethyst Geode"
      }
    ]
  }'
```

### 4. View Database
```bash
npx prisma studio
```

Opens GUI at `http://localhost:5555`

---

## API Endpoints Summary

| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| GET | `/api/products` | No | List all products |
| POST | `/api/products` | Admin | Create product |
| PUT | `/api/products/[id]` | Admin | Update product |
| DELETE | `/api/products/[id]` | Admin | Delete product |
| POST | `/api/auth/login` | No | Get admin token |
| POST | `/api/orders` | No | Create order |
| GET | `/api/orders` | Admin | List all orders |
| PUT | `/api/orders/[id]` | Admin | Update order status |
| POST | `/api/contact` | No | Submit contact form |
| GET | `/api/cart` | No | Get cart |
| POST | `/api/cart` | No | Add to cart |
| DELETE | `/api/cart` | No | Remove from cart |

---

## Default Admin Credentials

**Email**: `admin@minerals.local`
**Password**: `admin123`

⚠️ **Change these in production!**

---

## Environment Variables

Located in `.env.local`:
```
DATABASE_URL="file:./prisma/dev.db"
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
ADMIN_EMAIL="admin@minerals.local"
ADMIN_PASSWORD="admin123"
```

---

## Common Commands

```bash
# Generate Prisma client
npm run prisma:generate

# Create a database migration
npm run prisma:migrate -- --name migration_name

# Reset database (CAUTION: Deletes all data)
npx prisma migrate reset

# View database GUI
npx prisma studio

# Build for production
npm run build

# Start production server
npm start
```

---

## What's Included

✅ **Database**
- Prisma ORM with SQLite
- 6 models: Product, Order, Cart, Contact, Admin
- Auto-generated, type-safe database client

✅ **Authentication**
- JWT-based admin authentication
- Bcrypt password hashing
- Secure token verification

✅ **API Endpoints**
- Products: CRUD operations
- Orders: Create and manage orders
- Cart: Session-based shopping cart
- Contact: Contact form submissions
- Auth: Admin login

✅ **Data Validation**
- Email format validation
- Required field checking
- Type safety with TypeScript

✅ **Documentation**
- Comprehensive API documentation
- Database schema explanation
- Setup and deployment guides

---

## Next Steps

1. ✅ Initialize database
2. ✅ Test API endpoints
3. Create frontend components for:
   - Product listing
   - Shopping cart
   - Checkout page
   - Order confirmation
   - Admin dashboard
4. Connect frontend to API
5. Deploy to production

---

## Troubleshooting

**Issue**: Database file not found
```bash
npx prisma migrate dev
```

**Issue**: Prisma client errors
```bash
npm run prisma:generate
rm -rf node_modules/.prisma
npm install
```

**Issue**: Port 3000 already in use
```bash
PORT=3001 npm run dev
```

---

## Support

- API Docs: See `API_DOCUMENTATION.md`
- Backend Setup: See `BACKEND_SETUP.md`
- Database Schema: See `prisma/schema.prisma`
