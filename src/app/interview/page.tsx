'use client';

import { useRealtimeInterview } from '@/hooks/useRealtimeInterview';
import { Button } from '@/components/ui/Button';
import { Mic, Square, ArrowLeft, Sparkles } from 'lucide-react';
import Link from 'next/link';

export default function InterviewPage() {
  const { start, stop } = useRealtimeInterview();

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-8">
      <div className="max-w-md w-full bg-slate-800 rounded-[3rem] p-12 shadow-2xl border border-white/10 text-center space-y-8">
        <Link href="/profile" className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm font-bold uppercase tracking-widest">
          <ArrowLeft size={16} /> Voltar ao Perfil
        </Link>
        
        <div className="w-24 h-24 bg-blue-600 rounded-full flex items-center justify-center mx-auto shadow-lg shadow-blue-500/20">
          <Mic size={40} className="text-white" />
        </div>

        <h1 className="text-3xl font-black text-white uppercase tracking-tighter">
          Entrevista <span className="text-blue-500">Realtime</span>
        </h1>
        
        <p className="text-slate-400 text-sm font-medium leading-relaxed">
          Prepare-se! O recrutador IA vai iniciar uma conversa por voz com você. 
          Suas respostas serão analisadas em tempo real.
        </p>

        <div className="flex flex-col gap-4">
          <Button onClick={start} className="w-full py-5 bg-blue-600 hover:bg-blue-500 text-white text-lg">
            <Mic size={20} /> Iniciar Entrevista
          </Button>
          <Button variant="outline" onClick={stop} className="w-full py-5 text-slate-400 border-white/10 hover:bg-white/5">
            <Square size={20} /> Parar Conversa
          </Button>
        </div>

        <div className="pt-4">
          <div className="flex items-center justify-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Modelo Live 2.5 Ativo</span>
          </div>
        </div>
      </div>
    </div>
  );
}
