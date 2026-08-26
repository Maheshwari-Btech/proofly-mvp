import React, { useState } from 'react';
import {
  Briefcase,
  Layers,
  FileCheck,
  Target,
  Sparkles,
  Users,
  BookOpen,
  HelpCircle,
  Mail,
  User,
  Settings,
  Menu,
  X,
  ChevronDown,
  Plus,
  Home,
  UserCheck,
  ShieldAlert,
  Bot,
} from 'lucide-react';
import { UserProfile } from '../../types';

export type NavigationTab =
  | 'home'
  | 'dashboard'
  | 'opportunities'
  | 'evidence'
  | 'readiness'
  | 'career-trial'
  | 'learning'
  | 'mentors'
  | 'skillswap'
  | 'guide'
  | 'faq'
  | 'contact'
  | 'profile'
  | 'settings'
  | 'admin';

interface NavbarProps {
  activeTab: NavigationTab;
  onSelectTab: (tab: NavigationTab) => void;
  profile: UserProfile;
  onOpenAddOpportunity?: () => void;
  onOpenAddEvidence?: () => void;
  onOpenCoach?: () => void;
  onLogout?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onSelectTab,
  profile,
  onOpenAddOpportunity,
  onOpenAddEvidence,
  onOpenCoach,
  onLogout,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  interface NavItem {
    id: NavigationTab;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: string;
  }

