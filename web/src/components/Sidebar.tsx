'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import {
    HomeIcon,
    BriefcaseIcon,
    UserIcon,
    ChartBarIcon,
    ClockIcon,
    AdjustmentsHorizontalIcon,
    BellIcon
} from '@heroicons/react/24/outline'; // You might need to install heroicons if not present, otherwise use simple svgs
import { useAIAgent } from '@/context/AIAgentContext';

const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
    { name: 'Jobs', href: '/dashboard/jobs', icon: BriefcaseIcon },
    { name: 'Tracker', href: '/dashboard/tracker', icon: ChartBarIcon },
    { name: 'Future Me', href: '/dashboard/future-me', icon: ClockIcon },
    { name: 'Filters', href: '/dashboard/filters', icon: AdjustmentsHorizontalIcon },
    { name: 'Inbox', href: '/dashboard/inbox', icon: BellIcon },
    { name: 'Profile', href: '/dashboard/profile', icon: UserIcon },
];

function classNames(...classes: string[]) {
    return classes.filter(Boolean).join(' ');
}

export default function Sidebar() {
    const pathname = usePathname();
    const { unreadCount } = useAIAgent();

    return (
        <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0">
            <div className="flex-1 flex flex-col min-h-0 border-r border-gray-200 bg-white">
                <div className="flex items-center flex-shrink-0 px-6 pt-6 pb-4">
                    <h1 className="text-2xl font-bold text-indigo-600 tracking-tight">JAI</h1>
                </div>
                <div className="flex-1 flex flex-col overflow-y-auto">
                    <nav className="flex-1 px-4 space-y-1 mt-4">
                        {navigation.map((item) => {
                            const isActive = pathname === item.href;
                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className={classNames(
                                        isActive
                                            ? 'bg-indigo-50 text-indigo-600'
                                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
                                        'group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors duration-150 ease-in-out'
                                    )}
                                >
                                    <item.icon
                                        className={classNames(
                                            isActive ? 'text-indigo-600' : 'text-gray-400 group-hover:text-gray-500',
                                            'mr-3 flex-shrink-0 h-5 w-5'
                                        )}
                                        aria-hidden="true"
                                    />
                                    {item.name}
                                        isActive ? 'bg-indigo-50 text-indigo-600' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
                                        'group flex items-center px-2 py-2 text-sm font-medium rounded-md justify-between'
                                    )}
                                >
                                    <div className="flex items-center">
                                        <item.icon
                                            className={classNames(
                                                isActive ? 'text-indigo-600' : 'text-gray-400 group-hover:text-gray-500',
                                                'mr-3 flex-shrink-0 h-6 w-6'
                                            )}
                                            aria-hidden="true"
                                        />
                                        {item.name}
                                    </div>
                                    {item.name === 'Inbox' && unreadCount > 0 && (
                                        <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                                            {unreadCount}
                                        </span>
                                    )}
                                </Link>
                            );
                        })}
                    </nav>
                </div>
                <div className="flex-shrink-0 flex border-t border-gray-100 p-4">
                    <Link href="/api/auth/signout" className="flex-shrink-0 w-full group block">
                        <div className="flex items-center">
                            <div className="ml-3">
                                <p className="text-sm font-medium text-gray-700 group-hover:text-gray-900">Sign Out</p>
                            </div>
                        </div>
                    </Link>
                </div>
            </div>
        </div>
    );
}
