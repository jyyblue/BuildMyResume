import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Bot, User, Sparkles, Send, Download, ArrowLeft, Loader2, RefreshCw, Trash2, History, Plus, Paperclip, X, FileText, MessageSquare, ZoomIn, ZoomOut, Maximize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { ResumeSchema, createEmptyResume, generateId } from "@/types/resume";
import { useReactToPrint } from "react-to-print";
import { AppNavigation } from "@/components/AppNavigation";
import UniversalRenderer from "@/components/ai-builder/UniversalRenderer";
import type { AIResumeData, OnEditFn } from "@/components/ai-builder/types";
import {
    saveSession, getSession, getActiveSessionId, setActiveSessionId,
    generateSessionId, type AISession, saveAttachment, getAttachment
} from "@/utils/aiBuilderDB";
import { encryptPayload, decryptResponse } from "@/utils/aiCrypto";
import ChatHistoryModal from "@/components/ai-builder/ChatHistoryModal";
import { validatePdfFile, extractTextFromPDF, wrapForPrompt } from "@/utils/pdfExtractor";
import { PreviewEmptyState } from "@/components/ai-builder/PreviewEmptyState";
import { PreviewLoadingState } from "@/components/ai-builder/PreviewLoadingState";
import { PuterAuthModal } from "@/components/ai-builder/PuterAuthModal";
import ResumeCounterService from "@/services/resumeCounter";

interface Message {
    id: string;
    role: "user" | "assistant";
    content: string;
    attachmentId?: string;
    attachmentName?: string;
    attachmentSize?: number;
    attachmentPages?: number;
    timestamp: Date;
}

// Default empty AI resume data
const createEmptyAIResume = (): AIResumeData => ({
    meta: {
        layout: 'single-column',
        designPreset: 'modern',
        headerStyle: 'centered',
        skillDisplay: 'tags',
        primaryColor: '#2563eb',
        accentColor: '#64748b',
        fontFamily: 'inter',
        showIcons: true,
        showDividers: true,
    },
    sectionOrder: ['summary', 'experience', 'education', 'skills', 'certifications', 'languages', 'custom'],
    content: {
        personalInfo: {
            firstName: '',
            lastName: '',
            title: '',
            email: '',
            phone: '',
            location: '',
        },
        summary: '',
        experience: [],
        education: [],
        skills: [],
        certifications: [],
        languages: [],
        customSections: [],
    },
    selectedTemplate: 'universal',
});

/**
 * Lightweight inline markdown renderer for AI chat messages.
 * Supports: **bold**, *italic*, numbered lists, bullet lists, and line breaks.
 */
function renderMarkdown(text: string): React.ReactNode {
    const lines = text.split('\n');
    const elements: React.ReactNode[] = [];
    let listItems: { content: string; ordered: boolean; index: number }[] = [];

    const flushList = () => {
        if (listItems.length === 0) return;
        const isOrdered = listItems[0].ordered;
        const Tag = isOrdered ? 'ol' : 'ul';
        elements.push(
            <Tag key={`list-${elements.length}`} className={`${isOrdered ? 'list-decimal' : 'list-disc'} pl-5 my-1.5 space-y-1`}>
                {listItems.map((item, i) => (
                    <li key={i}>{formatInline(item.content)}</li>
                ))}
            </Tag>
        );
        listItems = [];
    };

    // Format inline markdown: **bold** and *italic*
    const formatInline = (str: string): React.ReactNode => {
        const parts: React.ReactNode[] = [];
        const regex = /(\*\*(.+?)\*\*|\*(.+?)\*)/g;
        let lastIndex = 0;
        let match: RegExpExecArray | null;

        while ((match = regex.exec(str)) !== null) {
            if (match.index > lastIndex) {
                parts.push(str.slice(lastIndex, match.index));
            }
            if (match[2]) {
                // **bold**
                parts.push(<strong key={match.index} className="font-semibold">{match[2]}</strong>);
            } else if (match[3]) {
                // *italic*
                parts.push(<em key={match.index}>{match[3]}</em>);
            }
            lastIndex = regex.lastIndex;
        }
        if (lastIndex < str.length) {
            parts.push(str.slice(lastIndex));
        }
        return parts.length === 1 ? parts[0] : <>{parts}</>;
    };

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        // Numbered list: "1. text" or "1) text"
        const orderedMatch = line.match(/^\s*(\d+)[.)]\s+(.+)/);
        // Bullet list: "- text" or "• text"
        const bulletMatch = line.match(/^\s*[-•]\s+(.+)/);

        if (orderedMatch) {
            listItems.push({ content: orderedMatch[2], ordered: true, index: parseInt(orderedMatch[1]) });
        } else if (bulletMatch) {
            listItems.push({ content: bulletMatch[1], ordered: false, index: 0 });
        } else {
            flushList();
            if (line.trim() === '') {
                elements.push(<div key={`br-${i}`} className="h-2" />);
            } else {
                elements.push(<p key={`p-${i}`} className="my-0.5">{formatInline(line)}</p>);
            }
        }
    }
    flushList();

    return <div className="space-y-0.5">{elements}</div>;
}

const WELCOME_MESSAGE: Message = {
    id: '1',
    role: 'assistant',
    content: "Hi! I'm your AI Resume Builder. Tell me about your experience, education, and skills, and I'll build your resume for you. Click any text in the preview to edit it directly!",
    timestamp: new Date()
};

