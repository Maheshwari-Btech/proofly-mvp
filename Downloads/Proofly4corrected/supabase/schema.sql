-- ==============================================================================
-- PROOFLY COMPLETE SUPABASE DATABASE SCHEMA MIGRATION
-- ==============================================================================
-- Description: Complete consolidated SQL schema for Proofly including tables for
--              profiles, opportunities, requirements, evidence, career trials,
--              trial submissions, and readiness assessments, with Row Level
--              Security (RLS) policies, triggers, and automated functions.
-- ==============================================================================

-- 1. PostgreSQL Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Custom Enumerations
DO $$ BEGIN
  CREATE TYPE evidence_type_enum AS ENUM (
    'Certificate', 'Project', 'Resume', 'Internship', 'Experience',
    'GitHub', 'Course', 'Competition', 'Other'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE match_status_enum AS ENUM ('Strong', 'Partial', 'Weak', 'Missing');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE importance_enum AS ENUM ('Critical', 'Important', 'Bonus');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE trial_difficulty_enum AS ENUM ('Beginner', 'Intermediate', 'Advanced');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE trial_status_enum AS ENUM ('assigned', 'in_progress', 'submitted', 'completed');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE opportunity_type_enum AS ENUM ('Internship', 'Full-time', 'Co-op', 'Part-time');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE opportunity_status_enum AS ENUM ('Active', 'Interviewing', 'Applied', 'Archived');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE verification_status_enum AS ENUM ('Verified', 'Self-Reported', 'In-Review');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ==============================================================================
-- 3. Core Tables
-- ==============================================================================

-- 3.1 User Profiles
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

-- 3.2 Opportunities
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

-- 3.3 Opportunity Requirements
CREATE TABLE IF NOT EXISTS public.opportunity_requirements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  opportunity_id UUID NOT NULL REFERENCES public.opportunities(id) ON DELETE CASCADE,
  skill_name TEXT NOT NULL,
  category VARCHAR(50) DEFAULT 'Technical' NOT NULL,
  importance importance_enum DEFAULT 'Important' NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 3.4 Evidence Items
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

-- 3.5 Career Trials
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

-- 3.6 Trial Submissions
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

-- 3.7 Readiness Assessments
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

-- 3.8 SkillSwap Peers
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

-- 3.9 Skill Progress Tracking
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

-- 3.10 Contact Messages
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
-- 5. Row Level Security (RLS) Enforcement
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

-- 5.1 Profiles RLS
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

-- 5.2 Opportunities RLS
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

-- 5.3 Opportunity Requirements RLS
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

-- 5.4 Evidence Items RLS
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

-- 5.5 Career Trials RLS
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

-- 5.6 Trial Submissions RLS
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

-- 5.7 Readiness Assessments RLS
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

-- 5.8 SkillSwap Peers RLS
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

-- 5.9 Skill Progress Records RLS
DROP POLICY IF EXISTS "Users can view own skill progress" ON public.skill_progress_records;
CREATE POLICY "Users can view own skill progress"
  ON public.skill_progress_records FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own skill progress" ON public.skill_progress_records;
CREATE POLICY "Users can insert own skill progress"
  ON public.skill_progress_records FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 5.10 Contact Messages RLS
DROP POLICY IF EXISTS "Anyone can submit a contact message" ON public.contact_messages;
CREATE POLICY "Anyone can submit a contact message"
  ON public.contact_messages FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "Users can view own submitted contact messages" ON public.contact_messages;
CREATE POLICY "Users can view own submitted contact messages"
  ON public.contact_messages FOR SELECT
  USING (auth.uid() = user_id);

-- ==============================================================================
-- 6. Storage Buckets & Policies
-- ==============================================================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  ('evidence-files', 'evidence-files', false, 26214400, ARRAY['application/pdf', 'image/png', 'image/jpeg', 'image/webp', 'application/zip', 'text/plain', 'application/json', 'text/markdown']),
  ('trial-artifacts', 'trial-artifacts', false, 52428800, ARRAY['application/zip', 'application/x-tar', 'application/gzip', 'text/plain', 'text/typescript', 'text/javascript', 'application/json', 'image/png', 'image/jpeg']),
  ('avatars', 'avatars', true, 5242880, ARRAY['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml'])
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

DROP POLICY IF EXISTS "Users can upload evidence files" ON storage.objects;
CREATE POLICY "Users can upload evidence files"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'evidence-files' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS "Users can read own evidence files" ON storage.objects;
CREATE POLICY "Users can read own evidence files"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'evidence-files' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

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

-- ==============================================================================
-- 7. Triggers & Automated Handlers
-- ==============================================================================

-- 7.1 Automatic updated_at handler
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_profiles_updated_at ON public.profiles;
CREATE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS trg_opportunities_updated_at ON public.opportunities;
CREATE TRIGGER trg_opportunities_updated_at
  BEFORE UPDATE ON public.opportunities
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS trg_evidence_items_updated_at ON public.evidence_items;
CREATE TRIGGER trg_evidence_items_updated_at
  BEFORE UPDATE ON public.evidence_items
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS trg_career_trials_updated_at ON public.career_trials;
CREATE TRIGGER trg_career_trials_updated_at
  BEFORE UPDATE ON public.career_trials
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS trg_readiness_assessments_updated_at ON public.readiness_assessments;
CREATE TRIGGER trg_readiness_assessments_updated_at
  BEFORE UPDATE ON public.readiness_assessments
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- 7.2 Auth hook for new user registrations
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  extracted_name TEXT;
  extracted_initials VARCHAR(4);
BEGIN
  extracted_name := COALESCE(
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'name',
    SPLIT_PART(NEW.email, '@', 1)
  );

  extracted_initials := UPPER(
    SUBSTRING(SPLIT_PART(extracted_name, ' ', 1) FROM 1 FOR 1) ||
    COALESCE(SUBSTRING(SPLIT_PART(extracted_name, ' ', 2) FROM 1 FOR 1), '')
  );

  IF extracted_initials = '' OR extracted_initials IS NULL THEN
    extracted_initials := 'ME';
  END IF;

  INSERT INTO public.profiles (
    id, full_name, email, avatar_url, avatar_initials, headline,
    bio, college, degree, education, graduation_year, target_role,
    career_interests, current_skills, skill_swap_active,
    notification_email, notification_trial_updates
  )
  VALUES (
    NEW.id,
    extracted_name,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', NULL),
    extracted_initials,
    COALESCE(NEW.raw_user_meta_data->>'headline', 'Software Engineering Student'),
    COALESCE(NEW.raw_user_meta_data->>'bio', 'Passionate developer building verifiable career proof.'),
    COALESCE(NEW.raw_user_meta_data->>'college', 'University'),
    COALESCE(NEW.raw_user_meta_data->>'degree', 'B.S. Computer Science'),
    COALESCE(NEW.raw_user_meta_data->>'education', 'B.S. in Computer Science'),
    COALESCE(NEW.raw_user_meta_data->>'graduation_year', '2026'),
    COALESCE(NEW.raw_user_meta_data->>'target_role', 'Full Stack Engineer'),
    ARRAY['Frontend', 'Backend', 'AI Systems'],
    ARRAY['TypeScript', 'React', 'Node.js'],
    TRUE, TRUE, TRUE
  )
  ON CONFLICT (id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    email = EXCLUDED.email;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 7.3 Trial Completion Auto-Evidence Trigger
CREATE OR REPLACE FUNCTION public.handle_trial_completion_evidence()
RETURNS TRIGGER AS $$
BEGIN
  IF (NEW.status = 'completed' AND (OLD.status IS DISTINCT FROM 'completed') AND NEW.score >= 70) THEN
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
      NEW.user_id, NEW.target_skill, 'Developing', 'Proficient',
      'Completed Career Trial: ' || NEW.title, CURRENT_DATE
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_career_trials_auto_evidence ON public.career_trials;
CREATE TRIGGER trg_career_trials_auto_evidence
  AFTER UPDATE OF status, score ON public.career_trials
  FOR EACH ROW EXECUTE FUNCTION public.handle_trial_completion_evidence();
