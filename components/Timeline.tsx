'use client';

import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { Briefcase, GraduationCap, Star, Plus, X } from 'lucide-react';
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
    <div className="w-full py-12">
      <div className="text-center mb-16 flex flex-col items-center">
        <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
          Minha Trajetória
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-8 max-w-xl">
          Uma linha do tempo conectando experiências, formação e conquistas marcantes.
        </p>
        
        {!readOnly && currentUser?.id === targetUserId && (
          <button 
            onClick={() => setIsAdding(!isAdding)}
            className="flex items-center gap-2 px-6 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-full font-bold hover:shadow-lg transition-all"
          >
            {isAdding ? <X className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
            {isAdding ? 'Cancelar' : 'Adicionar Evento'}
          </button>
        )}
      </div>

      {isAdding && !readOnly && (
        <motion.form 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-2xl mx-auto bg-white dark:bg-slate-900 p-8 rounded-[2rem] shadow-xl border border-slate-100 dark:border-slate-800 mb-16"
          onSubmit={handleAdd}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Tipo</label>
              <select 
                className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                value={newItem.type}
                onChange={e => setNewItem({...newItem, type: e.target.value as any})}
              >
                <option value="work">Trabalho / Emprego</option>
                <option value="education">Educação / Cursos</option>
                <option value="achievement">Conquista / Prêmio</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Título / Cargo</label>
              <input 
                required
                type="text" 
                className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                value={newItem.title || ''}
                onChange={e => setNewItem({...newItem, title: e.target.value})}
                placeholder="Ex: Desenvolvedor Senior"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Instituição / Empresa</label>
              <input 
                required
                type="text" 
                className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                value={newItem.organization || ''}
                onChange={e => setNewItem({...newItem, organization: e.target.value})}
                placeholder="Ex: Google Inc."
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Ano ou Período</label>
              <input 
                required
                type="text" 
                className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                value={newItem.date || ''}
                onChange={e => setNewItem({...newItem, date: e.target.value})}
                placeholder="Ex: 2020 - 2024"
              />
            </div>
          </div>
          <div className="mb-8">
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Descrição Curta</label>
            <textarea 
              className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
              rows={3}
              value={newItem.description || ''}
              onChange={e => setNewItem({...newItem, description: e.target.value})}
              placeholder="Fale um pouco sobre essa etapa..."
            />
          </div>
          <div className="flex justify-end gap-3">
            <button 
              type="button" 
              onClick={() => setIsAdding(false)}
              className="px-6 py-3 text-slate-500 font-bold hover:text-slate-900 transition-colors"
            >
              Descartar
            </button>
            <button type="submit" className="px-8 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 shadow-md">
              Salvar Registro
            </button>
          </div>
        </motion.form>
      )}

      {/* Horizontal Timeline Container */}
      <div className="relative w-full overflow-x-auto pb-24 pt-12 hide-scrollbar">
        {timelineData.length > 0 ? (
          <>
            <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-200 dark:bg-slate-800 -translate-y-1/2 z-0 min-w-[1000px]"></div>
            
            <div className="flex flex-row items-center gap-12 min-w-[1000px] px-12 relative z-10">
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
                  <div className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] shadow-sm border border-slate-100 dark:border-slate-800 hover:shadow-xl transition-all w-full group">
                    <div className="flex flex-col mb-3 gap-3">
                      <span className="text-xs font-bold px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 w-fit">
                        {item.date}
                      </span>
                      <h3 className="text-xl font-bold text-slate-900 dark:text-white leading-tight group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {item.title}
                      </h3>
                    </div>
                    <h4 className="text-sm font-semibold text-slate-500 dark:text-slate-400 mb-4 uppercase tracking-wider">
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
          <div className="text-center py-20 text-slate-400 italic">
            Nenhum evento registrado na linha do tempo ainda.
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
