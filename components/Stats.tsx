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

export function Stats() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);
  
  const currentUser = useStore((state) => state.currentUser);
  const allSkills = useStore((state) => state.skills);
  const areaSkills = useStore((state) => state.areaSkills);
  const experiences = useStore((state) => state.experiences);
  const areas = useStore((state) => state.areas);

  const skillData = useMemo(() => {
    if (!currentUser) return [];
    
    // Get all skills for the user's areas
    const userAreas = areas; // For prototype, assuming all areas belong to user
    const userAreaIds = userAreas.map(a => a.id);
    const userAreaSkills = areaSkills.filter(as => userAreaIds.includes(as.area_id));
    
    // Map to skill names and levels
    const mappedSkills = userAreaSkills.map(as => {
      const skill = allSkills.find(s => s.id === as.skill_id);
      return {
        name: skill?.name || 'Unknown',
        level: as.level
      };
    });
    
    // Sort by level descending and take top 5
    return mappedSkills.sort((a, b) => b.level - a.level).slice(0, 5);
  }, [currentUser, areas, areaSkills, allSkills]);

  const experienceData = useMemo(() => {
    if (!currentUser) return [];
    
    const userExperiences = experiences.filter(e => e.user_id === currentUser.id);
    
    const areaDurations: Record<string, number> = {};
    
    userExperiences.forEach(exp => {
      const start = parseSafeDate(exp.start_date);
      const end = exp.end_date ? parseSafeDate(exp.end_date) : new Date();
      const months = differenceInMonths(end, start) || 1; // At least 1 month
      
      const area = areas.find(a => a.id === exp.area_id);
      const areaName = area?.name || 'Outros';
      
      areaDurations[areaName] = (areaDurations[areaName] || 0) + months;
    });
    
    return Object.entries(areaDurations).map(([name, value]) => ({
      name,
      value
    }));
  }, [currentUser, experiences, areas]);

  if (!isMounted || !currentUser) return null;

  return (
    <div className="w-full max-w-6xl mx-auto py-12 px-4">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
          Estatísticas e Habilidades
        </h2>
        <p className="text-slate-600 dark:text-slate-400">
          Uma visão geral do meu perfil profissional em dados.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Bar Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800"
        >
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6 text-center">
            Principais Habilidades
          </h3>
          <div className="h-72 w-full">
            {skillData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={skillData}
                  margin={{ top: 5, right: 30, left: -20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#334155' : '#e2e8f0'} vertical={false} />
                  <XAxis 
                    dataKey="name" 
                    stroke={isDark ? '#94a3b8' : '#64748b'} 
                    tick={{ fill: isDark ? '#94a3b8' : '#64748b', fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis 
                    stroke={isDark ? '#94a3b8' : '#64748b'} 
                    tick={{ fill: isDark ? '#94a3b8' : '#64748b' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip 
                    cursor={{ fill: isDark ? '#1e293b' : '#f1f5f9' }}
                    contentStyle={{ 
                      backgroundColor: isDark ? '#0f172a' : '#ffffff',
                      borderColor: isDark ? '#334155' : '#e2e8f0',
                      color: isDark ? '#f8fafc' : '#0f172a',
                      borderRadius: '0.75rem'
                    }}
                  />
                  <Bar dataKey="level" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-500">
                Sem dados suficientes
              </div>
            )}
          </div>
        </motion.div>

        {/* Pie Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800"
        >
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6 text-center">
            Distribuição de Experiência (Meses)
          </h3>
          <div className="h-72 w-full flex items-center justify-center">
            {experienceData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={experienceData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
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
                      color: isDark ? '#f8fafc' : '#0f172a',
                      borderRadius: '0.75rem'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-500">
                Sem dados suficientes
              </div>
            )}
          </div>
          <div className="flex flex-wrap justify-center gap-4 mt-4">
            {experienceData.map((entry, index) => (
              <div key={entry.name} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                <span className="text-sm font-medium text-slate-600 dark:text-slate-400">{entry.name}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
