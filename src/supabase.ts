import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://tsgginvjfmfbepdamjpv.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRzZ2dpbnZqZm1mYmVwZGFtanB2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA1MzYzOTMsImV4cCI6MjA3NjExMjM5M30.BdE3_cecm_t7-Bt_oOgOlk4OaD91e2oueIINpfZ58SQ';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
