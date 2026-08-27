import {
  UserProfile,
  EvidenceItem,
  Opportunity,
  ReadinessAssessment,
  SkillSwapPeer,
} from '../types';

export interface ExchangePlanDay {
  day: number;
  phase: 'LEARN' | 'BUILD' | 'PROVE';
  title: string;
  focus: string;
  mentorRole: string;
  studentRole: string;
  deliverable: string;
  estimatedHours: string;
  checklist: string[];
}

export interface ReciprocalMatchResult {
  peer: SkillSwapPeer;
  userCriticalGap: string;
  userContribution: string;
  peerTeaches: string;
  peerLearns: string;
  matchScore: number;
  reciprocalType: 'Mutual Exchange' | 'Mentor Direct';
  exchangePlan: ExchangePlanDay[];
}

/* =========================================================
   MASTER COMMUNITY PEERS
   ========================================================= */

export const masterCommunityPeers: SkillSwapPeer[] = [
  {
    id: 'peer_aarav_ml',
    userId: 'usr_peer_aarav',
    name: 'Aarav Sharma',
    avatarInitials: 'AS',
    headline: 'Machine Learning & Python Specialist',
    college: 'University of Illinois Urbana-Champaign',
    compatibilityScore: 92,
    theyCanTeachYou: [
      'Machine Learning',
      'TensorFlow',
      'Python & PyTorch',
      'Data Science',
    ],
    youCanTeachThem: [
      'SQL & Database Design',
      'React & Component Architecture',
      'Tailwind CSS',
    ],
    bio: 'CS student specializing in machine learning and Python.',
    lookingFor: 'SQL and frontend development.',
    availability: '3-4 hrs / week',
    status: 'available',
    lastActive: 'Active today',
  },

  {
    id: 'peer_priya_backend',
    userId: 'usr_peer_priya',
    name: 'Priya Patel',
    avatarInitials: 'PP',
    headline: 'Backend & REST API Specialist',
    college: 'Georgia Institute of Technology',
    compatibilityScore: 89,
    theyCanTeachYou: [
      'RESTful APIs & Data Fetching',
      'Node.js & Backend Services',
      'Microservices',
      'PostgreSQL',
    ],
    youCanTeachThem: [
      'TypeScript & Type Safety',
      'Modern CSS & Tailwind',
      'Unit & Component Testing',
    ],
    bio: 'Backend developer focused on APIs and distributed systems.',
    lookingFor: 'TypeScript and frontend architecture.',
    availability: 'Evenings & Weekends',
    status: 'available',
    lastActive: 'Active 2h ago',
  },

  {
    id: 'peer_elena_cloud',
    userId: 'usr_peer_elena',
    name: 'Elena Rostova',
    avatarInitials: 'ER',
    headline: 'Cloud Infrastructure & DevOps Engineer',
    college: 'University of Michigan',
    compatibilityScore: 86,
    theyCanTeachYou: [
      'Cloud Services & AWS/GCP',
      'Docker & Containerization',
      'CI/CD Pipelines',
      'Kubernetes',
    ],
    youCanTeachThem: [
      'React & Component Architecture',
      'Next.js',
      'JavaScript (ES6+)',
    ],
    bio: 'Cloud and DevOps enthusiast focused on deployment automation.',
    lookingFor: 'Next.js and frontend development.',
    availability: 'Flexible',
    status: 'available',
    lastActive: 'Active 1d ago',
  },

  {
    id: 'peer_marcus_test',
    userId: 'usr_peer_marcus',
    name: 'Marcus Chen',
    avatarInitials: 'MC',
    headline: 'Testing & Code Quality Specialist',
    college: 'UC Berkeley',
    compatibilityScore: 84,
    theyCanTeachYou: [
      'Unit & Component Testing',
      'Vitest & Jest',
      'Cypress E2E',
      'Test-Driven Development',
    ],
    youCanTeachThem: [
      'SQL & Database Design',
      'GraphQL APIs',
      'System Design',
    ],
    bio: 'Software testing specialist focused on reliable applications.',
    lookingFor: 'Database design and SQL.',
    availability: 'Weekends',
    status: 'available',
    lastActive: 'Active today',
  },

  {
    id: 'peer_sophia_fullstack',
    userId: 'usr_peer_sophia',
    name: 'Sophia Williams',
    avatarInitials: 'SW',
    headline: 'Next.js & Frontend Architecture Specialist',
    college: 'MIT',
    compatibilityScore: 82,
    theyCanTeachYou: [
      'React & Component Architecture',
      'TypeScript & Type Safety',
      'State Management',
      'Performance',
    ],
    youCanTeachThem: [
      'Machine Learning',
      'Python & PyTorch',
      'Data Pipelines',
    ],
    bio: 'Frontend engineer specializing in React and Next.js.',
    lookingFor: 'Machine learning fundamentals.',
    availability: '3 hrs / week',
    status: 'available',
    lastActive: 'Active 3h ago',
  },
];

