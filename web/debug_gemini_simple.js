const { GoogleGenerativeAI } = require("@google/generative-ai");

const GOOGLE_API_KEY = "AIzaSyDATZZ6-UmbyXmMEnC50b3zeBNMoT4UIWk";

async function run() {
    console.log("Initializing Gemini Client...");
    const genAI = new GoogleGenerativeAI(GOOGLE_API_KEY);

    const models = ["gemini-1.5-flash", "gemini-pro"];

    for (const modelName of models) {
        console.log(`\n--- Testing Model: ${modelName} (Text Only) ---`);
        try {
            const model = genAI.getGenerativeModel({ model: modelName });
            const prompt = "Say hello.";

            console.log(`Sending prompt to ${modelName}...`);
            const result = await model.generateContent(prompt);
            const response = await result.response;
            console.log(`SUCCESS! Response: ${response.text()}`);
        } catch (error) {
            console.error(`FAILED ${modelName}:`);
            console.error(JSON.stringify(error, null, 2));
            // Also print message directly just in case
            console.error(error.message);
        }
    }
}

run();
