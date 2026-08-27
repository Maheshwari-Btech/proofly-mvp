import React, { useState } from 'react';
import {
  Briefcase,
  Plus,
  Search,
  Sparkles,
  ExternalLink,
  Trash2,
  Edit2,
  FileText,
  Link2,
  UploadCloud,
  Check,
  AlertCircle,
  Clock,
  MapPin,
  ArrowRight,
  Filter,
} from 'lucide-react';
import { Opportunity, OpportunityRequirement, RequirementImportance, ReadinessAssessment } from '../../types';
import { extractRequirementsFromText } from '../../lib/aiSimulator';
import { parseOpportunityWithAI } from '../../lib/api';
import { CircularProgress } from '../common/CircularProgress';
import { ImportanceBadge } from '../common/Badge';
import { OpportunityFormSchema } from '../../lib/schemas';

interface OpportunitiesViewProps {
  opportunities: Opportunity[];
  assessments?: Record<string, ReadinessAssessment>;
  onSaveOpportunity: (opp: Opportunity) => void;
  onDeleteOpportunity: (id: string) => void;
  onSetPriority: (id: string) => void;
  onAnalyzeOpportunity: (opp: Opportunity) => void;
  isAddModalOpen?: boolean;
  onCloseAddModal?: () => void;
}

export const OpportunitiesView: React.FC<OpportunitiesViewProps> = ({
  opportunities,
  assessments = {},
  onSaveOpportunity,
  onDeleteOpportunity,
  onSetPriority,
  onAnalyzeOpportunity,
  isAddModalOpen = false,
  onCloseAddModal,
}) => {
  const [activeFilter, setActiveFilter] = useState<'All' | 'Active' | 'Interviewing' | 'Applied' | 'Archived'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [modalOpen, setModalOpen] = useState(isAddModalOpen);
  const [selectedOppForDetail, setSelectedOppForDetail] = useState<Opportunity | null>(null);

  // Form State for Adding/Editing Opportunity
  const [inputMethod, setInputMethod] = useState<'paste' | 'upload' | 'url' | 'manual'>('paste');
  const [formTitle, setFormTitle] = useState('');
  const [formCompany, setFormCompany] = useState('');
  const [formLocation, setFormLocation] = useState('Remote');
  const [formType, setFormType] = useState<'Internship' | 'Full-time' | 'Co-op' | 'Part-time'>('Internship');
  const [formRawText, setFormRawText] = useState('');
  const [formUrl, setFormUrl] = useState('');
  const [formFileName, setFormFileName] = useState('');
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractedReqs, setExtractedReqs] = useState<OpportunityRequirement[]>([]);
  const [step, setStep] = useState<'input' | 'review'>('input');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const filteredOpportunities = opportunities.filter((opp) => {
    const matchesFilter = activeFilter === 'All' || opp.status === activeFilter;
    const matchesSearch =
      opp.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      opp.company.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const handleStartExtraction = async () => {
    setErrors({});
    const inputErrors: Record<string, string> = {};

    if (!formTitle.trim() || formTitle.trim().length < 3) {
      inputErrors.title = 'Job title must be at least 3 characters.';
    }
    if (!formCompany.trim() || formCompany.trim().length < 2) {
      inputErrors.company = 'Company name must be at least 2 characters.';
    }
    if (formUrl && formUrl.trim()) {
      try {
        new URL(formUrl.trim());
      } catch {
        inputErrors.url = 'Must be a valid URL starting with http:// or https://';
      }
    }

    if (Object.keys(inputErrors).length > 0) {
      setErrors(inputErrors);
      return;
    }

    setIsExtracting(true);
    try {
      const generatedReqs = await parseOpportunityWithAI(
        formTitle.trim(),
        formCompany.trim(),
        formRawText || formUrl || formFileName || 'React TypeScript Next.js REST API Tailwind',
        `opp_${Date.now()}`
      );
      setExtractedReqs(generatedReqs);
      setStep('review');
    } catch (err) {
      console.error('Failed to parse requirements:', err);
    } finally {
      setIsExtracting(false);
    }
  };

  const handleAddCustomRequirement = () => {
    const newReq: OpportunityRequirement = {
      id: `req_custom_${Date.now()}`,
      opportunityId: 'temp',
      skillName: 'New Required Competency',
      category: 'Technical',
      importance: 'Important',
      description: 'Describe what candidate must demonstrate.',
    };
    setExtractedReqs([...extractedReqs, newReq]);
  };

  const handleUpdateReqImportance = (id: string, importance: RequirementImportance) => {
    setExtractedReqs((prev) =>
      prev.map((r) => (r.id === id ? { ...r, importance } : r))
    );
  };

  const handleRemoveReq = (id: string) => {
    setExtractedReqs((prev) => prev.filter((r) => r.id !== id));
  };

  const handleFinalizeSave = () => {
    setErrors({});

    const opportunityPayload = {
      title: formTitle.trim(),
      company: formCompany.trim(),
      location: formLocation.trim() || 'Remote',
      opportunityType: formType,
      sourceUrl: formUrl.trim() || undefined,
      description: formRawText.slice(0, 300) || `Targeting ${formTitle} role at ${formCompany}.`,
      requirements: extractedReqs,
    };

    const validationResult = OpportunityFormSchema.safeParse(opportunityPayload);

    if (!validationResult.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of validationResult.error.issues) {
        const fieldKey = issue.path[0] as string;
        if (!fieldErrors[fieldKey]) {
          fieldErrors[fieldKey] = issue.message;
        }
      }
      setErrors(fieldErrors);
      return;
    }

    const validated = validationResult.data;
    const newOpp: Opportunity = {
      id: `opp_${Date.now()}`,
      userId: 'usr_jordan_davis',
      title: validated.title,
      company: validated.company,
      location: validated.location,
      opportunityType: validated.opportunityType,
      sourceUrl: validated.sourceUrl || undefined,
      description: validated.description || `Targeting ${validated.title} role at ${validated.company}.`,
      status: 'Active',
      postedDate: 'Added today',
      isPriority: opportunities.length === 0,
      readinessScore: 65,
      createdAt: new Date().toISOString(),
      requirements: validated.requirements,
    };

    onSaveOpportunity(newOpp);
    resetForm();
    onAnalyzeOpportunity(newOpp);
  };

  const resetForm = () => {
    setFormTitle('');
    setFormCompany('');
    setFormLocation('Remote');
    setFormRawText('');
    setFormUrl('');
    setFormFileName('');
    setExtractedReqs([]);
    setErrors({});
    setStep('input');
    setModalOpen(false);
    if (onCloseAddModal) onCloseAddModal();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Target Opportunities
          </h1>
          <p className="text-slate-600 text-sm mt-1">
            Track roles you care about, extract granular requirements, and map your evidence.
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold px-4 py-2.5 rounded-xl shadow-xs transition-all"
        >
          <Plus className="h-4 w-4" />
          Add Opportunity
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200 shadow-xs">
        {/* Status Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          {(['All', 'Active', 'Interviewing', 'Applied', 'Archived'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveFilter(tab)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors whitespace-nowrap ${
                activeFilter === tab
                  ? 'bg-purple-700 text-white'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search roles or companies..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-600 text-slate-800"
          />
        </div>
      </div>

      {/* Opportunity Cards Grid */}
      {filteredOpportunities.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-xs">
          <Briefcase className="h-12 w-12 text-purple-300 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-800">No opportunities found</h3>
          <p className="text-slate-500 text-sm max-w-md mx-auto mt-1 mb-6">
            {searchQuery
              ? 'No opportunities match your search query.'
              : 'Your career journey starts with one opportunity. Add a job listing to map your readiness.'}
          </p>
          <button
            onClick={() => setModalOpen(true)}
            className="bg-purple-600 hover:bg-purple-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold inline-flex items-center gap-2 shadow-xs transition-all"
          >
            <Plus className="h-4 w-4" />
            Add First Opportunity
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredOpportunities.map((opp) => (
            <div
              key={opp.id}
              className={`bg-white rounded-2xl border ${
                opp.isPriority ? 'border-purple-300 ring-2 ring-purple-100' : 'border-slate-200'
              } p-6 shadow-xs hover:shadow-md transition-all flex flex-col justify-between relative`}
            >
              {opp.isPriority && (
                <span className="absolute top-4 right-4 text-[10px] font-bold uppercase tracking-wider text-purple-700 bg-purple-50 px-2.5 py-0.5 rounded-full border border-purple-200">
                  Priority Focus
                </span>
              )}

              <div>
                <div className="flex items-start justify-between gap-2 mb-2 pr-16">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 leading-snug">{opp.title}</h3>
                    <p className="text-sm font-semibold text-purple-700">{opp.company}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-xs text-slate-500 mb-4 flex-wrap">
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5 text-slate-400" />
                    {opp.location}
                  </span>
                  <span>&bull;</span>
                  <span>{opp.opportunityType}</span>
                </div>

                <p className="text-xs text-slate-600 line-clamp-2 mb-4 leading-relaxed">
                  {opp.description}
                </p>

                {/* Score & Requirements count */}
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex items-center justify-between mb-4">
                  <div>
                    <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                      Readiness Score
                    </p>
                    {assessments[opp.id] !== undefined ? (
                      <p className="text-xl font-bold text-purple-700">
                        {assessments[opp.id].readinessScore}%
                      </p>
                    ) : (
                      <p className="text-xs font-semibold text-slate-400 mt-1">
                        Not analyzed yet
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                      Requirements
                    </p>
                    <p className="text-sm font-bold text-slate-700">{opp.requirements.length} Skills</p>
                  </div>
                </div>

                {/* Key Skills */}
                <div className="flex flex-wrap gap-1.5 mb-5">
                  {opp.requirements.slice(0, 3).map((r) => (
                    <span
                      key={r.id}
                      className="px-2 py-0.5 text-[11px] font-medium bg-slate-100 text-slate-700 rounded-md truncate max-w-[150px]"
                    >
                      {r.skillName}
                    </span>
                  ))}
                  {opp.requirements.length > 3 && (
                    <span className="px-2 py-0.5 text-[11px] font-medium bg-purple-50 text-purple-700 rounded-md">
                      +{opp.requirements.length - 3} more
                    </span>
                  )}
                </div>
              </div>

              {/* Card Actions */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                <button
                  onClick={() => onAnalyzeOpportunity(opp)}
                  className="flex-1 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold py-2 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-2xs"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  Analyze Readiness
                </button>

                <button
                  onClick={() => onSetPriority(opp.id)}
                  title="Make Priority Target"
                  className={`p-2 rounded-xl text-xs font-medium border transition-colors ${
                    opp.isPriority
                      ? 'bg-purple-50 text-purple-700 border-purple-200'
                      : 'text-slate-400 hover:text-purple-600 border-slate-200'
                  }`}
                >
                  ★
                </button>

                <button
                  onClick={() => onDeleteOpportunity(opp.id)}
                  title="Delete Opportunity"
                  className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 transition-colors"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Opportunity Modal (Multi-Method Ingestion + Requirements Editor) */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 p-6 sm:p-8 animate-in fade-in zoom-in-95 duration-150">
            {step === 'input' ? (
              <div className="space-y-6">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">Add Target Opportunity</h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Extract structured requirements to benchmark your readiness.
                    </p>
                  </div>
                  <button
                    onClick={resetForm}
                    className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg text-lg font-bold"
                  >
                    &times;
                  </button>
                </div>

                {/* 4 Ingestion Tabs */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-slate-100 p-1 rounded-xl">
                  <button
                    onClick={() => setInputMethod('paste')}
                    className={`py-2 text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5 ${
                      inputMethod === 'paste' ? 'bg-white text-purple-700 shadow-xs' : 'text-slate-600'
                    }`}
                  >
                    <FileText className="h-3.5 w-3.5" />
                    Paste Job Text
                  </button>
                  <button
                    onClick={() => setInputMethod('upload')}
                    className={`py-2 text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5 ${
                      inputMethod === 'upload' ? 'bg-white text-purple-700 shadow-xs' : 'text-slate-600'
                    }`}
                  >
                    <UploadCloud className="h-3.5 w-3.5" />
                    Upload PDF / Doc
                  </button>
                  <button
                    onClick={() => setInputMethod('url')}
                    className={`py-2 text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5 ${
                      inputMethod === 'url' ? 'bg-white text-purple-700 shadow-xs' : 'text-slate-600'
                    }`}
                  >
                    <Link2 className="h-3.5 w-3.5" />
                    Job URL
                  </button>
                  <button
                    onClick={() => setInputMethod('manual')}
                    className={`py-2 text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5 ${
                      inputMethod === 'manual' ? 'bg-white text-purple-700 shadow-xs' : 'text-slate-600'
                    }`}
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                    Manual Entry
                  </button>
                </div>

                {/* Basic Details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Job / Internship Title *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Frontend Engineering Intern"
                      value={formTitle}
                      onChange={(e) => setFormTitle(e.target.value)}
                      className={`w-full px-3.5 py-2.5 text-sm bg-slate-50 border rounded-xl focus:bg-white focus:outline-none focus:ring-2 ${
                        errors.title ? 'border-rose-300 focus:ring-rose-500' : 'border-slate-200 focus:ring-purple-600'
                      }`}
                    />
                    {errors.title && (
                      <p className="text-[11px] text-rose-600 font-semibold mt-1">{errors.title}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Company *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Vercel, Stripe, Figma"
                      value={formCompany}
                      onChange={(e) => setFormCompany(e.target.value)}
                      className={`w-full px-3.5 py-2.5 text-sm bg-slate-50 border rounded-xl focus:bg-white focus:outline-none focus:ring-2 ${
                        errors.company ? 'border-rose-300 focus:ring-rose-500' : 'border-slate-200 focus:ring-purple-600'
                      }`}
                    />
                    {errors.company && (
                      <p className="text-[11px] text-rose-600 font-semibold mt-1">{errors.company}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Location / Workplace Type
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Remote, San Francisco, Hybrid"
                      value={formLocation}
                      onChange={(e) => setFormLocation(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-600"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Opportunity Type
                    </label>
                    <select
                      value={formType}
                      onChange={(e) => setFormType(e.target.value as any)}
                      className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-600"
                    >
                      <option value="Internship">Internship</option>
                      <option value="Full-time">Full-time</option>
                      <option value="Co-op">Co-op</option>
                      <option value="Part-time">Part-time</option>
                    </select>
                  </div>
                </div>

                {/* Ingestion Payload Input */}
                {inputMethod === 'paste' && (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Paste Job Description Text
                    </label>
                    <textarea
                      rows={5}
                      placeholder="Paste the full qualifications, responsibilities, and requirements here..."
                      value={formRawText}
                      onChange={(e) => setFormRawText(e.target.value)}
                      className="w-full p-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-600"
                    />
                  </div>
                )}

                {inputMethod === 'upload' && (
                  <div className="border-2 border-dashed border-purple-200 bg-purple-50/50 rounded-2xl p-6 text-center">
                    <UploadCloud className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                    <p className="text-sm font-bold text-slate-800">Upload Job Specification Document</p>
                    <p className="text-xs text-slate-500 mb-3">Supports PDF, DOCX, TXT up to 10MB</p>
                    <input
                      type="file"
                      onChange={(e) => {
                        if (e.target.files?.[0]) {
                          setFormFileName(e.target.files[0].name);
                          if (!formTitle) setFormTitle('Software Engineering Intern');
                          if (!formCompany) setFormCompany('Tech Product Corp');
                        }
                      }}
                      className="text-xs file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-purple-600 file:text-white hover:file:bg-purple-700 file:transition-all cursor-pointer file:cursor-pointer"
                    />
                    {formFileName && (
                      <p className="mt-2 text-xs font-semibold text-emerald-700">
                        Selected: {formFileName}
                      </p>
                    )}
                  </div>
                )}

                {inputMethod === 'url' && (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Opportunity URL (Greenhouse, Lever, Company Portal)
                    </label>
                    <input
                      type="text"
                      placeholder="https://boards.greenhouse.io/company/jobs/12345"
                      value={formUrl}
                      onChange={(e) => setFormUrl(e.target.value)}
                      className={`w-full px-3.5 py-2.5 text-sm bg-slate-50 border rounded-xl focus:bg-white focus:outline-none focus:ring-2 ${
                        errors.url ? 'border-rose-300 focus:ring-rose-500' : 'border-slate-200 focus:ring-purple-600'
                      }`}
                    />
                    {errors.url && (
                      <p className="text-[11px] text-rose-600 font-semibold mt-1">{errors.url}</p>
                    )}
                  </div>
                )}

                {inputMethod === 'manual' && (
                  <p className="text-xs text-slate-500">
                    Click <strong>Extract & Review Requirements</strong> below to manually assemble the exact competencies.
                  </p>
                )}

                {/* Actions */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                  <button
                    onClick={resetForm}
                    className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:text-slate-800"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleStartExtraction}
                    disabled={isExtracting}
                    className="bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold px-6 py-2.5 rounded-xl transition-all flex items-center gap-2 shadow-xs"
                  >
                    {isExtracting ? (
                      <>
                        <span className="h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Extracting Requirements...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-3.5 w-3.5" />
                        Extract & Review Requirements &rarr;
                      </>
                    )}
                  </button>
                </div>
              </div>
            ) : (
              /* Step 2: Review Extracted Requirements before saving */
              <div className="space-y-6">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">Review Extracted Requirements</h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Proofly identified {extractedReqs.length} key skills. You can edit, re-classify importance, or add new ones.
                    </p>
                  </div>
                  <button
                    onClick={() => setStep('input')}
                    className="text-xs font-semibold text-purple-700 hover:underline"
                  >
                    &larr; Back to Details
                  </button>
                </div>

                <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                  {extractedReqs.map((req, idx) => (
                    <div
                      key={req.id}
                      className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-bold text-slate-900">{req.skillName}</span>
                          <span className="text-[10px] text-slate-400 uppercase font-semibold">
                            [{req.category}]
                          </span>
                        </div>
                        <p className="text-xs text-slate-600">{req.description}</p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <select
                          value={req.importance}
                          onChange={(e) => handleUpdateReqImportance(req.id, e.target.value as any)}
                          className="text-xs font-bold px-2 py-1 bg-white border border-slate-200 rounded-lg text-slate-700"
                        >
                          <option value="Critical">Critical</option>
                          <option value="Important">Important</option>
                          <option value="Bonus">Bonus</option>
                        </select>

                        <button
                          onClick={() => handleRemoveReq(req.id)}
                          className="text-slate-400 hover:text-rose-600 p-1"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex justify-between items-center pt-2">
                  <button
                    onClick={handleAddCustomRequirement}
                    className="text-xs font-bold text-purple-700 hover:text-purple-800 flex items-center gap-1"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    + Add Custom Skill
                  </button>
                  <span className="text-xs text-slate-400">
                    Weighted scoring applies automatically
                  </span>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                  <button
                    onClick={() => setStep('input')}
                    className="px-4 py-2.5 text-xs font-semibold text-slate-600"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleFinalizeSave}
                    className="bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold px-6 py-2.5 rounded-xl transition-all flex items-center gap-2 shadow-xs"
                  >
                    <Check className="h-4 w-4" />
                    Save & Analyze Readiness
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
