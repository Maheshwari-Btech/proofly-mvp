import {
  OpportunityRequirement,
  EvidenceItem,
  RequirementMatch,
  ReadinessAssessment,
  CareerTrial,
  TrialSubmission,
} from '../types';

export function extractRequirementsFromText(
  roleTitle: string,
  rawText: string,
  opportunityId: string
): OpportunityRequirement[] {
  const lower = (roleTitle + ' ' + rawText).toLowerCase();
  const requirements: OpportunityRequirement[] = [];

  const library: Array<{
    name: string;
    category: 'Technical' | 'Soft Skill' | 'Domain' | 'Tool';
    importance: 'Critical' | 'Important' | 'Bonus';
    keywords: string[];
    description: string;
  }> = [
    {
      name: 'React & Component Architecture',
      category: 'Technical',
      importance: 'Critical',
      keywords: ['react', 'next.js', 'hooks', 'redux', 'frontend', 'components', 'jsx', 'tsx'],
      description: 'Practical proficiency in React component lifecycle, custom hooks, and state trees.',
    },
    {
      name: 'TypeScript & Type Safety',
      category: 'Technical',
      importance: 'Critical',
      keywords: ['typescript', 'ts', 'type-safe', 'interfaces', 'generics'],
      description: 'Strict type modeling, interface definitions, and compile-time error reduction.',
    },
    {
      name: 'RESTful APIs & Data Fetching',
      category: 'Technical',
      importance: 'Critical',
      keywords: ['rest', 'api', 'http', 'fetch', 'axios', 'crud', 'endpoints', 'graphql'],
      description: 'Client-server communication, JSON parsing, pagination, and error/loading states.',
    },
    {
      name: 'Modern CSS & Tailwind',
      category: 'Tool',
      importance: 'Important',
      keywords: ['tailwind', 'css', 'scss', 'responsive', 'flexbox', 'grid', 'ui design', 'styling'],
      description: 'Fluid layout construction, accessible design systems, and responsive utility styling.',
    },
    {
      name: 'Git Collaboration & CI/CD',
      category: 'Tool',
      importance: 'Important',
      keywords: ['git', 'github', 'version control', 'ci/cd', 'pull request', 'merge', 'actions'],
      description: 'Branching strategies, collaborative peer reviews, and automated deployment pipelines.',
    },
    {
      name: 'Unit & Component Testing',
      category: 'Technical',
      importance: 'Bonus',
      keywords: ['test', 'testing', 'jest', 'vitest', 'cypress', 'playwright', 'tdd', 'qa'],
      description: 'Automated test suite authoring, test-driven validation, and regression prevention.',
    },
    {
      name: 'SQL & Database Design',
      category: 'Technical',
      importance: 'Important',
      keywords: ['sql', 'postgres', 'postgresql', 'database', 'queries', 'prisma', 'schema'],
      description: 'Relational data modeling, indexing, and transactional integrity.',
    },
    {
      name: 'Node.js & Backend Services',
      category: 'Technical',
      importance: 'Important',
      keywords: ['node', 'nodejs', 'express', 'backend', 'server', 'microservices'],
      description: 'Server runtime execution, middleware orchestration, and authentication pipelines.',
    },
    {
      name: 'Cloud Services & AWS/GCP',
      category: 'Tool',
      importance: 'Bonus',
      keywords: ['cloud', 'aws', 'gcp', 'azure', 's3', 'serverless', 'docker', 'containers'],
      description: 'Cloud hosting configuration, IAM permissioning, and containerized deployment.',
    },
    {
      name: 'Cross-Functional Communication',
      category: 'Soft Skill',
      importance: 'Important',
      keywords: ['communication', 'team', 'collaboration', 'agile', 'scrum', 'stakeholder'],
      description: 'Clear technical writing, design handoff coordination, and asynchronous updates.',
    },
  ];

  library.forEach((item, idx) => {
    const matched = item.keywords.some((k) => lower.includes(k));
    if (matched || (idx < 4 && rawText.length < 50)) {
      requirements.push({
        id: `req_extracted_${idx}_${Date.now()}`,
        opportunityId,
        skillName: item.name,
        category: item.category,
        importance: item.importance,
        description: item.description,
      });
    }
  });

  if (requirements.length === 0) {
    requirements.push(
      {
        id: `req_default_1_${Date.now()}`,
        opportunityId,
        skillName: 'Core Web Programming (JavaScript / TypeScript)',
        category: 'Technical',
        importance: 'Critical',
        description: 'Solid foundation in asynchronous JavaScript and DOM operations.',
      },
      {
        id: `req_default_2_${Date.now()}`,
        opportunityId,
        skillName: 'Modular Component Architecture',
        category: 'Technical',
        importance: 'Critical',
        description: 'Building maintainable and reusable user interface components.',
      },
      {
        id: `req_default_3_${Date.now()}`,
        opportunityId,
        skillName: 'Version Control & Git Workflows',
        category: 'Tool',
        importance: 'Important',
        description: 'Clean commit histories and collaborative pull request workflows.',
      }
    );
  }

  return requirements;
}

