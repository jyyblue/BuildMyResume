/**
 * Chat History Modal
 * 
 * Shows a list of past chat sessions with title, time, and message count.
 * Users can switch to a past chat, rename titles inline, or delete chats.
 */
import { useState, useEffect, useRef } from 'react';
import { MessageSquare, Trash2, Clock, MessageCircle, Pencil, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { getAllSessions, deleteSession, renameSession, clearAllSessions, type AISessionSummary } from '@/utils/aiBuilderDB';

interface ChatHistoryModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    activeSessionId: string | null;
    onSelectSession: (id: string) => void;
    onSessionDeleted?: () => void;
    onSessionRenamed?: (id: string, newTitle: string) => void;
}

/** Format relative time like "2 hours ago", "3 days ago" */
function timeAgo(dateStr: string): string {
    const now = Date.now();
    const then = new Date(dateStr).getTime();
    const diff = now - then;
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    const weeks = Math.floor(days / 7);
    if (weeks < 4) return `${weeks}w ago`;
    return new Date(dateStr).toLocaleDateString();
}

export default function ChatHistoryModal({
    open,
    onOpenChange,
    activeSessionId,
    onSelectSession,
    onSessionDeleted,
    onSessionRenamed,
}: ChatHistoryModalProps) {
    const [sessions, setSessions] = useState<AISessionSummary[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editTitle, setEditTitle] = useState('');
    const editInputRef = useRef<HTMLInputElement>(null);

    // Load sessions when modal opens
    useEffect(() => {
        if (!open) return;
        setLoading(true);
        setEditingId(null);
        getAllSessions().then(s => {
            setSessions(s);
            setLoading(false);
        });
    }, [open]);

    // Focus input when editing starts
    useEffect(() => {
        if (editingId) {
            setTimeout(() => editInputRef.current?.focus(), 50);
        }
    }, [editingId]);

    const handleDelete = async (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        if (!window.confirm('Delete this chat? This cannot be undone.')) return;
        await deleteSession(id);
        setSessions(prev => prev.filter(s => s.id !== id));
        if (id === activeSessionId) {
            onSessionDeleted?.();
        }
    };

    const handleClearAll = async () => {
        if (!window.confirm('Delete ALL chat history? This cannot be undone.')) return;
        await clearAllSessions();
        setSessions([]);
        onSessionDeleted?.();
        onOpenChange(false);
    };

    const handleSelect = (id: string) => {
        if (editingId) return; // Don't switch while editing
        if (id === activeSessionId) {
            onOpenChange(false);
            return;
        }
        onSelectSession(id);
        onOpenChange(false);
    };

    const startRename = (e: React.MouseEvent, session: AISessionSummary) => {
        e.stopPropagation();
        setEditingId(session.id);
        setEditTitle(session.title);
    };

    const confirmRename = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!editingId || !editTitle.trim()) return;
        await renameSession(editingId, editTitle.trim());
        setSessions(prev => prev.map(s =>
            s.id === editingId ? { ...s, title: editTitle.trim() } : s
        ));
        onSessionRenamed?.(editingId, editTitle.trim());
        setEditingId(null);
    };

    const cancelRename = (e: React.MouseEvent) => {
        e.stopPropagation();
        setEditingId(null);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="w-[calc(100vw-2rem)] max-w-md sm:max-w-lg overflow-hidden p-4 sm:p-6 rounded-xl">
                <DialogHeader className="text-left mb-2 sm:mb-0">
                    <DialogTitle className="flex items-center gap-2 text-lg">
                        <Clock className="w-5 h-5 text-blue-500" />
                        Chat History
                    </DialogTitle>
                    <DialogDescription className="text-left text-xs sm:text-sm">
                        Switch between your previous resume chats
                    </DialogDescription>
                </DialogHeader>

                <ScrollArea className="max-h-[400px]">
                    {loading ? (
                        <div className="flex items-center justify-center py-12 text-gray-400">
                            <div className="animate-spin w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full" />
                        </div>
                    ) : sessions.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                            <MessageSquare className="w-10 h-10 mb-3 opacity-40" />
                            <p className="text-sm font-medium">No chat history yet</p>
                            <p className="text-xs mt-1">Your conversations will appear here</p>
                        </div>
                    ) : (
                        <div className="space-y-1 p-1">
                            {sessions.map((session) => {
                                const isActive = session.id === activeSessionId;
                                const isEditing = editingId === session.id;
                                return (
                                    <div
                                        key={session.id}
                                        onClick={() => handleSelect(session.id)}
                                        role="button"
                                        className={`
                                            w-full text-left px-3 py-3 rounded-lg transition-all duration-150 
                                            flex items-center gap-3 group relative cursor-pointer
                                            ${isActive
                                                ? 'bg-blue-50 dark:bg-blue-950/40 ring-2 ring-inset ring-blue-300 dark:ring-blue-700'
                                                : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'
                                            }
                                        `}
                                    >
                                        {/* Chat icon */}
                                        <div className={`
                                            w-9 h-9 rounded-lg flex items-center justify-center shrink-0
                                            ${isActive
                                                ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-600'
                                                : 'bg-gray-100 dark:bg-gray-800 text-gray-500'
                                            }
                                        `}>
                                            <MessageCircle className="w-4 h-4" />
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1 min-w-0 pr-16 sm:pr-14">
                                            {isEditing ? (
                                                <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                                                    <input
                                                        ref={editInputRef}
                                                        value={editTitle}
                                                        onChange={(e) => setEditTitle(e.target.value)}
                                                        onKeyDown={(e) => {
                                                            if (e.key === 'Enter') confirmRename(e as any);
                                                            if (e.key === 'Escape') cancelRename(e as any);
                                                        }}
                                                        className="text-sm font-medium w-full bg-white dark:bg-gray-700 border border-blue-300 dark:border-blue-600 rounded px-2 py-1 outline-none focus:ring-1 focus:ring-blue-400 text-gray-800 dark:text-gray-200"
                                                        maxLength={60}
                                                    />
                                                    <button onClick={confirmRename} className="p-1 text-green-500 hover:text-green-600" title="Save">
                                                        <Check className="w-3.5 h-3.5" />
                                                    </button>
                                                    <button onClick={cancelRename} className="p-1 text-gray-400 hover:text-gray-600" title="Cancel">
                                                        <X className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                            ) : (
                                                <>
                                                    <div className="flex items-center gap-2">
                                                        <span className={`text-sm font-medium ${isActive ? 'text-blue-700 dark:text-blue-300' : 'text-gray-800 dark:text-gray-200'}`}>
                                                            {session.title.length > 25 ? session.title.slice(0, 25) + '…' : session.title}
                                                        </span>
                                                        {isActive && (
                                                            <span className="text-[10px] font-semibold uppercase tracking-wider text-blue-500 bg-blue-100 dark:bg-blue-900/50 px-1.5 py-0.5 rounded shrink-0 hidden sm:inline-block">
                                                                Active
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center gap-2 mt-0.5">
                                                        <span className="text-xs text-gray-400">
                                                            {timeAgo(session.updatedAt)}
                                                        </span>
                                                        <span className="text-xs text-gray-300 dark:text-gray-600">•</span>
                                                        <span className="text-xs text-gray-400">
                                                            {session.messageCount} messages
                                                        </span>
                                                    </div>
                                                </>
                                            )}
                                        </div>

                                        {/* Action buttons — absolutely positioned */}
                                        {!isEditing && (
                                            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-0.5 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-all bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm sm:bg-transparent sm:backdrop-blur-none p-1 sm:p-0 rounded-lg">
                                                <button
                                                    onClick={(e) => startRename(e, session)}
                                                    className="p-1.5 rounded-md hover:bg-blue-50 dark:hover:bg-blue-950/30 text-gray-500 hover:text-blue-500 transition-all"
                                                    title="Rename chat"
                                                >
                                                    <Pencil className="w-3.5 h-3.5" />
                                                </button>
                                                <button
                                                    onClick={(e) => handleDelete(e, session.id)}
                                                    className="p-1.5 rounded-md hover:bg-red-50 dark:hover:bg-red-950/30 text-gray-500 hover:text-red-500 transition-all"
                                                    title="Delete chat"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </ScrollArea>

                {sessions.length > 0 && (
                    <div className="flex justify-end pt-2 border-t">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleClearAll}
                            className="text-xs text-gray-400 hover:text-red-500"
                        >
                            <Trash2 className="w-3 h-3 mr-1.5" />
                            Delete All
                        </Button>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
