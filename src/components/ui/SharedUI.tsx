'use client';

import { motion, AnimatePresence } from 'motion/react';
import * as LucideIcons from 'lucide-react';
import { cn } from '@/lib/utils';

export const inputCls = "w-full p-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium placeholder:text-slate-400";
export const labelCls = "block text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2";

export function Button({ children, variant = 'primary', className, ...props }: any) {
  const base = "px-6 py-3 rounded-2xl font-black text-sm transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50";
  const variants: any = {
    primary: "bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xl hover:shadow-2xl",
    secondary: "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200",
    danger: "bg-red-500 text-white shadow-lg hover:bg-red-600",
    outline: "border-2 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800",
    accent: "text-white shadow-xl hover:scale-105"
  };
  return (
    <button className={cn(base, variants[variant], className)} {...props}>
      {children}
    </button>
  );
}

export function Modal({ isOpen, onClose, title, children, maxWidth = 'max-w-2xl' }: any) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
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

export function SectionTitle({ children, color = "#3b82f6" }: any) {
  return (
    <h2 className="text-3xl font-black text-slate-900 dark:text-white flex items-center gap-4 mb-10">
      <span className="w-3 h-10 rounded-full inline-block shadow-lg" style={{ backgroundColor: color }} />
      {children}
    </h2>
  );
}
