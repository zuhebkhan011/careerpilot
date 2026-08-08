/**
 * CAREERPILOT — CAREER COACH, RESUME SCORE CONSISTENCY & TRACKING TEST SUITE
 */

import { geminiService } from './services/GeminiService';
import { memoryDb } from './db/supabase';
import { Profile, Job } from './types';
import { getDashboardStats } from './controllers/dashboardController';

async function runSuite() {
  console.log('\n====================================================');
  console.log('🧪 CAREERPILOT COACH, SCORE CONSISTENCY & TRACKING TEST SUITE');
  console.log('====================================================\n');

  const results: Record<string, string> = {};

  // =====================================================
  // TEST 1: RESUME SCORE CONSISTENCY
  // =====================================================
  console.log('--- TEST 1: Single Source of Truth for Resume Score ---');

  const rawTextA = `Rahul Sharma
rahul.sharma.dev@gmail.com | +91 9876543210 | Pune, Maharashtra
Education: B.Tech Information Technology, Pune University (2023)
Skills: Java, Spring Boot, Microservices, MySQL, Hibernate, REST APIs, Git, JUnit, Maven
Experience: Java Backend Developer Intern at TechCorp Solutions (Jul 2023 - Jan 2024).
  Built Spring Boot microservices handling banking transactions.
Projects: Banking Transaction API (Java, Spring Boot, MySQL, Spring Security).
Certifications: Oracle Certified Associate Java SE Programmer.`;

  const analysisA = await geminiService.analyzeResume(rawTextA);
  const scoreA = analysisA.resumeScore;
  console.log(`  AI Extracted Resume A Score: ${scoreA}`);

  // Create profile & resume record
  const profileIdA = 'prof-test-score-1';
  const profileA: Profile = {
    id: profileIdA,
    name: analysisA.parsedData.name || 'Rahul Sharma',
    email: analysisA.parsedData.email || 'rahul.sharma@example.com',
    skills: analysisA.parsedData.skills || ['Java', 'Spring Boot'],
    experience: [],
    projects: [],
    certifications: [],
    achievements: [],
    languages: []
  };

  memoryDb.profiles.push(profileA);
  memoryDb.resumes.push({
    id: 'res-a-1',
    profile_id: profileIdA,
    file_name: 'rahul_resume.pdf',
    parsed_data: analysisA.parsedData,
    resume_score: scoreA,
    analysis_result: analysisA,
    created_at: new Date().toISOString()
  });

  // Call mock req/res for getDashboardStats
  let dashboardScoreA = 0;
  const reqA: any = { params: { profileId: profileIdA } };
  const resA: any = {
    status: (code: number) => ({
      json: (body: any) => {
        dashboardScoreA = body.data?.resumeScore;
      }
    })
  };
  await getDashboardStats(reqA, resA, () => {});

  console.log(`  Dashboard Fetched Score A: ${dashboardScoreA}`);

  const scoreConsistentA = scoreA === dashboardScoreA;
  console.log('  Score Consistency Test:', scoreConsistentA ? 'PASS ✅' : 'FAIL ❌');
  results['SCORE_CONSISTENCY'] = scoreConsistentA ? 'PASS ✅' : 'FAIL ❌';

  // =====================================================
  // TEST 2: AI CAREER COACH PERSONALIZATION
  // =====================================================
  console.log('\n--- TEST 2: AI Career Coach Personalization ---');

  const coachAdviceA = await geminiService.reviewResume(profileA, rawTextA);

  const rawTextB = `Aisha Khan
aisha.khan.frontend@outlook.com | +91 9123456789 | Ahmedabad, Gujarat
Education: BCA (Bachelor of Computer Applications), Gujarat University (2024) - 8.4 CGPA
Skills: React, TypeScript, Next.js, Redux, Tailwind CSS, HTML5, CSS3, JavaScript, GraphQL, Jest
Experience: Frontend Engineer Intern at WebStudio India (Feb 2024 - Jul 2024).
  Built responsive React SPA with GraphQL API integration.
Projects: E-Commerce Storefront (React, TypeScript, Redux, Tailwind CSS, GraphQL).
Certifications: Meta Front-End Developer Professional Certificate.`;

  const analysisB = await geminiService.analyzeResume(rawTextB);
  const profileB: Profile = {
    id: 'prof-test-coach-2',
    name: analysisB.parsedData.name || 'Aisha Khan',
    email: analysisB.parsedData.email || 'aisha.khan@example.com',
    skills: analysisB.parsedData.skills || ['React', 'TypeScript'],
    experience: [],
    projects: [],
    certifications: [],
    achievements: [],
    languages: []
  };

  const coachAdviceB = await geminiService.reviewResume(profileB, rawTextB);

  console.log('  Candidate A Top Role:', coachAdviceA.topRole || 'Java Backend');
  console.log('  Candidate A Gaps:', (coachAdviceA.skillGaps || coachAdviceA.missingSkills || []).join(', '));
  console.log('  Candidate B Top Role:', coachAdviceB.topRole || 'Frontend Developer');
  console.log('  Candidate B Gaps:', (coachAdviceB.skillGaps || coachAdviceB.missingSkills || []).join(', '));

  const coachDiffers = (coachAdviceA.topRole !== coachAdviceB.topRole);
  console.log('  Career Coach Advice Differentiation:', coachDiffers ? 'PASS ✅' : 'FAIL ❌');
  results['CAREER_COACH_PERSONALIZATION'] = coachDiffers ? 'PASS ✅' : 'FAIL ❌';

  // =====================================================
  // TEST 3: TRACK APPLICATION VS APPLY
  // =====================================================
  console.log('\n--- TEST 3: Track Application Behavior ---');

  const { createApplication, getApplicationsByProfile, updateApplication } = require('./controllers/applicationController');

  let trackedStatus = '';
  const trackReq: any = {
    body: {
      profile_id: profileIdA,
      job_id: 'job-indian-sample-1',
      status: 'INTERESTED',
      notes: 'Tracked from UI'
    }
  };
  const trackRes: any = {
    status: (code: number) => ({
      json: (body: any) => {
        if (body.success) trackedStatus = body.data.status;
      }
    })
  };

  await createApplication(trackReq, trackRes, () => {});

  console.log('  Track Application Status:', trackedStatus);
  const isInterested = trackedStatus === 'INTERESTED';
  console.log('  Track Application sets INTERESTED (not APPLIED):', isInterested ? 'PASS ✅' : 'FAIL ❌');
  results['TRACK_APPLICATION_STATUS'] = isInterested ? 'PASS ✅' : 'FAIL ❌';

  // Test duplicate tracking check
  let duplicateCode = '';
  const dupRes: any = {
    status: (code: number) => ({
      json: (body: any) => {
        if (!body.success) duplicateCode = body.error?.code;
      }
    })
  };
  await createApplication(trackReq, dupRes, () => {});

  console.log('  Duplicate Tracking Response Code:', duplicateCode);
  const dupCheckPass = duplicateCode === 'DUPLICATE_APPLICATION';
  console.log('  Duplicate Application Protection:', dupCheckPass ? 'PASS ✅' : 'FAIL ❌');
  results['DUPLICATE_APPLICATION_PROTECTION'] = dupCheckPass ? 'PASS ✅' : 'FAIL ❌';

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
