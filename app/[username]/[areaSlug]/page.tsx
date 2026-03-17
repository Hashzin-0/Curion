'use client';

import { useStore, Experience, Education, ProfessionalArea } from '@/lib/store';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useRef, useState, useCallback } from 'react';
import Image from 'next/image';
import * as LucideIcons from 'lucide-react';
import { getTheme } from '@/styles/themes';
import ResumeTemplate, { ResumeData } from '@/components/ResumeTemplate';
import { ResumeTheme } from '@/src/ai/flows/generate-resume-theme-flow';
import { QRCodeSVG } from 'qrcode.react';
import { parseSafeDate } from '@/lib/utils';
import { differenceInMonths, differenceInYears, format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { AnimatePresence, motion } from 'motion/react';
import { toast } from 'sonner';

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
  const { 
    users, areas, experiences, skills, areaSkills, education, 
    currentUser, isLoading, updateExperience, removeExperience,
    updateEducation, removeEducation, updateArea
  } = useStore();
  const router = useRouter();
  const pdfRef = useRef<HTMLDivElement>(null);
  
  const [isMounted, setIsMounted] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [exportTheme, setExportTheme] = useState<ResumeTheme | null>(null);
  const [exportData, setExportData] = useState<ResumeData | null>(null);
  const [exportError, setExportError] = useState('');
  const [shouldExport, setShouldExport] = useState(false);
  const [currentUrl, setCurrentUrl] = useState('');

  // Estados de Edição
  const [editingExp, setEditingExp] = useState<Experience | null>(null);
  const [editingEdu, setEditingEdu] = useState<Education | null>(null);
  const [editingArea, setEditingArea] = useState<ProfessionalArea | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const [user, setUser] = useState<any>(null);
  const [loadingUser, setLoadingUser] = useState(true);

  useEffect(() => {
    setIsMounted(true);
    if (typeof window !== 'undefined') {
      setCurrentUrl(window.location.href);
    }
  }, []);

  useEffect(() => {
    async function fetchUser() {
      if (!username) return;
      setLoadingUser(true);
      
      let found = users.find(u => u.username === username);
      
      if (!found) {
        try {
          const { supabase } = await import('@/lib/supabase');
          const { data } = await supabase
            .from('users')
            .select('*')
            .eq('username', username)
            .single();
          if (data) found = data;
        } catch (e) {
          console.error(e);
        }
      }
      
      setUser(found || null);
      setLoadingUser(false);
      
      if (!found && !isLoading && isMounted) {
        router.push('/');
      }
    }
    fetchUser();
  }, [username, users, isMounted, isLoading, router]);

  useEffect(() => {
    if (!shouldExport || !exportTheme || !exportData || !pdfRef.current || !user) return;
    const run = async () => {
      try {
        const html2pdf = (await import('html2pdf.js')).default;
        const element = pdfRef.current!;
        const area = areas.find(a => a.slug === areaSlug);
        await html2pdf().set({
          margin: 0,
          filename: `curriculo-${user.name.toLowerCase().replace(/\s+/g, '-')}-${area?.slug || 'area'}.pdf`,
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
  }, [shouldExport, exportTheme, exportData, user, areas, areaSlug]);

  if (!isMounted || loadingUser || (isLoading && !user)) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-4">
        <LucideIcons.Loader2 className="w-10 h-10 text-blue-600 animate-spin mb-4" />
        <p className="text-slate-600 dark:text-slate-400 font-medium">Carregando currículo...</p>
      </div>
    );
  }

  const area = areas.find(a => a.slug === areaSlug);
  if (!user || !area) return null;

  const isOwner = currentUser?.id === user.id;
  const theme = getTheme(area.slug);
  const areaExperiences = experiences.filter(e => e.area_id === area.id && e.user_id === user.id);
  const currentAreaSkills = areaSkills.filter(as => as.area_id === area.id);
  const allAreaSkillDetails = currentAreaSkills.map(as => {
    const skill = skills.find(s => s.id === as.skill_id);
    return { ...as, skill };
  }).filter(s => s.skill);
  const userEducation = education.filter(e => e.user_id === user.id);

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
        phone: user.phone || '',
        email: user.email || '',
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

  const handleSaveExp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingExp) return;
    setIsSaving(true);
    await updateExperience(editingExp);
    setIsSaving(false);
    setEditingExp(null);
    toast.success('Experiência atualizada!');
  };

  const handleSaveEdu = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEdu) return;
    setIsSaving(true);
    await updateEducation(editingEdu);
    setIsSaving(false);
    setEditingEdu(null);
    toast.success('Educação atualizada!');
  };

  const handleSaveArea = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingArea) return;
    setIsSaving(true);
    await updateArea(editingArea);
    setIsSaving(false);
    setEditingArea(null);
    toast.success('Área atualizada!');
  };

  return (
    <div className="min-h-screen bg-slate-50" style={{ fontFamily: "'Arial Black', Arial, sans-serif" }}>

      <div className="sticky top-0 z-50 bg-white border-b-2 px-6 py-3 flex items-center justify-between shadow-sm" style={{ borderColor: theme.hex }}>
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-slate-500 font-bold text-sm hover:text-slate-800 transition-colors"
          >
            <LucideIcons.ArrowLeft size={18} />
            Voltar
          </button>
          
          {isOwner && (
            <div className="flex items-center gap-2 ml-4 pl-4 border-l border-slate-200">
              <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Modo Edição</span>
              <button 
                onClick={() => setIsEditMode(!isEditMode)}
                className={`w-12 h-6 rounded-full relative transition-all ${isEditMode ? 'bg-blue-600' : 'bg-slate-200'}`}
              >
                <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${isEditMode ? 'right-1' : 'left-1'}`} />
              </button>
            </div>
          )}
        </div>

        <div className="flex gap-3">
          {isOwner && (
            <button
              onClick={() => setEditingArea(area)}
              className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-600 rounded-full font-black text-xs hover:bg-slate-200 transition-all"
            >
              <LucideIcons.Palette size={14} />
              Configurações Visuais
            </button>
          )}
          
          <button
            onClick={handleExportThemed}
            disabled={exporting}
            className={`flex items-center gap-2 px-6 py-2 text-white rounded-full font-black text-sm shadow-lg transition-all ${exporting ? 'bg-slate-400 cursor-not-allowed' : 'hover:scale-105'}`}
            style={{ backgroundColor: exporting ? '#ccc' : theme.hex }}
          >
            {exporting ? (
              <>
                <LucideIcons.Loader2 size={16} className="animate-spin" />
                IA Trabalhando...
              </>
            ) : (
              <>
                <LucideIcons.Sparkles size={16} />
                Exportar PDF
              </>
            )}
          </button>
        </div>
      </div>

      {exportError && (
        <div className="bg-red-50 text-red-600 p-3 text-center font-bold text-sm border-b border-red-100">
          {exportError}
        </div>
      )}

      <div className="max-w-[800px] mx-auto my-8 bg-white shadow-2xl overflow-hidden relative">

        <div style={{ height: 14, background: theme.hex }} />

        <div style={{
          background: theme.hex,
          padding: '28px 36px 24px',
          display: 'flex',
          alignItems: 'flex-start',
          gap: 24,
          position: 'relative',
          overflow: 'hidden',
        }}>
          <div className="absolute top-[-40px] right-[-40px] w-40 h-40 bg-white/10 rounded-full" />
          <div className="absolute bottom-[-30px] left-[30%] w-20 h-20 bg-black/10 rounded-full" />

          {user.photo_url && (
            <div className="relative z-10 w-32 h-32 rounded-2xl overflow-hidden shrink-0 border-4 border-white/20 shadow-2xl">
              <Image
                src={user.photo_url}
                alt={user.name}
                width={128}
                height={128}
                className="object-cover w-full h-full"
                referrerPolicy="no-referrer"
              />
            </div>
          )}

          <div className="flex-1 relative z-10">
            <div className="text-[44px] font-black leading-[1.05] text-white uppercase tracking-tighter" style={{ textShadow: `3px 3px 0 ${theme.hexDark}` }}>
              {firstName}
            </div>
            <div className="text-[38px] font-black leading-[1.1] uppercase tracking-tighter" style={{ color: theme.hexSecondary, textShadow: `2px 2px 0 ${theme.hexDark}` }}>
              {lastName}
            </div>
          </div>

          <div className="text-7xl leading-none drop-shadow-2xl relative z-10">
            {theme.emoji}
          </div>
        </div>

        <div style={{ height: 10, background: theme.hexSecondary }} />

        <div className="bg-white px-9 py-4 flex items-center gap-5 flex-wrap border-b-2" style={{ borderColor: theme.hex }}>
          <div className="font-black text-[13px] text-slate-800 uppercase tracking-[0.1em]">
            {area.name}
          </div>
          {user.location && (
            <>
              <div className="w-px h-5 bg-slate-200" />
              <div className="flex items-center gap-1.5 text-[13px] font-bold text-slate-500 uppercase">
                <LucideIcons.MapPin size={14} style={{ color: theme.hex }} />
                {user.location}
              </div>
            </>
          )}
          {user.email && (
            <>
              <div className="w-px h-5 bg-slate-200" />
              <div className="flex items-center gap-1.5 text-[13px] font-bold text-slate-500 uppercase">
                <LucideIcons.Mail size={14} style={{ color: theme.hex }} />
                {user.email}
              </div>
            </>
          )}
        </div>

        {user.summary && (
          <div className="px-9 py-6 flex gap-6 items-start bg-slate-50 border-b border-slate-100">
            <div className="text-4xl shrink-0">💬</div>
            <div className="text-[12px] font-bold leading-relaxed text-slate-800 uppercase tracking-tight" dangerouslySetInnerHTML={{ __html: user.summary }} />
          </div>
        )}

        {/* EXPERIÊNCIAS */}
        <section className="px-9">
          <div className="flex items-center gap-4 my-8">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shrink-0" style={{ backgroundColor: theme.hexSecondary }}>
              🏢
            </div>
            <div className="flex-1 h-0.5 bg-slate-100" />
            <h2 className="text-3xl font-black text-slate-900 tracking-widest uppercase whitespace-nowrap">
              Experiências
            </h2>
            <div className="flex-1 h-0.5 bg-slate-100" />
          </div>

          <div className="space-y-6 pb-6">
            {areaExperiences.map((exp) => (
              <div key={exp.id} className="relative group">
                {isEditMode && (
                  <div className="absolute -left-4 top-0 z-20 flex flex-col gap-1">
                    <button onClick={() => setEditingExp(exp)} className="p-2 bg-blue-600 text-white rounded-lg shadow-lg hover:bg-blue-700 transition-all">
                      <LucideIcons.Pencil size={12} />
                    </button>
                    <button onClick={() => removeExperience(exp.id)} className="p-2 bg-red-600 text-white rounded-lg shadow-lg hover:bg-red-700 transition-all">
                      <LucideIcons.Trash2 size={12} />
                    </button>
                  </div>
                )}
                <div className="flex items-center gap-1.5">
                  <span className="font-black text-[13px] uppercase tracking-wider text-slate-900 whitespace-nowrap">
                    {exp.company_name}
                  </span>
                  <span className="text-base mx-1" style={{ color: theme.hex }}>{theme.emoji}</span>
                  <DottedSeparator color={theme.hex} />
                  <span className="font-black text-[13px] tracking-[0.2em] text-slate-500 uppercase whitespace-nowrap">
                    {calcDuration(exp.start_date, exp.end_date)}
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 font-bold uppercase tracking-wider pl-2 mt-1">
                  {exp.role}
                  {exp.description && (
                    <span className="opacity-70" dangerouslySetInnerHTML={{ __html: ` — ${exp.description}` }} />
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* EDUCAÇÃO */}
        {userEducation.length > 0 && (
          <section className="px-9">
            <div className="flex items-center gap-4 my-8">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shrink-0" style={{ backgroundColor: theme.hexSecondary }}>
                🎓
              </div>
              <div className="flex-1 h-0.5 bg-slate-100" />
              <h2 className="text-3xl font-black text-slate-900 tracking-widest uppercase whitespace-nowrap">
                Formação
              </h2>
              <div className="flex-1 h-0.5 bg-slate-100" />
            </div>

            <div className="space-y-4 pb-6">
              {userEducation.map((edu) => (
                <div key={edu.id} className="relative group">
                  {isEditMode && (
                    <div className="absolute -left-4 top-0 z-20 flex flex-col gap-1">
                      <button onClick={() => setEditingEdu(edu)} className="p-2 bg-blue-600 text-white rounded-lg shadow-lg hover:bg-blue-700 transition-all">
                        <LucideIcons.Pencil size={12} />
                      </button>
                      <button onClick={() => removeEducation(edu.id)} className="p-2 bg-red-600 text-white rounded-lg shadow-lg hover:bg-red-700 transition-all">
                        <LucideIcons.Trash2 size={12} />
                      </button>
                    </div>
                  )}
                  <div className="flex items-center gap-1.5">
                    <span className="font-black text-[13px] uppercase tracking-wider text-slate-900 whitespace-nowrap">
                      {edu.course}
                    </span>
                    <DottedSeparator color={theme.hex} />
                    <span className="font-black text-[12px] text-slate-400 uppercase tracking-widest whitespace-nowrap">
                      {parseSafeDate(edu.start_date).getFullYear()}
                      {edu.end_date ? `–${parseSafeDate(edu.end_date).getFullYear()}` : '–ATUAL'}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 font-bold uppercase tracking-wider pl-2 mt-1">
                    {edu.institution}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* COMPETÊNCIAS */}
        {allAreaSkillDetails.length > 0 && (
          <section className="px-9">
            <div className="flex items-center gap-4 my-8">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shrink-0" style={{ backgroundColor: theme.hexSecondary }}>
                ⭐
              </div>
              <div className="flex-1 h-0.5 bg-slate-100" />
              <h2 className="text-3xl font-black text-slate-900 tracking-widest uppercase whitespace-nowrap">
                Competências
              </h2>
              <div className="flex-1 h-0.5 bg-slate-100" />
            </div>

            <div className="space-y-6 pb-12">
              {allAreaSkillDetails.map((s) => (
                <div key={s.id} className="group">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-base shrink-0" style={{ color: theme.hex }}>{theme.emoji}</span>
                    <DottedSeparator color={theme.hex} />
                    <span className="font-black text-[13px] tracking-[0.2em] text-slate-900 uppercase whitespace-nowrap">
                      {s.skill!.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 pl-6">
                    <div className="flex-1 h-2.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                      <div 
                        className="h-full rounded-full transition-all duration-1000" 
                        style={{ 
                          width: `${s.level}%`,
                          background: `linear-gradient(to right, ${theme.hex}, ${theme.hexSecondary})`
                        }} 
                      />
                    </div>
                    <span className="text-[11px] font-black w-10 text-right" style={{ color: theme.hex }}>
                      {s.level}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        <div style={{ height: 8, background: theme.hex }} />
        <div style={{ height: 5, background: theme.hexSecondary }} />

        <div className="bg-slate-900 p-8 flex items-center justify-between gap-10">
          <div>
            {user.email && (
              <div className="text-white font-black text-lg tracking-wider mb-1">
                {user.email}
              </div>
            )}
            <div className="text-slate-500 text-[10px] font-black uppercase tracking-widest">
              Escaneie para versão interativa
            </div>
          </div>
          <div className="bg-white p-2 rounded-xl shadow-2xl">
            <QRCodeSVG value={currentUrl} size={80} fgColor="#0f172a" />
          </div>
        </div>
      </div>

      {/* MODAIS DE EDIÇÃO */}
      <AnimatePresence>
        {editingExp && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <motion.form 
              onSubmit={handleSaveExp}
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
              className="bg-white w-full max-w-lg rounded-[2.5rem] p-10 shadow-2xl overflow-y-auto max-h-[90vh]"
            >
              <h3 className="text-2xl font-black mb-8">Editar Experiência</h3>
              <div className="space-y-6">
                <div><label className="text-xs font-black uppercase text-slate-400 mb-2 block">Empresa</label><input required value={editingExp.company_name} onChange={e => setEditingExp({...editingExp, company_name: e.target.value})} className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-200 font-bold" /></div>
                <div><label className="text-xs font-black uppercase text-slate-400 mb-2 block">Cargo</label><input required value={editingExp.role} onChange={e => setEditingExp({...editingExp, role: e.target.value})} className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-200 font-bold" /></div>
                <div><label className="text-xs font-black uppercase text-slate-400 mb-2 block">Descrição</label><textarea rows={5} value={editingExp.description} onChange={e => setEditingExp({...editingExp, description: e.target.value})} className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-200 font-bold resize-none" /></div>
              </div>
              <div className="flex gap-4 mt-10">
                <button type="button" onClick={() => setEditingExp(null)} className="flex-1 py-4 font-black text-slate-400">Cancelar</button>
                <button type="submit" disabled={isSaving} className="flex-1 py-4 bg-slate-900 text-white rounded-2xl font-black shadow-xl hover:scale-105 transition-all">
                  {isSaving ? 'Salvando...' : 'Salvar'}
                </button>
              </div>
            </motion.form>
          </motion.div>
        )}

        {editingEdu && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <motion.form 
              onSubmit={handleSaveEdu}
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
              className="bg-white w-full max-w-lg rounded-[2.5rem] p-10 shadow-2xl"
            >
              <h3 className="text-2xl font-black mb-8">Editar Formação</h3>
              <div className="space-y-6">
                <div><label className="text-xs font-black uppercase text-slate-400 mb-2 block">Instituição</label><input required value={editingEdu.institution} onChange={e => setEditingEdu({...editingEdu, institution: e.target.value})} className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-200 font-bold" /></div>
                <div><label className="text-xs font-black uppercase text-slate-400 mb-2 block">Curso</label><input required value={editingEdu.course} onChange={e => setEditingEdu({...editingEdu, course: e.target.value})} className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-200 font-bold" /></div>
              </div>
              <div className="flex gap-4 mt-10">
                <button type="button" onClick={() => setEditingEdu(null)} className="flex-1 py-4 font-black text-slate-400">Cancelar</button>
                <button type="submit" disabled={isSaving} className="flex-1 py-4 bg-slate-900 text-white rounded-2xl font-black shadow-xl hover:scale-105 transition-all">
                  {isSaving ? 'Salvando...' : 'Salvar'}
                </button>
              </div>
            </motion.form>
          </motion.div>
        )}

        {editingArea && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <motion.form 
              onSubmit={handleSaveArea}
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
              className="bg-white w-full max-w-md rounded-[2.5rem] p-10 shadow-2xl"
            >
              <h3 className="text-2xl font-black mb-8">Estilo da Área</h3>
              <div className="space-y-6">
                <div>
                  <label className="text-xs font-black uppercase text-slate-400 mb-2 block">Nome da Área</label>
                  <input required value={editingArea.name} onChange={e => setEditingArea({...editingArea, name: e.target.value})} className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-200 font-bold" />
                </div>
                <div>
                  <label className="text-xs font-black uppercase text-slate-400 mb-2 block">Cor Principal</label>
                  <div className="flex gap-4 items-center">
                    <input type="color" value={editingArea.theme_color} onChange={e => setEditingArea({...editingArea, theme_color: e.target.value})} className="w-16 h-16 rounded-xl cursor-pointer border-0 p-0 overflow-hidden" />
                    <input value={editingArea.theme_color} onChange={e => setEditingArea({...editingArea, theme_color: e.target.value})} className="flex-1 p-4 rounded-2xl bg-slate-50 border border-slate-200 font-mono text-sm" />
                  </div>
                </div>
              </div>
              <div className="flex gap-4 mt-10">
                <button type="button" onClick={() => setEditingArea(null)} className="flex-1 py-4 font-black text-slate-400">Cancelar</button>
                <button type="submit" disabled={isSaving} className="flex-1 py-4 bg-slate-900 text-white rounded-2xl font-black shadow-xl hover:scale-105 transition-all">
                  {isSaving ? 'Aplicar Estilo' : 'Aplicar'}
                </button>
              </div>
            </motion.form>
          </motion.div>
        )}
      </AnimatePresence>

      {exportTheme && exportData && (
        <div className="fixed left-[-9999px] top-[-9999px] invisible pointer-events-none">
          <ResumeTemplate ref={pdfRef} data={exportData} theme={exportTheme} profileUrl={currentUrl} />
        </div>
      )}

    </div>
  );
}