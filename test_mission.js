import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing ENV variables");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testFetch() {
    console.log("Testing fetch from site_settings (key='mission_content')...");
    const { data, error } = await supabase
        .from('site_settings')
        .select('*')
        .eq('key', 'mission_content');

    if (error) {
        console.error("Error fetching:", error);
    } else {
        console.log("Success! Count:", data.length);
        if (data.length > 0) {
            console.log("Mission Value:", JSON.stringify(data[0].value, null, 2));
        } else {
            console.log("No data found for mission_content");
        }
    }
}

testFetch();
