import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { PROMPTS } from './prompts';
import { ChatMode } from './dto';
import * as CryptoJS from 'crypto-js';
import { GoogleGenerativeAI } from '@google/generative-ai';

/** Read at runtime so dotenv has loaded */
const getSharedSecret = () => process.env.SHARED_SECRET || process.env.VITE_SHARED_SECRET || '';
const isEncryptionEnabled = () => process.env.ENABLE_ENCRYPTION === 'true';

interface PuterMessage {
    role: string;
    content: string;
}

@Injectable()
export class AiService {
    private readonly logger = new Logger(AiService.name);
    private readonly PUTER_API_URL = 'https://api.puter.com/drivers/call';

    /**
     * Main chat endpoint — handles CHAT, GENERATE, and ENHANCE modes.
     * Decrypts messages if they arrive encrypted.
     */
    async chat(
        messages: any,
        token: string,
        mode?: ChatMode,
    ): Promise<any> {
        // Decrypt messages if encrypted
        const decryptedMessages = this.decryptIfNeeded(messages);
        const finalMessages = this.buildMessages(decryptedMessages, mode);
        const result = await this.callPuterApi(finalMessages, token);

        // Optionally encrypt response in production
        const encrypt = isEncryptionEnabled();
        this.logger.log(`Encryption enabled: ${encrypt}`);
        if (encrypt) {
            return {
                encrypted: true,
                data: CryptoJS.AES.encrypt(JSON.stringify(result), getSharedSecret()).toString(),
            };
        }
        return result;
    }

    /**
     * Enhance content — dedicated endpoint for field-level enhancement using Gemini.
     */
    async enhance(
        content: string,
        token?: string, // Kept in signature for backwards compat, unused internally
        field?: string,
        rejectedResponses?: string[],
    ): Promise<{ enhancedContent: string; originalContent: string; field?: string }> {
        // Validation length limits
        if (!content || typeof content !== 'string') {
            throw new HttpException('Content is required', HttpStatus.BAD_REQUEST);
        }
        if (content.length > 5000) {
            throw new HttpException('Content too long (max 5000 characters)', HttpStatus.BAD_REQUEST);
        }

        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            this.logger.error('GEMINI_API_KEY is not set in the environment.');
            throw new HttpException('AI service is currently unavailable.', HttpStatus.INTERNAL_SERVER_ERROR);
        }

        // Apply field-specific prompts to improve AI understanding
        const getRandomPrompt = (fld: string, txt: string) => {
            const promptVariations = {
                summary: [
                    `First, validate if this content is actually a professional summary. If it's not related to professional background, skills, or career information, respond with "INVALID_CONTENT: This does not appear to be a professional summary."\nIf valid, enhance it by improving language, adding action verbs, and making it more impactful. Keep the same core information. Output ONLY the enhanced version. Input: "${txt}"`,
                    `First, validate if this content is actually a professional summary. If it's not related to professional background, skills, or career information, respond with "INVALID_CONTENT: This does not appear to be a professional summary."\nIf valid, refine it to be more ATS-friendly and impactful. Keep the same core content. Output ONLY the enhanced version. Input: "${txt}"`
                ],
                jobDescription: [
                    `First, validate if this content is actually a job description. If not, respond with "INVALID_CONTENT: This does not appear to be a job description."\nIf valid, enhance it by improving the language and structure. Keep the core responsibilities. Output ONLY the enhanced version. Input: "${txt}"`,
                    `First, validate if this content is actually a job description. If not, respond with "INVALID_CONTENT: This does not appear to be a job description."\nIf valid, refine it to be more professional and impactful. Output ONLY the enhanced version. Input: "${txt}"`
                ],
                skills: [
                    `First, validate if this is a skill list. If not, respond with "INVALID_CONTENT: This does not appear to be a skill list."\nIf valid, enhance it by improving language and adding related skills. Return ONLY the enhanced skill list. Input: "${txt}"`
                ]
            };

            const fallbackPrompt = `Keep the same core information but make it more professional. Output ONLY the enhanced version. Input: "${txt}"`;
            const variations = promptVariations[fld as keyof typeof promptVariations];

            if (variations && variations.length > 0) {
                const randomIndex = Math.floor(Math.random() * variations.length);
                return variations[randomIndex];
            }
            return fallbackPrompt;
        };

        const basePrompt = field ? getRandomPrompt(field, content) : `Keep the same core details but make it highly professional. Output ONLY the enhanced content. Input: "${content}"`;

        let avoidInstructions = '';
        if (rejectedResponses && rejectedResponses.length > 0) {
            avoidInstructions = `\n\nIMPORTANT: Do NOT generate any of these previously rejected responses:\n${rejectedResponses.map((r, i) => `${i + 1}. "${r}"`).join('\n')}\nGenerate a completely different and unique enhancement that is not similar to any of the above.`;
        }

