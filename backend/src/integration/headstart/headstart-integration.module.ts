import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { HeadstartClientService } from './headstart-client.service';
import { HeadstartWebhookService } from './headstart-webhook.service';
import { HeadstartIntegrationController } from './headstart-integration.controller';

@Module({
  imports: [PrismaModule],
  controllers: [HeadstartIntegrationController],
  providers: [HeadstartClientService, HeadstartWebhookService],
  exports: [HeadstartClientService, HeadstartWebhookService],
})
export class HeadstartIntegrationModule {}
