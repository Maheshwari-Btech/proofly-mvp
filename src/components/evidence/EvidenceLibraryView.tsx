import React, { useState } from 'react';
import {
  FileCheck,
  Plus,
  Search,
  Filter,
  ExternalLink,
  Trash2,
  CheckCircle2,
  ShieldCheck,
  Award,
  Code,
  FileText,
  Briefcase,
  GraduationCap,
  Sparkles,
  Link,
} from 'lucide-react';
import { EvidenceItem, EvidenceType } from '../../types';
import { EvidenceTypeBadge } from '../common/Badge';
import { EvidenceFormSchema } from '../../lib/schemas';

interface EvidenceLibraryViewProps {
  evidenceList: EvidenceItem[];
  onAddEvidence: (item: EvidenceItem) => void;
  onDeleteEvidence: (id: string) => void;
  isAddModalOpen?: boolean;
  onCloseAddModal?: () => void;
}

export const EvidenceLibraryView: React.FC<EvidenceLibraryViewProps> = ({
  evidenceList,
  onAddEvidence,
  onDeleteEvidence,
  isAddModalOpen = false,
  onCloseAddModal,
}) => {
  const [activeFilter, setActiveFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [modalOpen, setModalOpen] = useState(isAddModalOpen);

  // Add Evidence Form State
  const [title, setTitle] = useState('');
  const [type, setType] = useState<EvidenceType>('Project');
  const [description, setDescription] = useState('');
  const [issuer, setIssuer] = useState('');
  const [date, setDate] = useState('');
  const [externalUrl, setExternalUrl] = useState('');
  const [skillsInput, setSkillsInput] = useState('');
  const [metrics, setMetrics] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const filterTabs: Array<'All' | EvidenceType> = [
    'All',
    'Project',
    'Certificate',
    'Course',
    'GitHub',
    'Internship',
    'Resume',
    'Competition',
  ];

  const filteredEvidence = evidenceList.filter((item) => {
    const matchesFilter = activeFilter === 'All' || item.type === activeFilter;
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.skills.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (item.issuer && item.issuer.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesFilter && matchesSearch;
  });

  const handleSaveEvidence = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const skills = skillsInput
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    const formData = {
      title: title.trim(),
      type,
      description: description.trim() || `Verified ${type} demonstrating relevant technical proficiencies.`,
      issuer: issuer.trim(),
      date: date.trim() || new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      externalUrl: externalUrl.trim() || undefined,
      skills: skills.length > 0 ? skills : [],
      metrics: metrics.trim() || undefined,
    };

    const validationResult = EvidenceFormSchema.safeParse(formData);

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
    const newItem: EvidenceItem = {
      id: `evi_${Date.now()}`,
      userId: 'usr_jordan_davis',
      title: validated.title,
      type: validated.type,
      description: validated.description,
      issuer: validated.issuer || 'Self-Directed Verification',
      date: validated.date || new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      externalUrl: validated.externalUrl || undefined,
      skills: validated.skills,
      verificationStatus: 'Verified',
      metrics: validated.metrics || undefined,
      createdAt: new Date().toISOString(),
    };

    onAddEvidence(newItem);
    resetForm();
  };

  const resetForm = () => {
    setTitle('');
    setType('Project');
    setDescription('');
    setIssuer('');
    setDate('');
    setExternalUrl('');
    setSkillsInput('');
    setMetrics('');
    setErrors({});
    setModalOpen(false);
    if (onCloseAddModal) onCloseAddModal();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            My Evidence Library
          </h1>
          <p className="text-slate-600 text-sm mt-1">
            Verifiable projects, certifications, coursework, and repositories proving your competency.
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold px-4 py-2.5 rounded-xl shadow-xs transition-all"
        >
          <Plus className="h-4 w-4" />
          Add New Evidence
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200 shadow-xs">
        {/* Category Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          {filterTabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveFilter(tab)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                activeFilter === tab
                  ? 'bg-purple-700 text-white shadow-xs'
                  : 'bg-purple-50/40 text-purple-900/80 hover:bg-purple-100/70 border border-purple-100/60'
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
            placeholder="Search by skill, title, or issuer..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-600 text-slate-800"
          />
        </div>
      </div>

      {/* Grid of Evidence Cards */}
      {filteredEvidence.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-xs">
          <FileCheck className="h-12 w-12 text-purple-300 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-800">No evidence items match</h3>
          <p className="text-slate-500 text-sm max-w-md mx-auto mt-1 mb-6">
            Your skills become exponentially stronger when backed by verifiable artifacts. Upload your projects, certificates, or GitHub links.
          </p>
          <button
            onClick={() => setModalOpen(true)}
            className="bg-purple-600 hover:bg-purple-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold inline-flex items-center gap-2 shadow-xs transition-all"
          >
            <Plus className="h-4 w-4" />
            Add First Evidence
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvidence.map((item) => {
            return (
              <div
                key={item.id}
                className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <EvidenceTypeBadge type={item.type} />
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-purple-800 bg-purple-50 px-2.5 py-0.5 rounded-full border border-purple-200">
                      <ShieldCheck className="h-3.5 w-3.5 text-purple-600" />
                      {item.verificationStatus}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 mb-1 leading-snug">{item.title}</h3>

                  <p className="text-xs text-slate-500 font-medium mb-3 flex items-center gap-2 flex-wrap">
                    {item.issuer && <span>{item.issuer}</span>}
                    {item.issuer && <span>&bull;</span>}
                    <span>{item.date}</span>
                  </p>

                  <p className="text-xs text-slate-600 line-clamp-3 mb-4 leading-relaxed">
                    {item.description}
                  </p>

                  {item.metrics && (
                    <div className="p-2.5 bg-purple-50 rounded-xl border border-purple-100 mb-4 text-xs font-semibold text-purple-800 flex items-center gap-1.5">
                      <Sparkles className="h-3.5 w-3.5 text-purple-600" />
                      {item.metrics}
                    </div>
                  )}

                  {/* Skills Tags */}
                  <div className="flex flex-wrap gap-1.5 mb-5">
                    {item.skills.map((skill, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-0.5 text-[11px] font-semibold bg-purple-50 text-purple-900 border border-purple-200/80 rounded-md"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Footer / Actions */}
                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  {item.externalUrl ? (
                    <a
                      href={item.externalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-bold text-purple-700 hover:text-purple-900 inline-flex items-center gap-1"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                      View Artifact
                    </a>
                  ) : (
                    <span className="text-xs text-slate-400 font-medium">Local Document</span>
                  )}

                  <button
                    onClick={() => onDeleteEvidence(item.id)}
                    className="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 transition-colors"
                    title="Delete evidence"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Evidence Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 p-6 sm:p-8 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-6">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Add Career Evidence</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Link an artifact that validates your technical or domain ability.
                </p>
              </div>
              <button
                onClick={resetForm}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg text-lg font-bold"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSaveEvidence} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Evidence Title *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Next.js E-Commerce Dashboard, AWS Solutions Architect"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className={`w-full px-3.5 py-2.5 text-sm bg-slate-50 border rounded-xl focus:bg-white focus:outline-none focus:ring-2 ${
                    errors.title ? 'border-rose-300 focus:ring-rose-500' : 'border-slate-200 focus:ring-purple-600'
                  }`}
                />
                {errors.title && (
                  <p className="text-[11px] text-rose-600 font-semibold mt-1">{errors.title}</p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Evidence Type *
                  </label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as EvidenceType)}
                    className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-600"
                  >
                    <option value="Project">Project (GitHub / Live App)</option>
                    <option value="Certificate">Official Certificate</option>
                    <option value="Course">Academic / Online Course</option>
                    <option value="Internship">Prior Internship / Work</option>
                    <option value="GitHub">GitHub Repository</option>
                    <option value="Resume">Resume / Portfolio PDF</option>
                    <option value="Competition">Hackathon / Competition</option>
                    <option value="Other">Other Verified Artifact</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Issuing Organization / Context
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Stanford University, AWS, Self-Directed"
                    value={issuer}
                    onChange={(e) => setIssuer(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-600"
                  />
                  {errors.issuer && (
                    <p className="text-[11px] text-rose-600 font-semibold mt-1">{errors.issuer}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Description & Context
                </label>
                <textarea
                  rows={3}
                  placeholder="Describe the architectural choices, problem solved, or certification scope..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className={`w-full p-3 text-xs bg-slate-50 border rounded-xl focus:bg-white focus:outline-none focus:ring-2 ${
                    errors.description ? 'border-rose-300 focus:ring-rose-500' : 'border-slate-200 focus:ring-purple-600'
                  }`}
                />
                {errors.description && (
                  <p className="text-[11px] text-rose-600 font-semibold mt-1">{errors.description}</p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Date / Term
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. August 2026"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Performance Metric (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Score: 95%, Grade A, 1st Place"
                    value={metrics}
                    onChange={(e) => setMetrics(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-600"
                  />
                  {errors.metrics && (
                    <p className="text-[11px] text-rose-600 font-semibold mt-1">{errors.metrics}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  External URL / GitHub Link (Optional)
                </label>
                <input
                  type="text"
                  placeholder="https://github.com/username/project"
                  value={externalUrl}
                  onChange={(e) => setExternalUrl(e.target.value)}
                  className={`w-full px-3.5 py-2.5 text-sm bg-slate-50 border rounded-xl focus:bg-white focus:outline-none focus:ring-2 ${
                    errors.externalUrl ? 'border-rose-300 focus:ring-rose-500' : 'border-slate-200 focus:ring-purple-600'
                  }`}
                />
                {errors.externalUrl && (
                  <p className="text-[11px] text-rose-600 font-semibold mt-1">{errors.externalUrl}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Associated Skills (comma-separated) *
                </label>
                <input
                  type="text"
                  placeholder="React, TypeScript, Tailwind CSS, REST APIs"
                  value={skillsInput}
                  onChange={(e) => setSkillsInput(e.target.value)}
                  className={`w-full px-3.5 py-2.5 text-sm bg-slate-50 border rounded-xl focus:bg-white focus:outline-none focus:ring-2 ${
                    errors.skills ? 'border-rose-300 focus:ring-rose-500' : 'border-slate-200 focus:ring-purple-600'
                  }`}
                />
                {errors.skills ? (
                  <p className="text-[11px] text-rose-600 font-semibold mt-1">{errors.skills}</p>
                ) : (
                  <p className="text-[11px] text-slate-400 mt-1">
                    These skills will be automatically cross-referenced against opportunity requirements.
                  </p>
                )}
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold px-6 py-2.5 rounded-xl transition-all shadow-xs"
                >
                  Save to Evidence Library
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
