import { GoogleGenerativeAI } from '@google/generative-ai';
import { config } from '../config/env';
import { Profile, Job, JobMatch, ResumeAnalysisResult } from '../types';

export class GeminiService {
  private genAI: GoogleGenerativeAI | null = null;
  private candidateModels = [
    'gemini-1.5-flash',
    'gemini-1.5-pro',
    'gemini-2.0-flash',
    'gemini-2.5-flash',
    'gemini-pro',
  ];

  constructor() {
    if (config.geminiApiKey) {
      this.genAI = new GoogleGenerativeAI(config.geminiApiKey);
    }
  }

  private cleanJsonResponse(text: string): string {
    return text
      .replace(/```json/gi, '')
      .replace(/```/g, '')
      .trim();
  }

  private async generateText(prompt: string): Promise<string | null> {
    if (!this.genAI) return null;

    for (const modelName of this.candidateModels) {
      try {
        const model = this.genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent(prompt);
        const text = result?.response?.text();
        if (text && text.trim().length > 0) {
          return text.trim();
        }
      } catch (err: any) {
        // Try next candidate model silently
        continue;
      }
    }
    return null;
  }

  /**
   * Analyze raw text from PDF resume and extract structured candidate profile + AI audit
   */
  async analyzeResume(rawText: string): Promise<ResumeAnalysisResult> {
    const prompt = `
You are an expert AI Resume Parser & Senior Tech Recruiter.
Extract candidate information STRICTLY from the provided resume text.
DO NOT guess or infer missing personal information. If a field is not present in the text, return null or an empty array.

RULES:
1. NAME: Extract candidate's full name from the resume header. Do NOT confuse with college, company, or project names. If missing, return null.
2. PHONE: Extract candidate's phone number. Normalize to readable format (e.g., "+91 XXXXXXXXXX" or "9876543210"). Do NOT confuse with roll numbers, registration IDs, years, or postal codes. If missing, return null.
3. EMAIL: Extract email address. If missing, return null.
4. LOCATION: Extract ONLY the candidate's personal home/current city and state/country from the contact header section. DO NOT infer location from college location, employer location, or project location. If candidate's personal location is not explicitly stated in the contact section, return null.
5. EDUCATION: Support Indian education formats (BCA, B.Tech, BE, MCA, M.Tech, B.Sc, B.Com, M.Com, MBA, 12th, 10th, Diploma, CGPA, SPI, CPI, Percentage).
   Extract structured entries for education.

Return ONLY a valid JSON object matching this schema:
{
  "parsedData": {
    "name": null,
    "email": null,
    "phone": null,
    "location": null,
    "summary": null,
    "education": null,
    "degree": null,
    "college": null,
    "graduation_year": null,
    "educationEntries": [
      {
        "degree": null,
        "field": null,
        "institution": null,
        "location": null,
        "startYear": null,
        "endYear": null,
        "grade": null
      }
    ],
    "skills": [],
    "experience": [
      {
        "title": "",
        "company": "",
        "duration": "",
        "description": ""
      }
    ],
    "projects": [
      {
        "title": "",
        "tech_stack": [],
        "description": "",
        "link": null
      }
    ],
    "certifications": [],
    "achievements": [],
    "languages": []
  },
  "resumeScore": 85,
  "scoreExplanation": "Explanation based on candidate skills, project depth, and experience clarity.",
  "strengths": [
    "✓ Point 1 based on actual resume text",
    "✓ Point 2 based on actual resume text"
  ],
  "weaknesses": [
    "△ Area to improve based on actual resume text"
  ],
  "missingSkills": [
    { "skill": "SkillName", "reason": "Why this skill strengthens candidate profile" }
  ],
  "improvements": [
    {
      "section": "Section Name",
      "original": "Original text snippet",
      "improved": "Improved action-oriented bullet",
      "impact": "High"
    }
  ],
  "recommendedRoles": [
    "Role 1",
    "Role 2"
  ]
}

RAW RESUME TEXT:
"""
${rawText}
"""
`;

    const responseText = await this.generateText(prompt);
    if (!responseText) {
      return this.fallbackResumeAnalysis(rawText);
    }

    try {
      const cleaned = this.cleanJsonResponse(responseText);
      const json = JSON.parse(cleaned);

      const parsedData = json.parsedData || json;
      const resumeScore = typeof json.resumeScore === 'number' ? json.resumeScore : 80;
      const scoreExplanation = json.scoreExplanation || 'Resume demonstrates foundational alignment for target technical roles.';
      const strengths = Array.isArray(json.strengths) ? json.strengths : [];
      const weaknesses = Array.isArray(json.weaknesses) ? json.weaknesses : [];
      const missingSkills = Array.isArray(json.missingSkills) ? json.missingSkills : [];
      const improvements = Array.isArray(json.improvements) ? json.improvements : [];
      const recommendedRoles = Array.isArray(json.recommendedRoles) ? json.recommendedRoles : [];

      return {
        parsedData,
        resumeScore,
        scoreExplanation,
        strengths,
        weaknesses,
        missingSkills,
        improvements,
        recommendedRoles,
      };
    } catch (error) {
      console.warn('⚠️ Gemini JSON parse error, utilizing source-based fallback:', error);
      return this.fallbackResumeAnalysis(rawText);
    }
  }

