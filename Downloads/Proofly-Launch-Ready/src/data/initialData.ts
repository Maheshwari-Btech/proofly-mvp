import {
  UserProfile,
  Opportunity,
  EvidenceItem,
  ReadinessAssessment,
  CareerTrial,
  SkillSwapPeer,
  SkillProgressRecord,
  LearningResource,
  Mentor,
} from '../types';

export const initialProfile: UserProfile = {
  id: '',
  fullName: 'Curious Mind',
  email: '',
  avatarInitials: 'CM',
  headline: 'Software Engineering Explorer',
  bio: '',
  college: '',
  degree: '',
  education: '',
  graduationYear: '2026',
  targetRole: 'Software Engineering Intern',
  careerInterests: ['Frontend Development', 'Full-Stack Web', 'AI Systems'],
  currentSkills: [],
  careerGoal: '',
  skillSwapActive: true,
  notificationEmail: true,
  notificationTrialUpdates: true,
};

export const platformOpportunities: Opportunity[] = [
  {
    id: 'opp_vercel_frontend',
    userId: 'platform',
    title: 'Frontend Engineering Intern',
    company: 'Vercel',
    location: 'Remote (US/Canada)',
    opportunityType: 'Internship',
    sourceUrl: 'https://vercel.com/careers/frontend-intern',
    description:
      'Join Vercel to craft world-class web interfaces for the Next.js platform. We look for proactive engineers proficient in React, modern JavaScript/TypeScript, client-server data fetching, and accessible UI component design.',
    status: 'Active',
    postedDate: 'Posted 2 days ago',
    isPriority: true,
    readinessScore: 0,
    createdAt: '2026-08-24T10:00:00Z',
    requirements: [
      {
        id: 'req_react',
        opportunityId: 'opp_vercel_frontend',
        skillName: 'React & Component Architecture',
        category: 'Technical',
        importance: 'Critical',
        description: 'Deep understanding of modern React hooks, state management, and reusable UI components.',
      },
      {
        id: 'req_ts',
        opportunityId: 'opp_vercel_frontend',
        skillName: 'TypeScript & Type Safety',
        category: 'Technical',
        importance: 'Critical',
        description: 'Writing strictly typed interfaces, generics, and clean module contracts.',
      },
      {
        id: 'req_rest_api',
        opportunityId: 'opp_vercel_frontend',
        skillName: 'RESTful APIs & Data Fetching',
        category: 'Technical',
        importance: 'Critical',
        description: 'Integration of REST/JSON endpoints, asynchronous request orchestration, error/loading states.',
      },
      {
        id: 'req_tailwind',
        opportunityId: 'opp_vercel_frontend',
        skillName: 'Modern CSS & Tailwind',
        category: 'Tool',
        importance: 'Important',
        description: 'Responsive, accessible styling utilizing utility-first CSS and fluid viewport systems.',
      },
      {
        id: 'req_git',
        opportunityId: 'opp_vercel_frontend',
        skillName: 'Git Collaboration & CI/CD',
        category: 'Tool',
        importance: 'Important',
        description: 'Branching workflows, pull request reviews, and automated deployment pipelines.',
      },
      {
        id: 'req_testing',
        opportunityId: 'opp_vercel_frontend',
        skillName: 'Unit & Component Testing',
        category: 'Technical',
        importance: 'Bonus',
        description: 'Experience writing tests with Vitest, Jest, or React Testing Library.',
      },
    ],
  },
  {
    id: 'opp_stripe_fullstack',
    userId: 'platform',
    title: 'Software Engineering Intern',
    company: 'Stripe',
    location: 'San Francisco, CA (Hybrid)',
    opportunityType: 'Internship',
    sourceUrl: 'https://stripe.com/jobs/intern',
    description:
      'Build infrastructure and user surfaces powering millions of global transactions. Seeking engineers comfortable with TypeScript, scalable API design, and distributed systems fundamentals.',
    status: 'Active',
    postedDate: 'Posted 5 days ago',
    isPriority: false,
    readinessScore: 0,
    createdAt: '2026-08-21T14:30:00Z',
    requirements: [
      {
        id: 'req_str_ts',
        opportunityId: 'opp_stripe_fullstack',
        skillName: 'TypeScript / JavaScript',
        category: 'Technical',
        importance: 'Critical',
        description: 'Core language proficiency and asynchronous execution patterns.',
      },
      {
        id: 'req_str_api',
        opportunityId: 'opp_stripe_fullstack',
        skillName: 'API Design & Integration',
        category: 'Technical',
        importance: 'Critical',
        description: 'Idempotency, HTTP specs, and secure request validation.',
      },
      {
        id: 'req_str_sql',
        opportunityId: 'opp_stripe_fullstack',
        skillName: 'Relational Database Queries (SQL)',
        category: 'Technical',
        importance: 'Important',
        description: 'PostgreSQL schema modeling and transaction integrity.',
      },
    ],
  },
  {
    id: 'opp_figma_product',
    userId: 'platform',
    title: 'Design Technologist Intern',
    company: 'Figma',
    location: 'San Francisco, CA / Remote',
    opportunityType: 'Internship',
    sourceUrl: 'https://figma.com/careers/intern-design-tech',
    description:
      'Bridge the gap between design systems and production frontend code. Prototype experimental UI tools and high-fidelity canvas interactions.',
    status: 'Active',
    postedDate: 'Posted 1 week ago',
    isPriority: false,
    readinessScore: 0,
    createdAt: '2026-08-18T09:00:00Z',
    requirements: [
      {
        id: 'req_fig_ds',
        opportunityId: 'opp_figma_product',
        skillName: 'Design Systems & Tokens',
        category: 'Technical',
        importance: 'Critical',
        description: 'Building composable, themeable UI token systems and component primitives.',
      },
      {
        id: 'req_fig_react',
        opportunityId: 'opp_figma_product',
        skillName: 'React & Canvas Rendering',
        category: 'Technical',
        importance: 'Critical',
        description: 'High-performance interactive state management.',
      },
    ],
  },
];

