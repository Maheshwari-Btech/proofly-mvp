import React, { useState } from 'react';
import { HelpCircle, ChevronDown, ChevronUp, Search, Sparkles } from 'lucide-react';

export const FaqView: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  const faqs = [
    {
      q: 'What is Proofly?',
      a: 'Proofly is an AI-powered career readiness platform that shifts student readiness from keyword claims to verifiable artifacts. Rather than simply asking "What skills do you have?", Proofly asks "What evidence proves you have those skills?".',
    },
    {
      q: 'How does Proofly calculate the readiness score?',
      a: 'The readiness score is an explainable weighted percentage that cross-references extracted opportunity requirements (categorized as Critical, Important, or Bonus) against the verified artifacts in your evidence library. Strong verifiable matches earn full points, partial evidence earns proportional credit, and missing skills highlight areas for growth.',
    },
    {
      q: 'What counts as evidence on Proofly?',
      a: 'Evidence includes GitHub repositories, production projects, live web applications, university coursework, official certifications (e.g. AWS, Google Cloud), prior internships, and hackathon accomplishments.',
    },
    {
      q: 'Can I upload certificates and PDFs?',
      a: 'Yes! You can record your certificates, link official credential verification IDs, and upload PDF/DOCX resumes or project summaries.',
    },
    {
      q: 'Can I connect my GitHub profile?',
      a: 'Yes. Adding your GitHub repositories and commit history provides verifiable proof of version control, code quality, and active engineering.',
    },
    {
      q: 'Does Proofly guarantee a job or internship offer?',
      a: 'No platform can guarantee hiring decisions. Proofly provides an objective, honest diagnostic of your preparedness so you can walk into interviews with demonstrable proof instead of guesswork.',
    },
    {
      q: 'What is a Career Trial?',
      a: 'Career Trial is an interactive mini-simulation that isolates your single biggest skill gap for a target job and gives you a realistic workplace task. Once completed, the AI grades your submission and automatically converts it into verified evidence.',
    },
    {
      q: 'What is SkillSwap?',
      a: 'SkillSwap is our complementary peer exchange network. It finds students whose verified strengths align with your current skill gaps (and vice versa) for collaborative learning and mock interview prep.',
    },
    {
      q: 'Is my personal data and document storage private?',
      a: 'Yes. All assessments, documents, and private profile information are secured with strict access controls. SkillSwap only shares public profiles if you explicitly toggle visibility ON.',
    },
    {
      q: 'Can I delete or export my data?',
      a: 'Yes. You can manage, update, or completely delete your evidence items, opportunities, or account data anytime from the Settings page.',
    },
    {
      q: 'How does AI evaluate evidence without generic hallucination?',
      a: 'Proofly uses deterministic extraction and strict explainable prompt structures. Every evaluation adheres to the formula: Requirement → Evidence Artifact → Objective Explanation → Actionable Recommendation.',
    },
  ];

  const filteredFaqs = faqs.filter(
    (item) =>
      item.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.a.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs">
        <div className="flex items-center gap-3 mb-2">
          <div className="h-10 w-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
            <HelpCircle className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Frequently Asked Questions
            </h1>
            <p className="text-xs text-slate-500">
              Clear, transparent answers on how Proofly evaluates evidence and powers career growth.
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="relative mt-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search questions (e.g. readiness, Career Trial, GitHub, privacy)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-600 text-slate-800"
          />
        </div>
      </div>

      {/* Accordion list */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs divide-y divide-slate-100">
        {filteredFaqs.map((faq, idx) => {
          const isOpen = openIdx === idx;
          return (
            <div key={idx} className="py-4 first:pt-0 last:pb-0">
              <button
                onClick={() => setOpenIdx(isOpen ? null : idx)}
                className="w-full flex items-center justify-between text-left gap-4 group focus:outline-none"
              >
                <span
                  className={`text-sm font-bold transition-colors ${
                    isOpen ? 'text-purple-700' : 'text-slate-900 group-hover:text-purple-600'
                  }`}
                >
                  {faq.q}
                </span>
                <span className="p-1 rounded-lg bg-slate-100 group-hover:bg-purple-50 text-slate-500 group-hover:text-purple-700 transition-colors shrink-0">
                  {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </span>
              </button>

              {isOpen && (
                <div className="mt-3 text-xs sm:text-sm text-slate-600 leading-relaxed pl-1 pr-4 animate-in fade-in duration-150">
                  {faq.a}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
