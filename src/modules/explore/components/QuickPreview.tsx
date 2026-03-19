
'use client';

import { motion } from 'framer-motion';
import { Info, X, FileText, Star } from 'lucide-react';
import Image from 'next/image';
import { StatusIndicator } from './StatusIndicator';

/**
 * @fileOverview Painel flutuante de preview rápido.
 */

export function QuickPreview({ item, onClose }: any) {
  if (!item) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, x: 20 }}
      animate={{ opacity: 1, scale: 1, x: 0 }}
      exit={{ opacity: 0, scale: 0.9, x: 20 }}
      className="fixed bottom-10 right-10 z-[100] w-full max-w-sm hidden lg:block"
    >
      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.3)] border border-slate-100 dark:border-slate-800 overflow-hidden">
        <div className="bg-slate-900 dark:bg-white p-6 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Info className="text-blue-500" size={20} />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white dark:text-slate-900">Preview Rápido</span>
          </div>
          <button onClick={onClose} className="text-white/50 dark:text-slate-400 hover:text-white dark:hover:text-slate-900 transition-colors"><X size={16} /></button>
        </div>

        <div className="p-8 space-y-6">
          {item.type === 'candidate' ? (
            <>
              <div className="flex items-center gap-4">
                <div className="relative w-14 h-14 rounded-2xl overflow-hidden shadow-md">
                  <Image src={item.data.avatar_path || `https://picsum.photos/seed/${item.data.id}/100/100`} alt="" fill className="object-cover" />
                  <StatusIndicator status={item.data.availability_status} />
                </div>
                <div>
                  <h4 className="font-black text-slate-900 dark:text-white uppercase tracking-tight">{item.data.name}</h4>
                  <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">{item.data.headline || 'Profissional'}</p>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-400"><FileText size={12} /> Resumo</div>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed line-clamp-4 italic">"{item.data.summary?.replace(/<[^>]*>/g, '')}"</p>
              </div>
            </>
          ) : (
            <>
              <div className="space-y-1">
                <h4 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter leading-tight">{item.data.title}</h4>
                <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">{item.data.company}</p>
              </div>
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-400"><FileText size={12} /> Descrição</div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed line-clamp-5">{item.data.description}</p>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
}
