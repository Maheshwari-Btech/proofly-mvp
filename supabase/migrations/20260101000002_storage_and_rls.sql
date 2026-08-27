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
