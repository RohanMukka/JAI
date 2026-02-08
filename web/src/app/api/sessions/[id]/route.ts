
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getDb } from "@/lib/mongodb";
import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";

export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> } // params is a Promise in Next.js 15+
) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    const { id } = await params;
    const db = await getDb();

    // @ts-ignore
    const sessionData = await db.collection("sessions").findOne({
        _id: new ObjectId(id),
        // @ts-ignore
        userId: session.user.id || session.user.email,
    });

    if (!sessionData) {
        return new NextResponse("Session not found", { status: 404 });
    }

    return NextResponse.json(sessionData);
}

export async function PUT(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    const { id } = await params;
    const data = await req.json();
    const db = await getDb();

    // @ts-ignore
    const result = await db.collection("sessions").updateOne(
        {
            _id: new ObjectId(id),
            // @ts-ignore
            userId: session.user.id || session.user.email,
        },
        {
            $set: {
                ...data,
                updatedAt: new Date(),
            },
        }
    );

    if (result.matchedCount === 0) {
        return new NextResponse("Session not found", { status: 404 });
    }

    return NextResponse.json({ success: true });
}
