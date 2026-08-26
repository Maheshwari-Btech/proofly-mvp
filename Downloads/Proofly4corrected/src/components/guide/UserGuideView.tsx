import React from 'react';
import {
  BookOpen,
  Target,
  FileCheck,
  Sparkles,
  TrendingUp,
  Users,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react';

interface UserGuideViewProps {
  onNavigateTab: (tab: any) => void;
}

export const UserGuideView: React.FC<UserGuideViewProps> = ({ onNavigateTab }) => {
  const steps = [
    {
      step: 1,
      title: 'What is Proofly?',
      content:
        'Proofly is an AI-assisted career readiness platform that shifts student evaluation from generic keyword resumes to verifiable, explainable evidence. Instead of guessing if you qualify, Proofly gives you an honest, actionable roadmap.',
    },
    {
      step: 2,
      title: 'Targeting an Opportunity',
      content:
        'Add any job or internship by pasting the description text, entering the URL, uploading a PDF specification, or manual input. Proofly automatically extracts required and preferred competencies with weighted importance.',
    },
    {
      step: 3,
      title: 'Building Your Evidence Library',
      content:
        'Upload certificates, GitHub repository links, coursework, previous internship descriptions, and projects. Proofly maps these items to prove technical and soft skill competencies.',
    },
    {
      step: 4,
      title: 'Understanding Your Readiness Score',
      content:
        'The readiness score (e.g. 72%) is an explainable estimate calculated by weighting critical vs. bonus requirements against verifiable proof. It is non-judgmental and highlights clear paths for rapid growth.',
    },
    {
      step: 5,
      title: 'The Evidence Map Audit',
      content:
        'Review the exact relationship: Requirement → Mapped Artifact → Match Status (Strong, Partial, Weak, Missing) → AI Explanation → Actionable Recommendation.',
    },
    {
      step: 6,
      title: 'Closing Your Biggest Skill Gap',
      content:
        'Proofly isolates the single highest-leverage gap holding your readiness score back and generates a customized simulation to solve it.',
    },
    {
      step: 7,
      title: 'Taking a Career Trial',
      content:
        'Career Trials are realistic mini-workplace simulations. Build real code, submit your repository link or notes, and receive instant AI evaluation with rubric feedback.',
    },
    {
      step: 8,
      title: 'Automatic Evidence Conversion',
      content:
        'Completed Career Trials automatically convert into verified evidence artifacts in your library, immediately boosting your opportunity readiness score.',
    },
    {
      step: 9,
      title: 'Using SkillSwap with Complementary Peers',
      content:
        'Find university peers whose strengths solve your gaps and vice versa. Exchange mock interviews, code reviews, and architecture guidance safely.',
    },
    {
      step: 10,
      title: 'Privacy & Data Protection',
      content:
        'Your documents and assessments are private to your account. SkillSwap only shares information you explicitly opt into displaying.',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs">
        <div className="flex items-center gap-3 mb-2">
          <div className="h-10 w-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
            <BookOpen className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Proofly Master User Guide
            </h1>
            <p className="text-xs text-slate-500">
              The complete manual to transforming career ambitions into verifiable readiness.
            </p>
          </div>
        </div>
      </div>

      {/* Core Loop Diagram */}
      <div className="bg-purple-50/80 rounded-2xl p-6 sm:p-8 border border-purple-100 shadow-xs">
        <h3 className="text-sm font-bold text-purple-950 uppercase tracking-wider mb-4 text-center">
          The Proofly Continuous Readiness Loop
        </h3>
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4 text-xs font-bold text-slate-800">
          <span className="px-3 py-1.5 bg-white rounded-xl border border-purple-200 text-purple-700 shadow-xs">
            1. Opportunity
          </span>
          <span className="text-purple-400">&rarr;</span>
          <span className="px-3 py-1.5 bg-white rounded-xl border border-purple-200 text-purple-700 shadow-xs">
            2. Requirements
          </span>
          <span className="text-purple-400">&rarr;</span>
          <span className="px-3 py-1.5 bg-white rounded-xl border border-purple-200 text-purple-700 shadow-xs">
            3. Evidence Library
          </span>
          <span className="text-purple-400">&rarr;</span>
          <span className="px-3 py-1.5 bg-white rounded-xl border border-purple-200 text-purple-700 shadow-xs">
            4. Readiness Score
          </span>
          <span className="text-purple-400">&rarr;</span>
          <span className="px-3 py-1.5 bg-slate-900 text-purple-300 rounded-xl shadow-xs">
            5. Career Trial
          </span>
          <span className="text-purple-400">&rarr;</span>
          <span className="px-3 py-1.5 bg-emerald-100 text-emerald-800 rounded-xl border border-emerald-200 shadow-xs">
            6. Verified Growth
          </span>
        </div>
      </div>

      {/* Step by Step Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {steps.map((item) => (
          <div
            key={item.step}
            className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center gap-2.5 mb-2">
                <span className="h-7 w-7 rounded-lg bg-purple-100 text-purple-800 font-bold text-xs flex items-center justify-center">
                  0{item.step}
                </span>
                <h3 className="text-base font-bold text-slate-900">{item.title}</h3>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed pl-9">{item.content}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Call to action */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 text-center shadow-xs">
        <h3 className="text-lg font-bold text-slate-900 mb-2">Ready to test your preparedness?</h3>
        <p className="text-xs text-slate-500 max-w-md mx-auto mb-4">
          Jump into your active assessment or explore tailored Career Trials right now.
        </p>
        <button
          onClick={() => onNavigateTab('dashboard')}
          className="bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs px-6 py-2.5 rounded-xl transition-all inline-flex items-center gap-2 shadow-xs"
        >
          Return to Dashboard &rarr;
        </button>
      </div>
    </div>
  );
};
