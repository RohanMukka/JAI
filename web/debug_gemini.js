const { MongoClient } = require('mongodb');
const { GoogleGenerativeAI } = require("@google/generative-ai");

// Hardcoded env vars for debug
const MONGODB_URI = "mongodb+srv://sanjaymail3478_db_user:aENoXLYmPAv91tZ4@jaidb.awyjlat.mongodb.net/?appName=JaiDB";
const GOOGLE_API_KEY = "AIzaSyDATZZ6-UmbyXmMEnC50b3zeBNMoT4UIWk";
const DB_NAME = "jaidb";

async function run() {
    console.log("Initializing Gemini Client...");
    const genAI = new GoogleGenerativeAI(GOOGLE_API_KEY);

    // 1. List Models first to see what's available
    /*
    try {
        // limit to first 5 for brevity
       // Note: listModels might not be available on the client directly in older versions or behaving differently
       // But let's try a simple generation with a known safe model first.
    } catch (e) {
        console.log("List models failed (expected if restricted key)");
    }
    */

    const client = new MongoClient(MONGODB_URI);

    try {
        await client.connect();
        const db = client.db(DB_NAME);
        const profiles = db.collection("profiles");
        const profile = await profiles.findOne({ resumePdfData: { $exists: true } });

        if (!profile) {
            console.error("No profile found.");
            return;
        }

        const resumeBuffer = profile.resumePdfData.buffer
            ? Buffer.from(profile.resumePdfData.buffer)
            : Buffer.from(profile.resumePdfData);

        const models = ["gemini-1.5-flash", "gemini-pro", "gemini-1.0-pro"];

        for (const modelName of models) {
            console.log(`\n--- Testing Model: ${modelName} ---`);
            try {
                const model = genAI.getGenerativeModel({ model: modelName });
                const prompt = "Summarize this resume in 5 words.";
                const pdfPart = {
                    inlineData: {
                        data: resumeBuffer.toString("base64"),
                        mimeType: "application/pdf",
                    },
                };

                const result = await model.generateContent([prompt, pdfPart]);
                const response = await result.response;
                console.log(`SUCCESS! Response: ${response.text()}`);
                break; // Stop if successful
            } catch (error) {
                console.error(`FAILED ${modelName}:`, error.message);
                if (error.message.includes("404")) {
                    console.log("  -> Model not found or not accessible.");
                }
            }
        }

    } catch (error) {
        console.error("Global Error:", error);
    } finally {
        await client.close();
    }
}

run();
