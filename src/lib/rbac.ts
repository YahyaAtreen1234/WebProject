/**
 * RBAC (Role-Based Access Control) mapping
 * Maps each role to its permissions
 */

import { PERMISSIONS, ROLES, Role, Permission } from './permissions';

// Re-export ROLES for use in other files
export { ROLES };

/**
 * Role to permissions mapping
 * Defines what each role can do
 */
export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  [ROLES.ADMIN]: [
    // Admin has ALL permissions
    PERMISSIONS.ORDERS_MANAGE,
    PERMISSIONS.ORDERS_READ,
    PERMISSIONS.DELIVERIES_MANAGE,
    PERMISSIONS.DELIVERIES_READ,
    PERMISSIONS.TRACKING_UPDATE,
    PERMISSIONS.REPORTS_GENERATE,
    PERMISSIONS.REPORTS_READ,
    PERMISSIONS.USERS_MANAGE,
    PERMISSIONS.USERS_READ,
    PERMISSIONS.PRODUCTS_MANAGE,
    PERMISSIONS.PRODUCTS_READ,
    PERMISSIONS.DISCOUNTS_MANAGE,
    PERMISSIONS.DISCOUNTS_READ,
    PERMISSIONS.RETURNS_MANAGE,
    PERMISSIONS.REFUNDS_MANAGE,
    PERMISSIONS.SETTINGS,
    PERMISSIONS.BILLING,
  ],

  [ROLES.MANAGER]: [
    // Manager: orders, deliveries, reports, view users
    PERMISSIONS.ORDERS_MANAGE,
    PERMISSIONS.ORDERS_READ,
    PERMISSIONS.DELIVERIES_MANAGE,
    PERMISSIONS.DELIVERIES_READ,
    PERMISSIONS.TRACKING_UPDATE,
    PERMISSIONS.REPORTS_GENERATE,
    PERMISSIONS.REPORTS_READ,
    PERMISSIONS.USERS_READ,
    PERMISSIONS.PRODUCTS_READ,
    PERMISSIONS.DISCOUNTS_READ,
    PERMISSIONS.RETURNS_MANAGE,
    PERMISSIONS.REFUNDS_MANAGE,
  ],

  [ROLES.STAFF]: [
    // Staff: orders and deliveries only
    PERMISSIONS.ORDERS_MANAGE,
    PERMISSIONS.ORDERS_READ,
    PERMISSIONS.DELIVERIES_MANAGE,
    PERMISSIONS.DELIVERIES_READ,
    PERMISSIONS.TRACKING_UPDATE,
    PERMISSIONS.RETURNS_MANAGE,
  ],

  [ROLES.VIEWER]: [
    // Viewer: read-only access
    PERMISSIONS.ORDERS_READ,
    PERMISSIONS.DELIVERIES_READ,
    PERMISSIONS.REPORTS_READ,
    PERMISSIONS.PRODUCTS_READ,
    PERMISSIONS.DISCOUNTS_READ,
  ],

  [ROLES.CUSTOMER]: [
    // Customer: no special permissions (handled separately)
  ],
};

/**
 * Check if a user has a specific permission
 * @param role - User's role
 * @param permission - Permission to check
 * @returns true if user has permission, false otherwise
 */
export function hasPermission(role: Role, permission: Permission): boolean {
  const rolePermissions = ROLE_PERMISSIONS[role];
  return rolePermissions.includes(permission);
}

/**
 * Check if a user has any of the given permissions
 * @param role - User's role
 * @param permissions - Array of permissions to check
 * @returns true if user has at least one permission, false otherwise
 */
export function hasAnyPermission(role: Role, permissions: Permission[]): boolean {
  return permissions.some((permission) => hasPermission(role, permission));
}

/**
 * Check if a user has all of the given permissions
 * @param role - User's role
 * @param permissions - Array of permissions to check
 * @returns true if user has all permissions, false otherwise
 */
export function hasAllPermissions(role: Role, permissions: Permission[]): boolean {
  return permissions.every((permission) => hasPermission(role, permission));
}

/**
 * Get all permissions for a role
 * @param role - User's role
 * @returns Array of permissions for this role
 */
export function getPermissions(role: Role): Permission[] {
  return ROLE_PERMISSIONS[role];
}

/**
 * Check if user is an admin or higher
 * @param role - User's role
 * @returns true if user is admin, false otherwise
 */
export function isAdmin(role: Role): boolean {
  return role === ROLES.ADMIN;
}

/**
 * Check if user has admin-level or manager-level access
 * @param role - User's role
 * @returns true if user is admin or manager, false otherwise
 */
export function isAdminOrManager(role: Role): boolean {
  return role === ROLES.ADMIN || role === ROLES.MANAGER;
}

/**
 * Check if user has staff-level or above access
 * @param role - User's role
 * @returns true if user is staff or above, false otherwise
 */
export function isStaffOrAbove(role: Role): boolean {
  return [ROLES.ADMIN, ROLES.MANAGER, ROLES.STAFF].includes(role as any);
}
