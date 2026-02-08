
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import { getDb } from "@/lib/mongodb";
import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";

export async function GET() {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    const db = await getDb();
    // @ts-ignore
    const sessions = await db.collection("sessions")
        // @ts-ignore
        .find({ userId: session.user.id || session.user.email })
        .sort({ createdAt: -1 })
        .toArray();

    return NextResponse.json(sessions);
}

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    const data = await req.json();
    const db = await getDb();

    const newSession = {
        ...data,
        // @ts-ignore
        userId: session.user.id || session.user.email,
        status: 'created', // created, generating, completd, failed
        createdAt: new Date(),
        updatedAt: new Date(),
    };

    const result = await db.collection("sessions").insertOne(newSession);

    return NextResponse.json({ success: true, id: result.insertedId });
}
