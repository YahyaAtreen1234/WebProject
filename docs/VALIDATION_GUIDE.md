# Input Validation & Error Handling Guide

This guide shows how to use Zod schemas and API utilities for consistent validation and error handling across the project.

## Quick Start

### 1. Import Schema and Utilities

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { createProductSchema } from '@/lib/schemas';
import { validateInput, apiSuccess, apiError } from '@/lib/api-utils';
import { prisma } from '@/lib/db';
```

### 2. Validate Input

```typescript
export async function POST(request: NextRequest) {
  const body = await request.json();
  
  // Validate input against schema
  const validation = validateInput(createProductSchema, body);
  
  if (!validation.success) {
    return apiError('Validation failed', 400, validation.details);
  }
  
  const { data } = validation;
  // data is now typed as CreateProductInput
}
```

### 3. Return Success/Error

```typescript
// Success
return apiSuccess(product, 201);

// Error
return apiError('Product not found', 404);
return apiError('Invalid request', 400, { field: 'error message' });
```

## Common Patterns

### Pattern 1: Simple CRUD - Create

```typescript
import { NextRequest } from 'next/server';
import { createProductSchema } from '@/lib/schemas';
import { validateInput, apiSuccess, apiError, createErrorResponse } from '@/lib/api-utils';
import { withAdminAuth } from '@/lib/middlewares';
import { prisma } from '@/lib/db';

export async function POST(request: NextRequest) {
  // 1. Check auth
  const auth = await withAdminAuth(request);
  if (!auth.success) return auth.response!;

  try {
    // 2. Parse and validate
    const body = await request.json();
    const validation = validateInput(createProductSchema, body);
    
    if (!validation.success) {
      return apiError('Validation failed', 400, validation.details);
    }

    // 3. Create record
    const product = await prisma.product.create({
      data: validation.data,
    });

    // 4. Return success
    return apiSuccess(product, 201);
  } catch (error) {
    console.error('Create product error:', error);
    return apiError('Failed to create product', 500);
  }
}
```

### Pattern 2: Update with Partial Validation

```typescript
import { updateProductSchema } from '@/lib/schemas';
import { validateInput } from '@/lib/api-utils';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await withAdminAuth(request);
  if (!auth.success) return auth.response!;

  try {
    const body = await request.json();
    
    // updateProductSchema is partial, so all fields are optional
    const validation = validateInput(updateProductSchema, body);
    if (!validation.success) {
      return apiError('Validation failed', 400, validation.details);
    }

    const product = await prisma.product.update({
      where: { id: params.id },
      data: validation.data,
    });

    return apiSuccess(product);
  } catch (error) {
    return createErrorResponse(error, 'Update product');
  }
}
```

### Pattern 3: Delete with Permissions

```typescript
import { withPermission } from '@/lib/middlewares';
import { PERMISSIONS } from '@/lib/permissions';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await withPermission(request, PERMISSIONS.PRODUCTS_MANAGE);
  if (!auth.success) return auth.response!;

  try {
    const product = await prisma.product.findUnique({
      where: { id: params.id },
    });

    if (!product) {
      return apiError('Product not found', 404);
    }

    await prisma.product.delete({
      where: { id: params.id },
    });

    return apiSuccess({ message: 'Product deleted' });
  } catch (error) {
    return createErrorResponse(error, 'Delete product');
  }
}
```

### Pattern 4: Complex Validation with Multiple Rules

```typescript
import { createOrderSchema } from '@/lib/schemas';

export async function POST(request: NextRequest) {
  const body = await request.json();
  const validation = validateInput(createOrderSchema, body);
  
  if (!validation.success) {
    return apiError('Validation failed', 400, validation.details);
  }

  const { data } = validation;
  
  // Additional business logic validation
  const products = await prisma.product.findMany({
    where: {
      id: { in: data.items.map(item => item.productId) },
    },
  });

  // Check if all products exist
  if (products.length !== data.items.length) {
    return apiError('One or more products not found', 400);
  }

  // Check stock availability
  for (const item of data.items) {
    const product = products.find(p => p.id === item.productId);
    if (!product || product.stock < item.quantity) {
      return apiError(
        `Insufficient stock for ${product?.title || 'product'}`,
        400
      );
    }
  }

  // Create order
  const order = await prisma.order.create({
    data: {
      customerName: data.customerName,
      customerEmail: data.customerEmail,
      customerPhone: data.customerPhone,
      address: data.address,
      city: data.city,
      state: data.state,
      postalCode: data.postalCode,
      country: data.country,
      items: {
        create: data.items.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          price: item.price,
          title: products.find(p => p.id === item.productId)?.title || '',
        })),
      },
    },
    include: { items: true },
  });

  return apiSuccess(order, 201);
}
```

### Pattern 5: Validation with Custom Errors

```typescript
import { z } from 'zod';

