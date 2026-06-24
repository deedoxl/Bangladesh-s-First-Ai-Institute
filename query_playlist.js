import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://hbqacsaxsyphanfzgnsk.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkPlaylists() {
    const { data: courses, error } = await supabase.from('courses').select('id, title, playlist');
    if (error) {
        console.error("Query Error:", error);
        return;
    }
    console.log("All courses playlist data:");
    courses.forEach(c => {
        console.log(`- Course: ${c.title} (ID: ${c.id})`);
        console.log(`  Playlist type: ${typeof c.playlist} / IsArray: ${Array.isArray(c.playlist)}`);
        console.log(`  Playlist content:`, JSON.stringify(c.playlist, null, 2));
    });
}

checkPlaylists();
