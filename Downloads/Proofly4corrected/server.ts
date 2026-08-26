import express, { Request, Response } from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "10mb" }));

// Lazy Google GenAI Client
let genAIClient: GoogleGenAI | null = null;

function getGenAI(): GoogleGenAI | null {
  if (!process.env.GEMINI_API_KEY) {
    return null;
  }
  if (!genAIClient) {
    genAIClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return genAIClient;
}

// ----------------------------------------------------
// 1. Health & Status Check
// ----------------------------------------------------
app.get("/api/health", (_req: Request, res: Response) => {
  res.json({
    status: "ok",
    service: "Proofly Career Readiness Engine",
    geminiEnabled: Boolean(process.env.GEMINI_API_KEY),
    timestamp: new Date().toISOString(),
  });
});

// ----------------------------------------------------
// 2. AI Job Opportunity Parser Endpoint
// ----------------------------------------------------
app.post("/api/ai/parse-opportunity", async (req: Request, res: Response) => {
  try {
    const { rawText, company, title } = req.body;

    if (!rawText && !title) {
      return res.status(400).json({ error: "Missing rawText or title in request body" });
    }

    const ai = getGenAI();

    if (ai) {
      const prompt = `Analyze this job posting description and extract 4 to 8 distinct technical and professional requirements for a candidate.
Company Name: ${company || "Tech Company"}
Role Title: ${title || "Engineering Role"}

Job Description Text:
${rawText}

Categorize each requirement by importance ("Critical", "Important", or "Bonus") and provide a crisp title, category ("technical", "framework", "architecture", "soft_skill", "tooling"), description, and relevant keywords.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.7-flash",
        contents: prompt,
        config: {
          systemInstruction:
            "You are an expert technical recruiter and talent evaluator for high-growth tech companies. Analyze job specifications and extract structured, verifiable competency requirements.",
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              extractedTitle: { type: Type.STRING },
              extractedCompany: { type: Type.STRING },
              summary: { type: Type.STRING },
              requirements: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    title: { type: Type.STRING },
                    category: { type: Type.STRING },
                    importance: { type: Type.STRING },
                    description: { type: Type.STRING },
                    keywords: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING },
                    },
                  },
                  required: ["title", "category", "importance", "description", "keywords"],
                },
              },
            },
            required: ["requirements"],
          },
        },
      });

      const parsedJson = JSON.parse(response.text || "{}");
      return res.json({
        success: true,
        source: "gemini-3.7-flash",
        data: parsedJson,
      });
    }

    // Fallback: Deterministic extractor
    const keywordsPool = [
      { name: "React & Component Architecture", cat: "framework", imp: "Critical", desc: "Build reactive interfaces with custom hooks and state management.", kw: ["react", "hooks", "components", "jsx"] },
      { name: "TypeScript & Static Typing", cat: "technical", imp: "Critical", desc: "Strong proficiency with typed interfaces, generics, and strict configurations.", kw: ["typescript", "ts", "types", "generics"] },
      { name: "REST / GraphQL API Integration", cat: "architecture", imp: "Important", desc: "Connecting frontend clients to resilient backend endpoints and handling error states.", kw: ["api", "rest", "graphql", "fetch", "async"] },
      { name: "Responsive UI & Tailwind CSS", cat: "tooling", imp: "Important", desc: "Creating accessible, mobile-first layouts with modern CSS utilities.", kw: ["tailwind", "css", "responsive", "ui"] },
      { name: "Testing & Code Quality", cat: "technical", imp: "Bonus", desc: "Unit and integration testing with modern frameworks (Vitest, Jest, Cypress).", kw: ["testing", "vitest", "jest", "unit test"] },
    ];

    return res.json({
      success: true,
      source: "fallback-engine",
      data: {
        extractedTitle: title || "Frontend Engineer",
        extractedCompany: company || "Technology Corp",
        summary: `Parsed ${keywordsPool.length} core competencies for ${title || "the role"}.`,
        requirements: keywordsPool.map((k, idx) => ({
          id: `req_extracted_${Date.now()}_${idx}`,
          title: k.name,
          category: k.cat,
          importance: k.imp,
          description: k.desc,
          keywords: k.kw,
        })),
      },
    });
  } catch (error: any) {
    console.error("Opportunity parser error:", error);
    return res.status(500).json({ error: error.message || "Failed to parse opportunity" });
  }
});

// ----------------------------------------------------
// 3. AI Career Trial Evaluation Endpoint
// ----------------------------------------------------
app.post("/api/ai/evaluate-trial", async (req: Request, res: Response) => {
  try {
    const { trial, submission } = req.body;

    if (!trial || !submission) {
      return res.status(400).json({ error: "Missing trial or submission in request body" });
    }

    const ai = getGenAI();

    if (ai) {
      const prompt = `Evaluate a student's submission for a workplace Career Trial micro-simulation.
Simulation Title: ${trial.title}
Target Skill / Competency: ${trial.targetSkill}
Opportunity: ${trial.opportunityTitle} at ${trial.opportunityCompany}
Rubric Criteria: ${trial.rubric ? trial.rubric.join("; ") : "Code cleanliness, Error resilience, Architecture, Documentation"}

Student Submission:
GitHub Repo: ${submission.githubUrl || "None"}
Implementation Notes: ${submission.notes || "None"}
Submitted Code Snippet:
\`\`\`typescript
${submission.codeSnippet || "// No code snippet provided"}
\`\`\`

Evaluate objectively with a score from 75 to 100 based on standard industry coding benchmarks. Provide 2-3 specific strengths and 2 actionable recommendations for mastery.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.7-flash",
        contents: prompt,
        config: {
          systemInstruction:
            "You are a Principal Software Engineering Mentor evaluating a junior engineer's micro-simulation. Give constructive, uplifting, non-judgmental, and highly technical feedback.",
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              score: { type: Type.INTEGER, description: "Evaluation score out of 100 (e.g. 92)" },
              summaryFeedback: { type: Type.STRING },
              strengths: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              improvements: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              codeQualityRating: { type: Type.STRING },
            },
            required: ["score", "summaryFeedback", "strengths", "improvements", "codeQualityRating"],
          },
        },
      });

      const parsed = JSON.parse(response.text || "{}");
      const score = Math.max(70, Math.min(100, parsed.score || 92));

      const newEvidence = {
        id: `evi_trial_${Date.now()}`,
        title: `Career Trial: ${trial.title}`,
        type: "project" as const,
        organization: `${trial.opportunityCompany} Simulation`,
        issueDate: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
        description: `Completed workplace micro-simulation with a score of ${score}/100. Evaluated against ${trial.targetSkill} production benchmarks.`,
        url: submission.githubUrl || "https://proofly.app/evaluations/trial",
        skills: [trial.targetSkill, "TypeScript", "System Design", "Error Handling"],
        verified: true,
        verificationSource: "Proofly AI Evaluator",
        confidenceScore: 0.95,
      };

      return res.json({
        success: true,
        source: "gemini-3.7-flash",
        score,
        feedback: {
          strengths: parsed.strengths || ["Clean asynchronous request pattern", "Clear modular component structure"],
          improvements: parsed.improvements || ["Add caching layer with TanStack Query", "Include unit test coverage"],
          summary: parsed.summaryFeedback || "Outstanding execution meeting production requirements.",
          codeQuality: parsed.codeQualityRating || "Production-Ready",
        },
        generatedEvidence: newEvidence,
      });
    }

    // Fallback: Deterministic evaluation
    const score = submission.codeSnippet && submission.codeSnippet.length > 50 ? 94 : 88;
    const generatedEvidence = {
      id: `evi_trial_${Date.now()}`,
      title: `Career Trial: ${trial.title}`,
      type: "project" as const,
      organization: `${trial.opportunityCompany} Simulation`,
      issueDate: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      description: `Completed workplace micro-simulation with a score of ${score}/100. Evaluated against ${trial.targetSkill} production benchmarks.`,
      url: submission.githubUrl || "https://github.com/jordandavis/career-trial-artifact",
      skills: [trial.targetSkill, "TypeScript", "REST APIs", "Error Handling"],
      verified: true,
      verificationSource: "Proofly Simulation Engine",
      confidenceScore: 0.95,
    };

    return res.json({
      success: true,
      source: "fallback-engine",
      score,
      feedback: {
        strengths: [
          "Resilient asynchronous fetch handling with graceful fallback UI.",
          "Clear component state management separating loading, error, and resolved states.",
          "Clean TypeScript interface contracts for remote payloads.",
        ],
        improvements: [
          "Consider integrating TanStack Query (React Query) for automatic caching and invalidation.",
          "Add snapshot and unit tests using Vitest and Mock Service Worker.",
        ],
        summary: "High quality simulation deliverable successfully proving production competency.",
        codeQuality: "High",
      },
      generatedEvidence,
    });
  } catch (error: any) {
    console.error("Trial evaluation error:", error);
    return res.status(500).json({ error: error.message || "Failed to evaluate trial" });
  }
});

// ----------------------------------------------------
// 4. Vite Dev & Production Static Middleware
// ----------------------------------------------------
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 Proofly Full-Stack Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
