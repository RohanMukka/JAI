'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

export type Notification = {
    id: string;
    title: string;
    message: string;
    timestamp: Date;
    read: boolean;
    type: 'info' | 'success' | 'warning';
};

type AIAgentContextType = {
    notifications: Notification[];
    unreadCount: number;
    addNotification: (title: string, message: string, type?: Notification['type']) => void;
    markAsRead: (id: string) => void;
    markAllAsRead: () => void;
    triggerAgent: (text: string) => void; // Kept for backward compatibility with Tracker
};

const AIAgentContext = createContext<AIAgentContextType | undefined>(undefined);

export function AIAgentProvider({ children }: { children: ReactNode }) {
    const [notifications, setNotifications] = useState<Notification[]>([
        {
            id: '1',
            title: 'Welcome to JAI',
            message: "I'm here to help you track your applications.",
            timestamp: new Date(),
            read: false,
            type: 'info'
        }
    ]);

    const unreadCount = notifications.filter(n => !n.read).length;

    const addNotification = (title: string, message: string, type: Notification['type'] = 'info') => {
        // Wrap in setTimeout to avoid "Cannot update component while rendering" errors
        setTimeout(() => {
            setNotifications(prev => {
                // Check for duplicates within the last second
                const now = new Date();
                const recentDuplicate = prev.find(n =>
                    n.title === title &&
                    n.message === message &&
                    (now.getTime() - n.timestamp.getTime() < 1000)
                );

                if (recentDuplicate) return prev;

                return [{
                    id: Date.now().toString(),
                    title,
                    message,
                    timestamp: now,
                    read: false,
                    type
                }, ...prev];
            });
        }, 0);
    };

    const markAsRead = (id: string) => {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    };

    const markAllAsRead = () => {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    };

    // Alias for compatibility: Tracker calls this to "trigger agent", now it adds a notification
    const triggerAgent = (text: string) => {
        addNotification('System Update', text, 'info');
    };

    return (
        <AIAgentContext.Provider value={{ notifications, unreadCount, addNotification, markAsRead, markAllAsRead, triggerAgent }}>
            {children}
        </AIAgentContext.Provider>
    );
}

export function useAIAgent() {
    const context = useContext(AIAgentContext);
    if (context === undefined) {
        throw new Error('useAIAgent must be used within an AIAgentProvider');
    }
    return context;
}
