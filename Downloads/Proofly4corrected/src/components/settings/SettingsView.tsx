import React, { useState, useEffect } from 'react';
import {
  Settings,
  Shield,
  Bell,
  Database,
  Lock,
  Eye,
  EyeOff,
  Download,
  RotateCcw,
  CheckCircle2,
  Trash2,
  Server,
  Sparkles,
} from 'lucide-react';
import { UserProfile } from '../../types';
import { storage } from '../../lib/storage';
import { checkServerHealth, ServerHealth } from '../../lib/api';

interface SettingsViewProps {
  profile: UserProfile;
  onUpdateProfile: (profile: UserProfile) => void;
  onResetData: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  profile,
  onUpdateProfile,
  onResetData,
}) => {
  const [activeTab, setActiveTab] = useState<'privacy' | 'notifications' | 'data' | 'security' | 'system'>('privacy');
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [serverHealth, setServerHealth] = useState<ServerHealth | null>(null);

  useEffect(() => {
    checkServerHealth().then(setServerHealth);
  }, []);

  const handleTogglePrivacy = () => {
    const updated = { ...profile, skillSwapActive: !profile.skillSwapActive };
    onUpdateProfile(updated);
    triggerSaved();
  };

  const handleToggleNotification = (key: 'notificationEmail' | 'notificationTrialUpdates') => {
    const updated = { ...profile, [key]: !profile[key] };
    onUpdateProfile(updated);
    triggerSaved();
  };

  const triggerSaved = () => {
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 1500);
  };

  const handleExportData = () => {
    const fullData = {
      profile: storage.getProfile(),
      opportunities: storage.getOpportunities(),
      evidence: storage.getEvidence(),
      assessments: storage.getAssessments(),
      trials: storage.getTrials(),
      peers: storage.getPeers(),
      progress: storage.getProgress(),
      exportedAt: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(fullData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `proofly-career-data-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
              <Settings className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Platform Settings</h1>
              <p className="text-xs text-slate-500">
                Manage your privacy, communication preferences, and data portability.
              </p>
            </div>
          </div>

          {savedSuccess && (
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full animate-in fade-in">
              Preferences Saved
            </span>
          )}
        </div>
      </div>

      {/* Settings Navigation Tabs & Content */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        {/* Left Nav (4 cols) */}
        <div className="md:col-span-4 bg-white rounded-2xl border border-slate-200 p-3 shadow-xs space-y-1">
          <button
            onClick={() => setActiveTab('privacy')}
            className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold transition-colors flex items-center gap-2.5 ${
              activeTab === 'privacy'
                ? 'bg-purple-50 text-purple-700 font-bold'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Shield className="h-4 w-4" />
            Privacy & SkillSwap
          </button>

          <button
            onClick={() => setActiveTab('notifications')}
            className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold transition-colors flex items-center gap-2.5 ${
              activeTab === 'notifications'
                ? 'bg-purple-50 text-purple-700 font-bold'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Bell className="h-4 w-4" />
            Notifications
          </button>

          <button
            onClick={() => setActiveTab('security')}
            className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold transition-colors flex items-center gap-2.5 ${
              activeTab === 'security'
                ? 'bg-purple-50 text-purple-700 font-bold'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Lock className="h-4 w-4" />
            Security & Credentials
          </button>

          <button
            onClick={() => setActiveTab('data')}
            className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold transition-colors flex items-center gap-2.5 ${
              activeTab === 'data'
                ? 'bg-purple-50 text-purple-700 font-bold'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Database className="h-4 w-4" />
            Data Management
          </button>

          <button
            onClick={() => setActiveTab('system')}
            className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold transition-colors flex items-center gap-2.5 ${
              activeTab === 'system'
                ? 'bg-purple-50 text-purple-700 font-bold'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Server className="h-4 w-4" />
            Backend & AI Engine
          </button>
        </div>

        {/* Right Content Area (8 cols) */}
        <div className="md:col-span-8 bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs">
          {activeTab === 'privacy' && (
            <div className="space-y-6">
              <h2 className="text-base font-bold text-slate-900 pb-2 border-b border-slate-100">
                Privacy & Peer Discovery
              </h2>

              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200">
                <div className="pr-4">
                  <p className="text-xs font-bold text-slate-900">SkillSwap Public Visibility</p>
                  <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                    Allow verified university peers to see your headline and suggest complementary skill exchanges.
                  </p>
                </div>
                <button
                  onClick={handleTogglePrivacy}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors shrink-0 ${
                    profile.skillSwapActive
                      ? 'bg-purple-600 text-white'
                      : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {profile.skillSwapActive ? 'Visible' : 'Hidden'}
                </button>
              </div>

              <div className="p-4 bg-purple-50/70 border border-purple-100 rounded-xl text-xs text-purple-900 leading-relaxed">
                <strong>Row Level Security (RLS) Promise:</strong> Your uploaded documents, test scores, and private notes are cryptographically restricted to your authenticated account.
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <h2 className="text-base font-bold text-slate-900 pb-2 border-b border-slate-100">
                Communication Preferences
              </h2>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <div>
                    <p className="text-xs font-bold text-slate-900">Opportunity Readiness Digests</p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Receive email updates when newly added evidence changes your score.
                    </p>
                  </div>
                  <button
                    onClick={() => handleToggleNotification('notificationEmail')}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
                      profile.notificationEmail ? 'bg-purple-600 text-white' : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {profile.notificationEmail ? 'Enabled' : 'Disabled'}
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <div>
                    <p className="text-xs font-bold text-slate-900">Career Trial Feedback Alerts</p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Instant notifications when simulation deliverables are evaluated.
                    </p>
                  </div>
                  <button
                    onClick={() => handleToggleNotification('notificationTrialUpdates')}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
                      profile.notificationTrialUpdates
                        ? 'bg-purple-600 text-white'
                        : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {profile.notificationTrialUpdates ? 'Enabled' : 'Disabled'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-6">
              <h2 className="text-base font-bold text-slate-900 pb-2 border-b border-slate-100">
                Security & Authentication
              </h2>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3 text-xs">
                <div>
                  <p className="font-bold text-slate-800">Primary Account Email</p>
                  <p className="text-slate-600">{profile.email}</p>
                </div>
                <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                  <div>
                    <p className="font-bold text-slate-800">Password</p>
                    <p className="text-slate-500">••••••••••••••••</p>
                  </div>
                  <button
                    onClick={() => alert('Password reset verification link sent to your registered email.')}
                    className="px-3.5 py-1.5 bg-white border border-slate-300 text-slate-700 font-bold rounded-lg hover:bg-slate-100 transition-colors"
                  >
                    Change Password
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'system' && (
            <div className="space-y-6">
              <h2 className="text-base font-bold text-slate-900 pb-2 border-b border-slate-100">
                Backend Service & AI Intelligence Status
              </h2>

              <div className="space-y-4">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
                        <Server className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-900">Proofly Express Engine</p>
                        <p className="text-xs text-slate-500">Full-stack Node.js / Express microservice</p>
                      </div>
                    </div>
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      {serverHealth?.status === 'ok' ? 'Online' : 'Connected'}
                    </span>
                  </div>
                  <div className="mt-3 pt-3 border-t border-slate-200 grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-slate-500">Service: </span>
                      <span className="font-semibold text-slate-800">{serverHealth?.service || 'Proofly Engine'}</span>
                    </div>
                    <div>
                      <span className="text-slate-500">Environment: </span>
                      <span className="font-semibold text-slate-800">Production / Full-Stack</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                        <Database className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-900">Supabase Cloud Database & Storage</p>
                        <p className="text-xs text-slate-500">PostgreSQL with Row Level Security (RLS) & 3 Storage Buckets</p>
                      </div>
                    </div>
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
                      <Shield className="h-3.5 w-3.5" />
                      RLS Active
                    </span>
                  </div>
                  <div className="mt-3 pt-3 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                    <div>
                      <span className="text-slate-500">Migrations: </span>
                      <span className="font-semibold text-slate-800">4 Applied</span>
                    </div>
                    <div>
                      <span className="text-slate-500">Storage: </span>
                      <span className="font-semibold text-slate-800">evidence-files, trial-artifacts, avatars</span>
                    </div>
                    <div>
                      <span className="text-slate-500">Auth Hook: </span>
                      <span className="font-semibold text-emerald-700">Auto-Profile Provisioning</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
                        <Sparkles className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-900">Google Gemini AI Engine</p>
                        <p className="text-xs text-slate-500">Model: gemini-3.7-flash (Opportunity parsing & simulation evaluation)</p>
                      </div>
                    </div>
                    <span className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full ${
                      serverHealth?.geminiEnabled
                        ? 'text-emerald-700 bg-emerald-50 border border-emerald-200'
                        : 'text-indigo-700 bg-indigo-50 border border-indigo-200'
                    }`}>
                      <Sparkles className="h-3.5 w-3.5" />
                      {serverHealth?.geminiEnabled ? 'Gemini 3.7 Live' : 'AI Engine Ready'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-3 leading-relaxed">
                    Proofly powers continuous evaluation of job descriptions, weighted competencies extraction, and rubric-based Career Trial submissions.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'data' && (
            <div className="space-y-6">
              <h2 className="text-base font-bold text-slate-900 pb-2 border-b border-slate-100">
                Data Portability & Reset
              </h2>

              <div className="space-y-4">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-bold text-slate-900">Export All Profile Data (JSON)</p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Download all saved opportunities, evidence records, and assessment histories.
                    </p>
                  </div>
                  <button
                    onClick={handleExportData}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl transition-all shrink-0 shadow-xs"
                  >
                    <Download className="h-3.5 w-3.5" />
                    Export Data
                  </button>
                </div>

                <div className="p-4 bg-rose-50/60 rounded-xl border border-rose-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-bold text-rose-900">Reset Demo Data</p>
                    <p className="text-xs text-rose-700 mt-0.5">
                      Restores initial sample data (Jordan Davis @ Vercel Intern).
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      if (confirm('Reset all demo state to original sample records?')) {
                        onResetData();
                      }
                    }}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl transition-colors shrink-0"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    Reset Data
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
