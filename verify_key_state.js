
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://hbqacsaxsyphanfzgnsk.supabase.co';
const supabaseKey = 'sb_publishable_CVOzbZGt_FkKfJyCO7Xf7A_S74te0Vb';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkKey() {
    console.log("🔍 Verifying Key via RPC 'get_ai_system_settings_masked'...");

    const { data, error } = await supabase.rpc('get_ai_system_settings_masked');

    if (error) {
        console.error("❌ RPC Failed:", error);
    } else {
        console.log("✅ RPC Result:", data);
        if (data && typeof data === 'string' && data.length > 10) {
            console.log("🎯 SUCCESS: RPC returned a masked key string. The key exists.");
            console.log("Value:", data);
        } else {
            console.log("⚠️ FAILURE: RPC returned null or empty string. Key NOT found.");
        }
    }
}

checkKey();
