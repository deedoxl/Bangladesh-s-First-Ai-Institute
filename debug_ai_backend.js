
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

const logStream = fs.createWriteStream('debug_output.txt');
function log(msg) {
    const str = (typeof msg === 'object') ? JSON.stringify(msg, null, 2) : msg;
    console.log(str);
    logStream.write(str + '\n');
}

if (!supabaseUrl || !supabaseKey) {
    log("Missing ENV variables VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function debugBackend() {
    log("=== DEBUGGIN AI BACKEND ===");

    // 1. Get a valid model
    const { data: models, error: modelError } = await supabase
        .from('ai_models')
        .select('*')
        .eq('enabled', true)
        .limit(1);

    if (!models || models.length === 0) {
        log("❌ No enabled models found. Cannot test chat-proxy.");
        return;
    }
    const testModel = models[0].id;
    log(`Using Model: ${testModel}`);

    // 2. Direct Fetch to Function
    const functionUrl = `${supabaseUrl}/functions/v1/chat-proxy`;
    log(`Fetching: ${functionUrl}`);

    try {
        const response = await fetch(functionUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${supabaseKey}`
            },
            body: JSON.stringify({
                modelId: testModel,
                messages: [{ role: 'user', content: 'Debug Test' }]
            })
        });

        log(`Response Status: ${response.status} ${response.statusText}`);
        const text = await response.text();
        log("Response Body (Raw):");
        log(text);

        try {
            const json = JSON.parse(text);
            log("Parsed JSON:");
            log(json);
        } catch (e) {
            log("(Not valid JSON)");
        }

    } catch (e) {
        log("❌ Fetch failed: " + e.message);
    }
}

debugBackend();
