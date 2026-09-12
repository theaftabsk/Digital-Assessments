import { Injectable, UnauthorizedException, BadRequestException, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreditsService } from '../credits/credits.service';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';
import * as ExcelJS from 'exceljs';

@Injectable()
export class SuperAdminService {
  private readonly logger = new Logger(SuperAdminService.name);

  constructor(
    private prisma: PrismaService,
    private creditsService: CreditsService,
  ) {}

  /**
   * Helper: Generates a strong, random password for newly issued credentials
   */
  generateSecurePassword(length = 12): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%&*';
    let result = '';
    const bytes = crypto.randomBytes(length);
    for (let i = 0; i < length; i++) {
      result += chars[bytes[i] % chars.length];
    }
    return result;
  }

  /**
   * Super Admin Login
   */
  async login(username: string, pass: string) {
    const superAdminUser = process.env.SUPER_ADMIN_USER || 'superadmin';
    const superAdminPass = process.env.SUPER_ADMIN_PASS || 'SuperAdmin@2026';

    if (username === superAdminUser && pass === superAdminPass) {
      return {
        success: true,
        token: `super-admin-token-${Date.now()}`,
        user: {
          username: superAdminUser,
          name: 'Super Administrator',
          role: 'SUPER_ADMIN',
        },
      };
    }

    const admin = await this.prisma.admin.findUnique({
      where: { username },
    });

    if (admin && admin.role === 'SUPER_ADMIN') {
      let isMatch = false;
      if (admin.password.startsWith('$2')) {
        isMatch = await bcrypt.compare(pass, admin.password);
      } else {
        isMatch = admin.password === pass;
      }

      if (isMatch) {
        return {
          success: true,
          token: `super-admin-token-${admin.id}`,
          user: {
            id: admin.id,
            username: admin.username,
            name: admin.name,
            role: admin.role,
          },
        };
      }
    }

    throw new UnauthorizedException('Invalid Super Admin credentials.');
  }

  /**
   * Global Super Admin Dashboard
   */
  async getGlobalDashboard() {
    const tenants = await this.prisma.tenant.findMany({
      include: {
        _count: {
          select: {
            assessments: true,
          },
        },
      },
    });

    const tenantStats = await Promise.all(
      tenants.map(async (t) => {
        return this.creditsService.getTenantStats(t.id);
      }),
    );

    const totalLimit = tenants.reduce((acc, t) => acc + t.creditLimit, 0);
    const totalUsed = tenants.reduce((acc, t) => acc + t.usedCredit, 0);
    const totalRemaining = Math.max(0, totalLimit - totalUsed);

    const totalAssessments = tenantStats.reduce((acc, s) => acc + s.metrics.totalAssessments, 0);
    const totalCandidates = tenantStats.reduce((acc, s) => acc + s.metrics.totalCandidates, 0);
    const totalAttempts = tenantStats.reduce((acc, s) => acc + s.metrics.examAttempts, 0);
    const totalCompleted = tenantStats.reduce((acc, s) => acc + s.metrics.completed, 0);
    const totalInProgress = tenantStats.reduce((acc, s) => acc + s.metrics.inProgress, 0);
    const totalNotStarted = tenantStats.reduce((acc, s) => acc + s.metrics.notStarted, 0);

    return {
      summary: {
        totalCreditLimit: totalLimit,
        totalUsedCredit: totalUsed,
        totalRemainingCredit: totalRemaining,
        totalTenants: tenants.length,
        totalAssessments,
        totalCandidates,
        totalAttempts,
        completed: totalCompleted,
        inProgress: totalInProgress,
        notStarted: totalNotStarted,
      },
      tenants: tenantStats,
    };
  }

  /**
   * Get all tenants with detailed metrics and admins list
   */
  async getAllTenants() {
    const tenants = await this.prisma.tenant.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        admins: {
          select: {
            id: true,
            username: true,
            name: true,
            role: true,
            createdAt: true,
          },
        },
      },
    });

    return Promise.all(
      tenants.map(async (t) => {
        const stats = await this.creditsService.getTenantStats(t.id);
        return {
          ...stats,
          admins: t.admins,
        };
      }),
    );
  }

  /**
   * Get single tenant deep details, metrics, top assessments, admins, and credit history
   */
  async getTenantDetails(tenantId: string) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
      include: {
        admins: {
          select: {
            id: true,
            username: true,
            name: true,
            role: true,
            createdAt: true,
          },
          orderBy: { createdAt: 'desc' },
        },
        assessments: {
          select: {
            id: true,
            name: true,
            slug: true,
            durationMins: true,
            status: true,
            createdAt: true,
            _count: {
              select: {
                candidates: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });

    if (!tenant) throw new NotFoundException('Customer organization not found.');

    const stats = await this.creditsService.getTenantStats(tenant.id);
    const recentCreditHistory = await this.creditsService.getCreditHistory(tenant.id, 1, 50);

    return {
      success: true,
      tenant,
      credit: stats.credit,
      metrics: stats.metrics,
      admins: tenant.admins,
      assessments: tenant.assessments,
      recentCreditHistory: recentCreditHistory.histories || [],
    };
  }

  /**
   * Create a new Tenant + Primary Admin + Initial Credit Quota in an atomic transaction
   */
  async createTenantWithAdmin(dto: {
    name: string;
    slug?: string;
    logoUrl?: string;
    portalTitle?: string;
    primaryColor?: string;
    creditLimit?: number;
    adminName?: string;
    adminUsername: string;
    adminPassword?: string;
    adminRole?: string;
  }) {
    if (!dto.name || !dto.name.trim()) {
      throw new BadRequestException('Organization/Tenant name is required.');
    }
    if (!dto.adminUsername || !dto.adminUsername.trim()) {
      throw new BadRequestException('Admin username/email is required.');
    }

    const cleanName = dto.name.trim();
    const cleanUsername = dto.adminUsername.trim();
    const cleanSlug = (dto.slug && dto.slug.trim() !== '')
      ? dto.slug.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')
      : cleanName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

    // 1. Check Slug Uniqueness
    const existingTenant = await this.prisma.tenant.findUnique({
      where: { slug: cleanSlug },
    });
    if (existingTenant) {
      throw new BadRequestException(`An organization with the identifier '${cleanSlug}' already exists.`);
    }

    // 2. Check Admin Username Uniqueness
    const existingAdmin = await this.prisma.admin.findUnique({
      where: { username: cleanUsername },
    });
    if (existingAdmin) {
      throw new BadRequestException(`An administrator with the username/ID '${cleanUsername}' already exists.`);
    }

    // 3. Prepare Credentials
    const rawPassword = dto.adminPassword && dto.adminPassword.trim() !== ''
      ? dto.adminPassword.trim()
      : this.generateSecurePassword(12);
    const hashedPassword = await bcrypt.hash(rawPassword, 10);
    const creditLimit = Math.max(0, Number(dto.creditLimit) || 500);
    const adminRole = dto.adminRole === 'RECRUITER' ? 'RECRUITER' : 'ADMIN';

    // 4. Atomic Transaction
    const result = await this.prisma.$transaction(async (tx) => {
      const tenant = await tx.tenant.create({
        data: {
          name: cleanName,
          slug: cleanSlug,
          logoUrl: dto.logoUrl?.trim() || null,
          portalTitle: dto.portalTitle?.trim() || `${cleanName} Assessment Portal`,
          primaryColor: dto.primaryColor?.trim() || '#003F72',
          creditLimit,
          usedCredit: 0,
          status: 'ACTIVE',
        },
      });

      const admin = await tx.admin.create({
        data: {
          tenantId: tenant.id,
          username: cleanUsername,
          password: hashedPassword,
          name: dto.adminName?.trim() || `${cleanName} HR Lead`,
          role: adminRole,
        },
      });

      await tx.creditHistory.create({
        data: {
          tenantId: tenant.id,
          type: 'ALLOCATION',
          amount: creditLimit,
          balanceAfter: creditLimit,
          description: `Initial Organization Credit Allocation (${creditLimit} Credits)`,
          adminName: 'Super Admin',
        },
      });

      return { tenant, admin };
    });

    this.logger.log(`Created new SaaS Tenant [${result.tenant.name}] with Admin [${result.admin.username}]`);

    return {
      success: true,
      message: 'Client organization and administrator credentials created successfully.',
      tenant: {
        id: result.tenant.id,
        name: result.tenant.name,
        slug: result.tenant.slug,
        creditLimit: result.tenant.creditLimit,
        status: result.tenant.status,
        createdAt: result.tenant.createdAt,
      },
      admin: {
        id: result.admin.id,
        username: result.admin.username,
        name: result.admin.name,
        role: result.admin.role,
        initialPassword: rawPassword, // RETURNED ONLY ONCE TO SUPER ADMIN
      },
    };
  }

  /**
   * Get all Admins for a Tenant
   */
  async getTenantAdmins(tenantId: string) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
      include: {
        admins: {
          select: {
            id: true,
            tenantId: true,
            username: true,
            name: true,
            role: true,
            createdAt: true,
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!tenant) {
      throw new NotFoundException('Tenant organization not found.');
    }

    return {
      success: true,
      tenant: {
        id: tenant.id,
        name: tenant.name,
        slug: tenant.slug,
        status: tenant.status,
      },
      admins: tenant.admins,
    };
  }

  /**
   * Create/Issue additional Admin credential for an existing Tenant
   */
  async createTenantAdmin(
    tenantId: string,
    dto: {
      username: string;
      name?: string;
      password?: string;
      role?: string;
    },
  ) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
    });
    if (!tenant) {
      throw new NotFoundException('Tenant organization not found.');
    }

    const cleanUsername = dto.username?.trim();
    if (!cleanUsername) {
      throw new BadRequestException('Admin username/ID is required.');
    }

    const existingAdmin = await this.prisma.admin.findUnique({
      where: { username: cleanUsername },
    });
    if (existingAdmin) {
      throw new BadRequestException(`An admin with username '${cleanUsername}' already exists.`);
    }

    const rawPassword = dto.password && dto.password.trim() !== ''
      ? dto.password.trim()
      : this.generateSecurePassword(12);
    const hashedPassword = await bcrypt.hash(rawPassword, 10);
    const role = dto.role === 'RECRUITER' ? 'RECRUITER' : 'ADMIN';

    const admin = await this.prisma.admin.create({
      data: {
        tenantId: tenant.id,
        username: cleanUsername,
        password: hashedPassword,
        name: dto.name?.trim() || `${tenant.name} Administrator`,
        role,
      },
      select: {
        id: true,
        tenantId: true,
        username: true,
        name: true,
        role: true,
        createdAt: true,
      },
    });

    return {
      success: true,
      message: 'New administrator credentials created successfully.',
      admin: {
        ...admin,
        initialPassword: rawPassword, // RETURNED ONLY ONCE TO SUPER ADMIN
      },
    };
  }

  /**
   * Reset an Admin's Password
   */
  async resetAdminPassword(adminId: string, newPassword?: string) {
    const admin = await this.prisma.admin.findUnique({
      where: { id: adminId },
      include: { tenant: true },
    });

    if (!admin) {
      throw new NotFoundException('Admin account not found.');
    }

    const rawPassword = newPassword && newPassword.trim() !== ''
      ? newPassword.trim()
      : this.generateSecurePassword(12);
    const hashedPassword = await bcrypt.hash(rawPassword, 10);

    await this.prisma.admin.update({
      where: { id: adminId },
      data: { password: hashedPassword },
    });

    this.logger.log(`Super Admin reset password for admin [${admin.username}] under tenant [${admin.tenant?.name}]`);

    return {
      success: true,
      message: 'Administrator password reset successfully.',
      adminId: admin.id,
      username: admin.username,
      tenantName: admin.tenant?.name,
      newPassword: rawPassword, // RETURNED ONLY ONCE TO SUPER ADMIN
    };
  }

  /**
   * Suspend or Activate a Tenant
   */
  async updateTenantStatus(tenantId: string, status: string) {
    const validStatuses = ['ACTIVE', 'SUSPENDED'];
    if (!validStatuses.includes(status)) {
      throw new BadRequestException(`Invalid status. Must be 'ACTIVE' or 'SUSPENDED'.`);
    }

    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
    });
    if (!tenant) {
      throw new NotFoundException('Tenant organization not found.');
    }

    const updated = await this.prisma.tenant.update({
      where: { id: tenantId },
      data: { status },
    });

    this.logger.log(`Tenant [${tenant.name}] status updated to [${status}] by Super Admin`);

    return {
      success: true,
      message: `Organization status set to ${status}.`,
      tenant: updated,
    };
  }

  /**
   * Update Client Organization White-Label Settings (Logo, Name, Portal Title, Brand Color)
   */
  async updateTenantWhiteLabel(
    tenantId: string,
    dto: {
      name?: string;
      logoUrl?: string;
      portalTitle?: string;
      primaryColor?: string;
    },
  ) {
    const tenant = await this.prisma.tenant.findUnique({ where: { id: tenantId } });
    if (!tenant) throw new NotFoundException('Tenant organization not found.');

    const updateData: any = {};
    if (dto.name && dto.name.trim()) updateData.name = dto.name.trim();
    if (dto.logoUrl !== undefined) updateData.logoUrl = dto.logoUrl?.trim() || null;
    if (dto.portalTitle !== undefined) updateData.portalTitle = dto.portalTitle?.trim() || null;
    if (dto.primaryColor !== undefined) updateData.primaryColor = dto.primaryColor?.trim() || null;

    const updated = await this.prisma.tenant.update({
      where: { id: tenantId },
      data: updateData,
    });

    this.logger.log(`Tenant [${tenant.name}] white-label branding updated`);

    return {
      success: true,
      message: 'Client organization white-label settings updated successfully.',
      tenant: updated,
    };
  }

  /**
   * Delete a Tenant organization
   */
  async deleteTenant(tenantId: string) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
      include: {
        _count: {
          select: { assessments: true, admins: true },
        },
      },
    });

    if (!tenant) {
      throw new NotFoundException('Tenant organization not found.');
    }

    await this.prisma.tenant.delete({
      where: { id: tenantId },
    });

    this.logger.log(`Tenant [${tenant.name}] deleted by Super Admin`);

    return {
      success: true,
      message: `Tenant organization '${tenant.name}' deleted successfully.`,
    };
  }

  /**
   * Allocate Credits (+500, etc.)
   */
  async allocateCredits(tenantId: string, amount: number, adminName = 'Super Admin', notes?: string) {
    return this.creditsService.allocateCredits(tenantId, amount, adminName, notes);
  }

  /**
   * Adjust Limit with strict safety validation
   */
  async adjustLimit(tenantId: string, newLimit: number, adminName = 'Super Admin', reason?: string) {
    return this.creditsService.adjustCreditLimit(tenantId, newLimit, adminName, reason);
  }

  /**
   * Get Credit Ledger History
   */
  async getCreditHistory(tenantId: string, page = 1, limit = 50, type?: string) {
    return this.creditsService.getCreditHistory(tenantId, page, limit, type);
  }

  /**
   * Update Super Admin Credentials
   */
  async updateCredentials(data: {
    username: string;
    currentPassword?: string;
    newPassword?: string;
  }) {
    const superAdminUser = process.env.SUPER_ADMIN_USER || 'superadmin';
    const superAdminPass = process.env.SUPER_ADMIN_PASS || 'SuperAdmin@2026';

    let admin = await this.prisma.admin.findFirst({
      where: { role: 'SUPER_ADMIN' },
    });

    if (admin) {
      let isMatch = false;
      if (admin.password.startsWith('$2')) {
        isMatch = await bcrypt.compare(data.currentPassword || '', admin.password);
      } else {
        isMatch = admin.password === data.currentPassword || data.currentPassword === superAdminPass;
      }

      if (data.currentPassword && !isMatch && data.currentPassword !== superAdminPass) {
        throw new UnauthorizedException('Current password does not match.');
      }

      const updateData: any = {};
      if (data.username && data.username.trim() !== '') {
        updateData.username = data.username.trim();
      }
      if (data.newPassword && data.newPassword.trim() !== '') {
        updateData.password = await bcrypt.hash(data.newPassword.trim(), 10);
      }

      const updated = await this.prisma.admin.update({
        where: { id: admin.id },
        data: updateData,
      });

      return {
        success: true,
        message: 'Super Admin credentials updated successfully.',
        user: { username: updated.username, name: updated.name, role: updated.role },
      };
    } else {
      let tenant = await this.prisma.tenant.findFirst();
      if (!tenant) {
        tenant = await this.prisma.tenant.create({
          data: { name: 'Niva Bupa Health Insurance', slug: 'niva-bupa' },
        });
      }

      if (data.currentPassword && data.currentPassword !== superAdminPass) {
        throw new UnauthorizedException('Current password does not match.');
      }

      const hashedPassword = await bcrypt.hash(data.newPassword?.trim() || superAdminPass, 10);

      const newAdmin = await this.prisma.admin.create({
        data: {
          tenantId: tenant.id,
          username: data.username.trim() || superAdminUser,
          password: hashedPassword,
          name: 'Super Administrator',
          role: 'SUPER_ADMIN',
        },
      });

      return {
        success: true,
        message: 'Super Admin credentials updated successfully.',
        user: { username: newAdmin.username, name: newAdmin.name, role: newAdmin.role },
      };
    }
  }

  /**
   * System & Server Health Monitor
   */
  async getSystemHealth() {
    let dbStatus = 'CONNECTED';
    let dbLatencyMs = 0;
    try {
      const start = Date.now();
      await this.prisma.$queryRaw`SELECT 1`;
      dbLatencyMs = Date.now() - start;
    } catch {
      dbStatus = 'DISCONNECTED';
      dbLatencyMs = -1;
    }

    const uptimeSec = Math.floor(process.uptime());
    const memUsage = process.memoryUsage();
    const memUsedMb = Math.round(memUsage.heapUsed / 1024 / 1024);
    const memTotalMb = Math.round(memUsage.heapTotal / 1024 / 1024);
    const rssMb = Math.round(memUsage.rss / 1024 / 1024);

    const activeTenantsCount = await this.prisma.tenant.count({ where: { status: 'ACTIVE' } });
    const suspendedTenantsCount = await this.prisma.tenant.count({ where: { status: 'SUSPENDED' } });
    const totalAssessments = await this.prisma.assessment.count();
    const totalCandidates = await this.prisma.candidate.count({ where: { isDeleted: false } });
    const inProgressAttempts = await this.prisma.examAttempt.count({ where: { status: 'IN_PROGRESS' } });
    const completedAttempts = await this.prisma.examAttempt.count({ where: { status: 'COMPLETED' } });

    return {
      success: true,
      status: dbStatus === 'CONNECTED' ? 'HEALTHY' : 'DEGRADED',
      serverTime: new Date().toISOString(),
      dbStatus,
      dbLatencyMs,
      uptimeSec,
      memory: {
        usedMb: memUsedMb,
        totalMb: memTotalMb,
        rssMb,
      },
      creditEngineStatus: 'OPERATIONAL',
      counts: {
        activeTenants: activeTenantsCount,
        suspendedTenants: suspendedTenantsCount,
        totalAssessments,
        totalCandidates,
        inProgressAttempts,
        completedAttempts,
      },
    };
  }

  /**
   * Export complete customer / tenant data as an Excel workbook
   */
  async exportTenantData(tenantId: string): Promise<{ buffer: ExcelJS.Buffer; filename: string }> {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
      include: {
        admins: { select: { username: true, name: true, role: true, createdAt: true } },
        assessments: {
          include: {
            candidates: {
              where: { isDeleted: false },
              include: {
                attempts: { orderBy: { startedAt: 'desc' }, take: 1 },
              },
            },
          },
        },
        creditHistories: { orderBy: { createdAt: 'desc' }, take: 200 },
      },
    });

    if (!tenant) throw new NotFoundException('Tenant not found.');

    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'GreatCampus Super Admin';
    workbook.created = new Date();

    // Sheet 1: Tenant Overview
    const s1 = workbook.addWorksheet('Tenant Overview');
    s1.columns = [
      { header: 'Property', key: 'prop', width: 28 },
      { header: 'Value', key: 'val', width: 45 },
    ];
    s1.addRow({ prop: 'Tenant ID', val: tenant.id });
    s1.addRow({ prop: 'Organization Name', val: tenant.name });
    s1.addRow({ prop: 'URL Identifier (Slug)', val: tenant.slug });
    s1.addRow({ prop: 'Status', val: tenant.status });
    s1.addRow({ prop: 'Total Credit Limit', val: tenant.creditLimit });
    s1.addRow({ prop: 'Used Credits', val: tenant.usedCredit });
    s1.addRow({ prop: 'Remaining Balance', val: Math.max(0, tenant.creditLimit - tenant.usedCredit) });
    s1.addRow({ prop: 'Export Generated At', val: new Date().toISOString() });

    // Sheet 2: Candidates & Results
    const s2 = workbook.addWorksheet('Candidates & Results');
    s2.columns = [
      { header: 'S.No', key: 'sno', width: 8 },
      { header: 'Candidate Name', key: 'name', width: 26 },
      { header: 'Email', key: 'email', width: 30 },
      { header: 'Phone', key: 'phone', width: 18 },
      { header: 'Application ID', key: 'appId', width: 22 },
      { header: 'Assessment', key: 'assessment', width: 32 },
      { header: 'Status', key: 'status', width: 16 },
      { header: 'Score', key: 'score', width: 12 },
      { header: 'Percentage', key: 'pct', width: 14 },
      { header: 'Result', key: 'result', width: 14 },
      { header: 'Warnings', key: 'warnings', width: 12 },
      { header: 'Registered Date', key: 'created', width: 22 },
    ];

    let sno = 1;
    tenant.assessments.forEach((ass) => {
      ass.candidates.forEach((c) => {
        const att = c.attempts?.[0];
        s2.addRow({
          sno: sno++,
          name: c.name,
          email: c.email,
          phone: c.phone || '—',
          appId: c.applicationId || c.referenceId || '—',
          assessment: ass.name,
          status: c.status,
          score: att ? att.score : 0,
          pct: att ? `${att.percentage}%` : '0%',
          result: att ? (att.isPassed ? 'PASSED' : 'FAILED') : 'NOT STARTED',
          warnings: att ? att.warningCount : 0,
          created: c.createdAt.toISOString().split('T')[0],
        });
      });
    });

    // Sheet 3: Assessments
    const s3 = workbook.addWorksheet('Assessments');
    s3.columns = [
      { header: 'Assessment ID', key: 'id', width: 36 },
      { header: 'Assessment Name', key: 'name', width: 32 },
      { header: 'Slug', key: 'slug', width: 24 },
      { header: 'Duration (Mins)', key: 'duration', width: 16 },
      { header: 'Passing %', key: 'passing', width: 14 },
      { header: 'Status', key: 'status', width: 14 },
      { header: 'Total Candidates', key: 'totalCand', width: 18 },
    ];
    tenant.assessments.forEach((ass) => {
      s3.addRow({
        id: ass.id,
        name: ass.name,
        slug: ass.slug,
        duration: ass.durationMins,
        passing: `${ass.passingPercentage}%`,
        status: ass.status,
        totalCand: ass.candidates.length,
      });
    });

    // Sheet 4: Credit History
    const s4 = workbook.addWorksheet('Credit Ledger');
    s4.columns = [
      { header: 'Timestamp', key: 'ts', width: 22 },
      { header: 'Action Type', key: 'type', width: 18 },
      { header: 'Amount', key: 'amount', width: 14 },
      { header: 'Balance After', key: 'balance', width: 16 },
      { header: 'Description', key: 'desc', width: 40 },
      { header: 'Admin / Actor', key: 'admin', width: 22 },
    ];
    tenant.creditHistories.forEach((ch) => {
      s4.addRow({
        ts: ch.createdAt.toISOString(),
        type: ch.type,
        amount: ch.amount > 0 ? `+${ch.amount}` : `${ch.amount}`,
        balance: ch.balanceAfter,
        desc: ch.description,
        admin: ch.adminName || 'System',
      });
    });

    const buffer = await workbook.xlsx.writeBuffer();
    const safeTenantName = tenant.name.replace(/[^a-zA-Z0-9_-]/g, '_');
    const filename = `${safeTenantName}_Full_Archive_${Date.now()}.xlsx`;

    return { buffer, filename };
  }

  /**
   * Purge / Clean all candidate test data for a tenant while preserving tenant & admin accounts
   */
  async purgeTenantData(tenantId: string) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
      include: {
        assessments: { select: { id: true } },
      },
    });

    if (!tenant) throw new NotFoundException('Tenant organization not found.');

    const assessmentIds = tenant.assessments.map((a) => a.id);

    // Delete all candidates under this tenant's assessments
    const deleteResult = await this.prisma.candidate.deleteMany({
      where: {
        assessmentId: { in: assessmentIds },
      },
    });

    // Reset usedCredit back to 0
    await this.prisma.tenant.update({
      where: { id: tenantId },
      data: { usedCredit: 0 },
    });

    // Log credit adjustment record
    await this.prisma.creditHistory.create({
      data: {
        tenantId: tenant.id,
        type: 'ADJUSTMENT',
        amount: 0,
        balanceAfter: tenant.creditLimit,
        description: `Super Admin purged all test candidate data (${deleteResult.count} candidates cleared)`,
        adminName: 'Super Admin',
      },
    });

    this.logger.warn(`Tenant [${tenant.name}] data purged by Super Admin. ${deleteResult.count} candidates deleted.`);

    return {
      success: true,
      message: `Tenant data wiped cleanly. ${deleteResult.count} candidate records purged, used credits reset to 0.`,
      purgedCandidatesCount: deleteResult.count,
    };
  }
}
