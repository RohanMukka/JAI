'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

// --- Chat Types ---
type Message = {
    id: string;
    text: string;
    sender: 'user' | 'system' | 'future-me';
    timestamp: Date;
};

// --- Notification Types (Legacy support for Sidebar/other components) ---
export type Notification = {
    id: string;
    title: string;
    message: string;
    timestamp: Date;
    read: boolean;
    type: 'info' | 'success' | 'warning';
};

type AIAgentContextType = {
    // Chat State
    messages: Message[];
    addMessage: (text: string, sender: 'user' | 'system' | 'future-me') => void;
    isOpen: boolean;
    toggleOpen: () => void;
    triggerAgent: (text: string) => void;

    // Profile State (For Jobs Page)
    userProfile: { skills: string[] };
    updateProfile: (newProfile: { skills: string[] }) => void;

    // Legacy/Sidebar Support
    notifications: Notification[];
    unreadCount: number;
    atmosphere: {
        mood_theme: 'default' | 'calm' | 'energetic';
        action?: string;
    };
    updateAtmosphere: (mood: 'default' | 'calm' | 'energetic', action?: string) => void;
    addNotification: (title: string, message: string, type?: Notification['type']) => void;
    markAsRead: (id: string) => void;
    markAllAsRead: () => void;
};

const AIAgentContext = createContext<AIAgentContextType | undefined>(undefined);

export function AIAgentProvider({ children }: { children: ReactNode }) {
    // --- Chat State ---
    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            text: "Hi! I'm your JAI agent. I'll help you track your applications.",
            sender: 'system',
            timestamp: new Date()
        }
    ]);
    const [isOpen, setIsOpen] = useState(false);

    // --- Profile State ---
    const [userProfile, setUserProfile] = useState<{ skills: string[] }>({
        skills: ['Python', 'React', 'SQL']
    });

    // --- Legacy/Notification State ---
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [atmosphere, setAtmosphere] = useState<{ mood_theme: 'default' | 'calm' | 'energetic', action?: string }>({
        mood_theme: 'default'
    });

    // --- Helpers ---
    const addMessage = (text: string, sender: 'user' | 'system' | 'future-me') => {
        setMessages(prev => [...prev, {
            id: Date.now().toString(),
            text,
            sender,
            timestamp: new Date()
        }]);
    };

    const toggleOpen = () => setIsOpen(prev => !prev);

    const triggerAgent = (text: string) => {
        addMessage(text, 'system');
        setIsOpen(true);
        // Also add notification for backward compatibility if needed, or just log
    };

    const updateProfile = (newProfile: { skills: string[] }) => {
        setUserProfile(prev => ({ ...prev, ...newProfile }));
    };

    const updateAtmosphere = (mood: 'default' | 'calm' | 'energetic', action?: string) => {
        setAtmosphere({ mood_theme: mood, action });
    };

    const addNotification = (title: string, message: string, type: Notification['type'] = 'info') => {
        setNotifications(prev => [{
            id: Date.now().toString(),
            title,
            message,
            timestamp: new Date(),
            read: false,
            type
        }, ...prev]);
    };

    const markAsRead = (id: string) => {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    };

    const markAllAsRead = () => {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    };

    // Derived State
    // Unread count can be from messages or notifications. For Sidebar 'Inbox', let's use notifications count
    // but if that is empty, maybe messages? Sidebar explicitly checked 'Inbox'.
    // Let's assume Inbox == Notifications for now to satisfy the Sidebar "BellIcon".
    const unreadCount = notifications.filter(n => !n.read).length;

    return (
        <AIAgentContext.Provider value={{
            messages,
            addMessage,
            isOpen,
            toggleOpen,
            triggerAgent,
            userProfile,
            updateProfile,
            notifications,
            unreadCount,
            atmosphere,
            updateAtmosphere,
            addNotification,
            markAsRead,
            markAllAsRead
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
