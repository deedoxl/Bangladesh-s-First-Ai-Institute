import { createClient } from '@supabase/supabase-js';

const supabaseUrl = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_SUPABASE_URL) 
  ? import.meta.env.VITE_SUPABASE_URL 
  : 'https://hbqacsaxsyphanfzgnsk.supabase.co';

const supabaseAnonKey = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_SUPABASE_ANON_KEY) 
  ? import.meta.env.VITE_SUPABASE_ANON_KEY 
  : 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhicWFjc2F4c3lwaGFuZnpnbnNrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc4NjQ1MTUsImV4cCI6MjA4MzQ0MDUxNX0.KH8RpD6CXAg7WObpqKoKJtcpwbDWJq_dZI4rH1r_-_8';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";

/**
 * AI Service Handler
 * - Tries Supabase Edge Function first
 * - Gracefully falls back to OpenRouter free model router directly using dynamic DB key
 */
export const sendAIMessage = async ({ modelId, messages }) => {
    console.log("🔒 Calling AI Backend...");

    try {
        const { data, error } = await supabase.functions.invoke('chat-proxy', {
            body: { modelId, messages }
        });

        if (!error && data && !data.error) {
            return data;
        }
    } catch (e) {
        console.warn("Edge function invocation failed, trying direct OpenRouter request:", e);
    }

    console.log("⚡ Executing Direct OpenRouter Request (openrouter/free)...");

    let apiKey = null;
    try {
        const { data: dbKey } = await supabase.rpc('get_decrypted_system_key');
        if (dbKey) apiKey = dbKey;
    } catch (kErr) {
        console.warn("Could not fetch key via RPC:", kErr);
    }

    if (!apiKey) {
        throw new Error("AI API Key not available.");
    }

    const response = await fetch(OPENROUTER_URL, {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${apiKey}`,
            "Content-Type": "application/json",
            "HTTP-Referer": "https://deedox.ai",
            "X-Title": "DEEDOX AI"
        },
        body: JSON.stringify({
            model: "openrouter/free",
            messages: messages,
        })
    });

    if (!response.ok) {
        const errText = await response.text();
        throw new Error(`OpenRouter Error ${response.status}: ${errText}`);
    }

    return await response.json();
};
