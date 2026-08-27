import {
  UserProfile,
  Opportunity,
  EvidenceItem,
  ReadinessAssessment,
  CareerTrial,
  SkillSwapPeer,
  SkillProgressRecord,
  ContactMessage,
  LearningResource,
  Mentor,
} from '../types';
import {
  initialProfile,
  platformOpportunities,
  initialEvidence,
  initialReadinessAssessments,
  initialCareerTrials,
  initialSkillSwapPeers,
  initialProgressRecords,
  initialLearningResources,
  initialMentors,
} from '../data/initialData';

const BASE_PREFIX = 'proofly';

function getUserKey(userId: string | undefined | null, key: string): string {
  if (!userId || userId.trim() === '' || userId === 'guest' || userId === 'demo') {
    return `${BASE_PREFIX}:guest:${key}`;
  }
  return `${BASE_PREFIX}:user:${userId}:${key}`;
}

const GLOBAL_KEYS = {
  RESOURCES: `${BASE_PREFIX}:catalog:resources_v2`,
  MENTORS: `${BASE_PREFIX}:catalog:mentors_v2`,
  MESSAGES: `${BASE_PREFIX}:system:messages_v2`,
  PEERS: `${BASE_PREFIX}:community:peers_v2`,
};

// Purge legacy v1 demo keys if present
(() => {
  try {
    const legacyKeys = [
      'proofly_profile_v1',
      'proofly_opportunities_v1',
      'proofly_evidence_v1',
      'proofly_assessments_v1',
      'proofly_trials_v1',
      'proofly_peers_v1',
      'proofly_progress_v1',
      'proofly_messages_v1',
      'proofly_resources_v1',
      'proofly_mentors_v1',
      'proofly_profile_v2',
      'proofly_opportunities_v2',
      'proofly_evidence_v2',
      'proofly_assessments_v2',
      'proofly_trials_v2',
      'proofly_peers_v2',
      'proofly_progress_v2',
      'proofly_messages_v2',
    ];
    legacyKeys.forEach((k) => localStorage.removeItem(k));
  } catch {
    // Ignore in SSR/non-browser environments
  }
})();

