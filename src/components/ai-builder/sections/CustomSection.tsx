import { InlineEdit } from '../InlineEdit';
import { SectionWrapper } from './SectionWrapper';
import { Plus, X } from 'lucide-react';
import type { CustomSectionData, OnEditFn } from '../types';
import type { DesignTokens } from '../designPresets';

interface CustomSectionProps {
    section: CustomSectionData;
    sectionIndex: number;
    tokens: DesignTokens;
    showDivider: boolean;
    onEdit: OnEditFn;
    onDeleteSection?: () => void;
}

export function CustomSection({ section, sectionIndex, tokens, showDivider, onEdit, onDeleteSection }: CustomSectionProps) {
    if (!section) return null;

    return (
        <SectionWrapper className="group" title={section.heading} editField={`content.customSections.${sectionIndex}.heading`} onEdit={onEdit} tokens={tokens} showDivider={showDivider} onDeleteSection={onDeleteSection}>
            <div className="print-force-block" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {section.items.map((item, j) => (
                    <div key={item.id || j} className="group/item print-avoid-break relative rounded-sm hover:bg-black/5 p-2 -mx-2 transition-colors">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap' }}>
                            <InlineEdit
                                value={item.title}
                                field={`content.customSections.${sectionIndex}.items.${j}.title`}
                                onEdit={onEdit}
                                tag="h3"
                                style={{ fontSize: '0.8rem', fontWeight: 600, color: tokens.bodyText }}
                                placeholder="Title"
                            />
                            {item.date && (
                                <span style={{ fontSize: '0.65rem', color: tokens.mutedText }}>{item.date}</span>
                            )}
                        </div>

                        {item.subtitle && (
                            <InlineEdit
                                value={item.subtitle}
                                field={`content.customSections.${sectionIndex}.items.${j}.subtitle`}
                                onEdit={onEdit}
                                tag="p"
                                style={{ fontSize: '0.7rem', color: tokens.primaryColor }}
                                placeholder="Subtitle"
                            />
                        )}

                        {item.description && (
                            <InlineEdit
                                value={item.description}
                                field={`content.customSections.${sectionIndex}.items.${j}.description`}
                                onEdit={onEdit}
                                tag="p"
                                multiline
                                style={{ fontSize: tokens.bodySize, color: tokens.bodyText, lineHeight: 1.5, marginTop: '0.2rem' }}
                                placeholder="Description"
                            />
                        )}

                        {item.highlights && item.highlights.length > 0 && (
                            <ul style={{ margin: '0.25rem 0 0 1rem', padding: 0, listStyleType: 'disc' }}>
                                {item.highlights.map((h, k) => (
                                    <li key={k} style={{ fontSize: tokens.bodySize, color: tokens.bodyText, lineHeight: 1.5 }}>
                                        <InlineEdit
                                            value={h}
                                            field={`content.customSections.${sectionIndex}.items.${j}.highlights.${k}`}
                                            onEdit={onEdit}
                                            tag="span"
                                            placeholder="Highlight"
                                        />
                                    </li>
                                ))}
                            </ul>
                        )}
                        <button
                            onClick={() => {
                                const newItems = [...section.items];
                                newItems.splice(j, 1);
                                onEdit(`content.customSections.${sectionIndex}.items`, newItems);
                            }}
                            className="opacity-0 group-hover/item:opacity-100 transition-opacity absolute right-1 top-1 text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 p-1 rounded-md z-10"
                            title="Remove item"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                ))}
            </div>
            <div style={{ marginTop: '0.75rem', textAlign: 'center' }}>
                <button
                    onClick={() => onEdit(`content.customSections.${sectionIndex}.items`, [...section.items, { id: `id_${Date.now()}`, title: 'New Entry', subtitle: 'Subtitle', date: 'Date', description: 'Description' }])}
                    className="opacity-0 group-hover:opacity-100 hover:!opacity-100 transition-opacity flex items-center gap-1 mx-auto text-[0.65rem] font-medium text-blue-500 bg-blue-50 hover:bg-blue-100 px-2 py-1 rounded-sm"
                >
                    <Plus className="w-3 h-3" /> Add Item
                </button>
            </div>
        </SectionWrapper>
    );
}
