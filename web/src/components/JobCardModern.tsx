'use client';

import { JobCard } from '@/types/jsearch';
import { useRouter } from 'next/navigation';
import {
    MapPinIcon,
    BuildingOfficeIcon,
    ClockIcon,
    SparklesIcon
} from '@heroicons/react/24/outline';

const getLogoPlaceholder = (company: string) => {
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(company)}&background=random&color=fff&size=128`;
};

export default function JobCardModern({ job }: { job: JobCard }) {
    const router = useRouter();

    const handleApplyWithAI = (e: React.MouseEvent) => {
        e.stopPropagation();
        // Updated: Navigate to the new Job Details page
        router.push(`/dashboard/jobs/${encodeURIComponent(job.id)}`);
    };

    const handleCardClick = () => {
        window.open(job.url, '_blank');
    };

    return (
        <div
            onClick={handleCardClick}
            className="group relative flex flex-col sm:flex-row items-start sm:items-center gap-4 p-5 bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer overflow-hidden border-l-4 border-l-transparent hover:border-l-indigo-500"
        >
            {/* Hover Glow Effect - Subtle */}
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-50/30 to-purple-50/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

            {/* Logo */}
            <div className="relative z-10 flex-shrink-0">
                <div className="h-14 w-14 rounded-xl overflow-hidden shadow-sm border border-gray-100 bg-white flex items-center justify-center">
                    <img
                        src={job.logo || getLogoPlaceholder(job.company)}
                        alt={job.company}
                        className="h-full w-full object-cover"
                    />
                </div>
            </div>

            {/* Content */}
            <div className="relative z-10 flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                    <h3 className="text-lg font-bold text-gray-900 group-hover:text-indigo-600 transition-colors line-clamp-1">
                        {job.title}
                    </h3>
                    {job.remote && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-100">
                            Remote
                        </span>
                    )}
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
                        Full-time
                    </span>
                </div>

                <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-sm text-gray-500 font-medium">
                    <div className="flex items-center">
                        <BuildingOfficeIcon className="h-4 w-4 mr-1.5 text-gray-400" />
                        {job.company}
                    </div>
                    <div className="flex items-center">
                        <MapPinIcon className="h-4 w-4 mr-1.5 text-gray-400" />
                        {job.location}
                    </div>
                    <div className="flex items-center">
                        <ClockIcon className="h-4 w-4 mr-1.5 text-gray-400" />
                        Posted {job.postedAt}
                    </div>
                </div>
            </div>

            {/* Actions */}
            <div className="relative z-10 flex-shrink-0 flex flex-col sm:items-end gap-3 mt-4 sm:mt-0 w-full sm:w-auto">
                <button
                    onClick={handleApplyWithAI}
                    className="flex items-center justify-center w-full sm:w-auto px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white text-sm font-semibold rounded-xl shadow-lg shadow-indigo-200 transform transition-all duration-200 active:scale-95 group-hover:shadow-indigo-300"
                >
                    <SparklesIcon className="h-4 w-4 mr-2" />
                    Apply with AI
                </button>
            </div>
        </div>
    );
}
