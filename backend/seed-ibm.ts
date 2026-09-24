import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const IBM_QUESTIONS = [
  {
    question: "What does IBM stand for in this course?",
    optionA: "International Business Management",
    optionB: "International Banking Management",
    optionC: "Indian Business Management",
    optionD: "International Brand Management",
    correctAnswer: "A",
    marks: 1,
    sectionName: "Introduction & Orientation",
    sectionOrder: 1,
  },
  {
    question: "What does an ethnocentric orientation mean?",
    optionA: "Every foreign country is treated as completely unique",
    optionB: "The home country is viewed as superior",
    optionC: "All countries are treated equally",
    optionD: "The company has no home-market strategy",
    correctAnswer: "B",
    marks: 1,
    sectionName: "Introduction & Orientation",
    sectionOrder: 1,
  },
  {
    question: "What does a polycentric orientation emphasize?",
    optionA: "Home-country superiority",
    optionB: "Standardization everywhere",
    optionC: "Each host country is treated as unique",
    optionD: "One global strategy without changes",
    correctAnswer: "C",
    marks: 1,
    sectionName: "Introduction & Orientation",
    sectionOrder: 1,
  },
  {
    question: "Which of the following is associated with traditional Asian cultural values?",
    optionA: "Personal independence",
    optionB: "Competition and challenge",
    optionC: "Self-expression",
    optionD: "Harmony and cooperation",
    correctAnswer: "D",
    marks: 1,
    sectionName: "Cultural Values",
    sectionOrder: 2,
  },
  {
    question: "Which cultural value is more associated with classical Western markets in the course material?",
    optionA: "Personal responsibility and independence",
    optionB: "Shared responsibility and interdependence",
    optionC: "Respect for authority",
    optionD: "Avoiding confrontation",
    correctAnswer: "A",
    marks: 1,
    sectionName: "Cultural Values",
    sectionOrder: 2,
  },
  {
    question: "What is product adaptation?",
    optionA: "Selling only in the home country",
    optionB: "Modifying a product or its execution for local needs",
    optionC: "Stopping production",
    optionD: "Selling without considering the market",
    correctAnswer: "B",
    marks: 1,
    sectionName: "Product Strategy & Adaptation",
    sectionOrder: 3,
  },
  {
    question: "Which is one of the three basic routes to a global product strategy?",
    optionA: "No special provision",
    optionB: "No international sales",
    optionC: "No customer research",
    optionD: "No distribution",
    correctAnswer: "A",
    marks: 1,
    sectionName: "Product Strategy & Adaptation",
    sectionOrder: 3,
  },
  {
    question: "What is standardization?",
    optionA: "Changing the product completely for every country",
    optionB: "Designing once and selling broadly with virtually no changes",
    optionC: "Producing only for one country",
    optionD: "Changing the product every month",
    correctAnswer: "B",
    marks: 1,
    sectionName: "Product Strategy & Adaptation",
    sectionOrder: 3,
  },
  {
    question: "Why might a company choose standardization?",
    optionA: "To increase complexity",
    optionB: "To increase local differences",
    optionC: "To achieve simplicity and lower cost",
    optionD: "To avoid economies of scale",
    correctAnswer: "C",
    marks: 1,
    sectionName: "Product Strategy & Adaptation",
    sectionOrder: 3,
  },
  {
    question: "Which company is given as an example of customized adaptation in Japan?",
    optionA: "Sony",
    optionB: "McDonald’s",
    optionC: "DuPont",
    optionD: "Pepsi",
    correctAnswer: "C",
    marks: 1,
    sectionName: "Product Strategy & Adaptation",
    sectionOrder: 3,
  },
  {
    question: "Which of the following can make product adaptation mandatory?",
    optionA: "Country regulations",
    optionB: "Company logo",
    optionC: "Employee uniforms",
    optionD: "Office furniture",
    correctAnswer: "A",
    marks: 1,
    sectionName: "Product Strategy & Adaptation",
    sectionOrder: 3,
  },
  {
    question: "What is one reason electrical standards may require product adaptation?",
    optionA: "Different countries may use different voltage standards",
    optionB: "Consumers prefer different advertisements",
    optionC: "Companies use different logos",
    optionD: "Employees speak different languages",
    correctAnswer: "A",
    marks: 1,
    sectionName: "Product Strategy & Adaptation",
    sectionOrder: 3,
  },
  {
    question: "According to the material, what voltage is given as the standard for India?",
    optionA: "110 volts",
    optionB: "120 volts",
    optionC: "220 volts",
    optionD: "240 volts",
    correctAnswer: "C",
    marks: 1,
    sectionName: "Product Strategy & Adaptation",
    sectionOrder: 3,
  },
  {
    question: "Which factor can create a need for optional product adaptation?",
    optionA: "Climate",
    optionB: "Company name",
    optionC: "Share price",
    optionD: "Stock exchange",
    correctAnswer: "A",
    marks: 1,
    sectionName: "Product Strategy & Adaptation",
    sectionOrder: 3,
  },
  {
    question: "Why were smaller refrigerators developed for the Japanese market?",
    optionA: "Lower electricity prices",
    optionB: "Space constraints in Japanese homes",
    optionC: "Different advertising regulations",
    optionD: "Higher transportation costs",
    correctAnswer: "B",
    marks: 1,
    sectionName: "Product Strategy & Adaptation",
    sectionOrder: 3,
  },
  {
    question: "Which company downsized a shower to fit smaller Japanese hands?",
    optionA: "Avon",
    optionB: "Philips",
    optionC: "Sony",
    optionD: "Motorola",
    correctAnswer: "B",
    marks: 1,
    sectionName: "Product Strategy & Adaptation",
    sectionOrder: 3,
  },
  {
    question: "International pricing is described as a tripod based on:",
    optionA: "Product, place and promotion",
    optionB: "Cost, demand and competition",
    optionC: "Sales, profit and advertising",
    optionD: "Quality, brand and packaging",
    correctAnswer: "B",
    marks: 1,
    sectionName: "Pricing & Costing",
    sectionOrder: 4,
  },
  {
    question: "What is the basic idea of cost-plus pricing?",
    optionA: "Cost minus profit",
    optionB: "Cost plus a margin",
    optionC: "Demand plus competition",
    optionD: "Price minus cost",
    correctAnswer: "B",
    marks: 1,
    sectionName: "Pricing & Costing",
    sectionOrder: 4,
  },
  {
    question: "What does marginal cost pricing focus on in foreign markets?",
    optionA: "Incremental costs",
    optionB: "Advertising costs only",
    optionC: "Employee salaries only",
    optionD: "Competitor profits",
    correctAnswer: "A",
    marks: 1,
    sectionName: "Pricing & Costing",
    sectionOrder: 4,
  },
  {
    question: "Which company is mentioned in relation to penetration pricing of a CD player?",
    optionA: "Philips",
    optionB: "Sony",
    optionC: "McDonald’s",
    optionD: "Mercedes Benz",
    correctAnswer: "B",
    marks: 1,
    sectionName: "Pricing & Costing",
    sectionOrder: 4,
  },
  {
    question: "What happened when the same premium-pricing strategy was initially applied by Disney in France?",
    optionA: "Demand increased sharply",
    optionB: "Demand remained unchanged",
    optionC: "Demand fell sharply",
    optionD: "Costs disappeared",
    correctAnswer: "C",
    marks: 1,
    sectionName: "Pricing & Costing",
    sectionOrder: 4,
  },
  {
    question: "What is dumping?",
    optionA: "Selling a product at unusually low prices in a foreign market relative to the home-market context",
    optionB: "Destroying all products",
    optionC: "Increasing prices in every country",
    optionD: "Selling only through retailers",
    correctAnswer: "A",
    marks: 1,
    sectionName: "Dumping & Countertrade",
    sectionOrder: 5,
  },
  {
    question: "What is predatory dumping?",
    optionA: "Selling at a loss to gain market share and weaken competitors",
    optionB: "Selling unsold inventory normally",
    optionC: "Selling only expensive products",
    optionD: "Selling products through government agencies",
    correctAnswer: "A",
    marks: 1,
    sectionName: "Dumping & Countertrade",
    sectionOrder: 5,
  },
  {
    question: "What is sporadic dumping?",
    optionA: "Permanent price differentiation",
    optionB: "Liquidating unsold inventory",
    optionC: "Increasing prices after gaining market share",
    optionD: "Selling only luxury products",
    correctAnswer: "B",
    marks: 1,
    sectionName: "Dumping & Countertrade",
    sectionOrder: 5,
  },
  {
    question: "What is countertrade?",
    optionA: "A goods-for-goods arrangement",
    optionB: "A cash-only transaction",
    optionC: "A domestic advertising strategy",
    optionD: "A product warranty",
    correctAnswer: "A",
    marks: 1,
    sectionName: "Dumping & Countertrade",
    sectionOrder: 5,
  },
  {
    question: "Why may countries use countertrade?",
    optionA: "To avoid all international business",
    optionB: "Because of financing constraints and limited hard currency",
    optionC: "To increase advertising expenditure",
    optionD: "To reduce product quality",
    correctAnswer: "B",
    marks: 1,
    sectionName: "Dumping & Countertrade",
    sectionOrder: 5,
  },
  {
    question: "Which activity is an example of personal selling?",
    optionA: "A salesperson directly interacting with a customer",
    optionB: "A newspaper advertisement",
    optionC: "A billboard",
    optionD: "A television commercial",
    correctAnswer: "A",
    marks: 1,
    sectionName: "Promotion & Advertising",
    sectionOrder: 6,
  },
  {
    question: "According to the material, demonstrations, seminars and exhibitions are particularly valued in:",
    optionA: "Korea",
    optionB: "France",
    optionC: "Germany",
    optionD: "Canada",
    correctAnswer: "A",
    marks: 1,
    sectionName: "Promotion & Advertising",
    sectionOrder: 6,
  },
  {
    question: "Which country is mentioned as prohibiting door-to-door selling?",
    optionA: "Japan",
    optionB: "Korea",
    optionC: "France",
    optionD: "China",
    correctAnswer: "C",
    marks: 1,
    sectionName: "Promotion & Advertising",
    sectionOrder: 6,
  },
  {
    question: "What is telemarketing?",
    optionA: "Selling through newspapers",
    optionB: "Telephone-based selling",
    optionC: "Selling through exhibitions",
    optionD: "Selling through outdoor posters",
    correctAnswer: "B",
    marks: 1,
    sectionName: "Promotion & Advertising",
    sectionOrder: 6,
  },
  {
    question: "What is one important consideration when selecting advertising media internationally?",
    optionA: "Local conditions",
    optionB: "The company's home office size",
    optionC: "Employee age",
    optionD: "Factory location only",
    correctAnswer: "A",
    marks: 1,
    sectionName: "Promotion & Advertising",
    sectionOrder: 6,
  },
  {
    question: "What does the phrase \"Think Global, Act Local\" suggest?",
    optionA: "Use exactly the same advertising everywhere",
    optionB: "Maintain a common appeal while adapting to local markets",
    optionC: "Avoid international markets",
    optionD: "Use only local brands",
    correctAnswer: "B",
    marks: 1,
    sectionName: "Promotion & Advertising",
    sectionOrder: 6,
  },
  {
    question: "Which of the following is an example of an advertising medium?",
    optionA: "Radio",
    optionB: "Inventory",
    optionC: "Warehouse",
    optionD: "Invoice",
    correctAnswer: "A",
    marks: 1,
    sectionName: "Promotion & Advertising",
    sectionOrder: 6,
  },
  {
    question: "What is a trade embargo?",
    optionA: "A political move restricting business with another country",
    optionB: "A discount offered by retailers",
    optionC: "A product adaptation strategy",
    optionD: "A method of personal selling",
    correctAnswer: "A",
    marks: 1,
    sectionName: "Trade Policy & Sanctions",
    sectionOrder: 7,
  },
  {
    question: "Which of the following is an economic sanction?",
    optionA: "Reduction of diplomatic ties",
    optionB: "Military intervention",
    optionC: "Restriction of trade or selected sectors",
    optionD: "Personal selling",
    correctAnswer: "C",
    marks: 1,
    sectionName: "Trade Policy & Sanctions",
    sectionOrder: 7,
  },
  {
    question: "Which of the following is a mode of international transportation?",
    optionA: "Air",
    optionB: "Advertising",
    optionC: "Personal selling",
    optionD: "Pricing",
    correctAnswer: "A",
    marks: 1,
    sectionName: "Logistics & Internationalization",
    sectionOrder: 8,
  },
  {
    question: "Which three factors are important when choosing a transportation mode?",
    optionA: "Brand, product and promotion",
    optionB: "Market location, speed and cost",
    optionC: "Price, packaging and advertising",
    optionD: "Culture, climate and colour",
    correctAnswer: "B",
    marks: 1,
    sectionName: "Logistics & Internationalization",
    sectionOrder: 8,
  },
  {
    question: "Which transportation mode is generally suited to high-value, low-weight products?",
    optionA: "Water",
    optionB: "Rail",
    optionC: "Air",
    optionD: "Truck",
    correctAnswer: "C",
    marks: 1,
    sectionName: "Logistics & Internationalization",
    sectionOrder: 8,
  },
  {
    question: "Which transportation mode is economical for bulk and dense cargo?",
    optionA: "Air",
    optionB: "Water",
    optionC: "Truck only",
    optionD: "Courier",
    correctAnswer: "B",
    marks: 1,
    sectionName: "Logistics & Internationalization",
    sectionOrder: 8,
  },
  {
    question: "What does the usual pattern of internationalization suggest?",
    optionA: "Companies always internationalize at the same speed",
    optionB: "Deeper international commitment can develop as the company moves outward along the dimensions of internationalization",
    optionC: "Companies should never expand abroad",
    optionD: "Exporting is always the final stage",
    correctAnswer: "B",
    marks: 1,
    sectionName: "Logistics & Internationalization",
    sectionOrder: 8,
  },
];

