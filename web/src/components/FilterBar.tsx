import { FunnelIcon, ChevronDownIcon } from '@heroicons/react/24/outline';

interface FilterBarProps {
    onOpenAllFilters: () => void;
}

export default function FilterBar({ onOpenAllFilters }: FilterBarProps) {
    return (
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            {/* Quick Filters */}
            <div className="flex flex-wrap items-center gap-2 flex-1">
                <button className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-full text-gray-700 bg-white hover:bg-gray-50">
                    United States
                    <ChevronDownIcon className="ml-1.5 h-4 w-4 text-gray-400" />
                </button>
                <button className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-full text-gray-700 bg-white hover:bg-gray-50">
                    Backend Engineer <span className="ml-1 bg-green-100 text-green-800 py-0.5 px-2 rounded-full text-xs">+30</span>
                    <ChevronDownIcon className="ml-1.5 h-4 w-4 text-gray-400" />
                </button>
                <button className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-full text-gray-700 bg-white hover:bg-gray-50">
                    Intern/New Grad <span className="ml-1 bg-green-100 text-green-800 py-0.5 px-2 rounded-full text-xs">+1</span>
                    <ChevronDownIcon className="ml-1.5 h-4 w-4 text-gray-400" />
                </button>
                <button className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-full text-gray-700 bg-white hover:bg-gray-50">
                    Full-time
                    <ChevronDownIcon className="ml-1.5 h-4 w-4 text-gray-400" />
                </button>

                <button
                    onClick={onOpenAllFilters}
                    className="inline-flex items-center px-4 py-1.5 border border-transparent shadow-sm text-sm font-medium rounded-full text-white bg-green-500 hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                    <FunnelIcon className="mr-1.5 h-4 w-4" />
                    All Filters
                </button>
            </div>

            {/* Sort / Recommended */}
            <div className="flex items-center">
                <button className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                    Recommended
                    <ChevronDownIcon className="ml-1.5 h-4 w-4 text-gray-400" />
                </button>
            </div>
        </div>
    );
}
