import type { DesignTokens } from '../designPresets';
import { InlineEdit } from '../InlineEdit';
import type { OnEditFn, SectionKey } from '../types';
import { Trash2 } from 'lucide-react';

interface SectionWrapperProps {
    title: string;
    sectionKey?: SectionKey;
    editField?: string;
    onEdit?: OnEditFn;
    tokens: DesignTokens;
    children: React.ReactNode;
    showDivider?: boolean;
    className?: string;
    onDeleteSection?: () => void;
}

/**
 * Wraps each resume section with a title and optional divider.
 */
export function SectionWrapper({ title, sectionKey, editField, onEdit, tokens, children, showDivider = true, className = "", onDeleteSection }: SectionWrapperProps) {
    const headingStyle: React.CSSProperties = {
        fontSize: tokens.sectionTitleSize,
        fontWeight: tokens.headingWeight,
        textTransform: tokens.sectionTitleTransform as any,
        color: tokens.primaryColor,
        letterSpacing: '0.05em',
        marginBottom: '0',
        paddingBottom: showDivider ? '0.25rem' : '0',
        borderBottom: showDivider ? tokens.dividerStyle : 'none',
        pageBreakAfter: 'avoid',
        pageBreakInside: 'avoid',
        breakAfter: 'avoid',
        breakInside: 'avoid',
    };

    return (
        <section className={`group/section relative ${className}`} style={{ marginBottom: tokens.sectionGap }}>
            {onDeleteSection && (
                <button
                    onClick={onDeleteSection}
                    className="opacity-0 group-hover/section:opacity-100 transition-opacity absolute right-0 top-0 text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 p-1.5 rounded-md z-20 shadow-sm"
                    title="Delete entire section"
                >
                    <Trash2 className="w-4 h-4" />
                </button>
            )}
            {onEdit && (sectionKey || editField) ? (
                <InlineEdit
                    value={title}
                    field={editField || `content.headings.${sectionKey}`}
                    onEdit={onEdit}
                    tag="h2"
                    style={headingStyle}
                    placeholder={title}
                />
            ) : (
                <h2 style={headingStyle}>{title}</h2>
            )}
            <div style={{ paddingTop: '0.5rem' }}>
                {children}
            </div>
        </section>
    );
}
