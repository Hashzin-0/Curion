'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import * as LucideIcons from 'lucide-react';
import { useStore } from '@/lib/store';

type ContentType = 'experience' | 'education' | 'certificate' | 'portfolio' | 'recommendation';

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

const CONTENT_OPTIONS: {
  type: ContentType;
  label: string;
  description: string;
  icon: typeof LucideIcons.Briefcase;
  color: string;
}[] = [
  { type: 'experience', label: 'Experiência Profissional', description: 'Empregos anteriores e atuais', icon: LucideIcons.Briefcase, color: 'blue' },
  { type: 'education', label: 'Formação Acadêmica', description: 'Escolaridade e cursos superiores', icon: LucideIcons.GraduationCap, color: 'emerald' },
  { type: 'certificate', label: 'Certificados', description: 'Cursos, diplomas e certificações', icon: LucideIcons.Award, color: 'orange' },
  { type: 'portfolio', label: 'Portfólio', description: 'Projetos e trabalhos realizados', icon: LucideIcons.Folder, color: 'purple' },
  { type: 'recommendation', label: 'Cartas de Recomendação', description: 'Referências profissionais', icon: LucideIcons.Mail, color: 'rose' },
];

const COLOR_CLASSES: Record<string, string> = {
  blue: 'bg-blue-500/10 text-blue-500 border-blue-500/20 hover:bg-blue-500/20',
  emerald: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20 hover:bg-emerald-500/20',
  orange: 'bg-orange-500/10 text-orange-500 border-orange-500/20 hover:bg-orange-500/20',
  purple: 'bg-purple-500/10 text-purple-500 border-purple-500/20 hover:bg-purple-500/20',
  rose: 'bg-rose-500/10 text-rose-500 border-rose-500/20 hover:bg-rose-500/20',
};

