'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Briefcase, GraduationCap, Star, Plus, X, Calendar, MapPin, Building, Trophy } from 'lucide-react';
import { useStore } from '@/lib/store';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { parseSafeDate } from '@/lib/utils';

type TimelineItem = {
  id: string;
  type: 'work' | 'education' | 'achievement';
  title: string;
  organization: string;
  date: string;
  description: string;
  sortDate: Date;
};

const getIcon = (type: TimelineItem['type']) => {
  switch (type) {
    case 'work':
      return <Briefcase className="w-5 h-5" />;
    case 'education':
      return <GraduationCap className="w-5 h-5" />;
    case 'achievement':
      return <Star className="w-5 h-5" />;
  }
};

const getColorClass = (type: TimelineItem['type']) => {
  switch (type) {
    case 'work':
      return 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800';
    case 'education':
      return 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800';
    case 'achievement':
      return 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400 border-orange-200 dark:border-orange-800';
  }
};

export function Timeline({ userId, readOnly = false }: { userId?: string, readOnly?: boolean }) {
  const currentUser = useStore(state => state.currentUser);
  const targetUserId = userId || currentUser?.id;

  const experiences = useStore(state => state.experiences);
  const education = useStore(state => state.education);
  const achievements = useStore(state => state.achievements);
  const areas = useStore(state => state.areas);
  
  const addExperience = useStore(state => state.addExperience);
  const addEducation = useStore(state => state.addEducation);
  const addAchievement = useStore(state => state.addAchievement);

  const [isAdding, setIsAdding] = useState(false);
  const [newItem, setNewItem] = useState<Partial<TimelineItem>>({ type: 'work' });
  const [isMounted, setIsMounted] = useState(false);

  React.useEffect(() => {
    setIsMounted(true);
  }, []);

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
        description: exp.description,
        sortDate: start
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
        sortDate: start
      });
    });
    
    achievements.filter(a => a.user_id === targetUserId).forEach(ach => {
      const date = parseSafeDate(ach.date);
      items.push({
        id: ach.id,
        type: 'achievement',
        title: ach.title,
        organization: ach.organization,
        date: format(date, 'MMM yyyy', { locale: ptBR }),
        description: ach.description,
        sortDate: date
      });
    });
    
    return items.sort((a, b) => b.sortDate.getTime() - a.sortDate.getTime());
  }, [targetUserId, experiences, education, achievements]);

  if (!isMounted || !targetUserId) return null;

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !newItem.title || !newItem.organization || !newItem.date) return;
    
    const dateStr = newItem.date.split('-')[0].trim();
    let parsedDate = new Date();
    try {
      if (dateStr.length === 4) {
        parsedDate = new Date(`${dateStr}-01-01`);
      } else {
        parsedDate = new Date(dateStr);
      }
      if (isNaN(parsedDate.getTime())) parsedDate = new Date();
    } catch (e) {
      parsedDate = new Date();
    }
    
    if (newItem.type === 'work') {
      addExperience({
        user_id: currentUser.id,
        area_id: areas[0]?.id || '',
        company_name: newItem.organization,
        company_logo: 'https://picsum.photos/seed/new/100/100',
        role: newItem.title,
        start_date: parsedDate.toISOString(),
        end_date: null,
        description: newItem.description || '',
      });
    } else if (newItem.type === 'education') {
      addEducation({
        user_id: currentUser.id,
        institution: newItem.organization,
        course: newItem.title,
        start_date: parsedDate.toISOString(),
        end_date: null,
      });
    } else if (newItem.type === 'achievement') {
      addAchievement({
        user_id: currentUser.id,
        title: newItem.title,
        organization: newItem.organization,
        date: parsedDate.toISOString(),
        description: newItem.description || '',
      });
    }
    
    setIsAdding(false);
    setNewItem({ type: 'work' });
  };

  return (
    <div className="w-full py-8">
      <div className="flex flex-col md:flex-row items-center justify-between mb-12 gap-6">
        <div className="text-center md:text-left">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
            Histórico e Conquistas
          </h2>
          <p className="text-slate-500 dark:text-slate-400">
            Sua trajetória profissional organizada cronologicamente.
          </p>
        </div>
        
        {!readOnly && currentUser?.id === targetUserId && (
          <button 
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-full font-bold hover:shadow-lg hover:bg-blue-700 transition-all shadow-md"
          >
            <Plus className="w-5 h-5" />
            Novo Registro
          </button>
        )}
      </div>

      <AnimatePresence>
        {isAdding && !readOnly && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
          >
            <motion.form 
              className="w-full max-w-xl bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] shadow-2xl border border-slate-100 dark:border-slate-800"
              onSubmit={handleAdd}
            >
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Adicionar à Trajetória</h3>
                <button type="button" onClick={() => setIsAdding(false)} className="p-2 text-slate-400 hover:text-slate-600 transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Tipo de Registro</label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { id: 'work', label: 'Experiência', icon: Briefcase },
                      { id: 'education', label: 'Formação', icon: GraduationCap },
                      { id: 'achievement', label: 'Conquista', icon: Star },
                    ].map(type => (
                      <button
                        key={type.id}
                        type="button"
                        onClick={() => setNewItem({...newItem, type: type.id as any})}
                        className={`flex flex-col items-center gap-2 p-3 rounded-2xl border-2 transition-all ${
                          newItem.type === type.id 
                            ? 'bg-blue-50 border-blue-500 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400' 
                            : 'bg-slate-50 border-transparent text-slate-500 dark:bg-slate-800'
                        }`}
                      >
                        <type.icon className="w-5 h-5" />
                        <span className="text-xs font-bold">{type.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Título / Cargo</label>
                    <div className="relative">
                      <Trophy className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input 
                        required
                        type="text" 
                        className="w-full pl-10 pr-3 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                        value={newItem.title || ''}
                        onChange={e => setNewItem({...newItem, title: e.target.value})}
                        placeholder="Ex: Desenvolvedor Senior"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Instituição / Empresa</label>
                    <div className="relative">
                      <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input 
                        required
                        type="text" 
                        className="w-full pl-10 pr-3 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                        value={newItem.organization || ''}
                        onChange={e => setNewItem({...newItem, organization: e.target.value})}
                        placeholder="Ex: Google Inc."
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Período / Data</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input 
                      required
                      type="text" 
                      className="w-full pl-10 pr-3 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                      value={newItem.date || ''}
                      onChange={e => setNewItem({...newItem, date: e.target.value})}
                      placeholder="Ex: 2020 - 2024 ou Ago 2023"
                    />
                  </div>
                </div>

                {(newItem.type === 'work' || newItem.type === 'achievement') && (
                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Descrição das Atividades</label>
                    <textarea 
                      className="w-full p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white resize-none"
                      rows={4}
                      value={newItem.description || ''}
                      onChange={e => setNewItem({...newItem, description: e.target.value})}
                      placeholder="Descreva brevemente suas responsabilidades ou a importância desta conquista..."
                    />
                  </div>
                )}
              </div>

              <div className="flex gap-4 mt-10">
                <button 
                  type="button" 
                  onClick={() => setIsAdding(false)}
                  className="flex-1 py-4 text-slate-500 font-bold hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all"
                >
                  Descartar
                </button>
                <button type="submit" className="flex-1 py-4 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 shadow-md">
                  Salvar Registro
                </button>
              </div>
            </motion.form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Horizontal Timeline Container */}
      <div className="relative w-full overflow-x-auto pb-24 pt-12 hide-scrollbar">
        {timelineData.length > 0 ? (
          <>
            <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-200 dark:bg-slate-800 -translate-y-1/2 z-0 min-w-[1200px]"></div>
            
            <div className="flex flex-row items-center gap-12 min-w-[1200px] px-12 relative z-10">
              {timelineData.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: index % 2 === 0 ? -20 : 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className={`relative flex flex-col items-center w-80 shrink-0 ${
                    index % 2 === 0 ? 'mb-64' : 'mt-64'
                  }`}
                >
                  {/* Timeline Dot */}
                  <div className={`absolute ${index % 2 === 0 ? 'bottom-[-3.5rem]' : 'top-[-3.5rem]'} left-1/2 -translate-x-1/2 w-12 h-12 rounded-2xl border-4 border-white dark:border-slate-950 flex items-center justify-center bg-white dark:bg-slate-900 ${getColorClass(item.type)} z-20 shadow-md`}>
                    {getIcon(item.type)}
                  </div>

                  {/* Connecting Line to Dot */}
                  <div className={`absolute ${index % 2 === 0 ? 'bottom-[-2.5rem] h-10' : 'top-[-2.5rem] h-10'} left-1/2 w-0.5 bg-slate-200 dark:bg-slate-800 z-10`}></div>

                  {/* Content Card */}
                  <div className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] shadow-sm border border-slate-100 dark:border-slate-800 hover:shadow-xl transition-all w-full group relative overflow-hidden">
                    <div className={`absolute top-0 left-0 w-1.5 h-full ${item.type === 'work' ? 'bg-blue-500' : item.type === 'education' ? 'bg-emerald-500' : 'bg-orange-500'}`} />
                    
                    <div className="flex flex-col mb-4 gap-3">
                      <span className="text-[10px] font-bold px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 w-fit uppercase tracking-tighter">
                        {item.date}
                      </span>
                      <h3 className="text-xl font-bold text-slate-900 dark:text-white leading-tight group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {item.title}
                      </h3>
                    </div>
                    <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 mb-4 uppercase tracking-widest flex items-center gap-1.5">
                      <Building className="w-3 h-3" />
                      {item.organization}
                    </h4>
                    {item.description && (
                      <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-3 italic">
                        "{item.description}"
                      </p>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-20 bg-white dark:bg-slate-900/50 rounded-[3rem] border-2 border-dashed border-slate-100 dark:border-slate-800">
            <div className="w-16 h-16 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-8 h-8 text-slate-300" />
            </div>
            <p className="text-slate-400 font-medium">Sua linha do tempo profissional aparecerá aqui.</p>
            <p className="text-xs text-slate-300 mt-2">Adicione experiências e conquistas para começar.</p>
          </div>
        )}
      </div>
      
      <style dangerouslySetInnerHTML={{__html: `
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}} />
    </div>
  );
}
