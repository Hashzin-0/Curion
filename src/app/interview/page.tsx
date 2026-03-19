
'use client';

import { useRealtimeInterview } from '@/hooks/useRealtimeInterview';
import { Button } from '@/components/ui/Button';
import { Mic, Square, ArrowLeft, Sparkles, Loader2, BrainCircuit } from 'lucide-react';
import Link from 'next/link';
import { InterviewResults } from '@/components/interview/InterviewResults';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * @fileOverview Página de Entrevista Realtime atualizada com transição para resultados.
 */

export default function InterviewPage() {
  const { start, stop, isInterviewing, analysisResults } = useRealtimeInterview();

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-8">
      <AnimatePresence mode="wait">
        {!isInterviewing && analysisResults.length > 0 ? (
          <InterviewResults 
            key="results" 
            results={analysisResults} 
            onRetry={() => { start(); }} 
          />
        ) : (
          <motion.div 
            key="interface"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="max-w-md w-full bg-slate-800 rounded-[3rem] p-12 shadow-2xl border border-white/10 text-center space-y-8"
          >
            <Link href="/profile" className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm font-bold uppercase tracking-widest">
              <ArrowLeft size={16} /> Voltar ao Perfil
            </Link>
            
            <div className="relative mx-auto">
              <div className={`w-24 h-24 rounded-full flex items-center justify-center transition-all duration-500 shadow-lg ${isInterviewing ? 'bg-red-500 shadow-red-500/20 scale-110' : 'bg-blue-600 shadow-blue-500/20'}`}>
                {isInterviewing ? <Loader2 size={40} className="text-white animate-spin" /> : <Mic size={40} className="text-white" />}
              </div>
              {isInterviewing && (
                <div className="absolute -inset-4 border-2 border-red-500/30 rounded-full animate-ping" />
              )}
            </div>

            <div>
              <h1 className="text-3xl font-black text-white uppercase tracking-tighter">
                Entrevista <span className="text-blue-500">Realtime</span>
              </h1>
              <p className="text-slate-400 text-sm font-medium leading-relaxed mt-4">
                {isInterviewing 
                  ? "O recrutador está ouvindo. Fale naturalmente..." 
                  : "Prepare-se! O recrutador IA vai analisar sua voz e conhecimento técnico em tempo real."
                }
              </p>
            </div>

            <div className="flex flex-col gap-4">
              {!isInterviewing ? (
                <Button onClick={start} className="w-full py-5 bg-blue-600 hover:bg-blue-500 text-white text-lg">
                  <Mic size={20} /> Iniciar Entrevista
                </Button>
              ) : (
                <Button variant="danger" onClick={stop} className="w-full py-5 text-white">
                  <Square size={20} /> Encerrar e Analisar
                </Button>
              )}
            </div>

            <div className="pt-4 flex flex-col items-center gap-4">
              <div className="flex items-center justify-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Gemini Native Audio Ativo</span>
              </div>
              
              {isInterviewing && (
                <div className="flex items-center gap-2 text-[10px] font-black uppercase text-blue-400 animate-bounce">
                  <BrainCircuit size={14} /> IA Processando Contexto...
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
