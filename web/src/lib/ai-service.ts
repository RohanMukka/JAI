/**
 * Unified AI service with automatic fallback chain:
 *   1. Google Gemini (if GOOGLE_API_KEY is set)
 *   2. OpenRouter paid model (if OPENROUTER_API_KEY is set)
 *   3. OpenRouter free model (no API key needed — just an OpenRouter account)
 *
 * The first available provider that succeeds is used.
 */

import { GoogleGenerativeAI } from "@google/generative-ai";
import OpenAI from "openai";
import { optimizeResumeLocally } from "./local-optimizer";

// ---------------------------------------------------------------------------
// Provider helpers
// ---------------------------------------------------------------------------

type Provider = "gemini" | "openrouter" | "openrouter-free" | "local-nlp";

interface ProviderResult {
    text: string;
    provider: Provider;
}

const RESUME_SYSTEM_PROMPT = `You are an expert resume writer.
Your task is to rewrite the resume to better match the Job Description, highlighting relevant skills and experiences.

Output the result in Markdown format.
Focus on:
- Tailoring the professional summary.
- Reordering or emphasizing bullet points in work history that match the JD.
- Highlighting matching skills.`;

// ---------------------------------------------------------------------------
// 1. Google Gemini (direct SDK — supports PDF buffers)
// ---------------------------------------------------------------------------

async function tryGemini(jobDescription: string, resumeContent: string | Buffer): Promise<string | null> {
    const apiKey = process.env.GOOGLE_API_KEY;
    if (!apiKey) return null;

    try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

        const prompt = `${RESUME_SYSTEM_PROMPT}

Job Description:
${jobDescription}`;

        // If the resume is a Buffer (PDF), send it as inline data
        if (Buffer.isBuffer(resumeContent)) {
            const pdfPart = {
                inlineData: {
                    data: resumeContent.toString("base64"),
                    mimeType: "application/pdf",
                },
            };
            const result = await model.generateContent([prompt, pdfPart]);
            return result.response.text();
        }

        // Otherwise send as plain text
        const fullPrompt = `${prompt}

Candidate Resume:
${resumeContent}`;
        const result = await model.generateContent(fullPrompt);
        return result.response.text();
    } catch (err: any) {
        console.warn("[AI] Gemini failed, will try fallback:", err.message);
        return null;
    }
}

// ---------------------------------------------------------------------------
// 2. OpenRouter (paid tier)
// ---------------------------------------------------------------------------

async function tryOpenRouter(jobDescription: string, resumeText: string): Promise<string | null> {
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) return null;

    try {
        const openai = new OpenAI({
            baseURL: "https://openrouter.ai/api/v1",
            apiKey,
        });

        const completion = await openai.chat.completions.create({
            model: "google/gemini-2.0-flash-001",
            messages: [
                { role: "system", content: RESUME_SYSTEM_PROMPT },
                {
                    role: "user",
                    content: `Job Description:\n${jobDescription}\n\nCandidate Resume:\n${resumeText}`,
                },
            ],
            max_tokens: 3000,
        });

        return completion.choices[0]?.message?.content || null;
    } catch (err: any) {
        console.warn("[AI] OpenRouter paid failed, will try free tier:", err.message);
        return null;
    }
}

// ---------------------------------------------------------------------------
// 3. OpenRouter free tier (no credit card, rate-limited)
// ---------------------------------------------------------------------------

