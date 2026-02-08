
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { fetchApi } from '@/lib/api';

interface SessionData {
    _id: string;
    company: string;
    title: string;
    status: string; // created, generating, completed, failed
    jobDescription: string;
    applyUrl?: string;
    resumeJson?: string; // JSON string
    coverLetter?: string;
    pdfUrl?: string;
}

export default function SessionDetailPage() {
    const { id } = useParams() as { id: string };
    const [session, setSession] = useState<SessionData | null>(null);
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);
    const [saving, setSaving] = useState(false);
    const [compiling, setCompiling] = useState(false);

    // Poll for updates if status is 'generating'
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (session?.status === 'generating') {
            interval = setInterval(() => {
                fetchSession();
            }, 3000);
        }
        return () => clearInterval(interval);
    }, [session?.status]);

    const fetchSession = useCallback(async () => {
        try {
            const data = await fetchApi(`/api/sessions/${id}`);
            if (data) setSession(data);
        } catch (error) {
            console.error("Error fetching session", error);
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        fetchSession();
    }, [fetchSession]);

    const handleGenerate = async () => {
        setGenerating(true);
        try {
            // Optimistic update
            setSession(prev => prev ? ({ ...prev, status: 'generating' }) : null);
            await fetchApi(`/api/sessions/${id}/generate`, { method: 'POST' });
        } catch (error) {
            console.error("Error triggering generation", error);
            alert("Failed to start generation");
            setSession(prev => prev ? ({ ...prev, status: 'created' }) : null);
        } finally {
            setGenerating(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            await fetchApi(`/api/sessions/${id}`, {
                method: 'PUT',
                body: JSON.stringify({
                    resumeJson: session?.resumeJson,
                    coverLetter: session?.coverLetter,
                }),
            });
            alert('Saved!');
        } catch (error) {
            console.error("Error saving", error);
            alert("Failed to save");
        } finally {
            setSaving(false);
        }
    };

    const handleCompile = async () => {
        setCompiling(true);
        try {
            const data = await fetchApi(`/api/sessions/${id}/compile`, { method: 'POST' });
            if (data && data.pdfUrl) {
                setSession(prev => prev ? ({ ...prev, pdfUrl: data.pdfUrl }) : null);
                alert("PDF Compiled!");
            } else {
                alert("Compilation triggered (or mock success).");
            }
        } catch (error) {
            console.error("Error compiling", error);
            alert("Failed to compile PDF");
        } finally {
            setCompiling(false);
        }
    };

    const handleAutofill = () => {
        if (!session?.applyUrl) {
            alert("No Apply URL provided for this session.");
            return;
        }
        const url = new URL(session.applyUrl);
        url.searchParams.set('session_id', id);
        window.open(url.toString(), '_blank');
    };

    if (loading) return <div className="p-8 text-center text-gray-500">Loading session...</div>;
    if (!session) return <div className="p-8 text-center text-red-500">Session not found</div>;

    return (
        <div className="h-[calc(100vh-4rem)] flex flex-col">
            {/* Header */}
            <div className="bg-white shadow px-6 py-4 flex justify-between items-center shrink-0">
                <div>
                    <h1 className="text-xl font-bold text-gray-900">{session.company} - {session.title}</h1>
                    <p className="text-sm text-gray-500">Status: <span className="font-semibold uppercase">{session.status}</span></p>
                </div>
                <div className="space-x-4">
                    {session.status === 'created' && (
                        <button
                            onClick={handleGenerate}
                            disabled={generating}
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 disabled:bg-green-400"
                        >
                            {generating ? 'Generating...' : 'Generate Resume'}
                        </button>
                    )}
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="inline-flex items-center px-4 py-2 border border-blue-600 text-sm font-medium rounded-md shadow-sm text-blue-600 bg-transparent hover:bg-blue-50"
                    >
                        {saving ? 'Saving...' : 'Save Draft'}
                    </button>
                    <button
                        onClick={handleCompile}
                        disabled={compiling}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400"
                    >
                        {compiling ? 'Compiling...' : 'Export PDF'}
                    </button>
                    <button
                        onClick={handleAutofill}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-pink-600 hover:bg-pink-700"
                    >
                        Autofill Application
                    </button>
                </div>
            </div>

            {session.pdfUrl && (
                <div className="bg-green-50 px-6 py-2 text-sm text-green-700 flex justify-between items-center shrink-0">
                    <span>PDF Ready!</span>
                    <a href={session.pdfUrl} target="_blank" className="underline font-semibold" download>Download PDF</a>
                </div>
            )}

            {/* Main Content */}
            <div className="flex-1 flex overflow-hidden">
                {/* Left Panel: Job Description */}
                <div className="w-1/3 bg-gray-50 border-r border-gray-200 flex flex-col p-6 overflow-y-auto">
                    <h2 className="text-lg font-medium text-gray-900 mb-4">Job Description</h2>
                    <div className="prose prose-sm text-gray-600 whitespace-pre-wrap">
                        {session.jobDescription}
                    </div>
                </div>

                {/* Right Panel: Editors */}
                <div className="w-2/3 flex flex-col p-6 overflow-y-auto bg-white">
                    <div className="mb-6">
                        <h2 className="text-lg font-medium text-gray-900 mb-2">Tailored Resume (JSON)</h2>
                        <textarea
                            className="w-full h-96 p-4 border border-gray-300 rounded-md font-mono text-sm focus:ring-indigo-500 focus:border-indigo-500"
                            value={session.resumeJson || ''}
                            onChange={(e) => setSession({ ...session, resumeJson: e.target.value })}
                            placeholder="Resume JSON will appear here..."
                        />
                    </div>

                    <div>
                        <h2 className="text-lg font-medium text-gray-900 mb-2">Cover Letter</h2>
                        <textarea
                            className="w-full h-64 p-4 border border-gray-300 rounded-md text-sm focus:ring-indigo-500 focus:border-indigo-500"
                            value={session.coverLetter || ''}
                            onChange={(e) => setSession({ ...session, coverLetter: e.target.value })}
                            placeholder="Cover letter will appear here..."
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
