import { InlineEdit } from '../InlineEdit';
import { SectionWrapper } from './SectionWrapper';
import { Plus, X } from 'lucide-react';
import type { SkillItem, SkillDisplay, OnEditFn } from '../types';
import type { DesignTokens } from '../designPresets';

interface SkillsSectionProps {
    heading?: string;
    items: SkillItem[];
    display: SkillDisplay;
    tokens: DesignTokens;
    showDivider?: boolean;
    onEdit?: OnEditFn;
    onDeleteSection?: () => void;
}

export function SkillsSection({ heading = 'Skills', items, display, tokens, showDivider, onEdit, onDeleteSection }: SkillsSectionProps) {
    if (!items || items.length === 0) return null;

    return (
        <SectionWrapper className="group" title={heading} sectionKey="skills" onEdit={onEdit} tokens={tokens} showDivider={showDivider} onDeleteSection={onDeleteSection}>
            {display === 'tags' && <TagsView items={items} tokens={tokens} onEdit={onEdit} />}
            {display === 'bars' && <BarsView items={items} tokens={tokens} onEdit={onEdit} />}
            {display === 'dots' && <DotsView items={items} tokens={tokens} onEdit={onEdit} />}
            {display === 'grouped' && <GroupedView items={items} tokens={tokens} onEdit={onEdit} />}
            {display === 'plain' && <PlainView items={items} tokens={tokens} onEdit={onEdit} />}
            <div style={{ marginTop: '0.75rem', textAlign: 'center' }}>
                <button
                    onClick={() => onEdit('content.skills', [...items, { name: 'New Skill', level: 3, category: 'Other' }])}
                    className="opacity-0 group-hover:opacity-100 hover:!opacity-100 transition-opacity flex items-center gap-1 mx-auto text-[0.65rem] font-medium text-blue-500 bg-blue-50 hover:bg-blue-100 px-2 py-1 rounded-sm"
                >
                    <Plus className="w-3 h-3" /> Add Skill
                </button>
            </div>
        </SectionWrapper>
    );
}

// ---- Tags (default) ----
function TagsView({ items, tokens, onEdit }: { items: SkillItem[]; tokens: DesignTokens; onEdit: OnEditFn }) {
    return (
        <div className="print-flex-wrap" style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
            {items.map((skill, i) => (
                <div key={i} className="group/item print-avoid-break-inline relative flex items-center">
                    <InlineEdit
                        value={skill.name}
                        field={`content.skills.${i}.name`}
                        onEdit={onEdit}
                        tag="div"
                        style={{
                            padding: '0.3rem 0.6rem',
                            backgroundColor: tokens.tagBg,
                            color: tokens.tagText,
                            borderRadius: tokens.tagRadius,
                            fontSize: '0.7rem',
                            fontWeight: 500,
                            lineHeight: 1,
                        }}
                        placeholder="Skill"
                    />
                    <button
                        onClick={() => {
                            const newSkills = [...items];
                            newSkills.splice(i, 1);
                            onEdit('content.skills', newSkills);
                        }}
                        className="opacity-0 group-hover/item:opacity-100 transition-opacity absolute -top-2 -right-2 bg-red-100 text-red-600 rounded-full p-[2px] hover:bg-red-200 z-10 shadow-sm"
                        title="Remove skill"
                    >
                        <X className="w-2.5 h-2.5" />
                    </button>
                </div>
            ))}
        </div>
    );
}

