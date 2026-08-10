/**
 * AI Request Handler (Secure, Persistent & High Availability)
 * 
 * Proxies requests to Supabase Edge Function 'chat-proxy', and seamlessly
 * falls back to OpenRouter API directly using "openrouter/free" model string.
 * API key is retrieved dynamically from Supabase database via RPC to avoid hardcoded secrets.
 */

import { supabase } from './supabaseClient.js';

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";

export const chatWithAI = async ({ modelId, messages }) => {
    try {
        const FUNCTION_URL = 'https://hbqacsaxsyphanfzgnsk.supabase.co/functions/v1/chat-proxy';
        const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhicWFjc2F4c3lwaGFuZnpnbnNrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc4NjQ1MTUsImV4cCI6MjA4MzQ0MDUxNX0.KH8RpD6CXAg7WObpqKoKJtcpwbDWJq_dZI4rH1r_-_8';

        let data = null;
        let functionSuccess = false;

        try {
            const response = await fetch(FUNCTION_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${ANON_KEY}`,
                    'apikey': ANON_KEY
                },
                body: JSON.stringify({ modelId, messages })
            });

            if (response.ok) {
                const json = await response.json();
                if (json && !json.error && (json.choices || json.message)) {
                    data = json;
                    functionSuccess = true;
                }
            }
        } catch (e) {
            console.warn("Edge Function proxy failed, falling back to direct OpenRouter:", e);
        }

        // Direct OpenRouter Fallback if Edge Function fails or returns error
        if (!functionSuccess) {
            console.log("⚡ Direct OpenRouter API Request (openrouter/free)...");

            // Fetch key dynamically from Database RPC
            let apiKey = null;
            try {
                const { data: dbKey } = await supabase.rpc('get_decrypted_system_key');
                if (dbKey) apiKey = dbKey;
            } catch (kErr) {
                console.warn("Could not fetch key via RPC:", kErr);
            }

            if (!apiKey) {
                throw new Error("Could not retrieve AI API Key from Database.");
            }

            const directResponse = await fetch(OPENROUTER_URL, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json',
                    'HTTP-Referer': 'https://deedox.ai',
                    'X-Title': 'DEEDOX AI'
                },
                body: JSON.stringify({
                    model: 'openrouter/free',
                    messages: messages
                })
            });

            if (!directResponse.ok) {
                const errText = await directResponse.text();
                throw new Error(`OpenRouter Error ${directResponse.status}: ${errText}`);
            }

            data = await directResponse.json();
        }

        const content = data?.choices?.[0]?.message?.content || data?.message?.content || "No response generated.";

        return {
            error: false,
            content: content,
            model: modelId
        };

    } catch (err) {
        console.error("AI Handler Exception:", err);
        return { error: true, content: "AI Service Error: " + (err.message || "Failed to process request.") };
    }
};
