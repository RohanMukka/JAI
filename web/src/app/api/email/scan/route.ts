import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";
import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function GET() {
    const session: any = await getServerSession(authOptions);

    if (!session || !session.accessToken) {
        return NextResponse.json({ error: "Not authenticated with Google" }, { status: 401 });
    }

    try {
        // 1. Fetch recent messages from Gmail
        const gmailResponse = await fetch(
            "https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=5&q=subject:application OR company OR interview OR offer OR rejection",
            {
                headers: {
                    Authorization: `Bearer ${session.accessToken}`,
                },
            }
        );

        if (!gmailResponse.ok) {
            const error = await gmailResponse.json();
            throw new Error(error.error?.message || "Failed to fetch messages");
        }

        const { messages } = await gmailResponse.json();

        if (!messages || messages.length === 0) {
            return NextResponse.json({ updates: [] });
        }

        // 2. Fetch snippets for each message
        const updates = [];
        for (const msg of messages) {
            const msgDetail = await fetch(
                `https://gmail.googleapis.com/gmail/v1/users/me/messages/${msg.id}`,
                {
                    headers: { Authorization: `Bearer ${session.accessToken}` },
                }
            ).then(res => res.json());

            const snippet = msgDetail.snippet;
            const subject = msgDetail.payload.headers.find((h: any) => h.name === "Subject")?.value || "";

            // 3. Use AI to parse the snippet (If available, otherwise use mock regex logic)
            // For this demo, we'll look for keywords to simulate "Found it"
            // In a real app, you'd call Gemini here:
            /*
            const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
            const model = genAI.getGenerativeModel({ model: "gemini-pro" });
            const prompt = `Parse this email snippet and extract company and job status (Applied, Interview, Offer, Rejected). Content: ${snippet}`;
            const result = await model.generateContent(prompt);
            ...
            */

            // Simple heuristic for demo purposes
            if (snippet.toLowerCase().includes("interview")) {
                updates.push({
                    company: extractCompany(snippet, subject) || "Unkown",
                    newStatus: "Interview",
                    reason: "Found interview invitation"
                });
            } else if (snippet.toLowerCase().includes("regret") || snippet.toLowerCase().includes("not moving forward")) {
                updates.push({
                    company: extractCompany(snippet, subject) || "Unkown",
                    newStatus: "Rejected",
                    reason: "Found rejection notice"
                });
            }
        }

        return NextResponse.json({ updates });

    } catch (error: any) {
        console.error("Gmail fetch error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

function extractCompany(snippet: string, subject: string) {
    // Very basic extraction logic
    const combined = (subject + " " + snippet).toLowerCase();
    // In a real app, we'd compare against the user's current application list
    // or use AI. For now, let's just look for common names or context.
    if (combined.includes("techcorp")) return "TechCorp";
    if (combined.includes("startupinc")) return "StartupInc";
    if (combined.includes("bigdata")) return "BigData Co";
    return null;
}
