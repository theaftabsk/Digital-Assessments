import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class HeadstartWebhookService {
  private readonly logger = new Logger(HeadstartWebhookService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * API 4: Assessment Status Webhook (OUT)
   * Sends STARTED or COMPLETED status to Headstart CRM.
   * Note: IN_PROGRESS is tracked internally in ExamAttempt.status but NOT sent to Headstart.
   * Only STARTED (on exam begin) and COMPLETED (on submit) are sent.
   */
  async sendAssessmentStatus(
    attemptId: string,
    status: 'Started' | 'Completed' | 'LOCKED' | 'UNLOCKED'
  ): Promise<boolean> {
    this.logger.log(`API 4 (OUT Webhook): Pushing Assessment Status '${status}' for attempt ${attemptId}`);

    try {
      const attempt = await this.prisma.examAttempt.findUnique({
        where: { id: attemptId },
        include: { candidate: true },
      });

      if (!attempt) {
        this.logger.error(`Attempt ${attemptId} not found for API 4 status webhook.`);
        return false;
      }

      const config = await this.prisma.integrationConfig.findFirst();
      const webhookUrl = config?.webhookStatusUrl || process.env.HEADSTART_WEBHOOK_STATUS_URL;

      const payload = {
        candidateId: attempt.candidate.crmCandidateId || attempt.candidateId,
        applicationId: attempt.candidate.applicationId || attempt.candidate.referenceId,
        assessmentId: attempt.candidate.assessmentId,
        status,
        startTime: attempt.startedAt ? attempt.startedAt.toISOString() : new Date().toISOString(),
      };

      if (!webhookUrl) {
        this.logger.log(`[API 4 Webhook Payload Ready — No URL configured yet]: ${JSON.stringify(payload)}`);
        return true;
      }

      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(config?.crmApiKey ? { Authorization: `Bearer ${config.crmApiKey}` } : {}),
        },
        body: JSON.stringify(payload),
      });

      this.logger.log(`API 4 Webhook response: ${response.status}`);
      return response.ok;
    } catch (error) {
      this.logger.error(`Error delivering API 4 Status Webhook: ${error.message}`);
      return false;
    }
  }

  /**
   * API 5 & API 6: Assessment Result + Section-wise Report Card (OUT Webhooks)
   *
   * API 5 → Total marks, percentage, Qualified/Not Qualified
   * API 6 → 6-section breakdown (Section 1–6 × 10 questions each)
   *
   * Both fire AFTER submittedAt is confirmed saved in DB (guaranteed by submitExam ordering).
   */
  async sendAssessmentResultAndReportCard(attemptId: string): Promise<boolean> {
    this.logger.log(`API 5 & 6 (OUT Webhook): Pushing Result & Report Card for attempt ${attemptId}`);

    try {
      const attempt = await this.prisma.examAttempt.findUnique({
        where: { id: attemptId },
        include: {
          candidate: {
            include: { assessment: true },
          },
          submissions: {
            include: {
              question: {
                select: {
                  id: true,
                  sectionName: true,
                  sectionOrder: true,
                  marks: true,
                },
              },
            },
          },
        },
      });

      if (!attempt) {
        this.logger.error(`Attempt ${attemptId} not found for API 5/6 webhook.`);
        return false;
      }

      const config = await this.prisma.integrationConfig.findFirst();
      const webhookResultUrl = config?.webhookResultUrl || process.env.HEADSTART_WEBHOOK_RESULT_URL;
      const webhookReportUrl = config?.webhookReportUrl || process.env.HEADSTART_WEBHOOK_REPORT_URL;

      // --- Time Calculation (safe — submittedAt guaranteed persisted before this fires) ---
      const startTime = attempt.startedAt ? new Date(attempt.startedAt).getTime() : Date.now();
      const endTime = attempt.submittedAt ? new Date(attempt.submittedAt).getTime() : Date.now();
      const timeTakenSec = Math.max(0, Math.floor((endTime - startTime) / 1000));
      const timeTakenFormatted = `${Math.floor(timeTakenSec / 60)} mins ${timeTakenSec % 60} secs`;

      // --- API 6: Section-wise Report Card (6 sections × 10 questions) ---
      // Group submissions by sectionName + sectionOrder from Question model
      const sectionMap: Record<string, { sectionOrder: number; total: number; correct: number; marks: number }> = {};

      for (const sub of attempt.submissions) {
        const sectionName = sub.question.sectionName || 'General';
        const sectionOrder = sub.question.sectionOrder || 0;
        const questionMarks = sub.question.marks || 1;

        if (!sectionMap[sectionName]) {
          sectionMap[sectionName] = { sectionOrder, total: 0, correct: 0, marks: 0 };
        }
        sectionMap[sectionName].total += 1;
        sectionMap[sectionName].marks += questionMarks;
        if (sub.isCorrect) sectionMap[sectionName].correct += 1;
      }

      // Sort sections by sectionOrder
      const sectionWiseBreakdown = Object.entries(sectionMap)
        .sort(([, a], [, b]) => a.sectionOrder - b.sectionOrder)
        .map(([sectionName, data]) => ({
          sectionName,
          totalQuestions: data.total,
          totalMarks: data.marks,
          obtainedMarks: data.correct,
          percentage: data.marks > 0 ? Math.round((data.correct / data.marks) * 100) : 0,
        }));

      // --- API 5 Payload: Overall Result ---
      const api5Payload = {
        candidateId: attempt.candidate.crmCandidateId || attempt.candidateId,
        applicationId: attempt.candidate.applicationId || attempt.candidate.referenceId,
        assessmentId: attempt.candidate.assessmentId,
        startTime: attempt.startedAt ? attempt.startedAt.toISOString() : null,
        endTime: attempt.submittedAt ? attempt.submittedAt.toISOString() : null,
        timeTaken: timeTakenFormatted,
        totalMarks: attempt.totalPossibleScore,
        obtainedMarks: attempt.score,
        percentage: attempt.percentage,
        result: attempt.isPassed ? 'Qualified' : 'Not Qualified',
      };

      // --- API 6 Payload: Section-wise Report Card ---
      const api6Payload = {
        candidateId: attempt.candidate.crmCandidateId || attempt.candidateId,
        applicationId: attempt.candidate.applicationId || attempt.candidate.referenceId,
        assessmentId: attempt.candidate.assessmentId,
        candidateName: attempt.candidate.name,
        sections: sectionWiseBreakdown,
        totalMarks: attempt.totalPossibleScore,
        obtainedMarks: attempt.score,
        percentage: attempt.percentage,
        result: attempt.isPassed ? 'Qualified' : 'Not Qualified',
      };

      this.logger.log(`[API 5 Result Payload]: ${JSON.stringify(api5Payload)}`);
      this.logger.log(`[API 6 Report Card Payload]: ${JSON.stringify(api6Payload)}`);

      // --- Dispatch Webhooks (if endpoints configured) ---
      if (webhookResultUrl) {
        await fetch(webhookResultUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(config?.crmApiKey ? { Authorization: `Bearer ${config.crmApiKey}` } : {}),
          },
          body: JSON.stringify(api5Payload),
        }).catch((err) => this.logger.error(`Failed pushing API 5 Result Webhook: ${err.message}`));
      } else {
        this.logger.log(`[API 5 — Webhook URL not configured. Payload logged above.]`);
      }

      if (webhookReportUrl) {
        await fetch(webhookReportUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(config?.crmApiKey ? { Authorization: `Bearer ${config.crmApiKey}` } : {}),
          },
          body: JSON.stringify(api6Payload),
        }).catch((err) => this.logger.error(`Failed pushing API 6 Report Card Webhook: ${err.message}`));
      } else {
        this.logger.log(`[API 6 — Webhook URL not configured. Payload logged above.]`);
      }

      return true;
    } catch (error) {
      this.logger.error(`Error delivering API 5/6 Webhooks: ${error.message}`);
      return false;
    }
  }
}
