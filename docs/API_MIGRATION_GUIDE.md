# API Route Refactoring Guide - RBAC Implementation

This guide shows how to refactor existing API routes to use the new authentication and authorization middleware.

## Before and After Examples

### Example 1: Admin-Only Route

**BEFORE (Old Pattern):**
```typescript
// src/app/api/admin/products/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getTokenFromRequest, verifyToken } from '@/lib/auth';
import { prisma } from '@/lib/db';

async function verifyAdmin(request: NextRequest) {
  const token = getTokenFromRequest(request);
  if (!token) return null;
  const payload = verifyToken(token);
  if (!payload?.adminId) return null;
  return payload;
}

export async function POST(request: NextRequest) {
  const admin = await verifyAdmin(request);
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  const body = await request.json();
  // ... rest of logic
}
```

**AFTER (New Pattern with Middleware):**
```typescript
// src/app/api/admin/products/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { withAdminAuth, errorResponse, successResponse } from '@/lib/middlewares';
import { prisma } from '@/lib/db';

export async function POST(request: NextRequest) {
  // Middleware handles auth check
  const auth = await withAdminAuth(request);
  if (!auth.success) return auth.response!;
  
  const body = await request.json();
  // ... rest of logic
  
  return successResponse(product, 201);
}
```

### Example 2: Permission-Based Route

**BEFORE (No Permission Checking):**
```typescript
// src/app/api/admin/orders/route.ts
export async function GET(request: NextRequest) {
  const token = getTokenFromRequest(request);
  if (!token) return 401;
  
  // No permission check - assumes admin only
  const orders = await prisma.order.findMany();
  return NextResponse.json(orders);
}
```

**AFTER (With Permission Checking):**
```typescript
// src/app/api/admin/orders/route.ts
import { withPermission, successResponse } from '@/lib/middlewares';
import { PERMISSIONS } from '@/lib/permissions';

export async function GET(request: NextRequest) {
  // Check for orders:read permission
  const auth = await withPermission(request, PERMISSIONS.ORDERS_READ);
  if (!auth.success) return auth.response!;
  
  const orders = await prisma.order.findMany();
  return successResponse(orders);
}

export async function POST(request: NextRequest) {
  // Check for orders:manage permission
  const auth = await withPermission(request, PERMISSIONS.ORDERS_MANAGE);
  if (!auth.success) return auth.response!;
  
  // Create order...
  return successResponse(newOrder, 201);
}
```

### Example 3: User Authentication (Non-Admin)

**BEFORE:**
```typescript
// src/app/api/user/profile/route.ts
export async function GET(request: NextRequest) {
  const token = getTokenFromRequest(request);
  if (!token) return 401;
  
  const payload = verifyToken(token);
  if (!payload?.userId) return 401;
  
  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
  });
  
  return NextResponse.json(user);
}
```

**AFTER:**
```typescript
// src/app/api/user/profile/route.ts
import { withUserAuth, successResponse } from '@/lib/middlewares';

export async function GET(request: NextRequest) {
  const auth = await withUserAuth(request);
  if (!auth.success) return auth.response!;
  
  const user = await prisma.user.findUnique({
    where: { id: auth.userId! },
  });
  
  return successResponse(user);
}
```

## Middleware Functions

### `withAdminAuth(request)`
- Checks for valid JWT token
- Verifies user role is "admin"
- Returns error if not authorized

**Use for:** `/admin/*` routes

```typescript
const auth = await withAdminAuth(request);
if (!auth.success) return auth.response!;
// auth.userId, auth.role, auth.payload available
```

### `withUserAuth(request)`
- Checks for valid JWT token
- Accepts any authenticated user
- Returns error if not authenticated

**Use for:** `/api/user/*` routes, user profile, preferences, etc.

```typescript
const auth = await withUserAuth(request);
if (!auth.success) return auth.response!;
// auth.userId available for any authenticated user
```

