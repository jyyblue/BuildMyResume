import { toast } from 'sonner';

// Define the global Puter interface
declare global {
  interface Window {
    puter: {
      ai: {
        chat: (messages: string | any[], options?: any) => Promise<any>;
      };
      auth: {
        isSignedIn: () => boolean;
        signIn: () => Promise<any>;
        signOut: () => Promise<any>;
        user: () => Promise<any>;
      }
    };
  }
}

interface AIEnhancementRequest {
  field: string;
  content: string;
  context?: {
    jobTitle?: string;
    industry?: string;
    targetRole?: string;
  };
}

interface AIEnhancementResponse {
  enhancedContent: string;
  originalContent: string;
  field: string;
}

export const enhanceContentWithAI = async (
  field: string,
  content: string,
  context?: any,
  rejectedResponses?: string[]
): Promise<AIEnhancementResponse> => {
  try {
    const API_URL = 'http://localhost:4000/ai/enhance';

    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        field,
        content,
        rejectedResponses
      })
    });

    if (!response.ok) throw new Error(`Proxy Error: ${response.statusText}`);

    // Handle Stream or Text
    // The proxy streams. We need to collect it.
    const reader = response.body?.getReader();
    const decoder = new TextDecoder();
    let fullText = "";

    if (reader) {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        fullText += decoder.decode(value, { stream: true });
      }
    } else {
      fullText = await response.text();
    }

    let enhancedContent = fullText.trim();
    let parsedContent = content;
    let parsedField = field;

    try {
      const parsed = JSON.parse(fullText.trim());
      if (parsed.enhancedContent) {
        enhancedContent = parsed.enhancedContent;
      }
      if (parsed.originalContent) {
        parsedContent = parsed.originalContent;
      }
      if (parsed.field) {
        parsedField = parsed.field;
      }
    } catch (e) {
      // Fallback if the backend somehow returns raw text
    }

    return {
      enhancedContent,
      originalContent: parsedContent,
      field: parsedField
    };
  } catch (error) {
    console.error('AI enhancement error:', error);
    throw error;
  }
};

export const generateResumeFromBrief = async (
  brief: string,
  context?: {
    targetRole?: string;
    industry?: string;
    experienceLevel?: string;
  }
): Promise<{
  // ... (keeping return type same)
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  linkedIn?: string;
  website?: string;
  summary: string;
  experiences: Array<{
    id: string;
    company: string;
    title: string;
    location: string;
    startDate: string;
    endDate: string;
    current: boolean;
    description: string;
  }>;
  education: Array<{
    id: string;
    school: string;
    degree: string;
    field: string;
    location: string;
    startDate: string;
    endDate: string;
    current: boolean;
    gpa?: string;
  }>;
  skills: string[];
  certifications: Array<{
    id: string;
    name: string;
    issuer: string;
    date: string;
    url?: string;
  }>;
  languages: Array<{
    id: string;
    name: string;
    proficiency: "Native" | "Conversational" | "Basic" | "Fluent";
    rating: number;
  }>;
  customSections: Array<{
    id: string;
    heading: string;
    content: string;
  }>;
  selectedTemplate: string;
}> => {
  try {
    const PROXY_URL = 'http://localhost:4000/ai/chat';

    // Helper to get token
    const getToken = () => {
      // @ts-ignore
      return window.puter?.auth?.authToken || window.puter?.auth?.session?.token;
    };

    const token = getToken();
    if (!token) throw new Error("Please sign in to Puter.js first.");

    const response = await fetch(PROXY_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: brief, // We just send the brief, backend wraps in prompt
        mode: 'GENERATE',
        token
      })
    });

    if (!response.ok) throw new Error(`Proxy Error: ${response.statusText}`);

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();
    let fullText = "";

    if (reader) {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        fullText += decoder.decode(value, { stream: true });
      }
    } else {
      fullText = await response.text();
    }

    const jsonMatch = fullText.match(/\{[\s\S]*\}/);

    if (!jsonMatch) {
      if (fullText.includes("INVALID_CONTENT")) {
        throw new Error(fullText);
      }
      throw new Error("No JSON found in response");
    }

    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    console.error('AI resume generation error:', error);
    throw error;
  }
};

export const AI_FIELDS = {
  SUMMARY: 'summary',
  JOB_DESCRIPTION: 'jobDescription',
  SKILLS: 'skills',
  CUSTOM_SECTION: 'customSection',
  JOB_TITLE: 'jobTitle',
  COMPANY: 'company'
} as const;

export type AIField = typeof AI_FIELDS[keyof typeof AI_FIELDS];
