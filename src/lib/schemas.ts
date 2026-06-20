/**
 * Zod validation schemas for API requests
 * Use for input validation across API routes
 */

import { z } from 'zod';

// Common patterns
const emailSchema = z.string().email('Invalid email address');
const passwordSchema = z.string().min(6, 'Password must be at least 6 characters');
const nameSchema = z.string().min(2, 'Name must be at least 2 characters').max(100);
const phoneSchema = z.string().regex(/^\+?[\d\s\-()]{10,}$/, 'Invalid phone number').optional();
const urlSchema = z.string().url('Invalid URL');

// ==========================================
// Authentication Schemas
// ==========================================

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
});

export const registerSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  password: passwordSchema,
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

export const resetPasswordSchema = z.object({
  email: emailSchema,
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: passwordSchema,
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

// ==========================================
// Product Schemas
// ==========================================

export const createProductSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(200),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  price: z.number().positive('Price must be positive'),
  category: z.string().min(1, 'Category is required'),
  stock: z.number().int('Stock must be an integer').nonnegative('Stock cannot be negative').optional(),
  featured: z.boolean().optional(),
  image: urlSchema.optional(),
});

export const updateProductSchema = createProductSchema.partial();

// ==========================================
// Review Schemas
// ==========================================

export const createReviewSchema = z.object({
  rating: z.number().int().min(1, 'Rating must be between 1 and 5').max(5),
  title: z.string().min(3, 'Title must be at least 3 characters').max(100),
  comment: z.string()
    .min(10, 'Comment must be at least 10 characters')
    .max(1000, 'Comment must not exceed 1000 characters'),
});

export const updateReviewSchema = createReviewSchema.partial();

// ==========================================
// Order Schemas
// ==========================================

export const createOrderSchema = z.object({
  customerName: nameSchema,
  customerEmail: emailSchema,
  customerPhone: phoneSchema,
  address: z.string().min(5, 'Address must be at least 5 characters'),
  city: z.string().min(2, 'City is required'),
  state: z.string().optional(),
  postalCode: z.string().min(2, 'Postal code is required'),
  country: z.string().min(2, 'Country is required'),
  items: z.array(
    z.object({
      productId: z.string().cuid('Invalid product ID'),
      quantity: z.number().int().positive('Quantity must be positive'),
      price: z.number().positive('Price must be positive'),
    })
  ).min(1, 'Order must contain at least one item'),
  discountCode: z.string().optional(),
});

// ==========================================
// User Schemas
// ==========================================

export const updateUserProfileSchema = z.object({
  name: nameSchema.optional(),
  email: emailSchema.optional(),
  phone: phoneSchema,
  profileImage: urlSchema.optional(),
});

export const createUserSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  password: passwordSchema,
  role: z.enum(['admin', 'manager', 'staff', 'viewer', 'customer']).optional(),
  status: z.enum(['active', 'inactive', 'pending']).optional(),
});

export const updateUserSchema = createUserSchema.partial();

// ==========================================
// Address Schemas
// ==========================================

export const createAddressSchema = z.object({
  name: nameSchema,
  phone: z.string().regex(/^\+?[\d\s\-()]{10,}$/, 'Invalid phone number'),
  addressLine1: z.string().min(5, 'Address must be at least 5 characters'),
  addressLine2: z.string().optional(),
  city: z.string().min(2, 'City is required'),
  state: z.string().optional(),
  postalCode: z.string().min(2, 'Postal code is required'),
  country: z.string().min(2, 'Country is required'),
  isDefault: z.boolean().optional(),
});

export const updateAddressSchema = createAddressSchema.partial();

// ==========================================
// Discount Schemas
// ==========================================

export const createDiscountSchema = z.object({
  code: z.string().min(3, 'Code must be at least 3 characters').toUpperCase(),
  type: z.enum(['percentage', 'fixed', 'free_shipping']),
  value: z.number().positive('Value must be positive'),
  description: z.string().optional(),
  minOrderAmount: z.number().nonnegative().optional(),
  maxDiscount: z.number().positive().optional(),
  maxUses: z.number().int().positive().optional(),
  expiryDate: z.string().datetime().optional(),
  active: z.boolean().optional(),
});

export const updateDiscountSchema = createDiscountSchema.partial();

export const applyDiscountSchema = z.object({
  code: z.string().min(1, 'Discount code is required'),
});

// ==========================================
// Payment Schemas
// ==========================================

export const createPaymentMethodSchema = z.object({
  type: z.enum(['credit_card', 'paypal', 'apple_pay', 'google_pay', 'bank_transfer']),
  last4: z.string().regex(/^\d{4}$/).optional(),
  expiryMonth: z.number().int().min(1).max(12).optional(),
  expiryYear: z.number().int().min(2000).optional(),
  cardholderName: z.string().optional(),
  paypalEmail: emailSchema.optional(),
  bankName: z.string().optional(),
  isDefault: z.boolean().optional(),
});

// ==========================================
// Contact/Support Schemas
// ==========================================

export const contactFormSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  phone: phoneSchema,
  subject: z.string().min(5, 'Subject must be at least 5 characters').max(200),
  message: z.string()
    .min(10, 'Message must be at least 10 characters')
    .max(5000, 'Message must not exceed 5000 characters'),
});

export const createSupportTicketSchema = z.object({
  email: emailSchema,
  name: nameSchema,
  subject: z.string().min(5, 'Subject must be at least 5 characters').max(200),
  category: z.enum(['general', 'order', 'product', 'technical', 'refund', 'shipping', 'other']),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
  message: z.string()
    .min(10, 'Message must be at least 10 characters')
    .max(5000, 'Message must not exceed 5000 characters'),
});

// ==========================================
// Utility Types
// ==========================================

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type CreateProductInput = z.infer<typeof createProductSchema>;
export type CreateReviewInput = z.infer<typeof createReviewSchema>;
export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type UpdateUserProfileInput = z.infer<typeof updateUserProfileSchema>;
export type CreateAddressInput = z.infer<typeof createAddressSchema>;
export type ContactFormInput = z.infer<typeof contactFormSchema>;