async function tryOpenRouterFree(jobDescription: string, resumeText: string): Promise<string | null> {
    // Works with OR without an OPENROUTER_API_KEY. If the user has one we
    // reuse it; otherwise the `:free` suffix models work with any key.
    const apiKey = process.env.OPENROUTER_API_KEY || process.env.OPENROUTER_FREE_KEY;
    if (!apiKey) {
        console.warn("[AI] No OpenRouter key at all — cannot use free tier either.");
        return null;
    }

    try {
        const openai = new OpenAI({
            baseURL: "https://openrouter.ai/api/v1",
            apiKey,
        });

        const completion = await openai.chat.completions.create({
            model: "meta-llama/llama-3.3-70b-instruct:free",
            messages: [
                { role: "system", content: RESUME_SYSTEM_PROMPT },
                {
                    role: "user",
                    content: `Job Description:\n${jobDescription}\n\nCandidate Resume:\n${resumeText}`,
                },
            ],
            max_tokens: 3000,
        });

        return completion.choices[0]?.message?.content || null;
    } catch (err: any) {
        console.error("[AI] OpenRouter free tier also failed:", err.message);
        return null;
    }
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Generate a tailored resume with automatic provider fallback.
 *
 * @param jobDescription  The target job description text
 * @param resumeContent   Either a string (plain text) or Buffer (PDF bytes)
 * @returns               Object with the generated text and which provider was used
 */
export async function generateResume(
    jobDescription: string,
    resumeContent: string | Buffer
): Promise<ProviderResult> {
    // -- 1. Try Gemini (supports both text and PDF buffer) --
    const geminiResult = await tryGemini(jobDescription, resumeContent);
    if (geminiResult) {
        console.log("[AI] Used provider: Gemini");
        return { text: geminiResult, provider: "gemini" };
    }

    // For OpenRouter we need plain text, not a PDF buffer
    let resumeText: string;
    if (Buffer.isBuffer(resumeContent)) {
        // Attempt to extract text from the PDF
        try {
            const pdf = require("pdf-parse");
            const data = await pdf(resumeContent);
            resumeText = data.text;
        } catch {
            throw new Error(
                "Gemini API is unavailable and the resume is in PDF format which cannot be parsed. " +
                "Please set GOOGLE_API_KEY or upload a text-based resume."
            );
        }
    } else {
        resumeText = resumeContent;
    }

    // -- 2. Try OpenRouter paid --
    const orResult = await tryOpenRouter(jobDescription, resumeText);
    if (orResult) {
        console.log("[AI] Used provider: OpenRouter (paid)");
        return { text: orResult, provider: "openrouter" };
    }

    // -- 3. Try OpenRouter free tier --
    const freeResult = await tryOpenRouterFree(jobDescription, resumeText);
    if (freeResult) {
        console.log("[AI] Used provider: OpenRouter (free tier)");
        return { text: freeResult, provider: "openrouter-free" };
    }

    // -- 4. Local NLP optimizer (no API needed at all) --
    console.log("[AI] All cloud providers unavailable. Using local NLP optimizer.");
    let resumeText: string;
    if (Buffer.isBuffer(resumeContent)) {
        try {
            const pdf = require("pdf-parse");
            const data = await pdf(resumeContent);
            resumeText = data.text;
        } catch {
            throw new Error(
                "All cloud AI providers are unavailable and the resume PDF could not be parsed locally. " +
                "Please configure at least one API key or provide a text-based resume."
            );
        }
    } else {
        resumeText = resumeContent as string;
    }

    const localResult = optimizeResumeLocally(jobDescription, resumeText);
    const localOutput = [
        localResult.optimizedResume,
        "",
        "---",
        "*Note: This resume was optimized using local NLP analysis (TF-IDF keyword matching, skill gap detection, and bullet enhancement). For best results, configure a Gemini or OpenRouter API key.*",
        "",
        `**Top JD Keywords Detected:** ${localResult.analysis.topKeywords.join(", ")}`,
    ].join("\n");

    return { text: localOutput, provider: "local-nlp" };
}

/**
 * Parse resume text from a PDF buffer.
 */
export async function parseResumeFromPdf(resumeBuffer: Buffer): Promise<string> {
    try {
        const pdf = require("pdf-parse");
        const data = await pdf(resumeBuffer);
        return data.text;
    } catch (error) {
        console.error("[AI] PDF Parsing Error:", error);
        throw new Error("Failed to parse resume PDF.");
    }
}
