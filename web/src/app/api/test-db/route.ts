
import { getDb } from "@/lib/mongodb";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const db = await getDb();
        await db.command({ ping: 1 });
        return NextResponse.json({ status: "success", message: "Successfully connected to MongoDB" });
    } catch (error) {
        console.error("MongoDB Connection Error:", error);
        return NextResponse.json({
            status: "error",
            message: error instanceof Error ? error.message : "Unknown error",
            details: String(error)
        }, { status: 500 });
    }
}
