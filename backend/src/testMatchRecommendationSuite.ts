/**
 * CAREERPILOT — JOB MATCH ANALYSIS RECOMMENDATION SUITE
 */

import { geminiService } from './services/GeminiService';
import { Profile, Job } from './types';

async function runSuite() {
  console.log('\n====================================================');
  console.log('🧪 CAREERPILOT MATCH RECOMMENDATION TEST SUITE');
  console.log('====================================================\n');

  const results: Record<string, string> = {};

  const profileReact: Profile = {
    id: 'prof-react',
    name: 'Aisha Khan',
    email: 'aisha.khan@example.com',
    skills: ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'JavaScript', 'HTML5', 'CSS3'],
    experience: [],
    projects: [
      { title: 'E-Commerce React Storefront', tech_stack: ['React', 'TypeScript'], description: 'Built responsive UI' }
    ],
    certifications: [],
    achievements: [],
    languages: []
  };

  const profileJava: Profile = {
    id: 'prof-java',
    name: 'Rahul Sharma',
    email: 'rahul.sharma@example.com',
    skills: ['Java', 'Spring Boot', 'MySQL', 'Hibernate', 'Microservices', 'REST APIs'],
    experience: [],
    projects: [
      { title: 'Banking Transaction Microservices', tech_stack: ['Java', 'Spring Boot'], description: 'Built backend APIs' }
    ],
    certifications: [],
    achievements: [],
    languages: []
  };

  const frontendJob: Job = {
    id: 'job-frontend',
    company: 'Swiggy',
    role: 'Frontend Developer Intern',
    location: 'Bengaluru',
    work_mode: 'Hybrid',
    employment_type: 'Internship',
    salary: '₹30,000 / month',
    experience_required: '0-1 Years',
    education_required: 'B.Tech / BCA',
    skills: ['React', 'JavaScript', 'HTML5', 'CSS3', 'Tailwind CSS', 'Redux'],
    description: 'Build responsive UI components in React and Redux.',
    responsibilities: [],
    preferred_skills: []
  };

  const backendJob: Job = {
    id: 'job-backend',
    company: 'Razorpay',
    role: 'Software Development Engineer I (Backend)',
    location: 'Bengaluru',
    work_mode: 'Hybrid',
    employment_type: 'Full-time',
    salary: '₹14 - ₹18 LPA',
    experience_required: '0-2 Years',
    education_required: 'B.Tech CS',
    skills: ['Java', 'Spring Boot', 'MySQL', 'Redis', 'REST APIs'],
    description: 'Build backend microservices in Java Spring Boot.',
    responsibilities: [],
    preferred_skills: ['Docker']
  };

  // =====================================================
  // TEST 1: DIFFERENT JOBS PRODUCE DIFFERENT RECOMMENDATIONS
  // =====================================================
  console.log('--- TEST 1: Candidate A (React) matched against Job 1 (Frontend) vs Job 2 (Backend) ---');

  const matchFE = await geminiService.matchCandidateToJob(profileReact, frontendJob);
  const matchBE = await geminiService.matchCandidateToJob(profileReact, backendJob);

  console.log('  Job 1 (Frontend) Score:', matchFE.match_score);
  console.log('  Job 1 Readiness:', matchFE.recommendation_details?.applicationReadiness);
  console.log('  Job 1 Next Action:', matchFE.recommendation_details?.nextAction);

  console.log('  Job 2 (Backend) Score:', matchBE.match_score);
  console.log('  Job 2 Readiness:', matchBE.recommendation_details?.applicationReadiness);
  console.log('  Job 2 Next Action:', matchBE.recommendation_details?.nextAction);

  const test1Pass =
    matchFE.recommendation_details?.summary !== matchBE.recommendation_details?.summary &&
    matchFE.match_score > matchBE.match_score;

  console.log('  Different Jobs Recommendation Test:', test1Pass ? 'PASS ✅' : 'FAIL ❌');
  results['DIFFERENT_JOBS_RECOMMENDATIONS'] = test1Pass ? 'PASS ✅' : 'FAIL ❌';

  // =====================================================
  // TEST 2: DIFFERENT RESUMES PRODUCE DIFFERENT RECOMMENDATIONS FOR SAME JOB
  // =====================================================
  console.log('\n--- TEST 2: Candidate A (Java) vs Candidate B (React) on Same Job (Razorpay Backend) ---');

  const matchJavaBE = await geminiService.matchCandidateToJob(profileJava, backendJob);
  const matchReactBE = await geminiService.matchCandidateToJob(profileReact, backendJob);

  console.log('  Candidate A (Java) Score for Backend Job:', matchJavaBE.match_score);
  console.log('  Candidate A Readiness:', matchJavaBE.recommendation_details?.applicationReadiness);
  console.log('  Candidate B (React) Score for Backend Job:', matchReactBE.match_score);
  console.log('  Candidate B Readiness:', matchReactBE.recommendation_details?.applicationReadiness);

  const test2Pass =
    matchJavaBE.match_score > matchReactBE.match_score &&
    matchJavaBE.recommendation_details?.summary !== matchReactBE.recommendation_details?.summary;

  console.log('  Different Resumes Recommendation Test:', test2Pass ? 'PASS ✅' : 'FAIL ❌');
  results['DIFFERENT_RESUMES_RECOMMENDATIONS'] = test2Pass ? 'PASS ✅' : 'FAIL ❌';

  // =====================================================
  // SUMMARY REPORT
  // =====================================================
  console.log('\n====================================================');
  console.log('📋 VERIFICATION REPORT');
  console.log('====================================================');
  Object.entries(results).forEach(([k, v]) => {
    console.log(`  ${k.padEnd(35)}: ${v}`);
  });
  console.log('====================================================\n');
}

runSuite().catch(err => {
  console.error('💥 TEST SUITE CRASHED:', err);
  process.exit(1);
});
