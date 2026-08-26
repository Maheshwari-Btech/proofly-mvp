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
  initialOpportunities,
  initialEvidence,
  initialReadinessAssessments,
  initialCareerTrials,
  initialSkillSwapPeers,
  initialProgressRecords,
  initialLearningResources,
  initialMentors,
} from '../data/initialData';

const STORAGE_KEYS = {
  PROFILE: 'proofly_profile_v1',
  OPPORTUNITIES: 'proofly_opportunities_v1',
  EVIDENCE: 'proofly_evidence_v1',
  ASSESSMENTS: 'proofly_assessments_v1',
  TRIALS: 'proofly_trials_v1',
  PEERS: 'proofly_peers_v1',
  PROGRESS: 'proofly_progress_v1',
  MESSAGES: 'proofly_messages_v1',
  RESOURCES: 'proofly_resources_v1',
  MENTORS: 'proofly_mentors_v1',
};

export const storage = {
  getProfile: (): UserProfile => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PROFILE);
      return data ? JSON.parse(data) : initialProfile;
    } catch {
      return initialProfile;
    }
  },

  saveProfile: (profile: UserProfile): void => {
    try {
      localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
    } catch (e) {
      console.error('Failed to save profile to localStorage', e);
    }
  },

  getOpportunities: (): Opportunity[] => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.OPPORTUNITIES);
      return data ? JSON.parse(data) : initialOpportunities;
    } catch {
      return initialOpportunities;
    }
  },

  saveOpportunities: (opportunities: Opportunity[]): void => {
    try {
      localStorage.setItem(STORAGE_KEYS.OPPORTUNITIES, JSON.stringify(opportunities));
    } catch (e) {
      console.error('Failed to save opportunities', e);
    }
  },

  getEvidence: (): EvidenceItem[] => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.EVIDENCE);
      return data ? JSON.parse(data) : initialEvidence;
    } catch {
      return initialEvidence;
    }
  },

  saveEvidence: (evidence: EvidenceItem[]): void => {
    try {
      localStorage.setItem(STORAGE_KEYS.EVIDENCE, JSON.stringify(evidence));
    } catch (e) {
      console.error('Failed to save evidence', e);
    }
  },

  getAssessments: (): Record<string, ReadinessAssessment> => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ASSESSMENTS);
      return data ? JSON.parse(data) : initialReadinessAssessments;
    } catch {
      return initialReadinessAssessments;
    }
  },

  saveAssessments: (assessments: Record<string, ReadinessAssessment>): void => {
    try {
      localStorage.setItem(STORAGE_KEYS.ASSESSMENTS, JSON.stringify(assessments));
    } catch (e) {
      console.error('Failed to save assessments', e);
    }
  },

  getTrials: (): CareerTrial[] => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.TRIALS);
      return data ? JSON.parse(data) : initialCareerTrials;
    } catch {
      return initialCareerTrials;
    }
  },

  saveTrials: (trials: CareerTrial[]): void => {
    try {
      localStorage.setItem(STORAGE_KEYS.TRIALS, JSON.stringify(trials));
    } catch (e) {
      console.error('Failed to save trials', e);
    }
  },

  getPeers: (): SkillSwapPeer[] => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PEERS);
      return data ? JSON.parse(data) : initialSkillSwapPeers;
    } catch {
      return initialSkillSwapPeers;
    }
  },

  savePeers: (peers: SkillSwapPeer[]): void => {
    try {
      localStorage.setItem(STORAGE_KEYS.PEERS, JSON.stringify(peers));
    } catch (e) {
      console.error('Failed to save peers', e);
    }
  },

  getProgress: (): SkillProgressRecord[] => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PROGRESS);
      return data ? JSON.parse(data) : initialProgressRecords;
    } catch {
      return initialProgressRecords;
    }
  },

  saveProgress: (progress: SkillProgressRecord[]): void => {
    try {
      localStorage.setItem(STORAGE_KEYS.PROGRESS, JSON.stringify(progress));
    } catch (e) {
      console.error('Failed to save progress', e);
    }
  },

  getLearningResources: (): LearningResource[] => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.RESOURCES);
      return data ? JSON.parse(data) : initialLearningResources;
    } catch {
      return initialLearningResources;
    }
  },

  saveLearningResources: (resources: LearningResource[]): void => {
    try {
      localStorage.setItem(STORAGE_KEYS.RESOURCES, JSON.stringify(resources));
    } catch (e) {
      console.error('Failed to save learning resources', e);
    }
  },

  getMentors: (): Mentor[] => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.MENTORS);
      return data ? JSON.parse(data) : initialMentors;
    } catch {
      return initialMentors;
    }
  },

  saveMentors: (mentors: Mentor[]): void => {
    try {
      localStorage.setItem(STORAGE_KEYS.MENTORS, JSON.stringify(mentors));
    } catch (e) {
      console.error('Failed to save mentors', e);
    }
  },

  getContactMessages: (): ContactMessage[] => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.MESSAGES);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  saveContactMessage: (msg: ContactMessage): void => {
    try {
      const current = storage.getContactMessages();
      localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify([msg, ...current]));
    } catch (e) {
      console.error('Failed to save contact message', e);
    }
  },

  resetToDefaults: (): void => {
    try {
      localStorage.removeItem(STORAGE_KEYS.PROFILE);
      localStorage.removeItem(STORAGE_KEYS.OPPORTUNITIES);
      localStorage.removeItem(STORAGE_KEYS.EVIDENCE);
      localStorage.removeItem(STORAGE_KEYS.ASSESSMENTS);
      localStorage.removeItem(STORAGE_KEYS.TRIALS);
      localStorage.removeItem(STORAGE_KEYS.PEERS);
      localStorage.removeItem(STORAGE_KEYS.PROGRESS);
      localStorage.removeItem(STORAGE_KEYS.MESSAGES);
    } catch (e) {
      console.error('Failed to reset storage', e);
    }
  },
};