/* =========================================================
   CALCULATE RECIPROCAL MATCHES
   ========================================================= */

export function calculateReciprocalMatches(
  profile: UserProfile,
  evidence: EvidenceItem[],
  opportunities: Opportunity[],
  assessments: Record<string, ReadinessAssessment>,
  peers: SkillSwapPeer[] = masterCommunityPeers
): ReciprocalMatchResult[] {
  const userSkills = new Set<string>();

  // Profile skills
  (profile.currentSkills || []).forEach((skill) => {
    userSkills.add(skill);
  });

  // Evidence skills
  evidence.forEach((item) => {
    (item.skills || []).forEach((skill) => {
      userSkills.add(skill);
    });
  });

  const skills = Array.from(userSkills);

  /* -------------------------------------------------------
     Find user's critical / important skill gaps
     ------------------------------------------------------- */

  const gaps: string[] = [];

  opportunities.forEach((opportunity) => {
    const assessment = assessments[opportunity.id];

    if (assessment?.matches) {
      assessment.matches.forEach((match) => {
        const weakOrMissing =
          match.matchStatus === 'Missing' ||
          match.matchStatus === 'Weak' ||
          match.matchStatus === 'Partial';

        const important =
          match.importance === 'Critical' ||
          match.importance === 'Important';

        if (weakOrMissing && important) {
          if (!gaps.includes(match.requirementName)) {
            gaps.push(match.requirementName);
          }
        }
      });
    }

    // If there is no assessment, use critical opportunity requirements
    if (!assessment) {
      (opportunity.requirements || []).forEach((requirement) => {
        if (
          requirement.importance === 'Critical' &&
          !gaps.includes(requirement.skillName)
        ) {
          gaps.push(requirement.skillName);
        }
      });
    }
  });

  /* -------------------------------------------------------
     Fallback gaps
     ------------------------------------------------------- */

  if (gaps.length === 0) {
    gaps.push(
      'Machine Learning',
      'RESTful APIs & Data Fetching',
      'Unit & Component Testing'
    );
  }

  /* -------------------------------------------------------
     Generate matches
     ------------------------------------------------------- */

  const results: ReciprocalMatchResult[] = [];

  peers.forEach((peer) => {
    const gap =
      gaps.find((userGap) =>
        peer.theyCanTeachYou.some(
          (skill) =>
            skill.toLowerCase().includes(userGap.toLowerCase()) ||
            userGap.toLowerCase().includes(skill.toLowerCase())
        )
      ) || gaps[0];

    const teaches =
      peer.theyCanTeachYou.find(
        (skill) =>
          skill.toLowerCase().includes(gap.toLowerCase()) ||
          gap.toLowerCase().includes(skill.toLowerCase())
      ) ||
      peer.theyCanTeachYou[0] ||
      gap;

    /* -----------------------------------------------------
       Find what the user can teach the peer
       ----------------------------------------------------- */

    const contribution =
      skills.find((userSkill) =>
        peer.youCanTeachThem.some(
          (wantedSkill) =>
            wantedSkill.toLowerCase().includes(userSkill.toLowerCase()) ||
            userSkill.toLowerCase().includes(wantedSkill.toLowerCase())
        )
      ) ||
      skills[0] ||
      'Web Development';

    const learns =
      peer.youCanTeachThem.find(
        (skill) =>
          skill.toLowerCase().includes(contribution.toLowerCase()) ||
          contribution.toLowerCase().includes(skill.toLowerCase())
      ) ||
      peer.youCanTeachThem[0] ||
      contribution;

    /* -----------------------------------------------------
       Match quality
       ----------------------------------------------------- */

    const directGap = peer.theyCanTeachYou.some(
      (skill) =>
        skill.toLowerCase().includes(gap.toLowerCase()) ||
        gap.toLowerCase().includes(skill.toLowerCase())
    );

    const directContribution = peer.youCanTeachThem.some(
      (skill) =>
        skill.toLowerCase().includes(contribution.toLowerCase()) ||
        contribution.toLowerCase().includes(skill.toLowerCase())
    );

    let score = peer.compatibilityScore || 78;

    if (directGap) {
      score += 5;
    }

    if (directContribution) {
      score += 5;
    }

    if (peer.status === 'available') {
      score += 2;
    }

    score = Math.min(score, 96);

    /* -----------------------------------------------------
       Build final result
       ----------------------------------------------------- */

    const result: ReciprocalMatchResult = {
      peer: {
        ...peer,
        compatibilityScore: score,
      },

      userCriticalGap: gap,

      userContribution: contribution,

      peerTeaches: teaches,

      peerLearns: learns,

      matchScore: score,

      reciprocalType: directContribution
        ? 'Mutual Exchange'
        : 'Mentor Direct',

      exchangePlan: generate3DayExchangePlan(
        gap,
        contribution,
        peer.name
      ),
    };

    results.push(result);
  });

  /* -------------------------------------------------------
     Highest match first
     ------------------------------------------------------- */

  return results.sort(
    (a, b) => b.matchScore - a.matchScore
  );
}

