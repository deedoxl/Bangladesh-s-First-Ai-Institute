
import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(req) {
    try {
        const supabase = await createClient(); // Server Client (Cookie Auth)
        // Validate request body
        let body;
        try {
            body = await req.json();
        } catch (e) {
            return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
        }

        const { modelId, messages, prompt } = body;

        // 1. Verify User (Optional but good for security)
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (!user) {
            // ALLOW for now if we want to test without login? 
            // User asked for "Student Dashboard" (Login Required). 
            // Admin (Login Required). 
            // Main Website? "AITools.jsx" -> Likely Public or requires Login?
            // If public, we might skip auth check for certain models or IP limit.
            // For SAFETY: If fetching settings requires RLS, we need auth.
            // But we set public read true.
            // Let's Log warning but Proceed if user is null (maybe Guest Mode?)
            console.warn("API Call without User Session");
        }

        // 2. Fetch Model Config
        const { data: modelConfig, error: modelError } = await supabase
            .from('ai_models_settings')
            .select('*')
            .eq('id', modelId)
            .single();

        if (modelError || !modelConfig) {
            console.error("Model Fetch Error:", modelError);
            return NextResponse.json({ error: "Model validation failed or model not found in DB." }, { status: 400 });
        }

        if (!modelConfig.enabled) {
            return NextResponse.json({ error: "Model is disabled." }, { status: 403 });
        }

        // 3. Resolve API Key
        let apiKey = modelConfig.api_key;

        // Fallback to Env if missing in DB
        if (!apiKey) {
            apiKey = process.env.OPENROUTER_API_KEY;
        }

        if (!apiKey) {
            console.error("Missing API Key for model:", modelId);
            return NextResponse.json({ error: "Server Error: No API Key configured for this model." }, { status: 500 });
        }

        // 4. Call OpenRouter
        const aiResponse = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${apiKey}`,
                "Content-Type": "application/json",
                "HTTP-Referer": "https://deedox.com",
                "X-Title": "DEEDOX AI"
            },
            body: JSON.stringify({
                model: modelConfig.id,
                messages: messages || [{ role: 'user', content: prompt }]
            })
        });

        if (!aiResponse.ok) {
            const err = await aiResponse.text();
            console.error("OpenRouter Error:", err);
            return NextResponse.json({ error: `AI Provider Error: ${aiResponse.status} - ${err}` }, { status: aiResponse.status });
        }

        const data = await aiResponse.json();
        return NextResponse.json(data);

    } catch (error) {
        console.error("Proxy Critical Error:", error);
        return NextResponse.json({ error: `Internal Server Error: ${error.message}` }, { status: 500 });
    }
}
