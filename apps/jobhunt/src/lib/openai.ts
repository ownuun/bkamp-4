import Groq from 'groq-sdk';

// Lazy initialization to avoid build errors
let groqClient: Groq | null = null;

function getGroq(): Groq {
  if (!groqClient) {
    groqClient = new Groq({
      apiKey: process.env.GROQ_API_KEY,
    });
  }
  return groqClient;
}

export interface ResumeAnalysis {
  skills: string[];
  experienceYears: number;
  strengths: string[];
  suggestions: string[];
  summary: string;
}

export async function analyzeResume(resumeText: string): Promise<ResumeAnalysis> {
  const groq = getGroq();
  const response = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [
      {
        role: 'system',
        content: `You are an expert resume analyzer. Analyze the given resume and extract:
1. Technical skills (programming languages, frameworks, tools)
2. Estimated years of experience
3. Key strengths (3-5 bullet points)
4. Improvement suggestions (2-3 bullet points)
5. A brief professional summary (1-2 sentences)

You MUST respond with ONLY valid JSON in this exact format, no other text:
{
  "skills": ["skill1", "skill2", ...],
  "experienceYears": number,
  "strengths": ["strength1", "strength2", ...],
  "suggestions": ["suggestion1", "suggestion2", ...],
  "summary": "brief summary"
}`,
      },
      {
        role: 'user',
        content: `Analyze this resume:\n\n${resumeText}`,
      },
    ],
    temperature: 0.3,
  });

  const content = response.choices[0]?.message?.content;
  if (!content) {
    throw new Error('Failed to analyze resume');
  }

  // Extract JSON from response (handle potential markdown code blocks)
  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('Failed to parse resume analysis');
  }

  return JSON.parse(jsonMatch[0]) as ResumeAnalysis;
}

export interface FitScoreResult {
  score: number;
  reasons: {
    skills: number;
    experience: number;
    salary: number;
  };
  explanation: string;
  matchedSkills: string[];
  missingSkills: string[];
}

export async function calculateFitScore(
  resumeAnalysis: ResumeAnalysis,
  jobPosting: {
    title: string;
    description: string;
    skills_required: string[];
    experience_required: number | null;
    salary_min: number | null;
    salary_max: number | null;
  },
  userPreferences: {
    desired_salary_min: number | null;
    desired_salary_max: number | null;
  }
): Promise<FitScoreResult> {
  const groq = getGroq();
  const response = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [
      {
        role: 'system',
        content: `You are an expert job matching analyst. Calculate the fit score between a candidate and a job posting.

Consider:
1. Skills match (40% weight) - How many required skills does the candidate have?
2. Experience match (25% weight) - Does their experience level match?
3. Salary match (20% weight) - Does the job's budget align with candidate expectations?
4. Overall compatibility (15% weight) - General fit based on job description

You MUST respond with ONLY valid JSON in this exact format, no other text:
{
  "score": number (0-100),
  "reasons": {
    "skills": number (0-100),
    "experience": number (0-100),
    "salary": number (0-100)
  },
  "explanation": "2-3 sentence explanation of why this is a good/bad match",
  "matchedSkills": ["skill1", "skill2"],
  "missingSkills": ["skill1", "skill2"]
}`,
      },
      {
        role: 'user',
        content: `Candidate Profile:
Skills: ${resumeAnalysis.skills.join(', ')}
Experience: ${resumeAnalysis.experienceYears} years
Summary: ${resumeAnalysis.summary}
Salary expectation: $${userPreferences.desired_salary_min || 0}-${userPreferences.desired_salary_max || 0}/hr

Job Posting:
Title: ${jobPosting.title}
Description: ${jobPosting.description}
Required Skills: ${jobPosting.skills_required?.join(', ') || 'Not specified'}
Required Experience: ${jobPosting.experience_required || 'Not specified'} years
Budget: $${jobPosting.salary_min || 0}-${jobPosting.salary_max || 0}/hr`,
      },
    ],
    temperature: 0.3,
  });

  const content = response.choices[0]?.message?.content;
  if (!content) {
    throw new Error('Failed to calculate fit score');
  }

  // Extract JSON from response
  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('Failed to parse fit score');
  }

  return JSON.parse(jsonMatch[0]) as FitScoreResult;
}

export async function generateCoverLetter(
  resumeAnalysis: ResumeAnalysis,
  jobPosting: {
    title: string;
    company_name: string | null;
    description: string;
  }
): Promise<string> {
  const groq = getGroq();
  const response = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [
      {
        role: 'system',
        content: `You are a professional cover letter writer. Write a compelling, personalized cover letter for a freelance job application.

Guidelines:
- Keep it concise (150-200 words)
- Highlight relevant skills and experience
- Show enthusiasm for the project
- Be professional but friendly
- Don't start with "Dear Hiring Manager" - use the company name if available`,
      },
      {
        role: 'user',
        content: `Write a cover letter for this application:

Candidate:
Skills: ${resumeAnalysis.skills.join(', ')}
Experience: ${resumeAnalysis.experienceYears} years
Strengths: ${resumeAnalysis.strengths.join(', ')}

Job:
Title: ${jobPosting.title}
Company: ${jobPosting.company_name || 'Unknown'}
Description: ${jobPosting.description}`,
      },
    ],
    temperature: 0.7,
  });

  return response.choices[0]?.message?.content || '';
}
