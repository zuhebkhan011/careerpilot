# CareerPilot Setup & Execution Guide

Follow these steps to run the CareerPilot Backend API and React Frontend:

---

## 1. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Configure Environment Variables in backend/.env
# PORT=5000
# SUPABASE_URL=https://your-project.supabase.co
# SUPABASE_ANON_KEY=your-key
# SUPABASE_SERVICE_ROLE_KEY=your-service-key
# GEMINI_API_KEY=your-gemini-api-key

# Seed Database with 20+ Realistic Indian Tech Jobs
npm run seed

# Run Backend API Server
npm run dev
```

The backend server will start on `http://localhost:5000`.

---

## 2. Run Backend Tests

```bash
# Run automated API integration test suite
npm run test
```

---

## 3. Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start Vite Development Server
npm run dev
```

The frontend will run on `http://localhost:5173` and connect automatically to the backend on `http://localhost:5000/api`.

---

## 4. Execute Full End-to-End User Flow
1. Open `http://localhost:5173` in your browser.
2. View Candidate AI Dashboard stats.
3. Navigate to **Jobs & Matching** tab.
4. Click **AI Match Analysis** on any job (e.g. Razorpay or Zerodha) to view 0-100 match score breakdown, strengths, missing skills, and recommendations.
5. Click **Cover Letter** to generate a tailored cover letter powered by Gemini API.
6. Click **Save Job** to mark application status as `INTERESTED` or `APPLIED`.
7. Navigate to **Applications** tab to track application progress on Kanban board.
8. Navigate to **Resume AI Hub** to paste resume text and watch candidate profile update in real time!