        const systemInstruction = `You are a resume enhancement assistant. Your job is to IMPROVE and ENHANCE the existing content, not replace it entirely. Keep the same core information and meaning, but make it more professional, clear, and impactful. Always provide direct, concise responses without explanations, options, or markdown formatting. Return only the enhanced content.`;
        const userPrompt = `${basePrompt}${avoidInstructions}`;

        try {
            const genAI = new GoogleGenerativeAI(apiKey);
            const modelName = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
            const model = genAI.getGenerativeModel({
                model: modelName,
                systemInstruction,
            });

            const result = await model.generateContent(userPrompt);
            const response = result.response;
            let enhancedContent = response.text();

            // Clean up response string
            enhancedContent = enhancedContent
                .replace(/^Enhanced:\s*/i, '')
                .replace(/^Skills:\s*/i, '')
                .replace(/^Titles:\s*/i, '')
                .replace(/\*\*(.*?)\*\*/g, '$1')
                .replace(/\*(.*?)\*/g, '$1')
                .replace(/```(json)?\n?/i, '')
                .replace(/```\n?/i, '')
                .trim();

            if (enhancedContent.startsWith('INVALID_CONTENT:')) {
                throw new HttpException(enhancedContent.replace('INVALID_CONTENT:', '').trim(), HttpStatus.BAD_REQUEST);
            }

            return {
                enhancedContent,
                originalContent: content,
                field,
            };
        } catch (error) {
            this.logger.error('Error calling Gemini API for enhancement:', error);
            if (error instanceof HttpException) {
                throw error;
            }
            throw new HttpException('Failed to enhance content via AI provider.', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Generate resume from brief — dedicated endpoint.
     */
    async generate(
        brief: string,
        token: string,
        context?: Record<string, string>,
    ): Promise<any> {
        const messages: PuterMessage[] = [
            { role: 'system', content: PROMPTS.GENERATE },
            { role: 'user', content: `Brief: "${brief}"${context ? `\nContext: ${JSON.stringify(context)}` : ''}` },
        ];

        return this.callPuterApi(messages, token);
    }

    /**
     * Extract and sanitize text from an uploaded PDF file.
     */
    async extractPdfText(file: Express.Multer.File): Promise<any> {
        // 1. Basic validation
        if (file.mimetype !== 'application/pdf') {
            throw new HttpException('Invalid file type. Only PDF is allowed.', HttpStatus.BAD_REQUEST);
        }
        if (file.size > 10 * 1024 * 1024) { // 10MB
            throw new HttpException('File too large. Maximum size is 10MB.', HttpStatus.BAD_REQUEST);
        }

        try {
            // Import legacy build for Node.js environment to avoid DOMMatrix/Canvas errors
            // Hide the import string from TypeScript compiler to avoid the infinite looping during `nest start` / `tsc` 
            const modulePath = 'pdfjs-dist/legacy/build/pdf.mjs';
            const pdfjsLib = await import(modulePath);

            // Parse PDF from buffer
            const loadingTask = pdfjsLib.getDocument({
                data: new Uint8Array(file.buffer),
                useSystemFonts: true, // Use system fonts to avoid font loading errors
                disableFontFace: true, // Disable font loading that requires DOM
            });

            const pdf = await loadingTask.promise;

            if (pdf.numPages > 30) {
                throw new HttpException('PDF has too many pages. Maximum is 30.', HttpStatus.BAD_REQUEST);
            }

            const pages: string[] = [];
            for (let i = 1; i <= pdf.numPages; i++) {
                const page = await pdf.getPage(i);
                const textContent = await page.getTextContent();
                const pageText = textContent.items
                    .map((item: any) => item.str || '')
                    .join(' ');
                pages.push(pageText);
            }

            // Cleanup
            await pdf.destroy();

            const rawText = pages.join('\n\n');
            const sanitized = this.sanitizeExtractedText(rawText);
            const truncated = sanitized.length >= 15000;

            const result = {
                text: sanitized,
                pageCount: pdf.numPages,
                truncated,
            };

            if (isEncryptionEnabled()) {
                return {
                    encrypted: true,
                    data: CryptoJS.AES.encrypt(JSON.stringify(result), getSharedSecret()).toString(),
                };
            }

            return result;

        } catch (error) {
            this.logger.error('PDF Extraction failed:', error);
            if (error instanceof HttpException) throw error;
            throw new HttpException('Failed to extract text from PDF.', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Sanitize extracted PDF text.
     * Ported from frontend logic.
     */
    private sanitizeExtractedText(raw: string): string {
        let text = raw;

        // 1. Remove invisible Unicode characters
        // Zero-width space, joiner, non-joiner, LTR/RTL marks, etc.
        text = text.replace(/[\u200B\u200C\u200D\u200E\u200F\u2028\u2029\u202A-\u202E\u2060-\u2064\u2066-\u206F\uFEFF\uFFF9-\uFFFC]/g, '');

        // 2. Remove control characters except newline and tab
        text = text.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');

        // 3. Strip prompt injection patterns
        const INJECTION_PATTERNS = [
            /\[SYSTEM\]/gi,
            /\[INSTRUCTION\]/gi,
            /\[ASSISTANT\]/gi,
            /\[RESUME\]/gi,
            /IGNORE\s+(ALL\s+)?PREVIOUS/gi,
            /DISREGARD\s+(ALL\s+)?PREVIOUS/gi,
            /FORGET\s+(ALL\s+)?PREVIOUS/gi,
            /YOU\s+ARE\s+NOW/gi,
            /ACT\s+AS\s+(IF|A|AN)/gi,
            /DO\s+NOT\s+FOLLOW/gi,
            /OVERRIDE\s+(ALL\s+)?INSTRUCTIONS/gi,
            /<\/?RESUME_DATA_ONLY>/gi,
        ];

        for (const pattern of INJECTION_PATTERNS) {
            text = text.replace(pattern, '');
        }

        // 4. Collapse excessive whitespace
        text = text.replace(/[ \t]{3,}/g, '  ');       // 3+ spaces → 2
        text = text.replace(/\n{4,}/g, '\n\n\n');       // 4+ newlines → 3
        text = text.trim();

        // 5. Truncate
        const MAX_TEXT_LENGTH = 15000;
        if (text.length > MAX_TEXT_LENGTH) {
            text = text.slice(0, MAX_TEXT_LENGTH);
            // Don't cut mid-word
            const lastSpace = text.lastIndexOf(' ');
            if (lastSpace > MAX_TEXT_LENGTH - 200) {
                text = text.slice(0, lastSpace);
            }
            text += '\n[...truncated]';
        }

        return text;
    }

    /**
     * Build the final messages array based on chat mode.
     */
    private buildMessages(messages: any, mode?: ChatMode): PuterMessage[] {
        switch (mode) {
            case ChatMode.GENERATE: {
                const brief = Array.isArray(messages)
                    ? messages[messages.length - 1].content
                    : messages;
                return [
                    { role: 'system', content: PROMPTS.GENERATE },
                    { role: 'user', content: `Brief: "${brief}"` },
                ];
            }

            case ChatMode.ENHANCE: {
                const content = Array.isArray(messages)
                    ? messages[messages.length - 1].content
                    : messages;
                return [
                    { role: 'system', content: PROMPTS.ENHANCE },
                    { role: 'user', content: content },
                ];
            }

            case ChatMode.CHAT:
                return [
                    { role: 'system', content: PROMPTS.CHAT },
                    ...(Array.isArray(messages) ? messages : [{ role: 'user', content: messages }]),
                ];

            default:
                return Array.isArray(messages)
                    ? messages
                    : [{ role: 'user', content: messages }];
        }
    }

    /**
     * Decrypt a payload if it's marked as encrypted.
     */
    private decryptIfNeeded(data: any): any {
        if (!isEncryptionEnabled()) return data;
        if (data?.encrypted && typeof data.data === 'string') {
            try {
                const bytes = CryptoJS.AES.decrypt(data.data, getSharedSecret());
                const decrypted = bytes.toString(CryptoJS.enc.Utf8);
                return JSON.parse(decrypted);
            } catch (e) {
                this.logger.error('Decryption failed:', e);
                return data; // fallback to raw data
            }
        }
        return data;
    }

    /**
     * Call the Puter AI API with the given messages and auth token.
     */
    private async callPuterApi(
        messages: PuterMessage[],
        token: string,
        options?: { model?: string; maxTokens?: number; temperature?: number },
    ): Promise<any> {
        const payload = {
            interface: 'puter-chat-completion',
            driver: 'ai-chat',
            method: 'complete',
            args: {
                messages,
                model: options?.model || 'gpt-4o-mini',
                max_tokens: options?.maxTokens || 4096,
                temperature: options?.temperature ?? 0.7,
                stream: false,
            },
            auth_token: token,
        };

        try {
            const response = await fetch(this.PUTER_API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                    Origin: 'https://puter.com',
                    Referer: 'https://puter.com/',
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const errorText = await response.text();
                this.logger.error(`Puter API Error: ${response.status} ${errorText}`);
                throw new HttpException(
                    `Puter API Error: ${errorText}`,
                    response.status,
                );
            }

            return response.json();
        } catch (error) {
            if (error instanceof HttpException) throw error;
            this.logger.error('Puter API call failed', error);
            throw new HttpException(
                'Failed to communicate with AI service',
                HttpStatus.SERVICE_UNAVAILABLE,
            );
        }
    }
}
