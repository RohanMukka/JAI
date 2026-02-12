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
        </div>
    );
}
