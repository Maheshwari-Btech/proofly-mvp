import React from 'react';
import {
  Sparkles,
  ArrowRight,
  TrendingUp,
  FileCheck,
  CheckCircle2,
  ExternalLink,
  Users,
  AlertCircle,
  Briefcase,
  Play,
  PlusCircle,
  Layers,
  ArrowRightLeft,
  GraduationCap,
  ShieldCheck,
} from 'lucide-react';
import { Opportunity, EvidenceItem, ReadinessAssessment, CareerTrial, SkillSwapPeer, UserProfile } from '../../types';
import { CircularProgress } from '../common/CircularProgress';
import { NavigationTab } from '../layout/Navbar';
import { DashboardSkeleton } from '../common/Skeleton';

interface DashboardViewProps {
  profile: UserProfile;
  opportunities: Opportunity[];
  evidence: EvidenceItem[];
  assessments: Record<string, ReadinessAssessment>;
  trials: CareerTrial[];
  peers: SkillSwapPeer[];
  onNavigate: (tab: NavigationTab) => void;
  onSelectOpportunity: (opportunityId: string) => void;
  onStartTrial: (trialId: string) => void;
  onConnectPeer: (peer: SkillSwapPeer) => void;
  isLoading?: boolean;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  profile,
  opportunities,
  evidence,
  assessments,
  trials,
  peers,
  onNavigate,
  onSelectOpportunity,
  onStartTrial,
  onConnectPeer,
  isLoading = false,
}) => {
  if (isLoading) {
    return <DashboardSkeleton />;
  }

  // Find priority or first active opportunity
  const priorityOpportunity =
    opportunities.find((o) => o.isPriority) || opportunities[0] || null;

  const currentAssessment = priorityOpportunity
    ? assessments[priorityOpportunity.id] || null
    : null;

  const analyzedScores = opportunities
    .map((o) => assessments[o.id]?.readinessScore)
    .filter((score): score is number => score !== undefined);

  const avgReadiness =
    analyzedScores.length > 0
      ? Math.round(analyzedScores.reduce((acc, s) => acc + s, 0) / analyzedScores.length)
      : null;

  const activeTrial =
    trials.find((t) => t.status === 'assigned' || t.status === 'in_progress') || trials[0] || null;

  const recentEvidence = evidence.slice(0, 3);
  const topPeers = peers.slice(0, 2);

  // Clean Zero-State for genuine new users
  const isNewUser = opportunities.length === 0 && evidence.length === 0;

  return (
    <div className="space-y-6">
      {/* Top Banner / Welcome Header with strict user requested greeting */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            Hey, curious mind 👋
          </h1>
          <p className="text-slate-600 text-sm mt-1">
            {isNewUser
              ? 'Your Proofly journey starts here. Add your first piece of evidence or analyze a target opportunity.'
              : `You are proving your readiness for ${opportunities.length} active opportunit${
                  opportunities.length === 1 ? 'y' : 'ies'
                } backed by ${evidence.length} evidence artifact${evidence.length === 1 ? '' : 's'}.`}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => onNavigate('opportunities')}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs sm:text-sm font-bold text-white bg-purple-600 hover:bg-purple-700 rounded-xl transition-all shadow-xs"
          >
            <Briefcase className="h-4 w-4" />
            + Analyze Opportunity
          </button>
          <button
            onClick={() => onNavigate('evidence')}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs sm:text-sm font-bold text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-xl transition-colors"
          >
            <FileCheck className="h-4 w-4" />
            + Add Evidence
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
            Active Targets
          </p>
          <div className="flex items-baseline justify-between">
            <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              {opportunities.length}
            </h3>
            <span className="text-xs font-semibold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md border border-purple-100">
              Opportunities
            </span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
            Evidence Items
          </p>
          <div className="flex items-baseline justify-between">
            <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              {evidence.length}
            </h3>
            <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
              {evidence.filter((e) => e.verificationStatus === 'Verified').length} Verified
            </span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
            Avg Readiness
          </p>
          <div className="flex items-baseline justify-between">
            <h3 className="text-2xl sm:text-3xl font-extrabold text-purple-700">
              {avgReadiness !== null ? `${avgReadiness}%` : 'Not analyzed'}
            </h3>
            <span className="text-xs font-semibold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md border border-purple-100">
              AI Assessment
            </span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
            SkillSwap Peers
          </p>
          <div className="flex items-baseline justify-between">
            <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              {peers.length}
            </h3>
            <span className="text-xs font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100">
              Ready to Match
            </span>
          </div>
        </div>
      </div>

      {/* NEW USER ONBOARDING ZERO-STATE */}
      {isNewUser ? (
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-purple-900 via-indigo-950 to-slate-900 rounded-3xl p-8 sm:p-12 text-white shadow-xl border border-purple-800 relative overflow-hidden">
            <div className="max-w-2xl">
              <span className="px-3.5 py-1 bg-purple-500/20 text-purple-200 border border-purple-400/30 text-xs font-bold rounded-full uppercase tracking-wider inline-flex items-center gap-1.5 mb-4">
                <Sparkles className="h-3.5 w-3.5 text-purple-300" />
                Proofly Career Intelligence Engine
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-3">
                The missing step between applying and being ready.
              </h2>
              <p className="text-purple-200/90 text-sm sm:text-base leading-relaxed mb-8">
                Don't guess what recruiters want. Extract real requirements, prove your competency with verifiable project artifacts, resolve critical skill gaps with SkillSwap peers, and become genuinely ready.
              </p>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <button
                  onClick={() => onNavigate('opportunities')}
                  className="bg-white hover:bg-slate-100 text-purple-950 font-bold px-6 py-3.5 rounded-2xl text-sm transition-all shadow-md flex items-center justify-center gap-2"
                >
                  <Briefcase className="h-4 w-4 text-purple-700" />
                  Analyze Target Opportunity
                </button>
                <button
                  onClick={() => onNavigate('evidence')}
                  className="bg-purple-800/80 hover:bg-purple-700 text-white font-bold px-6 py-3.5 rounded-2xl text-sm border border-purple-500/40 transition-all flex items-center justify-center gap-2"
                >
                  <FileCheck className="h-4 w-4" />
                  Upload First Evidence
                </button>
              </div>
            </div>
          </div>

          {/* 4-Step Architecture Workflow */}
          <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-xs">
            <h3 className="text-base font-bold text-slate-900 uppercase tracking-wider text-center mb-8">
              The Proofly Readiness Loop
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
              <div className="p-5 rounded-2xl bg-purple-50/60 border border-purple-100 text-center flex flex-col items-center">
                <div className="h-10 w-10 rounded-xl bg-purple-700 text-white flex items-center justify-center font-bold text-sm mb-3">
                  1
                </div>
                <h4 className="font-bold text-slate-900 text-sm mb-1">NEXTCUE</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Ingest target job posting & parse critical competency requirements.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-purple-50/60 border border-purple-100 text-center flex flex-col items-center">
                <div className="h-10 w-10 rounded-xl bg-purple-700 text-white flex items-center justify-center font-bold text-sm mb-3">
                  2
                </div>
                <h4 className="font-bold text-slate-900 text-sm mb-1">PROOFLY</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Map verified project artifacts to requirements and compute Readiness Score.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-purple-50/60 border border-purple-100 text-center flex flex-col items-center">
                <div className="h-10 w-10 rounded-xl bg-purple-700 text-white flex items-center justify-center font-bold text-sm mb-3">
                  3
                </div>
                <h4 className="font-bold text-slate-900 text-sm mb-1">SKILLSWAP</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Exchange strengths with matched peers across a structured 3-day sprint.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-purple-50/60 border border-purple-100 text-center flex flex-col items-center">
                <div className="h-10 w-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-sm mb-3">
                  4
                </div>
                <h4 className="font-bold text-slate-900 text-sm mb-1">BECOME READY</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Submit new evidence, trigger reassessment, and apply with 100% verified confidence.
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* STANDARD DASHBOARD GRID WHEN DATA EXISTS */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column (8 cols) */}
          <div className="lg:col-span-8 space-y-6">
            {/* Priority Focus Card */}
            {priorityOpportunity && (
              <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 sm:p-6">
                  <span className="px-3 py-1 bg-purple-50 text-purple-700 text-xs font-bold rounded-full uppercase tracking-wider border border-purple-100 flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-purple-600 animate-pulse" />
                    Priority Focus
                  </span>
                </div>

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="flex-1 pr-0 md:pr-4">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5 flex items-center gap-1">
                      <Briefcase className="h-3.5 w-3.5 text-purple-600" />
                      Target Opportunity
                    </h3>
                    <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mb-1">
                      {priorityOpportunity.title}
                    </h2>
                    <p className="text-slate-600 text-sm font-medium mb-6 flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-slate-800">{priorityOpportunity.company}</span>
                      <span>&bull;</span>
                      <span>{priorityOpportunity.location}</span>
                      <span>&bull;</span>
                      <span className="text-slate-500">{priorityOpportunity.postedDate}</span>
                    </p>

                    <div className="flex items-center gap-3 flex-wrap">
                      <button
                        onClick={() => onNavigate('evidence')}
                        className="bg-purple-600 hover:bg-purple-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-sm flex items-center gap-2"
                      >
                        <FileCheck className="h-4 w-4" />
                        Update Evidence
                      </button>
                      <button
                        onClick={() => {
                          onSelectOpportunity(priorityOpportunity.id);
                          onNavigate('readiness');
                        }}
                        className="bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors flex items-center gap-1.5"
                      >
                        View Analysis
                        <ArrowRight className="h-4 w-4 text-slate-400" />
                      </button>
                    </div>
                  </div>

                  {/* Score Circular Gauge */}
                  <div className="flex flex-col items-center justify-center pt-4 md:pt-0 md:border-l md:border-slate-100 md:pl-10">
                    <CircularProgress
                      score={currentAssessment?.readinessScore || priorityOpportunity.readinessScore}
                      size={120}
                      strokeWidth={3.8}
                      label="Readiness Score"
                    />
                    <div className="mt-2 text-center">
                      <span className="text-[11px] font-bold text-purple-800 bg-purple-50 px-2.5 py-0.5 rounded-full border border-purple-200">
                        {currentAssessment?.strongMatchesCount || 0} Strong Verified
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Sub-grid: Recent Evidence & Career Trial Next Action */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Recent Evidence */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-2">
                      <FileCheck className="h-5 w-5 text-purple-600" />
                      <h3 className="font-bold text-slate-900 text-base">Recent Evidence</h3>
                    </div>
                    <button
                      onClick={() => onNavigate('evidence')}
                      className="text-xs text-purple-600 font-bold hover:underline flex items-center gap-1"
                    >
                      View Library
                      <ArrowRight className="h-3 w-3" />
                    </button>
                  </div>

                  <div className="space-y-3">
                    {recentEvidence.length === 0 ? (
                      <p className="text-xs text-slate-400 py-4 text-center">No evidence artifacts uploaded yet.</p>
                    ) : (
                      recentEvidence.map((evi) => {
                        const isProject = evi.type === 'Project';
                        const isCert = evi.type === 'Certificate';
                        return (
                          <div
                            key={evi.id}
                            onClick={() => onNavigate('evidence')}
                            className="flex items-center gap-3 p-3 bg-purple-50/30 hover:bg-purple-50/80 rounded-xl border border-purple-100/70 transition-colors cursor-pointer"
                          >
                            <div
                              className={`h-10 w-10 rounded-lg flex items-center justify-center font-bold text-base shrink-0 ${
                                isProject
                                  ? 'bg-purple-100 text-purple-700'
                                  : isCert
                                  ? 'bg-purple-200/70 text-purple-900'
                                  : 'bg-purple-50 text-purple-700'
                              }`}
                            >
                              {isProject ? '</>' : isCert ? '★' : '📄'}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-bold text-slate-900 truncate">{evi.title}</p>
                              <p className="text-xs text-slate-500 truncate">
                                <span className="font-semibold text-purple-700">{evi.type}</span> &bull; {evi.skills.slice(0, 2).join(', ')}
                              </p>
                            </div>
                            <span className="text-[11px] font-bold text-purple-800 bg-purple-100/70 px-2.5 py-0.5 rounded-full border border-purple-200 shrink-0">
                              {evi.verificationStatus}
                            </span>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100">
                  <button
                    onClick={() => onNavigate('evidence')}
                    className="w-full text-center text-xs font-semibold text-purple-700 hover:text-purple-800"
                  >
                    + Add New Project / Certificate
                  </button>
                </div>
              </div>

              {/* Career Trials */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-purple-600" />
                      <h3 className="font-bold text-slate-900 text-base">Career Trials</h3>
                    </div>
                    <span className="text-xs font-bold text-purple-800 bg-purple-50 border border-purple-200 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                      <TrendingUp className="h-3.5 w-3.5 text-purple-600" />
                      +15% Readiness
                    </span>
                  </div>

                  {activeTrial ? (
                    <div className="flex flex-col justify-between p-4 bg-purple-50/80 rounded-xl border border-purple-100">
                      <div className="mb-3">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <p className="text-[11px] font-bold text-purple-700 uppercase tracking-wider">
                            Next Recommended Action
                          </p>
                          <span className="text-[10px] font-bold bg-white text-purple-800 px-2 py-0.5 rounded-md border border-purple-200 shadow-2xs">
                            {activeTrial.difficulty}
                          </span>
                        </div>
                        <p className="text-sm font-bold text-slate-900">{activeTrial.title}</p>
                        <p className="text-xs text-slate-600 mt-1 line-clamp-2">
                          {activeTrial.description}
                        </p>
                        <p className="text-xs font-medium text-slate-500 mt-2">
                          ⏱️ Expected time: {activeTrial.estimatedTime}
                        </p>
                      </div>

                      <button
                        onClick={() => onStartTrial(activeTrial.id)}
                        className="w-full mt-2 bg-purple-600 hover:bg-purple-700 text-white py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-xs"
                      >
                        <Play className="h-3.5 w-3.5 fill-current" />
                        Start Simulation Now
                      </button>
                    </div>
                  ) : (
                    <div className="text-center py-6 text-slate-500">
                      <CheckCircle2 className="h-8 w-8 text-emerald-500 mx-auto mb-2" />
                      <p className="text-sm font-medium">All active trials completed!</p>
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-500">Simulates real job tasks</span>
                  <button
                    onClick={() => onNavigate('career-trial')}
                    className="font-semibold text-purple-700 hover:underline"
                  >
                    View All Trials &rarr;
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column (4 cols) */}
          <div className="lg:col-span-4 space-y-6">
            {/* Your Biggest Gap Highlight Card */}
            <div className="bg-gradient-to-br from-purple-950 via-purple-900 to-indigo-950 rounded-2xl p-6 text-white shadow-md border border-purple-800/60 relative overflow-hidden">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-purple-300 uppercase tracking-widest flex items-center gap-1.5">
                  <AlertCircle className="h-4 w-4 text-purple-300" />
                  Your Biggest Gap
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-purple-500/20 text-purple-200 border border-purple-400/40 px-2 py-0.5 rounded-full">
                  High Leverage
                </span>
              </div>

              <div className="mb-5">
                <h2 className="text-2xl font-bold text-white mb-2 tracking-tight">
                  {currentAssessment?.biggestGap.skillName || 'RESTful APIs & Data Fetching'}
                </h2>
                <p className="text-purple-100/85 text-xs sm:text-sm leading-relaxed">
                  {currentAssessment?.biggestGap.whyItMatters ||
                    'The target opportunity demands verified client-server integration. Your evidence map currently lacks a verified project showing asynchronous REST API consumption.'}
                </p>
              </div>

              <div className="space-y-2 mb-6 bg-purple-900/50 p-3.5 rounded-xl border border-purple-700/50 text-xs backdrop-blur-xs">
                <div className="flex items-center justify-between">
                  <span className="text-purple-200/80">Requirement Importance</span>
                  <span className="text-purple-200 font-bold uppercase tracking-wide">
                    {currentAssessment?.biggestGap.importance || 'Critical'}
                  </span>
                </div>
                <div className="w-full bg-purple-950/80 rounded-full h-2 overflow-hidden border border-purple-800/40">
                  <div className="bg-gradient-to-r from-purple-400 to-pink-400 h-2 rounded-full w-[90%]" />
                </div>
                <p className="text-[11px] text-purple-200/90 mt-1">
                  Closing this gap will boost readiness by <strong className="text-white font-bold">+14%</strong>.
                </p>
              </div>

              <div className="space-y-2">
                <button
                  onClick={() => {
                    if (currentAssessment?.biggestGap.trialId) {
                      onStartTrial(currentAssessment.biggestGap.trialId);
                    } else {
                      onNavigate('career-trial');
                    }
                  }}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-xl text-sm transition-all shadow-md flex items-center justify-center gap-2"
                >
                  <Sparkles className="h-4 w-4" />
                  Start Bridge Trial
                </button>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    onClick={() => onNavigate('learning')}
                    className="py-2.5 px-3 bg-purple-900/60 hover:bg-purple-800/80 text-purple-100 hover:text-white rounded-xl text-xs font-semibold border border-purple-700/60 transition-colors text-center truncate shadow-2xs"
                  >
                    📚 Tutorials
                  </button>
                  <button
                    onClick={() => onNavigate('mentors')}
                    className="py-2.5 px-3 bg-purple-900/60 hover:bg-purple-800/80 text-purple-100 hover:text-white rounded-xl text-xs font-semibold border border-purple-700/60 transition-colors text-center truncate shadow-2xs"
                  >
                    🧑‍🏫 Ask a Mentor
                  </button>
                </div>
              </div>
            </div>

            {/* SkillSwap Matches Card */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-purple-600" />
                  <h3 className="font-bold text-slate-900 text-base">SkillSwap Matches</h3>
                </div>
                <button
                  onClick={() => onNavigate('skillswap')}
                  className="text-xs text-purple-600 font-bold hover:underline"
                >
                  Find More
                </button>
              </div>

              <div className="space-y-3">
                {topPeers.map((peer) => (
                  <div
                    key={peer.id}
                    onClick={() => onConnectPeer(peer)}
                    className="p-3.5 border border-slate-100 hover:border-purple-200 bg-slate-50/50 hover:bg-purple-50/30 rounded-xl transition-all cursor-pointer group"
                  >
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2.5">
                        <div className="h-8 w-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs">
                          {peer.avatarInitials}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-900 group-hover:text-purple-700 transition-colors">
                            {peer.name}
                          </p>
                          <p className="text-[10px] text-slate-500">{peer.college}</p>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold text-purple-700 bg-purple-50 border border-purple-200 px-2 py-0.5 rounded-full">
                        {peer.compatibilityScore}% Match
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed">
                      {peer.name} is strong in <strong className="text-slate-800">{peer.theyCanTeachYou[0]}</strong>{' '}
                      and seeking <strong className="text-slate-800">{peer.youCanTeachThem[0]}</strong>.
                    </p>
                  </div>
                ))}
              </div>

              <button
                onClick={() => onNavigate('skillswap')}
                className="w-full mt-4 py-2 text-xs text-slate-600 font-semibold hover:text-purple-700 hover:bg-slate-50 rounded-lg border border-dashed border-slate-200 transition-colors flex items-center justify-center gap-1"
              >
                Discover {peers.length}+ complementary peers &rarr;
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
