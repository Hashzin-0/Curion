
'use client';

import { motion } from 'framer-motion';
import { Target, CheckCircle2, BrainCircuit, Loader2 } from 'lucide-react';

/**
 * @fileOverview Badge de Match IA com estados visuais.
 */

interface Props {
  match: { score: number; reason: string } | null;
  isCalculating: boolean;
  onCalculate: () => void;
}

export function JobMatchBadge({ match, isCalculating, onCalculate }: Props) {
  if (match) {
    const isHigh = match.score >= 80;
    const isMid = match.score >= 50 && match.score < 80;

    return (
      <motion.div 
        initial={{ scale: 0.8, opacity: 0 }} 
        animate={{ scale: 1, opacity: 1 }}
        className={`flex items-center gap-3 px-4 py-2 rounded-2xl border ${isHigh ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : isMid ? 'bg-orange-50 border-orange-200 text-orange-700' : 'bg-slate-50 border-slate-200 text-slate-600'}`}
      >
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <Target size={14} className="animate-pulse" />
            <span className="text-sm font-black uppercase tracking-tighter">{match.score}% Compatível</span>
          </div>
          <p className="text-[9px] font-bold uppercase leading-tight mt-0.5 opacity-80">{match.reason}</p>
        </div>
        {isHigh && <CheckCircle2 size={18} className="text-emerald-500" />}
      </motion.div>
    );
  }

  return (
    <button 
      onClick={(e) => { e.preventDefault(); e.stopPropagation(); onCalculate(); }}
      disabled={isCalculating}
      className="group relative flex items-center gap-2 px-4 py-2 rounded-2xl bg-indigo-50 hover:bg-indigo-100 border border-indigo-100 transition-all active:scale-95 disabled:opacity-50"
    >
      {isCalculating ? (
        <>
          <Loader2 size={14} className="animate-spin text-indigo-600" />
          <span className="text-[10px] font-black uppercase text-indigo-600 tracking-widest">Analisando...</span>
        </>
      ) : (
        <>
          <BrainCircuit size={14} className="text-indigo-600 group-hover:rotate-12 transition-transform" />
          <span className="text-[10px] font-black uppercase text-indigo-600 tracking-widest">Match IA</span>
        </>
      )}
    </button>
  );
}
