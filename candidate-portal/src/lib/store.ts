import { prisma } from "./prisma";
import { QuestionData } from "./seedData";

export interface CandidateRecord {
  id: string;
  name: string;
  email: string;
  phone: string;
  referenceId: string;
  startedAt: string;
  submittedAt?: string;
  status: "IN_PROGRESS" | "COMPLETED" | "EXPIRED";
  score: number;
  totalPossibleScore: number;
  percentage: number;
  hiringRecommendation: "Strong Hire" | "Hire" | "Maybe" | "Reject" | "Pending Review";
  tabSwitches: number;
  fullscreenExits: number;
  answers: Record<string, { selectedOption: string | null; isCorrect: boolean; timeTakenSec: number }>;
  sectionScores: Record<string, { score: number; total: number; percentage: number }>;
  simulation?: {
    audioData?: string;
    textResponse?: string;
    score: number;
    marksMax: number;
    feedback?: string;
    gradedAt?: string;
    gradedBy?: string;
  };
  antiCheatLogs: Array<{ id: string; eventType: string; details?: string; timestamp: string }>;
  device?: string;
  browser?: string;
}

export interface SystemSettings {
  examDurationMins: number;
  passingMarksPercent: number;
  negativeMarking: boolean;
  shuffleQuestions: boolean;
  shuffleOptions: boolean;
  simulationTimeMins: number;
  companyName: string;
  companyLogo?: string;
}

// Database Service Layer interacting with Real Prisma Database
class ProductionDatabaseStore {
  
  // --- Questions Management ---
  public async getQuestions(): Promise<QuestionData[]> {
    try {
      const qList = await prisma.question.findMany({
        where: { isActive: true },
        orderBy: { createdAt: "asc" },
      });

      if (qList.length === 0) {
        // Fallback seed check
        const { initialQuestions } = await import("./seedData");
        return initialQuestions;
      }

      return qList.map((q) => ({
        id: q.id,
        section: q.section,
        sectionName: q.sectionName,
        question: q.question,
        optionA: q.optionA,
        optionB: q.optionB,
        optionC: q.optionC,
        optionD: q.optionD,
        correctAnswer: q.correctAnswer,
        marks: q.marks,
        negativeMarks: q.negativeMarks,
        difficulty: q.difficulty,
      }));
    } catch (err) {
      console.error("Prisma getQuestions error:", err);
      const { initialQuestions } = await import("./seedData");
      return initialQuestions;
    }
  }

  public async addQuestion(data: Omit<QuestionData, "id">): Promise<QuestionData> {
    const created = await prisma.question.create({
      data: {
        section: data.section,
        sectionName: data.sectionName,
        question: data.question,
        optionA: data.optionA,
        optionB: data.optionB,
        optionC: data.optionC,
        optionD: data.optionD,
        correctAnswer: data.correctAnswer,
        marks: data.marks || 1,
        negativeMarks: data.negativeMarks || 0,
        difficulty: data.difficulty || "Medium",
      },
    });

    return {
      id: created.id,
      section: created.section,
      sectionName: created.sectionName,
      question: created.question,
      optionA: created.optionA,
      optionB: created.optionB,
      optionC: created.optionC,
      optionD: created.optionD,
      correctAnswer: created.correctAnswer,
      marks: created.marks,
      difficulty: created.difficulty,
    };
  }

  public async updateQuestion(id: string, data: Partial<QuestionData>): Promise<QuestionData | null> {
    try {
      const updated = await prisma.question.update({
        where: { id },
        data: {
          ...(data.section && { section: data.section }),
          ...(data.sectionName && { sectionName: data.sectionName }),
          ...(data.question && { question: data.question }),
          ...(data.optionA && { optionA: data.optionA }),
          ...(data.optionB && { optionB: data.optionB }),
          ...(data.optionC && { optionC: data.optionC }),
          ...(data.optionD && { optionD: data.optionD }),
          ...(data.correctAnswer && { correctAnswer: data.correctAnswer }),
          ...(data.difficulty && { difficulty: data.difficulty }),
        },
      });

      return {
        id: updated.id,
        section: updated.section,
        sectionName: updated.sectionName,
        question: updated.question,
        optionA: updated.optionA,
        optionB: updated.optionB,
        optionC: updated.optionC,
        optionD: updated.optionD,
        correctAnswer: updated.correctAnswer,
        marks: updated.marks,
        difficulty: updated.difficulty,
      };
    } catch (err) {
      return null;
    }
  }

  public async deleteQuestion(id: string): Promise<boolean> {
    try {
      await prisma.question.delete({ where: { id } });
      return true;
    } catch (err) {
      return false;
    }
  }

