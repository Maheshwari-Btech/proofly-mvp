import { getSupabaseClient, isSupabaseConfigured } from './supabaseClient';
import { User, Session, AuthChangeEvent } from '@supabase/supabase-js';

export const supabaseAuth = {
  isConfigured(): boolean {
    return isSupabaseConfigured();
  },

  async getSession(): Promise<Session | null> {
    const client = getSupabaseClient();
    if (!client) return null;
    try {
      const { data: { session } } = await client.auth.getSession();
      return session;
    } catch {
      return null;
    }
  },

  async getUser(): Promise<User | null> {
    const client = getSupabaseClient();
    if (!client) return null;
    try {
      const { data: { user } } = await client.auth.getUser();
      return user;
    } catch {
      return null;
    }
  },

  async resetPasswordForEmail(email: string, redirectTo?: string): Promise<{ success: boolean; error?: string }> {
    const client = getSupabaseClient();
    if (!client) return { success: false, error: 'Supabase is not configured.' };
    try {
      const { error } = await client.auth.resetPasswordForEmail(email, {
        redirectTo: redirectTo || `${window.location.origin}/`,
      });
      if (error) return { success: false, error: error.message };
      return { success: true };
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Password reset failed.' };
    }
  },

  async signOut(): Promise<void> {
    const client = getSupabaseClient();
    if (!client) return;
    try {
      await client.auth.signOut();
    } catch (err) {
      console.warn('Sign out error:', err);
    }
  },

  onAuthStateChange(
    callback: (event: AuthChangeEvent, session: Session | null) => void
  ): { data: { subscription: { unsubscribe: () => void } } } {
    const client = getSupabaseClient();
    if (!client) {
      return {
        data: {
          subscription: {
            unsubscribe: () => {},
          },
        },
      };
    }
    return client.auth.onAuthStateChange(callback);
  },
};
