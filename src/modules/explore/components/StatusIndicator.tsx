
'use client';

import { cn } from '@/lib/utils';

/**
 * @fileOverview Micro-componente de status de disponibilidade.
 */

export function StatusIndicator({ status }: { status?: string }) {
  if (!status || status === 'busy') return null;
  
  const configs = {
    searching: { color: 'bg-emerald-500', label: 'Buscando Oportunidades' },
    open: { color: 'bg-blue-500', label: 'Aberto a Propostas' },
  };

  const config = configs[status as keyof typeof configs];
  if (!config) return null;

  return (
    <div className="absolute -bottom-1 -right-1 z-10 flex items-center gap-1.5 px-2 py-0.5 bg-white dark:bg-slate-900 rounded-full shadow-lg border border-slate-100 dark:border-slate-800">
      <div className={cn("w-2 h-2 rounded-full animate-pulse", config.color)} />
      <span className="text-[7px] font-black uppercase tracking-widest text-slate-500 whitespace-nowrap">{config.label}</span>
    </div>
  );
}
