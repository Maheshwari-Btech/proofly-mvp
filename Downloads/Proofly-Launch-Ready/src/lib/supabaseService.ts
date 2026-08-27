import { getSupabaseClient, isSupabaseConfigured } from './supabaseClient';
import {
  EvidenceFormSchema,
  OpportunityFormSchema,
} from './schemas';

import {
  UserProfile,
  Opportunity,
  EvidenceItem,
  ReadinessAssessment,
  CareerTrial,
  MentorRequest,
  SkillSwapPeer,
} from '../types';

/*
|--------------------------------------------------------------------------
| Local types
|--------------------------------------------------------------------------
| These are defined here because your current ../types file does not export
| ContactMessage, TrialSubmission, or SkillProgressRecord.
|--------------------------------------------------------------------------
*/

export interface ContactMessage {
  name: string;
  email: string;
  subject: string;
  message: string;
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
  feedback?: Record<string, any>;
}

export interface SkillProgressRecord {
  id: string;
  skillName: string;
  previousLevel: number;
  currentLevel: number;
  source: string;
  date: string;
}

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const isUuid = (value?: string | null): boolean => {
  return Boolean(value && UUID_RE.test(value));
};

const now = () => new Date().toISOString();

const safeArray = <T = any>(value: any): T[] => {
  return Array.isArray(value) ? value : [];
};

const safeString = (value: any, fallback = ''): string => {
  if (typeof value === 'string') return value;
  if (value === null || value === undefined) return fallback;
  return String(value);
};

const safeNumber = (value: any, fallback = 0): number => {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
};

