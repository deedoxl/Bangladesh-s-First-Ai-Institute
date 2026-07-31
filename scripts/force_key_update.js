
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

// Use the URL and Anon Key from the project
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://hbqacsaxsyphanfzgnsk.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhicWFjc2F4c3lwaGFuZnpnbnNrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc4NjQ1MTUsImV4cCI6MjA4MzQ0MDUxNX0.KH8RpD6CXAg7WObpqKoKJtcpwbDWJq_dZI4rH1r_-_8';

const supabase = createClient(supabaseUrl, supabaseKey);

const newKey = process.env.OPENROUTER_API_KEY || 'YOUR_OPENROUTER_API_KEY';

async function updateKey() {
    console.log("🔐 Updating API Key in Database...");

    // 1. Try public RPC if available (Guest Mode / Admin Mock)
    const { data, error } = await supabase.rpc('save_ai_system_settings', { p_key: newKey });

    if (error) {
        console.error("❌ RPC Error:", error);

        // Fallback: Try direct update if RLS allows (unlikely but worth a try)
        console.log("⚠️ Trying direct table update (fallback)...");
        const { error: dbError } = await supabase
            .from('ai_system_settings')
            .update({ encrypted_key: newKey, key_last_4: newKey.slice(-4) })
            .eq('id', 1); // Assuming singleton row

        if (dbError) {
            console.error("❌ Direct Update Error:", dbError);
        } else {
            console.log("✅ Direct Update Success (Rows affected unknown due to RLS)");
        }
    } else {
        console.log("✅ Key Saved Successfully via RPC!");
    }
}

updateKey();
