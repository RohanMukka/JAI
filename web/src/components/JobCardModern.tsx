'use client';

import { MapPinIcon, ClockIcon, BriefcaseIcon, BuildingOfficeIcon } from '@heroicons/react/24/outline';
import { JobCard } from '@/types/jsearch';

export default function JobCardModern({ job }: { job: JobCard }) {
    return (
        <div className="bg-white rounded-xl border border-gray-100 p-6 hover:shadow-lg transition-all duration-200 group relative overflow-hidden">
            <div className="flex items-start justify-between gap-4">
                <div className="flex gap-4">
                    {/* Logo / Icon */}
                    <div className="h-12 w-12 rounded-lg bg-indigo-50 flex items-center justify-center flex-shrink-0 border border-indigo-100 group-hover:bg-indigo-100 transition-colors">
                        {job.logo ? (
                            <img src={job.logo} alt={job.company} className="h-8 w-8 object-contain" />
                        ) : (
                            <BuildingOfficeIcon className="h-6 w-6 text-indigo-600" />
                        )}
                    </div>

                    <div>
                        <h3 className="text-lg font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">
                            {job.title}
                        </h3>
                        <p className="text-sm font-medium text-gray-500 mt-1">{job.company}</p>

                        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-3 text-sm text-gray-500">
                            <div className="flex items-center gap-1.5">
                                <MapPinIcon className="h-4 w-4" />
                                {job.location}
                            </div>
                            <div className="flex items-center gap-1.5">
                                <BriefcaseIcon className="h-4 w-4" />
                                {job.jobType || 'Full-time'}
                            </div>
                            <div className="flex items-center gap-1.5">
                                <ClockIcon className="h-4 w-4" />
                                <span className={job.postedAt?.includes('hour') || job.postedAt?.includes('minute') || job.postedAt?.includes('Just') ? 'text-green-600 font-medium' : ''}>
                                    {job.postedAt}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Apply / Action */}
                <div className="hidden sm:block">
                    <a
                        href={job.url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center rounded-full bg-white px-4 py-2 text-sm font-medium text-indigo-600 shadow-sm ring-1 ring-inset ring-indigo-200 hover:bg-indigo-50 transition-colors"
                    >
                        Apply Now
                    </a>
export default function JobCardModern({ job, disableLink = false }: { job: JobCard; disableLink?: boolean }) {
    const router = useRouter();

    const handleApplyWithAI = (e: React.MouseEvent) => {
        e.stopPropagation();
        router.push(`/dashboard/jobs/${encodeURIComponent(job.id)}`);
    };

    const handleCardClick = () => {
        if (!disableLink) {
            window.open(job.url, '_blank');
        }
    };

    const isValidDate = (dateStr: string) => {
        if (!dateStr || dateStr === '--') return false;
        const date = new Date(dateStr);
        return !isNaN(date.getTime()) && date.getFullYear() > 2000;
    };

    return (
        <div
            onClick={disableLink ? undefined : handleCardClick}
            className={`group relative flex flex-col items-start gap-3 p-4 bg-white border border-gray-200/60 rounded-xl shadow-[0_2px_4px_rgba(0,0,0,0.02)] transition-all duration-300 ${!disableLink ? 'hover:shadow-[0_8px_16px_rgba(0,0,0,0.04)] hover:border-indigo-500/30 cursor-pointer' : ''}`}
        >
            {/* Hover Glow Effect - Subtle */}
            {!disableLink && (
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-50/30 to-purple-50/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
            )}

            <div className="flex w-full items-start gap-4">
                {/* Logo */}
                <div className="relative z-10 flex-shrink-0 pt-1">
                    <div className="h-10 w-10 rounded-lg overflow-hidden border border-gray-100 bg-gray-50 flex items-center justify-center">
                        <img
                            src={job.logo || getLogoPlaceholder(job.company)}
                            alt={job.company}
                            className="h-full w-full object-cover"
                        />
                    </div>
                </div>

            {/* Description Snippet */}
            <p className="mt-4 text-sm text-gray-600 line-clamp-2 leading-relaxed">
                {job.descriptionSnippet}
            </p>

            {/* Tags / Skills */}
            {job.skills && job.skills.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2 pt-4 border-t border-gray-50">
                    {job.skills.slice(0, 5).map((skill) => (
                        <span key={skill} className="inline-flex items-center rounded-md bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10">
                            {skill}
                        </span>
                    ))}
                    {job.skills.length > 5 && (
                        <span className="inline-flex items-center rounded-md bg-gray-50 px-2 py-1 text-xs font-medium text-gray-500 ring-1 ring-inset ring-gray-500/10">
                            +{job.skills.length - 5}
                        </span>
                    )}
                </div>
            )}
                {/* Content Header */}
                <div className="relative z-10 flex-1 min-w-0 space-y-1">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                        <h3 className={`text-base font-semibold text-gray-900 line-clamp-1 ${!disableLink ? 'group-hover:text-indigo-600 transition-colors' : ''}`}>
                            {job.title}
                        </h3>
                        {/* Posted Date (Moved to top right for better hierarchy) */}
                        <span className="text-xs font-medium text-gray-400 whitespace-nowrap">
                            {isValidDate(job.postedAt) ? job.postedAt : ''}
                        </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-1.5 text-xs text-gray-600">
                        <span className="font-medium text-gray-900">{job.company}</span>
                        <span className="text-gray-300">•</span>
                        <span>{job.location}</span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 pt-1.5">
                        {job.remote && (
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-medium bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/10">
                                Remote
                            </span>
                        )}
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-medium bg-gray-50 text-gray-600 ring-1 ring-inset ring-gray-500/10">
                            Full-time
                        </span>
                        {job.experience && (
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-medium bg-indigo-50 text-indigo-700 ring-1 ring-inset ring-indigo-700/10">
                                {job.experience}
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {/* Description Snippet */}
            {job.descriptionSnippet && (
                <div className="relative z-10 w-full pl-[3.5rem] -mt-1">
                    <p className="text-xs text-gray-500 leading-relaxed line-clamp-2">
                        {job.descriptionSnippet}
                    </p>
                </div>
            )}

            {/* Actions */}
            <div className="relative z-10 w-full flex justify-end mt-1.5 pt-3 border-t border-gray-50">
                <button
                    onClick={handleApplyWithAI}
                    className="flex items-center justify-center px-6 py-2 bg-gray-900 hover:bg-gray-800 text-white text-sm font-medium rounded-lg shadow-sm transition-all duration-200 active:scale-95"
                >
                    <SparklesIcon className="h-4 w-4 mr-2 text-indigo-300" />
                    Apply with AI
                </button>
            </div>
        </div>
    );
}
