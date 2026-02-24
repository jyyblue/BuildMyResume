import { InlineEdit } from '../InlineEdit';
import { SectionWrapper } from './SectionWrapper';
import { Plus, X } from 'lucide-react';
import type { ExperienceItem, OnEditFn } from '../types';
import type { DesignTokens } from '../designPresets';

interface ExperienceSectionProps {
    heading?: string;
    items: ExperienceItem[];
    tokens: DesignTokens;
    showDivider?: boolean;
    onEdit?: OnEditFn;
    onDeleteSection?: () => void;
}

function formatDate(dateStr: string): string {
    if (!dateStr) return '';
    const d = new Date(dateStr + '-01');
    return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}

function formatRange(start: string, end?: string, current?: boolean): string {
    const s = formatDate(start);
    const e = current ? 'Present' : formatDate(end || '');
    if (!s && !e) return '';
    return `${s} — ${e}`;
}

export function ExperienceSection({ heading = 'Work Experience', items, tokens, showDivider, onEdit, onDeleteSection }: ExperienceSectionProps) {
    if (!items || items.length === 0) return null;

    return (
        <SectionWrapper className="group" title={heading} sectionKey="experience" onEdit={onEdit} tokens={tokens} showDivider={showDivider} onDeleteSection={onDeleteSection}>
            <div className="print-force-block" style={{ display: 'flex', flexDirection: 'column', gap: tokens.itemGap }}>
                {items.map((exp, i) => (
                    <div key={exp.id || i} className="group/item print-avoid-break relative rounded-sm hover:bg-black/5 p-2 -mx-2 transition-colors">
                        {/* Title + Date row */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap' }}>
                            <InlineEdit
                                value={exp.title}
                                field={`content.experience.${i}.title`}
                                onEdit={onEdit}
                                tag="h3"
                                style={{ fontSize: '0.8rem', fontWeight: 600, color: tokens.bodyText }}
                                placeholder="Job Title"
                            />
                            <span style={{ fontSize: '0.7rem', color: tokens.mutedText, flexShrink: 0 }}>
                                {formatRange(exp.startDate, exp.endDate, exp.current)}
                            </span>
                        </div>

                        {/* Company + Location */}
                        <div style={{ display: 'flex', gap: '0.25rem', alignItems: 'baseline', flexWrap: 'wrap' }}>
                            <InlineEdit
                                value={exp.company}
                                field={`content.experience.${i}.company`}
                                onEdit={onEdit}
                                tag="span"
                                style={{ fontSize: '0.75rem', color: tokens.primaryColor, fontWeight: 500 }}
                                placeholder="Company"
                            />
                            {exp.location && (
                                <>
                                    <span style={{ fontSize: '0.7rem', color: tokens.mutedText }}>•</span>
                                    <InlineEdit
                                        value={exp.location}
                                        field={`content.experience.${i}.location`}
                                        onEdit={onEdit}
                                        tag="span"
                                        style={{ fontSize: '0.7rem', color: tokens.mutedText }}
                                        placeholder="Location"
                                    />
                                </>
                            )}
                        </div>

                        {/* Highlights */}
                        {exp.highlights && exp.highlights.length > 0 && (
                            <ul style={{ margin: '0.35rem 0 0 1rem', padding: 0, listStyleType: 'disc' }}>
                                {exp.highlights.map((h, j) => (
                                    <li key={j} style={{ fontSize: tokens.bodySize, color: tokens.bodyText, lineHeight: 1.5, marginBottom: '0.15rem' }}>
                                        <InlineEdit
                                            value={h}
                                            field={`content.experience.${i}.highlights.${j}`}
                                            onEdit={onEdit}
                                            tag="span"
                                            placeholder="Achievement or responsibility"
                                        />
                                    </li>
                                ))}
                            </ul>
                        )}
                        <button
                            onClick={() => {
                                const newExp = [...items];
                                newExp.splice(i, 1);
                                onEdit('content.experience', newExp);
                            }}
                            className="opacity-0 group-hover/item:opacity-100 transition-opacity absolute right-1 top-1 text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 p-1 rounded-md z-10"
                            title="Remove role"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                ))}
            </div>
            <div style={{ marginTop: '0.75rem', textAlign: 'center' }}>
                <button
                    onClick={() => onEdit('content.experience', [...items, { id: `id_${Date.now()}`, title: 'New Role', company: 'Company Name', startDate: new Date().toISOString().substring(0, 7), highlights: ['Added a new achievement'] }])}
                    className="opacity-0 group-hover:opacity-100 hover:!opacity-100 transition-opacity flex items-center gap-1 mx-auto text-[0.65rem] font-medium text-blue-500 bg-blue-50 hover:bg-blue-100 px-2 py-1 rounded-sm"
                >
                    <Plus className="w-3 h-3" /> Add Role
                </button>
            </div>
        </SectionWrapper>
    );
}
