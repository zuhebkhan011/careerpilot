import dotenv from 'dotenv';
import path from 'path';

// Load .env from backend directory or project root
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '5000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  supabaseUrl: process.env.SUPABASE_URL || '',
  supabaseAnonKey: process.env.SUPABASE_ANON_KEY || '',
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
  geminiApiKey: process.env.GEMINI_API_KEY || '',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
};

// Safe validation logging (NEVER print actual secret values)
export function validateEnvironment(): void {
  console.log('🔧 Validating Environment Configuration...');
  if (config.geminiApiKey) {
    console.log('  ✅ GEMINI_API_KEY: Configured');
  } else {
    console.warn('  ⚠️ GEMINI_API_KEY: Missing (AI endpoints will use intelligent heuristic fallbacks)');
  }

  if (config.supabaseUrl && (config.supabaseServiceRoleKey || config.supabaseAnonKey)) {
    console.log('  ✅ SUPABASE_URL & KEYS: Configured');
  } else {
    console.info('  ℹ️ SUPABASE_URL: Not configured (Using memoryDb fallback)');
  }
}
