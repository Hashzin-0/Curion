
'use client';

import { forwardRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { ResumeTheme } from '@/src/ai/flows/generate-resume-theme-flow';

export type ResumeData = {
  name: string;
  firstName: string;
  lastName: string;
  profession: string;
  phone: string;
  email: string;
  availableSince: string;
  photoUrl?: string;
  summary?: string;
  experiences: { company: string; role: string; duration: string }[];
  education?: { institution: string; course: string; period: string }[];
  courses?: { name: string; institution: string; year: string }[];
  skills: { name: string; description: string }[];
  sectionsOrder?: string[];
};

type Props = {
  data: ResumeData;
  theme: ResumeTheme;
  profileUrl?: string;
};

/* ─── helpers ─── */
function DottedLine({ color }: { color: string }) {
  return (
    <span style={{ flex: 1, borderBottom: `2px dotted ${color}`, margin: '0 8px', marginBottom: '4px', opacity: 0.4 }} />
  );
}

function SectionTitle({ emoji, label, primaryColor, secondaryColor }: { emoji: string; label: string; primaryColor: string; secondaryColor: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '14px', margin: '22px 0 14px' }}>
      <div style={{ backgroundColor: secondaryColor || primaryColor + '22', borderRadius: '10px', width: '48px', height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '26px', flexShrink: 0 }}>
        {emoji}
      </div>
      <div style={{ flex: 1, height: '3px', backgroundColor: '#e0e0e0' }} />
      <h2 style={{ fontSize: '28px', fontWeight: '900', color: '#1a1a1a', margin: 0, letterSpacing: '1px', textTransform: 'uppercase' }}>
        {label}
      </h2>
      <div style={{ flex: 1, height: '3px', backgroundColor: '#e0e0e0' }} />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   LAYOUT 1: VIBRANT
════════════════════════════════════════════════════════════ */
function VibrantLayout({ data, theme, profileUrl }: Props) {
  const nameParts = data.name.toUpperCase().split(' ');
  const firstName = nameParts[0] || '';
  const restName = nameParts.slice(1).join(' ') || '';

  const renderSection = (type: string) => {
    switch (type) {
      case 'experience':
        return data.experiences.length > 0 && (
          <div key="exp">
            <SectionTitle emoji={theme.experienceEmoji} label="EXPERIÊNCIAS" primaryColor={theme.primaryColor} secondaryColor={theme.secondaryColor} />
            {data.experiences.map((exp, i) => (
              <div key={i} style={{ marginBottom: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span style={{ fontWeight: '900', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px', whiteSpace: 'nowrap' }}>{exp.company}</span>
                  <span style={{ fontSize: '14px', color: theme.primaryColor, margin: '0 4px' }}>{theme.bulletEmoji}</span>
                  <DottedLine color={theme.primaryColor} />
                  <span style={{ fontWeight: '900', fontSize: '13px', letterSpacing: '3px', whiteSpace: 'nowrap', color: '#222' }}>{exp.duration.toUpperCase()}</span>
                </div>
                <div style={{ fontSize: '11px', color: '#555', fontWeight: '700', textTransform: 'uppercase', paddingLeft: '8px', marginTop: '2px' }}>{exp.role}</div>
              </div>
            ))}
          </div>
        );
      case 'education':
        return data.education && data.education.length > 0 && (
          <div key="edu">
            <SectionTitle emoji={theme.educationEmoji || '🎓'} label="ESCOLARIDADE" primaryColor={theme.primaryColor} secondaryColor={theme.secondaryColor} />
            {data.education.map((ed, i) => (
              <div key={i} style={{ marginBottom: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span style={{ fontWeight: '900', fontSize: '13px', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{ed.institution}</span>
                  <DottedLine color={theme.primaryColor} />
                  <span style={{ fontWeight: '900', fontSize: '12px', letterSpacing: '2px', whiteSpace: 'nowrap', color: '#444' }}>{ed.period.toUpperCase()}</span>
                </div>
                <div style={{ fontSize: '11px', color: '#555', fontWeight: '700', textTransform: 'uppercase', paddingLeft: '8px', marginTop: '2px' }}>{ed.course}</div>
              </div>
            ))}
          </div>
        );
      case 'skill':
        return data.skills.length > 0 && (
          <div key="skill">
            <SectionTitle emoji={theme.skillEmoji} label="COMPETÊNCIAS" primaryColor={theme.primaryColor} secondaryColor={theme.secondaryColor} />
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {data.skills.map((skill, i) => (
                <div key={i} style={{ backgroundColor: theme.primaryColor + '11', border: `1px solid ${theme.primaryColor}33`, padding: '6px 12px', borderRadius: '8px' }}>
                  <span style={{ fontWeight: '900', fontSize: '11px', color: theme.primaryColor, textTransform: 'uppercase' }}>{skill.name}</span>
                </div>
              ))}
            </div>
          </div>
        );
      default: return null;
    }
  };

  const sections = data.sectionsOrder || ['summary', 'experience', 'education', 'skill'];

  return (
    <div id="resume-template" style={{ width: '794px', minHeight: '1123px', backgroundColor: '#fff', fontFamily: "'Arial Black', Arial, sans-serif", color: '#1a1a1a', position: 'relative', overflow: 'hidden' }}>
      <div style={{ height: '10px', backgroundColor: theme.primaryColor }} />
      <div style={{ backgroundColor: theme.primaryColor, padding: '30px 40px', display: 'flex', alignItems: 'center', gap: '24px', position: 'relative' }}>
        {data.photoUrl && (
          <div style={{ width: '120px', height: '120px', borderRadius: '20px', overflow: 'hidden', border: '4px solid #fff', boxShadow: '0 10px 30px rgba(0,0,0,0.2)' }}>
            <img src={data.photoUrl} alt={data.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
        )}
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '48px', fontWeight: '900', color: '#fff', lineHeight: 1 }}>{firstName}</div>
          <div style={{ fontSize: '40px', fontWeight: '900', color: '#fff', opacity: 0.8 }}>{restName}</div>
          <div style={{ marginTop: '10px', fontSize: '14px', fontWeight: '900', color: '#fff', opacity: 0.9, textTransform: 'uppercase', letterSpacing: '2px' }}>{data.profession}</div>
        </div>
        <div style={{ fontSize: '80px', opacity: 0.2, position: 'absolute', right: '40px' }}>{theme.headerEmoji}</div>
      </div>

      <div style={{ padding: '0 40px 40px' }}>
        {data.summary && sections.includes('summary') && (
          <div style={{ margin: '30px 0', padding: '20px', borderLeft: `6px solid ${theme.primaryColor}`, backgroundColor: '#f8fafc' }}>
            <p style={{ fontSize: '12px', fontWeight: '700', lineHeight: 1.8, color: '#334155', textTransform: 'uppercase', margin: 0 }}>{data.summary}</p>
          </div>
        )}
        {sections.map(s => renderSection(s))}
      </div>

      <div style={{ position: 'absolute', bottom: 0, width: '100%', backgroundColor: '#1a1a1a', padding: '20px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ color: '#fff', fontSize: '14px', fontWeight: '900' }}>{data.email} | {data.phone}</div>
        {profileUrl && <div style={{ backgroundColor: '#fff', padding: '4px', borderRadius: '8px' }}><QRCodeSVG value={profileUrl} size={60} /></div>}
      </div>
    </div>
  );
}

const ResumeTemplate = forwardRef<HTMLDivElement, Props>(function ResumeTemplate(props, ref) {
  return (
    <div ref={ref}>
      <VibrantLayout {...props} />
    </div>
  );
});

export default ResumeTemplate;
