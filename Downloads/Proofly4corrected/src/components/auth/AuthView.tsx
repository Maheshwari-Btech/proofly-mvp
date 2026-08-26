import React, { useState } from 'react';
import { Eye, EyeOff, LockKeyhole, Mail, UserRound, ArrowRight, Target } from 'lucide-react';
import { getSupabaseClient, isSupabaseConfigured } from '../../lib/supabaseClient';

export type AuthMode = 'login' | 'register';

export const AuthView: React.FC<{ initialMode?: AuthMode }> = ({ initialMode = 'login' }) => {
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [name, setName] = useState(''); const [email, setEmail] = useState(''); const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false); const [busy, setBusy] = useState(false); const [error, setError] = useState(''); const [message, setMessage] = useState('');
  const submit = async (event: React.FormEvent) => {
    event.preventDefault(); setError(''); setMessage('');
    const client = getSupabaseClient();
    if (!client || !isSupabaseConfigured()) { setError('Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to .env.local.'); return; }
    if (password.length < 6) { setError('Password must contain at least 6 characters.'); return; }
    setBusy(true);
    try {
      if (mode === 'register') {
        const { data, error } = await client.auth.signUp({
          email: email.trim(),
          password,
          options: {
            data: { full_name: name.trim() || email.split('@')[0] },
            emailRedirectTo: `${window.location.origin}/`,
          },
        });
        if (error) throw error;
        if (data.session) setMessage('Account created. Opening your Proofly dashboard…');
        else { setMessage('Account created. Check your email to confirm your account, then log in.'); setMode('login'); setPassword(''); }
      } else {
        const { error } = await client.auth.signInWithPassword({ email: email.trim(), password });
        if (error) throw error;
      }
    } catch (err: any) { setError(err?.message || 'Authentication failed. Please try again.'); }
    finally { setBusy(false); }
  };
  return <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-slate-50 flex items-center justify-center p-4">
    <div className="w-full max-w-5xl grid lg:grid-cols-2 bg-white rounded-3xl border border-purple-100 shadow-2xl overflow-hidden">
      <div className="hidden lg:flex bg-purple-700 text-white p-10 flex-col justify-between"><div><div className="flex items-center gap-3 mb-12"><div className="h-11 w-11 rounded-2xl bg-white/15 flex items-center justify-center"><Target className="h-6 w-6" /></div><div><div className="text-2xl font-bold">Proofly</div><div className="text-purple-200 text-xs font-semibold tracking-wider uppercase">Career Readiness</div></div></div><h1 className="text-4xl font-bold leading-tight">Don't just claim you're ready. Prove it.</h1><p className="mt-5 text-purple-100 text-lg leading-8">Connect your opportunities, evidence and goals. Proofly shows what you already prove, what is missing, and what to do next.</p></div><div className="text-sm text-purple-200">Your private career data is tied to your authenticated account.</div></div>
      <div className="p-6 sm:p-10"><div className="lg:hidden flex items-center gap-3 mb-8"><div className="h-10 w-10 rounded-xl bg-purple-700 text-white flex items-center justify-center"><Target className="h-5 w-5" /></div><div className="text-2xl font-bold text-purple-700">Proofly</div></div>
        <div className="mb-8"><h2 className="text-3xl font-bold text-slate-900">{mode === 'login' ? 'Welcome back' : 'Create your account'}</h2><p className="mt-2 text-slate-500">{mode === 'login' ? 'Sign in to continue your career readiness journey.' : 'Start building evidence for the opportunities you want.'}</p></div>
        <form onSubmit={submit} className="space-y-5">
          {mode === 'register' && <label className="block"><span className="text-sm font-semibold text-slate-700">Full name</span><div className="mt-2 relative"><UserRound className="absolute left-3 top-3.5 h-5 w-5 text-slate-400" /><input required value={name} onChange={e=>setName(e.target.value)} className="w-full rounded-xl border border-slate-200 py-3 pl-11 pr-4 outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-100" placeholder="Your name" /></div></label>}
          <label className="block"><span className="text-sm font-semibold text-slate-700">Email</span><div className="mt-2 relative"><Mail className="absolute left-3 top-3.5 h-5 w-5 text-slate-400" /><input required type="email" value={email} onChange={e=>setEmail(e.target.value)} className="w-full rounded-xl border border-slate-200 py-3 pl-11 pr-4 outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-100" placeholder="you@example.com" /></div></label>
          <label className="block"><span className="text-sm font-semibold text-slate-700">Password</span><div className="mt-2 relative"><LockKeyhole className="absolute left-3 top-3.5 h-5 w-5 text-slate-400" /><input required minLength={6} type={showPassword?'text':'password'} value={password} onChange={e=>setPassword(e.target.value)} className="w-full rounded-xl border border-slate-200 py-3 pl-11 pr-12 outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-100" placeholder="At least 6 characters" /><button type="button" onClick={()=>setShowPassword(!showPassword)} className="absolute right-3 top-3 text-slate-400">{showPassword?<EyeOff className="h-5 w-5"/>:<Eye className="h-5 w-5"/>}</button></div></label>
          {error && <div className="rounded-xl bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-sm">{error}</div>}{message && <div className="rounded-xl bg-green-50 border border-green-200 text-green-700 px-4 py-3 text-sm">{message}</div>}
          <button disabled={busy} className="w-full rounded-xl bg-purple-700 hover:bg-purple-800 disabled:opacity-60 text-white py-3.5 font-bold flex items-center justify-center gap-2 shadow-lg shadow-purple-200">{busy?'Please wait…':mode==='login'?'Sign in to Proofly':'Create Proofly account'}{!busy&&<ArrowRight className="h-5 w-5"/>}</button>
        </form>
        <div className="mt-7 text-center text-sm text-slate-500">{mode==='login'?"Don't have an account?":"Already have an account?"}{' '}<button onClick={()=>{setMode(mode==='login'?'register':'login');setError('');setMessage('')}} className="font-bold text-purple-700">{mode==='login'?'Create one':'Sign in'}</button></div>
      </div>
    </div>
  </div>;
};
