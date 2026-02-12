const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config({ path: '.env.local' });

async function main() {
    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
    try {
        console.log("Using Key:", process.env.GOOGLE_API_KEY ? "Found" : "Missing");
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        // Attempting to list models to see strictly what is available
        // Note: The SDK does not strictly have a listModels method on the client instance in all versions, 
        // but we can try to use the API directly or a specific model check.

        // Actually, asking the user to run a curl might be better, but let's try to generate one token.
        console.log("Attempting generation with 'gemini-1.5-flash'...");
        const result = await model.generateContent("Hello");
        console.log("Success! Response:", result.response.text());
    } catch (error) {
        console.error("Error with gemini-1.5-flash:", error.message);
    }

    try {
        console.log("Attempting generation with 'gemini-pro'...");
        const modelPro = genAI.getGenerativeModel({ model: "gemini-pro" });
        const resultPro = await modelPro.generateContent("Hello");
        console.log("Success! Response:", resultPro.response.text());
    } catch (error) {
        console.error("Error with gemini-pro:", error.message);
    }
}

main();
