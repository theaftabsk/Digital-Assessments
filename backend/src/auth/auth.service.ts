import { Injectable, UnauthorizedException, ForbiddenException, BadRequestException, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async validateAdmin(usernameOrEmail: string, pass: string) {
    if (!usernameOrEmail || !pass) {
      throw new UnauthorizedException('Username/Email and Password are required.');
    }

    const cleanInput = usernameOrEmail.trim();
    const cleanLower = cleanInput.toLowerCase();

    // 1. Check Admin Table
    const admin = await this.prisma.admin.findFirst({
      where: {
        username: { equals: cleanInput, mode: 'insensitive' },
      },
      include: {
        tenant: true,
      },
    });

    if (admin) {
      // Check tenant suspension status for non-superadmin
      if (admin.role !== 'SUPER_ADMIN' && admin.tenant && admin.tenant.status === 'SUSPENDED') {
        throw new ForbiddenException(
          'Your organization account has been suspended. Please contact the Super Administrator.',
        );
      }

      let isMatch = false;
      if (admin.password.startsWith('$2')) {
        isMatch = await bcrypt.compare(pass, admin.password);
      } else {
        // Legacy plaintext check -> auto-upgrade to bcrypt hash
        isMatch = admin.password === pass;
        if (isMatch) {
          const newHashed = await bcrypt.hash(pass, 10);
          await this.prisma.admin.update({
            where: { id: admin.id },
            data: { password: newHashed },
          });
        }
      }

      if (isMatch) {
        const payload = {
          username: admin.username,
          sub: admin.id,
          role: admin.role || 'ADMIN',
          name: admin.name,
          tenantId: admin.tenantId,
          tenantSlug: admin.tenant?.slug,
          tenantName: admin.tenant?.name,
        };

        return {
          access_token: this.jwtService.sign(payload),
          user: {
            id: admin.id,
            username: admin.username,
            name: admin.name,
            role: admin.role || 'ADMIN',
            tenantId: admin.tenantId,
            tenantSlug: admin.tenant?.slug,
            tenantName: admin.tenant?.name,
            tenant: admin.tenant
              ? {
                  id: admin.tenant.id,
                  name: admin.tenant.name,
                  slug: admin.tenant.slug,
                  logoUrl: admin.tenant.logoUrl,
                  portalTitle: admin.tenant.portalTitle,
                  primaryColor: admin.tenant.primaryColor,
                  creditLimit: admin.tenant.creditLimit,
                  usedCredit: admin.tenant.usedCredit,
                  remainingCredit: Math.max(0, admin.tenant.creditLimit - admin.tenant.usedCredit),
                  status: admin.tenant.status,
                }
              : null,
          },
        };
      }
    }

    // 2. Check Vendor Table
    const vendor = await this.prisma.vendor.findFirst({
      where: {
        OR: [
          { email: { equals: cleanLower, mode: 'insensitive' } },
          { vendorCode: { equals: cleanInput, mode: 'insensitive' } },
        ],
      },
    });

    if (vendor) {
      if (vendor.status !== 'ACTIVE') {
        throw new UnauthorizedException('Your Vendor account is inactive or suspended. Please contact HR Administrator.');
      }

      // Check vendor's tenant status if assigned
      if (vendor.tenantId && vendor.tenantId !== 'default-tenant') {
        const tenant = await this.prisma.tenant.findUnique({
          where: { id: vendor.tenantId },
        });
        if (tenant && tenant.status === 'SUSPENDED') {
          throw new ForbiddenException('Your organization account has been suspended. Please contact the Super Administrator.');
        }
      }

      let isMatch = false;
      if (vendor.passwordHash && vendor.passwordHash.startsWith('$2')) {
        isMatch = await bcrypt.compare(pass, vendor.passwordHash);
      } else if (vendor.passwordHash) {
        isMatch = vendor.passwordHash === pass;
        if (isMatch) {
          const newHashed = await bcrypt.hash(pass, 10);
          await this.prisma.vendor.update({
            where: { id: vendor.id },
            data: { passwordHash: newHashed },
          });
        }
      }

      if (isMatch) {
        const payload = {
          sub: vendor.id,
          username: vendor.email,
          email: vendor.email,
          name: vendor.name,
          role: 'VENDOR',
          tenantId: vendor.tenantId,
          vendorId: vendor.id,
          vendorCode: vendor.vendorCode,
        };
        return {
          access_token: this.jwtService.sign(payload),
          user: {
            id: vendor.id,
            username: vendor.email,
            email: vendor.email,
            name: vendor.name,
            role: 'VENDOR',
            tenantId: vendor.tenantId,
            vendorId: vendor.id,
            vendorCode: vendor.vendorCode,
          },
        };
      }
    }

    throw new UnauthorizedException('Invalid username, email, or password.');
  }

  /**
   * Fetch logged-in admin user and tenant details
   */
  async getAdminProfile(userId: string) {
    const admin = await this.prisma.admin.findUnique({
      where: { id: userId },
      include: { tenant: true },
    });

    if (!admin) {
      throw new NotFoundException('Admin user not found.');
    }

    return {
      success: true,
      user: {
        id: admin.id,
        username: admin.username,
        name: admin.name,
        role: admin.role,
        tenantId: admin.tenantId,
        tenant: admin.tenant
          ? {
              id: admin.tenant.id,
              name: admin.tenant.name,
              slug: admin.tenant.slug,
              logoUrl: admin.tenant.logoUrl,
              portalTitle: admin.tenant.portalTitle,
              primaryColor: admin.tenant.primaryColor,
              creditLimit: admin.tenant.creditLimit,
              usedCredit: admin.tenant.usedCredit,
              remainingCredit: Math.max(0, admin.tenant.creditLimit - admin.tenant.usedCredit),
              status: admin.tenant.status,
            }
          : null,
      },
    };
  }

  /**
   * Fetch current tenant credits & quota
   */
  async getTenantCredits(tenantId: string) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
    });

    if (!tenant) {
      throw new NotFoundException('Tenant not found.');
    }

    const remaining = Math.max(0, tenant.creditLimit - tenant.usedCredit);

    return {
      success: true,
      tenantId: tenant.id,
      tenantName: tenant.name,
      tenantSlug: tenant.slug,
      creditLimit: tenant.creditLimit,
      usedCredit: tenant.usedCredit,
      remainingCredit: remaining,
      status: tenant.status,
    };
  }

  async updateAdminCredentials(data: { username: string; newPassword?: string; currentPassword?: string }) {
    const admin = await this.prisma.admin.findFirst({
      where: { role: { not: 'SUPER_ADMIN' } },
    });

    if (!admin) {
      throw new BadRequestException('No admin account found to update.');
    }

    if (data.currentPassword) {
      let isCurrentValid = false;
      if (admin.password.startsWith('$2')) {
        isCurrentValid = await bcrypt.compare(data.currentPassword, admin.password);
      } else {
        isCurrentValid = admin.password === data.currentPassword;
      }

      if (!isCurrentValid) {
        throw new UnauthorizedException('Current password is incorrect.');
      }
    }

    const updateData: any = {};
    if (data.username && data.username.trim() !== '') {
      updateData.username = data.username.trim();
    }
    if (data.newPassword && data.newPassword.trim() !== '') {
      updateData.password = await bcrypt.hash(data.newPassword.trim(), 10);
    }

    const updatedAdmin = await this.prisma.admin.update({
      where: { id: admin.id },
      data: updateData,
    });

    return {
      success: true,
      message: 'HR Admin login credentials updated and secured with bcrypt.',
      admin: {
        id: updatedAdmin.id,
        username: updatedAdmin.username,
        name: updatedAdmin.name,
      },
    };
  }
}
