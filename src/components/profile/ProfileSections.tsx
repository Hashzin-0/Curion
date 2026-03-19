/**
 * @fileOverview Seções de Educação e Portfólio atualizadas para o schema oficial.
 */
'use client';

import { Education, PortfolioItem } from '@/lib/store';
import { GraduationCap, Folder, ArrowRight, ExternalLink } from 'lucide-react';
import { CardActions } from '@/components/shared/CardActions';

type EducationSectionProps = {
  education: Education[];
  isOwner?: boolean;
  onEditEdu?: (e: Education) => void;
  onDeleteEdu?: (id: string) => void;
};

export function EducationSection({ education, isOwner, onEditEdu, onDeleteEdu }: EducationSectionProps) {
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
              <CardActions 
                onEdit={() => onEditEdu?.(edu)} 
                onDelete={() => onDeleteEdu?.(edu.id)} 
                variant="floating"
              />
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

type PortfolioSectionProps = {
  portfolio: PortfolioItem[];
  isOwner?: boolean;
  onEditPort?: (p: PortfolioItem) => void;
  onDeletePort?: (id: string) => void;
};

export function PortfolioSection({ portfolio, isOwner, onEditPort, onDeletePort }: PortfolioSectionProps) {
  if (!portfolio || portfolio.length === 0) return null;

  return (
    <section>
      <h2 className="text-3xl font-black text-slate-900 dark:text-white flex items-center gap-4 mb-10">
        <span className="w-3 h-10 rounded-full inline-block shadow-lg" style={{ backgroundColor: '#8b5cf6' }} />
        Portfólio & Projetos
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {portfolio.map((item) => (
          <div key={item.id} className="relative group bg-white dark:bg-slate-900 rounded-[2.5rem] overflow-hidden border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-2xl transition-all flex flex-col h-full">
            {isOwner && (
              <CardActions 
                onEdit={() => onEditPort?.(item)} 
                onDelete={() => onDeletePort?.(item.id)} 
                variant="floating"
              />
            )}
            <div className="h-48 bg-slate-100 dark:bg-slate-800 relative">
              {item.file_path ? (
                <img src={item.file_path} alt={item.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-300">
                  <Folder size={48} />
                </div>
              )}
            </div>
            <div className="p-8 flex-1 flex flex-col">
              <h4 className="text-xl font-black mb-3 text-slate-900 dark:text-white uppercase tracking-tighter">{item.title}</h4>
              <p className="text-sm text-slate-500 line-clamp-3 mb-6 flex-1">{item.description}</p>
              {item.external_url && (
                <a href={item.external_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm font-black text-purple-600 hover:underline">
                  Ver Projeto Externo <ExternalLink size={14} />
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
