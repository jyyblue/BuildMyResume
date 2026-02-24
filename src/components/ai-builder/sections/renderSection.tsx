import type { SectionKey, AIResumeData, OnEditFn } from '../types';
import type { DesignTokens } from '../designPresets';
import { SummarySection } from './SummarySection';
import { ExperienceSection } from './ExperienceSection';
import { EducationSection } from './EducationSection';
import { SkillsSection } from './SkillsSection';
import { CertificationsSection } from './CertificationsSection';
import { LanguagesSection } from './LanguagesSection';
import { CustomSection } from './CustomSection';
import type { SkillDisplay } from '../types';

interface SectionRendererProps {
    sectionKey: SectionKey;
    data: AIResumeData;
    tokens: DesignTokens;
    showDivider: boolean;
    skillDisplay: SkillDisplay;
    onEdit: OnEditFn;
}

/**
 * Renders a single section by key. Used by all layout components.
 */
export function renderSection({
    sectionKey,
    data,
    tokens,
    showDivider,
    skillDisplay,
    onEdit,
}: SectionRendererProps): React.ReactNode {
    const content = data.content;

    // Helper to completely remove a section's data and order
    const getDeleteHandler = (field: string, idToRemove: string, emptyVal: any) => () => {
        onEdit(field, emptyVal);
        onEdit('sectionOrder', (data.sectionOrder || []).filter(k => k !== idToRemove));
    };

    switch (sectionKey) {
        case 'summary':
            return <SummarySection key="summary" heading={content.headings?.summary} summary={content.summary} tokens={tokens} showDivider={showDivider} onEdit={onEdit} onDeleteSection={getDeleteHandler('content.summary', 'summary', '')} />;
        case 'experience':
            return <ExperienceSection key="experience" heading={content.headings?.experience} items={content.experience} tokens={tokens} showDivider={showDivider} onEdit={onEdit} onDeleteSection={getDeleteHandler('content.experience', 'experience', [])} />;
        case 'education':
            return <EducationSection key="education" heading={content.headings?.education} items={content.education} tokens={tokens} showDivider={showDivider} onEdit={onEdit} onDeleteSection={getDeleteHandler('content.education', 'education', [])} />;
        case 'skills':
            return <SkillsSection key="skills" heading={content.headings?.skills} items={content.skills} display={skillDisplay} tokens={tokens} showDivider={showDivider} onEdit={onEdit} onDeleteSection={getDeleteHandler('content.skills', 'skills', [])} />;
        case 'certifications':
            return <CertificationsSection key="certifications" heading={content.headings?.certifications} items={content.certifications} tokens={tokens} showDivider={showDivider} onEdit={onEdit} onDeleteSection={getDeleteHandler('content.certifications', 'certifications', [])} />;
        case 'languages':
            return <LanguagesSection key="languages" heading={content.headings?.languages} items={content.languages} tokens={tokens} showDivider={showDivider} onEdit={onEdit} onDeleteSection={getDeleteHandler('content.languages', 'languages', [])} />;
        case 'custom':
            const unplacedSections = content.customSections?.filter(c =>
                !data.sectionOrder?.includes(c.id) &&
                !data.sectionOrder?.includes(c.heading.toLowerCase().replace(/\s+/g, '-'))
            ) || [];
            return (
                <>
                    {unplacedSections.map((section) => {
                        const idx = content.customSections.indexOf(section);
                        return <CustomSection key={section.id || idx} section={section} sectionIndex={idx} tokens={tokens} showDivider={showDivider} onEdit={onEdit} onDeleteSection={() => {
                            const newCustom = [...content.customSections];
                            newCustom.splice(idx, 1);
                            getDeleteHandler('content.customSections', section.id, newCustom)();
                        }} />;
                    })}
                </>
            );
    }

    // Default fallback: check if sectionKey matches any customSection ID or slug
    const customIdx = content.customSections?.findIndex(c => c.id === sectionKey || c.heading.toLowerCase().replace(/\s+/g, '-') === sectionKey);
    if (customIdx !== undefined && customIdx >= 0) {
        const section = content.customSections[customIdx];
        return <CustomSection key={section.id || sectionKey} section={section} sectionIndex={customIdx} tokens={tokens} showDivider={showDivider} onEdit={onEdit} onDeleteSection={() => {
            const newCustom = [...content.customSections];
            newCustom.splice(customIdx, 1);
            getDeleteHandler('content.customSections', sectionKey, newCustom)();
        }} />;
    }

    return null;
}
