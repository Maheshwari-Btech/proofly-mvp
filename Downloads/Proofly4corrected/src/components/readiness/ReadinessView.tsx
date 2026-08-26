import React, { useState } from 'react';
import {
  Target,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  HelpCircle,
  ArrowRight,
  ShieldCheck,
  ExternalLink,
  ChevronDown,
  Layers,
  FileCheck,
  Briefcase,
  Play,
  RotateCcw,
} from 'lucide-react';
import { Opportunity, ReadinessAssessment, EvidenceItem } from '../../types';
import { CircularProgress } from '../common/CircularProgress';
import { MatchStatusBadge, ImportanceBadge, EvidenceTypeBadge } from '../common/Badge';

interface ReadinessViewProps {
  opportunities: Opportunity[];
  evidence: EvidenceItem[];
  assessments: Record<string, ReadinessAssessment>;
  selectedOppId?: string;
  onSelectOppId: (id: string) => void;
  onStartTrial: (trialId: string) => void;
  onNavigateToEvidence: () => void;
  onRecalculateAssessment: (oppId: string) => void;
}

export const ReadinessView: React.FC<ReadinessViewProps> = ({
  opportunities,
  evidence,
  assessments,
  selectedOppId,
  onSelectOppId,
  onStartTrial,
  onNavigateToEvidence,
  onRecalculateAssessment,
}) => {
  const activeOpp =
    opportunities.find((o) => o.id === selectedOppId) ||
    opportunities.find((o) => o.isPriority) ||
    opportunities[0];

  const currentAssessment = activeOpp ? assessments[activeOpp.id] : null;
  const [selectedMatchModal, setSelectedMatchModal] = useState<any>(null);

  if (!activeOpp) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-xs">
        <Target className="h-12 w-12 text-purple-300 mx-auto mb-3" />
        <h2 className="text-xl font-bold text-slate-800">No active opportunities</h2>
        <p className="text-slate-500 text-sm max-w-md mx-auto mt-1">
          Please add a target opportunity first to benchmark your readiness.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Header & Opportunity Selector */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-purple-700 uppercase tracking-wider bg-purple-50 px-2.5 py-0.5 rounded-full border border-purple-100">
              Explainable Assessment
            </span>
            <span className="text-xs text-slate-400">&bull;</span>
            <span className="text-xs text-slate-500 font-medium">{activeOpp.company}</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            {activeOpp.title} &mdash; Readiness Analysis
          </h1>
        </div>

        {/* Opportunity Switcher */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider hidden sm:block">
            Target Role:
          </label>
          <select
            value={activeOpp.id}
            onChange={(e) => onSelectOppId(e.target.value)}
            className="px-3.5 py-2 text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-600 text-slate-800"
          >
            {opportunities.map((opp) => (
              <option key={opp.id} value={opp.id}>
                {opp.company} &mdash; {opp.title} ({opp.readinessScore}%)
              </option>
            ))}
          </select>

          <button
            onClick={() => onRecalculateAssessment(activeOpp.id)}
            title="Recalculate with latest evidence"
            className="p-2 text-slate-500 hover:text-purple-700 hover:bg-purple-50 rounded-xl border border-slate-200 transition-colors"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Assessment Overview Hero Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Gauge (4 cols) */}
          <div className="lg:col-span-4 flex flex-col items-center justify-center p-4 bg-slate-50 rounded-2xl border border-slate-100">
            <CircularProgress
              score={currentAssessment?.readinessScore || activeOpp.readinessScore}
              size={140}
              strokeWidth={3.8}
              label="Opportunity Readiness"
            />
            <p className="text-[11px] text-slate-500 text-center max-w-[200px] mt-2">
              AI-assisted estimate based on verified artifacts in your library.
            </p>
          </div>

          {/* Right Metrics (8 cols) */}
          <div className="lg:col-span-8 space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3.5 bg-emerald-50/70 border border-emerald-100 rounded-xl">
                <p className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider">
                  Strong Matches
                </p>
                <p className="text-2xl font-bold text-emerald-700 mt-1">
                  {currentAssessment?.strongMatchesCount || 0}
                </p>
                <p className="text-[11px] text-emerald-600">Verifiable artifacts</p>
              </div>

              <div className="p-3.5 bg-amber-50/70 border border-amber-100 rounded-xl">
                <p className="text-[11px] font-bold text-amber-800 uppercase tracking-wider">
                  Partial Evidence
                </p>
                <p className="text-2xl font-bold text-amber-700 mt-1">
                  {currentAssessment?.partialMatchesCount || 0}
                </p>
                <p className="text-[11px] text-amber-600">Needs more proof</p>
              </div>

              <div className="p-3.5 bg-rose-50/70 border border-rose-100 rounded-xl">
                <p className="text-[11px] font-bold text-rose-800 uppercase tracking-wider">
                  Missing Evidence
                </p>
                <p className="text-2xl font-bold text-rose-700 mt-1">
                  {currentAssessment?.missingMatchesCount || 0}
                </p>
                <p className="text-[11px] text-rose-600">No direct record</p>
              </div>

              <div className="p-3.5 bg-purple-50/70 border border-purple-100 rounded-xl">
                <p className="text-[11px] font-bold text-purple-800 uppercase tracking-wider">
                  Total Requirements
                </p>
                <p className="text-2xl font-bold text-purple-700 mt-1">
                  {activeOpp.requirements.length}
                </p>
                <p className="text-[11px] text-purple-600">Extracted competencies</p>
              </div>
            </div>

            {/* Qualitative summary banner */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 leading-relaxed flex items-start gap-3">
              <Sparkles className="h-4 w-4 text-purple-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-slate-900">Proofly Readiness Diagnostic: </span>
                {currentAssessment?.summaryAnalysis ||
                  'Your technical foundation shows solid component design skills. Focus on closing the critical API integration gap to achieve maximum readiness.'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Biggest Gap Spotlight (Cohesive Imperial Violet & Purple Gradient) */}
      {currentAssessment?.biggestGap && (
        <div className="bg-gradient-to-br from-purple-950 via-purple-900 to-indigo-950 rounded-3xl p-6 sm:p-8 text-white shadow-md border border-purple-800/60 relative overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-bold text-purple-300 uppercase tracking-widest flex items-center gap-1.5">
                  <AlertCircle className="h-4 w-4 text-purple-300" />
                  Your Highest Leverage Skill Gap
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-purple-500/20 text-purple-200 border border-purple-400/40 px-2 py-0.5 rounded-full">
                  {currentAssessment.biggestGap.importance}
                </span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2 tracking-tight">
                {currentAssessment.biggestGap.skillName}
              </h2>

              <p className="text-purple-100/90 text-xs sm:text-sm leading-relaxed max-w-2xl mb-4">
                {currentAssessment.biggestGap.whyItMatters}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-purple-900/50 p-4 rounded-2xl border border-purple-700/50 max-w-2xl backdrop-blur-xs">
                <div>
                  <span className="font-bold text-purple-300 block mb-0.5">What you already have:</span>
                  <span className="text-purple-100/80">{currentAssessment.biggestGap.whatYouHave}</span>
                </div>
                <div>
                  <span className="font-bold text-pink-300 block mb-0.5">What is missing:</span>
                  <span className="text-purple-100/80">{currentAssessment.biggestGap.whatsMissing}</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2 shrink-0">
              <button
                onClick={() => {
                  if (currentAssessment.biggestGap.trialId) {
                    onStartTrial(currentAssessment.biggestGap.trialId);
                  }
                }}
                className="bg-purple-600 hover:bg-purple-700 text-white font-bold px-6 py-3.5 rounded-xl text-sm transition-all shadow-md flex items-center justify-center gap-2"
              >
                <Play className="h-4 w-4 fill-current" />
                Start Career Trial Now
              </button>
              <p className="text-[11px] text-purple-200/80 text-center">
                Takes ~45 min &bull; Generates verified evidence
              </p>
            </div>
          </div>
        </div>
      )}

      {/* The Evidence Map Matrix (Requirement -> Evidence -> Explanation -> Action) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Evidence Map & Explainability Audit
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Inspect how every opportunity requirement is justified against your portfolio.
            </p>
          </div>
          <button
            onClick={onNavigateToEvidence}
            className="text-xs font-bold text-purple-700 hover:text-purple-800 flex items-center gap-1 self-start sm:self-center"
          >
            <FileCheck className="h-3.5 w-3.5" />
            + Add Supporting Evidence
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-6">Requirement</th>
                <th className="py-3 px-4">Importance</th>
                <th className="py-3 px-4">Mapped Evidence</th>
                <th className="py-3 px-4">Match Status</th>
                <th className="py-3 px-6">AI Explanation & Audit</th>
                <th className="py-3 px-6">Recommended Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {currentAssessment?.matches.map((match, idx) => (
                <tr key={idx} className="hover:bg-slate-50/60 transition-colors">
                  {/* Requirement Name */}
                  <td className="py-4 px-6 font-bold text-slate-900 min-w-[180px]">
                    {match.requirementName}
                  </td>

                  {/* Importance */}
                  <td className="py-4 px-4 whitespace-nowrap">
                    <ImportanceBadge importance={match.importance} />
                  </td>

                  {/* Mapped Evidence Item */}
                  <td className="py-4 px-4 min-w-[200px]">
                    {match.evidenceTitle ? (
                      <div className="flex items-center gap-2">
                        {match.evidenceType && <EvidenceTypeBadge type={match.evidenceType} />}
                        <span className="font-semibold text-slate-800 line-clamp-1">
                          {match.evidenceTitle}
                        </span>
                      </div>
                    ) : (
                      <span className="text-slate-400 italic">No direct artifact found</span>
                    )}
                  </td>

                  {/* Match Status & Confidence */}
                  <td className="py-4 px-4 whitespace-nowrap">
                    <div className="flex flex-col gap-1">
                      <MatchStatusBadge status={match.matchStatus} />
                      <span className="text-[10px] text-slate-400 font-semibold">
                        {match.confidence}% Confidence
                      </span>
                    </div>
                  </td>

                  {/* Explainable Text */}
                  <td className="py-4 px-6 text-slate-600 leading-relaxed max-w-sm">
                    {match.explanation}
                  </td>

                  {/* Recommended Action */}
                  <td className="py-4 px-6 text-purple-700 font-medium max-w-xs">
                    {match.recommendedAction}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
