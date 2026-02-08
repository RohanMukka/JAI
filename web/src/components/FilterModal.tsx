import { XMarkIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';

interface FilterModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function FilterModal({ isOpen, onClose }: FilterModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 overflow-hidden z-50">
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose} />

                <div className="fixed inset-y-0 right-0 max-w-full flex">
                    <div className="w-screen max-w-md pointer-events-auto"> {/* Adjusted width roughly to look like drawer */}
                        <div className="h-full flex flex-col bg-white shadow-xl overflow-y-scroll">

                            {/* Header */}
                            <div className="px-4 py-6 sm:px-6 bg-white border-b border-gray-200 sticky top-0 z-10 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <h2 className="text-lg font-medium text-gray-900">Filters</h2>
                                    <span className="bg-black text-white text-xs font-bold px-2 py-0.5 rounded-full">43</span>
                                </div>

                                <div className="flex items-center gap-4">
                                    <button
                                        type="button"
                                        className="bg-green-500 text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-green-600 focus:outline-none"
                                        onClick={onClose}
                                    >
                                        UPDATE
                                    </button>
                                    <button
                                        type="button"
                                        className="rounded-md text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        onClick={onClose}
                                    >
                                        <span className="sr-only">Close panel</span>
                                        <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                                    </button>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="relative flex-1 px-4 py-6 sm:px-6 space-y-8">

                                {/* Section: Job Function */}
                                <div>
                                    <h3 className="text-sm font-semibold text-gray-900 mb-3">Job Function <span className="font-normal text-gray-500">(select from drop-down for best results)</span></h3>
                                    <div className="flex flex-wrap gap-2">
                                        {['Backend Engineer', 'Full Stack Engineer', 'Python Engineer', 'Java Engineer', 'C/C++ Engineer', 'Data Analyst', 'Data Scientist', 'Data Engineer', 'AI Engineer'].map((role) => (
                                            <button key={role} className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-50 text-green-700 border border-green-100">
                                                {role}
                                                <XMarkIcon className="ml-1.5 h-3 w-3 text-green-500" />
                                            </button>
                                        ))}
                                    </div>
                                    <div className="mt-3 relative rounded-md shadow-sm">
                                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                                        </div>
                                        <input
                                            type="text"
                                            className="block w-full rounded-md border-0 py-1.5 pl-10 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                            placeholder="Please select/enter your expected job function"
                                        />
                                    </div>
                                </div>

                                {/* Section: Job Type */}
                                <div>
                                    <h3 className="text-sm font-semibold text-gray-900 mb-3">Job Type</h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        {['Full-time', 'Contract', 'Part-time', 'Internship'].map((type) => (
                                            <div key={type} className="relative flex items-start">
                                                <div className="flex h-6 items-center">
                                                    <input
                                                        id={`type-${type}`}
                                                        name={`type-${type}`}
                                                        type="checkbox"
                                                        className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
                                                    />
                                                </div>
                                                <div className="ml-3 text-sm leading-6">
                                                    <label htmlFor={`type-${type}`} className="font-medium text-gray-900">
                                                        {type}
                                                    </label>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Section: Work Model */}
                                <div>
                                    <h3 className="text-sm font-semibold text-gray-900 mb-3">Work Model</h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        {['Onsite', 'Hybrid', 'Remote anywhere in the US'].map((model) => (
                                            <div key={model} className={`relative flex items-start ${model.includes('Remote') ? 'col-span-2' : ''}`}>
                                                <div className="flex h-6 items-center">
                                                    <input
                                                        id={`model-${model}`}
                                                        name={`model-${model}`}
                                                        type="checkbox"
                                                        className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
                                                    />
                                                </div>
                                                <div className="ml-3 text-sm leading-6">
                                                    <label htmlFor={`model-${model}`} className="font-medium text-gray-900">
                                                        {model}
                                                    </label>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Section: Location */}
                                <div>
                                    <h3 className="text-sm font-semibold text-gray-900 mb-3">Location</h3>
                                    <div className="flex gap-2">
                                        <select className="block w-full rounded-md border-0 py-1.5 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 bg-gray-50">
                                            <option>Anywhere in the US</option>
                                        </select>
                                        <select className="block w-32 rounded-md border-0 py-1.5 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 bg-white">
                                            <option>25mi</option>
                                        </select>
                                    </div>
                                    <button className="mt-2 w-full flex items-center justify-center gap-2 rounded-md bg-white border border-gray-200 px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm hover:bg-gray-50">
                                        + Add
                                    </button>
                                </div>

                                {/* Section: Experience Level */}
                                <div>
                                    <h3 className="text-sm font-semibold text-gray-900 mb-3">Experience Level</h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        {['Intern/New Grad', 'Entry Level', 'Mid Level', 'Senior Level', 'Lead/Staff', 'Director/Executive'].map((level) => (
                                            <div key={level} className="relative flex items-start">
                                                <div className="flex h-6 items-center">
                                                    <input
                                                        id={`level-${level}`}
                                                        name={`level-${level}`}
                                                        type="checkbox"
                                                        className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
                                                    />
                                                </div>
                                                <div className="ml-3 text-sm leading-6">
                                                    <label htmlFor={`level-${level}`} className="font-medium text-gray-900">
                                                        {level}
                                                    </label>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
