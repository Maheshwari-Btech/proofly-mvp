import React, { useState } from 'react';
import { Mail, Send, CheckCircle2, MessageSquare, Sparkles } from 'lucide-react';
import { ContactMessage } from '../../types';
import { storage } from '../../lib/storage';

export const ContactView: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !message) return;

    setIsSubmitting(true);
    setTimeout(() => {
      const newMsg: ContactMessage = {
        id: `msg_${Date.now()}`,
        name,
        email,
        subject: subject || 'General Inquiry',
        message,
        createdAt: new Date().toISOString(),
      };
      storage.saveContactMessage(newMsg);
      setIsSubmitting(false);
      setIsSuccess(true);
      setName('');
      setEmail('');
      setSubject('');
      setMessage('');
    }, 600);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs">
        <div className="flex items-center gap-3 mb-2">
          <div className="h-10 w-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
            <Mail className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Contact Proofly Support</h1>
            <p className="text-xs text-slate-500">
              Have feedback, partner inquiries, or need assistance? Drop our team a message.
            </p>
          </div>
        </div>

        {isSuccess ? (
          <div className="mt-6 p-6 bg-emerald-50 rounded-2xl border border-emerald-200 text-center space-y-3">
            <CheckCircle2 className="h-10 w-10 text-emerald-600 mx-auto" />
            <h3 className="text-base font-bold text-slate-900">Message Received!</h3>
            <p className="text-xs text-slate-600 max-w-sm mx-auto">
              Thank you for reaching out. Our student success team will reply directly to your email within 24 hours.
            </p>
            <button
              onClick={() => setIsSuccess(false)}
              className="mt-2 text-xs font-bold text-emerald-800 underline"
            >
              Send another message
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 mt-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Your Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Jordan Davis"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  placeholder="jordan.davis@stanford.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Subject
              </label>
              <input
                type="text"
                placeholder="e.g. Career Trial feature request or college partnership"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Message & Feedback *
              </label>
              <textarea
                rows={5}
                required
                placeholder="How can we help your career readiness journey?"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full p-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-600"
              />
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[11px] text-slate-400">Response time: ~24h</span>
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs px-6 py-2.5 rounded-xl transition-all flex items-center gap-2 shadow-xs"
              >
                {isSubmitting ? (
                  <>
                    <span className="h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="h-3.5 w-3.5" />
                    Send Message
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
