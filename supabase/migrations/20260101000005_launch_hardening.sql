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
