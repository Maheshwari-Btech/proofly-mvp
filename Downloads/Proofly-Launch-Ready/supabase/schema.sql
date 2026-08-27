-- PROOFLY CANONICAL DATABASE SCHEMA
-- This file mirrors the canonical 2026 migrations used by the application.
-- Apply migrations through Supabase CLI (preferred) or run this file on a
-- fresh Supabase project, then optionally run 20260101000004_seed_data.sql.
--
-- IMPORTANT: Do not combine this schema with the removed legacy 2024 schema.

-- ==============================================================================
-- PROOFLY DATABASE MIGRATION: 001 - CORE SCHEMA DEFINITIONS
-- Description: Creates extensions, custom types, and primary application tables
-- ==============================================================================

-- 1. Enable Required PostgreSQL Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Custom Enumerated Types
DO $$ BEGIN
  CREATE TYPE evidence_type_enum AS ENUM (
    'Certificate',
    'Project',
    'Resume',
    'Internship',
    'Experience',
    'GitHub',
    'Course',
    'Competition',
    'Other'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE match_status_enum AS ENUM (
    'Strong',
    'Partial',
    'Weak',
    'Missing'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE importance_enum AS ENUM (
    'Critical',
    'Important',
    'Bonus'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE trial_difficulty_enum AS ENUM (
    'Beginner',
    'Intermediate',
    'Advanced'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE trial_status_enum AS ENUM (
    'assigned',
    'in_progress',
    'submitted',
    'completed'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE opportunity_type_enum AS ENUM (
    'Internship',
    'Full-time',
    'Co-op',
    'Part-time'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE opportunity_status_enum AS ENUM (
    'Active',
    'Interviewing',
    'Applied',
    'Archived'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE verification_status_enum AS ENUM (
    'Verified',
    'Self-Reported',
    'In-Review'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- ==============================================================================
-- 3. Primary Tables
-- ==============================================================================

-- 3.1 User Profiles (Linked to Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  avatar_url TEXT,
  avatar_initials VARCHAR(4) DEFAULT 'JD',
  headline TEXT DEFAULT 'Software Engineering Student',
  bio TEXT DEFAULT '',
  college TEXT DEFAULT '',
  degree TEXT DEFAULT '',
  education TEXT DEFAULT '',
  graduation_year VARCHAR(10) DEFAULT '2026',
  target_role TEXT DEFAULT 'Full Stack Engineer',
  career_interests TEXT[] DEFAULT ARRAY['Frontend', 'Backend', 'AI Systems'],
  current_skills TEXT[] DEFAULT ARRAY['TypeScript', 'React', 'Node.js'],
  career_goal TEXT DEFAULT '',
  skill_swap_active BOOLEAN DEFAULT TRUE,
  notification_email BOOLEAN DEFAULT TRUE,
  notification_trial_updates BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 3.2 Opportunities (Job Postings / Roles tracked by students)
CREATE TABLE IF NOT EXISTS public.opportunities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  company TEXT NOT NULL,
  location TEXT NOT NULL DEFAULT 'Remote',
  opportunity_type opportunity_type_enum DEFAULT 'Internship' NOT NULL,
  source_url TEXT,
  description TEXT NOT NULL DEFAULT '',
  readiness_score NUMERIC(5, 2) DEFAULT 0.0 CHECK (readiness_score >= 0 AND readiness_score <= 100),
  status opportunity_status_enum DEFAULT 'Active' NOT NULL,
  posted_date DATE DEFAULT CURRENT_DATE NOT NULL,
  is_priority BOOLEAN DEFAULT FALSE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 3.3 Opportunity Requirements (Extracted competencies for each job)
CREATE TABLE IF NOT EXISTS public.opportunity_requirements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  opportunity_id UUID NOT NULL REFERENCES public.opportunities(id) ON DELETE CASCADE,
  skill_name TEXT NOT NULL,
  category VARCHAR(50) DEFAULT 'Technical' NOT NULL,
  importance importance_enum DEFAULT 'Important' NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 3.4 Evidence Items (Projects, Certificates, GitHub Repos, Coursework)
CREATE TABLE IF NOT EXISTS public.evidence_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  type evidence_type_enum DEFAULT 'Project' NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  issuer TEXT,
  date DATE DEFAULT CURRENT_DATE NOT NULL,
  file_url TEXT,
  file_name TEXT,
  file_size BIGINT,
  file_type VARCHAR(100),
  external_url TEXT,
  skills TEXT[] DEFAULT ARRAY[]::TEXT[] NOT NULL,
  verification_status verification_status_enum DEFAULT 'Self-Reported' NOT NULL,
  source_trial_id UUID,
  metrics TEXT,
  confidence_score NUMERIC(3, 2) DEFAULT 0.85 CHECK (confidence_score >= 0 AND confidence_score <= 1),
  verification_source TEXT DEFAULT 'Self-Reported',
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 3.5 Career Trials (Workplace micro-simulations to bridge gaps)
CREATE TABLE IF NOT EXISTS public.career_trials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  opportunity_id UUID REFERENCES public.opportunities(id) ON DELETE SET NULL,
  opportunity_title TEXT NOT NULL,
  opportunity_company TEXT NOT NULL,
  target_skill TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  difficulty trial_difficulty_enum DEFAULT 'Intermediate' NOT NULL,
  estimated_time VARCHAR(50) DEFAULT '45 mins' NOT NULL,
  status trial_status_enum DEFAULT 'assigned' NOT NULL,
  score INTEGER CHECK (score >= 0 AND score <= 100),
  tasks JSONB DEFAULT '[]'::JSONB NOT NULL,
  rubric JSONB DEFAULT '[]'::JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  completed_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 3.6 Trial Submissions (Code, notes, GitHub artifacts, and AI grading results)
CREATE TABLE IF NOT EXISTS public.trial_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trial_id UUID NOT NULL REFERENCES public.career_trials(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  submitted_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  notes TEXT DEFAULT '',
  github_url TEXT,
  code_snippet TEXT,
  file_attachment_name TEXT,
  file_attachment_url TEXT,
  score INTEGER CHECK (score >= 0 AND score <= 100),
  feedback JSONB DEFAULT '{}'::JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 3.7 Readiness Assessments (Calculated match matrix for an opportunity)
CREATE TABLE IF NOT EXISTS public.readiness_assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  opportunity_id UUID NOT NULL REFERENCES public.opportunities(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  readiness_score NUMERIC(5, 2) DEFAULT 0.0 CHECK (readiness_score >= 0 AND readiness_score <= 100) NOT NULL,
  evidence_match_score NUMERIC(5, 2) DEFAULT 0.0 CHECK (evidence_match_score >= 0 AND evidence_match_score <= 100) NOT NULL,
  strong_matches_count INTEGER DEFAULT 0 NOT NULL,
  partial_matches_count INTEGER DEFAULT 0 NOT NULL,
  weak_matches_count INTEGER DEFAULT 0 NOT NULL,
  missing_matches_count INTEGER DEFAULT 0 NOT NULL,
  matches JSONB DEFAULT '[]'::JSONB NOT NULL,
  biggest_gap JSONB DEFAULT '{}'::JSONB NOT NULL,
  summary_analysis TEXT DEFAULT '',
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 3.8 SkillSwap Peers (Peer-to-peer complementary skill matching)
CREATE TABLE IF NOT EXISTS public.skill_swap_peers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  headline TEXT NOT NULL DEFAULT '',
  college TEXT NOT NULL DEFAULT '',
  compatibility_score INTEGER DEFAULT 85 CHECK (compatibility_score >= 0 AND compatibility_score <= 100),
  they_can_teach_you TEXT[] DEFAULT ARRAY[]::TEXT[] NOT NULL,
  you_can_teach_them TEXT[] DEFAULT ARRAY[]::TEXT[] NOT NULL,
  bio TEXT DEFAULT '',
  looking_for TEXT DEFAULT '',
  availability VARCHAR(100) DEFAULT '2 hrs/week',
  status VARCHAR(20) DEFAULT 'available' CHECK (status IN ('available', 'connected', 'pending')),
  last_active TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 3.9 Skill Progress Tracking (Historical skill level elevations)
CREATE TABLE IF NOT EXISTS public.skill_progress_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  skill_name TEXT NOT NULL,
  previous_level VARCHAR(20) NOT NULL CHECK (previous_level IN ('Novice', 'Developing', 'Proficient', 'Advanced')),
  current_level VARCHAR(20) NOT NULL CHECK (current_level IN ('Novice', 'Developing', 'Proficient', 'Advanced')),
  source TEXT NOT NULL,
  date DATE DEFAULT CURRENT_DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 3.10 Contact / Support Messages
CREATE TABLE IF NOT EXISTS public.contact_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ==============================================================================
-- 4. High Performance Indexes
-- ==============================================================================

CREATE INDEX IF NOT EXISTS idx_opportunities_user_id ON public.opportunities(user_id);
CREATE INDEX IF NOT EXISTS idx_opportunities_status ON public.opportunities(status);
CREATE INDEX IF NOT EXISTS idx_opportunity_requirements_opp_id ON public.opportunity_requirements(opportunity_id);
CREATE INDEX IF NOT EXISTS idx_evidence_items_user_id ON public.evidence_items(user_id);
CREATE INDEX IF NOT EXISTS idx_evidence_items_type ON public.evidence_items(type);
CREATE INDEX IF NOT EXISTS idx_evidence_items_skills ON public.evidence_items USING GIN(skills);
CREATE INDEX IF NOT EXISTS idx_career_trials_user_id ON public.career_trials(user_id);
CREATE INDEX IF NOT EXISTS idx_career_trials_status ON public.career_trials(status);
CREATE INDEX IF NOT EXISTS idx_trial_submissions_trial_id ON public.trial_submissions(trial_id);
CREATE INDEX IF NOT EXISTS idx_trial_submissions_user_id ON public.trial_submissions(user_id);
CREATE INDEX IF NOT EXISTS idx_readiness_assessments_opp_id ON public.readiness_assessments(opportunity_id);
CREATE INDEX IF NOT EXISTS idx_readiness_assessments_user_id ON public.readiness_assessments(user_id);
CREATE INDEX IF NOT EXISTS idx_skill_swap_peers_user_id ON public.skill_swap_peers(user_id);
CREATE INDEX IF NOT EXISTS idx_skill_swap_peers_status ON public.skill_swap_peers(status);
CREATE INDEX IF NOT EXISTS idx_skill_progress_user_id ON public.skill_progress_records(user_id);

-- ==============================================================================
-- PROOFLY DATABASE MIGRATION: 002 - STORAGE BUCKETS & ROW LEVEL SECURITY (RLS)
-- Description: Creates storage buckets and defines granular RLS security policies
-- ==============================================================================

-- ==============================================================================
-- 1. Storage Buckets Creation
-- ==============================================================================

-- 1.1 Evidence Files Bucket (Resumes, Project PDFs, Certifications, Screenshots)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'evidence-files',
  'evidence-files',
  false, -- Private bucket: access controlled via authenticated RLS
  26214400, -- 25 MB max size
  ARRAY[
    'application/pdf',
    'image/png',
    'image/jpeg',
    'image/webp',
    'application/zip',
    'text/plain',
    'application/json',
    'text/markdown'
  ]
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- 1.2 Career Trial Artifacts Bucket (Micro-simulation submissions, code snapshots)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'trial-artifacts',
  'trial-artifacts',
  false, -- Private bucket
  52428800, -- 50 MB max size
  ARRAY[
    'application/zip',
    'application/x-tar',
    'application/gzip',
    'text/plain',
    'text/typescript',
    'text/javascript',
    'application/json',
    'image/png',
    'image/jpeg'
  ]
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- 1.3 Avatars Bucket (User Profile Images)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatars',
  'avatars',
  true, -- Public for avatar display
  5242880, -- 5 MB max size
  ARRAY[
    'image/png',
    'image/jpeg',
    'image/webp',
    'image/svg+xml'
  ]
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- ==============================================================================
-- 2. Enable Row Level Security (RLS) on All Tables
-- ==============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.opportunity_requirements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.evidence_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.career_trials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trial_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.readiness_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skill_swap_peers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skill_progress_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

-- ==============================================================================
-- 3. Row Level Security (RLS) Table Policies
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 3.1 Profiles Policies
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can view active skill swap profiles" ON public.profiles;
CREATE POLICY "Users can view active skill swap profiles"
  ON public.profiles FOR SELECT
  USING (skill_swap_active = true);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- ------------------------------------------------------------------------------
-- 3.2 Opportunities Policies
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Users can view own opportunities" ON public.opportunities;
CREATE POLICY "Users can view own opportunities"
  ON public.opportunities FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own opportunities" ON public.opportunities;
CREATE POLICY "Users can insert own opportunities"
  ON public.opportunities FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own opportunities" ON public.opportunities;
CREATE POLICY "Users can update own opportunities"
  ON public.opportunities FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own opportunities" ON public.opportunities;
CREATE POLICY "Users can delete own opportunities"
  ON public.opportunities FOR DELETE
  USING (auth.uid() = user_id);

-- ------------------------------------------------------------------------------
-- 3.3 Opportunity Requirements Policies
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Users can view requirements of own opportunities" ON public.opportunity_requirements;
CREATE POLICY "Users can view requirements of own opportunities"
  ON public.opportunity_requirements FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.opportunities o
      WHERE o.id = opportunity_requirements.opportunity_id
        AND o.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can insert requirements into own opportunities" ON public.opportunity_requirements;
CREATE POLICY "Users can insert requirements into own opportunities"
  ON public.opportunity_requirements FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.opportunities o
      WHERE o.id = opportunity_requirements.opportunity_id
        AND o.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can update requirements of own opportunities" ON public.opportunity_requirements;
CREATE POLICY "Users can update requirements of own opportunities"
  ON public.opportunity_requirements FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.opportunities o
      WHERE o.id = opportunity_requirements.opportunity_id
        AND o.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can delete requirements of own opportunities" ON public.opportunity_requirements;
CREATE POLICY "Users can delete requirements of own opportunities"
  ON public.opportunity_requirements FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.opportunities o
      WHERE o.id = opportunity_requirements.opportunity_id
        AND o.user_id = auth.uid()
    )
  );

-- ------------------------------------------------------------------------------
-- 3.4 Evidence Items Policies
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Users can view own evidence" ON public.evidence_items;
CREATE POLICY "Users can view own evidence"
  ON public.evidence_items FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own evidence" ON public.evidence_items;
CREATE POLICY "Users can insert own evidence"
  ON public.evidence_items FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own evidence" ON public.evidence_items;
CREATE POLICY "Users can update own evidence"
  ON public.evidence_items FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own evidence" ON public.evidence_items;
CREATE POLICY "Users can delete own evidence"
  ON public.evidence_items FOR DELETE
  USING (auth.uid() = user_id);

-- ------------------------------------------------------------------------------
-- 3.5 Career Trials Policies
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Users can view own career trials" ON public.career_trials;
CREATE POLICY "Users can view own career trials"
  ON public.career_trials FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own career trials" ON public.career_trials;
CREATE POLICY "Users can insert own career trials"
  ON public.career_trials FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own career trials" ON public.career_trials;
CREATE POLICY "Users can update own career trials"
  ON public.career_trials FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own career trials" ON public.career_trials;
CREATE POLICY "Users can delete own career trials"
  ON public.career_trials FOR DELETE
  USING (auth.uid() = user_id);

-- ------------------------------------------------------------------------------
-- 3.6 Trial Submissions Policies
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Users can view own trial submissions" ON public.trial_submissions;
CREATE POLICY "Users can view own trial submissions"
  ON public.trial_submissions FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own trial submissions" ON public.trial_submissions;
CREATE POLICY "Users can insert own trial submissions"
  ON public.trial_submissions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own trial submissions" ON public.trial_submissions;
CREATE POLICY "Users can update own trial submissions"
  ON public.trial_submissions FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ------------------------------------------------------------------------------
-- 3.7 Readiness Assessments Policies
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Users can view own assessments" ON public.readiness_assessments;
CREATE POLICY "Users can view own assessments"
  ON public.readiness_assessments FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own assessments" ON public.readiness_assessments;
CREATE POLICY "Users can insert own assessments"
  ON public.readiness_assessments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own assessments" ON public.readiness_assessments;
CREATE POLICY "Users can update own assessments"
  ON public.readiness_assessments FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own assessments" ON public.readiness_assessments;
CREATE POLICY "Users can delete own assessments"
  ON public.readiness_assessments FOR DELETE
  USING (auth.uid() = user_id);

-- ------------------------------------------------------------------------------
-- 3.8 SkillSwap Peers Policies
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Authenticated users can view available skill swap peers" ON public.skill_swap_peers;
CREATE POLICY "Authenticated users can view available skill swap peers"
  ON public.skill_swap_peers FOR SELECT
  TO authenticated
  USING (status IN ('available', 'connected', 'pending'));

DROP POLICY IF EXISTS "Users can insert own skill swap peer profile" ON public.skill_swap_peers;
CREATE POLICY "Users can insert own skill swap peer profile"
  ON public.skill_swap_peers FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own skill swap peer profile" ON public.skill_swap_peers;
CREATE POLICY "Users can update own skill swap peer profile"
  ON public.skill_swap_peers FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ------------------------------------------------------------------------------
-- 3.9 Skill Progress Records Policies
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Users can view own skill progress" ON public.skill_progress_records;
CREATE POLICY "Users can view own skill progress"
  ON public.skill_progress_records FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own skill progress" ON public.skill_progress_records;
CREATE POLICY "Users can insert own skill progress"
  ON public.skill_progress_records FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ------------------------------------------------------------------------------
-- 3.10 Contact Messages Policies
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Anyone can submit a contact message" ON public.contact_messages;
CREATE POLICY "Anyone can submit a contact message"
  ON public.contact_messages FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "Users can view own submitted contact messages" ON public.contact_messages;
CREATE POLICY "Users can view own submitted contact messages"
  ON public.contact_messages FOR SELECT
  USING (auth.uid() = user_id);

-- ==============================================================================
-- 4. Storage Row Level Security (RLS) Policies
-- ==============================================================================

-- 4.1 Evidence Files: Allow authenticated users to upload to their folder ({user_id}/*)
DROP POLICY IF EXISTS "Users can upload evidence files" ON storage.objects;
CREATE POLICY "Users can upload evidence files"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'evidence-files' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- 4.2 Evidence Files: Allow users to view their own uploaded files
DROP POLICY IF EXISTS "Users can read own evidence files" ON storage.objects;
CREATE POLICY "Users can read own evidence files"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'evidence-files' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- 4.3 Evidence Files: Allow users to update/delete their own files
DROP POLICY IF EXISTS "Users can update own evidence files" ON storage.objects;
CREATE POLICY "Users can update own evidence files"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'evidence-files' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS "Users can delete own evidence files" ON storage.objects;
CREATE POLICY "Users can delete own evidence files"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'evidence-files' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- 4.4 Trial Artifacts: Upload and Read access scoped by user folder
DROP POLICY IF EXISTS "Users can upload trial artifacts" ON storage.objects;
CREATE POLICY "Users can upload trial artifacts"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'trial-artifacts' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS "Users can read own trial artifacts" ON storage.objects;
CREATE POLICY "Users can read own trial artifacts"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'trial-artifacts' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- 4.5 Avatars: Public read for everyone, write only for authenticated owner
DROP POLICY IF EXISTS "Public avatar access" ON storage.objects;
CREATE POLICY "Public avatar access"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

DROP POLICY IF EXISTS "Users can upload own avatar" ON storage.objects;
CREATE POLICY "Users can upload own avatar"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'avatars' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS "Users can update own avatar" ON storage.objects;
CREATE POLICY "Users can update own avatar"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'avatars' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- ==============================================================================
-- PROOFLY DATABASE MIGRATION: 003 - TRIGGERS, FUNCTIONS & STORED PROCEDURES
-- Description: Automated timestamp triggers, auth hooks, and evidence conversions
-- ==============================================================================

-- ==============================================================================
-- 1. Automatic Timestamp Maintenance Function
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Attach updated_at triggers to relevant tables
DROP TRIGGER IF EXISTS trg_profiles_updated_at ON public.profiles;
CREATE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS trg_opportunities_updated_at ON public.opportunities;
CREATE TRIGGER trg_opportunities_updated_at
  BEFORE UPDATE ON public.opportunities
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS trg_evidence_items_updated_at ON public.evidence_items;
CREATE TRIGGER trg_evidence_items_updated_at
  BEFORE UPDATE ON public.evidence_items
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS trg_career_trials_updated_at ON public.career_trials;
CREATE TRIGGER trg_career_trials_updated_at
  BEFORE UPDATE ON public.career_trials
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS trg_readiness_assessments_updated_at ON public.readiness_assessments;
CREATE TRIGGER trg_readiness_assessments_updated_at
  BEFORE UPDATE ON public.readiness_assessments
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- ==============================================================================
-- 2. New User Sign-Up Auth Hook (auth.users -> public.profiles)
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  extracted_name TEXT;
  extracted_initials VARCHAR(4);
BEGIN
  -- Extract display name or fallback to email prefix
  extracted_name := COALESCE(
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'name',
    SPLIT_PART(NEW.email, '@', 1)
  );

  -- Compute initials
  extracted_initials := UPPER(
    SUBSTRING(SPLIT_PART(extracted_name, ' ', 1) FROM 1 FOR 1) ||
    COALESCE(SUBSTRING(SPLIT_PART(extracted_name, ' ', 2) FROM 1 FOR 1), '')
  );

  IF extracted_initials = '' OR extracted_initials IS NULL THEN
    extracted_initials := 'ME';
  END IF;

  INSERT INTO public.profiles (
    id,
    full_name,
    email,
    avatar_url,
    avatar_initials,
    headline,
    bio,
    college,
    degree,
    education,
    graduation_year,
    target_role,
    career_interests,
    current_skills,
    skill_swap_active,
    notification_email,
    notification_trial_updates
  )
  VALUES (
    NEW.id,
    extracted_name,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', NULL),
    extracted_initials,
    COALESCE(NEW.raw_user_meta_data->>'headline', 'Software Engineering Student'),
    COALESCE(NEW.raw_user_meta_data->>'bio', 'Passionate developer building verifiable career proof through projects and simulations.'),
    COALESCE(NEW.raw_user_meta_data->>'college', 'University'),
    COALESCE(NEW.raw_user_meta_data->>'degree', 'B.S. Computer Science'),
    COALESCE(NEW.raw_user_meta_data->>'education', 'B.S. in Computer Science'),
    COALESCE(NEW.raw_user_meta_data->>'graduation_year', '2026'),
    COALESCE(NEW.raw_user_meta_data->>'target_role', 'Full Stack Engineer'),
    ARRAY['Frontend', 'Backend', 'AI Systems'],
    ARRAY['TypeScript', 'React', 'Node.js'],
    TRUE,
    TRUE,
    TRUE
  )
  ON CONFLICT (id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    email = EXCLUDED.email;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_catalog;

-- Trigger firing on every new Supabase Auth User registration
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ==============================================================================
-- 3. Trial Completion to Verified Evidence Auto-Bridge
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.handle_trial_completion_evidence()
RETURNS TRIGGER AS $$
BEGIN
  IF (NEW.status = 'completed' AND (OLD.status IS DISTINCT FROM 'completed') AND NEW.score >= 70) THEN
    -- Idempotent completion hook: do not create duplicate proof if the
    -- application has already saved the generated evidence artifact.
    IF NOT EXISTS (
      SELECT 1
      FROM public.evidence_items e
      WHERE e.user_id = NEW.user_id
        AND e.source_trial_id = NEW.id
    ) THEN
      INSERT INTO public.evidence_items (
        user_id, title, type, description, issuer, date,
        external_url, skills, verification_status, source_trial_id,
        metrics, confidence_score, verification_source
      )
      VALUES (
        NEW.user_id,
        'Career Trial: ' || NEW.title,
        'Project',
        'Completed workplace micro-simulation with a score of ' || NEW.score || '/100. Evaluated against ' || NEW.target_skill || ' production benchmarks.',
        NEW.opportunity_company || ' Simulation',
        CURRENT_DATE,
        COALESCE(NEW.tasks->0->>'outputUrl', 'https://proofly.app/evaluations/trial'),
        ARRAY[NEW.target_skill, 'TypeScript', 'System Design', 'Error Handling'],
        'Verified',
        NEW.id,
        'Evaluated Score: ' || NEW.score || '/100 (Verified via Proofly AI Evaluator)',
        0.95,
        'Proofly AI Evaluator'
      );

      INSERT INTO public.skill_progress_records (
        user_id, skill_name, previous_level, current_level, source, date
      )
      VALUES (
        NEW.user_id,
        NEW.target_skill,
        'Developing',
        'Proficient',
        'Completed Career Trial: ' || NEW.title,
        CURRENT_DATE
      );
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_catalog;

DROP TRIGGER IF EXISTS trg_career_trials_auto_evidence ON public.career_trials;
CREATE TRIGGER trg_career_trials_auto_evidence
  AFTER UPDATE OF status, score ON public.career_trials
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_trial_completion_evidence();

-- ==============================================================================
-- PROOFLY DATABASE MIGRATION: 004 - SEED DATA FIXTURES
-- Description: Provides realistic reference seed records and setup helper function
-- ==============================================================================

-- Helper stored procedure to populate initial demo data for a given authenticated user ID
CREATE OR REPLACE FUNCTION public.seed_proofly_demo_data(target_user_id UUID)
RETURNS VOID AS $$
DECLARE
  opp_vercel_id UUID := gen_random_uuid();
  opp_linear_id UUID := gen_random_uuid();
  opp_anthropic_id UUID := gen_random_uuid();
  trial_vercel_id UUID := gen_random_uuid();
  trial_linear_id UUID := gen_random_uuid();
BEGIN
  -- 1. Update or create Profile
  INSERT INTO public.profiles (
    id,
    full_name,
    email,
    avatar_initials,
    headline,
    bio,
    college,
    degree,
    education,
    graduation_year,
    target_role,
    career_interests,
    current_skills,
    career_goal,
    skill_swap_active
  )
  VALUES (
    target_user_id,
    'Jordan Davis',
    'jordan.davis@stanford.edu',
    'JD',
    'Junior CS @ Stanford | Building Full-Stack & AI Systems',
    'Passionate about evidence-first engineering. Former intern at DevLab, focused on TypeScript, React 19, and distributed frontends.',
    'Stanford University',
    'B.S. in Computer Science',
    'B.S. in Computer Science (Junior)',
    '2026',
    'Frontend / Full-Stack Engineer Intern',
    ARRAY['Frontend Systems', 'Next.js', 'Developer Tools', 'AI Workflows'],
    ARRAY['TypeScript', 'React', 'Tailwind CSS', 'Node.js', 'REST APIs', 'Git', 'Next.js'],
    'Land a high-impact Frontend or Full-Stack Internship for Summer 2026 at a product-focused tech company.',
    TRUE
  )
  ON CONFLICT (id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    headline = EXCLUDED.headline,
    college = EXCLUDED.college;

  -- 2. Insert Evidence Items
  INSERT INTO public.evidence_items (
    id,
    user_id,
    title,
    type,
    description,
    issuer,
    date,
    external_url,
    skills,
    verification_status,
    confidence_score,
    metrics
  )
  VALUES
    (
      gen_random_uuid(),
      target_user_id,
      'DevFlow: Collaborative Markdown Editor',
      'Project',
      'Real-time collaborative text editor built with TypeScript, React, and WebSockets. Implemented custom CRDT conflict resolution.',
      'Personal Project',
      '2025-11-15',
      'https://github.com/jordandavis/devflow-editor',
      ARRAY['TypeScript', 'React', 'WebSockets', 'Tailwind CSS', 'State Management'],
      'Verified',
      0.95,
      '1.2k GitHub Stars, 60fps render cycle'
    ),
    (
      gen_random_uuid(),
      target_user_id,
      'Meta Frontend Developer Professional Certificate',
      'Certificate',
      'Completed 9-course specialization covering advanced React, responsive UI design, version control, and UX principles.',
      'Meta via Coursera',
      '2025-08-20',
      'https://coursera.org/verify/meta-frontend-jd',
      ARRAY['React', 'JavaScript', 'HTML/CSS', 'UI Architecture', 'Testing'],
      'Verified',
      0.98,
      'Grade: 98.4%'
    ),
    (
      gen_random_uuid(),
      target_user_id,
      'CS 142: Web Applications Coursework & Labs',
      'Course',
      'Stanford CS coursework covering full-stack web architecture, database transactions, session management, and DOM optimization.',
      'Stanford University',
      '2025-12-10',
      'https://web.stanford.edu/class/cs142',
      ARRAY['React', 'Node.js', 'Express', 'MongoDB', 'REST APIs'],
      'Verified',
      0.90,
      'Final Project Grade: A+'
    ),
    (
      gen_random_uuid(),
      target_user_id,
      'Open Source Contributions to shadcn/ui and Lucide',
      'GitHub',
      'Authored 4 pull requests fixing accessibility focus rings and adding multi-select combo-box components.',
      'GitHub Open Source',
      '2026-01-18',
      'https://github.com/shadcn-ui/ui/pull/8841',
      ARRAY['TypeScript', 'Accessibility (a11y)', 'Tailwind CSS', 'Component Design'],
      'Verified',
      0.94,
      '4 PRs merged into main'
    );

  -- 3. Insert Opportunities
  INSERT INTO public.opportunities (
    id,
    user_id,
    title,
    company,
    location,
    opportunity_type,
    source_url,
    description,
    readiness_score,
    status,
    posted_date,
    is_priority
  )
  VALUES
    (
      opp_vercel_id,
      target_user_id,
      'Frontend Software Engineer Intern (Summer 2026)',
      'Vercel',
      'San Francisco, CA (Hybrid / Remote)',
      'Internship',
      'https://vercel.com/careers/frontend-intern-2026',
      'We are looking for a high-energy frontend engineering intern to join the Vercel Dashboard team. You will build world-class web experiences with Next.js, TypeScript, React Server Components, and Edge Middleware.',
      82.0,
      'Active',
      CURRENT_DATE - 3,
      TRUE
    ),
    (
      opp_linear_id,
      target_user_id,
      'Product Engineer Intern',
      'Linear',
      'San Francisco, CA / Remote',
      'Internship',
      'https://linear.app/careers/product-engineer-intern',
      'Join Linear to build high-performance, keyboard-first issue tracking software. Requires deep TypeScript and client-side state architecture expertise.',
      74.5,
      'Interviewing',
      CURRENT_DATE - 7,
      TRUE
    ),
    (
      opp_anthropic_id,
      target_user_id,
      'AI Applications & Interfaces Engineer',
      'Anthropic',
      'San Francisco, CA',
      'Full-time',
      'https://anthropic.com/careers/ai-ui-engineer',
      'Design and engineer state-of-the-art interactive AI user interfaces, prompt tooling, and evaluation dashboards for Claude models.',
      68.0,
      'Active',
      CURRENT_DATE - 12,
      FALSE
    );

  -- 4. Insert Opportunity Requirements for Vercel
  INSERT INTO public.opportunity_requirements (
    opportunity_id,
    skill_name,
    category,
    importance,
    description
  )
  VALUES
    (opp_vercel_id, 'TypeScript & Modern ECMAScript', 'Technical', 'Critical', 'Deep understanding of TypeScript interfaces, type narrowing, and strict typing.'),
    (opp_vercel_id, 'React 19 & Component Architecture', 'Technical', 'Critical', 'Building reusable, responsive UI components with clean state and hook abstractions.'),
    (opp_vercel_id, 'Next.js App Router & Server Components', 'Technical', 'Important', 'Experience with React Server Components, streaming SSR, and route handlers.'),
    (opp_vercel_id, 'Performance Optimization & Core Web Vitals', 'Technical', 'Important', 'Profiling bundle sizes, LCP, INP, and dynamic code splitting.'),
    (opp_vercel_id, 'Tailwind CSS & Design Systems', 'Tool', 'Important', 'Rapid UI development with modern CSS utility architectures and accessibility.'),
    (opp_vercel_id, 'Testing & Automated CI (Vitest/Playwright)', 'Technical', 'Bonus', 'Writing unit tests and end-to-end integration flows.');

  -- 5. Insert Career Trials
  INSERT INTO public.career_trials (
    id,
    user_id,
    opportunity_id,
    opportunity_title,
    opportunity_company,
    target_skill,
    title,
    description,
    difficulty,
    estimated_time,
    status,
    score,
    tasks,
    rubric
  )
  VALUES
    (
      trial_vercel_id,
      target_user_id,
      opp_vercel_id,
      'Frontend Software Engineer Intern (Summer 2026)',
      'Vercel',
      'Next.js App Router & Server Components',
      'Implement Edge Streaming Telemetry Dashboard with React Server Components',
      'Workplace micro-simulation: Vercel customers need real-time edge streaming telemetry with graceful fallback skeletons and zero layout shift.',
      'Intermediate',
      '45 mins',
      'assigned',
      NULL,
      '[
        {"id": "t1", "title": "Setup Server Component Data Layer", "instruction": "Create an async Server Component that fetches paginated logs with fallback handling.", "expectedOutput": "Exported RSC fetching edge data without hydration errors.", "estimatedMinutes": 15},
        {"id": "t2", "title": "Build Suspense Streaming Boundary", "instruction": "Wrap latency-heavy metrics in a React 19 Suspense boundary with skeleton UI.", "expectedOutput": "Fast initial paint with smooth streamed metric resolution.", "estimatedMinutes": 15},
        {"id": "t3", "title": "Add Client Filter Controls with URL State", "instruction": "Create an interactive Client Component that syncs filter parameters to URL search params.", "expectedOutput": "Responsive filter bar updating server queries.", "estimatedMinutes": 15}
      ]'::JSONB,
      '[
        "Zero unnecessary client-side bundle weight (clean RSC boundary)",
        "Strict TypeScript interface types for edge payload responses",
        "Graceful loading skeletons avoiding Cumulative Layout Shift (CLS)",
        "Clean error boundary preventing full-page crashes"
      ]'::JSONB
    );

  -- 6. Insert Readiness Assessment for Vercel Opportunity
  INSERT INTO public.readiness_assessments (
    opportunity_id,
    user_id,
    readiness_score,
    evidence_match_score,
    strong_matches_count,
    partial_matches_count,
    weak_matches_count,
    missing_matches_count,
    matches,
    biggest_gap,
    summary_analysis
  )
  VALUES (
    opp_vercel_id,
    target_user_id,
    82.0,
    85.0,
    3,
    2,
    1,
    0,
    '[
      {"requirementName": "TypeScript & Modern ECMAScript", "importance": "Critical", "matchStatus": "Strong", "confidence": 95, "evidenceTitle": "DevFlow: Collaborative Markdown Editor", "explanation": "Strong verified evidence with complex generic typing and state handling.", "recommendedAction": "Ready to showcase in technical interviews."},
      {"requirementName": "React 19 & Component Architecture", "importance": "Critical", "matchStatus": "Strong", "confidence": 98, "evidenceTitle": "Meta Frontend Developer Professional Certificate", "explanation": "Verified professional certification with 98.4% grade and lab projects.", "recommendedAction": "Highlight architecture decisions in code walkthroughs."},
      {"requirementName": "Tailwind CSS & Design Systems", "importance": "Important", "matchStatus": "Strong", "confidence": 94, "evidenceTitle": "Open Source Contributions to shadcn/ui", "explanation": "Direct merged pull requests to premier Tailwind component library.", "recommendedAction": "Include link in portfolio resume."},
      {"requirementName": "Next.js App Router & Server Components", "importance": "Important", "matchStatus": "Partial", "confidence": 65, "explanation": "Self-reported knowledge without standalone production artifact.", "recommendedAction": "Complete the Next.js RSC Career Trial simulation to bridge this gap."}
    ]'::JSONB,
    '{
      "skillName": "Next.js App Router & Server Components",
      "importance": "Important",
      "whyItMatters": "Vercel is the creator and primary maintainer of Next.js; proficiency in the App Router is central to the role.",
      "whatYouHave": "Solid foundational React 19 knowledge and client-side hook mastery.",
      "whatsMissing": "Hands-on proof of streaming Server Components and Edge middleware routing.",
      "recommendedAction": "Complete the 45-minute Edge Telemetry Career Trial simulation."
    }'::JSONB,
    'Jordan has an 82% verified match for Vercel. Critical foundational competencies (TypeScript, React Architecture, Tailwind) are fully backed by verified evidence. Completing the Next.js App Router Career Trial will elevate readiness to 94%+.'
  );

  -- 7. Insert Skill Swap Peers
  INSERT INTO public.skill_swap_peers (
    user_id,
    headline,
    college,
    compatibility_score,
    they_can_teach_you,
    you_can_teach_them,
    bio,
    looking_for,
    availability,
    status
  )
  VALUES
    (
      target_user_id,
      'Backend & Distributed Systems Fellow @ UC Berkeley',
      'UC Berkeley',
      94,
      ARRAY['Next.js App Router', 'Go Microservices', 'PostgreSQL Optimization'],
      ARRAY['React 19 Hooks', 'Tailwind Design Systems', 'WebSockets'],
      'Building high-concurrency backend services. Eager to level up my modern frontend layout skills in exchange for Next.js & backend coaching.',
      'Frontend pairing partner for Summer 2026 prep',
      '3 hrs/week',
      'available'
    );

END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==============================================================================
-- PROOFLY DATABASE MIGRATION: 005 - LAUNCH HARDENING
-- Canonical schema is 2026 core_schema + storage/RLS + triggers + seed.
-- This migration closes cross-user write paths and adds mentor request persistence.
-- ==============================================================================

-- Mentor requests are intentionally independent of the local mentor catalog.
-- mentor_id is TEXT because the UI can use curated/local mentor identifiers.
CREATE TABLE IF NOT EXISTS public.mentor_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mentor_id TEXT NOT NULL,
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  target_role TEXT NOT NULL DEFAULT '',
  target_skill_gap TEXT NOT NULL DEFAULT '',
  message TEXT NOT NULL DEFAULT '',
  status VARCHAR(20) NOT NULL DEFAULT 'Pending'
    CHECK (status IN ('Pending', 'Accepted', 'Declined', 'Completed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_mentor_requests_student_id
  ON public.mentor_requests(student_id);

CREATE INDEX IF NOT EXISTS idx_mentor_requests_mentor_id
  ON public.mentor_requests(mentor_id);

ALTER TABLE public.mentor_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Students can create own mentor requests" ON public.mentor_requests;
CREATE POLICY "Students can create own mentor requests"
  ON public.mentor_requests FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = student_id);

DROP POLICY IF EXISTS "Students can view own mentor requests" ON public.mentor_requests;
CREATE POLICY "Students can view own mentor requests"
  ON public.mentor_requests FOR SELECT
  TO authenticated
  USING (auth.uid() = student_id);

DROP POLICY IF EXISTS "Students can update own mentor requests" ON public.mentor_requests;
CREATE POLICY "Students can update own mentor requests"
  ON public.mentor_requests FOR UPDATE
  TO authenticated
  USING (auth.uid() = student_id)
  WITH CHECK (auth.uid() = student_id);

DROP TRIGGER IF EXISTS trg_mentor_requests_updated_at ON public.mentor_requests;
CREATE TRIGGER trg_mentor_requests_updated_at
  BEFORE UPDATE ON public.mentor_requests
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();


ALTER TABLE public.skill_swap_peers
  ADD COLUMN IF NOT EXISTS skill_swap_active BOOLEAN NOT NULL DEFAULT TRUE;

CREATE INDEX IF NOT EXISTS idx_skill_swap_peers_active
  ON public.skill_swap_peers(skill_swap_active);

-- Do not expose the complete profiles table just because SkillSwap is enabled.
-- SkillSwap discovery uses skill_swap_peers, which contains only intended public fields.
DROP POLICY IF EXISTS "Users can view active skill swap profiles" ON public.profiles;
DROP POLICY IF EXISTS "Public can view active skill swap profiles" ON public.profiles;

-- Prevent a user from attaching a trial submission to another user's trial.
DROP POLICY IF EXISTS "Users can insert own trial submissions" ON public.trial_submissions;
CREATE POLICY "Users can insert own trial submissions"
  ON public.trial_submissions FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM public.career_trials t
      WHERE t.id = trial_submissions.trial_id
        AND t.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can update own trial submissions" ON public.trial_submissions;
CREATE POLICY "Users can update own trial submissions"
  ON public.trial_submissions FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM public.career_trials t
      WHERE t.id = trial_submissions.trial_id
        AND t.user_id = auth.uid()
    )
  );

-- Prevent moving a requirement row to an opportunity owned by another user.
DROP POLICY IF EXISTS "Users can update requirements of own opportunities" ON public.opportunity_requirements;
CREATE POLICY "Users can update requirements of own opportunities"
  ON public.opportunity_requirements FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.opportunities o
      WHERE o.id = opportunity_requirements.opportunity_id
        AND o.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.opportunities o
      WHERE o.id = opportunity_requirements.opportunity_id
        AND o.user_id = auth.uid()
    )
  );

-- Ensure contact inserts remain public, but no public read access exists.
DROP POLICY IF EXISTS "Anyone can submit a contact message" ON public.contact_messages;
CREATE POLICY "Anyone can submit a contact message"
  ON public.contact_messages FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "Users can view own submitted contact messages" ON public.contact_messages;
CREATE POLICY "Users can view own submitted contact messages"
  ON public.contact_messages FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- The demo seed helper must never be callable by anonymous or normal users.
-- It is intended for an operator/service-role setup step only.
REVOKE EXECUTE ON FUNCTION public.seed_proofly_demo_data(UUID) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.seed_proofly_demo_data(UUID) TO service_role;
