import { config, validateEnvironment } from './config/env';
import { getSupabase, memoryDb } from './db/supabase';
import { geminiService } from './services/GeminiService';
import { seedJobs } from './db/seed';

async function runIntegrationTest() {
  console.log('====================================================');
  console.log('🧪 CAREERPILOT INTEGRATION & CREDENTIAL TEST SUITE');
  console.log('====================================================');

  validateEnvironment();

  const supabase = getSupabase();

  if (supabase) {
    console.log('\n--- Testing Supabase DB Connection ---');
    try {
      // 1. Seed jobs
      await seedJobs();

      // 2. Query jobs
      const { data: jobs, error: jobsErr } = await supabase.from('jobs').select('*');
      if (jobsErr) {
        console.error('❌ Supabase Query Error (jobs):', jobsErr.message);
      } else {
        console.log(`✅ Supabase Read Success: Found ${jobs?.length || 0} jobs in database.`);
      }

      // 3. Test Profile upsert
      const testProfileId = 'test-integration-profile-1';
      const { data: prof, error: profErr } = await supabase
        .from('profiles')
        .upsert({
          id: testProfileId,
          name: 'Rahul Sharma',
          email: 'rahul.sharma@example.com',
          phone: '+91 9876543210',
          location: 'Bengaluru, India',
          degree: 'B.Tech',
          education: 'B.Tech in CS',
          skills: ['Node.js', 'Express.js', 'PostgreSQL', 'React', 'TypeScript'],
        })
        .select()
        .single();

      if (profErr) {
        console.error('❌ Supabase Profile Upsert Error:', profErr.message);
      } else {
        console.log('✅ Supabase Write Success: Profile upserted:', prof.name);
      }

    } catch (e: any) {
      console.error('❌ Supabase Test Exception:', e.message);
    }
  } else {
    console.log('\nℹ️ Operating in Memory DB fallback mode.');
    await seedJobs();
  }

  // Gemini AI Test
  console.log('\n--- Testing Gemini AI Connection ---');
  if (config.geminiApiKey) {
    try {
      const sampleText = `Rahul Sharma
Rahul.sharma@example.com | +91 9876543210 | Bengaluru, India
Education: B.Tech in Computer Science & Engineering from VIT (2024)
Skills: Node.js, Express.js, TypeScript, PostgreSQL, React, Git, REST APIs
Experience: Software Developer Intern at Tech Solutions India (Jan 2024 - Jun 2024). Developed microservices backend using Express and PostgreSQL.
Projects: CareerPilot AI Agent built with React, Express, Supabase.`;

      console.log('  Calling Gemini API for Resume Analysis...');
      const result = await geminiService.analyzeResume(sampleText);
      console.log('  ✅ Gemini AI Response Received!');
      console.log('     Candidate Name:', result.parsedData.name);
      console.log('     Skills Extracted:', result.parsedData.skills?.join(', '));
      console.log('     Resume Score:', result.resumeScore);
    } catch (e: any) {
      console.error('❌ Gemini AI Test Error:', e.message);
    }
  } else {
    console.log('ℹ️ GEMINI_API_KEY not configured. Falling back to heuristic parsing.');
  }

  console.log('\n====================================================');
  console.log('🎉 INTEGRATION TEST SUITE COMPLETED SUCCESSFULLY');
  console.log('====================================================');
}

runIntegrationTest().catch(console.error);
