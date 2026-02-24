/**
 * AI Builder Encryption Utility
 * 
 * AES encryption/decryption for AI Builder data.
 * Controlled by VITE_ENABLE_ENCRYPTION env var:
 *   - false (dev): plain text for easy debugging
 *   - true (prod): AES-encrypted payloads + IndexedDB storage
 */
import CryptoJS from 'crypto-js';

const ENCRYPTION_KEY = import.meta.env.VITE_SHARED_SECRET || '';

/** Check if encryption is enabled (prod only) */
export const isEncryptionEnabled = (): boolean => {
    return import.meta.env.VITE_ENABLE_ENCRYPTION === 'true';
};

/** Encrypt data with AES — returns base64 string */
export const encryptData = (data: any): string => {
    if (!isEncryptionEnabled()) return JSON.stringify(data);
    const json = JSON.stringify(data);
    return CryptoJS.AES.encrypt(json, ENCRYPTION_KEY).toString();
};

/** Decrypt AES-encrypted string — returns parsed object */
export const decryptData = (encrypted: string): any => {
    if (!isEncryptionEnabled()) return JSON.parse(encrypted);
    const bytes = CryptoJS.AES.decrypt(encrypted, ENCRYPTION_KEY);
    const decrypted = bytes.toString(CryptoJS.enc.Utf8);
    return JSON.parse(decrypted);
};

/** Encrypt only the messages field of an API payload (keeps token/mode visible for routing) */
export const encryptPayload = (payload: any): any => {
    if (!isEncryptionEnabled()) return payload;
    // Only encrypt the messages array, keep token/mode/stream as plain fields
    return {
        ...payload,
        messages: {
            encrypted: true,
            data: CryptoJS.AES.encrypt(JSON.stringify(payload.messages), ENCRYPTION_KEY).toString(),
        },
    };
};

/** Decrypt an API response if it was encrypted */
export const decryptResponse = (response: any): any => {
    if (!isEncryptionEnabled()) return response;
    if (response?.encrypted && response?.data) {
        const bytes = CryptoJS.AES.decrypt(response.data, ENCRYPTION_KEY);
        return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
    }
    return response;
};
