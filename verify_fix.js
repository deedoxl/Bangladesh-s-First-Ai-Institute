
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://hbqacsaxsyphanfzgnsk.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhicWFjc2F4c3lwaGFuZnpnbnNrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc4NjQ1MTUsImV4cCI6MjA4MzQ0MDUxNX0.KH8RpD6CXAg7WObpqKoKJtcpwbDWJq_dZI4rH1r_-_8";

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function verifyFix() {
    console.log("Verifying Fix by calling chat-proxy...");

    const payload = {
        modelId: "deepseek/deepseek-chat",
        messages: [{ role: "user", content: "Say 'The API Key works' if you can read this." }]
    };

    try {
        const { data, error } = await supabase.functions.invoke('chat-proxy', {
            body: payload
        });

        if (error) {
            console.error("Invoke Error:", error);
            // The error object from supabase-js might contain details
            if (error instanceof Error) {
                console.error("Message:", error.message);
            }
        } else {
            console.log("Response Data:", JSON.stringify(data, null, 2));
            if (data && data.choices && data.choices.length > 0) {
                console.log("✅ AI Response Content:", data.choices[0].message.content);
            } else if (data.error) {
                console.log("❌ AI Error in Response:", data.error);
            }
        }
    } catch (err) {
        console.error("Unexpected Script Error:", err);
    }
}

verifyFix();
