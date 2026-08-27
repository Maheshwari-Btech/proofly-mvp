import React, { useState, useEffect } from 'react';
import {
  UserProfile,
  Opportunity,
  EvidenceItem,
  ReadinessAssessment,
  CareerTrial,
  SkillSwapPeer,
  SkillProgressRecord,
  TrialSubmission,
  LearningResource,
  Mentor,
  MentorRequest,
  ContactMessage,
} from './types';

import { storage } from './lib/storage';
import { supabaseService } from './lib/supabaseService';
import { supabaseAuth } from './lib/supabaseAuth';
import { calculateReadinessAssessment } from './lib/aiSimulator';

import { Navbar, NavigationTab } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { DashboardView } from './components/dashboard/DashboardView';
import { OpportunitiesView } from './components/opportunities/OpportunitiesView';
import { EvidenceLibraryView } from './components/evidence/EvidenceLibraryView';
import { ReadinessView } from './components/readiness/ReadinessView';
import { CareerTrialView } from './components/career-trial/CareerTrialView';
import { SkillSwapView } from './components/skillswap/SkillSwapView';
import { ProfileView } from './components/profile/ProfileView';
import { UserGuideView } from './components/guide/UserGuideView';
import { FaqView } from './components/faq/FaqView';
import { ContactView } from './components/contact/ContactView';
import { SettingsView } from './components/settings/SettingsView';
import { LandingPageView } from './components/home/LandingPageView';
import { LearningResourcesView } from './components/learning/LearningResourcesView';
import { MentorsView } from './components/mentors/MentorsView';
import { AdminDashboardView } from './components/admin/AdminDashboardView';
import { CareerCoachDrawer } from './components/common/CareerCoachDrawer';
import { AuthModal } from './components/auth/AuthModal';