// ---- Bars ----
function BarsView({ items, tokens, onEdit }: { items: SkillItem[]; tokens: DesignTokens; onEdit: OnEditFn }) {
    return (
        <div className="print-force-block" style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            {items.map((skill, i) => (
                <div key={i} className="group/item print-avoid-break relative pr-4">
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.15rem' }}>
                        <InlineEdit
                            value={skill.name}
                            field={`content.skills.${i}.name`}
                            onEdit={onEdit}
                            tag="span"
                            style={{ fontSize: '0.7rem', color: tokens.bodyText }}
                            placeholder="Skill"
                        />
                    </div>
                    <button
                        onClick={() => {
                            const newSkills = [...items];
                            newSkills.splice(i, 1);
                            onEdit('content.skills', newSkills);
                        }}
                        className="opacity-0 group-hover/item:opacity-100 transition-opacity absolute right-0 top-0 text-red-500 hover:text-red-700 bg-red-50 p-0.5 rounded-sm z-10"
                        title="Remove skill"
                    >
                        <X className="w-3 h-3" />
                    </button>
                    <div className="relative" style={{ height: '4px', borderRadius: '2px', backgroundColor: tokens.skillBarBg, overflow: 'hidden' }}>
                        <div
                            style={{
                                height: '100%',
                                width: `${((skill.level || 3) / 5) * 100}%`,
                                backgroundColor: tokens.skillBarFill,
                                borderRadius: '2px',
                                transition: 'width 0.3s ease',
                            }}
                        />
                        <div className="absolute inset-0 flex">
                            {[1, 2, 3, 4, 5].map(n => (
                                <div
                                    key={n}
                                    onClick={() => onEdit(`content.skills.${i}.level`, n)}
                                    className="flex-1 cursor-pointer hover:bg-black/10 transition-colors"
                                    title={`Set level to ${n}`}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}

// ---- Dots ----
function DotsView({ items, tokens, onEdit }: { items: SkillItem[]; tokens: DesignTokens; onEdit: OnEditFn }) {
    return (
        <div className="print-force-block" style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            {items.map((skill, i) => (
                <div key={i} className="group/item print-avoid-break relative pr-6" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <InlineEdit
                        value={skill.name}
                        field={`content.skills.${i}.name`}
                        onEdit={onEdit}
                        tag="span"
                        style={{ fontSize: '0.7rem', color: tokens.bodyText }}
                        placeholder="Skill"
                    />
                    <div style={{ display: 'flex', gap: '3px' }}>
                        {[1, 2, 3, 4, 5].map(n => (
                            <div
                                key={n}
                                onClick={() => onEdit(`content.skills.${i}.level`, n)}
                                className="cursor-pointer hover:scale-125 transition-transform"
                                title={`Set level to ${n}`}
                                style={{
                                    width: '6px',
                                    height: '6px',
                                    borderRadius: '50%',
                                    backgroundColor: n <= (skill.level || 3) ? tokens.skillBarFill : tokens.skillBarBg,
                                }}
                            />
                        ))}
                    </div>
                    <button
                        onClick={() => {
                            const newSkills = [...items];
                            newSkills.splice(i, 1);
                            onEdit('content.skills', newSkills);
                        }}
                        className="opacity-0 group-hover/item:opacity-100 transition-opacity absolute right-0 top-1/2 -translate-y-1/2 text-red-500 hover:text-red-700 bg-red-50 p-0.5 rounded-sm z-10"
                        title="Remove skill"
                    >
                        <X className="w-3 h-3" />
                    </button>
                </div>
            ))}
        </div>
    );
}

// ---- Grouped by category ----
function GroupedView({ items, tokens, onEdit }: { items: SkillItem[]; tokens: DesignTokens; onEdit: OnEditFn }) {
    const groups: Record<string, { skill: SkillItem; index: number }[]> = {};
    items.forEach((skill, index) => {
        const cat = skill.category || 'Other';
        if (!groups[cat]) groups[cat] = [];
        groups[cat].push({ skill, index });
    });

    return (
        <div className="print-force-block" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {Object.entries(groups).map(([category, skills]) => (
                <div key={category} className="print-avoid-break">
                    <p style={{ fontSize: '0.7rem', fontWeight: 600, color: tokens.primaryColor, marginBottom: '0.2rem' }}>
                        {category}
                    </p>
                    <div className="print-flex-wrap" style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
                        {skills.map(({ skill, index }) => (
                            <div key={index} className="group/item print-avoid-break-inline relative flex items-center">
                                <InlineEdit
                                    value={skill.name}
                                    field={`content.skills.${index}.name`}
                                    onEdit={onEdit}
                                    tag="span"
                                    style={{
                                        padding: '0.15rem 0.5rem',
                                        backgroundColor: tokens.tagBg,
                                        color: tokens.tagText,
                                        borderRadius: tokens.tagRadius,
                                        fontSize: '0.65rem',
                                    }}
                                    placeholder="Skill"
                                />
                                <button
                                    onClick={() => {
                                        const newSkills = [...items];
                                        newSkills.splice(index, 1);
                                        onEdit('content.skills', newSkills);
                                    }}
                                    className="opacity-0 group-hover/item:opacity-100 transition-opacity absolute -top-1 -right-1 bg-red-100 text-red-600 rounded-full p-[1px] hover:bg-red-200 z-10 shadow-sm"
                                    title="Remove skill"
                                >
                                    <X className="w-2.5 h-2.5" />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}

// ---- Plain comma-separated ----
function PlainView({ items, tokens, onEdit }: { items: SkillItem[]; tokens: DesignTokens; onEdit: OnEditFn }) {
    return (
        <div style={{ fontSize: tokens.bodySize, color: tokens.bodyText, lineHeight: 1.6 }}>
            {items.map((skill, i) => (
                <span key={i}>
                    <InlineEdit
                        value={skill.name}
                        field={`content.skills.${i}.name`}
                        onEdit={onEdit}
                        tag="span"
                        placeholder="Skill"
                    />
                    {i < items.length - 1 && <span style={{ color: tokens.mutedText }}>, </span>}
                </span>
            ))}
        </div>
    );
}
