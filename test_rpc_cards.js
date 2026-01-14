import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function testRpcWithCards() {
    console.log("Testing 'admin_update_setting' RPC with CARDS...");

    const payload = {
        headline: "RPC Cards Test " + Date.now(),
        subheadline: "Testing Nested Arrays",
        body: "Checking if cards array persists.",
        cards: [
            { id: 1, title: "RPC Card 1", subtitle: "TEST" },
            { id: 2, title: "RPC Card 2", subtitle: "TEST" }
        ],
        values: [
            { id: 1, title: "RPC Value 1", desc: "Test" }
        ]
    };

    const { data, error } = await supabase.rpc('admin_update_setting', {
        p_key: 'mission_content',
        p_value: payload,
        p_password: 'admin'
    });

    if (error) {
        console.error("RPC Error:", error);
    } else {
        console.log("RPC Success:", data);

        // Immediately verify reading back
        const { data: readBack } = await supabase.from('site_settings').select('value').eq('key', 'mission_content').single();
        console.log("Read Back:", JSON.stringify(readBack.value, null, 2));
    }
}

testRpcWithCards();
