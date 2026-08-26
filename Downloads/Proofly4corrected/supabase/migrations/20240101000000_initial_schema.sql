-- ==============================================================================
-- PROOFLY INITIAL SCHEMA MIGRATION
-- File: supabase/migrations/20240101000000_initial_schema.sql
-- ==============================================================================
-- Comprehensive PostgreSQL Schema for Proofly:
-- Tables:
--   1. profiles
--   2. skills
--   3. user_skills
--   4. opportunities
--   5. requirements (opportunity requirements)
--   6. evidence (evidence items)
--   7. career_trials
--   8. trial_tasks
--   9. trial_submissions
--   10. readiness_assessments
--   11. learning_resources
--   12. mentors
--   13. skillswap_profiles
-- Includes: Extensions, Custom Types, RLS Policies, Indexes, and Update Triggers
-- ==============================================================================

-- 1. PostgreSQL Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Custom Enumerations & Types
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
  CREATE TYPE requirement_importance_enum AS ENUM ('Critical', 'Important', 'Bonus');
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

DO $$ BEGIN
  CREATE TYPE skill_level_enum AS ENUM ('Novice', 'Developing', 'Proficient', 'Advanced');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE learning_resource_type_enum AS ENUM ('Course', 'Documentation', 'Book', 'Video', 'Interactive', 'Project');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ==============================================================================
-- 3. Core Database Tables
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

-- 3.2 Skills Master Catalog
CREATE TABLE IF NOT EXISTS public.skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  category VARCHAR(50) DEFAULT 'Technical' NOT NULL,
  description TEXT DEFAULT '',
  demand_level VARCHAR(20) DEFAULT 'High',
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 3.3 User Skills (Associative Table)
CREATE TABLE IF NOT EXISTS public.user_skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  skill_id UUID NOT NULL REFERENCES public.skills(id) ON DELETE CASCADE,
  skill_name TEXT NOT NULL,
  level skill_level_enum DEFAULT 'Developing' NOT NULL,
  years_experience NUMERIC(3, 1) DEFAULT 1.0,
  verified BOOLEAN DEFAULT FALSE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  CONSTRAINT unique_user_skill UNIQUE (user_id, skill_id)
);

-- 3.4 Target Opportunities / Job Listings
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

-- 3.5 Opportunity Requirements
CREATE TABLE IF NOT EXISTS public.requirements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  opportunity_id UUID NOT NULL REFERENCES public.opportunities(id) ON DELETE CASCADE,
  skill_name TEXT NOT NULL,
  category VARCHAR(50) DEFAULT 'Technical' NOT NULL,
  importance requirement_importance_enum DEFAULT 'Important' NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 3.6 Evidence Items (Verified Artifacts)
CREATE TABLE IF NOT EXISTS public.evidence (
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

-- 3.7 Career Trials (Workplace Micro-Simulations)
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

-- 3.8 Individual Trial Tasks
CREATE TABLE IF NOT EXISTS public.trial_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trial_id UUID NOT NULL REFERENCES public.career_trials(id) ON DELETE CASCADE,
  order_index INTEGER DEFAULT 1 NOT NULL,
  title TEXT NOT NULL,
  instructions TEXT NOT NULL,
  starter_code TEXT DEFAULT '',
  expected_output TEXT DEFAULT '',
  completed BOOLEAN DEFAULT FALSE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 3.9 Career Trial Submissions & Evaluations
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

-- 3.10 Readiness Assessments (Gap Analysis & Requirement Matching)
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
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  CONSTRAINT unique_opportunity_assessment UNIQUE (opportunity_id, user_id)
);

-- 3.11 Learning Resources Catalog
CREATE TABLE IF NOT EXISTS public.learning_resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  provider TEXT NOT NULL,
  type learning_resource_type_enum DEFAULT 'Course' NOT NULL,
  url TEXT NOT NULL,
  duration VARCHAR(50) DEFAULT '2-4 weeks',
  difficulty trial_difficulty_enum DEFAULT 'Intermediate' NOT NULL,
  skills TEXT[] DEFAULT ARRAY[]::TEXT[] NOT NULL,
  description TEXT DEFAULT '',
  is_free BOOLEAN DEFAULT TRUE NOT NULL,
  rating NUMERIC(3, 2) DEFAULT 4.8 CHECK (rating >= 0 AND rating <= 5),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 3.12 Mentors Directory
