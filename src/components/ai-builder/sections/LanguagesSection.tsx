import { InlineEdit } from '../InlineEdit';
import { SectionWrapper } from './SectionWrapper';
import { Plus, X } from 'lucide-react';
import type { LanguageItem, OnEditFn } from '../types';
import type { DesignTokens } from '../designPresets';

interface LanguagesSectionProps {
    heading?: string;
    items: LanguageItem[];
    tokens: DesignTokens;
    showDivider?: boolean;
    onEdit?: OnEditFn;
    onDeleteSection?: () => void;
}

export function LanguagesSection({ heading = 'Languages', items, tokens, showDivider, onEdit, onDeleteSection }: LanguagesSectionProps) {
    if (!items || items.length === 0) return null;

    return (
        <SectionWrapper className="group" title={heading} sectionKey="languages" onEdit={onEdit} tokens={tokens} showDivider={showDivider} onDeleteSection={onDeleteSection}>
            <div className="print-force-block" style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                {items.map((lang, i) => (
                    <div key={lang.id || i} className="group/item print-avoid-break relative pr-6" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <InlineEdit
                            value={lang.name}
                            field={`content.languages.${i}.name`}
                            onEdit={onEdit}
                            tag="span"
                            style={{ fontSize: '0.75rem', fontWeight: 500, color: tokens.bodyText }}
                            placeholder="Language"
                        />
                        <span style={{ fontSize: '0.65rem', color: tokens.mutedText }}>
                            {lang.proficiency || ''}
                        </span>
                        <button
                            onClick={() => {
                                const newLangs = [...items];
                                newLangs.splice(i, 1);
                                onEdit('content.languages', newLangs);
                            }}
                            className="opacity-0 group-hover/item:opacity-100 transition-opacity absolute right-0 top-1/2 -translate-y-1/2 text-red-500 hover:text-red-700 bg-red-50 p-0.5 rounded-sm z-10"
                            title="Remove language"
                        >
                            <X className="w-3 h-3" />
                        </button>
                    </div>
                ))}
            </div>
            <div style={{ marginTop: '0.75rem', textAlign: 'center' }}>
                <button
                    onClick={() => onEdit('content.languages', [...items, { id: `id_${Date.now()}`, name: 'New Language', proficiency: 'Native' }])}
                    className="opacity-0 group-hover:opacity-100 hover:!opacity-100 transition-opacity flex items-center gap-1 mx-auto text-[0.65rem] font-medium text-blue-500 bg-blue-50 hover:bg-blue-100 px-2 py-1 rounded-sm"
                >
                    <Plus className="w-3 h-3" /> Add Language
                </button>
            </div>
        </SectionWrapper>
    );
}
