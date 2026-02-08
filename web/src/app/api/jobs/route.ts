import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { JSearchResponse, JobCard } from '@/types/jsearch';
import crypto from 'crypto';

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const q = searchParams.get('q');
    const location = searchParams.get('location') || 'United States'; // Default location
    const page = searchParams.get('page') || '1';
    const remoteOnly = searchParams.get('remoteOnly') === 'true';

    // Strictly enforce click-to-search to save tokens
    if (!q) {
        return NextResponse.json({ data: [] }); // Return empty if no query
    }

    // Cache Key
    const cacheKey = crypto.createHash('md5').update(JSON.stringify({ q, location, page, remoteOnly })).digest('hex');

    try {
        const db = await getDb();
        const cacheCollection = db.collection('jobs_cache');

        // 1. Check Cache
        const cached = await cacheCollection.findOne({ key: cacheKey });

        // TTL Check (if not using Mongo TTL index)
        if (cached && cached.expiresAt > new Date()) {
            console.log(`[CACHE HIT] ${q} ${page}`);
            return NextResponse.json(cached.payload);
        }

        // 2. Fetch from JSearch
        console.log(`[API CALL] JSearch: ${q} ${page}`);

        // Construct query: "Software Engineer in Texas"
        const query = `${q} in ${location}`;

        const res = await fetch(`https://${process.env.RAPIDAPI_HOST}/search?query=${encodeURIComponent(query)}&page=${page}&num_pages=1`, {
            headers: {
                'X-RapidAPI-Key': process.env.RAPIDAPI_KEY!,
                'X-RapidAPI-Host': process.env.RAPIDAPI_HOST!,
            },
        });

        if (!res.ok) {
            throw new Error(`JSearch API error: ${res.statusText}`);
        }

        const data: JSearchResponse = await res.json();

        // 3. Normalize Data
        const normalizedJobs: JobCard[] = data.data.map((job) => ({
            id: job.job_id,
            title: job.job_title,
            company: job.employer_name,
            location: [job.job_city, job.job_state, job.job_country].filter(Boolean).join(', '),
            remote: job.job_is_remote,
            descriptionSnippet: job.job_description ? job.job_description.substring(0, 200) + '...' : '',
            url: job.job_apply_link,
            postedAt: new Date(job.job_posted_at_timestamp * 1000).toLocaleDateString(),
            source: 'jsearch',
            logo: job.employer_logo
        }));

        // Filter remote if requested (API filter sometimes unreliable, good to double check)
        const filteredJobs = remoteOnly ? normalizedJobs.filter(j => j.remote) : normalizedJobs;

        const payload = { data: filteredJobs };

        // 4. Store in Cache (TTL 24h)
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + 24);

        await cacheCollection.updateOne(
            { key: cacheKey },
            { $set: { key: cacheKey, payload, createdAt: new Date(), expiresAt } },
            { upsert: true }
        );

        return NextResponse.json(payload);
    } catch (error) {
        console.error('Error fetching jobs:', error);
        return NextResponse.json({ error: 'Failed to fetch jobs' }, { status: 500 });
    }
}
