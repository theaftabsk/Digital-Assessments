import { Module } from '@nestjs/common';
import { CandidatesService } from './candidates.service';
import { CandidatesController } from './candidates.controller';
import { HeadstartIntegrationModule } from '../integration/headstart/headstart-integration.module';
import { EmailModule } from '../email/email.module';
import { CreditsModule } from '../credits/credits.module';

@Module({
  imports: [HeadstartIntegrationModule, EmailModule, CreditsModule],
  providers: [CandidatesService],
  controllers: [CandidatesController],
})
export class CandidatesModule {}
