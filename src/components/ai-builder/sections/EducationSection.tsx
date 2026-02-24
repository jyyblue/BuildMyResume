import { InlineEdit } from '../InlineEdit';
import { SectionWrapper } from './SectionWrapper';
import { Plus, X } from 'lucide-react';
import type { EducationItem, OnEditFn } from '../types';
import type { DesignTokens } from '../designPresets';

interface EducationSectionProps {
    heading?: string;
    items: EducationItem[];
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

export function EducationSection({ heading = 'Education', items, tokens, showDivider, onEdit, onDeleteSection }: EducationSectionProps) {
    if (!items || items.length === 0) return null;

    return (
        <SectionWrapper className="group" title={heading} sectionKey="education" onEdit={onEdit} tokens={tokens} showDivider={showDivider} onDeleteSection={onDeleteSection}>
            <div className="print-force-block" style={{ display: 'flex', flexDirection: 'column', gap: tokens.itemGap }}>
                {items.map((edu, i) => (
                    <div key={edu.id || i} className="group/item print-avoid-break relative rounded-sm hover:bg-black/5 p-2 -mx-2 transition-colors">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap' }}>
                            <InlineEdit
                                value={edu.degree}
                                field={`content.education.${i}.degree`}
                                onEdit={onEdit}
                                tag="h3"
                                style={{ fontSize: '0.8rem', fontWeight: 600, color: tokens.bodyText }}
                                placeholder="Degree"
                            />
                            <span style={{ fontSize: '0.7rem', color: tokens.mutedText, flexShrink: 0 }}>
                                {[formatDate(edu.startDate || ''), formatDate(edu.endDate || '')].filter(Boolean).join(' — ')}
                            </span>
                        </div>

                        <div style={{ display: 'flex', gap: '0.25rem', alignItems: 'baseline', flexWrap: 'wrap' }}>
                            <InlineEdit
                                value={edu.school}
                                field={`content.education.${i}.school`}
                                onEdit={onEdit}
                                tag="span"
                                style={{ fontSize: '0.75rem', color: tokens.primaryColor, fontWeight: 500 }}
                                placeholder="School"
                            />
                            {edu.field && (
                                <>
                                    <span style={{ color: tokens.mutedText }}>—</span>
                                    <InlineEdit
                                        value={edu.field}
                                        field={`content.education.${i}.field`}
                                        onEdit={onEdit}
                                        tag="span"
                                        style={{ fontSize: '0.7rem', color: tokens.mutedText }}
                                        placeholder="Field of Study"
                                    />
                                </>
                            )}
                        </div>

                        {edu.gpa && (
                            <p style={{ fontSize: '0.7rem', color: tokens.mutedText, marginTop: '0.15rem' }}>
                                GPA: {edu.gpa}
                            </p>
                        )}
                        <button
                            onClick={() => {
                                const newEdu = [...items];
                                newEdu.splice(i, 1);
                                onEdit('content.education', newEdu);
                            }}
                            className="opacity-0 group-hover/item:opacity-100 transition-opacity absolute right-1 top-1 text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 p-1 rounded-md z-10"
                            title="Remove education"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                ))}
            </div>
            <div style={{ marginTop: '0.75rem', textAlign: 'center' }}>
                <button
                    onClick={() => onEdit('content.education', [...items, { id: `id_${Date.now()}`, degree: 'New Degree', school: 'School Name', startDate: '2019-01', endDate: '2023-01' }])}
                    className="opacity-0 group-hover:opacity-100 hover:!opacity-100 transition-opacity flex items-center gap-1 mx-auto text-[0.65rem] font-medium text-blue-500 bg-blue-50 hover:bg-blue-100 px-2 py-1 rounded-sm"
                >
                    <Plus className="w-3 h-3" /> Add Education
                </button>
            </div>
        </SectionWrapper>
    );
}
