import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import PDFParser from "pdf2json";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getDb } from "@/lib/mongodb";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Save PDF to MongoDB (linked to user)
    const db = await getDb();
    // @ts-ignore
    const userId = session.user.id || session.user.email;

    await db.collection("profiles").updateOne(
      { userId },
      {
        $set: {
          resumePdfName: file.name,
          resumePdfType: file.type,
          resumePdfData: buffer, // Store binary
          updatedAt: new Date()
        }
      },
      { upsert: true }
    );
    console.log("PDF saved to MongoDB for user:", userId);

    return NextResponse.json({ success: true, message: "Resume uploaded successfully" });

  } catch (error) {
    console.error("Resume upload error:", error);
    return NextResponse.json({ error: "Failed to upload resume" }, { status: 500 });
  }
}
