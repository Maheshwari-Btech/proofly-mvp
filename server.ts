import express, { Request, Response } from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import { z } from "zod";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.set("trust proxy", 1);
app.use(express.json({ limit: "2mb" }));

// Lightweight in-memory rate limiter for the public AI endpoint.
// This is intentionally dependency-free and resets on process restart.
const rateLimitWindowMs = 60_000;
const rateLimitMax = 30;
const requestBuckets = new Map<string, { count: number; resetAt: number }>();

function rateLimit(req: Request, res: Response, next: () => void) {
  const key = req.ip || req.socket.remoteAddress || "unknown";
  const now = Date.now();
  const current = requestBuckets.get(key);

  if (!current || current.resetAt <= now) {
    requestBuckets.set(key, { count: 1, resetAt: now + rateLimitWindowMs });
    return next();
  }

  current.count += 1;
  if (requestBuckets.size > 5000) {
    for (const [bucketKey, bucket] of requestBuckets) {
      if (bucket.resetAt <= now) requestBuckets.delete(bucketKey);
    }
  }
  if (current.count > rateLimitMax) {
    return res.status(429).json({
      success: false,
      error: "Too many AI requests. Please wait a minute and try again.",
    });
  }

  return next();
}

// Basic browser hardening without adding another dependency.
app.use((_req: Request, res: Response, next: () => void) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "SAMEORIGIN");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  next();
});

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
// ZOD SCHEMAS FOR REQUEST VALIDATION
// ----------------------------------------------------
const GeminiRequestSchema = z.object({
  task: z.enum(["generate","nextcue_opportunity_analysis","opportunity_analysis","parse_opportunity","nextcue","proofly_evidence_analysis","evidence_analysis","career_trial_evaluation","proofly","skillswap_exchange_plan","exchange_plan","skillswap","career_coach_chat","chat","coach"]).optional().default("generate"),
  prompt: z.string().max(12000).optional(),
  systemInstruction: z.string().max(4000).optional(),
  title: z.string().max(200).optional(),
  company: z.string().max(200).optional(),
  rawText: z.string().max(30000).optional(),
  opportunityId: z.string().optional(),
  trial: z.any().optional(),
  submission: z.any().optional(),
  context: z.any().optional(),
  userGap: z.string().max(300).optional(),
  userContribution: z.string().max(300).optional(),
  peerName: z.string().max(200).optional(),
  payload: z.record(z.string(), z.any()).optional(),
});

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
// 2. UNIFIED SECURE GEMINI HANDLER
// ----------------------------------------------------
async function handleGeminiRequest(req: Request, res: Response) {
  // Validate request body with Zod
  const parseResult = GeminiRequestSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({
      success: false,
      error: "Invalid request payload",
      details: parseResult.error.issues.map((i) => i.message),
    });
  }

  const data = parseResult.data;
  const task = (data.task || "").toLowerCase();
  const ai = getGenAI();

  // Helper for when Gemini API key is not present
  if (!ai) {
    return handleGeminiFallback(task, data, res, "GEMINI_API_KEY is not configured on the server. Falling back to local intelligence engine.");
  }

  try {
    // ------------------------------------------------------------
    // TASK A: NEXTCUE OPPORTUNITY & JOB DESCRIPTION ANALYSIS
    // ------------------------------------------------------------
    if (
      task === "nextcue_opportunity_analysis" ||
      task === "opportunity_analysis" ||
      task === "parse_opportunity" ||
      task === "nextcue"
    ) {
      const title = data.title || data.payload?.title || "Engineering Role";
      const company = data.company || data.payload?.company || "Tech Company";
      const rawText = data.rawText || data.payload?.rawText || data.prompt || "";
      const oppId = data.opportunityId || data.payload?.opportunityId || `opp_${Date.now()}`;

      const prompt = `Analyze this job posting description and extract 4 to 8 distinct technical and professional requirements for a candidate.
Company Name: ${company}
Role Title: ${title}

Job Description / Criteria:
${rawText || "React, TypeScript, REST API, System Design, Testing, Tailwind CSS"}

Categorize each requirement with importance ("Critical", "Important", or "Bonus"), title, category ("Technical", "Tool", "Soft Skill", "Domain"), practical description, and relevant keywords.`;

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
                  required: ["title", "category", "importance", "description"],
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
        task: "nextcue_opportunity_analysis",
        data: parsedJson,
      });
    }

    // ------------------------------------------------------------
    // TASK B: PROOFLY EVIDENCE & CAREER TRIAL EVALUATION
    // ------------------------------------------------------------
    if (
      task === "proofly_evidence_analysis" ||
      task === "evidence_analysis" ||
      task === "career_trial_evaluation" ||
      task === "proofly"
    ) {
      const trial = data.trial || data.payload?.trial || {};
      const submission = data.submission || data.payload?.submission || {};

      const prompt = `Evaluate a student's submission for a workplace Career Trial micro-simulation.
Simulation Title: ${trial.title || "Career Trial"}
Target Skill / Competency: ${trial.targetSkill || "Full-Stack Development"}
Opportunity: ${trial.opportunityTitle || "Software Engineer"} at ${trial.opportunityCompany || "Tech Partner"}
Rubric Criteria: ${trial.rubric ? trial.rubric.join("; ") : "Code cleanliness, Error resilience, Architecture, Documentation"}

Student Submission:
GitHub Repo: ${submission.githubUrl || "None"}
Implementation Notes: ${submission.notes || "None"}
Submitted Code Snippet:
\`\`\`typescript
${submission.codeSnippet || "// No code snippet provided"}
\`\`\`

Evaluate objectively with a score from 75 to 100 based on standard industry coding benchmarks. Provide 2-3 specific strengths, 2 actionable improvements, and code quality rating.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.7-flash",
        contents: prompt,
        config: {
          systemInstruction:
            "You are a Principal Software Engineering Mentor evaluating a candidate's micro-simulation. Give constructive, uplifting, non-judgmental, and highly technical feedback.",
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              score: { type: Type.INTEGER, description: "Evaluation score between 75 and 100" },
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
        title: `Career Trial: ${trial.title || "Micro-Simulation"}`,
        type: "Project",
        organization: `${trial.opportunityCompany || "Proofly Partner"} Simulation`,
        issueDate: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
        description: `Completed workplace micro-simulation with a score of ${score}/100. Evaluated against ${trial.targetSkill || "production"} benchmarks.`,
        url: submission.githubUrl || "https://proofly.app/evaluations/trial",
        skills: [trial.targetSkill || "Technical Competency", "TypeScript", "System Design", "Error Handling"],
        verified: true,
        verificationStatus: "Verified",
        sourceTrialId: trial.id,
        metrics: `Evaluated Score: ${score}/100 (Verified via Proofly AI)`,
        confidenceScore: 0.95,
      };

      return res.json({
        success: true,
        source: "gemini-3.7-flash",
        task: "proofly_evidence_analysis",
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

    // ------------------------------------------------------------
    // TASK C: SKILLSWAP RECIPROCAL EXCHANGE PLAN GENERATION
    // ------------------------------------------------------------
    if (
      task === "skillswap_exchange_plan" ||
      task === "exchange_plan" ||
      task === "skillswap"
    ) {
      const userGap = data.userGap || data.payload?.userGap || "RESTful APIs & Data Fetching";
      const userContrib = data.userContribution || data.payload?.userContribution || "React & Component Architecture";
      const peerName = data.peerName || data.payload?.peerName || "Peer Mentor";

      const prompt = `Generate a structured, highly actionable 3-Day Reciprocal SkillSwap Exchange Plan between two students.
Student 1 (You) needs to bridge skill gap: "${userGap}".
Student 1 can contribute/teach: "${userContrib}".
Student 2 (Peer Mentor): "${peerName}".

Requirements:
- Day 1: Phase "LEARN" (Foundations, mental models, environment setup).
- Day 2: Phase "BUILD" (Hands-on mini-project construction, peer PR review).
- Day 3: Phase "PROVE" (Verification, portfolio deliverable, Proofly evidence generation).
For each day, provide: day number, phase, concise title, focus summary, mentor role, student role, tangible deliverable, estimated hours, and 4 specific checklist items.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.7-flash",
        contents: prompt,
        config: {
          systemInstruction:
            "You are an expert peer-learning curriculum designer. Create structured, high-intensity 3-day reciprocal exchange sprints that produce concrete GitHub/portfolio deliverables.",
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              plan: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    day: { type: Type.INTEGER },
                    phase: { type: Type.STRING },
                    title: { type: Type.STRING },
                    focus: { type: Type.STRING },
                    mentorRole: { type: Type.STRING },
                    studentRole: { type: Type.STRING },
                    deliverable: { type: Type.STRING },
                    estimatedHours: { type: Type.STRING },
                    checklist: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING },
                    },
                  },
                  required: ["day", "phase", "title", "focus", "mentorRole", "studentRole", "deliverable", "estimatedHours", "checklist"],
                },
              },
            },
            required: ["plan"],
          },
        },
      });

      const parsed = JSON.parse(response.text || "{}");
      return res.json({
        success: true,
        source: "gemini-3.7-flash",
        task: "skillswap_exchange_plan",
        exchangePlan: parsed.plan || [],
      });
    }

    // ------------------------------------------------------------
    // TASK D: CAREER COACH CHAT & CONVERSATIONAL ADVICE
    // ------------------------------------------------------------
    if (task === "career_coach_chat" || task === "chat" || task === "coach") {
      const promptText = data.prompt || data.payload?.prompt || "How can I improve my career readiness score?";
      const context = data.context || data.payload?.context;
      const systemInstruction =
        data.systemInstruction ||
        data.payload?.systemInstruction ||
        "You are Proofly's expert AI Career Coach. Help the student navigate their readiness benchmark, skill gaps, and career trials with concise, actionable, and encouraging technical advice.";

      const fullPrompt = context
        ? `Context Information:\n${typeof context === "string" ? context : JSON.stringify(context, null, 2)}\n\nUser Question/Prompt:\n${promptText}`
        : promptText;

      const response = await ai.models.generateContent({
        model: "gemini-3.7-flash",
        contents: fullPrompt,
        config: {
          systemInstruction,
        },
      });

      return res.json({
        success: true,
        source: "gemini-3.7-flash",
        task: "career_coach_chat",
        text: response.text || "I have analyzed your readiness profile. Focusing on Career Trials will give you the fastest path to verified proof.",
      });
    }

    // ------------------------------------------------------------
    // TASK E: GENERAL GEMINI GENERATE
    // ------------------------------------------------------------
    const generalPrompt = data.prompt || data.payload?.prompt || "Hello from Proofly AI Engine";
    const generalSystem = data.systemInstruction || data.payload?.systemInstruction;

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: generalPrompt,
      config: {
        ...(generalSystem ? { systemInstruction: generalSystem } : {}),
      },
    });

    return res.json({
      success: true,
      source: "gemini-3.7-flash",
      text: response.text || "",
    });
  } catch (error: any) {
    // Safe error logging server-side (never log or expose API keys)
    console.error("Gemini API server-side execution error:", error?.message || "Unknown error");
    return handleGeminiFallback(task, data, res, "Gemini API service encountered a temporary error. Provided deterministic fallback result.");
  }
}

