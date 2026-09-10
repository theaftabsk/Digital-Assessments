import { Controller, Get, UseGuards, Req, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';

@Controller('api/v1/admin')
export class AdminController {
  constructor(private authService: AuthService) {}

  @Get('me')
  @UseGuards(AuthGuard('jwt'))
  async getProfile(@Req() req: any) {
    if (!req.user || !req.user.userId) {
      throw new UnauthorizedException('Authentication required.');
    }
    return this.authService.getAdminProfile(req.user.userId);
  }

  @Get('credits')
  @UseGuards(AuthGuard('jwt'))
  async getCredits(@Req() req: any) {
    if (!req.user || !req.user.tenantId) {
      throw new UnauthorizedException('Tenant context not found in session.');
    }
    return this.authService.getTenantCredits(req.user.tenantId);
  }
}
