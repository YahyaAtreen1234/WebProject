# API Documentation - Mineral Gallery

Complete API reference for the Mineral Gallery e-commerce platform.

## Base URL
```
http://localhost:3000/api
```

## Authentication

Protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <jwt-token>
```

### Login (Get Token)
```
POST /auth/login
Content-Type: application/json

{
  "email": "admin@minerals.local",
  "password": "admin123"
}
```

**Response (200)**:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "admin": {
    "id": "clid1234567890",
    "email": "admin@minerals.local",
    "name": "Admin User"
  }
}
```

---

## Products

### List Products
```
GET /products
GET /products?category=Crystals
GET /products?featured=true
GET /products?category=Crystals&featured=true
```

**Parameters**:
- `category` (string, optional): Filter by category
- `featured` (boolean, optional): Show only featured products

**Response (200)**:
```json
[
  {
    "id": "clid1234567890",
    "title": "Amethyst Geode",
    "description": "Beautiful deep purple amethyst geode...",
    "price": 129.99,
    "image": "https://...",
    "category": "Geodes",
    "stock": 5,
    "featured": true,
    "createdAt": "2024-06-14T10:30:00Z",
    "updatedAt": "2024-06-14T10:30:00Z"
  }
]
```

### Get Single Product
```
GET /products/{id}
```

**Response (200)**:
```json
{
  "id": "clid1234567890",
  "title": "Amethyst Geode",
  "description": "Beautiful deep purple amethyst geode...",
  "price": 129.99,
  "image": "https://...",
  "category": "Geodes",
  "stock": 5,
  "featured": true,
  "createdAt": "2024-06-14T10:30:00Z",
  "updatedAt": "2024-06-14T10:30:00Z"
}
```

**Error Response (404)**:
```json
{
  "error": "Product not found"
}
```

### Create Product
```
POST /products
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "title": "New Crystal",
  "description": "A beautiful crystal",
  "price": 99.99,
  "image": "https://example.com/image.jpg",
  "category": "Crystals",
  "stock": 10
}
```

**Required Fields**: `title`, `description`, `price`, `category`

**Response (201)**:
```json
{
  "id": "clid1234567890",
  "title": "New Crystal",
  "description": "A beautiful crystal",
  "price": 99.99,
  "image": "https://example.com/image.jpg",
  "category": "Crystals",
  "stock": 10,
  "featured": false,
  "createdAt": "2024-06-14T10:30:00Z",
  "updatedAt": "2024-06-14T10:30:00Z"
}
```

### Update Product
```
PUT /products/{id}
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "price": 109.99,
  "stock": 8
}
```

**Response (200)**:
```json
{
  "id": "clid1234567890",
  "title": "New Crystal",
  "description": "A beautiful crystal",
  "price": 109.99,
  "image": "https://example.com/image.jpg",
  "category": "Crystals",
  "stock": 8,
  "featured": false,
  "createdAt": "2024-06-14T10:30:00Z",
  "updatedAt": "2024-06-14T10:40:00Z"
}
```

### Delete Product
```
DELETE /products/{id}
Authorization: Bearer <admin-token>
```

**Response (200)**:
```json
{
  "success": true
}
```

---

## Orders

### List Orders (Admin Only)
```
GET /orders
Authorization: Bearer <admin-token>
```

**Response (200)**:
```json
[
  {
    "id": "clid1234567890",
    "customerName": "John Doe",
    "customerEmail": "john@example.com",
    "customerPhone": "+1234567890",
    "address": "123 Main St",
    "city": "New York",
    "postalCode": "10001",
    "country": "USA",
    "totalAmount": 299.98,
    "status": "pending",
    "items": [
      {
        "id": "clid0987654321",
        "orderId": "clid1234567890",
        "productId": "clid5555555555",
        "quantity": 2,
        "price": 129.99,
        "title": "Amethyst Geode"
      }
    ],
    "createdAt": "2024-06-14T10:30:00Z",
    "updatedAt": "2024-06-14T10:30:00Z"
  }
]
```

### Get Single Order
```
GET /orders/{id}
```

**Response (200)**:
```json
{
  "id": "clid1234567890",
  "customerName": "John Doe",
  "customerEmail": "john@example.com",
  "customerPhone": "+1234567890",
  "address": "123 Main St",
  "city": "New York",
  "postalCode": "10001",
  "country": "USA",
  "totalAmount": 299.98,
  "status": "pending",
  "items": [
    {
      "id": "clid0987654321",
      "orderId": "clid1234567890",
      "productId": "clid5555555555",
      "quantity": 2,
      "price": 129.99,
      "title": "Amethyst Geode"
    }
  ],
  "createdAt": "2024-06-14T10:30:00Z",
  "updatedAt": "2024-06-14T10:30:00Z"
}
```

