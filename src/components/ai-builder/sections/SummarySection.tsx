import { InlineEdit } from '../InlineEdit';
import { SectionWrapper } from './SectionWrapper';
import type { OnEditFn } from '../types';
import type { DesignTokens } from '../designPresets';

interface SummarySectionProps {
    heading?: string;
    summary: string;
    tokens: DesignTokens;
    showDivider?: boolean;
    onEdit?: OnEditFn;
    onDeleteSection?: () => void;
}

export function SummarySection({ heading = 'Professional Summary', summary, tokens, showDivider, onEdit, onDeleteSection }: SummarySectionProps) {
    if (!summary) return null;

    return (
        <SectionWrapper title={heading} sectionKey="summary" onEdit={onEdit} tokens={tokens} showDivider={showDivider} onDeleteSection={onDeleteSection}>
            <InlineEdit
                value={summary}
                field="content.summary"
                onEdit={onEdit}
                tag="p"
                multiline
                style={{
                    fontSize: tokens.bodySize,
                    color: tokens.bodyText,
                    lineHeight: 1.6,
                }}
                placeholder="Write a professional summary..."
            />
        </SectionWrapper>
    );
}
