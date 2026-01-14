
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';

// Load env
const envConfig = dotenv.parse(fs.readFileSync('.env'));
const supabaseUrl = envConfig.VITE_SUPABASE_URL;
const supabaseKey = envConfig.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function inspectModels() {
    console.log("🔍 Inspecting 'ai_models' table...");
    const { data, error } = await supabase.from('ai_models').select('*').limit(1);

    if (error) {
        console.error("❌ Error fetching models:", error);
    } else {
        if (data && data.length > 0) {
            console.log("✅ Model found. Keys:", Object.keys(data[0]));
            console.log("Sample Data:", data[0]);
        } else {
            console.log("⚠️ Table is empty or not accessible via Anon key (check RLS).");
        }
    }

    console.log("\n🔍 Inspecting 'posts' table (Student Dashboard)...");
    const { data: posts, error: postError } = await supabase.from('posts').select('*').limit(1);
    if (postError) console.error("❌ Error fetching posts:", postError);
    else console.log("✅ Posts table accessible. Found:", posts.length, "rows.");
}

inspectModels();
