import { z } from 'zod';

/**
 * Zod Schema for Evidence Items and Forms
 */
export const EvidenceTypeSchema = z.enum([
  'Certificate',
  'Project',
  'Resume',
  'Internship',
  'Experience',
  'GitHub',
  'Course',
  'Competition',
  'Other',
]);

export const VerificationStatusSchema = z.enum([
  'Verified',
  'Under Review',
  'Self-Reported',
]);

export const EvidenceFormSchema = z.object({
  title: z
    .string()
    .min(3, { message: 'Title must be at least 3 characters long.' })
    .max(120, { message: 'Title cannot exceed 120 characters.' }),
  type: EvidenceTypeSchema,
  description: z
    .string()
    .min(5, { message: 'Please provide at least 5 characters of description or context.' })
    .max(2000, { message: 'Description cannot exceed 2000 characters.' }),
  issuer: z
    .string()
    .max(100, { message: 'Issuer name cannot exceed 100 characters.' })
    .optional()
    .or(z.literal('')),
  date: z
    .string()
    .max(50, { message: 'Date cannot exceed 50 characters.' })
    .optional()
    .or(z.literal('')),
  externalUrl: z
    .string()
    .url({ message: 'Must be a valid web URL starting with http:// or https://' })
    .optional()
    .or(z.literal('')),
  skills: z
    .array(z.string().min(1, { message: 'Skill tag cannot be empty.' }))
    .min(1, { message: 'At least one associated skill tag is required.' }),
  metrics: z
    .string()
    .max(100, { message: 'Metrics text cannot exceed 100 characters.' })
    .optional()
    .or(z.literal('')),
});

export const EvidenceItemSchema = EvidenceFormSchema.extend({
  id: z.string(),
  userId: z.string(),
  verificationStatus: VerificationStatusSchema.default('Verified'),
  fileUrl: z.string().optional(),
  fileName: z.string().optional(),
  sourceTrialId: z.string().optional(),
  createdAt: z.string().optional(),
});

export type EvidenceFormData = z.infer<typeof EvidenceFormSchema>;
export type ValidatedEvidenceItem = z.infer<typeof EvidenceItemSchema>;

/**
 * Zod Schema for Opportunity Requirements
 */
export const RequirementImportanceSchema = z.enum(['Critical', 'Important', 'Bonus']);
export const RequirementCategorySchema = z.enum(['Technical', 'Soft Skill', 'Domain', 'Tool']);

export const OpportunityRequirementSchema = z.object({
  id: z.string(),
  opportunityId: z.string(),
  skillName: z.string().min(2, { message: 'Skill name must be at least 2 characters.' }),
  category: RequirementCategorySchema,
  importance: RequirementImportanceSchema,
  description: z.string().max(500).default(''),
});

/**
 * Zod Schema for Opportunities and Forms
 */
export const OpportunityTypeSchema = z.enum(['Internship', 'Full-time', 'Co-op', 'Part-time']);
export const OpportunityStatusSchema = z.enum(['Active', 'Interviewing', 'Applied', 'Archived']);

export const OpportunityFormSchema = z.object({
  title: z
    .string()
    .min(3, { message: 'Opportunity title must be at least 3 characters.' })
    .max(120, { message: 'Title cannot exceed 120 characters.' }),
  company: z
    .string()
    .min(2, { message: 'Company name must be at least 2 characters.' })
    .max(100, { message: 'Company name cannot exceed 100 characters.' }),
  location: z
    .string()
    .max(100, { message: 'Location cannot exceed 100 characters.' })
    .default('Remote'),
  opportunityType: OpportunityTypeSchema.default('Internship'),
  sourceUrl: z
    .string()
    .url({ message: 'Must be a valid web URL (e.g., https://jobs.lever.co/...)' })
    .optional()
    .or(z.literal('')),
  description: z
    .string()
    .max(5000, { message: 'Description cannot exceed 5000 characters.' })
    .optional()
    .or(z.literal('')),
  requirements: z
    .array(OpportunityRequirementSchema)
    .min(1, { message: 'At least one competency requirement must be specified.' }),
});

export const OpportunitySchema = OpportunityFormSchema.extend({
  id: z.string(),
  userId: z.string(),
  readinessScore: z.number().min(0).max(100).default(0),
  status: OpportunityStatusSchema.default('Active'),
  postedDate: z.string().optional(),
  isPriority: z.boolean().default(false),
  createdAt: z.string().optional(),
});

export type OpportunityFormData = z.infer<typeof OpportunityFormSchema>;
export type ValidatedOpportunity = z.infer<typeof OpportunitySchema>;

/**
 * Zod Schema for User Profiles
 */
