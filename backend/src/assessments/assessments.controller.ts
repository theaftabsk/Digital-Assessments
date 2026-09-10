import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  Req,
  ForbiddenException,
} from '@nestjs/common';
import { AssessmentsService } from './assessments.service';
import { extractAuthContext } from '../auth/tenant-extractor';

@Controller('api/v1/assessments')
export class AssessmentsController {
  constructor(private readonly assessmentsService: AssessmentsService) {}

  @Get()
  async getAssessments(
    @Query('vendorId') vendorId?: string,
    @Req() req?: any,
  ) {
    const auth = extractAuthContext(req);
    const effectiveVendorId = vendorId || auth.vendorId;
    const data = await this.assessmentsService.getAssessments(effectiveVendorId, auth.tenantId);
    return { success: true, assessments: data };
  }

  @Get(':id')
  async getAssessmentById(@Param('id') id: string, @Req() req?: any) {
    const auth = extractAuthContext(req);
    // Public exam session links (by slug) can be accessed by candidates without tenant header,
    // but if an authenticated admin calls it, it verifies tenant ownership.
    const data = await this.assessmentsService.getAssessmentById(id, auth.tenantId);
    return { success: true, assessment: data };
  }

  @Post('save')
  async saveAssessment(
    @Body()
    body: {
      id?: string;
      name: string;
      slug?: string;
      description?: string;
      durationMins?: number;
      activeFrom?: string;
      activeUntil?: string;
      passingPercentage?: number;
      maxProctorWarnings?: number;
      status?: string;
      assignedVendorIds?: string[];
    },
    @Req() req?: any,
  ) {
    const auth = extractAuthContext(req);
    if (auth.role === 'VENDOR') {
      throw new ForbiddenException("You don't have permission to create or modify assessments. Only Admin can manage assessments.");
    }
    const assessment = await this.assessmentsService.saveAssessment(body, auth.role, auth.tenantId);
    return { success: true, assessment };
  }

  @Post()
  async createAssessment(
    @Body()
    body: {
      id?: string;
      name: string;
      slug?: string;
      description?: string;
      durationMins?: number;
      activeFrom?: string;
      activeUntil?: string;
      passingPercentage?: number;
      maxProctorWarnings?: number;
      status?: string;
      assignedVendorIds?: string[];
    },
    @Req() req?: any,
  ) {
    const auth = extractAuthContext(req);
    if (auth.role === 'VENDOR') {
      throw new ForbiddenException("You don't have permission to create or modify assessments. Only Admin can manage assessments.");
    }
    const assessment = await this.assessmentsService.saveAssessment(body, auth.role, auth.tenantId);
    return { success: true, assessment };
  }

  @Put(':id')
  async updateAssessment(
    @Param('id') id: string,
    @Body()
    body: {
      name?: string;
      description?: string;
      durationMins?: number;
      activeFrom?: string;
      activeUntil?: string;
      passingPercentage?: number;
      maxProctorWarnings?: number;
      status?: string;
      assignedVendorIds?: string[];
    },
    @Req() req?: any,
  ) {
    const auth = extractAuthContext(req);
    if (auth.role === 'VENDOR') {
      throw new ForbiddenException("You don't have permission to modify assessments. Only Admin can manage assessments.");
    }
    const assessment = await this.assessmentsService.saveAssessment(
      { id, ...body, name: body.name || 'Assessment' },
      auth.role,
      auth.tenantId,
    );
    return { success: true, assessment };
  }

  @Delete(':id')
  async deleteAssessment(@Param('id') id: string, @Req() req?: any) {
    const auth = extractAuthContext(req);
    if (auth.role === 'VENDOR') {
      throw new ForbiddenException("You don't have permission to delete assessments. Only Admin can manage assessments.");
    }
    await this.assessmentsService.deleteAssessment(id, auth.role, auth.tenantId);
    return { success: true, message: 'Assessment archived/deleted' };
  }
}
