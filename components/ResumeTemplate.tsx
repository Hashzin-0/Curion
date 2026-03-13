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
      <div style={{ backgroundColor: secondaryColor, borderRadius: '10px', width: '48px', height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '26px', flexShrink: 0 }}>
        {emoji}
      </div>
      <div style={{ flex: 1, height: '3px', backgroundColor: '#e0e0e0' }} />
      <h2 style={{ fontSize: '32px', fontWeight: '900', color: '#1a1a1a', margin: 0, letterSpacing: '1px', textTransform: 'uppercase' }}>
        {label}
      </h2>
      <div style={{ flex: 1, height: '3px', backgroundColor: '#e0e0e0' }} />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   LAYOUT 1: VIBRANT — cartaz / menu (gastronomia, serviços…)
════════════════════════════════════════════════════════════ */
function VibrantLayout({ data, theme, profileUrl }: Props) {
  const nameParts = data.name.toUpperCase().split(' ');
  const firstName = nameParts[0] || '';
  const restName = nameParts.slice(1).join(' ') || '';

  return (
    <div id="resume-template" style={{ width: '794px', minHeight: '1123px', backgroundColor: '#fff', fontFamily: "'Arial Black', Arial, sans-serif", color: '#1a1a1a', position: 'relative', overflow: 'hidden' }}>
      {/* Top accent stripe */}
      <div style={{ height: '10px', backgroundColor: theme.primaryColor }} />

      {/* Header */}
      <div style={{ backgroundColor: theme.primaryColor, padding: '24px 32px 20px', display: 'flex', alignItems: 'flex-start', gap: '20px', position: 'relative', overflow: 'hidden' }}>
        {/* Decoration emoji watermark */}
        <div style={{ position: 'absolute', right: '90px', top: '-10px', fontSize: '130px', opacity: 0.15, lineHeight: 1, pointerEvents: 'none', userSelect: 'none' }}>
          {theme.decorationEmoji || theme.headerEmoji}
        </div>

        {/* Photo */}
        {data.photoUrl && (
          <div style={{ width: '110px', height: '110px', borderRadius: '12px', overflow: 'hidden', flexShrink: 0, border: `4px solid ${theme.secondaryColor}`, boxShadow: '0 4px 16px rgba(0,0,0,0.3)', zIndex: 1 }}>
            <img src={data.photoUrl} alt={data.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
        )}

        {/* Name block */}
        <div style={{ flex: 1, zIndex: 1 }}>
          <div style={{ fontSize: '46px', fontWeight: '900', lineHeight: 1, color: theme.textOnPrimary, letterSpacing: '-1px', textShadow: `3px 3px 0px ${theme.secondaryColor}` }}>
            {firstName}
          </div>
          <div style={{ fontSize: '38px', fontWeight: '900', lineHeight: 1.1, color: theme.textOnPrimary, textShadow: `2px 2px 0px ${theme.secondaryColor}` }}>
            {restName}
          </div>
        </div>

        {/* Header emoji */}
        <div style={{ fontSize: '70px', lineHeight: 1, filter: 'drop-shadow(2px 4px 8px rgba(0,0,0,0.25))', zIndex: 1, flexShrink: 0 }}>
          {theme.headerEmoji}
        </div>
      </div>

      {/* Second stripe */}
      <div style={{ height: '8px', backgroundColor: theme.secondaryColor }} />

      {/* Contact bar */}
      <div style={{ backgroundColor: '#fff', padding: '12px 32px', display: 'flex', alignItems: 'center', gap: '20px', borderBottom: `2px solid ${theme.primaryColor}`, flexWrap: 'wrap' }}>
        <div style={{ fontWeight: '900', fontSize: '13px', color: '#555', letterSpacing: '1.5px', textTransform: 'uppercase' }}>
          {data.profession}
        </div>
        {data.availableSince && (
          <>
            <div style={{ width: '1px', height: '20px', backgroundColor: '#ddd' }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: '700' }}>
              <span style={{ fontSize: '18px' }}>{theme.summaryEmoji}</span>
              <span>{data.availableSince}</span>
            </div>
          </>
        )}
        {data.phone && (
          <>
            <div style={{ width: '1px', height: '20px', backgroundColor: '#ddd' }} />
            <div style={{ fontSize: '13px', fontWeight: '700' }}>📞 {data.phone}</div>
          </>
        )}
        {data.email && (
          <>
            <div style={{ width: '1px', height: '20px', backgroundColor: '#ddd' }} />
            <div style={{ fontSize: '13px', fontWeight: '700' }}>✉️ {data.email}</div>
          </>
        )}
      </div>

      {/* Summary */}
      {data.summary && (
        <div style={{ padding: '18px 32px', display: 'flex', alignItems: 'flex-start', gap: '14px', backgroundColor: '#fafafa', borderBottom: `3px solid ${theme.primaryColor}` }}>
          <div style={{ fontSize: '44px', lineHeight: 1, flexShrink: 0 }}>{theme.summaryEmoji}</div>
          <p style={{ fontSize: '12px', fontWeight: '700', lineHeight: 1.7, color: '#222', textTransform: 'uppercase', letterSpacing: '0.3px', margin: 0 }}>
            {data.summary}
          </p>
        </div>
      )}

      <div style={{ padding: '0 32px' }}>
        {/* Experiences */}
        {data.experiences.length > 0 && (
          <>
            <SectionTitle emoji={theme.experienceEmoji} label="EXPERIÊNCIAS" primaryColor={theme.primaryColor} secondaryColor={theme.secondaryColor} />
            {data.experiences.map((exp, i) => (
              <div key={i} style={{ marginBottom: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span style={{ fontWeight: '900', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px', whiteSpace: 'nowrap' }}>{exp.company}</span>
                  <span style={{ fontSize: '14px', color: theme.secondaryColor, margin: '0 4px' }}>{theme.bulletEmoji}</span>
                  <DottedLine color={theme.accentColor} />
                  <span style={{ fontWeight: '900', fontSize: '13px', letterSpacing: '3px', whiteSpace: 'nowrap', color: '#222' }}>{exp.duration.toUpperCase()}</span>
                </div>
                <div style={{ fontSize: '11px', color: '#555', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px', paddingLeft: '8px', marginTop: '2px' }}>{exp.role}</div>
              </div>
            ))}
          </>
        )}

        {/* Education */}
        {data.education && data.education.length > 0 && (
          <>
            <SectionTitle emoji={theme.educationEmoji || '🎓'} label="ESCOLARIDADE" primaryColor={theme.primaryColor} secondaryColor={theme.secondaryColor} />
            {data.education.map((ed, i) => (
              <div key={i} style={{ marginBottom: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span style={{ fontWeight: '900', fontSize: '13px', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{ed.institution}</span>
                  <span style={{ color: theme.secondaryColor, margin: '0 4px' }}>{theme.bulletEmoji}</span>
                  <DottedLine color={theme.accentColor} />
                  <span style={{ fontWeight: '900', fontSize: '12px', letterSpacing: '2px', whiteSpace: 'nowrap', color: '#444' }}>{ed.period.toUpperCase()}</span>
                </div>
                <div style={{ fontSize: '11px', color: '#555', fontWeight: '700', textTransform: 'uppercase', paddingLeft: '8px', marginTop: '2px' }}>{ed.course}</div>
              </div>
            ))}
          </>
        )}

        {/* Courses */}
        {data.courses && data.courses.length > 0 && (
          <>
            <SectionTitle emoji={theme.courseEmoji || '📚'} label="CURSOS" primaryColor={theme.primaryColor} secondaryColor={theme.secondaryColor} />
            {data.courses.map((c, i) => (
              <div key={i} style={{ marginBottom: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span style={{ color: theme.secondaryColor }}>{theme.bulletEmoji}</span>
                  <span style={{ fontWeight: '900', fontSize: '13px', textTransform: 'uppercase' }}>{c.name}</span>
                  <DottedLine color={theme.accentColor} />
                  <span style={{ fontWeight: '900', fontSize: '12px', letterSpacing: '2px', whiteSpace: 'nowrap', color: '#555' }}>{c.year}</span>
                </div>
                {c.institution && <div style={{ fontSize: '10px', color: '#666', fontWeight: '700', textTransform: 'uppercase', paddingLeft: '24px', marginTop: '2px' }}>{c.institution}</div>}
              </div>
            ))}
          </>
        )}

        {/* Skills */}
        {data.skills.length > 0 && (
          <>
            <SectionTitle emoji={theme.skillEmoji} label="COMPETÊNCIAS" primaryColor={theme.primaryColor} secondaryColor={theme.secondaryColor} />
            {data.skills.map((skill, i) => (
              <div key={i} style={{ marginBottom: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span style={{ color: theme.secondaryColor }}>{theme.bulletEmoji}</span>
                  <DottedLine color={theme.accentColor} />
                  <span style={{ fontWeight: '900', fontSize: '13px', letterSpacing: '3px', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{skill.name}</span>
                </div>
                {skill.description && <div style={{ fontSize: '10px', color: '#666', fontWeight: '700', textTransform: 'uppercase', paddingLeft: '24px', marginTop: '2px' }}>({skill.description})</div>}
              </div>
            ))}
          </>
        )}
      </div>

      {/* Bottom stripes */}
      <div style={{ height: '6px', backgroundColor: theme.primaryColor, marginTop: '20px' }} />
      <div style={{ height: '4px', backgroundColor: theme.secondaryColor }} />

      {/* Footer */}
      <div style={{ backgroundColor: '#1a1a1a', padding: '12px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ color: '#fff', fontWeight: '900', fontSize: '15px', letterSpacing: '1px' }}>{data.email}</div>
        {profileUrl && (
          <div style={{ backgroundColor: '#fff', padding: '4px', borderRadius: '6px' }}>
            <QRCodeSVG value={profileUrl} size={60} />
          </div>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   LAYOUT 2: SIDEBAR — duas colunas com painel lateral
   (tecnologia, saúde, logística, jovem aprendiz…)
════════════════════════════════════════════════════════════ */
function SidebarLayout({ data, theme, profileUrl }: Props) {
  const nameParts = data.name.split(' ');
  const firstName = nameParts[0] || '';
  const restName = nameParts.slice(1).join(' ') || '';

  const sidebarBg = theme.sidebarColor || theme.primaryColor;
  const sidebarText = theme.sidebarTextColor || '#ffffff';
  const SIDEBAR_W = 240;
  const MAIN_W = 794 - SIDEBAR_W;

  const sectionRow = (emoji: string, label: string) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '20px', marginBottom: '10px', borderBottom: `2px solid ${theme.primaryColor}`, paddingBottom: '6px' }}>
      <span style={{ fontSize: '22px' }}>{emoji}</span>
      <span style={{ fontWeight: '900', fontSize: '15px', color: '#1a1a1a', textTransform: 'uppercase', letterSpacing: '1.5px' }}>{label}</span>
    </div>
  );

  return (
    <div id="resume-template" style={{ width: '794px', minHeight: '1123px', backgroundColor: '#fff', fontFamily: "'Arial Black', Arial, sans-serif", color: '#1a1a1a', display: 'flex', position: 'relative', overflow: 'hidden' }}>
      {/* ── SIDEBAR ── */}
      <div style={{ width: SIDEBAR_W, minHeight: '1123px', backgroundColor: sidebarBg, color: sidebarText, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '32px 20px', position: 'relative', overflow: 'hidden', flexShrink: 0 }}>
        {/* Background watermark */}
        <div style={{ position: 'absolute', bottom: '-20px', left: '-20px', fontSize: '200px', opacity: 0.07, lineHeight: 1, pointerEvents: 'none', userSelect: 'none', transform: 'rotate(-15deg)' }}>
          {theme.decorationEmoji || theme.headerEmoji}
        </div>

        {/* Photo */}
        {data.photoUrl ? (
          <div style={{ width: '120px', height: '120px', borderRadius: '50%', overflow: 'hidden', border: `4px solid ${theme.primaryColor}`, marginBottom: '16px', flexShrink: 0, zIndex: 1 }}>
            <img src={data.photoUrl} alt={data.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
        ) : (
          <div style={{ width: '100px', height: '100px', borderRadius: '50%', backgroundColor: theme.primaryColor, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '48px', marginBottom: '16px', zIndex: 1 }}>
            {theme.headerEmoji}
          </div>
        )}

        {/* Name */}
        <div style={{ textAlign: 'center', marginBottom: '8px', zIndex: 1 }}>
          <div style={{ fontSize: '20px', fontWeight: '900', lineHeight: 1.1, letterSpacing: '-0.5px' }}>{firstName}</div>
          <div style={{ fontSize: '18px', fontWeight: '900', lineHeight: 1.1, opacity: 0.9 }}>{restName}</div>
          <div style={{ marginTop: '8px', fontSize: '10px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1.5px', opacity: 0.75, backgroundColor: theme.primaryColor, borderRadius: '100px', padding: '4px 10px', display: 'inline-block' }}>
            {data.profession}
          </div>
        </div>

        {/* Divider */}
        <div style={{ width: '80%', height: '2px', backgroundColor: theme.primaryColor, margin: '14px auto', opacity: 0.5 }} />

        {/* Contact info */}
        <div style={{ width: '100%', zIndex: 1 }}>
          {[
            data.phone && { icon: '📞', value: data.phone },
            data.email && { icon: '✉️', value: data.email },
            data.availableSince && { icon: '📅', value: data.availableSince },
          ].filter(Boolean).map((item: any, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', marginBottom: '10px' }}>
              <span style={{ fontSize: '14px', flexShrink: 0 }}>{item.icon}</span>
              <span style={{ fontSize: '10px', fontWeight: '700', wordBreak: 'break-all', opacity: 0.9 }}>{item.value}</span>
            </div>
          ))}
        </div>

        {/* Skills in sidebar */}
        {data.skills.length > 0 && (
          <>
            <div style={{ width: '80%', height: '2px', backgroundColor: theme.primaryColor, margin: '14px auto', opacity: 0.5 }} />
            <div style={{ width: '100%', zIndex: 1 }}>
              <div style={{ fontSize: '11px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '10px', opacity: 0.75 }}>
                {theme.skillEmoji} Competências
              </div>
              {data.skills.map((s, i) => (
                <div key={i} style={{ marginBottom: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: theme.primaryColor, flexShrink: 0 }} />
                    <span style={{ fontSize: '10px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{s.name}</span>
                  </div>
                  {s.description && (
                    <div style={{ fontSize: '9px', opacity: 0.6, paddingLeft: '12px', fontWeight: '700' }}>({s.description})</div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}

        {/* QR Code */}
        {profileUrl && (
          <div style={{ marginTop: 'auto', paddingTop: '20px', zIndex: 1 }}>
            <div style={{ backgroundColor: '#fff', padding: '6px', borderRadius: '8px' }}>
              <QRCodeSVG value={profileUrl} size={56} />
            </div>
          </div>
        )}
      </div>

      {/* ── MAIN CONTENT ── */}
      <div style={{ width: MAIN_W, minHeight: '1123px', display: 'flex', flexDirection: 'column' }}>
        {/* Header accent */}
        <div style={{ backgroundColor: theme.primaryColor, padding: '20px 28px 16px', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', right: '-10px', top: '-20px', fontSize: '110px', opacity: 0.12, lineHeight: 1 }}>
            {theme.headerEmoji}
          </div>
          <div style={{ fontWeight: '900', fontSize: '30px', color: theme.textOnPrimary, lineHeight: 1, textShadow: `2px 2px 0 ${theme.secondaryColor}` }}>
            {firstName.toUpperCase()}
          </div>
          <div style={{ fontWeight: '900', fontSize: '24px', color: theme.textOnPrimary, lineHeight: 1.1, textShadow: `2px 2px 0 ${theme.secondaryColor}` }}>
            {restName.toUpperCase()}
          </div>
          <div style={{ marginTop: '6px', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '2px', color: theme.textOnPrimary, opacity: 0.8 }}>
            {data.profession}
          </div>
        </div>
        <div style={{ height: '5px', backgroundColor: theme.secondaryColor }} />

        {/* Content area */}
        <div style={{ padding: '4px 28px 20px', flex: 1 }}>
          {/* Summary */}
          {data.summary && (
            <>
              {sectionRow(theme.summaryEmoji, 'Resumo')}
              <p style={{ fontSize: '11px', fontWeight: '700', lineHeight: 1.7, color: '#333', textTransform: 'uppercase', letterSpacing: '0.3px', margin: 0 }}>
                {data.summary}
              </p>
            </>
          )}

          {/* Experiences */}
          {data.experiences.length > 0 && (
            <>
              {sectionRow(theme.experienceEmoji, 'Experiência Profissional')}
              {data.experiences.map((exp, i) => (
                <div key={i} style={{ marginBottom: '14px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <span style={{ fontWeight: '900', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{exp.company}</span>
                    <span style={{ fontWeight: '900', fontSize: '11px', color: theme.primaryColor, letterSpacing: '1px', whiteSpace: 'nowrap', marginLeft: '8px' }}>{exp.duration}</span>
                  </div>
                  <div style={{ fontSize: '10px', color: '#666', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px', marginTop: '2px' }}>{exp.role}</div>
                </div>
              ))}
            </>
          )}

          {/* Education */}
          {data.education && data.education.length > 0 && (
            <>
              {sectionRow(theme.educationEmoji || '🎓', 'Escolaridade')}
              {data.education.map((ed, i) => (
                <div key={i} style={{ marginBottom: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <span style={{ fontWeight: '900', fontSize: '12px', textTransform: 'uppercase' }}>{ed.institution}</span>
                    <span style={{ fontWeight: '900', fontSize: '11px', color: theme.primaryColor, whiteSpace: 'nowrap', marginLeft: '8px' }}>{ed.period}</span>
                  </div>
                  <div style={{ fontSize: '10px', color: '#666', fontWeight: '700', textTransform: 'uppercase', marginTop: '2px' }}>{ed.course}</div>
                </div>
              ))}
            </>
          )}

          {/* Courses */}
          {data.courses && data.courses.length > 0 && (
            <>
              {sectionRow(theme.courseEmoji || '📚', 'Cursos')}
              {data.courses.map((c, i) => (
                <div key={i} style={{ marginBottom: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <div>
                    <div style={{ fontWeight: '900', fontSize: '12px', textTransform: 'uppercase' }}>{c.name}</div>
                    {c.institution && <div style={{ fontSize: '10px', color: '#777', fontWeight: '700', textTransform: 'uppercase' }}>{c.institution}</div>}
                  </div>
                  {c.year && <span style={{ fontWeight: '900', fontSize: '11px', color: theme.primaryColor, whiteSpace: 'nowrap', marginLeft: '8px' }}>{c.year}</span>}
                </div>
              ))}
            </>
          )}
        </div>

        {/* Footer accent */}
        <div style={{ height: '8px', backgroundColor: theme.primaryColor }} />
        <div style={{ height: '4px', backgroundColor: theme.secondaryColor }} />
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════
   EXPORTED COMPONENT — selects layout
════════════════════════════════════════ */
const ResumeTemplate = forwardRef<HTMLDivElement, Props>(function ResumeTemplate(props, ref) {
  const { theme } = props;
  const layout = theme.layoutStyle ?? 'vibrant';

  return (
    <div ref={ref}>
      {layout === 'sidebar' ? (
        <SidebarLayout {...props} />
      ) : (
        <VibrantLayout {...props} />
      )}
    </div>
  );
});

export default ResumeTemplate;
