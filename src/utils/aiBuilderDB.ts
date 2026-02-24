/**
 * AI Builder IndexedDB Persistence — Multi-Session
 * 
 * Stores multiple chat sessions with unique IDs.
 * Each session holds messages, resume config, and metadata.
 * Encrypted at rest when VITE_ENABLE_ENCRYPTION=true.
 * 
 * DB: BuildMyResumeAI v2
 * Stores:
 *   sessions  → keyed by session UUID
 *   meta      → stores activeSessionId
 */
import { encryptData, decryptData, isEncryptionEnabled } from './aiCrypto';

const DB_NAME = 'BuildMyResumeAI';
const DB_VERSION = 3;
const SESSIONS_STORE = 'sessions';
const META_STORE = 'meta';
const ATTACHMENTS_STORE = 'attachments';

export interface AISession {
    id: string; // UUID
    title: string; // Auto-derived from first user message
    messages: Array<{
        id: string;
        role: 'user' | 'assistant';
        content: string;
        timestamp: string; // ISO string
        attachmentId?: string;
        attachmentName?: string;
        attachmentSize?: number;
        attachmentPages?: number;
    }>;
    resumeData: any;
    hasGenerated: boolean;
    createdAt: string;
    updatedAt: string;
}

/** Summary for listing (without full messages/resumeData) */
export interface AISessionSummary {
    id: string;
    title: string;
    messageCount: number;
    createdAt: string;
    updatedAt: string;
}

