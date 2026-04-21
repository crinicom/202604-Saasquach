import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Diagnostic logging
if (typeof window !== 'undefined') {
  console.log('[SUPABASE_DIAGNOSTIC] URL segment:', supabaseUrl ? supabaseUrl.substring(0, 15) + '...' : 'MISSING');
  console.log('[SUPABASE_DIAGNOSTIC] Key segment:', supabaseAnonKey ? supabaseAnonKey.substring(0, 10) + '...' : 'MISSING');
}

const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseUrl !== 'https://placeholder.supabase.co' &&
  supabaseUrl.startsWith('https://') &&
  supabaseAnonKey && 
  supabaseAnonKey !== 'placeholder-key'
);

if (!isSupabaseConfigured && typeof window !== 'undefined') {
  console.error('❌ CRITICAL: Supabase environment variables are missing or invalid! Check your .env file.', {
    urlLength: supabaseUrl?.length || 0,
    keyLength: supabaseAnonKey?.length || 0
  });
}

// Safely export the client
export const supabase = isSupabaseConfigured 
  ? createClient(supabaseUrl!, supabaseAnonKey!) 
  : null;
