
import { createClient } from '@supabase/supabase-js';

// Hardcoded keys from src/lib/supabaseClient.js
const supabaseUrl = 'https://hbqacsaxsyphanfzgnsk.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhicWFjc2F4c3lwaGFuZnpnbnNrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc4NjQ1MTUsImV4cCI6MjA4MzQ0MDUxNX0.KH8RpD6CXAg7WObpqKoKJtcpwbDWJq_dZI4rH1r_-_8';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testNews() {
    console.log("1. Testing Connection...");

    // 1. Try to fetch existing news
    const { data: fetchResult, error: fetchError } = await supabase
        .from('news')
        .select('*');

    if (fetchError) {
        console.error("❌ Fetch Error:", fetchError);
    } else {
        console.log(`✅ Fetch Success. Found ${fetchResult.length} articles.`);
        console.log(fetchResult);
    }

    // 2. Try to insert a test article
    console.log("\n2. Testing Insert (as Anon)...");
    const testArticle = {
        title: "Backend Test Article " + Date.now(),
        description: "Testing RLS from Node script",
        content: "This proves whether the DB allows anon inserts.",
        is_published: true
    };

    const { data: insertResult, error: insertError } = await supabase
        .from('news')
        .insert([testArticle])
        .select();

    if (insertError) {
        console.error("❌ Insert Error:", insertError);
    } else {
        console.log("✅ Insert Success:", insertResult);
    }
}

testNews();
