import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';

// Manually load env since dotenv.config() might need path if running from weird context, 
// but usually it works. Let's try manual parsing if needed.
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY');
    // Try reading .env file directly if process.env is empty
    try {
        const envFile = fs.readFileSync('./.env', 'utf8');
        console.log("Read .env file manually.");
        for (const line of envFile.split('\n')) {
            const [key, val] = line.split('=');
            if (key && val) process.env[key.trim()] = val.trim();
        }
    } catch (e) {
        console.error("Could not read .env");
    }
}

// Retry with manual load
const url = process.env.VITE_SUPABASE_URL;
const key = process.env.VITE_SUPABASE_ANON_KEY;

if (!url || !key) {
    console.error("STILL MISSING ENV VARS. url:", url, "key:", !!key);
    process.exit(1);
}

const supabase = createClient(url, key);

async function checkUsers() {
    console.log('Attempting to fetch auth.users...');
    try {
        // Attempt 1: Direct Select (Will likely fail)
        // Note: 'auth.users' is not exposed via REST API directly usually.
        // Supabase client usually only sees 'public' schema.
        const { data, error } = await supabase.from('users').select('*').limit(5); // This queries public.users usually
        if (error) console.log('public.users select failed:', error.message);
        else console.log('public.users select success:', data?.length);

        // Try rpc
        const { data: rpcData, error: rpcError } = await supabase.rpc('get_students_list');
        if (rpcError) {
            console.log('RPC get_students_list failed/not found:', rpcError.message);
        } else {
            console.log('RPC get_students_list SUCCEEDED. Data:', rpcData);
        }

    } catch (err) {
        console.error('Unexpected error:', err);
    }
}

checkUsers();
