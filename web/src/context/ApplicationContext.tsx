'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export type JobApplication = {
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

type ApplicationContextType = {
    applications: JobApplication[];
    addApplication: (app: JobApplication) => void;
    updateApplication: (updatedApp: JobApplication) => void;
    deleteApplications: (ids: Set<string>) => void;
    setApplications: React.Dispatch<React.SetStateAction<JobApplication[]>>;
};

const ApplicationContext = createContext<ApplicationContextType | undefined>(undefined);

export function ApplicationProvider({ children }: { children: React.ReactNode }) {
    const [applications, setApplications] = useState<JobApplication[]>(initialApplications);
    const [isLoaded, setIsLoaded] = useState(false);

    // Load from local storage on mount
    useEffect(() => {
        const stored = localStorage.getItem('jai_applications');
        if (stored) {
            try {
                setApplications(JSON.parse(stored));
            } catch (e) {
                console.error("Failed to parse applications from local storage", e);
            }
        }
        setIsLoaded(true);
    }, []);

    // Save to local storage whenever applications change
    useEffect(() => {
        if (isLoaded) {
            localStorage.setItem('jai_applications', JSON.stringify(applications));
        }
    }, [applications, isLoaded]);

    const addApplication = (app: JobApplication) => {
        setApplications(prev => [app, ...prev]);
    };

    const updateApplication = (updatedApp: JobApplication) => {
        setApplications(prev => prev.map(app => app.id === updatedApp.id ? updatedApp : app));
    };

    const deleteApplications = (ids: Set<string>) => {
        setApplications(prev => prev.filter(app => !ids.has(app.id)));
    };

    return (
        <ApplicationContext.Provider value={{ applications, addApplication, updateApplication, deleteApplications, setApplications }}>
            {children}
        </ApplicationContext.Provider>
    );
}

export function useApplications() {
    const context = useContext(ApplicationContext);
    if (context === undefined) {
        throw new Error('useApplications must be used within an ApplicationProvider');
    }
    return context;
}
