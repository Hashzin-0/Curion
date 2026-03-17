
'use client';

import { useEffect, useState, useMemo } from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import { DatabaseService } from '@/lib/services/database';
import { Eye, TrendingUp, Calendar, Loader2 } from 'lucide-react';
import { format, subDays, startOfDay, isSameDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function AnalyticsDashboard({ userId }: { userId: string }) {
  const [views, setViews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const data = await DatabaseService.fetchProfileStats(userId);
        setViews(data || []);
      } catch (e) {
        console.error('Erro ao carregar estatísticas:', e);
      } finally {
        setLoading(false);
      }
    };
    loadStats();
  }, [userId]);

  const chartData = useMemo(() => {
    // Gerar dados para os últimos 7 dias
    const last7Days = Array.from({ length: 7 }).map((_, i) => startOfDay(subDays(new Date(), i))).reverse();
    
    return last7Days.map(day => {
      const count = views.filter(v => isSameDay(new Date(v.viewed_at), day)).length;
      return {
        date: format(day, 'dd/MM', { locale: ptBR }),
        views: count
      };
    });
  }, [views]);

  const totalViews = views.length;
  const todayViews = views.filter(v => isSameDay(new Date(v.viewed_at), new Date())).length;

  if (loading) {
    return (
      <div className="h-64 flex flex-col items-center justify-center bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin mb-4" />
        <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">Carregando métricas...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm">
          <div className="flex items-center gap-4 mb-2">
            <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/20 rounded-xl flex items-center justify-center text-blue-600">
              <Eye size={20} />
            </div>
            <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Total de Views</span>
          </div>
          <div className="text-3xl font-black text-slate-900 dark:text-white">{totalViews}</div>
        </div>
        
        <div className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm">
          <div className="flex items-center gap-4 mb-2">
            <div className="w-10 h-10 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl flex items-center justify-center text-emerald-600">
              <TrendingUp size={20} />
            </div>
            <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Hoje</span>
          </div>
          <div className="text-3xl font-black text-slate-900 dark:text-white">{todayViews}</div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm">
          <div className="flex items-center gap-4 mb-2">
            <div className="w-10 h-10 bg-orange-50 dark:bg-orange-900/20 rounded-xl flex items-center justify-center text-orange-600">
              <Calendar size={20} />
            </div>
            <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Últimos 7 dias</span>
          </div>
          <div className="text-3xl font-black text-slate-900 dark:text-white">
            {chartData.reduce((acc, d) => acc + d.views, 0)}
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm">
        <h3 className="text-xl font-black text-slate-900 dark:text-white mb-8 flex items-center gap-2 uppercase tracking-tighter">
          <TrendingUp className="text-blue-600" size={20} />
          Visualizações Diárias
        </h3>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis 
                dataKey="date" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 10, fontWeight: 'bold', fill: '#94a3b8' }} 
              />
              <YAxis hide />
              <Tooltip 
                contentStyle={{ 
                  borderRadius: '1rem', 
                  border: 'none', 
                  boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', 
                  fontSize: '12px', 
                  fontWeight: 'bold',
                  backgroundColor: '#ffffff'
                }}
              />
              <Area 
                type="monotone" 
                dataKey="views" 
                stroke="#3b82f6" 
                strokeWidth={4} 
                fillOpacity={1} 
                fill="url(#colorViews)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
