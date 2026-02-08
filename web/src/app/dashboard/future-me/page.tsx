'use client';

import { useState, useRef, useEffect } from 'react';
import { useAIAgent } from '@/context/AIAgentContext';
import { PaperAirplaneIcon } from '@heroicons/react/24/outline';

export default function FutureMePage() {
    const { messages, addMessage } = useAIAgent();
    const [input, setInput] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim()) return;

        addMessage(input, 'user');
        setInput('');

        // Simulate Future Me response
        setTimeout(() => {
            const futureResponses = [
                "In 5 years, you'll look back at this moment and realize it was pivotal.",
                "Keep pushing! I remember when we were stressing about this applications, but it paid off.",
                "Networking is key. Have you reached out to that connection at TechCorp yet?",
                "Don't worry about the rejection. A better offer is coming next month."
            ];
            const randomResponse = futureResponses[Math.floor(Math.random() * futureResponses.length)];
            addMessage(randomResponse, 'future-me');
        }, 1500);
    };

    const futureMeMessages = messages.filter(msg => msg.sender === 'user' || msg.sender === 'future-me');

    return (
        <div className="h-[calc(100vh-8rem)] flex flex-col bg-white rounded-lg shadow overflow-hidden">
            <div className="bg-purple-600 p-4 text-white">
                <h2 className="text-xl font-bold">Chat with Future Me</h2>
                <p className="text-purple-200 text-sm">Gain perspective from your future self.</p>
            </div>

            {/* Messages Area */}
            <div className="flex-1 p-6 overflow-y-auto space-y-6 bg-gray-50">
                {futureMeMessages.length === 0 && (
                    <div className="text-center text-gray-500 mt-10">
                        <p>Start a conversation to hear from your future self.</p>
                    </div>
                )}

                {futureMeMessages.map((msg) => (
                    <div
                        key={msg.id}
                        className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                        <div className="flex flex-col max-w-[70%]">
                            <div
                                className={`rounded-2xl p-4 text-sm shadow-sm ${msg.sender === 'user'
                                        ? 'bg-indigo-600 text-white rounded-br-none'
                                        : 'bg-purple-100 text-purple-900 border border-purple-200 rounded-bl-none'
                                    }`}
                            >
                                <p>{msg.text}</p>
                            </div>
                            <span className={`text-xs mt-1 ${msg.sender === 'user' ? 'text-right text-gray-500' : 'text-left text-gray-500'}`}>
                                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                        </div>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white border-t border-gray-200">
                <form onSubmit={handleSubmit} className="flex space-x-4">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Ask your future self..."
                        className="flex-1 border border-gray-300 rounded-full px-6 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                    <button
                        type="submit"
                        disabled={!input.trim()}
                        className="bg-purple-600 text-white rounded-full p-3 hover:bg-purple-700 transition-colors disabled:opacity-50"
                    >
                        <PaperAirplaneIcon className="h-6 w-6" />
                    </button>
                </form>
            </div>
        </div>
    );
}
