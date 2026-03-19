
'use client';

import { useMemo } from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell, PieChart, Pie
} from 'recharts';
import { 
  Eye, TrendingUp, Calendar, Loader2, MousePointer2, 
  Smartphone, Monitor, Share2, Sparkles, Zap, ArrowUpRight,
  Clock, MapPin, Target, Star
} from 'lucide-react';
import { format, subDays, startOfDay, isSameDay, differenceInMinutes } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { motion } from 'framer-motion';
import { useAnalytics } from '@/modules/profile/hooks/useAnalytics';

const COLORS = ['#3b82f6', '#10b981', '#f97316', '#8b5cf6', '#ec4899', '#06b6d4'];

/**
 * @fileOverview Dashboard de Analytics granularizado para carregamento progressivo.
 */

// --- Componentes de Esqueleto ---
const SkeletonCard = () => (
  <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm animate-pulse">
    <div className="w-1/2 h-6 bg-slate-100 dark:bg-slate-800 rounded mb-6" />
    <div className="w-full h-48 bg-slate-50 dark:bg-slate-800/50 rounded-2xl" />
  </div>
);

const SkeletonMetric = () => (
  <div className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm animate-pulse">
    <div className="flex items-center gap-4 mb-2">
      <div className="w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-xl" />
      <div className="w-20 h-3 bg-slate-100 dark:bg-slate-800 rounded" />
    </div>
    <div className="w-12 h-8 bg-slate-100 dark:bg-slate-800 rounded mt-2" />
  </div>
);

// --- Sub-componentes de Visualização ---

function SummaryCards({ data }: { data: any[] }) {
  const stats = useMemo(() => {
    const pageViews = data.filter(d => d.event_type === 'page_view');
    const interactions = data.filter(d => d.event_type !== 'page_view');
    
    // Tempo Médio
    const sessions: Record<string, any[]> = {};
    data.forEach(d => { if (d.session_id) { if (!sessions[d.session_id]) sessions[d.session_id] = []; sessions[d.session_id].push(new Date(d.viewed_at)); } });
    let totalDuration = 0; let sessionCount = 0;
    Object.values(sessions).forEach(events => {
      if (events.length > 1) {
        const sorted = events.sort((a, b) => a.getTime() - b.getTime());
        const diff = differenceInMinutes(sorted[sorted.length - 1], sorted[0]);
        if (diff < 60) { totalDuration += diff; sessionCount++; }
      }
    });

    return {
      totalViews: pageViews.length,
      conversion: pageViews.length > 0 ? ((interactions.length / pageViews.length) * 100).toFixed(1) : '0',
      avgTime: sessionCount > 0 ? Math.ceil(totalDuration / sessionCount) : 1
    };
  }, [data]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-4 mb-2">
          <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/20 rounded-xl flex items-center justify-center text-blue-600"><Eye size={20} /></div>
          <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Visualizações</span>
        </div>
        <div className="text-3xl font-black text-slate-900 dark:text-white">{stats.totalViews}</div>
      </div>
      
      <div className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-4 mb-2">
          <div className="w-10 h-10 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl flex items-center justify-center text-emerald-600"><Zap size={20} /></div>
          <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Conversão</span>
        </div>
        <div className="text-3xl font-black text-slate-900 dark:text-white">{stats.conversion}%</div>
      </div>

      <div className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-4 mb-2">
          <div className="w-10 h-10 bg-orange-50 dark:bg-orange-900/20 rounded-xl flex items-center justify-center text-orange-600"><Clock size={20} /></div>
          <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Tempo Médio</span>
        </div>
        <div className="text-3xl font-black text-slate-900 dark:text-white">{stats.avgTime} min</div>
      </div>

      <div className="bg-gradient-to-br from-indigo-600 to-blue-700 p-6 rounded-[2rem] shadow-lg flex flex-col justify-center">
        <p className="text-[10px] font-black uppercase text-white/60 tracking-widest mb-1">Status Global</p>
        <div className="text-xl font-black text-white uppercase tracking-tighter leading-tight flex items-center gap-2">Alta Visibilidade <ArrowUpRight size={24} /></div>
      </div>
    </div>
  );
}

