
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { fetchApi } from '@/lib/api';

interface Session {
    _id: string;
    company: string;
    title: string;
    status: string;
    createdAt: string;
}

export default function SessionsPage() {
    const [sessions, setSessions] = useState<Session[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchApi('/api/sessions')
            .then((data) => {
                if (Array.isArray(data)) {
                    setSessions(data);
                }
            })
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <div className="p-8">Loading sessions...</div>;

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900">My Sessions</h1>
                <Link href="/dashboard/new" className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700">
                    New Session
                </Link>
            </div>

            <div className="bg-white shadow overflow-hidden sm:rounded-md">
                <ul className="divide-y divide-gray-200">
                    {sessions.length === 0 ? (
                        <li className="px-6 py-4 text-center text-gray-500">No sessions found. Start a new one!</li>
                    ) : (
                        sessions.map((session) => (
                            <li key={session._id}>
                                <Link href={`/session/${session._id}`} className="block hover:bg-gray-50">
                                    <div className="px-4 py-4 sm:px-6">
                                        <div className="flex items-center justify-between">
                                            <p className="text-sm font-medium text-indigo-600 truncate">{session.company}</p>
                                            <div className="ml-2 flex-shrink-0 flex">
                                                <p className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${session.status === 'completed' ? 'bg-green-100 text-green-800' :
                                                        session.status === 'created' ? 'bg-yellow-100 text-yellow-800' :
                                                            'bg-gray-100 text-gray-800'
                                                    }`}>
                                                    {session.status}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="mt-2 sm:flex sm:justify-between">
                                            <div className="sm:flex">
                                                <p className="flex items-center text-sm text-gray-500">
                                                    {session.title}
                                                </p>
                                            </div>
                                            <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                                                <p>
                                                    Created on <time dateTime={session.createdAt}>{new Date(session.createdAt).toLocaleDateString()}</time>
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            </li>
                        ))
                    )}
                </ul>
            </div>
        </div>
    );
}
