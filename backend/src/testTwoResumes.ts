import { geminiService } from './services/GeminiService';

async function runTwoResumesTest() {
  console.log('====================================================');
  console.log('🧪 DYNAMIC AI PIPELINE TEST: TWO DIFFERENT RESUMES');
  console.log('====================================================');

  // RESUME A: Java / Spring Boot Developer
  const resumeA_Text = `Rahul Sharma
rahul.sharma.dev@gmail.com | +91 9876543210 | Pune, India
Education: B.Tech in Information Technology, Pune University (2023)
Skills: Java, Spring Boot, Microservices, MySQL, Hibernate, REST APIs, Git, JUnit, Maven
Experience: Java Backend Developer Intern at TechCorp Solutions (Jul 2023 - Jan 2024). Developed Spring Boot microservices and optimized MySQL database queries.
Projects: Banking Transaction API built with Java, Spring Boot, MySQL, and Spring Security.
Certifications: Oracle Certified Associate Java SE Programmer.`;

  // RESUME B: React / TypeScript Developer
  const resumeB_Text = `Aisha Khan
aisha.khan.frontend@outlook.com | +91 9123456789 | Mumbai, India
Education: B.Sc in Computer Science, Mumbai University (2024)
Skills: React, TypeScript, Next.js, Redux, Tailwind CSS, HTML5, CSS3, JavaScript, GraphQL, Jest
Experience: Frontend Engineer Intern at WebStudio India (Feb 2024 - Jul 2024). Built responsive React user interfaces and integrated GraphQL APIs.
Projects: E-Commerce Storefront SPA using React, TypeScript, Redux, and Tailwind CSS.
Certifications: Meta Front-End Developer Professional Certificate.`;

  console.log('\n--- Analyzing RESUME A (Java Backend Developer) ---');
  const resultA = await geminiService.analyzeResume(resumeA_Text);
  console.log('  Candidate A Name:', resultA.parsedData.name);
  console.log('  Candidate A Email:', resultA.parsedData.email);
  console.log('  Candidate A Skills:', resultA.parsedData.skills?.join(', '));
  console.log('  Candidate A Target Roles:', resultA.recommendedRoles?.join(', '));
  console.log('  Candidate A Score:', resultA.resumeScore);
  console.log('  Candidate A Strengths:', resultA.strengths?.[0]);

  console.log('\n--- Analyzing RESUME B (React Frontend Developer) ---');
  const resultB = await geminiService.analyzeResume(resumeB_Text);
  console.log('  Candidate B Name:', resultB.parsedData.name);
  console.log('  Candidate B Email:', resultB.parsedData.email);
  console.log('  Candidate B Skills:', resultB.parsedData.skills?.join(', '));
  console.log('  Candidate B Target Roles:', resultB.recommendedRoles?.join(', '));
  console.log('  Candidate B Score:', resultB.resumeScore);
  console.log('  Candidate B Strengths:', resultB.strengths?.[0]);

  console.log('\n--- VERIFYING DYNAMIC DIFFERENCE ---');
  const nameDiff = resultA.parsedData.name !== resultB.parsedData.name;
  const skillsDiff = JSON.stringify(resultA.parsedData.skills) !== JSON.stringify(resultB.parsedData.skills);
  const rolesDiff = JSON.stringify(resultA.recommendedRoles) !== JSON.stringify(resultB.recommendedRoles);

  console.log('  ✓ Candidate Names Differ:', nameDiff ? 'PASS' : 'FAIL');
  console.log('  ✓ Candidate Skills Differ:', skillsDiff ? 'PASS' : 'FAIL');
  console.log('  ✓ Recommended Roles Differ:', rolesDiff ? 'PASS' : 'FAIL');

  if (nameDiff && skillsDiff && rolesDiff) {
    console.log('\n====================================================');
    console.log('🎉 TEST SUCCESS: AI PIPELINE IS 100% DYNAMIC & RESUME-DRIVEN');
    console.log('====================================================');
  } else {
    console.error('\n❌ TEST FAILED: Results were static or identical!');
    process.exit(1);
  }
}

runTwoResumesTest().catch(console.error);
