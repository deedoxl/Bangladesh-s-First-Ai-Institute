
import { createClient } from '@supabase/supabase-js';

// Hardcoded keys from src/lib/supabaseClient.js
const supabaseUrl = 'https://hbqacsaxsyphanfzgnsk.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhicWFjc2F4c3lwaGFuZnpnbnNrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc4NjQ1MTUsImV4cCI6MjA4MzQ0MDUxNX0.KH8RpD6CXAg7WObpqKoKJtcpwbDWJq_dZI4rH1r_-_8';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const defaultMissionContent = {
    headline: "Our Mission",
    subheadline: "Building Systems for the Future",
    body: "We believe in empowering the next generation of founders with AI-native tools and education.",
    values: [
        { id: 1, title: "Innovation", desc: "Pushing boundaries with AI." },
        { id: 2, title: "Impact", desc: "Solving real-world problems." },
        { id: 3, title: "Integrity", desc: "Building with transparency." },
        { id: 4, title: "Community", desc: "Growing together." }
    ],
    cards: [
        {
            id: 1,
            title: "Badar Munir",
            subtitle: "OUR FOUNDER",
            image: "https://placehold.co/600x800/101010/70E000/png?text=Founder",
            description: "Visionary leader driving the AI revolution."
        },
        {
            id: 2,
            title: "AI in Hands",
            subtitle: "OUR PROGRAMS",
            image: "https://placehold.co/600x800/101010/70E000/png?text=Programs",
            description: "3-month program where you master best AI tools."
        },
        {
            id: 3,
            title: "Be a Founder",
            subtitle: "Aaghaz",
            image: "https://placehold.co/600x800/101010/70E000/png?text=Founder+Mode",
            description: "Take those skills. Build companies. Create the future."
        }
    ]
};

async function seedMission() {
    console.log("🌱 Seeding Default Mission Content...");

    // We can use the admin_update_setting RPC we just created!
    // This tests the RPC *and* fixes the data.

    const { error } = await supabase.rpc('admin_update_setting', {
        p_key: 'mission_content',
        p_value: defaultMissionContent,
        p_password: 'admin' // Assuming default
    });

    if (error) {
        console.error("❌ Seed Failed:", error.message);
    } else {
        console.log("✅ Seed Success! Mission content restored.");
    }
}

seedMission();
