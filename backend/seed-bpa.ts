import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const BPA_QUESTIONS = [
  {
    question: "What does BPA stand for?",
    optionA: "Business Performance Analysis",
    optionB: "Business Process Automation",
    optionC: "Business Planning Application",
    optionD: "Business Product Analysis",
    correctAnswer: "B",
    marks: 1,
    sectionName: "BPA Fundamentals",
    sectionOrder: 1,
  },
  {
    question: "What is the main purpose of Business Process Automation?",
    optionA: "To automate repetitive business processes",
    optionB: "To increase manual work",
    optionC: "To eliminate all employees",
    optionD: "To create advertisements",
    correctAnswer: "A",
    marks: 1,
    sectionName: "BPA Fundamentals",
    sectionOrder: 1,
  },
  {
    question: "What is a business process?",
    optionA: "A computer screen",
    optionB: "A type of software",
    optionC: "A series of activities performed to achieve a business objective",
    optionD: "A company logo",
    correctAnswer: "C",
    marks: 1,
    sectionName: "BPA Fundamentals",
    sectionOrder: 1,
  },
  {
    question: "Which of the following is an example of a repetitive business task?",
    optionA: "Conducting a board meeting",
    optionB: "Designing a new product",
    optionC: "Writing a new business strategy",
    optionD: "Sending the same type of email to customers every day",
    correctAnswer: "D",
    marks: 1,
    sectionName: "BPA Fundamentals",
    sectionOrder: 1,
  },
  {
    question: "What does automation mean?",
    optionA: "Hiring more employees",
    optionB: "Using technology to perform tasks automatically",
    optionC: "Performing every task manually",
    optionD: "Stopping a business process",
    correctAnswer: "B",
    marks: 1,
    sectionName: "BPA Fundamentals",
    sectionOrder: 1,
  },
  {
    question: "Which is a common benefit of process automation?",
    optionA: "Reduced repetitive work",
    optionB: "More manual errors",
    optionC: "Slower processes",
    optionD: "Increased paperwork",
    correctAnswer: "A",
    marks: 1,
    sectionName: "BPA Fundamentals",
    sectionOrder: 1,
  },
  {
    question: "What is a workflow?",
    optionA: "A company building",
    optionB: "A sequence of activities in a process",
    optionC: "A computer virus",
    optionD: "A spreadsheet formula",
    correctAnswer: "B",
    marks: 1,
    sectionName: "Workflow & Triggers",
    sectionOrder: 2,
  },
  {
    question: "In an automated workflow, what is a trigger?",
    optionA: "The final report",
    optionB: "A database",
    optionC: "An employee",
    optionD: "The event that starts the workflow",
    correctAnswer: "D",
    marks: 1,
    sectionName: "Workflow & Triggers",
    sectionOrder: 2,
  },
  {
    question: "Which of the following can be a trigger for an automation?",
    optionA: "A new email received",
    optionB: "A chair being moved",
    optionC: "A printed document",
    optionD: "A person entering an office",
    correctAnswer: "A",
    marks: 1,
    sectionName: "Workflow & Triggers",
    sectionOrder: 2,
  },
  {
    question: "What is an action in an automated workflow?",
    optionA: "A business goal",
    optionB: "A database",
    optionC: "Something the automation performs",
    optionD: "A manual meeting",
    correctAnswer: "C",
    marks: 1,
    sectionName: "Workflow & Triggers",
    sectionOrder: 2,
  },
  {
    question: "Which of the following is an example of an automated action?",
    optionA: "Attending a meeting",
    optionB: "Writing on paper",
    optionC: "Sending an email automatically",
    optionD: "Drinking coffee",
    correctAnswer: "C",
    marks: 1,
    sectionName: "Workflow & Triggers",
    sectionOrder: 2,
  },
  {
    question: "What is RPA?",
    optionA: "Retail Process Analysis",
    optionB: "Rapid Planning Application",
    optionC: "Reporting Performance Automation",
    optionD: "Robotic Process Automation",
    correctAnswer: "D",
    marks: 1,
    sectionName: "RPA & Bots",
    sectionOrder: 3,
  },
  {
    question: "RPA is mainly used to:",
    optionA: "Automate repetitive computer-based tasks",
    optionB: "Design buildings",
    optionC: "Create advertisements",
    optionD: "Manufacture physical robots only",
    correctAnswer: "A",
    marks: 1,
    sectionName: "RPA & Bots",
    sectionOrder: 3,
  },
  {
    question: "Which task is suitable for RPA?",
    optionA: "Negotiating with a customer",
    optionB: "Copying data from one system to another repeatedly",
    optionC: "Designing a company strategy",
    optionD: "Conducting an interview",
    correctAnswer: "B",
    marks: 1,
    sectionName: "RPA & Bots",
    sectionOrder: 3,
  },
  {
    question: "What is a bot in automation?",
    optionA: "A human employee",
    optionB: "A physical office machine only",
    optionC: "A spreadsheet",
    optionD: "An automated software program that performs tasks",
    correctAnswer: "D",
    marks: 1,
    sectionName: "RPA & Bots",
    sectionOrder: 3,
  },
  {
    question: "What is meant by a \"manual process\"?",
    optionA: "A process performed by people without automation",
    optionB: "A process performed only by robots",
    optionC: "A computer program",
    optionD: "An automated workflow",
    correctAnswer: "A",
    marks: 1,
    sectionName: "Process Design",
    sectionOrder: 4,
  },
  {
    question: "Which process is most suitable for automation?",
    optionA: "A process that occurs only once",
    optionB: "A process requiring personal creativity every time",
    optionC: "A highly repetitive and rule-based process",
    optionD: "A process with no defined steps",
    correctAnswer: "C",
    marks: 1,
    sectionName: "Process Design",
    sectionOrder: 4,
  },
  {
    question: "What is an approval workflow?",
    optionA: "A process for deleting files",
    optionB: "A process in which a request is reviewed and approved",
    optionC: "A process for creating advertisements",
    optionD: "A process for designing websites",
    correctAnswer: "B",
    marks: 1,
    sectionName: "Workflows & Approvals",
    sectionOrder: 5,
  },
  {
    question: "Which of the following can be automated in an approval process?",
    optionA: "Sending an approval request",
    optionB: "Having a conversation",
    optionC: "Attending a conference",
    optionD: "Drinking water",
    correctAnswer: "A",
    marks: 1,
    sectionName: "Workflows & Approvals",
    sectionOrder: 5,
  },
  {
    question: "What is a notification in an automated process?",
    optionA: "A manual report",
    optionB: "A database table",
    optionC: "An automatic message informing someone about an event",
    optionD: "A business meeting",
    correctAnswer: "C",
    marks: 1,
    sectionName: "Workflows & Approvals",
    sectionOrder: 5,
  },
  {
    question: "What is the purpose of integrating two business applications?",
    optionA: "To delete information",
    optionB: "To make them slower",
    optionC: "To prevent communication",
    optionD: "To allow them to exchange data or work together",
    correctAnswer: "D",
    marks: 1,
    sectionName: "Integration & Data",
    sectionOrder: 6,
  },
  {
    question: "Which of the following is an example of system integration?",
    optionA: "Connecting a CRM system with an email system",
    optionB: "Making a phone call manually",
    optionC: "Printing a document",
    optionD: "Writing information on paper",
    correctAnswer: "A",
    marks: 1,
    sectionName: "Integration & Data",
    sectionOrder: 6,
  },
  {
    question: "What is data in a business process?",
    optionA: "A computer screen",
    optionB: "Information used or generated by the process",
    optionC: "A company employee",
    optionD: "Only printed documents",
    correctAnswer: "B",
    marks: 1,
    sectionName: "Integration & Data",
    sectionOrder: 6,
  },
  {
    question: "Why is accurate data important in automation?",
    optionA: "It stops workflows",
    optionB: "It increases paperwork",
    optionC: "Automation depends on correct information",
    optionD: "It makes processes manual",
    correctAnswer: "C",
    marks: 1,
    sectionName: "Integration & Data",
    sectionOrder: 6,
  },
  {
    question: "What does \"if-then\" logic mean in automation?",
    optionA: "If a condition is true, perform a specified action",
    optionB: "Stop all processes",
    optionC: "Delete all data",
    optionD: "Always perform every action",
    correctAnswer: "A",
    marks: 1,
    sectionName: "Automation Logic",
    sectionOrder: 7,
  },
  {
    question: "Which is an example of an automation condition?",
    optionA: "Call every employee",
    optionB: "Open the office door",
    optionC: "Print every document",
    optionD: "If the invoice amount is above ₹50,000, send it for approval",
    correctAnswer: "D",
    marks: 1,
    sectionName: "Automation Logic",
    sectionOrder: 7,
  },
  {
    question: "What is a database?",
    optionA: "A type of email",
    optionB: "An organized collection of data",
    optionC: "A business meeting",
    optionD: "A computer keyboard",
    correctAnswer: "B",
    marks: 1,
    sectionName: "Data Management",
    sectionOrder: 8,
  },
  {
    question: "What is a form commonly used for in automation?",
    optionA: "Creating hardware",
    optionB: "Designing buildings",
    optionC: "Collecting information from users",
    optionD: "Playing music",
    correctAnswer: "C",
    marks: 1,
    sectionName: "Data Management",
    sectionOrder: 8,
  },
  {
    question: "Which of the following could start an employee onboarding workflow?",
    optionA: "A new employee record being created",
    optionB: "Lunch time",
    optionC: "A company advertisement",
    optionD: "A meeting ending",
    correctAnswer: "A",
    marks: 1,
    sectionName: "Workflow Triggers",
    sectionOrder: 9,
  },
  {
    question: "What can automation do after receiving a customer enquiry?",
    optionA: "Delete all customer information",
    optionB: "Automatically create a customer record",
    optionC: "Close the business",
    optionD: "Stop the internet",
    correctAnswer: "B",
    marks: 1,
    sectionName: "Workflow Triggers",
    sectionOrder: 9,
  },
  {
    question: "What is process mapping?",
    optionA: "Creating a geographical map",
    optionB: "Designing a company logo",
    optionC: "Representing the steps of a business process visually",
    optionD: "Creating a salary sheet",
    correctAnswer: "C",
    marks: 1,
    sectionName: "Process Analysis",
    sectionOrder: 10,
  },
  {
    question: "Why should a business understand a process before automating it?",
    optionA: "To increase manual work",
    optionB: "To avoid using technology",
    optionC: "To increase paperwork",
    optionD: "To identify the steps and improve the process",
    correctAnswer: "D",
    marks: 1,
    sectionName: "Process Analysis",
    sectionOrder: 10,
  },
  {
    question: "What is a bottleneck in a business process?",
    optionA: "A computer program",
    optionB: "A point where work gets delayed or slowed down",
    optionC: "A business employee",
    optionD: "A type of database",
    correctAnswer: "B",
    marks: 1,
    sectionName: "Process Analysis",
    sectionOrder: 10,
  },
  {
    question: "Automation can help reduce:",
    optionA: "Repetitive manual work",
    optionB: "Business objectives",
    optionC: "Customer relationships",
    optionD: "Business information",
    correctAnswer: "A",
    marks: 1,
    sectionName: "Benefits of Automation",
    sectionOrder: 11,
  },
  {
    question: "Which of the following can be an output of an automated process?",
    optionA: "A manual meeting",
    optionB: "A telephone conversation",
    optionC: "An automatically generated report",
    optionD: "A handwritten note only",
    correctAnswer: "C",
    marks: 1,
    sectionName: "Benefits of Automation",
    sectionOrder: 11,
  },
  {
    question: "What is an automated email?",
    optionA: "A phone call",
    optionB: "A printed report",
    optionC: "An email written only on paper",
    optionD: "An email sent automatically based on a predefined condition or event",
    correctAnswer: "D",
    marks: 1,
    sectionName: "Automation Communications",
    sectionOrder: 12,
  },
  {
    question: "What is the purpose of monitoring an automated process?",
    optionA: "To check whether the process is working correctly",
    optionB: "To delete the workflow",
    optionC: "To stop all activities",
    optionD: "To make the process manual",
    correctAnswer: "A",
    marks: 1,
    sectionName: "Monitoring & Operations",
    sectionOrder: 13,
  },
  {
    question: "Which of the following is a potential benefit of BPA?",
    optionA: "More repetitive work",
    optionB: "Faster processing",
    optionC: "More manual errors",
    optionD: "Slower communication",
    correctAnswer: "B",
    marks: 1,
    sectionName: "Benefits of Automation",
    sectionOrder: 11,
  },
  {
    question: "What should happen when an automated process encounters an error?",
    optionA: "The computer should be switched off",
    optionB: "The error should always be ignored",
    optionC: "The error should be identified and handled appropriately",
    optionD: "All data should be deleted",
    correctAnswer: "C",
    marks: 1,
    sectionName: "Monitoring & Operations",
    sectionOrder: 13,
  },
  {
    question: "What is the ultimate objective of Business Process Automation?",
    optionA: "Increase unnecessary paperwork",
    optionB: "Make every process manual",
    optionC: "Eliminate all business processes",
    optionD: "Make business processes more efficient and consistent",
    correctAnswer: "D",
    marks: 1,
    sectionName: "BPA Fundamentals",
    sectionOrder: 1,
  },
];

