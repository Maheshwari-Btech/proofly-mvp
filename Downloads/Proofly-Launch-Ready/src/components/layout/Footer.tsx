import React from 'react';
import { ShieldCheck, Sparkles } from 'lucide-react';

interface FooterProps {
  onSelectTab?: (tab: any) => void;
}

export const Footer: React.FC<FooterProps> = ({ onSelectTab }) => {
  return (
    <footer className="bg-white border-t border-slate-200 mt-auto text-slate-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 font-semibold text-purple-700">
              <Sparkles className="h-3.5 w-3.5" />
              Proofly Career Engine v2.4.1 (AI-Assisted)
            </span>
            <span className="hidden md:inline text-slate-300">|</span>
            <span className="hidden md:flex items-center gap-1 text-slate-500">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
              Evidence-First Verification Active
            </span>
          </div>

          <div className="flex items-center gap-4 font-medium text-slate-500">
            {onSelectTab && (
              <>
                <button
                  onClick={() => onSelectTab('guide')}
                  className="hover:text-purple-700 transition-colors"
                >
                  User Guide
                </button>
                <button
                  onClick={() => onSelectTab('faq')}
                  className="hover:text-purple-700 transition-colors"
                >
                  FAQ
                </button>
                <button
                  onClick={() => onSelectTab('contact')}
                  className="hover:text-purple-700 transition-colors"
                >
                  Contact
                </button>
              </>
            )}
            <span className="text-slate-400">© 2026 Proofly Platform</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
