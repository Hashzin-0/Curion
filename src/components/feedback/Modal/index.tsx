'use client';

import { AnimatePresence, motion } from 'framer-motion';
import * as LucideIcons from 'lucide-react';
import { cn } from '@/lib/utils';
import React from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  maxWidth?: string;
}

export function Modal({ isOpen, onClose, title, children, maxWidth = 'max-w-2xl' }: ModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            className={cn("bg-white dark:bg-slate-900 w-full rounded-[2.5rem] p-8 shadow-2xl border border-slate-100 dark:border-slate-800 overflow-y-auto max-h-[90vh]", maxWidth)}
            onClick={e => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">{title}</h3>
              <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 transition-colors"><LucideIcons.X /></button>
            </div>
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}