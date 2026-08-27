import React, { useMemo, useState } from 'react';
import {
  CheckCircle2,
  MessageSquare,
  Search,
  Send,
  Sparkles,
  Star,
  UserCheck,
  X,
} from 'lucide-react';
import { Mentor, MentorRequest } from '../../types';

interface MentorsViewProps {
  mentors: Mentor[];
  activeSkillGap?: string;
  studentName?: string;
  studentId?: string;
  targetRole?: string;
  onRequestMentorship?: (
    request: MentorRequest
  ) => void | Promise<boolean | void>;
}

export const MentorsView: React.FC<MentorsViewProps> = ({
  mentors,
  activeSkillGap = 'RESTful APIs & Data Fetching',
  studentName = 'Proofly Member',
  studentId = '',
  targetRole = 'Software Engineering Intern',
  onRequestMentorship,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMentor, setSelectedMentor] = useState<Mentor | null>(null);
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);

  const filteredMentors = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    if (!query) {
      return mentors;
    }

    return mentors.filter((mentor) => {
      return (
        mentor.fullName.toLowerCase().includes(query) ||
        mentor.headline.toLowerCase().includes(query) ||
        mentor.company.toLowerCase().includes(query) ||
        mentor.skills.some((skill) =>
          skill.toLowerCase().includes(query)
        )
      );
    });
  }, [mentors, searchQuery]);

  const recommendedMentors = useMemo(() => {
    if (!activeSkillGap) {
      return [];
    }

    const gap = activeSkillGap.toLowerCase();

    return mentors.filter((mentor) =>
      mentor.skills.some((skill) => {
        const skillName = skill.toLowerCase();

        return (
          skillName.includes(gap) ||
          gap.includes(skillName)
        );
      })
    );
  }, [mentors, activeSkillGap]);

  const handleSendRequest = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (!selectedMentor || sending) {
      return;
    }

    try {
      setSending(true);

      if (onRequestMentorship) {
        const result = await onRequestMentorship({
          id: `mreq_${Date.now()}`,
          mentorId: selectedMentor.id,
          mentorName: selectedMentor.fullName,
          studentId,
          studentName,
          targetRole,
          targetSkillGap: activeSkillGap,
          message: message.trim(),
          status: 'Pending',
          createdAt: new Date().toISOString(),
        });

        if (result === false) {
          return;
        }
      }

      setSelectedMentor(null);
      setMessage('');
      setSent(true);

      window.setTimeout(() => {
        setSent(false);
      }, 4000);
    } catch (error) {
      console.error('Mentorship request error:', error);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <div className="flex items-center gap-2 flex-wrap">
          <h1 className="text-3xl font-extrabold text-slate-900">
            Mentor Network
          </h1>

          <span className="px-2.5 py-0.5 text-xs font-bold bg-purple-100 text-purple-800 rounded-full">
            1-on-1 Guidance
          </span>
        </div>

        <p className="text-slate-600 text-sm mt-1">
          Connect with mentors and experienced professionals for code
          reviews, portfolio audits, and mock interviews.
        </p>
      </div>

      {sent && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 p-4 rounded-2xl flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-emerald-600" />
            <p className="text-sm font-semibold">
              Mentorship request sent successfully!
            </p>
          </div>

          <button
            type="button"
            onClick={() => setSent(false)}
            className="text-xs font-bold"
          >
            Dismiss
          </button>
        </div>
      )}

      {activeSkillGap && recommendedMentors.length > 0 && (
        <div className="bg-purple-50 border border-purple-200 rounded-3xl p-6 space-y-4">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-purple-700" />
            <h2 className="text-sm font-bold text-purple-900">
              Recommended Mentors
            </h2>
          </div>

          <p className="text-xs text-purple-800">
            Based on your skill gap: {activeSkillGap}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recommendedMentors.map((mentor) => (
              <div
                key={mentor.id}
                className="bg-white p-5 rounded-2xl border border-purple-100 flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3">
                  <div className="h-11 w-11 rounded-full bg-purple-100 flex items-center justify-center text-purple-800 font-bold">
                    {mentor.avatarInitials}
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      {mentor.fullName}
                    </h3>
                    <p className="text-xs text-purple-700">
                      {mentor.company}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedMentor(mentor)}
                  className="px-3 py-1.5 bg-purple-600 text-white text-xs font-bold rounded-xl"
                >
                  Request
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-white p-5 rounded-2xl border border-slate-200">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Search mentors..."
            className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm"
          />
        </div>
      </div>

      {filteredMentors.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center">
          <UserCheck className="h-10 w-10 text-purple-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-900">
            Mentor network is being onboarded
          </h3>
          <p className="text-sm text-slate-500 mt-2">
            Verified mentors will appear here once they are onboarded.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {filteredMentors.map((mentor) => (
            <div
              key={mentor.id}
              className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col justify-between space-y-5"
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-2xl bg-purple-100 flex items-center justify-center text-purple-800 font-bold">
                      {mentor.avatarInitials}
                    </div>

                    <div>
                      <h3 className="text-base font-bold text-slate-900 flex items-center gap-1">
                        {mentor.fullName}
                        {mentor.verified && (
                          <UserCheck className="h-4 w-4 text-purple-600" />
                        )}
                      </h3>
                      <p className="text-xs font-semibold text-purple-700">
                        {mentor.company}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 text-xs font-bold text-amber-600">
                    <Star className="h-3.5 w-3.5 fill-amber-400" />
                    {mentor.rating}
                  </div>
                </div>

                <p className="text-xs text-slate-500">
                  {mentor.headline}
                </p>

                <p className="text-xs text-slate-600 leading-relaxed">
                  {mentor.bio}
                </p>

                <div>
                  <p className="text-[11px] font-bold text-slate-400 uppercase mb-2">
                    Expertise
                  </p>

                  <div className="flex flex-wrap gap-1.5">
                    {mentor.skills.map((skill) => (
                      <span
                        key={skill}
                        className="px-2 py-1 bg-purple-50 text-purple-800 text-[11px] font-semibold rounded-md"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <div className="text-xs text-slate-500">
                  {mentor.experienceYears}y exp
                  <span className="mx-1.5">•</span>
                  <span className="text-emerald-700 font-semibold">
                    {mentor.availability}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedMentor(mentor)}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5"
                >
                  <MessageSquare className="h-3.5 w-3.5" />
                  Request
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedMentor && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={(event) => {
            if (event.target === event.currentTarget) {
              setSelectedMentor(null);
            }
          }}
        >
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-purple-100 text-purple-700 font-bold flex items-center justify-center">
                  {selectedMentor.avatarInitials}
                </div>

                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    Request Mentorship
                  </h2>
                  <p className="text-xs text-slate-500">
                    with {selectedMentor.fullName}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedMentor(null)}
                className="p-2 rounded-lg hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSendRequest} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Target Skill Gap
                </label>
                <input
                  value={activeSkillGap}
                  readOnly
                  className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-xl text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Message
                </label>
                <textarea
                  required
                  minLength={10}
                  rows={5}
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  placeholder="Tell the mentor what you would like help with..."
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm resize-none"
                />
              </div>

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedMentor(null);
                    setMessage('');
                  }}
                  className="px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={sending}
                  className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white text-sm font-bold rounded-xl flex items-center gap-2"
                >
                  <Send className="h-4 w-4" />
                  {sending ? 'Sending...' : 'Send Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};