# Proofly — Supabase Database Architecture & Setup Guide

This document outlines the complete Supabase database schema, migration procedures, Authentication setup, Storage buckets, and Row Level Security (RLS) policies as defined in the **Proofly Master Build Plan**.

---

## 1. Architectural Overview & Entity Model

Proofly shifts career readiness evaluation from unverified keyword claims to **verifiable evidence** (Projects, Certificates, GitHub PRs, Labs).

```
 ┌─────────────────┐
 │   auth.users    │ (Supabase Auth)
 └────────┬────────┘
          │ 1:1
 ┌────────▼────────┐        1:N        ┌──────────────────────┐        1:N        ┌────────────────────────────┐
 │ public.profiles ├──────────────────►│ public.opportunities ├──────────────────►│  opportunity_requirements   │
 └────────┬────────┘                   └──────────┬───────────┘                   └────────────────────────────┘
          │                                       │
          │ 1:N                                   │ 1:1
          ├───────────────────────────────────────┼──────────────────────────────►┌────────────────────────────┐
          │                                       │                               │   readiness_assessments    │
          │ 1:N                                   │ 1:N                           └────────────────────────────┘
          ├──────────────────►┌───────────────────┴──┐
          │                   │    career_trials     │
          │                   └───────────┬──────────┘
          │                               │ 1:N
          │ 1:N                           ▼
          ├──────────────────►┌──────────────────────┐
          │                   │  trial_submissions   │
          │                   └───────────┬──────────┘
          │                               │ (Generates on completion)
          │ 1:N                           ▼
          ├──────────────────►┌──────────────────────┐
          │                   │    evidence_items    │◄─── Linked to Storage ('evidence-files')
          │                   └──────────────────────┘
          │ 1:N
          ├──────────────────►┌──────────────────────┐
          │                   │   skill_swap_peers   │
          │                   └──────────────────────┘
          │ 1:N
          └──────────────────►┌────────────────────────────┐
                              │   skill_progress_records   │
                              └────────────────────────────┘
```

---

## 2. Directory Structure & Migration Files

The database migrations are organized chronologically inside `/supabase/migrations/`:

| Migration File | Description |
| :--- | :--- |
| `20260101000001_core_schema.sql` | PostgreSQL extensions (`uuid-ossp`, `pgcrypto`), custom ENUMs, 10 core tables, foreign keys, and indexes. |
| `20260101000002_storage_and_rls.sql` | 3 Supabase storage buckets (`evidence-files`, `trial-artifacts`, `avatars`) and comprehensive RLS policies. |
| `20260101000003_triggers_and_functions.sql` | `handle_updated_at`, `handle_new_user` auth hook, and `handle_trial_completion_evidence` automatic evidence generator. |
| `20260101000004_seed_data.sql` | Realistic reference seed records and `seed_proofly_demo_data(uuid)` stored procedure. |

---

## 3. Step-by-Step Setup Process

### Step 3.1: Initialize Supabase CLI & Link Project
1. Install Supabase CLI locally (if not already installed):
   ```bash
   npm install -g supabase
   ```
2. Log in and link to your Supabase cloud project:
   ```bash
   supabase login
   supabase link --project-ref <YOUR_SUPABASE_PROJECT_REF>
   ```

### Step 3.2: Apply Migrations
Run the migrations in sequential order:
```bash
supabase db push
```
*Or via the Supabase Dashboard SQL Editor:* Paste and execute each `.sql` file in sequence (`001` -> `002` -> `003` -> `004`).

---

## 4. Supabase Authentication Setup

### 4.1 Supported Auth Providers
1. **Email / Password & Magic Links**:
   - Enable **Email** provider in **Authentication > Providers > Email**.
   - Enable **Confirm email** for production or disable for frictionless local testing.
2. **GitHub OAuth** (Recommended for student developer verification):
   - In GitHub Settings > Developer Settings > OAuth Apps:
     - **Homepage URL**: `https://<YOUR_APP_DOMAIN>`
     - **Authorization callback URL**: `https://<YOUR_SUPABASE_PROJECT_REF>.supabase.co/auth/v1/callback`
   - Paste `Client ID` and `Client Secret` into **Authentication > Providers > GitHub**.

### 4.2 Redirect URLs
In **Authentication > URL Configuration > Redirect URLs**, add:
- `http://localhost:3000/**`
- `https://*.run.app/**`
- `https://proofly.app/**` (Production domain)

### 4.3 Automated Profile Creation Auth Hook
When a user signs up through any provider, the `on_auth_user_created` trigger in Migration `003` automatically creates a corresponding row in `public.profiles`, extracting `full_name`, `avatar_url`, and calculating initials.

---

## 5. Storage Buckets Configuration

