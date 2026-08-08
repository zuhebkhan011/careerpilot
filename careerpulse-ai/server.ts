import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// Lazy Google GenAI Client
let aiClient: GoogleGenAI | null = null;
function getGenAIClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn('GEMINI_API_KEY is not defined in environment variables.');
    }
    aiClient = new GoogleGenAI({
      apiKey: apiKey || 'dummy-key-for-dev',
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build'
        }
      }
    });
  }
  return aiClient;
}

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API 1: AI Job Matching Engine
app.post('/api/ai/match', async (req, res) => {
  try {
    const { job, resume } = req.body;
    if (!job || !resume) {
      return res.status(400).json({ error: 'Job and Resume profile are required' });
    }

    const ai = getGenAIClient();
    const prompt = `
Analyze the fit between this Job Description and Candidate Resume.

JOB DETAILS:
Company: ${job.company}
Role: ${job.role}
Location: ${job.location} (${job.workMode})
Salary: ${job.salary}
Required Skills: ${job.skillsRequired?.join(', ')}
Requirements: ${job.requirements?.join('; ')}
Description: ${job.description}

CANDIDATE RESUME:
Name: ${resume.fullName}
Target Role: ${resume.targetRole}
Years of Exp: ${resume.yearsOfExperience}
Summary: ${resume.summary}
Skills: ${resume.skills?.join(', ')}
Experience Summary: ${resume.experiences?.map((e: { title: string; company: string; description: string }) => `${e.title} at ${e.company}: ${e.description}`).join(' | ')}
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: prompt,
      config: {
        systemInstruction: 'You are an expert HR recruiter and AI Talent Matching Engine. Perform an objective skill match analysis.',
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            matchScore: { type: Type.INTEGER, description: 'Percentage score from 0 to 100 representing overall compatibility' },
            fitRating: { type: Type.STRING, description: 'One of: Strong Match, Moderate Match, Growth Opportunity, Low Match' },
            summary: { type: Type.STRING, description: '2-3 sentence overview of why the candidate fits or where the gaps lie' },
            strengths: { type: Type.ARRAY, items: { type: Type.STRING }, description: '3-5 key matching skills or qualifications' },
            missingSkills: { type: Type.ARRAY, items: { type: Type.STRING }, description: 'Skills or requirements from job that candidate lacks or needs to emphasize' },
            partialMatches: { type: Type.ARRAY, items: { type: Type.STRING }, description: 'Skills where candidate has adjacent experience' },
            recommendations: { type: Type.ARRAY, items: { type: Type.STRING }, description: 'Actionable tips for the candidate to improve their application or interview prep' }
          },
          required: ['matchScore', 'fitRating', 'summary', 'strengths', 'missingSkills', 'partialMatches', 'recommendations']
        }
      }
    });

    const jsonText = response.text || '{}';
    const analysis = JSON.parse(jsonText);
    res.json({ success: true, analysis });
  } catch (error: unknown) {
    console.error('Error in /api/ai/match:', error);
    const errMessage = error instanceof Error ? error.message : 'Failed to analyze job match';
    res.status(500).json({ error: errMessage });
  }
});

// API 2: Cover Letter Generator
app.post('/api/ai/cover-letter', async (req, res) => {
  try {
    const { job, resume, tone = 'Professional & Enthusiastic' } = req.body;
    if (!job || !resume) {
      return res.status(400).json({ error: 'Job and Resume profile are required' });
    }

    const ai = getGenAIClient();
    const prompt = `
Write a compelling, personalized cover letter for:
Candidate: ${resume.fullName}
Email: ${resume.email}
Phone: ${resume.phone}
Target Job: ${job.role} at ${job.company} (${job.location})
Tone: ${tone}

Resume Summary: ${resume.summary}
Candidate Key Skills: ${resume.skills?.join(', ')}
Candidate Recent Experience: ${resume.experiences?.[0]?.title} at ${resume.experiences?.[0]?.company}

Job Requirements: ${job.requirements?.join('; ')}

Format in clean markdown with Salutation, 3 focused body paragraphs showing alignment with ${job.company}'s mission, and a professional closing signature. Do not include placeholder brackets like [Date] or [Insert Name], fill in actual values.
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: prompt,
      config: {
        systemInstruction: 'You are an executive career coach writing tailored, high-converting cover letters.'
      }
    });

    res.json({ success: true, coverLetter: response.text || '' });
  } catch (error: unknown) {
    console.error('Error in /api/ai/cover-letter:', error);
    const errMessage = error instanceof Error ? error.message : 'Failed to generate cover letter';
    res.status(500).json({ error: errMessage });
  }
});

