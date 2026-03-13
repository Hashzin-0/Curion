'use client';

import { useStore } from '@/lib/store';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, Sparkles, Loader2, MapPin, Mail, Phone, QrCode } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { parseSafeDate, detectAreaFromRole } from '@/lib/utils';
import { differenceInMonths, differenceInYears } from 'date-fns';
import ResumeTemplate, { ResumeData } from '@/components/ResumeTemplate';
import { ResumeTheme } from '@/src/ai/flows/generate-resume-theme-flow';
import { format } from 'date-fns';
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

const AREA_COLORS: Record<string, { hex: string; hexSecondary: string; hexDark: string; emoji: string }> = {
  orange:  { hex: '#f97316', hexSecondary: '#fbbf24', hexDark: '#c2410c', emoji: '🍳' },
  blue:    { hex: '#3b82f6', hexSecondary: '#60a5fa', hexDark: '#1d4ed8', emoji: '💻' },
  green:   { hex: '#10b981', hexSecondary: '#34d399', hexDark: '#047857', emoji: '❤️' },
  pink:    { hex: '#ec4899', hexSecondary: '#f9a8d4', hexDark: '#9d174d', emoji: '💅' },
  purple:  { hex: '#8b5cf6', hexSecondary: '#a78bfa', hexDark: '#6d28d9', emoji: '🛒' },
  cyan:    { hex: '#06b6d4', hexSecondary: '#67e8f9', hexDark: '#0e7490', emoji: '✨' },
  slate:   { hex: '#475569', hexSecondary: '#94a3b8', hexDark: '#1e293b', emoji: '🛡️' },
  indigo:  { hex: '#6366f1', hexSecondary: '#818cf8', hexDark: '#3730a3', emoji: '📚' },
  violet:  { hex: '#7c3aed', hexSecondary: '#a78bfa', hexDark: '#4c1d95', emoji: '🎨' },
  teal:    { hex: '#14b8a6', hexSecondary: '#5eead4', hexDark: '#0f766e', emoji: '📋' },
};


