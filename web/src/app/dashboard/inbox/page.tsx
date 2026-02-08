'use client';

import { useAIAgent } from '@/context/AIAgentContext';
import { CheckCircleIcon, InformationCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

export default function InboxPage() {
    const { notifications, markAsRead, markAllAsRead } = useAIAgent();

    const getIcon = (type: string) => {
        switch (type) {
            case 'success': return <CheckCircleIcon className="h-6 w-6 text-green-500" />;
            case 'warning': return <ExclamationTriangleIcon className="h-6 w-6 text-yellow-500" />;
            default: return <InformationCircleIcon className="h-6 w-6 text-blue-500" />;
        }
    };

    return (
        <div className="max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Inbox</h1>
                {notifications.some(n => !n.read) && (
                    <button
                        onClick={markAllAsRead}
                        className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
                    >
                        Mark all as read
                    </button>
                )}
            </div>

            <div className="bg-white shadow overflow-hidden sm:rounded-md">
                <ul className="divide-y divide-gray-200">
                    {notifications.length === 0 ? (
                        <li className="px-4 py-8 text-center text-gray-500">
                            No notifications yet.
                        </li>
                    ) : (
                        notifications.map((notification) => (
                            <li
                                key={notification.id}
                                className={`px-4 py-4 sm:px-6 hover:bg-gray-50 transition-colors cursor-pointer ${notification.read ? 'bg-white' : 'bg-blue-50'}`}
                                onClick={() => markAsRead(notification.id)}
                            >
                                <div className="flex items-start space-x-4">
                                    <div className="flex-shrink-0 pt-1">
                                        {getIcon(notification.type)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-start">
                                            <p className={`text-sm font-medium ${notification.read ? 'text-gray-900' : 'text-blue-900 font-bold'}`}>
                                                {notification.title}
                                            </p>
                                            <p className="text-xs text-gray-500 flex-shrink-0">
                                                {new Date(notification.timestamp).toLocaleString()}
                                            </p>
                                        </div>
                                        <p className={`mt-1 text-sm ${notification.read ? 'text-gray-500' : 'text-gray-900'}`}>
                                            {notification.message}
                                        </p>
                                    </div>
                                    {!notification.read && (
                                        <div className="flex-shrink-0 self-center">
                                            <div className="h-2 w-2 rounded-full bg-blue-600"></div>
                                        </div>
                                    )}
                                </div>
                            </li>
                        ))
                    )}
                </ul>
            </div>
        </div>
    );
}