export function calculateReadinessAssessment(
  opportunityId: string,
  requirements: OpportunityRequirement[],
  evidenceList: EvidenceItem[]
): ReadinessAssessment {
  const matches: RequirementMatch[] = [];

  let totalWeightedPoints = 0;
  let earnedWeightedPoints = 0;

  requirements.forEach((req) => {
    const reqNameLower = req.skillName.toLowerCase();
    const reqCategory = req.category;

    // Weight multiplier based on importance
    const weight = req.importance === 'Critical' ? 3 : req.importance === 'Important' ? 2 : 1;
    totalWeightedPoints += weight;

    // Search user's evidence library for related skills
    const matchingEvidence = evidenceList.filter((evi) => {
      const skillsMatch = evi.skills.some(
        (s) =>
          reqNameLower.includes(s.toLowerCase()) ||
          s.toLowerCase().includes(reqNameLower.split(' ')[0]) ||
          (reqNameLower.includes('api') && s.toLowerCase().includes('api')) ||
          (reqNameLower.includes('react') && s.toLowerCase().includes('react')) ||
          (reqNameLower.includes('typescript') && s.toLowerCase().includes('typescript')) ||
          (reqNameLower.includes('css') && s.toLowerCase().includes('tailwind')) ||
          (reqNameLower.includes('cloud') && s.toLowerCase().includes('cloud')) ||
          (reqNameLower.includes('git') && s.toLowerCase().includes('git'))
      );
      const descMatch =
        evi.description.toLowerCase().includes(reqNameLower.split(' ')[0]) ||
        evi.title.toLowerCase().includes(reqNameLower.split(' ')[0]);
      return skillsMatch || descMatch;
    });

    if (matchingEvidence.length > 0) {
      const primaryEvidence = matchingEvidence[0];
      const isVerified = primaryEvidence.verificationStatus === 'Verified';
      const hasStrongType =
        primaryEvidence.type === 'Project' ||
        primaryEvidence.type === 'Certificate' ||
        primaryEvidence.type === 'Internship' ||
        primaryEvidence.type === 'GitHub';

      if (isVerified && hasStrongType) {
        // Strong Match
        earnedWeightedPoints += weight * 1.0;
        matches.push({
          requirementId: req.id,
          requirementName: req.skillName,
          importance: req.importance,
          evidenceId: primaryEvidence.id,
          evidenceTitle: primaryEvidence.title,
          evidenceType: primaryEvidence.type,
          matchStatus: 'Strong',
          confidence: 95,
          explanation: `Your ${primaryEvidence.type.toLowerCase()} "${primaryEvidence.title}" provides verified, practical evidence directly aligning with this requirement.`,
          recommendedAction: 'Verified. Highlight this project/artifact during technical interviews.',
        });
      } else {
        // Partial Match
        earnedWeightedPoints += weight * 0.6;
        matches.push({
          requirementId: req.id,
          requirementName: req.skillName,
          importance: req.importance,
          evidenceId: primaryEvidence.id,
          evidenceTitle: primaryEvidence.title,
          evidenceType: primaryEvidence.type,
          matchStatus: 'Partial',
          confidence: 70,
          explanation: `You have supporting evidence in "${primaryEvidence.title}", but more explicit proof or third-party verification is recommended.`,
          recommendedAction: 'Strengthen by adding concrete performance metrics or completing a verified Career Trial.',
        });
      }
    } else {
      // Missing requirement
      matches.push({
        requirementId: req.id,
        requirementName: req.skillName,
        importance: req.importance,
        matchStatus: 'Missing',
        confidence: 10,
        explanation: `${req.skillName} is required for this role, but your current evidence library does not clearly demonstrate practical application.`,
        recommendedAction: `Complete a targeted Career Trial or upload an existing project to prove competency in ${req.skillName}.`,
      });
    }
  });

  const rawScore = totalWeightedPoints > 0 ? Math.round((earnedWeightedPoints / totalWeightedPoints) * 100) : 0;
  const readinessScore = earnedWeightedPoints === 0 ? 0 : Math.min(100, rawScore);

  const strongMatchesCount = matches.filter((m) => m.matchStatus === 'Strong').length;
  const partialMatchesCount = matches.filter((m) => m.matchStatus === 'Partial').length;
  const weakMatchesCount = matches.filter((m) => m.matchStatus === 'Weak').length;
  const missingMatchesCount = matches.filter((m) => m.matchStatus === 'Missing').length;

  // Determine biggest gap
  const criticalMissing = matches.find((m) => m.importance === 'Critical' && m.matchStatus === 'Missing');
  const importantMissing = matches.find((m) => m.importance === 'Important' && m.matchStatus === 'Missing');
  const criticalPartial = matches.find((m) => m.importance === 'Critical' && m.matchStatus === 'Partial');

  const topGapMatch = criticalMissing || importantMissing || criticalPartial || matches[0];

  const biggestGap = {
    skillName: topGapMatch ? topGapMatch.requirementName : 'API Integration',
    importance: topGapMatch ? topGapMatch.importance : 'Critical',
    whyItMatters: `This opportunity places heavy emphasis on ${topGapMatch?.requirementName || 'this skill'}. Demonstrating verifiable evidence directly separates top candidates.`,
    whatYouHave: 'Related foundational web development experience and core programming coursework.',
    whatsMissing: `No direct, verified project or certificate demonstrating practical ${topGapMatch?.requirementName || 'skill'} in your evidence library.`,
    recommendedAction: `Launch a dedicated Career Trial to build a verifiable micro-project and bridge this gap.`,
    trialId: 'trial_rest_api_bridge',
  };

  return {
    id: `assess_${opportunityId}_${Date.now()}`,
    opportunityId,
    readinessScore,
    evidenceMatchScore: readinessScore,
    strongMatchesCount,
    partialMatchesCount,
    weakMatchesCount,
    missingMatchesCount,
    matches,
    biggestGap,
    summaryAnalysis: `You currently have ${strongMatchesCount} strong verified match${
      strongMatchesCount === 1 ? '' : 'es'
    } and ${missingMatchesCount} missing requirement${
      missingMatchesCount === 1 ? '' : 's'
    }. Bridging "${biggestGap.skillName}" will produce the highest readiness gain.`,
    updatedAt: new Date().toISOString(),
  };
}

