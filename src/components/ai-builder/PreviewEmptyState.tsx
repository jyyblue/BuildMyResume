import { Sparkles, FileText, MousePointerClick, LayoutTemplate } from 'lucide-react';
import React from 'react';

interface PreviewEmptyStateProps {
    onSuggestionClick: (prompt: string) => void;
}

import { aiSuggestions } from '@/constants/aiSuggestions';

export function PreviewEmptyState({ onSuggestionClick }: PreviewEmptyStateProps) {
    const suggestions = aiSuggestions;

    return (
        <div className="absolute inset-0 overflow-y-auto overflow-x-hidden bg-gray-50/50 dark:bg-gray-900/50">
            {/* Background Decorations */}
            <div className="fixed top-1/4 left-1/4 w-96 h-96 bg-blue-100 dark:bg-blue-900/20 rounded-full mix-blend-multiply dark:mix-blend-lighten filter blur-3xl opacity-30 animate-pulse pointer-events-none"></div>
            <div className="fixed bottom-1/4 right-1/4 w-96 h-96 bg-purple-100 dark:bg-purple-900/20 rounded-full mix-blend-multiply dark:mix-blend-lighten filter blur-3xl opacity-30 animate-pulse pointer-events-none" style={{ animationDelay: '2s' }}></div>

            {/* Central Content */}
            <div className="min-h-full w-full flex flex-col items-center justify-center p-6 pb-24 sm:pb-12 relative z-10">
                <div className="flex flex-col items-center text-center max-w-lg w-full mt-auto mb-auto">
                    <div className="w-20 h-20 mb-6 rounded-2xl bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700 flex items-center justify-center relative">
                        <FileText className="w-10 h-10 text-gray-300 dark:text-gray-600 absolute" strokeWidth={1} />
                        <Sparkles className="w-6 h-6 text-blue-500 absolute bottom-4 right-4 animate-bounce" />
                    </div>

                    <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-3 tracking-tight">Your Resume Canvas</h2>
                    <p className="text-gray-500 dark:text-gray-400 mb-8 leading-relaxed">
                        Start chatting with the AI on the left to instantly generate a beautiful, ATS-optimized resume. Watch it build right here in real-time.
                    </p>

                    {/* Suggestions */}
                    <div className="w-full relative z-20">
                        <div className="flex items-center justify-center gap-2 text-sm font-medium text-gray-400 dark:text-gray-500 mb-4">
                            <MousePointerClick className="w-4 h-4" />
                            <span>Try asking for:</span>
                        </div>
                        <div className="flex flex-wrap justify-center gap-2">
                            {suggestions.map((s, i) => (
                                <button
                                    key={i}
                                    onClick={() => onSuggestionClick(s)}
                                    className="text-xs bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700 hover:text-blue-600 dark:hover:text-blue-400 transition-colors shadow-sm rounded-full px-4 py-2 text-gray-600 dark:text-gray-300 font-medium"
                                >
                                    {s}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
