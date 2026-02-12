const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require('fs');

// Simple .env parser to avoid dependency issues
const envContent = fs.readFileSync('.env.local', 'utf-8');
const env = {};
envContent.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) env[key.trim()] = value.trim();
});

const apiKey = env.GOOGLE_API_KEY;

if (!apiKey) {
    console.error("API Key not found in .env.local");
    process.exit(1);
}

const genAI = new GoogleGenerativeAI(apiKey);

async function listModels() {
    try {
        // Attempt to access the model manager directly if available in this SDK version
        // Typically it's not exposed on the client directly in older versions, but let's try.
        // If this fails, we'll try to just generate with 'gemini-pro' as a fallback test.

        console.log("Checking gemini-1.5-flash...");
        try {
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
            const result = await model.generateContent("Test");
            console.log("SUCCESS: gemini-1.5-flash works!");
        } catch (e) {
            console.log("FAIL: gemini-1.5-flash error:", e.message);
        }

        console.log("Checking gemini-pro...");
        try {
            const model = genAI.getGenerativeModel({ model: "gemini-pro" });
            const result = await model.generateContent("Test");
            console.log("SUCCESS: gemini-pro works!");
        } catch (e) {
            console.log("FAIL: gemini-pro error:", e);
        }

        console.log("Checking gemini-1.5-pro...");
        try {
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
            const result = await model.generateContent("Test");
            console.log("SUCCESS: gemini-1.5-pro works!");
        } catch (e) {
            console.log("FAIL: gemini-1.5-pro error:", e.message);
        }

    } catch (error) {
        console.error("Critical Error", error);
    }
}

listModels();
