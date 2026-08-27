# Proofly Supabase Database Migrations & Architecture

This directory contains the production-grade PostgreSQL database schema migrations, Row Level Security (RLS) policies, storage bucket configurations, and automation triggers for Proofly.

## Directory Structure

```
supabase/
├── schema.sql                              # Consolidated single-file schema migration for easy execution
├── README.md                               # Schema documentation and setup guide
└── migrations/
    ├── 20260101000001_core_schema.sql      # Core tables, enums, extensions, and indexes
    ├── 20260101000002_storage_and_rls.sql  # Storage buckets & granular Row Level Security policies
    ├── 20260101000003_triggers_and_functions.sql # Timestamps, auth hooks, and auto-evidence generation
    └── 20260101000004_seed_data.sql        # Realistic sample data & seed stored procedure
```

---

## 1. Tables Included

| Table | Description | Primary Key | References |
|---|---|---|---|
| `profiles` | User profiles, career goals, target roles, and preferences | `id` (UUID) | `auth.users(id)` |
| `opportunities` | Job postings, internships, and target roles tracked by students | `id` (UUID) | `profiles(id)` |
| `opportunity_requirements` | Extracted competencies & skills per opportunity | `id` (UUID) | `opportunities(id)` |
| `evidence_items` | Verified projects, certifications, GitHub contributions, and coursework | `id` (UUID) | `profiles(id)` |
| `career_trials` | Workplace micro-simulations assigned to bridge skill gaps | `id` (UUID) | `profiles(id)`, `opportunities(id)` |
| `trial_submissions` | Code solutions, GitHub links, notes, and AI evaluation feedback | `id` (UUID) | `career_trials(id)`, `profiles(id)` |
| `readiness_assessments` | Gap analysis, readiness scores, and verified requirement match matrices | `id` (UUID) | `opportunities(id)`, `profiles(id)` |
| `skill_swap_peers` | Peer profiles for reciprocal skill exchange and pairing | `id` (UUID) | `profiles(id)` |
| `skill_progress_records` | Historical timeline of skill advancements | `id` (UUID) | `profiles(id)` |
| `mentor_requests` | Student mentorship requests | `id` (UUID) | `profiles(id)` |
| `contact_messages` | Inquiries and support messages | `id` (UUID) | `profiles(id)` |

---

## 2. Row Level Security (RLS) Policies

All tables have RLS enabled with strict data isolation:
- **`profiles`**: Users can read/write their own profile (`auth.uid() = id`). Profile rows are private; SkillSwap discovery is served from the dedicated `skill_swap_peers` table and filtered by `skill_swap_active`.
- **`opportunities`**: Users can only `SELECT`, `INSERT`, `UPDATE`, and `DELETE` opportunities where `user_id = auth.uid()`.
- **`opportunity_requirements`**: Access restricted to the owner of the parent opportunity (`EXISTS (SELECT 1 FROM opportunities WHERE id = opportunity_requirements.opportunity_id AND user_id = auth.uid())`).
- **`evidence_items`**: Strictly isolated to the owner (`user_id = auth.uid()`).
- **`career_trials` & `trial_submissions`**: Strictly isolated to the assigned user (`user_id = auth.uid()`).
- **`readiness_assessments`**: Strictly isolated to the opportunity owner (`user_id = auth.uid()`).
- **`storage.objects`**: Evidence files (`evidence-files/{user_id}/*`) and trial artifacts (`trial-artifacts/{user_id}/*`) are only readable/writable by the folder owner. Avatars (`avatars/*`) are publicly readable and owner-writable.

---

## 3. How to Apply

### Option A: Supabase Dashboard (SQL Editor)
1. Open your Supabase project dashboard.
2. Go to **SQL Editor** -> **New Query**.
3. For a fresh project, copy and paste the contents of `supabase/schema.sql` (or use the migration files with the CLI).
4. Click **Run**.

### Option B: Supabase CLI
```bash
supabase db push
# or to apply individually:
supabase migration up
```

### Option C: Seed Demo Data
To populate sample opportunities, evidence items, and trials for a user:
```sql
SELECT public.seed_proofly_demo_data('YOUR_USER_UUID_HERE');
```
