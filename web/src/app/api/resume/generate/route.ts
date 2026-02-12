import { NextRequest, NextResponse } from 'next/server';
import { generateCustomResume, parseResumeFromPdf } from '@/lib/openrouter';
import { getDb } from '@/lib/mongodb';
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { jobDescription, resumeText } = await request.json();

        if (!jobDescription) {
            return NextResponse.json({ error: "Job Description is required" }, { status: 400 });
        }

        let finalResumeText = resumeText;

        // Fallback: If no text provided, fetch from DB and parse
        if (!finalResumeText) {
            console.log("[API] No resume text provided, fetching from DB...");
            const db = await getDb();
            // @ts-ignore
            const userId = session.user.id || session.user.email;
            const profile = await db.collection("profiles").findOne({ userId });

            if (!profile || !profile.resumePdfData) {
                return NextResponse.json({ error: "No resume found. Please upload a resume first." }, { status: 404 });
            }

            // Convert Binary to Buffer
            let resumeBuffer: Buffer;
            if (profile.resumePdfData.buffer) {
                resumeBuffer = Buffer.from(profile.resumePdfData.buffer);
            } else {
                resumeBuffer = Buffer.from(profile.resumePdfData);
            }

            finalResumeText = await parseResumeFromPdf(resumeBuffer);
        }

        console.log("[API] generating resume with text length:", finalResumeText.length);
        const generatedResume = await generateCustomResume(jobDescription, finalResumeText);

        // Return the Markdown content directly via JSON
        return NextResponse.json({
            success: true,
            content: generatedResume
        });

    } catch (error: any) {
        console.error("[API] Resume Generation Error:", error);
        return NextResponse.json(
            {
                success: false,
                error: error.message || "Internal Server Error",
                details: error.toString()
            },
            { status: 500 }
        );
    }
}