/* =========================================================
   3-DAY SKILLSWAP EXCHANGE PLAN
   ========================================================= */

export function generate3DayExchangePlan(
  targetSkillGap: string,
  userContribution: string,
  peerName: string
): ExchangePlanDay[] {
  return [
    {
      day: 1,
      phase: 'LEARN',
      title: `Day 1: Learn ${targetSkillGap}`,
      focus: `Understand the fundamentals and best practices of ${targetSkillGap}.`,
      mentorRole: `${peerName} explains the core concepts and reviews your starting point.`,
      studentRole: `You explain your experience with ${userContribution} and set up the project.`,
      deliverable: 'Project scaffold and learning notes.',
      estimatedHours: '1.5 - 2 hours',
      checklist: [
        'Introductory peer session',
        `Learn the fundamentals of ${targetSkillGap}`,
        'Review common mistakes',
        'Set up the project repository',
      ],
    },

    {
      day: 2,
      phase: 'BUILD',
      title: `Day 2: Build with ${targetSkillGap}`,
      focus: `Create a practical mini-project using ${targetSkillGap}.`,
      mentorRole: `${peerName} reviews your implementation and provides feedback.`,
      studentRole: `You implement the core functionality and document your decisions.`,
      deliverable: 'Working GitHub project.',
      estimatedHours: '2 - 3 hours',
      checklist: [
        `Implement ${targetSkillGap}`,
        'Handle errors and edge cases',
        'Write project documentation',
        'Submit work for peer review',
      ],
    },

    {
      day: 3,
      phase: 'PROVE',
      title: 'Day 3: Prove Your Skill',
      focus:
        'Finalize the project and submit verified evidence to Proofly.',
      mentorRole:
        `${peerName} completes the peer review and verification.`,
      studentRole:
        'You submit the final project as evidence.',
      deliverable:
        'Verified Proofly Evidence Artifact.',
      estimatedHours: '1 hour',
      checklist: [
        'Complete final peer review',
        'Deploy or publish the project',
        'Submit evidence to Proofly',
        'Check updated readiness score',
      ],
    },
  ];
}