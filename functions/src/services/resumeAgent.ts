import * as admin from 'firebase-admin';
import { GoogleGenerativeAI } from '@google/generative-ai';
import * as React from 'react';
import * as ReactDOMServer from 'react-dom/server';
import ts from 'typescript';

// Initialize in index.ts, or ensure it's initialized here if not already
if (!admin.apps.length) {
    admin.initializeApp();
}

const db = admin.firestore();

export interface ResumeSession {
    sessionId: string;
    code: string;
    createdAt: number;
    updatedAt: number;
    history: Array<{
        prompt: string;
        timestamp: number;
    }>;
}

const SYSTEM_PROMPT = `You are an expert React Developer specializing in creating beautiful, professional, and ATS-friendly resumes.
Your task is to generate or modify a valid React Functional Component named 'Resume' that accepts 'data' as props (though typically we will hardcode the content for this specific use case unless instructed otherwise, but for now, generate the CONTENT directly inside the JSX to keep it self-contained and easy to edit).

Rules:
1. Output ONLY valid TSX code. No markdown code blocks, no explanation.
2. The component MUST be named 'Resume'.
3. Use Tailwind CSS for styling. Make it look premium, modern, and professional.
4. If modifying existing code, preserve the structure but apply the requested changes perfectly.
5. Ensure all imports are valid (react, lucide-react, etc. are available).
6. The component must be self-contained (no external custom components other than basic HTML/Tailwind and Lucide icons).
`;

function extractCode(text: string): string {
    // Remove markdown code blocks if present
    const match = text.match(/```tsx?([\s\S]*?)```/);
    if (match) {
        return match[1].trim();
    }
    return text.replace(/```/g, '').trim();
}

export const generateOrUpdateResume = async (sessionId: string, prompt: string, apiKey: string): Promise<{ code: string, message: string }> => {
    const sessionRef = db.collection('resume_sessions').doc(sessionId);
    const doc = await sessionRef.get();

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-lite' });

    let currentCode = '';
    let isNew = true;

    if (doc.exists) {
        const data = doc.data() as ResumeSession;
        currentCode = data.code;
        isNew = false;
    }

    let finalPrompt = '';
    if (isNew) {
        finalPrompt = `${SYSTEM_PROMPT}
        
        USER REQUEST: "${prompt}"
        
        Generate the full Resume component code now.`;
    } else {
        finalPrompt = `${SYSTEM_PROMPT}

        CURRENT CODE:
        ${currentCode}
        
        USER REQUEST (UPDATE): "${prompt}"
        
        Return the updated full Resume component code.`;
    }

    try {
        const result = await model.generateContent(finalPrompt);
        const response = await result.response;
        const generatedText = response.text();

        const code = extractCode(generatedText);

        // Persist
        const sessionData: Partial<ResumeSession> = {
            code,
            updatedAt: Date.now(),
            history: admin.firestore.FieldValue.arrayUnion({ prompt, timestamp: Date.now() }) as any
        };

        if (isNew) {
            sessionData.createdAt = Date.now();
            sessionData.sessionId = sessionId;
        }

        await sessionRef.set(sessionData, { merge: true });

        return { code, message: isNew ? 'Resume generated successfully.' : 'Resume updated successfully.' };

    } catch (error) {
        console.error("AI Generation Error:", error);
        throw new Error("Failed to generate code.");
    }
};

export const compileAndRender = (tsxCode: string): string => {
    try {
        // 1. Transpile TSX to JS
        const result = ts.transpileModule(tsxCode, {
            compilerOptions: {
                module: ts.ModuleKind.CommonJS,
                target: ts.ScriptTarget.ES2020,
                jsx: ts.JsxEmit.React,
                esModuleInterop: true
            }
        });

        const jsCode = result.outputText;

        // 2. Evaluate the JS code to get the component
        // This is a bit risky in production without sandboxing, but for this agent context:
        // We will mock 'require' to provide React and icons
        const mockRequire = (id: string) => {
            if (id === 'react') return React;
            if (id === 'lucide-react') return require('lucide-react'); // Need to ensure it's accessible
            return {};
        };

        const module = { exports: {} as any };
        const exports = module.exports;

        // Execute the code
        const runCode = new Function('require', 'module', 'exports', 'React', jsCode);
        runCode(mockRequire, module, exports, React);

        const ResumeComponent = module.exports.default || module.exports.Resume || module.exports;

        // 3. Render to static markup
        if (typeof ResumeComponent !== 'function') {
            throw new Error("Resulting code does not export a valid React component");
        }

        const htmlContent = ReactDOMServer.renderToStaticMarkup(React.createElement(ResumeComponent));

        // 4. Wrap in full HTML for Puppeteer
        return `
            <!DOCTYPE html>
            <html>
                <head>
                    <meta charset="UTF-8">
                    <script src="https://cdn.tailwindcss.com"></script>
                    <style>
                        body { margin: 0; padding: 0; background: white; }
                        @page { size: A4; margin: 0; }
                    </style>
                </head>
                <body>
                    <div id="root">${htmlContent}</div>
                </body>
            </html>
        `;

    } catch (error) {
        console.error("Compilation/Render Error:", error);
        throw error;
    }
};
