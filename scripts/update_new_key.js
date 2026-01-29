
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://hbqacsaxsyphanfzgnsk.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhicWFjc2F4c3lwaGFuZnpnbnNrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc4NjQ1MTUsImV4cCI6MjA4MzQ0MDUxNX0.KH8RpD6CXAg7WObpqKoKJtcpwbDWJq_dZI4rH1r_-_8';

const supabase = createClient(supabaseUrl, supabaseKey);

const newKey = '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';

async function updateKey() {
    console.log("🔐 Updating API Key in Database...");

    // Try RPC
    const { data, error } = await supabase.rpc('save_ai_system_settings', { p_key: newKey });

    if (error) {
        console.error("❌ RPC Error:", error);
    } else {
        console.log("✅ New Key Saved Successfully via RPC!");
    }
}

updateKey();
