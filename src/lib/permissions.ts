/**
 * Permission definitions for the RBAC system
 * Each permission grants access to specific operations
 */

export const PERMISSIONS = {
  // Order Management
  ORDERS_MANAGE: 'orders:manage', // create, edit, delete orders
  ORDERS_READ: 'orders:read', // view orders

  // Delivery Management
  DELIVERIES_MANAGE: 'deliveries:manage', // create, update shipments
  DELIVERIES_READ: 'deliveries:read', // view deliveries
  TRACKING_UPDATE: 'tracking:update', // update tracking status

  // Reports & Analytics
  REPORTS_GENERATE: 'reports:generate', // generate reports
  REPORTS_READ: 'reports:read', // view reports

  // User Management
  USERS_MANAGE: 'users:manage', // create, edit, delete users
  USERS_READ: 'users:read', // view user list

  // Product Management
  PRODUCTS_MANAGE: 'products:manage', // create, edit, delete products
  PRODUCTS_READ: 'products:read', // view products

  // Discount Management
  DISCOUNTS_MANAGE: 'discounts:manage', // create, edit, delete discounts
  DISCOUNTS_READ: 'discounts:read', // view discounts

  // Return & Refund Management
  RETURNS_MANAGE: 'returns:manage', // manage returns
  REFUNDS_MANAGE: 'refunds:manage', // process refunds

  // System Settings
  SETTINGS: 'settings', // modify system settings
  BILLING: 'billing', // manage billing & invoices
} as const;

export type Permission = typeof PERMISSIONS[keyof typeof PERMISSIONS];

/**
 * User roles in the system
 */
export const ROLES = {
  ADMIN: 'admin', // Full system access
  MANAGER: 'manager', // Can manage orders, deliveries, reports, view users
  STAFF: 'staff', // Can manage orders and deliveries
  VIEWER: 'viewer', // Read-only access
  CUSTOMER: 'customer', // Regular user (default)
} as const;

export type Role = typeof ROLES[keyof typeof ROLES];

/**
 * Role descriptions for UI
 */
export const ROLE_DESCRIPTIONS: Record<Role, string> = {
  admin: 'Full system access (100%)',
  manager: 'Can manage orders, deliveries, reports, view users (80%)',
  staff: 'Can manage orders and deliveries (50%)',
  viewer: 'Read-only access (20%)',
  customer: 'Regular user with shopping access',
};

/**
 * Role hierarchy levels (higher = more permissions)
 */
export const ROLE_HIERARCHY: Record<Role, number> = {
  admin: 100,
  manager: 80,
  staff: 50,
  viewer: 20,
  customer: 0,
};
