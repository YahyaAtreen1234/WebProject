# Backend Setup Guide

This document covers the complete backend setup for the Mineral Gallery e-commerce platform.

## Technology Stack

- **ORM**: Prisma
- **Database**: SQLite (development), PostgreSQL/MySQL (production)
- **Authentication**: JWT with bcryptjs
- **API**: Next.js Route Handlers

## Installation

1. **Install dependencies** (already added to package.json):
```bash
npm install
```

2. **Generate Prisma client**:
```bash
npx prisma generate
```

3. **Create database and run migrations**:
```bash
npx prisma migrate dev --name init
```

4. **Seed initial data** (admin user + sample products):
```bash
npx ts-node --project tsconfig.json src/lib/seed.ts
```

## Database Schema

### Models

#### Product
- `id`: String (Primary Key)
- `title`: String (Unique)
- `description`: String
- `price`: Float
- `image`: String (Optional)
- `category`: String
- `stock`: Integer
- `featured`: Boolean
- `createdAt`: DateTime
- `updatedAt`: DateTime

#### Order
- `id`: String (Primary Key)
- `customerName`: String
- `customerEmail`: String
- `customerPhone`: String
- `address`: String
- `city`: String
- `postalCode`: String
- `country`: String
- `totalAmount`: Float
- `status`: String (pending, confirmed, shipped, delivered, cancelled)
- `items`: OrderItem[] (Relation)
- `createdAt`: DateTime
- `updatedAt`: DateTime

#### OrderItem
- `id`: String (Primary Key)
- `orderId`: String (Foreign Key)
- `productId`: String (Foreign Key)
- `quantity`: Integer
- `price`: Float
- `title`: String

#### Cart
- `id`: String (Primary Key)
- `items`: CartItem[] (Relation)
- `createdAt`: DateTime
- `updatedAt`: DateTime

#### CartItem
- `id`: String (Primary Key)
- `cartId`: String (Foreign Key)
- `productId`: String
- `quantity`: Integer
- `price`: Float

#### Contact
- `id`: String (Primary Key)
- `name`: String
- `email`: String
- `phone`: String (Optional)
- `subject`: String
- `message`: String
- `read`: Boolean
- `createdAt`: DateTime

#### Admin
- `id`: String (Primary Key)
- `email`: String (Unique)
- `password`: String (Hashed)
- `name`: String (Optional)
- `createdAt`: DateTime
- `updatedAt`: DateTime

## API Endpoints

### Products

#### GET /api/products
Fetch all products with optional filters
```bash
curl http://localhost:3000/api/products?category=Crystals&featured=true
```

Response: `Product[]`

#### GET /api/products/[id]
Fetch single product by ID
```bash
curl http://localhost:3000/api/products/product-id
```

#### POST /api/products
Create new product (Admin only)
```bash
curl -X POST http://localhost:3000/api/products \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Product Name",
    "description": "Description",
    "price": 99.99,
    "image": "url",
    "category": "Crystals",
    "stock": 10
  }'
```

#### PUT /api/products/[id]
Update product (Admin only)
```bash
curl -X PUT http://localhost:3000/api/products/product-id \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"price": 119.99}'
```

#### DELETE /api/products/[id]
Delete product (Admin only)
```bash
curl -X DELETE http://localhost:3000/api/products/product-id \
  -H "Authorization: Bearer TOKEN"
```

### Authentication

#### POST /api/auth/login
Admin login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@minerals.local",
    "password": "admin123"
  }'
```

Response:
```json
{
  "token": "jwt-token",
  "admin": {
    "id": "admin-id",
    "email": "admin@minerals.local",
    "name": "Admin User"
  }
}
```

### Orders

#### GET /api/orders
Fetch all orders (Admin only)
```bash
curl http://localhost:3000/api/orders \
  -H "Authorization: Bearer TOKEN"
```

#### POST /api/orders
Create new order (Customer)
```bash
curl -X POST http://localhost:3000/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "customerName": "John Doe",
    "customerEmail": "john@example.com",
    "customerPhone": "+1234567890",
    "address": "123 Main St",
    "city": "New York",
    "postalCode": "10001",
    "country": "USA",
    "items": [
      {
        "productId": "product-id",
        "quantity": 2,
        "price": 99.99,
        "title": "Product Name"
      }
    ]
  }'
```

#### GET /api/orders/[id]
Fetch single order
```bash
curl http://localhost:3000/api/orders/order-id
```

#### PUT /api/orders/[id]
Update order status (Admin only)
```bash
curl -X PUT http://localhost:3000/api/orders/order-id \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status": "shipped"}'
```

### Cart

#### GET /api/cart
Fetch cart
```bash
curl http://localhost:3000/api/cart \
  -H "X-Cart-ID: your-cart-id"
```

#### POST /api/cart
Add/update item in cart
```bash
curl -X POST http://localhost:3000/api/cart \
  -H "Content-Type: application/json" \
  -d '{
    "productId": "product-id",
    "quantity": 2,
    "price": 99.99
  }'
```

#### DELETE /api/cart
Remove item from cart
```bash
curl -X DELETE http://localhost:3000/api/cart \
  -H "Content-Type: application/json" \
  -d '{"productId": "product-id"}'
```

### Contact

#### POST /api/contact
Submit contact form
```bash
curl -X POST http://localhost:3000/api/contact \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "subject": "Inquiry",
    "message": "I have a question..."
  }'
```

## Environment Variables

Create `.env.local` with:
```
DATABASE_URL="file:./prisma/dev.db"
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
ADMIN_EMAIL="admin@minerals.local"
ADMIN_PASSWORD="admin123"
```

## Authentication Flow

1. **Admin Login**: POST to `/api/auth/login` with email and password
2. **Receive JWT Token**: Response includes JWT token valid for 24 hours
3. **Use Token**: Include in Authorization header for protected endpoints:
   ```
   Authorization: Bearer <token>
   ```

## Database Commands

```bash
# Generate Prisma client
npm run prisma:generate

# Create migration
npm run prisma:migrate -- --name your_migration_name

# View database in UI
npx prisma studio

# Reset database (WARNING: Deletes all data)
npx prisma migrate reset
```

## Production Deployment

1. **Switch to PostgreSQL**:
   - Update `prisma/schema.prisma`: Change provider to "postgresql"
   - Set `DATABASE_URL` to PostgreSQL connection string

2. **Secure JWT Secret**:
   - Generate strong secret: `openssl rand -base64 32`
   - Set in production environment variables

3. **Run Migrations**:
   ```bash
   npx prisma migrate deploy
   ```

4. **Seed Production Data**:
   ```bash
   NODE_ENV=production npx ts-node src/lib/seed.ts
   ```

## Troubleshooting

### Database Lock
```bash
rm prisma/dev.db
npx prisma migrate dev
```

### Missing Types
```bash
npx prisma generate
```

### Prisma Studio
```bash
npx prisma studio
```

This opens a GUI at `http://localhost:5555` to view and edit database records.
