
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://hbqacsaxsyphanfzgnsk.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhicWFjc2F4c3lwaGFuZnpnbnNrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc4NjQ1MTUsImV4cCI6MjA4MzQ0MDUxNX0.KH8RpD6CXAg7WObpqKoKJtcpwbDWJq_dZI4rH1r_-_8';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function listTitles() {
    const { data, error } = await supabase
        .from('news')
        .select('title, is_published, image_url')
        .order('created_at', { ascending: false })
        .limit(5);

    if (error) {
        console.error("Error:", error);
    } else {
        console.log("--- LATEST 5 NEWS ITEMS ---");
        data.forEach((n, i) => {
            console.log(`${i + 1}. ${n.title} (Published: ${n.is_published}) [Image: ${n.image_url ? 'YES' : 'NO'}]`);
        });
        console.log("---------------------------");
    }
}

listTitles();
