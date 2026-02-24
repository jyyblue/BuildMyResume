import { Mail, Phone, MapPin, Globe, Linkedin, Github } from 'lucide-react';
import { InlineEdit } from '../InlineEdit';
import type { PersonalInfo, HeaderStyle, OnEditFn } from '../types';
import type { DesignTokens } from '../designPresets';

interface HeaderSectionProps {
    data: PersonalInfo;
    style: HeaderStyle;
    tokens: DesignTokens;
    showIcons: boolean;
    onEdit: OnEditFn;
}

export function HeaderSection({ data, style, tokens, showIcons, onEdit }: HeaderSectionProps) {
    const alignment = style === 'centered' ? 'center' : 'left';

    const contactItems = [
        { icon: Mail, value: data.email, field: 'content.personalInfo.email' },
        { icon: Phone, value: data.phone, field: 'content.personalInfo.phone' },
        { icon: MapPin, value: data.location, field: 'content.personalInfo.location' },
        { icon: Linkedin, value: data.linkedIn, field: 'content.personalInfo.linkedIn' },
        { icon: Globe, value: data.website, field: 'content.personalInfo.website' },
        { icon: Github, value: data.github, field: 'content.personalInfo.github' },
    ].filter(item => item.value);

    return (
        <header
            style={{
                textAlign: alignment,
                background: tokens.headerBg,
                color: tokens.headerBg !== 'transparent' ? tokens.headerText : tokens.bodyText,
                padding: tokens.headerBg !== 'transparent' ? '1.25rem 1.5rem' : '0',
                marginBottom: '1rem',
                borderBottom: tokens.headerBorder !== 'none' ? tokens.headerBorder : undefined,
            }}
        >
            {/* Name */}
            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: alignment === 'center' ? 'center' : 'flex-start', flexWrap: 'wrap' }}>
                <InlineEdit
                    value={data.firstName}
                    field="content.personalInfo.firstName"
                    onEdit={onEdit}
                    tag="span"
                    className="font-bold"
                    style={{ fontSize: tokens.nameSize, lineHeight: 1.2 }}
                />
                <InlineEdit
                    value={data.lastName}
                    field="content.personalInfo.lastName"
                    onEdit={onEdit}
                    tag="span"
                    className="font-bold"
                    style={{ fontSize: tokens.nameSize, lineHeight: 1.2 }}
                />
            </div>

            {/* Title */}
            {data.title && (
                <InlineEdit
                    value={data.title}
                    field="content.personalInfo.title"
                    onEdit={onEdit}
                    tag="p"
                    style={{
                        fontSize: '0.875rem',
                        color: tokens.headerBg !== 'transparent' ? tokens.headerText : tokens.accentColor,
                        marginTop: '0.25rem',
                    }}
                    placeholder="Job Title"
                />
            )}

            {/* Contact details */}
            <div
                style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '0.75rem',
                    justifyContent: alignment === 'center' ? 'center' : 'flex-start',
                    marginTop: '0.5rem',
                    fontSize: '0.7rem',
                    color: tokens.headerBg !== 'transparent' ? tokens.headerText : tokens.mutedText,
                }}
            >
                {contactItems.map(({ icon: Icon, value, field }) => (
                    <div key={field} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        {showIcons && <Icon size={12} style={{ flexShrink: 0 }} />}
                        <InlineEdit
                            value={value || ''}
                            field={field}
                            onEdit={onEdit}
                            tag="span"
                            style={{ lineHeight: 1 }}
                        />
                    </div>
                ))}
            </div>
        </header>
    );
}
