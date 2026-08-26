import { jwtDecode } from 'jwt-decode';

export interface CustomJwtPayload {
  sub?: string;
  userId?: string;
  id?: string;
  email?: string;
  roles?: string[];
  role?: string;
  exp?: number;
  iat?: number;
}

/**
 * Decodes a JWT token using jwt-decode library to extract claims such as roles, email, and user ID.
 */
export function decodeJwtToken(token: string): CustomJwtPayload | null {
  if (!token) return null;
  try {
    return jwtDecode<CustomJwtPayload>(token);
  } catch (error) {
    console.error('Failed to decode JWT token:', error);
    return null;
  }
}

/**
 * Extracts array of user roles from a JWT token.
 */
export function extractRolesFromToken(token: string): string[] {
  const payload = decodeJwtToken(token);
  if (!payload) return [];

  if (Array.isArray(payload.roles) && payload.roles.length > 0) {
    return payload.roles;
  }

  if (payload.role) {
    return [payload.role];
  }

  return [];
}
