
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://hbqacsaxsyphanfzgnsk.supabase.co';
// Using Anon Key is allowed because we granted EXECUTE to anon for save_ai_system_settings in v51
const supabaseAnonKey = 'sb_publishable_CVOzbZGt_FkKfJyCO7Xf7A_S74te0Vb';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const TARGET_KEY = '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';

async function seedKey() {
    console.log("Seeding API Key...");

    const { error } = await supabase.rpc('save_ai_system_settings', { p_key: TARGET_KEY });

    if (error) {
        console.error("Error saving key:", error);
    } else {
        console.log("✅ Success! API Key saved to database.");

        // Verify
        const { data: masked } = await supabase.rpc('get_ai_system_settings_masked');
        console.log("Verification (Masked):", masked);
    }
}

seedKey();