export default function PublicProfile() {
  const { username } = useParams();
  const { users, areas, experiences, education, currentUser, updateArea, removeArea } = useStore();
    // Estado para edição e exclusão de área
    const [editingArea, setEditingArea] = useState<any>(null);
    const [areaForm, setAreaForm] = useState<any>({});
    const [deletingArea, setDeletingArea] = useState<any>(null);
    const [isProcessingArea, setIsProcessingArea] = useState(false);

    const isOwner = currentUser && user && currentUser.username === user.username;

    const handleEditArea = (area: any) => {
      setEditingArea(area);
      setAreaForm({ ...area });
    };
    const handleAreaFormChange = (field: string, value: string) => {
      setAreaForm((prev: any) => ({ ...prev, [field]: value }));
    };
    const handleSaveArea = async () => {
      if (!editingArea || !areaForm.name || !areaForm.slug) return;
      setIsProcessingArea(true);
      await updateArea({ ...editingArea, ...areaForm });
      setIsProcessingArea(false);
      setEditingArea(null);
    };
    const handleDeleteArea = async () => {
      if (!deletingArea) return;
      setIsProcessingArea(true);
      await removeArea(deletingArea.id);
      setIsProcessingArea(false);
      setDeletingArea(null);
    };
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);
  const [exporting, setExporting] = useState<string | null>(null);
  const [exportTheme, setExportTheme] = useState<ResumeTheme | null>(null);
  const [exportData, setExportData] = useState<ResumeData | null>(null);
  const [shouldExport, setShouldExport] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const pdfRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    async function fetchUser() {
      setLoadingUser(true);
      // Primeiro tenta encontrar no estado global
      let found = users.find(u => u.username === username);
      if (!found) {
        // Busca no Supabase
        try {
          const { supabase } = await import('@/lib/supabase');
          const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('username', username)
            .single();
          if (data) {
            found = data;
          }
        } catch (e) {
          // erro silencioso
        }
      }
      setUser(found || null);
      setLoadingUser(false);
      if (isMounted && !found) router.push('/');
    }
    fetchUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [username, users, isMounted]);

  useEffect(() => {
    if (!shouldExport || !exportTheme || !exportData || !pdfRef.current) return;
    const run = async () => {
      try {
        const html2pdf = (await import('html2pdf.js')).default;
        const element = pdfRef.current!;
        await html2pdf().set({
          margin: 0,
          filename: `curriculo-${user?.name?.toLowerCase().replace(/\s+/g, '-') || 'perfil'}-${exporting}.pdf`,
          image: { type: 'jpeg', quality: 0.95 },
          html2canvas: { scale: 2, useCORS: true, allowTaint: true, logging: false, imageTimeout: 0 },
          jsPDF: { unit: 'px', format: [794, 1123], orientation: 'portrait' },
        }).from(element).save();
      } catch (e) {
        console.error(e);
      } finally {
        setShouldExport(false);
        setExporting(null);
        setExportTheme(null);
        setExportData(null);
      }
    };
    run();
  }, [shouldExport, exportTheme, exportData, user]);

  if (!isMounted || loadingUser) return null;
  if (!user) return null;

  const userExperiences = experiences.filter(e => e.user_id === user.id);
  const userEducation = education.filter(e => e.user_id === user.id);
  const currentUrl = typeof window !== 'undefined' ? window.location.href : '';

  const groupedByArea = userExperiences.reduce<Record<string, typeof userExperiences>>((acc, exp) => {
    const area = areas.find(a => a.id === exp.area_id);
    const key = area ? area.slug : detectAreaFromRole(exp.role).slug;
    if (!acc[key]) acc[key] = [];
    acc[key].push(exp);
    return acc;
  }, {});

  const areaGroups = Object.entries(groupedByArea).map(([slug, exps]) => {
    const area = areas.find(a => a.slug === slug);
    const detected = detectAreaFromRole(exps[0].role);
    const areaName = area?.name || detected.name;
    const themeKey = (area?.theme_color || detected.themeColor) as string;
    const colors = AREA_COLORS[themeKey] || AREA_COLORS.slate;
    const icon = area?.icon || detected.icon;
    return { slug, areaName, exps, colors, icon };
  });

  const mainColors = areaGroups[0]?.colors || AREA_COLORS.slate;
  const nameParts = user.name.trim().split(' ');
  const firstName = nameParts.slice(0, Math.ceil(nameParts.length / 2)).join(' ');
  const lastName = nameParts.slice(Math.ceil(nameParts.length / 2)).join(' ');

  const handleExportArea = async (slug: string, areaName: string, colors: typeof mainColors, areaExps: typeof userExperiences) => {
    setExporting(slug);
    setExportTheme(null);
    setExportData(null);
    setShouldExport(false);
    try {
      const expList = areaExps.map(e => ({
        company: e.company_name,
        role: e.role,
        duration: calcDuration(e.start_date, e.end_date),
      }));
      const res = await fetch('/api/resume/theme', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profession: areaName,
          name: user.name,
          experiences: expList.map(e => `${e.company} - ${e.role} (${e.duration})`),
          skills: [],
        }),
      });
      if (!res.ok) throw new Error('Erro ao gerar tema');
      const aiTheme: ResumeTheme = await res.json();
      const eduList = userEducation.map(e => ({
        institution: e.institution,
        course: e.course,
        period: `${parseSafeDate(e.start_date).getFullYear()}${e.end_date ? `–${parseSafeDate(e.end_date).getFullYear()}` : '–atual'}`,
      }));
      setExportTheme(aiTheme);
      setExportData({
        name: user.name,
        firstName,
        lastName,
        profession: areaName,
        phone: (user as any).phone || '',
        email: (user as any).email || '',
        availableSince: format(new Date(), "dd/MM/yyyy", { locale: ptBR }),
        photoUrl: user.photo_url,
        summary: user.summary || '',
        experiences: expList,
        education: eduList,
        skills: [],
      });
      setShouldExport(true);
    } catch (err) {
      console.error(err);
      setExporting(null);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f1f5f9', fontFamily: "'Arial Black', Arial, sans-serif" }}>

      {/* Toolbar */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: '#fff',
        borderBottom: `3px solid ${mainColors.hex}`,
        padding: '12px 24px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
      }}>
        <button
          onClick={() => router.back()}
          style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 14, color: '#555' }}
        >
          <ArrowLeft size={18} />
          Voltar
        </button>
        <div style={{ fontWeight: 900, fontSize: 15, color: mainColors.hex }}>
          Perfil Profissional
        </div>
        <div style={{ width: 80 }} />
      </div>

      {/* HERO — poster style */}
      <div style={{
        background: mainColors.hex,
        padding: '28px 36px 24px',
        display: 'flex', alignItems: 'flex-start', gap: 24,
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: -40, right: -40, width: 180, height: 180, background: 'rgba(255,255,255,0.12)', borderRadius: '50%' }} />
        <div style={{ position: 'absolute', bottom: -30, left: '30%', width: 100, height: 100, background: 'rgba(0,0,0,0.1)', borderRadius: '50%' }} />

        {user.photo_url && (
          <div style={{ width: 120, height: 120, borderRadius: 16, overflow: 'hidden', flexShrink: 0, border: `4px solid ${mainColors.hexSecondary}`, boxShadow: '0 4px 20px rgba(0,0,0,0.25)', position: 'relative', zIndex: 1 }}>
            <Image src={user.photo_url} alt={user.name} width={120} height={120} style={{ objectFit: 'cover', width: '100%', height: '100%' }} referrerPolicy="no-referrer" />
          </div>
        )}

        <div style={{ flex: 1, position: 'relative', zIndex: 1 }}>
          <div style={{ fontSize: 44, fontWeight: 900, lineHeight: 1.05, color: '#fff', textTransform: 'uppercase', letterSpacing: -1, textShadow: `3px 3px 0 ${mainColors.hexDark}` }}>
            {firstName}
          </div>
          <div style={{ fontSize: 38, fontWeight: 900, lineHeight: 1.1, color: mainColors.hexSecondary, textTransform: 'uppercase', letterSpacing: -1, textShadow: `2px 2px 0 ${mainColors.hexDark}` }}>
            {lastName}
          </div>
          {user.summary && (
            <div style={{ marginTop: 8, fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.8)', textTransform: 'uppercase', letterSpacing: 0.5, maxWidth: 420 }}>
              {user.summary}
            </div>
          )}
        </div>

        <div style={{ fontSize: 72, lineHeight: 1, filter: 'drop-shadow(3px 4px 8px rgba(0,0,0,0.3))', position: 'relative', zIndex: 1 }}>
          {mainColors.emoji}
        </div>
      </div>

      {/* Contact bar */}
      <div style={{ height: 8, background: mainColors.hexSecondary }} />
      <div style={{ background: '#fff', padding: '14px 36px', display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap', borderBottom: `3px solid ${mainColors.hex}` }}>
        {user.headline && (
          <div style={{ fontWeight: 900, fontSize: 13, color: '#333', textTransform: 'uppercase', letterSpacing: 1.5 }}>
            {user.headline}
          </div>
        )}
        {user.location && (
          <>
            <div style={{ width: 1, height: 20, background: '#ddd' }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 13, fontWeight: 700, color: '#555' }}>
              <MapPin size={14} color={mainColors.hex} />
              {user.location}
            </div>
          </>
        )}
        {(user as any).email && (
          <>
            <div style={{ width: 1, height: 20, background: '#ddd' }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 13, fontWeight: 700, color: '#555' }}>
              <Mail size={14} color={mainColors.hex} />
              {(user as any).email}
            </div>
          </>
        )}
      </div>

      {/* Area groups */}
      <div style={{ maxWidth: 800, margin: '0 auto', padding: '0 0 40px' }}>
        {areaGroups.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px 24px', color: '#64748b' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>📋</div>
            <div style={{ fontWeight: 900, fontSize: 18 }}>Nenhuma experiência cadastrada</div>
            <div style={{ fontSize: 14, marginTop: 8 }}>As experiências aparecerão aqui agrupadas por área</div>
          </div>
        )}

        {areaGroups.map(({ slug, areaName, exps, colors, icon }, gi) => {
          const IconComponent = (LucideIcons as any)[icon] || LucideIcons.Briefcase;
          return (
            <div key={slug} style={{ background: '#fff', margin: '24px 24px 0', borderRadius: 16, overflow: 'hidden', boxShadow: '0 4px 24px rgba(0,0,0,0.07)' }}>
              {/* Area header */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 24px', borderBottom: `3px solid ${colors.hex}`, background: colors.hex + '10' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: colors.hex, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                    <IconComponent size={22} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 900, fontSize: 16, color: '#1a1a1a', textTransform: 'uppercase', letterSpacing: 1 }}>
                      {areaName}
                    </div>
                    <div style={{ fontSize: 12, color: '#888', fontWeight: 700 }}>
                      {exps.length} {exps.length === 1 ? 'experiência' : 'experiências'}
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    onClick={() => handleExportArea(slug, areaName, colors, exps)}
                    disabled={exporting !== null}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 8,
                      padding: '10px 20px',
                      background: exporting === slug ? '#ccc' : colors.hex,
                      color: '#fff', border: 'none', borderRadius: 999,
                      fontWeight: 900, fontSize: 13, cursor: exporting ? 'not-allowed' : 'pointer',
                      boxShadow: `0 4px 14px ${colors.hex}55`, transition: 'all .2s',
                    }}
                  >
                    {exporting === slug ? (
                      <><Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> Gerando...</>
                    ) : (
                      <><Sparkles size={14} /> Exportar PDF</>
                    )}
                  </button>
                  {isOwner && (
                    <>
                      <button
                        onClick={() => handleEditArea(areas.find(a => a.slug === slug))}
                        style={{
                          padding: '10px 16px', background: '#fbbf24', color: '#fff', border: 'none', borderRadius: 999, fontWeight: 900, fontSize: 13, cursor: 'pointer',
                        }}
                      >Editar</button>
                      <button
                        onClick={() => setDeletingArea(areas.find(a => a.slug === slug))}
                        style={{
                          padding: '10px 16px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: 999, fontWeight: 900, fontSize: 13, cursor: 'pointer',
                        }}
                      >Remover</button>
                    </>
                  )}
                </div>
              </div>
      {/* Modal de edição de área */}
      {editingArea && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#fff', borderRadius: 16, padding: 32, minWidth: 320, maxWidth: 400, boxShadow: '0 8px 32px rgba(0,0,0,0.18)' }}>
            <h3 style={{ fontWeight: 900, fontSize: 20, marginBottom: 18 }}>Editar Área</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <input value={areaForm.name || ''} onChange={e => handleAreaFormChange('name', e.target.value)} placeholder="Nome" style={{ padding: 10, borderRadius: 8, border: '1px solid #ddd' }} />
              <input value={areaForm.slug || ''} onChange={e => handleAreaFormChange('slug', e.target.value)} placeholder="Slug" style={{ padding: 10, borderRadius: 8, border: '1px solid #ddd' }} />
              <input value={areaForm.theme_color || ''} onChange={e => handleAreaFormChange('theme_color', e.target.value)} placeholder="Cor (ex: orange, #ff9900)" style={{ padding: 10, borderRadius: 8, border: '1px solid #ddd' }} />
              <input value={areaForm.icon || ''} onChange={e => handleAreaFormChange('icon', e.target.value)} placeholder="Ícone (ex: ChefHat)" style={{ padding: 10, borderRadius: 8, border: '1px solid #ddd' }} />
            </div>
            <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
              <button onClick={() => setEditingArea(null)} style={{ flex: 1, padding: 12, borderRadius: 8, background: '#eee', fontWeight: 700, border: 'none' }}>Cancelar</button>
              <button onClick={handleSaveArea} disabled={isProcessingArea} style={{ flex: 1, padding: 12, borderRadius: 8, background: '#3b82f6', color: '#fff', fontWeight: 900, border: 'none', opacity: isProcessingArea ? 0.6 : 1 }}>{isProcessingArea ? 'Salvando...' : 'Salvar'}</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de confirmação de exclusão */}
      {deletingArea && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#fff', borderRadius: 16, padding: 32, minWidth: 320, maxWidth: 400, boxShadow: '0 8px 32px rgba(0,0,0,0.18)' }}>
            <h3 style={{ fontWeight: 900, fontSize: 20, marginBottom: 18 }}>Remover Área</h3>
            <div style={{ marginBottom: 18 }}>Tem certeza que deseja remover a área <b>{deletingArea.name}</b>? Esta ação não pode ser desfeita.</div>
            <div style={{ display: 'flex', gap: 12 }}>
              <button onClick={() => setDeletingArea(null)} style={{ flex: 1, padding: 12, borderRadius: 8, background: '#eee', fontWeight: 700, border: 'none' }}>Cancelar</button>
              <button onClick={handleDeleteArea} disabled={isProcessingArea} style={{ flex: 1, padding: 12, borderRadius: 8, background: '#ef4444', color: '#fff', fontWeight: 900, border: 'none', opacity: isProcessingArea ? 0.6 : 1 }}>{isProcessingArea ? 'Removendo...' : 'Remover'}</button>
            </div>
          </div>
        </div>
      )}

              {/* Experiences */}
              <div style={{ padding: '16px 24px' }}>
                {exps.map((exp, i) => {
                  const duration = calcDuration(exp.start_date, exp.end_date);
                  return (
                    <div key={exp.id} style={{ marginBottom: 16, paddingBottom: 16, borderBottom: i < exps.length - 1 ? '1px solid #f0f0f0' : 'none' }}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
                        <div>
                          <div style={{ fontWeight: 900, fontSize: 14, color: '#1a1a1a', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                            {exp.company_name}
                          </div>
                          <div style={{ fontSize: 12, color: '#555', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 2 }}>
                            {exp.role}
                          </div>
                          {exp.description && (
                            <div style={{ fontSize: 11, color: '#888', fontWeight: 600, marginTop: 4 }}>
                              {exp.description}
                            </div>
                          )}
                        </div>
                        <div style={{ flexShrink: 0, background: colors.hex + '20', color: colors.hex, borderRadius: 999, padding: '4px 12px', fontSize: 12, fontWeight: 900, whiteSpace: 'nowrap' }}>
                          {duration}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Export full themed link */}
              <div style={{ padding: '0 24px 16px', display: 'flex', justifyContent: 'flex-end' }}>
                <Link
                  href={`/${username}/${slug}`}
                  style={{ fontSize: 13, fontWeight: 900, color: colors.hex, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6 }}
                >
                  Ver currículo completo →
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      {/* Education section */}
      {userEducation.length > 0 && (
        <div style={{ maxWidth: 800, margin: '0 auto 40px', padding: '0 24px' }}>
          <div style={{ background: '#fff', borderRadius: 16, overflow: 'hidden', boxShadow: '0 4px 24px rgba(0,0,0,0.07)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '16px 24px', borderBottom: `3px solid ${mainColors.hex}`, background: mainColors.hex + '10' }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: mainColors.hex, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                <LucideIcons.GraduationCap size={22} />
              </div>
              <div style={{ fontWeight: 900, fontSize: 16, color: '#1a1a1a', textTransform: 'uppercase', letterSpacing: 1 }}>
                Formação Acadêmica
              </div>
            </div>
            <div style={{ padding: '16px 24px' }}>
              {userEducation.map((edu, i) => (
                <div key={edu.id} style={{ marginBottom: 12, paddingBottom: 12, borderBottom: i < userEducation.length - 1 ? '1px solid #f0f0f0' : 'none' }}>
                  <div style={{ fontWeight: 900, fontSize: 14, color: '#1a1a1a', textTransform: 'uppercase' }}>
                    {edu.course}
                  </div>
                  <div style={{ fontSize: 12, color: '#555', fontWeight: 700, marginTop: 2 }}>
                    {edu.institution} · {parseSafeDate(edu.start_date).getFullYear()}
                    {edu.end_date ? `–${parseSafeDate(edu.end_date).getFullYear()}` : '–atual'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Footer QR */}
      <div style={{ background: '#1a1a1a', padding: '24px 36px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 20 }}>
        <div style={{ color: '#aaa', fontSize: 12, fontWeight: 700 }}>
          Escaneie o QR Code para ver a versão interativa
        </div>
        <div style={{ background: '#fff', padding: 6, borderRadius: 8 }}>
          <QRCodeSVG value={currentUrl} size={72} />
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