export function AddContentModal({ isOpen, onClose }: Props) {
  const currentUser = useStore(state => state.currentUser);
  const addExperienceWithAutoArea = useStore(state => state.addExperienceWithAutoArea);
  const addEducation = useStore(state => state.addEducation);
  const addCertificate = useStore(state => state.addCertificate);
  const addPortfolioItem = useStore(state => state.addPortfolioItem);
  const addRecommendation = useStore(state => state.addRecommendation);

  const [selectedType, setSelectedType] = useState<ContentType | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [expForm, setExpForm] = useState({ company_name: '', role: '', start_date: '', end_date: '', description: '', company_logo: '' });
  const [eduForm, setEduForm] = useState({ institution: '', course: '', start_date: '', end_date: '' });
  const [certForm, setCertForm] = useState({ title: '', institution: '', date: '', description: '', file_url: '' });
  const [portForm, setPortForm] = useState({ title: '', description: '', file_url: '', link_url: '', tags: '' });
  const [recForm, setRecForm] = useState({ author_name: '', author_position: '', author_company: '', content: '', date: '', file_url: '' });

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const result = ev.target?.result as string;
      if (selectedType === 'certificate') setCertForm(prev => ({ ...prev, [field]: result }));
      if (selectedType === 'portfolio') setPortForm(prev => ({ ...prev, [field]: result }));
      if (selectedType === 'recommendation') setRecForm(prev => ({ ...prev, [field]: result }));
      if (selectedType === 'experience') setExpForm(prev => ({ ...prev, [field]: result }));
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    setIsSaving(true);
    setError(null);

    try {
      if (selectedType === 'experience') {
        await addExperienceWithAutoArea({
          user_id: currentUser.id,
          company_name: expForm.company_name,
          company_logo: expForm.company_logo || `https://picsum.photos/seed/${Math.random()}/100/100`,
          role: expForm.role,
          start_date: expForm.start_date,
          end_date: expForm.end_date || null,
          description: expForm.description,
        });
      } else if (selectedType === 'education') {
        await addEducation({
          user_id: currentUser.id,
          institution: eduForm.institution,
          course: eduForm.course,
          start_date: eduForm.start_date,
          end_date: eduForm.end_date || null,
        });
      } else if (selectedType === 'certificate') {
        await addCertificate({
          user_id: currentUser.id,
          title: certForm.title,
          institution: certForm.institution,
          date: certForm.date,
          description: certForm.description,
          file_url: certForm.file_url,
        });
      } else if (selectedType === 'portfolio') {
        await addPortfolioItem({
          user_id: currentUser.id,
          title: portForm.title,
          description: portForm.description,
          file_url: portForm.file_url,
          link_url: portForm.link_url,
          tags: portForm.tags ? portForm.tags.split(',').map(t => t.trim()) : [],
        });
      } else if (selectedType === 'recommendation') {
        await addRecommendation({
          user_id: currentUser.id,
          author_name: recForm.author_name,
          author_position: recForm.author_position,
          author_company: recForm.author_company,
          content: recForm.content,
          date: recForm.date,
          file_url: recForm.file_url,
        });
      }

      // Sucesso
      setSelectedType(null);
      setExpForm({ company_name: '', role: '', start_date: '', end_date: '', description: '', company_logo: '' });
      setEduForm({ institution: '', course: '', start_date: '', end_date: '' });
      setCertForm({ title: '', institution: '', date: '', description: '', file_url: '' });
      setPortForm({ title: '', description: '', file_url: '', link_url: '', tags: '' });
      setRecForm({ author_name: '', author_position: '', author_company: '', content: '', date: '', file_url: '' });
      onClose();
    } catch (err: any) {
      const errorMsg = err?.message || err?.details || 'Erro inesperado ao salvar.';
      console.error('Erro ao salvar:', errorMsg, err);
      setError(errorMsg);
    } finally {
      setIsSaving(false);
    }
  };

  const inputCls = 'w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 transition-all';
  const labelCls = 'block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2';

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
          onClick={() => { setSelectedType(null); setError(null); onClose(); }}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-3xl p-8 shadow-xl border border-slate-100 dark:border-slate-800 overflow-y-auto max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {error && (
              <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-2xl text-sm font-bold border border-red-100 dark:border-red-900/30">
                ⚠️ {error}
              </div>
            )}

            {!selectedType ? (
              <>
                <div className="flex justify-between items-center mb-8">
                  <div>
                    <h3 className="text-2xl font-black text-slate-900 dark:text-white">Adicionar Conteúdo</h3>
                    <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Escolha o tipo de conteúdo que deseja adicionar</p>
                  </div>
                  <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
                    <LucideIcons.X className="w-6 h-6" />
                  </button>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  {CONTENT_OPTIONS.map((option) => {
                    const Icon = option.icon;
                    return (
                      <button
                        key={option.type}
                        onClick={() => { setSelectedType(option.type); setError(null); }}
                        className={`flex items-center gap-4 p-5 rounded-2xl border-2 transition-all text-left ${COLOR_CLASSES[option.color]}`}
                      >
                        <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-white/50 dark:bg-slate-800/50">
                          <Icon className="w-6 h-6" />
                        </div>
                        <div className="flex-1">
                          <div className="font-black text-slate-900 dark:text-white text-base">{option.label}</div>
                          <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{option.description}</div>
                        </div>
                        <LucideIcons.ChevronRight className="w-5 h-5 opacity-50" />
                      </button>
                    );
                  })}
                </div>
              </>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="flex justify-between items-center mb-6">
                  <button type="button" onClick={() => { setSelectedType(null); setError(null); }} className="flex items-center gap-2 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors">
                    <LucideIcons.ArrowLeft className="w-4 h-4" />
                    Voltar
                  </button>
                  <h3 className="text-xl font-black text-slate-900 dark:text-white">
                    {CONTENT_OPTIONS.find(o => o.type === selectedType)?.label}
                  </h3>
                  <div className="w-16" />
                </div>

                {selectedType === 'experience' && (
                  <>
                    <div><label className={labelCls}>Nome da Empresa *</label><input required value={expForm.company_name} onChange={e => setExpForm(p => ({ ...p, company_name: e.target.value }))} placeholder="Ex: Google Brasil" className={inputCls} /></div>
                    <div><label className={labelCls}>Cargo / Função *</label><input required value={expForm.role} onChange={e => setExpForm(p => ({ ...p, role: e.target.value }))} placeholder="Ex: Auxiliar de Cozinha" className={inputCls} /></div>
                    <div className="grid grid-cols-2 gap-4">
                      <div><label className={labelCls}>Data de Início *</label><input required type="date" value={expForm.start_date} onChange={e => setExpForm(p => ({ ...p, start_date: e.target.value }))} className={inputCls} /></div>
                      <div><label className={labelCls}>Data de Término</label><input type="date" value={expForm.end_date} onChange={e => setExpForm(p => ({ ...p, end_date: e.target.value }))} className={inputCls} /><p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Deixe em branco se ainda trabalha lá</p></div>
                    </div>
                    <div><label className={labelCls}>Descrição das Atividades</label><textarea rows={4} value={expForm.description} onChange={e => setExpForm(p => ({ ...p, description: e.target.value }))} placeholder="Descreva suas responsabilidades..." className={inputCls} /></div>
                    <div><label className={labelCls}>Logo da Empresa</label><input type="file" accept="image/*" onChange={e => handleFileUpload(e, 'company_logo')} className={inputCls} /></div>
                  </>
                )}

                {selectedType === 'education' && (
                  <>
                    <div><label className={labelCls}>Instituição *</label><input required value={eduForm.institution} onChange={e => setEduForm(p => ({ ...p, institution: e.target.value }))} placeholder="Ex: SENAC, UNICAMP..." className={inputCls} /></div>
                    <div><label className={labelCls}>Curso / Grau *</label><input required value={eduForm.course} onChange={e => setEduForm(p => ({ ...p, course: e.target.value }))} placeholder="Ex: Técnico em Gastronomia" className={inputCls} /></div>
                    <div className="grid grid-cols-2 gap-4">
                      <div><label className={labelCls}>Data de Início *</label><input required type="date" value={eduForm.start_date} onChange={e => setEduForm(p => ({ ...p, start_date: e.target.value }))} className={inputCls} /></div>
                      <div><label className={labelCls}>Data de Conclusão</label><input type="date" value={eduForm.end_date} onChange={e => setEduForm(p => ({ ...p, end_date: e.target.value }))} className={inputCls} /></div>
                    </div>
                  </>
                )}

                {selectedType === 'certificate' && (
                  <>
                    <div><label className={labelCls}>Título do Certificado *</label><input required value={certForm.title} onChange={e => setCertForm(p => ({ ...p, title: e.target.value }))} placeholder="Ex: Excel Avançado" className={inputCls} /></div>
                    <div><label className={labelCls}>Instituição Emissora *</label><input required value={certForm.institution} onChange={e => setCertForm(p => ({ ...p, institution: e.target.value }))} placeholder="Ex: Sebrae, Coursera..." className={inputCls} /></div>
                    <div><label className={labelCls}>Data de Emissão *</label><input required type="date" value={certForm.date} onChange={e => setCertForm(p => ({ ...p, date: e.target.value }))} className={inputCls} /></div>
                    <div><label className={labelCls}>Descrição</label><textarea rows={3} value={certForm.description} onChange={e => setCertForm(p => ({ ...p, description: e.target.value }))} placeholder="Detalhes sobre o certificado..." className={inputCls} /></div>
                    <div><label className={labelCls}>Arquivo do Certificado (PDF/Imagem)</label><input type="file" accept="image/*,application/pdf" onChange={e => handleFileUpload(e, 'file_url')} className={inputCls} /></div>
                  </>
                )}

                {selectedType === 'portfolio' && (
                  <>
                    <div><label className={labelCls}>Título do Projeto *</label><input required value={portForm.title} onChange={e => setPortForm(p => ({ ...p, title: e.target.value }))} placeholder="Ex: Website Responsivo" className={inputCls} /></div>
                    <div><label className={labelCls}>Descrição *</label><textarea required rows={4} value={portForm.description} onChange={e => setPortForm(p => ({ ...p, description: e.target.value }))} placeholder="Descreva o projeto..." className={inputCls} /></div>
                    <div><label className={labelCls}>Imagem do Projeto</label><input type="file" accept="image/*" onChange={e => handleFileUpload(e, 'file_url')} className={inputCls} /></div>
                    <div><label className={labelCls}>Link Externo</label><input type="url" value={portForm.link_url} onChange={e => setPortForm(p => ({ ...p, link_url: e.target.value }))} placeholder="https://..." className={inputCls} /></div>
                    <div><label className={labelCls}>Tags (separadas por vírgula)</label><input value={portForm.tags} onChange={e => setPortForm(p => ({ ...p, tags: e.target.value }))} placeholder="React, Design, Web" className={inputCls} /></div>
                  </>
                )}

                {selectedType === 'recommendation' && (
                  <>
                    <div><label className={labelCls}>Nome do Recomendador *</label><input required value={recForm.author_name} onChange={e => setRecForm(p => ({ ...p, author_name: e.target.value }))} placeholder="Ex: João Silva" className={inputCls} /></div>
                    <div className="grid grid-cols-2 gap-4">
                      <div><label className={labelCls}>Cargo *</label><input required value={recForm.author_position} onChange={e => setRecForm(p => ({ ...p, author_position: e.target.value }))} placeholder="Ex: Gerente" className={inputCls} /></div>
                      <div><label className={labelCls}>Empresa *</label><input required value={recForm.author_company} onChange={e => setRecForm(p => ({ ...p, author_company: e.target.value }))} placeholder="Ex: Empresa XYZ" className={inputCls} /></div>
                    </div>
                    <div><label className={labelCls}>Conteúdo da Recomendação *</label><textarea required rows={5} value={recForm.content} onChange={e => setRecForm(p => ({ ...p, content: e.target.value }))} placeholder="Texto da carta de recomendação..." className={inputCls} /></div>
                    <div><label className={labelCls}>Data *</label><input required type="date" value={recForm.date} onChange={e => setRecForm(p => ({ ...p, date: e.target.value }))} className={inputCls} /></div>
                    <div><label className={labelCls}>Arquivo PDF da Carta</label><input type="file" accept="application/pdf,image/*" onChange={e => handleFileUpload(e, 'file_url')} className={inputCls} /></div>
                  </>
                )}

                <div className="flex gap-4 pt-4">
                  <button type="button" onClick={() => { setSelectedType(null); setError(null); }} className="flex-1 py-3 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 rounded-xl font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                    Cancelar
                  </button>
                  <button type="submit" disabled={isSaving} className="flex-1 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-bold hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                    {isSaving && <LucideIcons.Loader2 className="w-4 h-4 animate-spin" />}
                    {isSaving ? 'Salvando...' : 'Salvar'}
                  </button>
                </div>
              </form>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
