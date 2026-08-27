/* =========================================================
   PROOFLY TYPE DEFINITIONS
   ========================================================= */

/* =========================================================
   USER PROFILE
   ========================================================= */

export interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  avatarInitials: string;
  headline: string;
  bio: string;
  college: string;
  degree: string;
  education: string;
  graduationYear: string;
  targetRole: string;
  careerInterests: string[];
  currentSkills: string[];
  careerGoal: string;
  skillSwapActive: boolean;
  notificationEmail: boolean;
  notificationTrialUpdates: boolean;
}

/* =========================================================
   OPPORTUNITIES
   ========================================================= */

export interface OpportunityRequirement {
  id: string;
  opportunityId: string;
  skillName: string;
  category: string;
  importance: "Critical" | "Important" | "Bonus";
  description: string;
}

export interface Opportunity {
  id: string;
  userId: string;
  title: string;
  company: string;
  location: string;
  opportunityType: string;
  sourceUrl: string;
  description: string;
  status: string;
  postedDate: string;
  isPriority: boolean;
  readinessScore: number;
  createdAt: string;
  requirements: OpportunityRequirement[];
}

/* =========================================================
   EVIDENCE
   ========================================================= */

export interface EvidenceItem {
  id: string;
  userId?: string;

  title: string;
  description: string;
  type: string;

  issuer?: string;
  date?: string;

  url?: string;
  source?: string;

  fileUrl?: string;
  fileName?: string;
  externalUrl?: string;

  skills: string[];

  verified?: boolean;
  verificationStatus?: string;

  sourceTrialId?: string;

  metrics?: Record<string, unknown>;

  createdAt?: string;

  [key: string]: unknown;
}

/* =========================================================
   READINESS
   ========================================================= */

export interface ReadinessMatch {
  requirementName: string;
  skillName?: string;
  requiredSkill?: string;
  evidenceSkill?: string;

  status?: string;
  matchType?: string;

  score?: number;
  confidence?: number;

  explanation?: string;

  [key: string]: unknown;
}

export interface ReadinessAssessment {
  id?: string;

  opportunityId: string;

  readinessScore: number;
  evidenceMatchScore: number;

  strongMatchesCount: number;
  partialMatchesCount: number;
  weakMatchesCount: number;
  missingMatchesCount: number;

  matches: ReadinessMatch[];

  biggestGap?: string | null;
  summaryAnalysis: string;

  updatedAt?: string;

  /* Compatibility fields */
  overallScore?: number;
  matchedSkills?: string[];
  missingSkills?: string[];
  recommendations?: string[];

  [key: string]: unknown;
}

/* =========================================================
   CAREER TRIALS
   ========================================================= */

export interface CareerTrialTask {
  id: string;
  title: string;
  instruction: string;
  expectedOutput: string;
  estimatedMinutes: number;
}

export interface TrialRubricItem {
  criterion?: string;
  description?: string;
  points?: number;
  weight?: number;

  [key: string]: unknown;
}

export interface TrialSubmission {
  id: string;
  trialId: string;

  submittedAt: string;

  notes: string;

  githubUrl?: string;
  codeSnippet?: string;
  fileAttachmentName?: string;

  score?: number;

  feedback?: Record<string, unknown>;
}

export interface CareerTrial {
  id: string;

  opportunityId: string;
  opportunityTitle: string;
  opportunityCompany: string;

  targetSkill: string;

  title: string;
  description: string;

  difficulty: string;
  estimatedTime: string;

  status: string;

  score?: number;
  completedAt?: string;

  rubric: TrialRubricItem[];
  tasks: CareerTrialTask[];

  createdAt: string;

  submission?: TrialSubmission;
}

/* =========================================================
   SKILLSWAP
   ========================================================= */

export interface SkillSwapPeer {
  id: string;
  userId: string;

  name: string;
  avatarInitials: string;

  headline: string;
  college: string;

  compatibilityScore: number;

  theyCanTeachYou: string[];
  youCanTeachThem: string[];

  bio: string;
  lookingFor: string;

  availability: string;

  status: string;
  lastActive: string;
}

/* =========================================================
   SKILL PROGRESS
   ========================================================= */

export interface SkillProgressRecord {
  id: string;
  userId: string;

  skillName: string;

  previousLevel: string | number;
  currentLevel: string | number;

  source: string;

  date: string;

  /* Compatibility fields */
  progress?: number;
  status?: string;
  createdAt?: string;
  updatedAt?: string;

  [key: string]: unknown;
}

/* =========================================================
   LEARNING RESOURCES
   ========================================================= */

export interface LearningResource {
  id: string;

  title: string;
  provider: string;
  description: string;

  url: string;

  resourceType: string;

  skills: string[];

  difficulty: string;
  duration: string;

  free: boolean;

  language: string;

  rating: number;

  featured: boolean;
}

/* =========================================================
   MENTORS
   ========================================================= */

export interface Mentor {
  id: string;

  fullName: string;
  avatarInitials: string;

  headline: string;
  company: string;

  skills: string[];

  bio: string;

  experienceYears: number;

  availability: string;

  rating: number;

  verified: boolean;
}

/* =========================================================
   MENTORSHIP REQUEST
   ========================================================= */

export interface MentorRequest {
  id: string;

  mentorId: string;
  mentorName: string;

  studentId: string;
  studentName: string;

  targetRole: string;
  targetSkillGap: string;

  message: string;

  status: string;

  createdAt: string;
}

/* =========================================================
   CONTACT MESSAGE
   ========================================================= */

export interface ContactMessage {
  id?: string;

  name: string;
  email: string;

  subject: string;
  message: string;

  userId?: string;

  createdAt?: string;
}

/* =========================================================
   COMMON API RESPONSE
   ========================================================= */

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}