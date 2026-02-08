const { GoogleGenerativeAI } = require("@google/generative-ai");

// Updated Key from .env.local
const GOOGLE_API_KEY = "AIzaSyAI8k9tJsE_BYUdar8OZxSGplZRsXixcT8";

async function run() {
    console.log("=== GEMINI API DIAGNOSTICS ===");
    console.log(`Key Prefix: ${GOOGLE_API_KEY.substring(0, 10)}... (Length: ${GOOGLE_API_KEY.length})`);

    const genAI = new GoogleGenerativeAI(GOOGLE_API_KEY);

    // TEST 1: List Models (Requires Generative Language API + NO restrictions)
    console.log("\n[TEST 1] Listing Available Models...");
    try {
        // This method might not be exposed on the main client in v0.1.3?
        // Let's check if the client supports it, if not skip.
        // Actually, newer SDKs expose it via a manager or similar, but let's stick to standard generation
        // as the primary test.
        // Direct API call via fetch to be sure
        const listUrl = `https://generativelanguage.googleapis.com/v1beta/models?key=${GOOGLE_API_KEY}`;
        const res = await fetch(listUrl);

        if (res.ok) {
            const data = await res.json();
            console.log("✅ SUCCESS: Models listed.");
            const modelNames = data.models.map(m => m.name.replace("models/", ""));
            console.log("Available Models:", modelNames.join(", "));
        } else {
            const err = await res.text();
            console.log(`❌ FAILED: ${res.status} ${res.statusText}`);
            console.log("Error Body:", err);
        }

    } catch (e) {
        console.log("❌ FAILED (Network/Code):", e.message);
    }

    // TEST 2: Generate Content (gemini-1.5-flash)
    console.log("\n[TEST 2] Generating Content with 'gemini-1.5-flash'...");
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const result = await model.generateContent("Hello");
        const response = await result.response;
        console.log(`✅ SUCCESS: ${response.text()}`);
    } catch (error) {
        console.log("❌ FAILED:");
        console.log(error.message);
    }

    // TEST 3: Generate Content (gemini-pro - Fallback)
    console.log("\n[TEST 3] Generating Content with 'gemini-pro'...");
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });
        const result = await model.generateContent("Hello");
        const response = await result.response;
        console.log(`✅ SUCCESS: ${response.text()}`);
    } catch (error) {
        console.log("❌ FAILED:");
        console.log(error.message);
    }
}

run();
