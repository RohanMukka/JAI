
'use client';

import Sidebar from '@/components/Sidebar';
import { ApplicationProvider } from '@/context/ApplicationContext';

import { AIAgentProvider } from '@/context/AIAgentContext';
import AIAgent from '@/components/AIAgent';
import NotificationToast from '@/components/NotificationToast';

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <AIAgentProvider>
            <ApplicationProvider>
                <div className="min-h-screen bg-gray-100 flex">
                    <Sidebar />
                    <AIAgent />
                    <NotificationToast />
                    <div className="flex-1 flex flex-col md:pl-64 transition-all duration-300">
                        <main className="flex-1 py-10">
                            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                                {children}
                            </div>
                        </main>
                    </div>
                </div>
            </ApplicationProvider>
        </AIAgentProvider>
    );
}
