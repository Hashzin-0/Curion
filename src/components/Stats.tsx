'use client';

import React, { useMemo, useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { motion } from 'motion/react';
import { useTheme } from 'next-themes';
import { useStore } from '@/lib/store';
import { differenceInMonths } from 'date-fns';
import { parseSafeDate } from '@/lib/utils';

const COLORS = ['#3b82f6', '#10b981', '#f97316', '#8b5cf6', '#ef4444', '#eab308'];

export function Stats({ userId }: { userId?: string }) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);
  
  const currentUser = useStore((state) => state.currentUser);
  const targetUserId = userId || currentUser?.id;

  const allSkills = useStore((state) => state.skills);
  const areaSkills = useStore((state) => state.areaSkills);
  const experiences = useStore((state) => state.experiences);
  const areas = useStore((state) => state.areas);

  const experienceData = useMemo(() => {
    if (!targetUserId) return [];
    
    const userExperiences = experiences.filter(e => e.user_id === targetUserId);
    if (userExperiences.length === 0) return [];

    const areaDurations: Record<string, number> = {};
    
    userExperiences.forEach(exp => {
      const start = parseSafeDate(exp.start_date);
      const end = exp.end_date ? parseSafeDate(exp.end_date) : new Date();
      const months = Math.max(1, differenceInMonths(end, start));
      
      const area = areas.find(a => a.id === exp.area_id);
      const areaName = area?.name || 'Geral';
      
      areaDurations[areaName] = (areaDurations[areaName] || 0) + months;
    });
    
    return Object.entries(areaDurations).map(([name, value]) => ({
      name,
      value
    }));
  }, [targetUserId, experiences, areas]);

  const skillCountData = useMemo(() => {
    if (!targetUserId) return [];
    
    const relevantAreaIds = areas.filter(a => a.user_id === targetUserId).map(a => a.id);
    const userAreaSkills = areaSkills.filter(as => relevantAreaIds.includes(as.area_id));
    
    const areaSkillCount: Record<string, number> = {};
    
    userAreaSkills.forEach(as => {
      const area = areas.find(a => a.id === as.area_id);
      if (area) {
        areaSkillCount[area.name] = (areaSkillCount[area.name] || 0) + 1;
      }
    });

    return Object.entries(areaSkillCount).map(([name, value]) => ({
      name,
      count: value
    }));
  }, [targetUserId, areaSkills, areas]);

  if (!isMounted || !targetUserId) return null;

  return (
    <div className="w-full py-8">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-4 uppercase tracking-tighter">
          Dashboard de Expertise
        </h2>
        <p className="text-slate-500 dark:text-slate-400 font-medium">
          Uma visão analítica da distribuição de suas competências e tempo de carreira.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] shadow-sm border border-slate-100 dark:border-slate-800"
        >
          <h3 className="text-xl font-black text-slate-900 dark:text-white mb-8 uppercase tracking-tight">
            Volume de Skills por Área
          </h3>
          <div className="h-72 w-full">
            {skillCountData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={skillCountData} layout="vertical" margin={{ left: 20, right: 30 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#334155' : '#e2e8f0'} horizontal={true} vertical={false} />
                  <XAxis type="number" hide />
                  <YAxis 
                    dataKey="name" 
                    type="category" 
                    stroke={isDark ? '#94a3b8' : '#64748b'} 
                    tick={{ fill: isDark ? '#94a3b8' : '#64748b', fontSize: 10, fontWeight: 'bold' }}
                    axisLine={false}
                    tickLine={false}
                    width={100}
                  />
                  <Tooltip 
                    cursor={{ fill: isDark ? '#1e293b' : '#f1f5f9' }}
                    contentStyle={{ 
                      backgroundColor: isDark ? '#0f172a' : '#ffffff',
                      borderColor: isDark ? '#334155' : '#e2e8f0',
                      borderRadius: '1rem',
                      borderWidth: '1px',
                      fontSize: '12px',
                      fontWeight: 'bold'
                    }}
                  />
                  <Bar dataKey="count" fill="#3b82f6" radius={[0, 10, 10, 0]} barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 bg-slate-50 dark:bg-slate-800/20 rounded-3xl border-2 border-dashed border-slate-100 dark:border-slate-800">
                <span className="text-xs font-black uppercase tracking-widest">Aguardando Habilidades...</span>
              </div>
            )}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] shadow-sm border border-slate-100 dark:border-slate-800"
        >
          <h3 className="text-xl font-black text-slate-900 dark:text-white mb-8 uppercase tracking-tight">
            Distribuição de Tempo (Meses)
          </h3>
          <div className="h-72 w-full flex items-center justify-center">
            {experienceData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={experienceData}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={100}
                    paddingAngle={8}
                    dataKey="value"
                    stroke="none"
                  >
                    {experienceData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: isDark ? '#0f172a' : '#ffffff',
                      borderColor: isDark ? '#334155' : '#e2e8f0',
                      borderRadius: '1rem',
                      fontSize: '12px',
                      fontWeight: 'bold'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 bg-slate-50 dark:bg-slate-800/20 rounded-3xl border-2 border-dashed border-slate-100 dark:border-slate-800">
                <span className="text-xs font-black uppercase tracking-widest">Adicione Experiências</span>
              </div>
            )}
          </div>
          <div className="flex flex-wrap justify-center gap-4 mt-6">
            {experienceData.map((entry, index) => (
              <div key={entry.name} className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800/50 px-3 py-1.5 rounded-full">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                <span className="text-[10px] font-black uppercase text-slate-500 dark:text-slate-400">{entry.name}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
