
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://hbqacsaxsyphanfzgnsk.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhicWFjc2F4c3lwaGFuZnpnbnNrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc4NjQ1MTUsImV4cCI6MjA4MzQ0MDUxNX0.KH8RpD6CXAg7WObpqKoKJtcpwbDWJq_dZI4rH1r_-_8";

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testRpc() {
    console.log("Testing RPC: get_decrypted_system_key");
    const { data, error } = await supabase.rpc('get_decrypted_system_key');

    if (error) {
        console.error("RPC Error:", error);
    } else {
        console.log("RPC Result:", data ? "Key Found (Masked): " + data.substring(0, 10) + "..." : "No Key Returned");
    }
}

testRpc();