async function seedIbmQuiz() {
  console.log('--- Starting IBM Quiz Question Bank Seeding ---');

  // 1. Get primary tenant (GREATCAMPUS)
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

  // 2. Find or create Question Bank "IBM Quiz"
  let bank = await prisma.questionBank.findFirst({
    where: { name: 'IBM Quiz' },
  });

  if (!bank) {
    bank = await prisma.questionBank.create({
      data: {
        tenantId: tenant.id,
        name: 'IBM Quiz',
        category: 'International Business Management',
        description: '40 Very Basic MCQs on International Business Management (IBM) - Orientation, Product Adaptation, Pricing, Dumping, Countertrade, Promotion & Global Transportation',
        status: 'ACTIVE',
      },
    });
    console.log(`✅ Created Question Bank: "IBM Quiz" (ID: ${bank.id})`);
  } else {
    // Ensure tenantId matches
    await prisma.questionBank.update({
      where: { id: bank.id },
      data: { tenantId: tenant.id, category: 'International Business Management', status: 'ACTIVE' },
    });
    console.log(`ℹ Found existing Question Bank: "IBM Quiz" (ID: ${bank.id})`);
  }

  // 3. Clear existing questions in this bank
  const deleted = await prisma.question.deleteMany({
    where: { questionBankId: bank.id },
  });
  console.log(`Cleared ${deleted.count} old questions from IBM Quiz bank`);

  // 4. Insert all 40 questions
  let count = 0;
  for (const q of IBM_QUESTIONS) {
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

  console.log(`✅ Successfully seeded ${count} questions into "IBM Quiz" Question Bank!`);

  // 5. Create or update Assessment Session: "IBM Quiz Assessment" with clean slug "ibm-quiz"
  const existingAssessment = await prisma.assessment.findFirst({
    where: { OR: [{ slug: 'ibm-quiz' }, { name: 'IBM Quiz Assessment' }] },
  });

  if (!existingAssessment) {
    await prisma.assessment.create({
      data: {
        tenantId: tenant.id,
        questionBankId: bank.id,
        name: 'IBM Quiz Assessment',
        slug: 'ibm-quiz',
        description: '40 Questions on International Business Management (IBM)',
        durationMins: 40,
        passingPercentage: 50.0,
        maxProctorWarnings: 5,
        status: 'ACTIVE',
      },
    });
    console.log(`✅ Created Assessment Session: "IBM Quiz Assessment" (Slug: ibm-quiz)`);
  } else {
    await prisma.assessment.update({
      where: { id: existingAssessment.id },
      data: {
        tenantId: tenant.id,
        questionBankId: bank.id,
        name: 'IBM Quiz Assessment',
        slug: 'ibm-quiz',
        status: 'ACTIVE',
      },
    });
    console.log(`ℹ Updated Assessment Session: "IBM Quiz Assessment" (Slug: ibm-quiz)`);
  }
}

seedIbmQuiz()
  .catch((err) => {
    console.error('❌ Error seeding IBM Quiz:', err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
