'use client';

import { useState, useCallback, useEffect } from 'react';
import { JobCard } from '@/types/jsearch';
import { useRouter } from 'next/navigation';
import JobCardModern from '@/components/JobCardModern';
import {
    MagnifyingGlassIcon,
    AdjustmentsHorizontalIcon,
    MapPinIcon
} from '@heroicons/react/24/outline';

const PRESETS = [
    { label: 'Software Engineer', query: 'Software Engineer', location: 'United States' },
    { label: 'Full Stack', query: 'Full Stack Developer', location: 'United States' },
    { label: 'Data Scientist', query: 'Data Scientist', location: 'United States' },
    { label: 'Product Manager', query: 'Product Manager', location: 'United States' },
];

export default function JobsPage() {
    const [jobs, setJobs] = useState<JobCard[]>([]);
    const [loading, setLoading] = useState(false);

    // Search State
    const [query, setQuery] = useState('');
    const [location, setLocation] = useState('United States');
    const [page, setPage] = useState(1);
    const [searched, setSearched] = useState(false);

    const fetchJobs = useCallback(async (q: string, loc: string, pageNum = 1) => {
        setLoading(true);
        setSearched(true);
        setPage(pageNum);
        try {
            // Construct API URL
            let api = `/api/jobs?q=${encodeURIComponent(q)}&location=${encodeURIComponent(loc)}&page=${pageNum}`;
            const res = await fetch(api);
            const data = await res.json();

            if (data && data.data) {
                console.log("Jobs Received:", data.data); // DEBUG
                setJobs(data.data);
            } else {
                setJobs([]);
            }
        } catch (error) {
            console.error(error);
            setJobs([]);
        } finally {
            setLoading(false);
        }
    }, []);

    // Auto-fetch on mount
    useEffect(() => {
        fetchJobs('Software Engineer', 'United States', 1);
    }, [fetchJobs]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        fetchJobs(query, location);
    };

    const handlePreset = (p: typeof PRESETS[0]) => {
        setQuery(p.query);
        setLocation(p.location);
        fetchJobs(p.query, p.location);
    };

    return (
        <div className="relative min-h-screen bg-gray-50/50 pb-20 overflow-hidden">
            {/* Background Blobs (Glass Effect Support) */}
            <div className="fixed top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-200/30 rounded-full blur-[100px] animate-pulse" />
                <div className="absolute top-[20%] right-[-10%] w-[30%] h-[30%] bg-blue-200/30 rounded-full blur-[100px] animate-pulse delay-1000" />
                <div className="absolute bottom-[-10%] left-[20%] w-[30%] h-[30%] bg-indigo-200/30 rounded-full blur-[100px] animate-pulse delay-2000" />
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600">
                            Find Your Next Role
                        </h1>
                        <p className="mt-1 text-gray-500">
                            Discover opportunities tailored to your skills.
                        </p>
                    </div>

                    {/* Search Bar (Glassy) */}
                    <form onSubmit={handleSearch} className="relative group w-full md:w-96">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                        </div>
                        <input
                            type="text"
                            className="block w-full pl-10 pr-3 py-2.5 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm transition-all text-sm text-gray-900 placeholder-gray-500"
                            placeholder="Search by title, skill, or company..."
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                        />
                    </form>
                </div>

                {/* Tabs and Filters Removed as per user request */}

                {/* Job List */}
                <div className="space-y-4">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20">
                            <div className="relative w-16 h-16">
                                <div className="absolute top-0 left-0 w-full h-full border-4 border-indigo-200 rounded-full animate-ping opacity-75"></div>
                                <div className="absolute top-0 left-0 w-full h-full border-4 border-t-indigo-600 rounded-full animate-spin"></div>
                            </div>
                            <p className="mt-4 text-gray-500 font-medium animate-pulse">Finding best matches...</p>
                        </div>
                    ) : searched && jobs.length === 0 ? (
                        <div className="text-center py-20 bg-white/50 backdrop-blur-sm rounded-3xl border border-dashed border-gray-300">
                            <MagnifyingGlassIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900">No jobs found</h3>
                            <p className="text-gray-500 mt-1">Try adjusting your filters or search query.</p>
                        </div>
                    ) : (
                        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
                            {/* Hardcoded IXL Job */}
                            <JobCardModern job={{
                                id: 'ixl-new-grad-1',
                                title: 'Software Engineer, New Grad',
                                company: 'IXL Learning',
                                location: 'Raleigh, NC',
                                remote: false,
                                descriptionSnippet: 'IXL Learning is seeking new graduates who have a passion for technology and education to join our team.',
                                url: 'https://www.ixl.com/company/careers/apply?gh_jid=8364780002&gh_src=9ab9c2a12',
                                postedAt: 'Today', 
                                source: 'jsearch',
                                logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/63/IXL_Learning_logo.svg/1200px-IXL_Learning_logo.svg.png'
                            }} />

                            {jobs.map((job) => (
                                <JobCardModern key={job.id} job={job} disableLink={true} />
                            ))}
                            {!searched && (
                                <div className="text-center py-20">
                                    <div className="bg-indigo-50/50 backdrop-blur-sm rounded-3xl p-8 inline-block">
                                        <h3 className="text-lg font-bold text-indigo-900">Ready to explore?</h3>
                                        <p className="text-indigo-700 mt-2">Select a preset or search to view top-tier opportunities.</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Pagination */}
                    {jobs.length > 0 && (
                        <div className="flex justify-center items-center gap-4 mt-8 pt-4 border-t border-gray-200">
                            <button
                                onClick={() => fetchJobs(query || 'Software Engineer', location, page - 1)}
                                disabled={page <= 1 || loading}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Previous
                            </button>
                            <span className="text-sm text-gray-600 font-medium">Page {page}</span>
                            <button
                                onClick={() => fetchJobs(query || 'Software Engineer', location, page + 1)}
                                disabled={loading}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Next
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
