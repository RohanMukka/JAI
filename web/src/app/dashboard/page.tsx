
'use client';

import { useSession } from 'next-auth/react';
import Link from 'next/link';

export default function Dashboard() {
    const { data: session } = useSession();

    return (
        <div className="px-4 py-6 sm:px-0">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">
                Welcome back, {session?.user?.name}!
            </h1>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {/* New Session Card */}
                <Link href="/dashboard/new" className="block p-6 bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow">
                    <div className="flex items-center">
                        <div className="flex-shrink-0 bg-indigo-500 rounded-md p-3">
                            <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                        </div>
                        <div className="ml-5 w-0 flex-1">
                            <h3 className="text-lg font-medium text-gray-900">New Session</h3>
                            <p className="mt-1 text-sm text-gray-500">
                                Start a new job application with a tailored resume.
                            </p>
                        </div>
                    </div>
                </Link>

                {/* My Sessions Card */}
                <Link href="/dashboard/sessions" className="block p-6 bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow">
                    <div className="flex items-center">
                        <div className="flex-shrink-0 bg-green-500 rounded-md p-3">
                            <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                            </svg>
                        </div>
                        <div className="ml-5 w-0 flex-1">
                            <h3 className="text-lg font-medium text-gray-900">My Sessions</h3>
                            <p className="mt-1 text-sm text-gray-500">
                                View and manage your past applications.
                            </p>
                        </div>
                    </div>
                </Link>

                {/* Profile Card */}
                <Link href="/dashboard/profile" className="block p-6 bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow">
                    <div className="flex items-center">
                        <div className="flex-shrink-0 bg-purple-500 rounded-md p-3">
                            <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                        </div>
                        <div className="ml-5 w-0 flex-1">
                            <h3 className="text-lg font-medium text-gray-900">Profile</h3>
                            <p className="mt-1 text-sm text-gray-500">
                                Update your base details and resume.
                            </p>
                        </div>
                    </div>
                </Link>
            </div>
        </div>
    );
}
