import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { ProctoringGateway } from './proctoring.gateway';
import { ProctoringService } from './proctoring.service';
import { ProctoringController } from './proctoring.controller';

@Module({
  imports: [PrismaModule],
  controllers: [ProctoringController],
  providers: [ProctoringGateway, ProctoringService],
  exports: [ProctoringService],
})
export class ProctoringModule {}
