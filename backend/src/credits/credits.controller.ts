import { Controller, Get, Param, Query, Req } from '@nestjs/common';
import { CreditsService } from './credits.service';
import { extractAuthContext } from '../auth/tenant-extractor';

@Controller('api/v1/credits')
export class CreditsController {
  constructor(private readonly creditsService: CreditsService) {}

  @Get('quota')
  async getQuota(@Req() req?: any) {
    const auth = extractAuthContext(req);
    let tenantId = auth.tenantId;
    if (!tenantId) {
      const defaultTenant = await this.creditsService.getOrCreateDefaultTenant();
      tenantId = defaultTenant.id;
    }
    const stats = await this.creditsService.getTenantStats(tenantId);
    return {
      success: true,
      ...stats,
    };
  }

  @Get('history')
  async getHistory(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('type') type?: string,
    @Query('search') search?: string,
    @Req() req?: any,
  ) {
    const auth = extractAuthContext(req);
    let tenantId = auth.tenantId;
    if (!tenantId) {
      const defaultTenant = await this.creditsService.getOrCreateDefaultTenant();
      tenantId = defaultTenant.id;
    }
    const pageNum = parseInt(page || '1', 10);
    const limitNum = parseInt(limit || '50', 10);
    const result = await this.creditsService.getCreditHistory(tenantId, pageNum, limitNum, type, search);
    return {
      success: true,
      ...result,
    };
  }

  @Get('quota/:tenantId')
  async getTenantQuota(@Param('tenantId') tenantId: string) {
    const stats = await this.creditsService.getTenantStats(tenantId);
    return {
      success: true,
      ...stats,
    };
  }
}
