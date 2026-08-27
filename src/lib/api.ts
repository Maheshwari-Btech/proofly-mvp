import { OpportunityRequirement, EvidenceItem, CareerTrial } from "../types";
import {
  analyzeOpportunityWithGemini,
  evaluateEvidenceWithGemini,
  sendCareerCoachWithGemini,
  generateSkillSwapPlanWithGemini,
  extractRequirementsFromText,
  evaluateCareerTrialSubmission,
} from "./aiSimulator";

export interface ServerHealth {
  status: string;
  service: string;
  geminiEnabled: boolean;
  timestamp: string;
}

export async function checkServerHealth(): Promise<ServerHealth> {
  try {
    const res = await fetch("/api/health");
    if (!res.ok) throw new Error("Health check failed");
    return await res.json();
  } catch {
    return {
      status: "fallback",
      service: "Proofly Client Engine",
      geminiEnabled: false,
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * NEXTCUE Opportunity parser via server-side /api/gemini
 */
export async function parseOpportunityWithAI(
  title: string,
  company: string,
  rawText: string,
  opportunityId: string
): Promise<OpportunityRequirement[]> {
  return analyzeOpportunityWithGemini(title, company, rawText, opportunityId);
}

/**
 * PROOFLY Career Trial / Evidence evaluator via server-side /api/gemini
 */
export async function evaluateTrialWithAI(
  trial: CareerTrial,
  submission: { notes: string; githubUrl?: string; codeSnippet?: string; fileName?: string }
): Promise<{
  score: number;
  feedback: {
    strengths: string[];
    improvements: string[];
    summary: string;
    verifiedSkills: string[];
  };
  generatedEvidence: EvidenceItem;
}> {
  return evaluateEvidenceWithGemini(trial, submission);
}

/**
 * AI Career Coach chat via server-side /api/gemini
 */
export async function sendCareerCoachMessage(
  prompt: string,
  context?: {
    opportunity?: { title: string; company: string; requirements: string[] };
    evidenceCount?: number;
    highestGap?: string;
    readinessScore?: number;
  }
): Promise<string> {
  return sendCareerCoachWithGemini(prompt, context);
}

/**
 * SKILLSWAP Reciprocal Exchange Plan generator via server-side /api/gemini
 */
export async function generateSkillSwapPlanAI(
  userGap: string,
  userContribution: string,
  peerName: string,
  fallbackPlan?: any[]
): Promise<any[]> {
  return generateSkillSwapPlanWithGemini(userGap, userContribution, peerName, fallbackPlan);
}

