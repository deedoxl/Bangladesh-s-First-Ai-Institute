
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://hbqacsaxsyphanfzgnsk.supabase.co';
// Using the VITE_SUPABASE_ANON_KEY from .env
const currentKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhicWFjc2F4c3lwaGFuZnpnbnNrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc4NjQ1MTUsImV4cCI6MjA4MzQ0MDUxNX0.KH8RpD6CXAg7WObpqKoKJtcpwbDWJq_dZI4rH1r_-_8';

const supabase = createClient(supabaseUrl, currentKey);

async function testKeys() {
    console.log("Testing Key:", currentKey);

    // 1. Test Info (DB)
    console.log("\n--- Testing Database Access ---");
    const { data: dbData, error: dbError } = await supabase.from('site_settings').select('count');
    if (dbError) {
        console.error("❌ DB Failed:", dbError.message);
    } else {
        console.log("✅ DB Success! (Key is valid for PostgREST)");
    }


    // 2. Test RPC Key Retrieval
    console.log("\n--- Testing RPC Key Retrieval ---");
    const { data: keyData, error: keyError } = await supabase.rpc('get_decrypted_system_key');

    if (keyError) {
        console.error("❌ RPC Failed:", keyError);
    } else if (!keyData) {
        console.error("❌ RPC Returned NULL (Key missing in DB)");
    } else {
        console.log("✅ RPC Success! Key found:", keyData.slice(0, 10) + "...");
    }

    // 3. Test Function (Edge)
    // console.log("\n--- Testing Edge Function Access (chat-proxy) ---");
    // const { data: funcData, error: funcError } = await supabase.functions.invoke('chat-proxy', {
    //     body: { modelId: 'test', messages: [] }
    // });


}

testKeys();
