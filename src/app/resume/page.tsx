'use client';

import { useState, useRef, useCallback, useEffect, Suspense } from 'react';
import {
  Loader2, Plus, Trash2, Wand2, Download, ArrowLeft, X,
  User, Briefcase, GraduationCap, Star, FileText,
  Layers, GripVertical, Save, Check, Sparkles, BrainCircuit, ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import type { ResumeTheme } from '@/src/ai/flows/generate-resume-theme-flow';
import type { ResumeData } from '@/components/ResumeTemplate';
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
import { calcDuration } from '@/lib/utils';

const ResumeTemplate = dynamic(() => import('@/components/ResumeTemplate'), { ssr: false });

type SectionType = 'summary' | 'experience' | 'education' | 'skill';

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

function ResumeBuilderContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isImported = searchParams.get('imported') === 'true';
  const isSmartMode = searchParams.get('smart') === 'true';
  
  const { currentUser, addExperienceWithAutoArea, addEducation, addSkillToRelevantAreas } = useStore();
  
  const [activeTab, setActiveTab] = useState<'content' | 'style' | 'prep'>('content');
  const [name, setName] = useState(currentUser?.name || '');
  const [profession, setProfession] = useState(currentUser?.headline || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [availableSince, setAvailableSince] = useState('');
  const [photoUrl, setPhotoUrl] = useState(currentUser?.photo_url || '');

  const [summary, setSummary] = useState(currentUser?.summary || '');
  const [experiences, setExperiences] = useState<any[]>([]);
  const [education, setEducation] = useState<any[]>([]);
  const [skills, setSkills] = useState<any[]>([]);
  const [addedSections, setAddedSections] = useState<SectionType[]>(['summary', 'experience', 'education', 'skill']);
  const [interviewQuestions, setInterviewQuestions] = useState<any[]>([]);

  const [theme, setTheme] = useState<ResumeTheme | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const key = isImported ? 'career_canvas_import_data' : (isSmartMode ? 'career_canvas_smart_match' : null);
    if (!key) return;

    const storedData = localStorage.getItem(key);
    if (storedData) {
      try {
        const data = JSON.parse(storedData);
        const parsed = data.parsedData || data;

        if (parsed.name) setName(parsed.name);
        if (parsed.profession) setProfession(parsed.profession);
        if (parsed.email) setEmail(parsed.email);
        if (parsed.phone) setPhone(parsed.phone);
        if (parsed.summary) setSummary(parsed.summary);
        
        if (parsed.experiences) setExperiences(parsed.experiences);
        if (parsed.education) setEducation(parsed.education);
        if (parsed.skills) setSkills(parsed.skills);
        
        if (data.matchResult?.interviewQuestions) {
          setInterviewQuestions(data.matchResult.interviewQuestions);
        }

        toast.success('Dados detectados carregados para visualização!');
      } catch (e) {
        console.error('Erro ao carregar dados:', e);
      }
    }
  }, [isImported, isSmartMode]);

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
      setTheme(data);
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

  const handleSaveToProfile = async () => {
    if (!currentUser) return;
    setIsSaving(true);
    const toastId = toast.loading('Salvando dados no seu perfil...');
    
    try {
      // Salva experiências
      for (const exp of experiences) {
        await addExperienceWithAutoArea({
          user_id: currentUser.id,
          company_name: exp.company,
          role: exp.role,
          company_logo: `https://picsum.photos/seed/${exp.company}/100/100`,
          start_date: new Date().toISOString(), // Ideal seria parsear a duration do currículo
          end_date: null,
          description: '',
        });
      }

      // Salva educação
      for (const edu of education) {
        await addEducation({
          user_id: currentUser.id,
          institution: edu.institution,
          course: edu.course,
          start_date: new Date().toISOString(),
          end_date: null,
        });
      }

      // Salva skills
      for (const skill of skills) {
        // Encontra o ID da skill no nosso banco ou ignora se não existir (no MVP)
        // addSkillToRelevantAreas requer ID e Nome
      }

      toast.success('Seu perfil foi atualizado com as novas informações!', { id: toastId });
      router.push('/profile');
    } catch (err) {
      toast.error('Erro ao salvar no perfil.', { id: toastId });
    } finally {
      setIsSaving(false);
    }
  };

  const resumeData: ResumeData = {
    name, firstName: name.split(' ')[0] || '', lastName: name.split(' ').slice(1).join(' ') || '',
    profession, phone, email, availableSince, photoUrl: photoUrl || undefined,
    summary, experiences, education: education.map(e => ({ ...e, period: 'Concluído' })), skills: skills.map(s => ({ name: s.name, description: '' })), sectionsOrder: addedSections
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col md:flex-row">
      <div className="w-full md:w-[400px] h-screen overflow-y-auto border-r border-white/10 bg-black/20 shrink-0 custom-scrollbar">
        <div className="sticky top-0 z-20 bg-slate-900/90 backdrop-blur-md border-b border-white/10 p-4">
          <div className="flex items-center justify-between mb-4">
            <Link href="/profile" className="p-2 hover:bg-white/10 rounded-full transition-colors"><ArrowLeft size={20} /></Link>
            <h1 className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
              <Sparkles size={14} className="text-blue-400" /> Preview de Dados
            </h1>
            <button onClick={generateTheme} disabled={!name || !profession || isGenerating} className="p-2 text-yellow-400 hover:scale-110 transition-transform">
              {isGenerating ? <Loader2 className="animate-spin" size={20} /> : <Wand2 size={20} />}
            </button>
          </div>
          <div className="flex p-1 bg-white/5 rounded-xl">
            <button onClick={() => setActiveTab('content')} className={`flex-1 py-2 text-[10px] font-black uppercase rounded-lg transition-all ${activeTab === 'content' ? 'bg-white text-slate-900 shadow-lg' : 'text-slate-400'}`}>Conteúdo</button>
            <button onClick={() => setActiveTab('prep')} className={`flex-1 py-2 text-[10px] font-black uppercase rounded-lg transition-all ${activeTab === 'prep' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400'}`}>Estudo IA</button>
          </div>
        </div>

        <div className="p-6 space-y-8">
          {activeTab === 'content' && (
            <>
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-yellow-400 mb-2">
                  <User size={18} /> <h2 className="text-xs font-black uppercase">Dados Pessoais</h2>
                </div>
                <input value={name} onChange={e => setName(e.target.value)} placeholder="Nome" className={inputCls} />
                <input value={profession} onChange={e => setProfession(e.target.value)} placeholder="Profissão" className={inputCls} />
                <input value={email} onChange={e => setEmail(e.target.value)} placeholder="E-mail" className={inputCls} />
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-2 text-blue-400 mb-2">
                  <Briefcase size={18} /> <h2 className="text-xs font-black uppercase">Experiências Detectadas</h2>
                </div>
                {experiences.map((exp, i) => (
                  <div key={i} className="p-3 bg-white/5 border border-white/10 rounded-xl">
                    <p className="text-xs font-black uppercase tracking-tight">{exp.role}</p>
                    <p className="text-[10px] font-bold text-slate-500 uppercase">{exp.company}</p>
                  </div>
                ))}
              </div>

              <div className="pt-6">
                <button 
                  onClick={handleSaveToProfile} 
                  disabled={isSaving}
                  className="w-full py-4 bg-emerald-600 text-white font-black rounded-2xl shadow-xl hover:bg-emerald-500 flex items-center justify-center gap-2 transition-all"
                >
                  {isSaving ? <Loader2 className="animate-spin" /> : <Save />}
                  Confirmar e Salvar no Perfil
                </button>
              </div>
            </>
          )}

          {activeTab === 'prep' && (
            <div className="space-y-6">
              {interviewQuestions.length > 0 ? (
                interviewQuestions.map((item, idx) => (
                  <div key={idx} className="p-4 bg-white/5 border border-white/10 rounded-2xl">
                    <h4 className="text-xs font-black text-blue-400 mb-2 uppercase">{item.question}</h4>
                    <p className="text-[10px] text-slate-400 italic">Dica: {item.advice}</p>
                  </div>
                ))
              ) : (
                <p className="text-center text-slate-500 text-xs py-10">IA gerará perguntas se você fornecer os detalhes da vaga.</p>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 h-screen overflow-y-auto bg-slate-800 p-4 md:p-12 flex justify-center custom-scrollbar">
        <div className="w-full max-w-[794px] min-h-[1123px] h-fit bg-white shadow-2xl relative overflow-hidden origin-top scale-[0.6] sm:scale-[0.8] md:scale-100">
          {theme ? (
            <ResumeTemplate data={resumeData} theme={theme} />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-300">
              <Loader2 className="animate-spin mb-4" />
              <p className="font-bold">Gerando Preview Visual...</p>
            </div>
          )}
        </div>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
      `}</style>
    </div>
  );
}

export default function ResumeBuilderPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
      </div>
    }>
      <ResumeBuilderContent />
    </Suspense>
  );
}
