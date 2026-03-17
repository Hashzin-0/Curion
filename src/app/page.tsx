
'use client';

import Link from 'next/link';
import { motion } from 'motion/react';
import { ArrowRight, Briefcase, FileText, QrCode, LogIn, Loader2, Sparkles, Search } from 'lucide-react';
import { useStore } from '@/lib/store';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function Home() {
  const currentUser = useStore(state => state.currentUser);
  const [isMounted, setIsMounted] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleGoogleLogin = async () => {
    try {
      setIsLoggingIn(true);
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) throw error;
    } catch (err) {
      console.error('Erro ao iniciar login:', err);
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-8 transition-colors duration-300">
      <div className="max-w-4xl w-full text-center space-y-8 mt-20 mb-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="inline-flex items-center gap-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 px-4 py-2 rounded-full text-sm font-bold mb-6">
            <Sparkles className="w-4 h-4" />
            Portfólio Inteligente de Próxima Geração
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-6">
            Seu currículo, <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-emerald-500 dark:from-blue-400 dark:to-emerald-400">
              é agora a sua marca.
            </span>
          </h1>
          <p className="text-xl text-slate-600 dark:text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed">
            Organize suas conquistas por áreas, gere currículos otimizados por IA para cada vaga e tenha um perfil animado que impressiona recrutadores.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            {isMounted && currentUser ? (
              <Link
                href="/profile"
                className="px-8 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-full font-bold text-lg flex items-center gap-2 hover:bg-slate-800 dark:hover:bg-slate-200 transition-colors shadow-lg hover:shadow-xl"
              >
                Meu Painel
                <ArrowRight className="w-5 h-5" />
              </Link>
            ) : (
              <button
                onClick={handleGoogleLogin}
                disabled={isLoggingIn}
                className="px-8 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-full font-bold text-lg flex items-center gap-2 hover:bg-slate-800 dark:hover:bg-slate-200 transition-colors shadow-lg hover:shadow-xl disabled:opacity-70 cursor-pointer"
              >
                {isLoggingIn ? <Loader2 className="w-5 h-5 animate-spin" /> : <LogIn className="w-5 h-5" />}
                {isLoggingIn ? 'Conectando...' : 'Começar Agora'}
              </button>
            )}
            <Link
              href="/explore"
              className="px-8 py-4 bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-full font-bold text-lg flex items-center gap-2 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-sm"
            >
              Explorar Talentos
              <Search className="w-5 h-5" />
            </Link>
          </div>
        </motion.div>
      </div>
      
      <footer className="mt-auto py-12 text-slate-400 text-sm">
        © {new Date().getFullYear()} CareerCanvas. Inteligência Artificial a serviço da sua carreira.
      </footer>
    </div>
  );
}
