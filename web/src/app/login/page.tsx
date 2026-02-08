
'use client';

import { signIn } from 'next-auth/react';
import Image from 'next/image';

export default function LoginPage() {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                    Welcome to JAI
                </h2>
                <p className="mt-2 text-center text-sm text-gray-600">
                    Your AI-powered job application assistant
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md space-y-6">

                {/* Sign In Card */}
                <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
                    <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4 text-center">
                        Sign In
                    </h3>
                    <div>
                        <button
                            onClick={() => signIn('google', { callbackUrl: '/dashboard' })}
                            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                            Sign in with Google
                        </button>
                    </div>
                </div>

                {/* Sign Up Card */}
                <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
                    <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4 text-center">
                        New to JAI?
                    </h3>
                    <p className="text-center text-sm text-gray-500 mb-4">
                        Create an account to verify your education, experience, and skills.
                    </p>
                    <div>
                        <button
                            onClick={() => signIn('google', { callbackUrl: '/onboarding' })}
                            className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                            Sign up with Google
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
}
