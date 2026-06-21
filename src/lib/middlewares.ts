/**
 * API Middleware functions for authentication and authorization
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from './auth';
import { hasPermission, hasAnyPermission, ROLES } from './rbac';
import { PERMISSIONS, type Permission, type Role } from './permissions';
import { prisma } from './db';

/**
 * Auth result type
 */
export interface AuthResult {
  success: boolean;
  userId?: string;
  role?: Role;
  isAdmin?: boolean;
  payload?: any;
  response?: NextResponse;
}

/**
 * Check if user is authenticated (has valid JWT token)
 * @param request - Next.js request object
 * @returns AuthResult with user info or error response
 */
export async function checkAuth(request: NextRequest): Promise<AuthResult> {
  const authHeader = request.headers.get('authorization');

  if (!authHeader?.startsWith('Bearer ')) {
    return {
      success: false,
      response: NextResponse.json(
        { error: 'Missing or invalid authorization header' },
        { status: 401 }
      ),
    };
  }

  const token = authHeader.substring(7);

  try {
    const payload = verifyToken(token);

    if (!payload) {
      return {
        success: false,
        response: NextResponse.json({ error: 'Invalid token' }, { status: 401 }),
      };
    }

    return {
      success: true,
      userId: (payload as any).userId || (payload as any).id,
      role: (payload as any).role || ROLES.CUSTOMER,
      isAdmin: (payload as any).isAdmin || false,
      payload,
    };
  } catch (error) {
    return {
      success: false,
      response: NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 }),
    };
  }
}

/**
 * Middleware wrapper for routes requiring authentication
 * @param request - Next.js request object
 * @returns Auth result or error response
 */
export async function withAuth(request: NextRequest): Promise<AuthResult> {
  const auth = await checkAuth(request);

  if (!auth.success) {
    return auth;
  }

  return {
    success: true,
    userId: auth.userId,
    role: auth.role,
    isAdmin: auth.isAdmin,
    payload: auth.payload,
  };
}

/**
 * Middleware for routes requiring admin authentication
 * @param request - Next.js request object
 * @returns Auth result or error response
 */
export async function withAdminAuth(request: NextRequest): Promise<AuthResult> {
  const auth = await checkAuth(request);

  if (!auth.success) {
    return auth;
  }

  // Check if user is admin
  if (auth.role !== ROLES.ADMIN) {
    return {
      success: false,
      response: NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      ),
    };
  }

  return {
    success: true,
    userId: auth.userId,
    role: auth.role,
    isAdmin: true,
    payload: auth.payload,
  };
}

/**
 * Middleware for routes requiring a specific permission
 * @param request - Next.js request object
 * @param requiredPermission - Permission to check
 * @returns Auth result or error response
 */
export async function withPermission(
  request: NextRequest,
  requiredPermission: Permission
): Promise<AuthResult> {
  const auth = await checkAuth(request);

  if (!auth.success) {
    return auth;
  }

  if (!auth.role || !hasPermission(auth.role, requiredPermission)) {
    return {
      success: false,
      response: NextResponse.json(
        { error: `Permission '${requiredPermission}' required` },
        { status: 403 }
      ),
    };
  }

  return {
    success: true,
    userId: auth.userId,
    role: auth.role,
    isAdmin: auth.isAdmin,
    payload: auth.payload,
  };
}

/**
 * Middleware for routes requiring any of multiple permissions
 * @param request - Next.js request object
 * @param requiredPermissions - Array of permissions (user needs at least one)
 * @returns Auth result or error response
 */
export async function withAnyPermission(
  request: NextRequest,
  requiredPermissions: Permission[]
): Promise<AuthResult> {
  const auth = await checkAuth(request);

  if (!auth.success) {
    return auth;
  }

  if (
    !auth.role ||
    !hasAnyPermission(auth.role, requiredPermissions)
  ) {
    return {
      success: false,
      response: NextResponse.json(
        {
          error: `One of these permissions required: ${requiredPermissions.join(', ')}`,
        },
        { status: 403 }
      ),
    };
  }

  return {
    success: true,
    userId: auth.userId,
    role: auth.role,
    isAdmin: auth.isAdmin,
    payload: auth.payload,
  };
}

/**
 * Middleware for user authentication (non-admin users)
 * @param request - Next.js request object
 * @returns Auth result or error response
 */
export async function withUserAuth(request: NextRequest): Promise<AuthResult> {
  const auth = await checkAuth(request);

  if (!auth.success) {
    return auth;
  }

  // Any authenticated user is fine (not just admin)
  return {
    success: true,
    userId: auth.userId,
    role: auth.role,
    isAdmin: auth.isAdmin,
    payload: auth.payload,
  };
}

/**
 * Verify token and get user info from database
 * @param token - JWT token
 * @returns User object or null
 */
export async function getUserFromToken(token: string) {
  try {
    const payload = verifyToken(token);

    if (!payload?.userId) {
      return null;
    }

    const user = await prisma.user.findUnique({
      where: { id: (payload as any).userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        status: true,
      },
    });

    return user;
  } catch (error) {
    return null;
  }
}

/**
 * Verify admin token and get admin info
 * @param token - JWT token
 * @returns Admin object or null
 */
export async function getAdminFromToken(token: string) {
  try {
    const payload = verifyToken(token);

    if (!payload?.adminId) {
      return null;
    }

    const admin = await prisma.admin.findUnique({
      where: { id: (payload as any).adminId },
      select: {
        id: true,
        email: true,
        name: true,
      },
    });

    return admin;
  } catch (error) {
    return null;
  }
}

/**
 * Standardized error response helper
 * @param message - Error message
 * @param status - HTTP status code
 * @param details - Optional additional details
 * @returns NextResponse with error
 */
export function errorResponse(
  message: string,
  status: number = 500,
  details?: any
) {
  return NextResponse.json(
    {
      error: message,
      ...(details && { details }),
    },
    { status }
  );
}

/**
 * Standardized success response helper
 * @param data - Response data
 * @param status - HTTP status code
 * @returns NextResponse with success
 */
export function successResponse(data: any, status: number = 200) {
  return NextResponse.json(data, { status });
}
