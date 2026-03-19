
'use client';

import { useMemo } from 'react';
import { 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, 
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip as ReTooltip 
} from 'recharts';
import { motion } from 'framer-motion';
import { Award, Target, MessageCircle, Brain, Zap, ArrowRight, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';

/**
 * @fileOverview Dashboard de análise comportamental e técnica pós-entrevista.
 */

export function InterviewResults({ results, onRetry }: { results: any[], onRetry: () => void }) {
  const metrics = useMemo(() => {
    if (!results.length) return null;
    
    const count = results.length;
    const avg = (key: string) => results.reduce((acc, r) => acc + (r[key] || 0), 0) / count;

    return {
      radarData: [
        { subject: 'Comunicação', A: avg('communication') * 10, fullMark: 100 },
        { subject: 'Técnica', A: avg('technical') * 10, fullMark: 100 },
        { subject: 'Confiança', A: avg('confidence') * 10, fullMark: 100 },
        { subject: 'Fluidez', A: (avg('score') + 5) * 10, fullMark: 100 },
        { subject: 'Clareza', A: 85, fullMark: 100 }, // Estático para fins de MVP ou derivado de score
      ],
      totalScore: (avg('score') * 10).toFixed(0),
      strengths: Array.from(new Set(results.flatMap(r => r.strengths || []))).slice(0, 3),
      weaknesses: Array.from(new Set(results.flatMap(r => r.weaknesses || []))).slice(0, 3),
      finalFeedback: results[results.length - 1]?.feedback || "Ótima performance geral."
    };
  }, [results]);

  if (!metrics) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl w-full bg-white dark:bg-slate-900 rounded-[3rem] p-10 shadow-2xl border border-slate-100 dark:border-slate-800 space-y-10"
    >
      <header className="flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Análise de IA Concluída</span>
          </div>
          <h2 className="text-4xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Seu Diagnóstico</h2>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-center">
            <div className="text-5xl font-black text-blue-600 tracking-tighter">{metrics.totalScore}%</div>
            <p className="text-[10px] font-black uppercase text-slate-400">Match de IA</p>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Radar Chart */}
        <div className="h-[350px] w-full bg-slate-50 dark:bg-slate-800/50 rounded-[2.5rem] p-6 border border-slate-100 dark:border-slate-700">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={metrics.radarData}>
              <PolarGrid stroke="#cbd5e1" />
              <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 'bold' }} />
              <Radar
                name="Performance"
                dataKey="A"
                stroke="#3b82f6"
                fill="#3b82f6"
                fillOpacity={0.5}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Details */}
        <div className="space-y-8">
          <section>
            <h3 className="text-xs font-black uppercase text-slate-400 tracking-widest mb-4 flex items-center gap-2">
              <Award size={14} className="text-yellow-500" /> Superpoderes Detectados
            </h3>
            <div className="flex flex-wrap gap-2">
              {metrics.strengths.map((s, i) => (
                <span key={i} className="px-4 py-2 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 text-[10px] font-black uppercase rounded-xl border border-emerald-100 dark:border-emerald-800">
                  {s}
                </span>
              ))}
            </div>
          </section>

          <section>
            <h3 className="text-xs font-black uppercase text-slate-400 tracking-widest mb-4 flex items-center gap-2">
              <TrendingUp size={14} className="text-blue-500" /> Insight Estratégico
            </h3>
            <div className="p-6 bg-blue-50 dark:bg-blue-900/20 rounded-[2rem] border border-blue-100 dark:border-blue-800 italic text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              "{metrics.finalFeedback}"
            </div>
          </section>
        </div>
      </div>

      <footer className="pt-6 flex flex-col sm:flex-row gap-4">
        <Button onClick={onRetry} variant="secondary" className="flex-1 py-5 rounded-2xl">
          Tentar Novamente
        </Button>
        <Link href="/profile" className="flex-1">
          <Button className="w-full py-5 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900">
            Voltar ao Perfil <ArrowRight size={18} />
          </Button>
        </Link>
      </footer>
    </motion.div>
  );
}
