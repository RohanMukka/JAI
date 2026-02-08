const https = require('https');

// Hardcoded for debug (avoiding dotenv dependency)
const RAPIDAPI_KEY = '8e94350ea3mshb33a585742d3877p1fbeb0jsn9de566390bc6';
const RAPIDAPI_HOST = 'jsearch.p.rapidapi.com';

const jobId = 'u72KdRaqhQ15ubAyAAAAAA==';
// We want to test exactly what we're sending.
// In the API route we do: encodeURIComponent(jobId)
const encodedId = encodeURIComponent(jobId);

console.log(`Testing JSearch/job-details with ID: ${jobId}`);
console.log(`Encoded ID: ${encodedId}`);

const options = {
    method: 'GET',
    hostname: RAPIDAPI_HOST,
    port: null,
    path: `/job-details?job_id=${encodedId}`,
    headers: {
        'X-RapidAPI-Key': RAPIDAPI_KEY,
        'X-RapidAPI-Host': RAPIDAPI_HOST
    }
};

const req = https.request(options, function (res) {
    const chunks = [];

    res.on('data', function (chunk) {
        chunks.push(chunk);
    });

    res.on('end', function () {
        const body = Buffer.concat(chunks);
        console.log('Status Code:', res.statusCode);
        console.log('Body:', body.toString());
    });
});

req.end();
