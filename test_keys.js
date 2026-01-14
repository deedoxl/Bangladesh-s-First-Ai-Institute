
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://hbqacsaxsyphanfzgnsk.supabase.co';
const currentKey = 'sb_publishable_CVOzbZGt_FkKfJyCO7Xf7A_S74te0Vb';

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

    // 2. Test Function (Edge)
    console.log("\n--- Testing Edge Function Access ---");
    const { data: funcData, error: funcError } = await supabase.functions.invoke('chat-proxy', {
        body: { modelId: 'test', messages: [] }
    });

    if (funcError) {
        console.error("❌ Function Failed:", funcError);
    } else {
        console.log("✅ Function Success!");
    }
}

testKeys();
