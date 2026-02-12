const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config({ path: '.env.local' });

async function main() {
    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
    try {
        // Access the model manager to list models
        // Note: older SDKs might not expose this easily, but let's try the standard way
        // If this fails, we will know it's an SDK limitation or key issue.
        // @google/generative-ai typically doesn't have a direct 'listModels' on the client.
        // We often have to just try known models.
        // However, let's try to see if we can get a response from a known stable model.

        console.log("Checking gemini-1.5-flash-latest...");
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });
        const result = await model.generateContent("Hi");
        console.log("gemini-1.5-flash-latest WORKS");
    } catch (error) {
        console.error("gemini-1.5-flash-latest FAILED:", error.message);
    }
}
main();
