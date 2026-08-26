import { getSupabaseClient, isSupabaseConfigured } from './supabaseClient';
import {
  UserProfile,
  Opportunity,
  EvidenceItem,
  ContactMessage,
} from '../types';

export const supabaseService = {
  // ----------------------------------------------------------------------------
  // Configuration & Auth Status
  // ----------------------------------------------------------------------------
  isConfigured(): boolean {
    return isSupabaseConfigured();
  },

  async getCurrentUser() {
    const client = getSupabaseClient();
    if (!client) return null;
    const { data: { user } } = await client.auth.getUser();
    return user;
  },

  // ----------------------------------------------------------------------------
  // Profile Service
  // ----------------------------------------------------------------------------
  async ensureProfile(userId: string, email?: string | null, fullName?: string | null): Promise<UserProfile | null> {
    const client = getSupabaseClient();
    if (!client) return null;

    const safeEmail = email || '';
    const safeName = fullName || safeEmail.split('@')[0] || 'Proofly User';
    const initials = safeName
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0])
      .join('')
      .toUpperCase() || 'PU';

    const { error } = await (client as any).from('profiles').upsert({
      id: userId,
      full_name: safeName,
      email: safeEmail,
      avatar_initials: initials,
    }, { onConflict: 'id' });

    if (error) {
      console.error('Profile setup error:', error);
      return null;
    }
    return this.getProfile(userId);
  },

  async getProfile(userId: string): Promise<UserProfile | null> {
    const client = getSupabaseClient();
    if (!client) return null;

    const { data, error } = await (client as any)
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error || !data) return null;

    return {
      id: data.id,
      fullName: data.full_name,
      email: data.email,
      avatarInitials: data.avatar_initials,
      headline: data.headline,
      bio: data.bio,
      college: data.college,
      degree: data.degree,
      education: data.education,
      graduationYear: data.graduation_year,
      targetRole: data.target_role,
      careerInterests: data.career_interests || [],
      currentSkills: data.current_skills || [],
      careerGoal: data.career_goal,
      skillSwapActive: data.skill_swap_active,
      notificationEmail: data.notification_email,
      notificationTrialUpdates: data.notification_trial_updates,
    };
  },

  async updateProfile(userId: string, updates: Partial<UserProfile>): Promise<boolean> {
    const client = getSupabaseClient();
    if (!client) return false;

    const dbPayload: Record<string, any> = {};
    if (updates.fullName !== undefined) dbPayload.full_name = updates.fullName;
    if (updates.headline !== undefined) dbPayload.headline = updates.headline;
    if (updates.bio !== undefined) dbPayload.bio = updates.bio;
    if (updates.college !== undefined) dbPayload.college = updates.college;
    if (updates.degree !== undefined) dbPayload.degree = updates.degree;
    if (updates.education !== undefined) dbPayload.education = updates.education;
    if (updates.graduationYear !== undefined) dbPayload.graduation_year = updates.graduationYear;
    if (updates.targetRole !== undefined) dbPayload.target_role = updates.targetRole;
    if (updates.careerInterests !== undefined) dbPayload.career_interests = updates.careerInterests;
    if (updates.currentSkills !== undefined) dbPayload.current_skills = updates.currentSkills;
    if (updates.careerGoal !== undefined) dbPayload.career_goal = updates.careerGoal;
    if (updates.skillSwapActive !== undefined) dbPayload.skill_swap_active = updates.skillSwapActive;
    if (updates.notificationEmail !== undefined) dbPayload.notification_email = updates.notificationEmail;
    if (updates.notificationTrialUpdates !== undefined) dbPayload.notification_trial_updates = updates.notificationTrialUpdates;

    const { error } = await (client as any)
      .from('profiles')
      .update(dbPayload)
      .eq('id', userId);

    return !error;
  },

  // ----------------------------------------------------------------------------
  // Storage Bucket Uploads
  // ----------------------------------------------------------------------------
  async uploadEvidenceFile(
    userId: string,
    file: File
  ): Promise<{ url: string; fileName: string; size: number; path: string } | null> {
    const client = getSupabaseClient();
    if (!client) return null;

    const cleanFileName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    const filePath = `${userId}/${cleanFileName}`;

    const { error: uploadError } = await client.storage
      .from('evidence-files')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) {
      console.error('Evidence file upload error:', uploadError);
      return null;
    }

    // Generate signed URL for private bucket
    const { data: signedData } = await client.storage
      .from('evidence-files')
      .createSignedUrl(filePath, 60 * 60 * 24 * 7); // 7 days

    return {
      url: signedData?.signedUrl || '',
      fileName: file.name,
      size: file.size,
      path: filePath,
    };
  },

  async uploadAvatar(userId: string, file: File): Promise<string | null> {
    const client = getSupabaseClient();
    if (!client) return null;

    const filePath = `${userId}/avatar_${Date.now()}.${file.name.split('.').pop()}`;

    const { error: uploadError } = await client.storage
      .from('avatars')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true,
      });

    if (uploadError) {
      console.error('Avatar upload error:', uploadError);
      return null;
    }

    const { data } = client.storage.from('avatars').getPublicUrl(filePath);
    return data.publicUrl;
  },

  // ----------------------------------------------------------------------------
  // Opportunities CRUD
  // ----------------------------------------------------------------------------
  async fetchOpportunities(userId: string): Promise<Opportunity[]> {
    const client = getSupabaseClient();
    if (!client) return [];

    const { data: opps, error } = await (client as any)
      .from('opportunities')
      .select(`
        *,
        requirements:opportunity_requirements(*)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error || !opps) return [];

    return opps.map((o: any) => ({
      id: o.id,
      userId: o.user_id,
      title: o.title,
      company: o.company,
      location: o.location,
      opportunityType: o.opportunity_type,
      sourceUrl: o.source_url,
      description: o.description,
      readinessScore: Number(o.readiness_score) || 0,
      status: o.status,
      postedDate: o.posted_date,
      isPriority: o.is_priority,
      createdAt: o.created_at,
      requirements: (o.requirements || []).map((r: any) => ({
        id: r.id,
        opportunityId: r.opportunity_id,
        skillName: r.skill_name,
        category: r.category,
        importance: r.importance,
        description: r.description,
      })),
    }));
  },

  async saveOpportunity(userId: string, opp: Opportunity): Promise<string | null> {
    const client = getSupabaseClient();
    if (!client) return null;

    const { data, error } = await (client as any)
      .from('opportunities')
      .upsert({
        id: opp.id.startsWith('opp_') ? undefined : opp.id,
        user_id: userId,
        title: opp.title,
        company: opp.company,
        location: opp.location || 'Remote',
        opportunity_type: opp.opportunityType || 'Internship',
        source_url: opp.sourceUrl || null,
        description: opp.description || '',
        readiness_score: opp.readinessScore || 0,
        status: opp.status || 'Active',
        posted_date: opp.postedDate || new Date().toISOString().split('T')[0],
        is_priority: Boolean(opp.isPriority),
      })
      .select('id')
      .single();

    if (error || !data) {
      console.error('Error saving opportunity to Supabase:', error);
      return null;
    }

    const savedOppId = data.id;

    // Save requirements
    if (opp.requirements && opp.requirements.length > 0) {
      await (client as any).from('opportunity_requirements').delete().eq('opportunity_id', savedOppId);

      await (client as any).from('opportunity_requirements').insert(
        opp.requirements.map((r) => ({
          opportunity_id: savedOppId,
          skill_name: r.skillName,
          category: r.category,
          importance: r.importance,
          description: r.description || '',
        }))
      );
    }

    return savedOppId;
  },

  // ----------------------------------------------------------------------------
  // Evidence Items CRUD
  // ----------------------------------------------------------------------------
  async fetchEvidenceItems(userId: string): Promise<EvidenceItem[]> {
    const client = getSupabaseClient();
    if (!client) return [];

    const { data, error } = await (client as any)
      .from('evidence_items')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error || !data) return [];

    return data.map((e: any) => ({
      id: e.id,
      userId: e.user_id,
      title: e.title,
      type: e.type as any,
      description: e.description,
      issuer: e.issuer || undefined,
      date: e.date,
      fileUrl: e.file_url || undefined,
      fileName: e.file_name || undefined,
      externalUrl: e.external_url || undefined,
      skills: e.skills || [],
      verificationStatus: e.verification_status as any,
      sourceTrialId: e.source_trial_id || undefined,
      metrics: e.metrics || undefined,
      createdAt: e.created_at,
    }));
  },

  async saveEvidenceItem(userId: string, evidence: EvidenceItem): Promise<string | null> {
    const client = getSupabaseClient();
    if (!client) return null;

    const { data, error } = await (client as any)
      .from('evidence_items')
      .upsert({
        id: evidence.id.startsWith('evi_') ? undefined : evidence.id,
        user_id: userId,
        title: evidence.title,
        type: evidence.type as any,
        description: evidence.description || '',
        issuer: evidence.issuer || null,
        date: evidence.date || new Date().toISOString().split('T')[0],
        file_url: evidence.fileUrl || null,
        file_name: evidence.fileName || null,
        external_url: evidence.externalUrl || null,
        skills: evidence.skills || [],
        verification_status: evidence.verificationStatus as any,
        source_trial_id: evidence.sourceTrialId || null,
        metrics: evidence.metrics || null,
        confidence_score: evidence.verificationStatus === 'Verified' ? 0.95 : 0.85,
        verification_source: evidence.verificationStatus === 'Verified' ? 'Proofly AI Evaluator' : 'Self-Reported',
      })
      .select('id')
      .single();

    if (error || !data) {
      console.error('Error saving evidence to Supabase:', error);
      return null;
    }

    return data.id;
  },

  // ----------------------------------------------------------------------------
  // Contact Message Submissions
  // ----------------------------------------------------------------------------
  async submitContactMessage(msg: ContactMessage): Promise<boolean> {
    const client = getSupabaseClient();
    if (!client) return false;

    const { error } = await (client as any).from('contact_messages').insert({
      name: msg.name,
      email: msg.email,
      subject: msg.subject,
      message: msg.message,
    });

    return !error;
  },
};