// Custom schema with detailed error messages
const customSchema = z.object({
  email: z.string()
    .email('Please enter a valid email address')
    .min(5, 'Email too short')
    .max(255, 'Email too long'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Must contain uppercase letter')
    .regex(/[0-9]/, 'Must contain number'),
  age: z.number()
    .int('Must be a whole number')
    .min(18, 'Must be at least 18 years old')
    .max(120, 'Invalid age'),
});

// Use in route
const validation = validateInput(customSchema, body);
```

## Available Schemas

### Authentication
- `loginSchema` - User login
- `registerSchema` - User registration
- `resetPasswordSchema` - Password reset request
- `changePasswordSchema` - Change password

### Products & Reviews
- `createProductSchema` - Create product
- `updateProductSchema` - Update product (partial)
- `createReviewSchema` - Create product review
- `updateReviewSchema` - Update review (partial)

### Orders & Payments
- `createOrderSchema` - Create order
- `createPaymentMethodSchema` - Add payment method
- `applyDiscountSchema` - Apply discount code

### Users & Addresses
- `createUserSchema` - Create user account
- `updateUserSchema` - Update user (partial)
- `updateUserProfileSchema` - Update own profile
- `createAddressSchema` - Add delivery address
- `updateAddressSchema` - Update address (partial)

### Support
- `contactFormSchema` - Contact form
- `createSupportTicketSchema` - Support ticket

### Other
- `createDiscountSchema` - Create discount
- `updateDiscountSchema` - Update discount (partial)

## API Utilities

### `validateInput(schema, data)`
Validates data against a Zod schema and returns typed result.

```typescript
const result = validateInput(createProductSchema, body);
if (result.success) {
  // result.data is typed as CreateProductInput
}
```

### `apiSuccess(data, status?)`
Return standardized success response.

```typescript
return apiSuccess({ id: '123' });
return apiSuccess(product, 201);
```

### `apiError(message, status?, details?)`
Return standardized error response.

```typescript
return apiError('Not found', 404);
return apiError('Validation failed', 400, { email: 'Invalid' });
```

### `createErrorResponse(error, context?)`
Convert caught exception to error response.

```typescript
try {
  // ...
} catch (error) {
  return createErrorResponse(error, 'Create product');
}
```

### `sanitize(obj, fieldsToRemove?)`
Remove sensitive fields before sending to client.

```typescript
const user = await prisma.user.findUnique({ where: { id: userId } });
return apiSuccess(sanitize(user, ['password', 'verificationCode']));
```

### `validateRequired(obj, fields)`
Check if required fields are present.

```typescript
const { valid, missing } = validateRequired(body, ['email', 'name']);
if (!valid) {
  return apiError(`Missing required fields: ${missing.join(', ')}`, 400);
}
```

### `paginate(items, page, limit)`
Paginate array results.

```typescript
const { items, pagination } = paginate(allItems, page, limit);
return apiSuccess({ items, pagination });
```

## Error Response Format

### Validation Error
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

### Standard Error
```json
{
  "success": false,
  "error": "Product not found"
}
```

### Success Response
```json
{
  "id": "prod_123",
  "title": "Crystal",
  "price": 49.99
}
```

## Best Practices

✅ **DO:**
- Validate all user input
- Use Zod schemas for consistent validation
- Provide detailed error messages for validation failures
- Log errors for debugging
- Return appropriate HTTP status codes
- Sanitize responses before sending to client
- Use meaningful field names in error details

❌ **DON'T:**
- Skip validation for "trusted" input
- Return raw exception messages to client
- Log sensitive data (passwords, tokens, etc.)
- Return stack traces in production
- Mix different error response formats
- Expose internal database errors
- Validate without providing helpful error messages

## Migration Checklist

For each API route update:

- [ ] Import required schemas and utilities
- [ ] Add input validation
- [ ] Check authentication/authorization
- [ ] Handle errors with try-catch
- [ ] Use apiSuccess/apiError for responses
- [ ] Test with valid and invalid input
- [ ] Verify error messages are helpful
- [ ] Ensure sensitive data is sanitized
