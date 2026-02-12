import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);

export async function generateCustomResume(jobDescription: string, resumePdfBuffer: Buffer) {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
    You are an expert resume writer. 
    I will provide you with a Job Description and a candidate's Resume (in PDF format).
    
    Your task is to rewrite the resume to better match the Job Description, highlighting relevant skills and experiences.
    
    Output the result in Markdown format. 
    Focus on:
    - Tailoring the professional summary.
    - Reordering or emphasizing bullet points in work history that match the JD.
    - Highlighting matching skills.
    
    Job Description:
    ${jobDescription}
  `;

    const pdfPart = {
        inlineData: {
            data: resumePdfBuffer.toString("base64"),
            mimeType: "application/pdf",
        },
    };

    const result = await model.generateContent([prompt, pdfPart]);
    const response = await result.response;
    return response.text();
}