  /**
   * Match Candidate Profile to a Job using Semantic Reasoning
   */
  async matchCandidateToJob(profile: Profile, job: Job): Promise<Omit<JobMatch, 'id' | 'created_at'>> {
    const prompt = `
You are an expert Indian Tech Recruiter & AI Career Agent.
Perform semantic candidate-job matching based STRICTLY on the candidate profile and job requirements.

CANDIDATE PROFILE:
${JSON.stringify(profile, null, 2)}

JOB DESCRIPTION:
Company: ${job.company}
Role: ${job.role}
Location: ${job.location}
Experience Required: ${job.experience_required}
Education Required: ${job.education_required}
Skills Required: ${JSON.stringify(job.skills)}
Responsibilities: ${JSON.stringify(job.responsibilities)}
Preferred Skills: ${JSON.stringify(job.preferred_skills)}
Description: ${job.description}

Return ONLY a valid JSON object matching this schema:
{
  "match_score": 85,
  "skill_match": 80,
  "experience_match": 85,
  "education_match": 90,
  "role_fit": 85,
  "strengths": ["Reason 1 highlighting actual matched candidate skills"],
  "missing_skills": ["Skill missing from candidate profile"],
  "partial_matches": ["Transferable skill or technology match"],
  "reasoning": "2-3 sentence personalized explanation referencing candidate's specific skills vs job requirements.",
  "recommendations": [
    "Actionable tip tailored to candidate profile"
  ]
}
`;

    const responseText = await this.generateText(prompt);
    if (!responseText) {
      return this.fallbackJobMatch(profile, job);
    }

    try {
      const cleaned = this.cleanJsonResponse(responseText);
      const parsed = JSON.parse(cleaned);

      return {
        profile_id: profile.id,
        job_id: job.id,
        match_score: Math.min(100, Math.max(0, parsed.match_score || 75)),
        skill_match: Math.min(100, Math.max(0, parsed.skill_match || 75)),
        experience_match: Math.min(100, Math.max(0, parsed.experience_match || 75)),
        education_match: Math.min(100, Math.max(0, parsed.education_match || 80)),
        role_fit: Math.min(100, Math.max(0, parsed.role_fit || 80)),
        strengths: Array.isArray(parsed.strengths) ? parsed.strengths : [],
        missing_skills: Array.isArray(parsed.missing_skills) ? parsed.missing_skills : [],
        partial_matches: Array.isArray(parsed.partial_matches) ? parsed.partial_matches : [],
        reasoning: parsed.reasoning || `Candidate profile evaluated against ${job.role} at ${job.company}.`,
        recommendations: Array.isArray(parsed.recommendations) ? parsed.recommendations : [],
      };
    } catch (error) {
      console.warn('⚠️ Gemini API error during job matching, utilizing fallback:', error);
      return this.fallbackJobMatch(profile, job);
    }
  }

