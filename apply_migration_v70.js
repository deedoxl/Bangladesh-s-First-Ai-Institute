
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

// Attempt manual read if dotenv failed
const envConfig = fs.readFileSync('.env', 'utf8');
for (const line of envConfig.split('\n')) {
    const [key, val] = line.split('=');
    if (key && val) process.env[key.trim()] = val.trim();
}

const supabaseUrl = process.env.VITE_SUPABASE_URL;

// Try to find Service Key
let serviceKey = process.env.SUPABASE_SERVICE_KEY || process.env.VITE_SUPABASE_SERVICE_KEY || process.env.SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!serviceKey) {
    const envContent = fs.readFileSync('.env', 'utf8');
    const match = envContent.match(/(SERVICE_ROLE_KEY|SUPABASE_SERVICE_KEY|SUPABASE_SERVICE_ROLE_KEY)=(.+)/);
    if (match) {
        serviceKey = match[2].trim();
    }
}

if (!serviceKey) {
    console.warn("⚠️  Could not find Service Role Key. Migration might fail regarding policies/RLS if not admin.");
    serviceKey = process.env.VITE_SUPABASE_ANON_KEY;
}

const supabase = createClient(supabaseUrl, serviceKey);

async function run() {
    const sqlPath = path.join(process.cwd(), 'platform', 'v70_testimonials_table.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    console.log("Applying v70 migration (Testimonials)...");

    // Try RPC 'exec_sql'
    const { error } = await supabase.rpc('exec_sql', { query: sql });

    if (error) {
        console.error("❌ RPC 'exec_sql' failed:", error.message);
        console.log("⚠️  Please run 'platform/v70_testimonials_table.sql' manually in your Supabase SQL Editor.");
    } else {
        console.log("✅ Migration applied successfully!");
    }
}

run();
