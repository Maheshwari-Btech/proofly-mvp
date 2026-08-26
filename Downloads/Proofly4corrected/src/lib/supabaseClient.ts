import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Database } from '../types/database.types';

// Safely obtain environment variables across browser & Node environments
const supabaseUrl: string | undefined =
  (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_SUPABASE_URL) ||
  (typeof process !== 'undefined' && process.env && process.env.VITE_SUPABASE_URL) ||
  undefined;

const supabaseAnonKey: string | undefined =
  (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_SUPABASE_ANON_KEY) ||
  (typeof process !== 'undefined' && process.env && process.env.VITE_SUPABASE_ANON_KEY) ||
  undefined;

let clientInstance: SupabaseClient<Database> | null = null;

export function isSupabaseConfigured(): boolean {
  return Boolean(supabaseUrl && supabaseAnonKey && supabaseUrl.startsWith('http'));
}

export function getSupabaseClient(): SupabaseClient<Database> | null {
  if (!isSupabaseConfigured() || !supabaseUrl || !supabaseAnonKey) {
    return null;
  }

  if (!clientInstance) {
    clientInstance = createClient<Database>(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    });
  }

  return clientInstance;
}

export const supabase = getSupabaseClient();
