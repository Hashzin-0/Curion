
'use client';

import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Terminal, BrainCircuit, Activity, Cpu, Database, CheckCircle2 } from 'lucide-react';
import { useStore } from '@/lib/store';

/**
 * @fileOverview IntelligenceTerminal - Console de telemetria da IA em tempo real.
 * Reage aos batimentos do motor de extração no store global.
 */

export function IntelligenceTerminal() {
  const { telemetry } = useStore();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [telemetry.logs]);

  if (!telemetry.isAnalyzing && telemetry.logs.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-slate-900 border border-white/10 rounded-[2rem] overflow-hidden shadow-2xl flex flex-col h-full max-h-[400px]"
    >
      <header className="bg-slate-800/50 p-4 border-b border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
            <BrainCircuit size={18} className="text-white" />
          </div>
          <div>
            <h4 className="text-[10px] font-black uppercase text-white tracking-[0.2em]">Curion X Heartbeat</h4>
            <p className="text-[8px] font-bold text-blue-400 uppercase tracking-widest animate-pulse">
              {telemetry.currentAction || 'Analizando Fluxo de Dados...'}
            </p>
          </div>
        </div>
        <div className="flex gap-1.5">
          <div className="w-2 h-2 rounded-full bg-red-500/50" />
          <div className="w-2 h-2 rounded-full bg-yellow-500/50" />
          <div className="w-2 h-2 rounded-full bg-green-500/50" />
        </div>
      </header>

      <div 
        ref={scrollRef}
        className="flex-1 p-6 font-mono text-[10px] overflow-y-auto custom-scrollbar space-y-2 bg-black/40"
      >
        <AnimatePresence initial={false}>
          {telemetry.logs.map((log, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex gap-3 text-slate-400 border-l border-white/5 pl-3"
            >
              <span className="text-blue-500 font-black shrink-0">>></span>
              <span className="leading-relaxed whitespace-pre-wrap">{log}</span>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {telemetry.isAnalyzing && (
          <div className="flex items-center gap-2 text-blue-400 font-black pt-2 animate-pulse">
            <Activity size={12} />
            <span>Processando Tokens de Intenção...</span>
          </div>
        )}
      </div>

      <footer className="p-4 bg-slate-800/30 border-t border-white/5 grid grid-cols-3 gap-4">
        <div className="flex items-center gap-2">
          <Cpu size={12} className="text-slate-500" />
          <span className="text-[8px] font-bold text-slate-500 uppercase">GPU Active</span>
        </div>
        <div className="flex items-center gap-2">
          <Database size={12} className="text-slate-500" />
          <span className="text-[8px] font-bold text-slate-500 uppercase">Sync Link: OK</span>
        </div>
        <div className="flex items-center gap-2 justify-end">
          <CheckCircle2 size={12} className="text-emerald-500" />
          <span className="text-[8px] font-bold text-emerald-500 uppercase">Secure IO</span>
        </div>
      </footer>
    </motion.div>
  );
}