CREATE TABLE IF NOT EXISTS public.mentors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  title TEXT NOT NULL,
  company TEXT NOT NULL,
  avatar_url TEXT,
  expertise TEXT[] DEFAULT ARRAY[]::TEXT[] NOT NULL,
  bio TEXT DEFAULT '',
  linkedin_url TEXT,
  session_type VARCHAR(50) DEFAULT '1:1 Career & Resume Review',
  available BOOLEAN DEFAULT TRUE NOT NULL,
  slots_available INTEGER DEFAULT 4 NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 3.13 SkillSwap Profiles (Peer-to-Peer Learning)
CREATE TABLE IF NOT EXISTS public.skillswap_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
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

-- ==============================================================================
-- 4. Database Performance Indexes
-- ==============================================================================

CREATE INDEX IF NOT EXISTS idx_user_skills_user_id ON public.user_skills(user_id);
CREATE INDEX IF NOT EXISTS idx_user_skills_skill_id ON public.user_skills(skill_id);
CREATE INDEX IF NOT EXISTS idx_opportunities_user_id ON public.opportunities(user_id);
CREATE INDEX IF NOT EXISTS idx_opportunities_status ON public.opportunities(status);
CREATE INDEX IF NOT EXISTS idx_requirements_opportunity_id ON public.requirements(opportunity_id);
CREATE INDEX IF NOT EXISTS idx_evidence_user_id ON public.evidence(user_id);
CREATE INDEX IF NOT EXISTS idx_evidence_type ON public.evidence(type);
CREATE INDEX IF NOT EXISTS idx_evidence_skills ON public.evidence USING GIN(skills);
CREATE INDEX IF NOT EXISTS idx_career_trials_user_id ON public.career_trials(user_id);
CREATE INDEX IF NOT EXISTS idx_career_trials_status ON public.career_trials(status);
CREATE INDEX IF NOT EXISTS idx_trial_tasks_trial_id ON public.trial_tasks(trial_id);
CREATE INDEX IF NOT EXISTS idx_trial_submissions_trial_id ON public.trial_submissions(trial_id);
CREATE INDEX IF NOT EXISTS idx_trial_submissions_user_id ON public.trial_submissions(user_id);
CREATE INDEX IF NOT EXISTS idx_readiness_assessments_opportunity_id ON public.readiness_assessments(opportunity_id);
CREATE INDEX IF NOT EXISTS idx_readiness_assessments_user_id ON public.readiness_assessments(user_id);
CREATE INDEX IF NOT EXISTS idx_learning_resources_skills ON public.learning_resources USING GIN(skills);
CREATE INDEX IF NOT EXISTS idx_mentors_expertise ON public.mentors USING GIN(expertise);
CREATE INDEX IF NOT EXISTS idx_skillswap_profiles_user_id ON public.skillswap_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_skillswap_profiles_status ON public.skillswap_profiles(status);

-- ==============================================================================
-- 5. Row Level Security (RLS) Policies
-- ==============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.requirements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.evidence ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.career_trials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trial_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trial_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.readiness_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mentors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skillswap_profiles ENABLE ROW LEVEL SECURITY;

-- 5.1 Profiles
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Public can view active skill swap profiles" ON public.profiles;
CREATE POLICY "Public can view active skill swap profiles"
  ON public.profiles FOR SELECT
  USING (skill_swap_active = true);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- 5.2 Skills Catalog (Public Read, Admin Write)
DROP POLICY IF EXISTS "Anyone can view skills catalog" ON public.skills;
CREATE POLICY "Anyone can view skills catalog"
  ON public.skills FOR SELECT
  TO authenticated, anon
  USING (true);

-- 5.3 User Skills
DROP POLICY IF EXISTS "Users can view own user skills" ON public.user_skills;
CREATE POLICY "Users can view own user skills"
  ON public.user_skills FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage own user skills" ON public.user_skills;
CREATE POLICY "Users can manage own user skills"
  ON public.user_skills FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 5.4 Opportunities
DROP POLICY IF EXISTS "Users can view own opportunities" ON public.opportunities;
CREATE POLICY "Users can view own opportunities"
  ON public.opportunities FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage own opportunities" ON public.opportunities;
CREATE POLICY "Users can manage own opportunities"
  ON public.opportunities FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 5.5 Requirements
