import React, { useState } from 'react';
import {
  Sparkles,
  CheckCircle2,
  Clock,
  Play,
  FileCode,
  Github,
  Award,
  AlertCircle,
  FileCheck,
  ArrowRight,
  TrendingUp,
  RotateCcw,
  Check,
  Send,
} from 'lucide-react';
import { CareerTrial, TrialSubmission, EvidenceItem } from '../../types';
import { evaluateCareerTrialSubmission } from '../../lib/aiSimulator';
import { evaluateTrialWithAI } from '../../lib/api';

interface CareerTrialViewProps {
  trials: CareerTrial[];
  selectedTrialId?: string;
  onSelectTrialId: (id: string) => void;
  onSubmitTrial: (trialId: string, submission: TrialSubmission, newEvidence: EvidenceItem) => void;
  onNavigateToEvidence: () => void;
  onNavigateToReadiness: () => void;
}

export const CareerTrialView: React.FC<CareerTrialViewProps> = ({
  trials,
  selectedTrialId,
  onSelectTrialId,
  onSubmitTrial,
  onNavigateToEvidence,
  onNavigateToReadiness,
}) => {
  const activeTrial =
    trials.find((t) => t.id === selectedTrialId) ||
    trials.find((t) => t.status === 'assigned' || t.status === 'in_progress') ||
    trials[0];

  // Submission Form State
  const [githubUrl, setGithubUrl] = useState('https://github.com/jordandavis/rest-api-dashboard-trial');
  const [notes, setNotes] = useState(
    'Implemented resilient fetch with AbortController, retry backoff on 500 status codes, and responsive query debouncing.'
  );
  const [codeSnippet, setCodeSnippet] = useState(`// React + TypeScript REST API Fetcher Implementation
import React, { useState, useEffect } from 'react';

interface Post {
  id: number;
  title: string;
  body: string;
}

export const ResilientDataFetcher: React.FC = () => {
  const [data, setData] = useState<Post[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('https://jsonplaceholder.typicode.com/posts?_limit=8');
      if (!res.ok) throw new Error(\`HTTP error! status: \${res.status}\`);
      const json: Post[] = await res.json();
      setData(json);
    } catch (err: any) {
      setError(err.message || 'Failed to load remote resources');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) return <div className="p-4 text-purple-700 animate-pulse">Loading items...</div>;
  if (error) return (
    <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-700">
      <p>Error: {error}</p>
      <button onClick={fetchData} className="mt-2 px-3 py-1 bg-rose-600 text-white rounded">Retry Request</button>
    </div>
  );

  return (
    <div className="grid grid-cols-2 gap-4">
      {data.map((post) => (
        <div key={post.id} className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs">
          <h4 className="font-bold text-slate-800 capitalize">{post.title}</h4>
          <p className="text-xs text-slate-500 mt-1">{post.body}</p>
        </div>
      ))}
    </div>
  );
};`);

  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evaluationResult, setEvaluationResult] = useState<{
    score: number;
    feedback: any;
    generatedEvidence: EvidenceItem;
  } | null>(null);

  const handleEvaluateAndSubmit = async () => {
    if (!activeTrial) return;
    setIsEvaluating(true);

    try {
      const result = await evaluateTrialWithAI(activeTrial, {
        notes,
        githubUrl,
        codeSnippet,
      });

      setEvaluationResult(result);

      const submission: TrialSubmission = {
        id: `sub_${Date.now()}`,
        trialId: activeTrial.id,
        submittedAt: new Date().toISOString(),
        notes,
        githubUrl,
        codeSnippet,
        score: result.score,
        feedback: result.feedback,
      };

      onSubmitTrial(activeTrial.id, submission, result.generatedEvidence);
    } catch (err) {
      console.error('Error evaluating trial:', err);
    } finally {
      setIsEvaluating(false);
    }
  };

  if (!activeTrial) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-xs">
        <Sparkles className="h-12 w-12 text-purple-300 mx-auto mb-3" />
        <h2 className="text-xl font-bold text-slate-800">No active career trials</h2>
        <p className="text-slate-500 text-sm max-w-md mx-auto mt-1">
          When Proofly identifies a gap in your target opportunity, it will generate a customized simulation right here.
        </p>
      </div>
    );
  }

  const isCompleted = activeTrial.status === 'completed' || Boolean(evaluationResult);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-purple-700 uppercase tracking-wider bg-purple-50 px-2.5 py-0.5 rounded-full border border-purple-100">
              Micro-Simulation Engine
            </span>
            <span className="text-xs text-slate-400">&bull;</span>
            <span className="text-xs text-slate-500 font-medium">{activeTrial.opportunityCompany}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Career Trial: {activeTrial.targetSkill}
          </h1>
        </div>

        {/* Trial Switcher */}
        <div className="flex items-center gap-2">
          <select
            value={activeTrial.id}
            onChange={(e) => {
              onSelectTrialId(e.target.value);
              setEvaluationResult(null);
            }}
            className="px-3.5 py-2 text-xs font-bold bg-white border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-600"
          >
            {trials.map((t) => (
              <option key={t.id} value={t.id}>
                {t.title} ({t.status === 'completed' ? 'Completed' : t.difficulty})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Trial Overview Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-bold text-purple-700 bg-purple-100 px-2.5 py-0.5 rounded-md">
                Opportunity: {activeTrial.opportunityTitle}
              </span>
              <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-md">
                {activeTrial.difficulty} Difficulty
              </span>
              <span className="text-xs font-medium text-slate-500 flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                ~{activeTrial.estimatedTime}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-2">{activeTrial.title}</h2>
            <p className="text-sm text-slate-600 leading-relaxed max-w-3xl">
              {activeTrial.description}
            </p>
          </div>

          {isCompleted && (
            <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 p-4 rounded-2xl shrink-0">
              <Award className="h-10 w-10 text-emerald-600" />
              <div>
                <p className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
                  Trial Completed & Verified
                </p>
                <p className="text-2xl font-bold text-emerald-700">
                  {evaluationResult?.score || activeTrial.score || 94}/100
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Evaluation Rubric / Criteria */}
        <div className="pt-6">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
            Evaluation Rubric Benchmarks
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
            {activeTrial.rubric.map((item, idx) => (
              <div
                key={idx}
                className="flex items-start gap-2.5 p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-700"
              >
                <CheckCircle2 className="h-4 w-4 text-purple-600 shrink-0 mt-0.5" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Interactive Task Steps */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <h3 className="text-base font-bold text-slate-900 mb-4">Simulation Task Breakdown</h3>
        <div className="space-y-4">
          {activeTrial.tasks.map((task, idx) => (
            <div
              key={task.id}
              className="p-4 bg-slate-50/70 rounded-xl border border-slate-200 flex flex-col md:flex-row md:items-start justify-between gap-4"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="h-6 w-6 rounded-full bg-purple-700 text-white text-xs font-bold flex items-center justify-center">
                    {idx + 1}
                  </span>
                  <h4 className="text-sm font-bold text-slate-900">{task.title}</h4>
                  <span className="text-[11px] text-slate-400 font-medium">({task.estimatedMinutes} min)</span>
                </div>
                <p className="text-xs text-slate-600 pl-8 leading-relaxed">{task.instruction}</p>
                <div className="pl-8 pt-1">
                  <span className="text-[11px] font-semibold text-purple-700">Expected deliverable: </span>
                  <span className="text-[11px] text-slate-500">{task.expectedOutput}</span>
                </div>
              </div>

              <span className="self-start md:self-center px-2.5 py-1 text-xs font-semibold rounded-full bg-purple-50 text-purple-700 border border-purple-200 shrink-0">
                Ready for submission
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Submission Portal & AI Evaluation Output */}
      {isCompleted ? (
        /* Evaluation Feedback Card */
        <div className="bg-white rounded-2xl border border-purple-200 ring-2 ring-purple-100 p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                <Check className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">AI Evaluation & Verification Complete</h3>
                <p className="text-xs text-slate-500">
                  Your work has been officially evaluated and transformed into a verified portfolio evidence artifact.
                </p>
              </div>
            </div>

            <span className="text-2xl font-bold text-emerald-700 bg-emerald-50 px-4 py-1.5 rounded-xl border border-emerald-200">
              {evaluationResult?.score || activeTrial.score || 94}/100
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-4 bg-emerald-50/60 rounded-xl border border-emerald-100 space-y-2">
              <p className="text-xs font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                Demonstrated Strengths
              </p>
              <ul className="text-xs text-slate-700 space-y-1.5 list-disc list-inside">
                {evaluationResult?.feedback.strengths.map((s: string, i: number) => (
                  <li key={i}>{s}</li>
                )) || (
                  <>
                    <li>Clean asynchronous request handling with proper loading state guards.</li>
                    <li>Graceful error boundary and retry trigger prevents unhandled promise errors.</li>
                  </>
                )}
              </ul>
            </div>

            <div className="p-4 bg-purple-50/60 rounded-xl border border-purple-100 space-y-2">
              <p className="text-xs font-bold text-purple-800 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="h-4 w-4 text-purple-600" />
                Recommendations for Mastery
              </p>
              <ul className="text-xs text-slate-700 space-y-1.5 list-disc list-inside">
                {evaluationResult?.feedback.improvements.map((imp: string, i: number) => (
                  <li key={i}>{imp}</li>
                )) || (
                  <>
                    <li>Explore TanStack Query (React Query) for automatic caching and invalidation.</li>
                    <li>Add unit tests with Vitest or Mock Service Worker (MSW).</li>
                  </>
                )}
              </ul>
            </div>
          </div>

          <div className="p-5 bg-gradient-to-r from-purple-950 via-purple-900 to-indigo-950 text-white rounded-2xl border border-purple-800/60 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-400/30 flex items-center justify-center shrink-0">
                <TrendingUp className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-white">New Verified Evidence Added to Your Library!</p>
                <p className="text-xs text-purple-200/80">
                  Readiness score for {activeTrial.opportunityTitle} increased by +14%.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={onNavigateToReadiness}
                className="px-4 py-2.5 text-xs font-bold bg-purple-600 hover:bg-purple-700 text-white rounded-xl transition-all shadow-xs"
              >
                View Updated Readiness &rarr;
              </button>
              <button
                onClick={onNavigateToEvidence}
                className="px-4 py-2.5 text-xs font-bold bg-purple-900/60 hover:bg-purple-800 text-purple-200 hover:text-white rounded-xl border border-purple-700/60 transition-all"
              >
                Inspect Library
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Submission Portal Form */
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Submit Your Simulation Deliverable</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Provide your code snippet, GitHub repository, and architectural summary for instant evaluation.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <Github className="h-3.5 w-3.5" />
                GitHub Repository URL
              </label>
              <input
                type="url"
                value={githubUrl}
                onChange={(e) => setGithubUrl(e.target.value)}
                placeholder="https://github.com/yourname/rest-api-dashboard"
                className="w-full px-3.5 py-2.5 text-xs font-mono bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <FileCode className="h-3.5 w-3.5" />
                React / TypeScript Code Snippet
              </label>
              <textarea
                rows={10}
                value={codeSnippet}
                onChange={(e) => setCodeSnippet(e.target.value)}
                placeholder="// Paste key component implementation here..."
                className="w-full p-3 text-xs font-mono bg-slate-900 text-slate-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 leading-relaxed"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Implementation Notes & Key Technical Decisions
              </label>
              <textarea
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Explain how you handled error states, edge cases, and performance..."
                className="w-full p-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-600"
              />
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-500">
                Evaluation checks TypeScript validity, UX error handling, and component architecture.
              </span>

              <button
                onClick={handleEvaluateAndSubmit}
                disabled={isEvaluating}
                className="bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold px-6 py-3 rounded-xl transition-all flex items-center gap-2 shadow-xs"
              >
                {isEvaluating ? (
                  <>
                    <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Grading & Generating Evidence...
                  </>
                ) : (
                  <>
                    <Send className="h-3.5 w-3.5" />
                    Submit for AI Evaluation & Verification
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
