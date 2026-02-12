'use client';

import { FunnelIcon, ChevronDownIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { FilterState } from '@/app/dashboard/jobs/page';

interface JobsFilterBarProps {
    filters: FilterState;
    setFilters: (filters: FilterState) => void;
    onOpenAllFilters: () => void;
}

export default function JobsFilterBar({ filters, setFilters, onOpenAllFilters }: JobsFilterBarProps) {

    const handleFilterChange = (key: keyof FilterState, value: string) => {
        setFilters({ ...filters, [key]: value });
    };

    const clearFilter = (key: keyof FilterState) => {
        if (key === 'skills') {
            setFilters({ ...filters, skills: [] });
        } else {
            setFilters({ ...filters, [key]: '' });
        }
    };

    // Helper to render filter button
    const renderFilterButton = (label: string, key: keyof FilterState, options: string[]) => {
        const activeValue = filters[key as keyof FilterState] as string;
        const isActive = !!activeValue && activeValue !== 'Any' && key !== 'skills';

        return (
            <div className="relative group">
                <select
                    value={activeValue || ''}
                    onChange={(e) => handleFilterChange(key, e.target.value)}
                    className={`appearance-none cursor-pointer inline-flex items-center px-4 py-2 pr-8 border shadow-sm text-sm font-medium rounded-full transition-colors focus:ring-2 focus:ring-indigo-500 focus:outline-none ${isActive
                        ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                        : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                        }`}
                >
                    <option value="">{label}</option>
                    {options.map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                    ))}
                </select>
                <ChevronDownIcon className={`absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none ${isActive ? 'text-indigo-500' : 'text-gray-400'}`} />
            </div>
        );
    };

    return (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-4 bg-gray-50/95 backdrop-blur-sm sticky top-0 z-40 transition-all border-b border-gray-200/50 -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 mb-6">
            {/* Quick Filters */}
            <div className="flex flex-wrap items-center gap-2 flex-1">

                {/* Job Type */}
                {renderFilterButton("Job Type", "jobType", ["Full-time", "Contract", "Part-time", "Internship"])}

                {/* Work Model */}
                {renderFilterButton("Work Model", "workModel", ["Onsite", "Hybrid", "Remote"])}

                {/* Skills Display */}
                {filters.skills && filters.skills.length > 0 && (
                    <button
                        onClick={onOpenAllFilters}
                        className="inline-flex items-center px-3 py-2 border border-indigo-200 shadow-sm text-sm font-medium rounded-full text-indigo-700 bg-indigo-50 hover:bg-indigo-100 transition-colors"
                    >
                        Skills: {filters.skills.slice(0, 2).join(', ')}{filters.skills.length > 2 ? ` +${filters.skills.length - 2}` : ''}
                    </button>
                )}

                {/* All Filters Button */}
                <button
                    onClick={onOpenAllFilters}
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-full text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all ml-auto sm:ml-2"
                >
                    <FunnelIcon className="mr-2 h-4 w-4" />
                    All Filters
                </button>
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center">
                <div className="relative group">
                    <select
                        value={filters.sortBy || 'latest'}
                        onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                        className="appearance-none cursor-pointer inline-flex items-center px-4 py-2 pr-8 border shadow-sm text-sm font-medium rounded-full transition-colors focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
                    >
                        <option value="latest">Latest</option>
                        <option value="oldest">Oldest</option>
                        <option value="company_asc">Company (A-Z)</option>
                    </select>
                    <ChevronDownIcon className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                </div>
            </div>

        </div>
    );
}
