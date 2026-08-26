# Proofly - Comprehensive Project Overview & Architecture Guide

## 1. Executive Summary
**Proofly** is an AI-powered Career Readiness & Proof Platform designed for software engineering students and aspiring professionals. It helps users bridge the gap between their current skills and the exact requirements of dream job postings through evidence-based verification, workplace micro-simulations ("Career Trials"), peer skill swapping, and automated readiness scoring.

---

## 2. Core Architecture & Modules

### A. Frontend Architecture (React 18 + Vite + Tailwind CSS)
- **Design System ("Purple & Light")**:
  - Consistent light surface palette (`bg-slate-50`, `bg-white`, `bg-purple-50/50`) paired with Tailwind purple branding (`purple-600` primary buttons with `hover:bg-purple-700` and `transition-all`, `purple-100` subtle badges, `purple-900` text).
  - Component library built with Lucide React icons, motion animations, and accessible color contrast.
- **Key Views**:
  1. `LandingPageView`: Overview of the platform, value proposition, and feature highlights.
  2. `DashboardView`: Comprehensive student cockpit with readiness metrics, active opportunities, recent evidence, and trial roadmaps.
  3. `OpportunitiesView`: Role tracker, JD text parser, requirement extraction, and gap analyzer.
  4. `ReadinessView`: In-depth match matrix comparing evidence items against job requirements (Critical / Important / Bonus).
  5. `EvidenceLibraryView`: Digital portfolio of verified projects, GitHub repositories, certificates, and work artifacts with file upload/tagging.
  6. `CareerTrialView`: Interactive workplace simulation environment with task checklists, code submission, automated grading, and rubrics.
  7. `SkillSwapView`: Reciprocal peer-to-peer learning matching system based on mutual complementary skills.
  8. `LearningResourcesView` & `MentorsView`: Curated tutorials, courses, and 1:1 mentorship scheduling.
  9. `ProfileView`, `SettingsView`, `AdminDashboardView`, `UserGuideView`, `FaqView`, `ContactView`.

---

## 3. Database Architecture & PostgreSQL Schema (Supabase)

The database schema is fully defined in `supabase/schema.sql` and modular migration files in `supabase/migrations/`:

### Database Tables:
1. **`profiles`**: User profiles with education, career goals, target roles, skill inventories, and preferences, linked to `auth.users(id)`.
2. **`opportunities`**: Tracked job listings, target internships, and required readiness levels.
3. **`opportunity_requirements` / `requirements`**: Competency requirements broken down by technical category, tools, and importance tiers.
4. **`evidence_items` / `evidence`**: Verified projects, certificates, GitHub repos, courses, and workplace credentials with verification metrics.
5. **`career_trials`**: Hands-on workplace micro-simulations, instructions, rubrics, and scenarios.
6. **`trial_tasks` & `trial_submissions`**: Individual checkpoints, submitted GitHub URLs, code snippets, notes, and AI evaluation feedback.
7. **`readiness_assessments`**: Granular gap analysis scores, requirement matching matrices, and recommended actions.
8. **`skills` & `user_skills`**: Global skills master catalog and user proficiency tracking.
9. **`skill_swap_peers` / `skillswap_profiles`**: Reciprocal peer learning profiles and availability.
10. **`learning_resources` & `mentors`**: Educational catalog and mentor directory.
11. **`contact_messages`**: User support and outreach inquiries.

### Row Level Security (RLS) & Privacy:
- All tables have Row Level Security enabled.
- User data is isolated such that `auth.uid() = user_id`.
- Public/authenticated directories (like learning resources, mentors, and opt-in skill swap profiles) have read-only access policies.
- Dedicated storage buckets configured for `evidence-files`, `trial-artifacts`, and `avatars`.

---

## 4. How to Run & Deploy the Project

### Local Development:
```bash
# 1. Install dependencies
npm install

# 2. Start development server (Port 3000)
npm run dev

# 3. Build for production
npm run build
```

### Supabase Setup:
1. Create a Supabase project at https://supabase.com
2. In the Supabase SQL Editor, run `supabase/schema.sql` or run `supabase db push` using the Supabase CLI.
3. Set your environment variables in `.env`:
   - `VITE_SUPABASE_URL=your_supabase_project_url`
   - `VITE_SUPABASE_ANON_KEY=your_supabase_anon_key`

---

## 5. Exporting as ZIP in Google AI Studio
In addition to the generated `proofly-project.zip` archive in the project root and `public/` directory:
- You can export the full repository anytime using the **Settings -> Export to ZIP** or **GitHub Export** options in the top navigation bar of Google AI Studio.
