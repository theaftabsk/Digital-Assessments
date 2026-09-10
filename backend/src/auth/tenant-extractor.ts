import { ExecutionContext, createParamDecorator } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';

export interface AuthContext {
  userId?: string;
  username?: string;
  role?: string;
  tenantId?: string;
  tenantSlug?: string;
  tenantName?: string;
  vendorId?: string;
}

export function extractAuthContext(req: any): AuthContext {
  // 1. If Passport JwtStrategy already attached req.user
  if (req?.user) {
    return {
      userId: req.user.userId || req.user.sub,
      username: req.user.username,
      role: req.user.role,
      tenantId: req.user.tenantId,
      tenantSlug: req.user.tenantSlug,
      tenantName: req.user.tenantName,
      vendorId: req.user.vendorId,
    };
  }

  // 2. Otherwise extract and decode Bearer token if present
  const authHeader = req?.headers?.authorization || req?.headers?.Authorization;
  if (authHeader && typeof authHeader === 'string' && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7).trim();
    try {
      const decoded: any = jwt.decode(token);
      if (decoded) {
        return {
          userId: decoded.sub || decoded.userId,
          username: decoded.username,
          role: decoded.role,
          tenantId: decoded.tenantId,
          tenantSlug: decoded.tenantSlug,
          tenantName: decoded.tenantName,
          vendorId: decoded.vendorId,
        };
      }
    } catch {
      // ignore decode error
    }
  }

  // 3. Fallback to custom header x-user-role / x-vendor-id if provided
  const headerRole = req?.headers?.['x-user-role'] || req?.headers?.['X-User-Role'];
  const headerVendor = req?.headers?.['x-vendor-id'] || req?.headers?.['X-Vendor-Id'];

  return {
    role: headerRole,
    vendorId: headerVendor,
  };
}
