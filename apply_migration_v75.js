import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

const envConfig = fs.readFileSync('.env', 'utf8');
for (const line of envConfig.split('\n')) {
    const [key, val] = line.split('=');
    if (key && val) process.env[key.trim()] = val.trim();
}

const supabaseUrl = process.env.VITE_SUPABASE_URL;
let serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_SERVICE_KEY || process.env.SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;

if (!serviceKey) {
    const envContent = fs.readFileSync('.env', 'utf8');
    const match = envContent.match(/(SERVICE_ROLE_KEY|SUPABASE_SERVICE_KEY|SUPABASE_SERVICE_ROLE_KEY)=(.+)/);
    if (match) {
        serviceKey = match[2].trim();
    }
}

async function run() {
    const sqlPath = path.join(process.cwd(), 'platform', 'v75_add_course_playlist.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    console.log("------------------------------------------------------------------");
    console.log("👉 IMPORTANT: DATABASE SCHEMA ALTERATION REQUIRED");
    console.log("Please run the following SQL command in your Supabase SQL Editor:");
    console.log("\n" + sql.trim() + "\n");
    console.log("------------------------------------------------------------------");

    if (serviceKey && supabaseUrl) {
        console.log("Attempting to run migration automatically via Supabase Client...");
        const supabase = createClient(supabaseUrl, serviceKey);
        const { error } = await supabase.rpc('exec_sql', { query: sql });
        if (error) {
            console.log("❌ Auto-migration failed (exec_sql not found/allowed). That's expected! Please apply it manually in the editor.");
        } else {
            console.log("✅ Auto-migration succeeded!");
        }
    }
}

run();
