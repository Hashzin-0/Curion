
'use client';

import { useEffect, useState, useMemo } from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell, PieChart, Pie
} from 'recharts';
import { DatabaseService } from '@/lib/services/database';
import { 
  Eye, TrendingUp, Calendar, Loader2, MousePointer2, 
  Smartphone, Monitor, Share2, Sparkles, Zap, ArrowUpRight,
  Clock, MapPin, Target, Star, Download, MessageCircle
} from 'lucide-react';
import { format, subDays, startOfDay, isSameDay, differenceInMinutes } from 'date-fns';
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
    
    // Gráfico Semanal
    const chartData = last7Days.map(day => ({
      date: format(day, 'dd/MM', { locale: ptBR }),
      views: pageViews.filter(v => isSameDay(new Date(v.viewed_at), day)).length,
      clicks: interactions.filter(v => isSameDay(new Date(v.viewed_at), day)).length,
    }));

    // Métricas Básicas
    const totalViews = pageViews.length;
    const totalClicks = interactions.length;
    const conversionRate = totalViews > 0 ? ((totalClicks / totalViews) * 100).toFixed(1) : '0';

    // Dispositivos
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

    // Origens de Tráfego
    const sources: Record<string, number> = {};
    pageViews.forEach(v => {
      let ref = v.metadata?.referrer || 'Direto';
      if (ref === '' || ref === 'direct') ref = 'Direto';
      if (ref.includes('linkedin')) ref = 'LinkedIn';
      if (ref.includes('google')) ref = 'Google';
      if (ref.includes('curionx')) ref = 'Curion Hub';
      if (ref.includes('whatsapp')) ref = 'WhatsApp';
      sources[ref] = (sources[ref] || 0) + 1;
    });

    const sourceData = Object.entries(sources)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 4);

    // Interesse por Área
    const areaInterests: Record<string, number> = {};
    interactions.filter(i => i.event_type === 'view_area').forEach(i => {
      const name = i.metadata?.areaName || 'Outros';
      areaInterests[name] = (areaInterests[name] || 0) + 1;
    });

    const areaData = Object.entries(areaInterests)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);

    // Habilidades mais vistas
    const skillInterests: Record<string, number> = {};
    interactions.filter(i => i.event_type === 'skill_hover').forEach(i => {
      const name = i.metadata?.skillName || 'Outros';
      skillInterests[name] = (skillInterests[name] || 0) + 1;
    });

    const skillData = Object.entries(skillInterests)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);

    // Tempo Médio de Permanência (Estimativa por Sessão)
    const sessions: Record<string, any[]> = {};
    data.forEach(d => {
      if (d.session_id) {
        if (!sessions[d.session_id]) sessions[d.session_id] = [];
        sessions[d.session_id].push(new Date(d.viewed_at));
      }
    });

    let totalDuration = 0;
    let sessionCount = 0;
    Object.values(sessions).forEach(events => {
      if (events.length > 1) {
        const sorted = events.sort((a, b) => a.getTime() - b.getTime());
        const diff = differenceInMinutes(sorted[sorted.length - 1], sorted[0]);
        if (diff < 60) { // Ignora sessões de mais de 1h (provavelmente abas esquecidas)
          totalDuration += diff;
          sessionCount++;
        }
      }
    });

    const avgTime = sessionCount > 0 ? Math.ceil(totalDuration / sessionCount) : 1;

    return {
      chartData, totalViews, totalClicks, conversionRate,
      deviceData, sourceData, areaData, skillData, avgTime
    };
  }, [data]);

  if (loading) {
    return (
      <div className="h-96 flex flex-col items-center justify-center bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin mb-4" />
        <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">Calculando Inteligência...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Cards de Métricas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
              <Zap size={20} />
            </div>
            <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Conversão</span>
          </div>
          <div className="text-3xl font-black text-slate-900 dark:text-white">{stats.conversionRate}%</div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm">
          <div className="flex items-center gap-4 mb-2">
            <div className="w-10 h-10 bg-orange-50 dark:bg-orange-900/20 rounded-xl flex items-center justify-center text-orange-600">
              <Clock size={20} />
            </div>
            <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Tempo Médio</span>
          </div>
          <div className="text-3xl font-black text-slate-900 dark:text-white">{stats.avgTime} min</div>
        </div>

        <div className="bg-gradient-to-br from-indigo-600 to-blue-700 p-6 rounded-[2rem] shadow-lg flex flex-col justify-center">
          <p className="text-[10px] font-black uppercase text-white/60 tracking-widest mb-1">Status Global</p>
          <div className="text-xl font-black text-white uppercase tracking-tighter leading-tight flex items-center gap-2">
            Alta Visibilidade <ArrowUpRight size={24} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Gráfico de Tendência Semanal */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm">
          <h3 className="text-xl font-black text-slate-900 dark:text-white mb-8 flex items-center gap-2 uppercase tracking-tighter">
            <TrendingUp className="text-blue-600" size={20} />
            Engajamento Semanal
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

        {/* Interesse por Área */}
        <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm">
          <h3 className="text-xl font-black text-slate-900 dark:text-white mb-8 flex items-center gap-2 uppercase tracking-tighter">
            <Target className="text-orange-600" size={20} />
            Interesse por Área
          </h3>
          <div className="space-y-6">
            {stats.areaData.length > 0 ? stats.areaData.map((area, i) => (
              <div key={area.name} className="space-y-2">
                <div className="flex justify-between items-center text-xs font-black uppercase tracking-widest">
                  <span className="text-slate-500">{area.name}</span>
                  <span className="text-slate-900 dark:text-white">{area.value} cliques</span>
                </div>
                <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${(area.value / (stats.totalClicks || 1)) * 100}%` }}
                    className="h-full rounded-full"
                    style={{ backgroundColor: COLORS[i % COLORS.length] }}
                  />
                </div>
              </div>
            )) : (
              <div className="text-center py-10">
                <p className="text-xs font-bold text-slate-400 uppercase">Aguardando interações...</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {/* Origem do Tráfego */}
        <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm">
          <h3 className="text-xl font-black text-slate-900 dark:text-white mb-8 flex items-center gap-2 uppercase tracking-tighter">
            <Share2 className="text-indigo-600" size={20} />
            Origem do Tráfego
          </h3>
          <div className="space-y-4">
            {stats.sourceData.map((source) => (
              <div key={source.name} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                <span className="text-xs font-black uppercase text-slate-500">{source.name}</span>
                <span className="text-sm font-black text-slate-900 dark:text-white">{source.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Habilidades mais buscadas */}
        <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm">
          <h3 className="text-xl font-black text-slate-900 dark:text-white mb-8 flex items-center gap-2 uppercase tracking-tighter">
            <Star className="text-yellow-500" size={20} />
            Skills em Destaque
          </h3>
          <div className="flex flex-wrap gap-2">
            {stats.skillData.length > 0 ? stats.skillData.map((skill) => (
              <div key={skill.name} className="px-4 py-2 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-100 dark:border-yellow-800 rounded-full flex items-center gap-2">
                <span className="text-xs font-black text-yellow-700 dark:text-yellow-400 uppercase">{skill.name}</span>
                <span className="text-[10px] font-bold text-yellow-600/50">{skill.value}</span>
              </div>
            )) : (
              <p className="text-xs font-bold text-slate-400 uppercase w-full text-center py-4">Sem dados de skills</p>
            )}
          </div>
        </div>

        {/* Dispositivos e Geolocalização */}
        <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm">
          <h3 className="text-xl font-black text-slate-900 dark:text-white mb-8 flex items-center gap-2 uppercase tracking-tighter">
            <Smartphone className="text-emerald-600" size={20} />
            Perfil de Acesso
          </h3>
          <div className="flex items-center justify-around mb-8">
            <div className="text-center">
              <Smartphone className="mx-auto mb-2 text-slate-300" size={24} />
              <p className="text-xl font-black">{stats.deviceData[0].value}</p>
              <span className="text-[10px] font-bold text-slate-400 uppercase">Mobile</span>
            </div>
            <div className="text-center">
              <Monitor className="mx-auto mb-2 text-slate-300" size={24} />
              <p className="text-xl font-black">{stats.deviceData[1].value}</p>
              <span className="text-[10px] font-bold text-slate-400 uppercase">Desktop</span>
            </div>
          </div>
          <div className="pt-4 border-t dark:border-slate-800">
            <div className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-400 tracking-widest">
              <MapPin size={12} /> Localização Estimada
            </div>
            <p className="text-sm font-bold text-slate-600 dark:text-slate-300 mt-1">Brasil (Predominante)</p>
          </div>
        </div>
      </div>

      {/* Career Advisor Insight */}
      <div className="bg-indigo-50 dark:bg-indigo-900/20 p-10 rounded-[3rem] border border-indigo-100 dark:border-indigo-800 relative overflow-hidden">
        <Sparkles className="absolute -right-4 -top-4 text-indigo-200 dark:text-indigo-800 w-48 h-48 rotate-12" />
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
          <div className="w-20 h-20 bg-indigo-600 rounded-3xl flex items-center justify-center text-white shadow-xl shrink-0">
            <Sparkles size={40} />
          </div>
          <div>
            <div className="bg-indigo-600 text-white text-[10px] font-black px-3 py-1 rounded-full w-fit uppercase mb-4 tracking-widest">
              Insight de IA (V2)
            </div>
            <h4 className="text-2xl font-black text-indigo-900 dark:text-white uppercase tracking-tight mb-2">Recomendação Estratégica</h4>
            <p className="text-indigo-700/80 dark:text-indigo-300/80 font-medium leading-relaxed max-w-2xl">
              {stats.totalViews > 0 
                ? `Seu portfólio de "${stats.areaData[0]?.name || 'Geral'}" é o que mais atrai recrutadores via ${stats.sourceData[0]?.name}. Considere atualizar suas habilidades de "${stats.skillData[0]?.name || 'destaque'}" para aumentar o tempo médio de permanência que hoje é de ${stats.avgTime} minutos.`
                : "Seu perfil está pronto para o mercado! Compartilhe o link no LinkedIn para começar a gerar inteligência de carreira e ver seus primeiros insights aqui."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
