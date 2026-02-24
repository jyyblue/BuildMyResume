import { z } from 'zod';

// ========================================
// RESUME SCHEMA - JSON-Driven Architecture
// ========================================

// ---- Layout & Theme ----
export const ResumeMetaSchema = z.object({
    layout: z.enum(['single-column', 'two-column']).default('single-column'),
    theme: z.enum(['modern', 'classic', 'minimal', 'professional']).default('modern'),
    primaryColor: z.string().default('#2563eb'), // Blue
    accentColor: z.string().default('#64748b'), // Slate
    sidebarBackgroundColor: z.string().default('#f8fafc'), // Light Gray for Two-Column Sidebar
    fontFamily: z.enum(['inter', 'roboto', 'georgia', 'merriweather']).default('inter'),
    fontSize: z.enum(['small', 'medium', 'large']).default('medium'),
    spacing: z.enum(['compact', 'comfortable', 'spacious']).default('comfortable'),
});

// ---- Personal Info ----
export const PersonalInfoSchema = z.object({
    firstName: z.string().default(''),
    lastName: z.string().default(''),
    title: z.string().default(''), // e.g., "Senior Software Engineer"
    email: z.string().default(''),
    phone: z.string().default(''),
    location: z.string().default(''), // e.g., "San Francisco, CA"
    linkedIn: z.string().nullable().optional(),
    website: z.string().nullable().optional(),
    github: z.string().nullable().optional(),
});

// ---- Experience ----
export const ExperienceItemSchema = z.object({
    id: z.string(),
    company: z.string(),
    title: z.string(),
    location: z.string().nullable().optional(),
    startDate: z.string(), // YYYY-MM
    endDate: z.string().nullable().optional(), // YYYY-MM or empty for current
    current: z.boolean().default(false),
    highlights: z.array(z.string()).default([]), // Bullet points
});

// ---- Education ----
export const EducationItemSchema = z.object({
    id: z.string(),
    school: z.string(),
    degree: z.string(),
    field: z.string().nullable().optional(),
    location: z.string().nullable().optional(),
    startDate: z.string().nullable().optional(),
    endDate: z.string().nullable().optional(),
    gpa: z.string().nullable().optional(),
    highlights: z.array(z.string()).default([]),
});

// ---- Skills ----
export const SkillSchema = z.object({
    name: z.string(),
    level: z.number().min(1).max(5).optional(), // 1-5 proficiency
    category: z.string().optional(), // e.g., "Languages", "Frameworks"
});

// ---- Certifications ----
export const CertificationSchema = z.object({
    id: z.string(),
    name: z.string(),
    issuer: z.string().nullable().optional(),
    date: z.string().nullable().optional(),
    url: z.string().nullable().optional(),
});

// ---- Languages ----
export const LanguageSchema = z.object({
    id: z.string(),
    name: z.string(),
    proficiency: z.string().nullable().optional(), // Allow any proficiency level
});

// ---- Custom Section ----
export const CustomSectionSchema = z.object({
    id: z.string(),
    heading: z.string(),
    items: z.array(z.object({
        id: z.string(),
        title: z.string(),
        subtitle: z.string().nullable().optional(),
        date: z.string().nullable().optional(),
        description: z.string().nullable().optional(),
        highlights: z.array(z.string()).default([]),
    })).default([]),
});

// ---- Content ----
export const ResumeContentSchema = z.object({
    personalInfo: PersonalInfoSchema,
    summary: z.string().default(''),
    experience: z.array(ExperienceItemSchema).default([]),
    education: z.array(EducationItemSchema).default([]),
    skills: z.array(SkillSchema).default([]),
    certifications: z.array(CertificationSchema).default([]),
    languages: z.array(LanguageSchema).default([]),
    customSections: z.array(CustomSectionSchema).default([]),
});

// ---- Section Order ----
export const SectionOrderSchema = z.array(z.enum([
    'summary',
    'experience',
    'education',
    'skills',
    'certifications',
    'languages',
    'custom',
])).default(['summary', 'experience', 'education', 'skills', 'certifications', 'languages', 'custom']);

// ========================================
// MAIN RESUME SCHEMA
// ========================================
export const ResumeSchema = z.object({
    meta: ResumeMetaSchema,
    sectionOrder: SectionOrderSchema,
    content: ResumeContentSchema,
    selectedTemplate: z.string().default('modern-clean'),
});

// ========================================
// TypeScript Types
// ========================================
export type ResumeMeta = z.infer<typeof ResumeMetaSchema>;
export type PersonalInfo = z.infer<typeof PersonalInfoSchema>;
export type ExperienceItem = z.infer<typeof ExperienceItemSchema>;
export type EducationItem = z.infer<typeof EducationItemSchema>;
export type Skill = z.infer<typeof SkillSchema>;
export type Certification = z.infer<typeof CertificationSchema>;
export type Language = z.infer<typeof LanguageSchema>;
export type CustomSection = z.infer<typeof CustomSectionSchema>;
export type ResumeContent = z.infer<typeof ResumeContentSchema>;
export type ResumeData = z.infer<typeof ResumeSchema>;

// ========================================
// Default Empty Resume
// ========================================
export const createEmptyResume = (): ResumeData => ({
    meta: {
        layout: 'single-column',
        theme: 'modern',
        primaryColor: '#2563eb',
        accentColor: '#64748b',
        fontFamily: 'inter',
        fontSize: 'medium',
        spacing: 'comfortable',
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
    selectedTemplate: 'modern-clean', // Default template
});

// ========================================
// Helper to generate unique IDs
// ========================================
export const generateId = () => `id_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
