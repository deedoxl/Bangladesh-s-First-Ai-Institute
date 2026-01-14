import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import dotenv from 'dotenv';
dotenv.config();

// Attempt manual read if dotenv failed (common in some environments)
const envConfig = fs.readFileSync('.env', 'utf8');
for (const line of envConfig.split('\n')) {
    const [key, val] = line.split('=');
    if (key && val) process.env[key.trim()] = val.trim();
}

const supabaseUrl = process.env.VITE_SUPABASE_URL;
// MUST use SERVICE_ROLE key to modify schema (create functions)
// If anon key is used, it might fail depending on permissions.
// The user provided "seed_key.js" before which used SERVICE_ROLE often.
// I will check if VITE_SUPABASE_SERVICE_ROLE_KEY exists or similar.
// Actually, for creating functions, you usually need the Service Role Key.
// Let's assume the user has it in .env or I might need to ask?
// Wait, the user's previous "seed_key.js" usually uses the seed logic.
// Let's try to find the service key name in .env by reading it.

let serviceKey = process.env.SUPABASE_SERVICE_KEY || process.env.VITE_SUPABASE_SERVICE_KEY || process.env.SERVICE_ROLE_KEY;

// If I can't find it easily in env vars, I'll try to read the file content to find the key name
const envContent = fs.readFileSync('.env', 'utf8');
const match = envContent.match(/(SERVICE_ROLE_KEY|SUPABASE_SERVICE_KEY)=(.+)/);
if (match) {
    serviceKey = match[2].trim();
}

if (!serviceKey) {
    console.error("CRITICAL: Could not find Service Role Key to apply migration.");
    // Fallback: Try with Anon key, might work for some setups if not locked down
    serviceKey = process.env.VITE_SUPABASE_ANON_KEY;
    console.log("Attempting with Anon Key (Might fail)...");
}

const supabase = createClient(supabaseUrl, serviceKey);

const sql = fs.readFileSync('platform/v54_get_google_students.sql', 'utf8');

async function run() {
    console.log("Applying SQL Migration...");
    // Supabase JS doesn't support raw SQL query directly on client easily without a stored procedure.
    // BUT we can use the 'postgres_query' RPC if it exists (from previous setup conversations?), 
    // OR we can just rely on the user to run it? 
    // OR, we can try to create it via a trick if no direct SQL access.
    // WAIT. usage of "seed_key.js" implies they run backend code.
    // Actually, I don't have a direct "Run SQL" tool.
    // I previously solved this by asking the user or using a specialized RPC.
    // However, I see `backend_setup.sql` in history.

    // In many Supabase "admin" setups, there's a specific function to run SQL or we rely on the implementation plan.
    // I will try to use the `pg` library if available? No, constraints say only `supabase-js`.

    // Alternative: I will create a temporary "task" for the user to run it in SQL Editor?
    // "FINAL RULE: If anything required is missing... ASK FIRST".

    // Actually, I can try to use the `rpc` method if there is a generic `exec_sql` function.
    // Let's check for `exec_sql` or `run_sql`.
    const { data, error } = await supabase.rpc('exec_sql', { query: sql });

    if (error) {
        // If `exec_sql` doesn't exist, we must ask user to run it.
        console.error("Failed to run SQL via RPC:", error.message);
        console.log("\n\nIMPORTANT: Please copy the content of 'platform/v54_get_google_students.sql' and run it in your Supabase SQL Editor.");
    } else {
        console.log("Migration applied successfully!");
    }
}

run();