  /**
   * Tailored Cover Letter Generator
   */
  async generateCoverLetter(profile: Profile, job: Job): Promise<string> {
    const prompt = `
Write a professional, compelling, highly customized Cover Letter for ${profile.name || 'the candidate'} applying for the ${job.role} position at ${job.company}.

Candidate Profile:
Name: ${profile.name || 'Applicant'}
Location: ${profile.location || ''}
Skills: ${profile.skills?.join(', ') || ''}
Education: ${profile.degree || profile.education || ''} ${profile.college ? 'from ' + profile.college : ''}
Projects: ${profile.projects?.map(p => p.title + ': ' + p.description).join('; ') || ''}
Experience: ${profile.experience?.map(e => e.title + ' at ' + e.company).join('; ') || ''}

Job Details:
Role: ${job.role}
Company: ${job.company}
Location: ${job.location}
Key Requirements: ${job.skills?.join(', ') || ''}

Instructions:
- Keep it concise, formal, and persuasive (3-4 paragraphs).
- Reference specific skills and candidate projects relevant to ${job.company}.
- Do NOT use generic placeholders like [Insert Name]. Use the candidate's actual data.
- Return ONLY the plaintext cover letter text.
`;

    const text = await this.generateText(prompt);
    if (!text) {
      return this.fallbackCoverLetter(profile, job);
    }
    return text.trim();
  }

  /**
   * Resume Review & Audit
   */
  async reviewResume(profile: Partial<Profile>, rawText?: string): Promise<any> {
    const prompt = `
Analyze this resume profile and provide detailed actionable feedback to improve candidate hiring chances in the tech market.

Profile Data:
${JSON.stringify(profile, null, 2)}
${rawText ? `Raw Resume Text snippet: ${rawText.substring(0, 1000)}` : ''}

Return JSON with:
{
  "resumeStrength": 82,
  "weakSections": ["Projects section lacks quantifiable metric results"],
  "missingSkills": ["Docker", "Git Workflow", "CI/CD"],
  "suggestedImprovements": [
    "Add metrics to your experience e.g. 'Improved API response time by 30%'",
    "Include live deployment URLs for your projects"
  ],
  "roleSpecificSuggestions": [
    "For Backend roles, highlight database schema design & RESTful API security."
  ]
}
`;

    const text = await this.generateText(prompt);
    if (!text) {
      return this.fallbackResumeReview(profile);
    }

    try {
      const cleaned = this.cleanJsonResponse(text);
      return JSON.parse(cleaned);
    } catch (error) {
      return this.fallbackResumeReview(profile);
    }
  }

  /**
   * Career Guidance Roadmap
   */
  async generateCareerGuidance(profile: Profile): Promise<any> {
    const prompt = `
Provide career guidance and a 3-step growth roadmap for ${profile.name || 'a candidate'} with skills: ${profile.skills?.join(', ') || 'Software Development'}.

Return JSON:
{
  "targetRoles": ["Full Stack Engineer", "Backend Developer", "Cloud Engineer"],
  "careerStage": "Early Career / Fresher",
  "skillGaps": ["Containerization (Docker)", "System Design Basics"],
  "actionableRoadmap": [
    { "phase": "Month 1", "focus": "Master core engineering concepts & API patterns" },
    { "phase": "Month 2", "focus": "Build & deploy full stack app with database integration" },
    { "phase": "Month 3", "focus": "Prepare System Design & Open Source Contributions" }
  ],
  "marketInsights": "Active hiring across tech hubs in India for developers with core project experience."
}
`;

    const text = await this.generateText(prompt);
    if (!text) {
      return this.fallbackCareerGuidance(profile);
    }

    try {
      const cleaned = this.cleanJsonResponse(text);
      return JSON.parse(cleaned);
    } catch {
      return this.fallbackCareerGuidance(profile);
    }
  }

  // --- Source-Based Fallback Parser (used if API key is unconfigured/offline) ---

