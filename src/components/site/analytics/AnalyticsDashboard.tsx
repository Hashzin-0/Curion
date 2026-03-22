'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Eye, 
  Users, 
  TrendingUp, 
  TrendingDown,
  Monitor,
  Tablet,
  Smartphone,
  MousePointer,
  Globe
} from 'lucide-react';

interface AnalyticsData {
  summary: {
    totalViews: number;
    uniqueVisitors: number;
    viewsTrend: number;
    visitorsTrend: number;
  };
  sections: Array<{
    section: string;
    views: number;
    uniqueVisitors: number;
    percentage: number;
  }>;
  ctas: Array<{
    cta: string;
    clicks: number;
    uniqueClickers: number;
  }>;
  topDevice: {
    type: string;
    percentage: number;
  };
  topReferrers: Array<{
    source: string;
    count: number;
    percentage: number;
  }>;
  period: {
    days: number;
    startDate: string;
    endDate: string;
  };
}

interface AnalyticsDashboardProps {
  userId: string;
}

export function AnalyticsDashboard({ userId }: AnalyticsDashboardProps) {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [period, setPeriod] = useState(30);

  useEffect(() => {
    async function fetchAnalytics() {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/site/analytics?userId=${userId}&days=${period}`);
        const result = await response.json();
        setData(result.data);
      } catch (error) {
        console.error('Failed to fetch analytics:', error);
      }
      setIsLoading(false);
    }

    fetchAnalytics();
  }, [userId, period]);

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-gray-200 rounded w-1/4" />
        <div className="grid grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 bg-gray-200 rounded-lg" />
          ))}
        </div>
        <div className="h-64 bg-gray-200 rounded-lg" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p>Não foi possível carregar os dados de analytics.</p>
      </div>
    );
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Estatísticas</h2>
          <p className="text-sm text-gray-500">
            Últimos {period} dias
          </p>
        </div>

        <select
          value={period}
          onChange={(e) => setPeriod(parseInt(e.target.value))}
          className="px-4 py-2 border border-gray-200 rounded-lg text-sm"
        >
          <option value={7}>Últimos 7 dias</option>
          <option value={30}>Últimos 30 dias</option>
          <option value={90}>Últimos 90 dias</option>
        </select>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <motion.div variants={itemVariants} className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Visualizações</p>
              <p className="text-3xl font-bold mt-1">{data.summary.totalViews.toLocaleString()}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Eye className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <div className="flex items-center gap-1 mt-2">
            {data.summary.viewsTrend >= 0 ? (
              <TrendingUp className="w-4 h-4 text-green-500" />
            ) : (
              <TrendingDown className="w-4 h-4 text-red-500" />
            )}
            <span className={`text-sm ${data.summary.viewsTrend >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {Math.abs(data.summary.viewsTrend)}%
            </span>
            <span className="text-sm text-gray-500">vs período anterior</span>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Visitantes Únicos</p>
              <p className="text-3xl font-bold mt-1">{data.summary.uniqueVisitors.toLocaleString()}</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <div className="flex items-center gap-1 mt-2">
            {data.summary.visitorsTrend >= 0 ? (
              <TrendingUp className="w-4 h-4 text-green-500" />
            ) : (
              <TrendingDown className="w-4 h-4 text-red-500" />
            )}
            <span className={`text-sm ${data.summary.visitorsTrend >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {Math.abs(data.summary.visitorsTrend)}%
            </span>
            <span className="text-sm text-gray-500">vs período anterior</span>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">CTR Total</p>
              <p className="text-3xl font-bold mt-1">
                {data.ctas.reduce((acc, c) => acc + c.clicks, 0).toLocaleString()}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <MousePointer className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <p className="text-sm text-gray-500 mt-2">Cliques em CTAs</p>
        </motion.div>

        <motion.div variants={itemVariants} className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Dispositivo Principal</p>
              <p className="text-3xl font-bold mt-1 capitalize">{data.topDevice.type}</p>
            </div>
            <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
              {data.topDevice.type === 'desktop' ? (
                <Monitor className="w-6 h-6 text-amber-600" />
              ) : data.topDevice.type === 'tablet' ? (
                <Tablet className="w-6 h-6 text-amber-600" />
              ) : (
                <Smartphone className="w-6 h-6 text-amber-600" />
              )}
            </div>
          </div>
          <p className="text-sm text-gray-500 mt-2">{data.topDevice.percentage}% das visitas</p>
        </motion.div>
      </div>

      {/* Section Views */}
      {data.sections.length > 0 && (
        <motion.div variants={itemVariants} className="bg-white p-6 rounded-xl border border-gray-200">
          <h3 className="text-lg font-semibold mb-4">Visualizações por Seção</h3>
          <div className="space-y-3">
            {data.sections.map((section) => (
              <div key={section.section}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium capitalize">
                    {section.section.replace('_', ' ')}
                  </span>
                  <span className="text-sm text-gray-500">
                    {section.views.toLocaleString()} ({section.percentage}%)
                  </span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary transition-all"
                    style={{ width: `${section.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* CTAs and Referrers */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {data.ctas.length > 0 && (
          <motion.div variants={itemVariants} className="bg-white p-6 rounded-xl border border-gray-200">
            <h3 className="text-lg font-semibold mb-4">CTAs mais clicados</h3>
            <div className="space-y-2">
              {data.ctas.slice(0, 5).map((cta) => (
                <div
                  key={cta.cta}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <span className="text-sm font-medium">{cta.cta}</span>
                  <span className="text-sm text-gray-500">{cta.clicks} cliques</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {data.topReferrers.length > 0 && (
          <motion.div variants={itemVariants} className="bg-white p-6 rounded-xl border border-gray-200">
            <h3 className="text-lg font-semibold mb-4">Origem do Tráfego</h3>
            <div className="space-y-2">
              {data.topReferrers.map((referrer) => (
                <div
                  key={referrer.source}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-gray-400" />
                    <span className="text-sm font-medium">
                      {referrer.source === 'direct' ? 'Direto' : referrer.source}
                    </span>
                  </div>
                  <span className="text-sm text-gray-500">
                    {referrer.count} ({referrer.percentage}%)
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>

      {/* Empty State */}
      {data.summary.totalViews === 0 && (
        <div className="text-center py-12 bg-gray-50 rounded-xl">
          <Eye className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900">Nenhuma visualização ainda</h3>
          <p className="text-sm text-gray-500 mt-2">
            Compartilhe seu site para começar a ver estatísticas.
          </p>
        </div>
      )}
    </motion.div>
  );
}
