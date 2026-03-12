'use client';

import Link from 'next/link';
import { motion } from 'motion/react';
import { ArrowRight, Briefcase, FileText, QrCode } from 'lucide-react';
import { Timeline } from '@/components/Timeline';
import { Stats } from '@/components/Stats';

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-8 transition-colors duration-300">
      <div className="max-w-4xl w-full text-center space-y-8 mt-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-6">
            Seu currículo, <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-emerald-500 dark:from-blue-400 dark:to-emerald-400">
              agora é um portfólio interativo.
            </span>
          </h1>
          <p className="text-xl text-slate-600 dark:text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed">
            Organize suas experiências por área de atuação, gere currículos temáticos em PDF com QR Code e destaque-se no mercado.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/profile"
              className="px-8 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-full font-bold text-lg flex items-center gap-2 hover:bg-slate-800 dark:hover:bg-slate-200 transition-colors shadow-lg hover:shadow-xl"
            >
              Criar meu CareerCanvas
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/kardec"
              className="px-8 py-4 bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-full font-bold text-lg flex items-center gap-2 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-sm"
            >
              Ver exemplo
              <FileText className="w-5 h-5" />
            </Link>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20 mb-32"
        >
          <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center mb-6">
              <Briefcase className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Múltiplas Áreas</h3>
            <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
              Tem experiência em mais de uma área? Crie perfis separados e envie o currículo certo para cada vaga.
            </p>
          </div>
          
          <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-2xl flex items-center justify-center mb-6">
              <FileText className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Exportação PDF</h3>
            <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
              Gere PDFs lindos e temáticos com um clique, prontos para impressão ou envio por e-mail.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-orange-50 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded-2xl flex items-center justify-center mb-6">
              <QrCode className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">QR Code Integrado</h3>
            <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
              Seu PDF inclui um QR Code que leva o recrutador para sua versão online interativa e animada.
            </p>
          </div>
        </motion.div>
        
        <Stats />
        <Timeline />
      </div>
    </div>
  );
}
