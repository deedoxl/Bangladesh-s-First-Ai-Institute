import { createClient } from '@supabase/supabase-js';

// Hardcoded for testing - REPLACE WITH ENV VARS IN PROD
const supabaseUrl = 'https://hbqacsaxsyphanfzgnsk.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhicWFjc2F4c3lwaGFuZnpnbnNrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc4NjQ1MTUsImV4cCI6MjA4MzQ0MDUxNX0.KH8RpD6CXAg7WObpqKoKJtcpwbDWJq_dZI4rH1r_-_8';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testDashboardHero() {
    console.log("Testing Dashboard Hero...");

    // 1. Insert Slide
    const newSlide = {
        title: "Test Slide " + Date.now(),
        description: "This is a test slide created via node script.",
        image_url: "https://via.placeholder.com/800x400",
        cta_text: "Test CTA",
        cta_link: "/test",
        is_active: true,
        display_order: 99
    };

    console.log("Insert Slide:", newSlide.title);
    const { data: insertData, error: insertError } = await supabase
        .from('dashboard_hero_slides')
        .insert([newSlide])
        .select()
        .single();

    if (insertError) {
        console.error("INSERT FAILED:", insertError);
        return;
    }
    console.log("✅ Insert Success:", insertData.id);

    // 2. Fetch Slides
    const { data: fetchData, error: fetchError } = await supabase
        .from('dashboard_hero_slides')
        .select('*')
        .order('display_order', { ascending: true });

    if (fetchError) {
        console.error("FETCH FAILED:", fetchError);
        return;
    }
    console.log("✅ Fetch Success: Found", fetchData.length, "slides");
    console.log(fetchData.map(s => ` - ${s.title} (Order: ${s.display_order})`).join('\n'));

    // 3. Cleanup (Delete the test slide)
    const { error: deleteError } = await supabase
        .from('dashboard_hero_slides')
        .delete()
        .eq('id', insertData.id);

    if (deleteError) {
        console.error("DELETE FAILED:", deleteError);
    } else {
        console.log("✅ Cleanup Success: Deleted test slide");
    }
}

testDashboardHero();
