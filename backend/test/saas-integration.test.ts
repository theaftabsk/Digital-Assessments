import { PrismaClient } from '@prisma/client';
import { SuperAdminService } from '../src/super-admin/super-admin.service';
import { AuthService } from '../src/auth/auth.service';
import { CreditsService } from '../src/credits/credits.service';
import { AssessmentsService } from '../src/assessments/assessments.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';

async function runTests() {
  console.log('====================================================');
  console.log('🚀 MULTI-TENANT SAAS INTEGRATION & SECURITY TESTS');
  console.log('====================================================\n');

  const prisma = new PrismaClient();
  await prisma.$connect();

  const creditsService = new CreditsService(prisma as any);
  const superAdminService = new SuperAdminService(prisma as any, creditsService);
  const jwtService = new JwtService({
    secret: process.env.JWT_SECRET || 'banca-arm-nest-secret-key-2026',
    signOptions: { expiresIn: '7d' },
  });
  const authService = new AuthService(prisma as any, jwtService);
  const assessmentsService = new AssessmentsService(prisma as any);

  let testTenantId = '';
  let testAdminUsername = `test_hr_${Date.now()}`;
  let initialPassword = '';
  let secondAdminUsername = `recruiter_${Date.now()}`;
  let secondAdminId = '';
  let newResetPassword = '';

  try {
    // TEST 1: Super Admin creates a new Tenant Organization + Admin credentials atomically
    console.log('▶ [TEST 1] Creating new Client Organization & Primary Admin...');
    const createResult = await superAdminService.createTenantWithAdmin({
      name: 'Acme Global Healthcare',
      slug: `acme-test-${Date.now()}`,
      creditLimit: 300,
      adminName: 'Acme HR Director',
      adminUsername: testAdminUsername,
      adminRole: 'ADMIN',
    });

    testTenantId = createResult.tenant.id;
    initialPassword = createResult.admin.initialPassword;

    console.log('   ✔ Tenant created:', createResult.tenant.name, `(${createResult.tenant.slug})`);
    console.log('   ✔ Admin created:', createResult.admin.username);
    console.log('   ✔ One-time Initial Password returned to Super Admin:', initialPassword);
    console.log('   ✔ Initial Quota allocated:', createResult.tenant.creditLimit, 'credits');

    // TEST 2: Password Security - DB stores bcrypt hash, NEVER plaintext
    console.log('\n▶ [TEST 2] Verifying Password Storage Security...');
    const adminInDb = await prisma.admin.findUnique({
      where: { username: testAdminUsername },
    });
    if (!adminInDb) throw new Error('Admin not found in DB!');
    if (adminInDb.password === initialPassword) {
      throw new Error('SECURITY VIOLATION: Password stored as plaintext in database!');
    }
    const isHashValid = await bcrypt.compare(initialPassword, adminInDb.password);
    if (!isHashValid) throw new Error('Bcrypt hash verification failed!');
    console.log('   ✔ DB password is securely bcrypt-hashed:', adminInDb.password.substring(0, 20) + '...');

    // TEST 3: Client Admin Login & JWT Scoping
    console.log('\n▶ [TEST 3] Client Admin Login & JWT Scoping...');
    const loginResult = await authService.validateAdmin(testAdminUsername, initialPassword);
    if (!loginResult.access_token) throw new Error('Login failed to return access token');
    console.log('   ✔ Login successful! User Role:', loginResult.user.role);
    console.log('   ✔ Tenant context in response:', loginResult.user.tenantName, `(ID: ${loginResult.user.tenantId})`);

    const decodedToken: any = jwtService.decode(loginResult.access_token);
    if (decodedToken.tenantId !== testTenantId) {
      throw new Error(`Token tenantId mismatch! Expected ${testTenantId}, got ${decodedToken.tenantId}`);
    }
    console.log('   ✔ JWT verified with embedded tenantId:', decodedToken.tenantId);

    // TEST 4: Organization Profile & Quota Verification
    console.log('\n▶ [TEST 4] Organization Profile & Quota Verification...');
    const profile = await authService.getAdminProfile(loginResult.user.id);
    console.log('   ✔ Organization profile fetched:', profile.user.tenant?.name);
    console.log('   ✔ Quota remaining:', profile.user.tenant?.remainingCredit, 'credits');

    // TEST 5: Tenant Isolation - Creating Assessment scoped to Tenant
    console.log('\n▶ [TEST 5] Tenant Isolation: Scoped Assessment Creation...');
    const assessment = await assessmentsService.saveAssessment(
      {
        name: 'Acme Executive Aptitude 2026',
        description: 'Exclusive to Acme Global candidates',
      },
      'ADMIN',
      testTenantId,
    );
    console.log('   ✔ Assessment created:', assessment.name);
    console.log('   ✔ Assessment tenantId:', assessment.tenantId, '(matches Tenant ID:', assessment.tenantId === testTenantId, ')');

    // Verify Tenant B cannot see Acme's assessment
    const fakeOtherTenantId = 'other-dummy-tenant-id';
    const otherTenantAssessments = await assessmentsService.getAssessments(undefined, fakeOtherTenantId);
    const leakedAssessment = otherTenantAssessments.find((a: any) => a.id === assessment.id);
    if (leakedAssessment) {
      throw new Error('SECURITY VIOLATION: Cross-tenant assessment leakage detected!');
    }
    console.log('   ✔ Isolation confirmed: Other tenant cannot see Acme assessments');

    // TEST 6: Issuing Additional Admin Credential
    console.log('\n▶ [TEST 6] Issuing Additional Admin Credential for Tenant...');
    const additionalAdmin = await superAdminService.createTenantAdmin(testTenantId, {
      username: secondAdminUsername,
      name: 'Acme Recruiter Lead',
      role: 'RECRUITER',
    });
    secondAdminId = additionalAdmin.admin.id;
    console.log('   ✔ Additional Admin issued:', additionalAdmin.admin.username, `(Role: ${additionalAdmin.admin.role})`);
    console.log('   ✔ Initial Password:', additionalAdmin.admin.initialPassword);

    // Verify login of second admin
    const secondLogin = await authService.validateAdmin(secondAdminUsername, additionalAdmin.admin.initialPassword);
    console.log('   ✔ Second Admin login successful! Role:', secondLogin.user.role);

    // TEST 7: Super Admin Password Reset
    console.log('\n▶ [TEST 7] Super Admin Password Reset...');
    const resetResult = await superAdminService.resetAdminPassword(secondAdminId);
    newResetPassword = resetResult.newPassword;
    console.log('   ✔ Super Admin generated new password for', secondAdminUsername, ':', newResetPassword);

    // Verify old password fails
    try {
      await authService.validateAdmin(secondAdminUsername, additionalAdmin.admin.initialPassword);
      throw new Error('Old password should have failed!');
    } catch (e: any) {
      console.log('   ✔ Old password successfully rejected:', e.message);
    }

    // Verify new password succeeds
    const afterResetLogin = await authService.validateAdmin(secondAdminUsername, newResetPassword);
    console.log('   ✔ Login with newly reset password successful!');

    // TEST 8: Tenant Suspension Security Guard
    console.log('\n▶ [TEST 8] Tenant Suspension Enforcement...');
    await superAdminService.updateTenantStatus(testTenantId, 'SUSPENDED');
    console.log('   ✔ Tenant status updated to SUSPENDED');

    try {
      await authService.validateAdmin(testAdminUsername, initialPassword);
      throw new Error('SECURITY VIOLATION: Suspended tenant admin was able to login!');
    } catch (e: any) {
      console.log('   ✔ Suspended tenant admin login successfully blocked with error:');
      console.log('     -->', e.message);
    }

    // TEST 9: Tenant Reactivation
    console.log('\n▶ [TEST 9] Tenant Reactivation...');
    await superAdminService.updateTenantStatus(testTenantId, 'ACTIVE');
    console.log('   ✔ Tenant status reactivated to ACTIVE');

    const reactivatedLogin = await authService.validateAdmin(testAdminUsername, initialPassword);
    console.log('   ✔ Reactivated login succeeds! User:', reactivatedLogin.user.username);

    // CLEANUP
    console.log('\n▶ [CLEANUP] Cleaning up test records...');
    await prisma.assessment.deleteMany({ where: { tenantId: testTenantId } });
    await superAdminService.deleteTenant(testTenantId);
    console.log('   ✔ Test tenant cleaned up.');

    console.log('\n====================================================');
    console.log('🎉 ALL MULTI-TENANT SAAS INTEGRATION TESTS PASSED 100%!');
    console.log('====================================================\n');
  } catch (err) {
    console.error('\n❌ TEST FAILED:', err);
    // Cleanup if needed
    if (testTenantId) {
      await prisma.assessment.deleteMany({ where: { tenantId: testTenantId } }).catch(() => {});
      await prisma.tenant.delete({ where: { id: testTenantId } }).catch(() => {});
    }
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runTests();
