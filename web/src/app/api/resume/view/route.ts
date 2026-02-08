
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getDb } from "@/lib/mongodb";

export async function GET(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    const db = await getDb();
    // @ts-ignore
    const userId = session.user.id || session.user.email;

    const profile = await db.collection("profiles").findOne({ userId });

    if (!profile || !profile.resumePdfData) {
        return new NextResponse("Resume not found", { status: 404 });
    }

    // resumePdfData is stored as Binary in MongoDB
    const buffer = profile.resumePdfData.buffer;

    return new NextResponse(buffer, {
        headers: {
            "Content-Type": "application/pdf",
            "Content-Disposition": `inline; filename="${profile.resumePdfName || 'resume.pdf'}"`,
        },
    });
}
