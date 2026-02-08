
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import { getDb } from "@/lib/mongodb";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    const data = await req.json();
    const db = await getDb();

    // Validate critical fields if needed

    await db.collection("profiles").updateOne(
        // @ts-ignore
        { userId: session.user.id || session.user.email },
        {
            $set: {
                ...data,
                updatedAt: new Date(),
                // @ts-ignore
                userId: session.user.id || session.user.email,
                email: session.user.email,
                onboardingCompleted: true, // Mark as complete
            },
            $setOnInsert: {
                createdAt: new Date(),
            },
        },
        { upsert: true }
    );

    return NextResponse.json({ success: true });
}
