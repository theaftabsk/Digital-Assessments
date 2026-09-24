import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  Res,
  Req,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import type { Response } from 'express';
import { QuestionsService } from './questions.service';
import { extractAuthContext } from '../auth/tenant-extractor';

@Controller('api/v1/questions')
export class QuestionsController {
  constructor(private questionsService: QuestionsService) {}

  // -------------------------------------------------------------
  // QUESTION BANKS
  // -------------------------------------------------------------
  @Get('banks')
  async getQuestionBanks(@Req() req?: any) {
    const auth = extractAuthContext(req);
    const banks = await this.questionsService.getQuestionBanks(auth.tenantId);
    return { success: true, banks };
  }

  @Post('banks')
  async createQuestionBank(
    @Body()
    body: {
      name: string;
      description?: string;
      category?: string;
    },
    @Req() req?: any,
  ) {
    if (!body.name || !body.name.trim()) {
      throw new BadRequestException('Question bank name is required.');
    }
    const auth = extractAuthContext(req);
    const bank = await this.questionsService.createQuestionBank({
      ...body,
      tenantId: auth.tenantId,
    });
    return { success: true, bank };
  }

  @Get('banks/:id')
  async getQuestionBankById(@Param('id') id: string) {
    const bank = await this.questionsService.getQuestionBankById(id);
    if (!bank) throw new NotFoundException('Question bank not found.');
    return { success: true, bank };
  }

  @Put('banks/:id')
  async updateQuestionBank(
    @Param('id') id: string,
    @Body()
    body: {
      name?: string;
      description?: string;
      category?: string;
      status?: string;
    },
  ) {
    const bank = await this.questionsService.updateQuestionBank(id, body);
    return { success: true, bank };
  }

  @Delete('banks/:id')
  async deleteQuestionBank(@Param('id') id: string) {
    await this.questionsService.deleteQuestionBank(id);
    return { success: true, message: 'Question bank deleted successfully.' };
  }

  @Post('banks/:id/questions')
  async addQuestionToBank(
    @Param('id') bankId: string,
    @Body()
    body: {
      question: string;
      optionA: string;
      optionB: string;
      optionC: string;
      optionD: string;
      correctAnswer: string;
      marks?: number;
      sectionName?: string;
    },
  ) {
    if (!body.question || !body.optionA || !body.optionB || !body.optionC || !body.optionD) {
      throw new BadRequestException('All fields (question, options A-D) are required.');
    }
    const question = await this.questionsService.addQuestionToBank(bankId, body);
    return { success: true, question };
  }

  @Post('banks/:id/import')
  async importQuestionsToBank(
    @Param('id') bankId: string,
    @Body()
    body: {
      questions: Array<any>;
    },
  ) {
    if (!body.questions || !Array.isArray(body.questions) || body.questions.length === 0) {
      throw new BadRequestException('Questions array is required.');
    }
    const result = await this.questionsService.importQuestionsToBank(bankId, body.questions);
    return result;
  }

  @Get('template/csv')
  async downloadCsvTemplate(@Res() res: Response) {
    const csvContent = this.questionsService.getSampleCsvTemplate();
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader(
      'Content-Disposition',
      'attachment; filename="question_bank_template.csv"',
    );
    return res.send(csvContent);
  }

  // -------------------------------------------------------------
  // FLAT QUESTIONS (Legacy & Direct Access)
  // -------------------------------------------------------------
  @Get()
  async getQuestions(@Query('bankId') bankId?: string) {
    const questions = await this.questionsService.getQuestions(bankId);
    return { success: true, questions };
  }

  @Post('seed-30')
  async seed30Questions() {
    return this.questionsService.seed60OfficialQuestions();
  }

  @Post('seed-60')
  async seed60Questions() {
    return this.questionsService.seed60OfficialQuestions();
  }

  @Post()
  async addQuestion(
    @Body()
    body: {
      questionBankId?: string;
      question: string;
      optionA: string;
      optionB: string;
      optionC: string;
      optionD: string;
      correctAnswer: string;
      marks?: number;
      sectionName?: string;
    },
  ) {
    const question = await this.questionsService.addQuestion(body);
    return { success: true, question };
  }

  @Put(':id')
  async updateQuestion(
    @Param('id') id: string,
    @Body()
    body: {
      questionBankId?: string;
      question?: string;
      optionA?: string;
      optionB?: string;
      optionC?: string;
      optionD?: string;
      correctAnswer?: string;
      marks?: number;
      sectionName?: string;
      status?: string;
    },
  ) {
    const question = await this.questionsService.updateQuestion(id, body);
    return { success: true, question };
  }

  @Delete(':id')
  async deleteQuestion(@Param('id') id: string) {
    await this.questionsService.deleteQuestion(id);
    return { success: true, message: 'Question deleted successfully' };
  }
}