DROP POLICY IF EXISTS "Users can view requirements of own opportunities" ON public.requirements;
CREATE POLICY "Users can view requirements of own opportunities"
  ON public.requirements FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.opportunities o
      WHERE o.id = requirements.opportunity_id
        AND o.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can manage requirements of own opportunities" ON public.requirements;
CREATE POLICY "Users can manage requirements of own opportunities"
  ON public.requirements FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.opportunities o
      WHERE o.id = requirements.opportunity_id
        AND o.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.opportunities o
      WHERE o.id = requirements.opportunity_id
        AND o.user_id = auth.uid()
    )
  );

-- 5.6 Evidence
DROP POLICY IF EXISTS "Users can view own evidence" ON public.evidence;
CREATE POLICY "Users can view own evidence"
  ON public.evidence FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage own evidence" ON public.evidence;
CREATE POLICY "Users can manage own evidence"
  ON public.evidence FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 5.7 Career Trials
DROP POLICY IF EXISTS "Users can view own career trials" ON public.career_trials;
CREATE POLICY "Users can view own career trials"
  ON public.career_trials FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage own career trials" ON public.career_trials;
CREATE POLICY "Users can manage own career trials"
  ON public.career_trials FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 5.8 Trial Tasks
DROP POLICY IF EXISTS "Users can view tasks for own trials" ON public.trial_tasks;
CREATE POLICY "Users can view tasks for own trials"
  ON public.trial_tasks FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.career_trials ct
      WHERE ct.id = trial_tasks.trial_id
        AND ct.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can update tasks for own trials" ON public.trial_tasks;
CREATE POLICY "Users can update tasks for own trials"
  ON public.trial_tasks FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.career_trials ct
      WHERE ct.id = trial_tasks.trial_id
        AND ct.user_id = auth.uid()
    )
  );

-- 5.9 Trial Submissions
DROP POLICY IF EXISTS "Users can view own trial submissions" ON public.trial_submissions;
CREATE POLICY "Users can view own trial submissions"
  ON public.trial_submissions FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage own trial submissions" ON public.trial_submissions;
CREATE POLICY "Users can manage own trial submissions"
  ON public.trial_submissions FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 5.10 Readiness Assessments
DROP POLICY IF EXISTS "Users can view own assessments" ON public.readiness_assessments;
CREATE POLICY "Users can view own assessments"
  ON public.readiness_assessments FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage own assessments" ON public.readiness_assessments;
CREATE POLICY "Users can manage own assessments"
  ON public.readiness_assessments FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 5.11 Learning Resources (Public Read)
DROP POLICY IF EXISTS "Anyone can view learning resources" ON public.learning_resources;
CREATE POLICY "Anyone can view learning resources"
  ON public.learning_resources FOR SELECT
  TO authenticated, anon
  USING (true);

-- 5.12 Mentors (Public Read for Authenticated Users)
DROP POLICY IF EXISTS "Authenticated users can view mentors" ON public.mentors;
CREATE POLICY "Authenticated users can view mentors"
  ON public.mentors FOR SELECT
  TO authenticated
  USING (true);

-- 5.13 SkillSwap Profiles (Shared Directory for Peer Pairing)
DROP POLICY IF EXISTS "Authenticated users can browse skill swap profiles" ON public.skillswap_profiles;
CREATE POLICY "Authenticated users can browse skill swap profiles"
  ON public.skillswap_profiles FOR SELECT
  TO authenticated
  USING (status IN ('available', 'connected', 'pending'));

DROP POLICY IF EXISTS "Users can manage own skill swap profile" ON public.skillswap_profiles;
CREATE POLICY "Users can manage own skill swap profile"
  ON public.skillswap_profiles FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ==============================================================================
-- 6. Trigger Functions for Automatic Updates
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_profiles_set_updated_at ON public.profiles;
CREATE TRIGGER trg_profiles_set_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_opportunities_set_updated_at ON public.opportunities;
CREATE TRIGGER trg_opportunities_set_updated_at
  BEFORE UPDATE ON public.opportunities
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_evidence_set_updated_at ON public.evidence;
CREATE TRIGGER trg_evidence_set_updated_at
  BEFORE UPDATE ON public.evidence
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_career_trials_set_updated_at ON public.career_trials;
CREATE TRIGGER trg_career_trials_set_updated_at
  BEFORE UPDATE ON public.career_trials
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_user_skills_set_updated_at ON public.user_skills;
CREATE TRIGGER trg_user_skills_set_updated_at
  BEFORE UPDATE ON public.user_skills
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
