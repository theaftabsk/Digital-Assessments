import { Controller, Get, Post, Put, Patch, Delete, Body, Param, Query } from '@nestjs/common';
import { SuperAdminService } from './super-admin.service';

@Controller('api/v1/super-admin')
export class SuperAdminController {
  constructor(private readonly superAdminService: SuperAdminService) {}

  @Post('auth/login')
  async login(@Body() body: { username: string; pass: string }) {
    return this.superAdminService.login(body.username, body.pass);
  }

  @Post('auth/update-credentials')
  async updateCredentials(
    @Body() body: { username: string; currentPassword?: string; newPassword?: string },
  ) {
    return this.superAdminService.updateCredentials(body);
  }

  @Get('dashboard')
  async getDashboard() {
    return this.superAdminService.getGlobalDashboard();
  }

  // --- TENANT MANAGEMENT ---

  @Get('tenants')
  async getAllTenants() {
    const tenants = await this.superAdminService.getAllTenants();
    return { success: true, tenants };
  }

  @Post('tenants')
  async createTenant(
    @Body()
    body: {
      name: string;
      slug?: string;
      creditLimit?: number;
      adminName?: string;
      adminUsername: string;
      adminPassword?: string;
      adminRole?: string;
    },
  ) {
    return this.superAdminService.createTenantWithAdmin(body);
  }

  @Patch('tenants/:id/status')
  async updateTenantStatus(
    @Param('id') tenantId: string,
    @Body() body: { status: string },
  ) {
    return this.superAdminService.updateTenantStatus(tenantId, body.status);
  }

  @Put('tenants/:id/white-label')
  async updateTenantWhiteLabel(
    @Param('id') tenantId: string,
    @Body()
    body: {
      name?: string;
      logoUrl?: string;
      portalTitle?: string;
      primaryColor?: string;
    },
  ) {
    return this.superAdminService.updateTenantWhiteLabel(tenantId, body);
  }

  @Delete('tenants/:id')
  async deleteTenant(@Param('id') tenantId: string) {
    return this.superAdminService.deleteTenant(tenantId);
  }

  // --- TENANT ADMIN CREDENTIALS MANAGEMENT ---

  @Get('tenants/:id/admins')
  async getTenantAdmins(@Param('id') tenantId: string) {
    return this.superAdminService.getTenantAdmins(tenantId);
  }

  @Post('tenants/:id/admins')
  async createTenantAdmin(
    @Param('id') tenantId: string,
    @Body()
    body: {
      username: string;
      name?: string;
      password?: string;
      role?: string;
    },
  ) {
    return this.superAdminService.createTenantAdmin(tenantId, body);
  }

  @Put('admins/:id/reset-password')
  async resetAdminPassword(
    @Param('id') adminId: string,
    @Body() body: { newPassword?: string },
  ) {
    return this.superAdminService.resetAdminPassword(adminId, body?.newPassword);
  }

  // --- CREDIT QUOTA & ALLOCATION ---

  @Post('tenants/:id/credits/allocate')
  async allocateCredits(
    @Param('id') tenantId: string,
    @Body() body: { amount: number; adminName?: string; notes?: string },
  ) {
    const result = await this.superAdminService.allocateCredits(
      tenantId,
      body.amount,
      body.adminName || 'Super Admin',
      body.notes,
    );
    return result;
  }

  @Post('tenants/:id/credits/adjust')
  async adjustLimit(
    @Param('id') tenantId: string,
    @Body() body: { newLimit: number; adminName?: string; reason?: string },
  ) {
    const result = await this.superAdminService.adjustLimit(
      tenantId,
      body.newLimit,
      body.adminName || 'Super Admin',
      body.reason,
    );
    return result;
  }

  @Get('tenants/:id/credit-history')
  async getCreditHistory(
    @Param('id') tenantId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('type') type?: string,
  ) {
    const pageNum = parseInt(page || '1', 10);
    const limitNum = parseInt(limit || '50', 10);
    const result = await this.superAdminService.getCreditHistory(tenantId, pageNum, limitNum, type);
    return { success: true, ...result };
  }
}
