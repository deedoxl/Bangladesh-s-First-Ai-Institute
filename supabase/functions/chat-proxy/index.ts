/// <reference path="../deno.d.ts" />
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req: Request) => {
    // Handle CORS preflight request
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        const { modelId, messages } = await req.json();

        // 1. Init Supabase Client (Using Anon Key is sufficient as we granted RPC access)
        const supabaseAdmin = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_ANON_KEY') ?? ''
        );

        // 2. Validate User (Optional for Local/Guest Mode)
        const authHeader = req.headers.get('Authorization');
        const token = authHeader?.replace('Bearer ', '');
        let user = null;

        if (token) {
            const { data } = await supabaseAdmin.auth.getUser(token);
            user = data.user;
        }

        // Strict Check Removed for Local Admin Support
        // if (!user) throw new Error('Unauthorized'); 
        console.log(`Request from user: ${user?.id || 'Anonymous/Guest'}`);

        // 2. Validate Model (Must be in our DB and Enabled)
        // This prevents users from injecting arbitrary model IDs
        const { data: modelData, error: modelError } = await supabaseAdmin
            .from('ai_models')
            .select('enabled')
            .eq('id', modelId)
            .single();

        if (modelError || !modelData || !modelData.enabled) {
            console.error(`Unauthorized model request: ${modelId}`);
            throw new Error(`Model '${modelId}' is not authorized or is currently disabled by admin.`);
        }

        // 3. Fetch Global OpenRouter API Key (Secure RPC)
        const { data: apiKey, error: keyError } = await supabaseAdmin.rpc('get_decrypted_system_key');

        if (keyError || !apiKey) {
            console.error("Critical: Failed to retrieve API Key via RPC.", keyError);
            throw new Error("System Configuration Error: AI API Key not configured or accessible.");
        }

        // 4. Call AI Provider (OpenRouter)
        // Server-Side Call -> Key never exposed to client
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${apiKey}`,
                "Content-Type": "application/json",
                "HTTP-Referer": "https://deedox.ai", // Production URL
                "X-Title": "DEEDOX AI"
            },
            body: JSON.stringify({
                model: modelId,
                messages: messages,
            })
        });

        if (!response.ok) {
            const errText = await response.text();
            console.error(`OpenRouter Error (${response.status}):`, errText);
            // Fallback strategy: If 401/403, key is bad. If 404, model bad.
            // But for now, just relay the error safely.
            throw new Error(`AI Provider Error: ${response.statusText}`);
        }

        const data = await response.json();

        return new Response(JSON.stringify(data), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
        });

    } catch (error: any) {
        console.error("AI Proxy Main Error:", error);
        return new Response(JSON.stringify({ error: error.message || 'Internal Server Error' }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
        });
    }
});
