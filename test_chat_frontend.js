
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://hbqacsaxsyphanfzgnsk.supabase.co';
const supabaseAnonKey = 'sb_publishable_CVOzbZGt_FkKfJyCO7Xf7A_S74te0Vb';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testFrontendLogic() {
    console.log("Simulating Frontend Call with Overridden Auth...");

    const payload = {
        modelId: "deepseek/deepseek-r1",
        messages: [{ role: "user", content: "Hello from Node Simulation" }]
    };

    // Exactly mimicking aiHandler.js logic
    const { data, error } = await supabase.functions.invoke('chat-proxy', {
        body: payload,
        headers: {
            "Authorization": `Bearer ${supabaseAnonKey}`
        }
    });

    if (error) {
        console.error("Invoke Error:", error);
    } else {
        if (data && typeof data.status === 'number') {
            // It's a Response object
            console.log("STATUS:", data.status);
            console.log("STATUS_TEXT:", data.statusText);
            try {
                const text = await data.text();
                console.log("BODY:", text);
            } catch (e) { console.log("Could not read body", e); }
        } else {
            // It's JSON
            console.log("DATA:", JSON.stringify(data, null, 2));
        }
    }
}

testFrontendLogic();
