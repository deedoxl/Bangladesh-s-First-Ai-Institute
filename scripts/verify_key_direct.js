
const apiKey = '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';

async function verifyKey() {
    console.log("Found Key:", apiKey.slice(0, 10) + "...");

    try {
        const response = await fetch("https://openrouter.ai/api/v1/context", {
            method: "GET", // Some text endpoint to check auth
            // Actually, /auth/key is better if it exists, but /models is standard
            // Standard: GET https://openrouter.ai/api/v1/models
        });

        // Let's try to list models for a lighter check
        const responseModels = await fetch("https://openrouter.ai/api/v1/models", {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${apiKey}`,
                "Content-Type": "application/json"
            }
        });

        if (responseModels.ok) {
            console.log("✅ API Key is VALID! OpenRouter accepted it.");
            console.log("Status:", responseModels.status);
            // const data = await responseModels.json();
            // console.log("Models found:", data.data.length);
        } else {
            console.error("❌ API Key Rejected by OpenRouter.");
            console.error("Status:", responseModels.status, responseModels.statusText);
            const text = await responseModels.text();
            console.error("Response:", text);
        }

    } catch (e) {
        console.error("Network/Script Error:", e);
    }
}

verifyKey();