  private fallbackResumeAnalysis(rawText: string): ResumeAnalysisResult {
    const lines = rawText.split('\n').map(l => l.trim()).filter(Boolean);

    // 1. Candidate Name
    let candidateName: string | null = null;
    if (lines.length > 0) {
      const firstLine = lines[0].replace(/^(resume|curriculum vitae|cv)\s*/i, '').trim();
      if (firstLine.length > 2 && firstLine.length < 40 && !firstLine.includes('@') && !/\d/.test(firstLine)) {
        candidateName = firstLine;
      }
    }

    // 2. Email
    const emailMatch = rawText.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
    const candidateEmail = emailMatch ? emailMatch[0] : null;

    // 3. Phone (Normalized Indian format)
    const phoneMatch = rawText.match(/(\+91[\-\s]?)?[6-9]\d{9}/);
    const candidatePhone = phoneMatch ? phoneMatch[0] : null;

    // 4. Candidate Location (Source-based ONLY — check header lines)
    let candidateLocation: string | null = null;
    const headerSnippet = lines.slice(0, 8).join(' ');
    const knownCities = [
      'Ahmedabad', 'Vadodara', 'Surat', 'Mumbai', 'Pune', 'Bengaluru', 'Bangalore',
      'Hyderabad', 'Delhi', 'Noida', 'Gurugram', 'Gurgaon', 'Chennai', 'Kolkata',
      'Jaipur', 'Indore', 'Chandigarh', 'Kochi', 'Thiruvananthapuram'
    ];
    for (const city of knownCities) {
      const regex = new RegExp(`\\b${city}\\b`, 'i');
      if (regex.test(headerSnippet)) {
        const stateMatch = headerSnippet.match(new RegExp(`${city}[,\\s]+([a-zA-Z\\s]{2,20})`, 'i'));
        candidateLocation = stateMatch ? `${city}, ${stateMatch[1].trim()}` : `${city}, India`;
        break;
      }
    }

    // 5. Education (Indian degree formats)
    let candidateDegree: string | null = null;
    let candidateCollege: string | null = null;
    let candidateYear: string | null = null;
    let candidateEducation: string | null = null;

    const degreeKeywords = ['BCA', 'B.Tech', 'B.E.', 'BE', 'MCA', 'M.Tech', 'B.Sc', 'B.Com', 'M.Com', 'MBA', 'Diploma', '12th', '10th'];
    for (const dKw of degreeKeywords) {
      const regex = new RegExp(`\\b${dKw.replace('.', '\\.')}\\b`, 'i');
      if (regex.test(rawText)) {
        candidateDegree = dKw;
        break;
      }
    }

    // Extract college/university line
    const collegeLine = lines.find(l => /university|college|institute|iit|nit|vit|bits|aktu|gtu/i.test(l));
    if (collegeLine) {
      candidateCollege = collegeLine;
    }

    // Extract graduation year
    const yearMatch = rawText.match(/\b(20[0-2][0-9])\b/);
    if (yearMatch) {
      candidateYear = yearMatch[1];
    }

    if (candidateDegree || candidateCollege) {
      candidateEducation = `${candidateDegree || 'Degree'}${candidateCollege ? ' from ' + candidateCollege : ''}${candidateYear ? ' (' + candidateYear + ')' : ''}`;
    }

    // 6. Dynamic skill detection from raw text
    const detectedSkills: string[] = [];
    const techKeywords = [
      'Java', 'Spring Boot', 'Spring', 'MySQL', 'Hibernate', 'Microservices', 'Maven', 'JUnit',
      'React', 'TypeScript', 'Node.js', 'Express', 'PostgreSQL', 'MongoDB', 'JavaScript', 'HTML5',
      'CSS3', 'Tailwind CSS', 'Redux', 'GraphQL', 'Next.js', 'Python', 'Django', 'Flask', 'C++',
      'C#', '.NET', 'AWS', 'Docker', 'Kubernetes', 'Redis', 'Kafka', 'Git', 'REST APIs', 'SQL'
    ];
    techKeywords.forEach(kw => {
      const regex = new RegExp(`\\b${kw.replace('+', '\\+')}\\b`, 'i');
      if (regex.test(rawText) && !detectedSkills.includes(kw)) {
        detectedSkills.push(kw);
      }
    });

    const isJavaDev = detectedSkills.some(s => ['Java', 'Spring Boot', 'Spring', 'Hibernate'].includes(s));
    const isFrontendDev = detectedSkills.some(s => ['React', 'TypeScript', 'Tailwind CSS', 'HTML5', 'Next.js'].includes(s));
    const isPythonDev = detectedSkills.some(s => ['Python', 'Django', 'Flask'].includes(s));

    const calculatedScore = Math.min(96, Math.max(70, 68 + detectedSkills.length * 3));

    const strengths: string[] = [];
    if (isJavaDev) {
      strengths.push('✓ Strong Enterprise Java & Spring Boot backend skills');
      strengths.push('✓ Relational database experience with MySQL/PostgreSQL');
    } else if (isFrontendDev) {
      strengths.push('✓ Modern React & TypeScript frontend application experience');
      strengths.push('✓ Good UI component architecture and state management');
    } else if (isPythonDev) {
      strengths.push('✓ Python backend & data processing capabilities');
      strengths.push('✓ API development experience');
    } else {
      strengths.push('✓ Solid foundational software development skills');
      strengths.push('✓ Hands-on project implementation');
    }
    if (detectedSkills.length > 0) {
      strengths.push(`✓ Technical toolkit including ${detectedSkills.slice(0, 4).join(', ')}`);
    }

    const weaknesses: string[] = [
      '△ Project descriptions could quantify measurable metric impact (e.g. latency or throughput gains)',
      '△ Cloud deployment and CI/CD workflow section can be expanded',
    ];

    const missingSkills: Array<{ skill: string; reason: string }> = [];
    if (isJavaDev) {
      missingSkills.push({ skill: 'Docker', reason: 'Containerization is essential for Spring Boot microservice deployments.' });
      missingSkills.push({ skill: 'Kafka', reason: 'Event streaming with Apache Kafka is highly valued in Java enterprise roles.' });
      missingSkills.push({ skill: 'AWS', reason: 'Cloud hosting (EC2, S3) strengthens backend engineering profiles.' });
    } else if (isFrontendDev) {
      missingSkills.push({ skill: 'Node.js', reason: 'Node.js capabilities enable full-stack TypeScript engineering roles.' });
      missingSkills.push({ skill: 'PostgreSQL', reason: 'Relational database knowledge expands frontend roles to full-stack opportunities.' });
      missingSkills.push({ skill: 'WebSockets', reason: 'Real-time UI streaming is requested in modern web applications.' });
    } else {
      missingSkills.push({ skill: 'Docker', reason: 'Containerized deployment is standard across tech companies.' });
      missingSkills.push({ skill: 'AWS', reason: 'Cloud infrastructure experience increases hiring visibility.' });
      missingSkills.push({ skill: 'Redis', reason: 'In-memory caching is critical for high-throughput API endpoints.' });
    }

    const recommendedRoles: string[] = [];
    if (isJavaDev) {
      recommendedRoles.push('Java Backend Developer', 'Spring Boot Microservices Engineer', 'Systems Engineer');
    } else if (isFrontendDev) {
      recommendedRoles.push('Frontend Engineer', 'React Developer', 'Full Stack Web Developer');
    } else if (isPythonDev) {
      recommendedRoles.push('Python Developer', 'Backend Software Engineer', 'Data Engineer');
    } else {
      recommendedRoles.push('Software Development Engineer', 'Full Stack Developer', 'Backend Engineer');
    }

    return {
      parsedData: {
        name: candidateName || undefined,
        email: candidateEmail || undefined,
        phone: candidatePhone || undefined,
        location: candidateLocation || undefined,
        summary: candidateName ? `${candidateName} is a software developer with experience in ${detectedSkills.slice(0, 4).join(', ')}.` : undefined,
        education: candidateEducation || undefined,
        degree: candidateDegree || undefined,
        college: candidateCollege || undefined,
        graduation_year: candidateYear || undefined,
        skills: detectedSkills,
        experience: [],
        projects: [],
        certifications: [],
        achievements: [],
        languages: [],
      },
      resumeScore: calculatedScore,
      scoreExplanation: `Resume demonstrates technical alignment in ${detectedSkills.slice(0, 3).join(', ')}. Adding quantifiable metric outcomes will elevate your score further.`,
      strengths,
      weaknesses,
      missingSkills,
      improvements: [
        {
          section: 'Projects Section',
          original: `Built an application using ${detectedSkills[0] || 'software'}.`,
          improved: `Built a production-grade application using ${detectedSkills.slice(0, 3).join(', ')} with automated unit testing and 99.9% uptime.`,
          impact: 'High',
        },
      ],
      recommendedRoles,
    };
  }