  // --- Candidate Records & Submissions ---
  public async getCandidates(): Promise<CandidateRecord[]> {
    try {
      const cList = await prisma.candidate.findMany({
        include: {
          submissions: { include: { question: true } },
          simulation: true,
          antiCheatLogs: true,
        },
        orderBy: { createdAt: "desc" },
      });

      return cList.map((c) => {
        const answers: Record<string, { selectedOption: string | null; isCorrect: boolean; timeTakenSec: number }> = {};
        const sectionScores: Record<string, { score: number; total: number; percentage: number }> = {};

        c.submissions.forEach((sub) => {
          answers[sub.questionId] = {
            selectedOption: sub.selectedOption,
            isCorrect: sub.isCorrect,
            timeTakenSec: sub.timeTakenSec,
          };

          const sec = sub.question.section;
          if (!sectionScores[sec]) {
            sectionScores[sec] = { score: 0, total: 0, percentage: 0 };
          }
          sectionScores[sec].total += sub.question.marks;
          if (sub.isCorrect) sectionScores[sec].score += sub.question.marks;
        });

        Object.keys(sectionScores).forEach((sec) => {
          const s = sectionScores[sec];
          s.percentage = s.total > 0 ? Math.round((s.score / s.total) * 100) : 0;
        });

        return {
          id: c.id,
          name: c.name,
          email: c.email,
          phone: c.phone,
          referenceId: c.referenceId,
          startedAt: c.startedAt.toISOString(),
          submittedAt: c.submittedAt?.toISOString(),
          status: c.status as any,
          score: c.score,
          totalPossibleScore: c.totalPossibleScore,
          percentage: c.percentage,
          hiringRecommendation: c.hiringRecommendation as any,
          tabSwitches: c.tabSwitches,
          fullscreenExits: c.fullscreenExits,
          answers,
          sectionScores,
          simulation: c.simulation
            ? {
                audioData: c.simulation.audioData || undefined,
                textResponse: c.simulation.textResponse || undefined,
                score: c.simulation.score,
                marksMax: c.simulation.marksMax,
                feedback: c.simulation.feedback || undefined,
                gradedAt: c.simulation.gradedAt?.toISOString(),
                gradedBy: c.simulation.gradedBy || undefined,
              }
            : undefined,
          antiCheatLogs: c.antiCheatLogs.map((l) => ({
            id: l.id,
            eventType: l.eventType,
            details: l.details || undefined,
            timestamp: l.timestamp.toISOString(),
          })),
        };
      });
    } catch (err) {
      console.error("Prisma getCandidates error:", err);
      return [];
    }
  }

  public async registerCandidate(data: { name: string; email: string; phone: string; referenceId: string }): Promise<CandidateRecord> {
    const existing = await prisma.candidate.findFirst({
      where: { OR: [{ referenceId: data.referenceId }, { email: data.email }] },
    });

    if (existing) {
      return {
        id: existing.id,
        name: existing.name,
        email: existing.email,
        phone: existing.phone,
        referenceId: existing.referenceId,
        startedAt: existing.startedAt.toISOString(),
        status: existing.status as any,
        score: existing.score,
        totalPossibleScore: existing.totalPossibleScore,
        percentage: existing.percentage,
        hiringRecommendation: existing.hiringRecommendation as any,
        tabSwitches: existing.tabSwitches,
        fullscreenExits: existing.fullscreenExits,
        answers: {},
        sectionScores: {},
        antiCheatLogs: [],
      };
    }

    const created = await prisma.candidate.create({
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone,
        referenceId: data.referenceId,
        status: "IN_PROGRESS",
      },
    });

