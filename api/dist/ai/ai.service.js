"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "AiService", {
    enumerable: true,
    get: function() {
        return AiService;
    }
});
const _common = require("@nestjs/common");
const _prompts = require("./prompts");
const _dto = require("./dto");
const _cryptojs = /*#__PURE__*/ _interop_require_wildcard(require("crypto-js"));
const _generativeai = require("@google/generative-ai");
function _getRequireWildcardCache(nodeInterop) {
    if (typeof WeakMap !== "function") return null;
    var cacheBabelInterop = new WeakMap();
    var cacheNodeInterop = new WeakMap();
    return (_getRequireWildcardCache = function(nodeInterop) {
        return nodeInterop ? cacheNodeInterop : cacheBabelInterop;
    })(nodeInterop);
}
function _interop_require_wildcard(obj, nodeInterop) {
    if (!nodeInterop && obj && obj.__esModule) {
        return obj;
    }
    if (obj === null || typeof obj !== "object" && typeof obj !== "function") {
        return {
            default: obj
        };
    }
    var cache = _getRequireWildcardCache(nodeInterop);
    if (cache && cache.has(obj)) {
        return cache.get(obj);
    }
    var newObj = {
        __proto__: null
    };
    var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor;
    for(var key in obj){
        if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) {
            var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null;
            if (desc && (desc.get || desc.set)) {
                Object.defineProperty(newObj, key, desc);
            } else {
                newObj[key] = obj[key];
            }
        }
    }
    newObj.default = obj;
    if (cache) {
        cache.set(obj, newObj);
    }
    return newObj;
}
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
/** Read at runtime so dotenv has loaded */ const getSharedSecret = ()=>process.env.SHARED_SECRET || process.env.VITE_SHARED_SECRET || '';
const isEncryptionEnabled = ()=>process.env.ENABLE_ENCRYPTION === 'true';
let AiService = class AiService {
    /**
     * Main chat endpoint — handles CHAT, GENERATE, and ENHANCE modes.
     * Decrypts messages if they arrive encrypted.
     */ async chat(messages, token, mode) {
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
                data: _cryptojs.AES.encrypt(JSON.stringify(result), getSharedSecret()).toString()
            };
        }
        return result;
    }
    /**
     * Enhance content — dedicated endpoint for field-level enhancement using Gemini.
     */ async enhance(content, token, field, rejectedResponses) {
        // Validation length limits
        if (!content || typeof content !== 'string') {
            throw new _common.HttpException('Content is required', _common.HttpStatus.BAD_REQUEST);
        }
        if (content.length > 5000) {
            throw new _common.HttpException('Content too long (max 5000 characters)', _common.HttpStatus.BAD_REQUEST);
        }
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            this.logger.error('GEMINI_API_KEY is not set in the environment.');
            throw new _common.HttpException('AI service is currently unavailable.', _common.HttpStatus.INTERNAL_SERVER_ERROR);
        }
        // Apply field-specific prompts to improve AI understanding
        const getRandomPrompt = (fld, txt)=>{
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
            const variations = promptVariations[fld];
            if (variations && variations.length > 0) {
                const randomIndex = Math.floor(Math.random() * variations.length);
                return variations[randomIndex];
            }
            return fallbackPrompt;
        };
        const basePrompt = field ? getRandomPrompt(field, content) : `Keep the same core details but make it highly professional. Output ONLY the enhanced content. Input: "${content}"`;
        let avoidInstructions = '';
        if (rejectedResponses && rejectedResponses.length > 0) {
            avoidInstructions = `\n\nIMPORTANT: Do NOT generate any of these previously rejected responses:\n${rejectedResponses.map((r, i)=>`${i + 1}. "${r}"`).join('\n')}\nGenerate a completely different and unique enhancement that is not similar to any of the above.`;
        }
        const systemInstruction = `You are a resume enhancement assistant. Your job is to IMPROVE and ENHANCE the existing content, not replace it entirely. Keep the same core information and meaning, but make it more professional, clear, and impactful. Always provide direct, concise responses without explanations, options, or markdown formatting. Return only the enhanced content.`;
        const userPrompt = `${basePrompt}${avoidInstructions}`;
        try {
            const genAI = new _generativeai.GoogleGenerativeAI(apiKey);
            const modelName = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
            const model = genAI.getGenerativeModel({
                model: modelName,
                systemInstruction
            });
            const result = await model.generateContent(userPrompt);
            const response = result.response;
            let enhancedContent = response.text();
            // Clean up response string
            enhancedContent = enhancedContent.replace(/^Enhanced:\s*/i, '').replace(/^Skills:\s*/i, '').replace(/^Titles:\s*/i, '').replace(/\*\*(.*?)\*\*/g, '$1').replace(/\*(.*?)\*/g, '$1').replace(/```(json)?\n?/i, '').replace(/```\n?/i, '').trim();
            if (enhancedContent.startsWith('INVALID_CONTENT:')) {
                throw new _common.HttpException(enhancedContent.replace('INVALID_CONTENT:', '').trim(), _common.HttpStatus.BAD_REQUEST);
            }
            return {
                enhancedContent,
                originalContent: content,
                field
            };
        } catch (error) {
            this.logger.error('Error calling Gemini API for enhancement:', error);
            if (error instanceof _common.HttpException) {
                throw error;
            }
            throw new _common.HttpException('Failed to enhance content via AI provider.', _common.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    /**
     * Generate resume from brief — dedicated endpoint.
     */ async generate(brief, token, context) {
        const messages = [
            {
                role: 'system',
                content: _prompts.PROMPTS.GENERATE
            },
            {
                role: 'user',
                content: `Brief: "${brief}"${context ? `\nContext: ${JSON.stringify(context)}` : ''}`
            }
        ];
        return this.callPuterApi(messages, token);
    }
    /**
     * Extract and sanitize text from an uploaded PDF file.
     * Uses `unpdf` — a pure JS, serverless-native PDF parser with zero DOM dependencies.
     */ async extractPdfText(file) {
        // 1. Basic validation
        if (file.mimetype !== 'application/pdf') {
            throw new _common.HttpException('Invalid file type. Only PDF is allowed.', _common.HttpStatus.BAD_REQUEST);
        }
        if (file.size > 10 * 1024 * 1024) {
            throw new _common.HttpException('File too large. Maximum size is 10MB.', _common.HttpStatus.BAD_REQUEST);
        }
        try {
            const { extractText, getDocumentProxy } = await Function('return import("unpdf")')();
            const pdf = await getDocumentProxy(new Uint8Array(file.buffer));
            if (pdf.numPages > 30) {
                throw new _common.HttpException('PDF has too many pages. Maximum is 30.', _common.HttpStatus.BAD_REQUEST);
            }
            const { totalPages, text: rawText } = await extractText(pdf, {
                mergePages: true
            });
            await pdf.cleanup();
            const sanitized = this.sanitizeExtractedText(rawText);
            const truncated = sanitized.length >= 15000;
            const result = {
                text: sanitized,
                pageCount: totalPages,
                truncated
            };
            if (isEncryptionEnabled()) {
                return {
                    encrypted: true,
                    data: _cryptojs.AES.encrypt(JSON.stringify(result), getSharedSecret()).toString()
                };
            }
            return result;
        } catch (error) {
            this.logger.error('PDF Extraction failed:', error);
            if (error instanceof _common.HttpException) throw error;
            throw new _common.HttpException('Failed to extract text from PDF.', _common.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    /**
     * Sanitize extracted PDF text.
     * Ported from frontend logic.
     */ sanitizeExtractedText(raw) {
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
            /<\/?RESUME_DATA_ONLY>/gi
        ];
        for (const pattern of INJECTION_PATTERNS){
            text = text.replace(pattern, '');
        }
        // 4. Collapse excessive whitespace
        text = text.replace(/[ \t]{3,}/g, '  '); // 3+ spaces → 2
        text = text.replace(/\n{4,}/g, '\n\n\n'); // 4+ newlines → 3
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
     */ buildMessages(messages, mode) {
        switch(mode){
            case _dto.ChatMode.GENERATE:
                {
                    const brief = Array.isArray(messages) ? messages[messages.length - 1].content : messages;
                    return [
                        {
                            role: 'system',
                            content: _prompts.PROMPTS.GENERATE
                        },
                        {
                            role: 'user',
                            content: `Brief: "${brief}"`
                        }
                    ];
                }
            case _dto.ChatMode.ENHANCE:
                {
                    const content = Array.isArray(messages) ? messages[messages.length - 1].content : messages;
                    return [
                        {
                            role: 'system',
                            content: _prompts.PROMPTS.ENHANCE
                        },
                        {
                            role: 'user',
                            content: content
                        }
                    ];
                }
            case _dto.ChatMode.CHAT:
                return [
                    {
                        role: 'system',
                        content: _prompts.PROMPTS.CHAT
                    },
                    ...Array.isArray(messages) ? messages : [
                        {
                            role: 'user',
                            content: messages
                        }
                    ]
                ];
            default:
                return Array.isArray(messages) ? messages : [
                    {
                        role: 'user',
                        content: messages
                    }
                ];
        }
    }
    /**
     * Decrypt a payload if it's marked as encrypted.
     */ decryptIfNeeded(data) {
        if (!isEncryptionEnabled()) return data;
        if (data?.encrypted && typeof data.data === 'string') {
            try {
                const bytes = _cryptojs.AES.decrypt(data.data, getSharedSecret());
                const decrypted = bytes.toString(_cryptojs.enc.Utf8);
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
     */ async callPuterApi(messages, token, options) {
        const payload = {
            interface: 'puter-chat-completion',
            driver: 'ai-chat',
            method: 'complete',
            args: {
                messages,
                model: options?.model || 'gpt-4o-mini',
                max_tokens: options?.maxTokens || 4096,
                temperature: options?.temperature ?? 0.7,
                stream: false
            },
            auth_token: token
        };
        try {
            const response = await fetch(this.PUTER_API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                    Origin: 'https://puter.com',
                    Referer: 'https://puter.com/'
                },
                body: JSON.stringify(payload)
            });
            if (!response.ok) {
                const errorText = await response.text();
                this.logger.error(`Puter API Error: ${response.status} ${errorText}`);
                throw new _common.HttpException(`Puter API Error: ${errorText}`, response.status);
            }
            return response.json();
        } catch (error) {
            if (error instanceof _common.HttpException) throw error;
            this.logger.error('Puter API call failed', error);
            throw new _common.HttpException('Failed to communicate with AI service', _common.HttpStatus.SERVICE_UNAVAILABLE);
        }
    }
    constructor(){
        this.logger = new _common.Logger(AiService.name);
        this.PUTER_API_URL = 'https://api.puter.com/drivers/call';
    }
};
AiService = _ts_decorate([
    (0, _common.Injectable)()
], AiService);

//# sourceMappingURL=ai.service.js.map