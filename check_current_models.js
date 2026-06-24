import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing Supabase URL or Key in .env");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkModels() {
    console.log("Fetching AI Models...");
    const { data, error } = await supabase
        .from('ai_models')
        .select('*')
        .or('display_name.ilike.%DEEDOX%,display_name.ilike.%Llama%,display_name.ilike.%Mistral%');

    if (error) {
        console.error("Error fetching models:", error);
    } else {
        console.log("Relevant Models:");
        data.forEach(m => console.log(`- "${m.display_name}"`));
    }
}

checkModels();
