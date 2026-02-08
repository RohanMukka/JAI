import OpenAI from 'openai';
// @ts-ignore
// const { PDFParse } = require('pdf-parse'); // Moved inside function

const openai = new OpenAI({
    baseURL: "https://openrouter.ai/api/v1",
    apiKey: process.env.OPENROUTER_API_KEY,
});

// Helper to extract text from PDF
export async function parseResumeFromPdf(resumeBuffer: Buffer): Promise<string> {
    console.log("[OpenRouter] Starting PDF extraction...");
    console.log(`[OpenRouter] Buffer details: IsBuffer=${Buffer.isBuffer(resumeBuffer)}, Size=${resumeBuffer?.length}`);
    let resumeText = "";
    try {
        // @ts-ignore
        const pdf = require('pdf-parse');
        const data = await pdf(resumeBuffer);
        resumeText = data.text;
        console.log(`[OpenRouter] PDF Extracted. Length: ${resumeText.length}`);
        return resumeText;
    } catch (error) {
        console.error("[OpenRouter] PDF Parsing Error:", error);
        throw new Error("Failed to parse resume PDF. Please ensure it is a valid PDF text file.");
    }
}

// Main generation function now accepts TEXT, not Buffer
export async function generateCustomResume(jobDescription: string, resumeText: string): Promise<string> {
    // 2. Construct Prompt
    const prompt = `
    You are an expert resume writer. 
    I will provide you with a Job Description and a candidate's Resume text.
    
    Your task is to rewrite the resume to better match the Job Description, highlighting relevant skills and experiences.
    
    
    Output the result in Markdown format. 
    Focus on:
    - Tailoring the professional summary.
    - Reordering or emphasizing bullet points in work history that match the JD.
    - Highlighting matching skills.
    
    Job Description:
    ${jobDescription}

    Candidate Resume:
    ${resumeText}
  `;

    // 3. Call OpenRouter (Standard Gemini 2.0 Flash)
    const completion = await openai.chat.completions.create({
        model: "google/gemini-2.0-flash-001",
        messages: [
            {
                role: "user",
                content: prompt,
            },
        ],
        max_tokens: 3000,
    });

    return completion.choices[0].message.content || "Failed to generate content";
}
