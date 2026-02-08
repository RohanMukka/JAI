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
    triggerAgent: (text: string) => void;
    atmosphere: {
        mood_theme: 'default' | 'calm' | 'energetic';
        action?: string;
    };
    updateAtmosphere: (mood: 'default' | 'calm' | 'energetic', action?: string) => void;
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
    const [atmosphere, setAtmosphere] = useState<AIAgentContextType['atmosphere']>({ mood_theme: 'default' });

    const unreadCount = notifications.filter(n => !n.read).length;

    const addNotification = (title: string, message: string, type: Notification['type'] = 'info') => {
        setTimeout(() => {
            setNotifications(prev => {
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

    const triggerAgent = (text: string) => {
        addNotification('System Update', text, 'info');
    };

    const updateAtmosphere = (mood: 'default' | 'calm' | 'energetic', action?: string) => {
        setAtmosphere({ mood_theme: mood, action });
    };

    return (
        <AIAgentContext.Provider value={{
            notifications,
            unreadCount,
            addNotification,
            markAsRead,
            markAllAsRead,
            triggerAgent,
            atmosphere,
            updateAtmosphere
        }}>
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
