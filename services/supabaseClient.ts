
import { createClient } from '@supabase/supabase-js';

const projectID = 'boifvymsujklpuznyypc';
const supabaseUrl = process.env.SUPABASE_URL || `https://${projectID}.supabase.co`;

const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJvaWZ2eW1zdWprbHB1em55eXBjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU0NzcwMTMsImV4cCI6MjA4MTA1MzAxM30.Jq1uTmrCGxBZWniUvZ_wJKDZttcAtnGICec_IjxsdRI';

export const supabase = (supabaseUrl && supabaseAnonKey && supabaseAnonKey.startsWith('eyJ')) 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

export const isRemoteActive = (): boolean => {
    return !!supabase && typeof navigator !== 'undefined' && navigator.onLine;
};
