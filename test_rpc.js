import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // Optional check

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing ENV variables");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testRpcSave() {
    console.log("Testing 'admin_update_setting' RPC...");

    const payload = {
        headline: "Updated via Script " + Date.now(),
        subheadline: "Testing Connection",
        body: "This is a test from the backend script."
    };

    const { data, error } = await supabase.rpc('admin_update_setting', {
        p_key: 'mission_content',
        p_value: payload,
        p_password: 'admin' // Default password
    });

    if (error) {
        console.error("❌ RPC Failed:", error);
    } else {
        console.log("✅ RPC Success!", data);

        // Verify read
        const { data: readData } = await supabase.from('site_settings').select('value').eq('key', 'mission_content');
        console.log("Read Back Data:", JSON.stringify(readData, null, 2));
    }
}

testRpcSave();
