
'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import {
  Loader2, Plus, Trash2, Wand2, Download, ArrowLeft, X,
  User, Briefcase, GraduationCap, Star, FileText,
  Palette, Layers, GripVertical, Upload, FileCode, Save, Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { ResumeTheme } from '@/src/ai/flows/generate-resume-theme-flow';
import type { ResumeData } from '@/components/ResumeTemplate';
import { ChromePicker } from 'react-color';
import { toast } from 'sonner';
import { useStore } from '@/lib/store';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { parseResumeText } from '@/src/ai/flows/parse-resume-text-flow';

const ResumeTemplate = dynamic(() => import('@/components/ResumeTemplate'), { ssr: false });

const GOOGLE_FONTS = [
  'Inter', 'Roboto', 'Playfair Display', 'Montserrat', 'Open Sans', 'Lato', 
  'Poppins', 'Lora', 'Merriweather', 'Space Grotesk'
];

type SectionType = 'summary' | 'experience' | 'education' | 'course' | 'skill';

type Experience = { company: string; role: string; duration: string };
type Education = { institution: string; course: string; period: string };
type Course = { name: string; institution: string; year: string };
type Skill = { name: string; description: string };

const SECTION_OPTIONS: { type: SectionType; label: string; description: string; icon: any; color: string }[] = [
  { type: 'summary', label: 'Resumo Profissional', description: 'Um parágrafo sobre você', icon: FileText, color: 'blue' },
  { type: 'experience', label: 'Experiência', description: 'Empresa, cargo e período', icon: Briefcase, color: 'emerald' },
  { type: 'education', label: 'Escolaridade', description: 'Instituição e curso', icon: GraduationCap, color: 'purple' },
  { type: 'course', label: 'Curso / Certificado', description: 'Cursos extras e certificações', icon: BookOpen, color: 'orange' },
  { type: 'skill', label: 'Competência', description: 'Habilidade técnica ou pessoal', icon: Star, color: 'rose' },
];

const COLOR_CLASSES: Record<string, string> = {
  blue: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  emerald: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  purple: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  orange: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  rose: 'bg-rose-500/20 text-rose-400 border-rose-500/30',
};

const inputCls = 'w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-yellow-400 font-bold text-sm';

function SortableItem({ id, children }: { id: string; children: React.ReactNode }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  const style = { transform: CSS.Transform.toString(transform), transition, zIndex: isDragging ? 50 : 'auto', opacity: isDragging ? 0.5 : 1 };
  return (
    <div ref={setNodeRef} style={style} className="relative group">
      <div {...attributes} {...listeners} className="absolute -left-8 top-1/2 -translate-y-1/2 p-2 cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity">
        <GripVertical className="text-slate-500" size={16} />
      </div>
      {children}
    </div>
  );
}

