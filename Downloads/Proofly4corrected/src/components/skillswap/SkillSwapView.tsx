import React, { useState } from 'react';
import {
  Users,
  Search,
  Sparkles,
  ShieldCheck,
  Send,
  MessageSquare,
  CheckCircle2,
  Lock,
  Eye,
  EyeOff,
  ExternalLink,
  GraduationCap,
  Clock,
  ArrowRightLeft,
} from 'lucide-react';
import { SkillSwapPeer, UserProfile } from '../../types';

interface SkillSwapViewProps {
  peers: SkillSwapPeer[];
  profile: UserProfile;
  onToggleActive: (active: boolean) => void;
  onSendMessage: (peerId: string, message: string) => void;
}

export const SkillSwapView: React.FC<SkillSwapViewProps> = ({
  peers,
  profile,
  onToggleActive,
  onSendMessage,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPeerForConnect, setSelectedPeerForConnect] = useState<SkillSwapPeer | null>(null);
  const [connectionMessage, setConnectionMessage] = useState(
    "Hi! I saw we have complementary skills. I'd love to exchange frontend tips for some guidance on API / backend development."
  );
  const [sentSuccessPeerId, setSentSuccessPeerId] = useState<string | null>(null);

  const filteredPeers = peers.filter((p) => {
    const query = searchQuery.toLowerCase();
    return (
      p.name.toLowerCase().includes(query) ||
      p.college.toLowerCase().includes(query) ||
      p.theyCanTeachYou.some((s) => s.toLowerCase().includes(query)) ||
      p.youCanTeachThem.some((s) => s.toLowerCase().includes(query))
    );
  });

  const handleSendRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPeerForConnect) return;

    onSendMessage(selectedPeerForConnect.id, connectionMessage);
    setSentSuccessPeerId(selectedPeerForConnect.id);
    setTimeout(() => {
      setSelectedPeerForConnect(null);
      setSentSuccessPeerId(null);
    }, 1500);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-purple-700 uppercase tracking-wider bg-purple-50 px-2.5 py-0.5 rounded-full border border-purple-100">
              Peer Skill Exchange
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            SkillSwap Network
          </h1>
          <p className="text-slate-600 text-sm mt-1">
            Connect with verified student peers whose strengths match your exact skill gaps.
          </p>
        </div>

        {/* Profile Visibility Toggle */}
        <div className="flex items-center gap-3 bg-white px-4 py-2.5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-right">
            <p className="text-xs font-bold text-slate-800">SkillSwap Visibility</p>
            <p className="text-[11px] text-slate-500">
              {profile.skillSwapActive ? 'Visible to peers' : 'Hidden from discovery'}
            </p>
          </div>
          <button
            onClick={() => onToggleActive(!profile.skillSwapActive)}
            className={`p-2 rounded-xl transition-colors ${
              profile.skillSwapActive
                ? 'bg-purple-600 text-white'
                : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
            }`}
            title="Toggle SkillSwap public visibility"
          >
            {profile.skillSwapActive ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Value Proposition Banner */}
      <div className="bg-purple-50/80 rounded-2xl p-6 border border-purple-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="h-10 w-10 rounded-xl bg-purple-700 text-white flex items-center justify-center font-bold shrink-0">
            <ArrowRightLeft className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-purple-950">How SkillSwap Algorithm Works</h3>
            <p className="text-xs text-purple-800 mt-0.5 leading-relaxed max-w-2xl">
              When Proofly analyzes your target opportunities, it finds peers where{' '}
              <strong>Your Strong Skills</strong> match <strong>Their Gaps</strong> and vice versa. Zero fluff, pure mutual growth.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 text-xs font-semibold text-purple-700 bg-white px-3 py-1.5 rounded-xl border border-purple-200">
          <ShieldCheck className="h-4 w-4 text-emerald-600" />
          Private assessments stay confidential
        </div>
      </div>

      {/* Search Filter */}
      <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by skill to learn (e.g. Python, SQL), skill to teach, or university..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-600 text-slate-800"
          />
        </div>
      </div>

      {/* Peer Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPeers.map((peer) => (
          <div
            key={peer.id}
            className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between gap-3 mb-4">
                <div className="flex items-center gap-3">
                  <div className="h-11 w-11 rounded-xl bg-indigo-100 text-indigo-700 font-bold text-sm flex items-center justify-center border border-indigo-200">
                    {peer.avatarInitials}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 leading-snug">{peer.name}</h3>
                    <p className="text-xs text-slate-500 flex items-center gap-1">
                      <GraduationCap className="h-3.5 w-3.5" />
                      {peer.college}
                    </p>
                  </div>
                </div>

                <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-purple-50 text-purple-700 border border-purple-200">
                  {peer.compatibilityScore}% Match
                </span>
              </div>

              <p className="text-xs text-slate-600 line-clamp-2 mb-4 leading-relaxed">
                {peer.bio}
              </p>

              {/* Complementary Skills Matrix */}
              <div className="space-y-2 mb-4">
                <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-100">
                  <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block mb-1">
                    They can teach you (Your Gap)
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {peer.theyCanTeachYou.map((s, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 text-[11px] font-semibold bg-white text-emerald-700 rounded-md border border-emerald-200"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="p-3 bg-purple-50/60 rounded-xl border border-purple-100">
                  <span className="text-[10px] font-bold text-purple-800 uppercase tracking-wider block mb-1">
                    You can teach them (Your Strength)
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {peer.youCanTeachThem.map((s, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 text-[11px] font-semibold bg-white text-purple-700 rounded-md border border-purple-200"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-400 mb-4">
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {peer.availability}
                </span>
                <span>{peer.lastActive}</span>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100">
              <button
                onClick={() => setSelectedPeerForConnect(peer)}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-2.5 px-4 rounded-xl text-xs transition-all flex items-center justify-center gap-2 shadow-2xs"
              >
                <MessageSquare className="h-3.5 w-3.5" />
                Connect & Propose Skill Exchange
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Connect Modal */}
      {selectedPeerForConnect && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="text-lg font-bold text-slate-900">
                Propose Exchange with {selectedPeerForConnect.name}
              </h3>
              <button
                onClick={() => setSelectedPeerForConnect(null)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                &times;
              </button>
            </div>

            {sentSuccessPeerId === selectedPeerForConnect.id ? (
              <div className="text-center py-8">
                <CheckCircle2 className="h-12 w-12 text-emerald-600 mx-auto mb-2" />
                <p className="text-base font-bold text-slate-900">SkillSwap Invitation Sent!</p>
                <p className="text-xs text-slate-500 mt-1">
                  {selectedPeerForConnect.name} has been notified and can accept your exchange request.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSendRequest} className="space-y-4">
                <div className="p-3 bg-purple-50 rounded-xl border border-purple-100 text-xs text-purple-900">
                  <p>
                    <strong>Exchange Proposal:</strong> You share{' '}
                    <em>{selectedPeerForConnect.youCanTeachThem.join(', ')}</em> in return for{' '}
                    <em>{selectedPeerForConnect.theyCanTeachYou.join(', ')}</em>.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Personalized Introduction Note
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={connectionMessage}
                    onChange={(e) => setConnectionMessage(e.target.value)}
                    className="w-full p-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-600"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setSelectedPeerForConnect(null)}
                    className="px-4 py-2 text-xs font-semibold text-slate-600"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition-all flex items-center gap-2 shadow-xs"
                  >
                    <Send className="h-3.5 w-3.5" />
                    Send SkillSwap Request
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
