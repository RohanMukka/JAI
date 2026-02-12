import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { parseResumeFromPdf } from '@/lib/openrouter';

export async function GET(request: NextRequest) {
    console.log("[API] GET /api/resume/content - Hit");
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const db = await getDb();
        // @ts-ignore
        const userId = session.user.id || session.user.email;

        const profile = await db.collection("profiles").findOne({ userId });

        if (!profile || !profile.resumePdfData) {
            return NextResponse.json({ error: "No resume found. Please upload a resume first." }, { status: 404 });
        }

        console.log("[API] Fetching Resume Content");

        // Convert Binary to Buffer
        let resumeBuffer: Buffer;
        if (profile.resumePdfData.buffer) {
            resumeBuffer = Buffer.from(profile.resumePdfData.buffer);
        } else {
            resumeBuffer = Buffer.from(profile.resumePdfData);
        }

        const resumeText = await parseResumeFromPdf(resumeBuffer);

        return NextResponse.json({
            success: true,
            content: resumeText
        });

    } catch (error: any) {
        console.error("[API] Resume Content Error:", error);
        return NextResponse.json(
            {
                success: false,
                error: error.message || "Internal Server Error"
            },
            { status: 500 }
        );
    }
}
