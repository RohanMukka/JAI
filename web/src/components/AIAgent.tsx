'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAIAgent } from '@/context/AIAgentContext';

export default function AIAgent() {
    const { notifications, updateAtmosphere } = useAIAgent();
    const [position, setPosition] = useState({ right: 20, bottom: 20 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
    const [isHovered, setIsHovered] = useState(false);

    // Initial Positioning
    useEffect(() => {
        setPosition({
            right: 40,
            bottom: 40
        });
    }, []);

    // Script injection
    useEffect(() => {
        if (typeof window !== 'undefined' && !document.querySelector('script[src*="convai-widget"]')) {
            const script = document.createElement('script');
            script.src = "https://elevenlabs.io/convai-widget/index.js";
            script.async = true;
            document.head.appendChild(script);
        }
    }, []);

    // Drag Logic
    const handleMouseDown = (e: React.MouseEvent) => {
        setIsDragging(true);
        // Calculate offset from the RIGHT and BOTTOM edges
        setDragOffset({
            x: (window.innerWidth - e.clientX) - position.right,
            y: (window.innerHeight - e.clientY) - position.bottom
        });
        e.preventDefault();
        e.stopPropagation();
    };

    const handleMouseMove = useCallback((e: MouseEvent) => {
        if (isDragging) {
            const newRight = (window.innerWidth - e.clientX) - dragOffset.x;
            const newBottom = (window.innerHeight - e.clientY) - dragOffset.y;

            // Bounds: keep it within screen but away from edges
            setPosition({
                right: Math.max(20, Math.min(window.innerWidth - 100, newRight)),
                bottom: Math.max(20, Math.min(window.innerHeight - 100, newBottom))
            });
        }
    }, [isDragging, dragOffset]);

    const handleMouseUp = useCallback(() => {
        setIsDragging(false);
    }, []);

    useEffect(() => {
        if (isDragging) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
        }
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging, handleMouseMove, handleMouseUp]);

    // Atmosphere Tool Bridging
    useEffect(() => {
        const handleToolCall = (event: any) => {
            const { name, parameters } = event.detail;
            if (name === "update_ui_atmosphere") {
                updateAtmosphere(parameters.mood_theme || 'default', parameters.action);
                if (event.detail.resolve) event.detail.resolve("UI updated.");
            }
        };
        window.addEventListener('elevenlabs-convai:call', handleToolCall);
        return () => window.removeEventListener('elevenlabs-convai:call', handleToolCall);
    }, [updateAtmosphere]);

    return (
        <div
            style={{
                position: 'fixed',
                bottom: `${position.bottom}px`,
                right: `${position.right}px`,
                zIndex: 2147483647,
                cursor: isDragging ? 'grabbing' : 'auto',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-end', // Items align to the right edge (the anchor)
                pointerEvents: 'none',
                maxWidth: '90vw'
            }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* SMALL DRAG HANDLE */}
            <div
                onMouseDown={handleMouseDown}
                className={`w-9 h-9 bg-indigo-600 border-2 border-white text-white rounded-full cursor-grab active:cursor-grabbing shadow-lg flex items-center justify-center mb-2 transition-all duration-300 pointer-events-auto ${isDragging || (isHovered && !isDragging) ? 'scale-110 opacity-100' : 'opacity-60'}`}
            >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75v4.5m0-4.5h-4.5m4.5 0L15 9m5.25 11.25v-4.5m0 4.5h-4.5m4.5 0L15 15" />
                </svg>
            </div>

            {/* Force widget to be relative and movable with this div */}
            <div className="pointer-events-auto flex flex-col items-end">
                <elevenlabs-convai
                    agent-id="agent_9601kgz2gfs9fg7trsaz4dqew3ep"
                    action-text="Talk with future you"
                    expand-text="Talk with future you"
                    chat-title="Talk with future you"
                    type="standalone"
                    variant="expanded"
                ></elevenlabs-convai>
            </div>

            <style jsx global>{`
                elevenlabs-convai {
                    position: relative !important;
                    display: block !important;
                    inset: auto !important;
                    width: 400px !important;
                    /* Remove height constraints to let internal layout breathe */
                }
            `}</style>
        </div>
    );
}

declare global {
    namespace JSX {
        interface IntrinsicElements {
            'elevenlabs-convai': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & {
                'agent-id': string;
                'branch-id'?: string;
                'dynamic-variables'?: string;
                'avatar-orb-color-1'?: string;
                'avatar-orb-color-2'?: string;
                'action-text'?: string;
                'expand-text'?: string;
                'chat-title'?: string;
                'start-call-text'?: string;
                'variant'?: string;
                'type'?: string;
            }, HTMLElement>;
        }
    }
}
