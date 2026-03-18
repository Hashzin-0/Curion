'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'danger' | 'outline' | 'accent';
}

export function Button({ children, variant = 'primary', className, ...props }: ButtonProps) {
  const base = "px-6 py-3 rounded-2xl font-black text-sm transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50";
  
  const variants: Record<string, string> = {
    primary: "bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xl hover:shadow-2xl",
    secondary: "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200",
    danger: "bg-red-500 text-white shadow-lg hover:bg-red-600",
    outline: "border-2 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800",
    accent: "text-white shadow-xl hover:scale-105"
  };

  return (
    <motion.button 
      whileTap={{ scale: 0.95 }}
      className={cn(base, variants[variant], className)} 
      {...props}
    >
      {children}
    </motion.button>
  );
}