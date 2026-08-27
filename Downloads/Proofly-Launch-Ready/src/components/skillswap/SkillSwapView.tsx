import React, { useState } from 'react';
import {
  Search,
  Sparkles,
  ShieldCheck,
  Send,
  MessageSquare,
  CheckCircle2,
  Eye,
  EyeOff,
  GraduationCap,
  Clock,
  ArrowRightLeft,
  Calendar,
  Award,
} from 'lucide-react';

import {
  UserProfile,
  EvidenceItem,
  Opportunity,
  ReadinessAssessment,
  SkillSwapPeer,
} from '../../types';

import {
  calculateReciprocalMatches,
  ReciprocalMatchResult,
} from '../../lib/skillSwapMatcher';

interface SkillSwapViewProps {
  peers: SkillSwapPeer[];
  profile: UserProfile;
  evidenceList: EvidenceItem[];
  opportunities: Opportunity[];
  assessments: Record<string, ReadinessAssessment>;
  onToggleActive: (active: boolean) => void;
  onSendMessage: (peerId: string, message: string) => void;
  onAddEvidenceFromExchange?: (evidence: EvidenceItem) => void;
}

export const SkillSwapView: React.FC<SkillSwapViewProps> = ({
  peers,
  profile,
  evidenceList,
  opportunities,
  assessments,
  onToggleActive,
  onSendMessage,
  onAddEvidenceFromExchange,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const [selectedMatchForConnect, setSelectedMatchForConnect] =
    useState<ReciprocalMatchResult | null>(null);

  const [selectedPlanMatch, setSelectedPlanMatch] =
    useState<ReciprocalMatchResult | null>(null);

  const [activePlanTab, setActivePlanTab] = useState<number>(1);

  const [completedExchangeSuccess, setCompletedExchangeSuccess] =
    useState<string | null>(null);

  const [connectionMessage, setConnectionMessage] = useState('');

  const [sentSuccessPeerId, setSentSuccessPeerId] =
    useState<string | null>(null);

  /*
   * Generate reciprocal matches using:
   * - user's profile
   * - user's evidence
   * - opportunity requirements
   * - readiness assessments
   * - available SkillSwap peers
   *
   * The peers argument is now explicitly passed into
   * calculateReciprocalMatches().
   */
  const matchResults: ReciprocalMatchResult[] =
    calculateReciprocalMatches(
      profile,
      evidenceList,
      opportunities,
      assessments,
      peers
    );

  /*
   * Search / filter matches.
   */
  const filteredMatches = matchResults.filter((res) => {
    const query = searchQuery.toLowerCase().trim();

    if (!query) {
      return true;
    }

    const peer = res.peer;

    return (
      peer.name.toLowerCase().includes(query) ||
      peer.college.toLowerCase().includes(query) ||
      res.userCriticalGap.toLowerCase().includes(query) ||
      res.userContribution.toLowerCase().includes(query) ||
      peer.theyCanTeachYou.some((skill) =>
        skill.toLowerCase().includes(query)
      ) ||
      peer.youCanTeachThem.some((skill) =>
        skill.toLowerCase().includes(query)
      )
    );
  });

  /*
   * Open connection modal.
   */
  const handleOpenConnectModal = (
    match: ReciprocalMatchResult
  ) => {
    setSelectedMatchForConnect(match);

    setConnectionMessage(
      `Hi ${match.peer.name}! I noticed you specialize in ${match.peerTeaches}. I'm currently strengthening my readiness in that exact skill and would love to exchange knowledge in return for hands-on guidance on ${match.peerLearns}. Let's do a 3-day SkillSwap sprint!`
    );
  };

  /*
   * Send SkillSwap request.
   */
  const handleSendRequest = (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    if (!selectedMatchForConnect) {
      return;
    }

    onSendMessage(
      selectedMatchForConnect.peer.id,
      connectionMessage
    );

    setSentSuccessPeerId(
      selectedMatchForConnect.peer.id
    );

    setTimeout(() => {
      setSelectedMatchForConnect(null);
      setSentSuccessPeerId(null);
    }, 1600);
  };

  /*
   * Complete exchange and create evidence.
   */
  const handleCompleteExchangeAndSubmitEvidence = (
    match: ReciprocalMatchResult
  ) => {
    if (!onAddEvidenceFromExchange) {
      return;
    }

    const newEvidence: EvidenceItem = {
      id: `evi_skillswap_${Date.now()}`,
      userId: profile.id,
      title: `${match.userCriticalGap} Peer Sprint Artifact`,
      type: 'Project',

      description:
        `Completed a 3-day reciprocal SkillSwap sprint with ` +
        `${match.peer.name} (${match.peer.college}). ` +
        `Built a practical implementation demonstrating ` +
        `mastery in ${match.userCriticalGap}.`,

      issuer:
        `SkillSwap Peer Verified - ${match.peer.name}`,

      date: new Date().toLocaleDateString('en-US', {
        month: 'short',
        year: 'numeric',
      }),

      skills: [
        match.userCriticalGap,
        'Peer Collaboration',
        'Code Review',
      ],

      verificationStatus: 'Verified',

      createdAt: new Date().toISOString(),
    };

    onAddEvidenceFromExchange(newEvidence);

    setCompletedExchangeSuccess(
      match.peer.id
    );

    setTimeout(() => {
      setSelectedPlanMatch(null);
      setCompletedExchangeSuccess(null);
    }, 2000);
  };

  return (
    <div className="space-y-6">

      {/* =====================================================
          HEADER
      ====================================================== */}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">

        <div>

          <div className="flex items-center gap-2 mb-1">

            <span className="text-xs font-bold text-purple-700 uppercase tracking-wider bg-purple-50 px-2.5 py-0.5 rounded-full border border-purple-100">
              Reciprocal Skill Exchange
            </span>

          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            SkillSwap Network
          </h1>

          <p className="text-slate-600 text-sm mt-1">
            Deterministic peer matching that turns your skill gaps into verified proof.
          </p>

        </div>

        {/* VISIBILITY */}

        <div className="flex items-center gap-3 bg-white px-4 py-2.5 rounded-2xl border border-slate-200 shadow-xs">

          <div className="text-right">

            <p className="text-xs font-bold text-slate-800">
              SkillSwap Visibility
            </p>

            <p className="text-[11px] text-slate-500">
              {profile.skillSwapActive
                ? 'Active in Peer Pool'
                : 'Hidden from discovery'}
            </p>

          </div>

          <button
            onClick={() =>
              onToggleActive(
                !profile.skillSwapActive
              )
            }
            className={`p-2 rounded-xl transition-colors ${
              profile.skillSwapActive
                ? 'bg-purple-600 text-white'
                : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
            }`}
            title="Toggle SkillSwap public visibility"
          >
            {profile.skillSwapActive ? (
              <Eye className="h-4 w-4" />
            ) : (
              <EyeOff className="h-4 w-4" />
            )}
          </button>

        </div>

      </div>

      {/* =====================================================
          PHILOSOPHY
      ====================================================== */}

      <div className="bg-gradient-to-r from-purple-900 to-indigo-900 rounded-3xl p-6 sm:p-7 text-white shadow-md border border-purple-800 flex flex-col md:flex-row md:items-center justify-between gap-5">

        <div className="flex items-start gap-4">

          <div className="h-12 w-12 rounded-2xl bg-purple-700 text-white flex items-center justify-center font-bold shrink-0 shadow-sm">
            <ArrowRightLeft className="h-6 w-6" />
          </div>

          <div>

            <div className="flex items-center gap-2 mb-1">

              <span className="text-[11px] font-extrabold uppercase tracking-widest text-purple-300">
                Core Loop: NextCue → Proofly → SkillSwap → Become Ready
              </span>

            </div>

            <h2 className="text-lg font-bold text-white">
              “This isn't just learning. It's learning that becomes proof.”
            </h2>

            <p className="text-xs text-purple-200/90 mt-1 max-w-2xl leading-relaxed">
              Proofly matches your critical skill gaps with peers who can
              teach those skills, while finding skills you can contribute.
              Every 3-day exchange creates practical evidence.
            </p>

          </div>

        </div>

        <div className="flex items-center gap-2 shrink-0 text-xs font-semibold text-purple-100 bg-purple-800/60 px-3.5 py-2 rounded-xl border border-purple-600/60">

          <ShieldCheck className="h-4 w-4 text-emerald-400" />

          No Random Matching • Deterministic

        </div>

      </div>

      {/* =====================================================
          SEARCH
      ====================================================== */}

      <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">

        <div className="relative w-full">

          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />

          <input
            type="text"
            placeholder="Search by skill, peer name, or university..."
            value={searchQuery}
            onChange={(e) =>
              setSearchQuery(e.target.value)
            }
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-600 text-slate-800"
          />

        </div>

      </div>

      {/* =====================================================
          EMPTY STATE
      ====================================================== */}

      {filteredMatches.length === 0 && (

        <div className="bg-white rounded-3xl border border-slate-200 p-10 text-center">

          <Search className="h-10 w-10 text-slate-300 mx-auto mb-3" />

          <h3 className="text-base font-bold text-slate-900">
            No SkillSwap matches found
          </h3>

          <p className="text-xs text-slate-500 mt-1">
            Try searching for another skill, peer, or university.
          </p>

        </div>

      )}

      {/* =====================================================
          MATCH CARDS
      ====================================================== */}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

        {filteredMatches.map((res) => {

          const peer = res.peer;

          return (

            <div
              key={peer.id}
              className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
            >

              <div>

                {/* PEER */}

                <div className="flex items-center justify-between gap-3 mb-4">

                  <div className="flex items-center gap-3">

                    <div className="h-11 w-11 rounded-2xl bg-purple-100 text-purple-800 font-bold text-sm flex items-center justify-center border border-purple-200">
                      {peer.avatarInitials}
                    </div>

                    <div>

                      <h3 className="text-base font-bold text-slate-900">
                        {peer.name}
                      </h3>

                      <p className="text-xs text-slate-500 flex items-center gap-1">

                        <GraduationCap className="h-3.5 w-3.5 text-purple-600" />

                        {peer.college}

                      </p>

                    </div>

                  </div>

                  <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-purple-50 text-purple-700 border border-purple-200">
                    {res.matchScore}% Match
                  </span>

                </div>

                {/* BIO */}

                <p className="text-xs text-slate-600 line-clamp-2 mb-4 leading-relaxed">
                  {peer.bio}
                </p>

                {/* GAP */}

                <div className="space-y-2.5 mb-4">

                  <div className="p-3 bg-rose-50/70 rounded-2xl border border-rose-100">

                    <span className="text-[10px] font-bold text-rose-900 uppercase tracking-wider block mb-1">
                      Your Critical Gap
                    </span>

                    <span className="inline-block px-2.5 py-1 text-xs font-bold bg-white text-rose-800 rounded-lg border border-rose-200">
                      {res.userCriticalGap}
                    </span>

                  </div>

                  {/* CONTRIBUTION */}

                  <div className="p-3 bg-purple-50/70 rounded-2xl border border-purple-100">

                    <span className="text-[10px] font-bold text-purple-900 uppercase tracking-wider block mb-1">
                      You Can Contribute
                    </span>

                    <span className="inline-block px-2.5 py-1 text-xs font-bold bg-white text-purple-800 rounded-lg border border-purple-200">
                      {res.userContribution}
                    </span>

                  </div>

                </div>

                {/* AVAILABILITY */}

                <div className="flex items-center justify-between text-[11px] text-slate-400 mb-4 pt-1">

                  <span className="flex items-center gap-1 font-medium text-slate-600">

                    <Clock className="h-3.5 w-3.5 text-purple-600" />

                    {peer.availability}

                  </span>

                  <span className="font-medium text-slate-500">
                    {peer.lastActive}
                  </span>

                </div>

              </div>

              {/* BUTTONS */}

              <div className="pt-4 border-t border-slate-100 space-y-2">

                <button
                  onClick={() => {
                    setActivePlanTab(1);
                    setSelectedPlanMatch(res);
                  }}
                  className="w-full bg-purple-50 hover:bg-purple-100 text-purple-800 font-bold py-2.5 px-4 rounded-xl text-xs transition-all flex items-center justify-center gap-1.5 border border-purple-200"
                >

                  <Calendar className="h-3.5 w-3.5" />

                  View 3-Day Exchange Plan

                </button>

                <button
                  onClick={() =>
                    handleOpenConnectModal(res)
                  }
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-2.5 px-4 rounded-xl text-xs transition-all flex items-center justify-center gap-2"
                >

                  <MessageSquare className="h-3.5 w-3.5" />

                  Connect & Propose Exchange

                </button>

              </div>

            </div>

          );
        })}

      </div>

      {/* =====================================================
          3-DAY PLAN MODAL
      ====================================================== */}

      {selectedPlanMatch && (

        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">

          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 max-h-[92vh] overflow-y-auto">

            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">

              <div>

                <span className="text-[11px] font-bold text-purple-700 uppercase tracking-wider bg-purple-50 px-2.5 py-0.5 rounded-full border border-purple-100">
                  Sprint Methodology
                </span>

                <h3 className="text-xl font-extrabold text-slate-900 mt-1">
                  3-Day SkillSwap Sprint with{' '}
                  {selectedPlanMatch.peer.name}
                </h3>

              </div>

              <button
                onClick={() =>
                  setSelectedPlanMatch(null)
                }
                className="text-slate-400 hover:text-slate-700 text-xl font-bold p-1 rounded-xl hover:bg-slate-100"
              >
                ×
              </button>

            </div>

            {completedExchangeSuccess ===
            selectedPlanMatch.peer.id ? (

              <div className="text-center py-10 space-y-3">

                <div className="h-16 w-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">

                  <CheckCircle2 className="h-10 w-10" />

                </div>

                <h4 className="text-xl font-extrabold text-slate-900">
                  Evidence Verified & Added!
                </h4>

                <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
                  Your 3-day SkillSwap sprint artifact has
                  been added to your Proofly Evidence Library.
                </p>

              </div>

            ) : (

              <div className="space-y-6">

                {/* OVERVIEW */}

                <div className="p-4 bg-purple-50/80 rounded-2xl border border-purple-100 flex items-start gap-3">

                  <Sparkles className="h-5 w-5 text-purple-700 shrink-0 mt-0.5" />

                  <div className="text-xs text-purple-950 leading-relaxed">

                    <strong>Exchange Objective:</strong>{' '}

                    You bridge{' '}

                    <span className="font-bold text-rose-700 bg-white px-1.5 py-0.5 rounded border border-rose-200">
                      {selectedPlanMatch.userCriticalGap}
                    </span>{' '}

                    while sharing knowledge on{' '}

                    <span className="font-bold text-purple-700 bg-white px-1.5 py-0.5 rounded border border-purple-200">
                      {selectedPlanMatch.userContribution}
                    </span>.

                  </div>

                </div>

                {/* DAY TABS */}

                <div className="grid grid-cols-3 gap-2 p-1.5 bg-slate-100 rounded-2xl">

                  {selectedPlanMatch.exchangePlan.map(
                    (day) => (

                      <button
                        key={day.day}
                        onClick={() =>
                          setActivePlanTab(day.day)
                        }
                        className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all ${
                          activePlanTab === day.day
                            ? 'bg-purple-700 text-white shadow-xs'
                            : 'text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        DAY {day.day} • {day.phase}
                      </button>

                    )
                  )}

                </div>

                {/* ACTIVE DAY */}

                {(() => {

                  const activeDay =
                    selectedPlanMatch.exchangePlan.find(
                      (day) =>
                        day.day === activePlanTab
                    ) ||
                    selectedPlanMatch.exchangePlan[0];

                  return (

                    <div className="space-y-4 bg-slate-50/70 p-5 rounded-2xl border border-slate-200">

                      <div>

                        <div className="flex items-center justify-between mb-1">

                          <span className="text-[11px] font-extrabold uppercase tracking-wider text-purple-700">
                            Phase: {activeDay.phase}
                          </span>

                          <span className="text-xs text-slate-500 font-semibold flex items-center gap-1">

                            <Clock className="h-3.5 w-3.5" />

                            {activeDay.estimatedHours}

                          </span>

                        </div>

                        <h4 className="text-base font-bold text-slate-900">
                          {activeDay.title}
                        </h4>

                        <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                          {activeDay.focus}
                        </p>

                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

                        <div className="p-3 bg-white rounded-xl border border-slate-200">

                          <span className="text-[10px] font-bold text-purple-800 uppercase block mb-1">
                            Peer Role
                          </span>

                          <p className="text-xs text-slate-700 leading-relaxed">
                            {activeDay.mentorRole}
                          </p>

                        </div>

                        <div className="p-3 bg-white rounded-xl border border-slate-200">

                          <span className="text-[10px] font-bold text-purple-800 uppercase block mb-1">
                            Your Role
                          </span>

                          <p className="text-xs text-slate-700 leading-relaxed">
                            {activeDay.studentRole}
                          </p>

                        </div>

                      </div>

                      <div>

                        <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-2">
                          Day {activeDay.day} Checklist
                        </span>

                        <ul className="space-y-1.5">

                          {activeDay.checklist.map(
                            (item, index) => (

                              <li
                                key={index}
                                className="text-xs text-slate-600 flex items-start gap-2"
                              >

                                <CheckCircle2 className="h-3.5 w-3.5 text-purple-600 shrink-0 mt-0.5" />

                                <span>
                                  {item}
                                </span>

                              </li>

                            )
                          )}

                        </ul>

                      </div>

                    </div>

                  );
                })()}

                {/* ACTIONS */}

                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-100">

                  <button
                    onClick={() =>
                      handleOpenConnectModal(
                        selectedPlanMatch
                      )
                    }
                    className="w-full sm:w-auto px-4 py-2.5 text-xs font-bold text-purple-700 bg-purple-50 hover:bg-purple-100 rounded-xl transition-colors flex items-center justify-center gap-1.5"
                  >

                    <Send className="h-3.5 w-3.5" />

                    Propose Sprint

                  </button>

                  <button
                    onClick={() =>
                      handleCompleteExchangeAndSubmitEvidence(
                        selectedPlanMatch
                      )
                    }
                    className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition-all flex items-center justify-center gap-2"
                  >

                    <Award className="h-4 w-4" />

                    Complete Sprint & Submit Evidence

                  </button>

                </div>

              </div>

            )}

          </div>

        </div>

      )}

      {/* =====================================================
          CONNECT MODAL
      ====================================================== */}

      {selectedMatchForConnect && (

        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">

          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200">

            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">

              <h3 className="text-lg font-bold text-slate-900">
                Propose Exchange with{' '}
                {selectedMatchForConnect.peer.name}
              </h3>

              <button
                onClick={() =>
                  setSelectedMatchForConnect(null)
                }
                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                ×
              </button>

            </div>

            {sentSuccessPeerId ===
            selectedMatchForConnect.peer.id ? (

              <div className="text-center py-8">

                <CheckCircle2 className="h-12 w-12 text-emerald-600 mx-auto mb-2" />

                <p className="text-base font-bold text-slate-900">
                  SkillSwap Invitation Sent!
                </p>

                <p className="text-xs text-slate-500 mt-1">
                  {selectedMatchForConnect.peer.name} has
                  been notified.
                </p>

              </div>

            ) : (

              <form
                onSubmit={handleSendRequest}
                className="space-y-4"
              >

                <div className="p-3.5 bg-purple-50 rounded-2xl border border-purple-100 text-xs text-purple-900 space-y-1">

                  <p>
                    <strong>Your Critical Gap:</strong>{' '}
                    {selectedMatchForConnect.userCriticalGap}
                  </p>

                  <p>
                    <strong>Your Contribution:</strong>{' '}
                    {selectedMatchForConnect.userContribution}
                  </p>

                </div>

                <div>

                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Personalized Invitation Note
                  </label>

                  <textarea
                    rows={4}
                    required
                    value={connectionMessage}
                    onChange={(e) =>
                      setConnectionMessage(
                        e.target.value
                      )
                    }
                    className="w-full p-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-600"
                  />

                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">

                  <button
                    type="button"
                    onClick={() =>
                      setSelectedMatchForConnect(null)
                    }
                    className="px-4 py-2 text-xs font-semibold text-slate-600"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition-all flex items-center gap-2"
                  >

                    <Send className="h-3.5 w-3.5" />

                    Send SkillSwap Request

                  </button>

                </div>

              </form>

            )}

          </div>

        </div>

      )}

    </div>
  );
};