'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { JSearchJob } from '@/types/jsearch';
import {
    BuildingOfficeIcon,
    MapPinIcon,
    CalendarIcon,
    LinkIcon,
    ArrowLeftIcon,
    SparklesIcon
} from '@heroicons/react/24/outline';
import ResumeEditor from '@/components/ResumeEditor';

const getLogoPlaceholder = (company: string) => {
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(company)}&background=random&color=fff&size=128`;
};

export default function JobDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const id = params.id as string;

    const [job, setJob] = useState<JSearchJob | null>(null);
    const [loading, setLoading] = useState(true);
    const [generatingResume, setGeneratingResume] = useState(false);
    const [customResume, setCustomResume] = useState<string | null>(null);
    const [isEditorOpen, setIsEditorOpen] = useState(false);

    useEffect(() => {
        const fetchJobDetails = async () => {
            // Handle Hardcoded IXL Job
            if (id === 'ixl-new-grad-1') {
                setJob({
                    job_id: 'ixl-new-grad-1',
                    employer_name: 'IXL Learning',
                    job_title: 'Software Engineer, New Grad',
                    job_city: 'Raleigh',
                    job_state: 'NC',
                    job_country: 'USA',
                    job_is_remote: false,
                    job_posted_at_timestamp: Date.now() / 1000,
                    job_apply_link: 'https://www.ixl.com/company/careers/apply?gh_jid=8364780002&gh_src=9ab9c2a12',
                    job_description: `Software Engineer, New Grad
Raleigh, NC
IXL Learning, developer of personalized learning products used by millions of people globally, is seeking new graduates who have a passion for technology and education. You will dive into our code base and immediately contribute to our three extremely impactful educational products and build new, innovative products. You can fine-tune your existing skills and learn new ones as you work on one of our many teams. You’ll be able to work with our Core Technology team in back-end engineering, Front-end group using cutting-edge technologies like React, Mobile team in implementing iOS and Android apps, or our Full-stack teams who seek engineers interested in doing it all.

We find it immensely satisfying to develop products that impact the lives of millions, and we are eager to have you join our team.

This is a full-time position in our Raleigh, NC area office. This position will be in-person 5 days a week during the first 6 months of onboarding. H1B sponsorship is available for this position. #LI-TL1 

WHAT YOU'LL BE DOING
As a Software Engineer, you will build the back-end wiring, application logic, and UI that engage our users. You will find and use the best technologies to add features and create new products. You’ll be involved in all aspects of the development process – including design, coding, testing, debugging, and tuning. You will own your projects from start to end as they travel through our fast-paced development cycle. In addition to working with your fellow engineers, you’ll collaborate with other teams to design amazing products that meet the needs of our users, who are students and teachers all over the world.

TECHNOLOGY
Our server-side stack currently includes Linux, Apache, Java, Scala, Python, and Oracle. For our iOS app development, we use Swift. Our front-end code is written in JavaScript (including the React and D3 libraries, and ES6). Of course, the specific technologies and languages you use will vary by project and according to your own interests or specialization areas.

WHAT WE'RE LOOKING FOR
Bachelor's or advanced degree in computer science or a related discipline
Excellent programming skills
Strong analytical-reasoning and problem-solving skills
Ability to work both independently and with a wide variety of teams
Knowledge of Unix, Python, Java, SQL, or JavaScript is a plus
Passion for improving education through technology
ABOUT IXL LEARNING
IXL Learning is the country's largest EdTech company. We reach millions of learners through our diverse range of products. For example:

