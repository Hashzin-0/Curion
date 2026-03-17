'use client';

import { motion } from 'motion/react';
import * as LucideIcons from 'lucide-react';
import { Education, PortfolioItem, Experience } from '@/lib/store';
import { formatDateRange, calcDuration } from '@/lib/utils';
import { Button } from '@/components/ui/SharedUI';

export function EducationCard({ edu, isOwner, onEdit, onDelete }: any) {
  return (
    <div className="relative group bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all">
      {isOwner && (
        <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={() => onEdit(edu)} className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg hover:text-blue-500"><LucideIcons.Pencil size={14} /></button>
          <button onClick={() => onDelete(edu.id)} className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg hover:text-red-500"><LucideIcons.Trash2 size={14} /></button>
        </div>
      )}
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
          <LucideIcons.GraduationCap size={24} />
        </div>
        <div>
          <h4 className="font-black text-slate-900 dark:text-white uppercase text-sm tracking-tight">{edu.course}</h4>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">{edu.institution}</p>
          <p className="text-[10px] font-black text-slate-400 mt-1">{formatDateRange(edu.start_date, edu.end_date)}</p>
        </div>
      </div>
    </div>
  );
}

export function PortfolioCard({ item, isOwner, onEdit, onDelete }: any) {
  return (
    <div className="relative group bg-white dark:bg-slate-900 rounded-[2.5rem] overflow-hidden border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-2xl transition-all h-full flex flex-col">
      {isOwner && (
        <div className="absolute top-4 right-4 z-20 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={() => onEdit(item)} className="p-2 bg-white/90 dark:bg-slate-800/90 rounded-lg hover:text-blue-500 shadow-lg"><LucideIcons.Pencil size={14} /></button>
          <button onClick={() => onDelete(item.id)} className="p-2 bg-white/90 dark:bg-slate-800/90 rounded-lg hover:text-red-500 shadow-lg"><LucideIcons.Trash2 size={14} /></button>
        </div>
      )}
      <div className="h-48 bg-slate-100 dark:bg-slate-800 relative">
        {item.file_url ? (
          <img src={item.file_url} alt={item.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-300">
            <LucideIcons.Folder size={48} />
          </div>
        )}
      </div>
      <div className="p-8 flex-1 flex flex-col">
        <h4 className="text-xl font-black mb-3 text-slate-900 dark:text-white tracking-tighter uppercase">{item.title}</h4>
        <p className="text-sm text-slate-500 line-clamp-3 mb-6 flex-1" dangerouslySetInnerHTML={{ __html: item.description }} />
        {item.link_url && (
          <a href={item.link_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-xs font-black text-purple-600 hover:underline uppercase tracking-widest">
            Ver Projeto <LucideIcons.ArrowRight size={14} />
          </a>
        )}
      </div>
    </div>
  );
}

export function ExperienceItem({ exp, isOwner, onEdit, onDelete, themeColor = "#3b82f6" }: any) {
  return (
    <div className="relative group pl-8 border-l-2 border-slate-100 dark:border-slate-800 pb-10 last:pb-0">
      <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full border-4 border-white dark:border-slate-900" style={{ backgroundColor: themeColor }} />
      {isOwner && (
        <div className="absolute -right-4 top-0 z-20 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={() => onEdit(exp)} className="p-2 bg-blue-600 text-white rounded-lg shadow-lg hover:scale-110 transition-all"><LucideIcons.Pencil size={12} /></button>
          <button onClick={() => onDelete(exp.id)} className="p-2 bg-red-600 text-white rounded-lg shadow-lg hover:scale-110 transition-all"><LucideIcons.Trash2 size={12} /></button>
        </div>
      )}
      <div className="flex flex-col gap-1">
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{formatDateRange(exp.start_date, exp.end_date)} • {calcDuration(exp.start_date, exp.end_date)}</span>
        <h4 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">{exp.role}</h4>
        <p className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-3" style={{ color: themeColor }}>{exp.company_name}</p>
        <div className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed prose prose-sm dark:prose-invert" dangerouslySetInnerHTML={{ __html: exp.description }} />
      </div>
    </div>
  );
}
