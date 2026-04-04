import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types
export interface DbCategory {
  id: string;
  name: string;
  slug: string;
  order: number;
  created_at: string;
  updated_at: string;
}

export interface DbTool {
  id: string;
  name: string;
  description: string;
  url: string;
  logo_url: string | null;
  category_id: string;
  order: number;
  has_deal: boolean;
  deal_count: number | null;
  created_at: string;
  updated_at: string;
}

export interface DbToolWithCategory extends DbTool {
  categories: DbCategory;
}
