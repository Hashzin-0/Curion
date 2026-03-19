
'use client';

import { useEffect, useState, useMemo } from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell, PieChart, Pie
} from 'recharts';
import { DatabaseService } from '@/lib/services/database';
import { 
  Eye, TrendingUp, Calendar, Loader2, MousePointer2, 
  Smartphone, Monitor, Share2, Sparkles, Zap, ArrowUpRight
} from 'lucide-react';
import { format, subDays, startOfDay, isSameDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { motion } from 'framer-motion';

const COLORS = ['#3b82f6', '#10b981', '#f97316', '#8b5cf6', '#ec4899', '#06b6d4'];

export function AnalyticsDashboard({ userId }: { userId: string }) {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const stats = await DatabaseService.fetchProfileStats(userId);
        setData(stats || []);
      } catch (e) {
        console.error('Erro ao carregar estatísticas:', e);
      } finally {
        setLoading(false);
      }
    };
    loadStats();
  }, [userId]);

  const stats = useMemo(() => {
    const pageViews = data.filter(d => d.event_type === 'page_view');
    const interactions = data.filter(d => d.event_type !== 'page_view');
    const last7Days = Array.from({ length: 7 }).map((_, i) => startOfDay(subDays(new Date(), i))).reverse();
    
    const chartData = last7Days.map(day => ({
      date: format(day, 'dd/MM', { locale: ptBR }),
      views: pageViews.filter(v => isSameDay(new Date(v.viewed_at), day)).length,
      clicks: interactions.filter(v => isSameDay(new Date(v.viewed_at), day)).length,
    }));

    const totalViews = pageViews.length;
    const totalClicks = interactions.length;
    const conversionRate = totalViews > 0 ? ((totalClicks / totalViews) * 100).toFixed(1) : '0';

    // Dispositivos (Baseado em User Agent Simplificado)
    const devices = { mobile: 0, desktop: 0 };
    pageViews.forEach(v => {
      const ua = v.metadata?.userAgent?.toLowerCase() || '';
      if (ua.includes('mobile') || ua.includes('android') || ua.includes('iphone')) devices.mobile++;
      else devices.desktop++;
    });

    const deviceData = [
      { name: 'Mobile', value: devices.mobile },
      { name: 'Desktop', value: devices.desktop },
    ];

    // Fontes de Tráfego
    const sources: Record<string, number> = {};
    pageViews.forEach(v => {
      let ref = v.metadata?.referrer || 'Direto';
      if (ref === '') ref = 'Direto';
      if (ref.includes('linkedin')) ref = 'LinkedIn';
      if (ref.includes('google')) ref = 'Google';
      if (ref.includes('curionx')) ref = 'Explore Hub';
      sources[ref] = (sources[ref] || 0) + 1;
    });

    const sourceData = Object.entries(sources)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 4);

    return {
      chartData,
      totalViews,
      totalClicks,
      conversionRate,
      deviceData,
      sourceData
    };
  }, [data]);

  if (loading) {
    return (
      <div className="h-96 flex flex-col items-center justify-center bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin mb-4" />
        <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">Sincronizando Metadados...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Resumo Principal */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm">
          <div className="flex items-center gap-4 mb-2">
            <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/20 rounded-xl flex items-center justify-center text-blue-600">
              <Eye size={20} />
            </div>
            <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Visualizações</span>
          </div>
          <div className="text-3xl font-black text-slate-900 dark:text-white">{stats.totalViews}</div>
        </div>
        
        <div className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm">
          <div className="flex items-center gap-4 mb-2">
            <div className="w-10 h-10 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl flex items-center justify-center text-emerald-600">
              <MousePointer2 size={20} />
            </div>
            <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Interações</span>
          </div>
          <div className="text-3xl font-black text-slate-900 dark:text-white">{stats.totalClicks}</div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm">
          <div className="flex items-center gap-4 mb-2">
            <div className="w-10 h-10 bg-orange-50 dark:bg-orange-900/20 rounded-xl flex items-center justify-center text-orange-600">
              <Zap size={20} />
            </div>
            <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Conversão</span>
          </div>
          <div className="text-3xl font-black text-slate-900 dark:text-white">{stats.conversionRate}%</div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col justify-center bg-gradient-to-br from-indigo-600 to-blue-700">
          <p className="text-[10px] font-black uppercase text-white/60 tracking-widest mb-1">Status do Perfil</p>
          <div className="text-xl font-black text-white uppercase tracking-tighter leading-tight">
            Em Alta <ArrowUpRight className="inline w-5 h-5" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Gráfico de Tendência */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm">
          <h3 className="text-xl font-black text-slate-900 dark:text-white mb-8 flex items-center gap-2 uppercase tracking-tighter">
            <TrendingUp className="text-blue-600" size={20} />
            Audiência Semanal
          </h3>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.chartData}>
                <defs>
                  <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 'bold', fill: '#94a3b8' }} />
                <YAxis hide />
                <Tooltip 
                  contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', fontSize: '12px', fontWeight: 'bold' }}
                />
                <Area type="monotone" dataKey="views" stroke="#3b82f6" strokeWidth={4} fillOpacity={1} fill="url(#colorViews)" name="Visitas" />
                <Area type="monotone" dataKey="clicks" stroke="#10b981" strokeWidth={4} fill="transparent" name="Cliques" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Fontes de Tráfego */}
        <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm">
          <h3 className="text-xl font-black text-slate-900 dark:text-white mb-8 flex items-center gap-2 uppercase tracking-tighter">
            <Share2 className="text-indigo-600" size={20} />
            Origem do Tráfego
          </h3>
          <div className="space-y-6">
            {stats.sourceData.map((source, i) => (
              <div key={source.name} className="space-y-2">
                <div className="flex justify-between items-center text-xs font-black uppercase tracking-widest">
                  <span className="text-slate-500">{source.name}</span>
                  <span className="text-slate-900 dark:text-white">{source.value}</span>
                </div>
                <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${(source.value / stats.totalViews) * 100}%` }}
                    className="h-full rounded-full"
                    style={{ backgroundColor: COLORS[i % COLORS.length] }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Dispositivos */}
        <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm">
          <h3 className="text-xl font-black text-slate-900 dark:text-white mb-8 flex items-center gap-2 uppercase tracking-tighter">
            <Smartphone className="text-emerald-600" size={20} />
            Perfil dos Recrutadores
          </h3>
          <div className="flex items-center justify-around">
            <div className="text-center">
              <Smartphone className="mx-auto mb-2 text-slate-300" size={32} />
              <p className="text-2xl font-black">{stats.deviceData[0].value}</p>
              <span className="text-[10px] font-bold text-slate-400 uppercase">Mobile</span>
            </div>
            <div className="h-16 w-px bg-slate-100 dark:bg-slate-800" />
            <div className="text-center">
              <Monitor className="mx-auto mb-2 text-slate-300" size={32} />
              <p className="text-2xl font-black">{stats.deviceData[1].value}</p>
              <span className="text-[10px] font-bold text-slate-400 uppercase">Desktop</span>
            </div>
          </div>
        </div>

        {/* Insight Card */}
        <div className="bg-indigo-50 dark:bg-indigo-900/20 p-8 rounded-[2.5rem] border border-indigo-100 dark:border-indigo-800 relative overflow-hidden flex flex-col justify-center">
          <Sparkles className="absolute -right-4 -top-4 text-indigo-200 dark:text-indigo-800 w-32 h-32 rotate-12" />
          <div className="relative z-10">
            <div className="bg-indigo-600 text-white text-[10px] font-black px-3 py-1 rounded-full w-fit uppercase mb-4">
              Dica da IA
            </div>
            <h4 className="text-lg font-black text-indigo-900 dark:text-white uppercase tracking-tight mb-2">Aumente sua Visibilidade</h4>
            <p className="text-indigo-700/80 dark:text-indigo-300/80 text-sm font-medium leading-relaxed">
              {stats.totalViews > 0 
                ? `Seu tráfego principal vem do ${stats.sourceData[0]?.name}. Considere compartilhar seu QR Code no LinkedIn para atrair mais recrutadores de Desktop.`
                : "Seu perfil ainda é novo! Comece exportando seu currículo em PDF e compartilhando o link para gerar os primeiros dados de inteligência."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
