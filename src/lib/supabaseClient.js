

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

let supabaseInstance = null;

if (supabaseUrl && supabaseAnonKey) {
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey)
    console.log("🔌 Supabase Client Initialized");
} else {
    console.error('Missing Supabase credentials. Application may not function correctly.')
}

export const supabase = supabaseInstance;

