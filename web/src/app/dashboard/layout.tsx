
'use client';

import Sidebar from '@/components/Sidebar';
import { ApplicationProvider } from '@/context/ApplicationContext';

import { AIAgentProvider, useAIAgent } from '@/context/AIAgentContext';
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
                <DashboardContent>{children}</DashboardContent>
            </ApplicationProvider>
        </AIAgentProvider>
    );
}

function DashboardContent({ children }: { children: React.ReactNode }) {
    const { atmosphere } = useAIAgent();

    const getBgStyle = () => {
        if (atmosphere.mood_theme === 'calm') return { backgroundColor: '#1a1a2e', color: '#e0e0e0' };
        if (atmosphere.mood_theme === 'energetic') return { backgroundColor: '#fdf2f8', color: '#1f2937' };
        return {};
    };

    return (
        <div
            className={`min-h-screen flex transition-colors duration-1000 ${atmosphere.mood_theme === 'default' ? 'bg-gray-100' : 'bg-transparent'}`}
            style={getBgStyle()}
        >
            <Sidebar />
            <AIAgent />
            <NotificationToast />
            <div className={`flex-1 flex flex-col md:pl-64 transition-all duration-300 ${atmosphere.mood_theme !== 'default' ? 'bg-transparent' : ''}`}>
                <main className="flex-1 py-10 bg-transparent">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 bg-transparent">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
