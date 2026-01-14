
import { createClient } from '@supabase/supabase-js';

// Hardcoded keys from src/lib/supabaseClient.js
const supabaseUrl = 'https://hbqacsaxsyphanfzgnsk.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhicWFjc2F4c3lwaGFuZnpnbnNrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc4NjQ1MTUsImV4cCI6MjA4MzQ0MDUxNX0.KH8RpD6CXAg7WObpqKoKJtcpwbDWJq_dZI4rH1r_-_8';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testMission() {
    console.log("🔍 Checking 'site_settings' (Public Read Access)...");

    const { data, error } = await supabase
        .from('site_settings')
        .select('*')
        .eq('key', 'mission_content');

    if (error) {
        console.error("❌ READ FAIL:", error.message);
    } else if (!data || data.length === 0) {
        console.error("❌ READ FAIL: No data found (RLS likely blocking row, or row doesn't exist).");
    } else {
        console.log("✅ READ SUCCESS: Found Mission Content.");
        console.log(JSON.stringify(data[0].value, null, 2));
    }
}

testMission();
