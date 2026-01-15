
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * STRICT Backend-Only AI Handler
 * - NO API Keys on Client
 * - NO Direct fetch to OpenRouter
 * - ONLY calls Supabase Edge Function
 */
export const sendAIMessage = async ({ modelId, messages }) => {

    console.log("🔒 Calling Secure AI Backend...");

    const { data, error } = await supabase.functions.invoke('chat-proxy', {
        body: { modelId, messages }
    });

    if (error) {
        console.error("❌ AI Backend Error:", error);

        let errorMsg = "Service Unavailable.";
        try {
            // Try to parse detailed error from function if available
            if (error && typeof error === 'object') {
                // Supabase functions error structure varies
                errorMsg = error.message || JSON.stringify(error);
            }
        } catch (e) { }

        throw new Error(`AI Backend Failed: ${errorMsg}`);
    }

    if (!data) {
        throw new Error("Empty response from AI Backend.");
    }

    return data;
};
