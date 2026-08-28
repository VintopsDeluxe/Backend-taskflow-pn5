import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables in .env!');
}

// 1. Client for standard user-authenticated requests (respects RLS)
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// 2. Admin client bypassing RLS (for system tasks/maintenance)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey || supabaseAnonKey);

// 3. Dynamic client factory that forwards the logged-in user's Bearer token to enforce RLS
export const getSupabaseClient = (req) => {
  const authHeader = req?.headers?.authorization;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

  return createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    },
  });
};