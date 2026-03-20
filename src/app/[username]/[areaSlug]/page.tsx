'use client';

import { useStore, Experience, Education, ProfessionalArea } from '@/lib/store';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useRef, useState, useMemo, Suspense } from 'react';
import { Loader2, ArrowLeft, Sparkles, Mail } from 'lucide-react';
import { getTheme } from '@/styles/themes';
import { generateSystemResumeTheme } from '@/lib/premium-themes';
import { calcDuration, slugify } from '@/lib/utils';
import { toast } from 'sonner';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/feedback/Modal';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { ExperienceItem, EducationCard } from '@/components/shared/ProfileSections';
import { DatabaseService } from '@/lib/services/database';
import dynamic from 'next/dynamic';

// Importações dinâmicas para evitar erros de manifesto client-side no SSR
const ResumeTemplate = dynamic(() => import('@/components/ResumeTemplate'), { ssr: false });
const RichEditor = dynamic(() => import('@/components/RichEditor').then(mod => mod.RichEditor), { ssr: false });
const QRCodeSVG = dynamic(() => import('qrcode.react').then(mod => mod.QRCodeSVG), { ssr: false });

function AreaResumeContent() {
  const params = useParams();
  const username = params?.username as string;
  const areaSlug = params?.areaSlug as string;
  
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
  const [isRefining, setIsRefining] = useState(false);
  const [exportTheme, setExportTheme] = useState<any>(null);
  const [exportData, setExportData] = useState<any>(null);
  const [shouldExport, setShouldExport] = useState(false);
  const [currentUrl, setCurrentUrl] = useState('');

  const [editingExp, setEditingExp] = useState<Experience | null>(null);
  const [editingEdu, setEditingEdu] = useState<Education | null>(null);
  const [editingArea, setEditingArea] = useState<ProfessionalArea | null>(null);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    setIsMounted(true);
    if (typeof window !== 'undefined') setCurrentUrl(window.location.href);
  }, []);

  useEffect(() => {
    const found = users.find(u => u.username === username);
    if (found) {
      setUser(found);
      if (currentUser?.id !== found.id) {
        DatabaseService.recordProfileView(found.id, 'view_area', { areaSlug });
      }
    }
    else if (!isLoading && isMounted) router.push('/');
  }, [username, users, isMounted, isLoading, router, currentUser?.id, areaSlug]);

  const area = useMemo(() => areas.find(a => slugify(a.name) === areaSlug), [areas, areaSlug]);
  const isOwner = currentUser?.id === user?.id;

  const areaExperiences = useMemo(() => experiences.filter(e => e.area_id === area?.id && e.user_id === user?.id), [experiences, area, user]);
  const userEducation = useMemo(() => education.filter(e => e.user_id === user?.id), [education, user]);
  const currentAreaSkills = useMemo(() => areaSkills.filter(as => as.area_id === area?.id).map(as => ({ ...as, skill: skills.find(s => s.id === as.skill_id) })).filter(s => s.skill), [areaSkills, area, skills]);

  const handleExportThemed = () => {
    if (!area || !user) return;
    setExporting(true);
    
    if (!isOwner) {
      DatabaseService.recordProfileView(user.id, 'download_pdf', { areaName: area.name });
    }

    const theme = generateSystemResumeTheme(user.name, area.name);
    
    setExportTheme(theme);
    setExportData({
      name: user.name, 
      firstName: user.name.split(' ')[0], 
      lastName: user.name.split(' ').slice(1).join(' '),
      profession: area.name, 
      phone: '', 
      email: user.email || '', 
      availableSince: 'Hoje',
      summary: user.summary || '',
      experiences: areaExperiences.map(e => ({ company: e.company_name, role: e.role, duration: calcDuration(e.start_date, e.end_date) })),
      skills: currentAreaSkills.map(s => ({ name: s.skill!.name, description: '' }))
    });
    
    setShouldExport(true);
  };

  const handleRefineExperience = async () => {
    if (!editingExp) return;
    setIsRefining(true);
    const tid = toast.loading('IA está polindo sua descrição...');
    try {
      const res = await fetch('/api/experience/refine', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role: editingExp.role,
          company: editingExp.company_name,
          description: editingExp.description?.replace(/<[^>]*>/g, '') || ''
        })
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setEditingExp(prev => prev ? { ...prev, description: data.refinedDescription } : null);
      toast.success('Descrição refinada com sucesso!', { id: tid });
    } catch (e) {
      toast.error('Falha ao refinar com IA.', { id: tid });
    } finally {
      setIsRefining(false);
    }
  };

  useEffect(() => {
    const element = pdfRef.current;
    if (!shouldExport || !element) return;
    
    const run = async () => {
      try {
        const html2pdf = (await import('html2pdf.js')).default;
        await html2pdf().set({ 
          margin: 0, 
          filename: `cv-${areaSlug}.pdf`, 
          jsPDF: { format: [794, 1123], unit: 'px' },
          html2canvas: { scale: 2, useCORS: true, allowTaint: true }
        }).from(element).save();
      } catch (err) {
        toast.error('Erro ao gerar PDF');
      } finally {
        setShouldExport(false); 
        setExporting(false);
      }
    };
    run();
  }, [shouldExport, areaSlug]);

  if (!isMounted || !user || !area) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin" /></div>;

  const theme = getTheme(areaSlug);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b dark:border-slate-800 px-6 py-3 flex items-center justify-between">
        <Button variant="secondary" onClick={() => router.back()}><ArrowLeft size={16} /> Voltar</Button>
        <div className="flex gap-2">
          {isOwner && (
            <>
              <Button variant={isEditMode ? 'primary' : 'outline'} onClick={() => setIsEditMode(!isEditMode)}>
                {isEditMode ? 'Visualizar' : 'Modo Edição'}
              </Button>
              <Button variant="secondary" onClick={() => setEditingArea(area)}>Design</Button>
            </>
          )}
          <Button onClick={handleExportThemed} disabled={exporting}>
            {exporting ? <Loader2 className="animate-spin" /> : <Sparkles />} Exportar PDF
          </Button>
        </div>
      </div>

      <div className="max-w-[800px] mx-auto my-12 bg-white dark:bg-slate-900 shadow-2xl relative overflow-hidden p-12 border-t-[12px] transition-all hover:shadow-indigo-500/10" style={{ borderColor: area.theme_color || theme.hex }}>
        <header className="flex justify-between items-start mb-12">
          <div>
            <h1 className="text-5xl font-black uppercase tracking-tighter mb-2 text-slate-900 dark:text-white">{user.name}</h1>
            <p className="text-xl font-bold uppercase tracking-widest text-slate-500">{area.name}</p>
          </div>
          <div className="text-6xl filter drop-shadow-lg">{theme.emoji}</div>
        </header>

        <section className="mb-12">
          <div className="flex items-center gap-4 mb-8">
            <h2 className="text-2xl font-black uppercase tracking-widest text-slate-900 dark:text-white">Experiência</h2>
            <div className="flex-1 h-1 bg-slate-100 dark:bg-slate-800" />
          </div>
          <div className="space-y-0">
            {areaExperiences.length > 0 ? (
              areaExperiences.map(exp => (
                <ExperienceItem key={exp.id} exp={exp} isOwner={isEditMode} onEdit={setEditingExp} onDelete={removeExperience} themeColor={area.theme_color || theme.hex} />
              ))
            ) : (
              <p className="text-slate-400 italic">Nenhuma experiência registrada para esta área.</p>
            )}
          </div>
        </section>

        {userEducation.length > 0 && (
          <section className="mb-12">
            <div className="flex items-center gap-4 mb-8">
              <h2 className="text-2xl font-black uppercase tracking-widest text-slate-900 dark:text-white">Formação</h2>
              <div className="flex-1 h-1 bg-slate-100 dark:bg-slate-800" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {userEducation.map(edu => (
                <EducationCard key={edu.id} edu={edu} isOwner={isEditMode} onEdit={setEditingEdu} onDelete={removeEducation} />
              ))}
            </div>
          </section>
        )}

        <footer className="mt-20 pt-12 border-t dark:border-slate-800 flex justify-between items-center">
          <div className="text-[10px] font-black uppercase text-slate-400 tracking-widest">
            <p className="flex items-center gap-2"><Mail size={12} /> {user.email}</p>
            <p className="mt-2 text-[8px] opacity-50 truncate max-w-[200px]">{currentUrl}</p>
          </div>
          <div className="bg-white p-2 rounded-xl shadow-lg border border-slate-100">
            <QRCodeSVG value={currentUrl} size={64} level="H" />
          </div>
        </footer>
      </div>

      <Modal isOpen={!!editingExp} onClose={() => setEditingExp(null)} title="Editar Experiência">
        <form onSubmit={async (e) => { e.preventDefault(); if(editingExp) { await updateExperience(editingExp); setEditingExp(null); toast.success('Salvo!'); } }} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div><Label>Cargo</Label><Input value={editingExp?.role || ''} onChange={e => setEditingExp(p => p ? {...p, role: e.target.value} : null)} /></div>
            <div><Label>Empresa</Label><Input value={editingExp?.company_name || ''} onChange={e => setEditingExp(p => p ? {...p, company_name: e.target.value} : null)} /></div>
          </div>
          <div>
            <div className="flex justify-between items-center mb-2">
              <Label>Descrição</Label>
              <button 
                type="button" 
                onClick={handleRefineExperience} 
                disabled={isRefining}
                className="text-[10px] font-black uppercase text-blue-600 flex items-center gap-1 hover:underline disabled:opacity-50"
              >
                {isRefining ? <Loader2 className="animate-spin" size={12} /> : <Sparkles size={12} />}
                IA Refinar
              </button>
            </div>
            <RichEditor 
              content={editingExp?.description || ''} 
              onChange={v => setEditingExp(p => p ? {...p, description: v} : null)} 
              placeholder="Descreva suas conquistas... Use ``` para blocos de código."
            />
          </div>
          <Button className="w-full" type="submit">Atualizar Registro</Button>
        </form>
      </Modal>

      <Modal isOpen={!!editingArea} onClose={() => setEditingArea(null)} title="Design da Área">
        <div className="space-y-4">
          <div><Label>Nome da Área</Label><Input value={editingArea?.name || ''} onChange={e => setEditingArea(p => p ? {...p, name: e.target.value} : null)} /></div>
          <div>
            <Label>Cor de Destaque</Label>
            <div className="flex gap-3">
              <input type="color" value={editingArea?.theme_color || theme.hex} onChange={e => setEditingArea(p => p ? {...p, theme_color: e.target.value} : null)} className="h-12 w-12 rounded-xl cursor-pointer border-none" />
              <Input value={editingArea?.theme_color || theme.hex} onChange={e => setEditingArea(p => p ? {...p, theme_color: e.target.value} : null)} className="flex-1 font-mono uppercase" />
            </div>
          </div>
          <Button className="w-full" onClick={async () => { if(editingArea) { await updateArea(editingArea); setEditingArea(null); toast.success('Estilo atualizado!'); } }}>Salvar Design</Button>
        </div>
      </Modal>

      {exportTheme && exportData && (
        <div className="fixed left-[-9999px] top-[-9999px] invisible">
          <ResumeTemplate ref={pdfRef} data={exportData} theme={exportTheme} profileUrl={currentUrl} />
        </div>
      )}
    </div>
  );
}

export default function AreaResumePage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin" /></div>}>
      <AreaResumeContent />
    </Suspense>
  );
}
