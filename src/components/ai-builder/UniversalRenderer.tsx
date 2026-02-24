import { forwardRef, useCallback } from 'react';
import type { AIResumeData, OnEditFn, SectionKey } from './types';
import { getDesignTokens } from './designPresets';
import { HeaderSection } from './sections/HeaderSection';
import { SingleColumnLayout } from './layouts/SingleColumnLayout';
import { TwoColumnLayout } from './layouts/TwoColumnLayout';
import { SidebarLayout } from './layouts/SidebarLayout';

// Font import map
const FONT_MAP: Record<string, string> = {
    inter: "'Inter', sans-serif",
    roboto: "'Roboto', sans-serif",
    georgia: "'Georgia', serif",
    merriweather: "'Merriweather', serif",
};

interface UniversalRendererProps {
    data: AIResumeData;
    onEdit: OnEditFn;
}

/**
 * UniversalRenderer — the main AI Builder resume renderer.
 *
 * Reads `data.meta` to pick layout, design preset, header style, skill display.
 * Renders sections in `data.sectionOrder`.
 * All text is click-to-edit via InlineEdit.
 */
const UniversalRenderer = forwardRef<HTMLDivElement, UniversalRendererProps>(
    ({ data, onEdit }, ref) => {
        const meta = data.meta || {
            layout: 'single-column',
            designPreset: 'modern',
            headerStyle: 'centered',
            skillDisplay: 'tags',
            primaryColor: '#2563eb',
            accentColor: '#64748b',
            fontFamily: 'inter',
            showIcons: true,
            showDividers: true,
        };

        // Get design tokens
        const tokens = getDesignTokens(
            meta.designPreset || 'modern',
            meta.primaryColor,
            meta.accentColor,
            meta.headerBg,
            meta.headerText,
        );

        const layout = meta.layout || 'single-column';
        const headerStyle = meta.headerStyle || 'centered';
        const skillDisplay = meta.skillDisplay || 'tags';
        const showDividers = meta.showDividers !== false;
        const showIcons = meta.showIcons !== false;
        const fontFamily = FONT_MAP[meta.fontFamily || 'inter'] || FONT_MAP.inter;

        // Ensure sectionOrder automatically includes any sections that have content but were omitted by AI
        const rawOrder: SectionKey[] = data.sectionOrder || [
            'summary', 'experience', 'education', 'skills', 'certifications', 'languages', 'custom',
        ];

        const sectionOrder = [...rawOrder];
        const content = data.content;

        if (content) {
            if (content.experience?.length > 0 && !sectionOrder.includes('experience')) sectionOrder.push('experience');
            if (content.education?.length > 0 && !sectionOrder.includes('education')) sectionOrder.push('education');
            if (content.skills?.length > 0 && !sectionOrder.includes('skills')) sectionOrder.push('skills');
            if (content.certifications?.length > 0 && !sectionOrder.includes('certifications')) sectionOrder.push('certifications');
            if (content.languages?.length > 0 && !sectionOrder.includes('languages')) sectionOrder.push('languages');

            // Find unplaced custom sections and append them or the 'custom' fallback
            if (content.customSections?.length > 0) {
                content.customSections.forEach(c => {
                    const slug = c.heading.toLowerCase().replace(/\s+/g, '-');
                    if (!sectionOrder.includes(c.id) && !sectionOrder.includes(slug)) {
                        sectionOrder.push(c.id);
                    }
                });
            }
        }

        // Layout component selection
        const renderLayout = () => {
            const layoutProps = {
                sections: sectionOrder,
                data,
                tokens,
                showDivider: showDividers,
                skillDisplay,
                onEdit,
            };

            switch (layout) {
                case 'two-column':
                    return <TwoColumnLayout {...layoutProps} />;
                case 'sidebar-left':
                    return <SidebarLayout {...layoutProps} side="left" />;
                case 'sidebar-right':
                    return <SidebarLayout {...layoutProps} side="right" />;
                case 'single-column':
                default:
                    return <SingleColumnLayout {...layoutProps} />;
            }
        };

        return (
            <div
                ref={ref}
                style={{
                    maxWidth: '8.27in',
                    width: '100%',
                    backgroundColor: tokens.bodyBg,
                    color: tokens.bodyText,
                    fontFamily,
                    padding: '1.25rem 1.5rem',
                    boxSizing: 'border-box',
                    lineHeight: 1.4,
                }}
            >
                {/* Header is always first */}
                <HeaderSection
                    data={data.content?.personalInfo || { firstName: '', lastName: '', email: '', phone: '' }}
                    style={headerStyle}
                    tokens={tokens}
                    showIcons={showIcons}
                    onEdit={onEdit}
                />

                {/* Body sections in chosen layout */}
                {renderLayout()}
            </div>
        );
    }
);

UniversalRenderer.displayName = 'UniversalRenderer';

export default UniversalRenderer;
