
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://hbqacsaxsyphanfzgnsk.supabase.co'; // Hardcoded for debugging
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhicWFjc2F4c3lwaGFuZnpnbnNrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc4NjQ1MTUsImV4cCI6MjA4MzQ0MDUxNX0.KH8RpD6CXAg7WObpqKoKJtcpwbDWJq_dZI4rH1r_-_8'; // Hardcoded for debugging

let supabaseInstance = null;

if (supabaseUrl && supabaseAnonKey) {
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey)
    console.log("🔌 Supabase Client Initialized via Hardcoded Creds");
} else {
    console.error('Missing Supabase credentials. Application may not function correctly.')
}

export const supabase = supabaseInstance;
