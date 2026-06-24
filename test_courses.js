import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://hbqacsaxsyphanfzgnsk.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
    console.log("1. Fetching a course...");
    const { data: courses, error: fetchErr } = await supabase.from('courses').select('*').limit(1);
    if (fetchErr) {
        console.error("Fetch Error:", fetchErr);
    } else {
        console.log("Current course schema columns:", courses && courses[0] ? Object.keys(courses[0]) : "No courses found");
    }

    console.log("\n2. Checking if exec_sql RPC is available for schema alterations...");
    // Let's test a simple SQL query (e.g. SELECT 1)
    const { data: rpcVal, error: rpcErr } = await supabase.rpc('exec_sql', { query: 'SELECT 1 as val;' });
    if (rpcErr) {
        console.error("exec_sql RPC Error:", rpcErr);
    } else {
        console.log("exec_sql RPC Success, result:", rpcVal);
    }
}

test();
