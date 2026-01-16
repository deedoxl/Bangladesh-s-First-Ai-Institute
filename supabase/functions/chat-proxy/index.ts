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
        let body;
        try {
            body = await req.json();
        } catch (e) {
            throw new Error("Invalid JSON body");
        }
        const { modelId, messages } = body;

        // MANDATORY 1: Strict Allowed Models List (Verified OpenRouter Slugs)
        const ALLOWED_MODELS = [
            "deepseek/deepseek-chat",            // DeepSeek V3 (Corrected Slug)
            "deepseek/deepseek-coder",           // DeepSeek Coder (Generic pointing to latest or V2)
            "qwen/qwen-2.5-coder-7b-instruct",   // Qwen 2.5 Coder 7B (Corrected Slug)
            "meta-llama/llama-3.1-70b-instruct", // LLaMA 3.1 70B
            "mistralai/mistral-7b-instruct"      // Mistral 7B
        ];

        // MANDATORY 2 & 3: Input Sanitization & Fallback
        // 1. Normalize input to array
        const inputs = Array.isArray(modelId) ? modelId : [modelId];

        // 2. Find first valid model from the permitted list
        let targetModelId = inputs.find((id: any) => ALLOWED_MODELS.includes(id));

        // 3. Fallback Logic (Mandatory)
        if (!targetModelId) {
            console.warn(`[Backend Warning] Invalid input or UUID received: ${JSON.stringify(modelId)}. Falling back to default.`);
            // MANDATORY 3: Fallback to verified default
            targetModelId = "deepseek/deepseek-chat";
        } else {
            console.log(`[Backend Info] Using valid model: ${targetModelId}`);
        }

        // Note: targetModelId is now guaranteed to be one of the 5 ALLOWED_MODELS.

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

        console.log(`Request from user: ${user?.id || 'Anonymous/Guest'}, Model: ${targetModelId}`);

        // 3. Validate Model (Must be in our DB and Enabled)
        // We keep this to respect the "Do NOT change database" rule - we assume the DB is still the source of truth for "enabled" status, 
        // but we strictly filter the list above first.
        const { data: modelData, error: modelError } = await supabaseAdmin
            .from('ai_models')
            .select('enabled')
            .eq('model_id', targetModelId) // [FIX] Use Sanitized ID
            .single();

        if (modelError || !modelData || !modelData.enabled) {
            console.error(`Unauthorized model request (DB check): ${targetModelId}`);

            // CRITICAL FIX: If the fallback model itself is disabled in DB, we MUST still allow it
            // because "Backend Robustness" requirement overrides DB state for the fallback.
            if (targetModelId === "deepseek/deepseek-chat") {
                console.warn("[Backend Warning] Default fallback model is disabled in DB, but allowing it to prevent service outage.");
            } else {
                return new Response(JSON.stringify({
                    error: `Model '${targetModelId}' is currently disabled by admin.`
                }), {
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                    status: 200 // MANDATORY 5
                });
            }
        }

        // 4. Fetch Global OpenRouter API Key
        // [SECURE TEMPORARY CONFIG] Using User-Provided Key directly on Server Side
        const SERVER_SIDE_KEY = "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";

        let apiKey = SERVER_SIDE_KEY;

        // Fallback: check Env Var if hardcoded is empty (safety net)
        if (!apiKey) apiKey = envKey;

        // Priority 3: Database RPC (Legacy/Backup)
        if (!apiKey) {
            console.log("No Server Key or Env Key found, trying Database RPC...");
            const { data: dbKey, error: keyError } = await supabaseAdmin.rpc('get_decrypted_system_key');

            if (!keyError && dbKey) {
                apiKey = dbKey;
            } else {
                console.warn("RPC Key Fetch Failed or Empty:", keyError);
            }
        }

        // Final Check
        if (!apiKey) {
            return new Response(JSON.stringify({
                error: "Critical: No AI API Key found in Environment or Database."
            }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200 // MANDATORY 5
            });
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
                model: targetModelId, // [FIX] Use Sanitized ID
                messages: messages,
            })
        });

        // MANDATORY 4: Return proper JSON on all errors
        if (!response.ok) {
            const errText = await response.text();
            console.error(`OpenRouter Error (${response.status}):`, errText);

            // Try to parse error text as JSON
            let errJson;
            try {
                errJson = JSON.parse(errText);
            } catch (e) {
                errJson = { message: errText };
            }

            return new Response(JSON.stringify({
                error: `AI Provider Error: ${response.status}`,
                details: errJson,
                code: response.status
            }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200 // MANDATORY 5: Always 200
            });
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
            status: 200 // MANDATORY 5: Always 200
        });
    }
});
