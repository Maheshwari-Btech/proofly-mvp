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
