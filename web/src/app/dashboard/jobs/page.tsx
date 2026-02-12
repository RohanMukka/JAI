'use client';

import { useState, useCallback, useEffect, useMemo } from 'react';
import { JobCard } from '@/types/jsearch';
import { useRouter } from 'next/navigation';
import JobCardModern from '@/components/JobCardModern';
import JobsFilterBar from '@/components/JobsFilterBar';
import JobsFilterDrawer from '@/components/JobsFilterDrawer';
import {
    MagnifyingGlassIcon,
} from '@heroicons/react/24/outline';

export interface FilterState {
    query: string;
    location: string;
    role: string;
    experience: string;
    jobType: string;
    workModel: string;
    skills: string[];
    sortBy: 'latest' | 'oldest' | 'company_asc';
}

const INITIAL_FILTERS: FilterState = {
    query: '',
    location: '',
    role: '',
    experience: '',
    jobType: '',
    workModel: '',
    skills: ['Python', 'C', 'C++', 'React', 'SQL'], // Profile defaults
    sortBy: 'latest'
};

import { useAIAgent } from '@/context/AIAgentContext';

export default function JobsPage() {
    const [jobs, setJobs] = useState<JobCard[]>([]);
    const [loading, setLoading] = useState(false);
    const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);

    // Context for Skills
    const { userProfile } = useAIAgent();

    // Main Filter State
    const [filters, setFilters] = useState<FilterState>(INITIAL_FILTERS);

    // Sync Profile Skills to Filters on Mount
    useEffect(() => {
        if (userProfile?.skills?.length > 0) {
            setFilters(prev => ({ ...prev, skills: userProfile.skills }));
        }
    }, [userProfile?.skills]); // Only run if profile skills change (e.g. added from drawer)

    const fetchJobs = useCallback(async () => {
        setLoading(true);
        try {
            // In a real app, we might pass filters to the API. 
            // Here we fetch broadly and filter client-side for the demo to ensure all filters work perfectly.
            // We use 'Software Engineer' as a broad base search if query is empty.
            const q = filters.query || 'Software Engineer';
            const loc = filters.location === 'United States' ? 'USA' : filters.location; // Simple mapping

            let api = `/api/jobs?q=${encodeURIComponent(q)}&location=${encodeURIComponent(loc || 'USA')}&page=1`;
            const res = await fetch(api);
            const data = await res.json();

            if (data && data.data) {
                // DATA ENRICHMENT (MOCKING)
                // Since the API might not return all fields, we map them heuristically 
                // so the user can see filtering actually working.
                const enrichedJobs = data.data.map((job: JobCard, index: number) => {
                    if (!job.job_title && !job.title) return null; // Skip invalid jobs

                    const title = (job.job_title || job.title || '').toLowerCase();
                    const desc = (job.job_description || job.descriptionSnippet || '').toLowerCase();

                    // Mock Experience
                    let exp = 'Mid Level';
                    if (title.includes('senior') || title.includes('sr') || title.includes('lead')) exp = 'Senior';
                    if (title.includes('intern') || title.includes('grad')) exp = 'Intern';
                    if (title.includes('junior') || title.includes('entry')) exp = 'Entry Level';
                    if (title.includes('staff') || title.includes('principal')) exp = 'Staff';

                    // Mock Job Type
                    let type = 'Full-time';
                    if (title.includes('contract')) type = 'Contract';
                    if (title.includes('intern')) type = 'Internship';
                    if (title.includes('part-time')) type = 'Part-time';

                    // Mock Work Model
                    let model = job.remote ? 'Remote' : 'Onsite';
                    if (desc.includes('hybrid')) model = 'Hybrid';

                    // Mock Skills (Random subset of profile skills + common ones for demo variety)
                    const potentialSkills = ["Python", "React", "SQL", "JavaScript", "AWS", "Node.js", "Java", "C++"];
                    const jobSkills = potentialSkills.filter(() => Math.random() > 0.6); // Randomly assign skills

                    return {
                        ...job,
                        id: `${job.job_id || job.id || 'job'}-${index}`, // Unique ID for React Key
                        // Ensure we map API fields to our internal types if they differ
                        title: job.job_title || job.title || 'Untitled',
                        descriptionSnippet: job.job_description || job.descriptionSnippet || '',
                        experience: exp,
                        jobType: type,
                        workModel: model,
                        skills: jobSkills,
                        // Heuristic for role if not explicit
                        role: title.includes('backend') ? 'Backend Engineer' :
                            title.includes('frontend') ? 'Frontend Engineer' :
                                title.includes('data') ? 'Data Scientist' :
                                    title.includes('product') ? 'Product Manager' : 'Full Stack Engineer'
                    };
                }).filter(Boolean) as JobCard[];

                setJobs(enrichedJobs);
            } else {
                setJobs([]);
            }
        } catch (error) {
            console.error(error);
            setJobs([]);
        } finally {
            setLoading(false);
        }
    }, [filters.query]); // Re-fetch only when main search query changes, client filter otherwise

    // Auto-fetch on mount or query change
    useEffect(() => {
        fetchJobs();
    }, [fetchJobs]);

    // CLIENT-SIDE FILTERING & SORTING logic
    const filteredJobs = useMemo(() => {
        let result = [...jobs];

        // 1. Filter
        if (filters.location && filters.location !== 'United States') {
            const locFilter = filters.location.toLowerCase();
            result = result.filter(j => {
                const jobLoc = (j.location || '').toLowerCase();
                const isRemote = j.remote || jobLoc.includes('remote');

                if (locFilter === 'remote') return isRemote;
                return jobLoc.includes(locFilter) || (isRemote && locFilter === 'remote');
            });
        }

        if (filters.role) {
            const roleFilter = filters.role.toLowerCase().replace('engineer', '').replace('developer', '').trim();
            result = result.filter(j => {
                const jobRole = (j.role || j.title).toLowerCase();
                return jobRole.includes(roleFilter);
            });
        }

        if (filters.experience) {
            result = result.filter(j => j.experience === filters.experience);
        }

        if (filters.jobType) {
            result = result.filter(j => j.jobType === filters.jobType);
        }

        if (filters.workModel) {
            result = result.filter(j => j.workModel === filters.workModel);
        }

        if (filters.skills && filters.skills.length > 0) {
            // OR LOGIC: Show job if it has AT LEAST ONE of the selected skills.
            result = result.filter(j => {
                if (!j.skills || j.skills.length === 0) return true; // lenient if no skills data
                // Check if any of job skills is in selected filters (intersection > 0)
                return j.skills.some(s => filters.skills.includes(s));
            });
        }

        // 2. Sort
        result.sort((a, b) => {
            const getTimestamp = (dateStr: string) => {
                if (!dateStr) return 0;
                // Handle "2 days ago", "Just now", etc. (Mocking logic for demo)
                if (dateStr.toLowerCase().includes('just now')) return Date.now();
                if (dateStr.toLowerCase().includes('hour')) return Date.now() - 3600000;
                if (dateStr.toLowerCase().includes('day')) {
                    const days = parseInt(dateStr) || 1;
                    return Date.now() - (days * 86400000);
                }
                // Try parsing strict date
                const parsed = Date.parse(dateStr);
                return isNaN(parsed) ? 0 : parsed;
            };

            const timeA = getTimestamp(a.postedAt);
            const timeB = getTimestamp(b.postedAt);

            if (filters.sortBy === 'oldest') {
                return timeA - timeB;
            } else if (filters.sortBy === 'company_asc') {
                return a.company.localeCompare(b.company);
            } else {
                // Latest (default)
                return timeB - timeA;
            }
        });

        return result;
    }, [jobs, filters]);


    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        fetchJobs();
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Filter Drawer Overlay */}
            <JobsFilterDrawer
                isOpen={isFilterDrawerOpen}
                onClose={() => setIsFilterDrawerOpen(false)}
                filters={filters}
                setFilters={setFilters}
            />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
                            Find Your Next Role
                        </h1>
                        <p className="mt-2 text-lg text-gray-500">
                            Discover opportunities tailored to your skills.
                        </p>
                    </div>

                    {/* Search Bar */}
                    <form onSubmit={handleSearch} className="relative group w-full md:w-[480px]">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 group-focus-within:text-indigo-600 transition-colors" />
                        </div>
                        <input
                            type="text"
                            className="block w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-600 focus:border-transparent shadow-sm transition-all text-sm font-medium text-gray-900 placeholder-gray-400"
                            placeholder="Search by title, skill, or company..."
                            value={filters.query}
                            onChange={(e) => setFilters({ ...filters, query: e.target.value })}
                        />
                    </form>
                </div>

                {/* Filter Bar */}
                <JobsFilterBar
                    filters={filters}
                    setFilters={setFilters}
                    onOpenAllFilters={() => setIsFilterDrawerOpen(true)}
                />

                {/* Job List */}
                <div className="space-y-4 mt-6">
                    {loading ? (
                        <div className="space-y-4">
                            {[...Array(3)].map((_, i) => (
                                <div key={i} className="animate-pulse flex items-center p-6 bg-white rounded-2xl border border-gray-100 shadow-sm">
                                    <div className="h-14 w-14 bg-gray-200 rounded-xl mr-4"></div>
                                    <div className="flex-1 space-y-2">
                                        <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                                        <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : filteredJobs.length === 0 ? (
                        <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-200">
                            <MagnifyingGlassIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900">No jobs found</h3>
                            <p className="text-gray-500 mt-1">Try adjusting your search or filters.</p>
                            <button
                                onClick={() => setFilters(INITIAL_FILTERS)}
                                className="mt-4 text-indigo-600 font-medium hover:text-indigo-500"
                            >
                                Clear all filters
                            </button>
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
                        </div>
                    )}

                    {/* Pagination (Visual only for demo as client filter handles current view) */}
                    {filteredJobs.length > 0 && (
                        <div className="flex justify-center items-center gap-4 mt-10">
                            <p className="text-sm text-gray-500">Showing {filteredJobs.length} results</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
