'use client';

import { XMarkIcon, CheckIcon, PlusIcon } from '@heroicons/react/24/outline';
import { useState, useEffect } from 'react';
import { FilterState } from '@/app/dashboard/jobs/page';
import { useAIAgent } from '@/context/AIAgentContext';

interface JobsFilterDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    filters: FilterState;
    setFilters: (filters: FilterState) => void;
}

export default function JobsFilterDrawer({ isOpen, onClose, filters, setFilters }: JobsFilterDrawerProps) {
    const [selectedCategory, setSelectedCategory] = useState('Basic Job Criteria');
    const { userProfile, updateProfile } = useAIAgent();
    const [newSkill, setNewSkill] = useState('');

    // Lock body scroll when open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    if (!isOpen) return null;

    const categories = [
        'Basic Job Criteria',
        'Skills & Technology',
    ];

    const toggleSkill = (skill: string) => {
        const currentSkills = filters.skills || [];
        if (currentSkills.includes(skill)) {
            setFilters({ ...filters, skills: currentSkills.filter(s => s !== skill) });
        } else {
            setFilters({ ...filters, skills: [...currentSkills, skill] });
        }
    };

    const handleAddSkill = (e: React.FormEvent) => {
        e.preventDefault();
        if (newSkill.trim()) {
            const skillToAdd = newSkill.trim();
            // Add to profile if not exists
            if (!userProfile.skills.includes(skillToAdd)) {
                updateProfile({ skills: [...userProfile.skills, skillToAdd] });
            }
            // Auto-select it in filters
            if (!filters.skills.includes(skillToAdd)) {
                setFilters({ ...filters, skills: [...filters.skills, skillToAdd] });
            }
            setNewSkill('');
        }
    };

    const handleCheckboxChange = (key: keyof FilterState, value: string) => {
        if (filters[key as keyof FilterState] === value) {
            setFilters({ ...filters, [key]: '' });
        } else {
            setFilters({ ...filters, [key]: value });
        }
    };


    return (
        <div className="fixed inset-0 z-50 overflow-hidden">
            <div className="absolute inset-0 bg-gray-900/50 backdrop-blur-sm transition-opacity" onClick={onClose} />

            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute inset-0 overflow-hidden">
                    <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
                        <div className="pointer-events-auto w-screen max-w-2xl">
                            <div className="flex h-full flex-col bg-white shadow-2xl">
                                {/* Header */}
                                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                                    <h2 className="text-xl font-semibold text-gray-900">All Filters</h2>
                                    <div className="flex items-center gap-3">
                                        <button
                                            type="button"
                                            className="text-sm font-medium text-gray-500 hover:text-gray-900 px-3"
                                            onClick={() => setFilters({
                                                query: filters.query,
                                                location: '',
                                                role: '',
                                                experience: '',
                                                jobType: '',
                                                workModel: '',
                                                skills: [],
                                                sortBy: 'latest'
                                            })}
                                        >
                                            Clear All
                                        </button>
                                        <button
                                            type="button"
                                            className="rounded-full bg-indigo-600 px-6 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 transition-colors"
                                            onClick={onClose}
                                        >
                                            Show Results
                                        </button>
                                        <button
                                            type="button"
                                            className="rounded-md text-gray-400 hover:text-gray-500 focus:outline-none"
                                            onClick={onClose}
                                        >
                                            <span className="sr-only">Close panel</span>
                                            <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                                        </button>
                                    </div>
                                </div>

                                {/* Main Content Area */}
                                <div className="flex flex-1 min-h-0">
                                    {/* Left Sidebar */}
                                    <div className="w-1/3 border-r border-gray-100 bg-gray-50/50 overflow-y-auto pt-6">
                                        <nav className="space-y-1 px-3">
                                            {categories.map((category) => (
                                                <button
                                                    key={category}
                                                    onClick={() => setSelectedCategory(category)}
                                                    className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors text-left ${selectedCategory === category
                                                        ? 'bg-white text-indigo-600 shadow-sm ring-1 ring-gray-200'
                                                        : 'text-gray-600 hover:bg-gray-100'
                                                        }`}
                                                >
                                                    {category}
                                                </button>
                                            ))}
                                        </nav>
                                    </div>

                                    {/* Right Content */}
                                    <div className="flex-1 overflow-y-auto p-8">

                                        {selectedCategory === 'Basic Job Criteria' && (
                                            <div className="space-y-8">
                                                {/* Job Type */}
                                                <div>
                                                    <h3 className="text-sm font-semibold text-gray-900 mb-4">Job Type</h3>
                                                    <div className="grid grid-cols-2 gap-4">
                                                        {['Full-time', 'Contract', 'Part-time', 'Internship'].map((type) => (
                                                            <label key={type} className={`flex items-center p-3 border rounded-xl cursor-pointer transition-colors ${filters.jobType === type ? 'bg-indigo-50 border-indigo-200' : 'border-gray-200 hover:bg-gray-50'}`}>
                                                                <input
                                                                    type="checkbox"
                                                                    className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
                                                                    checked={filters.jobType === type}
                                                                    onChange={() => handleCheckboxChange('jobType', type)}
                                                                />
                                                                <span className="ml-3 text-sm font-medium text-gray-900">{type}</span>
                                                            </label>
                                                        ))}
                                                    </div>
                                                </div>

                                                <hr className="border-gray-100" />

                                                {/* Work Model */}
                                                <div>
                                                    <h3 className="text-sm font-semibold text-gray-900 mb-4">Work Model</h3>
                                                    <div className="space-y-3">
                                                        {['Onsite', 'Hybrid', 'Remote'].map((model) => (
                                                            <label key={model} className={`flex items-center p-3 border rounded-xl cursor-pointer transition-colors ${filters.workModel === model ? 'bg-indigo-50 border-indigo-200' : 'border-gray-200 hover:bg-gray-50'}`}>
                                                                <input
                                                                    type="checkbox"
                                                                    className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
                                                                    checked={filters.workModel === model}
                                                                    onChange={() => handleCheckboxChange('workModel', model)}
                                                                />
                                                                <span className="ml-3 text-sm font-medium text-gray-900">{model}</span>
                                                            </label>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {selectedCategory === 'Skills & Technology' && (
                                            <div className="space-y-6">
                                                <div className="flex items-center justify-between">
                                                    <h3 className="text-sm font-semibold text-gray-900">Your Skills</h3>
                                                    <button onClick={() => setFilters({ ...filters, skills: [] })} className="text-xs font-medium text-indigo-600 hover:text-indigo-500">
                                                        Clear Skills
                                                    </button>
                                                </div>

                                                {/* Add Skill Input */}
                                                <form onSubmit={handleAddSkill} className="relative">
                                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                        <PlusIcon className="h-5 w-5 text-gray-400" />
                                                    </div>
                                                    <input
                                                        type="text"
                                                        value={newSkill}
                                                        onChange={(e) => setNewSkill(e.target.value)}
                                                        placeholder="Add a skill (e.g. Docker)..."
                                                        className="block w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all text-sm text-gray-900 placeholder:text-gray-400"
                                                    />
                                                </form>

                                                <div className="space-y-2">
                                                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Active Skills</p>
                                                    <div className="flex flex-wrap gap-2">
                                                        {/* Combine profile skills and default/active filter skills for display */}
                                                        {Array.from(new Set([...userProfile.skills, ...(filters.skills || [])])).map((skill) => {
                                                            const isSelected = filters.skills?.includes(skill);
                                                            return (
                                                                <button
                                                                    key={skill}
                                                                    onClick={() => toggleSkill(skill)}
                                                                    className={`inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-medium border transition-all ${isSelected
                                                                        ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm'
                                                                        : 'bg-white border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                                                                        }`}
                                                                >
                                                                    {isSelected && <CheckIcon className="h-4 w-4 mr-1.5" />}
                                                                    {skill}
                                                                </button>
                                                            );
                                                        })}
                                                    </div>
                                                </div>

                                                <div className="rounded-lg bg-indigo-50 p-4">
                                                    <div className="flex">
                                                        <div className="flex-shrink-0">
                                                            <CheckIcon className="h-5 w-5 text-indigo-400" aria-hidden="true" />
                                                        </div>
                                                        <div className="ml-3">
                                                            <h3 className="text-sm font-medium text-indigo-800">Pro Tip</h3>
                                                            <div className="mt-2 text-sm text-indigo-700">
                                                                <p>Adding skills here also updates your profile, helping us recommend better jobs for you.</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
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