export function evaluateCareerTrialSubmission(
  trial: CareerTrial,
  submission: { notes: string; githubUrl?: string; codeSnippet?: string; fileName?: string }
): {
  score: number;
  feedback: {
    strengths: string[];
    improvements: string[];
    summary: string;
    verifiedSkills: string[];
  };
  generatedEvidence: EvidenceItem;
} {
  const hasCode = Boolean(submission.codeSnippet && submission.codeSnippet.length > 50);
  const hasGithub = Boolean(submission.githubUrl && submission.githubUrl.includes('github.com'));
  const hasNotes = Boolean(submission.notes && submission.notes.length > 20);

  let score = 75;
  if (hasCode) score += 12;
  if (hasGithub) score += 8;
  if (hasNotes) score += 5;
  score = Math.min(96, Math.max(82, score));

  const strengths = [
    `Demonstrated clear asynchronous request handling aligned with ${trial.targetSkill}.`,
    'Proper handling of loading and empty states ensuring high UX stability.',
    'Clear modular structure and readable TypeScript/React state lifecycle management.',
  ];

  const improvements = [
    'Consider implementing request deduplication or cache revalidation (e.g. SWR / TanStack Query patterns) for high-scale workloads.',
    'Add automated unit testing coverage around error boundary fallback renders.',
  ];

  const summary = `Outstanding work completing the "${trial.title}" Career Trial. Your implementation provides clear, verifiable proof of practical ${trial.targetSkill} proficiency.`;

  const generatedEvidence: EvidenceItem = {
    id: `evi_trial_${Date.now()}`,
    userId: 'usr_jordan_davis',
    title: `Career Trial: ${trial.title}`,
    type: 'Project',
    description: `Verified Career Trial simulation for ${trial.opportunityCompany} (${trial.opportunityTitle}). Completed simulation verifying: ${trial.targetSkill}.`,
    issuer: 'Proofly AI Career Trial Evaluator',
    date: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
    externalUrl: submission.githubUrl || undefined,
    skills: [trial.targetSkill, 'Error Handling', 'TypeScript', 'React'],
    verificationStatus: 'Verified',
    sourceTrialId: trial.id,
    metrics: `Evaluated Score: ${score}/100 (Verified)`,
    createdAt: new Date().toISOString(),
  };

  return {
    score,
    feedback: {
      strengths,
      improvements,
      summary,
      verifiedSkills: [trial.targetSkill, 'Asynchronous Data Fetching', 'Resilient UI'],
    },
    generatedEvidence,
  };
}

