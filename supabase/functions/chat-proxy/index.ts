/// <reference path="../deno.d.ts" />
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};


Deno.serve(async (req: Request) => {
    // 0. Handle CORS preflight request
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        const { modelId, messages } = await req.json();

        // DIAGNOSTICS: Check Env Vars (Masked)
        const sbUrl = Deno.env.get('SUPABASE_URL');
        const sbKey = Deno.env.get('SUPABASE_ANON_KEY');
        const envKey = Deno.env.get('OPENROUTER_API_KEY');

        console.log("Startup Diagnostics:", {
            hasUrl: !!sbUrl,
            hasAnonKey: !!sbKey,
            hasEnvKey: !!envKey
        });

        // 1. Init Supabase Client
        const supabaseAdmin = createClient(
            sbUrl ?? '',
            sbKey ?? ''
        );

        // 2. Validate User (Optional for Local/Guest Mode)
        const authHeader = req.headers.get('Authorization');
        const token = authHeader?.replace('Bearer ', '');
        let user = null;

        if (token) {
            const { data, error: authError } = await supabaseAdmin.auth.getUser(token);
            if (authError) console.warn("Auth Warning:", authError.message);
            user = data.user;
        }

        console.log(`Request from user: ${user?.id || 'Anonymous/Guest'}, Model: ${modelId}`);

        // 3. Validate Model (Must be in our DB and Enabled)
        const { data: modelData, error: modelError } = await supabaseAdmin
            .from('ai_models')
            .select('enabled')
            .eq('id', modelId)
            .single();

        if (modelError || !modelData || !modelData.enabled) {
            console.error(`Unauthorized model request: ${modelId}`);
            throw new Error(`Model '${modelId}' is not authorized or is currently disabled by admin.`);
        }

        // 4. Fetch Global OpenRouter API Key
        let apiKey = envKey;

        // Priority 2: Database RPC
        if (!apiKey) {
            console.log("Env var OPENROUTER_API_KEY not found, trying Database RPC...");
            const { data: dbKey, error: keyError } = await supabaseAdmin.rpc('get_decrypted_system_key');

            if (!keyError && dbKey) {
                apiKey = dbKey;
            } else {
                console.warn("RPC Key Fetch Failed or Empty:", keyError);
            }
        }

        // Final Check
        if (!apiKey) {
            throw new Error("Critical: No AI API Key found in Environment or Database.");
        }

        // 5. Call AI Provider (OpenRouter)
        console.log("Calling OpenRouter...");
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${apiKey}`,
                "Content-Type": "application/json",
                "HTTP-Referer": "https://deedox.ai",
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
            throw new Error(`AI Provider Error (${response.status}): ${errText}`);
        }

        const data = await response.json();

        return new Response(JSON.stringify(data), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
        });

    } catch (error: any) {
        console.error("AI Proxy MAIN CATCH:", error);

        // Return Detailed JSON Error for Debugging
        return new Response(JSON.stringify({
            error: error.message || 'Unknown Internal Error',
            details: error.stack || null,
            diagnostics: {
                hasUrl: !!Deno.env.get('SUPABASE_URL'),
                hasAnonKey: !!Deno.env.get('SUPABASE_ANON_KEY'),
                hasOpenRouterEnv: !!Deno.env.get('OPENROUTER_API_KEY')
            }
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400, // Return 400 to show body to client
        });
    }
});
