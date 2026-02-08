import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    // This endpoint will eventually handle:
    // 1. OAuth callbacks for Gmail/Outlook
    // 2. Fetching emails
    // 3. Parsing emails with AI

    return NextResponse.json({
        message: "Email Integration API Endpoint",
        status: "Development",
        supported_providers: ["Gmail", "Outlook"]
    });
}
