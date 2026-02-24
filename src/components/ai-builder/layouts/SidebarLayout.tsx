import type { SectionKey, AIResumeData, OnEditFn, SkillDisplay } from '../types';
import type { DesignTokens } from '../designPresets';
import { renderSection } from '../sections/renderSection';

interface SidebarLayoutProps {
    sections: SectionKey[];
    data: AIResumeData;
    tokens: DesignTokens;
    showDivider: boolean;
    skillDisplay: SkillDisplay;
    onEdit: OnEditFn;
    side: 'left' | 'right';
}

const SIDEBAR_KEYS: SectionKey[] = ['skills', 'certifications', 'languages'];
const MAIN_KEYS: SectionKey[] = ['summary', 'experience', 'education'];

/**
 * Sidebar layout — colored sidebar with supporting sections,
 * main content area with primary sections. Sidebar can be left or right.
 */
export function SidebarLayout({ sections, data, tokens, showDivider, skillDisplay, onEdit, side }: SidebarLayoutProps) {
    const sidebarSections: SectionKey[] = [];
    const mainSections: SectionKey[] = [];
    let currentColumn: 'main' | 'sidebar' = 'main';

    sections.forEach(s => {
        if (SIDEBAR_KEYS.includes(s)) {
            currentColumn = 'sidebar';
            sidebarSections.push(s);
        } else if (MAIN_KEYS.includes(s)) {
            currentColumn = 'main';
            mainSections.push(s);
        } else {
            // Custom sections and unknown keys follow the current column context
            if (currentColumn === 'sidebar') {
                sidebarSections.push(s);
            } else {
                mainSections.push(s);
            }
        }
    });

    const sidebar = (
        <div
            style={{
                backgroundColor: tokens.sidebarBg,
                color: tokens.sidebarText,
                padding: '1rem',
                borderRadius: side === 'left' ? '0' : '0',
            }}
        >
            {sidebarSections.map(key =>
                renderSection({ sectionKey: key, data, tokens, showDivider, skillDisplay, onEdit })
            )}
        </div>
    );

    const main = (
        <div style={{ padding: '0' }}>
            {mainSections.map(key =>
                renderSection({ sectionKey: key, data, tokens, showDivider, skillDisplay, onEdit })
            )}
        </div>
    );

    return (
        <div
            style={{
                display: 'grid',
                gridTemplateColumns: side === 'left' ? '0.35fr 0.65fr' : '0.65fr 0.35fr',
                gap: '1rem',
            }}
        >
            {side === 'left' ? (
                <>
                    {sidebar}
                    {main}
                </>
            ) : (
                <>
                    {main}
                    {sidebar}
                </>
            )}
        </div>
    );
}
