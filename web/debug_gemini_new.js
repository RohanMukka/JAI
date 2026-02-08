const { MongoClient } = require('mongodb');
const { GoogleGenerativeAI } = require("@google/generative-ai");

// Updated Key from .env.local
const GOOGLE_API_KEY = "AIzaSyAI8k9tJsE_BYUdar8OZxSGplZRsXixcT8";
const MONGODB_URI = "mongodb+srv://sanjaymail3478_db_user:aENoXLYmPAv91tZ4@jaidb.awyjlat.mongodb.net/?appName=JaiDB";
const DB_NAME = "jaidb";

async function run() {
    console.log("Initializing Gemini Client with NEW KEY...");
    const genAI = new GoogleGenerativeAI(GOOGLE_API_KEY);

    // Testing text-only first to rule out PDF issues
    console.log("\n--- Testing Model: gemini-1.5-flash (Text Only) ---");
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const prompt = "Say hello.";

        console.log(`Sending prompt...`);
        const result = await model.generateContent(prompt);
        const response = await result.response;
        console.log(`SUCCESS! Response: ${response.text()}`);
    } catch (error) {
        console.error(`FAILED TEXT TEST:`);
        console.error(error.message);
        // Don't stop, try PDF anyway to see specific error
    }

    // Now test with PDF
    console.log("\n--- Testing Model: gemini-1.5-flash (with PDF) ---");
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

        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const prompt = "Summarize this resume in 5 words.";
        const pdfPart = {
            inlineData: {
                data: resumeBuffer.toString("base64"),
                mimeType: "application/pdf",
            },
        };

        console.log("Sending PDF prompt...");
        const result = await model.generateContent([prompt, pdfPart]);
        const response = await result.response;
        console.log(`SUCCESS! PDF Response: ${response.text()}`);

    } catch (error) {
        console.error("PDF Generation Error:", error.message);
    } finally {
        await client.close();
    }
}

run();