function EngagementChart({ data }: { data: any[] }) {
  const chartData = useMemo(() => {
    const pageViews = data.filter(d => d.event_type === 'page_view');
    const interactions = data.filter(d => d.event_type !== 'page_view');
    const last7Days = Array.from({ length: 7 }).map((_, i) => startOfDay(subDays(new Date(), i))).reverse();
    
    return last7Days.map(day => ({
      date: format(day, 'dd/MM', { locale: ptBR }),
      views: pageViews.filter(v => isSameDay(new Date(v.viewed_at), day)).length,
      clicks: interactions.filter(v => isSameDay(new Date(v.viewed_at), day)).length,
    }));
  }, [data]);

  return (
    <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm">
      <h3 className="text-xl font-black text-slate-900 dark:text-white mb-8 flex items-center gap-2 uppercase tracking-tighter">
        <TrendingUp className="text-blue-600" size={20} /> Engajamento Semanal
      </h3>
      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <defs><linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/><stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/></linearGradient></defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 'bold', fill: '#94a3b8' }} />
            <YAxis hide />
            <Tooltip contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', fontSize: '12px', fontWeight: 'bold' }} />
            <Area type="monotone" dataKey="views" stroke="#3b82f6" strokeWidth={4} fillOpacity={1} fill="url(#colorViews)" name="Visitas" />
            <Area type="monotone" dataKey="clicks" stroke="#10b981" strokeWidth={4} fill="transparent" name="Cliques" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function AreaInterests({ data }: { data: any[] }) {
  const areaData = useMemo(() => {
    const areaInterests: Record<string, number> = {};
    data.filter(i => i.event_type === 'view_area').forEach(i => {
      const name = i.metadata?.areaName || 'Outros';
      areaInterests[name] = (areaInterests[name] || 0) + 1;
    });
    return Object.entries(areaInterests).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
  }, [data]);

  return (
    <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm">
      <h3 className="text-xl font-black text-slate-900 dark:text-white mb-8 flex items-center gap-2 uppercase tracking-tighter">
        <Target className="text-orange-600" size={20} /> Interesse por Área
      </h3>
      <div className="space-y-6">
        {areaData.length > 0 ? areaData.map((area, i) => (
          <div key={area.name} className="space-y-2">
            <div className="flex justify-between items-center text-xs font-black uppercase tracking-widest">
              <span className="text-slate-500">{area.name}</span>
              <span className="text-slate-900 dark:text-white">{area.value} cliques</span>
            </div>
            <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <motion.div initial={{ width: 0 }} animate={{ width: `${(area.value / (Math.max(...areaData.map(a => a.value)) || 1)) * 100}%` }} className="h-full rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
            </div>
          </div>
        )) : <div className="text-center py-10"><p className="text-xs font-bold text-slate-400 uppercase">Aguardando interações...</p></div>}
      </div>
    </div>
  );
}

// --- Componente Principal ---

