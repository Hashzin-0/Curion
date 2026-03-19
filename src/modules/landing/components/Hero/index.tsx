'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Loader2, LogIn, Users, FileText, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/hooks/useAuth';
import { LANDING_MESSAGES } from '@/lib/constants/messages/landing';

export function Hero() {
  const { currentUser, isMounted, isLoggingIn, handleGoogleLogin } = useAuth();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="text-center space-y-8"
    >
      <div className="inline-flex items-center gap-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 px-4 py-2 rounded-full text-sm font-bold mb-6">
        <Sparkles className="w-4 h-4" />
        Exportação PDF Temática com IA
      </div>
      <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-6">
        {LANDING_MESSAGES.main.title.split(",")[0]},
        <br className="hidden md:block" />
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-emerald-500 dark:from-blue-400 dark:to-emerald-400">
          agora é um portfólio.
        </span>
      </h1>
      <p className="text-xl text-slate-600 dark:text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed">
        {LANDING_MESSAGES.main.subtitle}
      </p>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
        {isMounted && currentUser ? (
          <Link href="/profile">
            <Button variant="primary" className="w-full sm:w-auto">
              {LANDING_MESSAGES.main.cta.my_profile}
              <ArrowRight className="w-5 h-5" />
            </Button>
          </Link>
        ) : (
          <Button
            variant="primary"
            onClick={handleGoogleLogin}
            disabled={isLoggingIn}
            className="w-full sm:w-auto"
          >
            {isLoggingIn ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <LogIn className="w-5 h-5" />
            )}
            {isLoggingIn
              ? LANDING_MESSAGES.main.cta.connecting
              : LANDING_MESSAGES.main.cta.login_google}
          </Button>
        )}
        <Link href="/explore">
          <Button variant="secondary" className="w-full sm:w-auto">
            {LANDING_MESSAGES.main.cta.explore}
            <Users className="w-5 h-5" />
          </Button>
        </Link>
        <Link href="/ana_dev">
          <Button variant="outline" className="w-full sm:w-auto">
            {LANDING_MESSAGES.main.cta.example}
            <FileText className="w-5 h-5" />
          </Button>
        </Link>
      </div>
    </motion.div>
  );
}
