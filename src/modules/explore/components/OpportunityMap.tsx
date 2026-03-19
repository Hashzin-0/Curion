
'use client';

import { motion } from 'framer-motion';
import { Globe, MapPin } from 'lucide-react';

/**
 * @fileOverview Visualização mosaica de oportunidades geográficas.
 */

export function OpportunityMap({ geoDistribution, onSelectRegion }: any) {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-100 dark:border-slate-800 p-10 min-h-[500px]"
    >
      <div className="max-w-4xl mx-auto space-y-10">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter flex items-center justify-center gap-3">
            <Globe className="text-blue-600" /> Mapa de Oportunidades
          </h2>
          <p className="text-slate-500 text-sm font-bold uppercase tracking-widest">Densidade de talentos e vagas por região</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {geoDistribution.map((loc: any, idx: number) => {
            const total = loc.jobs + loc.candidates;
            const intensity = Math.min(total * 10, 100);
            
            return (
              <motion.button 
                key={idx}
                whileHover={{ scale: 1.02, y: -5 }}
                onClick={() => onSelectRegion(loc.display)}
                className="relative group bg-slate-50 dark:bg-slate-800/50 p-6 rounded-[2.5rem] border border-transparent hover:border-blue-200 dark:hover:border-blue-900/50 transition-all text-left overflow-hidden"
              >
                <div className="absolute inset-0 opacity-10 group-hover:opacity-20 transition-opacity" style={{ backgroundColor: `hsl(${210 + intensity}, 70%, 50%)` }} />
                <div className="relative z-10 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 bg-white dark:bg-slate-900 rounded-xl flex items-center justify-center shadow-sm"><MapPin size={20} className="text-blue-600" /></div>
                    <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{loc.display === 'Remoto' ? 'Global' : 'Regional'}</span>
                  </div>
                  <div>
                    <h4 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight truncate">{loc.display}</h4>
                    <div className="flex gap-4 mt-2">
                      <div className="flex flex-col"><span className="text-[10px] font-black text-slate-400 uppercase">Vagas</span><span className="text-xl font-black text-blue-600">{loc.jobs}</span></div>
                      <div className="w-px h-8 bg-slate-200 dark:bg-slate-700 self-end" />
                      <div className="flex flex-col"><span className="text-[10px] font-black text-slate-400 uppercase">Talentos</span><span className="text-xl font-black text-emerald-600">{loc.candidates}</span></div>
                    </div>
                  </div>
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}
