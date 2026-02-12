
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
            postedAt: (job.job_posted_at_timestamp && job.job_posted_at_timestamp > 946684800)
                ? new Date(job.job_posted_at_timestamp * 1000).toLocaleDateString()
                : '--',
            source: 'jsearch',
            logo: job.employer_logo,
            experience: job.job_required_experience?.required_experience_in_months
                ? (job.job_required_experience.required_experience_in_months <= 24 ? "Entry Level"
                    : job.job_required_experience.required_experience_in_months <= 60 ? "Mid Level"
                        : "Senior Level")
                : (job.job_required_experience?.no_experience_required ? "Entry Level" : undefined)
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

    } catch (error) {
        console.error('JSearch fetch error:', error);
        return NextResponse.json({ error: 'Failed to fetch jobs' }, { status: 500 });
    }
}
