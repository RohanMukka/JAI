'use client';

import { useEffect, useState } from 'react';
import { useAIAgent } from '@/context/AIAgentContext';

export default function AIAgent() {
    useEffect(() => {
        const script = document.createElement('script');
        script.src = "https://unpkg.com/@elevenlabs/convai-widget-embed";
        script.async = true;
        script.type = "text/javascript";
        document.body.appendChild(script);

        return () => {
            document.body.removeChild(script);
        };
    }, []);

    const { notifications } = useAIAgent();
    const [dynamicVars, setDynamicVars] = useState<string>('{}');

    useEffect(() => {
        // Find the latest unread system notification to pass as context
        const latestNotification = notifications[0]; // Assuming newest first
        if (latestNotification && !latestNotification.read) {
            setDynamicVars(JSON.stringify({
                latest_update: `${latestNotification.title}: ${latestNotification.message}`,
                context: "The user has new unread system notifications."
            }));
        }
    }, [notifications]);

    return (
        <elevenlabs-convai
            agent-id="agent_8701kgx4h2c9eax9ba1ayp52ysyb"
            dynamic-variables={dynamicVars}
        ></elevenlabs-convai>
    );
}

// Add TypeScript definition for the custom element
declare global {
    namespace JSX {
        interface IntrinsicElements {
            'elevenlabs-convai': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & { 'agent-id': string; 'dynamic-variables'?: string }, HTMLElement>;
        }
    }
}
