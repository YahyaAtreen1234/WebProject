# Mineral Gallery API Documentation

Complete reference for all API endpoints.

## Base URL

- **Development:** `http://localhost:3000/api`
- **Production:** `https://yourdomain.com/api`

## Authentication

All protected endpoints require a JWT token in the `Authorization` header:

```bash
Authorization: Bearer <jwt_token>
```

### Getting a Token

**Login:**
```bash
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

Response:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "user_123",
    "email": "user@example.com",
    "name": "John Doe"
  }
}
```

---

## Products

### List Products
```bash
GET /products
```

Query Parameters:
- `category` - Filter by category (string)
- `featured` - Show only featured (boolean)
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 20)
- `sort` - Sort by: `newest`, `price-asc`, `price-desc`, `popular`

Response:
```json
{
  "products": [
    {
      "id": "prod_123",
      "title": "Clear Quartz",
      "price": 29.99,
      "category": "crystals",
      "stock": 50,
      "image": "https://...",
      "featured": true
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "pages": 8
  }
}
```

### Get Product
```bash
GET /products/{id}
```

Response:
```json
{
  "id": "prod_123",
  "title": "Clear Quartz",
  "description": "High quality natural quartz crystal...",
  "price": 29.99,
  "category": "crystals",
  "stock": 50,
  "image": "https://...",
  "images": ["https://...", "https://..."],
  "featured": true,
  "createdAt": "2024-01-15T10:00:00Z"
}
```

### Create Product (Admin Only)
```bash
POST /admin/products
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Clear Quartz",
  "description": "High quality natural crystal",
  "price": 29.99,
  "category": "crystals",
  "stock": 50,
  "featured": false
}
```

### Update Product (Admin Only)
```bash
PUT /admin/products/{id}
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Clear Quartz - Premium",
  "price": 39.99
}
```

### Delete Product (Admin Only)
```bash
DELETE /admin/products/{id}
Authorization: Bearer <token>
```

---

## Product Reviews

### List Reviews
```bash
GET /products/{id}/reviews
```

Query Parameters:
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10)
- `sort` - Sort by: `newest`, `oldest`, `helpful`, `highest-rated`

Response:
```json
{
  "reviews": [
    {
      "id": "rev_123",
      "rating": 5,
      "title": "Excellent quality!",
      "comment": "Very satisfied with this purchase...",
      "helpful": 12,
      "verified": true,
      "user": {
        "id": "user_456",
        "name": "Jane Doe"
      },
      "createdAt": "2024-01-15T10:00:00Z"
    }
  ],
  "pagination": { "page": 1, "limit": 10, "total": 45, "pages": 5 },
  "averageRating": 4.8,
  "totalReviews": 45
}
```

### Create Review (Authenticated)
```bash
POST /products/{id}/reviews
Authorization: Bearer <token>
Content-Type: application/json

{
  "rating": 5,
  "title": "Excellent quality!",
  "comment": "Very satisfied with this purchase. Highly recommend!"
}
```

### Update Review (Authenticated)
```bash
PUT /products/{id}/reviews/{reviewId}
Authorization: Bearer <token>
Content-Type: application/json

{
  "rating": 4,
  "comment": "Updated my opinion..."
}
```

### Delete Review (Authenticated)
```bash
DELETE /products/{id}/reviews/{reviewId}
Authorization: Bearer <token>
```

### Mark Review as Helpful
```bash
POST /products/{id}/reviews/{reviewId}/helpful
```

---

## Orders

### Create Order
```bash
POST /orders
Content-Type: application/json

{
  "customerName": "John Doe",
  "customerEmail": "john@example.com",
  "customerPhone": "+1234567890",
  "address": "123 Main St",
  "city": "New York",
  "state": "NY",
  "postalCode": "10001",
  "country": "USA",
  "items": [
    {
      "productId": "prod_123",
      "quantity": 2,
      "price": 29.99
    }
  ],
  "discountCode": "SAVE10"
}
```

Response:
```json
{
  "id": "order_123",
  "orderNumber": "ORD-2024-001",
  "customerName": "John Doe",
  "totalAmount": 59.98,
  "subtotal": 59.98,
  "tax": 4.80,
  "shipping": 0,
  "discount": 6.00,
  "status": "pending",
  "paymentStatus": "pending",
  "createdAt": "2024-01-15T10:00:00Z"
}
```

### Get Order
```bash
GET /orders/{orderNumber}
```

### List Orders (Admin)
```bash
GET /admin/orders
Authorization: Bearer <admin_token>
```

Query Parameters:
- `status` - Filter by status: `pending`, `processing`, `shipped`, `delivered`
- `page` - Page number
- `limit` - Items per page

---

## User Management

### Register
```bash
POST /auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123",
  "confirmPassword": "SecurePass123"
}
```

### Login
```bash
POST /auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "SecurePass123"
}
```

### Get Profile (Authenticated)
```bash
GET /user/profile
Authorization: Bearer <token>
```

### Update Profile (Authenticated)
```bash
PUT /user/profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Jane Doe",
  "phone": "+1234567890"
}
```

### Change Password (Authenticated)
```bash
POST /user/change-password
Authorization: Bearer <token>
Content-Type: application/json

{
  "currentPassword": "OldPass123",
  "newPassword": "NewPass456",
  "confirmPassword": "NewPass456"
}
```

### Logout
```bash
POST /auth/logout
Authorization: Bearer <token>
```

---

## Addresses

### List Addresses (Authenticated)
```bash
GET /user/addresses
Authorization: Bearer <token>
```

