import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { config } from './config/env';
import { errorHandler } from './middleware/errorHandler';

import healthRoutes from './routes/healthRoutes';
import profileRoutes from './routes/profileRoutes';
import resumeRoutes from './routes/resumeRoutes';
import jobRoutes from './routes/jobRoutes';
import applicationRoutes from './routes/applicationRoutes';
import dashboardRoutes from './routes/dashboardRoutes';

const app = express();

// Security Helmet middleware
app.use(helmet());

// CORS configuration
app.use(
  cors({
    origin: '*', // Allow connections from web app and mobile app (Capacitor)
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Rate limiter for AI endpoints
const aiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many requests to AI endpoints, please try again later.',
    },
  },
});

app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

// Mount API routes
app.use('/api/health', healthRoutes);
app.use('/api/profiles', profileRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/resumes', aiLimiter, resumeRoutes);
app.use('/api/resume', aiLimiter, resumeRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Alias route for Application Guidance (Cover Letter / Resume Guidance)
app.use('/api/application-guidance', aiLimiter, (req, res, next) => {
  if (req.method === 'POST') {
    const { jobId, type, profileId = 'demo-profile-1' } = req.body;
    if (type === 'RESUME_GUIDANCE') {
      return require('./controllers/resumeController').reviewResume(req, res, next);
    }
    req.params.jobId = jobId || req.body.job_id;
    return require('./controllers/jobController').generateCoverLetter(req, res, next);
  }
  return res.status(405).json({ success: false, error: { message: 'Method not allowed' } });
});

// Centralized error handling
app.use(errorHandler);

export default app;