  private fallbackJobMatch(profile: Profile, job: Job): Omit<JobMatch, 'id' | 'created_at'> {
    const candidateSkills = (profile.skills || []).map(s => s.toLowerCase());
    const requiredSkills = (job.skills || []).map(s => s.toLowerCase());

    const matched = requiredSkills.filter(s => candidateSkills.some(cs => cs.includes(s) || s.includes(cs)));
    const missing = requiredSkills.filter(s => !candidateSkills.some(cs => cs.includes(s) || s.includes(cs)));

    const skillScore = requiredSkills.length > 0 ? Math.round((matched.length / requiredSkills.length) * 100) : 80;
    const finalScore = Math.max(60, Math.min(98, skillScore));

    return {
      profile_id: profile.id,
      job_id: job.id,
      match_score: finalScore,
      skill_match: skillScore,
      experience_match: Math.max(70, finalScore - 5),
      education_match: 90,
      role_fit: Math.max(65, finalScore - 2),
      strengths: matched.length > 0 ? matched.map(m => `Proficient in ${m}`) : ['Foundational software development alignment'],
      missing_skills: missing.length > 0 ? missing : ['Cloud Containerization (Docker)'],
      partial_matches: ['Relational database design & optimization'],
      reasoning: `Candidate exhibits ${finalScore}% match for ${job.role} at ${job.company}. Matched skills: ${matched.join(', ') || 'core software stack'}.`,
      recommendations: missing.length > 0
        ? [`Familiarize yourself with ${missing.slice(0, 2).join(', ')} to maximize application success.`]
        : ['Highlight key project achievements during interviews.'],
    };
  }

