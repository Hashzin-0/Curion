'use client';

import { useStore } from '@/lib/store';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import * as LucideIcons from 'lucide-react';
import { getTheme } from '@/styles/themes';
import ResumeTemplate, { ResumeData } from '@/components/ResumeTemplate';
import { ResumeTheme } from '@/src/ai/flows/generate-resume-theme-flow';
import { QRCodeSVG } from 'qrcode.react';
import { parseSafeDate } from '@/lib/utils';
import { differenceInMonths, differenceInYears, format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

function calcDuration(startDate: string, endDate: string | null): string {
  const start = parseSafeDate(startDate);
  const end = endDate ? parseSafeDate(endDate) : new Date();
  const months = differenceInMonths(end, start);
  const years = differenceInYears(end, start);
  if (months < 1) return '1 mês';
  if (years < 1) return `${months} ${months === 1 ? 'mês' : 'meses'}`;
  const rem = months - years * 12;
  if (rem === 0) return `${years} ${years === 1 ? 'ano' : 'anos'}`;
  return `${years}a ${rem}m`;
}

function DottedSeparator({ color }: { color: string }) {
  return (
    <span style={{
      flex: 1,
      borderBottom: `2px dotted ${color}`,
      margin: '0 6px',
      marginBottom: 3,
      opacity: 0.5,
    }} />
  );
}

export default function AreaResume() {
  const { username, areaSlug } = useParams();
  const { users, areas, experiences, skills, areaSkills, education } = useStore();
  const router = useRouter();
  const pdfRef = useRef<HTMLDivElement>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [exportTheme, setExportTheme] = useState<ResumeTheme | null>(null);
  const [exportData, setExportData] = useState<ResumeData | null>(null);
  const [exportError, setExportError] = useState('');
  const [shouldExport, setShouldExport] = useState(false);

  const user = users.find(u => u.username === username);
  const area = areas.find(a => a.slug === areaSlug);

  useEffect(() => {
    setIsMounted(true);
    if (!user || !area) router.push('/');
  }, [user, area, router]);

  useEffect(() => {
    if (!shouldExport || !exportTheme || !exportData || !pdfRef.current || !user || !area) return;
    const run = async () => {
      try {
        const html2pdf = (await import('html2pdf.js')).default;
        const element = pdfRef.current!;
        await html2pdf().set({
          margin: 0,
          filename: `curriculo-${user.name.toLowerCase().replace(/\s+/g, '-')}-${area.slug}.pdf`,
          image: { type: 'jpeg', quality: 0.95 },
          html2canvas: { scale: 2, useCORS: true, allowTaint: true, logging: false, imageTimeout: 0 },
          jsPDF: { unit: 'px', format: [794, 1123], orientation: 'portrait' },
        }).from(element).save();
      } catch (err) {
        console.error(err);
        setExportError('Erro ao gerar o PDF. Tente novamente.');
      } finally {
        setShouldExport(false);
        setExporting(false);
      }
    };
    run();
  }, [shouldExport, exportTheme, exportData]);

  if (!isMounted || !user || !area) return null;

  const theme = getTheme(area.slug);
  const areaExperiences = experiences.filter(e => e.area_id === area.id && e.user_id === user.id);
  const currentAreaSkills = areaSkills.filter(as => as.area_id === area.id);
  const allAreaSkillDetails = currentAreaSkills.map(as => {
    const skill = skills.find(s => s.id === as.skill_id);
    return { ...as, skill };
  }).filter(s => s.skill);
  const userEducation = education.filter(e => e.user_id === user.id);
  const currentUrl = typeof window !== 'undefined' ? window.location.href : '';

  const nameParts = user.name.trim().split(' ');
  const firstName = nameParts.slice(0, Math.ceil(nameParts.length / 2)).join(' ');
  const lastName = nameParts.slice(Math.ceil(nameParts.length / 2)).join(' ');

  const handleExportThemed = async () => {
    setExporting(true);
    setExportError('');
    setExportTheme(null);
    setExportData(null);

    try {
      const expList = areaExperiences.map(e => ({
        company: e.company_name,
        role: e.role,
        duration: calcDuration(e.start_date, e.end_date),
      }));
      const skillList = allAreaSkillDetails.map(s => ({
        name: s.skill!.name,
        description: `nível ${s.level}%`,
      }));

      const res = await fetch('/api/resume/theme', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profession: area.name,
          name: user.name,
          experiences: expList.map(e => `${e.company} - ${e.role} (${e.duration})`),
          skills: skillList.map(s => s.name),
        }),
      });

      if (!res.ok) throw new Error('Erro ao gerar tema');

      const aiTheme: ResumeTheme = await res.json();
      const resumeData: ResumeData = {
        name: user.name,
        firstName,
        lastName,
        profession: area.name,
        phone: (user as any).phone || '',
        email: (user as any).email || '',
        availableSince: format(new Date(), "dd/MM/yyyy", { locale: ptBR }),
        photoUrl: user.photo_url,
        summary: user.summary || '',
        experiences: expList,
        skills: skillList,
      };

      setExportTheme(aiTheme);
      setExportData(resumeData);
      setShouldExport(true);
    } catch (err) {
      console.error(err);
      setExportError('Erro ao gerar currículo temático. Tente novamente.');
      setExporting(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f8f8f8', fontFamily: "'Arial Black', Arial, sans-serif" }}>

      {/* Toolbar - não entra no PDF */}
      <div style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        background: '#fff',
        borderBottom: `3px solid ${theme.hex}`,
        padding: '12px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
      }}>
        <button
          onClick={() => router.back()}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontWeight: 700,
            fontSize: 14,
            color: '#555',
          }}
        >
          <LucideIcons.ArrowLeft size={18} />
          Voltar
        </button>

        <div style={{ display: 'flex', gap: 12 }}>
          <button
            onClick={handleExportThemed}
            disabled={exporting}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '10px 22px',
              background: exporting ? '#ccc' : theme.hex,
              color: '#fff',
              border: 'none',
              borderRadius: 999,
              fontWeight: 900,
              fontSize: 14,
              cursor: exporting ? 'not-allowed' : 'pointer',
              boxShadow: `0 4px 14px ${theme.hex}55`,
              transition: 'all .2s',
            }}
          >
            {exporting ? (
              <>
                <LucideIcons.Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
                Gerando com IA...
              </>
            ) : (
              <>
                <LucideIcons.Sparkles size={16} />
                Exportar Currículo Temático
              </>
            )}
          </button>
        </div>
      </div>

      {exportError && (
        <div style={{ background: '#fee2e2', color: '#dc2626', padding: '12px 24px', textAlign: 'center', fontWeight: 700, fontSize: 14 }}>
          {exportError}
        </div>
      )}

      {/* Poster-style resume view */}
      <div style={{
        maxWidth: 800,
        margin: '32px auto',
        background: '#fff',
        boxShadow: '0 8px 40px rgba(0,0,0,0.12)',
        overflow: 'hidden',
      }}>

        {/* Top stripe */}
        <div style={{ height: 14, background: theme.hex }} />

        {/* Header */}
        <div style={{
          background: theme.hex,
          padding: '28px 36px 24px',
          display: 'flex',
          alignItems: 'flex-start',
          gap: 24,
          position: 'relative',
          overflow: 'hidden',
        }}>
          {/* Decorative circles */}
          <div style={{
            position: 'absolute', top: -40, right: -40,
            width: 160, height: 160,
            background: 'rgba(255,255,255,0.12)',
            borderRadius: '50%',
          }} />
          <div style={{
            position: 'absolute', bottom: -30, left: '30%',
            width: 80, height: 80,
            background: 'rgba(0,0,0,0.1)',
            borderRadius: '50%',
          }} />

          {/* Photo */}
          {user.photo_url && (
            <div style={{
              width: 120,
              height: 120,
              borderRadius: 16,
              overflow: 'hidden',
              flexShrink: 0,
              border: `4px solid ${theme.hexSecondary}`,
              boxShadow: '0 4px 20px rgba(0,0,0,0.25)',
              position: 'relative',
              zIndex: 1,
            }}>
              <Image
                src={user.photo_url}
                alt={user.name}
                width={120}
                height={120}
                style={{ objectFit: 'cover', width: '100%', height: '100%' }}
                referrerPolicy="no-referrer"
              />
            </div>
          )}

          {/* Name block */}
          <div style={{ flex: 1, position: 'relative', zIndex: 1 }}>
            <div style={{
              fontSize: 44,
              fontWeight: 900,
              lineHeight: 1.05,
              color: '#fff',
              textTransform: 'uppercase',
              letterSpacing: -1,
              textShadow: `3px 3px 0 ${theme.hexDark}`,
            }}>
              {firstName}
            </div>
            <div style={{
              fontSize: 38,
              fontWeight: 900,
              lineHeight: 1.1,
              color: theme.hexSecondary,
              textTransform: 'uppercase',
              letterSpacing: -1,
              textShadow: `2px 2px 0 ${theme.hexDark}`,
            }}>
              {lastName}
            </div>
          </div>

          {/* Area emoji */}
          <div style={{
            fontSize: 72,
            lineHeight: 1,
            filter: 'drop-shadow(3px 4px 8px rgba(0,0,0,0.3))',
            position: 'relative',
            zIndex: 1,
          }}>
            {theme.emoji}
          </div>
        </div>

        {/* Secondary stripe */}
        <div style={{ height: 10, background: theme.hexSecondary }} />

        {/* Contact bar */}
        <div style={{
          background: '#fff',
          padding: '14px 36px',
          display: 'flex',
          alignItems: 'center',
          gap: 20,
          flexWrap: 'wrap',
          borderBottom: `3px solid ${theme.hex}`,
        }}>
          <div style={{ fontWeight: 900, fontSize: 13, color: '#333', textTransform: 'uppercase', letterSpacing: 1.5 }}>
            {area.name}
          </div>
          {user.location && (
            <>
              <div style={{ width: 1, height: 20, background: '#ddd' }} />
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 13, fontWeight: 700, color: '#555' }}>
                <LucideIcons.MapPin size={14} color={theme.hex} />
                {user.location}
              </div>
            </>
          )}
          {(user as any).email && (
            <>
              <div style={{ width: 1, height: 20, background: '#ddd' }} />
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 13, fontWeight: 700, color: '#555' }}>
                <LucideIcons.Mail size={14} color={theme.hex} />
                {(user as any).email}
              </div>
            </>
          )}
          {(user as any).phone && (
            <>
              <div style={{ width: 1, height: 20, background: '#ddd' }} />
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 13, fontWeight: 700, color: '#555' }}>
                <LucideIcons.Phone size={14} color={theme.hex} />
                {(user as any).phone}
              </div>
            </>
          )}
        </div>

        {/* Summary */}
        {user.summary && (
          <div style={{
            padding: '20px 36px',
            display: 'flex',
            gap: 16,
            alignItems: 'flex-start',
            background: '#fafafa',
            borderBottom: `2px solid #eee`,
          }}>
            <div style={{ fontSize: 40, flexShrink: 0, lineHeight: 1 }}>💬</div>
            <p style={{
              margin: 0,
              fontSize: 12,
              fontWeight: 700,
              lineHeight: 1.7,
              color: '#222',
              textTransform: 'uppercase',
              letterSpacing: 0.4,
            }}>
              {user.summary}
            </p>
          </div>
        )}

        {/* Experiences section */}
        {areaExperiences.length > 0 && (
          <div style={{ padding: '0 36px' }}>
            {/* Section header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, margin: '28px 0 20px' }}>
              <div style={{
                background: theme.hexSecondary,
                borderRadius: 12,
                width: 54,
                height: 54,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 28,
                flexShrink: 0,
              }}>
                🏢
              </div>
              <div style={{ flex: 1, height: 3, background: '#e2e8f0' }} />
              <h2 style={{
                margin: 0,
                fontSize: 32,
                fontWeight: 900,
                color: '#1a1a1a',
                letterSpacing: 2,
                textTransform: 'uppercase',
                whiteSpace: 'nowrap',
              }}>
                EXPERIÊNCIAS
              </h2>
              <div style={{ flex: 1, height: 3, background: '#e2e8f0' }} />
            </div>

            {/* Experience items */}
            <div style={{ paddingBottom: 8 }}>
              {areaExperiences.map((exp, i) => {
                const duration = calcDuration(exp.start_date, exp.end_date);
                return (
                  <div key={exp.id} style={{ marginBottom: 18 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <span style={{
                        fontWeight: 900,
                        fontSize: 13,
                        textTransform: 'uppercase',
                        letterSpacing: 0.5,
                        whiteSpace: 'nowrap',
                        color: '#1a1a1a',
                      }}>
                        {exp.company_name}
                      </span>
                      <span style={{ fontSize: 16, color: theme.hex, margin: '0 4px', flexShrink: 0 }}>
                        {theme.emoji}
                      </span>
                      <DottedSeparator color={theme.hex} />
                      <span style={{
                        fontWeight: 900,
                        fontSize: 13,
                        letterSpacing: 3,
                        whiteSpace: 'nowrap',
                        color: '#555',
                        textTransform: 'uppercase',
                      }}>
                        {duration}
                      </span>
                    </div>
                    <div style={{
                      fontSize: 11,
                      color: '#777',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: 0.5,
                      paddingLeft: 8,
                      marginTop: 3,
                    }}>
                      {exp.role}
                      {exp.description && ` — ${exp.description}`}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Education section */}
        {userEducation.length > 0 && (
          <div style={{ padding: '0 36px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, margin: '20px 0 16px' }}>
              <div style={{
                background: theme.hexSecondary,
                borderRadius: 12,
                width: 54,
                height: 54,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 28,
                flexShrink: 0,
              }}>
                🎓
              </div>
              <div style={{ flex: 1, height: 3, background: '#e2e8f0' }} />
              <h2 style={{
                margin: 0,
                fontSize: 32,
                fontWeight: 900,
                color: '#1a1a1a',
                letterSpacing: 2,
                textTransform: 'uppercase',
                whiteSpace: 'nowrap',
              }}>
                FORMAÇÃO
              </h2>
              <div style={{ flex: 1, height: 3, background: '#e2e8f0' }} />
            </div>

            <div style={{ paddingBottom: 8 }}>
              {userEducation.map((edu) => (
                <div key={edu.id} style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 12 }}>
                  <span style={{
                    fontWeight: 900,
                    fontSize: 13,
                    textTransform: 'uppercase',
                    letterSpacing: 0.5,
                    whiteSpace: 'nowrap',
                    color: '#1a1a1a',
                  }}>
                    {edu.course}
                  </span>
                  <DottedSeparator color={theme.hex} />
                  <span style={{
                    fontWeight: 700,
                    fontSize: 12,
                    color: '#666',
                    whiteSpace: 'nowrap',
                    textTransform: 'uppercase',
                    letterSpacing: 1,
                  }}>
                    {edu.institution} · {parseSafeDate(edu.start_date).getFullYear()}
                    {edu.end_date ? `–${parseSafeDate(edu.end_date).getFullYear()}` : '–ATUAL'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Skills section */}
        {allAreaSkillDetails.length > 0 && (
          <div style={{ padding: '0 36px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, margin: '20px 0 16px' }}>
              <div style={{
                background: theme.hexSecondary,
                borderRadius: 12,
                width: 54,
                height: 54,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 28,
                flexShrink: 0,
              }}>
                ⭐
              </div>
              <div style={{ flex: 1, height: 3, background: '#e2e8f0' }} />
              <h2 style={{
                margin: 0,
                fontSize: 32,
                fontWeight: 900,
                color: '#1a1a1a',
                letterSpacing: 2,
                textTransform: 'uppercase',
                whiteSpace: 'nowrap',
              }}>
                COMPETÊNCIAS
              </h2>
              <div style={{ flex: 1, height: 3, background: '#e2e8f0' }} />
            </div>

            <div style={{ paddingBottom: 8 }}>
              {allAreaSkillDetails.map((s) => (
                <div key={s.id} style={{ marginBottom: 14 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <span style={{ fontSize: 16, color: theme.hex, flexShrink: 0 }}>
                      {theme.emoji}
                    </span>
                    <DottedSeparator color={theme.hex} />
                    <span style={{
                      fontWeight: 900,
                      fontSize: 13,
                      letterSpacing: 3,
                      textTransform: 'uppercase',
                      whiteSpace: 'nowrap',
                      color: '#1a1a1a',
                    }}>
                      {s.skill!.name}
                    </span>
                  </div>
                  {/* Progress bar */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, paddingLeft: 24, marginTop: 4 }}>
                    <div style={{
                      flex: 1,
                      height: 8,
                      background: '#e2e8f0',
                      borderRadius: 999,
                      overflow: 'hidden',
                    }}>
                      <div style={{
                        width: `${s.level}%`,
                        height: '100%',
                        background: `linear-gradient(to right, ${theme.hex}, ${theme.hexSecondary})`,
                        borderRadius: 999,
                        transition: 'width 1s ease',
                      }} />
                    </div>
                    <span style={{
                      fontSize: 11,
                      fontWeight: 900,
                      color: theme.hex,
                      whiteSpace: 'nowrap',
                    }}>
                      {s.level}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Bottom stripes */}
        <div style={{ height: 8, background: theme.hex, marginTop: 24 }} />
        <div style={{ height: 5, background: theme.hexSecondary }} />

        {/* Footer with QR code */}
        <div style={{
          background: '#1a1a1a',
          padding: '20px 36px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 20,
        }}>
          <div>
            {(user as any).email && (
              <div style={{
                color: '#fff',
                fontWeight: 900,
                fontSize: 16,
                letterSpacing: 1,
                marginBottom: 4,
              }}>
                {(user as any).email}
              </div>
            )}
            <div style={{ color: '#888', fontSize: 12, fontWeight: 700 }}>
              Escaneie o QR Code para ver a versão interativa
            </div>
          </div>
          <div style={{ background: '#fff', padding: 8, borderRadius: 10 }}>
            <QRCodeSVG value={currentUrl} size={80} fgColor="#0f172a" />
          </div>
        </div>
      </div>

      {/* Hidden PDF template */}
      {exportTheme && exportData && (
        <div style={{ position: 'fixed', left: -9999, top: -9999, zIndex: -1 }}>
          <ResumeTemplate ref={pdfRef} data={exportData} theme={exportTheme} profileUrl={currentUrl} />
        </div>
      )}

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
