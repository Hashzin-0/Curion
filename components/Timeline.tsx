'use client';

import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { Briefcase, GraduationCap, Star, Plus, X } from 'lucide-react';
import { useStore } from '@/lib/store';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

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

export function Timeline() {
  const currentUser = useStore(state => state.currentUser);
  const experiences = useStore(state => state.experiences);
  const education = useStore(state => state.education);
  const achievements = useStore(state => state.achievements);
  const areas = useStore(state => state.areas);
  
  const addExperience = useStore(state => state.addExperience);
  const addEducation = useStore(state => state.addEducation);
  const addAchievement = useStore(state => state.addAchievement);

  const [isAdding, setIsAdding] = useState(false);
  const [newItem, setNewItem] = useState<Partial<TimelineItem>>({ type: 'work' });

  const timelineData = useMemo(() => {
    if (!currentUser) return [];
    
    const items: TimelineItem[] = [];
    
    experiences.filter(e => e.user_id === currentUser.id).forEach(exp => {
      const startDate = format(new Date(exp.start_date), 'MMM yyyy', { locale: ptBR });
      const endDate = exp.end_date ? format(new Date(exp.end_date), 'MMM yyyy', { locale: ptBR }) : 'Atual';
      items.push({
        id: exp.id,
        type: 'work',
        title: exp.role,
        organization: exp.company_name,
        date: `${startDate} - ${endDate}`,
        description: exp.description,
        sortDate: new Date(exp.start_date)
      });
    });
    
    education.filter(e => e.user_id === currentUser.id).forEach(edu => {
      const startDate = format(new Date(edu.start_date), 'yyyy');
      const endDate = edu.end_date ? format(new Date(edu.end_date), 'yyyy') : 'Atual';
      items.push({
        id: edu.id,
        type: 'education',
        title: edu.course,
        organization: edu.institution,
        date: `${startDate} - ${endDate}`,
        description: '',
        sortDate: new Date(edu.start_date)
      });
    });
    
    achievements.filter(a => a.user_id === currentUser.id).forEach(ach => {
      items.push({
        id: ach.id,
        type: 'achievement',
        title: ach.title,
        organization: ach.organization,
        date: format(new Date(ach.date), 'MMM yyyy', { locale: ptBR }),
        description: ach.description,
        sortDate: new Date(ach.date)
      });
    });
    
    return items.sort((a, b) => b.sortDate.getTime() - a.sortDate.getTime());
  }, [currentUser, experiences, education, achievements]);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !newItem.title || !newItem.organization || !newItem.date) return;
    
    // Simple date parsing for the prototype. In a real app, use proper date pickers.
    const dateStr = newItem.date.split('-')[0].trim();
    let parsedDate = new Date();
    try {
      // Try to parse year or year-month
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
        area_id: areas[0]?.id || '', // Default to first area for prototype
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
    <div className="w-full max-w-6xl mx-auto py-12 px-4">
      <div className="text-center mb-12 flex flex-col items-center">
        <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
          Minha Trajetória
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-6">
          Uma linha do tempo das minhas experiências e conquistas.
        </p>
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className="flex items-center gap-2 px-6 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-full font-bold hover:bg-slate-800 dark:hover:bg-slate-200 transition-colors"
        >
          {isAdding ? <X className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
          {isAdding ? 'Cancelar' : 'Adicionar Experiência'}
        </button>
      </div>

      {isAdding && (
        <motion.form 
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="max-w-2xl mx-auto bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-md border border-slate-200 dark:border-slate-800 mb-12"
          onSubmit={handleAdd}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Tipo</label>
              <select 
                className="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                value={newItem.type}
                onChange={e => setNewItem({...newItem, type: e.target.value as any})}
              >
                <option value="work">Trabalho</option>
                <option value="education">Educação</option>
                <option value="achievement">Conquista</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Título</label>
              <input 
                required
                type="text" 
                className="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                value={newItem.title || ''}
                onChange={e => setNewItem({...newItem, title: e.target.value})}
                placeholder="Ex: Desenvolvedor Senior"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Organização</label>
              <input 
                required
                type="text" 
                className="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                value={newItem.organization || ''}
                onChange={e => setNewItem({...newItem, organization: e.target.value})}
                placeholder="Ex: Empresa Tech"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Data</label>
              <input 
                required
                type="text" 
                className="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                value={newItem.date || ''}
                onChange={e => setNewItem({...newItem, date: e.target.value})}
                placeholder="Ex: 2020 - 2023"
              />
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Descrição</label>
            <textarea 
              className="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              rows={3}
              value={newItem.description || ''}
              onChange={e => setNewItem({...newItem, description: e.target.value})}
              placeholder="Descreva suas atividades e conquistas..."
            />
          </div>
          <div className="flex justify-end">
            <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors">
              Salvar
            </button>
          </div>
        </motion.form>
      )}

      {/* Horizontal Timeline Container */}
      <div className="relative w-full overflow-x-auto pb-12 pt-8 hide-scrollbar">
        <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-200 dark:bg-slate-800 -translate-y-1/2 z-0 min-w-[800px]"></div>
        
        <div className="flex flex-row items-center gap-8 min-w-[800px] px-4 relative z-10">
          {timelineData.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className={`relative flex flex-col items-center w-72 shrink-0 ${
                index % 2 === 0 ? 'mb-48' : 'mt-48'
              }`}
            >
              {/* Timeline Dot */}
              <div className={`absolute ${index % 2 === 0 ? 'bottom-[-2.5rem]' : 'top-[-2.5rem]'} left-1/2 -translate-x-1/2 w-10 h-10 rounded-full border-2 flex items-center justify-center bg-white dark:bg-slate-950 ${getColorClass(item.type)} z-20`}>
                {getIcon(item.type)}
              </div>

              {/* Connecting Line to Dot */}
              <div className={`absolute ${index % 2 === 0 ? 'bottom-[-1.5rem] h-6' : 'top-[-1.5rem] h-6'} left-1/2 w-0.5 bg-slate-200 dark:bg-slate-800 z-10`}></div>

              {/* Content Card */}
              <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 hover:shadow-md transition-shadow w-full">
                <div className="flex flex-col mb-2 gap-2">
                  <span className="text-xs font-bold px-2 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 w-fit">
                    {item.date}
                  </span>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">
                    {item.title}
                  </h3>
                </div>
                <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                  {item.organization}
                </h4>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed line-clamp-3">
                  {item.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
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
