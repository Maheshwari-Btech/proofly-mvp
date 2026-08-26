export type EvidenceType =
  | 'Certificate'
  | 'Project'
  | 'Resume'
  | 'Internship'
  | 'Experience'
  | 'GitHub'
  | 'Course'
  | 'Competition'
  | 'Other';

export type MatchStatus = 'Strong' | 'Partial' | 'Weak' | 'Missing';

export type RequirementImportance = 'Critical' | 'Important' | 'Bonus';

export type TrialDifficulty = 'Beginner' | 'Intermediate' | 'Advanced';

export type TrialStatus = 'assigned' | 'in_progress' | 'submitted' | 'completed';

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

export interface OpportunityRequirement {
  id: string;
  opportunityId: string;
  skillName: string;
  category: 'Technical' | 'Soft Skill' | 'Domain' | 'Tool';
  importance: RequirementImportance;
  description: string;
}

export interface Opportunity {
  id: string;
  userId: string;
  title: string;
  company: string;
  location: string;
  opportunityType: 'Internship' | 'Full-time' | 'Co-op' | 'Part-time';
  sourceUrl?: string;
  description: string;
  requirements: OpportunityRequirement[];
  readinessScore: number;
  status: 'Active' | 'Interviewing' | 'Applied' | 'Archived';
  postedDate: string;
  isPriority?: boolean;
  createdAt: string;
}

export interface EvidenceItem {
  id: string;
  userId: string;
  title: string;
  type: EvidenceType;
  description: string;
  issuer?: string;
  date: string;
  fileUrl?: string;
  fileName?: string;
  externalUrl?: string;
  skills: string[];
  verificationStatus: 'Verified' | 'Self-Reported' | 'In-Review';
  sourceTrialId?: string;
  metrics?: string;
  createdAt: string;
}

export interface RequirementMatch {
  requirementId: string;
  requirementName: string;
  importance: RequirementImportance;
  evidenceId?: string;
  evidenceTitle?: string;
  evidenceType?: EvidenceType;
  matchStatus: MatchStatus;
  confidence: number; // 0 to 100
  explanation: string;
  recommendedAction: string;
}

export interface ReadinessAssessment {
  id: string;
  opportunityId: string;
  readinessScore: number; // 0 to 100
  evidenceMatchScore: number;
  strongMatchesCount: number;
  partialMatchesCount: number;
  weakMatchesCount: number;
  missingMatchesCount: number;
  matches: RequirementMatch[];
  biggestGap: {
    skillName: string;
    importance: RequirementImportance;
    whyItMatters: string;
    whatYouHave: string;
    whatsMissing: string;
    recommendedAction: string;
    trialId?: string;
  };
  summaryAnalysis: string;
  updatedAt: string;
}

export interface TrialTask {
  id: string;
  title: string;
  instruction: string;
  expectedOutput: string;
  estimatedMinutes: number;
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
  feedback?: {
    strengths: string[];
    improvements: string[];
    summary: string;
    verifiedSkills: string[];
  };
}

export interface CareerTrial {
  id: string;
  opportunityId: string;
  opportunityTitle: string;
  opportunityCompany: string;
  targetSkill: string;
  title: string;
  description: string;
  difficulty: TrialDifficulty;
  estimatedTime: string;
  status: TrialStatus;
  score?: number;
  tasks: TrialTask[];
  submission?: TrialSubmission;
  rubric: string[];
  createdAt: string;
  completedAt?: string;
}

export interface SkillSwapPeer {
  id: string;
  userId: string;
  name: string;
  avatarInitials: string;
  headline: string;
  college: string;
  compatibilityScore: number;
  theyCanTeachYou: string[]; // Their strengths matching user's gaps
  youCanTeachThem: string[]; // User's strengths matching their gaps
  bio: string;
  lookingFor: string;
  availability: string;
  status: 'available' | 'connected' | 'pending';
  lastActive: string;
}

export interface SkillProgressRecord {
  id: string;
  skillName: string;
  previousLevel: 'Novice' | 'Developing' | 'Proficient' | 'Advanced';
  currentLevel: 'Novice' | 'Developing' | 'Proficient' | 'Advanced';
  source: string;
  date: string;
}

export interface LearningResource {
  id: string;
  title: string;
  provider: string;
  description: string;
  url: string;
  resourceType: 'Course' | 'Tutorial' | 'Documentation' | 'Video' | 'Article' | 'Practice' | 'Project' | 'Certification';
  skills: string[];
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  duration: string;
  free: boolean;
  language: string;
  thumbnail?: string;
  rating?: number;
  featured?: boolean;
}

export interface Mentor {
  id: string;
  userId?: string;
  fullName: string;
  headline: string;
  bio: string;
  company: string;
  expertise: string[];
  skills: string[];
  experienceYears: number;
  linkedinUrl?: string;
  githubUrl?: string;
  portfolioUrl?: string;
  availability: 'Available' | 'Busy' | 'Waitlist';
  languages: string[];
  rating: number;
  reviewsCount: number;
  verified: boolean;
  avatarUrl?: string;
  avatarInitials: string;
}

export interface MentorRequest {
  id: string;
  mentorId: string;
  mentorName: string;
  studentId: string;
  studentName: string;
  targetRole: string;
  targetSkillGap: string;
  message: string;
  status: 'Pending' | 'Accepted' | 'Declined' | 'Completed';
  createdAt: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  createdAt: string;
}

export interface AuthSession {
  user: {
    id: string;
    email: string;
    fullName?: string;
  } | null;
  isAuthenticated: boolean;
}
