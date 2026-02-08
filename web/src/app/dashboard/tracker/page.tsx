'use client';

import { useState } from 'react';
import { signIn, useSession } from 'next-auth/react';
import {
    MagnifyingGlassIcon,
    FunnelIcon,
    PlusIcon,
    PencilSquareIcon,
    TrashIcon,
    ArrowPathIcon,
    EnvelopeIcon,
    DevicePhoneMobileIcon
} from '@heroicons/react/24/outline';

// Mock data type
type JobApplication = {
    id: string;
    jobTitle: string;
    companyName: string;
    dateApplied: string;
    status: 'Applied' | 'Screening' | 'Interview' | 'Offer' | 'Rejected' | 'Ghosted';
    applicationLink: string;
    resumeVersion: string;
    coverLetterPdf: string;
    pointOfContact: string;
    comments?: string;
    jobType: 'Internship' | 'Full-time' | 'Part-time';
};

// Initial mock data
const initialApplications: JobApplication[] = [
    {
        id: '1',
        jobTitle: 'Senior Frontend Developer',
        companyName: 'TechCorp',
        dateApplied: '2023-10-15',
        status: 'Applied',
        applicationLink: 'https://techcorp.com/careers/123',
        resumeVersion: 'v2.1',
        coverLetterPdf: 'TechCorp_CL.pdf',
        pointOfContact: 'Sarah Smith',
        comments: 'Referral from John Doe.',
        jobType: 'Full-time'
    },
    {
        id: '2',
        jobTitle: 'Full Stack Engineer',
        companyName: 'StartupInc',
        dateApplied: '2023-10-18',
        status: 'Interview',
        applicationLink: 'https://startupinc.io/jobs/456',
        resumeVersion: 'v2.2-React',
        coverLetterPdf: 'StartupInc_CL.pdf',
        pointOfContact: 'Mike Jones (CTO)',
        comments: 'Technical interview went well. Waiting for next steps.',
        jobType: 'Full-time'
    },
    {
        id: '3',
        jobTitle: 'Software Engineer II',
        companyName: 'BigData Co',
        dateApplied: '2023-10-20',
        status: 'Rejected',
        applicationLink: 'https://bigdata.co/apply',
        resumeVersion: 'v2.1',
        coverLetterPdf: 'BigData_CL.pdf',
        pointOfContact: '-',
        comments: 'Standard rejection email.',
        jobType: 'Internship'
    }
];

import { useAIAgent } from '@/context/AIAgentContext';

