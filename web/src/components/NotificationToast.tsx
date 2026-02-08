'use client';

import { useAIAgent, Notification } from '@/context/AIAgentContext';
import { useEffect, useState } from 'react';
import { XMarkIcon, CheckCircleIcon, InformationCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

export default function NotificationToast() {
    const { notifications, markAsRead } = useAIAgent();
    const [toasts, setToasts] = useState<Notification[]>([]);

    // Watch for new notifications
    useEffect(() => {
        const latest = notifications[0];
        if (latest && !latest.read) {
            // Check if we already showed this one to avoid duplicate toasts on re-renders
            // (Simulated check: usually we'd track "shown" IDs, but for now strict equality works if context doesn't mutate unnecessarily)
            setToasts(prev => {
                if (prev.find(t => t.id === latest.id)) return prev;
                return [latest, ...prev].slice(0, 5); // Limit to 5 stacking toasts
            });

            // Auto-dismiss after 5 seconds
            const timer = setTimeout(() => {
                setToasts(prev => prev.filter(t => t.id !== latest.id));
            }, 5000);

            return () => clearTimeout(timer);
        }
    }, [notifications]);

    const removeToast = (id: string) => {
        setToasts(prev => prev.filter(t => t.id !== id));
        // Optional: Mark as read when closed?
        // markAsRead(id); 
    };

    const getIcon = (type: string) => {
        switch (type) {
            case 'success': return <CheckCircleIcon className="h-6 w-6 text-green-400" />;
            case 'warning': return <ExclamationTriangleIcon className="h-6 w-6 text-yellow-400" />;
            default: return <InformationCircleIcon className="h-6 w-6 text-blue-400" />;
        }
    };

    return (
        <div className="fixed top-4 right-4 z-50 flex flex-col space-y-4 w-full max-w-sm pointer-events-none">
            {toasts.map((toast) => (
                <div
                    key={toast.id}
                    className="bg-white border-l-4 border-indigo-500 rounded-r-md shadow-lg pointer-events-auto transform transition-all duration-300 ease-in-out animate-slide-in-right flex ring-1 ring-black ring-opacity-5"
                >
                    <div className="p-4 flex items-start w-full">
                        <div className="flex-shrink-0">
                            {getIcon(toast.type)}
                        </div>
                        <div className="ml-3 w-0 flex-1 pt-0.5">
                            <p className="text-sm font-medium text-gray-900">{toast.title}</p>
                            <p className="mt-1 text-sm text-gray-500">{toast.message}</p>
                        </div>
                        <div className="ml-4 flex-shrink-0 flex">
                            <button
                                className="bg-white rounded-md inline-flex text-gray-400 hover:text-gray-500 focus:outline-none"
                                onClick={() => removeToast(toast.id)}
                            >
                                <span className="sr-only">Close</span>
                                <XMarkIcon className="h-5 w-5" />
                            </button>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
