import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import PDFParser from "pdf2json";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getDb } from "@/lib/mongodb";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);

export async function POST(req: NextRequest) {
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

    // Extract text from PDF using pdf2json
    const text = await new Promise<string>((resolve, reject) => {
      const pdfParser = new PDFParser(null, 1); // 1 = text only

      pdfParser.on("pdfParser_dataError", (errData) => reject(errData.parserError));

      pdfParser.on("pdfParser_dataReady", () => {
        // getRawTextContent() is simpler but sometimes messy. 
        // We can also let Gemini handle the cleaning.
        resolve(pdfParser.getRawTextContent());
      });

      pdfParser.parseBuffer(buffer);
    });

    // Use Gemini to extract structured data
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const prompt = `
      Extract the following information from the resume text below and return it as a JSON object. 
      Do not include markdown formatting or backticks. Just the raw JSON.
      
      Schema:
      {
        "firstName": string,
        "lastName": string,
        "email": string,
        "phone": string,
        "location": string,
        "linkedin": string,
        "github": string,
        "portfolio": string,
        "education": [
          { "school": string, "degree": string, "startDate": string (YYYY-MM-DD or YYYY), "endDate": string (YYYY-MM-DD or YYYY or "Present") }
        ],
        "experience": [
          { "company": string, "role": string, "startDate": string (YYYY-MM-DD), "endDate": string (YYYY-MM-DD or "Present" or "Current"), "description": string (summary of responsibilities), "current": boolean }
        ],
        "skills": string (comma separated list),
      }

      Resume Text:
      ${text.substring(0, 30000)} // Limit context window if needed
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let jsonString = response.text();

    // Clean up markdown code blocks if Gemini includes them
    jsonString = jsonString.replace(/```json/g, "").replace(/```/g, "").trim();

    const structuredData = JSON.parse(jsonString);

    return NextResponse.json({ text, structuredData });

  } catch (error) {
    console.error("Resume parsing error:", error);
    return NextResponse.json({ error: "Failed to parse resume" }, { status: 500 });
  }
}
