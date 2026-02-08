
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import { getDb } from "@/lib/mongodb";
import { NextResponse } from "next/server";

export async function GET() {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    const db = await getDb();
    // @ts-ignore
    const profile = await db.collection("profiles").findOne({ userId: session.user.id || session.user.email });

    return NextResponse.json(profile || {});
}

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    const data = await req.json();
    const db = await getDb();

    await db.collection("profiles").updateOne(
        // @ts-ignore
        { userId: session.user.id || session.user.email },
        {
            $set: {
                ...data,
                updatedAt: new Date(),
                // @ts-ignore
                userId: session.user.id || session.user.email, // Ensure userId is set
                email: session.user.email
            },
            $setOnInsert: {
                createdAt: new Date(),
            },
        },
        { upsert: true }
    );

    return NextResponse.json({ success: true });
}
