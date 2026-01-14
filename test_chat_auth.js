
// Removed require. Node 18+ has global fetch.

async function testChat() {
    console.log("🧪 Testing Chat Proxy with NO Auth Token (Simulating Local Admin)...");

    // Using the hosted function URL
    const hostedUrl = 'https://hbqacsaxsyphanfzgnsk.supabase.co/functions/v1/chat-proxy';

    try {
        const response = await fetch(hostedUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                // NO Authorization header
            },
            body: JSON.stringify({
                modelId: 'deepseek/deepseek-chat',
                messages: [{ role: 'user', content: 'Hello' }]
            })
        });

        const text = await response.text();
        console.log(`Response Status: ${response.status}`);
        // console.log(`Response Body: ${text}`); // Truncate if too long

        if (response.status === 400 || response.status === 401 || response.status === 500) {
            if (text.includes("Unauthorized") || text.includes("Authorization header")) {
                console.log("🎯 CONFIRMED: Request rejected due to missing Auth (Expected behavior for Local Admin).");
            } else {
                console.log("🤔 Failed, but not strictly auth related? Message: " + text.substring(0, 100));
            }
        } else if (response.status === 200) {
            console.log("⚠️ SURPRISE: Request SUCCEEDED? Security is off?");
        }

    } catch (e) {
        console.error("Error calling function:", e);
    }
}

testChat();
