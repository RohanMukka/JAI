
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || 'Software Engineer';
    const location = searchParams.get('location') || 'USA'; // Default to broader locale if empty
    const page = searchParams.get('page') || '1';

    // RapidAPI Key from env
    const rapidApiKey = process.env.RAPIDAPI_KEY;

    console.log("RAPIDAPI_KEY present:", !!rapidApiKey);
    console.log("Query:", query, "Location:", location);

    if (!rapidApiKey) {
        console.error("RAPIDAPI_KEY is missing");
        return NextResponse.json({ error: 'RapidAPI Key not configured' }, { status: 500 });
    }

    const url = `https://jsearch.p.rapidapi.com/search?query=${encodeURIComponent(`${query} in ${location}`)}&page=${page}&num_pages=1`;

    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'X-RapidAPI-Key': rapidApiKey,
                'X-RapidAPI-Host': 'jsearch.p.rapidapi.com'
            }
        });

        if (!response.ok) {
            throw new Error(`JSearch API error: ${response.statusText}`);
        }

        const data = await response.json();
        return NextResponse.json(data);

    } catch (error) {
        console.error('JSearch fetch error:', error);
        return NextResponse.json({ error: 'Failed to fetch jobs' }, { status: 500 });
    }
}
