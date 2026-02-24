import { Loader2 } from 'lucide-react';
import React, { useEffect, useState } from 'react';

import { LOADING_MESSAGES } from '../../constants/loadingMessages';

export function PreviewLoadingState() {
    const [messageIndex, setMessageIndex] = useState(0);
    const [messages, setMessages] = useState<string[]>([]);

    useEffect(() => {
        // Shuffle messages on mount so they are different every time
        const shuffled = [...LOADING_MESSAGES].sort(() => 0.5 - Math.random());
        setMessages(shuffled);
    }, []);

    // Cycle messages every 4 seconds
    useEffect(() => {
        if (messages.length === 0) return;
        const interval = setInterval(() => {
            setMessageIndex((prev) => (prev + 1) % messages.length);
        }, 4000);
        return () => clearInterval(interval);
    }, [messages.length]);

    return (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-gray-50/80 dark:bg-gray-950/80 backdrop-blur-sm overflow-hidden px-6">
            <div className="flex flex-col items-center max-w-2xl w-full text-center">
                <div className="relative mb-8">
                    <div className="absolute inset-0 bg-blue-100 dark:bg-blue-900/40 rounded-full animate-ping opacity-75"></div>
                    <div className="relative bg-white dark:bg-gray-800 rounded-full p-4 shadow-md border border-gray-50 dark:border-gray-700">
                        <Loader2 className="w-10 h-10 text-blue-600 dark:text-blue-400 animate-spin" />
                    </div>
                </div>

                <div className="h-24 relative overflow-hidden w-full flex justify-center items-center">
                    {messages.map((msg, idx) => {
                        const isCurrent = idx === messageIndex;
                        const isPast = idx < messageIndex || (messageIndex === 0 && idx === messages.length - 1);

                        let yTransform = "translate-y-12"; // Below (incoming)
                        let opacity = "opacity-0";

                        if (isCurrent) {
                            yTransform = "translate-y-0"; // Center
                            opacity = "opacity-100";
                        } else if (isPast) {
                            yTransform = "-translate-y-12"; // Above (outgoing)
                            opacity = "opacity-0";
                        }

                        return (
                            <div
                                key={idx}
                                className={`absolute inset-x-0 w-full flex items-center justify-center transition-all duration-500 ease-in-out ${yTransform} ${opacity}`}
                            >
                                <span className="font-medium text-lg leading-relaxed text-gray-700 dark:text-gray-200">
                                    {msg}
                                </span>
                            </div>
                        );
                    })}
                </div>

                <p className="text-sm text-gray-400 dark:text-gray-500 mt-6 animate-pulse font-medium">
                    AI is crafting your perfect resume
                </p>
            </div>
        </div>
    );
}
