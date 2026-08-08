import app from './app';
import { config } from './config/env';
import { seedJobs } from './db/seed';

const PORT = config.port;

app.listen(PORT, async () => {
  console.log(`🚀 CareerPilot Backend API running on http://localhost:${PORT}`);
  console.log(`📡 Health Check: http://localhost:${PORT}/api/health`);

  // Seed sample Indian jobs on startup if needed
  try {
    await seedJobs();
  } catch (err) {
    console.warn('⚠️ Seeding jobs on startup encountered non-fatal notice:', err);
  }
});
