
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:8000";

export async function POST(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    const { id } = await params;

    // Trigger backend compilation logic
    // This assumes the backend has an endpoint POST /sessions/{id}/compile
    try {
        const backendRes = await fetch(`${BACKEND_URL}/sessions/${id}/compile`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
        });

        if (!backendRes.ok) {
            console.error("Backend compilation failed", await backendRes.text());
            return new NextResponse("Backend compilation failed", { status: 500 });
        }

        const data = await backendRes.json();
        // Expected to return { pdfUrl: "..." } or similar
        return NextResponse.json(data);

    } catch (error) {
        console.error("Error calling backend:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}
