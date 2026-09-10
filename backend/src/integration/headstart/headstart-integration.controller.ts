import { Controller, Get, Post, Body, Query, Logger, Headers, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Controller('api/v1/integration/headstart')
export class HeadstartIntegrationController {
  private readonly logger = new Logger(HeadstartIntegrationController.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * API 3: Active Assessments API (OUT)
   * Provides list of currently active assessments so candidates can be assigned from Headstart CRM.
   */
  @Get('assessments/active')
  async getActiveAssessments(
    @Headers('x-api-key') apiKeyHeader?: string,
    @Headers('authorization') authHeader?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    this.logger.log(`API 3 (OUT): Fetching Active Assessments for Headstart CRM.`);

    // Inbound API Key Validation Guard
    const requiredApiKey = process.env.HEADSTART_INBOUND_API_KEY || process.env.HEADSTART_CRM_API_KEY;
    if (requiredApiKey) {
      const providedKey = apiKeyHeader || (authHeader ? authHeader.replace(/^Bearer\s+/i, '') : null);
      if (!providedKey || providedKey !== requiredApiKey) {
        throw new UnauthorizedException('Invalid or missing Headstart API key.');
      }
    }

    try {
      const now = new Date();
      const allAssessments = await this.prisma.assessment.findMany({
        where: {
          status: 'ACTIVE',
        },
        select: {
          id: true,
          name: true,
          slug: true,
          description: true,
          durationMins: true,
          status: true,
          activeFrom: true,
          activeUntil: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
      });

      // Filter assessments active within scheduled window (if set)
      const activeAssessments = allAssessments.filter((a) => {
        if (a.activeFrom && now < new Date(a.activeFrom)) return false;
        if (a.activeUntil && now > new Date(a.activeUntil)) return false;
        return true;
      });

      const candidatePortalUrl = process.env.CANDIDATE_PORTAL_URL || 'http://localhost:3000';

      const formatted = activeAssessments.map((a) => {
        const slugOrId = a.slug || a.id;
        return {
          assessmentId: a.id,
          assessmentName: a.name,
          assessmentSlug: a.slug,
          assessmentLink: `${candidatePortalUrl}/${slugOrId}`,
          duration: `${a.durationMins || 45} Mins`,
          durationMins: a.durationMins || 45,
          totalQuestions: 60,
          status: 'ACTIVE',
          activeFrom: a.activeFrom,
          activeUntil: a.activeUntil,
          createdAt: a.createdAt,
        };
      });

      return {
        success: true,
        count: formatted.length,
        data: formatted,
      };
    } catch (error) {
      this.logger.error(`API 3 Error: ${error.message}`);
      return {
        success: false,
        message: 'Failed to retrieve active assessments.',
        error: error.message,
      };
    }
  }

  /**
   * Configuration Endpoint (Get/Update CRM API settings)
   */
  @Get('config')
  async getConfig() {
    const config = await this.prisma.integrationConfig.findFirst();
    return { success: true, config: config || null };
  }

  @Post('config')
  async saveConfig(@Body() body: any) {
    const tenant = await this.prisma.tenant.findFirst();
    const tenantId = tenant?.id || 'default-tenant';

    const updated = await this.prisma.integrationConfig.upsert({
      where: { tenantId },
      update: {
        crmBaseUrl: body.crmBaseUrl,
        crmApiKey: body.crmApiKey,
        api1Endpoint: body.api1Endpoint,
        api2Endpoint: body.api2Endpoint,
        webhookStatusUrl: body.webhookStatusUrl,
        webhookResultUrl: body.webhookResultUrl,
        webhookReportUrl: body.webhookReportUrl,
      },
      create: {
        tenantId,
        crmBaseUrl: body.crmBaseUrl || 'https://api.headstartcrm.com',
        crmApiKey: body.crmApiKey,
        api1Endpoint: body.api1Endpoint || '/api/candidates/verify',
        api2Endpoint: body.api2Endpoint || '/api/candidates/check-assignment',
        webhookStatusUrl: body.webhookStatusUrl,
        webhookResultUrl: body.webhookResultUrl,
        webhookReportUrl: body.webhookReportUrl,
      },
    });

    return { success: true, config: updated };
  }
}
