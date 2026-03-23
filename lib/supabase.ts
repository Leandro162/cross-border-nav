import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase credentials not found. Using local storage fallback.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// 检查是否配置了 Supabase
export const isSupabaseConfigured = () => {
  return !!(supabaseUrl && supabaseAnonKey);
};