1 in 4 students in the United States uses IXL.com
Rosetta Stone provides an immersive learning experience for 25 languages
Wyzant is the nation's largest community of tutors, covering 300+ subjects
Teachers Pay Teachers (TPT) is a comprehensive marketplace for millions of educator-created resources
Our mission is to create innovative products that will make a real, positive difference for learners and educators and we're looking for passionate, mission-minded people to join us in achieving this goal. We have a unique culture at IXL that fosters collaboration and the open exchange of ideas. We value our team and treat one another with kindness and respect. We approach our work with passion, tenacity, and authenticity. We find it immensely satisfying to develop products that impact the lives of millions and we are eager to have you join our team.`,
                    employer_logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/63/IXL_Learning_logo.svg/1200px-IXL_Learning_logo.svg.png'
                });
                setLoading(false);
                return;
            }

            try {
                // Pass encoded ID to avoid path parsing issues with Base64 '=='
                const res = await fetch(`/api/jobs/${encodeURIComponent(id)}`);
                const data = await res.json();

                if (data.data) {
                    // Check if it's an array (JSearch typical) or object (our API proxy normalization)
                    if (Array.isArray(data.data)) {
                        setJob(data.data[0]);
                    } else {
                        setJob(data.data);
                    }
                }
            } catch (error) {
                console.error("Failed to fetch job", error);
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchJobDetails();
        }
    }, [id]);

    const [isTailoring, setIsTailoring] = useState(false);

    // New 2-step flow:
    // 1. Fetch raw resume text and open editor
    const handleViewResume = async () => {
        setGeneratingResume(true);
        try {
            const res = await fetch('/api/resume/content');
            const data = await res.json();

            if (res.ok && data.success) {
                setCustomResume(data.content);
                setIsEditorOpen(true);
            } else {
                const errorMessage = data.error || "Failed to fetch resume";
                alert(errorMessage);
            }
        } catch (error) {
            console.error(error);
            alert("An error occurred");
        } finally {
            setGeneratingResume(false);
        }
    };

    // 2. Send current text + JD to AI
    const handleTailorResume = async (currentText: string) => {
        if (!job) return "";
        setIsTailoring(true);
        try {
            const res = await fetch('/api/resume/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    jobId: job.job_id,
                    jobDescription: job.job_description,
                    resumeText: currentText // Send the user-edited text
                }),
            });
            const data = await res.json();

            if (res.ok && data.success) {
                // Return the new content so the editor can update
                return data.content;
            } else {
                const errorMessage = data.error || "Failed to generate resume";
                const errorDetails = data.details ? `\n\nDetails: ${data.details}` : "";
                alert(`${errorMessage}${errorDetails}`);
                throw new Error(errorMessage);
            }
        } catch (error) {
            console.error(error);
            alert("An error occurred while tailoring");
            throw error;
        } finally {
            setIsTailoring(false);
        }
    };


    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    if (!job) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
                <h2 className="text-xl font-semibold text-gray-900">Job not found</h2>
                <button onClick={() => router.back()} className="mt-4 text-indigo-600 hover:text-indigo-800">
                    Go back
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-5xl mx-auto">
                {/* Back Link */}
                <button
                    onClick={() => router.back()}
                    className="flex items-center text-sm text-gray-500 hover:text-gray-900 mb-6 transition-colors"
                >
                    <ArrowLeftIcon className="h-4 w-4 mr-1" />
                    Back to Jobs
                </button>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content: Job Description */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Header Card */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
                            <div className="flex items-start gap-6">
                                <div className="h-20 w-20 rounded-xl overflow-hidden border border-gray-100 shadow-sm flex-shrink-0 bg-white">
                                    <img
                                        src={job.employer_logo || getLogoPlaceholder(job.employer_name)}
                                        alt={job.employer_name}
                                        className="h-full w-full object-contain p-2"
                                    />
                                </div>
                                <div className="flex-1">
                                    <h1 className="text-2xl font-bold text-gray-900">{job.job_title}</h1>
                                    <div className="flex flex-wrap gap-y-2 gap-x-4 mt-2 text-sm text-gray-600">
                                        <div className="flex items-center">
                                            <BuildingOfficeIcon className="h-4 w-4 mr-1.5 text-gray-400" />
                                            {job.employer_name}
                                        </div>
                                        <div className="flex items-center">
                                            <MapPinIcon className="h-4 w-4 mr-1.5 text-gray-400" />
                                            {job.job_city}, {job.job_country}
                                        </div>
                                        {job.job_is_remote && (
                                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-50 text-green-700 border border-green-100">
                                                Remote
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Description Card */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
                            <h2 className="text-lg font-bold text-gray-900 mb-4">Job Description</h2>
                            <div className="prose prose-sm prose-indigo max-w-none text-gray-600 whitespace-pre-wrap">
                                {job.job_description}
                            </div>
                        </div>
                    </div>

                    {/* Sidebar: Actions */}
                    <div className="space-y-6">
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sticky top-8">
                            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">
                                Actions
                            </h3>

                            <div className="space-y-3">
                                <button
                                    onClick={handleViewResume}
                                    disabled={generatingResume}
                                    className="w-full flex items-center justify-center px-4 py-3 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white rounded-xl shadow-lg shadow-indigo-200 transition-all transform active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
                                >
                                    {generatingResume ? (
                                        <>
                                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Loading Resume...
                                        </>
                                    ) : (
                                        <>
                                            <SparklesIcon className="h-5 w-5 mr-2" />
                                            View & Tailor Resume
                                        </>
                                    )}
                                </button>

                                <a
                                    href={job.job_apply_link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-full flex items-center justify-center px-4 py-3 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
                                >
                                    <LinkIcon className="h-5 w-5 mr-2" />
                                    Original Job Post
                                </a>
                            </div>

                            {/* Resume Editor Modal */}
                            {customResume && (
                                <ResumeEditor
                                    initialContent={customResume}
                                    isOpen={isEditorOpen}
                                    onClose={() => setIsEditorOpen(false)}
                                    onTailor={handleTailorResume}
                                    isTailoring={isTailoring}
                                    jobApplyLink={job.job_apply_link}
                                    jobTitle={job.job_title}
                                    companyName={job.employer_name}
                                    jobType={job.job_employment_type || 'Full-time'}
                                />
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
