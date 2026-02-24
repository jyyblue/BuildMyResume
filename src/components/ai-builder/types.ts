// Types for the AI Builder Universal Template Engine
// These are used ONLY by the AI Builder — existing templates are untouched.

export type LayoutType = 'single-column' | 'two-column' | 'sidebar-left' | 'sidebar-right';
export type DesignPreset = 'modern' | 'minimalist' | 'creative' | 'ats' | 'elegant' | 'corporate' | 'academic' | 'bold';
export type HeaderStyle = 'centered' | 'left-aligned' | 'standard';
export type SkillDisplay = 'tags' | 'bars' | 'dots' | 'grouped' | 'plain';
export type FontFamily = 'inter' | 'roboto' | 'georgia' | 'merriweather';

export interface RendererMeta {
    layout: LayoutType;
    designPreset: DesignPreset;
    headerStyle: HeaderStyle;
    skillDisplay: SkillDisplay;
    primaryColor: string;
    accentColor: string;
    headerBg?: string;
    headerText?: string;
    fontFamily: FontFamily;
    showIcons: boolean;
    showDividers: boolean;
}

export interface PersonalInfo {
    firstName: string;
    lastName: string;
    title?: string;
    email: string;
    phone: string;
    location?: string;
    linkedIn?: string;
    website?: string;
    github?: string;
}

export interface ExperienceItem {
    id: string;
    company: string;
    title: string;
    location?: string;
    startDate: string;
    endDate?: string;
    current?: boolean;
    highlights: string[];
}

export interface EducationItem {
    id: string;
    school: string;
    degree: string;
    field?: string;
    location?: string;
    startDate?: string;
    endDate?: string;
    gpa?: string;
    highlights?: string[];
}

export interface SkillItem {
    name: string;
    level?: number; // 1-5
    category?: string;
}

export interface CertificationItem {
    id: string;
    name: string;
    issuer?: string;
    date?: string;
    url?: string;
}

export interface LanguageItem {
    id: string;
    name: string;
    proficiency?: string;
}

export interface CustomSectionItem {
    id: string;
    title: string;
    subtitle?: string;
    date?: string;
    description?: string;
    highlights?: string[];
}

export interface CustomSectionData {
    id: string;
    heading: string;
    items: CustomSectionItem[];
}

export interface ResumeContent {
    personalInfo: PersonalInfo;
    summary: string;
    headings?: Partial<Record<SectionKey, string>>;
    experience: ExperienceItem[];
    education: EducationItem[];
    skills: SkillItem[];
    certifications: CertificationItem[];
    languages: LanguageItem[];
    customSections: CustomSectionData[];
}

export type SectionKey = 'summary' | 'experience' | 'education' | 'skills' | 'certifications' | 'languages' | 'custom' | string;

export interface AIResumeData {
    meta: RendererMeta;
    sectionOrder: SectionKey[];
    content: ResumeContent;
    selectedTemplate: string;
}

export type OnEditFn = (field: string, value: any) => void;

// Classify sections into main vs sidebar for two-column/sidebar layouts
export const MAIN_SECTIONS: SectionKey[] = ['summary', 'experience', 'education', 'custom'];
export const SIDEBAR_SECTIONS: SectionKey[] = ['skills', 'certifications', 'languages'];
