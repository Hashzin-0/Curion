'use client';

import { Experience } from '@/lib/store';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { getTheme } from '@/styles/themes';
import { parseSafeDate } from '@/lib/utils';
import { useState, useEffect } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus, prism } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { useTheme } from 'next-themes';
import { Briefcase } from 'lucide-react';

export default function ExperienceCard({ experience, areaSlug }: { experience: Experience, areaSlug: string }) {
  const theme = getTheme(areaSlug);
  const { theme: appTheme } = useTheme();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);
  
  const startDate = format(parseSafeDate(experience.start_date), 'MMM yyyy', { locale: ptBR });
  const endDate = experience.end_date ? format(parseSafeDate(experience.end_date), 'MMM yyyy', { locale: ptBR }) : 'Atual';

  if (!isMounted) return null;

  // Função para renderizar conteúdo com suporte a blocos de código
  const renderDescription = (text: string | null) => {
    if (!text) return null;
    const parts = text.split(/(```[\s\S]*?```)/g);
    return parts.map((part, i) => {
      if (part.startsWith('```') && part.endsWith('```')) {
        const code = part.slice(3, -3).trim();
        return (
          <div key={i} className="my-4 rounded-xl overflow-hidden text-xs">
            <SyntaxHighlighter 
              language="javascript" 
              style={appTheme === 'dark' ? vscDarkPlus : prism}
              customStyle={{ margin: 0 }}
            >
              {code}
            </SyntaxHighlighter>
          </div>
        );
      }
      return <p key={i} className="whitespace-pre-wrap">{part}</p>;
    });
  };

  return (
    <div className={`bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] shadow-sm border ${theme.border} dark:border-opacity-20 hover:shadow-xl transition-all relative overflow-hidden group`}>
      <div className={`absolute top-0 left-0 w-2 h-full ${theme.primary} transition-all group-hover:w-3`} />
      
      <div className="flex items-start gap-6">
        <div className={`relative w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 border border-slate-100 dark:border-slate-800 shadow-sm ${theme.bgLight} ${theme.text}`}>
          <Briefcase size={32} />
        </div>
        
        <div className="flex-1">
          <div className="flex justify-between items-start mb-2">
            <div>
              <h3 className="text-xl font-black text-slate-900 dark:text-white leading-tight">{experience.role}</h3>
              <div className={`font-bold ${theme.text} dark:text-opacity-90`}>{experience.company_name}</div>
            </div>
            <div className="text-xs font-black px-4 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 uppercase tracking-widest whitespace-nowrap">
              {startDate} - {endDate}
            </div>
          </div>
          <div className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed mt-4">
            {renderDescription(experience.description)}
          </div>
        </div>
      </div>
    </div>
  );
}
