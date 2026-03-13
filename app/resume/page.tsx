'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import {
  Loader2, Plus, Trash2, Wand2, Download, ArrowLeft, X,
  User, Briefcase, GraduationCap, BookOpen, Star, FileText, ChevronRight,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import type { ResumeTheme } from '@/src/ai/flows/generate-resume-theme-flow';
import type { ResumeData } from '@/components/ResumeTemplate';

const ResumeTemplate = dynamic(() => import('@/components/ResumeTemplate'), { ssr: false });

type SectionType = 'summary' | 'experience' | 'education' | 'course' | 'skill';

type Experience = { company: string; role: string; duration: string };
type Education = { institution: string; course: string; period: string };
type Course = { name: string; institution: string; year: string };
type Skill = { name: string; description: string };

const SECTION_OPTIONS: { type: SectionType; label: string; description: string; icon: typeof Briefcase; color: string }[] = [
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

export default function ResumeBuilderPage() {
  const previewRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    if (activeModal === 'summary') setDraftSummary(summary);
    if (activeModal === 'experience') setDraftExp({ company: '', role: '', duration: '' });
    if (activeModal === 'education') setDraftEdu({ institution: '', course: '', period: '' });
    if (activeModal === 'course') setDraftCourse({ name: '', institution: '', year: '' });
    if (activeModal === 'skill') setDraftSkill({ name: '', description: '' });
  }, [activeModal]);

  const handlePhotoFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const result = ev.target?.result as string;
      setPhotoUrl(result);
      setPhotoPreview(result);
    };
    reader.readAsDataURL(file);
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

  const removeExperience = (i: number) => setExperiences((p) => p.filter((_, idx) => idx !== i));
  const removeEducation = (i: number) => setEducation((p) => p.filter((_, idx) => idx !== i));
  const removeCourse = (i: number) => setCourses((p) => p.filter((_, idx) => idx !== i));
  const removeSkill = (i: number) => setSkills((p) => p.filter((_, idx) => idx !== i));

  const generateTheme = useCallback(async () => {
    if (!name || !profession) return;
    setIsGenerating(true);
    setError('');
    try {
      const res = await fetch('/api/resume/theme', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          profession,
          experiences: experiences.map((e) => `${e.company} - ${e.role}`),
          skills: skills.map((s) => s.name),
        }),
      });
      if (!res.ok) throw new Error('API error');
      const data = await res.json();
      setTheme(data);
      setShowPreview(true);
    } catch {
      setError('Não foi possível gerar o tema. Verifique a chave de API nos secrets.');
    } finally {
      setIsGenerating(false);
    }
  }, [name, profession, experiences, skills]);

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
          html2canvas: { scale: 2, useCORS: true },
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
    summary: summary || theme?.professionalSummary,
    experiences,
    education,
    courses,
    skills,
  };

  const canGenerate = name.trim() && profession.trim();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      {/* Header */}
      <div className="border-b border-white/10 bg-black/20 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Voltar</span>
          </Link>
          <h1 className="text-lg font-black tracking-tight">✨ Construtor de Currículo</h1>
          <button
            onClick={generateTheme}
            disabled={!canGenerate || isGenerating}
            className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-yellow-400 to-orange-400 text-black font-black rounded-full hover:from-yellow-300 hover:to-orange-300 transition-all disabled:opacity-40 text-sm shadow-lg shadow-yellow-400/20"
          >
            {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
            {isGenerating ? 'Gerando...' : 'Gerar com IA'}
          </button>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 pb-32 pt-8 space-y-4">
        {/* Personal Info Card — always visible */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-xl bg-yellow-400/20 text-yellow-400 flex items-center justify-center">
              <User className="w-5 h-5" />
            </div>
            <h2 className="font-black text-yellow-400 text-lg">Dados Pessoais</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className={labelCls}>Nome Completo *</label>
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Gerlandia Santos de Jesus" className={inputCls} />
            </div>
            <div className="sm:col-span-2">
              <label className={labelCls}>Profissão / Área de Atuação * <span className="text-yellow-400">(base para o tema IA)</span></label>
              <input value={profession} onChange={(e) => setProfession(e.target.value)} placeholder="Ex: Auxiliar de Cozinha, Programador..." className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Telefone</label>
              <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="19 99985-2032" className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>E-mail</label>
              <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="seuemail@gmail.com" className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Disponível desde</label>
              <input value={availableSince} onChange={(e) => setAvailableSince(e.target.value)} placeholder="20/04/2018" className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Foto de Perfil (PNG/JPG)</label>
              <label className="flex flex-col items-center justify-center gap-2 w-full h-24 border-2 border-dashed border-white/20 rounded-xl cursor-pointer hover:border-yellow-400/60 transition-colors bg-white/5 relative overflow-hidden">
                {photoPreview ? (
                  <>
                    <img src={photoPreview} alt="preview" className="absolute inset-0 w-full h-full object-cover rounded-xl" />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center rounded-xl">
                      <span className="text-xs font-bold text-white">Trocar foto</span>
                    </div>
                  </>
                ) : (
                  <>
                    <User className="w-6 h-6 text-slate-500" />
                    <span className="text-xs text-slate-500 font-bold">Clique para enviar foto</span>
                  </>
                )}
                <input type="file" accept="image/png,image/jpeg,image/jpg" className="sr-only" onChange={handlePhotoFile} />
              </label>
            </div>
          </div>
        </div>

        {/* Summary section card */}
        {addedSections.includes('summary') && (
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center">
                  <FileText className="w-5 h-5" />
                </div>
                <h2 className="font-black text-blue-400 text-base">Resumo Profissional</h2>
              </div>
              <button onClick={() => openSection('summary')} className="text-xs text-slate-400 hover:text-white font-bold px-3 py-1 bg-white/10 rounded-full transition-colors">
                Editar
              </button>
            </div>
            <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">{summary}</p>
          </div>
        )}

        {/* Experience cards */}
        {addedSections.includes('experience') && (
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <Briefcase className="w-5 h-5" />
                </div>
                <h2 className="font-black text-emerald-400 text-base">Experiências</h2>
              </div>
              <button onClick={() => openSection('experience')} className="text-xs text-slate-400 hover:text-white font-bold px-3 py-1 bg-white/10 rounded-full transition-colors flex items-center gap-1">
                <Plus className="w-3 h-3" /> Adicionar
              </button>
            </div>
            {experiences.map((exp, i) => (
              <div key={i} className="flex items-start justify-between bg-white/5 rounded-xl p-3">
                <div>
                  <div className="font-black text-white text-sm">{exp.company}</div>
                  <div className="text-xs text-slate-400 font-bold">{exp.role} · {exp.duration}</div>
                </div>
                <button onClick={() => removeExperience(i)} className="text-red-400 hover:text-red-300 ml-3 mt-0.5">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Education cards */}
        {addedSections.includes('education') && (
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <h2 className="font-black text-purple-400 text-base">Escolaridade</h2>
              </div>
              <button onClick={() => openSection('education')} className="text-xs text-slate-400 hover:text-white font-bold px-3 py-1 bg-white/10 rounded-full transition-colors flex items-center gap-1">
                <Plus className="w-3 h-3" /> Adicionar
              </button>
            </div>
            {education.map((ed, i) => (
              <div key={i} className="flex items-start justify-between bg-white/5 rounded-xl p-3">
                <div>
                  <div className="font-black text-white text-sm">{ed.institution}</div>
                  <div className="text-xs text-slate-400 font-bold">{ed.course} · {ed.period}</div>
                </div>
                <button onClick={() => removeEducation(i)} className="text-red-400 hover:text-red-300 ml-3 mt-0.5">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Course cards */}
        {addedSections.includes('course') && (
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-orange-500/20 text-orange-400 flex items-center justify-center">
                  <BookOpen className="w-5 h-5" />
                </div>
                <h2 className="font-black text-orange-400 text-base">Cursos / Certificados</h2>
              </div>
              <button onClick={() => openSection('course')} className="text-xs text-slate-400 hover:text-white font-bold px-3 py-1 bg-white/10 rounded-full transition-colors flex items-center gap-1">
                <Plus className="w-3 h-3" /> Adicionar
              </button>
            </div>
            {courses.map((c, i) => (
              <div key={i} className="flex items-start justify-between bg-white/5 rounded-xl p-3">
                <div>
                  <div className="font-black text-white text-sm">{c.name}</div>
                  <div className="text-xs text-slate-400 font-bold">{c.institution} {c.year && `· ${c.year}`}</div>
                </div>
                <button onClick={() => removeCourse(i)} className="text-red-400 hover:text-red-300 ml-3 mt-0.5">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Skills cards */}
        {addedSections.includes('skill') && (
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center">
                  <Star className="w-5 h-5" />
                </div>
                <h2 className="font-black text-rose-400 text-base">Competências</h2>
              </div>
              <button onClick={() => openSection('skill')} className="text-xs text-slate-400 hover:text-white font-bold px-3 py-1 bg-white/10 rounded-full transition-colors flex items-center gap-1">
                <Plus className="w-3 h-3" /> Adicionar
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {skills.map((s, i) => (
                <div key={i} className="flex items-center gap-1.5 bg-rose-500/10 text-rose-300 border border-rose-500/20 rounded-full px-3 py-1 text-xs font-black">
                  {s.name}
                  <button onClick={() => removeSkill(i)} className="hover:text-red-300">
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-500/20 border border-red-500/30 rounded-xl px-4 py-3 text-red-300 text-sm font-bold">
            {error}
          </div>
        )}

        {/* Empty state hint */}
        {addedSections.length === 0 && (
          <div className="text-center py-10 text-slate-500">
            <Plus className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="font-bold text-sm">Clique no botão <span className="text-yellow-400">+</span> abaixo para adicionar seções ao seu currículo</p>
          </div>
        )}
      </div>

      {/* Floating + button */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-20">
        <button
          onClick={() => setShowPicker(true)}
          className="flex items-center gap-2 px-6 py-3 bg-white text-slate-900 font-black rounded-full shadow-2xl hover:bg-slate-100 transition-all text-sm"
        >
          <Plus className="w-5 h-5" />
          Adicionar seção
        </button>
      </div>

      {/* Section picker modal */}
      <AnimatePresence>
        {showPicker && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            onClick={() => setShowPicker(false)}
          >
            <motion.div
              initial={{ y: 60, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 60, opacity: 0 }}
              transition={{ type: 'spring', damping: 20, stiffness: 300 }}
              className="w-full max-w-md bg-slate-900 border border-white/10 rounded-3xl p-6 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-lg font-black text-white">O que deseja adicionar?</h3>
                <button onClick={() => setShowPicker(false)} className="text-slate-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-2">
                {SECTION_OPTIONS.map((opt) => {
                  const Icon = opt.icon;
                  return (
                    <button
                      key={opt.type}
                      onClick={() => openSection(opt.type)}
                      className="w-full flex items-center gap-4 p-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all text-left group"
                    >
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${COLOR_CLASSES[opt.color]}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <div className="font-black text-white text-sm">{opt.label}</div>
                        <div className="text-xs text-slate-500">{opt.description}</div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-slate-400 transition-colors" />
                    </button>
                  );
                })}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Section modals */}
      <AnimatePresence>
        {activeModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
            onClick={() => setActiveModal(null)}
          >
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              transition={{ type: 'spring', damping: 22, stiffness: 350 }}
              className="w-full max-w-md bg-slate-900 border border-white/10 rounded-3xl p-6 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Summary modal */}
              {activeModal === 'summary' && (
                <>
                  <ModalHeader title="Resumo Profissional" icon={<FileText className="w-5 h-5" />} color="blue" onClose={() => setActiveModal(null)} />
                  <div className="space-y-4 mt-5">
                    <div>
                      <label className={labelCls}>Escreva um breve resumo sobre você</label>
                      <textarea
                        rows={5}
                        value={draftSummary}
                        onChange={(e) => setDraftSummary(e.target.value)}
                        placeholder="Profissional com X anos de experiência em... Apaixonado por..."
                        className={inputCls + ' resize-none'}
                      />
                    </div>
                    <ModalActions onCancel={() => setActiveModal(null)} onSave={saveSection} disabled={!draftSummary.trim()} />
                  </div>
                </>
              )}

              {/* Experience modal */}
              {activeModal === 'experience' && (
                <>
                  <ModalHeader title="Experiência Profissional" icon={<Briefcase className="w-5 h-5" />} color="emerald" onClose={() => setActiveModal(null)} />
                  <div className="space-y-4 mt-5">
                    <div>
                      <label className={labelCls}>Empresa *</label>
                      <input value={draftExp.company} onChange={(e) => setDraftExp({ ...draftExp, company: e.target.value })} placeholder="Lanchonete Chumbo Lanches" className={inputCls} />
                    </div>
                    <div>
                      <label className={labelCls}>Cargo / Função *</label>
                      <input value={draftExp.role} onChange={(e) => setDraftExp({ ...draftExp, role: e.target.value })} placeholder="Auxiliar de Cozinha" className={inputCls} />
                    </div>
                    <div>
                      <label className={labelCls}>Período / Duração</label>
                      <input value={draftExp.duration} onChange={(e) => setDraftExp({ ...draftExp, duration: e.target.value })} placeholder="Jan 2022 – Dez 2023" className={inputCls} />
                    </div>
                    <ModalActions onCancel={() => setActiveModal(null)} onSave={saveSection} disabled={!draftExp.company || !draftExp.role} />
                  </div>
                </>
              )}

              {/* Education modal */}
              {activeModal === 'education' && (
                <>
                  <ModalHeader title="Escolaridade" icon={<GraduationCap className="w-5 h-5" />} color="purple" onClose={() => setActiveModal(null)} />
                  <div className="space-y-4 mt-5">
                    <div>
                      <label className={labelCls}>Instituição *</label>
                      <input value={draftEdu.institution} onChange={(e) => setDraftEdu({ ...draftEdu, institution: e.target.value })} placeholder="Senac, ETEC, UNICAMP..." className={inputCls} />
                    </div>
                    <div>
                      <label className={labelCls}>Curso / Grau</label>
                      <input value={draftEdu.course} onChange={(e) => setDraftEdu({ ...draftEdu, course: e.target.value })} placeholder="Ensino Médio, Técnico em Gastronomia..." className={inputCls} />
                    </div>
                    <div>
                      <label className={labelCls}>Período</label>
                      <input value={draftEdu.period} onChange={(e) => setDraftEdu({ ...draftEdu, period: e.target.value })} placeholder="2020 – 2022" className={inputCls} />
                    </div>
                    <ModalActions onCancel={() => setActiveModal(null)} onSave={saveSection} disabled={!draftEdu.institution} />
                  </div>
                </>
              )}

              {/* Course modal */}
              {activeModal === 'course' && (
                <>
                  <ModalHeader title="Curso / Certificado" icon={<BookOpen className="w-5 h-5" />} color="orange" onClose={() => setActiveModal(null)} />
                  <div className="space-y-4 mt-5">
                    <div>
                      <label className={labelCls}>Nome do Curso *</label>
                      <input value={draftCourse.name} onChange={(e) => setDraftCourse({ ...draftCourse, name: e.target.value })} placeholder="Curso de Panificação" className={inputCls} />
                    </div>
                    <div>
                      <label className={labelCls}>Instituição</label>
                      <input value={draftCourse.institution} onChange={(e) => setDraftCourse({ ...draftCourse, institution: e.target.value })} placeholder="Sebrae, Coursera, YouTube..." className={inputCls} />
                    </div>
                    <div>
                      <label className={labelCls}>Ano</label>
                      <input value={draftCourse.year} onChange={(e) => setDraftCourse({ ...draftCourse, year: e.target.value })} placeholder="2024" className={inputCls} />
                    </div>
                    <ModalActions onCancel={() => setActiveModal(null)} onSave={saveSection} disabled={!draftCourse.name} />
                  </div>
                </>
              )}

              {/* Skill modal */}
              {activeModal === 'skill' && (
                <>
                  <ModalHeader title="Competência" icon={<Star className="w-5 h-5" />} color="rose" onClose={() => setActiveModal(null)} />
                  <div className="space-y-4 mt-5">
                    <div>
                      <label className={labelCls}>Competência *</label>
                      <input value={draftSkill.name} onChange={(e) => setDraftSkill({ ...draftSkill, name: e.target.value })} placeholder="Trabalho em Equipe, Excel, Chapa/Grill..." className={inputCls} />
                    </div>
                    <div>
                      <label className={labelCls}>Descrição (opcional)</label>
                      <input value={draftSkill.description} onChange={(e) => setDraftSkill({ ...draftSkill, description: e.target.value })} placeholder="Breve detalhe da competência" className={inputCls} />
                    </div>
                    <ModalActions onCancel={() => setActiveModal(null)} onSave={saveSection} disabled={!draftSkill.name} />
                  </div>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Preview modal */}
      <AnimatePresence>
        {showPreview && theme && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-4xl bg-slate-900 border border-white/10 rounded-3xl shadow-2xl flex flex-col max-h-[95vh]"
            >
              {/* Preview header */}
              <div className="flex items-center justify-between p-5 border-b border-white/10 shrink-0">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{theme.headerEmoji}</span>
                  <div>
                    <div className="font-black text-white text-base">Tema: {theme.themeName}</div>
                    <div className="text-xs text-slate-400 font-bold">Gerado pela IA</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={exportPDF}
                    disabled={isExporting}
                    className="flex items-center gap-2 px-5 py-2 bg-green-500 hover:bg-green-400 text-white font-black rounded-full transition-colors disabled:opacity-60 text-sm shadow-lg shadow-green-500/20"
                  >
                    {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                    {isExporting ? 'Exportando...' : 'Baixar PDF'}
                  </button>
                  <button onClick={() => setShowPreview(false)} className="text-slate-400 hover:text-white">
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Preview body */}
              <div className="overflow-auto p-5 flex-1">
                <div style={{ transform: 'scale(0.75)', transformOrigin: 'top left', width: '794px', marginBottom: '-280px' }}>
                  <ResumeTemplate ref={previewRef} data={resumeData} theme={theme} profileUrl={email ? `mailto:${email}` : 'https://careercanvas.app'} />
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ModalHeader({ title, icon, color, onClose }: { title: string; icon: React.ReactNode; color: string; onClose: () => void }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center border ${COLOR_CLASSES[color]}`}>
          {icon}
        </div>
        <h3 className="font-black text-white text-base">{title}</h3>
      </div>
      <button onClick={onClose} className="text-slate-400 hover:text-white">
        <X className="w-5 h-5" />
      </button>
    </div>
  );
}

function ModalActions({ onCancel, onSave, disabled }: { onCancel: () => void; onSave: () => void; disabled?: boolean }) {
  return (
    <div className="flex gap-3 pt-2">
      <button
        type="button"
        onClick={onCancel}
        className="flex-1 py-3 bg-white/10 hover:bg-white/20 font-bold rounded-xl transition-colors text-sm"
      >
        Cancelar
      </button>
      <button
        type="button"
        onClick={onSave}
        disabled={disabled}
        className="flex-1 py-3 bg-yellow-400 hover:bg-yellow-300 text-black font-black rounded-xl transition-colors text-sm disabled:opacity-40"
      >
        Adicionar
      </button>
    </div>
  );
}