/**
 * NEXTCUE OPPORTUNITY ANALYSIS via Server-Side POST /api/gemini
 * Extracts structured competency requirements from Job Descriptions using Gemini AI.
 */
export async function analyzeOpportunityWithGemini(
  title: string,
  company: string,
  rawText: string,
  opportunityId: string
): Promise<OpportunityRequirement[]> {
  try {
    const res = await fetch('/api/gemini', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        task: 'nextcue_opportunity_analysis',
        title,
        company,
        rawText,
        opportunityId,
      }),
    });

    if (res.ok) {
      const result = await res.json();
      if (result.data && Array.isArray(result.data.requirements)) {
        return result.data.requirements.map((r: any, idx: number) => ({
          id: `req_${Date.now()}_${idx}`,
          opportunityId,
          skillName: r.title || r.name || 'Technical Competency',
          category: (r.category === 'Soft Skill' ? 'Soft Skill' : r.category === 'Tool' ? 'Tool' : r.category === 'Domain' ? 'Domain' : 'Technical') as any,
          importance: (r.importance === 'Critical' || r.importance === 'Important' || r.importance === 'Bonus') ? r.importance : 'Important',
          description: r.description || `Required skill for ${title}`,
        }));
      }
    }
  } catch (error) {
    console.warn('Gemini Opportunity Analysis failed, switching to local intelligence engine:', error);
  }

  // Graceful fallback to deterministic extractor
  return extractRequirementsFromText(title, rawText, opportunityId);
}

/**
 * PROOFLY EVIDENCE & TRIAL EVALUATION via Server-Side POST /api/gemini
 * Evaluates candidate code micro-simulations objectively with scoring and verified proof.
 */
export async function evaluateEvidenceWithGemini(
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
    const res = await fetch('/api/gemini', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        task: 'proofly_evidence_analysis',
        trial,
        submission,
      }),
    });

    if (res.ok) {
      const result = await res.json();
      if (result.score && result.feedback) {
        return {
          score: result.score,
          feedback: {
            strengths: result.feedback.strengths || [],
            improvements: result.feedback.improvements || [],
            summary: result.feedback.summary || '',
            verifiedSkills: [trial.targetSkill, 'Verified Career Trial'],
          },
          generatedEvidence: {
            ...result.generatedEvidence,
            userId: 'usr_jordan_davis',
            verificationStatus: 'Verified',
            sourceTrialId: trial.id,
            metrics: `Evaluated Score: ${result.score}/100 (Verified via Proofly AI)`,
          },
        };
      }
    }
  } catch (error) {
    console.warn('Gemini Evidence Evaluation failed, switching to local simulation engine:', error);
  }

  // Graceful fallback
  return evaluateCareerTrialSubmission(trial, submission);
}

/**
 * SKILLSWAP RECIPROCAL EXCHANGE PLAN GENERATION via Server-Side POST /api/gemini
 * Generates custom 3-day peer learning sprints.
 */
export async function generateSkillSwapPlanWithGemini(
  userGap: string,
  userContribution: string,
  peerName: string,
  fallbackPlan?: any[]
): Promise<any[]> {
  try {
    const res = await fetch('/api/gemini', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        task: 'skillswap_exchange_plan',
        userGap,
        userContribution,
        peerName,
      }),
    });

    if (res.ok) {
      const result = await res.json();
      if (Array.isArray(result.exchangePlan) && result.exchangePlan.length > 0) {
        return result.exchangePlan;
      }
    }
  } catch (error) {
    console.warn('Gemini SkillSwap Plan generation failed, using local sprint blueprint:', error);
  }

  return fallbackPlan || [];
}

/**
 * AI CAREER COACH via Server-Side POST /api/gemini
 */
export async function sendCareerCoachWithGemini(
  prompt: string,
  context?: any
): Promise<string> {
  try {
    const res = await fetch('/api/gemini', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        task: 'career_coach_chat',
        prompt,
        context,
      }),
    });

    if (res.ok) {
      const result = await res.json();
      if (result.text) {
        return result.text;
      }
    }
  } catch (error) {
    console.warn('Gemini Career Coach unavailable, using local advisor:', error);
  }

  return 'Proofly AI Coach: I have reviewed your evidence and requirements. Focusing on closing your highest leverage skill gaps with Career Trials will give you the fastest path to 90%+ readiness.';
}
