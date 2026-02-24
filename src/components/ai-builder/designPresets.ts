import type { DesignPreset } from './types';

export interface DesignTokens {
    // Colors
    primaryColor: string;
    accentColor: string;
    headerBg: string;
    headerText: string;
    sidebarBg: string;
    sidebarText: string;
    bodyBg: string;
    bodyText: string;
    mutedText: string;
    dividerColor: string;
    tagBg: string;
    tagText: string;
    // Typography
    headingWeight: string;
    sectionTitleTransform: string;
    sectionTitleSize: string;
    bodySize: string;
    nameSize: string;
    // Spacing
    sectionGap: string;
    itemGap: string;
    // Borders
    dividerStyle: string; // e.g. "2px solid #2563eb" or "none"
    headerBorder: string;
    // Radius
    tagRadius: string;
    // Skill bar
    skillBarBg: string;
    skillBarFill: string;
}

const BASE_TOKENS: DesignTokens = {
    primaryColor: '#2563eb',
    accentColor: '#64748b',
    headerBg: 'transparent',
    headerText: '#111827',
    sidebarBg: '#f8fafc',
    sidebarText: '#374151',
    bodyBg: '#ffffff',
    bodyText: '#374151',
    mutedText: '#6b7280',
    dividerColor: '#e5e7eb',
    tagBg: '#eff6ff',
    tagText: '#1d4ed8',
    headingWeight: '700',
    sectionTitleTransform: 'uppercase',
    sectionTitleSize: '0.75rem',
    bodySize: '0.75rem',
    nameSize: '1.5rem',
    sectionGap: '1.25rem',
    itemGap: '0.75rem',
    dividerStyle: '2px solid #2563eb',
    headerBorder: 'none',
    tagRadius: '9999px',
    skillBarBg: '#e5e7eb',
    skillBarFill: '#2563eb',
};

export const DESIGN_PRESETS: Record<DesignPreset, Partial<DesignTokens>> = {
    modern: {
        primaryColor: '#2563eb',
        dividerStyle: '2px solid #2563eb',
        tagBg: '#eff6ff',
        tagText: '#1d4ed8',
        skillBarFill: '#2563eb',
        nameSize: '1.5rem',
    },

    minimalist: {
        primaryColor: '#111827',
        accentColor: '#6b7280',
        dividerStyle: '1px solid #d1d5db',
        tagBg: '#f3f4f6',
        tagText: '#374151',
        tagRadius: '4px',
        sectionTitleTransform: 'none',
        sectionTitleSize: '0.8rem',
        skillBarFill: '#374151',
        nameSize: '1.375rem',
    },

    creative: {
        primaryColor: '#7c3aed',
        accentColor: '#a78bfa',
        headerBg: '#7c3aed',
        headerText: '#ffffff',
        sidebarBg: '#f5f3ff',
        dividerStyle: '3px solid #7c3aed',
        tagBg: '#f5f3ff',
        tagText: '#6d28d9',
        tagRadius: '8px',
        skillBarFill: '#7c3aed',
        nameSize: '1.75rem',
    },

    ats: {
        primaryColor: '#111827',
        accentColor: '#374151',
        dividerStyle: '1px solid #111827',
        tagBg: 'transparent',
        tagText: '#111827',
        tagRadius: '0',
        sectionTitleTransform: 'uppercase',
        headerBorder: 'none',
        sidebarBg: '#ffffff',
        skillBarFill: '#111827',
        nameSize: '1.25rem',
    },

    elegant: {
        primaryColor: '#92400e',
        accentColor: '#b45309',
        dividerStyle: '1px solid #d6a756',
        tagBg: '#fef3c7',
        tagText: '#92400e',
        tagRadius: '4px',
        headingWeight: '600',
        sectionTitleTransform: 'none',
        sectionTitleSize: '0.85rem',
        skillBarFill: '#b45309',
        nameSize: '1.625rem',
        sidebarBg: '#fffbeb',
    },

    corporate: {
        primaryColor: '#1e3a5f',
        accentColor: '#2563eb',
        dividerStyle: '2px solid #1e3a5f',
        tagBg: '#e0f2fe',
        tagText: '#1e3a5f',
        tagRadius: '4px',
        sectionTitleTransform: 'uppercase',
        headerBg: '#1e3a5f',
        headerText: '#ffffff',
        sidebarBg: '#f0f9ff',
        skillBarFill: '#1e3a5f',
        nameSize: '1.5rem',
    },

    academic: {
        primaryColor: '#1f2937',
        accentColor: '#4b5563',
        dividerStyle: '1px solid #9ca3af',
        tagBg: '#f9fafb',
        tagText: '#1f2937',
        tagRadius: '2px',
        sectionTitleTransform: 'none',
        sectionTitleSize: '0.875rem',
        headingWeight: '600',
        skillBarFill: '#4b5563',
        nameSize: '1.375rem',
        sidebarBg: '#f9fafb',
    },

    bold: {
        primaryColor: '#dc2626',
        accentColor: '#991b1b',
        headerBg: '#111827',
        headerText: '#ffffff',
        dividerStyle: '3px solid #dc2626',
        tagBg: '#fef2f2',
        tagText: '#dc2626',
        tagRadius: '6px',
        sectionTitleTransform: 'uppercase',
        headingWeight: '800',
        skillBarFill: '#dc2626',
        nameSize: '1.75rem',
        sidebarBg: '#f9fafb',
    },
};

/**
 * Merge base tokens with a design preset + user color overrides.
 */
export function getDesignTokens(
    preset: DesignPreset,
    primaryColor?: string,
    accentColor?: string,
    headerBg?: string,
    headerText?: string,
): DesignTokens {
    const presetTokens = DESIGN_PRESETS[preset] || {};
    const tokens = { ...BASE_TOKENS, ...presetTokens };

    // Override with user-specified colors
    if (primaryColor) {
        tokens.primaryColor = primaryColor;
        tokens.dividerStyle = tokens.dividerStyle.replace(/#[a-fA-F0-9]{6}/, primaryColor);
        tokens.skillBarFill = primaryColor;
    }
    if (accentColor) {
        tokens.accentColor = accentColor;
    }
    if (headerBg) {
        tokens.headerBg = headerBg;
    }
    if (headerText) {
        tokens.headerText = headerText;
    }

    return tokens;
}
