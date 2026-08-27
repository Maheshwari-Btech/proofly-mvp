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
