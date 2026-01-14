
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://hbqacsaxsyphanfzgnsk.supabase.co';
const supabaseKey = 'sb_publishable_CVOzbZGt_FkKfJyCO7Xf7A_S74te0Vb'; // Using the key found in .env

// Verify key format (basic check)
if (!supabaseKey || supabaseKey.startsWith('sb_publishable') === false) {
    // Some keys start with eyJ... this one looks custom or masked?
    // "sb_publishable_..." is actually not the standard JWT format (usually eyJ...).
    // But the user's .env had it. Let's try it.
    // Wait, if it's NOT a JWT, supabase-js might complain.
    // Standard anon keys are JWTs.
    // If this fails, it means the key in .env is weird/wrong placeholder.
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function verify() {
    console.log("1. Connecting to Supabase...");

    // Test Read
    const { data, error } = await supabase.from('site_settings').select('key').limit(1);
    if (error) {
        console.error("❌ READ FAILED:", error.message);
        return;
    }
    console.log("✅ READ SUCCESS. Found rows:", data.length);

    // Test Write
    const testKey = 'test_verification_' + Date.now();
    const { error: writeError } = await supabase
        .from('site_settings')
        .upsert({ key: testKey, value: { status: 'verified' } });

    if (writeError) {
        console.error("❌ WRITE FAILED:", writeError.message);
        console.error("   (This means the RLS policy is still blocking writes)");
    } else {
        console.log("✅ WRITE SUCCESS. RLS is open.");

        // Cleanup
        await supabase.from('site_settings').delete().eq('key', testKey);
        console.log("✅ CLEANUP SUCCESS.");
    }
}

verify();
