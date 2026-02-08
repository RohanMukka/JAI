'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

type Message = {
    id: string;
    text: string;
    sender: 'user' | 'system' | 'future-me';
    timestamp: Date;
};

type AIAgentContextType = {
    messages: Message[];
    addMessage: (text: string, sender: 'user' | 'system' | 'future-me') => void;
    isOpen: boolean;
    toggleOpen: () => void;
    triggerAgent: (text: string) => void;
};

const AIAgentContext = createContext<AIAgentContextType | undefined>(undefined);

export function AIAgentProvider({ children }: { children: ReactNode }) {
    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            text: "Hi! I'm your JAI agent. I'll help you track your applications.",
            sender: 'system',
            timestamp: new Date()
        }
    ]);
    const [isOpen, setIsOpen] = useState(false);

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
    };

    return (
        <AIAgentContext.Provider value={{ messages, addMessage, isOpen, toggleOpen, triggerAgent }}>
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
