import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor() {
    super({
      datasources: {
        db: {
          url: process.env.DATABASE_URL || 'file:./dev.db',
        },
      },
    });
  }

  async onModuleInit() {
    try {
      await this.$connect();
    } catch (e) {
      console.warn('Prisma initial connection notice:', e);
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
