
import { createClient } from '@supabase/supabase-js';

// Hardcoded keys from src/lib/supabaseClient.js
const supabaseUrl = 'https://hbqacsaxsyphanfzgnsk.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhicWFjc2F4c3lwaGFuZnpnbnNrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc4NjQ1MTUsImV4cCI6MjA4MzQ0MDUxNX0.KH8RpD6CXAg7WObpqKoKJtcpwbDWJq_dZI4rH1r_-_8';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function cleanGarbageNews() {
    console.log("🧹 Cleaning up garbage news items...");

    // 1. Find the garbage items first (safety check)
    const { data: garbage, error: findError } = await supabase
        .from('news')
        .select('id, title')
        .eq('title', 'Success. No rows returned');

    if (findError) {
        console.error("❌ Error finding items:", findError.message);
        return;
    }

    if (!garbage || garbage.length === 0) {
        console.log("✅ No garbage items found. The news section is already clean!");
        return;
    }

    console.log(`🗑️ Found ${garbage.length} items to delete.`);

    // 2. Delete them
    const { error: deleteError } = await supabase
        .from('news')
        .delete()
        .eq('title', 'Success. No rows returned');

    if (deleteError) {
        console.error("❌ Delete Failed:", deleteError.message);
    } else {
        console.log("✅ Cleanup Success! Garbage items deleted.");
    }
}

cleanGarbageNews();