import { Sparkles, X } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] =
    useState<NavigationTab>('dashboard');

  // ============================================================
  // AUTH
  // ============================================================

  const [session, setSession] = useState<{
    user: any;
    accessToken: string | null;
    isAuthenticated: boolean;
  }>({
    user: null,
    accessToken: null,
    isAuthenticated: false,
  });

  const [isAuthModalOpen, setIsAuthModalOpen] =
    useState(false);

  const [authModalInitialMode, setAuthModalInitialMode] =
    useState<'login' | 'register'>('login');

  // ============================================================
  // APPLICATION DATA
  // ============================================================

  const [isLoadingUserData, setIsLoadingUserData] =
    useState(false);

  const [profile, setProfile] =
    useState<UserProfile>(storage.getProfile());

  const [opportunities, setOpportunities] =
    useState<Opportunity[]>(storage.getOpportunities());

  const [evidence, setEvidence] =
    useState<EvidenceItem[]>(storage.getEvidence());

  const [assessments, setAssessments] =
    useState<Record<string, ReadinessAssessment>>(
      storage.getAssessments()
    );

  const [trials, setTrials] =
    useState<CareerTrial[]>(storage.getTrials());

  const [peers, setPeers] =
    useState<SkillSwapPeer[]>(storage.getPeers());

  const [progress, setProgress] =
    useState<SkillProgressRecord[]>(storage.getProgress());

  const [learningResources, setLearningResources] =
    useState<LearningResource[]>(
      storage.getLearningResources()
    );

  const [mentors, setMentors] =
    useState<Mentor[]>(storage.getMentors());

  const [contactMessages, setContactMessages] =
    useState<ContactMessage[]>(
      storage.getContactMessages()
    );

  // ============================================================
  // SELECTIONS
  // ============================================================

  const [selectedOppId, setSelectedOppId] =
    useState<string>('opp_vercel_frontend');

  const [selectedTrialId, setSelectedTrialId] =
    useState<string>('trial_rest_api_bridge');

  // ============================================================
  // MODALS
  // ============================================================

  const [isAddOpportunityModalOpen, setIsAddOpportunityModalOpen] =
    useState(false);

  const [isAddEvidenceModalOpen, setIsAddEvidenceModalOpen] =
    useState(false);

  const [isCoachDrawerOpen, setIsCoachDrawerOpen] =
    useState(false);

  // ============================================================
  // TOAST
  // ============================================================

  const [toastMessage, setToastMessage] =
    useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);

    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // ============================================================
  // LOAD USER DATA
  // ============================================================

  const loadUserData = async (userId: string) => {
    setIsLoadingUserData(true);

    try {
      const [
        remoteProfile,
        remoteOpps,
        remoteEvi,
        remoteTrials,
        remotePeers,
        remoteAssessments,
      ] = await Promise.all([
        supabaseService.getProfile(userId),
        supabaseService.getOpportunities(userId),
        supabaseService.getEvidence(userId),
        supabaseService.getTrials(userId),
        supabaseService.getSkillSwapPeers(),
        supabaseService.getAssessments(userId),
      ]);

      // --------------------------------------------------------
      // PROFILE
      // --------------------------------------------------------

      if (remoteProfile) {
        setProfile(remoteProfile);

        storage.saveProfile(
          remoteProfile,
          userId
        );
      } else {
        const userObj =
          (await supabaseAuth.getSession())?.user;

        const fullName =
          userObj?.user_metadata?.full_name ||
          userObj?.email?.split('@')[0] ||
          'Member';

        const initialAuthedProfile: UserProfile = {
          id: userId,
          fullName,
          email: userObj?.email || '',
          avatarInitials: fullName
            .slice(0, 2)
            .toUpperCase(),

          headline:
            'Software Engineering Explorer',

          bio: '',
          college: '',
          degree: '',
          education: '',
          graduationYear: '2026',

          targetRole:
            'Software Engineering Intern',

          careerInterests: [
            'Frontend Development',
            'Full-Stack Web',
            'AI Systems',
          ],

          currentSkills: [],
          careerGoal: '',

          skillSwapActive: true,

          notificationEmail: true,
          notificationTrialUpdates: true,
        };

        setProfile(initialAuthedProfile);

        storage.saveProfile(
          initialAuthedProfile,
          userId
        );

        await supabaseService.saveProfile(
          initialAuthedProfile
        );
      }

      // --------------------------------------------------------
      // OPPORTUNITIES
      // --------------------------------------------------------

      if (remoteOpps) {
        setOpportunities(remoteOpps);

        storage.saveOpportunities(
          remoteOpps,
          userId
        );
      } else {
        setOpportunities([]);

        storage.saveOpportunities(
          [],
          userId
        );
      }

      // --------------------------------------------------------
      // EVIDENCE
      // --------------------------------------------------------

      if (remoteEvi) {
        setEvidence(remoteEvi);

        storage.saveEvidence(
          remoteEvi,
          userId
        );
      }

      // --------------------------------------------------------
      // ASSESSMENTS
      // --------------------------------------------------------

      if (remoteAssessments) {
        setAssessments(
          remoteAssessments
        );

        storage.saveAssessments(
          remoteAssessments,
          userId
        );
      }

      // --------------------------------------------------------
      // TRIALS
      // --------------------------------------------------------

      if (remoteTrials) {
        setTrials(remoteTrials);

        storage.saveTrials(
          remoteTrials,
          userId
        );
      }

      // --------------------------------------------------------
      // SKILLSWAP PEERS
      // --------------------------------------------------------

      if (remotePeers) {
        setPeers(remotePeers);

        storage.savePeers(
          remotePeers
        );
      }
    } catch (error) {
      console.warn(
        'Supabase fetch returned default fallback:',
        error
      );
    } finally {
      setIsLoadingUserData(false);
    }
  };

  // ============================================================
  // AUTH SESSION
  // ============================================================

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      const currentSession =
        await supabaseAuth.getSession();

      if (
        mounted &&
        currentSession &&
        currentSession.user
      ) {
        setSession({
          user: currentSession.user,
          accessToken:
            currentSession.access_token,
          isAuthenticated: true,
        });

        await loadUserData(
          currentSession.user.id
        );
      }
    };

    initializeAuth();

    const {
      data: authListener,
    } = supabaseAuth.onAuthStateChange(
      async (_event, newSession) => {
        if (
          newSession &&
          newSession.user
        ) {
          setSession({
            user: newSession.user,
            accessToken:
              newSession.access_token,
            isAuthenticated: true,
          });

          await loadUserData(
            newSession.user.id
          );
        } else {
          setSession({
            user: null,
            accessToken: null,
            isAuthenticated: false,
          });
        }
      }
    );

    return () => {
      mounted = false;
      authListener?.subscription.unsubscribe();
    };
  }, []);

  // ============================================================
  // AUTH ACTIONS
  // ============================================================

  const handleOpenAuthModal = (
    mode: 'login' | 'register' = 'login'
  ) => {
    setAuthModalInitialMode(mode);
    setIsAuthModalOpen(true);
  };

  const handleSignOut = async () => {
    await supabaseAuth.signOut();

    setSession({
      user: null,
      accessToken: null,
      isAuthenticated: false,
    });

    setProfile(
      storage.getProfile()
    );

    setOpportunities(
      storage.getOpportunities()
    );

    setEvidence(
      storage.getEvidence()
    );

    setAssessments(
      storage.getAssessments()
    );

    setTrials(
      storage.getTrials()
    );

    setPeers(
      storage.getPeers()
    );

    setProgress(
      storage.getProgress()
    );

    setSelectedOppId(
      'opp_vercel_frontend'
    );

    setSelectedTrialId(
      'trial_rest_api_bridge'
    );

    showToast(
      'Signed out of Proofly.'
    );
  };

  // ============================================================
  // OPPORTUNITY ACTIONS
  // ============================================================

  const handleSaveOpportunity = async (
    newOpp: Opportunity
  ) => {
    const oppWithUser = {
      ...newOpp,
      userId:
        session.user?.id ||
        'platform',
    };

    const updated = [
      oppWithUser,
      ...opportunities.filter(
        (o) =>
          o.id !== oppWithUser.id
      ),
    ];

    setOpportunities(updated);

    storage.saveOpportunities(
      updated,
      session.user?.id
    );

    if (session.isAuthenticated) {
      await supabaseService.saveOpportunity(
        oppWithUser
      );
    }

    const newAssessment =
      calculateReadinessAssessment(
        oppWithUser.id,
        oppWithUser.requirements,
        evidence
      );

    const updatedAssessments = {
      ...assessments,
      [oppWithUser.id]:
        newAssessment,
    };

    setAssessments(
      updatedAssessments
    );

    storage.saveAssessments(
      updatedAssessments,
      session.user?.id
    );

    if (session.isAuthenticated) {
      await supabaseService.saveAssessment(
        newAssessment,
        session.user?.id
      );
    }

    setSelectedOppId(
      oppWithUser.id
    );

    showToast(
      `Opportunity "${oppWithUser.title}" saved.`
    );
  };

  const handleDeleteOpportunity = async (
    id: string
  ) => {
    const updated =
      opportunities.filter(
        (o) => o.id !== id
      );

    setOpportunities(updated);

    storage.saveOpportunities(
      updated,
      session.user?.id
    );

    if (session.isAuthenticated) {
      await supabaseService.deleteOpportunity(
        id
      );
    }

    showToast(
      'Opportunity removed.'
    );
  };

  const handleSetPriority = (
    id: string
  ) => {
    const updated =
      opportunities.map((o) => ({
        ...o,
        isPriority:
          o.id === id,
      }));

    setOpportunities(updated);

    storage.saveOpportunities(
      updated,
      session.user?.id
    );

    setSelectedOppId(id);

    showToast(
      'Priority target opportunity updated.'
    );
  };

  const handleAnalyzeOpportunity = async (
    opp: Opportunity
  ) => {
    const newAssessment =
      calculateReadinessAssessment(
        opp.id,
        opp.requirements,
        evidence
      );

    const updatedAssessments = {
      ...assessments,
      [opp.id]:
        newAssessment,
    };

    setAssessments(
      updatedAssessments
    );

    storage.saveAssessments(
      updatedAssessments,
      session.user?.id
    );

    if (session.isAuthenticated) {
      await supabaseService.saveAssessment(
        newAssessment,
        session.user?.id
      );
    }

    const updatedOpps =
      opportunities.map((o) =>
        o.id === opp.id
          ? {
              ...o,
              readinessScore:
                newAssessment.readinessScore,
            }
          : o
      );

    setOpportunities(
      updatedOpps
    );

    storage.saveOpportunities(
      updatedOpps,
      session.user?.id
    );

    setSelectedOppId(
      opp.id
    );

    setActiveTab(
      'readiness'
    );
  };

  // ============================================================
  // EVIDENCE ACTIONS
  // ============================================================

  const handleAddEvidence = async (
    item: EvidenceItem
  ) => {
    const evidenceWithUser = {
      ...item,
      userId:
        session.user?.id ||
        profile.id,
    };

    const updated = [
      evidenceWithUser,
      ...evidence.filter(
        (e) =>
          e.id !==
          evidenceWithUser.id
      ),
    ];

    setEvidence(updated);

    storage.saveEvidence(
      updated,
      session.user?.id
    );

    if (session.isAuthenticated) {
      await supabaseService.saveEvidence(
        evidenceWithUser
      );
    }

    const updatedAssessments: Record<
      string,
      ReadinessAssessment
    > = {};

    const updatedOpps =
      opportunities.map((opp) => {
        const assess =
          calculateReadinessAssessment(
            opp.id,
            opp.requirements,
            updated
          );

        updatedAssessments[
          opp.id
        ] = assess;

        if (
          session.isAuthenticated &&
          session.user?.id
        ) {
          supabaseService.saveAssessment(
            assess,
            session.user.id
          );
        }

        return {
          ...opp,
          readinessScore:
            assess.readinessScore,
        };
      });

    setAssessments(
      updatedAssessments
    );

    storage.saveAssessments(
      updatedAssessments,
      session.user?.id
    );

    setOpportunities(
      updatedOpps
    );

    storage.saveOpportunities(
      updatedOpps,
      session.user?.id
    );

    showToast(
      `Evidence "${item.title}" added. Readiness recalculated!`
    );
  };

  const handleDeleteEvidence = async (
    id: string
  ) => {
    const updated =
      evidence.filter(
        (e) => e.id !== id
      );

    setEvidence(updated);

    storage.saveEvidence(
      updated,
      session.user?.id
    );

    if (session.isAuthenticated) {
      await supabaseService.deleteEvidence(
        id
      );
    }

    showToast(
      'Evidence artifact removed.'
    );
  };

  // ============================================================
  // CAREER TRIAL
  // ============================================================

  const handleSubmitTrial = async (
    trialId: string,
    submission: TrialSubmission,
    newEvidence: EvidenceItem
  ) => {
    const updatedTrials =
      trials.map((t) =>
        t.id === trialId
          ? {
              ...t,
              status:
                'completed' as const,
              score:
                submission.score,
              submission,
              completedAt:
                new Date().toISOString(),
            }
          : t
      );

    setTrials(
      updatedTrials
    );

    storage.saveTrials(
      updatedTrials,
      session.user?.id
    );

    if (
      session.isAuthenticated &&
      session.user?.id
    ) {
      const completedTrial =
        updatedTrials.find(
          (t) =>
            t.id === trialId
        );

      if (completedTrial) {
        await supabaseService.saveTrial(
          completedTrial,
          session.user.id
        );
      }

      await supabaseService.saveTrialSubmission(
        submission,
        session.user.id
      );
    }

    const evidenceWithUser = {
      ...newEvidence,
      userId:
        session.user?.id ||
        profile.id,
    };

    const updatedEvidence = [
      evidenceWithUser,
      ...evidence,
    ];

    setEvidence(
      updatedEvidence
    );

    storage.saveEvidence(
      updatedEvidence,
      session.user?.id
    );

    if (
      session.isAuthenticated &&
      session.user?.id
    ) {
      await supabaseService.saveEvidence(
        evidenceWithUser,
        session.user.id
      );
    }

    const updatedAssessments: Record<
      string,
      ReadinessAssessment
    > = {};

    const updatedOpps =
      opportunities.map((opp) => {
        const assess =
          calculateReadinessAssessment(
            opp.id,
            opp.requirements,
            updatedEvidence
          );

        updatedAssessments[
          opp.id
        ] = assess;

        return {
          ...opp,
          readinessScore:
            assess.readinessScore,
        };
      });

    setAssessments(
      updatedAssessments
    );

    storage.saveAssessments(
      updatedAssessments,
      session.user?.id
    );

    setOpportunities(
      updatedOpps
    );

    storage.saveOpportunities(
      updatedOpps,
      session.user?.id
    );

    const targetTrial =
      trials.find(
        (t) =>
          t.id === trialId
      );

    if (targetTrial) {
      const newProgress: SkillProgressRecord = {
        id:
          `prog_${Date.now()}`,

        userId:
          session.user?.id ||
          profile.id,

        skillName:
          targetTrial.targetSkill,

        previousLevel:
          'Novice',

        currentLevel:
          'Proficient',

        source:
          `Completed Career Trial: ${targetTrial.title}`,

        date:
          new Date().toLocaleDateString(
            'en-US',
            {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            }
          ),
      };

      const updatedProgress = [
        newProgress,
        ...progress,
      ];

      setProgress(
        updatedProgress
      );

      storage.saveProgress(
        updatedProgress,
        session.user?.id
      );
    }

    showToast(
      `🎉 Career Trial verified (${submission.score}/100)! New evidence added to portfolio and readiness increased.`
    );
  };

  const handleStartTrial = (
    trialId: string
  ) => {
    setSelectedTrialId(
      trialId
    );

    setActiveTab(
      'career-trial'
    );
  };

  // ============================================================
  // SKILLSWAP
  // ============================================================

  const handleConnectPeer = (
    _peer: SkillSwapPeer
  ) => {
    setActiveTab(
      'skillswap'
    );
  };

  const handleSendMessageToPeer = (
    peerId: string,
    _message: string
  ) => {
    const updated =
      peers.map((peer) =>
        peer.id === peerId
          ? {
              ...peer,
              status:
                'pending' as const,
            }
          : peer
      );

    setPeers(updated);

    storage.savePeers(
      updated
    );

    showToast(
      'SkillSwap invitation sent to peer!'
    );
  };

  const handleToggleSkillSwapActive =
    async (
      active: boolean
    ) => {
      const updated = {
        ...profile,
        skillSwapActive:
          active,
      };

      setProfile(updated);

      storage.saveProfile(
        updated,
        session.user?.id
      );

      if (
        session.isAuthenticated &&
        session.user?.id
      ) {
        const saved =
          await supabaseService.saveProfile(
            updated
          );

        const peerSaved =
          await supabaseService.setSkillSwapVisibility(
            session.user.id,
            active
          );

        if (
          !saved ||
          !peerSaved
        ) {
          showToast(
            'Privacy change saved locally, but cloud sync could not update every record.'
          );

          return;
        }
      }

      showToast(
        `SkillSwap visibility set to ${
          active
            ? 'Visible'
            : 'Hidden'
        }.`
      );
    };

  // ============================================================
  // PROFILE
  // ============================================================

  const handleUpdateProfile = async (
    newProfile: UserProfile
  ) => {
    setProfile(
      newProfile
    );

    storage.saveProfile(
      newProfile,
      session.user?.id
    );

    if (
      session.isAuthenticated
    ) {
      const saved =
        await supabaseService.saveProfile(
          newProfile
        );

      if (!saved) {
        showToast(
          'Profile saved locally, but cloud sync failed.'
        );

        return;
      }
    }

    showToast(
      'Profile updated successfully.'
    );
  };

  // ============================================================
  // RESET
  // ============================================================

  const handleResetData =
    async () => {
      if (
        session.isAuthenticated &&
        session.user?.id
      ) {
        const cleared =
          await supabaseService.clearUserData(
            session.user.id
          );

        if (!cleared) {
          showToast(
            'Could not reset cloud data. Please try again.'
          );

          return;
        }

        storage.clearUserData(
          session.user.id
        );

        setOpportunities([]);
        setEvidence([]);
        setAssessments({});
        setTrials([]);
        setProgress([]);

        setSelectedOppId('');
        setSelectedTrialId('');

        showToast(
          'Your Proofly workspace was reset. Your profile was kept.'
        );

        return;
      }

      storage.resetToDefaults();

      setProfile(
        storage.getProfile()
      );

      setOpportunities(
        storage.getOpportunities()
      );

      setEvidence(
        storage.getEvidence()
      );

      setAssessments(
        storage.getAssessments()
      );

      setTrials(
        storage.getTrials()
      );

      setPeers(
        storage.getPeers()
      );

      setProgress(
        storage.getProgress()
      );

      setLearningResources(
        storage.getLearningResources()
      );

      setMentors(
        storage.getMentors()
      );

      showToast(
        'Demo workspace reset to the original sample data.'
      );
    };

  // ============================================================
  // LEARNING RESOURCES
  // ============================================================

  const handleAddResource = (
    newRes: LearningResource
  ) => {
    const updated = [
      newRes,
      ...learningResources,
    ];

    setLearningResources(
      updated
    );

    storage.saveLearningResources(
      updated
    );

    showToast(
      `Learning resource "${newRes.title}" added.`
    );
  };

  const handleDeleteResource = (
    id: string
  ) => {
    const updated =
      learningResources.filter(
        (r) => r.id !== id
      );

    setLearningResources(
      updated
    );

    storage.saveLearningResources(
      updated
    );

    showToast(
      'Learning resource removed.'
    );
  };

  // ============================================================
  // MENTORS
  // ============================================================

  const handleAddMentor = (
    newMentor: Mentor
  ) => {
    const updated = [
      newMentor,
      ...mentors,
    ];

    setMentors(
      updated
    );

    storage.saveMentors(
      updated
    );

    showToast(
      `Mentor "${newMentor.fullName}" onboarded.`
    );
  };

  const handleDeleteMentor = (
    id: string
  ) => {
    const updated =
      mentors.filter(
        (m) => m.id !== id
      );

    setMentors(
      updated
    );

    storage.saveMentors(
      updated
    );

    showToast(
      'Mentor removed.'
    );
  };

  const handleRequestMentorship =
    async (
      req: MentorRequest
    ): Promise<boolean> => {
      if (
        !session.isAuthenticated ||
        !session.user?.id
      ) {
        showToast(
          'Please sign in before requesting mentorship.'
        );

        return false;
      }

      const saved =
        await supabaseService.submitMentorRequest(
          req,
          session.user.id
        );

      if (!saved) {
        showToast(
          'Could not submit the mentorship request. Please try again.'
        );

        return false;
      }

      showToast(
        `Mentorship request submitted to ${req.mentorName}!`
      );

      return true;
    };

  // ============================================================
  // ACTIVE OPPORTUNITY / GAP
  // ============================================================

  const selectedOpportunity =
    opportunities.find(
      (o) =>
        o.id === selectedOppId
    ) ||
    opportunities[0] ||
    null;

  const currentAssessment =
    selectedOpportunity
      ? assessments[
          selectedOpportunity.id
        ] || null
      : null;

  /*
   * biggestGap is a string in the current
   * ReadinessAssessment type.
   */
  const activeSkillGap =
    currentAssessment?.biggestGap ||
    'RESTful APIs & Data Fetching';

  const activeTrial =
    trials.find(
      (t) =>
        t.id === selectedTrialId
    ) ||
    trials[0] ||
    null;

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-purple-100 selection:text-purple-900">

      {/* ======================================================
          TOAST
      ====================================================== */}

      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-xl border border-slate-700 flex items-center gap-3 animate-in slide-in-from-bottom-5 duration-200">
          <Sparkles className="h-4 w-4 text-purple-400 shrink-0" />

          <span className="text-xs font-semibold text-slate-100">
            {toastMessage}
          </span>

          <button
            onClick={() =>
              setToastMessage(null)
            }
            className="text-slate-400 hover:text-white ml-2 text-sm"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* ======================================================
          AUTH MODAL
      ====================================================== */}

      <AuthModal
        isOpen={
          isAuthModalOpen
        }
        initialMode={
          authModalInitialMode
        }
        onClose={() =>
          setIsAuthModalOpen(false)
        }
        onAuthSuccess={async (
          authedUser
        ) => {
          const currentSession =
            await supabaseAuth.getSession();

          setSession({
            user: authedUser,
            accessToken:
              currentSession?.access_token ||
              null,
            isAuthenticated: true,
          });

          await loadUserData(
            authedUser.id
          );

          showToast(
            `Welcome back, ${
              authedUser.fullName ||
              authedUser.email
            }!`
          );
        }}
      />

      {/* ======================================================
          NAVBAR
      ====================================================== */}

      <Navbar
        activeTab={
          activeTab
        }
        onSelectTab={
          setActiveTab
        }
        profile={
          profile
        }
        session={
          session
        }
        onOpenAuthModal={
          handleOpenAuthModal
        }
        onSignOut={
          handleSignOut
        }
        onOpenAddOpportunity={() => {
          setActiveTab(
            'opportunities'
          );

          setIsAddOpportunityModalOpen(
            true
          );
        }}
        onOpenAddEvidence={() => {
          setActiveTab(
            'evidence'
          );

          setIsAddEvidenceModalOpen(
            true
          );
        }}
        onOpenCoach={() =>
          setIsCoachDrawerOpen(
            true
          )
        }
      />

      {/* ======================================================
          CAREER COACH
      ====================================================== */}

      <CareerCoachDrawer
        isOpen={
          isCoachDrawerOpen
        }
        onClose={() =>
          setIsCoachDrawerOpen(
            false
          )
        }
        opportunity={
          selectedOpportunity
        }
        evidence={
          evidence
        }
        assessment={
          currentAssessment
        }
        activeTrial={
          activeTrial
        }
        onNavigate={
          setActiveTab
        }
      />

      {/* ======================================================
          MAIN
      ====================================================== */}

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">

        {/* HOME */}

        {activeTab ===
          'home' && (
          <LandingPageView
            onNavigate={(tab) => {
              if (tab as string === 'login') {
                handleOpenAuthModal(
                  'login'
                );
              } else {
                setActiveTab(
                  tab
                );
              }
            }}
          />
        )}

        {/* DASHBOARD */}

        {activeTab ===
          'dashboard' && (
          <DashboardView
            profile={
              profile
            }
            opportunities={
              opportunities
            }
            evidence={
              evidence
            }
            assessments={
              assessments
            }
            trials={
              trials
            }
            peers={
              peers
            }
            isLoading={
              isLoadingUserData
            }
            onNavigate={
              setActiveTab
            }
            onSelectOpportunity={(
              id
            ) => {
              setSelectedOppId(
                id
              );

              setActiveTab(
                'readiness'
              );
            }}
            onStartTrial={
              handleStartTrial
            }
            onConnectPeer={
              handleConnectPeer
            }
          />
        )}

        {/* OPPORTUNITIES */}

        {activeTab ===
          'opportunities' && (
          <OpportunitiesView
            opportunities={
              opportunities
            }
            assessments={
              assessments
            }
            onSaveOpportunity={
              handleSaveOpportunity
            }
            onDeleteOpportunity={
              handleDeleteOpportunity
            }
            onSetPriority={
              handleSetPriority
            }
            onAnalyzeOpportunity={
              handleAnalyzeOpportunity
            }
            isAddModalOpen={
              isAddOpportunityModalOpen
            }
            onCloseAddModal={() =>
              setIsAddOpportunityModalOpen(
                false
              )
            }
          />
        )}

        {/* EVIDENCE */}

        {activeTab ===
          'evidence' && (
          <EvidenceLibraryView
            evidenceList={
              evidence
            }
            onAddEvidence={
              handleAddEvidence
            }
            onDeleteEvidence={
              handleDeleteEvidence
            }
            isAddModalOpen={
              isAddEvidenceModalOpen
            }
            onCloseAddModal={() =>
              setIsAddEvidenceModalOpen(
                false
              )
            }
          />
        )}

        {/* READINESS */}

        {activeTab ===
          'readiness' && (
          <ReadinessView
            opportunities={
              opportunities
            }
            evidence={
              evidence
            }
            assessments={
              assessments
            }
            selectedOppId={
              selectedOppId
            }
            isLoading={
              isLoadingUserData
            }
            onSelectOppId={
              setSelectedOppId
            }
            onStartTrial={
              handleStartTrial
            }
            onNavigateToEvidence={() =>
              setActiveTab(
                'evidence'
              )
            }
            onRecalculateAssessment={(
              oppId
            ) => {
              const target =
                opportunities.find(
                  (o) =>
                    o.id ===
                    oppId
                );

              if (target) {
                handleAnalyzeOpportunity(
                  target
                );
              }
            }}
          />
        )}

        {/* CAREER TRIAL */}

        {activeTab ===
          'career-trial' && (
          <CareerTrialView
            trials={
              trials
            }
            selectedTrialId={
              selectedTrialId
            }
            onSelectTrialId={
              setSelectedTrialId
            }
            onSubmitTrial={
              handleSubmitTrial
            }
            onNavigateToEvidence={() =>
              setActiveTab(
                'evidence'
              )
            }
            onNavigateToReadiness={() =>
              setActiveTab(
                'readiness'
              )
            }
          />
        )}

        {/* LEARNING */}

        {activeTab ===
          'learning' && (
          <LearningResourcesView
            resources={
              learningResources
            }
            activeSkillGap={
              activeSkillGap
            }
          />
        )}

        {/* MENTORS */}

        {activeTab ===
          'mentors' && (
          <MentorsView
            mentors={
              mentors
            }
            activeSkillGap={
              activeSkillGap
            }
            studentName={
              profile.fullName
            }
            studentId={
              profile.id
            }
            targetRole={
              profile.targetRole
            }
            onRequestMentorship={
              handleRequestMentorship
            }
          />
        )}

        {/* ====================================================
            SKILLSWAP
        ==================================================== */}

        {activeTab ===
          'skillswap' && (
          <SkillSwapView
            peers={
              peers
            }
            profile={
              profile
            }
            evidenceList={
              evidence
            }
            opportunities={
              opportunities
            }
            assessments={
              assessments
            }
            onToggleActive={
              handleToggleSkillSwapActive
            }
            onSendMessage={
              handleSendMessageToPeer
            }
            onAddEvidenceFromExchange={
              handleAddEvidence
            }
          />
        )}

        {/* PROFILE */}

        {activeTab ===
          'profile' && (
          <ProfileView
            profile={
              profile
            }
            evidence={
              evidence
            }
            progress={
              progress
            }
            onUpdateProfile={
              handleUpdateProfile
            }
          />
        )}

        {/* GUIDE */}

        {activeTab ===
          'guide' && (
          <UserGuideView
            onNavigateTab={
              setActiveTab
            }
          />
        )}

        {/* FAQ */}

        {activeTab ===
          'faq' && (
          <FaqView />
        )}

        {/* CONTACT */}

        {activeTab ===
          'contact' && (
          <ContactView />
        )}

        {/* ADMIN */}

        {activeTab ===
          'admin' && (
          <AdminDashboardView
            resources={
              learningResources
            }
            mentors={
              mentors
            }
            messages={
              contactMessages
            }
            onAddResource={
              handleAddResource
            }
            onDeleteResource={
              handleDeleteResource
            }
            onAddMentor={
              handleAddMentor
            }
            onDeleteMentor={
              handleDeleteMentor
            }
          />
        )}

        {/* SETTINGS */}

        {activeTab ===
          'settings' && (
          <SettingsView
            profile={
              profile
            }
            onUpdateProfile={
              handleUpdateProfile
            }
            onResetData={
              handleResetData
            }
          />
        )}

      </main>

      {/* ======================================================
          FOOTER
      ====================================================== */}

      <Footer
        onSelectTab={
          setActiveTab
        }
      />
    </div>
  );
}