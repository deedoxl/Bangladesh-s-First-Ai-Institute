
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://hbqacsaxsyphanfzgnsk.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhicWFjc2F4c3lwaGFuZnpnbnNrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc4NjQ1MTUsImV4cCI6MjA4MzQ0MDUxNX0.KH8RpD6CXAg7WObpqKoKJtcpwbDWJq_dZI4rH1r_-_8';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testInsert() {
    console.log("Attempting to insert news with image...");

    const doc = {
        title: "Backend Image Test 2",
        description: "Testing image persistence",
        content: "<p>Content</p>",
        image_url: "https://placehold.co/600x400/png",
        is_published: true
    };

    const { data, error } = await supabase.from('news').insert([doc]).select();

    if (error) {
        console.error("Insert Failed!", error);
    } else {
        console.log("Insert Success!", data);
    }
}

testInsert();
