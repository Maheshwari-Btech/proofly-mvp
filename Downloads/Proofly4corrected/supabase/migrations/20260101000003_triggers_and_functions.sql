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
$$ LANGUAGE plpgsql SECURITY DEFINER;

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
DECLARE
  opp_title TEXT;
  opp_company TEXT;
BEGIN
  -- When a trial is marked completed and has a passing score (>= 70)
  IF (NEW.status = 'completed' AND (OLD.status IS DISTINCT FROM 'completed') AND NEW.score >= 70) THEN
    
    INSERT INTO public.evidence_items (
      user_id,
      title,
      type,
      description,
      issuer,
      date,
      external_url,
      skills,
      verification_status,
      source_trial_id,
      metrics,
      confidence_score,
      verification_source
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

    -- Log skill progress elevation
    INSERT INTO public.skill_progress_records (
      user_id,
      skill_name,
      previous_level,
      current_level,
      source,
      date
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

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_career_trials_auto_evidence ON public.career_trials;
CREATE TRIGGER trg_career_trials_auto_evidence
  AFTER UPDATE OF status, score ON public.career_trials
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_trial_completion_evidence();
