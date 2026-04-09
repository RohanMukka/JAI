
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getDb } from "@/lib/mongodb";
import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { generateCustomResume, parseResumeFromPdf } from "@/lib/openrouter";

export async function POST(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    const { id } = await params;

    try {
        const db = await getDb();

        // Fetch the session document
        const sessionDoc = await db.collection("sessions").findOne({
            _id: new ObjectId(id),
            // @ts-ignore
            userId: session.user.id || session.user.email,
        });

        if (!sessionDoc) {
            return NextResponse.json({ error: "Session not found" }, { status: 404 });
        }

        // Get job description from session
        const jobDescription = sessionDoc.jobDescription;
        if (!jobDescription) {
            return NextResponse.json({ error: "No job description in session" }, { status: 400 });
        }

        // Get resume text — either from session or user profile
        let resumeText = sessionDoc.resumeText;
        if (!resumeText) {
            // @ts-ignore
            const userId = session.user.id || session.user.email;
            const profile = await db.collection("profiles").findOne({ userId });

            if (profile?.resumePdfData) {
                let resumeBuffer: Buffer;
                if (profile.resumePdfData.buffer) {
                    resumeBuffer = Buffer.from(profile.resumePdfData.buffer);
                } else {
                    resumeBuffer = Buffer.from(profile.resumePdfData);
                }
                resumeText = await parseResumeFromPdf(resumeBuffer);
            }
        }

        if (!resumeText) {
            return NextResponse.json({ error: "No resume found. Please upload a resume first." }, { status: 404 });
        }

        // Generate optimized resume
        const generatedContent = await generateCustomResume(jobDescription, resumeText);

        // Update session with generated content
        await db.collection("sessions").updateOne(
            { _id: new ObjectId(id) },
            {
                $set: {
                    generatedContent,
                    status: "completed",
                    updatedAt: new Date(),
                },
            }
        );

        return NextResponse.json({ success: true, content: generatedContent });

    } catch (error: any) {
        console.error("Error generating resume:", error);
        return NextResponse.json(
            { error: error.message || "Internal Server Error" },
            { status: 500 }
        );
    }
}