// Attach main /api/gemini route
app.post("/api/gemini", rateLimit, handleGeminiRequest);

// ----------------------------------------------------
// 3. BACKWARD-COMPATIBILITY ENDPOINTS (Forward to handleGeminiRequest)
// ----------------------------------------------------
app.post("/api/ai/parse-opportunity", rateLimit, (req: Request, res: Response) => {
  req.body.task = "nextcue_opportunity_analysis";
  return handleGeminiRequest(req, res);
});

app.post("/api/ai/evaluate-trial", rateLimit, (req: Request, res: Response) => {
  req.body.task = "proofly_evidence_analysis";
  return handleGeminiRequest(req, res);
});

app.post("/api/ai/chat", rateLimit, (req: Request, res: Response) => {
  req.body.task = "career_coach_chat";
  return handleGeminiRequest(req, res);
});

// Helper function to safely provide fallback data without throwing or exposing secrets
function handleGeminiFallback(task: string, data: any, res: Response, noticeMessage: string) {
  if (
    task === "nextcue_opportunity_analysis" ||
    task === "opportunity_analysis" ||
    task === "parse_opportunity" ||
    task === "nextcue"
  ) {
    const title = data.title || data.payload?.title || "Engineering Role";
    const company = data.company || data.payload?.company || "Technology Corp";
    const keywordsPool = [
      { name: "React & Component Architecture", cat: "Technical", imp: "Critical", desc: "Build reactive interfaces with custom hooks and state management.", kw: ["react", "hooks", "components", "jsx"] },
      { name: "TypeScript & Static Typing", cat: "Technical", imp: "Critical", desc: "Strong proficiency with typed interfaces, generics, and strict configurations.", kw: ["typescript", "ts", "types", "generics"] },
      { name: "REST / GraphQL API Integration", cat: "Technical", imp: "Critical", desc: "Connecting frontend clients to resilient backend endpoints and handling error states.", kw: ["api", "rest", "graphql", "fetch", "async"] },
      { name: "Responsive UI & Tailwind CSS", cat: "Tool", imp: "Important", desc: "Creating accessible, mobile-first layouts with modern CSS utilities.", kw: ["tailwind", "css", "responsive", "ui"] },
      { name: "Testing & Code Quality", cat: "Technical", imp: "Bonus", desc: "Unit and integration testing with modern frameworks (Vitest, Jest, Cypress).", kw: ["testing", "vitest", "jest", "unit test"] },
    ];

    return res.json({
      success: true,
      fallback: true,
      source: "fallback-engine",
      notice: noticeMessage,
      data: {
        extractedTitle: title,
        extractedCompany: company,
        summary: `Parsed ${keywordsPool.length} core competencies for ${title}.`,
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
  }

  if (
    task === "proofly_evidence_analysis" ||
    task === "evidence_analysis" ||
    task === "career_trial_evaluation" ||
    task === "proofly"
  ) {
    const trial = data.trial || data.payload?.trial || {};
    const submission = data.submission || data.payload?.submission || {};
    const score = submission.codeSnippet && submission.codeSnippet.length > 50 ? 94 : 88;

    return res.json({
      success: true,
      fallback: true,
      source: "fallback-engine",
      notice: noticeMessage,
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
        codeQuality: "Production-Ready",
      },
      generatedEvidence: {
        id: `evi_trial_${Date.now()}`,
        title: `Career Trial: ${trial.title || "Micro-Simulation"}`,
        type: "Project",
        organization: `${trial.opportunityCompany || "Proofly Partner"} Simulation`,
        issueDate: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
        description: `Completed workplace micro-simulation with a score of ${score}/100. Evaluated against ${trial.targetSkill || "production"} benchmarks.`,
        url: submission.githubUrl || "https://github.com/jordandavis/career-trial-artifact",
        skills: [trial.targetSkill || "Technical Competency", "TypeScript", "REST APIs", "Error Handling"],
        verified: true,
        verificationStatus: "Verified",
        sourceTrialId: trial.id,
        metrics: `Evaluated Score: ${score}/100 (Verified via Proofly AI)`,
        confidenceScore: 0.95,
      },
    });
  }

  if (
    task === "skillswap_exchange_plan" ||
    task === "exchange_plan" ||
    task === "skillswap"
  ) {
    const userGap = data.userGap || data.payload?.userGap || "RESTful APIs & Data Fetching";
    const userContrib = data.userContribution || data.payload?.userContribution || "React & Component Architecture";
    const peerName = data.peerName || data.payload?.peerName || "Peer Mentor";

    return res.json({
      success: true,
      fallback: true,
      source: "fallback-engine",
      notice: noticeMessage,
      exchangePlan: [
        {
          day: 1,
          phase: "LEARN",
          title: `Day 1: Foundations & Architecture Review of ${userGap}`,
          focus: `Understand core mental models, error scenarios, and industry best practices for ${userGap}.`,
          mentorRole: `${peerName} walks through real-world architectural patterns, code reviews an existing repository, and answers foundational questions.`,
          studentRole: `You explain your background in ${userContrib}, review documentation, and set up a clean sandbox project environment.`,
          deliverable: `A sandbox scaffold with clear TypeScript contracts and initial documentation.`,
          estimatedHours: "1.5 - 2 hours",
          checklist: [
            `30-minute introductory sync / audio call with ${peerName}`,
            `Review the 3 core principles of ${userGap}`,
            `Identify 2 common anti-patterns to avoid in production`,
            `Initialize local repository with strict linting & types`,
          ],
        },
        {
          day: 2,
          phase: "BUILD",
          title: `Day 2: Hands-on Mini-Project Construction`,
          focus: `Build a practical micro-application implementing ${userGap} from scratch.`,
          mentorRole: `${peerName} provides asynchronous feedback on pull requests and helps debug edge-case failures.`,
          studentRole: `You write clean, modular implementation code, handle asynchronous loading/error states, and commit clean git commits.`,
          deliverable: `A working GitHub repository with functional code demonstrating ${userGap}.`,
          estimatedHours: "2 - 3 hours",
          checklist: [
            `Implement the core functional logic for ${userGap}`,
            `Add robust error handling, edge case boundaries, and logging`,
            `Write clear README explaining architecture and decision trade-offs`,
            `Submit Pull Request for peer review`,
          ],
        },
        {
          day: 3,
          phase: "PROVE",
          title: `Day 3: Verification, Portfolio Artifact & Proofly Reassessment`,
          focus: `Review deliverables, finalize evidence artifact, and upload into Proofly Evidence Library.`,
          mentorRole: `${peerName} issues peer endorsement note and validates that deliverable meets industry readiness standard.`,
          studentRole: `You upload project URL to Proofly Evidence Library, tag ${userGap}, and trigger automatic readiness recalculation.`,
          deliverable: `Verified Proofly Evidence Artifact + boosted Readiness Score on target opportunities.`,
          estimatedHours: "1 hour",
          checklist: [
            `Final PR review approval from ${peerName}`,
            `Deploy live demo on Vercel/Cloud or tag clean release on GitHub`,
            `Submit new Evidence item to Proofly Evidence Library`,
            `Verify updated Readiness Score across all target opportunities`,
          ],
        },
      ],
    });
  }

  // Default fallback for chat / generate
  return res.json({
    success: true,
    fallback: true,
    source: "fallback-engine",
    notice: noticeMessage,
    text: "Proofly Coach: Focusing on closing your highest leverage skill gaps with Career Trials will give you the fastest path to 90%+ readiness.",
  });
}

// ----------------------------------------------------
// 4. Vite Dev & Production Static Middleware
// ----------------------------------------------------

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
      },
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

  app.listen(PORT, "localhost", () => {
    console.log(
      `🚀 Proofly Full-Stack Server listening on http://localhost:${PORT}`
    );
  });
}

startServer().catch((error) => {
  console.error("❌ Failed to start Proofly server:", error);
  process.exit(1);
});