### Create Address (Authenticated)
```bash
POST /user/addresses
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Home",
  "phone": "+1234567890",
  "addressLine1": "123 Main St",
  "city": "New York",
  "state": "NY",
  "postalCode": "10001",
  "country": "USA",
  "isDefault": true
}
```

### Update Address (Authenticated)
```bash
PUT /user/addresses/{addressId}
Authorization: Bearer <token>
```

### Delete Address (Authenticated)
```bash
DELETE /user/addresses/{addressId}
Authorization: Bearer <token>
```

---

## Payments

### Add Payment Method (Authenticated)
```bash
POST /user/payment-methods
Authorization: Bearer <token>
Content-Type: application/json

{
  "type": "credit_card",
  "cardholderName": "John Doe",
  "last4": "4242",
  "expiryMonth": 12,
  "expiryYear": 2025,
  "isDefault": true
}
```

### List Payment Methods (Authenticated)
```bash
GET /user/payment-methods
Authorization: Bearer <token>
```

### Delete Payment Method (Authenticated)
```bash
DELETE /user/payment-methods/{methodId}
Authorization: Bearer <token>
```

---

## Discounts

### Validate Discount Code
```bash
POST /discounts/validate
Content-Type: application/json

{
  "code": "SAVE10"
}
```

Response:
```json
{
  "valid": true,
  "code": "SAVE10",
  "type": "percentage",
  "value": 10,
  "minOrderAmount": 50
}
```

### Apply Discount (with Order)
```bash
POST /discounts/apply
Content-Type: application/json

{
  "code": "SAVE10",
  "subtotal": 100.00
}
```

Response:
```json
{
  "code": "SAVE10",
  "discountAmount": 10.00,
  "finalTotal": 90.00
}
```

---

## Deliveries & Tracking

### Track Delivery
```bash
GET /deliveries/tracking/{trackingNumber}
```

Response:
```json
{
  "trackingNumber": "TR123456",
  "carrier": "FedEx",
  "status": "in_transit",
  "currentLocation": "New York, NY",
  "estimatedDelivery": "2024-01-20T00:00:00Z",
  "history": [
    {
      "status": "picked_up",
      "location": "Warehouse",
      "timestamp": "2024-01-15T10:00:00Z"
    },
    {
      "status": "in_transit",
      "location": "Distribution Center",
      "timestamp": "2024-01-16T08:30:00Z"
    }
  ]
}
```

---

## Admin Endpoints

### User Management
```bash
GET /admin/users                    # List all users
POST /admin/users                   # Create user
PUT /admin/users/{userId}           # Update user
DELETE /admin/users/{userId}        # Delete user
```

### Product Management
```bash
GET /admin/products                 # List all products
POST /admin/products                # Create product
PUT /admin/products/{id}            # Update product
DELETE /admin/products/{id}         # Delete product
```

### Order Management
```bash
GET /admin/orders                   # List all orders
PUT /admin/orders/{id}              # Update order status
POST /admin/orders/{id}/ship        # Mark as shipped
```

### Analytics
```bash
GET /admin/analytics/dashboard      # Dashboard stats
GET /admin/analytics/revenue-trend  # Revenue trends
```

---

## Error Responses

### Validation Error (400)
```json
{
  "success": false,
  "error": "Validation failed",
  "details": {
    "email": "Invalid email address",
    "password": "Must contain uppercase letter"
  }
}
```

### Unauthorized (401)
```json
{
  "error": "Invalid or expired token"
}
```

### Forbidden (403)
```json
{
  "error": "Admin access required"
}
```

### Not Found (404)
```json
{
  "error": "Product not found"
}
```

### Server Error (500)
```json
{
  "error": "Internal server error"
}
```

---

## Status Codes

| Code | Meaning |
|------|---------|
| 200 | OK |
| 201 | Created |
| 400 | Bad Request (validation error) |
| 401 | Unauthorized (missing/invalid token) |
| 403 | Forbidden (insufficient permissions) |
| 404 | Not Found |
| 500 | Internal Server Error |

---

## Rate Limiting

Currently no rate limits are enforced. In production, consider implementing:
- 100 requests per minute for authenticated users
- 10 requests per minute for unauthenticated endpoints

---

## Pagination

List endpoints support pagination:

- `page` - Page number (starts at 1)
- `limit` - Items per page (default varies by endpoint)

Response includes:
```json
{
  "items": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "pages": 8
  }
}
```

---

## Filtering & Sorting

### Products
- Filter: `category`, `featured`
- Sort: `newest`, `price-asc`, `price-desc`, `popular`

### Reviews
- Sort: `newest`, `oldest`, `helpful`, `highest-rated`

### Orders
- Filter: `status`
- Sort: `newest`, `oldest`, `total-asc`, `total-desc`

---

## Best Practices

1. **Always include authentication headers** for protected endpoints
2. **Validate responses** in client code
3. **Handle error responses** appropriately
4. **Use pagination** for large datasets
5. **Cache responses** where appropriate
6. **Implement retry logic** for failed requests
7. **Log API errors** for debugging

---

## Integration Examples

### JavaScript/Fetch
```javascript
const response = await fetch('/api/products/prod_123/reviews', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    rating: 5,
    title: 'Great product!',
    comment: 'Very satisfied with this purchase.'
  })
});

const data = await response.json();
```

### cURL
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'
```

---

## Support

For API issues or questions, contact support or check [TROUBLESHOOTING.md](./TROUBLESHOOTING.md).
