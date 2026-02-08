const { GoogleGenerativeAI } = require("@google/generative-ai");

const GOOGLE_API_KEY = "AIzaSyAI8k9tJsE_BYUdar8OZxSGplZRsXixcT8";

async function run() {
    console.log("Checking API Key permissions...");
    const genAI = new GoogleGenerativeAI(GOOGLE_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    try {
        const result = await model.generateContent("Test");
        console.log("SUCCESS: Key is working!");
    } catch (error) {
        console.log("ERROR DETAILS:");
        console.log(error.message);

        if (error.message.includes("404")) {
            console.log("\nDIAGNOSIS: 404 means the model is not found for this key.");
            console.log("1. Ensure 'Generative Language API' is ENABLED in Google Cloud Console.");
            console.log("2. Ensure the key has no restrictions.");
        }
        if (error.message.includes("403")) {
            console.log("\nDIAGNOSIS: 403 means permission denied (Quota or Billing).");
        }
    }
}

run();
