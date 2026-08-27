import React, { useState } from 'react';
import {
  User,
  GraduationCap,
  Briefcase,
  Target,
  Edit2,
  CheckCircle2,
  TrendingUp,
  ShieldCheck,
  Award,
  Calendar,
  Sparkles,
  BookOpen,
  FileCheck,
} from 'lucide-react';
import { UserProfile, SkillProgressRecord, EvidenceItem } from '../../types';

interface ProfileViewProps {
  profile: UserProfile;
  evidence: EvidenceItem[];
  progress: SkillProgressRecord[];
  onUpdateProfile: (profile: UserProfile) => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  profile,
  evidence,
  progress,
  onUpdateProfile,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [fullName, setFullName] = useState(profile.fullName);
  const [email, setEmail] = useState(profile.email);
  const [college, setCollege] = useState(profile.college);
  const [degree, setDegree] = useState(profile.degree);
  const [graduationYear, setGraduationYear] = useState(profile.graduationYear);
  const [targetRole, setTargetRole] = useState(profile.targetRole);
  const [bio, setBio] = useState(profile.bio);
  const [careerGoal, setCareerGoal] = useState(profile.careerGoal);
  const [skillsInput, setSkillsInput] = useState(profile.currentSkills.join(', '));

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedSkills = skillsInput
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    onUpdateProfile({
      ...profile,
      fullName,
      email,
      college,
      degree,
      graduationYear,
      targetRole,
      bio,
      careerGoal,
      currentSkills: updatedSkills,
      avatarInitials: fullName
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2),
    });
    setIsEditing(false);
  };

  return (
    <div className="space-y-6">
      {/* Header Profile Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-slate-100">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-2xl bg-purple-700 text-white flex items-center justify-center font-bold text-2xl shadow-md border-2 border-purple-200">
              {profile.avatarInitials || 'JD'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-slate-900">{profile.fullName}</h1>
                <span className="px-2.5 py-0.5 text-xs font-bold text-emerald-700 bg-emerald-50 rounded-full border border-emerald-200">
                  Verified Candidate
                </span>
              </div>
              <p className="text-sm font-semibold text-purple-700 mt-0.5">{profile.targetRole}</p>
              <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-1">
                <GraduationCap className="h-3.5 w-3.5" />
                {profile.degree} &bull; {profile.college} (Class of {profile.graduationYear})
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsEditing(true)}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-bold text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-xl transition-colors self-start sm:self-center"
          >
            <Edit2 className="h-3.5 w-3.5" />
            Edit Career Profile
          </button>
        </div>

        {/* Bio & Career Goal */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 text-xs">
          <div>
            <h3 className="font-bold text-slate-700 uppercase tracking-wider mb-2">About & Focus</h3>
            <p className="text-slate-600 leading-relaxed text-sm">{profile.bio}</p>
          </div>
          <div>
            <h3 className="font-bold text-purple-800 uppercase tracking-wider mb-2">
              Primary Career Objective
            </h3>
            <div className="p-4 bg-purple-50/80 rounded-xl border border-purple-100 text-purple-950 font-medium leading-relaxed text-sm">
              &ldquo;{profile.careerGoal}&rdquo;
            </div>
          </div>
        </div>
      </div>

      {/* Skills Showcase with Evidence Counts */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">Verified Technical Skills</h3>
            <p className="text-xs text-slate-500">
              Cross-verified with {evidence.length} portfolio artifacts and simulation assessments.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {profile.currentSkills.map((skill, idx) => {
            const count = evidence.filter((e) =>
              e.skills.some((s) => s.toLowerCase().includes(skill.toLowerCase()))
            ).length;
            return (
              <div
                key={idx}
                className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-purple-600" />
                  <span className="text-xs font-bold text-slate-800">{skill}</span>
                </div>
                <span className="text-[11px] font-semibold text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
                  {count > 0 ? `${count} Artifact${count > 1 ? 's' : ''}` : 'Self-Reported'}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Skill Growth & Advancement Timeline */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-purple-600" />
          Skill Progression History
        </h3>

        <div className="space-y-3">
          {progress.map((item) => (
            <div
              key={item.id}
              className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
            >
              <div>
                <p className="font-bold text-slate-900 text-sm">{item.skillName}</p>
                <p className="text-slate-500">{item.source}</p>
              </div>

              <div className="flex items-center gap-3">
                <span className="px-2.5 py-1 rounded-md bg-purple-100 text-purple-800 font-bold">
                  {item.previousLevel} &rarr; {item.currentLevel}
                </span>
                <span className="text-slate-400 font-medium">{item.date}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Edit Profile Modal */}
      {isEditing && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 p-6 sm:p-8 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-6">
              <h2 className="text-xl font-bold text-slate-900">Edit Career Profile</h2>
              <button
                onClick={() => setIsEditing(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    University / College
                  </label>
                  <input
                    type="text"
                    value={college}
                    onChange={(e) => setCollege(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Degree / Major
                  </label>
                  <input
                    type="text"
                    value={degree}
                    onChange={(e) => setDegree(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Graduation Year
                  </label>
                  <input
                    type="text"
                    value={graduationYear}
                    onChange={(e) => setGraduationYear(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Target Role
                  </label>
                  <input
                    type="text"
                    value={targetRole}
                    onChange={(e) => setTargetRole(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Professional Bio
                </label>
                <textarea
                  rows={3}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full p-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Primary Career Goal
                </label>
                <input
                  type="text"
                  value={careerGoal}
                  onChange={(e) => setCareerGoal(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Skills (comma-separated)
                </label>
                <input
                  type="text"
                  value={skillsInput}
                  onChange={(e) => setSkillsInput(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-600"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2.5 text-xs font-semibold text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold px-6 py-2.5 rounded-xl transition-all shadow-xs"
                >
                  Save Profile Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