export const initialOpportunities: Opportunity[] = platformOpportunities;

export const initialEvidence: EvidenceItem[] = [];

export const initialReadinessAssessments: Record<string, ReadinessAssessment> = {};

export const initialProgressRecords: SkillProgressRecord[] = [];

export const initialCareerTrials: CareerTrial[] = [
  {
    id: 'trial_rest_api_bridge',
    opportunityId: 'opp_vercel_frontend',
    opportunityTitle: 'Frontend Engineering Intern',
    opportunityCompany: 'Vercel',
    targetSkill: 'RESTful APIs & Data Fetching',
    title: 'REST API Integration & Resilient Data Fetcher',
    description:
      'Transform your biggest skill gap into verified evidence. Build a responsive React dashboard component that fetches data from a public REST API, implements search/filter query parameters, and handles loading, empty, and network error states cleanly.',
    difficulty: 'Intermediate',
    estimatedTime: '45 minutes',
    status: 'assigned',
    rubric: [
      'Clean asynchronous fetch execution with abort controller or loading guards',
      'Dedicated UI states for Initial Loading, Success Data, Empty Results, and Network Failure with Retry',
      'Client-side search and category filtering over fetched payload',
      'TypeScript interface declarations matching the external API response payload',
    ],
    tasks: [
      {
        id: 'task_1',
        title: 'Step 1: API Endpoint Integration',
        instruction:
          'Fetch a list of resources (e.g. GitHub repos, JSONPlaceholder posts, or OpenWeather data) using fetch() or an async utility inside a React hook.',
        expectedOutput: 'Typed response data saved in component state with loading = true during inflight requests.',
        estimatedMinutes: 15,
      },
      {
        id: 'task_2',
        title: 'Step 2: Error Boundaries & Retry Logic',
        instruction:
          'Simulate a failed network request or HTTP 500 error, and render a user-friendly error banner with an interactive "Try Again" button.',
        expectedOutput: 'Graceful error UI with no unhandled promise rejections.',
        estimatedMinutes: 15,
      },
      {
        id: 'task_3',
        title: 'Step 3: Search Filter & Deliverable Submission',
        instruction:
          'Add a debounce search input filtering items in real-time. Submit your code snippet or GitHub link for instant AI-assisted evaluation.',
        expectedOutput: 'Working interactive code submission ready for grading and evidence conversion.',
        estimatedMinutes: 15,
      },
    ],
    createdAt: '2026-08-25T18:15:00Z',
  },
  {
    id: 'trial_vitest_testing',
    opportunityId: 'opp_vercel_frontend',
    opportunityTitle: 'Frontend Engineering Intern',
    opportunityCompany: 'Vercel',
    targetSkill: 'Unit & Component Testing',
    title: 'React Testing Library & Vitest Component Suite',
    description:
      'Practice writing unit tests for a custom button and form input component, checking accessibility attributes, click events, and validation error messages.',
    difficulty: 'Beginner',
    estimatedTime: '30 minutes',
    status: 'assigned',
    rubric: [
      'Render test with accessibility role queries',
      'User event click simulation',
      'Snapshot or assertion verification',
    ],
    tasks: [
      {
        id: 'task_t1',
        title: 'Form Validation Testing',
        instruction: 'Write 3 unit tests verifying email format checks and submit button disabled states.',
        expectedOutput: 'Passing Vitest / React Testing Library suite.',
        estimatedMinutes: 30,
      },
    ],
    createdAt: '2026-08-24T12:00:00Z',
  },
];


export const initialLearningResources: LearningResource[] = [];

export const initialSkillSwapPeers: SkillSwapPeer[] = [];

export const initialMentors: Mentor[] = [];