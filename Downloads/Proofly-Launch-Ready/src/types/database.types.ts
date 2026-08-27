export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type EvidenceTypeEnum =
  | 'Certificate'
  | 'Project'
  | 'Resume'
  | 'Internship'
  | 'Experience'
  | 'GitHub'
  | 'Course'
  | 'Competition'
  | 'Other';

export type MatchStatusEnum = 'Strong' | 'Partial' | 'Weak' | 'Missing';

export type ImportanceEnum = 'Critical' | 'Important' | 'Bonus';

export type TrialDifficultyEnum = 'Beginner' | 'Intermediate' | 'Advanced';

export type TrialStatusEnum = 'assigned' | 'in_progress' | 'submitted' | 'completed';

export type OpportunityTypeEnum = 'Internship' | 'Full-time' | 'Co-op' | 'Part-time';

export type OpportunityStatusEnum = 'Active' | 'Interviewing' | 'Applied' | 'Archived';

export type VerificationStatusEnum = 'Verified' | 'Self-Reported' | 'In-Review';

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string;
          email: string;
          avatar_url: string | null;
          avatar_initials: string;
          headline: string;
          bio: string;
          college: string;
          degree: string;
          education: string;
          graduation_year: string;
          target_role: string;
          career_interests: string[];
          current_skills: string[];
          career_goal: string;
          skill_swap_active: boolean;
          notification_email: boolean;
          notification_trial_updates: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          full_name: string;
          email: string;
          avatar_url?: string | null;
          avatar_initials?: string;
          headline?: string;
          bio?: string;
          college?: string;
          degree?: string;
          education?: string;
          graduation_year?: string;
          target_role?: string;
          career_interests?: string[];
          current_skills?: string[];
          career_goal?: string;
          skill_swap_active?: boolean;
          notification_email?: boolean;
          notification_trial_updates?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string;
          email?: string;
          avatar_url?: string | null;
          avatar_initials?: string;
          headline?: string;
          bio?: string;
          college?: string;
          degree?: string;
          education?: string;
          graduation_year?: string;
          target_role?: string;
          career_interests?: string[];
          current_skills?: string[];
          career_goal?: string;
          skill_swap_active?: boolean;
          notification_email?: boolean;
          notification_trial_updates?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      opportunities: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          company: string;
          location: string;
          opportunity_type: OpportunityTypeEnum;
          source_url: string | null;
          description: string;
          readiness_score: number;
          status: OpportunityStatusEnum;
          posted_date: string;
          is_priority: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          company: string;
          location?: string;
          opportunity_type?: OpportunityTypeEnum;
          source_url?: string | null;
          description?: string;
          readiness_score?: number;
          status?: OpportunityStatusEnum;
          posted_date?: string;
          is_priority?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          company?: string;
          location?: string;
          opportunity_type?: OpportunityTypeEnum;
          source_url?: string | null;
          description?: string;
          readiness_score?: number;
          status?: OpportunityStatusEnum;
          posted_date?: string;
          is_priority?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'opportunities_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          }
        ];
      };
      opportunity_requirements: {
        Row: {
          id: string;
          opportunity_id: string;
          skill_name: string;
          category: string;
          importance: ImportanceEnum;
          description: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          opportunity_id: string;
          skill_name: string;
          category?: string;
          importance?: ImportanceEnum;
          description?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          opportunity_id?: string;
          skill_name?: string;
          category?: string;
          importance?: ImportanceEnum;
          description?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'opportunity_requirements_opportunity_id_fkey';
            columns: ['opportunity_id'];
            isOneToOne: false;
            referencedRelation: 'opportunities';
            referencedColumns: ['id'];
          }
        ];
      };
      evidence_items: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          type: EvidenceTypeEnum;
          description: string;
          issuer: string | null;
          date: string;
          file_url: string | null;
          file_name: string | null;
          file_size: number | null;
          file_type: string | null;
          external_url: string | null;
          skills: string[];
          verification_status: VerificationStatusEnum;
          source_trial_id: string | null;
          metrics: string | null;
          confidence_score: number;
          verification_source: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          type?: EvidenceTypeEnum;
          description?: string;
          issuer?: string | null;
          date?: string;
          file_url?: string | null;
          file_name?: string | null;
          file_size?: number | null;
          file_type?: string | null;
          external_url?: string | null;
          skills?: string[];
          verification_status?: VerificationStatusEnum;
          source_trial_id?: string | null;
          metrics?: string | null;
          confidence_score?: number;
          verification_source?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          type?: EvidenceTypeEnum;
          description?: string;
          issuer?: string | null;
          date?: string;
          file_url?: string | null;
          file_name?: string | null;
          file_size?: number | null;
          file_type?: string | null;
          external_url?: string | null;
          skills?: string[];
          verification_status?: VerificationStatusEnum;
          source_trial_id?: string | null;
          metrics?: string | null;
          confidence_score?: number;
          verification_source?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'evidence_items_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          }
        ];
      };
      career_trials: {
        Row: {
          id: string;
          user_id: string;
          opportunity_id: string | null;
          opportunity_title: string;
          opportunity_company: string;
          target_skill: string;
          title: string;
          description: string;
          difficulty: TrialDifficultyEnum;
          estimated_time: string;
          status: TrialStatusEnum;
          score: number | null;
          tasks: Json;
          rubric: Json;
          created_at: string;
          completed_at: string | null;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          opportunity_id?: string | null;
          opportunity_title: string;
          opportunity_company: string;
          target_skill: string;
          title: string;
          description: string;
          difficulty?: TrialDifficultyEnum;
          estimated_time?: string;
          status?: TrialStatusEnum;
          score?: number | null;
          tasks?: Json;
          rubric?: Json;
          created_at?: string;
          completed_at?: string | null;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          opportunity_id?: string | null;
          opportunity_title?: string;
          opportunity_company?: string;
          target_skill?: string;
          title?: string;
          description?: string;
          difficulty?: TrialDifficultyEnum;
          estimated_time?: string;
          status?: TrialStatusEnum;
          score?: number | null;
          tasks?: Json;
          rubric?: Json;
          created_at?: string;
          completed_at?: string | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'career_trials_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          }
        ];
      };
      trial_submissions: {
        Row: {
          id: string;
          trial_id: string;
          user_id: string;
          submitted_at: string;
          notes: string;
          github_url: string | null;
          code_snippet: string | null;
          file_attachment_name: string | null;
          file_attachment_url: string | null;
          score: number | null;
          feedback: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          trial_id: string;
          user_id: string;
          submitted_at?: string;
          notes?: string;
          github_url?: string | null;
          code_snippet?: string | null;
          file_attachment_name?: string | null;
          file_attachment_url?: string | null;
          score?: number | null;
          feedback?: Json;
          created_at?: string;
        };
        Update: {
          id?: string;
          trial_id?: string;
          user_id?: string;
          submitted_at?: string;
          notes?: string;
          github_url?: string | null;
          code_snippet?: string | null;
          file_attachment_name?: string | null;
          file_attachment_url?: string | null;
          score?: number | null;
          feedback?: Json;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'trial_submissions_trial_id_fkey';
            columns: ['trial_id'];
            isOneToOne: false;
            referencedRelation: 'career_trials';
            referencedColumns: ['id'];
          }
        ];
      };
      readiness_assessments: {
        Row: {
          id: string;
          opportunity_id: string;
          user_id: string;
          readiness_score: number;
          evidence_match_score: number;
          strong_matches_count: number;
          partial_matches_count: number;
          weak_matches_count: number;
          missing_matches_count: number;
          matches: Json;
          biggest_gap: Json;
          summary_analysis: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          opportunity_id: string;
          user_id: string;
          readiness_score?: number;
          evidence_match_score?: number;
          strong_matches_count?: number;
          partial_matches_count?: number;
          weak_matches_count?: number;
          missing_matches_count?: number;
          matches?: Json;
          biggest_gap?: Json;
          summary_analysis?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          opportunity_id?: string;
          user_id?: string;
          readiness_score?: number;
          evidence_match_score?: number;
          strong_matches_count?: number;
          partial_matches_count?: number;
          weak_matches_count?: number;
          missing_matches_count?: number;
          matches?: Json;
          biggest_gap?: Json;
          summary_analysis?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'readiness_assessments_opportunity_id_fkey';
            columns: ['opportunity_id'];
            isOneToOne: false;
            referencedRelation: 'opportunities';
            referencedColumns: ['id'];
          }
        ];
      };
      skill_swap_peers: {
        Row: {
          id: string;
          user_id: string;
          headline: string;
          college: string;
          compatibility_score: number;
          they_can_teach_you: string[];
          you_can_teach_them: string[];
          bio: string;
          looking_for: string;
          availability: string;
          status: 'available' | 'connected' | 'pending';
          last_active: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          headline?: string;
          college?: string;
          compatibility_score?: number;
          they_can_teach_you?: string[];
          you_can_teach_them?: string[];
          bio?: string;
          looking_for?: string;
          availability?: string;
          status?: 'available' | 'connected' | 'pending';
          last_active?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          headline?: string;
          college?: string;
          compatibility_score?: number;
          they_can_teach_you?: string[];
          you_can_teach_them?: string[];
          bio?: string;
          looking_for?: string;
          availability?: string;
          status?: 'available' | 'connected' | 'pending';
          last_active?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'skill_swap_peers_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          }
        ];
      };
      skill_progress_records: {
        Row: {
          id: string;
          user_id: string;
          skill_name: string;
          previous_level: string;
          current_level: string;
          source: string;
          date: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          skill_name: string;
          previous_level: string;
          current_level: string;
          source: string;
          date?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          skill_name?: string;
          previous_level?: string;
          current_level?: string;
          source?: string;
          date?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'skill_progress_records_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          }
        ];
      };
      contact_messages: {
        Row: {
          id: string;
          user_id: string | null;
          name: string;
          email: string;
          subject: string;
          message: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          name: string;
          email: string;
          subject: string;
          message: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          name?: string;
          email?: string;
          subject?: string;
          message?: string;
          created_at?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      seed_proofly_demo_data: {
        Args: { target_user_id: string };
        Returns: void;
      };
    };
    Enums: {
      evidence_type_enum: EvidenceTypeEnum;
      match_status_enum: MatchStatusEnum;
      importance_enum: ImportanceEnum;
      trial_difficulty_enum: TrialDifficultyEnum;
      trial_status_enum: TrialStatusEnum;
      opportunity_type_enum: OpportunityTypeEnum;
      opportunity_status_enum: OpportunityStatusEnum;
      verification_status_enum: VerificationStatusEnum;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};
