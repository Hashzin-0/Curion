'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as LucideIcons from 'lucide-react';
import { useStore, Skill } from '@/lib/store';
import { useAutoAnimate } from '@formkit/auto-animate/react';
import { toast } from 'sonner';
import { DayPicker } from 'react-day-picker';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import 'react-day-picker/dist/style.css';
import { SkillSearch } from './SkillSearch';

type ContentType = 'experience' | 'education' | 'skill' | 'portfolio' | 'certificate';

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

const CONTENT_OPTIONS: {
  type: ContentType;
  label: string;
  description: string;
  icon: any;
  color: string;
}[] = [
  { type: 'experience', label: 'Experiência Profissional', description: 'Empregos anteriores e atuais', icon: LucideIcons.Briefcase, color: 'blue' },
  { type: 'education', label: 'Formação Acadêmica', description: 'Escolaridade e cursos superiores', icon: LucideIcons.GraduationCap, color: 'emerald' },
  { type: 'skill', label: 'Competências & Skills', description: 'Habilidades técnicas e interpessoais', icon: LucideIcons.Star, color: 'orange' },
  { type: 'portfolio', label: 'Portfólio', description: 'Projetos e trabalhos realizados', icon: LucideIcons.Folder, color: 'purple' },
  { type: 'certificate', label: 'Certificados', description: 'Cursos e diplomas extras', icon: LucideIcons.Award, color: 'rose' },
];

const COLOR_CLASSES: Record<string, string> = {
  blue: 'bg-blue-500/10 text-blue-500 border-blue-500/20 hover:bg-blue-500/20',
  emerald: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20 hover:bg-emerald-500/20',
  orange: 'bg-orange-500/10 text-orange-500 border-orange-500/20 hover:bg-orange-500/20',
  purple: 'bg-purple-500/10 text-purple-500 border-purple-500/20 hover:bg-purple-500/20',
  rose: 'bg-rose-500/10 text-rose-500 border-rose-500/20 hover:bg-rose-500/20',
};

