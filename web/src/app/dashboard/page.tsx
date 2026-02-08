
import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import Link from 'next/link';
import {
    BriefcaseIcon,
    ChartBarIcon,
    SparklesIcon,
    ArrowRightIcon
} from '@heroicons/react/24/outline';

export default async function Dashboard() {
    const session = await getServerSession(authOptions);

    if (!session) {
        redirect("/login");
    }

    return (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

            {/* HERO SECTION */}
            <div className="text-center mb-16">
                <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl mb-4">
                    Your AI companion for landing the <span className="text-indigo-600">right job</span>.
                </h1>
                <p className="mt-4 text-xl text-gray-500 max-w-2xl mx-auto">
                    JAI helps you discover relevant jobs, track applications automatically, and reflect with guidance from your future self.
                </p>
            </div>

            {/* FEATURE CARDS */}
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-3 mb-20">
                {/* Card 1: Jobs */}
                <Link href="/dashboard/jobs" className="relative group bg-white p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-500 rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-200 border border-gray-100">
                    <div>
                        <span className="rounded-lg inline-flex p-3 bg-indigo-50 text-indigo-700 ring-4 ring-white">
                            <BriefcaseIcon className="h-6 w-6" aria-hidden="true" />
                        </span>
                    </div>
                    <div className="mt-4">
                        <h3 className="text-lg font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">
                            Find the Right Jobs
                        </h3>
                        <p className="mt-2 text-sm text-gray-500">
                            Discover curated MNC and startup roles matched to your skills and career goals.
                        </p>
                    </div>
                </Link>

                {/* Card 2: Tracker */}
                <Link href="/dashboard/tracker" className="relative group bg-white p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-500 rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-200 border border-gray-100">
                    <div>
                        <span className="rounded-lg inline-flex p-3 bg-indigo-50 text-indigo-700 ring-4 ring-white">
                            <ChartBarIcon className="h-6 w-6" aria-hidden="true" />
                        </span>
                    </div>
                    <div className="mt-4">
                        <h3 className="text-lg font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">
                            Track Every Application
                        </h3>
                        <p className="mt-2 text-sm text-gray-500">
                            Automatically track application status, interviews, and follow-ups in one place.
                        </p>
                    </div>
                </Link>

                {/* Card 3: Future Me */}
                <Link href="/dashboard/future-me" className="relative group bg-white p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-500 rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-200 border border-gray-100">
                    <div>
                        <span className="rounded-lg inline-flex p-3 bg-indigo-50 text-indigo-700 ring-4 ring-white">
                            <SparklesIcon className="h-6 w-6" aria-hidden="true" />
                        </span>
                    </div>
                    <div className="mt-4">
                        <h3 className="text-lg font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">
                            Talk to Your Future Self
                        </h3>
                        <p className="mt-2 text-sm text-gray-500">
                            Chat with an AI version of your future self for motivation and career clarity.
                        </p>
                    </div>
                </Link>
            </div>

            {/* HOW IT WORKS (Timeline) */}
            <div className="mb-20">
                <h2 className="text-2xl font-bold text-gray-900 text-center mb-10">How JAI works for you</h2>
                <div className="relative">
                    {/* Line */}
                    <div className="absolute left-1/2 transform -translate-x-1/2 w-0.5 h-full bg-gray-200 hidden sm:block"></div>

                    <div className="space-y-12">
                        {/* Step 1 */}
                        <div className="relative flex items-center justify-between sm:justify-start">
                            <div className="order-1 sm:w-5/12 text-right pr-8 hidden sm:block">
                                <h3 className="text-lg font-semibold text-gray-900">Set Preferences</h3>
                                <p className="text-gray-500 mt-1">Upload your resume and tell JAI what you&apos;re looking for.</p>
                            </div>
                            <div className="order-1 flex items-center justify-center w-8 h-8 bg-indigo-600 rounded-full ring-4 ring-white shadow z-10 sm:mx-auto">
                                <span className="text-white font-bold text-sm">1</span>
                            </div>
                            <div className="order-1 sm:w-5/12 pl-4 sm:pl-8 sm:hidden">
                                <h3 className="text-lg font-semibold text-gray-900">Set Preferences</h3>
                                <p className="text-gray-500 mt-1">Upload your resume and tell JAI what you&apos;re looking for.</p>
                            </div>
                        </div>

                        {/* Step 2 */}
                        <div className="relative flex items-center justify-between sm:justify-start">
                            <div className="order-1 sm:w-5/12 hidden sm:block"></div> {/* Spacer */}
                            <div className="order-1 flex items-center justify-center w-8 h-8 bg-indigo-600 rounded-full ring-4 ring-white shadow z-10 sm:mx-auto">
                                <span className="text-white font-bold text-sm">2</span>
                            </div>
                            <div className="order-1 sm:w-5/12 pl-4 sm:pl-8">
                                <h3 className="text-lg font-semibold text-gray-900">Explore Recommended Jobs</h3>
                                <p className="text-gray-500 mt-1">Browse tailored listings and use deep filters to find the best fit.</p>
                            </div>
                        </div>

                        {/* Step 3 */}
                        <div className="relative flex items-center justify-between sm:justify-start">
                            <div className="order-1 sm:w-5/12 text-right pr-8 hidden sm:block">
                                <h3 className="text-lg font-semibold text-gray-900">Apply & Track</h3>
                                <p className="text-gray-500 mt-1">Apply with one click and let JAI organize your pipeline.</p>
                            </div>
                            <div className="order-1 flex items-center justify-center w-8 h-8 bg-indigo-600 rounded-full ring-4 ring-white shadow z-10 sm:mx-auto">
                                <span className="text-white font-bold text-sm">3</span>
                            </div>
                            <div className="order-1 sm:w-5/12 pl-4 sm:pl-8 sm:hidden">
                                <h3 className="text-lg font-semibold text-gray-900">Apply & Track</h3>
                                <p className="text-gray-500 mt-1">Apply with one click and let JAI organize your pipeline.</p>
                            </div>
                        </div>

                        {/* Step 4 */}
                        <div className="relative flex items-center justify-between sm:justify-start">
                            <div className="order-1 sm:w-5/12 hidden sm:block"></div> {/* Spacer */}
                            <div className="order-1 flex items-center justify-center w-8 h-8 bg-indigo-600 rounded-full ring-4 ring-white shadow z-10 sm:mx-auto">
                                <span className="text-white font-bold text-sm">4</span>
                            </div>
                            <div className="order-1 sm:w-5/12 pl-4 sm:pl-8">
                                <h3 className="text-lg font-semibold text-gray-900">Reflect & Improve</h3>
                                <p className="text-gray-500 mt-1">Gain insights from &quot;Future Me&quot; to ace your next interview.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* CTA SECTION */}
            <div className="bg-indigo-50 rounded-2xl p-8 sm:p-12 text-center">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Ready to get started?</h2>
                <div className="flex flex-col sm:flex-row justify-center gap-4 mt-8">
                    <Link href="/dashboard/jobs" className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm">
                        Explore Jobs
                        <ArrowRightIcon className="ml-2 -mr-1 h-5 w-5" aria-hidden="true" />
                    </Link>
                    <Link href="/dashboard/tracker" className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 shadow-sm">
                        Track Applications
                    </Link>
                </div>
            </div>

            {/* FOOTER / TRUST */}
            <div className="mt-16 text-center">
                <p className="text-sm text-gray-400">
                    Built to reduce job-search stress and bring clarity to your career journey.
                </p>
            </div>
        </div>
    );
}