async function seedBpaQuiz() {
  console.log('--- Starting BPA Quiz Question Bank Seeding ---');

  // 1. Get or create primary tenant (GREATCAMPUS)
  let tenant = await prisma.tenant.findFirst({
    where: { OR: [{ slug: 'greatcampus' }, { name: 'GREATCAMPUS' }] },
  });
  if (!tenant) {
    tenant = await prisma.tenant.findFirst();
  }
  if (!tenant) {
    tenant = await prisma.tenant.create({
      data: { name: 'GREATCAMPUS', slug: 'greatcampus' },
    });
  }

  // 2. Find or create Question Bank "BPA Quiz"
  let bank = await prisma.questionBank.findFirst({
    where: { name: 'BPA Quiz' },
  });

  if (!bank) {
    bank = await prisma.questionBank.create({
      data: {
        tenantId: tenant.id,
        name: 'BPA Quiz',
        category: 'Business Process Automation',
        description: '40 Very Basic BPA Multiple Choice Questions (Fundamentals, Workflow & Triggers, RPA, Logic & Data)',
        status: 'ACTIVE',
      },
    });
    console.log(`✅ Created Question Bank: "BPA Quiz" (ID: ${bank.id})`);
  } else {
    console.log(`ℹ Found existing Question Bank: "BPA Quiz" (ID: ${bank.id})`);
  }

  // 3. Clear existing questions in this bank to ensure clean insertion
  const deleted = await prisma.question.deleteMany({
    where: { questionBankId: bank.id },
  });
  console.log(`Cleared ${deleted.count} old questions from BPA Quiz bank`);

  // 4. Insert all 40 questions
  let count = 0;
  for (const q of BPA_QUESTIONS) {
    count++;
    await prisma.question.create({
      data: {
        questionBankId: bank.id,
        question: q.question,
        optionA: q.optionA,
        optionB: q.optionB,
        optionC: q.optionC,
        optionD: q.optionD,
        correctAnswer: q.correctAnswer,
        marks: q.marks,
        sectionName: q.sectionName,
        sectionOrder: q.sectionOrder,
        status: 'ACTIVE',
      },
    });
  }

  console.log(`✅ Successfully seeded ${count} questions into "BPA Quiz" Question Bank!`);

  // Also check if an Assessment Session with "BPA Quiz" exists or create one if useful
  const existingAssessment = await prisma.assessment.findFirst({
    where: { name: 'BPA Quiz Assessment' },
  });

  if (!existingAssessment) {
    const slug = 'bpa-quiz-' + Math.random().toString(36).substring(2, 7);
    await prisma.assessment.create({
      data: {
        tenantId: tenant.id,
        questionBankId: bank.id,
        name: 'BPA Quiz Assessment',
        slug: slug,
        description: '40 Questions on Business Process Automation (BPA)',
        durationMins: 40,
        passingPercentage: 50.0,
        maxProctorWarnings: 5,
        status: 'ACTIVE',
      },
    });
    console.log(`✅ Created Assessment Session: "BPA Quiz Assessment" (Slug: ${slug})`);
  } else {
    // Make sure its questionBankId is linked to this bank
    await prisma.assessment.update({
      where: { id: existingAssessment.id },
      data: { questionBankId: bank.id },
    });
    console.log(`ℹ Updated Assessment Session: "BPA Quiz Assessment" with BPA Quiz bank`);
  }
}

seedBpaQuiz()
  .catch((err) => {
    console.error('❌ Error seeding BPA Quiz:', err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
