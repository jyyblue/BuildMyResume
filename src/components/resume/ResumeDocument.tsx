import React from 'react';
import {
    Document,
    Page,
    View,
    Text,
    StyleSheet,
    Font,
    Link,
} from '@react-pdf/renderer';
import type { ResumeData } from '@/types/resume';

// ========================================
// FONT REGISTRATION
// ========================================
// Using Google Fonts via CDN
Font.register({
    family: 'Inter',
    fonts: [
        { src: 'https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hjp-Ek-_EeA.woff', fontWeight: 400 },
        { src: 'https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuGKYAZ9hjp-Ek-_EeA.woff', fontWeight: 600 },
        { src: 'https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuFuYAZ9hjp-Ek-_EeA.woff', fontWeight: 700 },
    ],
});

// ========================================
// STYLES
// ========================================
const createStyles = (meta: ResumeData['meta']) => StyleSheet.create({
    page: {
        fontFamily: 'Inter',
        fontSize: meta.fontSize === 'small' ? 9 : meta.fontSize === 'large' ? 11 : 10,
        padding: meta.spacing === 'compact' ? 30 : meta.spacing === 'spacious' ? 50 : 40,
        color: '#1f2937',
        lineHeight: 1.4,
    },
    header: {
        marginBottom: 16,
        borderBottomWidth: 2,
        borderBottomColor: meta.primaryColor,
        paddingBottom: 12,
    },
    name: {
        fontSize: 24,
        fontWeight: 700,
        color: meta.primaryColor,
        marginBottom: 12,
    },
    title: {
        fontSize: 12,
        color: meta.accentColor,
        marginBottom: 12,
    },
    contactRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
        fontSize: 9,
        color: '#4b5563',
    },
    contactItem: {
        // Text component doesn't support flex layout
    },
    section: {
        marginBottom: 14,
    },
    sectionTitle: {
        fontSize: 12,
        fontWeight: 700,
        color: meta.primaryColor,
        marginBottom: 8,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        borderBottomWidth: 1,
        borderBottomColor: '#e5e7eb',
        paddingBottom: 4,
    },
    entryContainer: {
        marginBottom: 10,
    },
    entryHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 2,
    },
    entryTitle: {
        fontWeight: 600,
        fontSize: 11,
    },
    entrySubtitle: {
        fontSize: 10,
        color: meta.accentColor,
    },
    entryDate: {
        fontSize: 9,
        color: '#6b7280',
    },
    bulletList: {
        marginTop: 4,
        paddingLeft: 12,
    },
    bullet: {
        fontSize: 10,
        marginBottom: 2,
        color: '#374151',
    },
    skillsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 6,
    },
    skillBadge: {
        backgroundColor: '#f3f4f6',
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 4,
        fontSize: 9,
    },
    summary: {
        fontSize: 10,
        color: '#374151',
        lineHeight: 1.5,
    },
    twoColumn: {
        flexDirection: 'row',
        gap: 20,
    },
    mainColumn: {
        flex: 2,
    },
    sideColumn: {
        flex: 1,
    },
    link: {
        color: meta.primaryColor,
        textDecoration: 'none',
    },
});

