import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class QuestionsService {
  constructor(private prisma: PrismaService) {}

  // Get all questions from the shared question bank
  async getQuestions() {
    return this.prisma.question.findMany({
      orderBy: { createdAt: 'asc' },
    });
  }

  async addQuestion(data: {
    question: string;
    optionA: string;
    optionB: string;
    optionC: string;
    optionD: string;
    correctAnswer: string;
    marks?: number;
  }) {
    return this.prisma.question.create({
      data: {
        question: data.question,
        optionA: data.optionA,
        optionB: data.optionB,
        optionC: data.optionC,
        optionD: data.optionD,
        correctAnswer: data.correctAnswer,
        marks: data.marks ?? 1,
      } as any,
    });
  }

  async updateQuestion(
    id: string,
    data: {
      question?: string;
      optionA?: string;
      optionB?: string;
      optionC?: string;
      optionD?: string;
      correctAnswer?: string;
      marks?: number;
      status?: string;
    }
  ) {
    return this.prisma.question.update({
      where: { id },
      data,
    });
  }

  async deleteQuestion(id: string) {
    return this.prisma.question.delete({ where: { id } });
  }

  async seed60OfficialQuestions() {
    const all60Questions = [
      // SET 1: ARM Banca (Q1 - Q30)
      { sectionName: 'Communication & Customer Handling', sectionOrder: 1, question: `A bank customer says: "I came to discuss my fixed deposit. I don't want another sales pitch." What is the most effective response?`, optionA: `Insurance is important, so please hear me out.`, optionB: `Understood. Let's first complete your FD discussion.`, optionC: `Most customers eventually need additional protection.`, optionD: `I can explain the policy in just two minutes.`, correctAnswer: `B`, marks: 1 },
      { sectionName: 'Communication & Customer Handling', sectionOrder: 1, question: `A customer is visibly irritated because an insurance document has not arrived. You discover that the document was generated, but delivery has been delayed. What should you do?`, optionA: `Explain the delay and provide the next expected step.`, optionB: `Tell the customer that delivery is handled by the operations department.`, optionC: `Ask the customer to contact the insurer directly.`, optionD: `Apologise and promise delivery by tomorrow.`, correctAnswer: `A`, marks: 1 },
      { sectionName: 'Communication & Customer Handling', sectionOrder: 1, question: `A customer asks: "Will this policy definitely pay for my father's treatment?" You have not examined the policy terms or medical details. What is the most appropriate response?`, optionA: `It should be covered if the policy is active.`, optionB: `Most treatments are covered under health insurance.`, optionC: `Yes, provided the premium has been paid.`, optionD: `Let's check the applicable terms before I answer.`, correctAnswer: `D`, marks: 1 },
      { sectionName: 'Communication & Customer Handling', sectionOrder: 1, question: `During a conversation, a customer gives short answers and appears uncomfortable discussing personal financial matters. What should the RM do?`, optionA: `Continue asking detailed financial questions.`, optionB: `Explain why the information is necessary and proceed sensitively.`, optionC: `Recommend a standard product without further questions as that it goes well with the customer.`, optionD: `End the conversation and approach the customer later.`, correctAnswer: `B`, marks: 1 },
      { sectionName: 'Communication & Customer Handling', sectionOrder: 1, question: `Which approach best demonstrates consultative customer handling?`, optionA: `Present benefits before asking questions.`, optionB: `Ask questions, understand needs, and then recommend.`, optionC: `Offer several products and let customers compare and make a decision.`, optionD: `Start with the product most frequently purchased.`, correctAnswer: `B`, marks: 1 },

      { sectionName: 'Advanced English & Comprehension', sectionOrder: 2, question: `Read the statement: "The customer's reluctance was not attributable to the premium alone; rather, it appeared to stem from uncertainty about the extent of coverage." What does the statement imply?`, optionA: `The premium was the customer's only concern.`, optionB: `The customer had rejected the product because it was expensive.`, optionC: `The customer was mainly concerned about payment frequency.`, optionD: `The customer's hesitation involved uncertainty about coverage.`, correctAnswer: `D`, marks: 1 },
      { sectionName: 'Advanced English & Comprehension', sectionOrder: 2, question: `Read the passage: A customer may have substantial savings and still face a significant financial vulnerability if an unexpected medical expense requires immediate payment. Savings provide liquidity, whereas insurance is designed to transfer specified risks subject to policy conditions. The two therefore serve different financial purposes. Which conclusion is best supported?`, optionA: `Savings are unsuitable for handling healthcare expenses in the future during any emergency.`, optionB: `Insurance should replace all forms of personal savings.`, optionC: `Savings and insurance can address different aspects of financial risk.`, optionD: `Customers with substantial savings do not need health insurance.`, correctAnswer: `C`, marks: 1 },
      { sectionName: 'Advanced English & Comprehension', sectionOrder: 2, question: `Read the statement: "Although customer engagement increased significantly, conversion remained unchanged. This suggests that the issue may lie less in the quantity of interactions and more in what occurs during those interactions." Which inference is strongest?`, optionA: `Customer engagement should be reduced.`, optionB: `The product is unsuitable for the customer segment.`, optionC: `The quality of customer interactions warrants examination.`, optionD: `Higher activity levels generally reduce conversion.`, correctAnswer: `C`, marks: 1 },
      { sectionName: 'Advanced English & Comprehension', sectionOrder: 2, question: `Choose the grammatically correct sentence.`, optionA: `Had the RM verified the information, the misunderstanding might have been avoided.`, optionB: `Had the RM verified the information, the misunderstanding will be avoided.`, optionC: `If the RM had verified the information, the misunderstanding is avoided.`, optionD: `If the RM verified the information, the misunderstanding might had been avoided.`, correctAnswer: `A`, marks: 1 },
      { sectionName: 'Advanced English & Comprehension', sectionOrder: 2, question: `Read the statement: "The branch recorded its strongest quarterly sales, yet customer retention declined and service complaints increased." Which conclusion is most defensible?`, optionA: `Sales growth was entirely driven by poor service.`, optionB: `The branch should stop pursuing aggressive sales targets as it is effecting the servcie.`, optionC: `Customer retention has no relationship with sales performance.`, optionD: `Sales achievement alone is insufficient to judge overall performance.`, correctAnswer: `D`, marks: 1 },

      { sectionName: 'Mental Ability & Reasoning', sectionOrder: 3, question: `Six candidates - P, Q, R, S, T and U - are ranked from first to sixth. • P ranks above R. • R ranks above S. • Q ranks above T. • T ranks above U. • S ranks above U. Which candidate cannot be ranked first?`, optionA: `P`, optionB: `Q`, optionC: `R`, optionD: `S`, correctAnswer: `D`, marks: 1 },
      { sectionName: 'Mental Ability & Reasoning', sectionOrder: 3, question: `A person walks 10 km east, turns left and walks 6 km, then turns left and walks 10 km. Where is the person relative to the starting point?`, optionA: `6 km north`, optionB: `6 km south`, optionC: `10 km east`, optionD: `10 km west`, correctAnswer: `A`, marks: 1 },
      { sectionName: 'Mental Ability & Reasoning', sectionOrder: 3, question: `If BANK → CBOL and CREDIT → DSFEJU using the same rule, then LOAN becomes:`, optionA: `MPBO`, optionB: `MPAO`, optionC: `LPBO`, optionD: `MQBO`, correctAnswer: `A`, marks: 1 },
      { sectionName: 'Mental Ability & Reasoning', sectionOrder: 3, question: `Five activities must follow these rules: • A occurs before C. • B occurs before D. • C occurs before E. • D occurs before E. Which activity could occur first?`, optionA: `E`, optionB: `C`, optionC: `D`, optionD: `A`, correctAnswer: `D`, marks: 1 },
      { sectionName: 'Mental Ability & Reasoning', sectionOrder: 3, question: `A sequence follows the rule: 3 → 12, 5 → 30, 7 → 56, 9 → 90. Which number should replace the question mark? 11 → ?`, optionA: `110`, optionB: `121`, optionC: `132`, optionD: `144`, correctAnswer: `C`, marks: 1 },

      { sectionName: 'Numerical & Mathematical Reasoning', sectionOrder: 4, question: `Three RMs generate business in the ratio 3 : 5 : 7. Their combined business is ₹12 lakh. How much does the highest-producing RM generate?`, optionA: `₹4.8 lakh`, optionB: `₹5.2 lakh`, optionC: `₹5.6 lakh`, optionD: `₹6.0 lakh`, correctAnswer: `C`, marks: 1 },
      { sectionName: 'Numerical & Mathematical Reasoning', sectionOrder: 4, question: `A branch has a target of 600 policies. • Team A achieves 120% of its 150-policy target. • Team B achieves 90% of its 200-policy target. • Team C achieves 80% of its 150-policy target. • Team D achieves 95 policies. How many policies does the branch achieve?`, optionA: `515`, optionB: `525`, optionC: `535`, optionD: `545`, correctAnswer: `B`, marks: 1 },
      { sectionName: 'Numerical & Mathematical Reasoning', sectionOrder: 4, question: `A bank has 1,200 eligible customers. • 40% are contacted. • 50% of contacted customers show interest. • 60% of interested customers attend a meeting. • 50% of meetings lead to proposals. • 80% of proposals convert. How many policies should result?`, optionA: `96`, optionB: `108`, optionC: `112`, optionD: `115`, correctAnswer: `A`, marks: 1 },
      { sectionName: 'Numerical & Mathematical Reasoning', sectionOrder: 4, question: `An RM has achieved ₹7.2 lakh in the first 12 working days. There are 8 working days remaining. To finish the month at ₹12 lakh, what average daily business is required for the remaining days?`, optionA: `₹52,000`, optionB: `₹55,000`, optionC: `₹60,000`, optionD: `₹65,000`, correctAnswer: `C`, marks: 1 },
      { sectionName: 'Numerical & Mathematical Reasoning', sectionOrder: 4, question: `A branch increases sales by 30%, while the number of active RMs increases by 20%. Approximately what happens to sales per RM?`, optionA: `It rises by about 8.3%.`, optionB: `It rises by exactly 10%.`, optionC: `It rises by about 12%.`, optionD: `It falls by about 8.3%.`, correctAnswer: `A`, marks: 1 },

      { sectionName: 'Banking & Financial Awareness', sectionOrder: 5, question: `A customer's credit score has declined after repeated missed loan repayments. What does this most directly indicate?`, optionA: `The customer's income has necessarily declined.`, optionB: `The customer's investment portfolio has lost value, and he is confused.`, optionC: `The customer's creditworthiness may have been negatively affected.`, optionD: `The customer's bank account has become inactive.`, correctAnswer: `C`, marks: 1 },
      { sectionName: 'Banking & Financial Awareness', sectionOrder: 5, question: `A customer asks why a bank assesses income, existing liabilities and repayment history before approving a loan. What is the primary reason?`, optionA: `To determine whether the customer qualifies for insurance.`, optionB: `To estimate the customer's investment returns.`, optionC: `To establish the customer's tax liability.`, optionD: `To assess repayment capacity and credit risk.`, correctAnswer: `D`, marks: 1 },
      { sectionName: 'Banking & Financial Awareness', sectionOrder: 5, question: `A customer has income of ₹1 lakh per month and total monthly loan obligations of ₹60,000. Which conclusion is most reasonable?`, optionA: `The customer has no capacity to save.`, optionB: `The customer's repayment burden warrants careful assessment.`, optionC: `The customer should automatically receive a new loan.`, optionD: `The customer is financially secure because income exceeds liabilities.`, correctAnswer: `B`, marks: 1 },
      { sectionName: 'Banking & Financial Awareness', sectionOrder: 5, question: `What is the primary purpose of diversification in an investment portfolio?`, optionA: `To eliminate investment risk completely.`, optionB: `To guarantee a positive annual return.`, optionC: `To spread exposure across different investments.`, optionD: `To concentrate capital in the strongest asset.`, correctAnswer: `C`, marks: 1 },
      { sectionName: 'Banking & Financial Awareness', sectionOrder: 5, question: `A customer asks why inflation matters when comparing returns on savings. Which explanation is most appropriate?`, optionA: `Inflation determines the customer's credit score which affects his borrowing capability.`, optionB: `Inflation reduces the purchasing power of money over time.`, optionC: `Inflation guarantees higher bank interest rates.`, optionD: `Inflation affects only customers who borrow money.`, correctAnswer: `B`, marks: 1 },

      { sectionName: 'Sales Orientation & Situational Judgement', sectionOrder: 6, question: `A customer appears interested but repeatedly postpones the decision. Which action demonstrates the strongest sales judgment?`, optionA: `Increase pressure to create urgency.`, optionB: `Offer a discount without understanding the hesitation.`, optionC: `Ask what unresolved concern is preventing a decision.`, optionD: `Stop following up to avoid irritating the customer.`, correctAnswer: `C`, marks: 1 },
      { sectionName: 'Sales Orientation & Situational Judgement', sectionOrder: 6, question: `You have consistently achieved your activity targets but missed your sales targets. What does this most strongly suggest?`, optionA: `Your activity levels are necessarily too low.`, optionB: `Your customers are unsuitable.`, optionC: `Your conversion effectiveness needs examination.`, optionD: `Your sales target is probably could be unrealistic and discuss this with your boss.`, correctAnswer: `C`, marks: 1 },
      { sectionName: 'Sales Orientation & Situational Judgement', sectionOrder: 6, question: 'An RM discovers that a colleague is telling customers that purchasing insurance is mandatory for receiving a banking service. What should the RM do?', optionA: `Ignore it because the colleague is generating business.`, optionB: `Repeat the practice only for high-value customers as they are the ones who help you achieve your targets.`, optionC: `Discuss the concern privately and escalate appropriately if required.`, optionD: `Confront the colleague in front of the customer.`, correctAnswer: `C`, marks: 1 },
      { sectionName: 'Sales Orientation & Situational Judgement', sectionOrder: 6, question: `A customer asks a technical question, and the RM is unsure of the answer. The customer appears ready to purchase. What should the RM do?`, optionA: `Give the most likely answer to avoid losing the sale.`, optionB: `Acknowledge the uncertainty and verify the information.`, optionC: `Redirect the discussion to another product benefit.`, optionD: `Ask the customer to research the answer independently.`, correctAnswer: `B`, marks: 1 },
      { sectionName: 'Sales Orientation & Situational Judgement', sectionOrder: 6, question: `Which candidate demonstrates the strongest potential for an Assistant Relationship Manager – Banca role?`, optionA: `A candidate who is highly persuasive but sometimes overlooks customer concerns.`, optionB: `A candidate who is technically knowledgeable but uncomfortable initiating conversations.`, optionC: `A candidate who is target-driven and willing to make aggressive commitments.`, optionD: `A candidate who listens, analyses needs, explains clearly and follows through.`, correctAnswer: `D`, marks: 1 },

      // SET 2: AGENCY UNIT MANAGER (Q31 - Q60)
      { sectionName: 'Communication & Customer Handling', sectionOrder: 1, question: `A customer says: "I already have ₹5 lakh of health insurance from my employer. Why should I consider another policy?" Which response demonstrates the strongest consultative approach?`, optionA: `Additional insurance provides broader financial protection and makes more sense.`, optionB: `Employer coverage may not always be sufficient.`, optionC: `May I understand your existing cover and family needs first?`, optionD: `Our policy can provide you with higher protection.`, correctAnswer: `C`, marks: 1 },
      { sectionName: 'Communication & Customer Handling', sectionOrder: 1, question: `A customer says: "Your advisor told me the treatment was covered. Why are you asking for additional documents now?" What should the Agency Unit Manager do first?`, optionA: `Review the case and clarify the applicable requirement.`, optionB: `Explain that additional documents are normally required.`, optionC: `Ask the customer to contact the claims team.`, optionD: `Tell the customer the earlier advice may have been incorrect.`, correctAnswer: `A`, marks: 1 },
      { sectionName: 'Communication & Customer Handling', sectionOrder: 1, question: `Read the following statement: "The benefit is payable subject to the policy being active, completion of the applicable waiting period, and satisfaction of all relevant terms and conditions." Which interpretation is most accurate?`, optionA: `The benefit is available whenever the policy is active.`, optionB: `The benefit depends on several specified conditions.`, optionC: `The waiting period applies only to selected customers.`, optionD: `The benefit is payable whenever treatment is medically necessary.`, correctAnswer: `B`, marks: 1 },
      { sectionName: 'Communication & Customer Handling', sectionOrder: 1, question: `A customer says: "I want to discuss this with my spouse before making a decision." Which response is most appropriate?`, optionA: `Explain why delaying the decision could be risky.`, optionB: `Ask when would be a suitable time to reconnect.`, optionC: `Offer an incentive for making the decision today.`, optionD: `Ask the customer to decide before ending the meeting.`, correctAnswer: `B`, marks: 1 },
      { sectionName: 'Communication & Customer Handling', sectionOrder: 1, question: `A customer says: "I understand the premium, but I already have another policy and don't know whether additional cover makes sense." What should the advisor do?`, optionA: `Explain why having two policies can be beneficial.`, optionB: `Recommend the new policy based on the customer's income.`, optionC: `Ask about the existing policy before discussing options.`, optionD: `Tell the customer to compare both policies independently.`, correctAnswer: `C`, marks: 1 },

      { sectionName: 'Advanced English & Comprehension', sectionOrder: 2, question: `Choose the grammatically correct sentence.`, optionA: `Neither the manager nor the advisors was aware of the change.`, optionB: `Neither the manager nor the advisors is aware of the change.`, optionC: `Neither the manager nor the advisors were aware of the change.`, optionD: `Neither the manager or the advisors were aware of the change.`, correctAnswer: `C`, marks: 1 },
      { sectionName: 'Advanced English & Comprehension', sectionOrder: 2, question: `Which sentence is the most professionally appropriate?`, optionA: `Send these documents today or the proposal will stop.`, optionB: `Kindly share the required documents so we can proceed.`, optionC: `These documents are compulsory, so send them immediately.`, optionD: `You need to provide these papers before we can do anything.`, correctAnswer: `B`, marks: 1 },
      { sectionName: 'Advanced English & Comprehension', sectionOrder: 2, question: `Consider this statement: "Unless the required documents are received, the proposal cannot proceed." Which interpretation is logically correct?`, optionA: `The proposal may proceed with some documents missing.`, optionB: `The proposal will automatically be rejected.`, optionC: `The required documents are necessary for progression.`, optionD: `The documents can be submitted after the proposal proceeds.`, correctAnswer: `C`, marks: 1 },
      { sectionName: 'Advanced English & Comprehension', sectionOrder: 2, question: `Read the statement: "The branch increased customer meetings by 30%, but the conversion rate remained unchanged." Which inference is most reasonable?`, optionA: `Increasing activity alone did not improve conversion.`, optionB: `Customers became less interested in insurance.`, optionC: `The advisor's meetings were generally unsuccessful.`, optionD: `The branch should reduce customer meetings to at least save time.`, correctAnswer: `A`, marks: 1 },
      { sectionName: 'Advanced English & Comprehension', sectionOrder: 2, question: `Read the statement: "The branch achieved its highest sales volume this quarter. However, customer complaints increased significantly, and documentation errors remained above acceptable levels." Which conclusion is most defensible?`, optionA: `The branch should reduce its sales targets.`, optionB: `Customer complaints are unavoidable during growth.`, optionC: `Sales volume alone does not establish overall effectiveness.`, optionD: `Documentation requirements are restricting business growth.`, correctAnswer: `C`, marks: 1 },

      { sectionName: 'Mental Ability & Reasoning', sectionOrder: 3, question: `Find the next number: 5, 11, 23, 47, 95, ?`, optionA: `181`, optionB: `189`, optionC: `191`, optionD: `195`, correctAnswer: `C`, marks: 1 },
      { sectionName: 'Mental Ability & Reasoning', sectionOrder: 3, question: `Five candidates P, Q, R, S and T are ranked from highest to lowest. • P ranks above R. • Q ranks above S. • R ranks above S. • S ranks above T. Who must rank above S?`, optionA: `P and Q only`, optionB: `R and Q only`, optionC: `P, R and Q`, optionD: `R, S and Q`, correctAnswer: `B`, marks: 1 },
      { sectionName: 'Mental Ability & Reasoning', sectionOrder: 3, question: `A person walks 6 km north, then 8 km east, then 6 km south, and finally 5 km east. Where is the person relative to the starting point?`, optionA: `11 km east`, optionB: `11 km west`, optionC: `6 km north`, optionD: `6 km south`, correctAnswer: `A`, marks: 1 },
      { sectionName: 'Mental Ability & Reasoning', sectionOrder: 3, question: `All Agency Unit Managers are employees. Some employees are graduates. Which statement must be true?`, optionA: `Some graduates are Agency Unit Managers.`, optionB: `All graduates are Agency Unit Managers.`, optionC: `Every Agency Unit Manager is an employee.`, optionD: `No graduate can become an Agency Unit Manager.`, correctAnswer: `C`, marks: 1 },
      { sectionName: 'Mental Ability & Reasoning', sectionOrder: 3, question: `If 4 → 20, 6 → 42, 8 → 72, Then 10 → ?`, optionA: `100`, optionB: `110`, optionC: `120`, optionD: `130`, correctAnswer: `C`, marks: 1 },

      { sectionName: 'Numerical & Mathematical Reasoning', sectionOrder: 4, question: `A branch's business increased from ₹48 lakh to ₹60 lakh in one quarter. In the following quarter, business declined by 20%. What was the business in the second quarter?`, optionA: `₹48 lakh`, optionB: `₹50 lakh`, optionC: `₹52 lakh`, optionD: `₹54 lakh`, correctAnswer: `A`, marks: 1 },
      { sectionName: 'Numerical & Mathematical Reasoning', sectionOrder: 4, question: `Three advisors generate business in the ratio 3 : 4 : 5. Together they generate ₹9.6 lakh. How much does the highest-performing advisor generate?`, optionA: `₹3.2 lakh`, optionB: `₹3.6 lakh`, optionC: `₹4.0 lakh`, optionD: `₹4.4 lakh`, correctAnswer: `C`, marks: 1 },
      { sectionName: 'Numerical & Mathematical Reasoning', sectionOrder: 4, question: `A branch has a target of 500 policies. At the end of the month: • Advisor A achieves 120% of an individual target of 100. • Advisor B achieves 90% of a target of 150. • Advisor C achieves 80% of a target of 150. • The remaining advisors together achieve 95 policies. How many policies has the branch achieved?`, optionA: `435`, optionB: `445`, optionC: `455`, optionD: `465`, correctAnswer: `B`, marks: 1 },
      { sectionName: 'Numerical & Mathematical Reasoning', sectionOrder: 4, question: `A branch receives 1,000 leads. • 70% are contacted. • 60% of contacted leads are qualified. • 50% of qualified leads attend a meeting. • 40% of meetings result in proposals. • 75% of proposals convert. How many policies are expected?`, optionA: `54`, optionB: `60`, optionC: `63`, optionD: `70`, correctAnswer: `C`, marks: 1 },
      { sectionName: 'Numerical & Mathematical Reasoning', sectionOrder: 4, question: `An advisor's monthly target is ₹12 lakh. In the first 15 working days, the advisor achieves ₹7.2 lakh. There are 10 working days remaining. At the same daily run rate, approximately how much will the advisor achieve for the full month?`, optionA: `₹11.4 lakh`, optionB: `₹12.0 lakh`, optionC: `₹12.8 lakh`, optionD: `₹13.2 lakh`, correctAnswer: `D`, marks: 1 },

      { sectionName: 'Banking & Financial Awareness', sectionOrder: 5, question: `A policy contains a waiting period for a particular condition. Which interpretation is most appropriate?`, optionA: `The condition can never be covered under the policy.`, optionB: `The customer cannot renew the policy during that period the waiting period of the policy.`, optionC: `Coverage may become available after the specified period and applicable conditions.`, optionD: `The customer must pay an additional premium until the period ends.`, correctAnswer: `C`, marks: 1 },
      { sectionName: 'Banking & Financial Awareness', sectionOrder: 5, question: `A customer has paid the premium and asks whether every future medical expense will automatically be reimbursed. Which response is most accurate?`, optionA: `Reimbursement depends on the applicable policy terms and conditions.`, optionB: `Payment of premium on time always guarantees medical reimbursement.`, optionC: `Most medical expenses become payable once the policy starts.`, optionD: `Claims are normally approved when all premiums are current.`, correctAnswer: 'A', marks: 1 },
      { sectionName: 'Banking & Financial Awareness', sectionOrder: 5, question: `Why is accurate disclosure of relevant health information important when applying for insurance?`, optionA: `It guarantees approval of future claims easily by the company.`, optionB: `It eliminates the need for underwriting.`, optionC: `It ensures the premium cannot change later.`, optionD: `It helps the insurer assess the proposal appropriately.`, correctAnswer: `D`, marks: 1 },
      { sectionName: 'Banking & Financial Awareness', sectionOrder: 5, question: `A customer asks whether a claim will definitely be approved before it has been assessed. What is the most appropriate response?`, optionA: `Complete documentation generally ensures approval.`, optionB: `The outcome depends on the policy terms and claim assessment.`, optionC: `Claims are normally approved when the policy is active and never when inactive.`, optionD: `Approval should follow whenever premiums have been paid.`, correctAnswer: `B`, marks: 1 },
      { sectionName: 'Banking & Financial Awareness', sectionOrder: 5, question: `A customer believes the most expensive health insurance policy must automatically provide the best protection. What should the advisor do?`, optionA: `He should recommend the highest-priced option for maximum protection for the customer.`, optionB: `Explain that higher premiums usually mean better protection.`, optionC: `Understand the customer's needs before recommending suitable coverage.`, optionD: `Allow the customer to choose without offering a recommendation.`, correctAnswer: `C`, marks: 1 },

      { sectionName: 'Sales Orientation & Situational Judgement', sectionOrder: 6, question: `You have missed your business target for two consecutive months. What should you review first?`, optionA: `Your activity, conversion and follow-up patterns.`, optionB: `Whether the market has become more competitive.`, optionC: `Whether your monthly target is realistic.`, optionD: `Whether customers prefer another insurer.`, correctAnswer: `A`, marks: 1 },
      { sectionName: 'Sales Orientation & Situational Judgement', sectionOrder: 6, question: `Your manager gives you a challenging monthly target. What demonstrates the strongest approach?`, optionA: `Ask whether the target can be revised as that will be helpful.`, optionB: `Focus mainly on easy-to-convert prospects.`, optionC: `Wait until the first review to assess progress.`, optionD: `Break the target into measurable weekly activities.`, correctAnswer: `D`, marks: 1 },
      { sectionName: 'Sales Orientation & Situational Judgement', sectionOrder: 6, question: `A prospect rejects your recommendation after a detailed discussion. What should you do?`, optionA: `Ask what influenced the decision.`, optionB: `Explain the product again.`, optionC: `Move immediately to another prospect.`, optionD: `Stop contacting the prospect.`, correctAnswer: `A`, marks: 1 },
      { sectionName: 'Sales Orientation & Situational Judgement', sectionOrder: 6, question: `You are assigned a territory where you have very few existing contacts. What is the strongest response?`, optionA: `Request a territory with established customers.`, optionB: `Wait for referrals from experienced advisors as these are best prospects to contact.`, optionC: `Map the territory and create a prospecting plan.`, optionD: `Focus only on centrally generated leads.`, correctAnswer: `C`, marks: 1 },
      { sectionName: 'Sales Orientation & Situational Judgement', sectionOrder: 6, question: `Which situation best demonstrates genuine sales orientation?`, optionA: `Preferring customers who already intend to purchase.`, optionB: `Maintaining effort while learning from rejection.`, optionC: `Focusing mainly on products that are easy to explain.`, optionD: `Avoiding prospects who raise difficult objections, as that wastes a lot of time.`, correctAnswer: `B`, marks: 1 },

    ];

    try {
      let tenant = await this.prisma.tenant.findFirst({ where: { slug: 'niva-bupa' } });
      if (!tenant) {
        tenant = await this.prisma.tenant.create({ data: { name: 'Niva Bupa Health Insurance', slug: 'niva-bupa' } });
      }

      let assessment = await this.prisma.assessment.findFirst({ where: { slug: 'aa-2812' } });
      if (!assessment) {
        assessment = await this.prisma.assessment.create({
          data: {
            tenantId: tenant.id,
            name: 'Agency Unit Manager & ARM Banca Assessment',
            slug: 'aa-2812',
            description: 'Advanced Graduate & Post-Graduate Assessment for Agency Unit Manager and ARM - Banca Channel',
            durationMins: 45,
            passingPercentage: 50,
            maxProctorWarnings: 3,
            status: 'ACTIVE',
          },
        });
      } else {
        await this.prisma.assessment.update({
          where: { id: assessment.id },
          data: { durationMins: 45, passingPercentage: 50 },
        });
      }

      const assessmentId = assessment.id;

      await this.prisma.attemptQuestion.deleteMany({});
      await this.prisma.submission.deleteMany({});
      await this.prisma.question.deleteMany({});

      const dataToInsert = all60Questions.map((q, idx) => ({
        sectionName: q.sectionName,
        sectionOrder: q.sectionOrder,
        question: q.question,
        optionA: q.optionA,
        optionB: q.optionB,
        optionC: q.optionC,
        optionD: q.optionD,
        correctAnswer: q.correctAnswer,
        marks: 1,
        status: 'ACTIVE',
      }));

      await (this.prisma.question as any).createMany({ data: dataToInsert });

      const count = await this.prisma.question.count();

      return {
        success: true,
        message: 'Re-seeded question bank with all 60 official questions.',
        count,
        assessmentDurationMins: 45,
      };
    } catch (err: any) {
      console.error('SEED 60 FAILURE:', err);
      return { success: false, error: err.message };
    }
  }
}
