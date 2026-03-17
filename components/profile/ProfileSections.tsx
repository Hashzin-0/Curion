
'use client';

import { motion } from 'motion/react';
import * as LucideIcons from 'lucide-react';
import { Education, PortfolioItem, Certificate, User, ProfessionalArea, Experience } from '@/lib/store';
import { Pencil, Trash2, GraduationCap, Folder, Award, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { getTheme } from '@/styles/themes';

type Props = {
  education: Education[];
  portfolio: PortfolioItem[];
  certificates: Certificate[];
  isOwner?: boolean;
  accentColor: string;
  onEditEdu?: (e: Education) => void;
  onDeleteEdu?: (id: string) => void;
  onEditPort?: (p: PortfolioItem) => void;
  onDeletePort?: (id: string) => void;
  onEditCert?: (c: Certificate) => void;
  onDeleteCert?: (id: string) => void;
};

export function EducationSection({ education, isOwner, onEditEdu, onDeleteEdu }: Partial<Props>) {
  if (!education || education.length === 0) return null;

  return (
    <section>
      <h2 className="text-3xl font-black text-slate-900 dark:text-white flex items-center gap-4 mb-10">
        <span className="w-3 h-10 rounded-full inline-block shadow-lg" style={{ backgroundColor: '#10b981' }} />
        Formação Acadêmica
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {education.map((edu) => (
          <div key={edu.id} className="relative group bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all">
            {isOwner && (
              <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => onEditEdu?.(edu)} className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg hover:text-blue-500"><Pencil size={14} /></button>
                <button onClick={() => onDeleteEdu?.(edu.id)} className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg hover:text-red-500"><Trash2 size={14} /></button>
              </div>
            )}
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <GraduationCap size={24} />
              </div>
              <div>
                <h4 className="font-black text-slate-900 dark:text-white">{edu.course}</h4>
                <p className="text-xs font-bold text-slate-500">{edu.institution}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export function PortfolioSection({ portfolio, isOwner, onEditPort, onDeletePort }: Partial<Props>) {
  if (!portfolio || portfolio.length === 0) return null;

  return (
    <section>
      <h2 className="text-3xl font-black text-slate-900 dark:text-white flex items-center gap-4 mb-10">
        <span className="w-3 h-10 rounded-full inline-block shadow-lg" style={{ backgroundColor: '#8b5cf6' }} />
        Portfólio & Projetos
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {portfolio.map((item) => (
          <div key={item.id} className="relative group bg-white dark:bg-slate-900 rounded-[2.5rem] overflow-hidden border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-2xl transition-all">
            {isOwner && (
              <div className="absolute top-4 right-4 z-20 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => onEditPort?.(item)} className="p-2 bg-white/90 dark:bg-slate-800/90 rounded-lg hover:text-blue-500 shadow-lg"><Pencil size={14} /></button>
                <button onClick={() => onDeletePort?.(item.id)} className="p-2 bg-white/90 dark:bg-slate-800/90 rounded-lg hover:text-red-500 shadow-lg"><Trash2 size={14} /></button>
              </div>
            )}
            <div className="h-48 bg-slate-100 dark:bg-slate-800 relative">
              {item.file_url ? (
                <img src={item.file_url} alt={item.title} className="w-full h-full object-cover" data-ai-hint="portfolio project" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-300">
                  <Folder size={48} />
                </div>
              )}
            </div>
            <div className="p-8">
              <h4 className="text-xl font-black mb-3 text-slate-900 dark:text-white">{item.title}</h4>
              <p className="text-sm text-slate-500 line-clamp-3 mb-6">{item.description}</p>
              {item.link_url && (
                <a href={item.link_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm font-black text-purple-600 hover:underline">
                  Ver Projeto <ArrowRight size={14} />
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
