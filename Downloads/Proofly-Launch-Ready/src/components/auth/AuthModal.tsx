import React, { useEffect, useState } from 'react';
import {
  X,
  Mail,
  Lock,
  User,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Briefcase,
  Layers,
  KeyRound,
  ExternalLink,
} from 'lucide-react';
import { getSupabaseClient, isSupabaseConfigured } from '../../lib/supabaseClient';
import { supabaseAuth } from '../../lib/supabaseAuth';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'register';
  onAuthSuccess: (user: { id: string; email: string; fullName: string }) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'login',
  onAuthSuccess,
}) => {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [targetRole, setTargetRole] = useState('Software Engineering Intern');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [emailConfirmationRequired, setEmailConfirmationRequired] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setErrorMessage(null);
      setSuccessMessage(null);
      setEmailConfirmationRequired(false);
    }
  }, [isOpen, initialMode]);

  if (!isOpen) return null;

  const isConfigured = isSupabaseConfigured();
  const supabase = getSupabaseClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setEmailConfirmationRequired(false);

    if (!email || !password) {
      setErrorMessage('Please fill in both email and password.');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);

    try {
      if (supabase && isConfigured) {
        if (mode === 'register') {
          // Real Supabase User Registration
          const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
              data: {
                full_name: fullName || 'Curious Mind',
                target_role: targetRole,
              },
            },
          });

          if (error) {
            throw error;
          }

          if (data.user) {
            // Check if user requires email confirmation
            if (data.session) {
              // Direct login successful
              onAuthSuccess({
                id: data.user.id,
                email: data.user.email || email,
                fullName: fullName || data.user.user_metadata?.full_name || 'Curious Mind',
              });
              onClose();
            } else {
              // Email confirmation required by Supabase settings
              setEmailConfirmationRequired(true);
              setSuccessMessage(
                'Registration successful! Please check your email to confirm your account, or sign in if confirmation is auto-approved.'
              );
            }
          }
        } else {
          // Real Supabase User Sign In
          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
          });

          if (error) {
            throw error;
          }

          if (data.user) {
            onAuthSuccess({
              id: data.user.id,
              email: data.user.email || email,
              fullName: data.user.user_metadata?.full_name || fullName || 'Curious Mind',
            });
            onClose();
          }
        }
      } else {
        // Fallback Local Auth Session (when Supabase credentials are pending in .env)
        const mockUserId = `usr_${email.replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now().toString().slice(-4)}`;
        const userDisplayName = fullName || email.split('@')[0] || 'Curious Mind';

        onAuthSuccess({
          id: mockUserId,
          email,
          fullName: userDisplayName,
        });
        onClose();
      }
    } catch (err: any) {
      console.error('Auth error:', err);
      setErrorMessage(err.message || 'Authentication failed. Please verify your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLocalLogin = (demoRole: string) => {
    const timestamp = Date.now().toString().slice(-4);
    const mockId = `usr_${demoRole.toLowerCase().replace(/\s+/g, '_')}_${timestamp}`;
    onAuthSuccess({
      id: mockId,
      email: `${demoRole.toLowerCase().replace(/\s+/g, '.')}@proofly.app`,
      fullName: 'Curious Mind',
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-200 relative animate-in fade-in zoom-in-95 duration-150 max-h-[92vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 p-1.5 rounded-xl hover:bg-slate-100 transition-colors"
          aria-label="Close dialog"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Brand Header */}
        <div className="text-center space-y-2 mb-6">
          <div className="h-12 w-12 rounded-2xl bg-purple-700 text-white flex items-center justify-center mx-auto shadow-md">
            <Sparkles className="h-6 w-6" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            {mode === 'login' ? 'Sign in to Proofly' : 'Create your Proofly Account'}
          </h2>
          <p className="text-xs text-slate-500 max-w-xs mx-auto">
            {mode === 'login'
              ? 'Access your opportunities, evidence library, and Career Trials.'
              : 'Start your evidence-based journey towards career readiness.'}
          </p>
        </div>

        {/* Supabase Status Banner */}
        <div className="mb-5 p-3 rounded-2xl bg-purple-50/70 border border-purple-100 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-purple-900 font-medium">
            <ShieldCheck className="h-4 w-4 text-purple-600 shrink-0" />
            <span>
              {isConfigured ? 'Connected to Supabase Auth' : 'Supabase is not configured'}
            </span>
          </div>
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
              isConfigured
                ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                : 'bg-amber-100 text-amber-800 border border-amber-200'
            }`}
          >
            {isConfigured ? 'Live Backend' : 'Demo Mode'}
          </span>
        </div>

        {/* Tab Switcher */}
        <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-100 rounded-2xl mb-5">
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setErrorMessage(null);
              setSuccessMessage(null);
            }}
            className={`py-2 text-xs font-bold rounded-xl transition-all ${
              mode === 'login'
                ? 'bg-white text-purple-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('register');
              setErrorMessage(null);
              setSuccessMessage(null);
            }}
            className={`py-2 text-xs font-bold rounded-xl transition-all ${
              mode === 'register'
                ? 'bg-white text-purple-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Feedback Alerts */}
        {errorMessage && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2 animate-in fade-in">
            <AlertCircle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
            <div className="flex-1 font-medium">{errorMessage}</div>
          </div>
        )}

        {successMessage && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-start gap-2 animate-in fade-in">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
            <div className="flex-1 font-medium">{successMessage}</div>
          </div>
        )}

        {emailConfirmationRequired ? (
          <div className="text-center py-4 space-y-4">
            <div className="h-12 w-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
              <Mail className="h-6 w-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Check your inbox</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              We sent a confirmation link to <strong className="text-slate-900">{email}</strong>. Once confirmed, you can sign in directly.
            </p>
            <button
              onClick={() => {
                setMode('login');
                setEmailConfirmationRequired(false);
              }}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-2.5 rounded-xl text-xs transition-all shadow-xs"
            >
              Proceed to Sign In
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Alex Taylor"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-600 text-slate-900"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="email"
                  required
                  placeholder="name@university.edu or your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-600 text-slate-900"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="password"
                  required
                  placeholder="At least 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-600 text-slate-900"
                />
              </div>
              {mode === 'login' && (
                <button
                  type="button"
                  onClick={async () => {
                    setErrorMessage(null);
                    setSuccessMessage(null);
                    if (!email) {
                      setErrorMessage('Enter your email address first.');
                      return;
                    }
                    const result = await supabaseAuth.resetPasswordForEmail(email);
                    if (result.success) {
                      setSuccessMessage('Password reset link sent. Check your inbox.');
                    } else {
                      setErrorMessage(result.error || 'Unable to send password reset email.');
                    }
                  }}
                  className="mt-2 text-[11px] font-semibold text-purple-700 hover:text-purple-900"
                >
                  Forgot password?
                </button>
              )}
            </div>

            {mode === 'register' && (
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Target Role / Career Goal
                </label>
                <div className="relative">
                  <Briefcase className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="e.g. Frontend Engineer, Full-Stack Intern"
                    value={targetRole}
                    onChange={(e) => setTargetRole(e.target.value)}
                    className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-600 text-slate-900"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-60 text-white font-bold py-3 px-4 rounded-xl text-sm transition-all shadow-md flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <span>Authenticating with Supabase...</span>
              ) : (
                <>
                  <span>{mode === 'login' ? 'Sign In' : 'Create Proofly Account'}</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>
        )}

        {/* Footer Privacy Note */}
        <div className="mt-6 pt-4 border-t border-slate-100 text-center">
          <p className="text-[11px] text-slate-400 flex items-center justify-center gap-1">
            <Lock className="h-3 w-3" />
            Protected by Supabase Auth with Row Level Security.
          </p>
        </div>
      </div>
    </div>
  );
};
