import type { SectionKey, AIResumeData, OnEditFn, SkillDisplay, MAIN_SECTIONS, SIDEBAR_SECTIONS } from '../types';
import type { DesignTokens } from '../designPresets';
import { renderSection } from '../sections/renderSection';

interface TwoColumnLayoutProps {
    sections: SectionKey[];
    data: AIResumeData;
    tokens: DesignTokens;
    showDivider: boolean;
    skillDisplay: SkillDisplay;
    onEdit: OnEditFn;
}

const SIDEBAR_KEYS: SectionKey[] = ['skills', 'certifications', 'languages'];
const MAIN_KEYS: SectionKey[] = ['summary', 'experience', 'education'];

/**
 * Two-column layout — main content left, supporting content right.
 */
export function TwoColumnLayout({ sections, data, tokens, showDivider, skillDisplay, onEdit }: TwoColumnLayoutProps) {
    const leftSections: SectionKey[] = [];
    const rightSections: SectionKey[] = [];
    let currentColumn: 'left' | 'right' = 'left';

    sections.forEach(s => {
        if (SIDEBAR_KEYS.includes(s)) {
            currentColumn = 'right';
            rightSections.push(s);
        } else if (MAIN_KEYS.includes(s)) {
            currentColumn = 'left';
            leftSections.push(s);
        } else {
            // Custom sections and unknown keys follow the current column context
            if (currentColumn === 'right') {
                rightSections.push(s);
            } else {
                leftSections.push(s);
            }
        }
    });

    return (
        <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 0.7fr', gap: '1.5rem' }}>
            {/* Left — main content */}
            <div>
                {leftSections.map(key =>
                    renderSection({ sectionKey: key, data, tokens, showDivider, skillDisplay, onEdit })
                )}
            </div>

            {/* Right — supporting content */}
            <div>
                {rightSections.map(key =>
                    renderSection({ sectionKey: key, data, tokens, showDivider, skillDisplay, onEdit })
                )}
            </div>
        </div>
    );
}
