
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
// Need service key to delete arbitrary data if RLS blocks, but usually Anon key works if policies allow.
// Using Service Key is safer for cleanup.
let serviceKey = process.env.SUPABASE_SERVICE_KEY || process.env.VITE_SUPABASE_SERVICE_KEY || process.env.SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!serviceKey) {
    const envContent = fs.readFileSync('.env', 'utf8');
    const match = envContent.match(/(SERVICE_ROLE_KEY|SUPABASE_SERVICE_KEY|SUPABASE_SERVICE_ROLE_KEY)=(.+)/);
    if (match) serviceKey = match[2].trim();
}
// Fallback to anon key (might fail if RLS is strict, but let's try)
if (!serviceKey) serviceKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, serviceKey);

async function cleanup() {
    console.log("🧹 Cleaning up bad data ('Success. No rows returned')...");

    // 1. Clean Testimonials
    const { error: err1, count: count1 } = await supabase
        .from('testimonials')
        .delete({ count: 'exact' })
        .or('name.eq.Success. No rows returned,quote.eq.Success. No rows returned');

    if (err1) console.error("Error cleaning testimonials:", err1.message);
    else console.log(`✅ Removed ${count1 ?? 'some'} bad rows from Testimonials.`);

    // 2. Clean News
    const { error: err2, count: count2 } = await supabase
        .from('news')
        .delete({ count: 'exact' })
        .or('title.eq.Success. No rows returned,content.eq.Success. No rows returned');

    if (err2) console.error("Error cleaning news:", err2.message);
    else console.log(`✅ Removed ${count2 ?? 'some'} bad rows from News.`);
}

cleanup();
