import React, { useState } from 'react';
import {
  Sparkles,
  MessageSquare,
  Send,
  X,
  Bot,
  User,
  ArrowRight,
  Zap,
  BookOpen,
  Users,
  Target,
} from 'lucide-react';
import { Opportunity, EvidenceItem, ReadinessAssessment, CareerTrial } from '../../types';
import { NavigationTab } from '../layout/Navbar';

interface CareerCoachDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  opportunity: Opportunity | null;
  evidence: EvidenceItem[];
  assessment: ReadinessAssessment | null;
  activeTrial: CareerTrial | null;
  onNavigate: (tab: NavigationTab) => void;
}

interface Message {
  id: string;
  sender: 'user' | 'coach';
  text: string;
  actions?: {
    label: string;
    tab: NavigationTab;
    icon: React.ComponentType<{ className?: string }>;
  }[];
}

export const CareerCoachDrawer: React.FC<CareerCoachDrawerProps> = ({
  isOpen,
  onClose,
  opportunity,
  evidence,
  assessment,
  activeTrial,
  onNavigate,
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'init_1',
      sender: 'coach',
      text: `Hello Jordan! I am your Proofly Career Coach. I am actively analyzing your target role (${opportunity?.title || 'Frontend Engineering Intern'} at ${opportunity?.company || 'Vercel'}).`,
    },
    {
      id: 'init_2',
      sender: 'coach',
      text: `Based on your ${evidence.length} evidence artifacts, your biggest identified skill gap is "${assessment?.biggestGap.skillName || 'RESTful APIs & Data Fetching'}". How can I guide you today?`,
      actions: [
        { label: 'Start Career Trial', tab: 'career-trial', icon: Zap },
        { label: 'View Learning Hub', tab: 'learning', icon: BookOpen },
        { label: 'Find a Mentor', tab: 'mentors', icon: Users },
      ],
    },
  ]);

  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  if (!isOpen) return null;

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const userText = inputMessage.trim();
    const newMsg: Message = {
      id: `msg_${Date.now()}`,
      sender: 'user',
      text: userText,
    };

    setMessages((prev) => [...prev, newMsg]);
    setInputMessage('');
    setIsTyping(true);

    // Context-grounded intelligent response
    setTimeout(() => {
      let replyText = '';
      let actions: Message['actions'] = undefined;

      const lower = userText.toLowerCase();
      if (lower.includes('rest') || lower.includes('api') || lower.includes('gap')) {
        replyText = `RESTful APIs are a Critical requirement for ${opportunity?.title || 'your target role'} at ${opportunity?.company || 'Vercel'}. While you have strong React portfolio proof, you currently lack verified evidence of REST integration, error boundaries, and async state. I recommend completing the "RESTful API Integration Bridge" Career Trial simulation to generate verified proof for your portfolio.`;
        actions = [
          { label: 'Launch Career Trial', tab: 'career-trial', icon: Zap },
          { label: 'Read API Tutorials', tab: 'learning', icon: BookOpen },
        ];
      } else if (lower.includes('readiness') || lower.includes('score')) {
        replyText = `Your overall readiness score is ${assessment?.readinessScore || 72}%. You have ${assessment?.strongMatchesCount || 3} Strong matches (React, TypeScript, Styling), but missing evidence for REST APIs and Testing is preventing you from reaching 85%+. Completing 1 Career Trial will immediately boost your score!`;
        actions = [{ label: 'Inspect Evidence Map', tab: 'readiness', icon: Target }];
      } else if (lower.includes('mentor') || lower.includes('help')) {
        replyText = `We have verified mentors like Sarah Chen (Senior Frontend @ Vercel) and Marcus Vance (Lead Engineer @ Stripe) who specialize in API architecture and resume reviews. You can submit a 1-click mentorship request directly through the Mentors tab.`;
        actions = [{ label: 'Browse Mentors', tab: 'mentors', icon: Users }];
      } else {
        replyText = `I am continuously tracking your readiness against ${opportunity?.requirements.length || 6} role requirements. You have ${evidence.length} verified artifacts. What specific skill or career question can I assist with?`;
      }

      setMessages((prev) => [
        ...prev,
        {
          id: `reply_${Date.now()}`,
          sender: 'coach',
          text: replyText,
          actions,
        },
      ]);
      setIsTyping(false);
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/40 backdrop-blur-xs flex justify-end">
      <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-200">
        {/* Coach Header */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-purple-900 text-white">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-purple-500/30 border border-purple-400/40 flex items-center justify-center text-purple-200">
              <Bot className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold leading-tight">Career Coach AI</h3>
              <p className="text-[11px] text-purple-200">Grounded in your Evidence & Target Role</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-purple-300 hover:text-white hover:bg-purple-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Message Log */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl p-3.5 text-xs leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-purple-600 text-white rounded-br-none shadow-xs'
                    : 'bg-white text-slate-800 border border-slate-200 rounded-bl-none shadow-xs'
                }`}
              >
                {msg.text}
              </div>

              {/* Action shortcuts attached to coach message */}
              {msg.actions && (
                <div className="mt-2 flex flex-wrap gap-1.5 max-w-[85%]">
                  {msg.actions.map((act) => {
                    const Icon = act.icon;
                    return (
                      <button
                        key={act.label}
                        onClick={() => {
                          onNavigate(act.tab);
                          onClose();
                        }}
                        className="px-2.5 py-1 bg-white hover:bg-purple-50 border border-purple-200 text-purple-700 font-bold text-[11px] rounded-lg shadow-2xs flex items-center gap-1.5 transition-colors"
                      >
                        <Icon className="h-3 w-3" />
                        <span>{act.label}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          ))}

          {isTyping && (
            <div className="flex items-center gap-1.5 text-slate-400 text-xs italic">
              <span className="h-1.5 w-1.5 bg-purple-500 rounded-full animate-bounce" />
              <span className="h-1.5 w-1.5 bg-purple-500 rounded-full animate-bounce [animation-delay:0.2s]" />
              <span className="h-1.5 w-1.5 bg-purple-500 rounded-full animate-bounce [animation-delay:0.4s]" />
              <span className="text-[11px] ml-1">Coach is analyzing...</span>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-200 bg-white">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Ask about your skill gaps, trials, or readiness..."
              className="flex-1 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-600"
            />
            <button
              type="submit"
              disabled={!inputMessage.trim()}
              className="p-2.5 bg-purple-600 disabled:opacity-50 hover:bg-purple-700 text-white rounded-xl shadow-xs transition-all"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
