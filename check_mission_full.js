import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

import fs from 'fs';
// ...
async function checkMission() {
    console.log("Fetching mission_content...");
    const { data, error } = await supabase
        .from('site_settings')
        .select('value')
        .eq('key', 'mission_content')
        .single();

    if (error) {
        console.error("Error:", error);
    } else {
        console.log("Found data. Writing to mission_full.json...");
        fs.writeFileSync('mission_full.json', JSON.stringify(data.value, null, 2));
        console.log("Done.");
    }
}

checkMission();
