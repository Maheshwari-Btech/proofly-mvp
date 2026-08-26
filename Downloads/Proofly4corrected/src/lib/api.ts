import { OpportunityRequirement, EvidenceItem, CareerTrial } from "../types";
import { extractRequirementsFromText, evaluateCareerTrialSubmission } from "./aiSimulator";

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

export async function parseOpportunityWithAI(
  title: string,
  company: string,
  rawText: string,
  opportunityId: string
): Promise<OpportunityRequirement[]> {
  try {
    const res = await fetch("/api/ai/parse-opportunity", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, company, rawText }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.data && Array.isArray(data.data.requirements)) {
        return data.data.requirements.map((r: any, idx: number) => ({
          id: `req_${Date.now()}_${idx}`,
          opportunityId,
          skillName: r.title || r.name || "Technical Competency",
          category: (r.category?.toLowerCase() === "soft_skill" ? "Soft Skill" : r.category?.toLowerCase() === "tooling" ? "Tool" : "Technical") as any,
          importance: (r.importance === "Critical" || r.importance === "Important" || r.importance === "Bonus") ? r.importance : "Important",
          description: r.description || `Required skill for ${title}`,
        }));
      }
    }
  } catch (err) {
    console.warn("Backend parse opportunity API unavailable, using local intelligence engine:", err);
  }

  // Fallback
  return extractRequirementsFromText(title, rawText, opportunityId);
}

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
  try {
    const res = await fetch("/api/ai/evaluate-trial", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ trial, submission }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.score && data.feedback) {
        return {
          score: data.score,
          feedback: {
            strengths: data.feedback.strengths || [],
            improvements: data.feedback.improvements || [],
            summary: data.feedback.summary || "",
            verifiedSkills: [trial.targetSkill, "Verified Simulation"],
          },
          generatedEvidence: {
            ...data.generatedEvidence,
            userId: "usr_jordan_davis",
            verificationStatus: "Verified",
            sourceTrialId: trial.id,
            metrics: `Evaluated Score: ${data.score}/100 (Verified via Proofly AI)`,
          },
        };
      }
    }
  } catch (err) {
    console.warn("Backend trial evaluation API unavailable, using local intelligence engine:", err);
  }

  // Fallback
  return evaluateCareerTrialSubmission(trial, submission);
}
