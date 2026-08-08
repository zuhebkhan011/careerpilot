# CareerPilot — AI Career Search & Application Agent

> **Hack The Stack 2026 Submission**
> An AI-powered career assistant providing structured resume intelligence, semantic job matching, explainable hiring scores, role-specific application guidance, and real-time application tracking.

---

## 🌟 Key Features

- **📄 AI Resume Intelligence**: Upload PDF/text resumes to extract structured candidate profiles (skills, experience, education, projects, certifications).
- **🎯 Semantic Job Matching**: Multi-dimensional scoring engine evaluating skill match, experience alignment, qualification fit, and role relevance.
- **🔍 Explainable Match Insights**: Displays strengths, partial skill matches, hard skill gaps, AI reasoning summaries, and personalized recommendations.
- **📌 Top Job Recommendations**: Ranks Indian tech job opportunities (Razorpay, Zerodha, TCS, Infosys, Zoho, Swiggy, InMobi, PhonePe) based on AI compatibility.
- **✉️ Role-Specific Application Guidance**: Generates tailored Cover Letters and actionable Resume Audits customized to the candidate and specific employer.
- **📊 Application Tracker**: 5-stage Kanban board (`Interested`, `Applied`, `Interview`, `Selected`, `Rejected`) with database persistence.
- **🗄️ Database-Ready Architecture**: Zero-breakage REST API abstraction layer supporting PostgreSQL/Supabase with fallback in-memory database support.

---

## 🛠️ Technology Stack

- **Frontend**: React, Vite, TypeScript, Vanilla CSS (Google Stitch Design Token System).
- **Backend**: Express.js, Node.js, TypeScript REST API.
- **AI Engine**: Google Gemini AI (`gemini-1.5-flash`, `gemini-pro`).
- **Database**: Supabase PostgreSQL (`schema.sql` provided) with fallback memory repository.

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js (v18+)
- npm or yarn

### 1. Clone & Install Dependencies

```bash
git clone https://github.com/zuhebkhan011/careerpilot.git
cd careerpilot

# Install Backend dependencies
cd backend
npm install

# Install Frontend dependencies
cd ../frontend
npm install
```

### 2. Environment Setup

Create `.env` inside the `backend` directory using `.env.example` as a template:

```env
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

# Google Gemini AI Key
GEMINI_API_KEY=your_gemini_api_key_here

# Supabase PostgreSQL Configuration (Optional - Memory fallback active if blank)
DATABASE_URL=your_database_url_here
SUPABASE_URL=your_supabase_url_here
SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here
```

### 3. Run Application

Start Backend (Port 5000):
```bash
cd backend
npm run dev
```

Start Frontend (Port 5173):
```bash
cd frontend
npm run dev
```

Open your browser at `http://localhost:5173/` or `http://localhost:5174/`.

---

## 🗄️ Database Setup (Supabase / PostgreSQL)

Run the SQL migration script from `backend/src/db/schema.sql` in your Supabase SQL Editor to initialize tables:
- `users`
- `candidate_profiles` / `profiles`
- `resumes`
- `jobs`
- `job_matches`
- `applications`
- `generated_outputs` / `ai_feedback`

---

## 🔒 Security & Privacy

- All API keys and database credentials are strictly contained server-side.
- Zero secrets are exposed in browser code.
- `.env` files are ignored by git.