// API 3: AI Resume Parser
app.post('/api/ai/parse-resume', async (req, res) => {
  try {
    const { text, base64Data, mimeType } = req.body;
    if (!text && !base64Data) {
      return res.status(400).json({ error: 'Resume text or file data is required' });
    }

    const ai = getGenAIClient();
    let contents: unknown;

    if (base64Data && mimeType) {
      contents = {
        parts: [
          { inlineData: { mimeType, data: base64Data } },
          { text: 'Extract and parse all professional resume details into structured JSON.' }
        ]
      };
    } else {
      contents = `Extract structured profile details from this resume text:\n${text}`;
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: contents as string,
      config: {
        systemInstruction: 'You are an expert ATS resume parser.',
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            fullName: { type: Type.STRING },
            email: { type: Type.STRING },
            phone: { type: Type.STRING },
            location: { type: Type.STRING },
            targetRole: { type: Type.STRING },
            yearsOfExperience: { type: Type.INTEGER },
            summary: { type: Type.STRING },
            skills: { type: Type.ARRAY, items: { type: Type.STRING } },
            experiences: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  company: { type: Type.STRING },
                  period: { type: Type.STRING },
                  description: { type: Type.STRING }
                }
              }
            },
            education: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  degree: { type: Type.STRING },
                  institution: { type: Type.STRING },
                  year: { type: Type.STRING },
                  grade: { type: Type.STRING }
                }
              }
            }
          },
          required: ['fullName', 'email', 'skills', 'summary', 'targetRole']
        }
      }
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json({ success: true, parsedProfile: parsed });
  } catch (error: unknown) {
    console.error('Error in /api/ai/parse-resume:', error);
    const errMessage = error instanceof Error ? error.message : 'Failed to parse resume';
    res.status(500).json({ error: errMessage });
  }
});

// API 4: AI Career Coach Chat
app.post('/api/ai/coach', async (req, res) => {
  try {
    const { message, history = [], resume } = req.body;
    if (!message) {
      return res.status(400).json({ error: 'Message parameter is required' });
    }

    const ai = getGenAIClient();
    const systemPrompt = `
You are CareerPulse AI, an empathetic, high-caliber career mentor, interview preparation coach, and salary negotiation advisor.

CANDIDATE CONTEXT:
Name: ${resume?.fullName || 'Job Seeker'}
Target Role: ${resume?.targetRole || 'Software Engineering'}
Experience: ${resume?.yearsOfExperience || 1} years
Key Skills: ${resume?.skills?.join(', ') || 'React, TypeScript, Node.js'}

Guidelines:
1. Provide concise, mobile-friendly, practical advice using bullet points and clear sections.
2. If asked about interview questions, give specific sample technical/behavioral questions and STAR framework answer structures.
3. If asked about resume or salary, provide exact phrasing and confidence tips.
4. Keep paragraphs short and scannable for phone screens.
5. Provide 3 quick follow-up prompt chips for the candidate to ask next.
`;

    // Structure prompt with history
    let fullPrompt = systemPrompt + '\n\nCONVERSATION HISTORY:\n';
    history.forEach((h: { sender: string; text: string }) => {
      fullPrompt += `${h.sender === 'user' ? 'Candidate' : 'Coach'}: ${h.text}\n`;
    });
    fullPrompt += `Candidate: ${message}\nCoach:`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: fullPrompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            replyText: { type: Type.STRING, description: 'Markdown formatted response' },
            suggestedPrompts: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: '3 short follow-up prompts for the user to tap'
            }
          },
          required: ['replyText', 'suggestedPrompts']
        }
      }
    });

    const result = JSON.parse(response.text || '{}');
    res.json({
      success: true,
      replyText: result.replyText || 'I am here to help you navigate your career journey. What would you like to focus on today?',
      suggestedPrompts: result.suggestedPrompts || ['How can I increase my match score for TCS?', 'What are top interview questions for my role?', 'How do I negotiate a higher CTC offer?']
    });
  } catch (error: unknown) {
    console.error('Error in /api/ai/coach:', error);
    const errMessage = error instanceof Error ? error.message : 'Failed to connect to AI Coach';
    res.status(500).json({ error: errMessage });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`CareerPulse AI Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
