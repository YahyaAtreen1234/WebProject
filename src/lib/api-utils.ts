/**
 * API utility helpers for consistent request/response handling
 */

import { NextResponse } from 'next/server';
import { z } from 'zod';

/**
 * Standardized success response
 */
export function apiSuccess<T>(data: T, status = 200) {
  return NextResponse.json(data, { status });
}

/**
 * Standardized error response
 */
export function apiError(
  message: string,
  status = 500,
  details?: Record<string, any>
) {
  return NextResponse.json(
    {
      success: false,
      error: message,
      ...(details && { details }),
    },
    { status }
  );
}

/**
 * Validate input using Zod schema
 * @param schema - Zod schema to validate against
 * @param data - Data to validate
 * @returns Validation result with data or error details
 */
export function validateInput<T>(
  schema: z.ZodSchema,
  data: unknown
): { success: boolean; data?: T; error?: string; details?: Record<string, any> } {
  try {
    const result = schema.parse(data);
    return { success: true, data: result as T };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const details: Record<string, any> = {};
      error.issues.forEach((err) => {
        const path = err.path.join('.');
        details[path || 'root'] = err.message;
      });
      return {
        success: false,
        error: 'Validation failed',
        details,
      };
    }
    return {
      success: false,
      error: 'Invalid input',
    };
  }
}

/**
 * Parse and validate JSON body
 */
export async function parseJSONBody(request: Request) {
  try {
    return await request.json();
  } catch (error) {
    throw new Error('Invalid JSON in request body');
  }
}

/**
 * Safe JSON parse with default value
 */
export function safeJSONParse<T = any>(json: string, defaultValue: T): T {
  try {
    return JSON.parse(json);
  } catch {
    return defaultValue;
  }
}

/**
 * Handle API errors with logging
 */
export function handleAPIError(
  error: unknown,
  context: string = 'API'
): { message: string; status: number } {
  if (error instanceof z.ZodError) {
    return {
      message: 'Validation error',
      status: 400,
    };
  }

  if (error instanceof SyntaxError) {
    return {
      message: 'Invalid JSON format',
      status: 400,
    };
  }

  if (error instanceof Error) {
    console.error(`${context} Error:`, error.message);

    // Common error patterns
    if (error.message.includes('not found')) {
      return { message: 'Not found', status: 404 };
    }
    if (error.message.includes('Unauthorized')) {
      return { message: 'Unauthorized', status: 401 };
    }
    if (error.message.includes('Forbidden')) {
      return { message: 'Forbidden', status: 403 };
    }

    return {
      message: error.message || 'Internal server error',
      status: 500,
    };
  }

  console.error(`${context} Unknown Error:`, error);
  return {
    message: 'Internal server error',
    status: 500,
  };
}

/**
 * Create error response from caught exception
 */
export function createErrorResponse(
  error: unknown,
  context: string = 'API'
) {
  const { message, status } = handleAPIError(error, context);
  return apiError(message, status);
}

/**
 * Validate required fields
 */
export function validateRequired(
  obj: Record<string, any>,
  fields: string[]
): { valid: boolean; missing?: string[] } {
  const missing = fields.filter((field) => !obj[field]);
  return {
    valid: missing.length === 0,
    missing: missing.length > 0 ? missing : undefined,
  };
}

/**
 * Paginate array results
 */
export function paginate<T>(
  items: T[],
  page: number = 1,
  limit: number = 10
): {
  items: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
    hasMore: boolean;
  };
} {
  const total = items.length;
  const pages = Math.ceil(total / limit);
  const start = (page - 1) * limit;
  const end = start + limit;

  return {
    items: items.slice(start, end),
    pagination: {
      page,
      limit,
      total,
      pages,
      hasMore: page < pages,
    },
  };
}

/**
 * Sanitize object for API response (remove sensitive fields)
 */
export function sanitize<T extends Record<string, any>>(
  obj: T,
  fieldsToRemove: string[] = ['password', 'token', 'secret']
): Partial<T> {
  const sanitized = { ...obj };
  fieldsToRemove.forEach((field) => {
    delete sanitized[field];
  });
  return sanitized;
}

/**
 * Create API response wrapper
 */
export function createResponse<T = any>(
  success: boolean,
  data?: T,
  error?: string,
  meta?: Record<string, any>
) {
  return {
    success,
    ...(data && { data }),
    ...(error && { error }),
    ...(meta && { meta }),
  };
}