  private fallbackCoverLetter(profile: Profile, job: Job): string {
    return `Dear Hiring Manager at ${job.company},

I am writing to express my strong interest in the ${job.role} position at ${job.company}. With my background in ${profile.degree || profile.education || 'Software Engineering'} ${profile.college ? 'from ' + profile.college : ''} and core technical skills in ${profile.skills?.slice(0, 4).join(', ') || 'software development'}, I am confident in my ability to add immediate value to your team.

My technical background aligns with ${job.company}'s requirements for ${job.role}. I have built software applications leveraging modern tools and RESTful architecture, ensuring reliability and clean code principles.

Thank you for reviewing my application. I look forward to discussing how my technical background fits your engineering goals.

Sincerely,
${profile.name || 'Candidate'}`;
  }

  private fallbackResumeReview(profile: Partial<Profile>): any {
    return {
      resumeStrength: 82,
      weakSections: [
        'Project descriptions should emphasize measurable outcomes (e.g. reduced load times by 25%).',
      ],
      missingSkills: ['Docker', 'AWS Deployment', 'CI/CD Pipelines'],
      suggestedImprovements: [
        'Add live URLs or GitHub repository links to your featured projects.',
        'Group technical skills cleanly into Languages, Frameworks, Databases, and Tools.',
      ],
      roleSpecificSuggestions: [
        'For Indian tech companies (Razorpay, TCS, Zoho, Zerodha), highlight database optimization and API performance.',
      ],
    };
  }

  private fallbackCareerGuidance(profile: Profile): any {
    return {
      targetRoles: ['Full Stack Engineer', 'Backend Developer', 'Software Engineer'],
      careerStage: 'Early Career / Fresher',
      skillGaps: ['Docker', 'AWS / Cloud Deployment', 'System Design'],
      actionableRoadmap: [
        { phase: 'Month 1', focus: 'Strengthen Node.js/Java microservices and database query optimization.' },
        { phase: 'Month 2', focus: 'Build a containerized project with Docker and deploy to cloud.' },
        { phase: 'Month 3', focus: 'Practice coding interviews and system design fundamentals.' },
      ],
      marketInsights: 'Active hiring across tech hubs in India (Bengaluru, Pune, Hyderabad, Mumbai).',
    };
  }
}

export const geminiService = new GeminiService();
