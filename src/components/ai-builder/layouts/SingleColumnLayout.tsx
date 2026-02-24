import type { SectionKey, AIResumeData, OnEditFn, SkillDisplay } from '../types';
import type { DesignTokens } from '../designPresets';
import { renderSection } from '../sections/renderSection';

interface SingleColumnLayoutProps {
    sections: SectionKey[];
    data: AIResumeData;
    tokens: DesignTokens;
    showDivider: boolean;
    skillDisplay: SkillDisplay;
    onEdit: OnEditFn;
}

/**
 * Single-column layout — all sections flow vertically.
 * ATS-safest, simplest layout.
 */
export function SingleColumnLayout({ sections, data, tokens, showDivider, skillDisplay, onEdit }: SingleColumnLayoutProps) {
    return (
        <div>
            {sections.map(key =>
                renderSection({ sectionKey: key, data, tokens, showDivider, skillDisplay, onEdit })
            )}
        </div>
    );
}
