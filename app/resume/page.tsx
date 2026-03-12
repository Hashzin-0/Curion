'use client';

import { useState, useRef, useCallback } from 'react';
import { Loader2, Plus, Trash2, Wand2, Download, ArrowLeft, ArrowRight, User, Briefcase, Star, Eye } from 'lucide-react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import type { ResumeTheme } from '@/src/ai/flows/generate-resume-theme-flow';
import type { ResumeData } from '@/components/ResumeTemplate';

const ResumeTemplate = dynamic(() => import('@/components/ResumeTemplate'), { ssr: false });

const STEPS = [
  { id: 1, label: 'Dados Pessoais', icon: User },
  { id: 2, label: 'Experiências', icon: Briefcase },
  { id: 3, label: 'Competências', icon: Star },
  { id: 4, label: 'Preview', icon: Eye },
];

type Experience = { company: string; role: string; duration: string };
type Skill = { name: string; description: string };

export default function ResumeCreatorPage() {
  const [step, setStep] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [theme, setTheme] = useState<ResumeTheme | null>(null);
  const [error, setError] = useState('');
  const previewRef = useRef<HTMLDivElement>(null);

  // Form state
  const [name, setName] = useState('');
  const [profession, setProfession] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [availableSince, setAvailableSince] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [experiences, setExperiences] = useState<Experience[]>([
    { company: '', role: '', duration: '' },
  ]);
  const [skills, setSkills] = useState<Skill[]>([
    { name: '', description: '' },
  ]);

  const addExperience = () =>
    setExperiences((prev) => [...prev, { company: '', role: '', duration: '' }]);
  const removeExperience = (i: number) =>
    setExperiences((prev) => prev.filter((_, idx) => idx !== i));
  const updateExperience = (i: number, field: keyof Experience, value: string) =>
    setExperiences((prev) => prev.map((e, idx) => (idx === i ? { ...e, [field]: value } : e)));

  const addSkill = () => setSkills((prev) => [...prev, { name: '', description: '' }]);
  const removeSkill = (i: number) =>
    setSkills((prev) => prev.filter((_, idx) => idx !== i));
  const updateSkill = (i: number, field: keyof Skill, value: string) =>
    setSkills((prev) => prev.map((s, idx) => (idx === i ? { ...s, [field]: value } : s)));

  const generateTheme = useCallback(async () => {
    setIsGenerating(true);
    setError('');
    try {
      const res = await fetch('/api/resume/theme', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          profession,
          experiences: experiences.filter((e) => e.company).map((e) => `${e.company} - ${e.role}`),
          skills: skills.filter((s) => s.name).map((s) => s.name),
        }),
      });
      if (!res.ok) throw new Error('Erro na API');
      const data = await res.json();
      setTheme(data);
      setStep(4);
    } catch {
      setError('Não foi possível gerar o tema. Verifique a chave de API GEMINI_API_KEY nos secrets.');
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
    summary: theme?.professionalSummary,
    experiences: experiences.filter((e) => e.company),
    skills: skills.filter((s) => s.name),
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      {/* Header */}
      <div className="border-b border-white/10 bg-black/20 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Voltar</span>
          </Link>
          <h1 className="text-lg font-black tracking-tight">
            ✨ Gerador de Currículo Temático
          </h1>
          <div className="text-sm text-slate-400">Passo {step} de 4</div>
        </div>
      </div>

      {/* Step indicator */}
      <div className="max-w-6xl mx-auto px-6 pt-8 pb-4">
        <div className="flex items-center gap-2 justify-center">
          {STEPS.map((s, i) => {
            const Icon = s.icon;
            const done = step > s.id;
            const active = step === s.id;
            return (
              <div key={s.id} className="flex items-center gap-2">
                <button
                  onClick={() => done && setStep(s.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition-all ${
                    active
                      ? 'bg-yellow-400 text-black'
                      : done
                      ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30 cursor-pointer'
                      : 'bg-white/10 text-slate-500 cursor-default'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:block">{s.label}</span>
                </button>
                {i < STEPS.length - 1 && (
                  <div className={`w-6 h-0.5 ${done ? 'bg-green-500' : 'bg-white/10'}`} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 pb-20">
        <div>
          {/* Step 1: Personal Info */}
          {step === 1 && (
            <div className="space-y-6 mt-8">
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-5">
                <h2 className="text-xl font-black text-yellow-400">👤 Dados Pessoais</h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-bold text-slate-300 mb-1">Nome Completo *</label>
                    <input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Gerlandia Santos de Jesus"
                      className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-yellow-400 font-bold"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-sm font-bold text-slate-300 mb-1">
                      Profissão / Área de Atuação *{' '}
                      <span className="text-yellow-400">(a IA vai criar o tema baseado nisso!)</span>
                    </label>
                    <input
                      value={profession}
                      onChange={(e) => setProfession(e.target.value)}
                      placeholder="Ex: Auxiliar de Cozinha, Programador, Eletricista..."
                      className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-yellow-400 font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-300 mb-1">Telefone</label>
                    <input
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="19 99985-2032"
                      className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-yellow-400 font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-300 mb-1">E-mail</label>
                    <input
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="seuemail@gmail.com"
                      className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-yellow-400 font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-300 mb-1">
                      Disponível desde / Data referência
                    </label>
                    <input
                      value={availableSince}
                      onChange={(e) => setAvailableSince(e.target.value)}
                      placeholder="20/04/2018"
                      className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-yellow-400 font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-300 mb-1">
                      URL da Foto (opcional)
                    </label>
                    <input
                      value={photoUrl}
                      onChange={(e) => setPhotoUrl(e.target.value)}
                      placeholder="https://..."
                      className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-yellow-400 font-bold"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={() => setStep(2)}
                  disabled={!name || !profession}
                  className="flex items-center gap-2 px-8 py-3 bg-yellow-400 text-black font-black rounded-full disabled:opacity-40 hover:bg-yellow-300 transition-colors"
                >
                  Próximo
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Experiences */}
          {step === 2 && (
            <div className="space-y-6 mt-8">
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-5">
                <h2 className="text-xl font-black text-yellow-400">💼 Experiências Profissionais</h2>

                {experiences.map((exp, i) => (
                  <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-slate-400">Experiência {i + 1}</span>
                      {experiences.length > 1 && (
                        <button
                          onClick={() => removeExperience(i)}
                          className="text-red-400 hover:text-red-300 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="sm:col-span-2">
                        <label className="block text-xs font-bold text-slate-400 mb-1">Empresa</label>
                        <input
                          value={exp.company}
                          onChange={(e) => updateExperience(i, 'company', e.target.value)}
                          placeholder="Lanchonete Chumbo Lanches"
                          className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-yellow-400 text-sm font-bold"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-400 mb-1">Duração</label>
                        <input
                          value={exp.duration}
                          onChange={(e) => updateExperience(i, 'duration', e.target.value)}
                          placeholder="5 meses"
                          className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-yellow-400 text-sm font-bold"
                        />
                      </div>
                      <div className="sm:col-span-3">
                        <label className="block text-xs font-bold text-slate-400 mb-1">Cargo / Função</label>
                        <input
                          value={exp.role}
                          onChange={(e) => updateExperience(i, 'role', e.target.value)}
                          placeholder="Auxiliar de Cozinha, Garçonete"
                          className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-yellow-400 text-sm font-bold"
                        />
                      </div>
                    </div>
                  </div>
                ))}

                <button
                  onClick={addExperience}
                  className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-sm font-bold transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Adicionar Experiência
                </button>
              </div>

              <div className="flex justify-between">
                <button
                  onClick={() => setStep(1)}
                  className="flex items-center gap-2 px-6 py-3 bg-white/10 font-bold rounded-full hover:bg-white/20 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Voltar
                </button>
                <button
                  onClick={() => setStep(3)}
                  className="flex items-center gap-2 px-8 py-3 bg-yellow-400 text-black font-black rounded-full hover:bg-yellow-300 transition-colors"
                >
                  Próximo
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Skills */}
          {step === 3 && (
            <div className="space-y-6 mt-8">
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-5">
                <h2 className="text-xl font-black text-yellow-400">⭐ Competências</h2>

                {skills.map((skill, i) => (
                  <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-slate-400">Competência {i + 1}</span>
                      {skills.length > 1 && (
                        <button
                          onClick={() => removeSkill(i)}
                          className="text-red-400 hover:text-red-300 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-400 mb-1">Nome da Competência</label>
                        <input
                          value={skill.name}
                          onChange={(e) => updateSkill(i, 'name', e.target.value)}
                          placeholder="Trabalho em Equipe"
                          className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-yellow-400 text-sm font-bold"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-400 mb-1">Descrição (opcional)</label>
                        <input
                          value={skill.description}
                          onChange={(e) => updateSkill(i, 'description', e.target.value)}
                          placeholder="Comunicação e cooperação"
                          className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-yellow-400 text-sm font-bold"
                        />
                      </div>
                    </div>
                  </div>
                ))}

                <button
                  onClick={addSkill}
                  className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-sm font-bold transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Adicionar Competência
                </button>
              </div>

              {error && (
                <div className="bg-red-500/20 border border-red-500/30 rounded-xl px-4 py-3 text-red-300 text-sm font-bold">
                  {error}
                </div>
              )}

              <div className="flex justify-between">
                <button
                  onClick={() => setStep(2)}
                  className="flex items-center gap-2 px-6 py-3 bg-white/10 font-bold rounded-full hover:bg-white/20 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Voltar
                </button>
                <button
                  onClick={generateTheme}
                  disabled={isGenerating}
                  className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-yellow-400 to-orange-400 text-black font-black rounded-full hover:from-yellow-300 hover:to-orange-300 transition-all disabled:opacity-60 shadow-lg shadow-yellow-400/20"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Criando tema com IA...
                    </>
                  ) : (
                    <>
                      <Wand2 className="w-5 h-5" />
                      Gerar Currículo com IA!
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Preview */}
          {step === 4 && theme && (
            <div className="mt-8 space-y-6">
              {/* Theme badge */}
              <div
                className="flex items-center gap-3 px-6 py-4 rounded-2xl border"
                style={{
                  backgroundColor: theme.primaryColor + '20',
                  borderColor: theme.primaryColor + '50',
                }}
              >
                <span className="text-4xl">{theme.headerEmoji}</span>
                <div>
                  <div className="font-black text-lg" style={{ color: theme.primaryColor }}>
                    Tema: {theme.themeName}
                  </div>
                  <div className="text-sm text-slate-400 font-bold">
                    Gerado pela IA com base na sua profissão
                  </div>
                </div>
                <div className="ml-auto flex gap-2">
                  {[theme.primaryColor, theme.secondaryColor, theme.accentColor].map((c, i) => (
                    <div
                      key={i}
                      title={c}
                      style={{ backgroundColor: c, width: 28, height: 28, borderRadius: 8, border: '2px solid rgba(255,255,255,0.2)' }}
                    />
                  ))}
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => { setTheme(null); setStep(3); }}
                  className="flex items-center gap-2 px-5 py-2.5 bg-white/10 hover:bg-white/20 font-bold rounded-full transition-colors text-sm"
                >
                  <Wand2 className="w-4 h-4" />
                  Regerar Tema
                </button>
                <button
                  onClick={exportPDF}
                  disabled={isExporting}
                  className="flex items-center gap-2 px-6 py-2.5 bg-green-500 hover:bg-green-400 text-white font-black rounded-full transition-colors disabled:opacity-60 shadow-lg shadow-green-500/20"
                >
                  {isExporting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Download className="w-4 h-4" />
                  )}
                  {isExporting ? 'Exportando...' : 'Baixar PDF'}
                </button>
              </div>

              {/* Resume preview (scaled for screen) */}
              <div className="bg-white/5 rounded-2xl border border-white/10 p-4 overflow-auto">
                <div style={{ transform: 'scale(0.75)', transformOrigin: 'top left', width: '794px', marginBottom: '-280px' }}>
                  <ResumeTemplate ref={previewRef} data={resumeData} theme={theme} profileUrl={email ? `mailto:${email}` : 'https://careercanvas.app'} />
                </div>
              </div>

              <p className="text-center text-slate-500 text-sm font-bold">
                O PDF exportado terá a qualidade e tamanho corretos (A4).
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
