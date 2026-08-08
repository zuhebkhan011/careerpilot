import http from 'http';
import app from '../src/app';

const PORT = 5001;

function makeRequest(path: string, method: string = 'GET', body?: any): Promise<{ status: number; body: any }> {
  return new Promise((resolve, reject) => {
    const postData = body ? JSON.stringify(body) : '';
    const req = http.request(
      {
        host: '127.0.0.1',
        port: PORT,
        path,
        method,
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(postData),
        },
      },
      res => {
        let raw = '';
        res.on('data', chunk => (raw += chunk));
        res.on('end', () => {
          try {
            const parsed = JSON.parse(raw);
            resolve({ status: res.statusCode || 500, body: parsed });
          } catch {
            resolve({ status: res.statusCode || 500, body: raw });
          }
        });
      }
    );

    req.on('error', reject);
    if (postData) req.write(postData);
    req.end();
  });
}

async function runBackendTests() {
  console.log('🧪 Starting Backend API Test Suite...');
  const server = app.listen(PORT);

  try {
    // Test 1: Health Check
    console.log('\n--- 1. Testing Health Check GET /api/health ---');
    const health = await makeRequest('/api/health');
    console.log('Response:', health.status, health.body);
    if (health.status !== 200 || !health.body.success) throw new Error('Health check failed');

    // Test 2: Create Profile
    console.log('\n--- 2. Testing Profile Creation POST /api/profiles ---');
    const newProf = await makeRequest('/api/profiles', 'POST', {
      name: 'Ananya Roy',
      email: 'ananya.roy@example.com',
      skills: ['Node.js', 'Express', 'React', 'PostgreSQL'],
      education: 'B.Tech CS',
    });
    console.log('Response:', newProf.status, newProf.body.data?.name);
    if (newProf.status !== 201 || !newProf.body.success) throw new Error('Profile creation failed');
    const profileId = newProf.body.data.id;

    // Test 3: Job Listing
    console.log('\n--- 3. Testing Job Listing GET /api/jobs ---');
    const jobs = await makeRequest('/api/jobs');
    console.log('Jobs returned:', jobs.body.count || jobs.body.data?.length);
    if (jobs.status !== 200 || !Array.isArray(jobs.body.data)) throw new Error('Job listing failed');
    const sampleJobId = jobs.body.data[0].id;

    // Test 4: Job Retrieval
    console.log('\n--- 4. Testing Job Retrieval GET /api/jobs/:id ---');
    const singleJob = await makeRequest(`/api/jobs/${sampleJobId}`);
    console.log('Retrieved Job Role:', singleJob.body.data?.role, 'at', singleJob.body.data?.company);
    if (singleJob.status !== 200 || !singleJob.body.data) throw new Error('Job retrieval failed');

    // Test 5: Resume Analysis Validation
    console.log('\n--- 5. Testing Resume Analysis POST /api/resumes/analyze ---');
    const resumeRes = await makeRequest('/api/resumes/analyze', 'POST', {
      profileId,
      text: `Ananya Roy
Email: ananya.roy@example.com
Phone: +91 9988776655
Location: Bengaluru, India
Education: B.Tech in Computer Science from IIT Bombay 2024
Skills: React, TypeScript, Node.js, Express, PostgreSQL, Docker, Git
Experience: Software Developer Intern at Razorpay (6 months)
Projects: Built scalable microservice API backend handling 50k requests/min.`,
    });
    console.log('Resume Analysis Score:', resumeRes.body.data?.resumeScore);
    if (resumeRes.status !== 200 || !resumeRes.body.success) throw new Error('Resume analysis failed');

    // Test 6: Semantic Job Match Validation
    console.log('\n--- 6. Testing Job Match POST /api/jobs/:id/match ---');
    const matchRes = await makeRequest(`/api/jobs/${sampleJobId}/match`, 'POST', { profileId });
    console.log('Match Score:', matchRes.body.data?.match_score, '%');
    console.log('Strengths:', matchRes.body.data?.strengths);
    console.log('Missing Skills:', matchRes.body.data?.missing_skills);
    if (matchRes.status !== 200 || !matchRes.body.data?.match_score) throw new Error('Job match failed');

    // Test 7: Application Creation
    console.log('\n--- 7. Testing Application Creation POST /api/applications ---');
    const appRes = await makeRequest('/api/applications', 'POST', {
      profile_id: profileId,
      job_id: sampleJobId,
      status: 'INTERESTED',
      notes: 'Saved for weekend application',
    });
    console.log('Application Status:', appRes.body.data?.status);
    if (appRes.status !== 201 || !appRes.body.success) throw new Error('Application creation failed');
    const applicationId = appRes.body.data.id;

    // Test 8: Application Status Update
    console.log('\n--- 8. Testing Application Status Update PATCH /api/applications/:id ---');
    const updateAppRes = await makeRequest(`/api/applications/${applicationId}`, 'PATCH', {
      status: 'APPLIED',
      notes: 'Applied via company referral portal',
    });
    console.log('Updated Status:', updateAppRes.body.data?.status);
    if (updateAppRes.status !== 200 || updateAppRes.body.data?.status !== 'APPLIED') {
      throw new Error('Application status update failed');
    }

    // Test 9: Dashboard Aggregation
    console.log('\n--- 9. Testing Dashboard Stats GET /api/dashboard/:profileId ---');
    const dashRes = await makeRequest(`/api/dashboard/${profileId}`);
    console.log('Dashboard Data:', dashRes.body.data);
    if (dashRes.status !== 200 || !dashRes.body.data) throw new Error('Dashboard stats failed');

    console.log('\n✅ ALL 9 BACKEND API TESTS PASSED SUCCESSFULLY! 🎉\n');
  } catch (err) {
    console.error('\n❌ Backend test failed:', err);
    process.exitCode = 1;
  } finally {
    server.close();
  }
}

runBackendTests();
