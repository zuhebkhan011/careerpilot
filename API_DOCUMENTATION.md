# CareerPilot API Documentation

CareerPilot is an AI-powered Career Search & Application Agent API built with Node.js, Express, TypeScript, Supabase PostgreSQL, and Google Gemini API.

Base URL: `http://localhost:5000/api`

---

## 1. Health Check
- **`GET /api/health`**
  - **Description**: Returns server and API health status.
  - **Response**:
    ```json
    {
      "success": true,
      "message": "CareerPilot API is running",
      "timestamp": "2026-08-08T09:00:00.000Z"
    }
    ```

---

## 2. Profile Management
- **`GET /api/profiles/:profileId`**
  - Fetch candidate profile.
- **`POST /api/profiles`**
  - Create candidate profile.
  - **Body**: `{ "name": "Rahul Sharma", "email": "rahul@example.com", "skills": ["Node.js", "React"] }`
- **`PATCH /api/profiles/:profileId`**
  - Update candidate profile fields.

---

## 3. Resumes & AI Analysis
- **`POST /api/resumes/upload`** or **`POST /api/resumes/analyze`**
  - Upload PDF resume file (multipart/form-data) OR raw text payload `{ "text": "...", "profileId": "..." }`.
  - Parses text using `pdf-parse`, analyzes via Gemini API, extracts structured candidate profile, calculates `resume_score`, updates Supabase.
- **`POST /api/resumes/review`**
  - Generates AI audit for resume: strength, weak sections, missing skills, suggested improvements.

---

## 4. Jobs & Semantic Matching
- **`GET /api/jobs`**
  - Search & filter 20+ realistic Indian jobs.
  - **Query Params**: `location`, `workMode`, `employmentType`, `skill`, `search`.
- **`GET /api/jobs/:jobId`**
  - Get single job details.
- **`POST /api/jobs/:jobId/match`**
  - Perform semantic AI matching between candidate profile and job description.
  - **Response**:
    ```json
    {
      "success": true,
      "data": {
        "match_score": 88,
        "skill_match": 85,
        "experience_match": 90,
        "strengths": ["Node.js experience", "Relevant B.Tech degree"],
        "missing_skills": ["Docker", "AWS"],
        "reasoning": "Candidate demonstrates strong REST API background...",
        "recommendations": ["Learn Docker basics"]
      }
    }
    ```
- **`GET /api/jobs/recommended/:profileId`**
  - Get ranked job recommendations for candidate based on AI compatibility.
- **`POST /api/jobs/:jobId/cover-letter`**
  - Generate tailored cover letter using candidate profile & job specs via Gemini API.

---

## 5. Application Tracker
- **`GET /api/applications/:profileId`**
  - Get tracked applications for candidate.
- **`POST /api/applications`**
  - Track job application status (`INTERESTED`, `APPLIED`, `INTERVIEW`, `SELECTED`, `REJECTED`).
- **`PATCH /api/applications/:applicationId`**
  - Update status or notes.
- **`DELETE /api/applications/:applicationId`**
  - Delete application record.

---

## 6. Dashboard Metrics
- **`GET /api/dashboard/:profileId`**
  - Aggregated view returning total matches, top match %, application counts by status, resume score, and top recommended jobs.
