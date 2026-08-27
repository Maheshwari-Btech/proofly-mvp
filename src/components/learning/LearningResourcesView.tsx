import React, { useState, useMemo } from 'react';
import {
  BookOpen,
  Search,
  ExternalLink,
  Filter,
  CheckCircle2,
  Clock,
  Tag,
  Star,
  Award,
  Video,
  FileText,
  Code2,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { LearningResource } from '../../types';

interface LearningResourcesViewProps {
  resources: LearningResource[];
  activeSkillGap?: string;
  onSelectResource?: (resource: LearningResource) => void;
}

export const LearningResourcesView: React.FC<LearningResourcesViewProps> = ({
  resources,
  activeSkillGap = 'RESTful APIs & Data Fetching',
  onSelectResource,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [freeOnly, setFreeOnly] = useState(false);

  // Filter and sort resources
  const filteredResources = useMemo(() => {
    return resources.filter((res) => {
      const matchesSearch =
        res.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        res.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        res.provider.toLowerCase().includes(searchQuery.toLowerCase()) ||
        res.skills.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesType = selectedType === 'all' || res.resourceType === selectedType;
      const matchesDifficulty = selectedDifficulty === 'all' || res.difficulty === selectedDifficulty;
      const matchesFree = !freeOnly || res.free;

      return matchesSearch && matchesType && matchesDifficulty && matchesFree;
    });
  }, [resources, searchQuery, selectedType, selectedDifficulty, freeOnly]);

  // Highlighted recommendations for the user's biggest gap
  const gapRecommendations = useMemo(() => {
    return resources.filter((res) =>
      res.skills.some(
        (s) => s.toLowerCase().includes(activeSkillGap.toLowerCase()) || activeSkillGap.toLowerCase().includes(s.toLowerCase())
      )
    );
  }, [resources, activeSkillGap]);

  const getTypeIcon = (type: LearningResource['resourceType']) => {
    switch (type) {
      case 'Video':
        return Video;
      case 'Course':
        return BookOpen;
      case 'Tutorial':
        return Code2;
      case 'Documentation':
        return FileText;
      case 'Certification':
        return Award;
      default:
        return BookOpen;
    }
  };

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Learning Hub</h1>
            <span className="px-2.5 py-0.5 text-xs font-bold bg-purple-100 text-purple-800 rounded-full border border-purple-200">
              Curated Catalog
            </span>
          </div>
          <p className="text-slate-600 text-sm mt-1">
            Targeted tutorials, official docs, and practice projects mapped directly to your detected skill gaps.
          </p>
        </div>
      </div>

      {/* Recommended for Biggest Skill Gap Hero */}
      {activeSkillGap && gapRecommendations.length > 0 && (
        <div className="bg-gradient-to-r from-purple-900 to-indigo-900 rounded-3xl p-6 sm:p-8 text-white shadow-md relative overflow-hidden">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
            <div className="space-y-2 max-w-2xl">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/30 border border-purple-400/30 text-purple-200 text-xs font-bold">
                <Sparkles className="h-3.5 w-3.5 text-purple-300" />
                <span>Recommended for Your Biggest Skill Gap</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
                Mastering: {activeSkillGap}
              </h2>
              <p className="text-purple-200 text-sm leading-relaxed">
                Your target opportunity requires strong practical proficiency in {activeSkillGap}. Here are the top-ranked learning resources to close this gap.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              {gapRecommendations.slice(0, 2).map((rec) => (
                <a
                  key={rec.id}
                  href={rec.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-white/10 hover:bg-white/20 border border-white/20 p-4 rounded-2xl transition-colors backdrop-blur-xs flex flex-col justify-between group max-w-xs"
                >
                  <div>
                    <div className="flex items-center justify-between text-[11px] text-purple-200 font-semibold mb-1">
                      <span>{rec.provider}</span>
                      <span>{rec.duration}</span>
                    </div>
                    <h4 className="text-sm font-bold text-white group-hover:text-purple-200 line-clamp-2">
                      {rec.title}
                    </h4>
                  </div>
                  <div className="mt-3 flex items-center justify-between text-xs text-purple-300 font-medium">
                    <span>{rec.free ? 'Free Resource' : 'Paid'}</span>
                    <ExternalLink className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </a>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by skill, title, keyword, or provider..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:bg-white transition-colors"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-600"
            >
              <option value="all">All Formats</option>
              <option value="Course">Courses</option>
              <option value="Tutorial">Tutorials</option>
              <option value="Documentation">Documentation</option>
              <option value="Project">Projects</option>
              <option value="Practice">Practice / Code</option>
            </select>

            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-600"
            >
              <option value="all">All Levels</option>
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>

            <label className="flex items-center gap-2 px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={freeOnly}
                onChange={(e) => setFreeOnly(e.target.checked)}
                className="rounded text-purple-600 focus:ring-purple-500 h-4 w-4"
              />
              <span>Free Only</span>
            </label>
          </div>
        </div>
      </div>

      {/* Resources Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredResources.map((resource) => {
          const Icon = getTypeIcon(resource.resourceType);
          return (
            <div
              key={resource.id}
              className="bg-white rounded-2xl border border-slate-200 hover:border-purple-300 p-6 shadow-xs flex flex-col justify-between transition-all hover:shadow-sm space-y-4 group"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-purple-50 text-purple-700 text-xs font-bold border border-purple-100">
                    <Icon className="h-3.5 w-3.5" />
                    <span>{resource.resourceType}</span>
                  </span>
                  <div className="flex items-center gap-2">
                    {resource.free && (
                      <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                        Free
                      </span>
                    )}
                    {resource.rating && (
                      <span className="text-xs font-bold text-amber-600 flex items-center gap-1">
                        <Star className="h-3.5 w-3.5 fill-amber-400 stroke-amber-400" />
                        {resource.rating}
                      </span>
                    )}
                  </div>
                </div>

                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                    {resource.provider}
                  </p>
                  <h3 className="text-base font-bold text-slate-900 group-hover:text-purple-700 transition-colors leading-snug">
                    {resource.title}
                  </h3>
                </div>

                <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                  {resource.description}
                </p>

                {/* Skills tags */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {resource.skills.map((skill) => (
                    <span
                      key={skill}
                      className="px-2 py-0.5 bg-slate-100 text-slate-700 text-[11px] font-medium rounded-md"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-3 text-xs text-slate-500 font-medium">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" />
                    {resource.duration}
                  </span>
                  <span>&bull;</span>
                  <span>{resource.difficulty}</span>
                </div>

                <a
                  href={resource.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold text-xs rounded-xl transition-colors"
                >
                  <span>Open</span>
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </div>
            </div>
          );
        })}
      </div>

      {filteredResources.length === 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
          <BookOpen className="h-10 w-10 text-slate-300 mx-auto" />
          <h3 className="text-lg font-bold text-slate-800">No learning resources found</h3>
          <p className="text-sm text-slate-500 max-w-sm mx-auto">
            We are preparing additional tutorials and courses for this topic. Try adjusting your search query or filters.
          </p>
        </div>
      )}
    </div>
  );
};
