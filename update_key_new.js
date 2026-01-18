
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://hbqacsaxsyphanfzgnsk.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhicWFjc2F4c3lwaGFuZnpnbnNrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc4NjQ1MTUsImV4cCI6MjA4MzQ0MDUxNX0.KH8RpD6CXAg7WObpqKoKJtcpwbDWJq_dZI4rH1r_-_8";

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const NEW_KEY = "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";

async function updateKey() {
    console.log("Updating API Key to:", NEW_KEY.substring(0, 15) + "...");

    const { error } = await supabase.rpc('save_ai_system_settings', { p_key: NEW_KEY });

    if (error) {
        console.error("Error saving key:", error);
    } else {
        console.log("✅ Success! API Key saved to database.");

        // Verify
        console.log("Verifying...");
        const { data: globalKey, error: globalError } = await supabase.rpc('get_decrypted_system_key');
        if (globalError) {
            console.log("Error reading back key:", globalError);
        } else {
            console.log("Read back key (start):", globalKey ? globalKey.substring(0, 15) : "NULL");
            if (globalKey === NEW_KEY) {
                console.log("Key match confirmed!");
            } else {
                console.log("MISMATCH! DB has:", globalKey);
            }
        }
    }
}

updateKey();
