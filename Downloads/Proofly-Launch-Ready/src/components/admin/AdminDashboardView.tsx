import React, { useState } from 'react';
import {
  ShieldAlert,
  Users,
  BookOpen,
  UserCheck,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  BarChart3,
  Mail,
  Search,
  ExternalLink,
} from 'lucide-react';
import { LearningResource, Mentor, ContactMessage } from '../../types';

interface AdminDashboardViewProps {
  resources: LearningResource[];
  mentors: Mentor[];
  messages: ContactMessage[];
  onAddResource: (resource: LearningResource) => void;
  onDeleteResource: (id: string) => void;
  onAddMentor: (mentor: Mentor) => void;
  onDeleteMentor: (id: string) => void;
}

export const AdminDashboardView: React.FC<AdminDashboardViewProps> = ({
  resources,
  mentors,
  messages,
  onAddResource,
  onDeleteResource,
  onAddMentor,
  onDeleteMentor,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'resources' | 'mentors' | 'messages'>('overview');

  // Resource Form state
  const [showAddResourceModal, setShowAddResourceModal] = useState(false);
  const [resTitle, setResTitle] = useState('');
  const [resProvider, setResProvider] = useState('');
  const [resDesc, setResDesc] = useState('');
  const [resUrl, setResUrl] = useState('');
  const [resSkills, setResSkills] = useState('');
  const [resType, setResType] = useState<LearningResource['resourceType']>('Course');
  const [resDifficulty, setResDifficulty] = useState<'Beginner' | 'Intermediate' | 'Advanced'>('Intermediate');
  const [resDuration, setResDuration] = useState('3 hours');
  const [resFree, setResFree] = useState(true);

  // Mentor Form state
  const [showAddMentorModal, setShowAddMentorModal] = useState(false);
  const [mentorName, setMentorName] = useState('');
  const [mentorCompany, setMentorCompany] = useState('');
  const [mentorHeadline, setMentorHeadline] = useState('');
  const [mentorBio, setMentorBio] = useState('');
  const [mentorSkills, setMentorSkills] = useState('');
  const [mentorExp, setMentorExp] = useState(5);

  const handleCreateResource = (e: React.FormEvent) => {
    e.preventDefault();
    const newRes: LearningResource = {
      id: `lr_${Date.now()}`,
      title: resTitle,
      provider: resProvider,
      description: resDesc,
      url: resUrl,
      resourceType: resType,
      skills: resSkills.split(',').map((s) => s.trim()).filter(Boolean),
      difficulty: resDifficulty,
      duration: resDuration,
      free: resFree,
      language: 'English',
      rating: 4.9,
      featured: false,
    };
    onAddResource(newRes);
    setShowAddResourceModal(false);
    // Reset form
    setResTitle('');
    setResProvider('');
    setResDesc('');
    setResUrl('');
    setResSkills('');
  };

  const handleCreateMentor = (e: React.FormEvent) => {
    e.preventDefault();
    const initials = mentorName
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);

    const newMentor: Mentor = {
      id: `mentor_${Date.now()}`,
      fullName: mentorName,
      headline: mentorHeadline,
      bio: mentorBio,
      company: mentorCompany,
      expertise: mentorSkills.split(',').map((s) => s.trim()).filter(Boolean),
      skills: mentorSkills.split(',').map((s) => s.trim()).filter(Boolean),
      experienceYears: Number(mentorExp),
      availability: 'Available',
      languages: ['English'],
      rating: 5.0,
      reviewsCount: 1,
      verified: true,
      avatarInitials: initials || 'PM',
    };
    onAddMentor(newMentor);
    setShowAddMentorModal(false);
    // Reset form
    setMentorName('');
    setMentorCompany('');
    setMentorHeadline('');
    setMentorBio('');
    setMentorSkills('');
  };

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-purple-100 text-purple-800">
              <ShieldAlert className="h-5 w-5" />
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Platform Administration Console
            </h1>
          </div>
          <p className="text-slate-600 text-sm mt-1">
            Manage learning resources, onboard verified industry mentors, and review system contact submissions without editing database tables manually.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-2xl">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-colors ${
              activeTab === 'overview' ? 'bg-white text-purple-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('resources')}
            className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-colors ${
              activeTab === 'resources' ? 'bg-white text-purple-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Resources ({resources.length})
          </button>
          <button
            onClick={() => setActiveTab('mentors')}
            className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-colors ${
              activeTab === 'mentors' ? 'bg-white text-purple-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Mentors ({mentors.length})
          </button>
          <button
            onClick={() => setActiveTab('messages')}
            className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-colors ${
              activeTab === 'messages' ? 'bg-white text-purple-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Inquiries ({messages.length})
          </button>
        </div>
      </div>

      {/* Overview Stats */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Learning Catalog</span>
                <BookOpen className="h-5 w-5 text-purple-600" />
              </div>
              <p className="text-3xl font-extrabold text-slate-900">{resources.length}</p>
              <p className="text-xs text-slate-500">Active tutorials, courses, and documentation</p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Verified Mentors</span>
                <UserCheck className="h-5 w-5 text-purple-600" />
              </div>
              <p className="text-3xl font-extrabold text-slate-900">{mentors.length}</p>
              <p className="text-xs text-slate-500">Engineers available for student 1-on-1s</p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Contact Inquiries</span>
                <Mail className="h-5 w-5 text-purple-600" />
              </div>
              <p className="text-3xl font-extrabold text-slate-900">{messages.length}</p>
              <p className="text-xs text-slate-500">Incoming student support and feedback forms</p>
            </div>
          </div>

          <div className="bg-purple-50/60 border border-purple-100 rounded-2xl p-6 space-y-3">
            <h3 className="text-sm font-bold text-purple-950">Content Expansion Strategy</h3>
            <p className="text-xs text-purple-800 leading-relaxed max-w-3xl">
              Proofly launches with high-quality curated learning resources and verified industry mentors. Use the management tabs above to add additional specialized technical resources or onboard new university alumni mentors directly.
            </p>
          </div>
        </div>
      )}

      {/* Resources Management Tab */}
      {activeTab === 'resources' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Learning Catalog Resources</h2>
              <p className="text-xs text-slate-500">Manage external learning links mapped to student skill gaps</p>
            </div>
            <button
              onClick={() => setShowAddResourceModal(true)}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-1.5"
            >
              <Plus className="h-4 w-4" />
              <span>Add Resource</span>
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {resources.map((res) => (
              <div key={res.id} className="py-4 flex items-center justify-between gap-4">
                <div className="space-y-1 max-w-2xl">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-purple-50 text-purple-700 border border-purple-100">
                      {res.resourceType}
                    </span>
                    <span className="text-xs font-bold text-slate-400">{res.provider}</span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-900">{res.title}</h4>
                  <div className="flex flex-wrap gap-1">
                    {res.skills.map((s) => (
                      <span key={s} className="px-1.5 py-0.5 bg-slate-100 text-[10px] font-medium text-slate-600 rounded">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <a
                    href={res.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 text-slate-400 hover:text-purple-600 rounded-lg hover:bg-slate-50"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                  <button
                    onClick={() => onDeleteResource(res.id)}
                    className="p-2 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Mentors Management Tab */}
      {activeTab === 'mentors' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Verified Mentor Directory</h2>
              <p className="text-xs text-slate-500">Manage verified software engineers available for student 1-on-1s</p>
            </div>
            <button
              onClick={() => setShowAddMentorModal(true)}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-1.5"
            >
              <Plus className="h-4 w-4" />
              <span>Add Mentor</span>
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {mentors.map((m) => (
              <div key={m.id} className="py-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-purple-100 text-purple-800 font-bold flex items-center justify-center text-sm">
                    {m.avatarInitials}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">{m.fullName}</h4>
                    <p className="text-xs text-purple-700 font-semibold">{m.company} &bull; {m.experienceYears} yrs exp</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {m.skills.map((s) => (
                        <span key={s} className="px-1.5 py-0.5 bg-slate-100 text-[10px] font-medium text-slate-600 rounded">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => onDeleteMentor(m.id)}
                  className="p-2 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Messages Tab */}
      {activeTab === 'messages' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
          <h2 className="text-lg font-bold text-slate-900">Student & User Contact Messages</h2>
          {messages.length === 0 ? (
            <p className="text-xs text-slate-500 py-6 text-center">No contact inquiries submitted yet.</p>
          ) : (
            <div className="divide-y divide-slate-100">
              {messages.map((msg) => (
                <div key={msg.id} className="py-3 space-y-1">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-slate-900">{msg.name} ({msg.email})</span>
                    <span className="text-slate-400 font-normal">{msg.createdAt}</span>
                  </div>
                  <p className="text-xs font-semibold text-purple-700">{msg.subject}</p>
                  <p className="text-xs text-slate-600 leading-relaxed">{msg.message}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Add Resource Modal */}
      {showAddResourceModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-slate-200">
            <h3 className="text-lg font-bold text-slate-900">Add Learning Resource</h3>
            <form onSubmit={handleCreateResource} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Title</label>
                <input
                  type="text"
                  required
                  value={resTitle}
                  onChange={(e) => setResTitle(e.target.value)}
                  placeholder="e.g. Building Modern REST APIs"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Provider</label>
                  <input
                    type="text"
                    required
                    value={resProvider}
                    onChange={(e) => setResProvider(e.target.value)}
                    placeholder="e.g. MDN Web Docs"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Resource Type</label>
                  <select
                    value={resType}
                    onChange={(e) => setResType(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  >
                    <option value="Course">Course</option>
                    <option value="Tutorial">Tutorial</option>
                    <option value="Documentation">Documentation</option>
                    <option value="Project">Project</option>
                    <option value="Practice">Practice</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Target Skills (comma separated)</label>
                <input
                  type="text"
                  required
                  value={resSkills}
                  onChange={(e) => setResSkills(e.target.value)}
                  placeholder="RESTful APIs, React, Python"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">URL</label>
                <input
                  type="url"
                  required
                  value={resUrl}
                  onChange={(e) => setResUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  required
                  value={resDesc}
                  onChange={(e) => setResDesc(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddResourceModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all"
                >
                  Save Resource
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Mentor Modal */}
      {showAddMentorModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-slate-200">
            <h3 className="text-lg font-bold text-slate-900">Onboard Verified Mentor</h3>
            <form onSubmit={handleCreateMentor} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={mentorName}
                  onChange={(e) => setMentorName(e.target.value)}
                  placeholder="e.g. Alex Rivera"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Company</label>
                  <input
                    type="text"
                    required
                    value={mentorCompany}
                    onChange={(e) => setMentorCompany(e.target.value)}
                    placeholder="e.g. Stripe"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Years Experience</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={mentorExp}
                    onChange={(e) => setMentorExp(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Headline</label>
                <input
                  type="text"
                  required
                  value={mentorHeadline}
                  onChange={(e) => setMentorHeadline(e.target.value)}
                  placeholder="e.g. Senior Backend Engineer @ Stripe"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Skills & Topics (comma separated)</label>
                <input
                  type="text"
                  required
                  value={mentorSkills}
                  onChange={(e) => setMentorSkills(e.target.value)}
                  placeholder="RESTful APIs, PostgreSQL, Node.js"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Bio</label>
                <textarea
                  rows={2}
                  required
                  value={mentorBio}
                  onChange={(e) => setMentorBio(e.target.value)}
                  placeholder="Passionate about helping students bridge API architecture gaps..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddMentorModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all"
                >
                  Onboard Mentor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
