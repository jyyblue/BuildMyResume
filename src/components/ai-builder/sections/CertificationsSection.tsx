import { InlineEdit } from '../InlineEdit';
import { SectionWrapper } from './SectionWrapper';
import { Plus, X } from 'lucide-react';
import type { CertificationItem, OnEditFn } from '../types';
import type { DesignTokens } from '../designPresets';

interface CertificationsSectionProps {
    heading?: string;
    items: CertificationItem[];
    tokens: DesignTokens;
    showDivider?: boolean;
    onEdit?: OnEditFn;
    onDeleteSection?: () => void;
}

export function CertificationsSection({ heading = 'Certifications', items, tokens, showDivider, onEdit, onDeleteSection }: CertificationsSectionProps) {
    if (!items || items.length === 0) return null;

    return (
        <SectionWrapper className="group" title={heading} sectionKey="certifications" onEdit={onEdit} tokens={tokens} showDivider={showDivider} onDeleteSection={onDeleteSection}>
            <div className="print-force-block" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {items.map((cert, i) => (
                    <div key={cert.id || i} className="group/item print-avoid-break relative rounded-sm hover:bg-black/5 p-2 -mx-2 transition-colors">
                        <InlineEdit
                            value={cert.name}
                            field={`content.certifications.${i}.name`}
                            onEdit={onEdit}
                            tag="h3"
                            style={{ fontSize: '0.75rem', fontWeight: 600, color: tokens.bodyText }}
                            placeholder="Certification Name"
                        />
                        {cert.issuer && (
                            <InlineEdit
                                value={cert.issuer}
                                field={`content.certifications.${i}.issuer`}
                                onEdit={onEdit}
                                tag="p"
                                style={{ fontSize: '0.7rem', color: tokens.primaryColor }}
                                placeholder="Issuer"
                            />
                        )}
                        {cert.date && (
                            <p style={{ fontSize: '0.65rem', color: tokens.mutedText }}>{cert.date}</p>
                        )}
                        <button
                            onClick={() => {
                                const newCerts = [...items];
                                newCerts.splice(i, 1);
                                onEdit('content.certifications', newCerts);
                            }}
                            className="opacity-0 group-hover/item:opacity-100 transition-opacity absolute right-1 top-1 text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 p-1 rounded-md z-10"
                            title="Remove certification"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                ))}
            </div>
            <div style={{ marginTop: '0.75rem', textAlign: 'center' }}>
                <button
                    onClick={() => onEdit('content.certifications', [...items, { id: `id_${Date.now()}`, name: 'New Certification', issuer: 'Issuer Name', date: '2023' }])}
                    className="opacity-0 group-hover:opacity-100 hover:!opacity-100 transition-opacity flex items-center gap-1 mx-auto text-[0.65rem] font-medium text-blue-500 bg-blue-50 hover:bg-blue-100 px-2 py-1 rounded-sm"
                >
                    <Plus className="w-3 h-3" /> Add Certification
                </button>
            </div>
        </SectionWrapper>
    );
}