export const UserProfileSchema = z.object({
  id: z.string(),
  fullName: z.string().min(2, { message: 'Full name must be at least 2 characters.' }).max(100),
  email: z.string().email({ message: 'Must be a valid email address.' }).or(z.literal('')),
  avatarInitials: z.string().max(4).default('CM'),
  avatarUrl: z.string().url().optional().or(z.literal('')),
  headline: z.string().max(150).default('Software Engineering Explorer'),
  bio: z.string().max(1000).default(''),
  college: z.string().max(150).default(''),
  degree: z.string().max(150).default(''),
  education: z.string().max(150).default(''),
  graduationYear: z.string().max(10).default('2026'),
  targetRole: z.string().min(2, { message: 'Target role must be at least 2 characters.' }).max(100),
  careerInterests: z.array(z.string()).default([]),
  currentSkills: z.array(z.string()).default([]),
  careerGoal: z.string().max(500).default(''),
  skillSwapActive: z.boolean().default(true),
  notificationEmail: z.boolean().default(true),
  notificationTrialUpdates: z.boolean().default(true),
});

/**
 * Zod Schema for Contact Messages
 */
export const ContactMessageSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2, { message: 'Name must be at least 2 characters long.' }).max(100),
  email: z.string().email({ message: 'Please provide a valid email address.' }),
  subject: z.string().min(3, { message: 'Subject must be at least 3 characters.' }).max(150),
  message: z.string().min(10, { message: 'Message must be at least 10 characters long.' }).max(3000),
  createdAt: z.string().optional(),
});

/**
 * Zod Schema for Mentorship Requests
 */
export const MentorRequestSchema = z.object({
  id: z.string().optional(),
  mentorId: z.string().min(1, { message: 'Mentor selection is required.' }),
  mentorName: z.string().min(1, { message: 'Mentor name is required.' }),
  studentId: z.string().min(1, { message: 'Student ID is required.' }),
  studentName: z.string().min(2, { message: 'Student name is required.' }),
  targetRole: z.string().min(2, { message: 'Target role is required.' }),
  targetSkillGap: z.string().min(2, { message: 'Target skill gap is required.' }),
  message: z.string().min(10, { message: 'Please provide at least 10 characters explaining what you want to cover.' }).max(2000),
  status: z.enum(['Pending', 'Accepted', 'Declined', 'Completed']).default('Pending'),
  createdAt: z.string().optional(),
});

/**
 * Zod Schema for Learning Catalog Resources
 */
export const LearningResourceSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(3, { message: 'Title must be at least 3 characters.' }).max(150),
  provider: z.string().min(2, { message: 'Provider name is required.' }).max(100),
  description: z.string().min(10, { message: 'Description must be at least 10 characters.' }).max(1000),
  url: z.string().url({ message: 'Must be a valid URL starting with http:// or https://' }),
  resourceType: z.enum(['Course', 'Tutorial', 'Documentation', 'Video', 'Article', 'Practice', 'Project', 'Certification']),
  skills: z.array(z.string().min(1)).min(1, { message: 'At least one skill must be tagged.' }),
  difficulty: z.enum(['Beginner', 'Intermediate', 'Advanced']),
  duration: z.string().min(1, { message: 'Estimated duration is required.' }),
  free: z.boolean().default(true),
  language: z.string().default('English'),
  rating: z.number().min(0).max(5).default(4.9),
  featured: z.boolean().default(false),
});

/**
 * Zod Schema for Mentors
 */
export const MentorSchema = z.object({
  id: z.string().optional(),
  fullName: z.string().min(2, { message: 'Mentor name must be at least 2 characters.' }).max(100),
  headline: z.string().min(5, { message: 'Headline must be at least 5 characters.' }).max(150),
  bio: z.string().min(15, { message: 'Bio must be at least 15 characters.' }).max(1500),
  company: z.string().min(2, { message: 'Company name is required.' }).max(100),
  expertise: z.array(z.string()).min(1, { message: 'At least one area of expertise is required.' }),
  skills: z.array(z.string()).min(1, { message: 'At least one skill is required.' }),
  experienceYears: z.number().min(1, { message: 'Years of experience must be at least 1.' }).max(50),
  availability: z.enum(['Available', 'Busy', 'Waitlist']).default('Available'),
  languages: z.array(z.string()).default(['English']),
  rating: z.number().min(0).max(5).default(5.0),
  reviewsCount: z.number().min(0).default(0),
  verified: z.boolean().default(true),
  avatarInitials: z.string().max(4).default('PM'),
});

/**
 * Zod Schema for Career Trial Submissions
 */
export const TrialSubmissionSchema = z.object({
  id: z.string().optional(),
  trialId: z.string().min(1, { message: 'Trial ID is required.' }),
  notes: z.string().max(3000).optional().or(z.literal('')),
  githubUrl: z.string().url({ message: 'Must be a valid GitHub or repository URL.' }).optional().or(z.literal('')),
  codeSnippet: z.string().max(20000).optional().or(z.literal('')),
  score: z.number().min(0).max(100),
  feedback: z.any().optional(),
  submittedAt: z.string().optional(),
});

