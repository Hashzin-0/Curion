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

  const skillData = useMemo(() => {
    if (!targetUserId) return [];
    
    // Filter skills for the areas relevant to the user
    // In this prototype, we show skills based on area associations
    const userAreaSkills = areaSkills; // In a real DB, filter by user/area
    
    const mappedSkills = userAreaSkills.map(as => {
      const skill = allSkills.find(s => s.id === as.skill_id);
      return {
        name: skill?.name || 'Unknown',
        level: as.level
      };
    });
    
    return mappedSkills.sort((a, b) => b.level - a.level).slice(0, 5);
  }, [targetUserId, areaSkills, allSkills]);

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

  if (!isMounted || !targetUserId) return null;

  return (
    <div className="w-full py-8">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
          Habilidades e Experiência
        </h2>
        <p className="text-slate-600 dark:text-slate-400">
          Uma visão analítica da trajetória profissional.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] shadow-sm border border-slate-100 dark:border-slate-800"
        >
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-8">
            Principais Competências
          </h3>
          <div className="h-72 w-full">
            {skillData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={skillData} layout="vertical" margin={{ left: 20, right: 30 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#334155' : '#e2e8f0'} horizontal={true} vertical={false} />
                  <XAxis type="number" hide />
                  <YAxis 
                    dataKey="name" 
                    type="category" 
                    stroke={isDark ? '#94a3b8' : '#64748b'} 
                    tick={{ fill: isDark ? '#94a3b8' : '#64748b', fontSize: 12 }}
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
                      borderWidth: '1px'
                    }}
                  />
                  <Bar dataKey="level" fill="#3b82f6" radius={[0, 10, 10, 0]} barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-500 bg-slate-50 dark:bg-slate-800/20 rounded-2xl border-2 border-dashed border-slate-100 dark:border-slate-800">
                Aguardando dados...
              </div>
            )}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] shadow-sm border border-slate-100 dark:border-slate-800"
        >
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-8">
            Tempo por Área (Meses)
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
                      borderRadius: '1rem'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-500 bg-slate-50 dark:bg-slate-800/20 rounded-2xl border-2 border-dashed border-slate-100 dark:border-slate-800">
                Adicione experiências para ver o gráfico.
              </div>
            )}
          </div>
          <div className="flex flex-wrap justify-center gap-4 mt-6">
            {experienceData.map((entry, index) => (
              <div key={entry.name} className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800/50 px-3 py-1.5 rounded-full">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                <span className="text-xs font-bold text-slate-600 dark:text-slate-400">{entry.name}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
