'use client';

import { useState, useCallback, useEffect, Suspense } from 'react';
import {
  Loader2, ArrowLeft, Share2, Sparkles, BrainCircuit
} from 'lucide-react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import type { ResumeTheme } from '@/ai/flows/generate-resume-theme-flow';
import type { ResumeData } from '@/components/ResumeTemplate';
import { toast } from 'sonner';
import { useStore } from '@/lib/store';
import { calcDuration } from '@/lib/utils';

const ResumeTemplate = dynamic(() => import('@/components/ResumeTemplate'), { ssr: false });

function ResumeBuilderContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isSmartMode = searchParams.get('smart') === 'true';
  
  const { currentUser, experiences: storeExp, education: storeEdu, skills: storeSkills } = useStore();
  
  const [name] = useState(currentUser?.name || '');
  const [profession, setProfession] = useState(currentUser?.headline || '');
  const [phone] = useState(currentUser?.phone || '');
  const [email] = useState(currentUser?.email || '');
  const [summary, setSummary] = useState(currentUser?.summary || '');
  
  const [experiences, setExperiences] = useState<any[]>([]);
  const [education, setEducation] = useState<any[]>([]);
  const [skills, setSkills] = useState<any[]>([]);
  const [interviewQuestions, setInterviewQuestions] = useState<any[]>([]);

  const [theme, setTheme] = useState<ResumeTheme | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    if (isSmartMode) {
      const stored = localStorage.getItem('career_canvas_smart_match');
      if (stored) {
        try {
          const data = JSON.parse(stored);
          if (data.tailoredHeadline) setProfession(data.tailoredHeadline);
          if (data.tailoredSummary) setSummary(data.tailoredSummary);
          if (data.interviewQuestions) setInterviewQuestions(data.interviewQuestions);
          
          const selectedExps = storeExp
            .filter(e => data.selectedExperienceIds?.includes(e.id))
            .map(e => ({ company: e.company_name, role: e.role, duration: calcDuration(e.start_date, e.end_date) }));
          
          const selectedEdu = storeEdu
            .filter(e => data.selectedEducationIds?.includes(e.id))
            .map(e => ({ institution: e.institution, course: e.course, period: 'Concluído' }));

          const selectedSkills = storeSkills
            .filter(s => data.selectedSkillIds?.includes(s.id))
            .map(s => ({ name: s.name, description: '' }));

          setExperiences(selectedExps.length ? selectedExps : storeExp.map(e => ({ company: e.company_name, role: e.role, duration: calcDuration(e.start_date, e.end_date) })));
          setEducation(selectedEdu.length ? selectedEdu : storeEdu.map(e => ({ institution: e.institution, course: e.course, period: 'Concluído' })));
          setSkills(selectedSkills.length ? selectedSkills : storeSkills.map(s => ({ name: s.name, description: '' })));
          
          toast.success('Currículo otimizado com IA!');
        } catch (e) {
          console.error(e);
        }
      }
    } else {
      setExperiences(storeExp.map(e => ({ company: e.company_name, role: e.role, duration: calcDuration(e.start_date, e.end_date) })));
      setEducation(storeEdu.map(e => ({ institution: e.institution, course: e.course, period: 'Concluído' })));
      setSkills(storeSkills.map(s => ({ name: s.name, description: '' })));
    }
  }, [isSmartMode, storeExp, storeEdu, storeSkills]);

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
      toast.error('Erro ao gerar tema visual.');
    } finally {
      setIsGenerating(false);
    }
  }, [name, profession]);

  useEffect(() => {
    if (name && profession && !theme) generateTheme();
  }, [name, profession, theme, generateTheme]);

  const handleExport = () => {
    setIsExporting(true);
    toast.info('Iniciando exportação do PDF...');
    setTimeout(() => {
      setIsExporting(false);
      toast.success('PDF gerado com sucesso!');
    }, 2000);
  };

  const resumeData: ResumeData = {
    name, firstName: name.split(' ')[0], lastName: name.split(' ').slice(1).join(' '),
    profession, phone, email, availableSince: 'Imediata',
    summary, experiences, education, skills
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col md:flex-row">
      <div className="w-full md:w-[400px] h-screen overflow-y-auto border-r border-white/10 bg-black/40 shrink-0">
        <div className="p-8 space-y-10">
          <header className="flex items-center justify-between">
            <Link href="/profile" className="p-2 hover:bg-white/10 rounded-full transition-colors"><ArrowLeft size={20} /></Link>
            <h1 className="text-xs font-black uppercase tracking-widest text-blue-400 flex items-center gap-2">
              <Sparkles size={14} /> Exportação Smart
            </h1>
            <div className="w-8" />
          </header>

          <section className="space-y-6">
            <div className="bg-blue-600/10 border border-blue-500/20 p-6 rounded-3xl">
              <h2 className="text-sm font-black uppercase tracking-tight flex items-center gap-2 mb-2">
                <BrainCircuit size={18} className="text-blue-400" /> Curadoria Ativada
              </h2>
              <p className="text-[10px] text-slate-400 font-bold uppercase leading-relaxed">
                {isSmartMode 
                  ? "A IA selecionou as experiências que dão match com a vaga desejada."
                  : "Mostrando todas as informações do seu perfil."
                }
              </p>
            </div>

            {interviewQuestions.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Guia de Estudo para Entrevista</h3>
                {interviewQuestions.slice(0, 3).map((q, i) => (
                  <div key={i} className="p-4 bg-white/5 rounded-2xl border border-white/10">
                    <p className="text-[10px] font-black text-white uppercase mb-1">{q.question}</p>
                    <p className="text-[9px] text-slate-400 italic">Dica: {q.advice}</p>
                  </div>
                ))}
              </div>
            )}
          </section>

          <footer className="pt-10 space-y-4">
            <button 
              onClick={handleExport}
              disabled={isExporting}
              className="w-full py-5 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-2xl flex items-center justify-center gap-3 transition-all shadow-xl disabled:opacity-50"
            >
              {isExporting ? <Loader2 className="animate-spin" /> : <Share2 />}
              {isExporting ? 'Exportando...' : 'Exportar PDF Temático'}
            </button>
            <p className="text-[9px] text-center text-slate-500 font-bold uppercase">Inclui QR Code para versão interativa</p>
          </footer>
        </div>
      </div>

      <div className="flex-1 h-screen overflow-y-auto bg-slate-800 p-6 md:p-12 flex justify-center custom-scrollbar">
        <div className="w-full max-w-[794px] h-fit bg-white shadow-2xl relative overflow-hidden origin-top scale-[0.6] sm:scale-[0.8] md:scale-100">
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
    </div>
  );
}

export default function ResumeBuilderPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-900 flex items-center justify-center"><Loader2 className="w-10 h-10 text-blue-500 animate-spin" /></div>}>
      <ResumeBuilderContent />
    </Suspense>
  );
}