| Bucket Name | Public? | Max Size | Allowed MIME Types | Purpose |
| :--- | :---: | :---: | :--- | :--- |
| `evidence-files` | **No** (Private) | 25 MB | `pdf`, `png`, `jpeg`, `webp`, `zip`, `json`, `md` | Uploaded resumes, certificates, project decks, test results. |
| `trial-artifacts` | **No** (Private) | 50 MB | `zip`, `tar.gz`, `ts`, `js`, `json`, `png`, `jpeg` | Workplace micro-simulation code submissions & logs. |
| `avatars` | **Yes** (Public) | 5 MB | `png`, `jpeg`, `webp`, `svg` | Profile photos and university badges. |

### Storage Folder Scoping Pattern
Files in private buckets are strictly isolated by authenticated User ID:
```
evidence-files/
  └── {user_id}/
        ├── 1740556800000_stanford_transcript.pdf
        └── 1740556900000_aws_solutions_architect.pdf
```

---

## 6. Row Level Security (RLS) Policy Matrix

All tables have RLS enabled (`ALTER TABLE ... ENABLE ROW LEVEL SECURITY;`).

| Table / Object | Operation | Allowed Roles | Policy Logic / Filter Condition |
| :--- | :--- | :--- | :--- |
| `profiles` | `SELECT` | `authenticated` | `auth.uid() = id` OR `skill_swap_active = true` |
| `profiles` | `UPDATE` | `authenticated` | `auth.uid() = id` |
| `opportunities` | `ALL` | `authenticated` | `auth.uid() = user_id` |
| `opportunity_requirements` | `ALL` | `authenticated` | `EXISTS (SELECT 1 FROM opportunities WHERE id = opportunity_id AND user_id = auth.uid())` |
| `evidence_items` | `ALL` | `authenticated` | `auth.uid() = user_id` |
| `career_trials` | `ALL` | `authenticated` | `auth.uid() = user_id` |
| `trial_submissions` | `ALL` | `authenticated` | `auth.uid() = user_id` |
| `readiness_assessments` | `ALL` | `authenticated` | `auth.uid() = user_id` |
| `skill_swap_peers` | `SELECT` | `authenticated` | `status IN ('available', 'connected', 'pending')` |
| `skill_swap_peers` | `INSERT / UPDATE` | `authenticated` | `auth.uid() = user_id` |
| `skill_progress_records` | `ALL` | `authenticated` | `auth.uid() = user_id` |
| `contact_messages` | `INSERT` | `anon, authenticated` | `true` (Public contact inquiries permitted) |
| `storage: evidence-files` | `ALL` | `authenticated` | `(storage.foldername(name))[1] = auth.uid()::text` |
| `storage: trial-artifacts` | `ALL` | `authenticated` | `(storage.foldername(name))[1] = auth.uid()::text` |
| `storage: avatars` | `SELECT` | `public, anon` | `bucket_id = 'avatars'` |
| `storage: avatars` | `INSERT / UPDATE` | `authenticated` | `(storage.foldername(name))[1] = auth.uid()::text` |

---

## 7. Environment Variables Configuration

Add the following to your local `.env` and `.env.example`:

```env
# Supabase Client Configuration
VITE_SUPABASE_URL="https://your-project-ref.supabase.co"
VITE_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

# Google Gemini API Key (Server-side AI evaluation)
GEMINI_API_KEY="your-gemini-api-key"
```

---

## 8. TypeScript Client & Service Integration

The frontend uses strongly typed interfaces generated from the database schema:

```typescript
import { supabaseService } from './lib/supabaseService';

// 1. Fetch user opportunities with associated requirements
const opps = await supabaseService.fetchOpportunities(userId);

// 2. Upload an evidence file to the private storage bucket
const uploaded = await supabaseService.uploadEvidenceFile(userId, file);

// 3. Save a verified evidence item linked to the file
await supabaseService.saveEvidenceItem(userId, {
  id: `evi_${Date.now()}`,
  userId,
  title: 'AWS Certified Cloud Practitioner',
  type: 'Certificate',
  description: 'Verified foundational cloud architecture competency',
  date: '2026-02-01',
  fileUrl: uploaded.url,
  fileName: uploaded.fileName,
  skills: ['AWS', 'Cloud Architecture', 'Security'],
  verificationStatus: 'Verified',
  createdAt: new Date().toISOString(),
});
```

---

## 9. Verification & Smoke Test

To verify the installation in Supabase SQL Editor:
```sql
-- 1. Verify all 10 tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public';

-- 2. Verify all 3 storage buckets
SELECT id, name, public, file_size_limit FROM storage.buckets;

-- 3. Verify active RLS policies
SELECT schemaname, tablename, policyname, roles, cmd 
FROM pg_policies 
WHERE schemaname = 'public';

-- 4. Seed demo records for a test user
-- SELECT public.seed_proofly_demo_data('<TEST_USER_UUID>');
```