const AIBuilder = () => {
    const navigate = useNavigate();
    const { toast } = useToast();
    const [messages, setMessages] = useState<Message[]>([WELCOME_MESSAGE]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [resumeData, setResumeData] = useState<AIResumeData>(createEmptyAIResume());
    const [isThinking, setIsThinking] = useState(false);
    const [hasGenerated, setHasGenerated] = useState(false);
    const [sessionLoaded, setSessionLoaded] = useState(false);
    const [activeSessionId, setActiveId] = useState<string | null>(null);
    const [historyOpen, setHistoryOpen] = useState(false);
    const exportRef = useRef<HTMLDivElement>(null);
    const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const pendingApiRef = useRef(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // PDF attachment state
    const [attachedPdf, setAttachedPdf] = useState<{ name: string; text: string; pageCount: number; truncated: boolean; attachmentId?: string; size: number } | null>(null);
    const [isExtracting, setIsExtracting] = useState(false);
    const [isDragging, setIsDragging] = useState(false);

    // Puter Auth Modal State
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [pendingPrompt, setPendingPrompt] = useState<string | null>(null);
    const [pendingAttachment, setPendingAttachment] = useState<any>(null);

    // Mobile responsiveness
    const [mobileView, setMobileView] = useState<'chat' | 'preview'>('chat');
    const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
    const [screenWidth, setScreenWidth] = useState(window.innerWidth);
    const [mobileZoom, setMobileZoom] = useState(1);
    const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
    const [isPanning, setIsPanning] = useState(false);
    const dragStartRef = useRef({ x: 0, y: 0 });
    const panStartRef = useRef({ x: 0, y: 0 });
    const previewContainerRef = useRef<HTMLDivElement>(null);

    const handleZoomIn = () => setMobileZoom(prev => Math.min(prev + 0.15, 2.5));
    const handleZoomOut = () => setMobileZoom(prev => Math.max(prev - 0.15, 0.3));
    const handleZoomReset = () => { setMobileZoom(1); setPanOffset({ x: 0, y: 0 }); };

    // Drag-to-pan handlers (only active when zoomed in and NOT on editable elements)
    const isEditableTarget = useCallback((target: EventTarget | null): boolean => {
        if (!target || !(target instanceof HTMLElement)) return false;
        // Skip panning when the user taps on editable content
        return (
            target.isContentEditable ||
            target.tagName === 'INPUT' ||
            target.tagName === 'TEXTAREA' ||
            target.closest('[contenteditable="true"]') !== null
        );
    }, []);

    const handlePanStart = useCallback((clientX: number, clientY: number, target: EventTarget | null) => {
        if (mobileZoom <= 1) return;
        if (isEditableTarget(target)) return; // Don't pan when editing text
        setIsPanning(true);
        dragStartRef.current = { x: clientX, y: clientY };
        panStartRef.current = { ...panOffset };
    }, [mobileZoom, panOffset, isEditableTarget]);

    const handlePanMove = useCallback((clientX: number, clientY: number) => {
        if (!isPanning) return;
        const dx = clientX - dragStartRef.current.x;
        const dy = clientY - dragStartRef.current.y;
        setPanOffset({
            x: panStartRef.current.x + dx,
            y: panStartRef.current.y + dy
        });
    }, [isPanning]);

    const handlePanEnd = useCallback(() => {
        setIsPanning(false);
    }, []);

    // Reset pan when zoom resets to 1 or below
    useEffect(() => {
        if (mobileZoom <= 1) setPanOffset({ x: 0, y: 0 });
    }, [mobileZoom]);

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 1024);
            setScreenWidth(window.innerWidth);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // ---- Load session from IndexedDB on mount ----
    useEffect(() => {
        (async () => {
            try {
                let id = await getActiveSessionId();
                if (id) {
                    const session = await getSession(id);
                    if (session) {
                        if (session.messages?.length > 0) {
                            setMessages(session.messages.map(m => ({
                                ...m,
                                timestamp: new Date(m.timestamp)
                            })));
                        }
                        if (session.resumeData) setResumeData(session.resumeData);
                        if (session.hasGenerated) setHasGenerated(true);
                        if (session.createdAt) sessionCreatedAtRef.current = session.createdAt;
                        sessionTitleRef.current = (session.title && session.title !== 'New Chat') ? session.title : null;
                        setActiveId(id);
                    } else {
                        // Stored ID but no session — start fresh
                        id = null;
                    }
                }
                if (!id) {
                    // No active session — create one
                    const newId = generateSessionId();
                    setActiveId(newId);
                    await setActiveSessionId(newId);
                }
            } catch (e) {
                console.error('[AIBuilder] Failed to load session:', e);
                const newId = generateSessionId();
                setActiveId(newId);
            } finally {
                setSessionLoaded(true);
            }
        })();
    }, []);

    // ---- Auto-scroll to bottom when messages change ----
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isThinking]);

    // ---- Auto-save to IndexedDB (debounced) ----
    const sessionCreatedAtRef = useRef<string>(new Date().toISOString());
    const sessionTitleRef = useRef<string | null>(null); // null = auto-derive, string = custom title

    useEffect(() => {
        if (!sessionLoaded || !activeSessionId || pendingApiRef.current) return;
        if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
        saveTimerRef.current = setTimeout(() => {
            // Use custom title if set, otherwise derive from first user message
            let title = sessionTitleRef.current;
            if (!title || title === 'New Chat') {
                const firstUserMsg = messages.find(m => m.role === 'user');
                title = firstUserMsg
                    ? firstUserMsg.content.slice(0, 60) + (firstUserMsg.content.length > 60 ? '…' : '')
                    : 'New Chat';
            }

            // Use the last message's timestamp as updatedAt
            const lastMsg = messages[messages.length - 1];
            const lastMsgTime = lastMsg?.timestamp instanceof Date
                ? lastMsg.timestamp.toISOString()
                : (lastMsg?.timestamp as string) || new Date().toISOString();

            const session: AISession = {
                id: activeSessionId,
                title,
                messages: messages.map(m => ({
                    ...m,
                    timestamp: m.timestamp instanceof Date ? m.timestamp.toISOString() : m.timestamp as string
                })),
                resumeData,
                hasGenerated,
                createdAt: sessionCreatedAtRef.current,
                updatedAt: lastMsgTime,
            };
            saveSession(session);
        }, 500);
        return () => { if (saveTimerRef.current) clearTimeout(saveTimerRef.current); };
    }, [messages, resumeData, hasGenerated, sessionLoaded, activeSessionId]);

    // ---- New Chat handler (saves current, creates fresh) ----
    const handleNewChat = useCallback(async () => {
        const newId = generateSessionId();
        sessionCreatedAtRef.current = new Date().toISOString();
        sessionTitleRef.current = null; // auto-derive for new chats
        setActiveId(newId);
        await setActiveSessionId(newId);
        setMessages([{ ...WELCOME_MESSAGE, id: Date.now().toString(), timestamp: new Date() }]);
        setResumeData(createEmptyAIResume());
        setHasGenerated(false);
        setInput('');
        toast({ title: 'New Chat', description: 'Starting fresh! Previous chat saved to history.' });
    }, [toast]);

    // ---- Switch session handler ----
    const handleSwitchSession = useCallback(async (id: string) => {
        const session = await getSession(id);
        if (!session) return;
        if (session.createdAt) sessionCreatedAtRef.current = session.createdAt;
        sessionTitleRef.current = (session.title && session.title !== 'New Chat') ? session.title : null;
        setActiveId(id);
        await setActiveSessionId(id);
        if (session.messages?.length > 0) {
            setMessages(session.messages.map(m => ({ ...m, timestamp: new Date(m.timestamp) })));
        } else {
            setMessages([{ ...WELCOME_MESSAGE, id: Date.now().toString(), timestamp: new Date() }]);
        }
        setResumeData(session.resumeData || createEmptyAIResume());
        setHasGenerated(session.hasGenerated || false);
        setInput('');
    }, []);

    // ---- Session renamed from history handler ----
    const handleSessionRenamed = useCallback((id: string, newTitle: string) => {
        if (id === activeSessionId) {
            sessionTitleRef.current = newTitle;
        }
    }, [activeSessionId]);

    // ---- Session deleted from history handler ----
    const handleSessionDeleted = useCallback(async () => {
        const newId = generateSessionId();
        setActiveId(newId);
        await setActiveSessionId(newId);
        setMessages([{ ...WELCOME_MESSAGE, id: Date.now().toString(), timestamp: new Date() }]);
        setResumeData(createEmptyAIResume());
        setHasGenerated(false);
        setInput('');
    }, []);

    // ---- Inline Edit handler ----
    const handleInlineEdit: OnEditFn = useCallback((field: string, value: any) => {
        setResumeData(prev => {
            try {
                const updated = JSON.parse(JSON.stringify(prev)); // Deep clone
                const keys = field.split('.');
                let target = updated as any;

                for (let i = 0; i < keys.length - 1; i++) {
                    const key = !isNaN(Number(keys[i])) ? Number(keys[i]) : keys[i];
                    const nextKey = keys[i + 1];

                    // Auto-create missing intermediate objects/arrays
                    if (target[key] === undefined || target[key] === null) {
                        target[key] = !isNaN(Number(nextKey)) ? [] : {};
                    }
                    target = target[key];
                }

                const lastKey = keys[keys.length - 1];
                if (!isNaN(Number(lastKey))) {
                    target[Number(lastKey)] = value;
                } else {
                    target[lastKey] = value;
                }

                return updated;
            } catch (e) {
                console.warn('[AIBuilder] Inline edit failed for field:', field, e);
                return prev; // Return unchanged state on error
            }
        });
    }, []);

    // Auth Check (silent — just log status, don't block UI)
    useEffect(() => {
        try {
            // @ts-ignore
            if (window.puter?.auth?.isSignedIn()) {
                // Already signed in
            }
        } catch { /* ignore */ }
    }, []);

    // Silent sign-in helper — creates temp user if needed
    const ensurePuterAuth = async (): Promise<string | null> => {
        try {
            // @ts-ignore
            if (window.puter?.auth?.isSignedIn()) {
                // @ts-ignore
                return window.puter.auth.authToken || window.puter.auth.session?.token || null;
            }
            // Silent sign-in with temp user creation
            // @ts-ignore
            await window.puter.auth.signIn();
            // @ts-ignore
            return window.puter.auth.authToken || window.puter.auth.session?.token || null;
        } catch (error) {
            console.warn('[AIBuilder] Puter auth popup closed or failed:', error);
            throw error;
        }
    };

    // Strip empty values from an object to reduce token count
    const stripEmpty = (obj: any): any => {
        if (Array.isArray(obj)) {
            return obj.length > 0 ? obj.map(stripEmpty) : undefined;
        }
        if (obj && typeof obj === 'object') {
            const result: any = {};
            for (const [key, val] of Object.entries(obj)) {
                const stripped = stripEmpty(val);
                if (stripped !== undefined && stripped !== '' && stripped !== null) {
                    result[key] = stripped;
                }
            }
            return Object.keys(result).length > 0 ? result : undefined;
        }
        return obj;
    };

    // Apply a dot-notation patch to the resume data
    const applyPatch = (base: AIResumeData, patch: Record<string, any>): AIResumeData => {
        const updated = JSON.parse(JSON.stringify(base)); // deep clone
        for (const [path, value] of Object.entries(patch)) {
            const keys = path.split('.');
            let target: any = updated;
            for (let i = 0; i < keys.length - 1; i++) {
                const key = keys[i];
                if (target[key] === undefined) target[key] = {};
                target = target[key];
            }
            target[keys[keys.length - 1]] = value;
        }
        return updated;
    };

    // Ensure all array items have IDs
    const ensureIds = (data: AIResumeData): void => {
        if (!data.content) return;
        const c = data.content;
        c.experience?.forEach((i: any) => { if (!i.id) i.id = generateId(); });
        c.education?.forEach((i: any) => { if (!i.id) i.id = generateId(); });
        c.certifications?.forEach((i: any) => { if (!i.id) i.id = generateId(); });
        c.languages?.forEach((i: any) => { if (!i.id) i.id = generateId(); });
        c.customSections?.forEach((s: any) => {
            if (!s.id) s.id = generateId();
            s.items?.forEach((i: any) => { if (!i.id) i.id = generateId(); });
        });
    };

    // ---- PDF file picker handler ----
    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        // Reset input so same file can be re-selected
        e.target.value = '';

        // Validate
        const error = await validatePdfFile(file);
        if (error) {
            toast({ title: 'Invalid File', description: error.message, variant: 'destructive' });
            return;
        }

        // Extract
        setIsExtracting(true);
        try {
            const result = await extractTextFromPDF(file);
            if (!result.text.trim()) {
                toast({ title: 'Empty PDF', description: 'Could not extract any text from this PDF.', variant: 'destructive' });
                return;
            }
            // Save to IDB
            const attachmentId = await saveAttachment(file);
            setAttachedPdf({ name: file.name, text: result.text, pageCount: result.pageCount, truncated: result.truncated, attachmentId, size: file.size });
            toast({ title: '📄 PDF Attached', description: `Extracted text from ${result.pageCount} page${result.pageCount > 1 ? 's' : ''}` });
        } catch (err: any) {
            toast({ title: 'Extraction Failed', description: err.message || 'Could not read the PDF.', variant: 'destructive' });
        } finally {
            setIsExtracting(false);
        }
    };

    // ---- Drag & Drop handler ----
    const handleDrop = async (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);

        const file = e.dataTransfer.files?.[0];
        if (!file) return;

        // Validate
        const error = await validatePdfFile(file);
        if (error) {
            toast({ title: 'Invalid File', description: error.message, variant: 'destructive' });
            return;
        }

        // Extract
        setIsExtracting(true);
        try {
            const result = await extractTextFromPDF(file);
            if (!result.text.trim()) {
                toast({ title: 'Empty PDF', description: 'Could not extract any text from this PDF.', variant: 'destructive' });
                return;
            }
            // Save to IDB
            const attachmentId = await saveAttachment(file);
            setAttachedPdf({ name: file.name, text: result.text, pageCount: result.pageCount, truncated: result.truncated, attachmentId, size: file.size });
            toast({ title: '📄 PDF Attached', description: `Extracted text from ${result.pageCount} page${result.pageCount > 1 ? 's' : ''}` });
        } catch (err: any) {
            toast({ title: 'Extraction Failed', description: err.message || 'Could not read the PDF.', variant: 'destructive' });
        } finally {
            setIsExtracting(false);
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    };

    // ---- Paste handler ----
    const handlePaste = async (e: React.ClipboardEvent) => {
        const items = e.clipboardData?.items;
        if (!items) return;

        let file: File | null = null;
        for (let i = 0; i < items.length; i++) {
            if (items[i].kind === 'file') {
                const f = items[i].getAsFile();
                if (f) {
                    if (f.type !== 'application/pdf' && !f.name.toLowerCase().endsWith('.pdf')) {
                        e.preventDefault();
                        toast({ title: 'Invalid File', description: 'Only PDF files are supported.', variant: 'destructive' });
                        return;
                    }
                    file = f;
                    break;
                }
            }
        }

        if (!file) return; // let normal text paste happen

        e.preventDefault(); // prevent parsing filename as text

        // Validate
        const error = await validatePdfFile(file);
        if (error) {
            toast({ title: 'Invalid File', description: error.message, variant: 'destructive' });
            return;
        }

        // Extract
        setIsExtracting(true);
        try {
            const result = await extractTextFromPDF(file);
            if (!result.text.trim()) {
                toast({ title: 'Empty PDF', description: 'Could not extract any text from this PDF.', variant: 'destructive' });
                return;
            }
            // Save to IDB
            const attachmentId = await saveAttachment(file);
            setAttachedPdf({ name: file.name, text: result.text, pageCount: result.pageCount, truncated: result.truncated, attachmentId, size: file.size });
            toast({ title: '📄 PDF Attached', description: `Extracted text from ${result.pageCount} page${result.pageCount > 1 ? 's' : ''}` });
        } catch (err: any) {
            toast({ title: 'Extraction Failed', description: err.message || 'Could not read the PDF.', variant: 'destructive' });
        } finally {
            setIsExtracting(false);
        }
    };

    const processAndSendPrompt = async (promptInput: string, currentAttachment: any) => {
        // Build user message content — include PDF indicator if attached
        const displayContent = promptInput;

        const userMessage: Message = {
            id: Date.now().toString(),
            role: 'user',
            content: displayContent,
            attachmentId: currentAttachment?.attachmentId,
            attachmentName: currentAttachment?.name,
            attachmentSize: currentAttachment?.size,
            attachmentPages: currentAttachment?.pageCount,
            timestamp: new Date()
        };

        // Build the actual content sent to AI (with PDF context if present)
        const aiUserContent = currentAttachment
            ? `${wrapForPrompt(currentAttachment.text)}\n\n${promptInput}`
            : promptInput;

        setMessages(prev => [...prev, userMessage]);
        setInput("");
        setAttachedPdf(null);
        setIsLoading(true);
        setIsThinking(true);
        pendingApiRef.current = true;

        try {
            // Silent auth — get token (creates temp user if needed)
            const token = await ensurePuterAuth();

            // Optimization: Only last 4 messages for history (saves ~1,000 tokens)
            const history = messages.slice(-4).map(m => ({
                role: m.role,
                content: m.content
            }));

            // Optimization: Compact JSON, strip empty fields (saves ~2,000 tokens)
            const compactResume = JSON.stringify(stripEmpty(resumeData) || {});

            const payload = {
                messages: [
                    {
                        role: 'user',
                        content: hasGenerated
                            ? `[RESUME]${compactResume}\n[INSTRUCTION] Respond with ONLY a JSON object in this exact format: {"message":"your friendly response","patch":{"changed.field":"new value"}}. Example: {"message":"Updated!","patch":{"meta.layout":"two-column"}}`
                            : `[INSTRUCTION] Generate a complete resume. Respond with ONLY a JSON object: {"message":"your response","data":{...complete resume matching the schema...}}`
                    },
                    {
                        role: 'assistant',
                        content: 'Ready.'
                    },
                    ...history,
                    { role: 'user', content: aiUserContent }
                ],
                mode: 'CHAT',
                token: token,
                stream: false
            };

            const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/ai/chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(encryptPayload(payload))
            });

            if (!response.ok) throw new Error('Failed to get AI response');

            // Decrypt response if encryption is enabled
            const rawData = await response.json();
            const data = decryptResponse(rawData);

            let aiContent = "";
            let responseText = "";

            if (data.result?.message?.content) {
                responseText = data.result.message.content;
            } else if (data.text) {
                responseText = data.text;
            } else if (typeof data === 'string') {
                responseText = data;
            } else {
                throw new Error('Invalid AI response format');
            }

            // Clean markdown code blocks if present
            responseText = responseText.replace(/```json\n?|\n?```/g, "").replace(/```/g, "").trim();

            // If content is plain text (not JSON), try to extract JSON from reasoning (for reasoning models)
            if (!responseText.startsWith('{')) {
                const reasoning = data.result?.message?.reasoning ||
                    data.result?.message?.reasoning_details?.[0]?.text || '';
                if (reasoning) {
                    const jsonMatch = reasoning.match(/```json\s*([\s\S]*?)```/);
                    if (jsonMatch) {
                        const extracted = jsonMatch[1].trim();
                        // Check if extracted JSON has the expected format
                        if (extracted.startsWith('{') && (extracted.includes('"patch"') || extracted.includes('"data"'))) {
                            aiContent = responseText; // Keep original text as message
                            responseText = extracted;
                        }
                    }
                }
            }

            // Repair common JSON issues from AI output
            const repairJSON = (str: string): string => {
                let s = str.trim();
                // Remove trailing commas before } or ]
                s = s.replace(/,\s*([}\]])/g, '$1');

                // Find where the root JSON object actually ends using bracket matching
                let depth = 0;
                let inString = false;
                let escape = false;
                let rootEnd = -1;
                for (let i = 0; i < s.length; i++) {
                    const c = s[i];
                    if (escape) { escape = false; continue; }
                    if (c === '\\') { escape = true; continue; }
                    if (c === '"') { inString = !inString; continue; }
                    if (inString) continue;
                    if (c === '{' || c === '[') depth++;
                    if (c === '}' || c === ']') depth--;
                    if (depth === 0 && c === '}') { rootEnd = i; break; }
                }

                if (rootEnd > 0 && rootEnd < s.length - 1) {
                    // Extra characters after the root object — strip them
                    s = s.substring(0, rootEnd + 1);
                } else if (rootEnd === -1 && depth > 0) {
                    // Truncated JSON — auto-close brackets
                    const quoteCount = (s.match(/(?<!\\)"/g) || []).length;
                    if (quoteCount % 2 !== 0) s += '"';
                    while (depth > 0) { s += '}'; depth--; }
                }

                return s;
            };

            try {
                let parsed: any;
                try {
                    parsed = JSON.parse(responseText);
                } catch {
                    // Try repairing malformed JSON
                    const repaired = repairJSON(responseText);
                    parsed = JSON.parse(repaired);
                }
                if (parsed.message) {
                    aiContent = parsed.message;
                }

                if (parsed.patch) {
                    // Delta/patch mode — apply only changed fields
                    const patched = applyPatch(resumeData, parsed.patch);
                    ensureIds(patched);
                    patched.selectedTemplate = 'universal';
                    patched.sectionOrder = patched.sectionOrder || resumeData.sectionOrder;
                    patched.meta = { ...resumeData.meta, ...patched.meta };
                    setResumeData(patched);
                    if (!aiContent) aiContent = "I've updated your resume.";
                } else if (parsed.data) {
                    // Validate that parsed.data is actually a resume (has content.personalInfo)
                    if (!parsed.data.content || !parsed.data.content.personalInfo) {
                        // Advisory/conversational response — don't update resume data
                        if (!aiContent) aiContent = parsed.message || "Here are some suggestions for your resume.";
                    } else {
                        // Full data mode — first generation or full replacement
                        const newData = parsed.data as AIResumeData;
                        ensureIds(newData);
                        newData.meta = {
                            layout: 'single-column',
                            designPreset: 'modern',
                            headerStyle: 'centered',
                            skillDisplay: 'tags',
                            primaryColor: '#2563eb',
                            accentColor: '#64748b',
                            fontFamily: 'inter',
                            showIcons: true,
                            showDividers: true,
                            ...newData.meta,
                        };
                        newData.selectedTemplate = 'universal';
                        newData.sectionOrder = newData.sectionOrder || ['summary', 'experience', 'education', 'skills', 'certifications', 'languages', 'custom'];
                        setResumeData(newData);
                        setHasGenerated(true);
                        if (!aiContent) aiContent = "I've built your resume!";
                    }
                } else if (parsed.content && parsed.meta) {
                    // Fallback: raw resume object without wrapper
                    const newData = parsed as AIResumeData;
                    ensureIds(newData);
                    newData.selectedTemplate = 'universal';
                    setResumeData(newData);
                    if (!aiContent) aiContent = "I've updated your resume.";
                }
            } catch (e) {
                console.error('[AI Debug] JSON parse failed:', e);
                // Fallback: Try to extract just the message using regex if the JSON is hopelessly broken
                const messageMatch = responseText.match(/"message"\s*:\s*"([^"\\]*(?:\\.[^"\\]*)*)"/);
                if (messageMatch) {
                    aiContent = messageMatch[1].replace(/\\"/g, '"');
                } else {
                    aiContent = "I encountered an issue formatting my response, but your resume data may have still updated.";
                }
            }

            setMessages(prev => [...prev, {
                id: Date.now().toString(),
                role: 'assistant',
                content: aiContent || "Done!",
                timestamp: new Date()
            }]);

        } catch (error) {
            console.error("AI Error:", error);
            toast({
                title: "Error",
                description: "Failed to process your request.",
                variant: "destructive"
            });
            setMessages(prev => [...prev, {
                id: Date.now().toString(),
                role: 'assistant',
                content: "I'm sorry, I encountered an error. Please try again.",
                timestamp: new Date()
            }]);
        } finally {
            setIsLoading(false);
            setIsThinking(false);
            pendingApiRef.current = false;
        }
    };

    const handleSendMessage = async () => {
        if (!input.trim() || isLoading) return;

        // Check auth before proceeding
        // @ts-ignore
        if (window.puter && window.puter.auth && !window.puter.auth.isSignedIn()) {
            setPendingPrompt(input);
            setPendingAttachment(attachedPdf);
            setInput(""); // Clear immediately for responsiveness
            setAttachedPdf(null); // Clear pending attachment
            setShowAuthModal(true);
            return;
        }

        await processAndSendPrompt(input, attachedPdf);
    };

    const handleAuthConnect = async () => {
        try {
            await ensurePuterAuth();
            if (pendingPrompt) {
                setShowAuthModal(false);
                // Immediately send the intended prompt
                await processAndSendPrompt(pendingPrompt, pendingAttachment);
                setPendingPrompt(null);
                setPendingAttachment(null);
            } else {
                setShowAuthModal(false);
            }
        } catch (error) {
            console.error('Auth failed in modal:', error);
            handleAuthCancel();
        }
    };

    const handleAuthCancel = () => {
        setShowAuthModal(false);
        // Restore their prompt so they don't lose work
        if (pendingPrompt) setInput(pendingPrompt);
        if (pendingAttachment) setAttachedPdf(pendingAttachment);
        setPendingPrompt(null);
        setPendingAttachment(null);

        // Ensure all loading states are forcefully cleared if they were somehow set
        setIsLoading(false);
        setIsThinking(false);
        pendingApiRef.current = false;

        toast({ title: 'Authentication Required', description: 'AI features require a connection to Puter.', variant: 'default' });
    };

    const currentPdfTitle = useMemo(() => {
        return resumeData?.content?.personalInfo?.firstName
            ? `${resumeData.content.personalInfo.firstName}_${resumeData.content.personalInfo.lastName}_Resume`
            : 'Generated_Resume';
    }, [resumeData]);

    const handleDownload = useReactToPrint({
        contentRef: exportRef,
        documentTitle: currentPdfTitle,
        onBeforePrint: () => {
            setIsLoading(true);
            return new Promise((resolve) => setTimeout(resolve, 100));
        },
        onAfterPrint: async () => {
            setIsLoading(false);
            toast({ title: "PDF Exported!", description: "Your resume has been saved successfully." });
            try {
                // Use the active session ID, or a stable fallback, for deduping increments
                const resumeIdForCounter = activeSessionId || 'ai-session-' + Date.now();
                await ResumeCounterService.incrementForResume(resumeIdForCounter);
            } catch (err) {
                console.warn('Failed to increment resume counter:', err);
            }
        },
        onPrintError: (error) => {
            setIsLoading(false);
            toast({ title: "Export Failed", description: "Failed to open print dialog.", variant: "destructive" });
        }
    });

    return (
        <div className="flex flex-col h-[100dvh] bg-background overflow-hidden">
            <AppNavigation />

            <div className="flex flex-1 overflow-hidden relative">
                {/* SLIDING CONTAINER FOR MOBILE */}
                <div
                    className="flex h-full shrink-0 transition-transform duration-300 ease-in-out lg:!transform-none"
                    style={{
                        transform: isMobile ? (mobileView === 'preview' ? 'translateX(-50%)' : 'translateX(0)') : 'none',
                        width: isMobile ? '200%' : '100%'
                    }}
                >
                    {/* LEFT PANEL: CHAT */}
                    <div className="w-1/2 shrink-0 lg:shrink lg:w-1/3 lg:min-w-[350px] lg:max-w-[500px] flex flex-col border-r bg-white dark:bg-gray-900 h-full">

                        {/* Chat Header with History + New Chat buttons */}
                        <div className="h-14 border-b flex items-center justify-between px-4 bg-white dark:bg-gray-900">
                            <div className="flex items-center gap-1">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setHistoryOpen(true)}
                                    className="text-gray-500 hover:text-blue-500 gap-1.5 text-xs"
                                    title="Chat History"
                                >
                                    <History className="w-3.5 h-3.5" />
                                    History
                                </Button>
                            </div>
                            <div className="flex items-center gap-1">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={handleNewChat}
                                    className="text-gray-500 hover:text-green-600 gap-1.5 text-xs"
                                >
                                    <Plus className="w-3.5 h-3.5" />
                                    New Chat
                                </Button>
                            </div>
                        </div>

                        {/* Chat History Modal */}
                        <ChatHistoryModal
                            open={historyOpen}
                            onOpenChange={setHistoryOpen}
                            activeSessionId={activeSessionId}
                            onSelectSession={handleSwitchSession}
                            onSessionDeleted={handleSessionDeleted}
                            onSessionRenamed={handleSessionRenamed}
                        />

                        {/* Messages */}
                        <ScrollArea className="flex-1 p-4">
                            <div className="space-y-6">
                                {messages.map((message) => {
                                    let displayContent = message.content;
                                    let displayName = message.attachmentName || 'PDF Document';

                                    // Handle legacy messages where name was encoded into content body
                                    if (message.attachmentId && message.content.trim().startsWith('📎')) {
                                        const lines = message.content.split('\n\n');
                                        if (lines.length > 1) {
                                            const firstLine = lines.shift() || '';
                                            if (!message.attachmentName) {
                                                displayName = firstLine.replace('📎', '').trim();
                                            }
                                            displayContent = lines.join('\n\n');
                                        } else {
                                            if (!message.attachmentName) {
                                                displayName = message.content.replace('📎', '').trim();
                                            }
                                            displayContent = '';
                                        }
                                    }

                                    return (
                                        <div
                                            key={message.id}
                                            className={`flex items-start gap-3 ${message.role === 'user' ? 'flex-row-reverse' : ''
                                                }`}
                                        >
                                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${message.role === 'user'
                                                ? 'bg-blue-600 text-white'
                                                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300'
                                                }`}>
                                                {message.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                                            </div>
                                            <div className={`flex flex-col max-w-[85%] ${message.role === 'user' ? 'items-end' : 'items-start'
                                                }`}>
                                                <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed shadow-sm ${message.role === 'user'
                                                    ? 'bg-blue-600 text-white rounded-tr-none'
                                                    : 'bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 text-gray-700 dark:text-gray-200 rounded-tl-none'
                                                    }`}>
                                                    {message.attachmentId && (
                                                        <div
                                                            onClick={async () => {
                                                                const blob = await getAttachment(message.attachmentId!);
                                                                if (blob) {
                                                                    const url = URL.createObjectURL(blob);
                                                                    window.open(url, '_blank');
                                                                } else {
                                                                    toast({ title: "Error", description: "Could not load PDF attachment.", variant: "destructive" });
                                                                }
                                                            }}
                                                            className={`cursor-pointer rounded-xl p-3 flex gap-3 min-w-[200px] max-w-xs sm:max-w-sm items-center transition-colors ${displayContent ? 'mb-2 mt-0.5' : ''
                                                                } ${message.role === 'user'
                                                                    ? 'bg-black/15 hover:bg-black/25 text-white'
                                                                    : 'bg-gray-100 dark:bg-gray-700/50 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100'
                                                                }`}
                                                        >
                                                            <div className={`w-10 h-10 shrink-0 rounded-lg flex items-center justify-center shadow-sm ${message.role === 'user'
                                                                ? 'bg-white/20 text-white'
                                                                : 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                                                                }`}>
                                                                <span className="text-[11px] font-bold uppercase tracking-wide">PDF</span>
                                                            </div>
                                                            <div className="flex flex-col min-w-0 pr-2">
                                                                <span className="font-semibold truncate text-[14px] leading-tight mb-1">
                                                                    {displayName}
                                                                </span>
                                                                <div className="flex items-center gap-1.5 text-xs opacity-80">
                                                                    {message.attachmentPages && <span>{message.attachmentPages} page{message.attachmentPages > 1 ? 's' : ''}</span>}
                                                                    {message.attachmentPages && <span className="text-[10px] opacity-50">•</span>}
                                                                    {message.attachmentSize && <span>{Math.round(message.attachmentSize / 1024)} KB</span>}
                                                                    {message.attachmentSize && <span className="text-[10px] opacity-50">•</span>}
                                                                    <span className="lowercase font-medium tracking-wide">pdf</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}
                                                    {displayContent && (
                                                        <div className={message.role === 'user' ? 'whitespace-pre-wrap' : ''}>
                                                            {message.role === 'assistant' ? renderMarkdown(displayContent) : displayContent}
                                                        </div>
                                                    )}
                                                </div>
                                                <span className="text-[10px] text-gray-400 mt-1 px-1">
                                                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>
                                        </div>
                                    )
                                })}

                                {isThinking && (
                                    <div className="flex items-start gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                                            <Loader2 className="w-4 h-4 animate-spin text-gray-500" />
                                        </div>
                                        <div className="text-xs text-gray-500 py-2">
                                            Thinking...
                                        </div>
                                    </div>
                                )}
                                <div ref={messagesEndRef} />
                            </div>
                        </ScrollArea>

                        {/* Input */}
                        <div
                            className={`p-3 border-t bg-white dark:bg-gray-900 relative transition-colors ${isDragging ? 'bg-blue-50 dark:bg-blue-950/30 border-t-blue-400' : ''
                                }`}
                            onDrop={handleDrop}
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                        >
                            {/* Drag overlay */}
                            {isDragging && (
                                <div className="absolute inset-0 z-10 flex items-center justify-center bg-blue-50/90 dark:bg-blue-950/80 border-2 border-dashed border-blue-400 rounded-lg pointer-events-none">
                                    <div className="flex flex-col items-center gap-2 text-blue-500">
                                        <FileText className="w-8 h-8" />
                                        <span className="text-sm font-medium">Drop your PDF here</span>
                                    </div>
                                </div>
                            )}

                            {/* PDF attachment indicator */}
                            {attachedPdf && (
                                <div className="mb-2 flex items-center gap-2 px-3 py-2 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 rounded-lg text-sm">
                                    <FileText className="w-4 h-4 text-blue-500 shrink-0" />
                                    <span className="truncate text-blue-700 dark:text-blue-300 font-medium">{attachedPdf.name}</span>
                                    <span className="text-xs text-blue-400 shrink-0">{attachedPdf.pageCount} pg{attachedPdf.pageCount > 1 ? 's' : ''}</span>
                                    {attachedPdf.truncated && <span className="text-[10px] text-amber-500 shrink-0">(truncated)</span>}
                                    <button
                                        type="button"
                                        onClick={() => setAttachedPdf(null)}
                                        className="ml-auto p-0.5 rounded hover:bg-blue-100 dark:hover:bg-blue-900 text-blue-400 hover:text-blue-600 transition-colors shrink-0"
                                    >
                                        <X className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            )}

                            {/* Extracting indicator */}
                            {isExtracting && (
                                <div className="mb-2 flex items-center gap-2 px-3 py-2 bg-gray-50 dark:bg-gray-800 border rounded-lg text-sm text-gray-500">
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Extracting text from PDF…
                                </div>
                            )}

                            <form
                                className="flex items-center gap-2"
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    handleSendMessage();
                                }}
                            >
                                {/* Hidden file input */}
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept=".pdf,application/pdf"
                                    onChange={handleFileSelect}
                                    className="hidden"
                                />

                                {/* Paperclip button */}
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="h-[44px] w-[44px] shrink-0 text-gray-400 hover:text-blue-500 rounded-xl"
                                    onClick={() => fileInputRef.current?.click()}
                                    disabled={isLoading || isExtracting}
                                    title="Attach resume PDF"
                                >
                                    <Paperclip className="w-5 h-5" />
                                </Button>

                                <Input
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onPaste={handlePaste}
                                    placeholder={attachedPdf ? "What should I do with this resume?" : "Message AI Resume Builder..."}
                                    className="min-h-[44px] py-3 resize-none flex-1 rounded-xl bg-gray-50/50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-800"
                                    disabled={isLoading}
                                />

                                {/* Send button */}
                                <Button
                                    type="submit"
                                    size="icon"
                                    className="h-[44px] w-[44px] shrink-0 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-sm"
                                    disabled={isLoading || !input.trim()}
                                >
                                    <Send className="w-4 h-4 ml-0.5" />
                                </Button>
                            </form>
                            <p className="text-[10px] text-center text-gray-400 mt-2 flex items-center justify-center opacity-80">
                                AI can make mistakes. Check important info.
                            </p>
                        </div>
                    </div>

                    {/* RIGHT PANEL: PREVIEW */}
                    <div className="w-1/2 shrink-0 lg:shrink lg:flex-1 bg-gray-50 dark:bg-gray-950 flex flex-col min-w-0 h-full">
                        <div className="h-14 border-b bg-white dark:bg-gray-900 flex items-center justify-between px-4">
                            <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Live Preview</span>
                            <div className="flex items-center gap-1.5 sm:gap-2">
                                {isMobile && hasGenerated && (
                                    <>
                                        <Button variant="outline" size="icon" onClick={handleZoomOut} disabled={mobileZoom <= 0.3} className="h-8 w-8">
                                            <ZoomOut className="h-3.5 w-3.5" />
                                        </Button>
                                        <Button variant="outline" size="icon" onClick={handleZoomReset} className="h-8 w-8" title="Fit to width">
                                            <Maximize2 className="h-3.5 w-3.5" />
                                        </Button>
                                        <Button variant="outline" size="icon" onClick={handleZoomIn} disabled={mobileZoom >= 2.5} className="h-8 w-8">
                                            <ZoomIn className="h-3.5 w-3.5" />
                                        </Button>
                                    </>
                                )}
                                <Button variant="outline" size={isMobile ? "icon" : "sm"} onClick={handleDownload} disabled={isLoading} className={isMobile ? "h-8 w-8" : ""}>
                                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                                    {!isMobile && <span className="ml-2">Export PDF</span>}
                                </Button>
                            </div>
                        </div>

                        <div className="flex-1 overflow-auto p-4 sm:p-8 flex justify-center bg-gray-50/30 dark:bg-gray-950/50 relative">
                            {isThinking && !hasGenerated && <PreviewLoadingState />}

                            {(!hasGenerated && !resumeData.content?.personalInfo?.firstName && !resumeData.content?.summary && (!resumeData.content?.experience || resumeData.content.experience.length === 0)) ? (
                                <PreviewEmptyState onSuggestionClick={(prompt) => setInput(prompt)} />
                            ) : (
                                <div
                                    className="w-full h-full flex justify-center"
                                    ref={previewContainerRef}
                                    style={{
                                        overflowX: isMobile ? 'hidden' : 'auto',
                                        cursor: isMobile && mobileZoom > 1 ? (isPanning ? 'grabbing' : 'grab') : 'default',
                                        touchAction: mobileZoom > 1 ? 'none' : 'auto',
                                        userSelect: isPanning ? 'none' : 'auto'
                                    }}
                                    onMouseDown={(e) => { if (isMobile) handlePanStart(e.clientX, e.clientY, e.target); }}
                                    onMouseMove={(e) => { if (isMobile) handlePanMove(e.clientX, e.clientY); }}
                                    onMouseUp={handlePanEnd}
                                    onMouseLeave={handlePanEnd}
                                    onTouchStart={(e) => { if (isMobile && e.touches.length === 1) handlePanStart(e.touches[0].clientX, e.touches[0].clientY, e.target); }}
                                    onTouchMove={(e) => { if (isMobile && e.touches.length === 1) handlePanMove(e.touches[0].clientX, e.touches[0].clientY); }}
                                    onTouchEnd={handlePanEnd}
                                >
                                    <div style={{
                                        width: '8.27in',
                                        flexShrink: 0,
                                        transform: isMobile
                                            ? `translate(${panOffset.x}px, ${panOffset.y}px) scale(${Math.min((screenWidth - 32) / 794, 1) * mobileZoom})`
                                            : 'none',
                                        transformOrigin: 'top center',
                                        transition: isPanning ? 'none' : 'transform 0.2s ease'
                                    }} className="relative z-0">
                                        <div id="resume-preview-container" ref={exportRef} className="shadow-lg bg-white resume-print-area">
                                            <UniversalRenderer
                                                data={resumeData}
                                                onEdit={handleInlineEdit}
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div >

            {/* Mobile Bottom Navigation */}
            {isMobile && (
                <div className="lg:hidden flex border-t border-border bg-white dark:bg-gray-900 p-1.5 shrink-0 z-40 relative pb-safe">
                    {/* Sliding Pill Background */}
                    <div
                        className="absolute top-1.5 bottom-1.5 w-[calc(50%-6px)] bg-blue-50 dark:bg-blue-900/40 rounded-lg transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]"
                        style={{ transform: mobileView === 'preview' ? 'translateX(100%)' : 'translateX(0)' }}
                    />

                    <button
                        onClick={() => setMobileView('chat')}
                        className={`flex-1 flex flex-row items-center justify-center py-2.5 px-3 rounded-lg text-xs font-semibold transition-colors duration-300 gap-2 relative z-10 ${mobileView === 'chat' ? 'text-blue-700 dark:text-blue-400' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
                    >
                        <MessageSquare className="w-4 h-4" />
                        Chat
                    </button>
                    <button
                        onClick={() => setMobileView('preview')}
                        className={`flex-1 flex flex-row items-center justify-center py-2.5 px-3 rounded-lg text-xs font-semibold transition-colors duration-300 gap-2 relative z-10 ${mobileView === 'preview' ? 'text-blue-700 dark:text-blue-400' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
                    >
                        <FileText className="w-4 h-4" />
                        Preview
                    </button>
                </div>
            )}

            <PuterAuthModal
                isOpen={showAuthModal}
                onClose={handleAuthCancel}
                onConnect={handleAuthConnect}
            />
        </div>
    );
};

export default AIBuilder;