export const storage = {
  // ----------------------------------------------------------------------------
  // Profile (User-Namespaced)
  // ----------------------------------------------------------------------------
  getProfile: (userId?: string): UserProfile => {
    try {
      const key = getUserKey(userId, 'profile');
      const data = localStorage.getItem(key);
      if (data) {
        return JSON.parse(data);
      }
      return { ...initialProfile, id: userId || '' };
    } catch {
      return { ...initialProfile, id: userId || '' };
    }
  },

  saveProfile: (profile: UserProfile, userId?: string): void => {
    try {
      const effectiveId = userId || profile.id;
      const key = getUserKey(effectiveId, 'profile');
      localStorage.setItem(key, JSON.stringify(profile));
    } catch (e) {
      console.error('Failed to save profile to localStorage', e);
    }
  },

  // ----------------------------------------------------------------------------
  // Opportunities (User-Namespaced with Platform Fallback)
  // ----------------------------------------------------------------------------
  getOpportunities: (userId?: string): Opportunity[] => {
    try {
      const key = getUserKey(userId, 'opportunities');
      const data = localStorage.getItem(key);
      if (data) {
        return JSON.parse(data);
      }
      // Authenticated users start with a clean local workspace. Platform/demo
      // opportunities are only shown in guest mode.
      if (userId && userId !== 'guest' && userId !== 'demo') return [];
      return platformOpportunities;
    } catch {
      return platformOpportunities;
    }
  },

  saveOpportunities: (opportunities: Opportunity[], userId?: string): void => {
    try {
      const key = getUserKey(userId, 'opportunities');
      localStorage.setItem(key, JSON.stringify(opportunities));
    } catch (e) {
      console.error('Failed to save opportunities', e);
    }
  },

  // ----------------------------------------------------------------------------
  // Evidence Items (Strictly User-Namespaced)
  // ----------------------------------------------------------------------------
  getEvidence: (userId?: string): EvidenceItem[] => {
    try {
      const key = getUserKey(userId, 'evidence');
      const data = localStorage.getItem(key);
      if (data) {
        return JSON.parse(data);
      }
      // For authenticated users, default is empty array (clean slate)
      if (userId && userId !== 'guest' && userId !== 'demo') {
        return [];
      }
      return initialEvidence;
    } catch {
      return [];
    }
  },

  saveEvidence: (evidence: EvidenceItem[], userId?: string): void => {
    try {
      const key = getUserKey(userId, 'evidence');
      localStorage.setItem(key, JSON.stringify(evidence));
    } catch (e) {
      console.error('Failed to save evidence', e);
    }
  },

  // ----------------------------------------------------------------------------
  // Readiness Assessments (Strictly User-Namespaced)
  // ----------------------------------------------------------------------------
  getAssessments: (userId?: string): Record<string, ReadinessAssessment> => {
    try {
      const key = getUserKey(userId, 'assessments');
      const data = localStorage.getItem(key);
      if (data) {
        return JSON.parse(data);
      }
      if (userId && userId !== 'guest' && userId !== 'demo') {
        return {};
      }
      return initialReadinessAssessments;
    } catch {
      return {};
    }
  },

  saveAssessments: (assessments: Record<string, ReadinessAssessment>, userId?: string): void => {
    try {
      const key = getUserKey(userId, 'assessments');
      localStorage.setItem(key, JSON.stringify(assessments));
    } catch (e) {
      console.error('Failed to save assessments', e);
    }
  },

  // ----------------------------------------------------------------------------
  // Career Trials (User-Namespaced)
  // ----------------------------------------------------------------------------
  getTrials: (userId?: string): CareerTrial[] => {
    try {
      const key = getUserKey(userId, 'trials');
      const data = localStorage.getItem(key);
      if (data) return JSON.parse(data);
      if (userId && userId !== 'guest' && userId !== 'demo') return [];
      return initialCareerTrials;
    } catch {
      return initialCareerTrials;
    }
  },

  saveTrials: (trials: CareerTrial[], userId?: string): void => {
    try {
      const key = getUserKey(userId, 'trials');
      localStorage.setItem(key, JSON.stringify(trials));
    } catch (e) {
      console.error('Failed to save trials', e);
    }
  },

  // ----------------------------------------------------------------------------
  // Skill Progression Records (User-Namespaced)
  // ----------------------------------------------------------------------------
  getProgress: (userId?: string): SkillProgressRecord[] => {
    try {
      const key = getUserKey(userId, 'progress');
      const data = localStorage.getItem(key);
      if (data) {
        return JSON.parse(data);
      }
      if (userId && userId !== 'guest' && userId !== 'demo') {
        return [];
      }
      return initialProgressRecords;
    } catch {
      return [];
    }
  },

  saveProgress: (progress: SkillProgressRecord[], userId?: string): void => {
    try {
      const key = getUserKey(userId, 'progress');
      localStorage.setItem(key, JSON.stringify(progress));
    } catch (e) {
      console.error('Failed to save progress', e);
    }
  },

  // ----------------------------------------------------------------------------
  // Shared Community & Catalogs
  // ----------------------------------------------------------------------------
  getPeers: (): SkillSwapPeer[] => {
    try {
      const data = localStorage.getItem(GLOBAL_KEYS.PEERS);
      return data ? JSON.parse(data) : initialSkillSwapPeers;
    } catch {
      return initialSkillSwapPeers;
    }
  },

  savePeers: (peers: SkillSwapPeer[]): void => {
    try {
      localStorage.setItem(GLOBAL_KEYS.PEERS, JSON.stringify(peers));
    } catch (e) {
      console.error('Failed to save peers', e);
    }
  },

  getLearningResources: (): LearningResource[] => {
    try {
      const data = localStorage.getItem(GLOBAL_KEYS.RESOURCES);
      return data ? JSON.parse(data) : initialLearningResources;
    } catch {
      return initialLearningResources;
    }
  },

  saveLearningResources: (resources: LearningResource[]): void => {
    try {
      localStorage.setItem(GLOBAL_KEYS.RESOURCES, JSON.stringify(resources));
    } catch (e) {
      console.error('Failed to save learning resources', e);
    }
  },

  getMentors: (): Mentor[] => {
    try {
      const data = localStorage.getItem(GLOBAL_KEYS.MENTORS);
      return data ? JSON.parse(data) : initialMentors;
    } catch {
      return initialMentors;
    }
  },

  saveMentors: (mentors: Mentor[]): void => {
    try {
      localStorage.setItem(GLOBAL_KEYS.MENTORS, JSON.stringify(mentors));
    } catch (e) {
      console.error('Failed to save mentors', e);
    }
  },

  getContactMessages: (): ContactMessage[] => {
    try {
      const data = localStorage.getItem(GLOBAL_KEYS.MESSAGES);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  saveContactMessage: (msg: ContactMessage): void => {
    try {
      const current = storage.getContactMessages();
      localStorage.setItem(GLOBAL_KEYS.MESSAGES, JSON.stringify([msg, ...current]));
    } catch (e) {
      console.error('Failed to save contact message', e);
    }
  },

  // ----------------------------------------------------------------------------
  // Data Isolation & Reset
  // ----------------------------------------------------------------------------
  clearUserData: (userId?: string): void => {
    try {
      const keys = ['profile', 'opportunities', 'evidence', 'assessments', 'trials', 'progress'];
      keys.forEach((k) => {
        localStorage.removeItem(getUserKey(userId, k));
      });
      // Also clear guest state
      keys.forEach((k) => {
        localStorage.removeItem(getUserKey('guest', k));
      });
    } catch (e) {
      console.error('Failed to clear user data', e);
    }
  },

  resetToDefaults: (): void => {
    try {
      // Clear all keys with proofly prefix
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(BASE_PREFIX)) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach((k) => localStorage.removeItem(k));
    } catch (e) {
      console.error('Failed to reset storage', e);
    }
  },
};