export function AddContentModal({ isOpen, onClose }: Props) {
  const { currentUser, areas, addExperienceWithAutoArea, addEducation, addAreaSkill, areaSkills } = useStore();

  const [selectedType, setSelectedType] = useState<ContentType | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [showCalendar, setShowCalendar] = useState<'start' | 'end' | null>(null);
  const [formParent] = useAutoAnimate();

  const [expForm, setExpForm] = useState({ company_name: '', role: '', start_date: undefined as Date | undefined, end_date: undefined as Date | undefined, description: '', company_logo: '' });
  const [eduForm, setEduForm] = useState({ institution: '', course: '', start_date: undefined as Date | undefined, end_date: undefined as Date | undefined });
  const [skillForm, setSkillForm] = useState({ areaId: '', level: 80 });

  const handleAddSkill = async (skill: Skill) => {
    if (!currentUser || !skillForm.areaId) {
      toast.error('Selecione uma área para vincular esta habilidade.');
      return;
    }

    const alreadyHas = areaSkills.find(as => as.area_id === skillForm.areaId && as.skill_id === skill.id);
    if (alreadyHas) {
      toast.warning('Esta habilidade já está nesta área.');
      return;
    }

    setIsSaving(true);
    try {
      await addAreaSkill({
        area_id: skillForm.areaId,
        skill_id: skill.id,
        level: skillForm.level
      });
      toast.success(`${skill.name} adicionada com sucesso!`);
    } catch (e) {
      toast.error('Erro ao adicionar habilidade.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    if (selectedType === 'skill') return; // Skills são tratadas pelo handleAddSkill

    setIsSaving(true);
    try {
      if (selectedType === 'experience') {
        if (!expForm.start_date) throw new Error('Data de início é obrigatória');
        await addExperienceWithAutoArea({
          user_id: currentUser.id,
          company_name: expForm.company_name,
          company_logo: expForm.company_logo || `https://picsum.photos/seed/${Math.random()}/100/100`,
          role: expForm.role,
          start_date: expForm.start_date.toISOString(),
          end_date: expForm.end_date ? expForm.end_date.toISOString() : null,
          description: expForm.description,
        });
      } else if (selectedType === 'education') {
        if (!eduForm.start_date) throw new Error('Data de início é obrigatória');
        await addEducation({
          user_id: currentUser.id,
          institution: eduForm.institution,
          course: eduForm.course,
          start_date: eduForm.start_date.toISOString(),
          end_date: eduForm.end_date ? eduForm.end_date.toISOString() : null,
        });
      }

      toast.success('Conteúdo adicionado!');
      setSelectedType(null);
      onClose();
    } catch (err: any) {
      toast.error(err.message || 'Erro ao salvar.');
    } finally {
      setIsSaving(false);
    }
  };

  const inputCls = 'w-full p-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium';
  const labelCls = 'block text-sm font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2';

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
          onClick={() => { setSelectedType(null); onClose(); }}
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
            className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-[2.5rem] p-8 shadow-2xl border border-slate-100 dark:border-slate-800 overflow-y-auto max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <div ref={formParent}>
              {!selectedType ? (
                <>
                  <div className="flex justify-between items-center mb-8">
                    <h3 className="text-2xl font-black text-slate-900 dark:text-white">Adicionar Conteúdo</h3>
                    <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600"><LucideIcons.X /></button>
                  </div>
                  <div className="grid grid-cols-1 gap-4">
                    {CONTENT_OPTIONS.map((option) => {
                      const Icon = option.icon;
                      return (
                        <button key={option.type} onClick={() => {
                          setSelectedType(option.type);
                          if (option.type === 'skill' && areas.length > 0) setSkillForm(s => ({ ...s, areaId: areas[0].id }));
                        }} className={`flex items-center gap-4 p-5 rounded-2xl border-2 transition-all text-left ${COLOR_CLASSES[option.color]}`}>
                          <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-white/50 dark:bg-slate-800/50"><Icon /></div>
                          <div className="flex-1">
                            <div className="font-black text-slate-900 dark:text-white">{option.label}</div>
                            <div className="text-xs opacity-70">{option.description}</div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </>
              ) : (
                <div className="space-y-6">
                  <div className="flex justify-between items-center mb-6">
                    <button type="button" onClick={() => setSelectedType(null)} className="flex items-center gap-2 text-slate-500 font-bold"><LucideIcons.ArrowLeft size={18} /> Voltar</button>
                    <h3 className="text-xl font-black">{CONTENT_OPTIONS.find(o => o.type === selectedType)?.label}</h3>
                    <div className="w-16" />
                  </div>

                  {selectedType === 'skill' && (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className={labelCls}>Área do Currículo</label>
                          <select 
                            value={skillForm.areaId} 
                            onChange={(e) => setSkillForm({ ...skillForm, areaId: e.target.value })} 
                            className={inputCls}
                          >
                            <option value="">Selecione uma área</option>
                            {areas.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                          </select>
                        </div>
                        <div>
                          <label className={labelCls}>Domínio ({skillForm.level}%)</label>
                          <input 
                            type="range" min="10" max="100" step="5" 
                            value={skillForm.level} 
                            onChange={(e) => setSkillForm({ ...skillForm, level: Number(e.target.value) })} 
                            className="w-full h-10 accent-blue-600"
                          />
                        </div>
                      </div>
                      <div className="pt-4">
                        <label className={labelCls}>Procurar Habilidade</label>
                        <SkillSearch onAdd={handleAddSkill} />
                      </div>
                      <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-2xl border border-blue-100 dark:border-blue-800">
                        <p className="text-xs font-bold text-blue-600 dark:text-blue-400 text-center">
                          Habilidades adicionadas aqui aparecerão automaticamente no currículo da área selecionada.
                        </p>
                      </div>
                    </div>
                  )}

                  {(selectedType === 'experience' || selectedType === 'education') && (
                    <form onSubmit={handleSubmit} className="space-y-6">
                      {selectedType === 'experience' && (
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div><label className={labelCls}>Empresa *</label><input required value={expForm.company_name} onChange={e => setExpForm(p => ({ ...p, company_name: e.target.value }))} className={inputCls} /></div>
                            <div><label className={labelCls}>Cargo *</label><input required value={expForm.role} onChange={e => setExpForm(p => ({ ...p, role: e.target.value }))} className={inputCls} /></div>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="relative">
                              <label className={labelCls}>Início *</label>
                              <button type="button" onClick={() => setShowCalendar(showCalendar === 'start' ? null : 'start')} className={inputCls + ' text-left flex items-center justify-between'}>
                                {expForm.start_date ? format(expForm.start_date, 'PPP', { locale: ptBR }) : 'Selecionar data'}
                                <LucideIcons.Calendar size={18} />
                              </button>
                              {showCalendar === 'start' && (
                                <div className="absolute top-full left-0 z-50 mt-2 bg-white dark:bg-slate-900 p-4 rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800">
                                  <DayPicker mode="single" selected={expForm.start_date} onSelect={(d) => { setExpForm(p => ({ ...p, start_date: d || undefined })); setShowCalendar(null); }} locale={ptBR} />
                                </div>
                              )}
                            </div>
                            <div className="relative">
                              <label className={labelCls}>Término</label>
                              <button type="button" onClick={() => setShowCalendar(showCalendar === 'end' ? null : 'end')} className={inputCls + ' text-left flex items-center justify-between'}>
                                {expForm.end_date ? format(expForm.end_date, 'PPP', { locale: ptBR }) : 'Atualmente'}
                                <LucideIcons.Calendar size={18} />
                              </button>
                              {showCalendar === 'end' && (
                                <div className="absolute top-full left-0 z-50 mt-2 bg-white dark:bg-slate-900 p-4 rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800">
                                  <DayPicker mode="single" selected={expForm.end_date} onSelect={(d) => { setExpForm(p => ({ ...p, end_date: d || undefined })); setShowCalendar(null); }} locale={ptBR} />
                                </div>
                              )}
                            </div>
                          </div>
                          <div>
                            <label className={labelCls}>Descrição</label>
                            <textarea rows={6} value={expForm.description} onChange={e => setExpForm(p => ({ ...p, description: e.target.value }))} className={inputCls + ' resize-none'} placeholder="Descreva suas atividades..." />
                          </div>
                        </div>
                      )}

                      {selectedType === 'education' && (
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div><label className={labelCls}>Instituição *</label><input required value={eduForm.institution} onChange={e => setEduForm(p => ({ ...p, institution: e.target.value }))} className={inputCls} /></div>
                            <div><label className={labelCls}>Curso *</label><input required value={eduForm.course} onChange={e => setEduForm(p => ({ ...p, course: e.target.value }))} className={inputCls} /></div>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div><label className={labelCls}>Início *</label><input type="date" required onChange={e => setEduForm(p => ({ ...p, start_date: new Date(e.target.value) }))} className={inputCls} /></div>
                            <div><label className={labelCls}>Conclusão</label><input type="date" onChange={e => setEduForm(p => ({ ...p, end_date: new Date(e.target.value) }))} className={inputCls} /></div>
                          </div>
                        </div>
                      )}

                      <div className="flex gap-4 pt-4">
                        <button type="button" onClick={() => setSelectedType(null)} className="flex-1 py-4 border border-slate-200 dark:border-slate-700 rounded-2xl font-black text-slate-500">Cancelar</button>
                        <button type="submit" disabled={isSaving} className="flex-1 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black flex items-center justify-center gap-2">
                          {isSaving && <LucideIcons.Loader2 className="animate-spin" />}
                          {isSaving ? 'Salvando...' : 'Adicionar Registro'}
                        </button>
                      </div>
                    </form>
                  )}

                  {selectedType === 'skill' && (
                    <div className="flex justify-center pt-8">
                      <button onClick={onClose} className="px-12 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black shadow-xl">Concluir</button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