export default function ResumeBuilderPage() {
  const router = useRouter();
  const { currentUser, addExperienceWithAutoArea, addEducation, updateUser } = useStore();
  const [activeTab, setActiveTab] = useState<'content' | 'style'>('content');
  const [isParsing, setIsParsing] = useState(false);
  const [isSavingToProfile, setIsSavingToProfile] = useState(false);

  // Resume Data State
  const [name, setName] = useState(currentUser?.name || '');
  const [profession, setProfession] = useState(currentUser?.headline || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [availableSince, setAvailableSince] = useState('');
  const [photoUrl, setPhotoUrl] = useState(currentUser?.photo_url || '');

  const [summary, setSummary] = useState(currentUser?.summary || '');
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [education, setEducation] = useState<Education[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [addedSections, setAddedSections] = useState<SectionType[]>(['summary', 'experience', 'education']);

  // Theme State
  const [theme, setTheme] = useState<(ResumeTheme & { fontFamily?: string }) | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // Modals
  const [activeModal, setActiveModal] = useState<SectionType | null>(null);
  const [draftSummary, setDraftSummary] = useState('');

  const sensors = useSensors(useSensor(PointerSensor), useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }));

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setAddedSections((items) => {
        const oldIndex = items.indexOf(active.id as SectionType);
        const newIndex = items.indexOf(over.id as SectionType);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const generateTheme = useCallback(async () => {
    if (!name || !profession) return;
    setIsGenerating(true);
    try {
      const res = await fetch('/api/resume/theme', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, profession }),
      });
      const data = await res.json();
      setTheme({ ...data, fontFamily: 'Inter' });
    } catch {
      toast.error('Erro ao gerar tema.');
    } finally {
      setIsGenerating(false);
    }
  }, [name, profession]);

  useEffect(() => {
    if (name && profession && !theme) {
      generateTheme();
    }
  }, [name, profession, theme, generateTheme]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsParsing(true);
    const toastId = toast.loading('Analisando currículo com IA...');

    try {
      let text = '';
      if (file.type === 'application/pdf') {
        const pdfjs = await import('pdfjs-dist');
        pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.mjs`;
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjs.getDocument(arrayBuffer).promise;
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const content = await page.getTextContent();
          text += content.items.map((item: any) => item.str).join(' ');
        }
      } else if (file.type.startsWith('image/')) {
        const { createWorker } = await import('tesseract.js');
        const worker = await createWorker('por');
        const ret = await worker.recognize(file);
        text = ret.data.text;
        await worker.terminate();
      }

      if (!text) throw new Error('Não foi possível extrair texto do arquivo.');

      const parsed = await parseResumeText({ text });
      
      if (parsed.name) setName(parsed.name);
      if (parsed.profession) setProfession(parsed.profession);
      if (parsed.email) setEmail(parsed.email);
      if (parsed.phone) setPhone(parsed.phone);
      if (parsed.summary) setSummary(parsed.summary);
      if (parsed.experiences) setExperiences(parsed.experiences);
      if (parsed.education) setEducation(parsed.education);
      
      toast.success('Dados importados! Revise abaixo.', { id: toastId });
    } catch (err) {
      console.error(err);
      toast.error('Falha ao importar.', { id: toastId });
    } finally {
      setIsParsing(false);
    }
  };

  const handleSaveToProfile = async () => {
    if (!currentUser) return;
    setIsSavingToProfile(true);
    const toastId = toast.loading('Sincronizando com seu perfil...');

    try {
      // 1. Atualiza dados básicos
      await updateUser({
        name,
        headline: profession,
        summary,
        phone,
        email
      });

      // 2. Adiciona experiências
      for (const exp of experiences) {
        await addExperienceWithAutoArea({
          user_id: currentUser.id,
          company_name: exp.company,
          role: exp.role,
          company_logo: `https://picsum.photos/seed/${Math.random()}/100/100`,
          start_date: new Date().toISOString(), // Idealmente extrair data real, mas simplificando
          end_date: null,
          description: '',
        });
      }

      // 3. Adiciona Educação
      for (const edu of education) {
        await addEducation({
          user_id: currentUser.id,
          institution: edu.institution,
          course: edu.course,
          start_date: new Date().toISOString(),
          end_date: null,
        });
      }

      toast.success('Perfil atualizado com sucesso!', { id: toastId });
      router.push('/profile');
    } catch (err) {
      console.error(err);
      toast.error('Erro ao salvar no perfil.', { id: toastId });
    } finally {
      setIsSavingToProfile(false);
    }
  };

  const exportPDF = useCallback(async () => {
    setIsExporting(true);
    try {
      const html2pdf = (await import('html2pdf.js')).default;
      const element = document.getElementById('resume-template');
      if (!element) return;
      await html2pdf().set({
        margin: 0,
        filename: `curriculo-${name.toLowerCase().replace(/\s+/g, '-')}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, allowTaint: true, logging: false },
        jsPDF: { unit: 'px', format: [794, 1123], orientation: 'portrait' },
      }).from(element).save();
    } catch (e) {
      console.error(e);
    } finally {
      setIsExporting(false);
    }
  }, [name]);

  const resumeData: ResumeData = {
    name, firstName: name.split(' ')[0] || '', lastName: name.split(' ').slice(1).join(' ') || '',
    profession, phone, email, availableSince, photoUrl: photoUrl || undefined,
    summary, experiences, education, courses, skills, sectionsOrder: addedSections
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col md:flex-row">
      <div className="w-full md:w-[400px] h-screen overflow-y-auto border-r border-white/10 bg-black/20 shrink-0 custom-scrollbar">
        <div className="sticky top-0 z-20 bg-slate-900/90 backdrop-blur-md border-b border-white/10 p-4">
          <div className="flex items-center justify-between mb-4">
            <Link href="/profile" className="p-2 hover:bg-white/10 rounded-full transition-colors"><ArrowLeft size={20} /></Link>
            <h1 className="text-sm font-black uppercase tracking-widest">Revisão de Importação</h1>
            <button onClick={generateTheme} disabled={!name || !profession || isGenerating} className="p-2 text-yellow-400 hover:scale-110 transition-transform disabled:opacity-30">
              {isGenerating ? <Loader2 className="animate-spin" size={20} /> : <Wand2 size={20} />}
            </button>
          </div>
          <div className="flex p-1 bg-white/5 rounded-xl">
            <button onClick={() => setActiveTab('content')} className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${activeTab === 'content' ? 'bg-white text-slate-900 shadow-lg' : 'text-slate-400'}`}>Conteúdo</button>
            <button onClick={() => setActiveTab('style')} className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${activeTab === 'style' ? 'bg-white text-slate-900 shadow-lg' : 'text-slate-400'}`}>Estilo</button>
          </div>
        </div>

        <div className="p-6 space-y-8">
          {activeTab === 'content' ? (
            <>
              <div className="bg-blue-600/10 border border-blue-500/20 p-6 rounded-3xl text-center">
                <label className="flex flex-col items-center gap-2 cursor-pointer group">
                  <Upload className="text-blue-400 group-hover:scale-110 transition-transform w-8 h-8" />
                  <span className="text-xs font-black uppercase text-blue-400">Importar Novo Arquivo</span>
                  <input type="file" accept=".pdf,image/*" className="hidden" onChange={handleFileUpload} disabled={isParsing} />
                  {isParsing && <Loader2 className="animate-spin w-4 h-4 text-blue-400 mt-2" />}
                </label>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-2 text-yellow-400 mb-2">
                  <User size={18} /> <h2 className="text-xs font-black uppercase">Dados Extraídos</h2>
                </div>
                <input value={name} onChange={e => setName(e.target.value)} placeholder="Nome Completo" className={inputCls} />
                <input value={profession} onChange={e => setProfession(e.target.value)} placeholder="Profissão" className={inputCls} />
                <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="WhatsApp" className={inputCls} />
                <input value={email} onChange={e => setEmail(e.target.value)} placeholder="E-mail" className={inputCls} />
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 text-blue-400"><Layers size={18} /> <h2 className="text-xs font-black uppercase">Configuração Visual</h2></div>
                </div>
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                  <SortableContext items={addedSections} strategy={verticalListSortingStrategy}>
                    <div className="space-y-2">
                      {addedSections.map((type) => {
                        const opt = SECTION_OPTIONS.find(o => o.type === type)!;
                        const Icon = opt.icon;
                        return (
                          <SortableItem key={type} id={type}>
                            <div className="flex items-center gap-3 p-3 bg-white/5 border border-white/10 rounded-xl">
                              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${COLOR_CLASSES[opt.color]}`}><Icon size={14} /></div>
                              <span className="flex-1 text-xs font-bold">{opt.label}</span>
                              <button onClick={() => { setActiveModal(type); if(type==='summary') setDraftSummary(summary); }} className="text-slate-500 hover:text-white"><Wand2 size={14} /></button>
                            </div>
                          </SortableItem>
                        );
                      })}
                    </div>
                  </SortableContext>
                </DndContext>
              </div>
              
              <div className="pt-6">
                <button 
                  onClick={handleSaveToProfile}
                  disabled={isSavingToProfile || !name}
                  className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 text-white font-black rounded-2xl shadow-xl flex items-center justify-center gap-3 transition-all disabled:opacity-50"
                >
                  {isSavingToProfile ? <Loader2 className="animate-spin" /> : <Save />}
                  Confirmar e Salvar no Perfil
                </button>
              </div>
            </>
          ) : (
            <div className="space-y-8">
              {theme && (
                <>
                  <div className="space-y-4">
                    <h3 className="text-xs font-black uppercase text-slate-500">Tipografia</h3>
                    <select 
                      value={theme.fontFamily || 'Inter'} 
                      onChange={(e) => setTheme({...theme, fontFamily: e.target.value})}
                      className={inputCls}
                    >
                      {GOOGLE_FONTS.map(f => <option key={f} value={f}>{f}</option>)}
                    </select>
                  </div>
                  <div className="space-y-4">
                    <h3 className="text-xs font-black uppercase text-slate-500">Cor Primária</h3>
                    <ChromePicker color={theme.primaryColor} onChange={(c) => setTheme({...theme, primaryColor: c.hex})} disableAlpha styles={{ default: { picker: { width: '100%', background: 'transparent', boxShadow: 'none' } } }} />
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 h-screen overflow-y-auto bg-slate-800 p-4 md:p-12 flex justify-center custom-scrollbar">
        <div className="w-full max-w-[794px] min-h-[1123px] h-fit bg-white shadow-2xl relative overflow-hidden origin-top scale-[0.6] sm:scale-[0.8] md:scale-100 mb-20">
          {theme ? (
            <ResumeTemplate data={resumeData} theme={theme} profileUrl={email ? `mailto:${email}` : undefined} />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-300 p-20 text-center">
              <FileCode size={64} className="mb-6 opacity-20" />
              <h2 className="text-2xl font-black text-slate-900">Pré-visualização</h2>
              <p className="text-slate-500 font-medium mt-2">Aguardando dados para gerar o visual...</p>
            </div>
          )}
        </div>
        {theme && (
          <div className="fixed bottom-8 right-8 flex gap-4">
            <button onClick={exportPDF} disabled={isExporting} className="px-8 py-4 bg-white text-slate-900 font-black rounded-full shadow-2xl flex items-center gap-3 hover:scale-105 transition-all">
              {isExporting ? <Loader2 className="animate-spin" /> : <Download />} Baixar PDF
            </button>
          </div>
        )}
      </div>

      <AnimatePresence>
        {activeModal && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/70 backdrop-blur-md p-4" onClick={() => setActiveModal(null)}>
            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="bg-slate-900 w-full max-w-md rounded-3xl p-6 border border-white/10" onClick={e => e.stopPropagation()}>
              <h3 className="text-lg font-black mb-6">Editar {SECTION_OPTIONS.find(o => o.type === activeModal)?.label}</h3>
              {activeModal === 'summary' && <textarea rows={6} value={draftSummary} onChange={e => setDraftSummary(e.target.value)} className={inputCls + ' resize-none'} />}
              <div className="flex gap-4 mt-8">
                <button onClick={() => setActiveModal(null)} className="flex-1 py-3 font-bold text-slate-400">Cancelar</button>
                <button onClick={() => { if(activeModal==='summary') setSummary(draftSummary); setActiveModal(null); }} className="flex-1 py-3 bg-white text-slate-900 font-black rounded-xl">Salvar</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
      `}</style>
    </div>
  );
}
