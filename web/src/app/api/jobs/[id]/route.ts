import { NextRequest, NextResponse } from 'next/server';
import { JSearchResponse, JSearchJob } from '@/types/jsearch';

export async function GET(
    request: NextRequest,
    context: { params: Promise<{ id: string }> } // Correct type for Next.js 15+ App Router params
) {
    const { id } = await context.params;

    if (!id) {
        return NextResponse.json({ error: 'Job ID is required' }, { status: 400 });
    }

    try {
        // Decode first to ensure we have the raw ID (e.g. ending in ==)
        const rawId = decodeURIComponent(id);
        console.log(`[API] Fetching Job Details for Raw ID: ${rawId}`);

        // Re-encode for the JSearch query param
        const encodedId = encodeURIComponent(rawId);

        const res = await fetch(`https://${process.env.RAPIDAPI_HOST}/job-details?job_id=${encodedId}`, {
            headers: {
                'X-RapidAPI-Key': process.env.RAPIDAPI_KEY!,
                'X-RapidAPI-Host': process.env.RAPIDAPI_HOST!,
            },
        });

        console.log(`[API] JSearch Status: ${res.status}`);

        if (!res.ok) {
            const txt = await res.text();
            console.error(`[API] JSearch Error Body: ${txt}`);
            throw new Error(`JSearch API error: ${res.statusText}`);
        }

        const data: JSearchResponse = await res.json();
        console.log(`[API] JSearch Data Length: ${data.data?.length}`);

        if (!data.data || data.data.length === 0) {
            return NextResponse.json({ error: 'Job not found' }, { status: 404 });
        }

        const job: JSearchJob = data.data[0];

        // Normalize specific fields if needed, or return raw JSearchJob
        return NextResponse.json({ data: job });

    } catch (error) {
        console.error('Error fetching job details:', error);
        return NextResponse.json({ error: 'Failed to fetch job details' }, { status: 500 });
    }
}