  const mainNavItems: NavItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: Layers },
    { id: 'opportunities', label: 'Opportunities', icon: Briefcase },
    { id: 'evidence', label: 'Evidence', icon: FileCheck },
    { id: 'readiness', label: 'Readiness', icon: Target },
    { id: 'career-trial', label: 'Career Trial', icon: Sparkles, badge: 'Active' },
    { id: 'learning', label: 'Learning', icon: BookOpen },
    { id: 'mentors', label: 'Mentors', icon: UserCheck },
    { id: 'skillswap', label: 'SkillSwap', icon: Users },
  ];

  const secondaryNavItems: NavItem[] = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'guide', label: 'Guide', icon: BookOpen },
    { id: 'faq', label: 'FAQ', icon: HelpCircle },
    { id: 'contact', label: 'Contact', icon: Mail },
  ];

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Main Nav */}
          <div className="flex items-center gap-6">
            <button
              onClick={() => onSelectTab('home')}
              className="flex items-center gap-2.5 text-left group focus:outline-none shrink-0"
            >
              <div className="h-9 w-9 rounded-xl bg-purple-700 flex items-center justify-center text-white shadow-xs transition-transform group-hover:scale-105">
                <Target className="h-5 w-5 stroke-[2.5]" />
              </div>
              <div>
                <span className="text-2xl font-bold text-purple-700 tracking-tight block leading-tight">
                  Proofly
                </span>
                <span className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase block">
                  Career Readiness
                </span>
              </div>
            </button>

            {/* Desktop Navigation Links */}
            <div className="hidden xl:flex items-center gap-0.5">
              {mainNavItems.map((item) => {
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => onSelectTab(item.id)}
                    className={`relative px-3 py-2 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                      isActive
                        ? 'text-purple-700 bg-purple-50 font-bold'
                        : 'text-slate-600 hover:text-purple-600 hover:bg-slate-50'
                    }`}
                  >
                    <span>{item.label}</span>
                    {item.badge && (
                      <span className="ml-0.5 px-1.5 py-0.5 text-[9px] font-bold rounded-full bg-purple-200 text-purple-800">
                        {item.badge}
                      </span>
                    )}
                    {isActive && (
                      <span className="absolute bottom-0 left-2.5 right-2.5 h-0.5 bg-purple-700 rounded-full" />
                    )}
                  </button>
                );
              })}

              <div className="h-4 w-px bg-slate-200 mx-1.5" />

              {secondaryNavItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => onSelectTab(item.id)}
                  className={`px-2 py-2 text-xs font-medium rounded-lg transition-colors ${
                    activeTab === item.id
                      ? 'text-purple-700 bg-purple-50 font-bold'
                      : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Right Action Area */}
          <div className="hidden md:flex items-center gap-2.5">
            {onOpenCoach && (
              <button
                onClick={onOpenCoach}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-purple-700 bg-purple-100 hover:bg-purple-200 border border-purple-200 rounded-xl transition-colors shadow-2xs"
              >
                <Bot className="h-3.5 w-3.5" />
                <span>Career Coach</span>
              </button>
            )}

            {onOpenAddEvidence && (
              <button
                onClick={onOpenAddEvidence}
                className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-xl transition-colors"
              >
                <Plus className="h-3.5 w-3.5" />
                Evidence
              </button>
            )}

            {onOpenAddOpportunity && (
              <button
                onClick={onOpenAddOpportunity}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-purple-600 hover:bg-purple-700 rounded-xl shadow-xs transition-all"
              >
                <Plus className="h-3.5 w-3.5" />
                Opportunity
              </button>
            )}

            {/* Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-100 transition-colors focus:outline-none"
              >
                <div className="h-9 w-9 rounded-full bg-purple-100 border border-purple-200 flex items-center justify-center text-purple-700 font-bold text-xs shadow-2xs">
                  {profile.avatarInitials || 'JD'}
                </div>
                <div className="text-left hidden 2xl:block">
                  <p className="text-xs font-bold text-slate-800 leading-none">{profile.fullName}</p>
                  <p className="text-[10px] text-slate-500 truncate max-w-[100px] leading-tight mt-0.5">
                    {profile.college}
                  </p>
                </div>
                <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
              </button>

              {userDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-200 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100">
                  <div className="px-4 py-2 border-b border-slate-100">
                    <p className="text-sm font-bold text-slate-800">{profile.fullName}</p>
                    <p className="text-xs text-slate-500 truncate">{profile.email}</p>
                  </div>

                  <button
                    onClick={() => {
                      onSelectTab('profile');
                      setUserDropdownOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 text-xs text-slate-700 hover:bg-purple-50 hover:text-purple-700 flex items-center gap-2 font-medium"
                  >
                    <User className="h-4 w-4" />
                    Career Profile
                  </button>

                  <button
                    onClick={() => {
                      onSelectTab('settings');
                      setUserDropdownOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 text-xs text-slate-700 hover:bg-purple-50 hover:text-purple-700 flex items-center gap-2 font-medium"
                  >
                    <Settings className="h-4 w-4" />
                    Settings & Privacy
                  </button>

                  <button
                    onClick={() => {
                      onSelectTab('admin');
                      setUserDropdownOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 text-xs text-purple-700 bg-purple-50/50 hover:bg-purple-100 flex items-center gap-2 font-bold"
                  >
                    <ShieldAlert className="h-4 w-4 text-purple-600" />
                    Admin Console
                  </button>
                  {onLogout && <button onClick={() => { setUserDropdownOpen(false); onLogout(); }} className="w-full text-left px-4 py-2 text-xs text-red-600 hover:bg-red-50 font-semibold">Sign out</button>}
                </div>
              )}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex xl:hidden items-center gap-2">
            {onOpenCoach && (
              <button
                onClick={onOpenCoach}
                className="p-1.5 rounded-lg text-purple-700 bg-purple-50 hover:bg-purple-100"
              >
                <Bot className="h-5 w-5" />
              </button>
            )}
            <button
              onClick={() => onSelectTab('profile')}
              className="h-8 w-8 rounded-full bg-purple-100 border border-purple-200 flex items-center justify-center text-purple-700 font-bold text-xs"
            >
              {profile.avatarInitials || 'JD'}
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 focus:outline-none"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="xl:hidden bg-white border-b border-slate-200 px-4 pt-2 pb-6 space-y-1 shadow-lg animate-in slide-in-from-top-4 duration-150">
          <div className="px-3 py-2 mb-2 bg-purple-50 rounded-xl flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-purple-900">{profile.fullName}</p>
              <p className="text-[11px] text-purple-700">{profile.targetRole}</p>
            </div>
            <span className="px-2 py-0.5 text-xs font-bold bg-white text-purple-700 rounded-full border border-purple-200">
              Active
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 mb-3">
            {onOpenAddOpportunity && (
              <button
                onClick={() => {
                  onOpenAddOpportunity();
                  setMobileMenuOpen(false);
                }}
                className="w-full py-2 px-3 text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 rounded-xl text-center shadow-xs transition-all"
              >
                + Opportunity
              </button>
            )}
            {onOpenAddEvidence && (
              <button
                onClick={() => {
                  onOpenAddEvidence();
                  setMobileMenuOpen(false);
                }}
                className="w-full py-2 px-3 text-xs font-bold text-purple-700 bg-purple-100 rounded-xl text-center"
              >
                + Evidence
              </button>
            )}
          </div>

          {[...mainNavItems, ...secondaryNavItems].map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onSelectTab(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${
                  isActive
                    ? 'text-purple-700 bg-purple-50 font-bold'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{item.label}</span>
                {item.badge && (
                  <span className="ml-auto px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-purple-200 text-purple-800">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}

          <div className="pt-3 border-t border-slate-100 grid grid-cols-3 gap-2">
            <button
              onClick={() => {
                onSelectTab('profile');
                setMobileMenuOpen(false);
              }}
              className="py-2 text-xs font-semibold text-slate-700 border border-slate-200 rounded-xl text-center"
            >
              Profile
            </button>
            <button
              onClick={() => {
                onSelectTab('settings');
                setMobileMenuOpen(false);
              }}
              className="py-2 text-xs font-semibold text-slate-700 border border-slate-200 rounded-xl text-center"
            >
              Settings
            </button>
            <button
              onClick={() => {
                onSelectTab('admin');
                setMobileMenuOpen(false);
              }}
              className="py-2 text-xs font-bold text-purple-700 bg-purple-50 border border-purple-200 rounded-xl text-center"
            >
              Admin
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};
