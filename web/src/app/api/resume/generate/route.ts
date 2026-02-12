import { NextRequest, NextResponse } from 'next/server';
import { generateCustomResume } from '@/lib/gemini';
import { getDb } from '@/lib/mongodb';
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { jobDescription } = await request.json();

        if (!jobDescription) {
            return NextResponse.json({ error: "Job Description is required" }, { status: 400 });
        }

        const db = await getDb();
        // @ts-ignore
        const userId = session.user.id || session.user.email;

        const profile = await db.collection("profiles").findOne({ userId });

        if (!profile || !profile.resumePdfData) {
            return NextResponse.json({ error: "No resume found. Please upload a resume first." }, { status: 404 });
        }

        console.log("[API] Resume Generation Started");

        // Convert Binary to Buffer
        let resumeBuffer: Buffer;
        if (profile.resumePdfData.buffer) {
            console.log("[API] Converting from Binary");
            resumeBuffer = Buffer.from(profile.resumePdfData.buffer);
        } else {
            console.log("[API] Using existing Buffer/String");
            resumeBuffer = Buffer.from(profile.resumePdfData);
        }

        console.log(`[API] Resume Buffer Size: ${resumeBuffer.length}`);

        console.log("[API] Calling Gemini...");
        const generatedResume = await generateCustomResume(jobDescription, resumeBuffer);
        console.log("[API] Gemini Response Received");

        return NextResponse.json({ resume: generatedResume });

    } catch (error) {
        console.error("Resume generation error:", error);
        return NextResponse.json({ error: "Failed to generate resume" }, { status: 500 });
    }
}
