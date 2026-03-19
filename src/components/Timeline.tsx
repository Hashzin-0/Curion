
'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Briefcase, GraduationCap, Folder, Plus, X, Calendar, Building, Pencil, Trash2, ShieldCheck, Sparkles, Loader2 } from 'lucide-react';
import { useStore, Project } from '@/lib/store';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { parseSafeDate, cn } from '@/lib/utils';
import { useAutoAnimate } from '@formkit/auto-animate/react';
import { toast } from 'sonner';

type TimelineItem = {
  id: string;
  type: 'work' | 'education' | 'project';
  title: string;
  organization: string;
  date: string;
  description: string;
  sortDate: Date;
  raw: any;
};

const getIcon = (type: TimelineItem['type']) => {
  switch (type) {
    case 'work': return <Briefcase className="w-5 h-5" />;
    case 'education': return <GraduationCap className="w-5 h-5" />;
    case 'project': return <Folder className="w-5 h-5" />;
  }
};

const getColorClass = (type: TimelineItem['type']) => {
  switch (type) {
    case 'work': return 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800';
    case 'education': return 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800';
    case 'project': return 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400 border-orange-200 dark:border-orange-800';
  }
};

export function Timeline({ userId, readOnly = false }: { userId?: string, readOnly?: boolean }) {
  const currentUser = useStore(state => state.currentUser);
  const targetUserId = userId || currentUser?.id;

  const experiences = useStore(state => state.experiences);
  const education = useStore(state => state.education);
  const projects = useStore(state => state.projects);
  const areas = useStore(state => state.areas);
  
  const addExperience = useStore(state => state.addExperience);
  const updateExperience = useStore(state => state.updateExperience);
  const removeExperience = useStore(state => state.removeExperience);
  
  const addEducation = useStore(state => state.addEducation);
  const updateEducation = useStore(state => state.updateEducation);
  const removeEducation = useStore(state => state.removeEducation);
  
  const addProject = useStore(state => state.addProject);
  const updateProject = useStore(state => state.updateProject);
  const removeProject = useStore(state => state.removeProject);
  const verifyProject = useStore(state => state.verifyProject);

  const [isAdding, setIsAdding] = useState(false);
  const [editingItem, setEditingItem] = useState<TimelineItem | null>(null);
  const [deletingItem, setDeletingItem] = useState<TimelineItem | null>(null);
  const [isVerifying, setIsVerifying] = useState<string | null>(null);
  const [newItem, setNewItem] = useState<Partial<TimelineItem>>({ type: 'work' });
  const [parent] = useAutoAnimate();

  const timelineData = useMemo(() => {
    if (!targetUserId) return [];
    
    const items: TimelineItem[] = [];
    
    experiences.filter(e => e.user_id === targetUserId).forEach(exp => {
      const start = parseSafeDate(exp.start_date);
      const startDate = format(start, 'MMM yyyy', { locale: ptBR });
      const end = exp.end_date ? parseSafeDate(exp.end_date) : null;
      const endDate = end ? format(end, 'MMM yyyy', { locale: ptBR }) : 'Atual';
      items.push({
        id: exp.id,
        type: 'work',
        title: exp.role,
        organization: exp.company_name,
        date: `${startDate} - ${endDate}`,
        description: exp.description || '',
        sortDate: start,
        raw: exp
      });
    });
    
    education.filter(e => e.user_id === targetUserId).forEach(edu => {
      const start = parseSafeDate(edu.start_date);
      const startDate = format(start, 'yyyy');
      const end = edu.end_date ? parseSafeDate(edu.end_date) : null;
      const endDate = end ? format(end, 'yyyy') : 'Atual';
      items.push({
        id: edu.id,
        type: 'education',
        title: edu.course,
        organization: edu.institution,
        date: `${startDate} - ${endDate}`,
        description: '',
        sortDate: start,
        raw: edu
      });
    });
    
    projects.filter(p => p.user_id === targetUserId).forEach(proj => {
      const start = parseSafeDate(proj.start_date);
      const startDate = format(start, 'MMM yyyy', { locale: ptBR });
      items.push({
        id: proj.id,
        type: 'project',
        title: proj.name,
        organization: 'Projeto Pessoal',
        date: startDate,
        description: proj.description || '',
        sortDate: start,
        raw: proj
      });
    });
    
    return items.sort((a, b) => b.sortDate.getTime() - a.sortDate.getTime());
  }, [targetUserId, experiences, education, projects]);

  const handleVerify = async (id: string) => {
    setIsVerifying(id);
    const tid = toast.loading('Calculando prova de integridade...');
    try {
      await verifyProject(id);
      toast.success('Projeto verificado com sucesso!', { id: tid });
    } catch (e) {
      toast.error('Erro na verificação.', { id: tid });
    } finally {
      setIsVerifying(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !newItem.title || (newItem.type !== 'project' && !newItem.organization)) return;
    
    const dateToStore = new Date().toISOString(); 
    
    try {
      if (editingItem) {
        if (editingItem.type === 'work') {
          await updateExperience({ ...editingItem.raw, role: newItem.title, company_name: newItem.organization!, description: newItem.description || '' });
        } else if (editingItem.type === 'education') {
          await updateEducation({ ...editingItem.raw, course: newItem.title, institution: newItem.organization! });
        } else if (editingItem.type === 'project') {
          await updateProject({ ...editingItem.raw, name: newItem.title, description: newItem.description || '' });
        }
        toast.success('Registro atualizado!');
      } else {
        if (newItem.type === 'work') {
          await addExperience({ user_id: currentUser.id, area_id: areas[0]?.id || null, company_name: newItem.organization!, role: newItem.title, start_date: dateToStore, end_date: null, description: newItem.description || '' });
        } else if (newItem.type === 'education') {
          await addEducation({ user_id: currentUser.id, institution: newItem.organization!, course: newItem.title, start_date: dateToStore, end_date: null });
        } else if (newItem.type === 'project') {
          await addProject({ user_id: currentUser.id, name: newItem.title, description: newItem.description || '', start_date: dateToStore, end_date: null, external_url: null });
        }
        toast.success('Novo registro adicionado!');
      }
      setIsAdding(false);
      setEditingItem(null);
      setNewItem({ type: 'work' });
    } catch (err) {
      toast.error('Erro ao salvar.');
    }
  };

  return (
    <div className="w-full py-8">
      <div className="flex flex-col md:flex-row items-center justify-between mb-12 gap-6">
        <div className="text-center md:text-left">
          <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-2 uppercase tracking-tighter">Trajetória Imutável</h2>
          <p className="text-slate-500 dark:text-slate-400 font-medium">Sua história profissional com selo de integridade Curion X.</p>
        </div>
        {!readOnly && currentUser?.id === targetUserId && (
          <button onClick={() => { setEditingItem(null); setNewItem({ type: 'work' }); setIsAdding(true); }} className="flex items-center gap-2 px-8 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black text-xs uppercase hover:shadow-2xl transition-all shadow-xl active:scale-95">
            <Plus className="w-5 h-5" /> Adicionar Conquista
          </button>
        )}
      </div>

      <AnimatePresence>
        {isAdding && !readOnly && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <motion.form 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="w-full max-w-xl bg-white dark:bg-slate-900 p-10 rounded-[3rem] shadow-2xl border border-slate-100 dark:border-slate-800" 
              onSubmit={handleSubmit}
            >
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">{editingItem ? 'Refinar Registro' : 'Nova Conquista'}</h3>
                <button type="button" onClick={() => setIsAdding(false)} className="p-2 text-slate-400 hover:text-slate-600 transition-colors"><X size={24} /></button>
              </div>
              <div className="space-y-6">
                {!editingItem && (
                  <div ref={parent}>
                    <label className="block text-[10px] font-black uppercase text-slate-400 tracking-widest mb-3">Categoria</label>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { id: 'work', label: 'Carreira', icon: Briefcase },
                        { id: 'education', label: 'Formação', icon: GraduationCap },
                        { id: 'project', label: 'Projeto', icon: Folder },
                      ].map(type => (
                        <button key={type.id} type="button" onClick={() => setNewItem({...newItem, type: type.id as any})} className={cn("flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all", newItem.type === type.id ? 'bg-blue-50 border-blue-500 text-blue-600 dark:bg-blue-900/20' : 'bg-slate-50 border-transparent text-slate-400 dark:bg-slate-800')}>
                          <type.icon size={20} />
                          <span className="text-[10px] font-black uppercase tracking-tight">{type.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2">Título</label>
                    <input required className="w-full p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold" value={newItem.title || ''} onChange={e => setNewItem({...newItem, title: e.target.value})} placeholder="Ex: Lead Designer" />
                  </div>
                  {newItem.type !== 'project' && (
                    <div>
                      <label className="block text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2">Local</label>
                      <input required className="w-full p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold" value={newItem.organization || ''} onChange={e => setNewItem({...newItem, organization: e.target.value})} placeholder="Ex: Google" />
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2">Contexto / Realizações</label>
                  <textarea className="w-full p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 resize-none font-medium text-sm" rows={4} value={newItem.description || ''} onChange={e => setNewItem({...newItem, description: e.target.value})} placeholder="Descreva seus resultados..." />
                </div>
              </div>
              <div className="flex gap-4 mt-10">
                <button type="button" onClick={() => setIsAdding(false)} className="flex-1 py-4 text-slate-400 font-black text-xs uppercase hover:text-slate-900 transition-all">Cancelar</button>
                <button type="submit" className="flex-1 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black text-xs uppercase shadow-xl hover:scale-[1.02] transition-all">Salvar Registro</button>
              </div>
            </motion.form>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative w-full overflow-x-auto pb-24 pt-12 hide-scrollbar">
        {timelineData.length > 0 ? (
          <>
            <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-200 dark:bg-slate-800 -translate-y-1/2 z-0 min-w-[1200px]"></div>
            <div ref={parent} className="flex flex-row items-center gap-12 min-w-[1200px] px-12 relative z-10">
              {timelineData.map((item, index) => {
                const isVerified = item.type === 'project' && !!item.raw.verification_hash;
                return (
                  <motion.div 
                    key={item.id} 
                    layout
                    initial={{ opacity: 0, y: index % 2 === 0 ? -20 : 20 }} 
                    whileInView={{ opacity: 1, y: 0 }} 
                    transition={{ delay: index * 0.1 }} 
                    className={cn("relative flex flex-col items-center w-80 shrink-0", index % 2 === 0 ? 'mb-64' : 'mt-64')}
                  >
                    <div className={cn("absolute left-1/2 -translate-x-1/2 w-12 h-12 rounded-2xl border-4 border-white dark:border-slate-950 flex items-center justify-center bg-white dark:bg-slate-900 z-20 shadow-md", index % 2 === 0 ? 'bottom-[-3.5rem]' : 'top-[-3.5rem]', getColorClass(item.type))}>
                      {getIcon(item.type)}
                    </div>
                    
                    <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] shadow-sm border border-slate-100 dark:border-slate-800 hover:shadow-2xl transition-all w-full group relative overflow-hidden">
                      {isVerified && (
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 via-teal-500 to-emerald-400 animate-pulse" />
                      )}
                      
                      <div className="flex flex-col gap-3 mb-4">
                        <div className="flex justify-between items-start">
                          <span className="text-[9px] font-black px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 uppercase tracking-widest">{item.date}</span>
                          {isVerified && (
                            <div className="flex items-center gap-1 text-[8px] font-black text-emerald-600 uppercase tracking-tighter bg-emerald-50 dark:bg-emerald-900/20 px-2 py-1 rounded-lg">
                              <ShieldCheck size={10} /> Verified Proof
                            </div>
                          )}
                        </div>
                        <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight leading-tight">{item.title}</h3>
                      </div>
                      
                      <h4 className="text-[10px] font-black text-slate-400 dark:text-slate-500 mb-4 uppercase tracking-widest flex items-center gap-1.5"><Building size={12} />{item.organization}</h4>
                      
                      {item.description && <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed italic line-clamp-3">"{item.description}"</p>}

                      {item.type === 'project' && !isVerified && !readOnly && currentUser?.id === targetUserId && (
                        <button 
                          onClick={() => handleVerify(item.id)}
                          disabled={!!isVerifying}
                          className="mt-6 w-full py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-dashed border-slate-200 dark:border-slate-700 text-[10px] font-black uppercase text-slate-400 hover:text-blue-600 hover:border-blue-200 transition-all flex items-center justify-center gap-2"
                        >
                          {isVerifying === item.id ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
                          Gerar Prova de Trabalho (PoW)
                        </button>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </>
        ) : (
          <div className="text-center py-20 bg-white dark:bg-slate-900/50 rounded-[3rem] border-2 border-dashed border-slate-100">
            <Calendar className="w-12 h-12 text-slate-200 mx-auto mb-4" />
            <p className="text-slate-400 font-medium">Sua trajetória profissional aparecerá aqui.</p>
          </div>
        )}
      </div>
    </div>
  );
}
