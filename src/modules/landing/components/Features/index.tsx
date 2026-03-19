'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Briefcase, FileText, QrCode } from 'lucide-react';
import { LANDING_MESSAGES } from '@/lib/constants/messages/landing';

const ICONS: Record<string, React.ReactNode> = {
  "Múltiplas Áreas": <Briefcase className="w-8 h-8" />,
  "Exportação PDF": <FileText className="w-8 h-8" />,
  "QR Code Integrado": <QrCode className="w-8 h-8" />,
};

export function Features() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, delay: 0.2 }}
      className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-24"
    >
      {LANDING_MESSAGES.main.features.map((feature, i) => (
        <div
          key={i}
          className="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col items-center text-center group hover:border-blue-200 dark:hover:border-blue-900 transition-colors"
        >
          <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110">
            {ICONS[feature.title]}
          </div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">
            {feature.title}
          </h3>
          <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
            {feature.description}
          </p>
        </div>
      ))}
    </motion.div>
  );
}
