
'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import {
  Loader2, Plus, Trash2, Wand2, Download, ArrowLeft, X,
  User, Briefcase, GraduationCap, BookOpen, Star, FileText, ChevronRight,
  Settings2, Palette, Layers, GripVertical
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import type { ResumeTheme } from '@/src/ai/flows/generate-resume-theme-flow';
import type { ResumeData } from '@/components/ResumeTemplate';
import { ChromePicker } from 'react-color';
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

const ResumeTemplate = dynamic(() => import('@/components/ResumeTemplate'), { ssr: false });

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
const labelCls = 'block text-sm font-bold text-slate-300 mb-1';

function SortableItem({ id, children }: { id: string; children: React.ReactNode }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 'auto',
    opacity: isDragging ? 0.5 : 1,
  };

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
  const previewRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState<'content' | 'style'>('content');

  const [name, setName] = useState('');
  const [profession, setProfession] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [availableSince, setAvailableSince] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [photoPreview, setPhotoPreview] = useState('');

  const [summary, setSummary] = useState('');
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [education, setEducation] = useState<Education[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);

  const [addedSections, setAddedSections] = useState<SectionType[]>([]);
  const [showPicker, setShowPicker] = useState(false);
  const [activeModal, setActiveModal] = useState<SectionType | null>(null);

  const [isGenerating, setIsGenerating] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [theme, setTheme] = useState<ResumeTheme | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [error, setError] = useState('');

  const [draftExp, setDraftExp] = useState<Experience>({ company: '', role: '', duration: '' });
  const [draftEdu, setDraftEdu] = useState<Education>({ institution: '', course: '', period: '' });
  const [draftCourse, setDraftCourse] = useState<Course>({ name: '', institution: '', year: '' });
  const [draftSkill, setDraftSkill] = useState<Skill>({ name: '', description: '' });
  const [draftSummary, setDraftSummary] = useState('');

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

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
    setError('');
    try {
      const res = await fetch('/api/resume/theme', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, profession }),
      });
      if (!res.ok) throw new Error('API error');
      const data = await res.json();
      setTheme(data);
      setShowPreview(true);
    } catch {
      setError('Erro ao gerar tema. Tente novamente.');
    } finally {
      setIsGenerating(false);
    }
  }, [name, profession]);

  const exportPDF = useCallback(async () => {
    setIsExporting(true);
    try {
      const html2pdf = (await import('html2pdf.js')).default;
      const element = document.getElementById('resume-template');
      if (!element) return;
      await html2pdf()
        .set({
          margin: 0,
          filename: `curriculo-${name.toLowerCase().replace(/\s+/g, '-')}.pdf`,
          image: { type: 'jpeg', quality: 0.98 },
          html2canvas: { scale: 2, useCORS: true, allowTaint: true, logging: false, imageTimeout: 0 },
          jsPDF: { unit: 'px', format: [794, 1123], orientation: 'portrait' },
        })
        .from(element)
        .save();
    } catch (e) {
      console.error(e);
    } finally {
      setIsExporting(false);
    }
  }, [name]);

  const resumeData: ResumeData = {
    name,
    firstName: name.split(' ')[0] || '',
    lastName: name.split(' ').slice(1).join(' ') || '',
    profession,
    phone,
    email,
    availableSince,
    photoUrl: photoUrl || undefined,
    summary,
    experiences,
    education,
    courses,
    skills,
    sectionsOrder: addedSections
  };

  const openSection = (type: SectionType) => {
    setShowPicker(false);
    setActiveModal(type);
  };

  const saveSection = () => {
    if (activeModal === 'summary') {
      setSummary(draftSummary);
      if (!addedSections.includes('summary')) setAddedSections((p) => [...p, 'summary']);
    } else if (activeModal === 'experience') {
      if (!draftExp.company || !draftExp.role) return;
      setExperiences((p) => [...p, draftExp]);
      if (!addedSections.includes('experience')) setAddedSections((p) => [...p, 'experience']);
    } else if (activeModal === 'education') {
      if (!draftEdu.institution) return;
      setEducation((p) => [...p, draftEdu]);
      if (!addedSections.includes('education')) setAddedSections((p) => [...p, 'education']);
    } else if (activeModal === 'course') {
      if (!draftCourse.name) return;
      setCourses((p) => [...p, draftCourse]);
      if (!addedSections.includes('course')) setAddedSections((p) => [...p, 'course']);
    } else if (activeModal === 'skill') {
      if (!draftSkill.name) return;
      setSkills((p) => [...p, draftSkill]);
      if (!addedSections.includes('skill')) setAddedSections((p) => [...p, 'skill']);
    }
    setActiveModal(null);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col md:flex-row">
      
      {/* Sidebar Controls */}
      <div className="w-full md:w-[400px] h-screen overflow-y-auto border-r border-white/10 bg-black/20 shrink-0 custom-scrollbar">
        <div className="sticky top-0 z-20 bg-slate-900/90 backdrop-blur-md border-b border-white/10 p-4">
          <div className="flex items-center justify-between mb-4">
            <Link href="/" className="p-2 hover:bg-white/10 rounded-full transition-colors"><ArrowLeft size={20} /></Link>
            <h1 className="text-sm font-black uppercase tracking-widest">Builder</h1>
            <button onClick={generateTheme} disabled={!name || !profession || isGenerating} className="p-2 text-yellow-400 hover:scale-110 transition-transform disabled:opacity-30">
              {isGenerating ? <Loader2 className="animate-spin" size={20} /> : <Wand2 size={20} />}
            </button>
          </div>
          <div className="flex p-1 bg-white/5 rounded-xl">
            <button onClick={() => setActiveTab('content')} className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${activeTab === 'content' ? 'bg-white text-slate-900 shadow-lg' : 'text-slate-400'}`}>
              <Layers size={14} /> Conteúdo
            </button>
            <button onClick={() => setActiveTab('style')} className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${activeTab === 'style' ? 'bg-white text-slate-900 shadow-lg' : 'text-slate-400'}`}>
              <Palette size={14} /> Estilo
            </button>
          </div>
        </div>

        <div className="p-6 space-y-8">
          {activeTab === 'content' ? (
            <>
              {/* Dados Pessoais */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-yellow-400 mb-2">
                  <User size={18} /> <h2 className="text-xs font-black uppercase">Dados Pessoais</h2>
                </div>
                <div className="space-y-4">
                  <input value={name} onChange={e => setName(e.target.value)} placeholder="Nome Completo" className={inputCls} />
                  <input value={profession} onChange={e => setProfession(e.target.value)} placeholder="Profissão" className={inputCls} />
                  <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="WhatsApp" className={inputCls} />
                  <input value={email} onChange={e => setEmail(e.target.value)} placeholder="E-mail" className={inputCls} />
                </div>
              </div>

              {/* Seções Reordenáveis */}
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 text-blue-400">
                    <Layers size={18} /> <h2 className="text-xs font-black uppercase">Seções</h2>
                  </div>
                  <button onClick={() => setShowPicker(true)} className="p-1 hover:bg-white/10 rounded-lg text-slate-400"><Plus size={16} /></button>
                </div>
                
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                  <SortableContext items={addedSections} strategy={verticalListSortingStrategy}>
                    <div className="space-y-2">
                      {addedSections.map((type) => {
                        const opt = SECTION_OPTIONS.find(o => o.type === type)!;
                        const Icon = opt.icon;
                        return (
                          <SortableItem key={type} id={type}>
                            <div className="flex items-center gap-3 p-3 bg-white/5 border border-white/10 rounded-xl hover:border-white/20 transition-all">
                              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${COLOR_CLASSES[opt.color]}`}>
                                <Icon size={14} />
                              </div>
                              <span className="flex-1 text-xs font-bold">{opt.label}</span>
                              <button onClick={() => openSection(type)} className="text-slate-500 hover:text-white"><Settings2 size={14} /></button>
                            </div>
                          </SortableItem>
                        );
                      })}
                    </div>
                  </SortableContext>
                </DndContext>
              </div>
            </>
          ) : (
            /* Style Tab */
            <div className="space-y-6">
              {theme && (
                <>
                  <div className="space-y-4">
                    <h3 className="text-xs font-black uppercase text-slate-500">Cores do Tema</h3>
                    <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-xs font-bold">Cor Primária</span>
                        <div className="w-8 h-8 rounded-full shadow-lg border border-white/20" style={{ backgroundColor: theme.primaryColor }} />
                      </div>
                      <ChromePicker 
                        color={theme.primaryColor} 
                        onChange={(c) => setTheme({...theme, primaryColor: c.hex})}
                        disableAlpha
                        styles={{ default: { picker: { width: '100%', background: 'transparent', boxShadow: 'none' } } }}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xs font-black uppercase text-slate-500">Layout</h3>
                    <div className="grid grid-cols-2 gap-2">
                      <button onClick={() => setTheme({...theme, layoutStyle: 'vibrant'})} className={`p-3 rounded-xl border text-xs font-bold ${theme.layoutStyle === 'vibrant' ? 'bg-white text-slate-900 border-white' : 'bg-white/5 border-white/10 text-slate-400'}`}>Vibrante</button>
                      <button onClick={() => setTheme({...theme, layoutStyle: 'sidebar'})} className={`p-3 rounded-xl border text-xs font-bold ${theme.layoutStyle === 'sidebar' ? 'bg-white text-slate-900 border-white' : 'bg-white/5 border-white/10 text-slate-400'}`}>Sidebar</button>
                    </div>
                  </div>
                </>
              )}
              {!theme && <p className="text-center py-10 text-slate-500 text-xs font-bold italic">Gere um tema com IA primeiro para customizar as cores.</p>}
            </div>
          )}
        </div>
      </div>

      {/* Main Preview Area */}
      <div className="flex-1 h-screen overflow-y-auto bg-slate-800 p-4 md:p-12 flex justify-center custom-scrollbar">
        <div className="w-full max-w-[794px] min-h-[1123px] h-fit bg-white shadow-2xl relative overflow-hidden origin-top scale-[0.6] sm:scale-[0.8] md:scale-100 mb-20">
          {theme ? (
            <ResumeTemplate data={resumeData} theme={theme} profileUrl={email ? `mailto:${email}` : undefined} />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-300 p-20 text-center">
              <FileText size={64} className="mb-6 opacity-20" />
              <h2 className="text-2xl font-black text-slate-900">Seu Currículo Aqui</h2>
              <p className="text-slate-500 font-medium mt-2">Preencha os dados e clique em "Gerar com IA" para ver a mágica acontecer.</p>
            </div>
          )}
        </div>

        {/* Floating Actions */}
        {theme && (
          <div className="fixed bottom-8 right-8 flex gap-4">
            <button onClick={exportPDF} disabled={isExporting} className="px-8 py-4 bg-green-500 hover:bg-green-400 text-white font-black rounded-full shadow-2xl flex items-center gap-3 transition-all">
              {isExporting ? <Loader2 className="animate-spin" /> : <Download />}
              Baixar PDF
            </button>
          </div>
        )}
      </div>

      {/* Picker Modal */}
      <AnimatePresence>
        {showPicker && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md p-4" onClick={() => setShowPicker(false)}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-slate-900 w-full max-w-md rounded-3xl p-6 border border-white/10" onClick={e => e.stopPropagation()}>
              <h3 className="text-lg font-black mb-4">Adicionar Seção</h3>
              <div className="grid grid-cols-1 gap-2">
                {SECTION_OPTIONS.map(opt => (
                  <button key={opt.type} onClick={() => openSection(opt.type)} className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 hover:bg-white/10 transition-all border border-white/10 text-left">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${COLOR_CLASSES[opt.color]}`}><opt.icon size={20} /></div>
                    <div><div className="font-black text-sm">{opt.label}</div><div className="text-xs text-slate-500">{opt.description}</div></div>
                  </button>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Editor Modals */}
      <AnimatePresence>
        {activeModal && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/70 backdrop-blur-md p-4" onClick={() => setActiveModal(null)}>
            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="bg-slate-900 w-full max-w-md rounded-3xl p-6 border border-white/10" onClick={e => e.stopPropagation()}>
              <h3 className="text-lg font-black mb-6">Editar {SECTION_OPTIONS.find(o => o.type === activeModal)?.label}</h3>
              {activeModal === 'summary' && <textarea rows={6} value={draftSummary} onChange={e => setDraftSummary(e.target.value)} className={inputCls + ' resize-none'} />}
              {activeModal === 'experience' && (
                <div className="space-y-4">
                  <input value={draftExp.company} onChange={e => setDraftExp({...draftExp, company: e.target.value})} placeholder="Empresa" className={inputCls} />
                  <input value={draftExp.role} onChange={e => setDraftExp({...draftExp, role: e.target.value})} placeholder="Cargo" className={inputCls} />
                  <input value={draftExp.duration} onChange={e => setDraftExp({...draftExp, duration: e.target.value})} placeholder="Período" className={inputCls} />
                </div>
              )}
              {/* Adicionar outros conforme necessário */}
              <div className="flex gap-4 mt-8">
                <button onClick={() => setActiveModal(null)} className="flex-1 py-3 font-bold text-slate-400">Cancelar</button>
                <button onClick={saveSection} className="flex-1 py-3 bg-white text-slate-900 font-black rounded-xl">Salvar</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.2); }
      `}</style>
    </div>
  );
}
