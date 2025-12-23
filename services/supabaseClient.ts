
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7';

// Using the provided project ID to construct the full Supabase URL
const projectID = 'boifvymsujklpuznyypc';
const supabaseUrl = process.env.SUPABASE_URL || `https://${projectID}.supabase.co`;

/**
 * FIXED: Using the Anon Public Key you provided.
 * This key is safe for browser use and satisfies Supabase's security requirements.
 */
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJvaWZ2eW1zdWprbHB1em55eXBjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU0NzcwMTMsImV4cCI6MjA4MTA1MzAxM30.Jq1uTmrCGxBZWniUvZ_wJKDZttcAtnGICec_IjxsdRI';

/**
 * Initialize Supabase client.
 * The application implements a Hybrid Synchronization Pattern:
 * 1. HOT CACHE: IndexedDB for lightning-fast offline access.
 * 2. COLD STORAGE: Supabase for global community synchronization.
 */
export const supabase = (supabaseUrl && supabaseAnonKey && supabaseAnonKey.startsWith('eyJ')) 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

/**
 * Checks if the remote sync is available.
 */
export const isRemoteActive = (): boolean => {
    return !!supabase && typeof navigator !== 'undefined' && navigator.onLine;
};