// ========================================
// HELPER COMPONENTS
// ========================================
const formatDate = (dateStr: string | undefined): string => {
    if (!dateStr) return '';
    const [year, month] = dateStr.split('-');
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${monthNames[parseInt(month, 10) - 1]} ${year}`;
};

// ========================================
// MAIN DOCUMENT COMPONENT
// ========================================
interface ResumeDocumentProps {
    data: ResumeData;
}

export const ResumeDocument: React.FC<ResumeDocumentProps> = ({ data }) => {
    const styles = createStyles(data.meta);
    const { content, meta, sectionOrder } = data;
    const { personalInfo } = content;

    const isTwoColumn = meta.layout === 'two-column';

    // Section Renderers
    const renderSummary = () => content.summary ? (
        <View style={styles.section} key="summary">
            <Text style={styles.sectionTitle}>Summary</Text>
            <Text style={styles.summary}>{content.summary}</Text>
        </View>
    ) : null;

    const renderExperience = () => content.experience.length > 0 ? (
        <View style={styles.section} key="experience">
            <Text style={styles.sectionTitle}>Experience</Text>
            {content.experience.map((exp) => (
                <View key={exp.id} style={styles.entryContainer} wrap={false}>
                    <View style={styles.entryHeader}>
                        <View>
                            <Text style={styles.entryTitle}>{exp.title}</Text>
                            <Text style={styles.entrySubtitle}>{exp.company}{exp.location ? ` • ${exp.location}` : ''}</Text>
                        </View>
                        <Text style={styles.entryDate}>
                            {formatDate(exp.startDate)} - {exp.current ? 'Present' : formatDate(exp.endDate)}
                        </Text>
                    </View>
                    {exp.highlights.length > 0 && (
                        <View style={styles.bulletList}>
                            {exp.highlights.map((h, i) => (
                                <Text key={i} style={styles.bullet}>• {h}</Text>
                            ))}
                        </View>
                    )}
                </View>
            ))}
        </View>
    ) : null;

    const renderEducation = () => content.education.length > 0 ? (
        <View style={styles.section} key="education">
            <Text style={styles.sectionTitle}>Education</Text>
            {content.education.map((edu) => (
                <View key={edu.id} style={styles.entryContainer} wrap={false}>
                    <View style={styles.entryHeader}>
                        <View>
                            <Text style={styles.entryTitle}>{edu.degree}{edu.field ? ` in ${edu.field}` : ''}</Text>
                            <Text style={styles.entrySubtitle}>{edu.school}{edu.location ? ` • ${edu.location}` : ''}</Text>
                        </View>
                        <Text style={styles.entryDate}>
                            {formatDate(edu.startDate)}{edu.endDate ? ` - ${formatDate(edu.endDate)}` : ''}
                        </Text>
                    </View>
                    {edu.gpa && <Text style={styles.bullet}>GPA: {edu.gpa}</Text>}
                </View>
            ))}
        </View>
    ) : null;

    const renderSkills = () => content.skills.length > 0 ? (
        <View style={styles.section} key="skills">
            <Text style={styles.sectionTitle}>Skills</Text>
            <View style={styles.skillsContainer}>
                {content.skills.map((skill, i) => (
                    <Text key={i} style={styles.skillBadge}>{skill.name}</Text>
                ))}
            </View>
        </View>
    ) : null;

    const renderCertifications = () => content.certifications.length > 0 ? (
        <View style={styles.section} key="certifications">
            <Text style={styles.sectionTitle}>Certifications</Text>
            {content.certifications.map((cert) => (
                <View key={cert.id} style={styles.entryContainer}>
                    <Text style={styles.entryTitle}>{cert.name}</Text>
                    {cert.issuer && <Text style={styles.entrySubtitle}>{cert.issuer}{cert.date ? ` • ${formatDate(cert.date)}` : ''}</Text>}
                </View>
            ))}
        </View>
    ) : null;

    const renderLanguages = () => content.languages.length > 0 ? (
        <View style={styles.section} key="languages">
            <Text style={styles.sectionTitle}>Languages</Text>
            <View style={styles.skillsContainer}>
                {content.languages.map((lang) => (
                    <Text key={lang.id} style={styles.skillBadge}>
                        {lang.name}{lang.proficiency ? ` (${lang.proficiency})` : ''}
                    </Text>
                ))}
            </View>
        </View>
    ) : null;

    const renderCustomSections = () => content.customSections.map((section) => (
        <View style={styles.section} key={section.id}>
            <Text style={styles.sectionTitle}>{section.heading}</Text>
            {section.items.map((item) => (
                <View key={item.id} style={styles.entryContainer} wrap={false}>
                    <View style={styles.entryHeader}>
                        <View>
                            <Text style={styles.entryTitle}>{item.title}</Text>
                            {item.subtitle && <Text style={styles.entrySubtitle}>{item.subtitle}</Text>}
                        </View>
                        {item.date && <Text style={styles.entryDate}>{formatDate(item.date)}</Text>}
                    </View>
                    {item.description && <Text style={styles.summary}>{item.description}</Text>}
                    {item.highlights.length > 0 && (
                        <View style={styles.bulletList}>
                            {item.highlights.map((h, i) => (
                                <Text key={i} style={styles.bullet}>• {h}</Text>
                            ))}
                        </View>
                    )}
                </View>
            ))}
        </View>
    ));

    // Section Map
    const sectionMap: Record<string, React.ReactNode> = {
        summary: renderSummary(),
        experience: renderExperience(),
        education: renderEducation(),
        skills: renderSkills(),
        certifications: renderCertifications(),
        languages: renderLanguages(),
        custom: renderCustomSections(),
    };

    // Render sections in order
    const orderedSections = sectionOrder.map((key) => sectionMap[key]).filter(Boolean);

    // For two-column: Skills, Languages, Certs go sidebar, rest main
    const sidebarSections = ['skills', 'languages', 'certifications'];
    const mainSections = sectionOrder.filter(s => !sidebarSections.includes(s) && s !== 'custom');
    const customSects = renderCustomSections();

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                {/* Two Column Sidebar Background - Fixed on all pages */}
                {isTwoColumn && (
                    <View
                        fixed
                        style={{
                            position: 'absolute',
                            top: 0,
                            right: 0,
                            bottom: 0,
                            width: '35%', // Approx match for flex 1/(2+1) plus gaps
                            height: '100%',
                            backgroundColor: meta.sidebarBackgroundColor || '#f8fafc',
                            zIndex: -1,
                        }}
                    />
                )}

                {/* Header - Fixed on all pages */}
                <View style={styles.header}>
                    <Text style={styles.name}>
                        {personalInfo.firstName} {personalInfo.lastName}
                    </Text>
                    {personalInfo.title && <Text style={styles.title}>{personalInfo.title}</Text>}
                    <View style={styles.contactRow}>
                        {personalInfo.email && <Text style={styles.contactItem}>{personalInfo.email}</Text>}
                        {personalInfo.phone && <Text style={styles.contactItem}>{personalInfo.phone}</Text>}
                        {personalInfo.location && <Text style={styles.contactItem}>{personalInfo.location}</Text>}
                        {personalInfo.linkedIn && (
                            <Link style={styles.link} src={personalInfo.linkedIn}>LinkedIn</Link>
                        )}
                        {personalInfo.website && (
                            <Link style={styles.link} src={personalInfo.website}>Website</Link>
                        )}
                        {personalInfo.github && (
                            <Link style={styles.link} src={personalInfo.github}>GitHub</Link>
                        )}
                    </View>
                </View>

                {/* Body */}
                <View style={isTwoColumn ? styles.twoColumn : undefined}>
                    {isTwoColumn ? (
                        <>
                            <View style={styles.mainColumn}>
                                {mainSections.map((key) => {
                                    const Component = sectionMap[key];
                                    return Component ? <React.Fragment key={key}>{Component}</React.Fragment> : null;
                                })}
                                {renderCustomSections()}
                            </View>
                            <View style={styles.sideColumn}>
                                {sidebarSections.map((key) => {
                                    const Component = sectionMap[key];
                                    return Component ? <React.Fragment key={key}>{Component}</React.Fragment> : null;
                                })}
                            </View>
                        </>
                    ) : (
                        sectionOrder.map((key) => {
                            const Component = sectionMap[key];
                            return Component ? <React.Fragment key={key}>{Component}</React.Fragment> : null;
                        })
                    )}
                </View>
            </Page>
        </Document>
    );
};

export default ResumeDocument;
