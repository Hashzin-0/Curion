
'use client';

import { MapPin, Send, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { JobMatchBadge } from './JobMatchBadge';
import { getTheme } from '@/styles/themes';

/**
 * @fileOverview Card de Vaga (UI Pura).
 */

export function JobCard({ job, match, isMatchCalculating, onMatch, onApply, isApplying, onPreviewEnter, onPreviewLeave }: any) {
  const theme = getTheme(job.area_slug || 'default');

  return (
    <div 
      onMouseEnter={() => onPreviewEnter('job', job)}
      onMouseLeave={onPreviewLeave}
      className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 p-6 flex flex-col md:flex-row items-center justify-between gap-6 hover:shadow-xl transition-all group"
    >
      <div className="flex items-center gap-6 flex-1">
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shadow-inner shrink-0" style={{ backgroundColor: theme.hex + '15' }}>
          {theme.emoji}
        </div>
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-3 mb-1">
            <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">{job.title}</h3>
            <JobMatchBadge 
              match={match} 
              isCalculating={isMatchCalculating} 
              onCalculate={onMatch} 
            />
          </div>
          <div className="flex flex-wrap items-center gap-4 text-xs font-bold text-slate-400 uppercase tracking-widest">
            <span className="text-slate-600 dark:text-slate-300">{job.company}</span>
            <span className="flex items-center gap-1"><MapPin size={12} /> {job.location}</span>
            <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-[9px]">{job.work_model?.toUpperCase()}</span>
            <span className="px-2 py-0.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded text-[9px]">{job.regime?.toUpperCase()}</span>
            {job.salary && <span className="text-emerald-500">{job.salary}</span>}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-4 w-full md:w-auto">
        <Button 
          variant="primary" 
          className="w-full md:w-auto px-10 relative overflow-hidden"
          onClick={() => onApply(job)}
          disabled={isApplying}
        >
          {isApplying ? (
            <>
              <Loader2 size={18} className="animate-spin mr-2" />
              Enviando...
            </>
          ) : (
            <>
              <Send size={18} className="mr-2" />
              Quick Apply
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
