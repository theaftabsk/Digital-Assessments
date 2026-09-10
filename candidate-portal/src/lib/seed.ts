import { prisma } from "./prisma";
import { initialQuestions } from "./seedData";

async function main() {
  console.log("Seeding real database dev.db...");

  // Seed Admin user
  await prisma.admin.upsert({
    where: { username: "admin" },
    update: { password: "admin123" },
    create: {
      username: "admin",
      password: "admin123",
      name: "HR System Administrator",
    },
  });

  // Seed Settings
  await prisma.settings.upsert({
    where: { id: "default" },
    update: {},
    create: {
      id: "default",
      examDurationMins: 65,
      passingMarksPercent: 60,
      negativeMarking: false,
      companyName: "GREATCAMPUS Banca Assessment",
    },
  });

  // Seed Questions
  for (let i = 0; i < initialQuestions.length; i++) {
    const q = initialQuestions[i];
    const qId = q.id || `q-${i + 1}`;

    await prisma.question.upsert({
      where: { id: qId },
      update: {
        section: q.section,
        sectionName: q.sectionName,
        question: q.question,
        optionA: q.optionA,
        optionB: q.optionB,
        optionC: q.optionC,
        optionD: q.optionD,
        correctAnswer: q.correctAnswer,
        marks: q.marks || 1,
        difficulty: q.difficulty || "Medium",
      },
      create: {
        id: qId,
        section: q.section,
        sectionName: q.sectionName,
        question: q.question,
        optionA: q.optionA,
        optionB: q.optionB,
        optionC: q.optionC,
        optionD: q.optionD,
        correctAnswer: q.correctAnswer,
        marks: q.marks || 1,
        difficulty: q.difficulty || "Medium",
      },
    });
  }

  console.log("Real database seeded successfully with 60 questions and admin user!");
}

main()
  .catch((e) => {
    console.error("Seeding error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
