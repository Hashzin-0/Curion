'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Briefcase, GraduationCap, Folder, Plus, X, Calendar, Building, Pencil, Trash2 } from 'lucide-react';
import { useStore } from '@/lib/store';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { parseSafeDate } from '@/lib/utils';
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

  const [isAdding, setIsAdding] = useState(false);
  const [editingItem, setEditingItem] = useState<TimelineItem | null>(null);
  const [deletingItem, setDeletingItem] = useState<TimelineItem | null>(null);
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
        toast.success('Registro atualizado com sucesso!');
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
      toast.error('Erro ao salvar o registro.');
    }
  };

  const confirmDelete = async () => {
    if (!deletingItem) return;
    try {
      if (deletingItem.type === 'work') await removeExperience(deletingItem.id);
      if (deletingItem.type === 'education') await removeEducation(deletingItem.id);
      if (deletingItem.type === 'project') await removeProject(deletingItem.id);
      toast.success('Registro removido.');
    } catch (err) {
      toast.error('Erro ao excluir.');
    }
    setDeletingItem(null);
  };

  const handleEdit = (item: TimelineItem) => {
    setEditingItem(item);
    setNewItem({ type: item.type, title: item.title, organization: item.organization, description: item.description, date: item.date });
    setIsAdding(true);
  };

  return (
    <div className="w-full py-8">
      <div className="flex flex-col md:flex-row items-center justify-between mb-12 gap-6">
        <div className="text-center md:text-left">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Histórico e Conquistas</h2>
          <p className="text-slate-500 dark:text-slate-400">Sua trajetória profissional organizada cronologicamente.</p>
        </div>
        {!readOnly && currentUser?.id === targetUserId && (
          <button onClick={() => { setEditingItem(null); setNewItem({ type: 'work' }); setIsAdding(true); }} className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-full font-bold hover:shadow-lg transition-all shadow-md">
            <Plus className="w-5 h-5" /> Novo Registro
          </button>
        )}
      </div>

      <AnimatePresence>
        {isAdding && !readOnly && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <motion.form 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="w-full max-w-xl bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] shadow-2xl border border-slate-100 dark:border-slate-800" 
              onSubmit={handleSubmit}
            >
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{editingItem ? 'Editar Registro' : 'Novo Registro'}</h3>
                <button type="button" onClick={() => setIsAdding(false)} className="p-2 text-slate-400 hover:text-slate-600"><X className="w-6 h-6" /></button>
              </div>
              <div className="space-y-6">
                {!editingItem && (
                  <div ref={parent}>
                    <label className="block text-sm font-bold mb-2">Tipo de Registro</label>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { id: 'work', label: 'Experiência', icon: Briefcase },
                        { id: 'education', label: 'Formação', icon: GraduationCap },
                        { id: 'project', label: 'Projeto', icon: Folder },
                      ].map(type => (
                        <button key={type.id} type="button" onClick={() => setNewItem({...newItem, type: type.id as any})} className={`flex flex-col items-center gap-2 p-3 rounded-2xl border-2 transition-all ${newItem.type === type.id ? 'bg-blue-50 border-blue-500 text-blue-600 dark:bg-blue-900/20' : 'bg-slate-50 border-transparent text-slate-500 dark:bg-slate-800'}`}>
                          <type.icon className="w-5 h-5" />
                          <span className="text-xs font-bold">{type.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold mb-2">Título / Nome</label>
                    <input required type="text" className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800" value={newItem.title || ''} onChange={e => setNewItem({...newItem, title: e.target.value})} placeholder="Ex: App de Finanças" />
                  </div>
                  {newItem.type !== 'project' && (
                    <div>
                      <label className="block text-sm font-bold mb-2">Instituição / Empresa</label>
                      <input required type="text" className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800" value={newItem.organization || ''} onChange={e => setNewItem({...newItem, organization: e.target.value})} placeholder="Ex: Google Inc." />
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-bold mb-2">Descrição</label>
                  <textarea className="w-full p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 resize-none" rows={4} value={newItem.description || ''} onChange={e => setNewItem({...newItem, description: e.target.value})} placeholder="Fale um pouco sobre..." />
                </div>
              </div>
              <div className="flex gap-4 mt-10">
                <button type="button" onClick={() => setIsAdding(false)} className="flex-1 py-4 text-slate-500 font-bold hover:bg-slate-100 rounded-xl transition-all">Descartar</button>
                <button type="submit" className="flex-1 py-4 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 shadow-md">Salvar</button>
              </div>
            </motion.form>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {deletingItem && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl p-8 shadow-xl border border-slate-100 dark:border-slate-800 text-center">
              <h3 className="text-xl font-black mb-4">Confirmar Exclusão</h3>
              <p className="text-slate-500 mb-8">Deseja remover <strong>{deletingItem.title}</strong> de sua trajetória?</p>
              <div className="flex gap-3">
                <button onClick={() => setDeletingItem(null)} className="flex-1 py-3 border rounded-xl font-bold">Cancelar</button>
                <button onClick={confirmDelete} className="flex-1 py-3 bg-red-600 text-white rounded-xl font-bold">Excluir</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative w-full overflow-x-auto pb-24 pt-12 hide-scrollbar">
        {timelineData.length > 0 ? (
          <>
            <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-200 dark:bg-slate-800 -translate-y-1/2 z-0 min-w-[1200px]"></div>
            <div ref={parent} className="flex flex-row items-center gap-12 min-w-[1200px] px-12 relative z-10">
              {timelineData.map((item, index) => (
                <motion.div 
                  key={item.id} 
                  layout
                  initial={{ opacity: 0, y: index % 2 === 0 ? -20 : 20 }} 
                  whileInView={{ opacity: 1, y: 0 }} 
                  transition={{ delay: index * 0.1 }} 
                  className={`relative flex flex-col items-center w-80 shrink-0 ${index % 2 === 0 ? 'mb-64' : 'mt-64'}`}
                >
                  <div className={`absolute ${index % 2 === 0 ? 'bottom-[-3.5rem]' : 'top-[-3.5rem]'} left-1/2 -translate-x-1/2 w-12 h-12 rounded-2xl border-4 border-white dark:border-slate-950 flex items-center justify-center bg-white dark:bg-slate-900 ${getColorClass(item.type)} z-20 shadow-md`}>
                    {getIcon(item.type)}
                  </div>
                  <div className={`absolute ${index % 2 === 0 ? 'bottom-[-2.5rem] h-10' : 'top-[-2.5rem] h-10'} left-1/2 w-0.5 bg-slate-200 dark:bg-slate-800 z-10`}></div>
                  <div className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] shadow-sm border border-slate-100 dark:border-slate-800 hover:shadow-xl transition-all w-full group relative overflow-hidden">
                    <div className={`absolute top-0 left-0 w-1.5 h-full ${item.type === 'work' ? 'bg-blue-500' : item.type === 'education' ? 'bg-emerald-500' : 'bg-orange-500'}`} />
                    {!readOnly && (
                      <div className="absolute top-4 right-4 flex gap-2 transition-all md:opacity-0 md:group-hover:opacity-100">
                        <button onClick={() => handleEdit(item)} className="p-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg hover:text-blue-500 shadow-sm"><Pencil className="w-3.5 h-3.5" /></button>
                        <button onClick={() => setDeletingItem(item)} className="p-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg hover:text-red-500 shadow-sm"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                    )}
                    <div className="flex flex-col mb-4 gap-3">
                      <span className="text-[10px] font-bold px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 w-fit uppercase">{item.date}</span>
                      <h3 className="text-xl font-bold text-slate-900 dark:text-white leading-tight">{item.title}</h3>
                    </div>
                    <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 mb-4 uppercase tracking-widest flex items-center gap-1.5"><Building className="w-3 h-3" />{item.organization}</h4>
                    {item.description && <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-3 italic">"{item.description}"</p>}
                  </div>
                </motion.div>
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-20 bg-white dark:bg-slate-900/50 rounded-[3rem] border-2 border-dashed border-slate-100">
            <Calendar className="w-12 h-12 text-slate-200 mx-auto mb-4" />
            <p className="text-slate-400 font-medium">Sua trajetória profissional aparecerá aqui.</p>
          </div>
        )}
      </div>
      <style dangerouslySetInnerHTML={{__html: `.hide-scrollbar::-webkit-scrollbar { display: none; } .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }`}} />
    </div>
  );
}