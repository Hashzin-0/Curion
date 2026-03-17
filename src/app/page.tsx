'use client';

import Link from 'next/link';
import { motion } from 'motion/react';
import { ArrowRight, Briefcase, FileText, QrCode, LogIn, Loader2, Sparkles } from 'lucide-react';
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
            Exportação PDF Temática com IA
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-6">
            Seu currículo, <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-emerald-500 dark:from-blue-400 dark:to-emerald-400">
              agora é um portfólio.
            </span>
          </h1>
          <p className="text-xl text-slate-600 dark:text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed">
            Organize suas experiências por área de atuação, gere currículos temáticos em PDF com QR Code e destaque-se no mercado com uma presença digital profissional.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            {isMounted && currentUser ? (
              <Link
                href="/profile"
                className="px-8 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-full font-bold text-lg flex items-center gap-2 hover:bg-slate-800 dark:hover:bg-slate-200 transition-colors shadow-lg hover:shadow-xl"
              >
                Meu Perfil
                <ArrowRight className="w-5 h-5" />
              </Link>
            ) : (
              <button
                onClick={handleGoogleLogin}
                disabled={isLoggingIn}
                className="px-8 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-full font-bold text-lg flex items-center gap-2 hover:bg-slate-800 dark:hover:bg-slate-200 transition-colors shadow-lg hover:shadow-xl disabled:opacity-70 cursor-pointer"
              >
                {isLoggingIn ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <LogIn className="w-5 h-5" />
                )}
                {isLoggingIn ? 'Conectando...' : 'Entrar com Google'}
              </button>
            )}
            <Link
              href="/kardec"
              className="px-8 py-4 bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-full font-bold text-lg flex items-center gap-2 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-sm"
            >
              Ver Exemplo
              <FileText className="w-5 h-5" />
            </Link>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-24"
        >
          <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col items-center text-center group hover:border-blue-200 dark:hover:border-blue-900 transition-colors">
            <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110">
              <Briefcase className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Múltiplas Áreas</h3>
            <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
              Tem experiência em mais de uma área? Crie perfis separados e envie o currículo certo para cada vaga.
            </p>
          </div>
          
          <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col items-center text-center group hover:border-emerald-200 dark:hover:border-emerald-900 transition-colors">
            <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110">
              <FileText className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Exportação PDF</h3>
            <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
              Gere PDFs lindos e temáticos com um clique, prontos para impressão ou envio por e-mail profissional.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col items-center text-center group hover:border-orange-200 dark:hover:border-orange-900 transition-colors">
            <div className="w-16 h-16 bg-orange-50 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110">
              <QrCode className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">QR Code Integrado</h3>
            <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
              Seu PDF inclui um QR Code que leva o recrutador para sua versão online interativa e animada.
            </p>
          </div>
        </motion.div>
      </div>
      
      <footer className="mt-auto py-12 text-slate-400 text-sm">
        © {new Date().getFullYear()} CareerCanvas. Organize sua carreira com inteligência.
      </footer>
    </div>
  );
}