### `withPermission(request, permission)`
- Checks for specific permission
- Works for any role that has that permission
- Returns error if permission denied

**Use for:** Routes requiring specific permissions

```typescript
const auth = await withPermission(request, PERMISSIONS.ORDERS_MANAGE);
if (!auth.success) return auth.response!;
// User has permission to manage orders
```

### `withAnyPermission(request, permissions)`
- Checks if user has ANY of the given permissions
- Useful for read endpoints shared by multiple roles

**Use for:** Read routes accessible by multiple roles

```typescript
const auth = await withAnyPermission(request, [
  PERMISSIONS.REPORTS_GENERATE,
  PERMISSIONS.REPORTS_READ,
]);
if (!auth.success) return auth.response!;
// User can view or generate reports
```

## Response Helpers

### `successResponse(data, status)`
Standardized success response:
```typescript
return successResponse(product, 201);
// Returns: { status: 201, body: product }
```

### `errorResponse(message, status, details)`
Standardized error response:
```typescript
return errorResponse('Product not found', 404);
return errorResponse('Validation failed', 400, { field: 'error' });
// Returns: { status: 404, body: { error: message, details } }
```

## Migration Checklist

For each route you update:

- [ ] Import middleware from `@/lib/middlewares`
- [ ] Remove old auth logic (getTokenFromRequest, verifyToken checks)
- [ ] Add appropriate middleware call at start of handler
- [ ] Check middleware result before proceeding
- [ ] Replace NextResponse.json with successResponse/errorResponse
- [ ] Update error status codes (401 for auth, 403 for permissions, 400 for validation)
- [ ] Test with API client (Postman, curl, etc.)

## Routes Priority for Refactoring

### High Priority (Most Used)
1. `/api/admin/**` - All admin routes (20+ files)
2. `/api/user/**` - User profile routes (5+ files)
3. `/api/orders` - Order management
4. `/api/products` - Product management

### Medium Priority
5. `/api/deliveries/**` - Delivery tracking
6. `/api/discounts/**` - Discount management
7. `/api/returns/**` - Returns processing

### Low Priority
8. `/api/payments/**` - Payment routes
9. `/api/checkout/**` - Checkout flows
10. `/api/webhooks/**` - Stripe webhooks (use API key instead)

## Testing Routes

After refactoring, test with:

```bash
# Test without token (should fail)
curl http://localhost:3000/api/admin/products

# Test with invalid token (should fail)
curl -H "Authorization: Bearer invalid" http://localhost:3000/api/admin/products

# Test with valid token (should succeed)
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" http://localhost:3000/api/admin/products
```

## Role-Permission Matrix

```
ROLE      | Orders | Deliveries | Reports | Users | Products | Discounts | Returns
----------|--------|-----------|---------|-------|----------|-----------|----------
Admin     | ✓✓     | ✓✓       | ✓✓     | ✓✓   | ✓✓      | ✓✓       | ✓✓
Manager   | ✓✓     | ✓✓       | ✓✓     | ✓    | ✓       | ✓        | ✓✓
Staff     | ✓✓     | ✓✓       | ✗      | ✗    | ✗       | ✗        | ✓✓
Viewer    | ✓      | ✓        | ✓      | ✗    | ✓       | ✓        | ✗
Customer  | ✗      | ✗        | ✗      | ✗    | ✗       | ✗        | ✗

✓✓ = Full access (read & write)
✓  = Read-only
✗  = No access
```

## Benefits of New Pattern

✅ **Consistency** - Same pattern across all routes  
✅ **Security** - Centralized permission checking  
✅ **Maintainability** - Less code duplication  
✅ **Scalability** - Easy to add new permissions  
✅ **Testability** - Middleware can be unit tested  
✅ **Documentation** - Clear permission requirements  

## Next Steps

1. Start refactoring high-priority routes
2. Test each refactored route
3. Update API tests if they exist
4. Deploy to staging before production
