
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://hbqacsaxsyphanfzgnsk.supabase.co';
const supabaseKey = 'sb_publishable_CVOzbZGt_FkKfJyCO7Xf7A_S74te0Vb';

console.log("Checking Key Format:", supabaseKey.substring(0, 15) + "...");

const supabase = createClient(supabaseUrl, supabaseKey);

async function verify() {
    console.log("🔍 Checking Database Connection & Tables...");

    const tables = [
        'site_settings', 'courses', 'news', 'featured_students', 'resources', 'sliders',
        'ai_tools', 'hero_layers', 'image_effects', 'hero_config'
    ];
    let allGood = true;

    for (const table of tables) {
        // Try to read 1 row, allowing empty results, just to check table existence
        const { error } = await supabase.from(table).select('*', { count: 'exact', head: true }); // Head request is lighter

        if (error) {
            // Postgres error 42P01 means "relation does not exist" (Table missing)
            if (error.code === '42P01' || error.message.includes('relation') || error.message.includes('does not exist')) {
                console.error(`❌ TABLE MISSING: [${table}]`);
                allGood = false;
            } else {
                console.error(`⚠️ Error accessing [${table}]:`, error.message);
            }
        } else {
            console.log(`✅ Table Found: [${table}]`);
        }
    }

    if (!allGood) {
        console.error("\nCRITICAL: Some tables are missing in Supabase!");
        console.error("Please run the 'platform/create_missing_tables.sql' script in your Supabase SQL Editor.");
    } else {
        console.log("\n✅ ALL TABLES EXIST. Admin Panel should work correctly.");
    }
}

verify();
