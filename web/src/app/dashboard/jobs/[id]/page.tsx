'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { JSearchJob } from '@/types/jsearch';
import {
    BuildingOfficeIcon,
    MapPinIcon,
    CalendarIcon,
    LinkIcon,
    ArrowLeftIcon,
    SparklesIcon
} from '@heroicons/react/24/outline';

const getLogoPlaceholder = (company: string) => {
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(company)}&background=random&color=fff&size=128`;
};

export default function JobDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const id = params.id as string;

    const [job, setJob] = useState<JSearchJob | null>(null);
    const [loading, setLoading] = useState(true);
    const [generatingResume, setGeneratingResume] = useState(false);
    const [customResume, setCustomResume] = useState<string | null>(null);

    useEffect(() => {
        const fetchJobDetails = async () => {
            try {
                // Pass encoded ID to avoid path parsing issues with Base64 '=='
                const res = await fetch(`/api/jobs/${encodeURIComponent(id)}`);
                const data = await res.json();

                if (data.data) {
                    // Check if it's an array (JSearch typical) or object (our API proxy normalization)
                    if (Array.isArray(data.data)) {
                        setJob(data.data[0]);
                    } else {
                        setJob(data.data);
                    }
                }
            } catch (error) {
                console.error("Failed to fetch job", error);
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchJobDetails();
        }
    }, [id]);

    const handleGenerateResume = async () => {
        if (!job) return;
        setGeneratingResume(true);
        try {
            const res = await fetch('/api/resume/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    jobId: job.job_id,
                    jobDescription: job.job_description
                }),
            });
            const data = await res.json();

            if (res.ok) {
                setCustomResume(data.resume);
            } else {
                alert(data.error || "Failed to generate resume");
            }
        } catch (error) {
            console.error(error);
            alert("An error occurred");
        } finally {
            setGeneratingResume(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    if (!job) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
                <h2 className="text-xl font-semibold text-gray-900">Job not found</h2>
                <button onClick={() => router.back()} className="mt-4 text-indigo-600 hover:text-indigo-800">
                    Go back
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-5xl mx-auto">
                {/* Back Link */}
                <button
                    onClick={() => router.back()}
                    className="flex items-center text-sm text-gray-500 hover:text-gray-900 mb-6 transition-colors"
                >
                    <ArrowLeftIcon className="h-4 w-4 mr-1" />
                    Back to Jobs
                </button>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content: Job Description */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Header Card */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
                            <div className="flex items-start gap-6">
                                <div className="h-20 w-20 rounded-xl overflow-hidden border border-gray-100 shadow-sm flex-shrink-0 bg-white">
                                    <img
                                        src={job.employer_logo || getLogoPlaceholder(job.employer_name)}
                                        alt={job.employer_name}
                                        className="h-full w-full object-contain p-2"
                                    />
                                </div>
                                <div className="flex-1">
                                    <h1 className="text-2xl font-bold text-gray-900">{job.job_title}</h1>
                                    <div className="flex flex-wrap gap-y-2 gap-x-4 mt-2 text-sm text-gray-600">
                                        <div className="flex items-center">
                                            <BuildingOfficeIcon className="h-4 w-4 mr-1.5 text-gray-400" />
                                            {job.employer_name}
                                        </div>
                                        <div className="flex items-center">
                                            <MapPinIcon className="h-4 w-4 mr-1.5 text-gray-400" />
                                            {job.job_city}, {job.job_country}
                                        </div>
                                        {job.job_is_remote && (
                                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-50 text-green-700 border border-green-100">
                                                Remote
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Description Card */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
                            <h2 className="text-lg font-bold text-gray-900 mb-4">Job Description</h2>
                            <div className="prose prose-sm prose-indigo max-w-none text-gray-600 whitespace-pre-wrap">
                                {job.job_description}
                            </div>
                        </div>
                    </div>

                    {/* Sidebar: Actions */}
                    <div className="space-y-6">
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sticky top-8">
                            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">
                                Actions
                            </h3>

                            <div className="space-y-3">
                                <button
                                    onClick={handleGenerateResume}
                                    disabled={generatingResume}
                                    className="w-full flex items-center justify-center px-4 py-3 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white rounded-xl shadow-lg shadow-indigo-200 transition-all transform active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
                                >
                                    {generatingResume ? (
                                        <>
                                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Generating...
                                        </>
                                    ) : (
                                        <>
                                            <SparklesIcon className="h-5 w-5 mr-2" />
                                            Generate Custom Resume
                                        </>
                                    )}
                                </button>

                                <a
                                    href={job.job_apply_link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-full flex items-center justify-center px-4 py-3 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
                                >
                                    <LinkIcon className="h-5 w-5 mr-2" />
                                    Original Job Post
                                </a>
                            </div>

                            {/* Resume Result (Preview) */}
                            {customResume && (
                                <div className="mt-6 pt-6 border-t border-gray-100">
                                    <div className="flex items-center justify-between mb-2">
                                        <h4 className="text-sm font-semibold text-green-700 flex items-center">
                                            <SparklesIcon className="h-4 w-4 mr-1" />
                                            Resume Generated!
                                        </h4>
                                    </div>
                                    <div className="bg-gray-50 rounded-lg p-3 text-xs text-gray-500 max-h-40 overflow-y-auto mb-3 border border-gray-200">
                                        {customResume.substring(0, 150)}...
                                    </div>
                                    <button
                                        onClick={() => {
                                            const blob = new Blob([customResume], { type: 'text/markdown' });
                                            const url = window.URL.createObjectURL(blob);
                                            const a = document.createElement('a');
                                            a.href = url;
                                            a.download = `Resume-${job.employer_name}.md`; // Simple MD download for now
                                            a.click();
                                        }}
                                        className="w-full text-xs text-indigo-600 hover:text-indigo-800 font-medium text-center"
                                    >
                                        Download Markdown
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