export function AnalyticsDashboard({ userId }: { userId: string }) {
  const { data, isLoading } = useAnalytics(userId);

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <SkeletonMetric /><SkeletonMetric /><SkeletonMetric /><SkeletonMetric />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2"><SkeletonCard /></div>
          <SkeletonCard />
        </div>
      </div>
    );
  }

  const events = data || [];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <SummaryCards data={events} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <EngagementChart data={events} />
        </div>
        <AreaInterests data={events} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {/* Origem do Tráfego Simplificada */}
        <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm">
          <h3 className="text-xl font-black text-slate-900 dark:text-white mb-8 flex items-center gap-2 uppercase tracking-tighter">
            <Share2 className="text-indigo-600" size={20} /> Origem do Tráfego
          </h3>
          <div className="space-y-4">
            {['Direto', 'LinkedIn', 'Google', 'WhatsApp'].map((name) => (
              <div key={name} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                <span className="text-xs font-black uppercase text-slate-500">{name}</span>
                <span className="text-sm font-black text-slate-900 dark:text-white">
                  {events.filter(e => e.metadata?.referrer?.toLowerCase().includes(name.toLowerCase())).length || 0}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Perfil de Acesso */}
        <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm">
          <h3 className="text-xl font-black text-slate-900 dark:text-white mb-8 flex items-center gap-2 uppercase tracking-tighter">
            <Smartphone className="text-emerald-600" size={20} /> Perfil de Acesso
          </h3>
          <div className="flex items-center justify-around mb-8">
            <div className="text-center">
              <Smartphone className="mx-auto mb-2 text-slate-300" size={24} />
              <p className="text-xl font-black">{events.filter(e => e.metadata?.userAgent?.toLowerCase().includes('mobile')).length}</p>
              <span className="text-[10px] font-bold text-slate-400 uppercase">Mobile</span>
            </div>
            <div className="text-center">
              <Monitor className="mx-auto mb-2 text-slate-300" size={24} />
              <p className="text-xl font-black">{events.filter(e => !e.metadata?.userAgent?.toLowerCase().includes('mobile')).length}</p>
              <span className="text-[10px] font-bold text-slate-400 uppercase">Desktop</span>
            </div>
          </div>
          <div className="pt-4 border-t dark:border-slate-800">
            <div className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-400 tracking-widest"><MapPin size={12} /> Localização Estimada</div>
            <p className="text-sm font-bold text-slate-600 dark:text-slate-300 mt-1">Brasil (Predominante)</p>
          </div>
        </div>

        {/* Habilidades em Destaque */}
        <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm">
          <h3 className="text-xl font-black text-slate-900 dark:text-white mb-8 flex items-center gap-2 uppercase tracking-tighter">
            <Star className="text-yellow-500" size={20} /> Skills em Destaque
          </h3>
          <div className="flex flex-wrap gap-2">
            {events.filter(e => e.event_type === 'skill_hover').length > 0 ? (
              [...new Set(events.filter(e => e.event_type === 'skill_hover').map(e => e.metadata?.skillName))].slice(0, 5).map((name) => (
                <div key={name} className="px-4 py-2 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-100 dark:border-yellow-800 rounded-full flex items-center gap-2">
                  <span className="text-xs font-black text-yellow-700 dark:text-yellow-400 uppercase">{name}</span>
                </div>
              ))
            ) : <p className="text-xs font-bold text-slate-400 uppercase w-full text-center py-4">Sem dados de skills</p>}
          </div>
        </div>
      </div>

      {/* Career Advisor Insight */}
      <div className="bg-indigo-50 dark:bg-indigo-900/20 p-10 rounded-[3rem] border border-indigo-100 dark:border-indigo-800 relative overflow-hidden">
        <Sparkles className="absolute -right-4 -top-4 text-indigo-200 dark:text-indigo-800 w-48 h-48 rotate-12" />
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
          <div className="w-20 h-20 bg-indigo-600 rounded-3xl flex items-center justify-center text-white shadow-xl shrink-0"><Sparkles size={40} /></div>
          <div>
            <div className="bg-indigo-600 text-white text-[10px] font-black px-3 py-1 rounded-full w-fit uppercase mb-4 tracking-widest">Insight de IA (V2)</div>
            <h4 className="text-2xl font-black text-indigo-900 dark:text-white uppercase tracking-tight mb-2">Recomendação Estratégica</h4>
            <p className="text-indigo-700/80 dark:text-indigo-300/80 font-medium leading-relaxed max-w-2xl">
              {events.length > 0 ? "Seu portfólio está gerando engajamento saudável. Continue compartilhando seu link no LinkedIn para enriquecer sua inteligência de carreira." : "Seu perfil está pronto! Compartilhe o link para começar a gerar inteligência de carreira."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
