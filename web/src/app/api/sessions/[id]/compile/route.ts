
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getDb } from "@/lib/mongodb";
import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";

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

        if (!sessionDoc.generatedContent) {
            return NextResponse.json(
                { error: "No generated content. Run /generate first." },
                { status: 400 }
            );
        }

        // For now, compilation returns the generated content directly.
        // LaTeX compilation is handled on the client side via Overleaf integration.
        // This endpoint marks the session as compiled and returns the content.
        await db.collection("sessions").updateOne(
            { _id: new ObjectId(id) },
            {
                $set: {
                    status: "compiled",
                    updatedAt: new Date(),
                },
            }
        );

        return NextResponse.json({
            success: true,
            content: sessionDoc.generatedContent,
            message: "Content ready. Use Overleaf or the Chrome extension for PDF compilation.",
        });

    } catch (error: any) {
        console.error("Error compiling session:", error);
        return NextResponse.json(
            { error: error.message || "Internal Server Error" },
            { status: 500 }
        );
    }
}
