import { Injectable, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'banca-arm-nest-secret-key-2026',
    });
  }

  async validate(payload: any) {
    if (!payload) throw new UnauthorizedException('Missing token payload.');

    // Super Admin global scope
    if (payload.role === 'SUPER_ADMIN') {
      return {
        userId: payload.sub,
        username: payload.username,
        role: payload.role,
        name: payload.name || 'Super Administrator',
      };
    }

    // Tenant-scoped User (Admin / Recruiter / Vendor)
    if (payload.tenantId) {
      const tenant = await this.prisma.tenant.findUnique({
        where: { id: payload.tenantId },
        select: {
          id: true,
          name: true,
          slug: true,
          status: true,
          creditLimit: true,
          usedCredit: true,
        },
      });

      if (!tenant) {
        throw new UnauthorizedException('Tenant organization not found.');
      }

      // Reject suspended tenant in real-time
      if (tenant.status === 'SUSPENDED') {
        throw new ForbiddenException('Your organization account has been suspended. Please contact the Super Administrator.');
      }

      return {
        userId: payload.sub,
        username: payload.username,
        role: payload.role,
        name: payload.name,
        tenantId: tenant.id,
        tenantSlug: tenant.slug,
        tenantName: tenant.name,
        tenant,
        vendorId: payload.vendorId,
        vendorCode: payload.vendorCode,
      };
    }

    return {
      userId: payload.sub,
      username: payload.username,
      role: payload.role,
      name: payload.name,
      vendorId: payload.vendorId,
    };
  }
}