/** Generate a simple UUID */
export function generateSessionId(): string {
    return crypto.randomUUID?.() ??
        `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

/** Open (or create/migrate) the IndexedDB database */
function openDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onupgradeneeded = (event) => {
            const db = request.result;
            const oldVersion = event.oldVersion;

            // Migration from v1 → v2
            if (oldVersion < 1) {
                // Fresh install
                db.createObjectStore(SESSIONS_STORE, { keyPath: 'id' });
                db.createObjectStore(META_STORE);
            } else if (oldVersion < 2) {
                // Upgrade: delete old key-value store, create new keyed store
                if (db.objectStoreNames.contains('sessions')) {
                    db.deleteObjectStore('sessions');
                }
                db.createObjectStore(SESSIONS_STORE, { keyPath: 'id' });
                if (!db.objectStoreNames.contains(META_STORE)) {
                    db.createObjectStore(META_STORE);
                }
            }

            // Upgrade v2 -> v3
            if (oldVersion < 3) {
                if (!db.objectStoreNames.contains(ATTACHMENTS_STORE)) {
                    db.createObjectStore(ATTACHMENTS_STORE);
                }
            }
        };

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

// ---- Encryption helpers ----
function encryptSession(session: AISession): any {
    if (!isEncryptionEnabled()) return session;
    return { ...session, _enc: true, _data: encryptData(session) };
}

function decryptSession(raw: any): AISession {
    if (raw?._enc && typeof raw._data === 'string') {
        return decryptData(raw._data) as AISession;
    }
    return raw as AISession;
}

// ---- Attachment CRUD ----

/** Save an attachment file. Returns the generated ID. */
export async function saveAttachment(file: File | Blob): Promise<string> {
    try {
        const db = await openDB();
        const tx = db.transaction(ATTACHMENTS_STORE, 'readwrite');
        const store = tx.objectStore(ATTACHMENTS_STORE);
        const id = crypto.randomUUID();
        store.put(file, id);
        return new Promise((resolve, reject) => {
            tx.oncomplete = () => { db.close(); resolve(id); };
            tx.onerror = () => { db.close(); reject(tx.error); };
        });
    } catch (error) {
        console.error('[AIBuilderDB] Failed to save attachment:', error);
        throw error;
    }
}

/** Get an attachment file by ID */
export async function getAttachment(id: string): Promise<File | Blob | null> {
    try {
        const db = await openDB();
        const tx = db.transaction(ATTACHMENTS_STORE, 'readonly');
        const store = tx.objectStore(ATTACHMENTS_STORE);
        const request = store.get(id);
        return new Promise((resolve, reject) => {
            request.onsuccess = () => { db.close(); resolve(request.result || null); };
            request.onerror = () => { db.close(); reject(request.error); };
        });
    } catch (error) {
        console.error('[AIBuilderDB] Failed to get attachment:', error);
        return null;
    }
}

// ---- Session CRUD ----

/** Save or update a session */
export async function saveSession(session: AISession): Promise<void> {
    try {
        const db = await openDB();
        const tx = db.transaction(SESSIONS_STORE, 'readwrite');
        const store = tx.objectStore(SESSIONS_STORE);
        store.put(encryptSession(session));
        return new Promise((resolve, reject) => {
            tx.oncomplete = () => { db.close(); resolve(); };
            tx.onerror = () => { db.close(); reject(tx.error); };
        });
    } catch (error) {
        console.error('[AIBuilderDB] Failed to save session:', error);
    }
}

/** Load a specific session by ID */
export async function getSession(id: string): Promise<AISession | null> {
    try {
        const db = await openDB();
        const tx = db.transaction(SESSIONS_STORE, 'readonly');
        const store = tx.objectStore(SESSIONS_STORE);
        const request = store.get(id);
        return new Promise((resolve, reject) => {
            request.onsuccess = () => {
                db.close();
                if (!request.result) { resolve(null); return; }
                try {
                    resolve(decryptSession(request.result));
                } catch {
                    console.error('[AIBuilderDB] Decryption failed for session', id);
                    resolve(null);
                }
            };
            request.onerror = () => { db.close(); reject(request.error); };
        });
    } catch (error) {
        console.error('[AIBuilderDB] Failed to load session:', error);
        return null;
    }
}

/** Get all sessions as summaries (sorted by updatedAt desc) */
export async function getAllSessions(): Promise<AISessionSummary[]> {
    try {
        const db = await openDB();
        const tx = db.transaction(SESSIONS_STORE, 'readonly');
        const store = tx.objectStore(SESSIONS_STORE);
        const request = store.getAll();
        return new Promise((resolve, reject) => {
            request.onsuccess = () => {
                db.close();
                const sessions: AISessionSummary[] = (request.result || [])
                    .map((raw: any) => {
                        try {
                            const s = decryptSession(raw);
                            return {
                                id: s.id,
                                title: s.title || 'Untitled Chat',
                                messageCount: s.messages?.length || 0,
                                createdAt: s.createdAt,
                                updatedAt: s.updatedAt,
                            };
                        } catch {
                            return null;
                        }
                    })
                    .filter(Boolean) as AISessionSummary[];

                // Sort newest first
                sessions.sort((a, b) =>
                    new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
                );
                resolve(sessions);
            };
            request.onerror = () => { db.close(); reject(request.error); };
        });
    } catch (error) {
        console.error('[AIBuilderDB] Failed to list sessions:', error);
        return [];
    }
}

/** Rename a session's title */
export async function renameSession(id: string, newTitle: string): Promise<void> {
    try {
        const session = await getSession(id);
        if (!session) return;
        session.title = newTitle;
        await saveSession(session);
    } catch (error) {
        console.error('[AIBuilderDB] Failed to rename session:', error);
    }
}

/** Delete a specific session */
export async function deleteSession(id: string): Promise<void> {
    try {
        const db = await openDB();
        const tx = db.transaction(SESSIONS_STORE, 'readwrite');
        tx.objectStore(SESSIONS_STORE).delete(id);
        return new Promise((resolve, reject) => {
            tx.oncomplete = () => { db.close(); resolve(); };
            tx.onerror = () => { db.close(); reject(tx.error); };
        });
    } catch (error) {
        console.error('[AIBuilderDB] Failed to delete session:', error);
    }
}

/** Clear ALL sessions */
export async function clearAllSessions(): Promise<void> {
    try {
        const db = await openDB();
        const tx = db.transaction([SESSIONS_STORE, META_STORE], 'readwrite');
        tx.objectStore(SESSIONS_STORE).clear();
        tx.objectStore(META_STORE).clear();
        return new Promise((resolve, reject) => {
            tx.oncomplete = () => { db.close(); resolve(); };
            tx.onerror = () => { db.close(); reject(tx.error); };
        });
    } catch (error) {
        console.error('[AIBuilderDB] Failed to clear all sessions:', error);
    }
}

// ---- Active session tracking ----

/** Get the active session ID */
export async function getActiveSessionId(): Promise<string | null> {
    try {
        const db = await openDB();
        const tx = db.transaction(META_STORE, 'readonly');
        const request = tx.objectStore(META_STORE).get('activeSessionId');
        return new Promise((resolve, reject) => {
            request.onsuccess = () => { db.close(); resolve(request.result || null); };
            request.onerror = () => { db.close(); reject(request.error); };
        });
    } catch {
        return null;
    }
}

/** Set the active session ID */
export async function setActiveSessionId(id: string): Promise<void> {
    try {
        const db = await openDB();
        const tx = db.transaction(META_STORE, 'readwrite');
        tx.objectStore(META_STORE).put(id, 'activeSessionId');
        return new Promise((resolve, reject) => {
            tx.oncomplete = () => { db.close(); resolve(); };
            tx.onerror = () => { db.close(); reject(tx.error); };
        });
    } catch (error) {
        console.error('[AIBuilderDB] Failed to set active session:', error);
    }
}

// ---- Legacy compat (keep old names working during transition) ----
export const loadSession = async (): Promise<AISession | null> => {
    const id = await getActiveSessionId();
    return id ? getSession(id) : null;
};
export const clearSession = clearAllSessions;
