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
} from './types';
import { storage } from './lib/storage';
import { getSupabaseClient } from './lib/supabaseClient';
import { supabaseService } from './lib/supabaseService';
import { AuthView } from './components/auth/AuthView';
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
import {
  LearningResource,
  Mentor,
  MentorRequest,
  ContactMessage,
} from './types';
import { CheckCircle2, Sparkles, X } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<NavigationTab>('dashboard');
  const [authLoading, setAuthLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [evidence, setEvidence] = useState<EvidenceItem[]>([]);
  const [assessments, setAssessments] = useState<Record<string, ReadinessAssessment>>({});
  const [trials, setTrials] = useState<CareerTrial[]>([]);
  const [peers, setPeers] = useState<SkillSwapPeer[]>([]);
  const [progress, setProgress] = useState<SkillProgressRecord[]>([]);
  const [learningResources, setLearningResources] = useState<LearningResource[]>([]);
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [contactMessages, setContactMessages] = useState<ContactMessage[]>([]);

  const [selectedOppId, setSelectedOppId] = useState<string>('');
  const [selectedTrialId, setSelectedTrialId] = useState<string>('');

  useEffect(() => {
    const client = getSupabaseClient();
    if (!client) { setAuthLoading(false); return; }
    let mounted = true;
    const loadUserData = async (uid: string, authUser?: { email?: string | null; user_metadata?: Record<string, any> }) => {
      let dbProfile = await supabaseService.getProfile(uid);
      if (!dbProfile) {
        dbProfile = await supabaseService.ensureProfile(
          uid,
          authUser?.email,
          authUser?.user_metadata?.full_name || authUser?.user_metadata?.name
        );
      }
      let dbOpportunities: Opportunity[] = [];
      let dbEvidence: EvidenceItem[] = [];
      try {
        [dbOpportunities, dbEvidence] = await Promise.all([
          supabaseService.fetchOpportunities(uid), supabaseService.fetchEvidenceItems(uid),
        ]);
      } catch (e) {
        console.warn('Proofly data load skipped; continuing with local demo data.', e);
      }
      if (!mounted) return;
      const fallbackName = authUser?.user_metadata?.full_name || authUser?.user_metadata?.name || authUser?.email?.split('@')[0] || 'Proofly User';
      const fallbackProfile: UserProfile = {
        id: uid, fullName: fallbackName, email: authUser?.email || '',
        avatarInitials: fallbackName.split(/\s+/).filter(Boolean).slice(0,2).map((x:string)=>x[0]).join('').toUpperCase() || 'PU',
        headline: 'Career Readiness Explorer', bio: '', college: '', degree: '', education: '', graduationYear: new Date().getFullYear(),
        targetRole: '', careerInterests: [], currentSkills: [], careerGoal: '', skillSwapActive: true, notificationEmail: true, notificationTrialUpdates: true
      };
      setUserId(uid); setProfile(dbProfile || fallbackProfile); setOpportunities(dbOpportunities); setEvidence(dbEvidence);
      setAssessments({}); setTrials([]); setPeers([]); setProgress([]); setLearningResources([]); setMentors([]); setContactMessages([]);
      setSelectedOppId(dbOpportunities[0]?.id || ''); setSelectedTrialId(''); setAuthLoading(false);
    };
    client.auth.getSession().then(({ data }) => {
      if (data.session?.user) loadUserData(data.session.user.id, data.session.user); else { setUserId(null); setProfile(null); setAuthLoading(false); }
    });
    const { data: listener } = client.auth.onAuthStateChange((event, session) => {
      if (session?.user) setTimeout(() => loadUserData(session.user.id, session.user), 0);
      else if (event === 'SIGNED_OUT') {
        setUserId(null); setProfile(null); setOpportunities([]); setEvidence([]); setAssessments({}); setTrials([]); setPeers([]); setProgress([]); setLearningResources([]); setMentors([]); setContactMessages([]); setAuthLoading(false);
      }
    });
    return () => { mounted = false; listener.subscription.unsubscribe(); };
  }, []);

  // Global Modals & Drawers State
  const [isAddOpportunityModalOpen, setIsAddOpportunityModalOpen] = useState(false);
  const [isAddEvidenceModalOpen, setIsAddEvidenceModalOpen] = useState(false);
  const [isCoachDrawerOpen, setIsCoachDrawerOpen] = useState(false);

  // Toast Notification Banner
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Opportunity Actions
  const handleSaveOpportunity = async (newOpp: Opportunity) => {
    const updated = [newOpp, ...opportunities.filter((o) => o.id !== newOpp.id)];
    setOpportunities(updated);
    storage.saveOpportunities(updated);
    if (userId) await supabaseService.saveOpportunity(userId, newOpp);

    // Run automatic assessment
    const newAssessment = calculateReadinessAssessment(newOpp.id, newOpp.requirements, evidence);
    const updatedAssessments = { ...assessments, [newOpp.id]: newAssessment };
    setAssessments(updatedAssessments);
    storage.saveAssessments(updatedAssessments);

    setSelectedOppId(newOpp.id);
    showToast(`Opportunity "${newOpp.title}" saved & readiness calculated.`);
  };

  const handleDeleteOpportunity = (id: string) => {
    const updated = opportunities.filter((o) => o.id !== id);
    setOpportunities(updated);
    storage.saveOpportunities(updated);
    showToast('Opportunity removed.');
  };

  const handleSetPriority = (id: string) => {
    const updated = opportunities.map((o) => ({
      ...o,
      isPriority: o.id === id,
    }));
    setOpportunities(updated);
    storage.saveOpportunities(updated);
    setSelectedOppId(id);
    showToast('Priority target opportunity updated.');
  };

  const handleAnalyzeOpportunity = (opp: Opportunity) => {
    const newAssessment = calculateReadinessAssessment(opp.id, opp.requirements, evidence);
    const updatedAssessments = { ...assessments, [opp.id]: newAssessment };
    setAssessments(updatedAssessments);
    storage.saveAssessments(updatedAssessments);

    // Update opportunity readiness score
    const updatedOpps = opportunities.map((o) =>
      o.id === opp.id ? { ...o, readinessScore: newAssessment.readinessScore } : o
    );
    setOpportunities(updatedOpps);
    storage.saveOpportunities(updatedOpps);

    setSelectedOppId(opp.id);
    setActiveTab('readiness');
  };

  // Evidence Actions
  const handleAddEvidence = async (item: EvidenceItem) => {
    const updated = [item, ...evidence];
    setEvidence(updated);
    storage.saveEvidence(updated);
    if (userId) await supabaseService.saveEvidenceItem(userId, item);

    // Recalculate assessments for all opportunities with new evidence!
    const updatedAssessments: Record<string, ReadinessAssessment> = {};
    const updatedOpps = opportunities.map((opp) => {
      const assess = calculateReadinessAssessment(opp.id, opp.requirements, updated);
      updatedAssessments[opp.id] = assess;
      return { ...opp, readinessScore: assess.readinessScore };
    });

    setAssessments(updatedAssessments);
    storage.saveAssessments(updatedAssessments);
    setOpportunities(updatedOpps);
    storage.saveOpportunities(updatedOpps);

    showToast(`Evidence "${item.title}" added. Readiness recalculated!`);
  };

  const handleDeleteEvidence = (id: string) => {
    const updated = evidence.filter((e) => e.id !== id);
    setEvidence(updated);
    storage.saveEvidence(updated);
    showToast('Evidence artifact removed.');
  };

  // Career Trial Submission & Conversion into Verified Evidence
  const handleSubmitTrial = (trialId: string, submission: TrialSubmission, newEvidence: EvidenceItem) => {
    // 1. Update Career Trial status to completed
    const updatedTrials = trials.map((t) =>
      t.id === trialId
        ? {
            ...t,
            status: 'completed' as const,
            score: submission.score,
            submission,
            completedAt: new Date().toISOString(),
          }
        : t
    );
    setTrials(updatedTrials);
    storage.saveTrials(updatedTrials);

    // 2. Add generated Evidence into Evidence Library
    const updatedEvidence = [newEvidence, ...evidence];
    setEvidence(updatedEvidence);
    storage.saveEvidence(updatedEvidence);

    // 3. Recalculate all Opportunity assessments (boosting scores!)
    const updatedAssessments: Record<string, ReadinessAssessment> = {};
    const updatedOpps = opportunities.map((opp) => {
      const assess = calculateReadinessAssessment(opp.id, opp.requirements, updatedEvidence);
      updatedAssessments[opp.id] = assess;
      return { ...opp, readinessScore: assess.readinessScore };
    });

    setAssessments(updatedAssessments);
    storage.saveAssessments(updatedAssessments);
    setOpportunities(updatedOpps);
    storage.saveOpportunities(updatedOpps);

    // 4. Log skill progression record
    const targetTrial = trials.find((t) => t.id === trialId);
    if (targetTrial) {
      const newProgress: SkillProgressRecord = {
        id: `prog_${Date.now()}`,
        skillName: targetTrial.targetSkill,
        previousLevel: 'Novice',
        currentLevel: 'Proficient',
        source: `Completed Career Trial: ${targetTrial.title}`,
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      };
      const updatedProgress = [newProgress, ...progress];
      setProgress(updatedProgress);
      storage.saveProgress(updatedProgress);
    }

    showToast(
      `🎉 Career Trial verified (${submission.score}/100)! New evidence added to portfolio and readiness increased.`
    );
  };

  const handleStartTrial = (trialId: string) => {
    setSelectedTrialId(trialId);
    setActiveTab('career-trial');
  };

  const handleConnectPeer = (peer: SkillSwapPeer) => {
    setActiveTab('skillswap');
  };

  const handleSendMessageToPeer = (peerId: string, message: string) => {
    const updated = peers.map((p) => (p.id === peerId ? { ...p, status: 'pending' as const } : p));
    setPeers(updated);
    storage.savePeers(updated);
    showToast('SkillSwap invitation sent to peer!');
  };

  const handleToggleSkillSwapActive = (active: boolean) => {
    const updated = { ...profile, skillSwapActive: active };
    setProfile(updated);
    storage.saveProfile(updated);
    showToast(`SkillSwap visibility set to ${active ? 'Visible' : 'Hidden'}.`);
  };

  const handleUpdateProfile = async (newProfile: UserProfile) => {
    setProfile(newProfile);
    storage.saveProfile(newProfile);
    if (userId) await supabaseService.updateProfile(userId, newProfile);
    showToast('Profile updated successfully.');
  };

  const handleResetData = () => {
    storage.resetToDefaults();
    setProfile(storage.getProfile());
    setOpportunities(storage.getOpportunities());
    setEvidence(storage.getEvidence());
    setAssessments(storage.getAssessments());
    setTrials(storage.getTrials());
    setPeers(storage.getPeers());
    setProgress(storage.getProgress());
    setLearningResources(storage.getLearningResources());
    setMentors(storage.getMentors());
    showToast('All demo records reset to original defaults.');
  };

  // Learning Resources Actions
  const handleAddResource = (newRes: LearningResource) => {
    const updated = [newRes, ...learningResources];
    setLearningResources(updated);
    storage.saveLearningResources(updated);
    showToast(`Learning resource "${newRes.title}" added.`);
  };

  const handleDeleteResource = (id: string) => {
    const updated = learningResources.filter((r) => r.id !== id);
    setLearningResources(updated);
    storage.saveLearningResources(updated);
    showToast('Learning resource removed.');
  };

  // Mentor Actions
  const handleAddMentor = (newMentor: Mentor) => {
    const updated = [newMentor, ...mentors];
    setMentors(updated);
    storage.saveMentors(updated);
    showToast(`Mentor "${newMentor.fullName}" onboarded.`);
  };

  const handleDeleteMentor = (id: string) => {
    const updated = mentors.filter((m) => m.id !== id);
    setMentors(updated);
    storage.saveMentors(updated);
    showToast('Mentor removed.');
  };

  const handleRequestMentorship = (req: MentorRequest) => {
    showToast(`Mentorship request submitted to ${req.mentorName}!`);
  };

  if (authLoading) return <div className="min-h-screen flex items-center justify-center bg-slate-50"><div className="text-center"><div className="h-10 w-10 border-4 border-purple-200 border-t-purple-700 rounded-full animate-spin mx-auto" /><p className="mt-4 text-sm font-semibold text-slate-600">Loading Proofly…</p></div></div>;
  if (!userId || !profile) return <AuthView />;

  // Target Opportunity & Current Assessment for active gap detection
  const selectedOpportunity = opportunities.find((o) => o.id === selectedOppId) || opportunities[0] || null;
  const currentAssessment = selectedOpportunity ? assessments[selectedOpportunity.id] || null : null;
  const activeSkillGap = currentAssessment?.biggestGap?.skillName || 'RESTful APIs & Data Fetching';
  const activeTrial = trials.find((t) => t.id === selectedTrialId) || trials[0] || null;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-purple-100 selection:text-purple-900">
      {/* Toast Banner */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-xl border border-slate-700 flex items-center gap-3 animate-in slide-in-from-bottom-5 duration-200">
          <Sparkles className="h-4 w-4 text-purple-400 shrink-0" />
          <span className="text-xs font-semibold text-slate-100">{toastMessage}</span>
          <button
            onClick={() => setToastMessage(null)}
            className="text-slate-400 hover:text-white ml-2 text-sm"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* Global Top Navbar */}
      <Navbar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        profile={profile}
        onOpenAddOpportunity={() => {
          setActiveTab('opportunities');
          setIsAddOpportunityModalOpen(true);
        }}
        onOpenAddEvidence={() => {
          setActiveTab('evidence');
          setIsAddEvidenceModalOpen(true);
        }}
        onOpenCoach={() => setIsCoachDrawerOpen(true)}
        onLogout={async () => { await getSupabaseClient()?.auth.signOut(); }}
      />

      {/* Career Coach Drawer */}
      <CareerCoachDrawer
        isOpen={isCoachDrawerOpen}
        onClose={() => setIsCoachDrawerOpen(false)}
        opportunity={selectedOpportunity}
        evidence={evidence}
        assessment={currentAssessment}
        activeTrial={activeTrial}
        onNavigate={setActiveTab}
      />

      {/* Main App Content View Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {activeTab === 'home' && (
          <LandingPageView onNavigate={setActiveTab} />
        )}

        {activeTab === 'dashboard' && (
          <DashboardView
            profile={profile}
            opportunities={opportunities}
            evidence={evidence}
            assessments={assessments}
            trials={trials}
            peers={peers}
            onNavigate={setActiveTab}
            onSelectOpportunity={(id) => {
              setSelectedOppId(id);
              setActiveTab('readiness');
            }}
            onStartTrial={handleStartTrial}
            onConnectPeer={handleConnectPeer}
          />
        )}

        {activeTab === 'opportunities' && (
          <OpportunitiesView
            opportunities={opportunities}
            onSaveOpportunity={handleSaveOpportunity}
            onDeleteOpportunity={handleDeleteOpportunity}
            onSetPriority={handleSetPriority}
            onAnalyzeOpportunity={handleAnalyzeOpportunity}
            isAddModalOpen={isAddOpportunityModalOpen}
            onCloseAddModal={() => setIsAddOpportunityModalOpen(false)}
          />
        )}

        {activeTab === 'evidence' && (
          <EvidenceLibraryView
            evidenceList={evidence}
            onAddEvidence={handleAddEvidence}
            onDeleteEvidence={handleDeleteEvidence}
            isAddModalOpen={isAddEvidenceModalOpen}
            onCloseAddModal={() => setIsAddEvidenceModalOpen(false)}
          />
        )}

        {activeTab === 'readiness' && (
          <ReadinessView
            opportunities={opportunities}
            evidence={evidence}
            assessments={assessments}
            selectedOppId={selectedOppId}
            onSelectOppId={setSelectedOppId}
            onStartTrial={handleStartTrial}
            onNavigateToEvidence={() => setActiveTab('evidence')}
            onRecalculateAssessment={(oppId) => {
              const target = opportunities.find((o) => o.id === oppId);
              if (target) handleAnalyzeOpportunity(target);
            }}
          />
        )}

        {activeTab === 'career-trial' && (
          <CareerTrialView
            trials={trials}
            selectedTrialId={selectedTrialId}
            onSelectTrialId={setSelectedTrialId}
            onSubmitTrial={handleSubmitTrial}
            onNavigateToEvidence={() => setActiveTab('evidence')}
            onNavigateToReadiness={() => setActiveTab('readiness')}
          />
        )}

        {activeTab === 'learning' && (
          <LearningResourcesView
            resources={learningResources}
            activeSkillGap={activeSkillGap}
          />
        )}

        {activeTab === 'mentors' && (
          <MentorsView
            mentors={mentors}
            activeSkillGap={activeSkillGap}
            onRequestMentorship={handleRequestMentorship}
          />
        )}

        {activeTab === 'skillswap' && (
          <SkillSwapView
            peers={peers}
            profile={profile}
            onToggleActive={handleToggleSkillSwapActive}
            onSendMessage={handleSendMessageToPeer}
          />
        )}

        {activeTab === 'profile' && (
          <ProfileView
            profile={profile}
            evidence={evidence}
            progress={progress}
            onUpdateProfile={handleUpdateProfile}
          />
        )}

        {activeTab === 'guide' && <UserGuideView onNavigateTab={setActiveTab} />}

        {activeTab === 'faq' && <FaqView />}

        {activeTab === 'contact' && <ContactView />}

        {activeTab === 'admin' && (
          <AdminDashboardView
            resources={learningResources}
            mentors={mentors}
            messages={contactMessages}
            onAddResource={handleAddResource}
            onDeleteResource={handleDeleteResource}
            onAddMentor={handleAddMentor}
            onDeleteMentor={handleDeleteMentor}
          />
        )}

        {activeTab === 'settings' && (
          <SettingsView
            profile={profile}
            onUpdateProfile={handleUpdateProfile}
            onResetData={handleResetData}
          />
        )}
      </main>

      {/* Global Footer */}
      <Footer onSelectTab={setActiveTab} />
    </div>
  );
}
