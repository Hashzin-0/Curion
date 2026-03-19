
'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Star, ThumbsUp } from 'lucide-react';
import { StatusIndicator } from './StatusIndicator';
import { getTheme } from '@/styles/themes';
import { slugify } from '@/lib/utils';
import { AvatarGlow } from '@/components/shared/AvatarGlow';

/**
 * @fileOverview Card de Candidato atualizado com AvatarGlow premium.
 */

export function CandidateCard({ user, onPreviewEnter, onPreviewLeave }: any) {
  const topSkills = user.professional_areas?.flatMap((area: any) => 
    area.area_skills?.map((as: any) => ({
      name: as.skills?.name,
      endorsements: as.endorsements_count || 0
    })) || []
  ).filter((s: any) => s.name).sort((a: any, b: any) => b.endorsements - a.endorsements).slice(0, 3);

  return (
    <div 
      onMouseEnter={() => onPreviewEnter('candidate', user)}
      onMouseLeave={onPreviewLeave}
      className="group bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-2xl transition-all overflow-hidden flex flex-col"
    >
      <div className="p-8 flex-1">
        <div className="flex items-center gap-4 mb-6">
          <AvatarGlow status={user.availability_status} className="rounded-2xl shrink-0">
            <div className="relative w-16 h-16 rounded-2xl overflow-hidden">
              <Image 
                src={user.avatar_path || `https://picsum.photos/seed/${user.id}/100/100`} 
                alt={user.name} 
                fill 
                className="object-cover" 
              />
            </div>
          </AvatarGlow>
          <div>
            <h3 className="font-black text-slate-900 dark:text-white uppercase tracking-tight">{user.name}</h3>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{user.headline || 'Profissional'}</p>
          </div>
        </div>

        {topSkills.length > 0 && (
          <div className="mb-6 space-y-2">
            <div className="flex items-center gap-2 text-[9px] font-black uppercase text-slate-400 tracking-widest">
              <Star size={10} className="text-yellow-500" /> Destaques
            </div>
            <div className="flex flex-wrap gap-2">
              {topSkills.map((skill: any, idx: number) => (
                <div key={idx} className="flex items-center gap-1.5 px-3 py-1 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-lg">
                  <span className="text-[10px] font-black text-slate-700 dark:text-slate-200 uppercase">{skill.name}</span>
                  {skill.endorsements > 0 && (
                    <span className="flex items-center gap-0.5 text-[9px] font-black text-blue-600 bg-blue-50 dark:bg-blue-900/20 px-1 rounded">
                      <ThumbsUp size={8} /> {skill.endorsements}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex flex-wrap gap-2 mb-6">
          {user.professional_areas?.slice(0, 2).map((area: any) => {
            const theme = getTheme(slugify(area.name));
            return (
              <span key={area.id} className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider" style={{ backgroundColor: theme.hex + '15', color: theme.hex }}>
                {theme.emoji} {area.name}
              </span>
            );
          })}
        </div>
        <p className="text-xs text-slate-500 line-clamp-2 italic">"{user.summary?.replace(/<[^>]*>/g, '').slice(0, 100)}..."</p>
      </div>
      <Link 
        href={`/${user.username}`}
        className="p-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex justify-center cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
      >
        <span className="text-[10px] font-black uppercase tracking-widest text-blue-600 flex items-center gap-2 group-hover:gap-4 transition-all">
          Ver Perfil Completo <ArrowRight size={14} />
        </span>
      </Link>
    </div>
  );
}