    return {
      id: created.id,
      name: created.name,
      email: created.email,
      phone: created.phone,
      referenceId: created.referenceId,
      startedAt: created.startedAt.toISOString(),
      status: "IN_PROGRESS",
      score: 0,
      totalPossibleScore: 30,
      percentage: 0,
      hiringRecommendation: "Pending Review",
      tabSwitches: 0,
      fullscreenExits: 0,
      answers: {},
      sectionScores: {},
      antiCheatLogs: [],
    };
  }

  public async submitExam(
    candidateId: string,
    answers: Record<string, { selectedOption: string | null; timeTakenSec: number }>,
    simulation?: { audioData?: string; textResponse?: string },
    antiCheatData?: { tabSwitches: number; fullscreenExits: number; logs: Array<{ eventType: string; details?: string }> }
  ): Promise<CandidateRecord | null> {
    const candidate = await prisma.candidate.findFirst({
      where: { OR: [{ id: candidateId }, { referenceId: candidateId }] },
    });

    if (!candidate) return null;

    const allQuestions = await prisma.question.findMany();
    let totalScore = 0;

    for (const q of allQuestions) {
      const selected = answers[q.id]?.selectedOption || null;
      const isCorrect = selected === q.correctAnswer;
      const timeTaken = answers[q.id]?.timeTakenSec || 0;

      if (isCorrect) totalScore += q.marks;

      await prisma.submission.create({
        data: {
          candidateId: candidate.id,
          questionId: q.id,
          selectedOption: selected,
          isCorrect,
          timeTakenSec: timeTaken,
        },
      });
    }

    const totalQuestionsCount = allQuestions.length || 30;
    const percentage = Math.max(0, Math.round((totalScore / totalQuestionsCount) * 100));

    let recommendation: "Strong Hire" | "Hire" | "Maybe" | "Reject" = "Reject";
    if (totalScore >= 25 || percentage >= 85) recommendation = "Strong Hire";
    else if (totalScore >= 18 || percentage >= 60) recommendation = "Hire";
    else if (totalScore >= 10 || percentage >= 33.33) recommendation = "Maybe";

    await prisma.candidate.update({
      where: { id: candidate.id },
      data: {
        submittedAt: new Date(),
        status: "COMPLETED",
        score: totalScore,
        totalPossibleScore: totalQuestionsCount,
        percentage,
        hiringRecommendation: recommendation,
        tabSwitches: antiCheatData?.tabSwitches || 0,
        fullscreenExits: antiCheatData?.fullscreenExits || 0,
      },
    });

    if (simulation && (simulation.audioData || simulation.textResponse)) {
      await prisma.simulation.upsert({
        where: { candidateId: candidate.id },
        update: {
          audioData: simulation.audioData,
          textResponse: simulation.textResponse,
        },
        create: {
          candidateId: candidate.id,
          audioData: simulation.audioData,
          textResponse: simulation.textResponse,
        },
      });
    }

    if (antiCheatData?.logs && antiCheatData.logs.length > 0) {
      for (const log of antiCheatData.logs) {
        await prisma.antiCheatLog.create({
          data: {
            candidateId: candidate.id,
            eventType: log.eventType,
            details: log.details,
          },
        });
      }
    }

    return this.getCandidateById(candidate.id);
  }

  public async getCandidateById(candidateId: string): Promise<CandidateRecord | null> {
    const list = await this.getCandidates();
    return list.find((c) => c.id === candidateId || c.referenceId === candidateId) || null;
  }

  public async gradeSimulation(candidateId: string, score: number, feedback: string, gradedBy: string = "HR Admin"): Promise<CandidateRecord | null> {
    await prisma.simulation.update({
      where: { candidateId },
      data: {
        score: Math.min(30, Math.max(0, score)),
        feedback,
        gradedAt: new Date(),
        gradedBy,
      },
    });

    return this.getCandidateById(candidateId);
  }

  // --- Settings ---
  public async getSettings(): Promise<SystemSettings> {
    try {
      const s = await prisma.settings.findUnique({ where: { id: "default" } });
      if (!s) {
        return {
          examDurationMins: 15,
          passingMarksPercent: 33.33,
          negativeMarking: false,
          shuffleQuestions: true,
          shuffleOptions: false,
          simulationTimeMins: 5,
          companyName: "GREATCAMPUS Banca Assessment",
        };
      }
      return {
        examDurationMins: s.examDurationMins,
        passingMarksPercent: s.passingMarksPercent,
        negativeMarking: s.negativeMarking,
        shuffleQuestions: s.shuffleQuestions,
        shuffleOptions: s.shuffleOptions,
        simulationTimeMins: s.simulationTimeMins,
        companyName: s.companyName,
        companyLogo: s.companyLogo || undefined,
      };
    } catch (err) {
      return {
        examDurationMins: 15,
        passingMarksPercent: 33.33,
        negativeMarking: false,
        shuffleQuestions: true,
        shuffleOptions: false,
        simulationTimeMins: 5,
        companyName: "GREATCAMPUS Banca Assessment",
      };
    }
  }

  public async updateSettings(newSettings: Partial<SystemSettings>): Promise<SystemSettings> {
    const updated = await prisma.settings.upsert({
      where: { id: "default" },
      update: {
        ...(newSettings.examDurationMins && { examDurationMins: newSettings.examDurationMins }),
        ...(newSettings.passingMarksPercent && { passingMarksPercent: newSettings.passingMarksPercent }),
        ...(newSettings.negativeMarking !== undefined && { negativeMarking: newSettings.negativeMarking }),
        ...(newSettings.companyName && { companyName: newSettings.companyName }),
      },
      create: {
        id: "default",
        examDurationMins: newSettings.examDurationMins || 15,
        passingMarksPercent: newSettings.passingMarksPercent || 33.33,
        negativeMarking: newSettings.negativeMarking || false,
        companyName: newSettings.companyName || "GREATCAMPUS Banca Assessment",
      },
    });

    return this.getSettings();
  }
}

export const store = new ProductionDatabaseStore();
