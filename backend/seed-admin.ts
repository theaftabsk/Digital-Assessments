import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedAdmin() {
  let tenant = await prisma.tenant.findFirst();
  if (!tenant) {
    tenant = await prisma.tenant.create({
      data: { name: 'GREATCAMPUS', slug: 'greatcampus' },
    });
  }

  const existingAdmin = await prisma.admin.findUnique({ where: { username: 'admin' } });
  if (!existingAdmin) {
    await prisma.admin.create({
      data: {
        tenantId: tenant.id,
        username: 'admin',
        password: 'password123',
        name: 'HR System Administrator',
        role: 'ADMIN',
      },
    });
    console.log('✅ Created Admin user: admin (Password: password123)');
  }

  const existingAss = await prisma.assessment.findFirst();
  if (!existingAss) {
    await prisma.assessment.create({
      data: {
        tenantId: tenant.id,
        name: 'Niva Bupa Health Insurance Assessment',
        slug: 'niva-bupa-assessment',
        description: 'Official AUM and ARM Banca Entrance Assessment',
        durationMins: 45,
        passingPercentage: 50,
        maxProctorWarnings: 3,
        status: 'ACTIVE',
      },
    });
    console.log('✅ Created Default Assessment Session');
  }
}

seedAdmin().finally(() => prisma.$disconnect());
