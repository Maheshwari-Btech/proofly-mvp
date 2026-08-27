import React from 'react';
import {
  ArrowRight,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  FileCheck,
  Target,
  Users,
  Award,
  Zap,
  BookOpen,
  ChevronRight,
  TrendingUp,
  Cpu,
  Lock,
} from 'lucide-react';
import { NavigationTab } from '../layout/Navbar';

interface LandingPageViewProps {
  onNavigate: (tab: NavigationTab) => void;
  onOpenAuthModal?: (mode: 'login' | 'register') => void;
}

export const LandingPageView: React.FC<LandingPageViewProps> = ({
  onNavigate,
  onOpenAuthModal,
}) => {
  const steps = [
    {
      step: '01',
      title: 'Target Opportunity',
      desc: 'Paste a job description, link, or document. Proofly extracts structured technical and domain requirements.',
      icon: Target,
      tag: 'Role & Requirements',
    },
    {
      step: '02',
      title: 'Provide Evidence',
      desc: 'Upload certificates, GitHub repos, project links, or coursework artifacts proving your hands-on competencies.',
      icon: FileCheck,
      tag: 'Artifacts & Proof',
    },
    {
      step: '03',
      title: 'Readiness & Gap Analysis',
      desc: 'Get an explainable readiness assessment mapping every requirement to strong, partial, or missing evidence.',
      icon: TrendingUp,
      tag: 'Explainable AI',
    },
    {
      step: '04',
      title: 'Career Trial Simulation',
      desc: 'Practice your biggest skill gap in a practical micro-simulation. Submit work to generate verified proof.',
      icon: Zap,
      tag: 'Action & Verification',
    },
    {
      step: '05',
      title: 'Learn, Mentor & Swap',
      desc: 'Access curated learning resources, connect with verified industry mentors, or pair with complementary student peers.',
      icon: Users,
      tag: 'Human Support',
    },
  ];

  const differentiators = [
    {
      title: 'Not Just a Resume Scanner',
      desc: 'Resume keyword scanners guess from words. Proofly evaluates real, verifiable evidence artifacts against precise role requirements.',
    },
    {
      title: 'Not a Generic AI Chatbot',
      desc: 'Proofly is a structured workflow engine. AI powers the intelligence behind explainable readiness scores, not conversational chat trivia.',
    },
    {
      title: 'Action-Driven Skill Bridge',
      desc: 'When a gap is identified, you are never left stuck. You instantly get a Career Trial, curated tutorials, and peer matching.',
    },
  ];

  return (
    <div className="space-y-16 py-4 sm:py-8">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-purple-900 via-purple-800 to-indigo-950 text-white p-8 sm:p-14 lg:p-20 shadow-xl">
        <div className="relative z-10 max-w-4xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-500/20 border border-purple-400/30 text-purple-200 text-xs sm:text-sm font-semibold backdrop-blur-xs">
            <Sparkles className="h-4 w-4 text-purple-300" />
            <span>The Missing Step Between Applying & Being Ready</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.1]">
            Don't just claim you're ready.{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-200 via-purple-300 to-pink-200">
              Prove it.
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-purple-100/90 max-w-2xl mx-auto font-normal leading-relaxed">
            Proofly helps students and early-career engineers verify whether their skills are genuinely backed by evidence — and gives them the exact roadmap to close their skill gaps.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <button
              onClick={() => onNavigate('dashboard')}
              className="w-full sm:w-auto px-8 py-4 bg-white text-purple-900 hover:bg-purple-50 font-bold rounded-2xl shadow-lg transition-transform hover:scale-[1.02] flex items-center justify-center gap-2.5 text-base"
            >
              <span>Check My Readiness</span>
              <ArrowRight className="h-5 w-5 text-purple-700" />
            </button>
            <button
              onClick={() => onNavigate('guide')}
              className="w-full sm:w-auto px-8 py-4 bg-purple-800/60 hover:bg-purple-700/60 border border-purple-400/30 text-white font-semibold rounded-2xl transition-colors flex items-center justify-center gap-2 text-base"
            >
              <BookOpen className="h-5 w-5 text-purple-300" />
              <span>How Proofly Works</span>
            </button>
          </div>

          {/* Value Tags */}
          <div className="pt-8 grid grid-cols-2 sm:grid-cols-4 gap-4 text-left border-t border-purple-700/40 text-purple-200 text-xs sm:text-sm">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
              <span>Evidence-Based</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
              <span>Explainable AI Math</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
              <span>Career Simulations</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
              <span>Mentors & SkillSwap</span>
            </div>
          </div>
        </div>
      </section>

      {/* The Core Problem */}
      <section className="max-w-5xl mx-auto space-y-6 text-center">
        <h2 className="text-xs font-bold text-purple-600 uppercase tracking-widest">The Career Dilemma</h2>
        <h3 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Why "listing skills on a resume" no longer works
        </h3>
        <p className="text-slate-600 text-base sm:text-lg max-w-3xl mx-auto leading-relaxed">
          Students frequently apply to 100+ internships without knowing whether their certificates prove the right skills, whether their projects demonstrate required competencies, or what specific gap is holding them back.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 text-left">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <div className="h-10 w-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold">
              01
            </div>
            <h4 className="text-lg font-bold text-slate-900">Uncertain Qualification</h4>
            <p className="text-sm text-slate-600 leading-relaxed">
              Job descriptions list endless buzzwords. Candidates don't know which requirements are critical versus nice-to-have.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <div className="h-10 w-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold">
              02
            </div>
            <h4 className="text-lg font-bold text-slate-900">Unverified Claims</h4>
            <p className="text-sm text-slate-600 leading-relaxed">
              Anyone can claim "React & Python" on a PDF. Recruiters want to see proof of execution, repos, and verified project output.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <div className="h-10 w-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold">
              03
            </div>
            <h4 className="text-lg font-bold text-slate-900">No Actionable Bridge</h4>
            <p className="text-sm text-slate-600 leading-relaxed">
              Standard rejections never tell you what you missed. Proofly identifies the exact gap and gives you a simulation to close it.
            </p>
          </div>
        </div>
      </section>

      {/* The Visual Journey Workflow */}
      <section className="bg-purple-50/60 border border-purple-100 rounded-3xl p-8 sm:p-12 space-y-10">
        <div className="text-center space-y-3 max-w-3xl mx-auto">
          <h2 className="text-xs font-bold text-purple-600 uppercase tracking-widest">How It Works</h2>
          <h3 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            The 5-Step Proofly Engine
          </h3>
          <p className="text-slate-600 text-sm sm:text-base">
            From target opportunity to verified career proof in a continuous closed-loop cycle.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 relative">
          {steps.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={item.step}
                className="bg-white rounded-2xl p-5 border border-purple-100/80 shadow-xs flex flex-col justify-between space-y-4 hover:border-purple-300 transition-colors"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-black text-purple-600 tracking-wider">
                      {item.step}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-100">
                      {item.tag}
                    </span>
                  </div>
                  <div className="h-10 w-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center mb-3">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h4 className="text-base font-bold text-slate-900 mb-1">{item.title}</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Why Proofly Is Different */}
      <section className="max-w-5xl mx-auto space-y-8">
        <div className="text-center space-y-3">
          <h2 className="text-xs font-bold text-purple-600 uppercase tracking-widest">Product Integrity</h2>
          <h3 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            How Proofly Stands Apart
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {differentiators.map((diff) => (
            <div
              key={diff.title}
              className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-3"
            >
              <div className="h-8 w-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <h4 className="text-lg font-bold text-slate-900">{diff.title}</h4>
              <p className="text-sm text-slate-600 leading-relaxed">{diff.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Box */}
      <section className="bg-gradient-to-r from-purple-700 to-indigo-800 rounded-3xl text-white p-8 sm:p-12 text-center space-y-6 shadow-lg">
        <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
          Ready to prove your career readiness?
        </h2>
        <p className="text-purple-100 text-base max-w-xl mx-auto">
          Add your target job opportunity, upload your projects and certificates, and see your explainable Evidence Map in seconds.
        </p>
        <div className="flex justify-center gap-4">
          <button
            onClick={() => onNavigate('dashboard')}
            className="px-8 py-4 bg-white text-purple-900 font-bold rounded-2xl shadow-md hover:bg-purple-50 transition-transform hover:scale-105 flex items-center gap-2"
          >
            <span>Launch Proofly App</span>
            <ArrowRight className="h-5 w-5 text-purple-700" />
          </button>
        </div>
      </section>
    </div>
  );
};
