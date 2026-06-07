import { aiClient } from './ai.client.js';
import { AppError } from '../utils/response.utils.js';
import { logger } from '../config/logger.js';

const SYSTEM_PROMPT =
  'You are an expert career advisor and technical recruiter. Always respond with valid JSON only. No markdown, no explanations outside the JSON.';

interface ResumeAnalysis {
  score: number;
  missingSkills: string[];
  strengths: string[];
  improvements: string[];
}

interface ExtractedSkills {
  skills: string[];
  experience: string[];
  education: string[];
}

interface SkillGapResult {
  matchedSkills: string[];
  missingSkills: string[];
  recommendations: string[];
}

interface InterviewPrepResult {
  technicalQuestions: string[];
  hrQuestions: string[];
  companySpecificQuestions: string[];
}

function parseJsonResponse<T>(raw: string, context: string): T {
  try {
    // Strip potential markdown fences if model wraps response
    const cleaned = raw
      .replace(/^```(?:json)?\s*\n?/i, '')
      .replace(/\n?```\s*$/i, '')
      .trim();

    return JSON.parse(cleaned) as T;
  } catch {
    logger.error(`Failed to parse Gemini JSON response for ${context}: ${raw}`);
    throw new AppError(
      `AI returned an invalid response for ${context}. Please try again.`,
      502
    );
  }
}

export const aiService = {
  async analyzeResume(
    resumeText: string,
    jobDescription: string
  ): Promise<ResumeAnalysis> {
    const prompt = `Analyze the following resume against the job description. Provide a compatibility score from 0-100, list missing skills, strengths, and areas for improvement.

Resume:
${resumeText}

Job Description:
${jobDescription}

Respond with JSON in this exact format:
{
  "score": <number 0-100>,
  "missingSkills": ["skill1", "skill2"],
  "strengths": ["strength1", "strength2"],
  "improvements": ["improvement1", "improvement2"]
}`;

    const raw = await aiClient.callGemini(prompt, SYSTEM_PROMPT);
    return parseJsonResponse<ResumeAnalysis>(raw, 'resume analysis');
  },

  async extractSkills(resumeText: string): Promise<ExtractedSkills> {
    const prompt = `Extract all skills, work experience summaries, and education details from the following resume text.

Resume:
${resumeText}

Respond with JSON in this exact format:
{
  "skills": ["skill1", "skill2", "skill3"],
  "experience": ["experience summary 1", "experience summary 2"],
  "education": ["education detail 1", "education detail 2"]
}`;

    const raw = await aiClient.callGemini(prompt, SYSTEM_PROMPT);
    return parseJsonResponse<ExtractedSkills>(raw, 'skill extraction');
  },

  async skillGapAnalysis(
    resumeSkills: string[],
    jobRequirements: string[]
  ): Promise<SkillGapResult> {
    const prompt = `Compare the candidate's skills against the job requirements. Identify matched skills, missing skills, and provide actionable recommendations to bridge the gap.

Candidate Skills:
${JSON.stringify(resumeSkills)}

Job Requirements:
${JSON.stringify(jobRequirements)}

Respond with JSON in this exact format:
{
  "matchedSkills": ["skill1", "skill2"],
  "missingSkills": ["skill1", "skill2"],
  "recommendations": ["recommendation1", "recommendation2"]
}`;

    const raw = await aiClient.callGemini(prompt, SYSTEM_PROMPT);
    return parseJsonResponse<SkillGapResult>(raw, 'skill gap analysis');
  },

  async interviewPrep(
    jobDescription: string,
    resumeText: string,
    companyName: string
  ): Promise<InterviewPrepResult> {
    const prompt = `Generate interview preparation questions for a candidate applying to ${companyName}. Base questions on the job description and the candidate's resume. Include technical, HR/behavioral, and company-specific questions.

Job Description:
${jobDescription}

Candidate Resume:
${resumeText}

Company: ${companyName}

Respond with JSON in this exact format:
{
  "technicalQuestions": ["question1", "question2", "question3", "question4", "question5"],
  "hrQuestions": ["question1", "question2", "question3", "question4", "question5"],
  "companySpecificQuestions": ["question1", "question2", "question3"]
}`;

    const raw = await aiClient.callGemini(prompt, SYSTEM_PROMPT);
    return parseJsonResponse<InterviewPrepResult>(raw, 'interview preparation');
  },
};
