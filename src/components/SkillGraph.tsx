'use client';

import { AreaSkill, Skill } from '@/lib/store';
import { getTheme } from '@/styles/themes';
import { motion } from 'motion/react';
import * as LucideIcons from 'lucide-react';

export default function SkillGraph({ areaSkills, allSkills, areaSlug }: { areaSkills: AreaSkill[], allSkills: Skill[], areaSlug: string }) {
  const theme = getTheme(areaSlug);

  return (
    <div className="flex flex-wrap gap-3">
      {areaSkills.map((as) => {
        const skill = allSkills.find(s => s.id === as.skill_id);
        if (!skill) return null;
        
        // @ts-ignore
        const Icon = LucideIcons[skill.icon] || LucideIcons.CheckCircle;

        return (
          <div key={as.skill_id} className="bg-white dark:bg-slate-900 px-5 py-3 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex items-center gap-3 transition-all hover:scale-105">
            <Icon className={`w-5 h-5 ${theme.text}`} />
            <span className="text-xs font-black uppercase text-slate-600 dark:text-slate-300">{skill.name}</span>
          </div>
        );
      })}
    </div>
  );
}