### Create Order
```
POST /orders
Content-Type: application/json

{
  "customerName": "John Doe",
  "customerEmail": "john@example.com",
  "customerPhone": "+1234567890",
  "address": "123 Main St",
  "city": "New York",
  "postalCode": "10001",
  "country": "USA",
  "items": [
    {
      "productId": "clid5555555555",
      "quantity": 2,
      "price": 129.99,
      "title": "Amethyst Geode"
    }
  ]
}
```

**Required Fields**: `customerName`, `customerEmail`, `address`, `city`, `postalCode`, `country`, `items`

**Response (201)**:
```json
{
  "id": "clid1234567890",
  "customerName": "John Doe",
  "customerEmail": "john@example.com",
  "customerPhone": "+1234567890",
  "address": "123 Main St",
  "city": "New York",
  "postalCode": "10001",
  "country": "USA",
  "totalAmount": 259.98,
  "status": "pending",
  "items": [...],
  "createdAt": "2024-06-14T10:30:00Z",
  "updatedAt": "2024-06-14T10:30:00Z"
}
```

### Update Order Status
```
PUT /orders/{id}
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "status": "shipped"
}
```

**Valid Statuses**: `pending`, `confirmed`, `shipped`, `delivered`, `cancelled`

**Response (200)**:
```json
{
  "id": "clid1234567890",
  "customerName": "John Doe",
  "customerEmail": "john@example.com",
  "customerPhone": "+1234567890",
  "address": "123 Main St",
  "city": "New York",
  "postalCode": "10001",
  "country": "USA",
  "totalAmount": 259.98,
  "status": "shipped",
  "items": [...],
  "createdAt": "2024-06-14T10:30:00Z",
  "updatedAt": "2024-06-14T10:45:00Z"
}
```

---

## Cart

### Get Cart
```
GET /cart
X-Cart-ID: your-cart-id (optional)
```

If no X-Cart-ID header is provided, one will be generated based on IP address.

**Response (200)**:
```json
{
  "id": "cart-abc123",
  "items": [
    {
      "id": "clid0987654321",
      "cartId": "cart-abc123",
      "productId": "clid5555555555",
      "quantity": 2,
      "price": 129.99
    }
  ],
  "createdAt": "2024-06-14T10:30:00Z",
  "updatedAt": "2024-06-14T10:35:00Z"
}
```

### Add/Update Cart Item
```
POST /cart
X-Cart-ID: your-cart-id (optional)
Content-Type: application/json

{
  "productId": "clid5555555555",
  "quantity": 2,
  "price": 129.99
}
```

**Required Fields**: `productId`, `quantity`, `price`

**Response (200)**:
```json
{
  "id": "cart-abc123",
  "items": [
    {
      "id": "clid0987654321",
      "cartId": "cart-abc123",
      "productId": "clid5555555555",
      "quantity": 2,
      "price": 129.99
    }
  ],
  "createdAt": "2024-06-14T10:30:00Z",
  "updatedAt": "2024-06-14T10:35:00Z"
}
```

### Remove Cart Item
```
DELETE /cart
X-Cart-ID: your-cart-id (optional)
Content-Type: application/json

{
  "productId": "clid5555555555"
}
```

**Response (200)**:
```json
{
  "id": "cart-abc123",
  "items": [],
  "createdAt": "2024-06-14T10:30:00Z",
  "updatedAt": "2024-06-14T10:40:00Z"
}
```

---

## Contact

### Submit Contact Form
```
POST /contact
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "subject": "Product Inquiry",
  "message": "I would like to know more about the Amethyst Geode..."
}
```

**Required Fields**: `name`, `email`, `subject`, `message`

**Response (201)**:
```json
{
  "message": "Contact message received",
  "id": "clid1234567890"
}
```

---

## Error Responses

### 400 Bad Request
```json
{
  "error": "Missing required fields"
}
```

### 401 Unauthorized
```json
{
  "error": "Unauthorized"
}
```

### 403 Forbidden
```json
{
  "error": "Admin access required"
}
```

### 404 Not Found
```json
{
  "error": "Product not found"
}
```

### 500 Internal Server Error
```json
{
  "error": "Failed to process request"
}
```

---

## Rate Limiting

Currently no rate limiting is implemented. Consider adding rate limiting middleware for production.

## CORS

All endpoints accept requests from any origin. For production, configure CORS in `next.config.js`.

## Pagination

Pagination is not yet implemented. For large datasets, consider adding limit/offset parameters.

## Validation

All email inputs are validated using regex pattern: `^[^\s@]+@[^\s@]+\.[^\s@]+$`