export default function TrackerPage() {
    const [applications, setApplications] = useState<JobApplication[]>(initialApplications);
    const [searchTerm, setSearchTerm] = useState('');
    const { triggerAgent, addNotification } = useAIAgent();
    const { data: session } = useSession();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [statusFilter, setStatusFilter] = useState<string>('All');
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [isScanning, setIsScanning] = useState(false);

    // New Application Form State
    const [newApp, setNewApp] = useState<Partial<JobApplication>>({
        status: 'Applied',
        resumeVersion: 'v1.0',
        coverLetterPdf: 'None',
        comments: '',
        jobType: 'Full-time'
    });

    // Edit Application State
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editApp, setEditApp] = useState<Partial<JobApplication>>({});

    const handleEditClick = (app: JobApplication) => {
        setEditApp(app);
        setIsEditModalOpen(true);
    };

    const handleUpdateApplication = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editApp.id || !editApp.jobTitle || !editApp.companyName) return;

        setApplications(prev => prev.map(app => app.id === editApp.id ? { ...app, ...editApp } as JobApplication : app));
        setIsEditModalOpen(false);
        setEditApp({});
        triggerAgent(`Updated application for ${editApp.jobTitle} at ${editApp.companyName}.`);
    };

    const handleAddApplication = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newApp.jobTitle || !newApp.companyName) return;

        const app: JobApplication = {
            id: Date.now().toString(),
            jobTitle: newApp.jobTitle!,
            companyName: newApp.companyName!,
            dateApplied: new Date().toISOString().split('T')[0],
            status: (newApp.status as JobApplication['status']) || 'Applied',
            applicationLink: newApp.applicationLink || '#',
            resumeVersion: newApp.resumeVersion || 'v1.0',
            coverLetterPdf: newApp.coverLetterPdf || 'None',
            pointOfContact: newApp.pointOfContact || '-',
            comments: newApp.comments || '',
            jobType: (newApp.jobType as JobApplication['jobType']) || 'Full-time'
        };

        setApplications(prev => [app, ...prev]);
        setIsModalOpen(false);
        setNewApp({ status: 'Applied', resumeVersion: 'v1.0', coverLetterPdf: 'None', comments: '' });
        triggerAgent(`Added new application for ${app.jobTitle} at ${app.companyName}. Good luck!`);
    };


    const handleStatusChange = (id: string, newStatus: JobApplication['status']) => {
        setApplications(prev => prev.map(app => {
            if (app.id === id) {
                // Trigger AI Agent
                triggerAgent(`Updated status for ${app.companyName} to ${newStatus}. Keep up the momentum!`);
                return { ...app, status: newStatus };
            }
            return app;
        }));
    };


    const handleCommentChange = (id: string, newComment: string) => {
        setApplications(prev => prev.map(app =>
            app.id === id ? { ...app, comments: newComment } : app
        ));
    };

    const statusColors = {
        'Applied': 'bg-blue-100 text-blue-800',
        'Screening': 'bg-purple-100 text-purple-800',
        'Interview': 'bg-yellow-100 text-yellow-800',
        'Offer': 'bg-green-100 text-green-800',
        'Rejected': 'bg-red-100 text-red-800',
        'Ghosted': 'bg-gray-100 text-gray-800'
    };

    const filteredApplications = applications.filter(app => {
        const matchesSearch = app.jobTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
            app.companyName.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'All' || app.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            setSelectedIds(new Set(filteredApplications.map(app => app.id)));
        } else {
            setSelectedIds(new Set());
        }
    };

    const handleSelectRow = (id: string) => {
        const newSelected = new Set(selectedIds);
        if (newSelected.has(id)) {
            newSelected.delete(id);
        } else {
            newSelected.add(id);
        }
        setSelectedIds(newSelected);
    };

    const handleDeleteSelected = () => {
        setApplications(prev => prev.filter(app => !selectedIds.has(app.id)));
        setSelectedIds(new Set());
        triggerAgent(`Deleted ${selectedIds.size} application(s).`);
    };

    const handleScanEmails = async () => {
        setIsScanning(true);
        // Set a timeout to prevent infinite loading
        const timeoutId = setTimeout(() => {
            if (isScanning) {
                setIsScanning(false);
                addNotification('Scan Timed Out', 'Email scan took too long. Falling back to simulation.', 'info');
                runMockScan();
            }
        }, 15000);

        try {
            const response = await fetch('/api/email/scan');
            const data = await response.json();

            clearTimeout(timeoutId);

            if (!response.ok) throw new Error(data.error || 'Failed to scan');

            if (data.updates && data.updates.length > 0) {
                setApplications(prev => {
                    let updated = [...prev];
                    data.updates.forEach((update: any) => {
                        const index = updated.findIndex(app =>
                            app.companyName.toLowerCase() === update.company.toLowerCase()
                        );
                        if (index !== -1) {
                            updated[index] = { ...updated[index], status: update.newStatus };
                        }
                    });
                    return updated;
                });

                addNotification('Email Scan Results', `Found ${data.updates.length} updates!`, 'success');
                triggerAgent(`I found ${data.updates.length} updates in your inbox. I've updated the tracker for you!`);
            } else {
                addNotification('Email Scan', 'No new job updates found in your recent emails.', 'info');
                // Run mock scan as a fallback even if real scan found nothing, 
                // to show the user "it works" in dev
                runMockScan(true);
            }
        } catch (error: any) {
            console.error('Scan error:', error);
            addNotification('Scan Failed', 'Falling back to simulated scan.', 'warning');
            runMockScan();
        } finally {
            setIsScanning(false);
        }
    };

    const runMockScan = (isSilent = false) => {
        if (!isSilent) setIsScanning(true);
        setTimeout(() => {
            setIsScanning(false);
            const targetApp = applications.find(app => app.companyName === 'TechCorp' && app.status === 'Applied');
            if (targetApp) {
                setApplications(prev => prev.map(app =>
                    app.id === targetApp.id ? { ...app, status: 'Interview' } : app
                ));
                triggerAgent("📧 SIMULATED UPDATE: 'TechCorp' status updated to 'Interview' (Email Simulation).");
            } else if (!isSilent) {
                triggerAgent("📧 Simulation complete: No new updates to apply right now.");
            }
        }, 2000);
    };

    const handleUpdateFromMail = () => {
        if (session) {
            handleScanEmails();
        } else {
            runMockScan();
        }
    };

    return (
        <div className="px-4 py-6 sm:px-0 h-full flex flex-col">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-indigo-600">Application Tracker</h1>
                <div className="flex space-x-2">
                    {selectedIds.size > 0 && (
                        <button
                            onClick={handleDeleteSelected}
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                        >
                            <TrashIcon className="h-5 w-5 mr-2" />
                            Delete Selected ({selectedIds.size})
                        </button>
                    )}
                    <button
                        onClick={handleUpdateFromMail}
                        disabled={isScanning}
                        className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${isScanning ? 'bg-indigo-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'}`}
                    >
                        <ArrowPathIcon className={`h-5 w-5 mr-2 ${isScanning ? 'animate-spin' : ''}`} />
                        {isScanning ? 'Scanning...' : 'Update from Mail'}
                    </button>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                        <PlusIcon className="h-5 w-5 mr-2" />
                        New Application
                    </button>
                </div>
            </div>

            {/* Email Integration Bar */}
            <div className="bg-indigo-50 border border-indigo-100 rounded-md p-3 mb-6 flex justify-between items-center">
                <div className="flex items-center">
                    <EnvelopeIcon className="h-5 w-5 text-indigo-600 mr-2" />
                    <span className="text-sm text-indigo-900 font-medium">
                        {session
                            ? `Connected as ${session.user?.email}. Scanning enabled.`
                            : "Connect your email to automatically track applications."}
                    </span>
                </div>
                <div className="flex space-x-3">
                    {!session ? (
                        <button
                            onClick={() => signIn('google')}
                            className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                            <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="h-4 w-4 mr-2" />
                            Connect Gmail
                        </button>
                    ) : (
                        <button
                            onClick={handleScanEmails}
                            disabled={isScanning}
                            className="inline-flex items-center px-3 py-1.5 border border-indigo-200 shadow-sm text-xs font-medium rounded text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                            <ArrowPathIcon className={`h-4 w-4 mr-2 ${isScanning ? 'animate-spin' : ''}`} />
                            Scan Now
                        </button>
                    )}
                </div>
            </div>

            {/* Filter Bar */}
            <div className="flex space-x-4 mb-4">
                <div className="relative flex-1 min-w-0">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                    </div>
                    <input
                        type="text"
                        className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md py-2"
                        placeholder="Search jobs or companies..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="relative">
                    <button
                        onClick={() => setIsFilterOpen(!isFilterOpen)}
                        className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                    >
                        <FunnelIcon className="h-5 w-5 mr-2 text-gray-400" />
                        Filter {statusFilter !== 'All' ? `(${statusFilter})` : ''}
                    </button>
                    {isFilterOpen && (
                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-20 border border-gray-200">
                            <button onClick={() => { setStatusFilter('All'); setIsFilterOpen(false); }} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">All</button>
                            {Object.keys(statusColors).map(status => (
                                <button key={status} onClick={() => { setStatusFilter(status); setIsFilterOpen(false); }} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">{status}</button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Spreadsheet View */}
            <div className="flex-1 overflow-auto bg-white shadow rounded-lg border border-gray-200">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50 sticky top-0 z-10">
                        <tr>
                            <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Job Title</th>
                            <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company</th>
                            <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Job Type</th>
                            <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date Applied</th>
                            <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Point of Contact</th>
                            <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Default Comment</th>
                            <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Links</th>
                            <th scope="col" className="relative px-3 py-2">
                                <input
                                    type="checkbox"
                                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                    checked={filteredApplications.length > 0 && selectedIds.size === filteredApplications.length}
                                    onChange={handleSelectAll}
                                />
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {filteredApplications.map((app) => (
                            <tr key={app.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-indigo-600 cursor-pointer hover:underline" onClick={() => handleEditClick(app)}>{app.jobTitle}</td>
                                <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">{app.companyName}</td>
                                <td className="px-3 py-2 whitespace-nowrap text-xs">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${app.jobType === 'Internship' ? 'bg-green-100 text-green-800' : app.jobType === 'Part-time' ? 'bg-orange-100 text-orange-800' : 'bg-blue-100 text-blue-800'}`}>
                                        {app.jobType}
                                    </span>
                                </td>
                                <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">{app.dateApplied}</td>
                                <td className="px-3 py-2 whitespace-nowrap">
                                    <select
                                        value={app.status}
                                        onChange={(e) => handleStatusChange(app.id, e.target.value as JobApplication['status'])}
                                        className={`block w-full pl-2 pr-8 py-1 text-xs font-semibold rounded-full border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-xs ${statusColors[app.status]}`}
                                    >
                                        {Object.keys(statusColors).map((status) => (
                                            <option key={status} value={status}>{status}</option>
                                        ))}
                                    </select>
                                </td>
                                <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">{app.pointOfContact}</td>
                                <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                                    <input
                                        type="text"
                                        value={app.comments || ''}
                                        onChange={(e) => handleCommentChange(app.id, e.target.value)}
                                        placeholder="Add a note..."
                                        className="block w-full border-0 border-b-2 border-transparent bg-transparent focus:border-indigo-600 focus:ring-0 sm:text-xs text-gray-900"
                                    />
                                </td>
                                <td className="px-3 py-2 whitespace-nowrap text-sm text-blue-600 space-x-2">
                                    <a href={app.applicationLink} target="_blank" rel="noopener noreferrer" className="hover:underline">App</a>
                                    <span className="text-gray-300">|</span>
                                    <a href="#" className="hover:underline">PDF</a>
                                </td>
                                <td className="px-3 py-2 whitespace-nowrap text-right text-sm font-medium relative">
                                    <input
                                        type="checkbox"
                                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                        checked={selectedIds.has(app.id)}
                                        onChange={() => handleSelectRow(app.id)}
                                    />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {/* New Application Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-lg w-full">
                        <h2 className="text-xl font-bold mb-4 text-indigo-600">Add New Application</h2>
                        <form onSubmit={handleAddApplication} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Job Title</label>
                                <input required type="text" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-gray-900"
                                    value={newApp.jobTitle || ''} onChange={e => setNewApp({ ...newApp, jobTitle: e.target.value })} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Job Type</label>
                                <select
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-gray-900"
                                    value={newApp.jobType || 'Full-time'}
                                    onChange={e => setNewApp({ ...newApp, jobType: e.target.value as JobApplication['jobType'] })}
                                >
                                    <option value="Internship">Internship</option>
                                    <option value="Full-time">Full-time</option>
                                    <option value="Part-time">Part-time</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Company Name</label>
                                <input required type="text" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-gray-900"
                                    value={newApp.companyName || ''} onChange={e => setNewApp({ ...newApp, companyName: e.target.value })} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Application Link</label>
                                <input type="url" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-gray-900"
                                    value={newApp.applicationLink || ''} onChange={e => setNewApp({ ...newApp, applicationLink: e.target.value })} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Point of Contact</label>
                                <input type="text" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-gray-900"
                                    value={newApp.pointOfContact || ''} onChange={e => setNewApp({ ...newApp, pointOfContact: e.target.value })} />
                            </div>
                            <div className="flex justify-end space-x-3 mt-6">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">Cancel</button>
                                <button type="submit" className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700">Add Application</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit Application Modal */}
            {isEditModalOpen && (
                <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-lg w-full">
                        <h2 className="text-xl font-bold mb-4 text-indigo-600">Edit Application</h2>
                        <form onSubmit={handleUpdateApplication} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Job Title</label>
                                <input required type="text" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-gray-900"
                                    value={editApp.jobTitle || ''} onChange={e => setEditApp({ ...editApp, jobTitle: e.target.value })} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Job Type</label>
                                <select
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-gray-900"
                                    value={editApp.jobType || 'Full-time'}
                                    onChange={e => setEditApp({ ...editApp, jobType: e.target.value as JobApplication['jobType'] })}
                                >
                                    <option value="Internship">Internship</option>
                                    <option value="Full-time">Full-time</option>
                                    <option value="Part-time">Part-time</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Company Name</label>
                                <input required type="text" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-gray-900"
                                    value={editApp.companyName || ''} onChange={e => setEditApp({ ...editApp, companyName: e.target.value })} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Application Link</label>
                                <input type="url" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-gray-900"
                                    value={editApp.applicationLink || ''} onChange={e => setEditApp({ ...editApp, applicationLink: e.target.value })} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Point of Contact</label>
                                <input type="text" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-gray-900"
                                    value={editApp.pointOfContact || ''} onChange={e => setEditApp({ ...editApp, pointOfContact: e.target.value })} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Comments</label>
                                <textarea className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-gray-900"
                                    rows={3}
                                    value={editApp.comments || ''} onChange={e => setEditApp({ ...editApp, comments: e.target.value })} />
                            </div>
                            <div className="flex justify-end space-x-3 mt-6">
                                <button type="button" onClick={() => setIsEditModalOpen(false)} className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">Cancel</button>
                                <button type="submit" className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700">Update Application</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
