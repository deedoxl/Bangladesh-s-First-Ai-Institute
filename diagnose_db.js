import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { writeFileSync } from 'fs';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

console.log("URL:", supabaseUrl ? supabaseUrl.substring(0, 20) + "..." : "MISSING");

const supabase = createClient(supabaseUrl, supabaseKey);

// ...
async function diagnose() {
    // ...
    if (error) {
        console.error("Error:", error);
    } else {
        console.log(`Found ${data.length} rows.`);
        fs.writeFileSync('db_dump.json', JSON.stringify(data, null, 2));
        console.log("Dumped to db_dump.json");
    }
}

diagnose();
