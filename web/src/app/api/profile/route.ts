
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
    // Try finding by userId first, then email (legacy)
    // @ts-ignore
    const query = { $or: [{ userId: session.user.id }, { email: session.user.email }] };
    const profile = await db.collection("profiles").findOne(query);

    return NextResponse.json(profile || {});
}

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    const data = await req.json();
    const db = await getDb();

    // Strip _id if present to avoid immutable field error
    const { _id, ...updateData } = data;

    await db.collection("profiles").updateOne(
        // @ts-ignore
        { userId: session.user.id || session.user.email },
        {
            $set: {
                ...updateData,
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
