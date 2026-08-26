import React, { useState, useMemo } from 'react';
import {
  Users,
  Search,
  CheckCircle2,
  Star,
  ExternalLink,
  MessageSquare,
  Briefcase,
  Languages,
  Calendar,
  Sparkles,
  UserCheck,
  Send,
  X,
} from 'lucide-react';
import { Mentor, MentorRequest } from '../../types';

interface MentorsViewProps {
  mentors: Mentor[];
  activeSkillGap?: string;
  onRequestMentorship?: (request: MentorRequest) => void;
}

export const MentorsView: React.FC<MentorsViewProps> = ({
  mentors,
  activeSkillGap = 'RESTful APIs & Data Fetching',
  onRequestMentorship,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSkill, setSelectedSkill] = useState<string>('all');
  const [selectedMentorForModal, setSelectedMentorForModal] = useState<Mentor | null>(null);
  const [requestMessage, setRequestMessage] = useState('');
  const [requestSentToast, setRequestSentToast] = useState(false);

  // Filter mentors
  const filteredMentors = useMemo(() => {
    return mentors.filter((m) => {
      const matchesSearch =
        m.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.headline.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.skills.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesSkill = selectedSkill === 'all' || m.skills.some((s) => s === selectedSkill);

      return matchesSearch && matchesSkill;
    });
  }, [mentors, searchQuery, selectedSkill]);

  // Recommended mentors matching the user's biggest gap
  const recommendedMentors = useMemo(() => {
    return mentors.filter((m) =>
      m.skills.some(
        (s) =>
          s.toLowerCase().includes(activeSkillGap.toLowerCase()) ||
          activeSkillGap.toLowerCase().includes(s.toLowerCase())
      )
    );
  }, [mentors, activeSkillGap]);

  const handleSendRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMentorForModal) return;

    if (onRequestMentorship) {
      onRequestMentorship({
        id: `mreq_${Date.now()}`,
        mentorId: selectedMentorForModal.id,
        mentorName: selectedMentorForModal.fullName,
        studentId: 'usr_current',
        studentName: 'Jordan Davis',
        targetRole: 'Frontend Engineering Intern',
        targetSkillGap: activeSkillGap,
        message: requestMessage,
        status: 'Pending',
        createdAt: new Date().toISOString(),
      });
    }

    setSelectedMentorForModal(null);
    setRequestMessage('');
    setRequestSentToast(true);
    setTimeout(() => setRequestSentToast(false), 4000);
  };

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Verified Mentors</h1>
            <span className="px-2.5 py-0.5 text-xs font-bold bg-purple-100 text-purple-800 rounded-full border border-purple-200">
              1-on-1 Guidance
            </span>
          </div>
          <p className="text-slate-600 text-sm mt-1">
            Connect with verified software engineers and designers from top companies for code reviews, portfolio audits, and mock interviews.
          </p>
        </div>
      </div>

      {/* Success Notification */}
      {requestSentToast && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 p-4 rounded-2xl flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="h-5 w-5 text-emerald-600" />
            <p className="text-sm font-semibold">
              Mentorship request sent! The mentor will respond to your Stanford email within 24-48 hours.
            </p>
          </div>
          <button onClick={() => setRequestSentToast(false)} className="text-emerald-700 text-xs font-bold">
            Dismiss
          </button>
        </div>
      )}

      {/* Gap-Based Mentor Highlight */}
      {activeSkillGap && recommendedMentors.length > 0 && (
        <div className="bg-purple-50/70 border border-purple-200 rounded-3xl p-6 sm:p-8 space-y-4">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-purple-700" />
            <h2 className="text-sm font-bold text-purple-900 uppercase tracking-wider">
              Mentors specializing in your biggest gap ({activeSkillGap})
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recommendedMentors.map((mentor) => (
              <div
                key={mentor.id}
                className="bg-white p-5 rounded-2xl border border-purple-100 shadow-xs flex items-start justify-between gap-4"
              >
                <div className="flex items-start gap-3.5">
                  <div className="h-11 w-11 rounded-full bg-purple-100 border border-purple-200 flex items-center justify-center text-purple-800 font-bold text-sm shrink-0">
                    {mentor.avatarInitials}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h4 className="text-sm font-bold text-slate-900">{mentor.fullName}</h4>
                      <UserCheck className="h-3.5 w-3.5 text-purple-600" />
                    </div>
                    <p className="text-xs font-semibold text-purple-700">{mentor.company}</p>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2">{mentor.bio}</p>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedMentorForModal(mentor)}
                  className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shrink-0 transition-all shadow-xs"
                >
                  Request
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Search and Filters */}
      <div className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by mentor name, company, or expertise..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:bg-white"
            />
          </div>
        </div>
      </div>

      {/* Mentors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {filteredMentors.map((mentor) => (
          <div
            key={mentor.id}
            className="bg-white rounded-2xl border border-slate-200 hover:border-purple-300 p-6 shadow-xs flex flex-col justify-between transition-all space-y-5"
          >
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-2xl bg-purple-100 border border-purple-200 flex items-center justify-center text-purple-800 font-extrabold text-base">
                    {mentor.avatarInitials}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 flex items-center gap-1.5">
                      {mentor.fullName}
                      {mentor.verified && <UserCheck className="h-4 w-4 text-purple-600" />}
                    </h3>
                    <p className="text-xs font-semibold text-purple-700">{mentor.company}</p>
                  </div>
                </div>

                <div className="flex items-center gap-1 text-xs font-bold text-amber-600">
                  <Star className="h-3.5 w-3.5 fill-amber-400 stroke-amber-400" />
                  <span>{mentor.rating}</span>
                </div>
              </div>

              <p className="text-xs text-slate-500 font-medium leading-relaxed">
                {mentor.headline}
              </p>

              <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                {mentor.bio}
              </p>

              {/* Skills and topics */}
              <div className="space-y-1.5">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Expertise</p>
                <div className="flex flex-wrap gap-1.5">
                  {mentor.skills.map((skill) => (
                    <span
                      key={skill}
                      className="px-2 py-0.5 bg-purple-50 text-purple-800 text-[11px] font-semibold rounded-md border border-purple-100"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <div className="text-xs text-slate-500 font-medium">
                <span>{mentor.experienceYears}y exp</span>
                <span className="mx-1.5">&bull;</span>
                <span className="text-emerald-700 font-semibold">{mentor.availability}</span>
              </div>

              <button
                onClick={() => setSelectedMentorForModal(mentor)}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5"
              >
                <MessageSquare className="h-3.5 w-3.5" />
                <span>Request</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Mentorship Request Modal */}
      {selectedMentorForModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 space-y-6">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-purple-100 text-purple-700 font-bold flex items-center justify-center">
                  {selectedMentorForModal.avatarInitials}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">
                    Request 1-on-1 Mentorship
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    with {selectedMentorForModal.fullName} ({selectedMentorForModal.company})
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedMentorForModal(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSendRequest} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Target Skill Gap
                </label>
                <input
                  type="text"
                  value={activeSkillGap}
                  readOnly
                  className="w-full px-3.5 py-2 bg-slate-100 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  What would you like help with?
                </label>
                <textarea
                  rows={4}
                  required
                  value={requestMessage}
                  onChange={(e) => setRequestMessage(e.target.value)}
                  placeholder="Introduce yourself, mention your target role, and ask specific questions about closing this skill gap or reviewing your Career Trial submission..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-600"
                />
              </div>

              <div className="p-3 bg-purple-50 rounded-xl border border-purple-100 text-[11px] text-purple-900 leading-relaxed">
                💡 <span className="font-bold">Tip:</span> Mentors respond fastest to concrete requests (e.g. "Could you look over my REST API architecture for the Vercel internship?").
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedMentorForModal(null)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-1.5"
                >
                  <Send className="h-3.5 w-3.5" />
                  <span>Send Request</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