export const supabaseService = {
  // ==========================================================================
  // CONFIGURATION
  // ==========================================================================

  isConfigured(): boolean {
    return isSupabaseConfigured();
  },

  // ==========================================================================
  // AUTHENTICATION
  // ==========================================================================

  async getCurrentUser() {
    const client = getSupabaseClient();

    if (!client) {
      return null;
    }

    try {
      const {
        data: { user },
        error,
      } = await client.auth.getUser();

      if (error) {
        console.warn('Could not get current user:', error.message);
        return null;
      }

      return user;
    } catch (error) {
      console.error('getCurrentUser error:', error);
      return null;
    }
  },

  async getSession() {
    const client = getSupabaseClient();

    if (!client) {
      return null;
    }

    try {
      const {
        data: { session },
        error,
      } = await client.auth.getSession();

      if (error) {
        console.warn('Could not get session:', error.message);
        return null;
      }

      return session;
    } catch (error) {
      console.error('getSession error:', error);
      return null;
    }
  },

  async signOut(): Promise<boolean> {
    const client = getSupabaseClient();

    if (!client) {
      return false;
    }

    try {
      const { error } = await client.auth.signOut();

      if (error) {
        console.error('Sign out error:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Sign out error:', error);
      return false;
    }
  },

  // ==========================================================================
  // PROFILE
  // ==========================================================================

  async getProfile(userId: string): Promise<UserProfile | null> {
    const client = getSupabaseClient();

    if (!client || !userId) {
      return null;
    }

    try {
      const { data, error } = await (client as any)
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        console.error('Profile fetch error:', error);
        return null;
      }

      if (!data) {
        return null;
      }

      return {
        id: data.id,
        fullName: data.full_name || 'Curious Mind',
        email: data.email || '',
        avatarInitials: data.avatar_initials || 'CM',
        headline: data.headline || 'Software Engineering Explorer',
        bio: data.bio || '',
        college: data.college || '',
        degree: data.degree || '',
        education: data.education || '',
        graduationYear: data.graduation_year || '2026',
        targetRole:
          data.target_role || 'Software Engineering Intern',
        careerInterests:
          data.career_interests || [
            'Frontend',
            'Backend',
            'AI Systems',
          ],
        currentSkills:
          data.current_skills || ['TypeScript', 'React'],
        careerGoal: data.career_goal || '',
        skillSwapActive: data.skill_swap_active ?? true,
        notificationEmail: data.notification_email ?? true,
        notificationTrialUpdates:
          data.notification_trial_updates ?? true,
      } as UserProfile;
    } catch (error) {
      console.error('getProfile error:', error);
      return null;
    }
  },

  async saveProfile(
    profile: Partial<UserProfile> & {
      id?: string;
      email?: string;
    }
  ): Promise<boolean> {
    const client = getSupabaseClient();

    if (!client) {
      return false;
    }

    try {
      // IMPORTANT:
      // Always use the authenticated Supabase user.
      const authenticatedUser = await this.getCurrentUser();

      if (!authenticatedUser) {
        console.error('Cannot save profile: user is not authenticated.');
        return false;
      }

      const userId = authenticatedUser.id;

      const dbPayload: Record<string, any> = {
        id: userId,
        updated_at: now(),
      };

      if (profile.fullName !== undefined) {
        dbPayload.full_name = profile.fullName;

        const initials = profile.fullName
          .split(/\s+/)
          .filter(Boolean)
          .map((name) => name.charAt(0))
          .join('')
          .toUpperCase()
          .slice(0, 3);

        dbPayload.avatar_initials = initials || 'CM';
      }

      if (profile.email !== undefined) {
        dbPayload.email = profile.email;
      }

      if (profile.headline !== undefined) {
        dbPayload.headline = profile.headline;
      }

      if (profile.bio !== undefined) {
        dbPayload.bio = profile.bio;
      }

      if (profile.college !== undefined) {
        dbPayload.college = profile.college;
      }

      if (profile.degree !== undefined) {
        dbPayload.degree = profile.degree;
      }

      if (profile.education !== undefined) {
        dbPayload.education = profile.education;
      }

      if (profile.graduationYear !== undefined) {
        dbPayload.graduation_year = profile.graduationYear;
      }

      if (profile.targetRole !== undefined) {
        dbPayload.target_role = profile.targetRole;
      }

      if (profile.careerInterests !== undefined) {
        dbPayload.career_interests = profile.careerInterests;
      }

      if (profile.currentSkills !== undefined) {
        dbPayload.current_skills = profile.currentSkills;
      }

      if (profile.careerGoal !== undefined) {
        dbPayload.career_goal = profile.careerGoal;
      }

      if (profile.skillSwapActive !== undefined) {
        dbPayload.skill_swap_active = profile.skillSwapActive;
      }

      if (profile.notificationEmail !== undefined) {
        dbPayload.notification_email =
          profile.notificationEmail;
      }

      if (profile.notificationTrialUpdates !== undefined) {
        dbPayload.notification_trial_updates =
          profile.notificationTrialUpdates;
      }

      const { error } = await (client as any)
        .from('profiles')
        .upsert(dbPayload, {
          onConflict: 'id',
        });

      if (error) {
        console.error('Profile save error:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Profile save error:', error);
      return false;
    }
  },

  async upsertProfile(
    userId: string,
    profile: Partial<UserProfile> & {
      email?: string;
    }
  ): Promise<boolean> {
    // Never allow a caller to save another user's profile.
    const currentUser = await this.getCurrentUser();

    if (!currentUser || currentUser.id !== userId) {
      console.error('Unauthorized profile update.');
      return false;
    }

    return this.saveProfile({
      ...profile,
      id: userId,
    });
  },

  // ==========================================================================
  // CLEAR USER DATA
  // ==========================================================================

  async clearUserData(userId: string): Promise<boolean> {
    const client = getSupabaseClient();

    if (!client || !userId) {
      return false;
    }

    const currentUser = await this.getCurrentUser();

    if (!currentUser || currentUser.id !== userId) {
      console.error('Unauthorized data deletion.');
      return false;
    }

    try {
      const tables = [
        'readiness_assessments',
        'trial_submissions',
        'evidence_items',
        'skill_progress_records',
        'career_trials',
        'opportunities',
      ];

      for (const table of tables) {
        const { error } = await (client as any)
          .from(table)
          .delete()
          .eq('user_id', userId);

        if (error) {
          console.error(
            `Failed clearing ${table}:`,
            error
          );
          return false;
        }
      }

      return true;
    } catch (error) {
      console.error('Clear user data error:', error);
      return false;
    }
  },

  // ==========================================================================
  // EVIDENCE FILE STORAGE
  // ==========================================================================

  async uploadEvidenceFile(
    userId: string,
    file: File
  ): Promise<{
    url: string;
    fileName: string;
    size: number;
    path: string;
  } | null> {
    const client = getSupabaseClient();

    if (!client || !userId || !file) {
      return null;
    }

    const currentUser = await this.getCurrentUser();

    if (!currentUser || currentUser.id !== userId) {
      console.error('Unauthorized file upload.');
      return null;
    }

    try {
      const cleanFileName =
        `${Date.now()}_${file.name.replace(
          /[^a-zA-Z0-9.-]/g,
          '_'
        )}`;

      const filePath = `${userId}/${cleanFileName}`;

      const { error: uploadError } =
        await client.storage
          .from('evidence-files')
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false,
          });

      if (uploadError) {
        console.error(
          'Storage upload failed:',
          uploadError
        );
        return null;
      }

      const { data: signedData, error: signedError } =
        await client.storage
          .from('evidence-files')
          .createSignedUrl(
            filePath,
            60 * 60 * 24 * 7
          );

      if (signedError) {
        console.error(
          'Signed URL error:',
          signedError
        );
      }

      return {
        url: signedData?.signedUrl || '',
        fileName: file.name,
        size: file.size,
        path: filePath,
      };
    } catch (error) {
      console.error('Storage upload error:', error);
      return null;
    }
  },

  // ==========================================================================
  // OPPORTUNITIES
  // ==========================================================================

  async getOpportunities(
    userId: string
  ): Promise<Opportunity[]> {
    return this.fetchOpportunities(userId);
  },

  async fetchOpportunities(
    userId: string
  ): Promise<Opportunity[]> {
    const client = getSupabaseClient();

    if (!client || !userId) {
      return [];
    }

    try {
      const currentUser = await this.getCurrentUser();

      if (!currentUser || currentUser.id !== userId) {
        return [];
      }

      const { data, error } = await (client as any)
        .from('opportunities')
        .select(`
          *,
          requirements:opportunity_requirements(*)
        `)
        .eq('user_id', userId)
        .order('created_at', {
          ascending: false,
        });

      if (error) {
        console.error(
          'Opportunity fetch error:',
          error
        );
        return [];
      }

      return safeArray(data).map((o: any) => ({
        id: o.id,
        userId: o.user_id,
        title: o.title || '',
        company: o.company || '',
        location: o.location || 'Remote',
        opportunityType:
          o.opportunity_type || 'Internship',
        sourceUrl: o.source_url || undefined,
        description: o.description || '',
        readinessScore: safeNumber(
          o.readiness_score
        ),
        status: o.status || 'Active',
        postedDate:
          o.posted_date || 'Recently',
        isPriority: Boolean(o.is_priority),
        createdAt:
          o.created_at || now(),

        requirements: safeArray(
          o.requirements
        ).map((r: any) => ({
          id: r.id,
          opportunityId:
            r.opportunity_id,
          skillName:
            r.skill_name || '',
          category:
            r.category || 'Technical',
          importance:
            r.importance || 'Important',
          description:
            r.description || '',
        })),
      })) as Opportunity[];
    } catch (error) {
      console.error(
        'fetchOpportunities error:',
        error
      );
      return [];
    }
  },

  async saveOpportunity(
    opportunity: Opportunity,
    optionalUserId?: string
  ): Promise<string | null> {
    const client = getSupabaseClient();

    if (!client) {
      return null;
    }

    try {
      const currentUser = await this.getCurrentUser();

      if (!currentUser) {
        return null;
      }

      const userId =
        currentUser.id;

      if (
        optionalUserId &&
        optionalUserId !== userId
      ) {
        console.error(
          'Unauthorized opportunity save.'
        );
        return null;
      }

      const validation =
        OpportunityFormSchema.safeParse({
          title: opportunity.title,
          company: opportunity.company,
          location:
            opportunity.location ||
            'Remote',
          opportunityType:
            opportunity.opportunityType ||
            'Internship',
          sourceUrl:
            opportunity.sourceUrl ||
            undefined,
          description:
            opportunity.description ||
            undefined,
          requirements:
            opportunity.requirements ||
            [],
        });

      if (!validation.success) {
        console.warn(
          'Opportunity validation failed:',
          validation.error.format()
        );
        return null;
      }

      const payload: Record<string, any> = {
        user_id: userId,
        title: opportunity.title,
        company: opportunity.company,
        location:
          opportunity.location ||
          'Remote',
        opportunity_type:
          opportunity.opportunityType ||
          'Internship',
        source_url:
          opportunity.sourceUrl ||
          null,
        description:
          opportunity.description ||
          '',
        readiness_score:
          safeNumber(
            opportunity.readinessScore
          ),
        status:
          opportunity.status ||
          'Active',
        posted_date:
          new Date()
            .toISOString()
            .split('T')[0],
        is_priority:
          Boolean(
            opportunity.isPriority
          ),
      };

      if (isUuid(opportunity.id)) {
        payload.id = opportunity.id;
      }

      const { data, error } =
        await (client as any)
          .from('opportunities')
          .upsert(payload)
          .select('id')
          .single();

      if (error || !data) {
        console.error(
          'Opportunity save error:',
          error
        );
        return null;
      }

      const opportunityId =
        data.id;

      await (client as any)
        .from(
          'opportunity_requirements'
        )
        .delete()
        .eq(
          'opportunity_id',
          opportunityId
        );

      if (
        opportunity.requirements &&
        opportunity.requirements.length
      ) {
        const requirements =
          opportunity.requirements.map(
            (r: any) => ({
              opportunity_id:
                opportunityId,
              skill_name:
                r.skillName,
              category:
                r.category ||
                'Technical',
              importance:
                r.importance ||
                'Important',
              description:
                r.description ||
                '',
            })
          );

        const {
          error: requirementError,
        } = await (client as any)
          .from(
            'opportunity_requirements'
          )
          .insert(requirements);

        if (requirementError) {
          console.error(
            'Requirement save error:',
            requirementError
          );
        }
      }

      return opportunityId;
    } catch (error) {
      console.error(
        'saveOpportunity error:',
        error
      );
      return null;
    }
  },

  async deleteOpportunity(
    opportunityId: string,
    optionalUserId?: string
  ): Promise<boolean> {
    const client = getSupabaseClient();

    if (!client || !opportunityId) {
      return false;
    }

    try {
      const currentUser =
        await this.getCurrentUser();

      if (!currentUser) {
        return false;
      }

      const userId =
        optionalUserId ||
        currentUser.id;

      if (userId !== currentUser.id) {
        return false;
      }

      const { error } =
        await (client as any)
          .from('opportunities')
          .delete()
          .eq('id', opportunityId)
          .eq('user_id', userId);

      if (error) {
        console.error(
          'Delete opportunity error:',
          error
        );
        return false;
      }

      return true;
    } catch (error) {
      console.error(
        'Delete opportunity error:',
        error
      );
      return false;
    }
  },

  // ==========================================================================
  // EVIDENCE
  // ==========================================================================

  async getEvidence(
    userId: string
  ): Promise<EvidenceItem[]> {
    return this.fetchEvidenceItems(userId);
  },

  async fetchEvidenceItems(
    userId: string
  ): Promise<EvidenceItem[]> {
    const client = getSupabaseClient();

    if (!client || !userId) {
      return [];
    }

    try {
      const currentUser =
        await this.getCurrentUser();

      if (
        !currentUser ||
        currentUser.id !== userId
      ) {
        return [];
      }

      const { data, error } =
        await (client as any)
          .from('evidence_items')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', {
            ascending: false,
          });

      if (error) {
        console.error(
          'Evidence fetch error:',
          error
        );
        return [];
      }

      return safeArray(data).map(
        (e: any) => ({
          id: e.id,
          userId: e.user_id,
          title: e.title || '',
          type: e.type as any,
          description:
            e.description || '',
          issuer:
            e.issuer || undefined,
          date:
            e.date || undefined,
          fileUrl:
            e.file_url ||
            undefined,
          fileName:
            e.file_name ||
            undefined,
          externalUrl:
            e.external_url ||
            undefined,
          skills:
            safeArray(e.skills),
          verificationStatus:
            e.verification_status as any,
          sourceTrialId:
            e.source_trial_id ||
            undefined,
          metrics:
            e.metrics ||
            undefined,
          createdAt:
            e.created_at ||
            now(),
        })
      ) as EvidenceItem[];
    } catch (error) {
      console.error(
        'fetchEvidenceItems error:',
        error
      );
      return [];
    }
  },

  async saveEvidence(
    evidence: EvidenceItem,
    optionalUserId?: string
  ): Promise<string | null> {
    return this.saveEvidenceItem(
      evidence,
      optionalUserId
    );
  },

  async saveEvidenceItem(
    evidence: EvidenceItem,
    optionalUserId?: string
  ): Promise<string | null> {
    const client = getSupabaseClient();

    if (!client) {
      return null;
    }

    try {
      const currentUser =
        await this.getCurrentUser();

      if (!currentUser) {
        return null;
      }

      const userId =
        currentUser.id;

      if (
        optionalUserId &&
        optionalUserId !== userId
      ) {
        return null;
      }

      const validation =
        EvidenceFormSchema.safeParse({
          title: evidence.title,
          type: evidence.type,
          description:
            evidence.description,
          issuer:
            evidence.issuer ||
            undefined,
          date:
            evidence.date ||
            undefined,
          externalUrl:
            evidence.externalUrl ||
            undefined,
          skills:
            evidence.skills ||
            [],
          metrics:
            evidence.metrics ||
            undefined,
        });

      if (!validation.success) {
        console.warn(
          'Evidence validation failed:',
          validation.error.format()
        );
        return null;
      }

      const parsedDate =
        evidence.date
          ? new Date(
              String(evidence.date)
            )
          : new Date();

      const date = Number.isNaN(
        parsedDate.getTime()
      )
        ? new Date()
            .toISOString()
            .split('T')[0]
        : parsedDate
            .toISOString()
            .split('T')[0];

      const payload: Record<string, any> = {
        user_id: userId,
        title: evidence.title,
        type: evidence.type,
        description:
          evidence.description ||
          '',
        issuer:
          evidence.issuer ||
          null,
        date,
        file_url:
          evidence.fileUrl ||
          null,
        file_name:
          evidence.fileName ||
          null,
        external_url:
          evidence.externalUrl ||
          null,
        skills:
          evidence.skills ||
          [],
        verification_status:
          evidence.verificationStatus ||
          'Pending',
        source_trial_id:
          evidence.sourceTrialId ||
          null,
        metrics:
          evidence.metrics ||
          null,
        confidence_score:
          evidence.verificationStatus ===
          'Verified'
            ? 0.95
            : 0.85,
        verification_source:
          evidence.verificationStatus ===
          'Verified'
            ? 'Proofly AI Evaluator'
            : 'Self-Reported',
      };

      if (
        evidence.sourceTrialId
      ) {
        const { data: existing } =
          await (client as any)
            .from('evidence_items')
            .select('id')
            .eq(
              'user_id',
              userId
            )
            .eq(
              'source_trial_id',
              evidence.sourceTrialId
            )
            .maybeSingle();

        if (existing?.id) {
          payload.id =
            existing.id;
        }
      }

      if (
        !payload.id &&
        isUuid(evidence.id)
      ) {
        payload.id =
          evidence.id;
      }

      const { data, error } =
        await (client as any)
          .from('evidence_items')
          .upsert(payload)
          .select('id')
          .single();

      if (error || !data) {
        console.error(
          'Evidence save error:',
          error
        );
        return null;
      }

      return data.id;
    } catch (error) {
      console.error(
        'saveEvidenceItem error:',
        error
      );
      return null;
    }
  },

  async deleteEvidence(
    evidenceId: string,
    optionalUserId?: string
  ): Promise<boolean> {
    return this.deleteEvidenceItem(
      evidenceId,
      optionalUserId
    );
  },

  async deleteEvidenceItem(
    evidenceId: string,
    optionalUserId?: string
  ): Promise<boolean> {
    const client = getSupabaseClient();

    if (!client || !evidenceId) {
      return false;
    }

    try {
      const currentUser =
        await this.getCurrentUser();

      if (!currentUser) {
        return false;
      }

      const userId =
        optionalUserId ||
        currentUser.id;

      if (
        userId !==
        currentUser.id
      ) {
        return false;
      }

      const { error } =
        await (client as any)
          .from('evidence_items')
          .delete()
          .eq('id', evidenceId)
          .eq(
            'user_id',
            userId
          );

      if (error) {
        console.error(
          'Delete evidence error:',
          error
        );
        return false;
      }

      return true;
    } catch (error) {
      console.error(
        'Delete evidence error:',
        error
      );
      return false;
    }
  },

  // ==========================================================================
  // READINESS ASSESSMENTS
  // ==========================================================================

  async getAssessments(
    userId: string
  ): Promise<
    Record<string, ReadinessAssessment>
  > {
    const client = getSupabaseClient();

    if (!client || !userId) {
      return {};
    }

    try {
      const currentUser =
        await this.getCurrentUser();

      if (
        !currentUser ||
        currentUser.id !== userId
      ) {
        return {};
      }

      const { data, error } =
        await (client as any)
          .from(
            'readiness_assessments'
          )
          .select('*')
          .eq(
            'user_id',
            userId
          );

      if (error) {
        console.error(
          'Assessment fetch error:',
          error
        );
        return {};
      }

      const result: Record<
        string,
        ReadinessAssessment
      > = {};

      safeArray(data).forEach(
        (row: any) => {
          result[
            row.opportunity_id
          ] = {
            id: row.id,
            opportunityId:
              row.opportunity_id,
            readinessScore:
              safeNumber(
                row.readiness_score
              ),
            evidenceMatchScore:
              safeNumber(
                row.evidence_match_score
              ),
            strongMatchesCount:
              safeNumber(
                row.strong_matches_count
              ),
            partialMatchesCount:
              safeNumber(
                row.partial_matches_count
              ),
            weakMatchesCount:
              safeNumber(
                row.weak_matches_count
              ),
            missingMatchesCount:
              safeNumber(
                row.missing_matches_count
              ),
            matches:
              safeArray(
                row.matches
              ),
            biggestGap:
              row.biggest_gap ||
              null,
            summaryAnalysis:
              row.summary_analysis ||
              '',
            updatedAt:
              row.updated_at ||
              now(),
          } as ReadinessAssessment;
        }
      );

      return result;
    } catch (error) {
      console.error(
        'getAssessments error:',
        error
      );
      return {};
    }
  },

  async saveAssessment(
    assessment: ReadinessAssessment,
    optionalUserId?: string
  ): Promise<boolean> {
    const client = getSupabaseClient();

    if (!client) {
      return false;
    }

    try {
      const currentUser =
        await this.getCurrentUser();

      if (!currentUser) {
        return false;
      }

      const userId =
        currentUser.id;

      if (
        optionalUserId &&
        optionalUserId !== userId
      ) {
        return false;
      }

      const payload = {
        opportunity_id:
          assessment.opportunityId,
        user_id: userId,
        readiness_score:
          assessment.readinessScore,
        evidence_match_score:
          assessment.evidenceMatchScore,
        strong_matches_count:
          assessment.strongMatchesCount,
        partial_matches_count:
          assessment.partialMatchesCount,
        weak_matches_count:
          assessment.weakMatchesCount,
        missing_matches_count:
          assessment.missingMatchesCount,
        matches:
          assessment.matches || [],
        biggest_gap:
          assessment.biggestGap ||
          null,
        summary_analysis:
          assessment.summaryAnalysis ||
          '',
        updated_at: now(),
      };

      const { error } =
        await (client as any)
          .from(
            'readiness_assessments'
          )
          .upsert(payload, {
            onConflict:
              'opportunity_id,user_id',
          });

      if (error) {
        console.error(
          'Assessment save error:',
          error
        );
        return false;
      }

      return true;
    } catch (error) {
      console.error(
        'saveAssessment error:',
        error
      );
      return false;
    }
  },

  // ==========================================================================
  // CAREER TRIALS
  // ==========================================================================

  async getTrials(
    userId: string
  ): Promise<CareerTrial[]> {
    const client = getSupabaseClient();

    if (!client || !userId) {
      return [];
    }

    try {
      const currentUser =
        await this.getCurrentUser();

      if (
        !currentUser ||
        currentUser.id !== userId
      ) {
        return [];
      }

      const { data, error } =
        await (client as any)
          .from('career_trials')
          .select(
            '*, trial_submissions(*)'
          )
          .eq(
            'user_id',
            userId
          )
          .order(
            'created_at',
            {
              ascending: true,
            }
          );

      if (error) {
        console.error(
          'Career trials fetch error:',
          error
        );
        return [];
      }

      return safeArray(data).map(
        (t: any) => {
          const submissions =
            safeArray(
              t.trial_submissions
            );

          const latest =
            submissions
              .slice()
              .sort(
                (
                  a: any,
                  b: any
                ) => {
                  const dateA =
                    new Date(
                      String(
                        a?.submitted_at ||
                          ''
                      )
                    ).getTime();

                  const dateB =
                    new Date(
                      String(
                        b?.submitted_at ||
                          ''
                      )
                    ).getTime();

                  return (
                    dateB - dateA
                  );
                }
              )[0];

          const trial: any = {
            id: t.id,
            opportunityId:
              t.opportunity_id ||
              '',
            opportunityTitle:
              t.opportunity_title ||
              '',
            opportunityCompany:
              t.opportunity_company ||
              '',
            targetSkill:
              t.target_skill ||
              '',
            title:
              t.title ||
              'Career Trial',
            description:
              t.description ||
              '',
            difficulty:
              t.difficulty ||
              'Intermediate',
            estimatedTime:
              t.estimated_time ||
              '45 mins',
            status:
              t.status ||
              'assigned',

            tasks:
              safeArray(
                t.tasks
              ),
            rubric:
              safeArray(
                t.rubric
              ),

            createdAt:
              t.created_at ||
              now(),

            submission:
              latest
                ? {
                    id:
                      latest.id,
                    trialId:
                      latest.trial_id,
                    submittedAt:
                      safeString(
                        latest.submitted_at,
                        now()
                      ),
                    notes:
                      latest.notes ||
                      '',
                    githubUrl:
                      latest.github_url ||
                      undefined,
                    codeSnippet:
                      latest.code_snippet ||
                      undefined,
                    fileAttachmentName:
                      latest.file_attachment_name ||
                      undefined,
                    score:
                      latest.score ??
                      undefined,
                    feedback:
                      latest.feedback ||
                      undefined,
                  }
                : undefined,
          };

          // These fields may or may not exist in your CareerTrial type.
          // Keep them at runtime without requiring them in ../types.
          if (
            t.score !== undefined
          ) {
            trial.score =
              t.score;
          }

          if (
            t.completed_at !==
            undefined
          ) {
            trial.completedAt =
              t.completed_at;
          }

          return trial as CareerTrial;
        }
      );
    } catch (error) {
      console.error(
        'getTrials error:',
        error
      );
      return [];
    }
  },

  async saveTrial(
    trial: CareerTrial,
    optionalUserId?: string
  ): Promise<boolean> {
    const client = getSupabaseClient();

    if (!client) {
      return false;
    }

    try {
      const currentUser =
        await this.getCurrentUser();

      if (!currentUser) {
        return false;
      }

      const userId =
        currentUser.id;

      if (
        optionalUserId &&
        optionalUserId !== userId
      ) {
        return false;
      }

      // CareerTrial in your current types.ts does not declare score/completedAt.
      // Access them safely through a runtime object.
      const trialData =
        trial as any;

      const payload: Record<
        string,
        any
      > = {
        user_id: userId,
        opportunity_id:
          trialData.opportunityId ||
          null,
        opportunity_title:
          trialData.opportunityTitle ||
          '',
        opportunity_company:
          trialData.opportunityCompany ||
          '',
        target_skill:
          trialData.targetSkill ||
          '',
        title:
          trialData.title ||
          'Career Trial',
        description:
          trialData.description ||
          '',
        difficulty:
          trialData.difficulty ||
          'Intermediate',
        estimated_time:
          trialData.estimatedTime ||
          '45 mins',
        status:
          trialData.status ||
          'assigned',
        score:
          trialData.score ??
          null,
        tasks:
          safeArray(
            trialData.tasks
          ),
        rubric:
          safeArray(
            trialData.rubric
          ),
        completed_at:
          trialData.completedAt ||
          null,
      };

      if (
        isUuid(trialData.id)
      ) {
        payload.id =
          trialData.id;
      }

      const { error } =
        await (client as any)
          .from('career_trials')
          .upsert(payload);

      if (error) {
        console.error(
          'Career trial save error:',
          error
        );
        return false;
      }

      return true;
    } catch (error) {
      console.error(
        'saveTrial error:',
        error
      );
      return false;
    }
  },

  // ==========================================================================
  // TRIAL SUBMISSIONS
  // ==========================================================================

  async saveTrialSubmission(
    submission: TrialSubmission,
    optionalUserId?: string
  ): Promise<boolean> {
    const client = getSupabaseClient();

    if (!client) {
      return false;
    }

    try {
      const currentUser =
        await this.getCurrentUser();

      if (!currentUser) {
        return false;
      }

      const userId =
        currentUser.id;

      if (
        optionalUserId &&
        optionalUserId !== userId
      ) {
        return false;
      }

      const payload: Record<
        string,
        any
      > = {
        trial_id:
          submission.trialId,
        user_id: userId,
        submitted_at:
          submission.submittedAt ||
          now(),
        notes:
          submission.notes ||
          '',
        github_url:
          submission.githubUrl ||
          null,
        code_snippet:
          submission.codeSnippet ||
          null,
        file_attachment_name:
          submission.fileAttachmentName ||
          null,
        score:
          submission.score ??
          null,
        feedback:
          submission.feedback ||
          {},
      };

      if (
        isUuid(submission.id)
      ) {
        payload.id =
          submission.id;
      }

      const { error } =
        await (client as any)
          .from(
            'trial_submissions'
          )
          .insert(payload);

      if (error) {
        console.error(
          'Trial submission save error:',
          error
        );
        return false;
      }

      return true;
    } catch (error) {
      console.error(
        'saveTrialSubmission error:',
        error
      );
      return false;
    }
  },

  // ==========================================================================
  // SKILL PROGRESS
  // ==========================================================================

  async saveProgressRecord(
    progress: SkillProgressRecord,
    optionalUserId?: string
  ): Promise<boolean> {
    const client = getSupabaseClient();

    if (!client) {
      return false;
    }

    try {
      const currentUser =
        await this.getCurrentUser();

      if (!currentUser) {
        return false;
      }

      const userId =
        currentUser.id;

      if (
        optionalUserId &&
        optionalUserId !== userId
      ) {
        return false;
      }

      const payload: Record<
        string,
        any
      > = {
        user_id: userId,
        skill_name:
          progress.skillName,
        previous_level:
          progress.previousLevel,
        current_level:
          progress.currentLevel,
        source:
          progress.source,
        date:
          progress.date ||
          now(),
      };

      if (
        isUuid(progress.id)
      ) {
        payload.id =
          progress.id;
      }

      const { error } =
        await (client as any)
          .from(
            'skill_progress_records'
          )
          .insert(payload);

      if (error) {
        console.error(
          'Skill progress save error:',
          error
        );
        return false;
      }

      return true;
    } catch (error) {
      console.error(
        'saveProgressRecord error:',
        error
      );
      return false;
    }
  },

  // ==========================================================================
  // SKILLSWAP VISIBILITY
  // ==========================================================================

  async setSkillSwapVisibility(
    userId: string,
    active: boolean
  ): Promise<boolean> {
    const client = getSupabaseClient();

    if (!client || !userId) {
      return false;
    }

    try {
      const currentUser =
        await this.getCurrentUser();

      if (
        !currentUser ||
        currentUser.id !== userId
      ) {
        return false;
      }

      const { error } =
        await (client as any)
          .from('profiles')
          .update({
            skill_swap_active:
              active,
            updated_at: now(),
          })
          .eq(
            'id',
            userId
          );

      if (error) {
        console.error(
          'SkillSwap visibility error:',
          error
        );
        return false;
      }

      // Keep peer record synchronized if it exists.
      await (client as any)
        .from('skill_swap_peers')
        .update({
          skill_swap_active:
            active,
        })
        .eq(
          'user_id',
          userId
        );

      return true;
    } catch (error) {
      console.error(
        'SkillSwap visibility error:',
        error
      );
      return false;
    }
  },

  // ==========================================================================
  // SKILLSWAP PEERS
  // ==========================================================================

  async getSkillSwapPeers(): Promise<
    SkillSwapPeer[]
  > {
    const client = getSupabaseClient();

    if (!client) {
      return [];
    }

    try {
      const currentUser =
        await this.getCurrentUser();

      const currentUserId =
        currentUser?.id;

      let query = (client as any)
        .from(
          'skill_swap_peers'
        )
        .select(
          `
          id,
          user_id,
          headline,
          college,
          compatibility_score,
          they_can_teach_you,
          you_can_teach_them,
          bio,
          looking_for,
          availability,
          status,
          last_active
        `
        )
        .eq(
          'status',
          'available'
        )
        .eq(
          'skill_swap_active',
          true
        );

      if (currentUserId) {
        query = query.neq(
          'user_id',
          currentUserId
        );
      }

      const {
        data,
        error,
      } = await query.order(
        'compatibility_score',
        {
          ascending: false,
        }
      );

      if (error) {
        console.error(
          'SkillSwap peer fetch error:',
          error
        );
        return [];
      }

      return safeArray(data).map(
        (p: any) => {
          const headline =
            p.headline || '';

          const initials =
            headline
              .split(/\s+/)
              .filter(Boolean)
              .map(
                (word: string) =>
                  word.charAt(0)
              )
              .join('')
              .slice(0, 2)
              .toUpperCase() ||
            'SP';

          return {
            id: p.id,
            userId: p.user_id,
            name:
              headline.split(
                ' @ '
              )[0] ||
              'SkillSwap Peer',
            headline,
            college:
              p.college || '',
            compatibilityScore:
              safeNumber(
                p.compatibility_score
              ),
            theyCanTeachYou:
              safeArray(
                p.they_can_teach_you
              ),
            youCanTeachThem:
              safeArray(
                p.you_can_teach_them
              ),
            bio:
              p.bio || '',
            lookingFor:
              p.looking_for || '',
            availability:
              p.availability ||
              '2 hrs/week',
            status:
              p.status ||
              'available',
            lastActive:
              p.last_active
                ? new Date(
                    String(
                      p.last_active
                    )
                  ).toLocaleDateString()
                : 'Recently',
            avatarInitials:
              initials,
          };
        }
      ) as SkillSwapPeer[];
    } catch (error) {
      console.error(
        'getSkillSwapPeers error:',
        error
      );
      return [];
    }
  },

  // ==========================================================================
  // CONTACT MESSAGES
  // ==========================================================================

  async submitContactMessage(
    message: ContactMessage
  ): Promise<boolean> {
    const client = getSupabaseClient();

    if (!client) {
      return false;
    }

    try {
      const currentUser =
        await this.getCurrentUser();

      const userId =
        currentUser?.id || null;

      const { error } =
        await (client as any)
          .from(
            'contact_messages'
          )
          .insert({
            user_id: userId,
            name:
              message.name,
            email:
              message.email,
            subject:
              message.subject,
            message:
              message.message,
          });

      if (error) {
        console.error(
          'Contact message error:',
          error
        );
        return false;
      }

      return true;
    } catch (error) {
      console.error(
        'Contact message error:',
        error
      );
      return false;
    }
  },

  // ==========================================================================
  // MENTOR REQUESTS
  // ==========================================================================

  async submitMentorRequest(
    request: MentorRequest,
    optionalUserId?: string
  ): Promise<boolean> {
    const client = getSupabaseClient();

    if (!client) {
      return false;
    }

    try {
      const currentUser =
        await this.getCurrentUser();

      if (!currentUser) {
        return false;
      }

      const userId =
        currentUser.id;

      if (
        optionalUserId &&
        optionalUserId !== userId
      ) {
        return false;
      }

      const requestData =
        request as any;

      const { error } =
        await (client as any)
          .from(
            'mentor_requests'
          )
          .insert({
            mentor_id:
              requestData.mentorId,
            student_id:
              userId,
            target_role:
              requestData.targetRole ||
              '',
            target_skill_gap:
              requestData.targetSkillGap ||
              '',
            message:
              requestData.message ||
              '',
            status:
              'Pending',
          });

      if (error) {
        console.error(
          'Mentor request error:',
          error
        );
        return false;
      }

      return true;
    } catch (error) {
      console.error(
        'Mentor request error:',
        error
      );
      return false;
    }
  },
};