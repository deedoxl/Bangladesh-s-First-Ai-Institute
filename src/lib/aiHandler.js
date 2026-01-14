/**
 * AI Request Handler (Secure & Persistent)
 * 
 * Fetches API keys securely from the database just-in-time via RPC.
 * Reduces exposure of keys in frontend state.
 */

import { supabase } from './supabaseClient';

// MASTER AI HANDLER (V17 - Server-Side Only)
// Proxies all requests to Supabase Edge Function 'chat-proxy'
// NEVER touches API tokens on client side.

export const chatWithAI = async ({ modelId, messages }) => {
    try {
        // Direct FETCH to bypass supabase-js session handling (resolves 401 for Local Admin)
        const FUNCTION_URL = 'https://hbqacsaxsyphanfzgnsk.supabase.co/functions/v1/chat-proxy';
        const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhicWFjc2F4c3lwaGFuZnpnbnNrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc4NjQ1MTUsImV4cCI6MjA4MzQ0MDUxNX0.KH8RpD6CXAg7WObpqKoKJtcpwbDWJq_dZI4rH1r_-_8';

        const response = await fetch(FUNCTION_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${ANON_KEY}`,
                // 'apikey' is sometimes required by Kong Gateway as well
                'apikey': ANON_KEY
            },
            body: JSON.stringify({ modelId, messages })
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error("AI Fetch Error:", response.status, errorText);

            if (response.status === 401) return { error: true, content: "Access Denied: You may need to refresh the page." };
            if (response.status === 500) return { error: true, content: "AI Server Error: Please try again later." };

            return { error: true, content: `Error ${response.status}: ${errorText}` };
        }

        const data = await response.json();

        // Handle structured error from the Function itself
        if (data?.error) {
            return { error: true, content: `AI Error: ${data.error}` };
        }

        // Success
        return {
            error: false,
            content: data.choices?.[0]?.message?.content || data.message?.content || "No content returned.",
            model: modelId
        };

    } catch (err) {
        console.error("AI Handler Exception:", err);
        return { error: true, content: "Connection Error: " + err.message };
    }
};
